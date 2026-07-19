// Single source of truth for the canonical site URL.
// Set NEXT_PUBLIC_SITE_URL in Vercel; falls back to the live domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://casements.co.ug').replace(/\/$/, '');

export const ORG = {
  name: 'Casements Africa Limited',
  legalName: 'Casements Africa Limited',
  street: 'Plot 86, 5th Street, Industrial Area',
  city: 'Kampala',
  country: 'UG',
  phone: '+256752700700',
  email: 'sales@casements.co.ug',
  founded: '1965',
  sameAs: [
    'https://www.facebook.com/p/Casements-Africa-Ltd-100064083633591',
    'https://x.com/casementsug',
    'https://www.tiktok.com/@casements_africa',
    'https://www.instagram.com/casements_ug',
  ],
};

export function canonical(path = '/'): string {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}
