'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Icon from './Icon';

const categories: { slug: string; label: string; icon: string }[] = [
  { slug: 'aluminium-doors-and-windows', label: 'Aluminium', icon: 'architecture' },
  { slug: 'ceiling', label: 'Ceiling', icon: 'grid_view' },
  { slug: 'curtain-wall', label: 'Curtain Wall', icon: 'layers' },
  { slug: 'facade', label: 'Facade', icon: 'domain' },
  { slug: 'partitions', label: 'Partitions', icon: 'splitscreen' },
  { slug: 'glass-products', label: 'Glass', icon: 'window' },
  { slug: 'interior-design', label: 'Interior Design', icon: 'format_paint' },
  { slug: 'railings', label: 'Railings', icon: 'fence' },
  { slug: 'steel-products', label: 'Steel', icon: 'construction' },
];

export default function CrmSidebar() {
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

        {categories.map((c) => {
          const active = activeCategory === c.slug;
          return (
            <Link
              key={c.slug}
              href={`/crm/leads?category=${c.slug}`}
              className={`group mx-2 my-1 flex items-center rounded-lg p-3 transition-all hover:translate-x-1 ${
                active ? 'bg-safety-orange text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon name={c.icon} className={`mr-3 ${active ? '' : 'group-hover:text-primary'}`} />
              <span className="font-mono text-sm font-medium tracking-wide">{c.label}</span>
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
