import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { getProductNav } from '@/lib/products-db';
import NewLeadForm from '@/components/crm/lead/NewLeadForm';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

/**
 * Entering an enquiry that did not arrive through the website — a phone call,
 * a walk-in, a WhatsApp message, a referral. Previously these never reached
 * the CRM at all.
 */
export default async function NewLeadPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'view_leads')) redirect('/crm');
  const canAssign = can(session.user.role, 'assign_leads');

  const [reps, categories] = await Promise.all([
    canAssign
      ? prisma.user.findMany({
          where: { active: true, role: { in: ['ADMIN', 'MANAGER', 'SALES_REP'] } },
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
        })
      : Promise.resolve([{ id: session.user.id, name: session.user.name ?? 'Me' }]),
    getProductNav(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/crm/leads" className="flex items-center gap-1 font-mono text-xs text-on-surface-variant hover:text-safety-orange">
        <Icon name="arrow_back" className="text-[16px]" /> Back to leads
      </Link>

      <div className="mb-8 mt-4">
        <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Add a lead</h1>
        <p className="mt-2 font-sans text-sm text-on-surface-variant">
          For enquiries that came by phone, WhatsApp, referral or through the door.
          Website enquiries arrive here on their own.
        </p>
      </div>

      <NewLeadForm
        reps={reps}
        categories={categories.map((c) => ({ slug: c.slug, title: c.shortTitle ?? c.title }))}
        defaultOwnerId={session.user.id}
        canAssign={canAssign}
      />
    </div>
  );
}
