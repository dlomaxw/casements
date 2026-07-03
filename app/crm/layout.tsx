import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AuthSessionProvider from '@/components/crm/SessionProvider';
import SignOutButton from '@/components/crm/SignOutButton';

export const metadata = {
  title: 'CRM',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // New (unactioned) leads in the current user's scope — drives the header badge
  let newLeads = 0;
  if (session) {
    newLeads = await prisma.lead.count({
      where: {
        status: 'NEW',
        ...(session.user.role === 'ADMIN' ? {} : { assignedToId: session.user.id }),
      },
    });
  }

  // Login page renders its own tree; unauthenticated users hitting other CRM
  // routes are redirected there by each page via requireSession().
  return (
    <AuthSessionProvider>
      <div className="min-h-screen bg-steel-50">
        {session && (
          <header className="border-b border-brand-100 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex items-center gap-6">
                <Link href="/crm" className="font-display font-bold text-brand-950">Casements CRM</Link>
                <nav className="hidden items-center gap-4 text-sm sm:flex">
                  <Link href="/crm" className="text-brand-700 hover:text-accent-600">Dashboard</Link>
                  <Link href="/crm/leads" className="flex items-center gap-1.5 text-brand-700 hover:text-accent-600">
                    Leads
                    {newLeads > 0 && (
                      <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 py-0.5 text-xs font-bold text-brand-950">
                        {newLeads}
                      </span>
                    )}
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/crm/users" className="text-brand-700 hover:text-accent-600">Staff</Link>
                  )}
                  <Link href="/crm/settings" className="text-brand-700 hover:text-accent-600">Settings</Link>
                </nav>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="hidden text-brand-500 sm:inline">{session.user?.email}</span>
                <SignOutButton />
              </div>
            </div>
          </header>
        )}
        {children}
      </div>
    </AuthSessionProvider>
  );
}
