import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/venues', '/venues/', '/experiences', '/plan-event', '/faq', '/contact', '/terms', '/privacy'],
        disallow: ['/admin', '/account', '/pay', '/review', '/api'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
