'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/crm/Icon';
import {
  ATTENTION_LABELS,
  LOSS_REASON_LABELS,
  LOST_REASONS,
  DISQUALIFIED_REASONS,
  SOURCE_LABELS,
  STAGES,
  STAGE_LABELS,
  attentionState,
  dateInDays,
  formatUgx,
  isClosed,
  needsLossReason,
  whatsappLink,
  type Stage,
} from '@/lib/pipeline';

export interface LeadRow {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  productCategory: string;
  status: string;
  source: string | null;
  assignedToId: string | null;
  assignedTo: { name: string } | null;
  nextAction: string | null;
  nextActionDate: string | null;
  lastContactedAt: string | null;
  dealValue: string | null;
  createdAt: string;
}

const stageStyles: Record<string, string> = {
  NEW: 'bg-safety-orange/15 text-safety-orange',
  CONTACTED: 'bg-secondary-container text-on-secondary-container',
  QUALIFIED: 'bg-teal-100 text-teal-800',
  SITE_ASSESSED: 'bg-tertiary-container/20 text-tertiary',
  QUOTED: 'bg-primary-container/15 text-primary',
  WON: 'bg-primary text-white',
  LOST: 'bg-error-container text-on-error-container',
  DISQUALIFIED: 'bg-slate-200 text-slate-600',
};

const attentionStyles: Record<string, string> = {
  overdue: 'text-error',
  'due-today': 'text-safety-orange',
  'no-action': 'text-error',
  'no-owner': 'text-error',
  stale: 'text-on-surface-variant',
  ok: 'text-on-surface-variant',
};

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

const control =
  'rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

/**
 * The lead list.
 *
 * Every row carries the five fields the business runs on — source, owner,
 * stage, next action and (when closed) the reason — so a lead that nobody has
 * updated is visible at a glance rather than hidden behind a click.
 */
export default function LeadsTable({
  leads,
  reps,
  canAssign,
  labels,
}: {
  leads: LeadRow[];
  reps: { id: string; name: string }[];
  canAssign: boolean;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState<'assign' | 'stage' | 'next-action'>('next-action');
  const [assignTo, setAssignTo] = useState('');
  const [stage, setStage] = useState<Stage>('CONTACTED');
  const [lossReason, setLossReason] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState(dateInDays(1));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (leads.length === 0) {
    return (
      <p className="rounded-xl border border-outline-variant bg-white p-8 text-center text-sm text-on-surface-variant">
        No leads match these filters.
      </p>
    );
  }

  const allSelected = selected.length === leads.length;
  const toggleAll = () => setSelected(allSelected ? [] : leads.map((l) => l.id));
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const apply = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    const body: Record<string, unknown> = { ids: selected, action };
    if (action === 'assign') body.assignedToId = assignTo;
    if (action === 'stage') {
      body.status = stage;
      if (needsLossReason(stage)) body.lossReason = lossReason;
      else if (!isClosed(stage)) {
        body.nextAction = nextAction || 'Follow up';
        body.nextActionDate = nextActionDate;
      }
    }
    if (action === 'next-action') {
      body.nextAction = nextAction;
      body.nextActionDate = nextActionDate;
    }

    const res = await fetch('/api/crm/leads/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? 'Could not apply that change.');
      return;
    }
    setSelected([]);
    setResult(
      `${data.updated} lead${data.updated === 1 ? '' : 's'} updated` +
        (data.skipped?.length ? ` · skipped: ${data.skipped.join('; ')}` : ''),
    );
    router.refresh();
  };

  return (
    <>
      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="mb-3 rounded-xl border-2 border-safety-orange bg-safety-orange/5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wide text-industrial-blue">
              {selected.length} selected
            </span>

            <select value={action} onChange={(e) => setAction(e.target.value as typeof action)} className={control}>
              <option value="next-action">Set next action</option>
              <option value="stage">Change stage</option>
              {canAssign && <option value="assign">Reassign</option>}
            </select>

            {action === 'assign' && (
              <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} className={control}>
                <option value="">— Choose owner —</option>
                {reps.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            )}

            {action === 'stage' && (
              <select value={stage} onChange={(e) => setStage(e.target.value as Stage)} className={control}>
                {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            )}

            {action === 'stage' && needsLossReason(stage) && (
              <select value={lossReason} onChange={(e) => setLossReason(e.target.value)} className={control}>
                <option value="">— Reason (required) —</option>
                {(stage === 'DISQUALIFIED' ? DISQUALIFIED_REASONS : LOST_REASONS).map((r) => (
                  <option key={r} value={r}>{LOSS_REASON_LABELS[r]}</option>
                ))}
              </select>
            )}

            {(action === 'next-action' || (action === 'stage' && !isClosed(stage))) && (
              <>
                <input value={nextAction} onChange={(e) => setNextAction(e.target.value)}
                  placeholder="Next action" className={`${control} min-w-[200px] flex-1`} />
                <input type="date" value={nextActionDate} onChange={(e) => setNextActionDate(e.target.value)}
                  className={control} aria-label="Next action date" />
              </>
            )}

            <button type="button" onClick={apply} disabled={busy}
              className="rounded-lg bg-primary px-5 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
              {busy ? 'Applying…' : 'Apply'}
            </button>
            <button type="button" onClick={() => setSelected([])}
              className="font-mono text-xs text-on-surface-variant hover:text-safety-orange">
              Clear
            </button>
          </div>
          {error && <p className="mt-2 font-mono text-xs text-error">{error}</p>}
        </div>
      )}

      {result && <p className="mb-3 font-mono text-xs text-primary">{result}</p>}

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-outline-variant bg-surface-container-high">
            <tr>
              <th className="w-10 p-4">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all leads" />
              </th>
              {['Lead', 'Source', 'Stage', 'Next action', 'Owner', 'Value'].map((h) => (
                <th key={h} className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const attention = attentionState(lead);
              const wa = whatsappLink(lead.phone);
              return (
                <tr key={lead.id} className="zebra-stripe border-b border-outline-variant/30 transition-colors hover:bg-primary/5">
                  <td className="p-4">
                    <input type="checkbox" checked={selected.includes(lead.id)} onChange={() => toggle(lead.id)}
                      aria-label={`Select ${lead.fullName}`} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant/30 bg-primary-container/20 font-mono text-xs font-bold text-primary">
                        {initials(lead.fullName)}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/crm/leads/${lead.id}`} className="font-semibold text-industrial-blue hover:text-safety-orange">
                          {lead.fullName}
                        </Link>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-on-surface-variant">
                          {lead.phone ?? lead.email ?? '—'}
                          {wa && (
                            <a href={wa} target="_blank" rel="noopener noreferrer" title="Message on WhatsApp"
                              className="text-[#25D366] hover:opacity-80">
                              <Icon name="chat" className="text-[14px]" />
                            </a>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-outline">
                          {labels[lead.productCategory] ?? lead.productCategory}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-on-surface-variant">
                    {lead.source ? SOURCE_LABELS[lead.source as keyof typeof SOURCE_LABELS] ?? lead.source : '—'}
                  </td>
                  <td className="p-4">
                    <span className={`rounded px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide ${stageStyles[lead.status] ?? 'bg-surface-container-highest text-industrial-blue'}`}>
                      {STAGE_LABELS[lead.status as Stage] ?? lead.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {isClosed(lead.status) ? (
                      <span className="font-mono text-[11px] text-outline">Closed</span>
                    ) : (
                      <div className="min-w-0">
                        <p className="truncate text-sm text-on-surface">{lead.nextAction ?? '—'}</p>
                        <p className={`font-mono text-[11px] ${attentionStyles[attention]}`}>
                          {attention === 'ok'
                            ? lead.nextActionDate
                              ? new Date(lead.nextActionDate).toLocaleDateString()
                              : ''
                            : ATTENTION_LABELS[attention]}
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm font-medium text-industrial-blue">
                    {lead.assignedTo?.name ?? <span className="text-error">Unassigned</span>}
                  </td>
                  <td className="p-4 font-mono text-xs text-on-surface-variant">
                    {lead.dealValue ? formatUgx(BigInt(lead.dealValue)) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
