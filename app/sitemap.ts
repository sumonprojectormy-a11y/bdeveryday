import type { MetadataRoute } from 'next';
import { referenceEnvironment } from '@/lib/database';
import { sitemapPaths } from '@/lib/generated/news.mjs';

export const revalidate = 1800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await sitemapPaths(referenceEnvironment());
  return pages.map(([path, lastModified]) => ({
    url: 'https://bdeveryday.com' + path,
    lastModified
  }));
}
