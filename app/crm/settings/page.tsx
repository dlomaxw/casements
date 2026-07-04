import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import ProfileForm from '@/components/crm/ProfileForm';
import NotificationsForm from '@/components/crm/NotificationsForm';
import PasswordForm from '@/components/crm/PasswordForm';
import Icon from '@/components/crm/Icon';
import { can, ROLE_LABELS, type Role } from '@/lib/roles';

export const dynamic = 'force-dynamic';

const integrations = [
  {
    icon: 'database', title: 'CRM Database', status: 'CONNECTED',
    desc: 'Neon Postgres — leads, staff and activity are stored and live.',
    action: 'Connected', connected: true,
  },
  {
    icon: 'mail', title: 'Email Notifications', status: 'PENDING',
    desc: 'Connect a Resend API key to email staff and auto-reply to clients.',
    action: 'Set up', connected: false,
  },
  {
    icon: 'chat', title: 'WhatsApp Alerts', status: 'PENDING',
    desc: 'Meta WhatsApp Business API for large/commercial lead alerts.',
    action: 'Set up', connected: false,
  },
];

export default async function SettingsPage() {
  const session = await requireSession();
  const isAdmin = can(session.user.role, 'manage_users');

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, title: true, role: true, notifyEmail: true, notifyDesktop: true, notifyInventory: true },
  });
  if (!me) return null;

  const team = isAdmin
    ? await prisma.user.findMany({
        orderBy: { name: 'asc' },
        take: 5,
        select: { id: true, name: true, email: true, role: true, active: true, _count: { select: { leads: true } } },
      })
    : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Settings Dashboard</h1>
        <p className="mt-2 font-sans text-sm text-on-surface-variant">
          Manage your account preferences and team configuration for Casements Africa CRM.
        </p>
      </div>

      {/* Profile + Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ProfileForm userId={me.id} initial={{ name: me.name, email: me.email, title: me.title, role: me.role }} />
          <PasswordForm userId={me.id} />
        </div>
        <NotificationsForm
          userId={me.id}
          initial={{ notifyEmail: me.notifyEmail, notifyDesktop: me.notifyDesktop, notifyInventory: me.notifyInventory }}
        />
      </div>

      {/* Team Permissions (admin only) */}
      {isAdmin && (
        <div className="mt-6 overflow-hidden rounded-xl border border-outline-variant bg-white">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
            <h2 className="flex items-center gap-2 font-work text-lg font-semibold text-industrial-blue">
              <Icon name="shield_person" className="text-safety-orange" /> Team Permissions
            </h2>
            <Link href="/crm/users" className="rounded-lg border border-outline-variant px-4 py-2 font-mono text-xs font-medium text-industrial-blue hover:border-safety-orange hover:text-safety-orange">
              Manage All Users
            </Link>
          </div>
          <table className="w-full border-collapse text-left">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Team Member</th>
                <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Role</th>
                <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Leads</th>
                <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Status</th>
              </tr>
            </thead>
            <tbody>
              {team.map((u) => (
                <tr key={u.id} className="zebra-stripe border-b border-outline-variant/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/30 bg-primary-container/20 font-mono text-[11px] font-bold text-primary">
                        {u.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-industrial-blue">{u.name}</p>
                        <p className="font-mono text-[11px] text-on-surface-variant">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-on-surface">{ROLE_LABELS[u.role as Role]}</td>
                  <td className="p-4 font-mono text-xs text-on-surface-variant">{u._count.leads}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold ${u.active ? 'bg-primary-container/15 text-primary' : 'bg-error-container text-on-error-container'}`}>
                      {u.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* System Integrations */}
      <div className="mt-6 rounded-xl border border-outline-variant bg-white p-6">
        <h2 className="mb-5 flex items-center gap-2 font-work text-lg font-semibold text-industrial-blue">
          <Icon name="hub" className="text-safety-orange" /> System Integrations
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {integrations.map((it) => (
            <div key={it.title} className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-low p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-outline-variant bg-white">
                  <Icon name={it.icon} className="text-industrial-blue" />
                </div>
                <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide ${it.connected ? 'bg-primary-container/15 text-primary' : 'bg-secondary-container text-on-secondary-container'}`}>
                  {it.status}
                </span>
              </div>
              <h3 className="mt-4 font-work font-bold text-industrial-blue">{it.title}</h3>
              <p className="mt-1 flex-1 text-xs text-on-surface-variant">{it.desc}</p>
              {it.connected ? (
                <span className="mt-4 flex items-center justify-center gap-1 rounded-lg border border-outline-variant py-2 font-mono text-xs font-medium text-on-surface-variant">
                  <Icon name="check_circle" className="text-[16px] text-primary" /> {it.action}
                </span>
              ) : (
                <span className="mt-4 rounded-lg bg-industrial-blue py-2 text-center font-mono text-xs font-semibold text-white">
                  {it.action}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
