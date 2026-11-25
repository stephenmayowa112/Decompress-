import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { VenueDiscoveryClient } from '@/src/components/discovery/VenueDiscoveryClient';

export const metadata: Metadata = {
  title: 'Explore Venues | Decompress',
  description:
    'Search and filter Lagos restaurants, nightlife, music venues, hotels, event halls, recreation centres, and spas by Budget Range, location, occasion, and relevant facilities.',
};

export default function VenuesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-sm text-brand-navy">
          Loading venue directory...
        </div>
      }
    >
      <VenueDiscoveryClient />
    </Suspense>
  );
}
