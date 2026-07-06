import type { Metadata } from 'next';
import ConsultationCTA from '@/components/home/ConsultationCTA';
import { getSiteContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Corporate Social Responsibility',
  description:
    'How Casements Africa gives back — investing in local craftsmanship, skills training and sustainable building practices across Uganda.',
};

export default async function CsrPage() {
  const c = await getSiteContent();
  const pillars = [0, 1, 2].map((i) => ({ title: c(`csr.pillar.${i}.title`), body: c(`csr.pillar.${i}.body`) }));
  return (
    <>
      <section className="bg-brand-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">{c('csr.hero.eyebrow')}</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">{c('csr.hero.title')}</h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-100">
            {c('csr.hero.subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {pillars.map((p, i) => (
            <div key={i} className="rounded-xl bg-steel-50 p-8 ring-1 ring-brand-100">
              <h2 className="font-display text-lg font-bold text-brand-950">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-800/70">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <ConsultationCTA />
    </>
  );
}
