import type { Lead, LeadStatus, ProjectSize } from '@prisma/client';

/** Report periods offered in the CRM. */
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
  SITE_ASSESSED: 'Site assessed',
  QUOTED: 'Quoted',
  WON: 'Won',
  LOST: 'Lost',
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
  'Status',
  'Assigned to',
  'Assigned email',
  'Follow-up date',
  'Source page',
  'Message',
  'Notes',
  'Activities',
  'Last updated',
  'Lead ID',
];

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
      l.assignedTo?.name ?? 'Unassigned',
      l.assignedTo?.email ?? '',
      fmtDate(l.followUpDate),
      l.sourcePage ?? '',
      l.message ?? '',
      l.notes ?? '',
      l._count?.activities ?? 0,
      fmtDate(l.updatedAt),
      l.id,
    ].map(cell),
  );

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
