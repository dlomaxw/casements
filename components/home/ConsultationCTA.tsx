import { getSiteContent, telHref } from '@/lib/content';

export default async function ConsultationCTA() {
  const c = await getSiteContent();
  const phone = c('site.phone');

  return (
    <section className="bg-accent-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-brand-950 sm:text-3xl">
            {c('home.cta.title')}
          </h2>
          <p className="mt-1 text-brand-900/80">
            {c('home.cta.subtitle')}
          </p>
        </div>
        <a
          href={telHref(phone)}
          className="inline-flex items-center gap-3 rounded-lg bg-brand-950 px-8 py-4 font-display text-xl font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          <svg className="h-6 w-6 text-accent-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.6 1 1 0 01-.25 1L6.6 10.8z" />
          </svg>
          {phone}
        </a>
      </div>
    </section>
  );
}
