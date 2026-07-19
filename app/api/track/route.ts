import { createHash } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

const schema = z.object({
  path: z.string().min(1).max(300),
  referrer: z.string().max(300).optional(),
});

const BOT = /bot|crawler|spider|crawling|slurp|bingpreview|headless|lighthouse|pingdom|monitor/i;

// Anonymous, rotating-daily visitor hash — never stores an IP or user agent.
function visitorHash(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.NEXTAUTH_SECRET ?? 'casements';
  return createHash('sha256').update(`${ip}|${ua}|${day}|${salt}`).digest('hex').slice(0, 32);
}

// POST /api/track — public beacon from the marketing site.
export async function POST(request: Request) {
  const ua = request.headers.get('user-agent') ?? '';
  if (BOT.test(ua)) return Response.json({ ok: true, skipped: 'bot' });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid' }, { status: 400 });

  const { path, referrer } = parsed.data;
  // Never track the admin area
  if (path.startsWith('/crm') || path.startsWith('/api')) return Response.json({ ok: true, skipped: 'admin' });

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  // Strip our own domain from referrers so internal navigation isn't counted as a source
  let ref: string | null = referrer?.trim() || null;
  if (ref) {
    try {
      const host = new URL(ref).hostname;
      const self = request.headers.get('host') ?? '';
      if (host && self.includes(host)) ref = null;
    } catch {
      ref = null;
    }
  }

  try {
    await prisma.pageView.create({
      data: {
        path,
        referrer: ref,
        visitor: visitorHash(ip, ua),
        country: request.headers.get('x-vercel-ip-country'),
        device: /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop',
      },
    });
  } catch (err) {
    console.error('[track] failed:', err);
  }

  return Response.json({ ok: true });
}
