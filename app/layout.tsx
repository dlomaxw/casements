import type { Metadata } from 'next';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import './globals.css';

// Google Tag Manager container (public identifier, safe to commit)
const GTM_ID = 'GTM-KR7G24KQ';

export const metadata: Metadata = {
  metadataBase: new URL('https://casements.co.ug'),
  title: {
    template: '%s | Casements Africa Limited',
    default: 'Casements Africa Limited | Aluminium, Steel, Glass & Wood',
  },
  description:
    "Uganda's leading aluminium, glass, steel and wood finishing specialists. 60+ years of experience. Plot 86, Industrial Area, Kampala.",
  openGraph: {
    siteName: 'Casements Africa Limited',
    type: 'website',
    images: [{ url: '/images/brand-hero.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', site: '@casementsug' },
  robots: { index: true, follow: true },
  icons: {
    icon: '/images/casements-logo.png',
    apple: '/images/casements-logo.png',
  },
  // Google Search Console ownership verification
  verification: {
    google: 'LL-Ed6dKicPrtejxQz84POk5jXrZvhcwteaRbCeXVPc',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="en">
      <body>
        {/* Loads the GTM container script (next/script hoists it into <head>) */}
        <GoogleTagManager gtmId={GTM_ID} />
        {/* GTM fallback for browsers without JavaScript — must sit immediately after <body> */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
