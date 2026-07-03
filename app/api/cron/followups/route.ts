import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

// §18: Daily CRM follow-up reminder emails to reps — invoked by Vercel Cron.
// Vercel sends "Authorization: Bearer ${CRON_SECRET}" automatically when
// CRON_SECRET is set in the project's environment variables.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const overdue = await prisma.lead.findMany({
    where: {
      followUpDate: { lte: new Date() },
      status: { notIn: ['WON', 'LOST'] },
      assignedToId: { not: null },
    },
    include: { assignedTo: true },
    orderBy: { followUpDate: 'asc' },
  });

  // Group by rep and send one digest email each
  const byRep = new Map<string, { repName: string; repEmail: string; leads: typeof overdue }>();
  for (const lead of overdue) {
    if (!lead.assignedTo?.email) continue;
    const entry = byRep.get(lead.assignedTo.id) ?? {
      repName: lead.assignedTo.name,
      repEmail: lead.assignedTo.email,
      leads: [] as typeof overdue,
    };
    entry.leads.push(lead);
    byRep.set(lead.assignedTo.id, entry);
  }

  const base = process.env.NEXTAUTH_URL ?? 'https://casements.co.ug';
  let sent = 0;
  for (const { repName, repEmail, leads } of Array.from(byRep.values())) {
    const rows = leads
      .map(
        (l) =>
          `<li><a href="${base}/crm/leads/${l.id}">${l.fullName}</a> — ${l.productCategory} (${l.status}), due ${l.followUpDate?.toDateString()}</li>`,
      )
      .join('');
    await sendEmail({
      to: repEmail,
      subject: `You have ${leads.length} overdue follow-up${leads.length > 1 ? 's' : ''} — Casements CRM`,
      html: `<p>Hi ${repName},</p><p>The following leads are overdue for follow-up:</p><ul>${rows}</ul><p><a href="${base}/crm">Open the CRM dashboard</a></p>`,
    });
    sent += 1;
  }

  return Response.json({ success: true, overdueLeads: overdue.length, emailsSent: sent });
}
