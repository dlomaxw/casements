import type { Lead, LeadStatus, ProjectSize } from '@prisma/client';

/** Report periods offered in the CRM. */
import {
  LOSS_REASON_LABELS,
  SOURCE_LABELS,
  formatUgx,
  missingQualification,
  responseHours,
} from '@/lib/pipeline';

export const REPORT_PERIODS = ['today', '7d', '30d', 'month', 'custom', 'all'] as const;
export type ReportPeriod = (typeof REPORT_PERIODS)[number];

export const PERIOD_LABELS: Record<ReportPeriod, string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  month: 'This month',
  custom: 'Custom range',
  all: 'All time',
};

/**
 * Kampala is UTC+3 year-round (East Africa Time, no daylight saving), but the
 * server runs in UTC. Without pinning the offset, "Today" would mean the UTC
 * day: a lead submitted at 01:00 in Kampala lands at 22:00 UTC the day before,
 * and would be filed under yesterday's report.
 */
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

/** The UTC instant at which the Kampala day containing `d` begins. */
function startOfDay(d: Date): Date {
  const shifted = new Date(d.getTime() + EAT_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - EAT_OFFSET_MS);
}

function daysAgo(n: number): Date {
  const d = startOfDay(new Date());
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/** Start of the current Kampala calendar month, as a UTC instant. */
function startOfMonth(d: Date): Date {
  const k = new Date(d.getTime() + EAT_OFFSET_MS);
  return new Date(Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), 1) - EAT_OFFSET_MS);
}

/**
 * Resolves a period into a date window.
 *
 * `to` is exclusive-at-end-of-day so a custom range like 1–7 Sept includes
 * everything logged on the 7th, which is what someone picking those dates means.
 */
export function resolveRange(
  period: ReportPeriod,
  from?: string,
  to?: string,
): { gte?: Date; lte?: Date; label: string } {
  const now = new Date();
  switch (period) {
    case 'today':
      return { gte: startOfDay(now), label: PERIOD_LABELS.today };
    case '7d':
      return { gte: daysAgo(6), label: PERIOD_LABELS['7d'] };
    case '30d':
      return { gte: daysAgo(29), label: PERIOD_LABELS['30d'] };
    case 'month':
      return { gte: startOfMonth(now), label: PERIOD_LABELS.month };
    case 'custom': {
      const gte = from ? startOfDay(new Date(from)) : undefined;
      let lte: Date | undefined;
      if (to) {
        lte = startOfDay(new Date(to));
        lte.setUTCDate(lte.getUTCDate() + 1);
        lte.setMilliseconds(-1);
      }
      const valid = (d?: Date) => (d && !Number.isNaN(d.getTime()) ? d : undefined);
      return { gte: valid(gte), lte: valid(lte), label: `${from ?? 'start'} to ${to ?? 'today'}` };
    }
    case 'all':
    default:
      return { label: PERIOD_LABELS.all };
  }
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  SITE_ASSESSED: 'Site assessed',
  QUOTED: 'Quoted',
  WON: 'Won',
  LOST: 'Lost',
  DISQUALIFIED: 'Disqualified',
};

const SIZE_LABELS: Record<ProjectSize, string> = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large',
  COMMERCIAL: 'Commercial',
};

/**
 * Escapes one CSV cell.
 *
 * Beyond normal quoting, a value starting with = + - @ is prefixed with an
 * apostrophe. Spreadsheets treat those as the start of a formula, and lead
 * names and messages come from a public form — without this, a hostile
 * submission becomes a live formula in whoever opens the report.
 */
function cell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s = String(value);
  // `=` and `@` always begin a formula. `+` and `-` only do when something
  // formula-shaped follows — otherwise they are ordinary international phone
  // numbers, which must not be mangled.
  const risky = /^[=@\t\r]/.test(s) || (/^[+\-]/.test(s) && /[A-Za-z(]/.test(s.slice(1)));
  if (risky) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Excel parses a bare 0760717055 as a number and drops the leading zero, and
 * turns +256772383340 into 256772383340 — silently corrupting every phone in
 * the file. The ="…" form forces a text cell in Excel, Google Sheets and
 * LibreOffice alike. Built only from sanitised phone characters, so this can
 * never become an attacker-supplied formula.
 */
function phoneCell(value: string | null | undefined): string {
  if (!value) return '';
  const safe = String(value).replace(/[^\d+\s()-]/g, '').trim();
  if (!safe) return cell(value); // not phone-shaped — keep it visible as text
  return /^[0+]/.test(safe) ? `"=""${safe}"""` : safe;
}

const inEat = (d: Date) => new Date(new Date(d).getTime() + EAT_OFFSET_MS);
const fmtDate = (d: Date | null | undefined) => (d ? inEat(d).toISOString().slice(0, 10) : '');
const fmtTime = (d: Date | null | undefined) => (d ? inEat(d).toISOString().slice(11, 16) : '');

export type ReportLead = Lead & {
  assignedTo: { name: string; email: string } | null;
  _count?: { activities: number };
};

const COLUMNS = [
  'Date',
  'Time (EAT)',
  'Name',
  'Phone',
  'Email',
  'Product',
  'Project size',
  'Timeline',
  'Stage',
  'Source',
  'Source detail',
  'Assigned to',
  'Assigned email',
  'Next action',
  'Next action date',
  'Loss reason',
  'Deal value (UGX)',
  'Qualified',
  'Contact attempts',
  'First response (hrs)',
  'Follow-up date',
  'Source page',
  'Message',
  'Notes',
  'Activities',
  'Last updated',
  'Lead ID',
];

export function productLabel(l: ReportLead, titles: Record<string, string>): string {
  return (
    titles[l.productCategory] ??
    (l.productCategory === 'general-enquiry' ? 'General enquiry' : l.productCategory)
  );
}

export function leadsToCsv(leads: ReportLead[], productTitles: Record<string, string>): string {
  const rows = leads.map((l) =>
    [
      fmtDate(l.createdAt),
      fmtTime(l.createdAt),
      l.fullName,
      l.phone ?? '',
      l.email ?? '',
      productTitles[l.productCategory] ??
        (l.productCategory === 'general-enquiry' ? 'General enquiry' : l.productCategory),
      l.projectSize ? SIZE_LABELS[l.projectSize] : '',
      l.timeline ?? '',
      STATUS_LABELS[l.status],
      l.source ? SOURCE_LABELS[l.source as keyof typeof SOURCE_LABELS] ?? l.source : '',
      l.sourceDetail ?? '',
      l.assignedTo?.name ?? 'Unassigned',
      l.assignedTo?.email ?? '',
      l.nextAction ?? '',
      fmtDate(l.nextActionDate),
      l.lossReason ? LOSS_REASON_LABELS[l.lossReason as keyof typeof LOSS_REASON_LABELS] ?? l.lossReason : '',
      l.dealValue == null ? '' : String(l.dealValue),
      missingQualification(l).length === 0 ? 'Yes' : 'No',
      l.contactAttempts ?? 0,
      responseHours(l) === null ? '' : (responseHours(l) as number).toFixed(1),
      fmtDate(l.followUpDate),
      l.sourcePage ?? '',
      l.message ?? '',
      l.notes ?? '',
      l._count?.activities ?? 0,
      fmtDate(l.updatedAt),
      l.id,
    ].map(cell),
  );

  // Phone does its own quoting, so it bypasses cell()'s escaping.
  leads.forEach((l, i) => {
    rows[i][3] = phoneCell(l.phone);
  });

  // CRLF and a UTF-8 BOM: without the BOM Excel mangles any non-ASCII name.
  return '﻿' + [COLUMNS.map(cell), ...rows].map((r) => r.join(',')).join('\r\n') + '\r\n';
}

/** e.g. casements-leads-last-7-days-2026-09-12.csv */
export function reportFilename(period: ReportPeriod, from?: string, to?: string): string {
  const slug =
    period === 'custom' && (from || to)
      ? `${from ?? 'start'}-to-${to ?? 'today'}`
      : PERIOD_LABELS[period].toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `casements-leads-${slug}-${new Date().toISOString().slice(0, 10)}.csv`;
}

/* ------------------------------------------------------------------ */
/* Formatted report (Word download + print-to-PDF)                     */
/* ------------------------------------------------------------------ */

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export interface ReportMeta {
  periodLabel: string;
  generatedBy: string;
  filters?: string;
}

export function summarise(leads: ReportLead[], titles: Record<string, string>) {
  const by = <T extends string>(key: (l: ReportLead) => T) => {
    const m = new Map<T, number>();
    for (const l of leads) m.set(key(l), (m.get(key(l)) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  };
  return {
    total: leads.length,
    byStatus: by((l) => STATUS_LABELS[l.status]),
    byProduct: by((l) => productLabel(l, titles)),
    byOwner: by((l) => l.assignedTo?.name ?? 'Unassigned'),
    bySource: by((l) =>
      l.source ? SOURCE_LABELS[l.source as keyof typeof SOURCE_LABELS] ?? l.source : 'Unknown',
    ),
    byLossReason: by((l) =>
      l.lossReason ? LOSS_REASON_LABELS[l.lossReason as keyof typeof LOSS_REASON_LABELS] ?? l.lossReason : '',
    ).filter(([k]) => k !== ''),
    withPhone: leads.filter((l) => (l.phone ?? '').replace(/\D/g, '').length >= 7).length,
    withEmail: leads.filter((l) => (l.email ?? '').includes('@')).length,
    qualified: leads.filter((l) => missingQualification(l).length === 0).length,
    pipelineValue: leads.reduce((sum, l) => sum + Number(l.dealValue ?? 0), 0),
  };
}

/**
 * One HTML body used for both the Word download and the print-to-PDF page, so
 * the two can never drift apart. Styles are inline because Word ignores
 * external stylesheets.
 */
export function leadsToHtmlBody(
  leads: ReportLead[],
  titles: Record<string, string>,
  meta: ReportMeta,
): string {
  const s = summarise(leads, titles);
  const generated = inEat(new Date()).toISOString().slice(0, 16).replace('T', ' ');

  const chip = (rows: [string, number][]) =>
    rows.map(([k, n]) => `<span style="display:inline-block;margin:0 10px 6px 0;font-size:11pt">
      <b>${esc(k)}</b> ${n}</span>`).join('');

  const body = leads
    .map(
      (l, i) => `<tr${i % 2 ? ' style="background:#f6faf7"' : ''}>
      <td>${fmtDate(l.createdAt)}<div style="color:#6b7280;font-size:8pt">${fmtTime(l.createdAt)}</div></td>
      <td><b>${esc(l.fullName)}</b></td>
      <td>${esc(l.phone) || '<i style="color:#9ca3af">none</i>'}</td>
      <td>${esc(l.email) || '<i style="color:#9ca3af">none</i>'}</td>
      <td>${esc(productLabel(l, titles))}</td>
      <td>${esc(l.projectSize ? SIZE_LABELS[l.projectSize] : '—')}</td>
      <td>${esc(STATUS_LABELS[l.status])}</td>
      <td>${esc(l.source ? SOURCE_LABELS[l.source as keyof typeof SOURCE_LABELS] ?? l.source : '—')}</td>
      <td>${esc(l.assignedTo?.name ?? 'Unassigned')}</td>
      <td>${
        l.lossReason
          ? esc(LOSS_REASON_LABELS[l.lossReason as keyof typeof LOSS_REASON_LABELS] ?? l.lossReason)
          : esc(l.nextAction ?? '—')
      }${
        l.nextActionDate && !l.lossReason
          ? `<div style="color:#6b7280;font-size:8pt">${fmtDate(l.nextActionDate)}</div>`
          : ''
      }</td>
      <td align="right">${l.dealValue == null ? '—' : esc(formatUgx(l.dealValue))}</td>
      <td style="font-size:8.5pt">${esc(l.message ?? '')}${
        l.notes ? `<div style="color:#1f7a3d;margin-top:3px"><b>Note:</b> ${esc(l.notes)}</div>` : ''
      }</td>
    </tr>`,
    )
    .join('');

  return `
  <div style="font-family:Calibri,Arial,sans-serif;color:#101010">
    <div style="border-bottom:3px solid #1f7a3d;padding-bottom:10px;margin-bottom:16px">
      <div style="font-size:20pt;font-weight:bold;color:#14572c">Casements Africa Limited</div>
      <div style="font-size:13pt;color:#1f7a3d">Leads Report — ${esc(meta.periodLabel)}</div>
      <div style="font-size:9pt;color:#6b7280;margin-top:4px">
        Generated ${generated} EAT by ${esc(meta.generatedBy)}${meta.filters ? ` · Filters: ${esc(meta.filters)}` : ''}
      </div>
    </div>

    <div style="background:#f0f7f2;border:1px solid #cfe5d7;padding:10px 12px;margin-bottom:16px">
      <div style="font-size:14pt;font-weight:bold;color:#14572c">${s.total} leads</div>
      <div style="font-size:10pt;color:#374151;margin:6px 0">
        ${s.withPhone} with a phone number · ${s.withEmail} with an email · ${s.qualified} fully qualified${
          s.pipelineValue > 0 ? ` · ${esc(formatUgx(s.pipelineValue))} total value` : ''
        }
      </div>
      <div style="margin-top:8px"><b style="font-size:10pt;color:#14572c">By status</b><br>${chip(s.byStatus)}</div>
      <div style="margin-top:6px"><b style="font-size:10pt;color:#14572c">By product</b><br>${chip(s.byProduct.slice(0, 8))}</div>
      <div style="margin-top:6px"><b style="font-size:10pt;color:#14572c">By owner</b><br>${chip(s.byOwner)}</div>
      <div style="margin-top:6px"><b style="font-size:10pt;color:#14572c">By source</b><br>${chip(s.bySource)}</div>
      ${
        s.byLossReason.length > 0
          ? `<div style="margin-top:6px"><b style="font-size:10pt;color:#14572c">Why closed</b><br>${chip(s.byLossReason)}</div>`
          : ''
      }
    </div>

    <table border="1" cellspacing="0" cellpadding="5"
      style="border-collapse:collapse;width:100%;font-size:9pt;border-color:#d5e3d9">
      <thead>
        <tr style="background:#1f7a3d;color:#fff;font-size:9pt">
          <th align="left">Date</th><th align="left">Name</th><th align="left">Phone</th>
          <th align="left">Email</th><th align="left">Product</th><th align="left">Size</th>
          <th align="left">Stage</th><th align="left">Source</th><th align="left">Owner</th>
          <th align="left">Next action / reason</th><th align="left">Value</th>
          <th align="left">Message / notes</th>
        </tr>
      </thead>
      <tbody>${body || '<tr><td colspan="12" align="center">No leads in this period.</td></tr>'}</tbody>
    </table>

    <div style="margin-top:14px;font-size:8pt;color:#6b7280">
      Casements Africa Limited · Plot 86/90, 5th Street, Industrial Area, Kampala · sales@casements.co.ug
    </div>
  </div>`;
}

/** Standalone document for the .doc download. */
export function leadsToHtmlDocument(
  leads: ReportLead[],
  titles: Record<string, string>,
  meta: ReportMeta,
): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<title>Casements Leads Report — ${esc(meta.periodLabel)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>@page{size:A4 landscape;margin:1.2cm}</style>
</head><body>${leadsToHtmlBody(leads, titles, meta)}</body></html>`;
}

export function reportDocFilename(period: ReportPeriod, from?: string, to?: string): string {
  return reportFilename(period, from, to).replace(/\.csv$/, '.doc');
}
