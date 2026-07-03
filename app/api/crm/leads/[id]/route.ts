import { getServerSession } from 'next-auth';
import type { LeadStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateLeadStatus } from '@/lib/crm';
import { z } from 'zod';

// GET /api/crm/leads/[id] — single lead with activity log
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { name: true, email: true } },
      activities: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!lead) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ lead });
}

const patchSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'SITE_ASSESSED', 'QUOTED', 'WON', 'LOST']).optional(),
  notes: z.string().optional(),
  followUpDate: z.string().datetime().optional(),
});

// PATCH /api/crm/leads/[id] — update status, notes, follow-up date
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 });

  const { status, notes, followUpDate } = parsed.data;

  if (status) {
    await updateLeadStatus(params.id, status as LeadStatus, notes);
  } else if (notes) {
    await prisma.activity.create({ data: { leadId: params.id, type: 'NOTE', note: notes } });
  }

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: {
      ...(notes ? { notes } : {}),
      ...(followUpDate ? { followUpDate: new Date(followUpDate) } : {}),
    },
    include: { activities: { orderBy: { createdAt: 'desc' } } },
  });

  return Response.json({ lead });
}
