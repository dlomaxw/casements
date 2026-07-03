import { getServerSession } from 'next-auth';
import type { LeadStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createCRMLead } from '@/lib/crm';
import { z } from 'zod';

const PAGE_SIZE = 20;
const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'SITE_ASSESSED', 'QUOTED', 'WON', 'LOST'];

// GET /api/crm/leads — list leads (?status=&page=&q=). Session auth.
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // §17: SALES_REP sees only their own leads; ADMIN sees all
  const scope = session.user.role === 'ADMIN' ? {} : { assignedToId: session.user.id };

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const status = STATUSES.includes(statusParam as LeadStatus) ? (statusParam as LeadStatus) : undefined;
  const q = searchParams.get('q')?.trim();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const where = {
    ...scope,
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' as const } },
            { phone: { contains: q } },
            { email: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { assignedTo: { select: { name: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  return Response.json({ leads, total, page, pageSize: PAGE_SIZE });
}

const createSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional(),
  productCategory: z.string().min(1),
  projectSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'COMMERCIAL']),
  timeline: z.string().optional(),
  message: z.string().optional(),
});

// POST /api/crm/leads — create lead from an external source. API-key auth.
export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey || apiKey !== process.env.CRM_API_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }
  const lead = await createCRMLead(parsed.data);
  return Response.json({ success: true, lead }, { status: 201 });
}
