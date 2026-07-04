import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { CONTENT_BLOCKS } from '@/lib/content';

const VALID_KEYS = new Set(CONTENT_BLOCKS.map((b) => b.key));

const bodySchema = z.object({
  updates: z.record(z.string()),
});

// POST /api/crm/content — upsert one or more content blocks. Requires manage_content.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, 'manage_content')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 });

  const entries = Object.entries(parsed.data.updates).filter(([key]) => VALID_KEYS.has(key));

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );

  return Response.json({ success: true, updated: entries.length });
}
