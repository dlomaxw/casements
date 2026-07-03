const steps = [
  {
    title: 'Share Your Dream',
    description: 'Tell us your ideas, preferences and vision for the space.',
  },
  {
    title: 'Visualize It Together',
    description: 'Detailed CAD drawings turn your ideas into clear, buildable designs.',
  },
  {
    title: 'Tailored to You',
    description: 'Your desires meet our technical expertise, engineered to your exact openings.',
  },
  {
    title: 'Bring It Home',
    description: 'Watch your dream take shape as we craft and install — on time, snag-free.',
  },
];

export default function ProcessSteps() {
  return (
    <section className="bg-brand-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">How It Works</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
          Your Vision, Our Process
        </h2>

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <span className="font-display text-5xl font-extrabold text-white/10">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-200">{step.description}</p>
              {i < steps.length - 1 && (
                <svg
                  className="absolute right-0 top-4 hidden h-5 w-5 text-accent-500 lg:block"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden
                >
                  <path d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
