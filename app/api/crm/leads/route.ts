import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createCRMLead } from '@/lib/crm';
import { can } from '@/lib/roles';
import { LEAD_SOURCES, validateLead } from '@/lib/pipeline';
import {
  LEAD_PAGE_SIZE,
  buildLeadWhere,
  findPossibleDuplicates,
  normalisePhone,
  orderByFor,
  readFilters,
} from '@/lib/leads-query';
import { z } from 'zod';

/** BigInt (dealValue) is not JSON-serialisable — send it as a string. */
function serialize<T extends { dealValue?: bigint | null }>(lead: T) {
  return { ...lead, dealValue: lead.dealValue == null ? null : String(lead.dealValue) };
}

// GET /api/crm/leads — list leads. Filters: status, category, source, owner,
// q, from, to, sort, page. Session auth; reps are scoped to their own leads.
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session.user.role, 'view_leads')) return Response.json({ error: 'Forbidden' }, { status: 403 });
  // SALES_REP sees only their own leads; ADMIN/MANAGER see all
  const seesAll = can(session.user.role, 'assign_leads');

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const orderBy = orderByFor(searchParams.get('sort') ?? undefined);

  const where = buildLeadWhere(readFilters(searchParams), seesAll ? undefined : session.user.id);

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy,
      skip: (page - 1) * LEAD_PAGE_SIZE,
      take: LEAD_PAGE_SIZE,
      include: { assignedTo: { select: { name: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  return Response.json({ leads: leads.map(serialize), total, page, pageSize: LEAD_PAGE_SIZE });
}

// ---------------------------------------------------------------------------
// Creating a lead
// ---------------------------------------------------------------------------

const externalSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional(),
  productCategory: z.string().min(1),
  projectSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'COMMERCIAL']),
  timeline: z.string().optional(),
  message: z.string().optional(),
});

const manualSchema = z.object({
  fullName: z.string().trim().min(2, 'Name is required'),
  phone: z.string().trim().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  productCategory: z.string().trim().min(1, 'Product category is required'),
  projectSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'COMMERCIAL']).optional(),
  timeline: z.string().trim().optional(),
  message: z.string().trim().optional(),

  // The mandatory pipeline fields
  source: z.enum(LEAD_SOURCES as [string, ...string[]]),
  sourceDetail: z.string().trim().max(200).optional(),
  assignedToId: z.string().min(1, 'An owner is required'),
  nextAction: z.string().trim().min(2, 'A next action is required'),
  nextActionDate: z.string().min(1, 'A next action date is required'),

  // Optional qualification captured during the first call
  qualNeed: z.string().trim().optional(),
  qualLocation: z.string().trim().optional(),
  qualBudget: z.string().optional(),
  qualUrgency: z.string().optional(),
  qualDecision: z.string().optional(),

  dealValue: z.union([z.number(), z.string()]).optional(),

  /** Set once the user has seen and dismissed the duplicate warning. */
  ignoreDuplicates: z.boolean().optional(),
});

/**
 * POST /api/crm/leads
 *
 * Two callers:
 *  - an external system with the CRM API key (unchanged behaviour), and
 *  - a signed-in member of staff entering a phone, walk-in or WhatsApp
 *    enquiry by hand, where source, owner and next action are all mandatory.
 */
export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  const body = await request.json().catch(() => null);

  // --- External system, API-key authenticated -----------------------------
  if (apiKey) {
    if (apiKey !== process.env.CRM_API_KEY) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const parsed = externalSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 });
    const lead = await createCRMLead(parsed.data);
    return Response.json({ success: true, lead: serialize(lead) }, { status: 201 });
  }

  // --- Member of staff entering a lead by hand ----------------------------
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session.user.role, 'view_leads')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = manualSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const d = parsed.data;

  if (!d.phone && !d.email) {
    return Response.json({ error: 'A phone number or an email address is required' }, { status: 400 });
  }

  // A rep may only create leads owned by themselves.
  if (!can(session.user.role, 'assign_leads') && d.assignedToId !== session.user.id) {
    return Response.json({ error: 'You can only create leads assigned to yourself' }, { status: 403 });
  }
  const owner = await prisma.user.findUnique({ where: { id: d.assignedToId } });
  if (!owner?.active) return Response.json({ error: 'Choose an active member of staff as the owner' }, { status: 400 });

  // Duplicate check — surfaced to the user before the lead is written.
  if (!d.ignoreDuplicates) {
    const duplicates = await findPossibleDuplicates({ phone: d.phone, email: d.email, fullName: d.fullName });
    if (duplicates.length > 0) {
      return Response.json(
        {
          error: 'This looks like an existing lead.',
          duplicates: duplicates.map((l) => ({
            id: l.id,
            fullName: l.fullName,
            phone: l.phone,
            email: l.email,
            status: l.status,
            createdAt: l.createdAt,
            assignedTo: l.assignedTo?.name ?? null,
          })),
        },
        { status: 409 },
      );
    }
  }

  const candidate = {
    status: 'NEW',
    source: d.source,
    assignedToId: d.assignedToId,
    nextAction: d.nextAction,
    nextActionDate: d.nextActionDate,
    qualNeed: d.qualNeed,
    qualLocation: d.qualLocation,
    qualBudget: d.qualBudget,
    qualUrgency: d.qualUrgency,
    qualDecision: d.qualDecision,
  };
  const errors = validateLead(candidate);
  if (errors.length > 0) return Response.json({ error: errors[0], errors }, { status: 422 });

  const lead = await prisma.lead.create({
    data: {
      fullName: d.fullName,
      phone: d.phone ? normalisePhone(d.phone) : null,
      email: d.email || null,
      productCategory: d.productCategory,
      projectSize: d.projectSize ?? null,
      timeline: d.timeline || null,
      message: d.message || null,
      source: d.source as never,
      sourceDetail: d.sourceDetail || null,
      status: 'NEW',
      assignedToId: d.assignedToId,
      nextAction: d.nextAction,
      nextActionDate: new Date(d.nextActionDate),
      qualNeed: d.qualNeed || null,
      qualLocation: d.qualLocation || null,
      qualBudget: d.qualBudget || null,
      qualUrgency: d.qualUrgency || null,
      qualDecision: d.qualDecision || null,
      dealValue: d.dealValue ? BigInt(Math.round(Number(d.dealValue))) : null,
      // Entered by a person who has already spoken to them, so the response
      // clock is already stopped.
      firstResponseAt: new Date(),
      lastContactedAt: new Date(),
      contactAttempts: 1,
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        leadId: lead.id,
        type: 'STATUS_CHANGE',
        note: `Lead entered by hand (${d.source.toLowerCase().replace(/_/g, ' ')})`,
        actorId: session.user.id,
        actorName: session.user.name ?? null,
      },
      {
        leadId: lead.id,
        type: 'NOTE',
        note: `Next action: ${d.nextAction} (by ${new Date(d.nextActionDate).toDateString()})`,
        actorId: session.user.id,
        actorName: session.user.name ?? null,
      },
    ],
  });

  return Response.json({ success: true, lead: serialize(lead) }, { status: 201 });
}
