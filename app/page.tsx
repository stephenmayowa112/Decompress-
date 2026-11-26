import type { Metadata } from 'next';
import { HomeClient } from '@/src/components/discovery/HomeClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Decompress | Social-Experience Discovery & Venue Booking',
  },
  description:
    'Discover restaurants, nightlife, salsa & karaoke experiences, beach clubs, games arenas, spas, and event venues across Lagos with indicative Budget Ranges.',
};

export default function HomePage() {
  const baseUrl = (
    process.env.APP_URL ||
    'https://ais-pre-thox63fusy2vqkv5hufdmc-556021110533.europe-west2.run.app'
  ).replace(/\/$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Decompress',
    url: baseUrl,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    description:
      'Curated social-experience discovery, concierge venue booking, and event planning across Lagos.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
