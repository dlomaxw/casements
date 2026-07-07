import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  completion: z.string().min(2).optional(),
  scope: z.string().min(2).optional(),
  image: z.string().min(1).optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 });

  const project = await prisma.projectItem.update({ where: { id: params.id }, data: parsed.data });
  return Response.json({ success: true, project });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) return Response.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.projectItem.delete({ where: { id: params.id } }).catch(() => null);
  return Response.json({ success: true });
}
