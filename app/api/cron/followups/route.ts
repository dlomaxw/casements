import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { ATTENTION_LABELS, STAGE_LABELS, attentionState, type Stage } from '@/lib/pipeline';

/**
 * Daily CRM discipline digest — invoked by Vercel Cron at 06:00 UTC.
 *
 * Vercel sends "Authorization: Bearer ${CRON_SECRET}" automatically when
 * CRON_SECRET is set in the project's environment variables.
 *
 * Each rep gets one email listing every lead of theirs that has stalled:
 * an overdue action, no action at all, or nobody has made contact yet.
 * Managers get a summary of the same across the team.
 *
 * Email delivery is optional: without RESEND_API_KEY the run still completes
 * and returns the counts, so the endpoint can be polled or checked manually
 * until an email provider is configured.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const stalled = await prisma.lead.findMany({
    where: {
      status: { notIn: ['WON', 'LOST', 'DISQUALIFIED'] },
      OR: [
        { nextActionDate: { lte: endOfToday } }, // due or overdue
        { nextActionDate: null }, // nobody said what happens next
        { firstResponseAt: null }, // nobody has made contact at all
      ],
    },
    include: { assignedTo: true },
    orderBy: [{ nextActionDate: 'asc' }, { createdAt: 'asc' }],
  });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? 'https://casements.co.ug';

  // --- Group by owner ------------------------------------------------------
  const byRep = new Map<string, { name: string; email: string; leads: typeof stalled }>();
  const unowned: typeof stalled = [];

  for (const lead of stalled) {
    if (!lead.assignedTo?.email) {
      unowned.push(lead);
      continue;
    }
    const entry = byRep.get(lead.assignedTo.id) ?? {
      name: lead.assignedTo.name,
      email: lead.assignedTo.email,
      leads: [] as typeof stalled,
    };
    entry.leads.push(lead);
    byRep.set(lead.assignedTo.id, entry);
  }

  const row = (lead: (typeof stalled)[number]) => {
    const state = attentionState(lead);
    return `<li>
      <a href="${base}/crm/leads/${lead.id}">${escapeHtml(lead.fullName)}</a>
      — ${STAGE_LABELS[lead.status as Stage] ?? lead.status}
      · <strong>${ATTENTION_LABELS[state] || 'Needs attention'}</strong>
      ${lead.nextAction ? `· ${escapeHtml(lead.nextAction)}` : '· no next action set'}
    </li>`;
  };

  let emailsSent = 0;

  for (const { name, email, leads } of Array.from(byRep.values())) {
    await sendEmail({
      to: email,
      subject: `${leads.length} lead${leads.length === 1 ? '' : 's'} need${leads.length === 1 ? 's' : ''} your attention — Casements CRM`,
      html: `
        <p>Hi ${escapeHtml(name)},</p>
        <p>These leads have stalled. Each one needs either a contact attempt, a next action with a date, or to be closed with a reason.</p>
        <ul>${leads.map(row).join('')}</ul>
        <p><a href="${base}/crm/leads?attention=overdue">Open your work queue</a></p>
      `,
    });
    emailsSent += 1;
  }

  // --- Managers: the team-wide picture, plus anything with no owner --------
  if (stalled.length > 0) {
    const managers = await prisma.user.findMany({
      where: { active: true, role: { in: ['ADMIN', 'MANAGER'] }, notifyEmail: true },
      select: { name: true, email: true },
    });

    const summary = Array.from(byRep.values())
      .sort((a, b) => b.leads.length - a.leads.length)
      .map((r) => `<li>${escapeHtml(r.name)} — ${r.leads.length}</li>`)
      .join('');

    for (const manager of managers) {
      await sendEmail({
        to: manager.email,
        subject: `Pipeline check: ${stalled.length} stalled lead${stalled.length === 1 ? '' : 's'} — Casements CRM`,
        html: `
          <p>Hi ${escapeHtml(manager.name)},</p>
          <p>${stalled.length} open lead${stalled.length === 1 ? '' : 's'} currently need attention.</p>
          <ul>${summary}</ul>
          ${
            unowned.length > 0
              ? `<p><strong>${unowned.length} lead${unowned.length === 1 ? ' has' : 's have'} no owner:</strong></p><ul>${unowned.map(row).join('')}</ul>`
              : ''
          }
          <p><a href="${base}/crm">Open the dashboard</a></p>
        `,
      });
      emailsSent += 1;
    }
  }

  return Response.json({
    success: true,
    stalledLeads: stalled.length,
    reps: byRep.size,
    unowned: unowned.length,
    emailsSent,
    emailConfigured: Boolean(process.env.RESEND_API_KEY),
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
