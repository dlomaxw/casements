import type { LeadStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { OPEN_STAGES, RESPONSE_SLA_HOURS } from '@/lib/pipeline';

/**
 * Pipeline reporting — the numbers the business actually manages by.
 *
 * Counting leads was never the problem; knowing how much is in play, who is
 * sitting on work, and how fast enquiries get answered is.
 */

export interface StageValue {
  stage: string;
  count: number;
  value: number; // UGX
}

/** Open pipeline broken down by stage, in both leads and shillings. */
export async function getPipelineValue(userId?: string): Promise<StageValue[]> {
  const scope = userId ? { assignedToId: userId } : {};
  const rows = await prisma.lead.groupBy({
    by: ['status'],
    where: { ...scope, status: { in: OPEN_STAGES } },
    _count: { _all: true },
    _sum: { dealValue: true },
  });
  const map = new Map(rows.map((r) => [r.status, r]));
  return OPEN_STAGES.map((stage) => ({
    stage,
    count: map.get(stage)?._count._all ?? 0,
    value: Number(map.get(stage)?._sum.dealValue ?? 0),
  }));
}

export interface AttentionCounts {
  overdue: number;
  dueToday: number;
  noAction: number;
  noOwner: number;
  stale: number;
  unqualifiedNew: number;
}

/** The work queue: everything that should be touched today. */
export async function getAttentionCounts(userId?: string): Promise<AttentionCounts> {
  const scope = userId ? { assignedToId: userId } : {};
  const open = { status: { notIn: ['WON', 'LOST', 'DISQUALIFIED'] } } satisfies { status: { notIn: LeadStatus[] } };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const dayAgo = new Date(Date.now() - 86_400_000);

  const [overdue, dueToday, noAction, noOwner, stale, unqualifiedNew] = await Promise.all([
    prisma.lead.count({ where: { ...scope, ...open, nextActionDate: { lt: startOfToday } } }),
    prisma.lead.count({ where: { ...scope, ...open, nextActionDate: { gte: startOfToday, lte: endOfToday } } }),
    prisma.lead.count({ where: { ...scope, ...open, nextActionDate: null } }),
    userId ? Promise.resolve(0) : prisma.lead.count({ where: { ...open, assignedToId: null } }),
    prisma.lead.count({
      where: {
        ...scope,
        ...open,
        OR: [{ lastContactedAt: { lt: weekAgo } }, { lastContactedAt: null, createdAt: { lt: weekAgo } }],
      },
    }),
    // Captured more than a day ago and still nobody has tried to reach them.
    prisma.lead.count({ where: { ...scope, ...open, firstResponseAt: null, createdAt: { lt: dayAgo } } }),
  ]);

  return { overdue, dueToday, noAction, noOwner, stale, unqualifiedNew };
}

export interface RepPerformance {
  id: string;
  name: string;
  open: number;
  won: number;
  lost: number;
  disqualified: number;
  wonValue: number;
  openValue: number;
  winRate: number; // won / (won + lost)
  avgResponseHours: number | null;
  withinSla: number; // share of leads answered inside the SLA, 0–1
  overdue: number;
  noAction: number;
}

/**
 * Per-rep scoreboard over a window (default 90 days).
 *
 * Response time is measured from capture to the first recorded contact
 * attempt, which is only meaningful because outcomes are now logged in one
 * click rather than typed as notes.
 */
export async function getRepPerformance(days = 90): Promise<RepPerformance[]> {
  const since = new Date(Date.now() - days * 86_400_000);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [reps, leads] = await Promise.all([
    prisma.user.findMany({
      where: { active: true, role: { in: ['ADMIN', 'MANAGER', 'SALES_REP'] } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.lead.findMany({
      where: { assignedToId: { not: null }, createdAt: { gte: since } },
      select: {
        assignedToId: true,
        status: true,
        dealValue: true,
        createdAt: true,
        firstResponseAt: true,
        nextActionDate: true,
      },
    }),
  ]);

  return reps
    .map((rep) => {
      const mine = leads.filter((l) => l.assignedToId === rep.id);
      const won = mine.filter((l) => l.status === 'WON');
      const lost = mine.filter((l) => l.status === 'LOST');
      const disqualified = mine.filter((l) => l.status === 'DISQUALIFIED');
      const open = mine.filter((l) => (OPEN_STAGES as string[]).includes(l.status));

      const answered = mine.filter((l) => l.firstResponseAt);
      const hours = answered.map(
        (l) => (l.firstResponseAt!.getTime() - l.createdAt.getTime()) / 3_600_000,
      );
      const closed = won.length + lost.length;

      return {
        id: rep.id,
        name: rep.name,
        open: open.length,
        won: won.length,
        lost: lost.length,
        disqualified: disqualified.length,
        wonValue: won.reduce((s, l) => s + Number(l.dealValue ?? 0), 0),
        openValue: open.reduce((s, l) => s + Number(l.dealValue ?? 0), 0),
        winRate: closed > 0 ? won.length / closed : 0,
        avgResponseHours: hours.length > 0 ? hours.reduce((a, b) => a + b, 0) / hours.length : null,
        withinSla: hours.length > 0 ? hours.filter((h) => h <= RESPONSE_SLA_HOURS).length / hours.length : 0,
        overdue: open.filter((l) => l.nextActionDate && l.nextActionDate < startOfToday).length,
        noAction: open.filter((l) => !l.nextActionDate).length,
      };
    })
    .filter((r) => r.open + r.won + r.lost + r.disqualified > 0);
}

export interface SourcePerformance {
  source: string;
  total: number;
  won: number;
  disqualified: number;
  wonValue: number;
  quality: number; // share that were not disqualified
}

/**
 * Which channels produce real work. This is the point of making source a
 * mandatory, controlled field — advertising spend can finally be judged.
 */
export async function getSourcePerformance(days = 90): Promise<SourcePerformance[]> {
  const since = new Date(Date.now() - days * 86_400_000);
  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: since } },
    select: { source: true, status: true, dealValue: true },
  });

  const map = new Map<string, SourcePerformance>();
  for (const lead of leads) {
    const key = lead.source ?? 'OTHER';
    const row = map.get(key) ?? { source: key, total: 0, won: 0, disqualified: 0, wonValue: 0, quality: 0 };
    row.total += 1;
    if (lead.status === 'WON') {
      row.won += 1;
      row.wonValue += Number(lead.dealValue ?? 0);
    }
    if (lead.status === 'DISQUALIFIED') row.disqualified += 1;
    map.set(key, row);
  }

  return Array.from(map.values())
    .map((r) => ({ ...r, quality: r.total > 0 ? (r.total - r.disqualified) / r.total : 0 }))
    .sort((a, b) => b.total - a.total);
}

export interface LossBreakdown {
  reason: string;
  count: number;
}

/** Why leads are being lost or thrown out — the point of the mandatory reason. */
export async function getLossBreakdown(days = 90): Promise<LossBreakdown[]> {
  const since = new Date(Date.now() - days * 86_400_000);
  const rows = await prisma.lead.groupBy({
    by: ['lossReason'],
    where: { status: { in: ['LOST', 'DISQUALIFIED'] }, closedAt: { gte: since } },
    _count: { _all: true },
  });
  return rows
    .filter((r) => r.lossReason)
    .map((r) => ({ reason: r.lossReason as string, count: r._count._all }))
    .sort((a, b) => b.count - a.count);
}
