'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';

const field =
  'w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant';

export default function ProfileForm({
  userId,
  initial,
}: {
  userId: string;
  initial: { name: string; email: string; title: string | null; role: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [title, setTitle] = useState(initial.title ?? '');
  const [status, setStatus] = useState<{ ok?: string; err?: string }>({});
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({});
    setSaving(true);
    const res = await fetch(`/api/crm/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, title: title || null }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus({ ok: 'Profile saved.' });
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setStatus({ err: d.error ?? 'Could not save profile.' });
    }
  };

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-6">
      <h2 className="mb-5 flex items-center gap-2 font-work text-lg font-semibold text-industrial-blue">
        <Icon name="person" className="text-safety-orange" /> Profile Management
      </h2>

      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-outline-variant bg-primary-container/20 font-work text-xl font-bold text-primary">
          {initial.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-industrial-blue">{name || '—'}</p>
          <p className="font-mono text-xs text-on-surface-variant">{title || (initial.role === 'ADMIN' ? 'Administrator' : 'Sales Representative')}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={label}>Display Name</label>
          <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </div>
        <div>
          <label className={label}>Job Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sales Director — Kampala HQ" className={field} />
        </div>
        <div>
          <label className={label}>Email Address</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          <p className="mt-1 font-mono text-[11px] text-outline">Used to sign in to the CRM.</p>
        </div>
        {status.err && <p className="rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">{status.err}</p>}
        {status.ok && <p className="rounded-lg bg-primary-container/15 px-3 py-2 text-sm text-primary">{status.ok}</p>}
        <button type="submit" disabled={saving}
          className="rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
