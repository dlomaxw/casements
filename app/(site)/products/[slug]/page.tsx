import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ProductHero from '@/components/products/ProductHero';
import QuoteForm from '@/components/ui/QuoteForm';
import { getProductBySlugDb } from '@/lib/products-db';
import { getProductNav } from '@/lib/products-db';
import { toEmbedUrl } from '@/lib/blog';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, faqPageSchema, productServiceSchema } from '@/lib/schema';
import { canonical } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlugDb(params.slug);
  if (!product) return { title: 'Product Not Found' };
  const url = canonical(`/products/${params.slug}`);
  return {
    title: product.title,
    description: product.description,
    keywords: product.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: product.title,
      description: product.description,
      url,
      type: 'website',
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlugDb(params.slug);
  if (!product) notFound();
  const nav = await getProductNav();
  const embed = toEmbedUrl(product.videoUrl);

  return (
    <>
      <JsonLd data={productServiceSchema(product)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
          { name: product.title, path: `/products/${product.slug}` },
        ])}
      />
      {/* Only emitted when the FAQs are actually rendered below */}
      {product.faqs.length > 0 && <JsonLd data={faqPageSchema(product.faqs)} />}
      <ProductHero
        title={product.title}
        description={product.description}
        image={product.image}
        imageAlt={product.imageAlt}
      />

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-brand-950">Overview</h2>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-brand-800/80">{product.longDescription}</p>

            {product.subItems.length > 0 && (
              <>
                <h3 className="mt-10 font-display text-lg font-bold text-brand-950">What we offer</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {product.subItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-brand-900">
                      <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {embed && (
              <>
                <h3 className="mt-12 font-display text-lg font-bold text-brand-950">Watch</h3>
                <div className="mt-4 aspect-video overflow-hidden rounded-lg ring-1 ring-brand-100">
                  <iframe src={embed} title={product.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" />
                </div>
              </>
            )}

            {product.faqs.length > 0 && (
              <>
                <h3 className="mt-12 font-display text-lg font-bold text-brand-950">Frequently Asked Questions</h3>
                <div className="mt-4 divide-y divide-brand-100 rounded-lg ring-1 ring-brand-100">
                  {product.faqs.map((f, i) => (
                    <details key={i} className="group p-5" open={i === 0}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-brand-950">
                        {f.question}
                        <svg className="h-5 w-5 shrink-0 text-accent-500 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </summary>
                      <p className="mt-3 whitespace-pre-wrap leading-relaxed text-brand-800/80">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </>
            )}

            {product.gallery.length > 0 && (
              <>
                <h3 className="mt-12 font-display text-lg font-bold text-brand-950">Gallery</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {product.gallery.map((g) => (
                    <div key={g.src} className="relative h-56 overflow-hidden rounded-lg ring-1 ring-brand-100">
                      <Image src={g.src} alt={g.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <QuoteForm defaultCategory={product.slug} categories={nav} />
          </div>
        </div>
      </section>
    </>
  );
}
