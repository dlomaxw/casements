import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getPublishedPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog & News',
  description: 'News, projects and product insights from Casements Africa Limited.',
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <section className="bg-brand-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">Blog & News</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">The Latest from Casements</h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-100">
            Project stories, product insights and company news from Uganda&rsquo;s leading finishing specialists.
          </p>
        </div>
      </section>

      <section className="bg-steel-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <p className="rounded-xl bg-white p-10 text-center text-brand-800/70 ring-1 ring-brand-100">
              No posts yet — check back soon.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-brand-100 transition-shadow hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden bg-brand-100">
                    {post.coverImage ? (
                      <Image src={post.coverImage} alt={post.title} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-brand-300">Casements Africa</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">{post.category}</span>
                    <h2 className="mt-2 font-display text-lg font-bold text-brand-950">{post.title}</h2>
                    {post.excerpt && <p className="mt-2 flex-1 text-sm text-brand-800/70">{post.excerpt}</p>}
                    <span className="mt-4 text-xs text-brand-400">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
                      {post.author?.name ? ` · ${post.author.name}` : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
