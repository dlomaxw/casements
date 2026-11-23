import { cache } from 'react';
import { prisma } from '@/lib/db';
import { fallbackOutreach, withFallback } from '@/lib/fallback';
import type { GalleryImage, OutreachItem, OutreachRecord } from '@/lib/outreach';

export type { OutreachRecord, OutreachItem, GalleryImage };

/**
 * Community outreach — the Casements Foundation page.
 *
 * One record per thing the company did for a community. The totals shown on
 * the public page are summed from these records, so the meter moves on its own
 * every time staff add an entry in the CRM — there is no separate number to
 * remember to update.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
function shape(r: any): OutreachRecord {
  return {
    id: r.id,
    title: r.title,
    category: r.category ?? 'Other',
    summary: r.summary,
    body: r.body,
    location: r.location ?? null,
    happenedOn: r.happenedOn,
    peopleReached: r.peopleReached ?? 0,
    items: Array.isArray(r.items) ? (r.items as OutreachItem[]) : [],
    image: r.image,
    gallery: Array.isArray(r.gallery) ? (r.gallery as GalleryImage[]) : [],
    published: r.published,
    order: r.order ?? 0,
  };
}

/**
 * Published entries for the public page, newest first.
 *
 * Falls back to an empty list rather than crashing the page: the table may not
 * exist yet on a database that has not had the migration applied, and the page
 * still has its introduction to show.
 */
export const getOutreachEntries = cache(async (): Promise<OutreachRecord[]> =>
  withFallback(
    'getOutreachEntries',
    async () => {
      const rows = await prisma.outreachEntry.findMany({
        where: { published: true },
        orderBy: [{ happenedOn: 'desc' }, { order: 'asc' }],
      });
      return rows.map(shape);
    },
    () => fallbackOutreach,
  ),
);

/** Everything including drafts, for the CRM list. */
export async function getAllOutreachAdmin(): Promise<OutreachRecord[]> {
  const rows = await prisma.outreachEntry.findMany({
    orderBy: [{ happenedOn: 'desc' }, { order: 'asc' }],
  });
  return rows.map(shape);
}

export async function getOutreachById(id: string): Promise<OutreachRecord | null> {
  const row = await prisma.outreachEntry.findUnique({ where: { id } });
  return row ? shape(row) : null;
}
