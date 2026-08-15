import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/ui/ContactForm';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';
import { canonical } from '@/lib/seo';
import { getSiteContent, telHref } from '@/lib/content';
import { CORE_KEYWORDS } from '@/lib/seo-keywords';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us — Free Quote on Aluminium & Glass Works',
  description:
    'Contact Casements (A) Ltd — Plot 86/90, 5th Street, Industrial Area, Kampala. Call +256 752 700 700 or email sales@casements.co.ug for a free quote on aluminium windows, doors, curtain walling and steel works.',
  keywords: [...CORE_KEYWORDS, 'aluminium quote Uganda', 'free quote aluminium windows Kampala', 'aluminium company Industrial Area Kampala'],
  alternates: { canonical: canonical('/contact') },
};

function Icon({ path }: { path: string }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={path} />
    </svg>
  );
}

const PATHS = {
  phone: 'M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.6 1 1 0 01-.25 1L6.6 10.8z',
  mail: 'M4 4h16v16H4z M22 6l-10 7L2 6',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z',
  clock: 'M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2',
  chat: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
};

export default async function ContactPage() {
  const c = await getSiteContent();
  const address = c('site.address');
  const email = c('site.email');
  const phones = [c('site.phone'), c('site.phone2'), c('site.phone3')].filter(Boolean);
  const tollFree = c('site.tollfree');
  const mapQuery = encodeURIComponent(address || 'Casements Africa, Industrial Area, Kampala');

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])} />

      {/* Hero */}
      <section className="bg-brand-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-500">{c('contact.hero.eyebrow')}</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold text-white sm:text-5xl">{c('contact.hero.title')}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100/85">{c('contact.hero.subtitle')}</p>
        </div>
      </section>

      {/* Quick contact cards */}
      <section className="bg-steel-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Call */}
            <div className="rounded-2xl border border-brand-100 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Icon path={PATHS.phone} />
              </div>
              <h2 className="mt-5 font-display text-lg font-bold text-steel-950">Call the sales team</h2>
              <ul className="mt-3 space-y-1.5">
                {phones.map((p) => (
                  <li key={p}>
                    <a href={telHref(p)} className="text-sm font-semibold text-brand-600 hover:text-brand-700">{p}</a>
                  </li>
                ))}
                {tollFree && (
                  <li className="pt-1">
                    <a href={telHref(tollFree)} className="text-sm text-steel-800/70 hover:text-brand-600">
                      <span className="font-medium text-steel-900">Toll free:</span> {tollFree}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-brand-100 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Icon path={PATHS.mail} />
              </div>
              <h2 className="mt-5 font-display text-lg font-bold text-steel-950">Email us</h2>
              <a href={`mailto:${email}`} className="mt-3 block text-sm font-semibold text-brand-600 hover:text-brand-700">{email}</a>
              <p className="mt-2 text-sm text-steel-800/70">Send drawings, BOQs or specifications and we&rsquo;ll quote from them.</p>
            </div>

            {/* Visit */}
            <div className="rounded-2xl border border-brand-100 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Icon path={PATHS.pin} />
              </div>
              <h2 className="mt-5 font-display text-lg font-bold text-steel-950">Visit the workshop</h2>
              <p className="mt-3 text-sm text-steel-800/80">{address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Get directions
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Form + hours/WhatsApp */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Send a message</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-steel-950 sm:text-4xl">Tell us what you need</h2>
            <p className="mt-4 max-w-md text-steel-800/70">
              Share a few details about your project and a sales engineer will get back to you — usually within one business day.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-steel-50 p-4">
                <span className="mt-0.5 text-brand-500"><Icon path={PATHS.clock} /></span>
                <div>
                  <p className="text-sm font-semibold text-steel-950">Opening hours</p>
                  <p className="mt-0.5 text-sm text-steel-800/70">{c('site.hours')}</p>
                </div>
              </div>
              <a
                href={`https://wa.me/${c('site.phone').replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-xl border border-brand-100 bg-steel-50 p-4 transition-colors hover:border-brand-300"
              >
                <span className="mt-0.5 text-[#25D366]"><Icon path={PATHS.chat} /></span>
                <div>
                  <p className="text-sm font-semibold text-steel-950">Chat on WhatsApp</p>
                  <p className="mt-0.5 text-sm text-steel-800/70">Fastest way to reach us during working hours.</p>
                </div>
              </a>
              <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-steel-50 p-4">
                <span className="mt-0.5 text-brand-500"><Icon path={PATHS.pin} /></span>
                <div>
                  <p className="text-sm font-semibold text-steel-950">Looking for a product?</p>
                  <p className="mt-0.5 text-sm text-steel-800/70">
                    Browse the <Link href="/products" className="font-semibold text-brand-600 hover:underline">product catalogue</Link> and request a quote from any page.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* Map */}
      <section className="bg-steel-50 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-brand-100 shadow-sm">
            <iframe
              title="Casements (A) Ltd location map"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[420px] w-full border-0"
            />
          </div>
        </div>
      </section>
    </>
  );
}
