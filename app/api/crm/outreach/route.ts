import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { outreachSchema } from '@/lib/outreach';

// GET /api/crm/outreach — every entry including drafts. Requires manage_content.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  const entries = await prisma.outreachEntry.findMany({
    orderBy: [{ happenedOn: 'desc' }, { order: 'asc' }],
  });
  return Response.json({ entries });
}

// POST /api/crm/outreach — add an outreach entry. Requires manage_content.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = outreachSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const d = parsed.data;
  if (!d.image) return Response.json({ error: 'A main photograph is required' }, { status: 400 });

  const max = await prisma.outreachEntry.aggregate({ _max: { order: true } });
  const entry = await prisma.outreachEntry.create({
    data: {
      title: d.title,
      category: d.category,
      summary: d.summary,
      body: d.body,
      location: d.location || null,
      happenedOn: new Date(d.happenedOn),
      peopleReached: d.peopleReached,
      items: (d.items ?? []).filter((i) => i.item),
      image: d.image,
      gallery: (d.gallery ?? []).filter((g) => g.src),
      published: d.published ?? true,
      order: (max._max.order ?? 0) + 1,
    },
  });

  return Response.json({ success: true, entry }, { status: 201 });
}
