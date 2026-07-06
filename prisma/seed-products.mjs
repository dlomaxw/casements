// One-time seed of the Product table from the original hardcoded catalogue.
// Safe to re-run: upserts by slug.
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const prisma = new PrismaClient();

// Load the TS source and extract the array via a tiny transform-free eval is messy;
// instead we duplicate the data here to keep the seed self-contained.
const products = JSON.parse(readFileSync(new URL('./products-seed.json', import.meta.url), 'utf8'));

async function main() {
  let i = 0;
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        shortTitle: p.shortTitle,
        description: p.description,
        longDescription: p.longDescription,
        image: p.image,
        imageAlt: p.imageAlt ?? null,
        videoUrl: null,
        subItems: p.subItems ?? [],
        gallery: p.gallery ?? [],
        keywords: p.keywords ?? [],
        order: i,
        published: true,
      },
    });
    i += 1;
  }
  console.log('Seeded products:', await prisma.product.count());
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
