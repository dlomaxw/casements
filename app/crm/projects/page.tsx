import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { can } from '@/lib/roles';
import { getAllProjectsAdmin } from '@/lib/projects-db';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function ProjectsAdminPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_content')) redirect('/crm');

  const projects = await getAllProjectsAdmin();
  const live = projects.filter((p) => p.published).length;

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Projects</h1>
          <p className="mt-2 font-mono text-sm text-on-surface-variant">
            <span className="text-safety-orange">Portfolio</span> › {projects.length} projects · {live} live
          </p>
        </div>
        <Link href="/crm/projects/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-mono text-sm font-medium text-white hover:opacity-90">
          <Icon name="add" className="text-[18px]" /> New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link key={p.id} href={`/crm/projects/${p.id}/edit`}
            className="group overflow-hidden rounded-xl border border-outline-variant bg-white transition-colors hover:border-safety-orange">
            <div className="relative h-40 bg-surface-container-high">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              {!p.published && <span className="absolute left-2 top-2 rounded bg-secondary-container px-2 py-0.5 font-mono text-[10px] font-bold text-on-secondary-container">DRAFT</span>}
            </div>
            <div className="p-4">
              <p className="font-work font-bold text-industrial-blue group-hover:text-safety-orange">{p.name}</p>
              <p className="mt-1 font-mono text-[11px] text-on-surface-variant">{p.location} · {p.completion}</p>
              <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{p.scope}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
