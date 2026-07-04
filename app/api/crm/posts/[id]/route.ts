import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { uniqueSlug } from '@/lib/blog';

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  excerpt: z.string().nullable().optional(),
  body: z.string().min(1).optional(),
  coverImage: z.string().url().nullable().optional().or(z.literal('')),
  videoUrl: z.string().url().nullable().optional().or(z.literal('')),
  category: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_blog')) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ post });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_blog')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 });
  const d = parsed.data;

  const existing = await prisma.post.findUnique({ where: { id: params.id } });
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  // Publishing for the first time stamps publishedAt
  const goingLive = d.status === 'PUBLISHED' && existing.status !== 'PUBLISHED';

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      ...(d.title ? { title: d.title, slug: await uniqueSlug(d.title, params.id) } : {}),
      ...(d.excerpt !== undefined ? { excerpt: d.excerpt || null } : {}),
      ...(d.body ? { body: d.body } : {}),
      ...(d.coverImage !== undefined ? { coverImage: d.coverImage || null } : {}),
      ...(d.videoUrl !== undefined ? { videoUrl: d.videoUrl || null } : {}),
      ...(d.category ? { category: d.category } : {}),
      ...(d.status ? { status: d.status } : {}),
      ...(goingLive ? { publishedAt: new Date() } : {}),
    },
  });
  return Response.json({ success: true, post });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_blog')) return Response.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.post.delete({ where: { id: params.id } }).catch(() => null);
  return Response.json({ success: true });
}
