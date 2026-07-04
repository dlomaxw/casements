export type Role = 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'MARKETING' | 'SALES_REP';

export type Capability =
  | 'admin'          // full control
  | 'manage_users'   // create / edit staff
  | 'manage_blog'    // create / edit blog posts
  | 'manage_media'   // upload / manage images & media
  | 'view_leads'     // access the CRM lead pipeline
  | 'assign_leads';  // reassign leads to other reps

const CAPS: Record<Role, Capability[]> = {
  ADMIN: ['admin', 'manage_users', 'manage_blog', 'manage_media', 'view_leads', 'assign_leads'],
  MANAGER: ['manage_users', 'manage_blog', 'manage_media', 'view_leads', 'assign_leads'],
  DEVELOPER: ['manage_media', 'manage_blog'],
  MARKETING: ['manage_blog', 'manage_media'],
  SALES_REP: ['view_leads'],
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  DEVELOPER: 'Developer',
  MARKETING: 'Marketing',
  SALES_REP: 'Sales Rep',
};

export const ALL_ROLES: Role[] = ['ADMIN', 'MANAGER', 'DEVELOPER', 'MARKETING', 'SALES_REP'];

export function can(role: string | undefined, cap: Capability): boolean {
  if (!role) return false;
  return CAPS[role as Role]?.includes(cap) ?? false;
}

// Which roles a given actor may assign when creating/editing staff.
// ADMIN can grant any role; MANAGER can grant non-privileged roles only.
export function assignableRoles(actorRole: string | undefined): Role[] {
  if (actorRole === 'ADMIN') return ALL_ROLES;
  if (actorRole === 'MANAGER') return ['DEVELOPER', 'MARKETING', 'SALES_REP'];
  return [];
}
