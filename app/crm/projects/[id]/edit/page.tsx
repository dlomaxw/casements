import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import ProjectEditor from '@/components/crm/ProjectEditor';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_content')) redirect('/crm');

  const project = await prisma.projectItem.findUnique({ where: { id: params.id } });
  if (!project) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/crm/projects" className="flex items-center gap-1 font-mono text-xs text-on-surface-variant hover:text-safety-orange">
          <Icon name="arrow_back" className="text-[16px]" /> Back to projects
        </Link>
        {project.published && (
          <Link href="/projects" target="_blank" className="flex items-center gap-1 font-mono text-xs text-primary hover:underline">
            <Icon name="open_in_new" className="text-[16px]" /> View live
          </Link>
        )}
      </div>
      <h1 className="mb-6 mt-4 font-work text-2xl font-semibold text-industrial-blue">Edit Project</h1>
      <ProjectEditor
        initial={{
          id: project.id,
          name: project.name,
          location: project.location,
          completion: project.completion,
          scope: project.scope,
          image: project.image,
          published: project.published,
        }}
      />
    </div>
  );
}
