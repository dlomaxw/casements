import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { can } from '@/lib/roles';
import OutreachEditor from '@/components/crm/OutreachEditor';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function NewOutreachPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_content')) redirect('/crm');

  return (
    <div>
      <Link href="/crm/foundation" className="flex items-center gap-1 font-mono text-xs text-on-surface-variant hover:text-safety-orange">
        <Icon name="arrow_back" className="text-[16px]" /> Back to the foundation
      </Link>
      <div className="mb-6 mt-4">
        <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Add outreach</h1>
        <p className="mt-2 font-sans text-sm text-on-surface-variant">
          A food distribution, a school supported, a donation made. What you record here appears on the website and is
          added to the totals.
        </p>
      </div>
      <OutreachEditor />
    </div>
  );
}
