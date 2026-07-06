import type { Metadata } from 'next';
import ProductCard from '@/components/products/ProductCard';
import ConsultationCTA from '@/components/home/ConsultationCTA';
import { getSiteContent, resolveProducts } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Aluminium doors & windows, curtain walls, facades, glass products, ceilings, partitions, railings and steel security systems — fabricated and installed across Uganda.',
};

export default async function ProductsPage() {
  const c = await getSiteContent();
  const products = resolveProducts(c);
  return (
    <>
      <section className="bg-brand-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">{c('products.hero.eyebrow')}</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">
            {c('products.hero.title')}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-100">
            {c('products.hero.subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-steel-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
          {products.map((p) => (
            <ProductCard
              key={p.slug}
              title={p.title}
              description={p.description}
              image={p.image}
              imageAlt={p.imageAlt}
              href={`/products/${p.slug}`}
            />
          ))}
        </div>
      </section>

      <ConsultationCTA />
    </>
  );
}
