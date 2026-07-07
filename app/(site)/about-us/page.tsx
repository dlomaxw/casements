import type { Metadata } from 'next';
import Image from 'next/image';
import ConsultationCTA from '@/components/home/ConsultationCTA';
import { getSiteContent } from '@/lib/content';
import { getProjects } from '@/lib/projects-db';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    "Casements Africa Limited — Uganda's leading aluminium, glass, steel and wood finishing specialists with 60+ years of experience.",
};

const usps = [
  { title: 'End-to-End Expertise', body: 'We handle everything — design, fabrication and installation — ensuring perfect alignment from concept to completion.' },
  { title: 'Modern Design Systems', body: 'From powder-coated finishes to sleek curtain walls, our products blend durability with elegance.' },
  { title: 'Local Craftsmanship, Global Standards', body: 'Proudly Made in Uganda, trusted by top brands and developers region-wide.' },
  { title: 'On-Time, On-Point Delivery', body: 'Every detail, from measurement to handover, is handled with precision, professionalism and care.' },
];

const process = [
  { title: 'Site Assessment', body: 'Assessment of openings, conditions and technical requirements.' },
  { title: 'Quotation', body: 'Detailed, customized pricing — never copy-paste.' },
  { title: 'Shop Drawings', body: 'Technical blueprints with exact dimensions and details.' },
  { title: 'BOQs & Production', body: 'Bill of Quantities preparation, then precision fabrication.' },
  { title: 'Snug Work', body: 'Full dry-fit assembly in the factory to test alignment.' },
  { title: 'Installation & Final Touches', body: 'On-site installation and coordination to handover.' },
];

export default async function AboutPage() {
  const c = await getSiteContent();
  const projects = await getProjects();
  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-950">
        <Image src={c('about.hero.image') || '/images/about/factory.jpg'} alt="Casements Africa factory in Uganda" fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/80 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">{c('about.hero.eyebrow')}</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold text-white sm:text-5xl">
            {c('about.hero.title')}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100">
            {c('about.hero.mission')}
          </p>
        </div>
      </section>

      {/* USPs */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">What Makes Us Different</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-950 sm:text-4xl">
            While Others Install, We Craft Experiences
          </h2>
          <p className="mt-4 max-w-3xl text-brand-800/70">
            We don&rsquo;t believe in shortcuts; we believe in excellence that speaks for itself.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {usps.map((u) => (
              <div key={u.title} className="rounded-xl bg-steel-50 p-8 ring-1 ring-brand-100">
                <h3 className="font-display text-lg font-bold text-brand-950">{u.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-800/70">{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-steel-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Our Process</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-950 sm:text-4xl">
            Six Steps From Blueprint to Handover
          </h2>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {process.map((step, i) => (
              <li key={step.title} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
                <span className="font-display text-3xl font-extrabold text-brand-100">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 font-display font-bold text-brand-950">{step.title}</h3>
                <p className="mt-1 text-sm text-brand-800/70">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured projects */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Featured Projects</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-950 sm:text-4xl">
            Landmarks We&rsquo;ve Helped Build
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <article key={i} className="overflow-hidden rounded-xl bg-steel-50 ring-1 ring-brand-100">
                <div className="relative h-48">
                  <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="font-display font-bold text-brand-950">{p.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wide text-brand-500">{p.completion}</p>
                  <p className="mt-2 text-sm text-brand-800/70">{p.location}</p>
                  <p className="mt-3 text-sm text-brand-900">{p.scope}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ConsultationCTA />
    </>
  );
}
