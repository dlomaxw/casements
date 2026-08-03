import Image from 'next/image';
import Link from 'next/link';
import { getSiteContent, telHref } from '@/lib/content';

export default async function HeroBanner() {
  const c = await getSiteContent();
  const phone = c('site.phone');

  return (
    <section className="relative isolate overflow-hidden bg-steel-50">
      {/* Architectural backdrop */}
      <div className="absolute inset-0 opacity-40" aria-hidden>
        <Image src="/images/hero/img10.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/60 to-white" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 pb-24 pt-16 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8 lg:px-8">
        {/* Copy */}
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 backdrop-blur">
            {c('home.hero.eyebrow')}
          </p>
          <h1 className="mt-6 font-display text-4xl font-black leading-[1.06] tracking-tight text-steel-950 sm:text-5xl lg:text-6xl">
            Built to Last,
            <br />
            <span className="text-brand-500">Delivered as Promised</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-steel-800/80 sm:text-lg">
            {c('home.hero.subtitle')}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-600"
            >
              Get a Free Quote
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-steel-800/20 px-7 py-3.5 text-sm font-semibold text-steel-900 transition-colors hover:border-brand-500 hover:text-brand-600"
            >
              Explore Products
            </Link>
          </div>
        </div>

        {/* Floating product cluster */}
        <div className="relative hidden h-[26rem] items-center justify-center lg:flex">
          <div className="relative mx-auto h-[22rem] w-[22rem]">
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-2xl shadow-black/20">
              <Image src="/images/hero/img9.jpg" alt="Aluminium and glass fabrication by Casements" fill sizes="360px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>

            {/* Trust badge */}
            <div className="absolute -bottom-7 -left-8 flex items-center gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-3 shadow-xl shadow-black/15">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3l7 4v5c0 4.4-3 8.3-7 9-4-0.7-7-4.6-7-9V7l7-4z" /><path d="M9 12l2 2 4-4" /></svg>
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-steel-900">Guaranteed Since 1965</p>
                <p className="text-[11px] text-steel-800/60">Genuine materials only</p>
              </div>
            </div>

            {/* Stat chip */}
            <div className="absolute -right-6 -top-6 rounded-2xl border border-brand-100 bg-white px-4 py-3 text-center shadow-xl shadow-black/15">
              <p className="font-display text-xl font-extrabold text-brand-500">500+</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-steel-800/60">Projects Delivered</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
