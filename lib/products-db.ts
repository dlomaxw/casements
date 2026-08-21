import { cache } from 'react';
import { prisma } from '@/lib/db';

// Selectable product types (material / service category)
export const PRODUCT_TYPES = [
  'Aluminium',
  'Glass',
  'Steel',
  'Wood',
  'Ceiling',
  'Curtain Wall',
  'Facade',
  'Partitions',
  'Railings',
  'Interior Design',
  'Blinds',
  'Hardware',
  'Other',
] as const;

export interface GalleryItem {
  src: string;
  alt: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

// Published price table. Prices are plain UGX integers — formatted at render
// time so the stored value stays sortable and machine-readable for schema.org.
export interface PriceItem {
  label: string; // e.g. "3.2m diameter"
  price: number; // UGX, VAT-exclusive unless the group note says otherwise
}

export interface PriceGroup {
  group: string; // e.g. "Circular Uniport"
  note?: string;
  items: PriceItem[];
}

export const PRICE_CURRENCY = 'UGX';

export interface ProductRecord {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  type: string;
  description: string;
  longDescription: string;
  image: string;
  imageAlt: string;
  videoUrl: string | null;
  brochureUrl: string | null;
  subItems: string[];
  gallery: GalleryItem[];
  faqs: FaqItem[];
  priceList: PriceGroup[];
  keywords: string[];
  order: number;
  published: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function shape(p: any): ProductRecord {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortTitle: p.shortTitle,
    type: p.type ?? 'Other',
    description: p.description,
    longDescription: p.longDescription,
    image: p.image,
    imageAlt: p.imageAlt ?? p.title,
    videoUrl: p.videoUrl ?? null,
    brochureUrl: p.brochureUrl ?? null,
    subItems: p.subItems ?? [],
    gallery: Array.isArray(p.gallery) ? (p.gallery as GalleryItem[]) : [],
    faqs: Array.isArray(p.faqs) ? (p.faqs as FaqItem[]) : [],
    priceList: Array.isArray(p.priceList) ? (p.priceList as PriceGroup[]) : [],
    keywords: p.keywords ?? [],
    order: p.order ?? 0,
    published: p.published,
  };
}

// Published products for the public site (cached per request).
export const getProducts = cache(async (): Promise<ProductRecord[]> => {
  const rows = await prisma.product.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  });
  return rows.map(shape);
});

// Compact list for nav dropdowns / category pickers (cached per request).
export const getProductNav = cache(async (): Promise<{ slug: string; title: string; shortTitle: string }[]> => {
  const rows = await prisma.product.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
    select: { slug: true, title: true, shortTitle: true },
  });
  return rows;
});

export async function getProductBySlugDb(slug: string): Promise<ProductRecord | null> {
  const p = await prisma.product.findUnique({ where: { slug } });
  return p && p.published ? shape(p) : null;
}

// All products incl. drafts, for the admin list.
export async function getAllProductsAdmin(): Promise<ProductRecord[]> {
  const rows = await prisma.product.findMany({ orderBy: { order: 'asc' } });
  return rows.map(shape);
}
