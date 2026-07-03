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

  console.log('Seeded users:', admin.email, rep.email);
  console.log('Set CRM_DEFAULT_REP_ID to:', rep.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
