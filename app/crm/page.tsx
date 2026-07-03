import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { getLeadStats, getOverdueFollowUps } from '@/lib/crm';
import { prisma } from '@/lib/db';
import StatsWidget from '@/components/crm/StatsWidget';
import PipelineBoard from '@/components/crm/PipelineBoard';

export const dynamic = 'force-dynamic';

export default async function CrmDashboardPage() {
  const session = await requireSession();
  const isAdmin = session.user.role === 'ADMIN';
  // §17: reps see only their own leads; ADMIN sees everything
  const scopeUserId = isAdmin ? undefined : session.user.id;

  const [stats, overdue, boardLeads] = await Promise.all([
    getLeadStats(scopeUserId),
    getOverdueFollowUps(scopeUserId),
    prisma.lead.findMany({
      where: scopeUserId ? { assignedToId: scopeUserId } : {},
      orderBy: { createdAt: 'desc' },
      take: 60,
      include: { assignedTo: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-950">Dashboard</h1>
          <p className="mt-1 text-sm text-brand-500">
            {isAdmin ? `${stats.total} total leads in the pipeline.` : `${stats.total} leads assigned to you.`}
          </p>
        </div>
        <Link href="/crm/leads" className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
          View all leads
        </Link>
      </div>

      <div className="mt-8">
        <StatsWidget stats={stats} />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-brand-950">Pipeline Board</h2>
        <div className="mt-3">
          <PipelineBoard leads={boardLeads} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-brand-950">Overdue Follow-Ups</h2>
        {overdue.length === 0 ? (
          <p className="mt-3 rounded-lg bg-white p-6 text-sm text-brand-500 ring-1 ring-brand-100">
            Nothing overdue — nice work.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {overdue.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/crm/leads/${lead.id}`}
                  className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-brand-100 hover:bg-steel-50"
                >
                  <span className="font-medium text-brand-900">{lead.fullName} — {lead.productCategory}</span>
                  <span className="text-red-600">
                    Due {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : '—'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
