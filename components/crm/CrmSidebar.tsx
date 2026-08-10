'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Icon from './Icon';

// Known category → icon map; new products fall back to a generic icon.
const ICONS: Record<string, string> = {
  'aluminium-doors-and-windows': 'architecture',
  ceiling: 'grid_view',
  'curtain-wall': 'layers',
  facade: 'domain',
  partitions: 'splitscreen',
  'glass-products': 'window',
  'interior-design': 'format_paint',
  railings: 'fence',
  'steel-products': 'construction',
};

const QUOTATION_URL = 'http://favourwings.com/quotations/quotation_system/';

interface ProductNavItem { slug: string; shortTitle?: string; title: string }
export interface MainNavItem { href: string; icon: string; label: string; external?: boolean }

export default function CrmSidebar({ products, mainNav }: { products: ProductNavItem[]; mainNav: MainNavItem[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const activeCategory = params.get('category');

  const rowBase = 'mx-2 my-0.5 flex items-center rounded-lg px-3 py-2.5 transition-all';
  const rowIdle = 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1';
  const rowActive = 'bg-primary-container/20 font-semibold text-primary';

  return (
    <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-64px)] w-64 flex-col border-r border-aluminum-silver bg-surface-container-lowest lg:flex">
      <nav className="flex-1 overflow-y-auto py-4">
        {mainNav.map((item) => {
          // "/crm" must match exactly; every other entry matches its subtree.
          const active = !item.external && (item.href === '/crm' ? pathname === '/crm' : pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={`${rowBase} ${active ? rowActive : rowIdle}`}
            >
              <Icon name={item.icon} className="mr-3 text-[20px]" />
              <span className="font-sans text-sm">{item.label}</span>
            </Link>
          );
        })}

        {products.length > 0 && (
          <>
            <p className="mt-6 px-5 pb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
              Lead Categories
            </p>
            <Link
              href="/crm/leads"
              className={`${rowBase} ${pathname === '/crm/leads' && !activeCategory ? 'bg-safety-orange text-white shadow-sm' : rowIdle}`}
            >
              <Icon name="inbox" className="mr-3 text-[20px]" />
              <span className="font-mono text-sm tracking-wide">All Leads</span>
            </Link>

            {products.map((p) => {
              const active = activeCategory === p.slug;
              return (
                <Link
                  key={p.slug}
                  href={`/crm/leads?category=${p.slug}`}
                  className={`${rowBase} ${active ? 'bg-safety-orange text-white shadow-sm' : rowIdle}`}
                >
                  <Icon name={ICONS[p.slug] ?? 'category'} className="mr-3 text-[20px]" />
                  <span className="font-mono text-sm tracking-wide">{p.shortTitle ?? p.title}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="mx-2 mb-4 space-y-2 border-t border-outline-variant/30 pt-4">
        <a
          href={QUOTATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-3 rounded-lg bg-safety-orange/15 px-3 py-3 font-mono text-sm font-semibold text-industrial-blue transition-all hover:bg-safety-orange/25"
        >
          <Icon name="request_quote" className="text-[20px] text-safety-orange" />
          Quotation System
        </a>
        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-mono text-sm text-on-surface-variant transition-all hover:bg-surface-container-high"
        >
          <Icon name="open_in_new" className="text-[20px]" />
          View public site
        </Link>
      </div>
    </aside>
  );
}
