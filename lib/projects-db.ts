import { cache } from 'react';
import { prisma } from '@/lib/db';

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
export const getProjects = cache(async (): Promise<ProjectItemRecord[]> => {
  return prisma.projectItem.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  });
});

// All projects incl. drafts, for the admin list.
export async function getAllProjectsAdmin(): Promise<ProjectItemRecord[]> {
  return prisma.projectItem.findMany({ orderBy: { order: 'asc' } });
}
