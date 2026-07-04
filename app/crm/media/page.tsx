import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import MediaLibrary from '@/components/crm/MediaLibrary';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_media')) redirect('/crm');

  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: { select: { name: true } } },
  });

  const items = media.map((m) => ({
    id: m.id,
    url: m.url,
    filename: m.filename,
    createdAt: m.createdAt.toISOString(),
    uploadedBy: m.uploadedBy,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Media Library</h1>
        <p className="mt-2 font-mono text-sm text-on-surface-variant">
          Upload and manage images for the website and blog. Copy a URL to use it anywhere.
        </p>
      </div>
      <MediaLibrary initial={items} />
    </div>
  );
}
