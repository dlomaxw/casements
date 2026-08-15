// Applies the competitor-audit keyword sets (lib/seo-keywords.ts) to the
// Product rows. Additive and idempotent: existing keywords are kept, researched
// terms are merged in, duplicates dropped.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCT_KEYWORDS = {
  'aluminium-doors-and-windows': [
    'aluminium doors Uganda', 'aluminium windows Kampala', 'casement windows Uganda', 'sliding windows Uganda',
    'sliding doors Kampala', 'tilt and turn windows Uganda', 'awning windows Uganda', 'top hung windows Kampala',
    'projected windows Uganda', 'side hung windows Uganda', 'pivot doors Uganda', 'swing doors Kampala',
    'sliding folding doors Uganda', 'french doors Uganda', 'double glazed windows Uganda',
    'powder coated aluminium windows Kampala', 'thermal break windows Uganda', 'shop fronts Uganda',
    'aluminium window prices Uganda',
  ],
  ceiling: [
    'suspended ceiling Uganda', 'acoustic ceiling Kampala', 'gypsum ceiling Uganda', 'aluminium ceiling Uganda',
    'ceiling installation Kampala', 'false ceiling Uganda', 'stretch ceiling Kampala',
  ],
  'curtain-wall': [
    'curtain wall Uganda', 'curtain walling Kampala', 'structural glazing Uganda', 'glass facade Uganda',
    'commercial glazing Kampala', 'spider glazing Uganda', 'unitised curtain wall Uganda',
    'glass curtain wall prices Uganda',
  ],
  facade: [
    'ACP cladding Uganda', 'aluminium composite panel Kampala', 'facade Kampala', 'wall cladding Uganda',
    'building facade contractors Uganda', 'aluminium cladding Kampala', 'sky dome Uganda', 'glass canopy Kampala',
    'louvers Uganda', 'aluminium louvres Kampala',
  ],
  partitions: [
    'glass partitions Uganda', 'office partitions Kampala', 'aluminium partitions Uganda',
    'frameless glass partitions Kampala', 'demountable partitions Uganda', 'office fit out partitions Uganda',
    'toilet cubicles Uganda',
  ],
  'glass-products': [
    'glass products Uganda', 'glass doors Uganda', 'frameless glass Kampala', 'shower doors Uganda',
    'shower cubicles Kampala', 'tempered glass Uganda', 'toughened glass Kampala', 'laminated glass Uganda',
    'mirrors Uganda', 'glass installation Kampala',
  ],
  'interior-design': [
    'interior design Kampala', 'office fit-out Uganda', 'interior fit out contractors Uganda',
    'wooden doors Uganda', 'panel doors Kampala', 'wardrobes Uganda', 'kitchen fittings Kampala',
    'office furniture fit out Uganda',
  ],
  railings: [
    'stainless steel railings Uganda', 'glass balustrade Kampala', 'balustrades Uganda', 'handrails Uganda',
    'staircase railings Kampala', 'balcony railings Uganda', 'modern rails Uganda',
    'CNC laser cut railings Kampala', 'stainless steel handrail prices Uganda',
  ],
  'steel-products': [
    'steel grills Uganda', 'burglar proofing Kampala', 'burglarproof Uganda', 'security doors Uganda',
    'steel doors Kampala', 'wrought iron gates Uganda', 'sliding gates Kampala', 'swing gates Uganda',
    'garage doors Uganda', 'fence grill Kampala', 'steel windows Uganda', 'Trellidor Uganda',
    'mosquito nets for windows Uganda',
  ],
};

const products = await prisma.product.findMany({ select: { id: true, slug: true, keywords: true } });

for (const p of products) {
  const researched = PRODUCT_KEYWORDS[p.slug];
  if (!researched) {
    console.log(`- ${p.slug}: no researched set, skipped`);
    continue;
  }
  const merged = Array.from(new Set([...p.keywords, ...researched]));
  if (merged.length === p.keywords.length) {
    console.log(`= ${p.slug}: already up to date (${merged.length})`);
    continue;
  }
  await prisma.product.update({ where: { id: p.id }, data: { keywords: merged } });
  console.log(`+ ${p.slug}: ${p.keywords.length} -> ${merged.length} keywords`);
}

await prisma.$disconnect();
