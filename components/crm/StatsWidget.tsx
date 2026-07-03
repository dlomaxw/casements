import type { CRMStats } from '@/lib/crm';

const statusLabels: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  SITE_ASSESSED: 'Site Assessed',
  QUOTED: 'Quoted',
  WON: 'Won',
  LOST: 'Lost',
};

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold text-brand-950">{value}</p>
    </div>
  );
}

export default function StatsWidget({ stats }: { stats: CRMStats }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="New Today" value={stats.today} />
        <Card label="This Week" value={stats.thisWeek} />
        <Card label="This Month" value={stats.thisMonth} />
        <Card label="Conversion Rate" value={`${Math.round(stats.conversionRate * 100)}%`} />
      </div>

      <div>
        <h2 className="font-display text-lg font-bold text-brand-950">Pipeline</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="rounded-lg bg-white p-4 text-center shadow-sm ring-1 ring-brand-100">
              <p className="font-display text-2xl font-bold text-brand-900">{count}</p>
              <p className="mt-1 text-xs text-brand-500">{statusLabels[status] ?? status}</p>
            </div>
          ))}
        </div>
      </div>

      {stats.topCategories.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold text-brand-950">Top Categories by Inquiry</h2>
          <ul className="mt-3 space-y-2">
            {stats.topCategories.map((c) => (
              <li key={c.category} className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-brand-100">
                <span className="text-brand-900">{c.category}</span>
                <span className="font-semibold text-brand-600">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
