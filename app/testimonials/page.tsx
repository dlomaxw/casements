import type { Metadata } from 'next';
import ContactForm from '@/components/ui/ContactForm';
import { testimonials } from '@/lib/testimonials';

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'What our clients say about Casements Africa — rated 5.0 across our reviews.',
};

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

export default function TestimonialsPage() {
  return (
    <>
      <section className="bg-brand-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">Testimonials</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">
            Rated 5.0 by Our Clients
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-100">
            We would love your feedback. If we&rsquo;ve worked together, post a review to our profile —
            and read what others have said below.
          </p>
        </div>
      </section>

      <section className="bg-steel-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-brand-100">
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

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Get In Touch</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-950 sm:text-4xl">
              Share Your Experience
            </h2>
            <p className="mt-4 max-w-md text-brand-800/70">
              Worked with us recently? We&rsquo;d love to hear how it went. Send us a message below.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
