import type { CRMStats } from '@/lib/crm';
import Icon from './Icon';

const statusLabels: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  SITE_ASSESSED: 'Site Assessed',
  QUOTED: 'Quoted',
  WON: 'Won',
  LOST: 'Lost',
};

export default function StatsWidget({ stats }: { stats: CRMStats }) {
  return (
    <div className="space-y-8">
      {/* Bento KPI grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="col-span-1 flex items-center gap-5 rounded-xl border border-outline-variant bg-white p-6 md:col-span-2">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-container">
            <Icon name="inbox" filled className="text-3xl text-white" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Total Leads</span>
            <h3 className="font-work text-2xl font-semibold text-industrial-blue">{stats.total}</h3>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-white p-6">
          <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">New This Week</span>
          <div className="mt-4 flex items-end justify-between">
            <h3 className="font-work text-2xl font-semibold text-primary">{stats.thisWeek}</h3>
            <span className="font-mono text-xs font-bold text-on-surface-variant">{stats.today} today</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-white p-6">
          <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Conversion</span>
          <div className="mt-4 flex items-end justify-between">
            <h3 className="font-work text-2xl font-semibold text-secondary">{Math.round(stats.conversionRate * 100)}%</h3>
            <Icon name="trending_up" className="text-primary" />
          </div>
        </div>
      </div>

      {/* Pipeline by status */}
      <div>
        <h2 className="mb-3 font-work text-lg font-semibold text-industrial-blue">Pipeline</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="rounded-lg border border-outline-variant bg-white p-4 text-center">
              <p className="font-work text-2xl font-bold text-industrial-blue">{count}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">
                {statusLabels[status] ?? status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {stats.topCategories.length > 0 && (
        <div>
          <h2 className="mb-3 font-work text-lg font-semibold text-industrial-blue">Top Categories by Inquiry</h2>
          <ul className="space-y-2">
            {stats.topCategories.map((c) => (
              <li key={c.category} className="flex items-center justify-between rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm">
                <span className="text-on-surface">{c.category === 'general-enquiry' ? 'General enquiry' : c.category}</span>
                <span className="font-mono font-semibold text-primary">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
