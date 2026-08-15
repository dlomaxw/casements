import type { Metadata } from 'next';
import ProductCard from '@/components/products/ProductCard';
import ConsultationCTA from '@/components/home/ConsultationCTA';
import { getSiteContent } from '@/lib/content';
import { getProducts } from '@/lib/products-db';
import { canonical } from '@/lib/seo';
import { CORE_KEYWORDS } from '@/lib/seo-keywords';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, offerCatalogSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Aluminium, Glass & Steel Products in Uganda',
  description:
    'Aluminium doors & windows, curtain walling, facades and ACP cladding, glass products, suspended ceilings, office partitions, balustrades and steel burglar proofing — fabricated and installed across Uganda since 1965.',
  keywords: [...CORE_KEYWORDS, 'aluminium products Uganda', 'curtain walling Kampala', 'burglar proofing Uganda', 'office partitions Kampala', 'balustrades Uganda'],
  alternates: { canonical: canonical('/products') },
};

export default async function ProductsPage() {
  const c = await getSiteContent();
  const products = await getProducts();
  return (
    <>
      <JsonLd data={offerCatalogSchema(products)} />
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Products', path: '/products' }])} />
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
              type={p.type}
              href={`/products/${p.slug}`}
            />
          ))}
        </div>
      </section>

      <ConsultationCTA />
    </>
  );
}
