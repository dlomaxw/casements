import type { Metadata } from 'next';
import Image from 'next/image';
import ConsultationCTA from '@/components/home/ConsultationCTA';
import ImpactMeter from '@/components/foundation/ImpactMeter';
import { getSiteContent } from '@/lib/content';
import { getOutreachEntries } from '@/lib/outreach-db';
import { formatOutreachDate, totalsFor, type OutreachItem } from '@/lib/outreach';
import { canonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Casements Foundation — Giving Back to Our Community',
  description:
    'Food distributions, school support and community donations by Casements Africa Limited — what we gave, where, and how many people it reached.',
  alternates: { canonical: canonical('/foundation') },
};

// Rebuilt at most once a minute, so a new outreach entry appears quickly
// without querying the database on every visit.
export const revalidate = 60;

const categoryStyles: Record<string, string> = {
  Food: 'bg-accent-100 text-accent-900',
  Education: 'bg-brand-100 text-brand-900',
  Health: 'bg-rose-100 text-rose-900',
  Environment: 'bg-emerald-100 text-emerald-900',
  Other: 'bg-steel-100 text-brand-900',
};

export default async function FoundationPage() {
  const c = await getSiteContent();
  const entries = await getOutreachEntries();
  const totals = totalsFor(entries);

  const goal = Number((c('foundation.meter.goal') || '').replace(/[^\d]/g, '')) || 25_000;

  // Headline items, so the meter says what was actually handed out.
  const topItems = totals.itemTotals.slice(0, 2);
  const stats = [
    { label: 'Outreach activities', value: totals.entries.toLocaleString('en-US') },
    ...topItems.map((i: OutreachItem) => ({
      label: i.item,
      value: `${i.quantity.toLocaleString('en-US')}${i.unit ? ` ${i.unit}` : ''}`,
    })),
    ...(totals.latest
      ? [{ label: 'Most recent', value: formatOutreachDate(totals.latest) }]
      : []),
  ].slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-brand-950 py-20">
        {c('foundation.hero.image') && (
          <Image
            src={c('foundation.hero.image')}
            alt=""
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
          />
        )}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">
            {c('foundation.hero.eyebrow')}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">
            {c('foundation.hero.title')}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-brand-100">{c('foundation.hero.intro')}</p>
        </div>
      </section>

      {/* The meter */}
      <section className="bg-steel-50 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ImpactMeter
            label={c('foundation.meter.label')}
            value={totals.peopleReached}
            goal={goal}
            stats={stats}
          />
        </div>
      </section>

      {/* Outreach entries */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-extrabold text-brand-950">{c('foundation.entries.title')}</h2>
          <p className="mt-3 max-w-3xl text-brand-800/70">{c('foundation.entries.subtitle')}</p>

          {entries.length === 0 ? (
            <p className="mt-10 rounded-xl bg-steel-50 p-8 text-center text-brand-800/70 ring-1 ring-brand-100">
              {c('foundation.empty')}
            </p>
          ) : (
            <div className="mt-12 space-y-16">
              {entries.map((e, i) => (
                <article
                  key={e.id}
                  className="grid items-start gap-8 md:grid-cols-2 lg:gap-12"
                >
                  {/* Photograph — sides alternate down the page */}
                  <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-steel-100 ring-1 ring-brand-100">
                      <Image
                        src={e.image}
                        alt={e.title}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>

                    {e.gallery.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {e.gallery.slice(0, 6).map((g, gi) => (
                          <div key={gi} className="relative aspect-square overflow-hidden rounded-lg bg-steel-100 ring-1 ring-brand-100">
                            <Image
                              src={g.src}
                              alt={g.alt || e.title}
                              fill
                              sizes="(min-width: 768px) 16vw, 30vw"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Story */}
                  <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide ${
                          categoryStyles[e.category] ?? categoryStyles.Other
                        }`}
                      >
                        {e.category}
                      </span>
                      <span className="font-mono text-xs text-brand-800/60">
                        {formatOutreachDate(e.happenedOn)}
                        {e.location ? ` · ${e.location}` : ''}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-2xl font-bold text-brand-950">{e.title}</h3>
                    <p className="mt-2 text-lg text-brand-800/80">{e.summary}</p>
                    <div className="mt-4 space-y-3 leading-relaxed text-brand-800/70">
                      {e.body.split('\n').filter(Boolean).map((para, pi) => (
                        <p key={pi}>{para}</p>
                      ))}
                    </div>

                    {/* What was given */}
                    {e.items.length > 0 && (
                      <div className="mt-6 overflow-hidden rounded-xl ring-1 ring-brand-100">
                        <table className="w-full text-left">
                          <caption className="bg-steel-50 px-4 py-2.5 text-left font-mono text-[11px] font-semibold uppercase tracking-wide text-brand-900">
                            What we gave
                          </caption>
                          <tbody>
                            {e.items.map((it, ii) => (
                              <tr key={ii} className="border-t border-brand-100">
                                <td className="px-4 py-2.5 text-sm text-brand-900">{it.item}</td>
                                <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold text-brand-950">
                                  {Number(it.quantity).toLocaleString('en-US')}
                                  {it.unit ? ` ${it.unit}` : ''}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {e.peopleReached > 0 && (
                      <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-2.5 font-mono text-sm font-semibold text-brand-900">
                        {e.peopleReached.toLocaleString('en-US')} people reached
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <ConsultationCTA />
    </>
  );
}
