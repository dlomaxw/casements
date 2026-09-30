// Refreshes lib/fallback-content.json from the live database.
//
// The public website falls back to that file whenever the database cannot be
// reached, so it should reflect the real catalogue. Run this after meaningful
// edits in the CRM (new products, photos, projects, posts), then commit the file:
//
//   node scripts/snapshot-content.mjs
//
// Read-only against the database. Public website content only — never leads,
// staff or anything private.
import { writeFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const [products, projects, posts, videos, siteContent] = await Promise.all([
  prisma.product.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
  prisma.projectItem.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
  prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { name: true } } },
  }),
  prisma.homeVideo.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
  prisma.siteContent.findMany(),
]);

const snapshot = {
  _about:
    "Built-in copy of the public website's content, served only when the database cannot be reached. " +
    'Refresh it from the live database with: node scripts/snapshot-content.mjs',
  generatedAt: new Date().toISOString(),
  source: 'live-database',
  products: products.map((p) => ({
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
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    faqs: Array.isArray(p.faqs) ? p.faqs : [],
    priceList: Array.isArray(p.priceList) ? p.priceList : [],
    keywords: p.keywords ?? [],
    order: p.order,
    published: true,
  })),
  projects: projects.map(({ createdAt, updatedAt, ...rest }) => rest),
  posts: posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    body: p.body,
    coverImage: p.coverImage,
    videoUrl: p.videoUrl,
    category: p.category,
    status: 'PUBLISHED',
    authorId: null,
    author: p.author ? { name: p.author.name } : null,
    publishedAt: (p.publishedAt ?? p.createdAt).toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  })),
  videos: videos.map(({ createdAt, updatedAt, ...rest }) => rest),
  // CMS overrides — phone numbers, headings — so an outage never reverts them.
  siteContent: Object.fromEntries(siteContent.map((r) => [r.key, r.value])),
};

writeFileSync(new URL('../lib/fallback-content.json', import.meta.url), JSON.stringify(snapshot, null, 1));
console.log(
  `Snapshot written: ${snapshot.products.length} products, ${snapshot.projects.length} projects, ` +
    `${snapshot.posts.length} posts, ${snapshot.videos.length} videos, ` +
    `${Object.keys(snapshot.siteContent).length} content overrides.`,
);
await prisma.$disconnect();
