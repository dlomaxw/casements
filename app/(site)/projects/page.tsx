import type { Metadata } from 'next';
import Image from 'next/image';
import ConsultationCTA from '@/components/home/ConsultationCTA';
import { getSiteContent, resolveProjects } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A portfolio of completed installations by Casements Africa — towers, offices and residences across Kampala and East Africa.',
};

export default async function ProjectsPage() {
  const c = await getSiteContent();
  const projects = resolveProjects(c);
  return (
    <>
      <section className="bg-brand-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">{c('projects.hero.eyebrow')}</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">{c('projects.hero.title')}</h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-100">
            {c('projects.hero.subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-steel-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {projects.map((p, i) => (
            <article key={i} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-brand-100">
              <div className="relative h-64">
                <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-xl font-bold text-brand-950">{p.name}</h2>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">{p.completion}</span>
                </div>
                <p className="mt-2 text-sm text-brand-800/70">{p.location}</p>
                <p className="mt-4 text-sm text-brand-900">
                  <span className="font-semibold text-brand-950">Scope: </span>{p.scope}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ConsultationCTA />
    </>
  );
}
