import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import ProductEditor from '@/components/crm/ProductEditor';
import Icon from '@/components/crm/Icon';
import type { GalleryItem } from '@/lib/products-db';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_content')) redirect('/crm');

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/crm/products" className="flex items-center gap-1 font-mono text-xs text-on-surface-variant hover:text-safety-orange">
          <Icon name="arrow_back" className="text-[16px]" /> Back to products
        </Link>
        {product.published && (
          <Link href={`/products/${product.slug}`} target="_blank" className="flex items-center gap-1 font-mono text-xs text-primary hover:underline">
            <Icon name="open_in_new" className="text-[16px]" /> View live
          </Link>
        )}
      </div>
      <h1 className="mb-6 mt-4 font-work text-2xl font-semibold text-industrial-blue">Edit Product</h1>
      <ProductEditor
        initial={{
          id: product.id,
          title: product.title,
          shortTitle: product.shortTitle,
          type: product.type,
          description: product.description,
          longDescription: product.longDescription,
          image: product.image,
          imageAlt: product.imageAlt ?? '',
          videoUrl: product.videoUrl ?? '',
          subItems: product.subItems,
          gallery: Array.isArray(product.gallery) ? (product.gallery as unknown as GalleryItem[]) : [],
          keywords: product.keywords,
          published: product.published,
        }}
      />
    </div>
  );
}
