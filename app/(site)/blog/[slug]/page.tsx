import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { toEmbedUrl } from '@/lib/blog';
import JsonLd from '@/components/seo/JsonLd';
import { blogPostingSchema, breadcrumbSchema } from '@/lib/schema';
import { canonical } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post || post.status !== 'PUBLISHED') return { title: 'Post Not Found' };
  const url = canonical(`/blog/${params.slug}`);
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } } },
  });
  if (!post || post.status !== 'PUBLISHED') notFound();

  const embed = toEmbedUrl(post.videoUrl);

  return (
    <article className="bg-white">
      <JsonLd
        data={blogPostingSchema({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          author: post.author?.name,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <div className="bg-brand-950 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link href="/blog" className="text-sm text-accent-400 hover:underline">← All posts</Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-accent-400">{post.category}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-sm text-brand-200">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
            {post.author?.name ? ` · ${post.author.name}` : ''}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {post.coverImage && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl ring-1 ring-brand-100">
            <Image src={post.coverImage} alt={post.title} fill sizes="(min-width:768px) 768px, 100vw" className="object-cover" priority />
          </div>
        )}

        {embed && (
          <div className="mb-8 aspect-video overflow-hidden rounded-xl ring-1 ring-brand-100">
            <iframe src={embed} title={post.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" />
          </div>
        )}

        <div className="prose max-w-none whitespace-pre-wrap text-lg leading-relaxed text-brand-900">
          {post.body}
        </div>

        {post.videoUrl && !embed && (
          <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-600 hover:text-accent-600">
            ▶ Watch the video
          </a>
        )}
      </div>
    </article>
  );
}
