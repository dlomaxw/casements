import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/crm/users — list staff with their category assignments. ADMIN only.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      whatsappNumber: true,
      role: true,
      active: true,
      productMap: { select: { category: true } },
      _count: { select: { leads: true } },
    },
  });
  return Response.json({ users });
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'SALES_REP']).default('SALES_REP'),
  whatsappNumber: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

// POST /api/crm/users — create a staff member. ADMIN only.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, password, role, whatsappNumber, categories } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return Response.json({ error: 'A user with that email already exists' }, { status: 409 });

  const user = await prisma.user.create({
    data: { name, email, role, whatsappNumber, passwordHash: hashPassword(password) },
  });

  if (categories?.length) {
    for (const category of categories) {
      await prisma.repProductMap.upsert({
        where: { category },
        update: { userId: user.id },
        create: { category, userId: user.id },
      });
    }
  }

  return Response.json({ success: true, user: { id: user.id, name, email, role } }, { status: 201 });
}
