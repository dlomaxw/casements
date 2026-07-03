import Link from 'next/link';
import { testimonials } from '@/lib/testimonials';

function Stars() {
  return (
    <div className="flex gap-0.5 text-accent-500" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Testimonials</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-950 sm:text-4xl">
              Rated 5.0 by Our Clients
            </h2>
          </div>
          <Link href="/testimonials" className="text-sm font-semibold text-brand-600 hover:text-accent-600">
            Read all reviews →
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {testimonials.slice(0, 2).map((t) => (
            <figure key={t.name} className="rounded-xl bg-steel-50 p-8 ring-1 ring-brand-100">
              <Stars />
              <blockquote className="mt-4 text-brand-900">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-brand-600">
                {t.name} <span className="font-normal text-brand-800/60">— {t.project}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
