import { cache } from 'react';
import { prisma } from '@/lib/db';

export type BlockType = 'text' | 'textarea' | 'image';

export interface ContentBlock {
  key: string;
  page: string;
  label: string;
  type: BlockType;
  default: string;
}

// The registry defines every editable block, its page grouping, and its default
// (used when no DB override exists). Add a block here + reference it in a page to
// make new content editable.
export const CONTENT_BLOCKS: ContentBlock[] = [
  // ---- Global (used site-wide) ----
  { key: 'site.phone', page: 'Global', label: 'Phone number', type: 'text', default: '+256 752 700 700' },
  { key: 'site.email', page: 'Global', label: 'Sales email', type: 'text', default: 'sales@casements.co.ug' },
  { key: 'site.address', page: 'Global', label: 'Office address', type: 'text', default: 'Plot 86, 5th Street, Industrial Area, Kampala, Uganda' },
  { key: 'site.ribbon', page: 'Global', label: 'Top ribbon text', type: 'text', default: '60+ Years of Experience! | Built to Last, Delivered as Promised!' },

  // ---- Home ----
  { key: 'home.hero.eyebrow', page: 'Home', label: 'Hero eyebrow', type: 'text', default: 'Aluminium · Glass · Steel · Wood' },
  { key: 'home.hero.title', page: 'Home', label: 'Hero heading', type: 'text', default: "Your Home's Perfect Finish" },
  { key: 'home.hero.subtitle', page: 'Home', label: 'Hero subtitle', type: 'textarea', default: 'Your vision, our craft—creating spaces that feel secure, beautiful and truly yours.' },
  { key: 'home.hero.image', page: 'Home', label: 'Hero background image', type: 'image', default: '/images/hero-door.jpg' },
  { key: 'home.products.eyebrow', page: 'Home', label: 'Products section eyebrow', type: 'text', default: 'What We Do' },
  { key: 'home.products.title', page: 'Home', label: 'Products section heading', type: 'text', default: 'Materials Mastered, Spaces Transformed' },
  { key: 'home.process.eyebrow', page: 'Home', label: 'Process section eyebrow', type: 'text', default: 'How It Works' },
  { key: 'home.process.title', page: 'Home', label: 'Process section heading', type: 'text', default: 'Your Vision, Our Process' },
  { key: 'home.cta.title', page: 'Home', label: 'Consultation CTA heading', type: 'text', default: 'Call For Free Consultation' },
  { key: 'home.cta.subtitle', page: 'Home', label: 'Consultation CTA subtitle', type: 'text', default: 'Talk to a sales engineer today — no obligation, honest advice.' },
  { key: 'home.contact.eyebrow', page: 'Home', label: 'Contact section eyebrow', type: 'text', default: 'Get In Touch' },
  { key: 'home.contact.heading', page: 'Home', label: 'Contact section heading', type: 'text', default: "Let's Build Something That Lasts" },
  { key: 'home.contact.body', page: 'Home', label: 'Contact section body', type: 'textarea', default: 'Send us a message and our team will get back to you — usually within one business day. For a quote on a specific product, use the quote form on any product page.' },

  // ---- About ----
  { key: 'about.hero.eyebrow', page: 'About', label: 'About eyebrow', type: 'text', default: 'About Us · 60+ Years of Experience' },
  { key: 'about.hero.title', page: 'About', label: 'About heading', type: 'text', default: 'We Engineer Trust, Beauty and Precision' },
  { key: 'about.hero.mission', page: 'About', label: 'Mission statement', type: 'textarea', default: 'We are Uganda’s leading aluminium, glass, steel and wood finishing specialists, transforming blueprints into beautiful, functional realities for homes, offices, hotels, hospitals and commercial spaces across East Africa.' },
  { key: 'about.hero.image', page: 'About', label: 'About background image', type: 'image', default: '/images/about/factory.jpg' },
];

const DEFAULTS: Record<string, string> = Object.fromEntries(CONTENT_BLOCKS.map((b) => [b.key, b.default]));

export type ContentResolver = (key: string) => string;

// Cached per request: one DB read supplies all page content.
export const getSiteContent = cache(async (): Promise<ContentResolver> => {
  let overrides: Record<string, string> = {};
  try {
    const rows = await prisma.siteContent.findMany();
    overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    // DB unavailable (e.g. build) — fall back to defaults
  }
  return (key: string) => overrides[key] ?? DEFAULTS[key] ?? '';
});

// Merge overrides over defaults for the editor UI.
export async function getContentValues(): Promise<Record<string, string>> {
  const rows = await prisma.siteContent.findMany().catch(() => []);
  const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return Object.fromEntries(CONTENT_BLOCKS.map((b) => [b.key, overrides[b.key] ?? b.default]));
}

// tel: href derived from a display phone number
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return `tel:${digits.startsWith('+') ? digits : '+' + digits}`;
}
