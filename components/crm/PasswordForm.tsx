'use client';

import { useState } from 'react';

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant';

export default function PasswordForm({ userId }: { userId: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<{ ok?: string; err?: string }>({});
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({});
    if (password !== confirm) {
      setStatus({ err: 'New passwords do not match.' });
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/crm/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, password }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus({ ok: 'Password changed.' });
      setCurrentPassword(''); setPassword(''); setConfirm('');
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus({ err: data.error ?? 'Could not change password.' });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-outline-variant bg-white p-6">
      <h2 className="font-work font-semibold text-industrial-blue">Change password</h2>
      <div>
        <label className={label}>Current password</label>
        <input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={field} />
      </div>
      <div>
        <label className={label}>New password</label>
        <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" className={field} />
      </div>
      <div>
        <label className={label}>Confirm new password</label>
        <input required minLength={8} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
      </div>
      {status.err && <p className="rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">{status.err}</p>}
      {status.ok && <p className="rounded-lg bg-primary-container/15 px-3 py-2 text-sm text-primary">{status.ok}</p>}
      <button type="submit" disabled={saving}
        className="rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
        {saving ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}
