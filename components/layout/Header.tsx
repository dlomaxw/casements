'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { productCategories } from '@/lib/products';
import MobileNav from './MobileNav';

export interface SiteContact {
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  ribbon: string;
}

const navLinks = [
  { href: '/about-us', label: 'About Us' },
  { href: '/products', label: 'Products', dropdown: true },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/csr', label: 'CSR' },
  { href: '/testimonials', label: 'Testimonials' },
];

export default function Header({ contact }: { contact: SiteContact }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Top ribbon */}
      <div className="bg-brand-950 text-center text-xs font-medium tracking-wide text-accent-400">
        <p className="px-4 py-1.5">{contact.ribbon}</p>
      </div>

      <div
        className={`transition-colors duration-300 ${
          scrolled ? 'bg-white/95 shadow-md backdrop-blur' : 'bg-white'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded bg-brand-900 font-display text-lg font-bold text-accent-400">
              CA
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-brand-950">
                Casements Africa
              </span>
              <span className="block text-[11px] uppercase tracking-[0.2em] text-brand-500">
                Limited
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.href} className="group relative">
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 rounded px-3 py-2 text-sm font-medium text-brand-900 hover:text-brand-600"
                  >
                    {link.label}
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </Link>
                  <div className="invisible absolute left-0 top-full w-72 rounded-lg border border-brand-100 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                    {productCategories.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/products/${p.slug}`}
                        className="block rounded px-3 py-2 text-sm text-brand-900 hover:bg-brand-50 hover:text-brand-600"
                      >
                        {p.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded px-3 py-2 text-sm font-medium text-brand-900 hover:text-brand-600"
                >
                  {link.label}
                </Link>
              ),
            )}
            <a
              href={contact.phoneHref}
              className="ml-3 rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-950 hover:bg-accent-400"
            >
              {contact.phone}
            </a>
          </nav>

          <MobileNav phone={contact.phone} phoneHref={contact.phoneHref} />
        </div>
      </div>
    </header>
  );
}
