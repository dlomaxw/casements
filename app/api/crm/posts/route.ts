import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { uniqueSlug } from '@/lib/blog';

// GET /api/crm/posts — list all posts (draft + published). Requires manage_blog.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session.user.role, 'manage_blog')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });
  return Response.json({ posts });
}

const createSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().optional(),
  body: z.string().min(1),
  coverImage: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  category: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

// POST /api/crm/posts — create a post. Requires manage_blog.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!can(session.user.role, 'manage_blog')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const post = await prisma.post.create({
    data: {
      title: d.title,
      slug: await uniqueSlug(d.title),
      excerpt: d.excerpt || null,
      body: d.body,
      coverImage: d.coverImage || null,
      videoUrl: d.videoUrl || null,
      category: d.category || 'News',
      status: d.status,
      authorId: session.user.id,
      publishedAt: d.status === 'PUBLISHED' ? new Date() : null,
    },
  });
  return Response.json({ success: true, post }, { status: 201 });
}
