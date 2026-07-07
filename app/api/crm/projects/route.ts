import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';

// GET /api/crm/projects — list all projects (incl. drafts). Requires manage_content.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const projects = await prisma.projectItem.findMany({ orderBy: { order: 'asc' } });
  return Response.json({ projects });
}

const createSchema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
  completion: z.string().min(2),
  scope: z.string().min(2),
  image: z.string().min(1),
  published: z.boolean().optional(),
});

// POST /api/crm/projects — create a project. Requires manage_content.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const max = await prisma.projectItem.aggregate({ _max: { order: true } });
  const project = await prisma.projectItem.create({
    data: { ...d, published: d.published ?? true, order: (max._max.order ?? 0) + 1 },
  });
  return Response.json({ success: true, project }, { status: 201 });
}
