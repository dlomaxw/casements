'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/crm/Icon';
import {
  BUDGET_BANDS,
  BUDGET_LABELS,
  DECISION_LABELS,
  DECISION_READINESS,
  MANUAL_SOURCES,
  SOURCE_LABELS,
  URGENCIES,
  URGENCY_LABELS,
  dateInDays,
} from '@/lib/pipeline';

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-[11px] font-medium uppercase tracking-wide text-on-surface-variant';
const req = <span className="text-safety-orange"> *</span>;

interface Duplicate {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  assignedTo: string | null;
}

/**
 * Entering a phone, walk-in or WhatsApp enquiry by hand.
 *
 * The five pipeline fields are part of the form, not an afterthought: a lead
 * cannot be created without a source, an owner and a first action. The
 * qualification block is offered straight away because the person filling this
 * in has usually just put the phone down.
 */
export default function NewLeadForm({
  reps,
  categories,
  defaultOwnerId,
  canAssign,
}: {
  reps: { id: string; name: string }[];
  categories: { slug: string; title: string }[];
  defaultOwnerId: string;
  canAssign: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    productCategory: categories[0]?.slug ?? 'general-enquiry',
    projectSize: '',
    source: 'PHONE_CALL',
    sourceDetail: '',
    assignedToId: defaultOwnerId,
    nextAction: 'Call back to qualify',
    nextActionDate: dateInDays(1),
    message: '',
    qualNeed: '',
    qualLocation: '',
    qualBudget: '',
    qualUrgency: '',
    qualDecision: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<Duplicate[] | null>(null);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (ignoreDuplicates: boolean) => {
    setSaving(true);
    setError(null);
    const res = await fetch('/api/crm/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, projectSize: form.projectSize || undefined, ignoreDuplicates }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (res.ok) {
      router.push(`/crm/leads/${data.lead.id}`);
      router.refresh();
      return;
    }
    if (res.status === 409 && data.duplicates) {
      setDuplicates(data.duplicates);
      return;
    }
    setError(data.error ?? 'Could not save this lead.');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="space-y-6"
    >
      {/* Who */}
      <section className="rounded-xl border border-outline-variant bg-white p-6">
        <h2 className="font-work font-semibold text-industrial-blue">Who is it?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className={label}>Name{req}</label>
            <input id="fullName" required value={form.fullName} onChange={set('fullName')} className={field} />
          </div>
          <div>
            <label htmlFor="phone" className={label}>Phone</label>
            <input id="phone" value={form.phone} onChange={set('phone')} placeholder="0752 700 700" className={field} />
          </div>
          <div>
            <label htmlFor="email" className={label}>Email</label>
            <input id="email" type="email" value={form.email} onChange={set('email')} className={field} />
          </div>
        </div>
        <p className="mt-2 font-mono text-[11px] text-on-surface-variant">
          A phone number or an email address is required — one of the two.
        </p>
      </section>

      {/* What */}
      <section className="rounded-xl border border-outline-variant bg-white p-6">
        <h2 className="font-work font-semibold text-industrial-blue">What do they want?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="productCategory" className={label}>Product{req}</label>
            <select id="productCategory" value={form.productCategory} onChange={set('productCategory')} className={field}>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
              <option value="general-enquiry">General enquiry</option>
            </select>
          </div>
          <div>
            <label htmlFor="projectSize" className={label}>Project size</label>
            <select id="projectSize" value={form.projectSize} onChange={set('projectSize')} className={field}>
              <option value="">— Not known —</option>
              {['SMALL', 'MEDIUM', 'LARGE', 'COMMERCIAL'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="message" className={label}>What they said</label>
            <textarea id="message" rows={3} value={form.message} onChange={set('message')} className={field}
              placeholder="Walked in asking about sliding doors for a shop front on Luwum Street…" />
          </div>
        </div>
      </section>

      {/* Pipeline — the mandatory part */}
      <section className="rounded-xl border-2 border-safety-orange/50 bg-safety-orange/5 p-6">
        <h2 className="font-work font-semibold text-industrial-blue">Pipeline</h2>
        <p className="mt-1 font-sans text-xs text-on-surface-variant">
          Every lead needs a source, an owner and a first action. This is what keeps the pipeline honest.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="source" className={label}>Where did it come from?{req}</label>
            <select id="source" required value={form.source} onChange={set('source')} className={field}>
              {MANUAL_SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sourceDetail" className={label}>Source detail</label>
            <input id="sourceDetail" value={form.sourceDetail} onChange={set('sourceDetail')}
              placeholder="Referred by Eng. Mukasa" className={field} />
          </div>
          <div>
            <label htmlFor="assignedToId" className={label}>Owner{req}</label>
            <select id="assignedToId" required value={form.assignedToId} onChange={set('assignedToId')}
              disabled={!canAssign} className={`${field} disabled:bg-surface-container-low`}>
              {reps.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="nextActionDate" className={label}>Next action date{req}</label>
            <input id="nextActionDate" type="date" required value={form.nextActionDate}
              onChange={set('nextActionDate')} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="nextAction" className={label}>Next action{req}</label>
            <input id="nextAction" required value={form.nextAction} onChange={set('nextAction')}
              placeholder="Call back to confirm the site address" className={field} />
            <div className="mt-2 flex flex-wrap gap-2">
              {[['Today', 0], ['Tomorrow', 1], ['In 3 days', 3], ['Next week', 7]].map(([t, d]) => (
                <button key={t as string} type="button"
                  onClick={() => setForm((f) => ({ ...f, nextActionDate: dateInDays(d as number) }))}
                  className="rounded-lg border border-outline-variant bg-white px-2.5 py-1 font-mono text-[11px] text-on-surface-variant hover:border-safety-orange">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Qualification — optional here, mandatory to reach QUALIFIED */}
      <section className="rounded-xl border border-outline-variant bg-white p-6">
        <h2 className="font-work font-semibold text-industrial-blue">Qualification</h2>
        <p className="mt-1 font-sans text-xs text-on-surface-variant">
          Fill in whatever you already know. All five are required before the lead can be marked qualified.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="qualNeed" className={label}>What do they need?</label>
            <input id="qualNeed" value={form.qualNeed} onChange={set('qualNeed')} className={field} />
          </div>
          <div>
            <label htmlFor="qualLocation" className={label}>Site location</label>
            <input id="qualLocation" value={form.qualLocation} onChange={set('qualLocation')}
              placeholder="Najjera, Wakiso" className={field} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="qualBudget" className={label}>Budget</label>
              <select id="qualBudget" value={form.qualBudget} onChange={set('qualBudget')} className={field}>
                <option value="">—</option>
                {BUDGET_BANDS.map((b) => <option key={b} value={b}>{BUDGET_LABELS[b]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="qualUrgency" className={label}>Urgency</label>
              <select id="qualUrgency" value={form.qualUrgency} onChange={set('qualUrgency')} className={field}>
                <option value="">—</option>
                {URGENCIES.map((u) => <option key={u} value={u}>{URGENCY_LABELS[u]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="qualDecision" className={label}>Decision</label>
              <select id="qualDecision" value={form.qualDecision} onChange={set('qualDecision')} className={field}>
                <option value="">—</option>
                {DECISION_READINESS.map((d) => <option key={d} value={d}>{DECISION_LABELS[d]}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Duplicate warning */}
      {duplicates && duplicates.length > 0 && (
        <section className="rounded-xl border-2 border-safety-orange bg-safety-orange/10 p-6">
          <h2 className="flex items-center gap-2 font-work font-semibold text-industrial-blue">
            <Icon name="content_copy" className="text-safety-orange" />
            We may already have this person
          </h2>
          <ul className="mt-3 space-y-2">
            {duplicates.map((d) => (
              <li key={d.id} className="rounded-lg border border-outline-variant bg-white px-3 py-2">
                <Link href={`/crm/leads/${d.id}`} className="font-semibold text-industrial-blue hover:text-safety-orange">
                  {d.fullName}
                </Link>
                <span className="ml-2 font-mono text-[11px] text-on-surface-variant">
                  {d.phone ?? d.email ?? '—'} · {d.status} · {new Date(d.createdAt).toLocaleDateString()}
                  {d.assignedTo ? ` · ${d.assignedTo}` : ''}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => submit(true)} disabled={saving}
              className="rounded-lg bg-safety-orange px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save anyway — this is a different person'}
            </button>
            <Link href={`/crm/leads/${duplicates[0].id}`}
              className="rounded-lg border border-outline-variant bg-white px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-industrial-blue hover:border-safety-orange">
              Open the existing lead instead
            </Link>
          </div>
        </section>
      )}

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-error bg-error-container/30 px-4 py-3 font-sans text-sm text-on-error-container">
          <Icon name="error" className="text-error" /> {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving}
          className="rounded-lg bg-primary px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
          {saving ? 'Saving…' : 'Create lead'}
        </button>
        <Link href="/crm/leads"
          className="rounded-lg border border-outline-variant bg-white px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-on-surface-variant hover:border-safety-orange">
          Cancel
        </Link>
      </div>
    </form>
  );
}
