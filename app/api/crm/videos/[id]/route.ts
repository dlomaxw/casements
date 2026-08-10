import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { youtubeId } from '@/lib/videos-db';

const patchSchema = z.object({
  title: z.string().min(2).optional(),
  url: z.string().min(5).optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

// PATCH /api/crm/videos/[id] — edit caption, link, visibility or position.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 });

  if (parsed.data.url !== undefined && !youtubeId(parsed.data.url)) {
    return Response.json({ error: 'That does not look like a YouTube link. Paste a youtu.be or youtube.com/watch URL.' }, { status: 400 });
  }

  const video = await prisma.homeVideo.update({ where: { id: params.id }, data: parsed.data });
  return Response.json({ success: true, video });
}

// DELETE /api/crm/videos/[id] — remove a video from the home page.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.homeVideo.delete({ where: { id: params.id } }).catch(() => null);
  return Response.json({ success: true });
}
