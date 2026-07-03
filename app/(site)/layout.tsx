import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Public marketing site chrome (Header + Footer). The CRM has its own layout.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
