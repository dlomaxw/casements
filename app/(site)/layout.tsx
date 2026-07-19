import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Analytics from '@/components/layout/Analytics';
import { getSiteContent, telHref } from '@/lib/content';
import { getProductNav } from '@/lib/products-db';
import JsonLd from '@/components/seo/JsonLd';
import { localBusinessSchema, organizationSchema, websiteSchema } from '@/lib/schema';

export const dynamic = 'force-dynamic';

// Public marketing site chrome (Header + Footer). The CRM has its own layout.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const c = await getSiteContent();
  const products = await getProductNav();
  const contact = {
    phone: c('site.phone'),
    phoneHref: telHref(c('site.phone')),
    email: c('site.email'),
    address: c('site.address'),
    ribbon: c('site.ribbon'),
  };
  return (
    <>
      {/* Sitewide structured data */}
      <JsonLd data={organizationSchema(contact)} />
      <JsonLd data={localBusinessSchema(contact)} />
      <JsonLd data={websiteSchema()} />
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>
      <Header contact={contact} products={products} />
      <main>{children}</main>
      <Footer contact={contact} products={products} />
    </>
  );
}
