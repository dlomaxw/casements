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

interface ProductNavItem { slug: string; shortTitle?: string; title: string }

export default function CrmSidebar({ products }: { products: ProductNavItem[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const activeCategory = params.get('category');

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] z-40 w-64 bg-surface-container-lowest border-r border-aluminum-silver">
      <div className="p-6 border-b border-outline-variant/30">
        <h2 className="font-work text-lg font-bold text-industrial-blue">Lead Categories</h2>
        <p className="mt-1 text-xs font-medium text-on-surface-variant">Filter the pipeline by product</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <Link
          href="/crm/leads"
          className={`mx-2 my-1 flex items-center rounded-lg p-3 transition-all hover:translate-x-1 ${
            pathname === '/crm/leads' && !activeCategory
              ? 'bg-safety-orange text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Icon name="inbox" className="mr-3" />
          <span className="font-mono text-sm font-medium tracking-wide">All Leads</span>
        </Link>

        {products.map((p) => {
          const active = activeCategory === p.slug;
          return (
            <Link
              key={p.slug}
              href={`/crm/leads?category=${p.slug}`}
              className={`group mx-2 my-1 flex items-center rounded-lg p-3 transition-all hover:translate-x-1 ${
                active ? 'bg-safety-orange text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon name={ICONS[p.slug] ?? 'category'} className={`mr-3 ${active ? '' : 'group-hover:text-primary'}`} />
              <span className="font-mono text-sm font-medium tracking-wide">{p.shortTitle ?? p.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-2 mb-4 rounded-xl border border-outline-variant/20 bg-surface-container-high/50 p-4">
        <Link
          href="/products"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-industrial-blue py-3 font-mono text-sm font-medium text-white transition-all hover:opacity-90"
        >
          <Icon name="public" className="text-[18px]" />
          View Public Site
        </Link>
      </div>
    </aside>
  );
}
