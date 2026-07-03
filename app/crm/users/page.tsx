import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import UserManager from '@/components/crm/UserManager';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await requireSession();
  if (session.user.role !== 'ADMIN') redirect('/crm');

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      whatsappNumber: true,
      role: true,
      active: true,
      productMap: { select: { category: true } },
      _count: { select: { leads: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-brand-950">Staff</h1>
      <p className="mt-1 text-sm text-brand-500">
        Manage sales team accounts, roles, and which product categories route to each rep.
      </p>
      <div className="mt-8">
        <UserManager users={users} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
