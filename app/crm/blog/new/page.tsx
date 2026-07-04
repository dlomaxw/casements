import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { can } from '@/lib/roles';
import PostEditor from '@/components/crm/PostEditor';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_blog')) redirect('/crm');

  return (
    <div>
      <Link href="/crm/blog" className="flex items-center gap-1 font-mono text-xs text-on-surface-variant hover:text-safety-orange">
        <Icon name="arrow_back" className="text-[16px]" /> Back to posts
      </Link>
      <h1 className="mb-6 mt-4 font-work text-2xl font-semibold text-industrial-blue">New Post</h1>
      <PostEditor />
    </div>
  );
}
