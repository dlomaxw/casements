import Image from 'next/image';
import Button from '@/components/ui/Button';
import { site } from '@/lib/site';

export default function HeroBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      <Image
        src="/images/hero-door.jpg"
        alt="Aluminium door installation by Casements Africa"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/70 to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-40">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">
          Aluminium &middot; Glass &middot; Steel &middot; Wood
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
          Your Home&rsquo;s Perfect Finish
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100">
          Your vision, our craft—creating spaces that feel secure, beautiful and truly yours.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/products">Explore Our Products</Button>
          <a
            href={site.phoneHref}
            className="inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-accent-400 hover:text-accent-400"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.6 1 1 0 01-.25 1L6.6 10.8z" />
            </svg>
            {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
