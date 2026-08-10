import { getSiteContent } from '@/lib/content';
import { getHomeVideos, youtubeId } from '@/lib/videos-db';
import VideoCard from './VideoCard';

export default async function VideoSection() {
  const c = await getSiteContent();
  const rows = await getHomeVideos();

  const videos = rows
    .map((v) => ({ id: youtubeId(v.url), title: v.title }))
    .filter((v): v is { id: string; title: string } => Boolean(v.id));

  if (videos.length === 0) return null;

  return (
    <section className="bg-steel-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-500">{c('home.video.eyebrow')}</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">{c('home.video.title')}</h2>
          <p className="mt-4 text-brand-100/80">{c('home.video.subtitle')}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <VideoCard key={v.id} videoId={v.id} title={v.title} />
          ))}
        </div>
      </div>
    </section>
  );
}
