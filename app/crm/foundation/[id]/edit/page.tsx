import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { can } from '@/lib/roles';
import { getOutreachById } from '@/lib/outreach-db';
import OutreachEditor from '@/components/crm/OutreachEditor';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function EditOutreachPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_content')) redirect('/crm');

  const entry = await getOutreachById(params.id);
  if (!entry) notFound();

  return (
    <div>
      <Link href="/crm/foundation" className="flex items-center gap-1 font-mono text-xs text-on-surface-variant hover:text-safety-orange">
        <Icon name="arrow_back" className="text-[16px]" /> Back to the foundation
      </Link>
      <h1 className="mb-6 mt-4 font-work text-3xl font-semibold tracking-tight text-industrial-blue">Edit outreach</h1>
      <OutreachEditor
        initial={{
          id: entry.id,
          title: entry.title,
          category: entry.category,
          summary: entry.summary,
          body: entry.body,
          location: entry.location ?? '',
          happenedOn: new Date(entry.happenedOn).toISOString().slice(0, 10),
          peopleReached: entry.peopleReached,
          items: entry.items,
          image: entry.image,
          gallery: entry.gallery,
          published: entry.published,
        }}
      />
    </div>
  );
}
