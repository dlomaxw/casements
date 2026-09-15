import { getServerSession } from 'next-auth';
import type { LeadStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { getProductNav } from '@/lib/products-db';
import {
  PERIOD_LABELS,
  REPORT_PERIODS,
  leadsToCsv,
  leadsToHtmlDocument,
  reportDocFilename,
  reportFilename,
  resolveRange,
  type ReportPeriod,
} from '@/lib/lead-report';

export const dynamic = 'force-dynamic';

const STATUSES: LeadStatus[] = [
  'NEW', 'CONTACTED', 'QUALIFIED', 'SITE_ASSESSED', 'QUOTED', 'WON', 'LOST', 'DISQUALIFIED',
];

/**
 * GET /api/crm/leads/report — downloads the lead list as CSV.
 *
 * Accepts the same status/category/search filters as the leads page, so what
 * you see on screen is what you get in the file. Reps who cannot assign leads
 * only ever export their own, matching the visibility rules of the list itself.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session.user.role, 'view_leads')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(request.url);
  const periodParam = url.searchParams.get('period') ?? '30d';
  const period: ReportPeriod = (REPORT_PERIODS as readonly string[]).includes(periodParam)
    ? (periodParam as ReportPeriod)
    : '30d';

  const from = url.searchParams.get('from') ?? undefined;
  const to = url.searchParams.get('to') ?? undefined;
  const { gte, lte } = resolveRange(period, from, to);

  const statusParam = url.searchParams.get('status');
  const status = STATUSES.includes(statusParam as LeadStatus) ? (statusParam as LeadStatus) : undefined;
  const category = url.searchParams.get('category')?.trim() || undefined;
  const q = url.searchParams.get('q')?.trim() || undefined;

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

  const productTitles = Object.fromEntries(nav.map((p) => [p.slug, p.title]));
  const filters = [status && `status ${status}`, category, q && `search "${q}"`].filter(Boolean).join(' · ');

  // Word opens an HTML document saved as .doc, so a formatted, branded report
  // needs no document library — and phone numbers stay text, unlike in CSV.
  if (url.searchParams.get('format') === 'doc') {
    const html = leadsToHtmlDocument(leads, productTitles, {
      periodLabel: period === 'custom' ? `${from ?? 'start'} to ${to ?? 'today'}` : PERIOD_LABELS[period],
      generatedBy: session.user.name ?? session.user.email ?? 'CRM',
      filters: filters || undefined,
    });
    return new Response(html, {
      headers: {
        'Content-Type': 'application/msword; charset=utf-8',
        'Content-Disposition': `attachment; filename="${reportDocFilename(period, from, to)}"`,
        'Cache-Control': 'no-store',
        'X-Lead-Count': String(leads.length),
      },
    });
  }

  const csv = leadsToCsv(leads, productTitles);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${reportFilename(period, from, to)}"`,
      // A report is a point-in-time snapshot — never let a proxy serve a stale one.
      'Cache-Control': 'no-store',
      'X-Lead-Count': String(leads.length),
    },
  });
}
