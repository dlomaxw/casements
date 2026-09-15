'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/crm/Icon';
import {
  BUDGET_BANDS,
  BUDGET_LABELS,
  DECISION_LABELS,
  DECISION_READINESS,
  LEAD_SOURCES,
  LOSS_REASON_LABELS,
  SOURCE_LABELS,
  STAGE_HELP,
  STAGE_LABELS,
  URGENCIES,
  URGENCY_LABELS,
  allowedNextStages,
  dateInDays,
  isClosed,
  missingQualification,
  needsLossReason,
  reasonsForStage,
  requiresDealValue,
  requiresQualification,
  type Stage,
} from '@/lib/pipeline';

export interface PipelineLead {
  id: string;
  status: string;
  source: string | null;
  sourceDetail: string | null;
  assignedToId: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  lossReason: string | null;
  lossDetail: string | null;
  qualNeed: string | null;
  qualLocation: string | null;
  qualBudget: string | null;
  qualUrgency: string | null;
  qualDecision: string | null;
  dealValue: string | null;
  quotationRef: string | null;
  quotationUrl: string | null;
}

interface Rep {
  id: string;
  name: string;
  role: string;
}

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-[11px] font-medium uppercase tracking-wide text-on-surface-variant';
const required = <span className="text-safety-orange"> *</span>;

/**
 * The one place a lead is moved through the pipeline.
 *
 * The form is deliberately not free-form: the fields the business needs appear
 * and become mandatory as the chosen stage demands them, so a lead cannot be
 * left in an undefined state. The same rules are re-checked on the server —
 * this only makes the compliant path the quickest one.
 */
export default function PipelineForm({
  lead,
  reps,
  canAssign,
}: {
  lead: PipelineLead;
  reps: Rep[];
  canAssign: boolean;
}) {
  const router = useRouter();
  const [stage, setStage] = useState(lead.status);
  const [owner, setOwner] = useState(lead.assignedToId ?? '');
  const [source, setSource] = useState(lead.source ?? '');
  const [sourceDetail, setSourceDetail] = useState(lead.sourceDetail ?? '');
  const [nextAction, setNextAction] = useState(lead.nextAction ?? '');
  const [nextActionDate, setNextActionDate] = useState(lead.nextActionDate?.slice(0, 10) ?? '');
  const [lossReason, setLossReason] = useState(lead.lossReason ?? '');
  const [lossDetail, setLossDetail] = useState(lead.lossDetail ?? '');
  const [qualNeed, setQualNeed] = useState(lead.qualNeed ?? '');
  const [qualLocation, setQualLocation] = useState(lead.qualLocation ?? '');
  const [qualBudget, setQualBudget] = useState(lead.qualBudget ?? '');
  const [qualUrgency, setQualUrgency] = useState(lead.qualUrgency ?? '');
  const [qualDecision, setQualDecision] = useState(lead.qualDecision ?? '');
  const [dealValue, setDealValue] = useState(lead.dealValue ?? '');
  const [quotationRef, setQuotationRef] = useState(lead.quotationRef ?? '');
  const [note, setNote] = useState('');

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const stages = useMemo(() => allowedNextStages(lead.status as Stage), [lead.status]);
  const closing = isClosed(stage);
  const showLoss = needsLossReason(stage);
  const showQualification = requiresQualification(stage);
  const showValue = requiresDealValue(stage);

  const stillMissing = missingQualification({ qualNeed, qualLocation, qualBudget, qualUrgency, qualDecision });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    setSaved(false);

    const body: Record<string, unknown> = {
      status: stage,
      source: source || undefined,
      sourceDetail: sourceDetail || null,
      assignedToId: canAssign ? owner || null : undefined,
      nextAction: closing ? null : nextAction,
      nextActionDate: closing ? null : nextActionDate || null,
      lossReason: showLoss ? lossReason || null : null,
      lossDetail: showLoss ? lossDetail || null : null,
      qualNeed: qualNeed || null,
      qualLocation: qualLocation || null,
      qualBudget: qualBudget || null,
      qualUrgency: qualUrgency || null,
      qualDecision: qualDecision || null,
      dealValue: dealValue === '' ? null : Number(String(dealValue).replace(/[^\d]/g, '')),
      quotationRef: quotationRef || null,
    };
    if (note.trim()) body.notes = note.trim();

    const res = await fetch(`/api/crm/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);

    if (res.ok) {
      setSaved(true);
      setNote('');
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setErrors(data.errors ?? [data.error ?? 'Could not save the lead.']);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-outline-variant bg-white p-6">
      <div>
        <h2 className="font-work font-semibold text-industrial-blue">Update lead</h2>
        <p className="mt-1 font-mono text-[11px] text-on-surface-variant">
          Fields marked <span className="text-safety-orange">*</span> must be filled before this lead can be saved.
        </p>
      </div>

      {/* Stage */}
      <div>
        <span className={label}>Stage{required}</span>
        <div className="flex flex-wrap gap-1.5">
          {stages.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStage(s)}
              className={`rounded-lg px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                stage === s
                  ? s === 'WON'
                    ? 'bg-primary text-white'
                    : s === 'LOST' || s === 'DISQUALIFIED'
                      ? 'bg-error text-white'
                      : 'bg-industrial-blue text-white'
                  : 'border border-outline-variant text-on-surface-variant hover:border-safety-orange'
              }`}
            >
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>
        <p className="mt-2 font-sans text-xs text-on-surface-variant">{STAGE_HELP[stage as Stage]}</p>
      </div>

      {/* Owner */}
      <div>
        <label htmlFor="owner" className={label}>Owner{required}</label>
        {canAssign ? (
          <select id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} className={field}>
            <option value="">— Choose an owner —</option>
            {reps.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        ) : (
          <p className="rounded-lg bg-surface-container-low px-3 py-2.5 text-sm text-on-surface">
            {reps.find((r) => r.id === owner)?.name ?? 'You'}
          </p>
        )}
      </div>

      {/* Source */}
      <div>
        <label htmlFor="source" className={label}>Source{required}</label>
        <select id="source" value={source} onChange={(e) => setSource(e.target.value)} className={field}>
          <option value="">— Choose a source —</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
          ))}
        </select>
        <input
          value={sourceDetail}
          onChange={(e) => setSourceDetail(e.target.value)}
          placeholder="Campaign, referrer's name, exhibition… (optional)"
          className={`${field} mt-2`}
        />
      </div>

      {/* Next action — while the lead is open */}
      {!closing && (
        <div className="rounded-lg border border-safety-orange/40 bg-safety-orange/5 p-4">
          <label htmlFor="nextAction" className={label}>Next action{required}</label>
          <input
            id="nextAction"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="Call back to confirm measurements"
            className={field}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={nextActionDate}
              onChange={(e) => setNextActionDate(e.target.value)}
              className={`${field} max-w-[180px]`}
              aria-label="Next action date"
            />
            {[
              ['Today', 0],
              ['Tomorrow', 1],
              ['In 3 days', 3],
              ['Next week', 7],
            ].map(([text, days]) => (
              <button
                key={text as string}
                type="button"
                onClick={() => setNextActionDate(dateInDays(days as number))}
                className="rounded-lg border border-outline-variant px-2.5 py-1 font-mono text-[11px] text-on-surface-variant hover:border-safety-orange"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loss reason — closing as lost or disqualified */}
      {showLoss && (
        <div className="rounded-lg border border-error/40 bg-error-container/20 p-4">
          <label htmlFor="lossReason" className={label}>
            Why {stage === 'DISQUALIFIED' ? 'is this not a real lead' : 'was this lost'}?{required}
          </label>
          <select id="lossReason" value={lossReason} onChange={(e) => setLossReason(e.target.value)} className={field}>
            <option value="">— Choose a reason —</option>
            {reasonsForStage(stage).map((r) => (
              <option key={r} value={r}>{LOSS_REASON_LABELS[r]}</option>
            ))}
          </select>
          <textarea
            rows={2}
            value={lossDetail}
            onChange={(e) => setLossDetail(e.target.value)}
            placeholder="Anything worth knowing for next time (optional)"
            className={`${field} mt-2`}
          />
        </div>
      )}

      {/* Qualification gate */}
      {showQualification && (
        <div className="rounded-lg border border-primary/30 bg-primary-container/10 p-4">
          <p className="mb-3 font-work text-sm font-semibold text-industrial-blue">
            Qualification
            {stillMissing.length > 0 && (
              <span className="ml-2 font-mono text-[11px] font-normal text-error">
                {stillMissing.length} of 5 still missing
              </span>
            )}
          </p>
          <div className="space-y-3">
            <div>
              <label htmlFor="qualNeed" className={label}>What do they actually need?{required}</label>
              <input id="qualNeed" value={qualNeed} onChange={(e) => setQualNeed(e.target.value)}
                placeholder="24 casement windows and 2 sliding doors for a new home" className={field} />
            </div>
            <div>
              <label htmlFor="qualLocation" className={label}>Site location{required}</label>
              <input id="qualLocation" value={qualLocation} onChange={(e) => setQualLocation(e.target.value)}
                placeholder="Najjera, Wakiso" className={field} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="qualBudget" className={label}>Budget{required}</label>
                <select id="qualBudget" value={qualBudget} onChange={(e) => setQualBudget(e.target.value)} className={field}>
                  <option value="">— Choose —</option>
                  {BUDGET_BANDS.map((b) => <option key={b} value={b}>{BUDGET_LABELS[b]}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="qualUrgency" className={label}>Urgency{required}</label>
                <select id="qualUrgency" value={qualUrgency} onChange={(e) => setQualUrgency(e.target.value)} className={field}>
                  <option value="">— Choose —</option>
                  {URGENCIES.map((u) => <option key={u} value={u}>{URGENCY_LABELS[u]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="qualDecision" className={label}>Decision readiness{required}</label>
              <select id="qualDecision" value={qualDecision} onChange={(e) => setQualDecision(e.target.value)} className={field}>
                <option value="">— Choose —</option>
                {DECISION_READINESS.map((d) => <option key={d} value={d}>{DECISION_LABELS[d]}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Money */}
      {showValue && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="dealValue" className={label}>Quotation value (UGX){required}</label>
            <input
              id="dealValue"
              inputMode="numeric"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="12500000"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="quotationRef" className={label}>Quotation number</label>
            <input id="quotationRef" value={quotationRef} onChange={(e) => setQuotationRef(e.target.value)}
              placeholder="QTN-2026-0148" className={field} />
          </div>
        </div>
      )}

      {/* Note */}
      <div>
        <label htmlFor="note" className={label}>Add a note</label>
        <textarea id="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="What was agreed on the call…" className={field} />
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-error bg-error-container/30 p-3">
          {errors.map((e) => (
            <li key={e} className="flex gap-2 font-sans text-xs text-on-error-container">
              <Icon name="error" className="text-[16px] text-error" />
              {e}
            </li>
          ))}
        </ul>
      )}

      <button type="submit" disabled={saving}
        className="w-full rounded-lg bg-primary px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
        {saving ? 'Saving…' : 'Save lead'}
      </button>
      {saved && <p className="text-center font-mono text-xs text-primary">Saved.</p>}
    </form>
  );
}
