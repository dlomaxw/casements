import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { assignableRoles, can } from '@/lib/roles';
import UserManager from '@/components/crm/UserManager';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

const roleCards = [
  {
    icon: 'admin_panel_settings',
    tag: 'FULL ACCESS',
    title: 'Administrator',
    border: 'border-t-primary',
    iconColor: 'text-primary',
    body: 'Full control over team management, lead assignment, all pipelines and reporting.',
    perks: ['Manage all staff', 'See & assign every lead', 'Route product categories'],
  },
  {
    icon: 'storefront',
    tag: 'SCOPED ACCESS',
    title: 'Sales Representative',
    border: 'border-t-safety-orange',
    iconColor: 'text-safety-orange',
    body: 'Customer engagement, quotation follow-up and tracking of their own regional pipeline.',
    perks: ['See only their leads', 'Update status & notes', 'Log follow-ups'],
  },
];

export default async function UsersPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_users')) redirect('/crm');
  const canAssign = assignableRoles(session.user.role);

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true, name: true, email: true, whatsappNumber: true, role: true, active: true,
      productMap: { select: { category: true } },
      _count: { select: { leads: true } },
    },
  });

  const total = users.length;
  const admins = users.filter((u) => u.role === 'ADMIN').length;
  const reps = users.filter((u) => u.role === 'SALES_REP').length;
  const activeCount = users.filter((u) => u.active).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Team Management</h1>
          <p className="mt-2 max-w-2xl font-sans text-sm text-on-surface-variant">
            Configure roles, control CRM access, and route product categories to the right sales representatives.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="col-span-1 flex items-center gap-5 rounded-xl border border-outline-variant bg-white p-6 md:col-span-2">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-container">
            <Icon name="groups" filled className="text-3xl text-white" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Total Staff</span>
            <h3 className="font-work text-2xl font-semibold text-industrial-blue">{total} Members</h3>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-white p-6">
          <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Active</span>
          <div className="mt-4 flex items-end justify-between">
            <h3 className="font-work text-2xl font-semibold text-primary">{activeCount}</h3>
            <span className="font-mono text-xs text-on-surface-variant">{admins} admin · {reps} rep</span>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-white p-6">
          <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Sales Reps</span>
          <div className="mt-4 flex items-end justify-between">
            <h3 className="font-work text-2xl font-semibold text-secondary">{reps}</h3>
            <Icon name="badge" className="text-safety-orange" />
          </div>
        </div>
      </div>

      <UserManager users={users} currentUserId={session.user.id} assignableRoles={canAssign} />

      {/* Role definitions */}
      <div className="mt-12">
        <h2 className="mb-6 font-work text-2xl font-semibold text-industrial-blue">Role Definitions</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {roleCards.map((r) => (
            <div key={r.title} className={`rounded-xl border border-outline-variant border-t-4 bg-white p-6 ${r.border}`}>
              <div className="mb-4 flex items-center justify-between">
                <Icon name={r.icon} className={`text-3xl ${r.iconColor}`} />
                <span className="font-mono text-xs tracking-wide text-on-surface-variant">{r.tag}</span>
              </div>
              <h4 className="mb-2 font-work text-lg font-bold text-industrial-blue">{r.title}</h4>
              <p className="mb-6 font-sans text-sm text-on-surface-variant">{r.body}</p>
              <ul className="space-y-3">
                {r.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    <Icon name="check_circle" className="text-[18px] text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
