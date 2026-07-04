import Image from 'next/image';
import Link from 'next/link';
import { getSiteContent } from '@/lib/content';

const highlights = [
  {
    title: 'Aluminium',
    description:
      'Tired of constant maintenance? Our aluminium doors and windows are rust-proof, energy-efficient and built to withstand the elements.',
    href: '/products/aluminium-doors-and-windows',
    image: '/images/home-aluminium.jpg',
    alt: 'Aluminium door by Casements Africa',
  },
  {
    title: 'Glass',
    description:
      'Struggling with dark, cramped spaces? Our premium glass solutions flood your rooms with natural light for a bright, airy atmosphere.',
    href: '/products/glass-products',
    image: '/images/home-glass.jpg',
    alt: 'Glass space interior by Casements Africa',
  },
  {
    title: 'Steel',
    description:
      'Worried about security? Our steel grills, burglar-proofing and railings provide unmatched protection for your home.',
    href: '/products/steel-products',
    image: '/images/home-steel.jpg',
    alt: 'Steel door section by Casements Africa',
  },
];

export default async function ProductHighlights() {
  const c = await getSiteContent();
  return (
    <section className="bg-steel-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">{c('home.products.eyebrow')}</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-950 sm:text-4xl">
          {c('home.products.title')}
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {highlights.map((h) => (
            <Link
              key={h.title}
              href={h.href}
              className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-brand-100 transition-shadow hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={h.image}
                  alt={h.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-brand-950">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-800/70">{h.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-accent-600">
                  Learn More
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M5 12h14m-6-6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
