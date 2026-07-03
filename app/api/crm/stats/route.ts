import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLeadStats } from '@/lib/crm';

// GET /api/crm/stats — KPI summary. Session auth.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // §17: reps get their own stats; ADMIN gets the full dashboard
  const stats = await getLeadStats(session.user.role === 'ADMIN' ? undefined : session.user.id);
  return Response.json({ stats });
}
