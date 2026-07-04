'use client';

import Link from 'next/link';
import { useState } from 'react';
import { productCategories } from '@/lib/products';
import { site } from '@/lib/site';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  const close = () => {
    setOpen(false);
    setProductsOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded text-brand-950"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full max-h-[80vh] overflow-y-auto border-t border-brand-100 bg-white shadow-xl">
          <nav className="flex flex-col p-4" aria-label="Mobile navigation">
            <Link href="/about-us" onClick={close} className="rounded px-3 py-3 font-medium text-brand-900 hover:bg-brand-50">
              About Us
            </Link>

            {/* Products accordion */}
            <button
              type="button"
              onClick={() => setProductsOpen(!productsOpen)}
              aria-expanded={productsOpen}
              className="flex items-center justify-between rounded px-3 py-3 text-left font-medium text-brand-900 hover:bg-brand-50"
            >
              Products
              <svg
                className={`h-4 w-4 transition-transform ${productsOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 12 12" fill="none" aria-hidden
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {productsOpen && (
              <div className="ml-3 border-l border-brand-100 pl-3">
                <Link href="/products" onClick={close} className="block rounded px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                  All Products
                </Link>
                {productCategories.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    onClick={close}
                    className="block rounded px-3 py-2 text-sm text-brand-900 hover:bg-brand-50"
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/projects" onClick={close} className="rounded px-3 py-3 font-medium text-brand-900 hover:bg-brand-50">
              Projects
            </Link>
            <Link href="/blog" onClick={close} className="rounded px-3 py-3 font-medium text-brand-900 hover:bg-brand-50">
              Blog
            </Link>
            <Link href="/csr" onClick={close} className="rounded px-3 py-3 font-medium text-brand-900 hover:bg-brand-50">
              CSR
            </Link>
            <Link href="/testimonials" onClick={close} className="rounded px-3 py-3 font-medium text-brand-900 hover:bg-brand-50">
              Testimonials
            </Link>

            <a
              href={site.phoneHref}
              className="mt-3 rounded-md bg-accent-500 px-4 py-3 text-center font-semibold text-brand-950"
            >
              Call {site.phone}
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
