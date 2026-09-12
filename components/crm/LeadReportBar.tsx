'use client';

import { useState } from 'react';
import Icon from './Icon';
import { PERIOD_LABELS, REPORT_PERIODS, type ReportPeriod } from '@/lib/lead-report';

interface Props {
  /** Filters currently applied to the list, carried into the export. */
  status?: string;
  category?: string;
  q?: string;
}

export default function LeadReportBar({ status, category, q }: Props) {
  const [period, setPeriod] = useState<ReportPeriod>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const href = (() => {
    const sp = new URLSearchParams({ period });
    if (period === 'custom') {
      if (from) sp.set('from', from);
      if (to) sp.set('to', to);
    }
    if (status) sp.set('status', status);
    if (category) sp.set('category', category);
    if (q) sp.set('q', q);
    return `/api/crm/leads/report?${sp}`;
  })();

  const filtered = [status && `status ${status}`, category && `category ${category}`, q && `search “${q}”`]
    .filter(Boolean)
    .join(' · ');

  const control =
    'rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <div className="mb-6 rounded-xl border border-outline-variant bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 sm:mr-2">
          <Icon name="download" className="text-safety-orange" />
          <span className="font-work text-sm font-semibold text-industrial-blue">Download report</span>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
          className={control}
          aria-label="Report period"
        >
          {REPORT_PERIODS.map((p) => (
            <option key={p} value={p}>
              {PERIOD_LABELS[p]}
            </option>
          ))}
        </select>

        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={control} aria-label="From date" />
            <span className="font-mono text-xs text-on-surface-variant">to</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={control} aria-label="To date" />
          </div>
        )}

        {/* A plain link, so the browser handles the download natively. */}
        <a
          href={href}
          download
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 sm:ml-auto"
        >
          <Icon name="table_view" className="text-[18px]" />
          Export CSV
        </a>
      </div>

      <p className="mt-3 font-mono text-[11px] text-on-surface-variant">
        Every field is included: contact details, product, size, timeline, status, owner, follow-up date, message,
        notes and activity count.
        {filtered ? ` Current filters apply — ${filtered}.` : ' No filters applied — all leads in the period.'}
      </p>
    </div>
  );
}
