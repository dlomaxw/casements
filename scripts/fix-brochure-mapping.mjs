// Corrects the product -> brochure mapping.
//
// The original seven Drive links were assigned in the order they were supplied,
// which did not match the product order — every one landed on the wrong page.
// Each file below was identified by opening it and reading its filename, not by
// position in a list.
//
//   Casements Premium Aluminium Solutions.pdf          -> aluminium-doors-and-windows
//   Casements Premium Ceiling Systems solutions.pdf    -> ceiling
//   Casements Africa Advanced_Curtain Wall_Engineering -> curtain-wall
//   CASEMENTS PARTITION SYSTEMS.pdf                    -> partitions
//   Glass Products Engineered_Transparency.pdf         -> glass-products
//   Architectural_Railing_Solutions.pdf                -> railings
//   Casements_Integrated_design.pdf                    -> interior-design
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function retry(fn, attempts = 8) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts) throw err;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

const drive = (id) => `https://drive.google.com/file/d/${id}/view?usp=sharing`;

const CORRECT = {
  'aluminium-doors-and-windows': { id: '1hp0SAxD-cMEffO7PiTmsOmBpMLuJUNF1', file: 'Casements Premium Aluminium Solutions.pdf' },
  ceiling: { id: '1nzpOcLDXunCUvaIDNVhw42E-nu_P6bpB', file: 'Casements Premium Ceiling Systems solutions.pdf' },
  'curtain-wall': { id: '11ghN2YLLJmL1tEFP93tQnRrVPw_MfZjR', file: 'Casements Africa Advanced_Curtain Wall_Engineering.pdf' },
  partitions: { id: '1IXdGODfutgNo49ATFk7jAd5Oz4U0cXcP', file: 'CASEMENTS PARTITION SYSTEMS.pdf' },
  'glass-products': { id: '17-uX-3eBlTYgCPEoAOuEi0HW99-CaQiX', file: 'Glass Products Engineered_Transparency.pdf' },
  railings: { id: '11W7Zwi-auucQLd5c948rdxdSpX1Bqp0Q', file: 'Architectural_Railing_Solutions.pdf' },
  // Best reading of "Integrated design" — worth confirming with the owner.
  'interior-design': { id: '1U1lPFJ1l2Y1HGfzl12O-XoNqJwaSs0jB', file: 'Casements_Integrated_design.pdf' },
  // facade previously held the aluminium brochure; it has no brochure of its own.
  facade: { id: null, file: null },
};

for (const [slug, { id, file }] of Object.entries(CORRECT)) {
  const before = await retry(() => prisma.product.findUnique({ where: { slug }, select: { brochureUrl: true } }));
  if (!before) {
    console.log(`  ${slug}: product not found, skipped`);
    continue;
  }
  const url = id ? drive(id) : null;
  if (before.brochureUrl === url) {
    console.log(`  ${slug}: already correct`);
    continue;
  }
  await retry(() => prisma.product.update({ where: { slug }, data: { brochureUrl: url } }));
  console.log(`  ${slug}: -> ${file ?? '(cleared — was the aluminium brochure)'}`);
}

const rows = await retry(() => prisma.product.findMany({ orderBy: { order: 'asc' }, select: { slug: true, brochureUrl: true } }));
console.log(`\nBrochures assigned: ${rows.filter((r) => r.brochureUrl).length}/${rows.length}`);
rows.filter((r) => !r.brochureUrl).forEach((r) => console.log(`  none: ${r.slug}`));
await prisma.$disconnect();
