'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { productCategories } from '@/lib/products';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  whatsappNumber: string | null;
  role: 'ADMIN' | 'SALES_REP';
  active: boolean;
  productMap: { category: string }[];
  _count: { leads: number };
}

const field =
  'w-full rounded-md border border-brand-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';

export default function UserManager({ users, currentUserId }: { users: StaffUser[]; currentUserId: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // ---- Create form state ----
  const [showCreate, setShowCreate] = useState(false);
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cWhatsapp, setCWhatsapp] = useState('');
  const [cRole, setCRole] = useState<'ADMIN' | 'SALES_REP'>('SALES_REP');
  const [cCategories, setCCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // ---- Edit state (one row at a time) ----
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eCategories, setECategories] = useState<string[]>([]);
  const [ePassword, setEPassword] = useState('');

  const flash = (msg: string) => {
    setNotice(msg);
    setError('');
    setTimeout(() => setNotice(''), 4000);
  };

  const api = async (url: string, method: string, body: unknown) => {
    setSaving(true);
    setError('');
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Request failed');
      return false;
    }
    router.refresh();
    return true;
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await api('/api/crm/users', 'POST', {
      name: cName,
      email: cEmail,
      password: cPassword,
      role: cRole,
      whatsappNumber: cWhatsapp || undefined,
      categories: cCategories,
    });
    if (ok) {
      setShowCreate(false);
      setCName(''); setCEmail(''); setCPassword(''); setCWhatsapp(''); setCRole('SALES_REP'); setCCategories([]);
      flash('Staff member created.');
    }
  };

  const toggleCat = (list: string[], set: (v: string[]) => void, cat: string) => {
    set(list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat]);
  };

  const startEdit = (u: StaffUser) => {
    setEditingId(u.id);
    setECategories(u.productMap.map((m) => m.category));
    setEPassword('');
  };

  const saveEdit = async (u: StaffUser) => {
    const body: Record<string, unknown> = { categories: eCategories };
    if (ePassword) body.password = ePassword;
    const ok = await api(`/api/crm/users/${u.id}`, 'PATCH', body);
    if (ok) {
      setEditingId(null);
      flash(`${u.name} updated${ePassword ? ' (password reset)' : ''}.`);
    }
  };

  const toggleActive = async (u: StaffUser) => {
    const ok = await api(`/api/crm/users/${u.id}`, 'PATCH', { active: !u.active });
    if (ok) flash(`${u.name} ${u.active ? 'deactivated' : 'reactivated'}.`);
  };

  const categoryPicker = (selected: string[], set: (v: string[]) => void) => (
    <div className="flex flex-wrap gap-1.5">
      {productCategories.map((p) => {
        const on = selected.includes(p.slug);
        return (
          <button
            key={p.slug}
            type="button"
            onClick={() => toggleCat(selected, set, p.slug)}
            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors ${
              on
                ? 'bg-brand-900 text-white ring-brand-900'
                : 'bg-white text-brand-700 ring-brand-200 hover:ring-brand-400'
            }`}
          >
            {p.shortTitle}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {notice && <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
      {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {/* Staff list */}
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-brand-100 ${!u.active ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-950">
                  {u.name}
                  {u.id === currentUserId && <span className="ml-2 text-xs font-normal text-brand-400">(you)</span>}
                </p>
                <p className="text-sm text-brand-500">
                  {u.email}{u.whatsappNumber ? ` · ${u.whatsappNumber}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-brand-50 text-brand-700'}`}>
                  {u.role === 'ADMIN' ? 'Admin' : 'Sales Rep'}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                  {u.active ? 'Active' : 'Inactive'}
                </span>
                <span className="rounded-full bg-steel-50 px-2.5 py-1 text-xs font-semibold text-brand-500">
                  {u._count.leads} leads
                </span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">Assigned categories</p>
              {editingId === u.id ? (
                <div className="mt-2 space-y-3">
                  {categoryPicker(eCategories, setECategories)}
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[200px]">
                      <label className="mb-1 block text-xs font-medium text-brand-500">Reset password (optional)</label>
                      <input type="password" value={ePassword} onChange={(e) => setEPassword(e.target.value)}
                        placeholder="New password (min 8 chars)" className={field} />
                    </div>
                    <button type="button" disabled={saving} onClick={() => saveEdit(u)}
                      className="rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-950 hover:bg-accent-400 disabled:opacity-50">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)}
                      className="rounded-md border border-brand-200 px-4 py-2 text-sm text-brand-700 hover:bg-steel-50">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {u.productMap.length === 0 ? (
                    <span className="text-xs text-brand-400">None — default rep handles these</span>
                  ) : (
                    u.productMap.map((m) => (
                      <span key={m.category} className="rounded-full bg-steel-50 px-3 py-1 text-xs text-brand-700 ring-1 ring-brand-100">
                        {productCategories.find((p) => p.slug === m.category)?.shortTitle ?? m.category}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>

            {editingId !== u.id && (
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => startEdit(u)}
                  className="rounded-md border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-steel-50">
                  Edit categories / reset password
                </button>
                {u.id !== currentUserId && (
                  <button type="button" disabled={saving} onClick={() => toggleActive(u)}
                    className="rounded-md border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-steel-50 disabled:opacity-50">
                    {u.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create user */}
      {showCreate ? (
        <form onSubmit={createUser} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
          <h2 className="font-display font-bold text-brand-950">Add staff member</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-900">Name</label>
              <input required minLength={2} value={cName} onChange={(e) => setCName(e.target.value)} className={field} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-900">Email</label>
              <input required type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} className={field} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-900">Password</label>
              <input required minLength={8} type="password" value={cPassword} onChange={(e) => setCPassword(e.target.value)}
                placeholder="Min 8 characters" className={field} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-900">WhatsApp number (optional)</label>
              <input value={cWhatsapp} onChange={(e) => setCWhatsapp(e.target.value)} placeholder="+256…" className={field} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-900">Role</label>
              <select value={cRole} onChange={(e) => setCRole(e.target.value as 'ADMIN' | 'SALES_REP')} className={field}>
                <option value="SALES_REP">Sales Rep</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-brand-900">Route these product categories to this rep</p>
            {categoryPicker(cCategories, setCCategories)}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="rounded-md bg-accent-500 px-5 py-2.5 text-sm font-semibold text-brand-950 hover:bg-accent-400 disabled:opacity-50">
              {saving ? 'Creating…' : 'Create staff member'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)}
              className="rounded-md border border-brand-200 px-5 py-2.5 text-sm text-brand-700 hover:bg-steel-50">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setShowCreate(true)}
          className="rounded-md bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
          + Add staff member
        </button>
      )}
    </div>
  );
}
