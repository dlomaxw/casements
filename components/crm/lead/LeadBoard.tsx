'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/crm/Icon';
import {
  ATTENTION_LABELS,
  DISQUALIFIED_REASONS,
  LOSS_REASON_LABELS,
  LOST_REASONS,
  OPEN_STAGES,
  STAGE_LABELS,
  attentionState,
  canMove,
  dateInDays,
  formatUgx,
  isClosed,
  needsLossReason,
  requiresDealValue,
  type Stage,
} from '@/lib/pipeline';

export interface BoardCard {
  id: string;
  fullName: string;
  status: string;
  productCategory: string;
  nextAction: string | null;
  nextActionDate: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  assignedToId: string | null;
  assignedTo: { name: string } | null;
  dealValue: string | null;
}

/** The columns shown on the board: the open pipeline, plus Won. */
const COLUMNS: Stage[] = [...OPEN_STAGES, 'WON'];

const columnAccent: Record<string, string> = {
  NEW: 'border-t-safety-orange',
  CONTACTED: 'border-t-blue-400',
  QUALIFIED: 'border-t-teal-500',
  SITE_ASSESSED: 'border-t-purple-400',
  QUOTED: 'border-t-primary',
  WON: 'border-t-emerald-600',
};

const attentionStyles: Record<string, string> = {
  overdue: 'text-error',
  'due-today': 'text-safety-orange',
  'no-action': 'text-error',
  'no-owner': 'text-error',
  stale: 'text-on-surface-variant',
  ok: 'text-on-surface-variant',
};

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

interface Pending {
  card: BoardCard;
  target: Stage;
  missing: string[];
}

/**
 * The pipeline as a board.
 *
 * Dragging a card asks the server to make the move. The server applies exactly
 * the same rules as the lead page, so if the move needs a next action, a loss
 * reason or a quotation value, the card asks for those and retries — the board
 * is a shortcut through the rules, never a way around them.
 */
export default function LeadBoard({ cards, labels }: { cards: BoardCard[]; labels: Record<string, string> }) {
  const router = useRouter();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extra fields collected when a move needs them
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState(dateInDays(1));
  const [lossReason, setLossReason] = useState('');
  const [dealValue, setDealValue] = useState('');

  const move = async (card: BoardCard, target: Stage, extra: Record<string, unknown> = {}) => {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/crm/leads/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: target, ...extra }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (res.ok) {
      setPending(null);
      router.refresh();
      return;
    }
    if (res.status === 422) {
      // The server told us exactly what is missing — ask for it on the card.
      setPending({ card, target, missing: data.errors ?? [data.error] });
      setNextAction(card.nextAction ?? '');
      setNextActionDate(card.nextActionDate?.slice(0, 10) ?? dateInDays(1));
      setDealValue(card.dealValue ?? '');
      setLossReason('');
      return;
    }
    setError(data.error ?? 'Could not move that lead.');
  };

  const onDrop = (target: Stage) => {
    setOver(null);
    const card = cards.find((c) => c.id === dragging);
    setDragging(null);
    if (!card || card.status === target) return;
    if (!canMove(card.status, target)) {
      setError(`${card.fullName}: ${STAGE_LABELS[card.status as Stage]} → ${STAGE_LABELS[target]} is not allowed.`);
      return;
    }
    move(card, target);
  };

  const submitPending = () => {
    if (!pending) return;
    const extra: Record<string, unknown> = {};
    if (!isClosed(pending.target)) {
      extra.nextAction = nextAction;
      extra.nextActionDate = nextActionDate;
    }
    if (needsLossReason(pending.target)) extra.lossReason = lossReason;
    if (requiresDealValue(pending.target)) extra.dealValue = Number(dealValue.replace(/[^\d]/g, ''));
    move(pending.card, pending.target, extra);
  };

  return (
    <>
      {error && (
        <p className="mb-3 flex items-center gap-2 rounded-lg border border-error bg-error-container/30 px-4 py-2.5 font-sans text-sm text-on-error-container">
          <Icon name="error" className="text-error" /> {error}
        </p>
      )}

      {/* What the server says is still needed for this move */}
      {pending && (
        <div className="mb-4 rounded-xl border-2 border-safety-orange bg-safety-orange/5 p-5">
          <h2 className="font-work font-semibold text-industrial-blue">
            Moving {pending.card.fullName} to {STAGE_LABELS[pending.target]}
          </h2>
          <ul className="mt-2 space-y-1">
            {pending.missing.map((m) => (
              <li key={m} className="font-sans text-xs text-error">{m}</li>
            ))}
          </ul>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {!isClosed(pending.target) && (
              <>
                <div className="sm:col-span-2">
                  <label htmlFor="b-next" className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">
                    Next action
                  </label>
                  <input id="b-next" value={nextAction} onChange={(e) => setNextAction(e.target.value)}
                    placeholder="Call back to confirm measurements" className={field} />
                </div>
                <div>
                  <label htmlFor="b-date" className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">
                    Due
                  </label>
                  <input id="b-date" type="date" value={nextActionDate} onChange={(e) => setNextActionDate(e.target.value)} className={field} />
                </div>
              </>
            )}
            {needsLossReason(pending.target) && (
              <div className="sm:col-span-2">
                <label htmlFor="b-loss" className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">
                  Reason
                </label>
                <select id="b-loss" value={lossReason} onChange={(e) => setLossReason(e.target.value)} className={field}>
                  <option value="">— Choose a reason —</option>
                  {(pending.target === 'DISQUALIFIED' ? DISQUALIFIED_REASONS : LOST_REASONS).map((r) => (
                    <option key={r} value={r}>{LOSS_REASON_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            )}
            {requiresDealValue(pending.target) && (
              <div>
                <label htmlFor="b-value" className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">
                  Quotation value (UGX)
                </label>
                <input id="b-value" inputMode="numeric" value={dealValue}
                  onChange={(e) => setDealValue(e.target.value.replace(/[^\d]/g, ''))} className={field} />
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={submitPending} disabled={busy}
              className="rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
              {busy ? 'Saving…' : 'Complete the move'}
            </button>
            <button type="button" onClick={() => setPending(null)}
              className="rounded-lg border border-outline-variant bg-white px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-on-surface-variant hover:border-safety-orange">
              Cancel
            </button>
            <Link href={`/crm/leads/${pending.card.id}`}
              className="self-center font-mono text-xs text-primary hover:underline">
              Open the full lead →
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-3 overflow-x-auto lg:grid-cols-6">
        {COLUMNS.map((column) => {
          const columnCards = cards.filter((c) => c.status === column);
          const value = columnCards.reduce((sum, c) => sum + Number(c.dealValue ?? 0), 0);
          return (
            <div
              key={column}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(column);
              }}
              onDragLeave={() => setOver((o) => (o === column ? null : o))}
              onDrop={() => onDrop(column)}
              className={`min-w-[220px] rounded-xl border border-t-4 border-outline-variant bg-surface-container-lowest p-3 transition-colors ${
                columnAccent[column]
              } ${over === column ? 'bg-safety-orange/10' : ''}`}
            >
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-work text-sm font-semibold text-industrial-blue">{STAGE_LABELS[column]}</h2>
                <span className="font-mono text-[11px] text-on-surface-variant">{columnCards.length}</span>
              </div>
              {value > 0 && (
                <p className="-mt-2 mb-3 font-mono text-[11px] text-primary">{formatUgx(value)}</p>
              )}

              <div className="space-y-2">
                {columnCards.map((card) => {
                  const attention = attentionState(card);
                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => setDragging(card.id)}
                      onDragEnd={() => setDragging(null)}
                      className={`cursor-grab rounded-lg border border-outline-variant bg-white p-3 transition-shadow hover:shadow-sm ${
                        dragging === card.id ? 'opacity-50' : ''
                      }`}
                    >
                      <Link href={`/crm/leads/${card.id}`}
                        className="font-work text-sm font-semibold text-industrial-blue hover:text-safety-orange">
                        {card.fullName}
                      </Link>
                      <p className="font-mono text-[11px] text-outline">
                        {labels[card.productCategory] ?? card.productCategory}
                      </p>
                      {card.dealValue && (
                        <p className="mt-1 font-mono text-[11px] font-semibold text-primary">
                          {formatUgx(BigInt(card.dealValue))}
                        </p>
                      )}
                      {card.nextAction && !isClosed(card.status) && (
                        <p className="mt-1 truncate font-sans text-[11px] text-on-surface-variant" title={card.nextAction}>
                          {card.nextAction}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-on-surface-variant">
                          {card.assignedTo?.name ?? 'Unassigned'}
                        </span>
                        {attention !== 'ok' && (
                          <span className={`font-mono text-[10px] font-semibold ${attentionStyles[attention]}`}>
                            {ATTENTION_LABELS[attention]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {columnCards.length === 0 && (
                  <p className="rounded-lg border border-dashed border-outline-variant py-6 text-center font-mono text-[11px] text-outline">
                    Empty
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
