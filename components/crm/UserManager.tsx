'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { productCategories } from '@/lib/products';
import Icon from './Icon';

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
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant';

export default function UserManager({ users, currentUserId }: { users: StaffUser[]; currentUserId: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cWhatsapp, setCWhatsapp] = useState('');
  const [cRole, setCRole] = useState<'ADMIN' | 'SALES_REP'>('SALES_REP');
  const [cCategories, setCCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

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
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
      name: cName, email: cEmail, password: cPassword, role: cRole,
      whatsappNumber: cWhatsapp || undefined, categories: cCategories,
    });
    if (ok) {
      setShowCreate(false);
      setCName(''); setCEmail(''); setCPassword(''); setCWhatsapp(''); setCRole('SALES_REP'); setCCategories([]);
      flash('Staff member created.');
    }
  };

  const toggleCat = (list: string[], set: (v: string[]) => void, cat: string) =>
    set(list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat]);

  const startEdit = (u: StaffUser) => {
    setEditingId(u.id);
    setECategories(u.productMap.map((m) => m.category));
    setEPassword('');
  };

  const saveEdit = async (u: StaffUser) => {
    const body: Record<string, unknown> = { categories: eCategories };
    if (ePassword) body.password = ePassword;
    const ok = await api(`/api/crm/users/${u.id}`, 'PATCH', body);
    if (ok) { setEditingId(null); flash(`${u.name} updated${ePassword ? ' (password reset)' : ''}.`); }
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
          <button key={p.slug} type="button" onClick={() => toggleCat(selected, set, p.slug)}
            className={`rounded-full px-3 py-1 font-mono text-[11px] font-medium ring-1 transition-colors ${
              on ? 'bg-primary text-white ring-primary' : 'bg-white text-on-surface-variant ring-outline-variant hover:ring-primary'
            }`}>
            {p.shortTitle}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {notice && (
        <p className="flex items-center gap-2 rounded-lg bg-primary-container/15 px-4 py-3 text-sm text-primary">
          <Icon name="check_circle" className="text-[18px]" />{notice}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-2 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">
          <Icon name="error" className="text-[18px]" />{error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-white">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <h2 className="font-work font-semibold text-industrial-blue">Staff Members</h2>
          {!showCreate && (
            <button type="button" onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90">
              <Icon name="person_add" className="text-[18px]" /> Add staff
            </button>
          )}
        </div>

        <div className="divide-y divide-outline-variant/30">
          {users.map((u) => (
            <div key={u.id} className={`p-5 ${!u.active ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/30 bg-primary-container/20 font-mono text-xs font-bold text-primary">
                    {u.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-industrial-blue">
                      {u.name}{u.id === currentUserId && <span className="ml-2 font-mono text-xs font-normal text-outline">(you)</span>}
                    </p>
                    <p className="font-mono text-[11px] text-on-surface-variant">
                      {u.email}{u.whatsappNumber ? ` · ${u.whatsappNumber}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide ${u.role === 'ADMIN' ? 'bg-primary-container/15 text-primary' : 'bg-surface-container-highest text-industrial-blue'}`}>
                    {u.role === 'ADMIN' ? 'Administrator' : 'Sales Rep'}
                  </span>
                  <span className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-[11px] font-semibold ${u.active ? 'text-primary' : 'text-error'}`}>
                    <span className={`h-2 w-2 rounded-full ${u.active ? 'bg-primary' : 'bg-error'}`} />
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="rounded bg-surface-container-high px-2.5 py-1 font-mono text-[11px] font-semibold text-on-surface-variant">
                    {u._count.leads} leads
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <p className="font-mono text-[11px] uppercase tracking-wide text-outline">Assigned categories</p>
                {editingId === u.id ? (
                  <div className="mt-2 space-y-3">
                    {categoryPicker(eCategories, setECategories)}
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="min-w-[200px]">
                        <label className={label}>Reset password (optional)</label>
                        <input type="password" value={ePassword} onChange={(e) => setEPassword(e.target.value)} placeholder="New password (min 8)" className={field} />
                      </div>
                      <button type="button" disabled={saving} onClick={() => saveEdit(u)}
                        className="rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)}
                        className="rounded-lg border border-outline-variant px-4 py-2 font-mono text-xs text-on-surface-variant hover:bg-surface-container-low">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {u.productMap.length === 0 ? (
                      <span className="font-mono text-[11px] text-outline">None — default rep handles these</span>
                    ) : (
                      u.productMap.map((m) => (
                        <span key={m.category} className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 font-mono text-[11px] text-on-surface-variant">
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
                    className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 font-mono text-[11px] font-medium text-on-surface-variant hover:bg-surface-container-low">
                    <Icon name="edit" className="text-[16px]" /> Edit / reset password
                  </button>
                  {u.id !== currentUserId && (
                    <button type="button" disabled={saving} onClick={() => toggleActive(u)}
                      className="rounded-lg border border-outline-variant px-3 py-1.5 font-mono text-[11px] font-medium text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50">
                      {u.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <form onSubmit={createUser} className="space-y-4 rounded-xl border border-outline-variant bg-white p-6">
          <h2 className="font-work font-semibold text-industrial-blue">Add staff member</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={label}>Name</label><input required minLength={2} value={cName} onChange={(e) => setCName(e.target.value)} className={field} /></div>
            <div><label className={label}>Email</label><input required type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} className={field} /></div>
            <div><label className={label}>Password</label><input required minLength={8} type="password" value={cPassword} onChange={(e) => setCPassword(e.target.value)} placeholder="Min 8 characters" className={field} /></div>
            <div><label className={label}>WhatsApp (optional)</label><input value={cWhatsapp} onChange={(e) => setCWhatsapp(e.target.value)} placeholder="+256…" className={field} /></div>
            <div>
              <label className={label}>Role</label>
              <select value={cRole} onChange={(e) => setCRole(e.target.value as 'ADMIN' | 'SALES_REP')} className={field}>
                <option value="SALES_REP">Sales Rep</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant">Route these categories to this rep</p>
            {categoryPicker(cCategories, setCCategories)}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
              {saving ? 'Creating…' : 'Create staff member'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-outline-variant px-5 py-2.5 font-mono text-xs text-on-surface-variant hover:bg-surface-container-low">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
