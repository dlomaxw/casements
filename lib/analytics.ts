import { prisma } from '@/lib/db';

export interface TrafficSummary {
  todayViews: number;
  todayVisitors: number;
  weekViews: number;
  weekVisitors: number;
  monthViews: number;
  monthVisitors: number;
  totalViews: number;
}

export interface DayPoint {
  day: string; // YYYY-MM-DD
  views: number;
  visitors: number;
}

export interface PathRow {
  path: string;
  views: number;
  visitors: number;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

async function countsSince(since: Date): Promise<{ views: number; visitors: number }> {
  const [views, visitors] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: since } } }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      distinct: ['visitor'],
      select: { visitor: true },
    }),
  ]);
  return { views, visitors: visitors.length };
}

export async function getTrafficSummary(): Promise<TrafficSummary> {
  const startOfToday = daysAgo(0);
  const startOfWeek = daysAgo(6); // rolling 7 days incl. today
  const startOfMonth = daysAgo(29); // rolling 30 days

  const [today, week, month, totalViews] = await Promise.all([
    countsSince(startOfToday),
    countsSince(startOfWeek),
    countsSince(startOfMonth),
    prisma.pageView.count(),
  ]);

  return {
    todayViews: today.views,
    todayVisitors: today.visitors,
    weekViews: week.views,
    weekVisitors: week.visitors,
    monthViews: month.views,
    monthVisitors: month.visitors,
    totalViews,
  };
}

// Daily buckets for the trend chart — zero-filled so the axis is continuous.
export async function getDailySeries(days = 30): Promise<DayPoint[]> {
  const since = daysAgo(days - 1);
  const rows = await prisma.$queryRaw<{ day: Date; views: bigint; visitors: bigint }[]>`
    SELECT date_trunc('day', "createdAt") AS day,
           COUNT(*) AS views,
           COUNT(DISTINCT "visitor") AS visitors
    FROM "PageView"
    WHERE "createdAt" >= ${since}
    GROUP BY 1
    ORDER BY 1
  `;
  const map = new Map(rows.map((r) => [new Date(r.day).toISOString().slice(0, 10), r]));

  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = daysAgo(i).toISOString().slice(0, 10);
    const hit = map.get(key);
    out.push({ day: key, views: Number(hit?.views ?? 0), visitors: Number(hit?.visitors ?? 0) });
  }
  return out;
}

export async function getTopPages(days = 30, limit = 12): Promise<PathRow[]> {
  const since = daysAgo(days - 1);
  const rows = await prisma.$queryRaw<{ path: string; views: bigint; visitors: bigint }[]>`
    SELECT "path", COUNT(*) AS views, COUNT(DISTINCT "visitor") AS visitors
    FROM "PageView"
    WHERE "createdAt" >= ${since}
    GROUP BY "path"
    ORDER BY views DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ path: r.path, views: Number(r.views), visitors: Number(r.visitors) }));
}

export async function getTopReferrers(days = 30, limit = 8): Promise<{ source: string; views: number }[]> {
  const since = daysAgo(days - 1);
  const rows = await prisma.$queryRaw<{ referrer: string; views: bigint }[]>`
    SELECT "referrer", COUNT(*) AS views
    FROM "PageView"
    WHERE "createdAt" >= ${since} AND "referrer" IS NOT NULL
    GROUP BY "referrer"
    ORDER BY views DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => {
    let source = r.referrer;
    try { source = new URL(r.referrer).hostname.replace(/^www\./, ''); } catch { /* keep raw */ }
    return { source, views: Number(r.views) };
  });
}

export async function getDeviceSplit(days = 30): Promise<{ device: string; views: number }[]> {
  const since = daysAgo(days - 1);
  const rows = await prisma.pageView.groupBy({
    by: ['device'],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });
  return rows.map((r) => ({ device: r.device ?? 'unknown', views: r._count._all }));
}
