import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { getProductNav } from '@/lib/products-db';
import { OPEN_STAGES } from '@/lib/pipeline';
import LeadBoard from '@/components/crm/lead/LeadBoard';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

/** The whole open pipeline on one screen, plus recent wins for context. */
export default async function LeadBoardPage({
  searchParams,
}: {
  searchParams: { owner?: string };
}) {
  const session = await requireSession();
  if (!can(session.user.role, 'view_leads')) redirect('/crm');
  const canAssign = can(session.user.role, 'assign_leads');

  const owner = canAssign ? searchParams.owner?.trim() || undefined : session.user.id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

  const [cards, nav, reps] = await Promise.all([
    prisma.lead.findMany({
      where: {
        ...(owner ? { assignedToId: owner } : {}),
        OR: [
          { status: { in: OPEN_STAGES } },
          // Recent wins stay visible so the board shows the whole story.
          { status: 'WON', wonAt: { gte: thirtyDaysAgo } },
        ],
      },
      orderBy: [{ nextActionDate: 'asc' }, { createdAt: 'desc' }],
      take: 300,
      include: { assignedTo: { select: { name: true } } },
    }),
    getProductNav(),
    canAssign
      ? prisma.user.findMany({
          where: { active: true, role: { in: ['ADMIN', 'MANAGER', 'SALES_REP'] } },
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  const labels: Record<string, string> = Object.fromEntries(
    nav.map((p) => [p.slug, p.shortTitle ?? p.title]),
  );
  labels['general-enquiry'] = 'General';

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Pipeline board</h1>
          <p className="mt-2 font-mono text-sm text-on-surface-variant">
            Drag a lead to move it. Anything the move needs will be asked for.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canAssign && reps.length > 0 && (
            <form action="/crm/leads/board" method="get">
              <select
                name="owner"
                defaultValue={owner ?? ''}
                className="rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm"
                aria-label="Filter by owner"
              >
                <option value="">All owners</option>
                {reps.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <button type="submit" className="ml-2 rounded-lg border border-outline-variant bg-white px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-industrial-blue hover:border-safety-orange">
                Show
              </button>
            </form>
          )}
          <Link href="/crm/leads"
            className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-industrial-blue hover:border-safety-orange">
            <Icon name="list" className="text-[18px]" /> List
          </Link>
          <Link href="/crm/leads/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90">
            <Icon name="add" className="text-[18px]" /> Add lead
          </Link>
        </div>
      </div>

      <LeadBoard
        cards={cards.map((c) => ({
          id: c.id,
          fullName: c.fullName,
          status: c.status,
          productCategory: c.productCategory,
          nextAction: c.nextAction,
          nextActionDate: c.nextActionDate?.toISOString() ?? null,
          lastContactedAt: c.lastContactedAt?.toISOString() ?? null,
          createdAt: c.createdAt.toISOString(),
          assignedToId: c.assignedToId,
          assignedTo: c.assignedTo,
          dealValue: c.dealValue == null ? null : String(c.dealValue),
        }))}
        labels={labels}
      />
    </div>
  );
}
