import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { getProductNav } from '@/lib/products-db';
import { LEAD_PAGE_SIZE, SORT_OPTIONS, buildLeadWhere, orderByFor, readFilters } from '@/lib/leads-query';
import { LEAD_SOURCES, SOURCE_LABELS, STAGES, STAGE_LABELS, formatUgx } from '@/lib/pipeline';
import LeadsTable from '@/components/crm/LeadsTable';
import LeadReportBar from '@/components/crm/LeadReportBar';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

const ATTENTION_TABS = [
  { key: '', label: 'All' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'today', label: 'Due today' },
  { key: 'no-action', label: 'No next action' },
  { key: 'stale', label: 'Gone quiet' },
  { key: 'no-owner', label: 'No owner' },
] as const;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const session = await requireSession();
  if (!can(session.user.role, 'view_leads')) redirect('/crm');
  const canAssign = can(session.user.role, 'assign_leads');

  const filters = readFilters(searchParams);
  const page = Math.max(1, Number(searchParams.page ?? '1') || 1);
  const sort = searchParams.sort ?? 'newest';
  const where = buildLeadWhere(filters, canAssign ? undefined : session.user.id);

  const [leads, total, totals, nav, reps] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: orderByFor(sort),
      skip: (page - 1) * LEAD_PAGE_SIZE,
      take: LEAD_PAGE_SIZE,
      include: { assignedTo: { select: { name: true } } },
    }),
    prisma.lead.count({ where }),
    prisma.lead.aggregate({ where, _sum: { dealValue: true } }),
    getProductNav(),
    canAssign
      ? prisma.user.findMany({
          where: { active: true, role: { in: ['ADMIN', 'MANAGER', 'SALES_REP'] } },
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
        })
      : Promise.resolve([{ id: session.user.id, name: session.user.name ?? 'Me' }]),
  ]);

  const labels: Record<string, string> = Object.fromEntries(
    nav.map((p) => [p.slug, p.shortTitle ?? p.title]),
  );
  labels['general-enquiry'] = 'General enquiry';

  const totalPages = Math.max(1, Math.ceil(total / LEAD_PAGE_SIZE));
  const query = (extra: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...searchParams, ...extra })) {
      if (v !== undefined && v !== '') sp.set(k, String(v));
    }
    const s = sp.toString();
    return s ? `?${s}` : '';
  };

  const control =
    'rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Leads</h1>
          <p className="mt-2 font-mono text-sm text-on-surface-variant">
            {total} lead{total === 1 ? '' : 's'}
            {totals._sum.dealValue ? ` · ${formatUgx(totals._sum.dealValue)} in play` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/crm/leads/board"
            className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-industrial-blue hover:border-safety-orange">
            <Icon name="view_kanban" className="text-[18px]" /> Board
          </Link>
          <Link href="/crm/leads/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90">
            <Icon name="add" className="text-[18px]" /> Add lead
          </Link>
        </div>
      </div>

      {/* Attention tabs — the daily work queue */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {ATTENTION_TABS.map((tab) => {
          const active = (filters.attention ?? '') === tab.key;
          return (
            <Link
              key={tab.key || 'all'}
              href={`/crm/leads${query({ attention: tab.key || undefined, page: undefined })}`}
              className={`rounded-lg px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                active
                  ? 'bg-safety-orange text-white'
                  : 'border border-outline-variant bg-white text-on-surface-variant hover:border-safety-orange'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Filters */}
      <form className="mb-6 grid gap-3 rounded-xl border border-outline-variant bg-white p-4 sm:grid-cols-2 lg:grid-cols-4" action="/crm/leads" method="get">
        {filters.attention && <input type="hidden" name="attention" value={filters.attention} />}
        <div className="relative sm:col-span-2">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline-variant" />
          <input name="q" defaultValue={filters.q} placeholder="Search name, phone, email or message"
            className={`${control} w-full pl-10`} />
        </div>
        <select name="status" defaultValue={filters.status ?? ''} className={control} aria-label="Stage">
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
        <select name="source" defaultValue={filters.source ?? ''} className={control} aria-label="Source">
          <option value="">All sources</option>
          {LEAD_SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
        </select>
        {canAssign && (
          <select name="owner" defaultValue={filters.owner ?? ''} className={control} aria-label="Owner">
            <option value="">All owners</option>
            <option value="unassigned">Unassigned</option>
            {reps.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}
        <select name="category" defaultValue={filters.category ?? ''} className={control} aria-label="Product">
          <option value="">All products</option>
          {nav.map((p) => <option key={p.slug} value={p.slug}>{p.shortTitle ?? p.title}</option>)}
          <option value="general-enquiry">General enquiry</option>
        </select>
        <select name="sort" defaultValue={sort} className={control} aria-label="Sort by">
          {Object.entries(SORT_OPTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" name="from" defaultValue={filters.from} className={`${control} w-full`} aria-label="From date" />
          <span className="font-mono text-xs text-on-surface-variant">to</span>
          <input type="date" name="to" defaultValue={filters.to} className={`${control} w-full`} aria-label="To date" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90">
            Filter
          </button>
          <Link href="/crm/leads" className="rounded-lg border border-outline-variant px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-on-surface-variant hover:border-safety-orange">
            Reset
          </Link>
        </div>
      </form>

      <LeadReportBar status={filters.status} category={filters.category} q={filters.q} />

      <LeadsTable
        leads={leads.map((l) => ({
          id: l.id,
          fullName: l.fullName,
          phone: l.phone,
          email: l.email,
          productCategory: l.productCategory,
          status: l.status,
          source: l.source,
          assignedToId: l.assignedToId,
          assignedTo: l.assignedTo,
          nextAction: l.nextAction,
          nextActionDate: l.nextActionDate?.toISOString() ?? null,
          lastContactedAt: l.lastContactedAt?.toISOString() ?? null,
          dealValue: l.dealValue == null ? null : String(l.dealValue),
          createdAt: l.createdAt.toISOString(),
        }))}
        reps={reps}
        canAssign={canAssign}
        labels={labels}
      />

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between font-mono text-xs">
          <span className="text-on-surface-variant">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <Link href={`/crm/leads${query({ page: page - 1 })}`} className="flex h-8 items-center rounded border border-outline-variant px-3 hover:bg-white">
                Previous
              </Link>
            )}
            <span className="flex h-8 min-w-8 items-center justify-center rounded border border-primary bg-primary px-2 text-white">{page}</span>
            {page < totalPages && (
              <Link href={`/crm/leads${query({ page: page + 1 })}`} className="flex h-8 items-center rounded border border-outline-variant px-3 hover:bg-white">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
