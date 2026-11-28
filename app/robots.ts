import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/api/newsroom/' },
    sitemap: 'https://bdeveryday.com/sitemap.xml'
  };
}
