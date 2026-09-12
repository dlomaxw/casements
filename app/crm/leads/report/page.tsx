import type { LeadStatus } from '@prisma/client';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { getProductNav } from '@/lib/products-db';
import {
  PERIOD_LABELS,
  REPORT_PERIODS,
  leadsToHtmlBody,
  resolveRange,
  type ReportPeriod,
} from '@/lib/lead-report';
import PrintButton from '@/components/crm/PrintButton';

export const dynamic = 'force-dynamic';

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'SITE_ASSESSED', 'QUOTED', 'WON', 'LOST'];

/**
 * Print-ready lead report. "Save as PDF" in the browser's print dialog produces
 * the PDF — no document library, and the output matches the Word download
 * because both render the same HTML body.
 */
export default async function LeadReportPage({
  searchParams,
}: {
  searchParams: { period?: string; from?: string; to?: string; status?: string; category?: string; q?: string };
}) {
  const session = await requireSession();
  if (!can(session.user.role, 'view_leads')) redirect('/crm');

  const period: ReportPeriod = (REPORT_PERIODS as readonly string[]).includes(searchParams.period ?? '')
    ? (searchParams.period as ReportPeriod)
    : '30d';
  const { gte, lte } = resolveRange(period, searchParams.from, searchParams.to);

  const status = STATUSES.includes(searchParams.status as LeadStatus)
    ? (searchParams.status as LeadStatus)
    : undefined;
  const category = searchParams.category?.trim() || undefined;
  const q = searchParams.q?.trim() || undefined;

  // Reps who cannot assign leads only ever see their own, exactly as on the list.
  const scope = can(session.user.role, 'assign_leads') ? {} : { assignedToId: session.user.id };

  const where = {
    ...scope,
    ...(status ? { status } : {}),
    ...(category ? { productCategory: category } : {}),
    ...(gte || lte ? { createdAt: { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) } } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' as const } },
            { phone: { contains: q } },
            { email: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [leads, nav] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { name: true, email: true } },
        _count: { select: { activities: true } },
      },
    }),
    getProductNav(),
  ]);

  const filters = [status && `status ${status}`, category, q && `search "${q}"`].filter(Boolean).join(' · ');

  const html = leadsToHtmlBody(
    leads,
    Object.fromEntries(nav.map((p) => [p.slug, p.title])),
    {
      periodLabel:
        period === 'custom'
          ? `${searchParams.from ?? 'start'} to ${searchParams.to ?? 'today'}`
          : PERIOD_LABELS[period],
      generatedBy: session.user.name ?? session.user.email ?? 'CRM',
      filters: filters || undefined,
    },
  );

  return (
    <div>
      {/* Toolbar — hidden in the printed output */}
      <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
        <PrintButton />
        <a
          href={`/api/crm/leads/report?${new URLSearchParams({
            ...(Object.fromEntries(
              Object.entries(searchParams).filter(([, v]) => v),
            ) as Record<string, string>),
            period,
            format: 'doc',
          })}`}
          className="rounded-lg border border-outline-variant bg-white px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-industrial-blue hover:border-safety-orange"
        >
          Download Word
        </a>
        <a
          href="/crm/leads"
          className="font-mono text-xs text-on-surface-variant hover:text-safety-orange"
        >
          ← Back to leads
        </a>
        <span className="ml-auto font-mono text-xs text-on-surface-variant">
          {leads.length} leads · use “Save as PDF” as the printer
        </span>
      </div>

      <div className="rounded-xl border border-outline-variant bg-white p-6 print:border-0 print:p-0">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
