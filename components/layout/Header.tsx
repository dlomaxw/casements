'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import MobileNav from './MobileNav';
import { useQuoteModal } from '@/components/shared/QuoteModal';

export interface SiteContact {
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  ribbon: string;
}

export interface ProductNavItem { slug: string; title: string; shortTitle?: string }

const navLinks = [
  { href: '/about-us', label: 'About' },
  { href: '/products', label: 'Products', dropdown: true },
  { href: '/projects', label: 'Projects' },
  { href: '/csr', label: 'CSR' },
  { href: '/blog', label: 'Blog' },
];

export default function Header({ contact, products }: { contact: SiteContact; products: ProductNavItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { open: openQuote } = useQuoteModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 w-full py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-full transition-all duration-300 lg:grid-cols-[1fr_auto_1fr] ${
            scrolled ? 'bg-white/90 px-3 py-2 shadow-md shadow-black/[0.06] backdrop-blur-md' : 'bg-transparent'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="shrink-0 justify-self-start">
            <Image
              src="/images/casements-logo-lockup.png"
              alt="Casements (A) LTD — Aluminium, Glass, Steel, Wood since 1965"
              width={120}
              height={108}
              className="h-16 w-auto object-contain sm:h-20"
              priority
            />
          </Link>

          {/* Desktop nav pill */}
          <nav
            className={`col-start-2 row-start-1 hidden items-center gap-1 justify-self-center rounded-full transition-colors duration-300 lg:flex ${
              !scrolled ? 'border border-brand-100 bg-white/90 p-1.5 shadow-sm shadow-black/[0.04] backdrop-blur-md' : ''
            }`}
            aria-label="Main navigation"
          >
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.href} className="group relative">
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                      isActive(link.href) ? 'bg-brand-500 text-white shadow-sm' : 'text-steel-800/70 hover:text-steel-900'
                    }`}
                  >
                    {link.label}
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </Link>
                  <div className="invisible absolute left-1/2 top-full max-h-[70vh] w-72 -translate-x-1/2 overflow-y-auto rounded-2xl border border-brand-100 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                    {products.map((p) => (
                      <Link key={p.slug} href={`/products/${p.slug}`} className="block rounded-xl px-3 py-2 text-sm text-steel-800 hover:bg-brand-50 hover:text-brand-600">
                        {p.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                    isActive(link.href) ? 'bg-brand-500 text-white shadow-sm' : 'text-steel-800/70 hover:text-steel-900'
                  }`}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-3 justify-self-end lg:flex">
            <a
              href={contact.phoneHref}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-steel-800/80 transition-colors hover:text-brand-600 ${
                !scrolled ? 'border border-brand-100 bg-white/90 shadow-sm shadow-black/[0.04] backdrop-blur-md' : ''
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.6 1 1 0 01-.25 1L6.6 10.8z" /></svg>
              <span className="hidden xl:inline">{contact.phone}</span>
            </a>
            <button type="button" onClick={() => openQuote()} className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600">
              Get a Quote
            </button>
          </div>

          <MobileNav phone={contact.phone} phoneHref={contact.phoneHref} products={products} scrolled={scrolled} />
        </div>
      </div>
    </header>
  );
}
