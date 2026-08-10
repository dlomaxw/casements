import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { can, ROLE_LABELS, type Role } from '@/lib/roles';
import { getProductNav } from '@/lib/products-db';
import AuthSessionProvider from '@/components/crm/SessionProvider';
import SignOutButton from '@/components/crm/SignOutButton';
import CrmSidebar, { type MainNavItem } from '@/components/crm/CrmSidebar';
import Icon from '@/components/crm/Icon';

export const metadata = {
  title: 'CRM',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function initials(name?: string | null): string {
  if (!name) return '??';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Unauthenticated (login page) renders its own centered tree
  if (!session) {
    return (
      <AuthSessionProvider>
        <div className="min-h-screen bg-surface font-sans text-on-surface">{children}</div>
      </AuthSessionProvider>
    );
  }

  const role = session.user.role;
  const showCategories = can(role, 'view_leads');
  const productNav = showCategories ? await getProductNav() : [];

  let newLeads = 0;
  if (showCategories) {
    newLeads = await prisma.lead.count({
      where: {
        status: 'NEW',
        ...(role === 'ADMIN' || role === 'MANAGER' ? {} : { assignedToId: session.user.id }),
      },
    });
  }

  const mainNav: MainNavItem[] = [
    { href: '/crm', icon: 'home', label: 'Dashboard' },
    ...(can(role, 'view_leads') ? [{ href: '/crm/leads', icon: 'person', label: 'Leads' }] : []),
    ...(can(role, 'view_leads')
      ? [{ href: 'http://favourwings.com/quotations/quotation_system/', icon: 'request_quote', label: 'Quotation System', external: true }]
      : []),
    ...(can(role, 'view_analytics') ? [{ href: '/crm/analytics', icon: 'bar_chart', label: 'Analytics' }] : []),
    ...(can(role, 'manage_content') ? [{ href: '/crm/products', icon: 'inventory_2', label: 'Products' }] : []),
    ...(can(role, 'manage_content') ? [{ href: '/crm/projects', icon: 'work', label: 'Projects' }] : []),
    ...(can(role, 'manage_content') ? [{ href: '/crm/content', icon: 'language', label: 'Website Content' }] : []),
    ...(can(role, 'manage_content') ? [{ href: '/crm/videos', icon: 'smart_display', label: 'Home Videos' }] : []),
    ...(can(role, 'manage_blog') ? [{ href: '/crm/blog', icon: 'article', label: 'Blog' }] : []),
    ...(can(role, 'manage_media') ? [{ href: '/crm/media', icon: 'image', label: 'Media Library' }] : []),
    ...(can(role, 'manage_users') ? [{ href: '/crm/users', icon: 'groups', label: 'Staff' }] : []),
    { href: '/crm/settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <AuthSessionProvider>
      <div className="min-h-screen bg-surface font-sans text-on-surface">
        {/* Top bar */}
        <header className="sticky top-0 z-50 w-full border-b border-aluminum-silver bg-surface">
          <div className="flex h-16 w-full items-center justify-between gap-4 px-4 lg:px-6">
            <Link href="/crm" className="flex w-auto shrink-0 items-center gap-2 lg:w-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/casements-mark.png" alt="" className="h-9 w-9 object-contain" />
              <span className="hidden font-work text-lg font-extrabold tracking-tight text-industrial-blue sm:inline">
                Casements
              </span>
              <span className="hidden rounded bg-primary px-2 py-0.5 font-mono text-[11px] font-semibold text-white sm:inline">
                CRM
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {newLeads > 0 && (
                <Link href="/crm/leads?status=NEW" className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
                  aria-label={`${newLeads} new leads`}>
                  <Icon name="notifications" />
                  <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-safety-orange px-1 text-[10px] font-bold text-white">
                    {newLeads}
                  </span>
                </Link>
              )}
              <div className="hidden items-center gap-2.5 md:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-white">
                  {initials(session.user.name)}
                </span>
                <span className="leading-tight">
                  <span className="block font-work text-sm font-semibold text-industrial-blue">{session.user.name}</span>
                  <span className="block font-mono text-[11px] text-on-surface-variant">{ROLE_LABELS[role as Role]}</span>
                </span>
              </div>
              <SignOutButton />
            </div>
          </div>

          {/* Compact nav for screens too narrow for the sidebar */}
          <nav className="flex gap-1 overflow-x-auto border-t border-outline-variant/40 px-4 py-2 lg:hidden">
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="shrink-0 rounded-lg px-3 py-1.5 font-mono text-xs text-industrial-blue hover:bg-surface-container-high">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <CrmSidebar products={productNav} mainNav={mainNav} />

        <main className="min-h-[calc(100vh-64px)] px-4 pb-12 pt-6 md:px-8 lg:ml-64">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t-4 border-safety-orange bg-industrial-blue px-4 py-10 lg:ml-64 lg:px-8">
          <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-4 md:flex-row md:items-center">
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
