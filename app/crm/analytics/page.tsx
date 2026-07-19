import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { can } from '@/lib/roles';
import {
  getDailySeries,
  getDeviceSplit,
  getTopPages,
  getTopReferrers,
  getTrafficSummary,
} from '@/lib/analytics';
import TrafficChart from '@/components/crm/TrafficChart';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/about-us': 'About Us',
  '/products': 'Products',
  '/projects': 'Projects',
  '/csr': 'CSR',
  '/testimonials': 'Testimonials',
  '/blog': 'Blog',
};

function label(path: string) {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith('/products/')) return `Product · ${path.replace('/products/', '')}`;
  if (path.startsWith('/blog/')) return `Post · ${path.replace('/blog/', '')}`;
  return path;
}

export default async function AnalyticsPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'view_analytics')) redirect('/crm');

  const [summary, series, topPages, referrers, devices] = await Promise.all([
    getTrafficSummary(),
    getDailySeries(30),
    getTopPages(30, 12),
    getTopReferrers(30, 8),
    getDeviceSplit(30),
  ]);

  const deviceTotal = devices.reduce((s, d) => s + d.views, 0) || 1;
  const maxPageViews = Math.max(1, ...topPages.map((p) => p.views));
  const empty = summary.totalViews === 0;

  const Stat = ({ title, views, visitors, note }: { title: string; views: number; visitors: number; note: string }) => (
    <div className="rounded-xl border border-outline-variant bg-white p-6">
      <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">{title}</span>
      <p className="mt-3 font-work text-3xl font-bold text-industrial-blue">{views.toLocaleString()}</p>
      <p className="mt-1 font-mono text-[11px] text-on-surface-variant">
        {visitors.toLocaleString()} unique · {note}
      </p>
    </div>
  );

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Website Analytics</h1>
          <p className="mt-2 font-mono text-sm text-on-surface-variant">
            <span className="text-safety-orange">Traffic</span> › visits and pages · {summary.totalViews.toLocaleString()} views all time
          </p>
        </div>
        <Link href="/" target="_blank" className="flex items-center gap-1 rounded-lg border border-outline-variant px-4 py-2 font-mono text-xs font-medium text-industrial-blue hover:border-safety-orange hover:text-safety-orange">
          <Icon name="open_in_new" className="text-[16px]" /> View site
        </Link>
      </div>

      {empty && (
        <p className="mb-6 flex items-center gap-2 rounded-lg bg-secondary-container px-4 py-3 text-sm text-on-secondary-container">
          <Icon name="info" className="text-[18px]" />
          No visits recorded yet — tracking has just been switched on. Data appears as people browse the site.
        </p>
      )}

      {/* Daily / weekly / monthly */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat title="Today" views={summary.todayViews} visitors={summary.todayVisitors} note="since midnight" />
        <Stat title="This week" views={summary.weekViews} visitors={summary.weekVisitors} note="last 7 days" />
        <Stat title="This month" views={summary.monthViews} visitors={summary.monthVisitors} note="last 30 days" />
      </div>

      {/* Trend */}
      <div className="mt-6 rounded-xl border border-outline-variant bg-white p-6">
        <h2 className="mb-1 font-work text-lg font-semibold text-industrial-blue">Page views — last 30 days</h2>
        <p className="mb-5 font-mono text-[11px] text-on-surface-variant">Hover a bar for that day&rsquo;s totals</p>
        <TrafficChart data={series} />
      </div>

      {/* Which pages */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-white lg:col-span-2">
          <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
            <h2 className="font-work text-lg font-semibold text-industrial-blue">Most visited pages</h2>
            <p className="font-mono text-[11px] text-on-surface-variant">Last 30 days</p>
          </div>
          {topPages.length === 0 ? (
            <p className="p-6 text-sm text-on-surface-variant">No page data yet.</p>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-high">
                <tr>
                  <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Page</th>
                  <th className="p-4 text-right font-mono text-xs uppercase tracking-wide text-industrial-blue">Views</th>
                  <th className="p-4 text-right font-mono text-xs uppercase tracking-wide text-industrial-blue">Visitors</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((p) => (
                  <tr key={p.path} className="zebra-stripe border-b border-outline-variant/30">
                    <td className="p-4">
                      <span className="text-sm font-medium text-industrial-blue">{label(p.path)}</span>
                      <span className="ml-2 font-mono text-[11px] text-outline">{p.path}</span>
                      {/* magnitude bar — same single hue as the trend chart */}
                      <div className="mt-1.5 h-1 w-full rounded bg-surface-container-high">
                        <div className="h-1 rounded" style={{ width: `${(p.views / maxPageViews) * 100}%`, background: '#006b23' }} />
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono text-sm font-semibold text-industrial-blue">{p.views.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono text-sm text-on-surface-variant">{p.visitors.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-6">
          {/* Devices */}
          <div className="rounded-xl border border-outline-variant bg-white p-6">
            <h2 className="mb-4 font-work text-lg font-semibold text-industrial-blue">Devices</h2>
            {devices.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No data yet.</p>
            ) : (
              <ul className="space-y-3">
                {devices.map((d) => (
                  <li key={d.device}>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="capitalize text-on-surface">{d.device}</span>
                      <span className="text-on-surface-variant">{Math.round((d.views / deviceTotal) * 100)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded bg-surface-container-high">
                      <div className="h-1.5 rounded" style={{ width: `${(d.views / deviceTotal) * 100}%`, background: '#006b23' }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Referrers */}
          <div className="rounded-xl border border-outline-variant bg-white p-6">
            <h2 className="mb-4 font-work text-lg font-semibold text-industrial-blue">Top sources</h2>
            {referrers.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Mostly direct visits so far.</p>
            ) : (
              <ul className="space-y-2">
                {referrers.map((r) => (
                  <li key={r.source} className="flex items-center justify-between font-mono text-xs">
                    <span className="truncate text-on-surface">{r.source}</span>
                    <span className="font-semibold text-primary">{r.views}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
