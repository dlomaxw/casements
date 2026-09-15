import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { LOSS_REASON_LABELS, STAGES, canMove, isClosed, needsLossReason, reasonsForStage, type Stage } from '@/lib/pipeline';
import { z } from 'zod';

const schema = z
  .object({
    ids: z.array(z.string()).min(1, 'Select at least one lead').max(200),
    action: z.enum(['assign', 'stage', 'next-action']),
    assignedToId: z.string().nullable().optional(),
    status: z.enum(STAGES as [Stage, ...Stage[]]).optional(),
    lossReason: z.string().optional(),
    nextAction: z.string().trim().max(500).optional(),
    nextActionDate: z.string().optional(),
  })
  .refine((v) => v.action !== 'assign' || v.assignedToId !== undefined, {
    message: 'Choose who to assign these leads to',
  })
  .refine((v) => v.action !== 'stage' || !!v.status, { message: 'Choose a stage' })
  .refine((v) => v.action !== 'next-action' || (!!v.nextAction && !!v.nextActionDate), {
    message: 'A next action needs both a description and a date',
  });

/**
 * PATCH /api/crm/leads/bulk — apply one change to many leads at once.
 *
 * The pipeline rules still hold: a bulk move to LOST or DISQUALIFIED must
 * carry a loss reason, and a bulk move into an open stage must carry a next
 * action. Leads that cannot legally make the move are reported back by name
 * rather than being silently skipped.
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session.user.role, 'view_leads')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const { ids, action, assignedToId, status, lossReason, nextAction, nextActionDate } = parsed.data;

  const seesAll = can(session.user.role, 'assign_leads');
  const leads = await prisma.lead.findMany({
    where: { id: { in: ids }, ...(seesAll ? {} : { assignedToId: session.user.id }) },
  });
  if (leads.length === 0) return Response.json({ error: 'No matching leads' }, { status: 404 });

  const actor = { actorId: session.user.id, actorName: session.user.name ?? null };
  const now = new Date();
  const skipped: string[] = [];
  let updated = 0;

  // --- Bulk reassign -------------------------------------------------------
  if (action === 'assign') {
    if (!seesAll) return Response.json({ error: 'You are not allowed to reassign leads' }, { status: 403 });
    if (!assignedToId) return Response.json({ error: 'An owner is required' }, { status: 400 });

    const rep = await prisma.user.findUnique({ where: { id: assignedToId } });
    if (!rep?.active) return Response.json({ error: 'Choose an active member of staff' }, { status: 400 });

    await prisma.lead.updateMany({ where: { id: { in: leads.map((l) => l.id) } }, data: { assignedToId } });
    await prisma.activity.createMany({
      data: leads.map((l) => ({ leadId: l.id, type: 'STATUS_CHANGE', note: `Reassigned to ${rep.name}`, ...actor })),
    });
    return Response.json({ success: true, updated: leads.length, skipped });
  }

  // --- Bulk next action ----------------------------------------------------
  if (action === 'next-action') {
    const open = leads.filter((l) => !isClosed(l.status));
    for (const l of leads) if (isClosed(l.status)) skipped.push(`${l.fullName} (already closed)`);
    if (open.length > 0) {
      await prisma.lead.updateMany({
        where: { id: { in: open.map((l) => l.id) } },
        data: { nextAction, nextActionDate: new Date(nextActionDate!) },
      });
      await prisma.activity.createMany({
        data: open.map((l) => ({
          leadId: l.id,
          type: 'NOTE',
          note: `Next action: ${nextAction} (by ${new Date(nextActionDate!).toDateString()})`,
          ...actor,
        })),
      });
    }
    return Response.json({ success: true, updated: open.length, skipped });
  }

  // --- Bulk stage change ---------------------------------------------------
  const target = status!;
  if (needsLossReason(target)) {
    if (!lossReason || !reasonsForStage(target).map(String).includes(lossReason)) {
      return Response.json(
        { error: `Moving leads to ${target} requires a valid loss reason.` },
        { status: 422 },
      );
    }
  } else if (!isClosed(target) && (!nextAction || !nextActionDate)) {
    // Keeping a lead open means somebody has to say what happens next.
    return Response.json(
      { error: `Moving leads to ${target} requires a next action and a date.` },
      { status: 422 },
    );
  }

  for (const lead of leads) {
    if (!canMove(lead.status, target)) {
      skipped.push(`${lead.fullName} (${lead.status} → ${target} is not allowed)`);
      continue;
    }
    // The qualification gate is per-lead and cannot be bulk-bypassed.
    if (['QUALIFIED', 'SITE_ASSESSED', 'QUOTED', 'WON'].includes(target)) {
      const missing = [lead.qualNeed, lead.qualLocation, lead.qualBudget, lead.qualUrgency, lead.qualDecision]
        .filter((v) => !v).length;
      if (missing > 0) {
        skipped.push(`${lead.fullName} (qualification incomplete)`);
        continue;
      }
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: target,
        ...(needsLossReason(target) ? { lossReason } : { lossReason: null }),
        ...(isClosed(target)
          ? { nextAction: null, nextActionDate: null, closedAt: now }
          : { nextAction, nextActionDate: new Date(nextActionDate!), closedAt: null }),
        ...(target === 'WON' ? { wonAt: now } : {}),
        ...(target === 'QUOTED' && !lead.quotedAt ? { quotedAt: now } : {}),
      },
    });
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        type: 'STATUS_CHANGE',
        note: `Stage: ${lead.status} → ${target}${
          lossReason ? ` — ${LOSS_REASON_LABELS[lossReason as keyof typeof LOSS_REASON_LABELS] ?? lossReason}` : ''
        }`,
        ...actor,
      },
    });
    updated += 1;
  }

  return Response.json({ success: true, updated, skipped });
}
