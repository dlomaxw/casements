import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { outreachSchema } from '@/lib/outreach';

// PATCH /api/crm/outreach/[id] — update an outreach entry. Requires manage_content.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existing = await prisma.outreachEntry.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  const parsed = outreachSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const entry = await prisma.outreachEntry.update({
    where: { id: params.id },
    data: {
      ...(d.title !== undefined ? { title: d.title } : {}),
      ...(d.category !== undefined ? { category: d.category } : {}),
      ...(d.summary !== undefined ? { summary: d.summary } : {}),
      ...(d.body !== undefined ? { body: d.body } : {}),
      ...(d.location !== undefined ? { location: d.location || null } : {}),
      ...(d.happenedOn !== undefined ? { happenedOn: new Date(d.happenedOn) } : {}),
      ...(d.peopleReached !== undefined ? { peopleReached: d.peopleReached } : {}),
      ...(d.items !== undefined ? { items: d.items.filter((i) => i.item) } : {}),
      ...(d.image !== undefined && d.image ? { image: d.image } : {}),
      ...(d.gallery !== undefined ? { gallery: d.gallery.filter((g) => g.src) } : {}),
      ...(d.published !== undefined ? { published: d.published } : {}),
    },
  });

  return Response.json({ success: true, entry });
}

// DELETE /api/crm/outreach/[id] — remove an entry. Requires manage_content.
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existing = await prisma.outreachEntry.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  await prisma.outreachEntry.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}
