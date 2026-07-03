'use client';

import { useState } from 'react';

const field =
  'w-full rounded-md border border-brand-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';

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
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
      <h2 className="font-display font-bold text-brand-950">Change password</h2>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Current password</label>
        <input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={field} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">New password</label>
        <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 characters" className={field} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Confirm new password</label>
        <input required minLength={8} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
      </div>
      {status.err && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{status.err}</p>}
      {status.ok && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{status.ok}</p>}
      <button type="submit" disabled={saving}
        className="rounded-md bg-accent-500 px-5 py-2.5 text-sm font-semibold text-brand-950 hover:bg-accent-400 disabled:opacity-50">
        {saving ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}
