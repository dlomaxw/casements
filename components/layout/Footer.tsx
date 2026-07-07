import Link from 'next/link';
import Image from 'next/image';
import { site } from '@/lib/site';

const socials = [
  { label: 'Facebook', href: site.social.facebook, icon: 'M13.5 9H15V6.5h-1.5c-1.933 0-3.5 1.567-3.5 3.5v1.5H8V14h2v8h3v-8h2.1l.4-2.5H13v-1a1 1 0 011-1z' },
  { label: 'X (Twitter)', href: site.social.x, icon: 'M4 4l7.1 9.5L4.4 20h2.3l5.4-5.2 3.9 5.2H20l-7.4-9.9L18.9 4h-2.3l-4.9 4.8L8 4H4z' },
  { label: 'TikTok', href: site.social.tiktok, icon: 'M16.5 4c.3 1.8 1.5 3.2 3.5 3.5V10c-1.3 0-2.5-.4-3.5-1.1v5.6a5.5 5.5 0 11-5.5-5.5c.2 0 .5 0 .7.1v2.6a2.9 2.9 0 102.1 2.8V4h2.7z' },
  { label: 'Instagram', href: site.social.instagram, icon: 'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM6.5 4h11A2.5 2.5 0 0120 6.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 17.5v-11A2.5 2.5 0 016.5 4zm10.75 2a.75.75 0 100 1.5.75.75 0 000-1.5zM12 10a2 2 0 110 4 2 2 0 010-4z' },
];

import type { SiteContact, ProductNavItem } from './Header';

export default function Footer({ contact, products }: { contact: SiteContact; products: ProductNavItem[] }) {
  return (
    <footer className="bg-brand-950 text-brand-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div>
          <Link href="/" className="inline-flex rounded-lg bg-white p-3" aria-label="Casements (A) Ltd — home">
            <Image
              src="/images/casements-logo.png"
              alt="Casements (A) Ltd — Aluminium, Glass, Steel, Wood since 1965"
              width={160}
              height={160}
              className="h-20 w-auto object-contain"
            />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-brand-200">
            Uganda&rsquo;s leading aluminium, glass, steel and wood finishing specialists —
            60+ years of engineering trust, beauty and precision.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-brand-100 transition-colors hover:bg-accent-500 hover:text-brand-950"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d={s.icon} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Products</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`} className="text-brand-200 hover:text-accent-400">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Company</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/about-us" className="text-brand-200 hover:text-accent-400">About Us</Link></li>
            <li><Link href="/projects" className="text-brand-200 hover:text-accent-400">Projects</Link></li>
            <li><Link href="/csr" className="text-brand-200 hover:text-accent-400">CSR</Link></li>
            <li><Link href="/testimonials" className="text-brand-200 hover:text-accent-400">Testimonials</Link></li>
            <li><Link href="/crm" className="text-brand-200 hover:text-accent-400">Staff CRM Login</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-brand-200">
            <li>{contact.address}</li>
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-accent-400">{contact.email}</a>
            </li>
            <li>
              <a href={contact.phoneHref} className="font-semibold text-accent-400 hover:text-accent-500">
                {contact.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-brand-300 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} Casements Africa Limited. All rights reserved. &middot; Built to Last, Delivered as Promised.
        </p>
      </div>
    </footer>
  );
}
