import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { can } from '@/lib/roles';
import { getAllVideosAdmin } from '@/lib/videos-db';
import VideoManager from '@/components/crm/VideoManager';

export const dynamic = 'force-dynamic';

export default async function VideosAdminPage() {
  const session = await requireSession();
  if (!can(session.user.role, 'manage_content')) redirect('/crm');

  const videos = await getAllVideosAdmin();
  const live = videos.filter((v) => v.published).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-work text-3xl font-semibold tracking-tight text-industrial-blue">Home Page Videos</h1>
        <p className="mt-2 font-mono text-sm text-on-surface-variant">
          <span className="text-safety-orange">Content</span> › {videos.length} videos · {live} showing
        </p>
      </div>

      <VideoManager initial={videos} />
    </div>
  );
}
