import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_blog')) redirect('/crm');

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });
  const published = posts.filter((p) => p.status === 'PUBLISHED').length;

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Blog & Content</h1>
          <p className="mt-2 font-mono text-sm text-on-surface-variant">
            <span className="text-safety-orange">Marketing</span> › {posts.length} posts · {published} live
          </p>
        </div>
        <Link href="/crm/blog/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-mono text-sm font-medium text-white hover:opacity-90">
          <Icon name="add" className="text-[18px]" /> New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-outline-variant bg-white p-10 text-center">
          <Icon name="article" className="text-4xl text-outline-variant" />
          <p className="mt-2 text-sm text-on-surface-variant">No posts yet. Create your first one.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-white">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-high">
              <tr>
                <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Title</th>
                <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Category</th>
                <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Status</th>
                <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Author</th>
                <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Updated</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="zebra-stripe border-b border-outline-variant/30 hover:bg-primary/5">
                  <td className="p-4">
                    <Link href={`/crm/blog/${post.id}/edit`} className="font-semibold text-industrial-blue hover:text-safety-orange">
                      {post.title}
                    </Link>
                    {post.videoUrl && <Icon name="smart_display" className="ml-1 align-middle text-[16px] text-safety-orange" />}
                  </td>
                  <td className="p-4 text-sm text-on-surface">{post.category}</td>
                  <td className="p-4">
                    <span className={`rounded px-2.5 py-1 font-mono text-[11px] font-semibold uppercase ${post.status === 'PUBLISHED' ? 'bg-primary text-white' : 'bg-secondary-container text-on-secondary-container'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-on-surface-variant">{post.author?.name ?? '—'}</td>
                  <td className="p-4 font-mono text-xs text-on-surface-variant">{new Date(post.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
