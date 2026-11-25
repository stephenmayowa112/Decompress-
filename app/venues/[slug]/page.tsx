'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Clock, Users, CheckCircle2 } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { formatBudgetRange } from '@/src/lib/format';
import { BrandLinkButton } from '@/src/components/ui/Button';

export default function VenueDetailPage() {
  const params = useParams<{ slug: string }>();
  const { venues, categories, facilities } = useDecompress();
  const venue = venues.find((v) => v.slug === params?.slug);

  if (!venue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-brand-navy">Venue not found</h1>
        <p className="text-sm text-brand-navy/75">
          The requested venue could not be located in the sample directory.
        </p>
        <BrandLinkButton href="/venues" variant="secondary" size="sm" fullWidthOnMobile={false}>
          Back to Venues
        </BrandLinkButton>
      </div>
    );
  }

  const categoryLabels = venue.categorySlugs.map(
    (slug) => categories.find((c) => c.slug === slug)?.name || slug
  );
  const facilityLabels = venue.facilitySlugs.map(
    (slug) => facilities.find((f) => f.slug === slug)?.name || slug
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-xs text-brand-navy/70">
        <Link href="/venues" className="hover:underline text-brand-teal-text font-medium">
          Venues
        </Link>{' '}
        · <span>{venue.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-brand-navy border border-brand-navy/10">
            <Image
              src={venue.heroImageUrl}
              alt={venue.name}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-teal-text">
              <span>{categoryLabels.join(' · ')}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{venue.setting} setting</span>
            </div>
            <h1 className="text-3xl font-bold text-brand-navy">{venue.name}</h1>
            <p className="flex items-center gap-2 text-sm text-brand-navy/80">
              <MapPin className="h-4 w-4 text-brand-teal shrink-0" />
              <span>
                {venue.address} ({venue.area} · {venue.neighbourhood})
              </span>
            </p>
          </div>

          <p className="text-base text-brand-navy/85 leading-relaxed">{venue.description}</p>

          {venue.confirmedOfferText && (
            <div className="rounded-2xl bg-surface-teal p-5 border border-brand-teal/30 space-y-1">
              <p className="text-xs font-bold text-brand-teal-text">Confirmed Decompress Offer</p>
              <p className="text-sm text-brand-navy font-medium">{venue.confirmedOfferText}</p>
            </div>
          )}

          {facilityLabels.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-lg font-bold text-brand-navy">Facilities &amp; Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-brand-navy/85">
                {facilityLabels.map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-teal shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contiguous Booking & Indicative Budget Range Sidebar */}
        <aside className="rounded-2xl bg-white p-6 border border-brand-navy/15 space-y-5 lg:sticky lg:top-24">
          <div className="space-y-1">
            <span className="text-xs font-medium text-brand-navy/65">Indicative Budget Range</span>
            <p className="text-xl font-bold text-brand-navy tabular-nums">
              {formatBudgetRange(
                venue.budgetMinMinor,
                venue.budgetMaxMinor,
                venue.currency,
                venue.budgetBasis
              )}
            </p>
            <p className="text-xs text-brand-navy/65">
              Indicative guide only — never a strict minimum spend rule.
            </p>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-brand-navy/10 text-sm text-brand-navy/85">
            {venue.openingHours && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-teal shrink-0" />
                <span>{venue.openingHours}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-teal shrink-0" />
              <span>Capacity up to {venue.capacity} guests</span>
            </div>
            {venue.ratingAverage > 0 && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-brand-yellow text-brand-yellow shrink-0" />
                <span className="font-semibold tabular-nums">
                  {venue.ratingAverage.toFixed(1)} / 5.0
                </span>
                <span className="text-xs text-brand-navy/65">
                  ({venue.reviewCount} verified reviews)
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 space-y-3">
            <BrandLinkButton
              href={`/book/${venue.slug}`}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Book Now
            </BrandLinkButton>
            <BrandLinkButton
              href="/plan-event"
              variant="alternative"
              size="sm"
              className="w-full"
            >
              Add Event Planning Support
            </BrandLinkButton>
          </div>
        </aside>
      </div>
    </div>
  );
}
