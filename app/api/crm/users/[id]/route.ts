import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  whatsappNumber: z.string().nullable().optional(),
  role: z.enum(['ADMIN', 'SALES_REP']).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(), // set/reset password
  currentPassword: z.string().optional(), // required when changing own password
  categories: z.array(z.string()).optional(), // replace this user's category assignments
});

// PATCH /api/crm/users/[id]
// - ADMIN: update any user (role, active, reset password, categories)
// - Any user: change their own password (must supply currentPassword)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = session.user.role === 'ADMIN';
  const isSelf = session.user.id === params.id;
  if (!isAdmin && !isSelf) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });

  // Non-admins may ONLY change their own password, nothing else
  if (!isAdmin) {
    if (!data.password) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (!data.currentPassword || hashPassword(data.currentPassword) !== user.passwordHash) {
      return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    await prisma.user.update({ where: { id: params.id }, data: { passwordHash: hashPassword(data.password) } });
    return Response.json({ success: true });
  }

  // Admin cannot deactivate or demote themselves (avoids locking everyone out)
  if (isSelf && (data.active === false || data.role === 'SALES_REP')) {
    return Response.json({ error: 'You cannot deactivate or demote your own account' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.whatsappNumber !== undefined ? { whatsappNumber: data.whatsappNumber } : {}),
      ...(data.role ? { role: data.role } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
      ...(data.password ? { passwordHash: hashPassword(data.password) } : {}),
    },
  });

  if (data.categories) {
    // Replace this user's assignments: release old, claim new
    await prisma.repProductMap.deleteMany({ where: { userId: params.id } });
    for (const category of data.categories) {
      await prisma.repProductMap.upsert({
        where: { category },
        update: { userId: params.id },
        create: { category, userId: params.id },
      });
    }
  }

  return Response.json({ success: true });
}
