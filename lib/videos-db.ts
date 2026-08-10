import { cache } from 'react';
import { prisma } from '@/lib/db';

export interface HomeVideoRecord {
  id: string;
  title: string;
  url: string;
  order: number;
  published: boolean;
}

// Pull the 11-char YouTube id out of a watch / youtu.be / embed / shorts URL.
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube-nocookie\.com\/embed\/)([\w-]{11})/,
  );
  if (m) return m[1];
  // Bare id pasted straight in
  return /^[\w-]{11}$/.test(url.trim()) ? url.trim() : null;
}

// Published videos for the public home page (cached per request).
export const getHomeVideos = cache(async (): Promise<HomeVideoRecord[]> => {
  try {
    return await prisma.homeVideo.findMany({ where: { published: true }, orderBy: { order: 'asc' } });
  } catch {
    // DB unavailable (e.g. during build) — the section simply renders nothing.
    return [];
  }
});

// All videos incl. drafts, for the admin list.
export async function getAllVideosAdmin(): Promise<HomeVideoRecord[]> {
  return prisma.homeVideo.findMany({ orderBy: { order: 'asc' } });
}
