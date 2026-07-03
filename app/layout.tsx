import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="en">
      <body>
        {children}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
