import { readFileSync, readdirSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const arr = JSON.parse(readFileSync('prisma/projects-import.json', 'utf8'));

function firstImage(slug, prefFromData) {
  const dir = 'public/images/project-sets/' + slug;
  const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f)).sort();
  const want = prefFromData.split('/').pop();
  if (files.includes(want)) return '/images/project-sets/' + slug + '/' + want;
  return files.length ? '/images/project-sets/' + slug + '/' + files[0] : null;
}

async function main() {
  await prisma.projectItem.deleteMany({});
  let order = 0;
  let made = 0;
  for (const pr of arr) {
    const img = firstImage(pr.slug, pr.image);
    if (!img) continue;
    await prisma.projectItem.create({
      data: {
        name: pr.title,
        location: pr.location,
        completion: pr.completionDate || (pr.year ? String(pr.year) : '—'),
        scope: Array.isArray(pr.scope) ? pr.scope.join(', ') : String(pr.scope || ''),
        image: img,
        order: order++,
        published: true,
      },
    });
    made += 1;
  }
  console.log('imported projects:', made, '| total:', await prisma.projectItem.count());
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
