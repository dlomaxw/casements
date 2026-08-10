import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { youtubeId } from '@/lib/videos-db';

// GET /api/crm/videos — list all home-page videos (incl. drafts). Requires manage_content.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const videos = await prisma.homeVideo.findMany({ orderBy: { order: 'asc' } });
  return Response.json({ videos });
}

const createSchema = z.object({
  title: z.string().min(2),
  url: z.string().min(5),
  published: z.boolean().optional(),
});

// POST /api/crm/videos — add a video. Requires manage_content.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  // Reject anything we can't turn into an embeddable id, so the card never renders blank.
  if (!youtubeId(d.url)) {
    return Response.json({ error: 'That does not look like a YouTube link. Paste a youtu.be or youtube.com/watch URL.' }, { status: 400 });
  }

  const max = await prisma.homeVideo.aggregate({ _max: { order: true } });
  const video = await prisma.homeVideo.create({
    data: { title: d.title, url: d.url, published: d.published ?? true, order: (max._max.order ?? 0) + 1 },
  });
  return Response.json({ success: true, video }, { status: 201 });
}
