import type { Metadata } from 'next';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { SITE_URL } from '@/lib/seo';
import { CORE_KEYWORDS } from '@/lib/seo-keywords';
import GoogleAdsTag from '@/components/seo/GoogleAdsTag';
import './globals.css';

// Google Tag Manager container (public identifier, safe to commit)
const GTM_ID = 'GTM-KR7G24KQ';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  title: {
    template: '%s | Casements Africa Limited',
    // Lead with what people search for, not the company name — every competitor
    // ranking for these terms puts the service and the country in the title.
    default: 'Aluminium Windows, Doors & Curtain Walling in Uganda | Casements Africa',
  },
  description:
    "Uganda's aluminium, glass, steel and wood fabrication specialists since 1965. Aluminium windows and doors, curtain walling, facades, partitions, balustrades and steel burglar proofing — designed, fabricated and installed. Plot 86/90, Industrial Area, Kampala.",
  keywords: CORE_KEYWORDS,
  openGraph: {
    siteName: 'Casements Africa Limited',
    type: 'website',
    images: [{ url: '/images/brand-hero.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', site: '@casementsug' },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/casements-icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
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
        {/* Google Ads global site tag */}
        <GoogleAdsTag />
      </body>
    </html>
  );
}
