import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLeadStats } from '@/lib/crm';
import { can } from '@/lib/roles';

// GET /api/crm/stats — KPI summary. Session auth.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session.user.role, 'view_leads')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  // §17: reps get their own stats; ADMIN/MANAGER get the full dashboard
  const stats = await getLeadStats(can(session.user.role, 'assign_leads') ? undefined : session.user.id);
  return Response.json({ stats });
}
