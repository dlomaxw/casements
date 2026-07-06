import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { can } from '@/lib/roles';
import { getAllProductsAdmin } from '@/lib/products-db';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function ProductsAdminPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_content')) redirect('/crm');

  const products = await getAllProductsAdmin();
  const live = products.filter((p) => p.published).length;

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Products</h1>
          <p className="mt-2 font-mono text-sm text-on-surface-variant">
            <span className="text-safety-orange">Catalogue</span> › {products.length} products · {live} live
          </p>
        </div>
        <Link href="/crm/products/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-mono text-sm font-medium text-white hover:opacity-90">
          <Icon name="add" className="text-[18px]" /> New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Link key={p.id} href={`/crm/products/${p.id}/edit`}
            className="group overflow-hidden rounded-xl border border-outline-variant bg-white transition-colors hover:border-safety-orange">
            <div className="relative h-40 bg-surface-container-high">
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image.startsWith('/images') ? p.image : p.image} alt={p.imageAlt} className="h-full w-full object-cover" />
              )}
              {!p.published && <span className="absolute left-2 top-2 rounded bg-secondary-container px-2 py-0.5 font-mono text-[10px] font-bold text-on-secondary-container">DRAFT</span>}
              {p.videoUrl && <Icon name="smart_display" className="absolute right-2 top-2 text-safety-orange" filled />}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-work font-bold text-industrial-blue group-hover:text-safety-orange">{p.title}</p>
                <span className="shrink-0 rounded bg-primary-container/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-primary">{p.type}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{p.description}</p>
              <div className="mt-2 flex gap-3 font-mono text-[11px] text-outline">
                <span>{p.subItems.length} features</span>
                <span>{p.gallery.length} gallery</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
