import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';

const gallerySchema = z.array(z.object({ src: z.string(), alt: z.string() }));

const patchSchema = z.object({
  title: z.string().min(2).optional(),
  shortTitle: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  longDescription: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  imageAlt: z.string().optional(),
  videoUrl: z.string().url().nullable().optional().or(z.literal('')),
  subItems: z.array(z.string()).optional(),
  gallery: gallerySchema.optional(),
  keywords: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ product });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 });
  const d = parsed.data;

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(d.title ? { title: d.title } : {}),
      ...(d.shortTitle ? { shortTitle: d.shortTitle } : {}),
      ...(d.description ? { description: d.description } : {}),
      ...(d.longDescription ? { longDescription: d.longDescription } : {}),
      ...(d.image ? { image: d.image } : {}),
      ...(d.imageAlt !== undefined ? { imageAlt: d.imageAlt } : {}),
      ...(d.videoUrl !== undefined ? { videoUrl: d.videoUrl || null } : {}),
      ...(d.subItems ? { subItems: d.subItems } : {}),
      ...(d.gallery ? { gallery: d.gallery } : {}),
      ...(d.keywords ? { keywords: d.keywords } : {}),
      ...(d.published !== undefined ? { published: d.published } : {}),
      ...(d.order !== undefined ? { order: d.order } : {}),
    },
  });
  return Response.json({ success: true, product });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });
  // Release any rep→category routing for this product's slug
  const product = await prisma.product.findUnique({ where: { id: params.id }, select: { slug: true } });
  if (product) await prisma.repProductMap.deleteMany({ where: { category: product.slug } });
  await prisma.product.delete({ where: { id: params.id } }).catch(() => null);
  return Response.json({ success: true });
}
