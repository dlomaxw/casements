import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { slugify } from '@/lib/blog';

// GET /api/crm/products — list all products (incl. drafts). Requires manage_content.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const products = await prisma.product.findMany({ orderBy: { order: 'asc' } });
  return Response.json({ products });
}

const gallerySchema = z.array(z.object({ src: z.string(), alt: z.string() }));

const createSchema = z.object({
  title: z.string().min(2),
  shortTitle: z.string().min(1).optional(),
  type: z.string().optional(),
  description: z.string().min(1),
  longDescription: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  subItems: z.array(z.string()).optional(),
  gallery: gallerySchema.optional(),
  keywords: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

async function uniqueProductSlug(base: string): Promise<string> {
  const root = slugify(base) || 'product';
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

// POST /api/crm/products — create a product. Requires manage_content.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const max = await prisma.product.aggregate({ _max: { order: true } });
  const product = await prisma.product.create({
    data: {
      slug: await uniqueProductSlug(d.title),
      title: d.title,
      shortTitle: d.shortTitle || d.title,
      type: d.type || 'Other',
      description: d.description,
      longDescription: d.longDescription,
      image: d.image,
      imageAlt: d.imageAlt || d.title,
      videoUrl: d.videoUrl || null,
      subItems: d.subItems ?? [],
      gallery: d.gallery ?? [],
      keywords: d.keywords ?? [],
      order: (max._max.order ?? 0) + 1,
      published: d.published ?? true,
    },
  });
  return Response.json({ success: true, product }, { status: 201 });
}
