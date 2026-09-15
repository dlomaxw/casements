import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logContactAttempt } from '@/lib/crm';
import { can } from '@/lib/roles';
import {
  CONTACT_OUTCOMES,
  LEAD_SOURCES,
  STAGES,
  canMove,
  isClosed,
  isOpen,
  validateLead,
  type Stage,
} from '@/lib/pipeline';
import { z } from 'zod';

// GET /api/crm/leads/[id] — single lead with activity log
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session.user.role, 'view_leads')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { name: true, email: true } },
      activities: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!lead) return Response.json({ error: 'Not found' }, { status: 404 });
  if (!can(session.user.role, 'assign_leads') && lead.assignedToId !== session.user.id) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  return Response.json({ lead: serialize(lead) });
}

/** BigInt (dealValue) is not JSON-serialisable — send it as a string. */
function serialize<T extends Record<string, unknown>>(lead: T) {
  return { ...lead, dealValue: lead.dealValue == null ? null : String(lead.dealValue) };
}

const nullableText = z.string().trim().max(2000).nullable().optional();

const patchSchema = z.object({
  // Pipeline
  status: z.enum(STAGES as [Stage, ...Stage[]]).optional(),
  nextAction: nullableText,
  nextActionDate: z.string().nullable().optional(),
  lossReason: z.string().nullable().optional(),
  lossDetail: nullableText,
  source: z.enum(LEAD_SOURCES as [string, ...string[]]).optional(),
  sourceDetail: nullableText,
  assignedToId: z.string().nullable().optional(),

  // Qualification
  qualNeed: nullableText,
  qualLocation: nullableText,
  qualBudget: z.string().nullable().optional(),
  qualUrgency: z.string().nullable().optional(),
  qualDecision: z.string().nullable().optional(),

  // Money
  dealValue: z.union([z.number(), z.string(), z.null()]).optional(),
  quotationRef: nullableText,
  quotationUrl: nullableText,

  // Contact details (correcting a typo'd phone number, etc.)
  fullName: z.string().trim().min(2).optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  phone: z.string().trim().min(5).nullable().optional().or(z.literal('')),
  productCategory: z.string().trim().min(1).optional(),
  projectSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'COMMERCIAL']).nullable().optional(),
  timeline: nullableText,
  message: nullableText,

  // Duplicate handling
  duplicateOfId: z.string().nullable().optional(),

  // Free-text note appended to the activity log
  notes: z.string().trim().max(2000).optional(),

  // One-click contact attempt with a structured outcome
  contact: z
    .object({
      outcome: z.enum(CONTACT_OUTCOMES as [string, ...string[]]),
      note: z.string().trim().max(2000).optional(),
    })
    .optional(),

  // Legacy field, still accepted so older clients keep working
  followUpDate: z.string().datetime().optional(),
});

/**
 * PATCH /api/crm/leads/[id]
 *
 * The single write path for a lead. Every change is checked against the
 * pipeline rules in lib/pipeline.ts: a lead can never be left without a
 * source, an owner or (while open) a next action, and cannot be closed as
 * lost or disqualified without a reason.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session.user.role, 'view_leads')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const existing = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });
  // Reps can only touch their own leads
  if (!can(session.user.role, 'assign_leads') && existing.assignedToId !== session.user.id) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  }
  const p = parsed.data;
  const actor = { id: session.user.id, name: session.user.name ?? null };

  // A contact attempt is logged first: it is a record of something that
  // already happened, and it stamps the response-time clock.
  if (p.contact) {
    await logContactAttempt(params.id, p.contact.outcome, p.contact.note, actor);
  }

  // --- Work out the state the lead would be left in ------------------------
  const stage = (p.status ?? existing.status) as string;
  const stageChanged = p.status !== undefined && p.status !== existing.status;

  if (stageChanged && !canMove(existing.status, stage)) {
    return Response.json(
      { error: `A lead cannot move straight from ${existing.status} to ${stage}.` },
      { status: 422 },
    );
  }

  // Reassignment is a privileged action.
  if (p.assignedToId !== undefined && p.assignedToId !== existing.assignedToId) {
    if (!can(session.user.role, 'assign_leads')) {
      return Response.json({ error: 'You are not allowed to reassign leads' }, { status: 403 });
    }
    if (p.assignedToId) {
      const rep = await prisma.user.findUnique({ where: { id: p.assignedToId } });
      if (!rep?.active) return Response.json({ error: 'Invalid assignee' }, { status: 400 });
    }
  }

  const pick = <T>(patched: T | undefined, current: T): T => (patched === undefined ? current : patched);

  const nextActionDate =
    p.nextActionDate === undefined
      ? existing.nextActionDate
      : p.nextActionDate
        ? new Date(p.nextActionDate)
        : null;

  const candidate = {
    status: stage,
    source: pick(p.source, existing.source),
    assignedToId: pick(p.assignedToId, existing.assignedToId),
    nextAction: pick(p.nextAction, existing.nextAction),
    nextActionDate,
    lossReason: pick(p.lossReason, existing.lossReason),
    qualNeed: pick(p.qualNeed, existing.qualNeed),
    qualLocation: pick(p.qualLocation, existing.qualLocation),
    qualBudget: pick(p.qualBudget, existing.qualBudget),
    qualUrgency: pick(p.qualUrgency, existing.qualUrgency),
    qualDecision: pick(p.qualDecision, existing.qualDecision),
    dealValue: p.dealValue === undefined ? existing.dealValue : p.dealValue,
  };

  // Closing a lead clears the next action — there is nothing left to do.
  if (isClosed(stage)) {
    candidate.nextAction = null;
    candidate.nextActionDate = null;
  }
  // A lead that is no longer lost must not keep a stale loss reason.
  if (isOpen(stage)) {
    candidate.lossReason = null;
  }

  const errors = validateLead(candidate);
  if (errors.length > 0) {
    return Response.json({ error: errors[0], errors }, { status: 422 });
  }

  // --- Build the update ----------------------------------------------------
  const now = new Date();
  const data: Record<string, unknown> = {
    source: candidate.source,
    nextAction: candidate.nextAction,
    nextActionDate: candidate.nextActionDate,
    lossReason: candidate.lossReason,
    qualNeed: candidate.qualNeed,
    qualLocation: candidate.qualLocation,
    qualBudget: candidate.qualBudget,
    qualUrgency: candidate.qualUrgency,
    qualDecision: candidate.qualDecision,
  };

  if (p.sourceDetail !== undefined) data.sourceDetail = p.sourceDetail;
  if (p.lossDetail !== undefined) data.lossDetail = p.lossDetail;
  if (p.quotationRef !== undefined) data.quotationRef = p.quotationRef;
  if (p.quotationUrl !== undefined) data.quotationUrl = p.quotationUrl;
  if (p.duplicateOfId !== undefined) data.duplicateOfId = p.duplicateOfId;
  if (p.notes !== undefined) data.notes = p.notes;
  if (p.followUpDate !== undefined) data.followUpDate = new Date(p.followUpDate);

  // Editable contact details
  for (const key of ['fullName', 'productCategory', 'timeline', 'message'] as const) {
    if (p[key] !== undefined) data[key] = p[key];
  }
  if (p.email !== undefined) data.email = p.email || null;
  if (p.phone !== undefined) data.phone = p.phone || null;
  if (p.projectSize !== undefined) data.projectSize = p.projectSize;

  if (p.dealValue !== undefined) {
    data.dealValue =
      p.dealValue === null || p.dealValue === ''
        ? null
        : BigInt(Math.round(Number(p.dealValue)));
  }

  if (p.assignedToId !== undefined) data.assignedToId = p.assignedToId;

  if (stageChanged) {
    data.status = stage;
    if (stage === 'QUOTED' && !existing.quotedAt) data.quotedAt = now;
    if (stage === 'WON') data.wonAt = now;
    if (isClosed(stage)) data.closedAt = now;
    else data.closedAt = null;
    if (stage === 'QUALIFIED' && !existing.qualifiedAt) {
      data.qualifiedAt = now;
      data.qualifiedById = session.user.id;
    }
  }

  // --- Activity trail ------------------------------------------------------
  const entries: { type: string; note: string; outcome?: string }[] = [];
  if (stageChanged) {
    const reason = candidate.lossReason ? ` — ${candidate.lossReason.toLowerCase().replace(/_/g, ' ')}` : '';
    entries.push({ type: 'STATUS_CHANGE', note: `Stage: ${existing.status} → ${stage}${reason}` });
  }
  if (p.notes) entries.push({ type: 'NOTE', note: p.notes });
  if (p.assignedToId !== undefined && p.assignedToId !== existing.assignedToId) {
    const rep = p.assignedToId ? await prisma.user.findUnique({ where: { id: p.assignedToId } }) : null;
    entries.push({ type: 'STATUS_CHANGE', note: rep ? `Reassigned to ${rep.name}` : 'Unassigned' });
  }
  if (
    (p.nextAction !== undefined && p.nextAction !== existing.nextAction) ||
    (p.nextActionDate !== undefined && String(nextActionDate) !== String(existing.nextActionDate))
  ) {
    if (candidate.nextAction) {
      entries.push({
        type: 'NOTE',
        note: `Next action: ${candidate.nextAction}${
          candidate.nextActionDate ? ` (by ${new Date(candidate.nextActionDate).toDateString()})` : ''
        }`,
      });
    }
  }

  const lead = await prisma.lead.update({ where: { id: params.id }, data });

  if (entries.length > 0) {
    await prisma.activity.createMany({
      data: entries.map((e) => ({
        leadId: params.id,
        type: e.type,
        note: e.note,
        outcome: e.outcome ?? null,
        actorId: actor.id,
        actorName: actor.name,
      })),
    });
  }

  return Response.json({ lead: serialize(lead) });
}

/**
 * DELETE /api/crm/leads/[id] — admins only.
 *
 * Deleting sales history is almost never right: closing a lead as
 * DISQUALIFIED / DUPLICATE keeps the record and the reason. This exists for
 * genuine mistakes (a test entry), and takes the activity log with it.
 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session.user.role, 'admin')) {
    return Response.json({ error: 'Only an administrator can delete a lead' }, { status: 403 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!lead) return Response.json({ error: 'Not found' }, { status: 404 });

  await prisma.$transaction([
    prisma.lead.updateMany({ where: { duplicateOfId: params.id }, data: { duplicateOfId: null } }),
    prisma.activity.deleteMany({ where: { leadId: params.id } }),
    prisma.lead.delete({ where: { id: params.id } }),
  ]);

  return Response.json({ success: true });
}
