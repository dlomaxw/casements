'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/crm/Icon';
import {
  BUDGET_BANDS,
  BUDGET_LABELS,
  DECISION_LABELS,
  DECISION_READINESS,
  URGENCIES,
  URGENCY_LABELS,
  dateInDays,
  missingQualification,
} from '@/lib/pipeline';

interface Colleague {
  id: string;
  name: string;
  role: string;
}

export interface HandoverLead {
  id: string;
  status: string;
  contactAttempts: number;
  firstResponseAt: string | null;
  qualNeed: string | null;
  qualLocation: string | null;
  qualBudget: string | null;
  qualUrgency: string | null;
  qualDecision: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
}

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-[11px] font-medium uppercase tracking-wide text-on-surface-variant';

/**
 * Verify a lead and hand it to a colleague — in one action.
 *
 * Every website enquiry lands with the front-line rep. They call it, establish
 * that it is real work, and pass it on. Splitting that across three separate
 * saves (log the call, fill qualification, move the stage, then reassign) meant
 * the handover button was never reachable in practice, so this panel does the
 * whole thing: it asks only for what is still missing and submits it together.
 *
 * The verification requirement is unchanged and still enforced server-side —
 * this makes satisfying it a single step instead of a hunt.
 */
export default function HandoverForm({
  lead,
  colleagues,
}: {
  lead: HandoverLead;
  colleagues: Colleague[];
}) {
  const router = useRouter();

  const needsContact = !lead.firstResponseAt && lead.contactAttempts === 0;
  const missing = missingQualification(lead);
  const needsQualification = missing.length > 0;
  const needsStage = !['QUALIFIED', 'SITE_ASSESSED', 'QUOTED'].includes(lead.status);
  const verified = !needsContact && !needsQualification && !needsStage;

  const [to, setTo] = useState('');
  const [note, setNote] = useState('');
  const [spoke, setSpoke] = useState(!needsContact);
  const [qualNeed, setQualNeed] = useState(lead.qualNeed ?? '');
  const [qualLocation, setQualLocation] = useState(lead.qualLocation ?? '');
  const [qualBudget, setQualBudget] = useState(lead.qualBudget ?? '');
  const [qualUrgency, setQualUrgency] = useState(lead.qualUrgency ?? '');
  const [qualDecision, setQualDecision] = useState(lead.qualDecision ?? '');
  const [nextAction, setNextAction] = useState(lead.nextAction ?? 'First follow-up after handover');
  const [nextActionDate, setNextActionDate] = useState(lead.nextActionDate?.slice(0, 10) ?? dateInDays(2));

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);

  const handOver = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!to) {
      setErrors(['Choose the colleague who is taking this lead.']);
      return;
    }
    if (!spoke) {
      setErrors(['Confirm you have spoken to them — a lead is only handed over once it is verified.']);
      return;
    }

    setSaving(true);

    // One request does the lot: record the contact if it was never logged,
    // save the qualification answers, move the lead to Qualified, set an
    // opening action for the person receiving it, and change the owner.
    const body: Record<string, unknown> = {
      assignedToId: to,
      qualNeed,
      qualLocation,
      qualBudget,
      qualUrgency,
      qualDecision,
      nextAction,
      nextActionDate,
      ...(needsStage ? { status: 'QUALIFIED' } : {}),
      ...(needsContact ? { contact: { outcome: 'SPOKE', note: 'Verified before handover' } } : {}),
      ...(note.trim() ? { notes: `Handover note: ${note.trim()}` } : {}),
    };

    const res = await fetch(`/api/crm/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setErrors(data.errors ?? [data.error ?? 'Could not hand this lead over.']);
      return;
    }

    // The lead now belongs to somebody else and has left this rep's view, so
    // send them back to the list rather than to a 404.
    setDone(colleagues.find((c) => c.id === to)?.name ?? 'your colleague');
    setTimeout(() => {
      router.push('/crm/leads');
      router.refresh();
    }, 1500);
  };

  if (done) {
    return (
      <section className="rounded-xl border border-primary bg-primary-container/10 p-6">
        <h2 className="flex items-center gap-2 font-work font-semibold text-industrial-blue">
          <Icon name="check_circle" className="text-primary" />
          Handed over to {done}
        </h2>
        <p className="mt-2 font-sans text-xs text-on-surface-variant">
          It is now in their pipeline and has left yours. Taking you back to your leads…
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border-2 border-primary/40 bg-white p-6">
      <h2 className="flex items-center gap-2 font-work font-semibold text-industrial-blue">
        <Icon name="forward_to_inbox" className="text-primary" />
        {verified ? 'Hand over' : 'Verify & hand over'}
      </h2>
      <p className="mt-1 font-sans text-xs text-on-surface-variant">
        {verified
          ? 'This lead is verified. Choose who takes it from here.'
          : 'Confirm this is real work, then pass it to the right colleague.'}
      </p>

      <form onSubmit={handOver} className="mt-4 space-y-4">
        {/* Who takes it — always visible, so the action is never hidden */}
        <div>
          <label htmlFor="handover-to" className={label}>
            Assign to<span className="text-safety-orange"> *</span>
          </label>
          <select id="handover-to" value={to} onChange={(e) => setTo(e.target.value)} className={field}>
            <option value="">— Choose a colleague —</option>
            {colleagues.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Confirm it is real */}
        <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
          <input
            type="checkbox"
            checked={spoke}
            onChange={(e) => setSpoke(e.target.checked)}
            className="mt-0.5"
          />
          <span className="font-sans text-xs text-on-surface">
            I have spoken to this customer and confirm this is a real enquiry.
            {needsContact && (
              <span className="mt-0.5 block font-mono text-[11px] text-on-surface-variant">
                This will be recorded as a contact attempt on the lead.
              </span>
            )}
          </span>
        </label>

        {/* Only what is still missing */}
        {needsQualification && (
          <div className="space-y-3 rounded-lg border border-safety-orange/40 bg-safety-orange/5 p-3">
            <p className="font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">
              Qualification — {missing.length} still needed
            </p>
            {!lead.qualNeed && (
              <div>
                <label htmlFor="h-need" className={label}>What do they need?</label>
                <input id="h-need" value={qualNeed} onChange={(e) => setQualNeed(e.target.value)}
                  placeholder="24 casement windows for a new home" className={field} />
              </div>
            )}
            {!lead.qualLocation && (
              <div>
                <label htmlFor="h-loc" className={label}>Site location</label>
                <input id="h-loc" value={qualLocation} onChange={(e) => setQualLocation(e.target.value)}
                  placeholder="Najjera, Wakiso" className={field} />
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              {!lead.qualBudget && (
                <div>
                  <label htmlFor="h-budget" className={label}>Budget</label>
                  <select id="h-budget" value={qualBudget} onChange={(e) => setQualBudget(e.target.value)} className={field}>
                    <option value="">—</option>
                    {BUDGET_BANDS.map((b) => <option key={b} value={b}>{BUDGET_LABELS[b]}</option>)}
                  </select>
                </div>
              )}
              {!lead.qualUrgency && (
                <div>
                  <label htmlFor="h-urg" className={label}>Urgency</label>
                  <select id="h-urg" value={qualUrgency} onChange={(e) => setQualUrgency(e.target.value)} className={field}>
                    <option value="">—</option>
                    {URGENCIES.map((u) => <option key={u} value={u}>{URGENCY_LABELS[u]}</option>)}
                  </select>
                </div>
              )}
              {!lead.qualDecision && (
                <div>
                  <label htmlFor="h-dec" className={label}>Decision</label>
                  <select id="h-dec" value={qualDecision} onChange={(e) => setQualDecision(e.target.value)} className={field}>
                    <option value="">—</option>
                    {DECISION_READINESS.map((d) => <option key={d} value={d}>{DECISION_LABELS[d]}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What the receiving colleague should do */}
        <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
          <div>
            <label htmlFor="h-next" className={label}>What should they do next?</label>
            <input id="h-next" value={nextAction} onChange={(e) => setNextAction(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="h-date" className={label}>By</label>
            <input id="h-date" type="date" value={nextActionDate}
              onChange={(e) => setNextActionDate(e.target.value)} className={field} />
          </div>
        </div>

        <div>
          <label htmlFor="h-note" className={label}>Note for them</label>
          <textarea id="h-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Spoke to the site engineer. Ready to start next month." className={field} />
        </div>

        {errors.length > 0 && (
          <ul className="space-y-1 rounded-lg border border-error bg-error-container/30 p-3">
            {errors.map((e) => (
              <li key={e} className="flex gap-2 font-sans text-xs text-on-error-container">
                <Icon name="error" className="text-[16px] shrink-0 text-error" />
                {e}
              </li>
            ))}
          </ul>
        )}

        <button type="submit" disabled={saving}
          className="w-full rounded-lg bg-primary px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
          {saving ? 'Handing over…' : verified ? 'Hand over this lead' : 'Verify & hand over'}
        </button>
        <p className="text-center font-mono text-[11px] text-on-surface-variant">
          The lead moves to their pipeline and leaves yours.
        </p>
      </form>
    </section>
  );
}
