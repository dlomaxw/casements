import type { Metadata } from 'next';
import ConsultationCTA from '@/components/home/ConsultationCTA';

export const metadata: Metadata = {
  title: 'Corporate Social Responsibility',
  description:
    'How Casements Africa gives back — investing in local craftsmanship, skills training and sustainable building practices across Uganda.',
};

const pillars = [
  {
    title: 'Skills & Employment',
    body: 'We train and employ local fabricators, welders and installers — building careers and keeping expertise in Uganda.',
  },
  {
    title: 'Sustainable Practices',
    body: 'Energy-efficient aluminium and glazing systems reduce the lifetime energy use of the buildings we help create.',
  },
  {
    title: 'Community Investment',
    body: 'We support the communities we work in, contributing to safe, durable public and educational spaces.',
  },
];

export default function CsrPage() {
  return (
    <>
      <section className="bg-brand-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">Corporate Social Responsibility</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">Building More Than Structures</h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-100">
            For over 60 years, our work has been about people as much as materials. We invest in local
            craftsmanship, sustainable building and the communities we serve.
          </p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-xl bg-steel-50 p-8 ring-1 ring-brand-100">
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
