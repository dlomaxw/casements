import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { can } from '@/lib/roles';
import { CONTENT_BLOCKS, getContentValues } from '@/lib/content';
import ContentEditor from '@/components/crm/ContentEditor';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_content')) redirect('/crm');

  const values = await getContentValues();

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Website Content</h1>
          <p className="mt-2 font-sans text-sm text-on-surface-variant">
            Edit the text and images shown on the public website. Changes go live as soon as you save.
          </p>
        </div>
        <Link href="/" target="_blank" className="flex items-center gap-1 rounded-lg border border-outline-variant px-4 py-2 font-mono text-xs font-medium text-industrial-blue hover:border-safety-orange hover:text-safety-orange">
          <Icon name="open_in_new" className="text-[16px]" /> View site
        </Link>
      </div>

      <ContentEditor blocks={CONTENT_BLOCKS} values={values} />
    </div>
  );
}
