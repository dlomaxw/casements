'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/crm/Icon';

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-[11px] font-medium uppercase tracking-wide text-on-surface-variant';

const SIZES = ['SMALL', 'MEDIUM', 'LARGE', 'COMMERCIAL'] as const;

export interface EditableLead {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  productCategory: string;
  projectSize: string | null;
  timeline: string | null;
  message: string | null;
}

/**
 * Correcting the record — a mistyped phone number used to be permanent.
 * Read-only until "Edit" is pressed, so the details are not changed by accident.
 */
export default function LeadDetailsForm({
  lead,
  categories,
}: {
  lead: EditableLead;
  categories: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: lead.fullName,
    phone: lead.phone ?? '',
    email: lead.email ?? '',
    productCategory: lead.productCategory,
    projectSize: lead.projectSize ?? '',
    timeline: lead.timeline ?? '',
    message: lead.message ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/crm/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.fullName,
        phone: form.phone || null,
        email: form.email || null,
        productCategory: form.productCategory,
        projectSize: form.projectSize || null,
        timeline: form.timeline || null,
        message: form.message || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not save those details.');
    }
  };

  const detail = (name: string, value?: string | null) => (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-wide text-outline">{name}</dt>
      <dd className="mt-0.5 text-sm text-on-surface">{value || '—'}</dd>
    </div>
  );

  if (!editing) {
    return (
      <section className="rounded-xl border border-outline-variant bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-work font-semibold text-industrial-blue">Contact details</h2>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 font-mono text-xs text-primary hover:text-safety-orange"
          >
            <Icon name="edit" className="text-[16px]" /> Edit
          </button>
        </div>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {detail('Phone', lead.phone)}
          {detail('Email', lead.email)}
          {detail(
            'Product',
            lead.productCategory === 'general-enquiry'
              ? 'General enquiry'
              : categories.find((c) => c.slug === lead.productCategory)?.title ?? lead.productCategory,
          )}
          {detail('Project size', lead.projectSize)}
          {detail('Timeline', lead.timeline)}
        </dl>
        {lead.message && (
          <div className="mt-4">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-outline">Their message</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-on-surface">{lead.message}</dd>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-primary bg-white p-6">
      <h2 className="font-work font-semibold text-industrial-blue">Edit contact details</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className={label}>Name</label>
          <input id="fullName" value={form.fullName} onChange={set('fullName')} className={field} />
        </div>
        <div>
          <label htmlFor="phone" className={label}>Phone</label>
          <input id="phone" value={form.phone} onChange={set('phone')} placeholder="0752 700 700" className={field} />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" type="email" value={form.email} onChange={set('email')} className={field} />
        </div>
        <div>
          <label htmlFor="productCategory" className={label}>Product</label>
          <select id="productCategory" value={form.productCategory} onChange={set('productCategory')} className={field}>
            <option value="general-enquiry">General enquiry</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="projectSize" className={label}>Project size</label>
          <select id="projectSize" value={form.projectSize} onChange={set('projectSize')} className={field}>
            <option value="">— Not known —</option>
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="timeline" className={label}>Timeline</label>
          <input id="timeline" value={form.timeline} onChange={set('timeline')} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className={label}>Their message</label>
          <textarea id="message" rows={3} value={form.message} onChange={set('message')} className={field} />
        </div>
      </div>

      {error && <p className="mt-3 font-mono text-xs text-error">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={save} disabled={saving}
          className="rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save details'}
        </button>
        <button type="button" onClick={() => setEditing(false)}
          className="rounded-lg border border-outline-variant px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-on-surface-variant hover:border-safety-orange">
          Cancel
        </button>
      </div>
    </section>
  );
}
