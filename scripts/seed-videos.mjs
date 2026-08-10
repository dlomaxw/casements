// Seeds the home-page video showcase with the three original workshop videos.
// Safe to re-run: skips when the table already has rows.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VIDEOS = [
  { title: 'Our Workshop', url: 'https://youtu.be/ryzOBNT5x3w', order: 1 },
  { title: 'Fabrication & Finishing', url: 'https://youtu.be/6g_faTz0CRU', order: 2 },
  { title: 'Visit Our Location', url: 'https://youtu.be/oQQSeZ7SN6w', order: 3 },
];

const existing = await prisma.homeVideo.count();
if (existing > 0) {
  console.log(`HomeVideo already has ${existing} rows — nothing to seed.`);
} else {
  await prisma.homeVideo.createMany({ data: VIDEOS });
  console.log(`Seeded ${VIDEOS.length} home-page videos.`);
}

await prisma.$disconnect();
