import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { can } from '@/lib/roles';
import { getAllOutreachAdmin } from '@/lib/outreach-db';
import { formatOutreachDate, totalsFor } from '@/lib/outreach';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function FoundationAdminPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_content')) redirect('/crm');

  const entries = await getAllOutreachAdmin();
  const live = entries.filter((e) => e.published);
  // The website totals count published entries only, so show the same figures.
  const totals = totalsFor(live);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Foundation</h1>
          <p className="mt-2 font-mono text-sm text-on-surface-variant">
            <span className="text-safety-orange">Community outreach</span>
            {' › '}
            {entries.length} entries · {live.length} live
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/foundation" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-3 font-mono text-sm font-medium text-industrial-blue hover:border-safety-orange">
            <Icon name="open_in_new" className="text-[18px]" /> View page
          </Link>
          <Link href="/crm/foundation/new"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-mono text-sm font-medium text-white hover:opacity-90">
            <Icon name="add" className="text-[18px]" /> Add outreach
          </Link>
        </div>
      </div>

      {/* The same totals the website shows */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-outline-variant bg-white p-5">
          <p className="font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">People reached</p>
          <p className="mt-1 font-work text-3xl font-bold text-primary">
            {totals.peopleReached.toLocaleString('en-US')}
          </p>
          <p className="mt-1 font-mono text-[11px] text-on-surface-variant">Shown on the website meter</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-white p-5">
          <p className="font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">Live entries</p>
          <p className="mt-1 font-work text-3xl font-bold text-industrial-blue">{live.length}</p>
          <p className="mt-1 font-mono text-[11px] text-on-surface-variant">
            {entries.length - live.length} draft{entries.length - live.length === 1 ? '' : 's'}
          </p>
        </div>
        {totals.itemTotals.slice(0, 2).map((i) => (
          <div key={`${i.item}-${i.unit}`} className="rounded-xl border border-outline-variant bg-white p-5">
            <p className="truncate font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">{i.item}</p>
            <p className="mt-1 font-work text-3xl font-bold text-industrial-blue">
              {i.quantity.toLocaleString('en-US')}
              {i.unit ? <span className="ml-1 text-base font-medium text-on-surface-variant">{i.unit}</span> : null}
            </p>
            <p className="mt-1 font-mono text-[11px] text-on-surface-variant">Given in total</p>
          </div>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant bg-white p-12 text-center">
          <Icon name="volunteer_activism" className="text-[40px] text-outline-variant" />
          <p className="mt-3 font-work text-lg font-semibold text-industrial-blue">No outreach added yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
            Add the food distributions, school support and donations Casements has carried out. Every entry you publish
            appears on the website and increases the totals shown there.
          </p>
          <Link href="/crm/foundation/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90">
            <Icon name="add" className="text-[18px]" /> Add the first one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((e) => (
            <Link key={e.id} href={`/crm/foundation/${e.id}/edit`}
              className="group overflow-hidden rounded-xl border border-outline-variant bg-white transition-colors hover:border-safety-orange">
              <div className="relative h-40 bg-surface-container-high">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.image} alt={e.title} className="h-full w-full object-cover" />
                {!e.published && (
                  <span className="absolute left-2 top-2 rounded bg-secondary-container px-2 py-0.5 font-mono text-[10px] font-bold text-on-secondary-container">
                    DRAFT
                  </span>
                )}
                <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                  {e.category}
                </span>
              </div>
              <div className="p-4">
                <p className="font-work font-bold text-industrial-blue group-hover:text-safety-orange">{e.title}</p>
                <p className="mt-1 font-mono text-[11px] text-on-surface-variant">
                  {formatOutreachDate(e.happenedOn)}
                  {e.location ? ` · ${e.location}` : ''}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{e.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.peopleReached > 0 && (
                    <span className="rounded bg-primary-container/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                      {e.peopleReached.toLocaleString('en-US')} reached
                    </span>
                  )}
                  {e.items.slice(0, 2).map((i, idx) => (
                    <span key={idx} className="rounded bg-surface-container-high px-2 py-0.5 font-mono text-[10px] text-on-surface-variant">
                      {i.item} {Number(i.quantity).toLocaleString('en-US')}
                      {i.unit ? ` ${i.unit}` : ''}
                    </span>
                  ))}
                  {e.items.length > 2 && (
                    <span className="rounded px-1 font-mono text-[10px] text-outline">+{e.items.length - 2}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
