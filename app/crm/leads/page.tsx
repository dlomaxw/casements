import Link from 'next/link';
import type { LeadStatus } from '@prisma/client';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import LeadsTable from '@/components/crm/LeadsTable';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;
const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'SITE_ASSESSED', 'QUOTED', 'WON', 'LOST'];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; page?: string };
}) {
  const session = await requireSession();
  // §17: SALES_REP sees only their own leads; ADMIN sees all
  const scope = session.user.role === 'ADMIN' ? {} : { assignedToId: session.user.id };

  const status = STATUSES.includes(searchParams.status as LeadStatus)
    ? (searchParams.status as LeadStatus)
    : undefined;
  const q = searchParams.q?.trim();
  const page = Math.max(1, Number(searchParams.page ?? '1') || 1);

  const where = {
    ...scope,
    ...(status ? { status } : {}),
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
  const buildQuery = (params: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    if (status) sp.set('status', status);
    if (q) sp.set('q', q);
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, String(v));
    const s = sp.toString();
    return s ? `?${s}` : '';
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold text-brand-950">Leads</h1>
        <span className="text-sm text-brand-500">{total} total</span>
      </div>

      {/* Filters */}
      <form className="mt-6 flex flex-wrap gap-3" action="/crm/leads" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, phone or email"
          className="min-w-[220px] flex-1 rounded-md border border-brand-200 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded-md border border-brand-200 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-brand-900 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-800">
          Filter
        </button>
      </form>

      <div className="mt-6">
        <LeadsTable leads={leads} />
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-brand-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/crm/leads${buildQuery({ page: page - 1 })}`} className="rounded-md border border-brand-200 px-4 py-2 hover:bg-white">
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/crm/leads${buildQuery({ page: page + 1 })}`} className="rounded-md border border-brand-200 px-4 py-2 hover:bg-white">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
