import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getSiteContent, telHref } from '@/lib/content';
import { getProductNav } from '@/lib/products-db';

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
      <Header contact={contact} products={products} />
      <main>{children}</main>
      <Footer contact={contact} products={products} />
    </>
  );
}
