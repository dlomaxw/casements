import Image from 'next/image';
import Link from 'next/link';
import { getProjects } from '@/lib/projects-db';

export default async function FeaturedProjects() {
  const all = await getProjects();
  const projects = all.slice(0, 6);
  if (projects.length === 0) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Our Work</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-steel-950 sm:text-4xl">Landmarks We&rsquo;ve Delivered</h2>
          </div>
          <Link href="/projects" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all projects →</Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <Link
              key={p.id}
              href="/projects"
              className={`group relative overflow-hidden rounded-2xl ring-1 ring-brand-100 ${i === 0 ? 'sm:col-span-2 sm:row-span-1' : ''}`}
            >
              <div className={`relative ${i === 0 ? 'h-72' : 'h-64'}`}>
                <Image src={p.image} alt={p.name} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-steel-950/85 via-steel-950/20 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-400">{p.completion}</p>
                <h3 className="mt-1 font-display text-lg font-bold text-white">{p.name}</h3>
                <p className="mt-0.5 text-sm text-white/70">{p.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
