const services = [
  {
    title: 'Technical Guidance',
    description: 'Expert advice from site assessment to final specification.',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    title: 'Fabrication',
    description: 'Precision manufacturing in our Kampala factory.',
    icon: 'M11.42 15.17L17.25 21A2.65 2.65 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085',
  },
  {
    title: 'Installation',
    description: 'Certified teams delivering on time, snag-free.',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

export default function ServicesStrip() {
  return (
    <section className="border-b border-brand-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {services.map((s) => (
          <div key={s.title} className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={s.icon} />
              </svg>
            </span>
            <div>
              <h3 className="font-display font-bold text-brand-950">{s.title}</h3>
              <p className="mt-1 text-sm text-brand-800/70">{s.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
