import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Analytics from '@/components/layout/Analytics';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { getSiteContent, telHref } from '@/lib/content';
import { getProductNav } from '@/lib/products-db';
import JsonLd from '@/components/seo/JsonLd';
import CallConversionTracker from '@/components/seo/CallConversionTracker';
import { localBusinessSchema, organizationSchema, websiteSchema } from '@/lib/schema';
import QuoteModalProvider from '@/components/shared/QuoteModal';
import Chatbot from '@/components/shared/Chatbot';

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
      <CallConversionTracker />
      <QuoteModalProvider categories={products.map((p) => ({ slug: p.slug, title: p.title }))}>
        <Header contact={contact} products={products} />
        <main>{children}</main>
        <Footer contact={contact} products={products} />
        <WhatsAppButton phone={contact.phone} />
        <Chatbot />
      </QuoteModalProvider>
    </>
  );
}
