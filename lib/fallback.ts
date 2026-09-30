import snapshot from '@/lib/fallback-content.json';
import type { ProductRecord } from '@/lib/products-db';
import type { ProjectItemRecord } from '@/lib/projects-db';
import type { HomeVideoRecord } from '@/lib/videos-db';

/**
 * Built-in copy of the public website's content.
 *
 * The public pages read products, projects, posts and videos from the database.
 * When the database cannot be reached — an outage, or the provider suspending it
 * for exceeding a quota — every one of those pages used to crash with
 * "Application error: a server-side exception has occurred". Instead, the
 * loaders now fall back to this snapshot so visitors still get a working site.
 *
 * The snapshot is refreshed from the live database with
 * `node scripts/snapshot-content.mjs`. It holds public website content only —
 * never leads, staff or anything private.
 */

export interface FallbackPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  videoUrl: string | null;
  category: string;
  status: 'PUBLISHED';
  authorId: string | null;
  author: { name: string } | null;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const fallbackProducts = snapshot.products as unknown as ProductRecord[];
export const fallbackProjects = snapshot.projects as unknown as ProjectItemRecord[];
export const fallbackVideos = snapshot.videos as unknown as HomeVideoRecord[];
/** CMS text overrides (phone numbers, headings...) as last saved from the live database. */
export const fallbackSiteContent = ((snapshot as { siteContent?: Record<string, string> }).siteContent ?? {}) as Record<
  string,
  string
>;
export const fallbackPosts: FallbackPost[] = (snapshot.posts as unknown as Record<string, unknown>[]).map((p) => ({
  ...(p as unknown as FallbackPost),
  publishedAt: new Date(p.publishedAt as string),
  createdAt: new Date(p.createdAt as string),
  updatedAt: new Date(p.updatedAt as string),
}));

// Once a read has failed, skip the database for a short while. Each failed
// attempt costs a multi-second connection timeout, and a single page makes
// several reads — without this a page takes ~10s to fall back.
//
// Kept on globalThis: Next.js bundles each route separately, so a plain module
// variable would give every route its own copy and each would wait out the
// timeout again.
const RETRY_AFTER_MS = 30_000;
const state = globalThis as typeof globalThis & { __dbDownUntil?: number; __dbWarned?: boolean };

/**
 * Run a database read; if the database is unreachable, log it once and serve
 * the built-in copy instead of crashing the page.
 */
export async function withFallback<T>(label: string, read: () => Promise<T>, fallback: () => T): Promise<T> {
  if (Date.now() < (state.__dbDownUntil ?? 0)) return fallback();
  try {
    return await read();
  } catch (err) {
    state.__dbDownUntil = Date.now() + RETRY_AFTER_MS;
    if (!state.__dbWarned) {
      state.__dbWarned = true;
      console.error(`[fallback] database unavailable (first seen in ${label}) — serving built-in content:`, err);
    }
    return fallback();
  }
}
