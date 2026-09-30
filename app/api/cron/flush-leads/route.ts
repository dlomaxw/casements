import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { can } from '@/lib/roles';
import { flushLeadQueue } from '@/lib/lead-queue';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/flush-leads — import enquiries queued while the database was
 * down. Callable by Vercel Cron (Bearer CRON_SECRET) or a signed-in admin or
 * manager.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const viaCron = !!secret && request.headers.get('authorization') === `Bearer ${secret}`;
  if (!viaCron) {
    const session = await getServerSession(authOptions);
    if (!session || !can(session.user.role, 'assign_leads')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  const result = await flushLeadQueue();
  return Response.json({ success: true, ...result });
}
