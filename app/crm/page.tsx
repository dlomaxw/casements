import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { getLeadStats, getOverdueFollowUps } from '@/lib/crm';
import { prisma } from '@/lib/db';
import StatsWidget from '@/components/crm/StatsWidget';
import PipelineBoard from '@/components/crm/PipelineBoard';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function CrmDashboardPage() {
  const session = await requireSession();
  const isAdmin = session.user.role === 'ADMIN';
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
    <div>
      {/* Header */}
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Sales Dashboard</h1>
          <p className="mt-2 font-mono text-sm text-on-surface-variant">
            <span className="text-safety-orange">Overview</span>
            {' › '}
            {isAdmin ? 'All Leads' : 'My Leads'}
          </p>
        </div>
        <Link
          href="/crm/leads"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-mono text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          <Icon name="table_rows" className="text-[18px]" />
          View all leads
        </Link>
      </div>

      <StatsWidget stats={stats} />

      {/* Pipeline board */}
      <div className="mt-10">
        <h2 className="mb-3 font-work text-lg font-semibold text-industrial-blue">Pipeline Board</h2>
        <PipelineBoard leads={boardLeads} />
      </div>

      {/* Overdue follow-ups */}
      <div className="mt-10">
        <h2 className="mb-3 flex items-center gap-2 font-work text-lg font-semibold text-industrial-blue">
          <Icon name="notifications_active" className="text-safety-orange" />
          Overdue Follow-Ups
        </h2>
        {overdue.length === 0 ? (
          <p className="rounded-xl border border-outline-variant bg-white p-6 text-sm text-on-surface-variant">
            Nothing overdue — nice work.
          </p>
        ) : (
          <ul className="space-y-2">
            {overdue.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/crm/leads/${lead.id}`}
                  className="flex items-center justify-between rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm transition-colors hover:bg-surface-container-low"
                >
                  <span className="font-medium text-industrial-blue">
                    {lead.fullName} — {lead.productCategory === 'general-enquiry' ? 'General enquiry' : lead.productCategory}
                  </span>
                  <span className="font-mono text-xs text-error">
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
