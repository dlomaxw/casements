import { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

// Matches the hashing used in lib/auth.ts
const hash = (password) =>
  createHash('sha256').update(`casements:${password}`).digest('hex');

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'gm@casements.co.ug' },
    update: {},
    create: {
      name: 'General Manager',
      email: 'gm@casements.co.ug',
      passwordHash: hash('ChangeMe!2026'),
      role: 'ADMIN',
    },
  });

  const rep = await prisma.user.upsert({
    where: { email: 'sales@casements.co.ug' },
    update: {},
    create: {
      name: 'Sales Team',
      email: 'sales@casements.co.ug',
      passwordHash: hash('ChangeMe!2026'),
      whatsappNumber: '+256752700700',
      role: 'SALES_REP',
    },
  });

  // Route all product categories to the default sales rep (rep_product_map)
  const categories = [
    'aluminium-doors-and-windows', 'ceiling', 'curtain-wall', 'facade', 'partitions',
    'glass-products', 'interior-design', 'railings', 'steel-products',
  ];
  for (const category of categories) {
    await prisma.repProductMap.upsert({
      where: { category },
      update: {},
      create: { category, userId: rep.id },
    });
  }

  console.log('Seeded users:', admin.email, rep.email);
  console.log('Mapped', categories.length, 'product categories to', rep.email);
  console.log('Set CRM_DEFAULT_REP_ID to:', rep.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
