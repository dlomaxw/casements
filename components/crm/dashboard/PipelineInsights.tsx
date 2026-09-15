import Link from 'next/link';
import Icon from '@/components/crm/Icon';
import {
  LOSS_REASON_LABELS,
  RESPONSE_SLA_HOURS,
  SOURCE_LABELS,
  STAGE_LABELS,
  formatUgx,
  type Stage,
} from '@/lib/pipeline';
import type {
  AttentionCounts,
  LossBreakdown,
  RepPerformance,
  SourcePerformance,
  StageValue,
} from '@/lib/pipeline-stats';

/**
 * Dashboard panels for the managed pipeline. All presentational — the numbers
 * are computed in lib/pipeline-stats.ts.
 */

const card = 'rounded-xl border border-outline-variant bg-white p-6';

/**
 * The work queue. Each tile links straight to the filtered list, so "11
 * overdue" is one click from the eleven leads rather than a number to feel bad
 * about.
 */
export function AttentionQueue({ counts }: { counts: AttentionCounts }) {
  const tiles = [
    { key: 'overdue', label: 'Overdue', value: counts.overdue, href: '/crm/leads?attention=overdue', tone: 'error' },
    { key: 'today', label: 'Due today', value: counts.dueToday, href: '/crm/leads?attention=today', tone: 'orange' },
    { key: 'unanswered', label: 'Never contacted', value: counts.unqualifiedNew, href: '/crm/leads?status=NEW', tone: 'error' },
    { key: 'no-action', label: 'No next action', value: counts.noAction, href: '/crm/leads?attention=no-action', tone: 'error' },
    { key: 'stale', label: 'Gone quiet', value: counts.stale, href: '/crm/leads?attention=stale', tone: 'muted' },
    ...(counts.noOwner > 0
      ? [{ key: 'no-owner', label: 'No owner', value: counts.noOwner, href: '/crm/leads?attention=no-owner', tone: 'error' }]
      : []),
  ];

  const tone: Record<string, string> = {
    error: 'text-error',
    orange: 'text-safety-orange',
    muted: 'text-on-surface-variant',
  };

  const clean = tiles.every((t) => t.value === 0);

  return (
    <section className={card}>
      <h2 className="mb-1 flex items-center gap-2 font-work text-lg font-semibold text-industrial-blue">
        <Icon name="assignment_late" className="text-safety-orange" />
        Needs attention
      </h2>
      <p className="mb-4 font-mono text-[11px] text-on-surface-variant">
        Leads where the record has stopped moving.
      </p>

      {clean ? (
        <p className="rounded-lg border border-primary/30 bg-primary-container/10 p-4 text-sm text-on-surface">
          Nothing outstanding — every open lead has an action with a date on it.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {tiles.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`rounded-lg border px-3 py-3 transition-colors hover:border-safety-orange ${
                t.value > 0 ? 'border-outline-variant bg-surface-container-lowest' : 'border-outline-variant/40'
              }`}
            >
              <span className={`block font-work text-2xl font-bold leading-none ${t.value > 0 ? tone[t.tone] : 'text-outline'}`}>
                {t.value}
              </span>
              <span className="mt-1 block font-mono text-[11px] text-on-surface-variant">{t.label}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/** The open pipeline in shillings, stage by stage. */
export function PipelineValueCard({ stages }: { stages: StageValue[] }) {
  const total = stages.reduce((s, v) => s + v.value, 0);
  const max = Math.max(1, ...stages.map((s) => s.value));

  return (
    <section className={card}>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-work text-lg font-semibold text-industrial-blue">Open pipeline</h2>
        <span className="font-work text-xl font-bold text-primary">{formatUgx(total)}</span>
      </div>
      <ul className="space-y-3">
        {stages.map((s) => (
          <li key={s.stage}>
            <div className="flex items-baseline justify-between font-mono text-[11px]">
              <span className="text-on-surface-variant">
                {STAGE_LABELS[s.stage as Stage]} · {s.count}
              </span>
              <span className="text-industrial-blue">{s.value > 0 ? formatUgx(s.value) : '—'}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(s.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      {total === 0 && (
        <p className="mt-4 font-mono text-[11px] text-on-surface-variant">
          Values appear here once leads reach the quotation stage.
        </p>
      )}
    </section>
  );
}

/** Per-rep scoreboard — workload, discipline and conversion side by side. */
export function TeamPerformance({ reps }: { reps: RepPerformance[] }) {
  if (reps.length === 0) return null;

  return (
    <section className={card}>
      <h2 className="mb-1 font-work text-lg font-semibold text-industrial-blue">Team performance</h2>
      <p className="mb-4 font-mono text-[11px] text-on-surface-variant">Last 90 days.</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-outline-variant">
            <tr>
              {['Rep', 'Open', 'Won', 'Win rate', 'Won value', 'Avg response', 'Overdue'].map((h) => (
                <th key={h} className="pb-2 pr-4 font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reps.map((r) => (
              <tr key={r.id} className="border-b border-outline-variant/30">
                <td className="py-3 pr-4 font-work text-sm font-semibold text-industrial-blue">{r.name}</td>
                <td className="py-3 pr-4 font-mono text-sm text-on-surface">{r.open}</td>
                <td className="py-3 pr-4 font-mono text-sm text-on-surface">{r.won}</td>
                <td className="py-3 pr-4 font-mono text-sm text-on-surface">{Math.round(r.winRate * 100)}%</td>
                <td className="py-3 pr-4 font-mono text-sm text-primary">{r.wonValue > 0 ? formatUgx(r.wonValue) : '—'}</td>
                <td className="py-3 pr-4 font-mono text-sm">
                  {r.avgResponseHours === null ? (
                    <span className="text-outline">—</span>
                  ) : (
                    <span className={r.avgResponseHours <= RESPONSE_SLA_HOURS ? 'text-primary' : 'text-error'}>
                      {r.avgResponseHours < 1
                        ? `${Math.round(r.avgResponseHours * 60)}m`
                        : `${r.avgResponseHours.toFixed(1)}h`}
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 font-mono text-sm">
                  {r.overdue + r.noAction > 0 ? (
                    <span className="text-error">{r.overdue + r.noAction}</span>
                  ) : (
                    <span className="text-primary">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Which channels are worth the money. */
export function SourceQuality({ sources }: { sources: SourcePerformance[] }) {
  if (sources.length === 0) return null;

  return (
    <section className={card}>
      <h2 className="mb-1 font-work text-lg font-semibold text-industrial-blue">Where leads come from</h2>
      <p className="mb-4 font-mono text-[11px] text-on-surface-variant">
        Last 90 days. Quality is the share that were not thrown out as spam, duplicates or out of area.
      </p>
      <ul className="space-y-3">
        {sources.slice(0, 8).map((s) => (
          <li key={s.source} className="flex items-center justify-between gap-4">
            <span className="min-w-0 flex-1">
              <span className="block font-sans text-sm text-on-surface">
                {SOURCE_LABELS[s.source as keyof typeof SOURCE_LABELS] ?? s.source}
              </span>
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                <span
                  className={`block h-full rounded-full ${s.quality >= 0.7 ? 'bg-primary' : s.quality >= 0.4 ? 'bg-safety-orange' : 'bg-error'}`}
                  style={{ width: `${Math.round(s.quality * 100)}%` }}
                />
              </span>
            </span>
            <span className="shrink-0 text-right font-mono text-[11px] text-on-surface-variant">
              {s.total} lead{s.total === 1 ? '' : 's'} · {Math.round(s.quality * 100)}% real
              {s.won > 0 && <span className="block text-primary">{s.won} won</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Why work is being lost — only possible because the reason is mandatory. */
export function LossReasons({ reasons }: { reasons: LossBreakdown[] }) {
  if (reasons.length === 0) return null;
  const total = reasons.reduce((s, r) => s + r.count, 0);

  return (
    <section className={card}>
      <h2 className="mb-1 font-work text-lg font-semibold text-industrial-blue">Why leads close out</h2>
      <p className="mb-4 font-mono text-[11px] text-on-surface-variant">Last 90 days · {total} closed.</p>
      <ul className="space-y-2">
        {reasons.slice(0, 8).map((r) => (
          <li key={r.reason} className="flex items-center justify-between gap-4 font-sans text-sm">
            <span className="text-on-surface">
              {LOSS_REASON_LABELS[r.reason as keyof typeof LOSS_REASON_LABELS] ?? r.reason}
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant">
              {r.count} · {Math.round((r.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
