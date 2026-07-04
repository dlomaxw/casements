import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { getLeadStats, getOverdueFollowUps } from '@/lib/crm';
import { prisma } from '@/lib/db';
import { can, ROLE_LABELS, type Role } from '@/lib/roles';
import StatsWidget from '@/components/crm/StatsWidget';
import PipelineBoard from '@/components/crm/PipelineBoard';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function CrmDashboardPage() {
  const session = await requireSession();
  const role = session.user.role;
  const isManagerish = role === 'ADMIN' || role === 'MANAGER';
  const viewLeads = can(role, 'view_leads');
  const scopeUserId = isManagerish ? undefined : session.user.id;

  const quickActions = [
    { show: viewLeads, href: '/crm/leads', icon: 'table_rows', title: 'Leads', desc: 'Manage the sales pipeline' },
    { show: can(role, 'manage_blog'), href: '/crm/blog', icon: 'article', title: 'Blog & Content', desc: 'Publish posts, images & video' },
    { show: can(role, 'manage_media'), href: '/crm/media', icon: 'image', title: 'Media Library', desc: 'Upload & manage images' },
    { show: can(role, 'manage_users'), href: '/crm/users', icon: 'groups', title: 'Staff', desc: 'Add & manage team members' },
    { show: true, href: '/crm/settings', icon: 'settings', title: 'Settings', desc: 'Profile & preferences' },
  ].filter((a) => a.show);

  const [stats, overdue, boardLeads] = viewLeads
    ? await Promise.all([
        getLeadStats(scopeUserId),
        getOverdueFollowUps(scopeUserId),
        prisma.lead.findMany({
          where: scopeUserId ? { assignedToId: scopeUserId } : {},
          orderBy: { createdAt: 'desc' },
          take: 60,
          include: { assignedTo: { select: { name: true } } },
        }),
      ])
    : [null, [], []];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">
          {isManagerish ? 'Admin Dashboard' : 'Dashboard'}
        </h1>
        <p className="mt-2 font-mono text-sm text-on-surface-variant">
          Welcome, {session.user.name} · <span className="text-safety-orange">{ROLE_LABELS[role as Role]}</span>
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((a) => (
          <Link key={a.href} href={a.href}
            className="group flex items-start gap-4 rounded-xl border border-outline-variant bg-white p-5 transition-colors hover:border-safety-orange">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-container/15 text-primary">
              <Icon name={a.icon} />
            </span>
            <div>
              <p className="font-work font-bold text-industrial-blue">{a.title}</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">{a.desc}</p>
            </div>
            <Icon name="chevron_right" className="ml-auto text-outline-variant group-hover:text-safety-orange" />
          </Link>
        ))}
      </div>

      {/* Lead sections (only for roles with pipeline access) */}
      {viewLeads && stats && (
        <>
          <div className="mt-10">
            <StatsWidget stats={stats} />
          </div>

          <div className="mt-10">
            <h2 className="mb-3 font-work text-lg font-semibold text-industrial-blue">Pipeline Board</h2>
            <PipelineBoard leads={boardLeads} />
          </div>

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
                    <Link href={`/crm/leads/${lead.id}`}
                      className="flex items-center justify-between rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm transition-colors hover:bg-surface-container-low">
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
        </>
      )}
    </div>
  );
}
