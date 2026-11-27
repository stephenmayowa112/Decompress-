import type { MetadataRoute } from 'next';
import { SEED_VENUES } from '@/src/lib/seed-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.APP_URL || 'https://decompress.ng').replace(/\/$/, '');
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/venues`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/experiences`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/plan-event`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const venueRoutes: MetadataRoute.Sitemap = SEED_VENUES.filter((v) => v.isPublished).map(
    (venue) => ({
      url: `${baseUrl}/venues/${venue.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: venue.isFeatured ? 0.85 : 0.75,
    })
  );

  return [...staticRoutes, ...venueRoutes];
}
