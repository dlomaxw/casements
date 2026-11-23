import { z } from 'zod';
import { mediaUrl } from '@/lib/validators';

/**
 * Community outreach — shared vocabulary, shapes and validation.
 *
 * Kept free of any database import so client components (the CRM editor) can
 * use it without pulling Prisma into the browser bundle. Database access lives
 * in lib/outreach-db.ts.
 */

export const OUTREACH_CATEGORIES = ['Food', 'Education', 'Health', 'Environment', 'Other'] as const;
export type OutreachCategory = (typeof OUTREACH_CATEGORIES)[number];

/** Common units, offered in the editor; staff can type any other. */
export const OUTREACH_UNITS = ['kg', 'bags', 'sacks', 'litres', 'cartons', 'plates', 'meals', 'books', 'pieces', 'sets'];

/** A single thing handed out, e.g. 250 kg of maize flour. */
export interface OutreachItem {
  item: string;
  quantity: number;
  unit: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface OutreachRecord {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  location: string | null;
  happenedOn: Date;
  peopleReached: number;
  items: OutreachItem[];
  image: string;
  gallery: GalleryImage[];
  published: boolean;
  order: number;
}

export interface OutreachTotals {
  peopleReached: number;
  entries: number;
  /** Every item handed out, added up per unit — 1,240 kg, 300 bags… */
  itemTotals: { item: string; quantity: number; unit: string }[];
  categories: { category: string; count: number }[];
  latest: Date | null;
}

/**
 * The running totals behind the meter. Computed from the published entries, so
 * adding an entry in the CRM is the only thing anyone has to do to move it.
 */
export function totalsFor(entries: OutreachRecord[]): OutreachTotals {
  const byItem = new Map<string, { item: string; quantity: number; unit: string }>();
  const byCategory = new Map<string, number>();

  for (const e of entries) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + 1);
    for (const i of e.items) {
      if (!i?.item || !Number.isFinite(Number(i.quantity))) continue;
      // Same item in the same unit adds up; "kg" and "bags" stay apart.
      const key = `${i.item.trim().toLowerCase()}|${(i.unit ?? '').trim().toLowerCase()}`;
      const row = byItem.get(key) ?? { item: i.item.trim(), quantity: 0, unit: (i.unit ?? '').trim() };
      row.quantity += Number(i.quantity);
      byItem.set(key, row);
    }
  }

  return {
    peopleReached: entries.reduce((sum, e) => sum + (e.peopleReached || 0), 0),
    entries: entries.length,
    itemTotals: Array.from(byItem.values()).sort((a, b) => b.quantity - a.quantity),
    categories: Array.from(byCategory.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
    latest: entries.length > 0 ? entries[0].happenedOn : null,
  };
}

/** "4 April 2026" — the format used across the foundation page. */
export function formatOutreachDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ---- Validation, shared by the create and update endpoints ----------------

export const outreachItemSchema = z.object({
  item: z.string().trim().min(1),
  quantity: z.coerce.number().min(0),
  unit: z.string().trim().max(24).default(''),
});

export const outreachSchema = z.object({
  title: z.string().trim().min(2),
  category: z.enum(OUTREACH_CATEGORIES as unknown as [string, ...string[]]).default('Food'),
  summary: z.string().trim().min(2),
  body: z.string().trim().min(2),
  location: z.string().trim().max(160).optional().or(z.literal('')),
  happenedOn: z.string().min(1),
  peopleReached: z.coerce.number().int().min(0).default(0),
  items: z.array(outreachItemSchema).optional(),
  image: mediaUrl,
  gallery: z.array(z.object({ src: mediaUrl, alt: z.string().trim().default('') })).optional(),
  published: z.boolean().optional(),
});
