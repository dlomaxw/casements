import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { getProductNav } from '@/lib/products-db';
import AuthSessionProvider from '@/components/crm/SessionProvider';
import SignOutButton from '@/components/crm/SignOutButton';
import CrmSidebar from '@/components/crm/CrmSidebar';
import Icon from '@/components/crm/Icon';

export const metadata = {
  title: 'CRM',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  const role = session?.user.role;
  const showSidebar = can(role, 'view_leads');
  const productNav = showSidebar ? await getProductNav() : [];

  let newLeads = 0;
  if (session && showSidebar) {
    newLeads = await prisma.lead.count({
      where: {
        status: 'NEW',
        ...(role === 'ADMIN' || role === 'MANAGER' ? {} : { assignedToId: session.user.id }),
      },
    });
  }

  // Unauthenticated (login page) renders its own centered tree
  if (!session) {
    return (
      <AuthSessionProvider>
        <div className="min-h-screen bg-surface font-sans text-on-surface">{children}</div>
      </AuthSessionProvider>
    );
  }

  const navLink = 'font-mono text-sm tracking-wide text-industrial-blue transition-colors hover:text-safety-orange';

  return (
    <AuthSessionProvider>
      <div className="min-h-screen bg-surface font-sans text-on-surface">
        {/* Top bar */}
        <header className="sticky top-0 z-50 w-full border-b border-aluminum-silver bg-surface">
          <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-8">
              <Link href="/crm" className="flex items-center gap-2">
                <span className="font-work text-lg font-extrabold tracking-tight text-industrial-blue">
                  CASEMENTS AFRICA
                </span>
                <span className="hidden rounded bg-primary px-2 py-0.5 font-mono text-[11px] font-semibold text-white sm:inline">
                  CRM
                </span>
              </Link>
              <nav className="hidden items-center gap-6 lg:flex">
                <Link href="/crm" className={navLink}>Dashboard</Link>
                {can(role, 'view_leads') && (
                  <Link href="/crm/leads" className={`${navLink} flex items-center gap-1.5`}>
                    Leads
                    {newLeads > 0 && (
                      <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-safety-orange px-1.5 py-0.5 text-xs font-bold text-white">
                        {newLeads}
                      </span>
                    )}
                  </Link>
                )}
                {can(role, 'view_analytics') && <Link href="/crm/analytics" className={navLink}>Analytics</Link>}
                {can(role, 'manage_content') && <Link href="/crm/products" className={navLink}>Products</Link>}
                {can(role, 'manage_content') && <Link href="/crm/projects" className={navLink}>Projects</Link>}
                {can(role, 'manage_content') && <Link href="/crm/content" className={navLink}>Content</Link>}
                {can(role, 'manage_blog') && <Link href="/crm/blog" className={navLink}>Blog</Link>}
                {can(role, 'manage_media') && <Link href="/crm/media" className={navLink}>Media</Link>}
                {can(role, 'manage_users') && <Link href="/crm/users" className={navLink}>Staff</Link>}
                <Link href="/crm/settings" className={navLink}>Settings</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden items-center gap-1.5 font-mono text-xs text-on-surface-variant md:flex">
                <Icon name="account_circle" className="text-[18px]" />
                {session.user?.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </header>

        {showSidebar && <CrmSidebar products={productNav} />}

        <main className={`min-h-[calc(100vh-64px)] px-4 pb-12 pt-6 md:px-8 ${showSidebar ? 'lg:ml-64' : ''}`}>
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>

        {/* Footer */}
        <footer className={`w-full border-t-4 border-safety-orange bg-industrial-blue px-4 py-10 lg:px-8 ${showSidebar ? 'lg:ml-64' : ''}`}>
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <span className="font-work text-lg font-bold text-white">CASEMENTS AFRICA</span>
              <p className="mt-1 max-w-md font-sans text-sm text-aluminum-silver">
                Internal CRM · Precision engineering in aluminium, glass, steel &amp; wood since 1954.
              </p>
            </div>
            <p className="font-mono text-xs text-aluminum-silver">
              © {new Date().getFullYear()} Casements Africa Limited · Kampala, Uganda
            </p>
          </div>
        </footer>
      </div>
    </AuthSessionProvider>
  );
}
