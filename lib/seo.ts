// Single source of truth for the canonical site URL.
//
// The canonical host is always the brand domain. NEXT_PUBLIC_SITE_URL can point
// it elsewhere (a staging host, say), but a *.vercel.app value is ignored: those
// are deployment addresses, and emitting them in canonicals, sitemap entries and
// schema @ids tells Google the real site lives there instead of on casements.co.ug.
const CANONICAL_HOST = 'https://casements.co.ug';

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (!configured) return CANONICAL_HOST;
  if (/\.vercel\.app$/i.test(new URL(configured).hostname)) return CANONICAL_HOST;
  return configured;
}

export const SITE_URL = resolveSiteUrl();

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
