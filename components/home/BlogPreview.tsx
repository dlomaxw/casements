import Image from 'next/image';
import Link from 'next/link';
import { getPublishedPosts } from '@/lib/blog';

export default async function BlogPreview() {
  const posts = await getPublishedPosts(3);
  if (posts.length === 0) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">From the Blog</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-950 sm:text-4xl">News & Projects</h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-brand-600 hover:text-accent-600">View all posts →</Link>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl bg-steel-50 ring-1 ring-brand-100 transition-shadow hover:shadow-xl">
              <div className="relative h-48 overflow-hidden bg-brand-100">
                {post.coverImage ? (
                  <Image src={post.coverImage} alt={post.title} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-300">Casements Africa</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">{post.category}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-brand-950">{post.title}</h3>
                {post.excerpt && <p className="mt-2 flex-1 text-sm text-brand-800/70">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
