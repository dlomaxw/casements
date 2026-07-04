import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';

// GET /api/crm/media — list uploaded media. Requires manage_media.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_media')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: { select: { name: true } } },
  });
  return Response.json({ media });
}
