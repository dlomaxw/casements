import { cache } from 'react';
import { prisma } from '@/lib/db';
import { testimonials as defaultTestimonials } from '@/lib/testimonials';

export type BlockType = 'text' | 'textarea' | 'image';

export interface ContentBlock {
  key: string;
  page: string;
  label: string;
  type: BlockType;
  default: string;
}

// ---- Manually-defined page blocks (headings, heroes, intros) ----
const MANUAL_BLOCKS: ContentBlock[] = [
  // Global
  { key: 'site.phone', page: 'Global', label: 'Phone number', type: 'text', default: '+256 752 700 700' },
  { key: 'site.email', page: 'Global', label: 'Sales email', type: 'text', default: 'sales@casements.co.ug' },
  { key: 'site.address', page: 'Global', label: 'Office address', type: 'text', default: 'Plot 86, 5th Street, Industrial Area, Kampala, Uganda' },
  { key: 'site.ribbon', page: 'Global', label: 'Top ribbon text', type: 'text', default: '60+ Years of Experience! | Built to Last, Delivered as Promised!' },

  // Home
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

  // About
  { key: 'about.hero.eyebrow', page: 'About', label: 'About eyebrow', type: 'text', default: 'About Us · 60+ Years of Experience' },
  { key: 'about.hero.title', page: 'About', label: 'About heading', type: 'text', default: 'We Engineer Trust, Beauty and Precision' },
  { key: 'about.hero.mission', page: 'About', label: 'Mission statement', type: 'textarea', default: 'We are Uganda’s leading aluminium, glass, steel and wood finishing specialists, transforming blueprints into beautiful, functional realities for homes, offices, hotels, hospitals and commercial spaces across East Africa.' },
  { key: 'about.hero.image', page: 'About', label: 'About background image', type: 'image', default: '/images/about/factory.jpg' },

  // Products index
  { key: 'products.hero.eyebrow', page: 'Products', label: 'Products hero eyebrow', type: 'text', default: 'Products' },
  { key: 'products.hero.title', page: 'Products', label: 'Products hero heading', type: 'text', default: 'What We Make' },
  { key: 'products.hero.subtitle', page: 'Products', label: 'Products hero subtitle', type: 'textarea', default: 'Nine product lines, one team. From a single window to a fully-glazed tower, we design, fabricate and install every element in-house.' },

  // Projects
  { key: 'projects.hero.eyebrow', page: 'Projects', label: 'Projects hero eyebrow', type: 'text', default: 'Projects' },
  { key: 'projects.hero.title', page: 'Projects', label: 'Projects hero heading', type: 'text', default: 'Our Work' },
  { key: 'projects.hero.subtitle', page: 'Projects', label: 'Projects hero subtitle', type: 'textarea', default: 'From landmark commercial towers to private residences, our installations are built to last and delivered as promised.' },

  // Testimonials
  { key: 'testimonials.hero.eyebrow', page: 'Testimonials', label: 'Testimonials hero eyebrow', type: 'text', default: 'Testimonials' },
  { key: 'testimonials.hero.title', page: 'Testimonials', label: 'Testimonials hero heading', type: 'text', default: 'Rated 5.0 by Our Clients' },
  { key: 'testimonials.hero.subtitle', page: 'Testimonials', label: 'Testimonials hero subtitle', type: 'textarea', default: 'We would love your feedback. If we’ve worked together, post a review to our profile — and read what others have said below.' },

  // CSR
  { key: 'csr.hero.eyebrow', page: 'CSR', label: 'CSR hero eyebrow', type: 'text', default: 'Corporate Social Responsibility' },
  { key: 'csr.hero.title', page: 'CSR', label: 'CSR hero heading', type: 'text', default: 'Building More Than Structures' },
  { key: 'csr.hero.subtitle', page: 'CSR', label: 'CSR hero subtitle', type: 'textarea', default: 'For over 60 years, our work has been about people as much as materials. We invest in local craftsmanship, sustainable building and the communities we serve.' },
  { key: 'csr.pillar.0.title', page: 'CSR', label: 'Pillar 1 title', type: 'text', default: 'Skills & Employment' },
  { key: 'csr.pillar.0.body', page: 'CSR', label: 'Pillar 1 body', type: 'textarea', default: 'We train and employ local fabricators, welders and installers — building careers and keeping expertise in Uganda.' },
  { key: 'csr.pillar.1.title', page: 'CSR', label: 'Pillar 2 title', type: 'text', default: 'Sustainable Practices' },
  { key: 'csr.pillar.1.body', page: 'CSR', label: 'Pillar 2 body', type: 'textarea', default: 'Energy-efficient aluminium and glazing systems reduce the lifetime energy use of the buildings we help create.' },
  { key: 'csr.pillar.2.title', page: 'CSR', label: 'Pillar 3 title', type: 'text', default: 'Community Investment' },
  { key: 'csr.pillar.2.body', page: 'CSR', label: 'Pillar 3 body', type: 'textarea', default: 'We support the communities we work in, contributing to safe, durable public and educational spaces.' },
];

// ---- Per-item blocks generated from the testimonial data ----
// (Products and Projects have their own full editors at /crm/products and /crm/projects.)
const testimonialBlocks: ContentBlock[] = defaultTestimonials.flatMap((t, i) => [
  { key: `testimonial.${i}.quote`, page: 'Testimonials (reviews)', label: `#${i + 1} Quote`, type: 'textarea', default: t.quote },
  { key: `testimonial.${i}.name`, page: 'Testimonials (reviews)', label: `#${i + 1} Name`, type: 'text', default: t.name },
  { key: `testimonial.${i}.project`, page: 'Testimonials (reviews)', label: `#${i + 1} Project`, type: 'text', default: t.project },
]);

export const CONTENT_BLOCKS: ContentBlock[] = [
  ...MANUAL_BLOCKS,
  ...testimonialBlocks,
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

// ---- Resolver helpers that apply overrides to the collections ----
export function resolveTestimonials(c: ContentResolver) {
  return defaultTestimonials.map((t, i) => ({
    quote: c(`testimonial.${i}.quote`),
    name: c(`testimonial.${i}.name`),
    project: c(`testimonial.${i}.project`),
  }));
}

// tel: href derived from a display phone number
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return `tel:${digits.startsWith('+') ? digits : '+' + digits}`;
}
