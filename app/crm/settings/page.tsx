import { requireSession } from '@/lib/session';
import PasswordForm from '@/components/crm/PasswordForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await requireSession();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Account Settings</h1>
      <p className="mt-2 font-mono text-sm text-on-surface-variant">
        {session.user.email} · {session.user.role === 'ADMIN' ? 'Administrator' : 'Sales Representative'}
      </p>
      <div className="mt-8">
        <PasswordForm userId={session.user.id} />
      </div>
    </div>
  );
}
