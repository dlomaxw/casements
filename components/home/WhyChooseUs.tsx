import { getSiteContent } from '@/lib/content';

const ICONS = [
  <svg key="1" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 4v5c0 4.4-3 8.3-7 9-4-.7-7-4.6-7-9V7l7-4z" /><path d="M9 12l2 2 4-4" /></svg>,
  <svg key="2" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5" /></svg>,
  <svg key="3" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M11 3L8 9l4 12 4-12-3-6" /><path d="M2 9h20" /></svg>,
];

export default async function WhyChooseUs() {
  const c = await getSiteContent();
  const pillars = [1, 2, 3].map((i) => ({
    icon: ICONS[i - 1],
    title: c(`home.why${i}.title`),
    description: c(`home.why${i}.body`),
  }));

  return (
    <section className="bg-steel-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">{c('home.why.eyebrow')}</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-steel-950 sm:text-4xl">{c('home.why.title')}</h2>
          <p className="mt-4 text-steel-800/70">
            {c('home.why.subtitle')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-brand-100 bg-white p-8 shadow-sm shadow-black/[0.03]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white">
                {pillar.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-steel-950">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel-800/70">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
