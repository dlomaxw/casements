import { requireSession } from '@/lib/session';
import PasswordForm from '@/components/crm/PasswordForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await requireSession();

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-brand-950">Account Settings</h1>
      <p className="mt-1 text-sm text-brand-500">
        Signed in as {session.user.email} ({session.user.role === 'ADMIN' ? 'Admin' : 'Sales Rep'})
      </p>
      <div className="mt-8">
        <PasswordForm userId={session.user.id} />
      </div>
    </div>
  );
}
