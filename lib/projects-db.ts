import { cache } from 'react';
import { prisma } from '@/lib/db';
import { fallbackProjects, withFallback } from '@/lib/fallback';

export interface ProjectItemRecord {
  id: string;
  name: string;
  location: string;
  completion: string;
  scope: string;
  image: string;
  order: number;
  published: boolean;
}

// Published projects for the public site (cached per request).
export const getProjects = cache(async (): Promise<ProjectItemRecord[]> =>
  withFallback(
    'getProjects',
    () =>
      prisma.projectItem.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
      }),
    () => fallbackProjects,
  ),
);

// All projects incl. drafts, for the admin list.
export async function getAllProjectsAdmin(): Promise<ProjectItemRecord[]> {
  return prisma.projectItem.findMany({ orderBy: { order: 'asc' } });
}
