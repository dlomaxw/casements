import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

// Guards a CRM server component — redirects unauthenticated users to login.
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/crm/login');
  return session;
}
