import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assignableRoles, can } from '@/lib/roles';

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  title: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'DEVELOPER', 'MARKETING', 'SALES_REP']).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(), // set/reset password
  currentPassword: z.string().optional(), // required when a user changes their OWN password
  categories: z.array(z.string()).optional(), // admin: replace category assignments
  // Notification preferences (self-service)
  notifyEmail: z.boolean().optional(),
  notifyDesktop: z.boolean().optional(),
  notifyInventory: z.boolean().optional(),
});

// PATCH /api/crm/users/[id]
// - ADMIN: update any user (role, active, reset password, categories, profile)
// - Any user: update their OWN profile + notification prefs, and change their
//   own password (password change requires currentPassword).
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = can(session.user.role, 'manage_users');
  const isSelf = session.user.id === params.id;
  if (!isAdmin && !isSelf) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });

  // A password change always requires the current password (even for admins on self)
  let passwordHash: string | undefined;
  if (data.password) {
    if (isSelf) {
      if (!data.currentPassword || hashPassword(data.currentPassword) !== user.passwordHash) {
        return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
    } else if (!isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    passwordHash = hashPassword(data.password);
  }

  // Fields anyone may change on their own account (or an admin on anyone)
  const selfEditable = {
    ...(data.name ? { name: data.name } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.notifyEmail !== undefined ? { notifyEmail: data.notifyEmail } : {}),
    ...(data.notifyDesktop !== undefined ? { notifyDesktop: data.notifyDesktop } : {}),
    ...(data.notifyInventory !== undefined ? { notifyInventory: data.notifyInventory } : {}),
    ...(passwordHash ? { passwordHash } : {}),
  };

  // Fields only an admin may change (role/active/whatsapp on any account)
  const adminOnly: Record<string, unknown> = {};
  if (isAdmin) {
    if (isSelf && (data.active === false || (data.role && data.role !== 'ADMIN'))) {
      return Response.json({ error: 'You cannot deactivate or demote your own account' }, { status: 400 });
    }
    if (data.role) {
      if (!assignableRoles(session.user.role).includes(data.role)) {
        return Response.json({ error: `You are not allowed to assign the ${data.role} role` }, { status: 403 });
      }
      adminOnly.role = data.role;
    }
    if (data.active !== undefined) adminOnly.active = data.active;
    if (data.whatsappNumber !== undefined) adminOnly.whatsappNumber = data.whatsappNumber;
  }

  // Email change (self or admin) — enforce uniqueness
  let emailUpdate: Record<string, unknown> = {};
  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return Response.json({ error: 'That email is already in use' }, { status: 409 });
    emailUpdate = { email: data.email };
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { ...selfEditable, ...adminOnly, ...emailUpdate },
  });

  // Category assignment is admin-only
  if (isAdmin && data.categories) {
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
