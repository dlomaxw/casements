import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { LeadStatus } from '@prisma/client';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { getProductBySlug } from '@/lib/products';
import { can } from '@/lib/roles';
import LeadsTable from '@/components/crm/LeadsTable';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;
const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'SITE_ASSESSED', 'QUOTED', 'WON', 'LOST'];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; page?: string; category?: string };
}) {
  const session = await requireSession();
  if (!can(session.user.role, 'view_leads')) redirect('/crm');
  const scope = can(session.user.role, 'assign_leads') ? {} : { assignedToId: session.user.id };

  const status = STATUSES.includes(searchParams.status as LeadStatus) ? (searchParams.status as LeadStatus) : undefined;
  const category = searchParams.category?.trim() || undefined;
  const q = searchParams.q?.trim();
  const page = Math.max(1, Number(searchParams.page ?? '1') || 1);

  const where = {
    ...scope,
    ...(status ? { status } : {}),
    ...(category ? { productCategory: category } : {}),
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

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { assignedTo: { select: { name: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const categoryTitle = category ? getProductBySlug(category)?.title ?? category : null;
  const buildQuery = (extra: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    if (status) sp.set('status', status);
    if (q) sp.set('q', q);
    if (category) sp.set('category', category);
    for (const [k, v] of Object.entries(extra)) if (v) sp.set(k, String(v));
    const s = sp.toString();
    return s ? `?${s}` : '';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Leads</h1>
          <p className="mt-2 font-mono text-sm text-on-surface-variant">
            <span className="text-safety-orange">Pipeline</span>
            {' › '}
            {categoryTitle ? `${categoryTitle} Leads` : 'All Leads'} · {total} total
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <form className="mb-6 flex flex-col gap-3 rounded-xl border border-outline-variant bg-white p-4 sm:flex-row sm:items-center" action="/crm/leads" method="get">
        {category && <input type="hidden" name="category" value={category} />}
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, phone or email"
            className="w-full rounded-lg border border-outline-variant bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded-lg border border-outline-variant bg-white px-4 py-2.5 font-mono text-xs uppercase tracking-wide focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90">
          Filter
        </button>
      </form>

      <LeadsTable leads={leads} />

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between font-mono text-xs">
          <span className="text-on-surface-variant">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <Link href={`/crm/leads${buildQuery({ page: page - 1 })}`} className="flex h-8 items-center rounded border border-outline-variant px-3 hover:bg-white">
                Previous
              </Link>
            )}
            <span className="flex h-8 min-w-8 items-center justify-center rounded border border-primary bg-primary px-2 text-white">{page}</span>
            {page < totalPages && (
              <Link href={`/crm/leads${buildQuery({ page: page + 1 })}`} className="flex h-8 items-center rounded border border-outline-variant px-3 hover:bg-white">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
