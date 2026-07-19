import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { SITE_URL } from '@/lib/seo';

// Regenerate hourly so newly published products/posts appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: { path: string; priority: number; freq: 'daily' | 'weekly' | 'monthly' }[] = [
    { path: '/', priority: 1.0, freq: 'weekly' },
    { path: '/products', priority: 0.9, freq: 'weekly' },
    { path: '/projects', priority: 0.8, freq: 'monthly' },
    { path: '/about-us', priority: 0.7, freq: 'monthly' },
    { path: '/blog', priority: 0.7, freq: 'weekly' },
    { path: '/testimonials', priority: 0.5, freq: 'monthly' },
    { path: '/csr', priority: 0.5, freq: 'monthly' },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path === '/' ? '' : r.path}`,
    lastModified: new Date(),
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  // Live product + blog URLs straight from the database
  try {
    const [products, posts] = await Promise.all([
      prisma.product.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { order: 'asc' },
      }),
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
    ]);

    for (const p of products) {
      entries.push({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
    for (const p of posts) {
      entries.push({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch (err) {
    // Never fail the sitemap because the DB is briefly unreachable
    console.error('[sitemap] db error:', err);
  }

  return entries;
}
