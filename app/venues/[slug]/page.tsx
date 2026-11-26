import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { SEED_VENUES } from '@/src/lib/seed-data';
import { formatBudgetRange } from '@/src/lib/format';
import { VenueDetailClient } from '@/src/components/discovery/VenueDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const venue = SEED_VENUES.find((v) => v.slug === slug);

  if (!venue) {
    return {
      title: 'Venue Not Found',
      description: 'Discover social experiences and venues across Lagos on Decompress.',
    };
  }

  const budgetText = formatBudgetRange(
    venue.budgetMinMinor,
    venue.budgetMaxMinor,
    venue.currency,
    venue.budgetBasis
  );

  return {
    title: venue.name,
    description: `${venue.area}, ${venue.city} · Indicative Budget Range: ${budgetText}. ${venue.description}`,
    alternates: {
      canonical: `/venues/${venue.slug}`,
    },
    openGraph: {
      title: `${venue.name} | Decompress`,
      description: `${venue.area} · Indicative Budget Range: ${budgetText}`,
      type: 'website',
    },
  };
}

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = SEED_VENUES.find((v) => v.slug === slug);
  const baseUrl = (
    process.env.APP_URL ||
    'https://ais-pre-thox63fusy2vqkv5hufdmc-556021110533.europe-west2.run.app'
  ).replace(/\/$/, '');

  const jsonLd = venue
    ? {
        '@context': 'https://schema.org',
        '@type': 'EventVenue',
        name: venue.name,
        description: venue.description,
        url: `${baseUrl}/venues/${venue.slug}`,
        maximumAttendeeCapacity: venue.capacity,
        address: {
          '@type': 'PostalAddress',
          streetAddress: venue.address,
          addressLocality: venue.city,
          addressRegion: venue.area,
          addressCountry: 'NG',
        },
        ...(venue.ratingAverage > 0 && venue.reviewCount > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: venue.ratingAverage,
                reviewCount: venue.reviewCount,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 text-sm text-brand-navy">
            Loading venue details...
          </div>
        }
      >
        <VenueDetailClient slug={slug} />
      </Suspense>
    </>
  );
}
