import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import PostEditor from '@/components/crm/PostEditor';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_blog')) redirect('/crm');

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/crm/blog" className="flex items-center gap-1 font-mono text-xs text-on-surface-variant hover:text-safety-orange">
          <Icon name="arrow_back" className="text-[16px]" /> Back to posts
        </Link>
        {post.status === 'PUBLISHED' && (
          <Link href={`/blog/${post.slug}`} target="_blank" className="flex items-center gap-1 font-mono text-xs text-primary hover:underline">
            <Icon name="open_in_new" className="text-[16px]" /> View live
          </Link>
        )}
      </div>
      <h1 className="mb-6 mt-4 font-work text-2xl font-semibold text-industrial-blue">Edit Post</h1>
      <PostEditor
        initial={{
          id: post.id,
          title: post.title,
          excerpt: post.excerpt ?? '',
          body: post.body,
          coverImage: post.coverImage ?? '',
          videoUrl: post.videoUrl ?? '',
          category: post.category,
          status: post.status,
        }}
      />
    </div>
  );
}
