import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { LEAD_SOURCES, STAGES, type Stage } from '@/lib/pipeline';

/**
 * Shared lead querying — filters, sorting and duplicate detection.
 *
 * The list page, the API and the report exports all build their query here, so
 * an export always contains exactly the rows the screen was showing.
 */

export const LEAD_PAGE_SIZE = 20;

export const SORT_OPTIONS = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  action: 'Next action due',
  updated: 'Recently updated',
  value: 'Deal value',
  name: 'Name (A–Z)',
  stage: 'Stage',
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

const ORDER_BY: Record<SortKey, Prisma.LeadOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  action: { nextActionDate: 'asc' },
  updated: { updatedAt: 'desc' },
  value: { dealValue: 'desc' },
  name: { fullName: 'asc' },
  stage: { status: 'asc' },
};

export function orderByFor(sort: string | undefined): Prisma.LeadOrderByWithRelationInput {
  return ORDER_BY[(sort ?? 'newest') as SortKey] ?? ORDER_BY.newest;
}

export interface LeadFilters {
  status?: string;
  category?: string;
  source?: string;
  owner?: string;
  q?: string;
  from?: string;
  to?: string;
  attention?: string;
}

/** Reads filters out of either a URLSearchParams or a plain searchParams object. */
export function readFilters(params: URLSearchParams | Record<string, string | undefined>): LeadFilters {
  const get = (k: string) =>
    params instanceof URLSearchParams ? params.get(k) ?? undefined : params[k];
  return {
    status: get('status'),
    category: get('category'),
    source: get('source'),
    owner: get('owner'),
    q: get('q'),
    from: get('from'),
    to: get('to'),
    attention: get('attention'),
  };
}

/**
 * Builds the Prisma filter. Pass scopeToUserId for a sales rep, who may only
 * ever see their own leads — the scope is applied here, not in the interface.
 */
export function buildLeadWhere(filters: LeadFilters, scopeToUserId?: string): Prisma.LeadWhereInput {
  const status = (STAGES as string[]).includes(filters.status ?? '') ? (filters.status as Stage) : undefined;
  const source = (LEAD_SOURCES as string[]).includes(filters.source ?? '') ? filters.source : undefined;
  const category = filters.category?.trim() || undefined;
  const owner = filters.owner?.trim() || undefined;
  const q = filters.q?.trim() || undefined;

  const createdAt: Prisma.DateTimeFilter = {};
  if (filters.from) createdAt.gte = new Date(filters.from);
  if (filters.to) {
    const end = new Date(filters.to);
    end.setHours(23, 59, 59, 999);
    createdAt.lte = end;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const staleBefore = new Date(Date.now() - 7 * 86_400_000);

  // The "needs attention" filters — the queue that drives daily discipline.
  const attention: Prisma.LeadWhereInput =
    filters.attention === 'overdue'
      ? { status: { notIn: ['WON', 'LOST', 'DISQUALIFIED'] }, nextActionDate: { lt: startOfToday } }
      : filters.attention === 'today'
        ? {
            status: { notIn: ['WON', 'LOST', 'DISQUALIFIED'] },
            nextActionDate: { gte: startOfToday, lte: endOfToday },
          }
        : filters.attention === 'no-action'
          ? { status: { notIn: ['WON', 'LOST', 'DISQUALIFIED'] }, nextActionDate: null }
          : filters.attention === 'no-owner'
            ? { status: { notIn: ['WON', 'LOST', 'DISQUALIFIED'] }, assignedToId: null }
            : filters.attention === 'stale'
              ? {
                  status: { notIn: ['WON', 'LOST', 'DISQUALIFIED'] },
                  OR: [{ lastContactedAt: { lt: staleBefore } }, { lastContactedAt: null, createdAt: { lt: staleBefore } }],
                }
              : {};

  return {
    ...(scopeToUserId ? { assignedToId: scopeToUserId } : {}),
    ...(status ? { status } : {}),
    ...(category ? { productCategory: category } : {}),
    ...(source ? { source: source as never } : {}),
    ...(owner && !scopeToUserId ? { assignedToId: owner === 'unassigned' ? null : owner } : {}),
    ...(Object.keys(createdAt).length > 0 ? { createdAt } : {}),
    ...attention,
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' as const } },
            { phone: { contains: q } },
            { email: { contains: q, mode: 'insensitive' as const } },
            { message: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
}

/**
 * Strips a phone number down to comparable digits. Ugandan numbers are written
 * every which way — 0752700700, +256752700700, 256 752 700 700 — so the last
 * nine digits are what actually identify the subscriber.
 */
export function normalisePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export function phoneKey(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 9 ? digits.slice(-9) : null;
}

export interface DuplicateCandidate {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  status: string;
  createdAt: Date;
  assignedTo: { name: string } | null;
}

/**
 * Finds leads that look like the same person: same phone (compared on the last
 * nine digits), same email, or the same name captured in the last 90 days.
 */
export async function findPossibleDuplicates(input: {
  phone?: string | null;
  email?: string | null;
  fullName?: string | null;
  excludeId?: string;
}): Promise<DuplicateCandidate[]> {
  const key = phoneKey(input.phone);
  const email = input.email?.trim().toLowerCase();
  const name = input.fullName?.trim();
  if (!key && !email && !name) return [];

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000);

  const or: Prisma.LeadWhereInput[] = [];
  if (key) or.push({ phone: { contains: key } });
  if (email) or.push({ email: { equals: email, mode: 'insensitive' } });
  if (name) or.push({ fullName: { equals: name, mode: 'insensitive' }, createdAt: { gte: ninetyDaysAgo } });

  const rows = await prisma.lead.findMany({
    where: {
      ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
      OR: or,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true, fullName: true, phone: true, email: true, status: true, createdAt: true,
      assignedTo: { select: { name: true } },
    },
  });

  return rows;
}
