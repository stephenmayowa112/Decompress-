'use client';

import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { AccountShell } from '@/src/components/account/AccountShell';
import { VenueCard } from '@/src/components/ui/VenueCard';
import { BrandLinkButton } from '@/src/components/ui/Button';

export default function AccountFavouritesPage() {
  const { venues, favouriteVenueIds } = useDecompress();

  const savedVenues = useMemo(
    () => venues.filter((v) => favouriteVenueIds.includes(v.id)),
    [venues, favouriteVenueIds]
  );

  return (
    <AccountShell
      title="Saved Favourites"
      subtitle="Shortlist your preferred restaurants, rooftop lounges, salsa nights, and event halls for quick booking."
    >
      {savedVenues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {savedVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-6 sm:p-10 border border-brand-navy/15 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-teal text-brand-teal-text">
            <Heart className="h-6 w-6 text-brand-teal" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-brand-navy">No saved venues yet</h2>
            <p className="text-sm text-brand-navy/75 max-w-md mx-auto leading-relaxed">
              Tap the heart icon on any venue card or venue detail page to save it here for later.
            </p>
          </div>
          <div className="flex justify-center pt-1">
            <BrandLinkButton href="/venues" variant="primary" size="md">
              Discover Venues
            </BrandLinkButton>
          </div>
        </div>
      )}
    </AccountShell>
  );
}
