import { prisma } from '@/lib/db';

export const POST_CATEGORIES = ['News', 'Projects', 'Products', 'Tips', 'Company'] as const;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// Ensure a slug is unique, appending -2, -3… if needed. Ignores `exceptId`.
export async function uniqueSlug(base: string, exceptId?: string): Promise<string> {
  const root = slugify(base) || 'post';
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing || existing.id === exceptId) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

// Convert a YouTube / Vimeo watch URL into an embeddable URL. Returns null if unrecognised.
export function toEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function getPublishedPosts(take?: number) {
  return prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take,
    include: { author: { select: { name: true } } },
  });
}
