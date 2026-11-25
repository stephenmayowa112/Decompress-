'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDecompress } from '@/src/context/DecompressContext';
import { VenueCard } from '@/src/components/ui/VenueCard';

function VenuesFoundationContent() {
  const { venues } = useDecompress();
  const searchParams = useSearchParams();
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const occasion = (searchParams.get('occasion') || '').trim().toLowerCase();

  const publishedVenues = venues.filter((v) => {
    if (!v.isPublished) return false;
    if (occasion && !v.occasions.some((o) => o.toLowerCase() === occasion)) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      v.name,
      v.description,
      v.area,
      v.neighbourhood,
      ...v.categorySlugs,
      ...v.experienceTags,
      ...v.facilitySlugs,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-brand-teal-text">
          Venues Directory · {publishedVenues.length} Published Sample Venues
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">
          Explore Venues Across Lagos
        </h1>
        <p className="text-base text-brand-navy/80 max-w-2xl">
          Browse all {publishedVenues.length} sample venues with indicative Budget Ranges,
          categories, and experience tags. Full weighted search and expandable More Filters unlock
          in Milestone 2.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedVenues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </div>
  );
}

export default function VenuesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 text-brand-navy">Loading venues...</div>
      }
    >
      <VenuesFoundationContent />
    </Suspense>
  );
}
