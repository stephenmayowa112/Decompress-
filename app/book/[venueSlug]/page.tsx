'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useDecompress } from '@/src/context/DecompressContext';
import { formatBudgetRange } from '@/src/lib/format';
import { BrandLinkButton } from '@/src/components/ui/Button';

export default function BookVenuePage() {
  const params = useParams<{ venueSlug: string }>();
  const { venues, siteSettings } = useDecompress();
  const venue = venues.find((v) => v.slug === params?.venueSlug);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="text-xs text-brand-navy/70">
        <Link href="/venues" className="hover:underline text-brand-teal-text font-medium">
          Venues
        </Link>{' '}
        · <span>Request Booking</span>
      </div>

      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-brand-navy/15 space-y-4">
        <span className="text-xs font-semibold text-brand-teal-text">
          Concierge Booking Request (Manual Availability)
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy">
          {venue ? `Request Booking at ${venue.name}` : 'Request a Venue Booking'}
        </h1>
        {venue && (
          <p className="text-sm text-brand-navy/80">
            Indicative Budget Range:{' '}
            <strong className="font-semibold text-brand-navy tabular-nums">
              {formatBudgetRange(
                venue.budgetMinMinor,
                venue.budgetMaxMinor,
                venue.currency,
                venue.budgetBasis
              )}
            </strong>
          </p>
        )}
        <p className="text-sm text-brand-navy/75 leading-relaxed">
          Guest payment mode is currently configured as{' '}
          <strong className="font-semibold text-brand-navy">{siteSettings.guestPaymentMode}</strong>
          . Full guest &amp; member booking form, DCP-XXXXXX reference generation, honeypot/rate
          limiting, and admin approval workflow unlock in Milestone 4.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          {venue && (
            <BrandLinkButton
              href={`/venues/${venue.slug}`}
              variant="secondary"
              size="sm"
              fullWidthOnMobile={false}
            >
              Back to Venue Page
            </BrandLinkButton>
          )}
          <BrandLinkButton href="/venues" variant="alternative" size="sm" fullWidthOnMobile={false}>
            Explore All Venues
          </BrandLinkButton>
        </div>
      </div>
    </div>
  );
}
