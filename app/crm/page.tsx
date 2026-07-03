import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { getLeadStats, getOverdueFollowUps } from '@/lib/crm';
import StatsWidget from '@/components/crm/StatsWidget';

export const dynamic = 'force-dynamic';

export default async function CrmDashboardPage() {
  await requireSession();
  const [stats, overdue] = await Promise.all([getLeadStats(), getOverdueFollowUps()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-brand-950">Dashboard</h1>
      <p className="mt-1 text-sm text-brand-500">{stats.total} total leads in the pipeline.</p>

      <div className="mt-8">
        <StatsWidget stats={stats} />
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
