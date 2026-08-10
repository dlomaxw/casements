import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { getLeadStats, getOverdueFollowUps } from '@/lib/crm';
import { prisma } from '@/lib/db';
import { can, ROLE_LABELS, type Role } from '@/lib/roles';
import { getTrafficSummary, getDailySeries } from '@/lib/analytics';
import { getProductNav } from '@/lib/products-db';
import PipelineChevrons from '@/components/crm/dashboard/PipelineChevrons';
import KpiCard from '@/components/crm/dashboard/KpiCard';
import TrafficChart from '@/components/crm/dashboard/TrafficChart';
import CategoryDonut from '@/components/crm/dashboard/CategoryDonut';
import RecentLeads from '@/components/crm/dashboard/RecentLeads';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

const QUOTATION_URL = 'http://favourwings.com/quotations/quotation_system/';

export default async function CrmDashboardPage() {
  const session = await requireSession();
  const role = session.user.role;
  const isManagerish = role === 'ADMIN' || role === 'MANAGER';
  const viewLeads = can(role, 'view_leads');
  const scopeUserId = isManagerish ? undefined : session.user.id;

  const quickActions = [
    { show: viewLeads, href: '/crm/leads', icon: 'group', title: 'Leads', desc: 'Manage leads' },
    { show: viewLeads, href: QUOTATION_URL, external: true, icon: 'description', title: 'Quotation System', desc: 'Create quotations' },
    { show: can(role, 'manage_content'), href: '/crm/products', icon: 'inventory_2', title: 'Products', desc: 'Manage catalogue' },
    { show: can(role, 'manage_content'), href: '/crm/projects', icon: 'work', title: 'Projects', desc: 'Manage portfolio' },
    { show: can(role, 'manage_content'), href: '/crm/content', icon: 'language', title: 'Website Content', desc: 'Edit pages & media' },
    { show: can(role, 'manage_content'), href: '/crm/videos', icon: 'smart_display', title: 'Home Videos', desc: 'Manage YouTube videos' },
    { show: can(role, 'manage_blog'), href: '/crm/blog', icon: 'article', title: 'Blog', desc: 'Publish posts' },
    { show: can(role, 'manage_media'), href: '/crm/media', icon: 'image', title: 'Media Library', desc: 'Upload images' },
    { show: can(role, 'manage_users'), href: '/crm/users', icon: 'groups', title: 'Staff', desc: 'Manage team' },
  ].filter((a) => a.show);

  const showAnalytics = can(role, 'view_analytics');
  const [traffic, series] = showAnalytics
    ? await Promise.all([getTrafficSummary(), getDailySeries(30)])
    : [null, []];

  const [stats, overdue, recent, productNav] = viewLeads
    ? await Promise.all([
        getLeadStats(scopeUserId),
        getOverdueFollowUps(scopeUserId),
        prisma.lead.findMany({
          where: scopeUserId ? { assignedToId: scopeUserId } : {},
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: { id: true, fullName: true, productCategory: true, sourcePage: true, status: true, createdAt: true },
        }),
        getProductNav(),
      ])
    : [null, [], [], []];

  const labels: Record<string, string> = Object.fromEntries(
    productNav.map((p) => [p.slug, p.shortTitle ?? p.title]),
  );
  labels['general-enquiry'] = 'General';

  const donutSlices = (stats?.topCategories ?? [])
    .slice(0, 6)
    .map((c) => ({ label: labels[c.category] ?? c.category, count: c.count }));

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">
            {isManagerish ? 'Admin Dashboard' : 'Dashboard'}
          </h1>
          <p className="mt-2 font-mono text-sm text-on-surface-variant">
            Welcome, {session.user.name} · <span className="text-safety-orange">{ROLE_LABELS[role as Role]}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2.5 font-mono text-xs text-on-surface-variant">
            <Icon name="calendar_month" className="text-[18px]" />
            Last 30 days
          </span>
          {viewLeads && (
            <a href={QUOTATION_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-sm font-medium text-white hover:opacity-90">
              <Icon name="add" className="text-[18px]" /> Create quotation
            </a>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="mb-3 font-work text-sm font-semibold uppercase tracking-wide text-on-surface-variant">Quick actions</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {quickActions.map((a) => (
          <Link key={a.href} href={a.href}
            {...('external' in a && a.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="group flex items-center gap-3 rounded-xl border border-outline-variant bg-white px-4 py-3.5 transition-colors hover:border-safety-orange">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-container/15 text-primary">
              <Icon name={a.icon} className="text-[20px]" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-work text-sm font-bold text-industrial-blue">{a.title}</span>
              <span className="block truncate text-[11px] text-on-surface-variant">{a.desc}</span>
            </span>
            <Icon name="chevron_right" className="ml-auto text-outline-variant group-hover:text-safety-orange" />
          </Link>
        ))}
      </div>

      {/* KPI row */}
      {(stats || traffic) && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats && (
            <>
              <KpiCard icon="groups" label="Total Leads" value={stats.total.toLocaleString()} note="All time" />
              <KpiCard icon="trending_up" label="New This Week" value={stats.thisWeek.toLocaleString()} note={`${stats.today} today`} />
              <KpiCard icon="filter_alt" label="Conversion" value={`${Math.round(stats.conversionRate * 100)}%`} note="Won vs. closed" />
            </>
          )}
          {traffic && (
            <KpiCard icon="visibility" label="Website Visits" value={traffic.monthViews.toLocaleString()}
              note={`${traffic.monthVisitors.toLocaleString()} unique · last 30 days`} />
          )}
        </div>
      )}

      {/* Traffic + pipeline */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {traffic && (
          <section className="rounded-xl border border-outline-variant bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-work text-lg font-semibold text-industrial-blue">Website Traffic</h2>
              <Link href="/crm/analytics" className="font-mono text-xs text-primary hover:underline">Full report →</Link>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_150px]">
              <TrafficChart series={series} />
              <div className="space-y-4 lg:border-l lg:border-outline-variant lg:pl-6">
                {[
                  { t: 'Today', v: traffic.todayViews, u: traffic.todayVisitors, n: 'since midnight' },
                  { t: 'This week', v: traffic.weekViews, u: traffic.weekVisitors, n: 'last 7 days' },
                  { t: 'This month', v: traffic.monthViews, u: traffic.monthVisitors, n: 'last 30 days' },
                ].map((s) => (
                  <div key={s.t}>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">{s.t}</p>
                    <p className="font-work text-2xl font-bold leading-tight text-industrial-blue">{s.v.toLocaleString()}</p>
                    <p className="font-mono text-[10px] text-on-surface-variant">{s.u.toLocaleString()} unique · {s.n}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {stats && (
          <section className="rounded-xl border border-outline-variant bg-white p-6">
            <h2 className="mb-4 font-work text-lg font-semibold text-industrial-blue">Sales Pipeline</h2>
            <PipelineChevrons byStatus={stats.byStatus} total={stats.total} />
          </section>
        )}
      </div>

      {/* Recent leads + categories */}
      {viewLeads && (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
          <section className="rounded-xl border border-outline-variant bg-white p-6">
            <h2 className="mb-4 font-work text-lg font-semibold text-industrial-blue">Recent Leads</h2>
            <RecentLeads leads={recent} labels={labels} />
            <div className="mt-4 text-center">
              <Link href="/crm/leads" className="font-mono text-xs text-primary hover:underline">View all leads →</Link>
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant bg-white p-6">
            <h2 className="mb-4 font-work text-lg font-semibold text-industrial-blue">Lead Categories</h2>
            <CategoryDonut slices={donutSlices} />
          </section>
        </div>
      )}

      {/* Overdue follow-ups */}
      {viewLeads && (
        <section className="mt-6">
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
                  <Link href={`/crm/leads/${lead.id}`}
                    className="flex items-center justify-between rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm transition-colors hover:bg-surface-container-low">
                    <span className="font-medium text-industrial-blue">
                      {lead.fullName} — {labels[lead.productCategory] ?? lead.productCategory}
                    </span>
                    <span className="font-mono text-xs text-error">
                      Due {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : '—'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
