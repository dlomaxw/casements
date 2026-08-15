// Sets each Product's keywords to the audited set in lib/seo-keywords.ts.
//
// This REPLACES rather than merges, so terms pruned from the audit (services we
// don't actually offer) are removed from rows that already have them. Every set
// below is a superset of the original seed keywords, so nothing genuine is lost.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCT_KEYWORDS = {
  'aluminium-doors-and-windows': [
    'aluminium doors Uganda', 'aluminium windows Kampala', 'casement windows Uganda', 'side hung windows Uganda',
    'sliding windows Uganda', 'sliding doors Kampala', 'top hung windows Kampala', 'projected windows Uganda',
    'awning windows Uganda', 'bi-fold doors Uganda', 'sliding folding doors Uganda', 'pivot doors Uganda',
    'revolving doors Kampala', 'double glazed windows Uganda', 'powder coated aluminium windows Kampala',
    'aluminium window prices Uganda',
  ],
  ceiling: [
    'suspended ceiling Uganda', 'acoustic ceiling Kampala', 'false ceiling Uganda', 'stretch ceiling Kampala',
    'coffered ceiling Uganda', 'perforated metal ceiling Uganda', 'ceiling installation Kampala',
  ],
  'curtain-wall': [
    'curtain wall Uganda', 'curtain walling Kampala', 'structural glazing Uganda', 'glass facade Uganda',
    'commercial glazing Kampala', 'spider glazing Uganda', 'unitised curtain wall Uganda',
    'stick curtain wall Kampala', 'glass curtain wall prices Uganda',
  ],
  facade: [
    'ACP cladding Uganda', 'aluminium composite panel Kampala', 'facade Kampala', 'wall cladding Uganda',
    'aluminium cladding Kampala', 'building facade contractors Uganda', 'aluminium fins Uganda',
    'brise soleil Kampala', 'sun shading aluminium Uganda',
  ],
  partitions: [
    'glass partitions Uganda', 'office partitions Kampala', 'aluminium partitions Uganda',
    'frameless glass partitions Kampala', 'demountable partitions Uganda', 'office fit out partitions Uganda',
  ],
  'glass-products': [
    'glass products Uganda', 'glass doors Uganda', 'frameless glass Kampala', 'laminated safety glass Uganda',
    'double glazed units Kampala', 'sandblasted glass Uganda', 'etched glass Kampala', 'glass skylights Uganda',
    'glass installation Kampala',
  ],
  'interior-design': [
    'interior design Kampala', 'office fit-out Uganda', 'interior fit out contractors Uganda',
    'shopfronts Uganda', 'shop fronts Kampala', 'reception counters Uganda', 'feature walls Kampala',
    'modular spaces Uganda',
  ],
  railings: [
    'stainless steel railings Uganda', 'glass balustrade Kampala', 'balustrades Uganda', 'handrails Uganda',
    'staircase railings Kampala', 'staircase handrails Uganda', 'balcony railings Uganda',
    'stainless steel handrail prices Uganda',
  ],
  'steel-products': [
    'steel grills Uganda', 'burglar proofing Kampala', 'burglarproof Uganda', 'window grills Uganda',
    'steel gates Uganda', 'roller shutters Kampala', 'sliding grilles Uganda', 'Trellidor Uganda',
    'steel fabrication Uganda',
  ],
};

const products = await prisma.product.findMany({ select: { id: true, slug: true, keywords: true } });

for (const p of products) {
  const audited = PRODUCT_KEYWORDS[p.slug];
  if (!audited) {
    console.log(`- ${p.slug}: no audited set, left alone`);
    continue;
  }
  const removed = p.keywords.filter((k) => !audited.includes(k));
  await prisma.product.update({ where: { id: p.id }, data: { keywords: audited } });
  console.log(
    `${p.slug}: ${p.keywords.length} -> ${audited.length}` +
      (removed.length ? `  (dropped: ${removed.join(', ')})` : ''),
  );
}

await prisma.$disconnect();
