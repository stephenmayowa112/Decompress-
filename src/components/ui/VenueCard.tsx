'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Users } from 'lucide-react';
import { Venue } from '@/src/types/domain';
import { formatBudgetRange } from '@/src/lib/format';
import { SEED_CATEGORIES } from '@/src/lib/seed-data';
import { BrandLinkButton } from '@/src/components/ui/Button';
import { FavouriteButton } from '@/src/components/ui/FavouriteButton';

export interface VenueCardProps {
  venue: Venue;
  prefillDate?: string;
}

export function VenueCard({ venue, prefillDate }: VenueCardProps) {
  const [imgError, setImgError] = useState(false);

  const categoryNames = venue.categorySlugs
    .map((slug) => SEED_CATEGORIES.find((c) => c.slug === slug)?.name || slug)
    .slice(0, 2);

  const detailHref = prefillDate
    ? `/venues/${venue.slug}?date=${encodeURIComponent(prefillDate)}`
    : `/venues/${venue.slug}`;

  const bookHref = prefillDate
    ? `/book/${venue.slug}?date=${encodeURIComponent(prefillDate)}`
    : `/book/${venue.slug}`;

  return (
    <article className="group flex flex-col bg-white rounded-[24px] border border-brand-navy/8 shadow-[0_6px_28px_rgba(18,59,96,0.05)] hover:shadow-[0_22px_46px_rgba(18,59,96,0.11)] hover:-translate-y-1.5 overflow-hidden transition-all duration-300 ease-out">
      {/* Clean Representative Venue Image + Save Favourite */}
      <div className="relative aspect-[16/10] w-full bg-brand-navy overflow-hidden">
        <Link
          href={detailHref}
          className="relative block h-full w-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal"
        >
          {!imgError && venue.heroImageUrl ? (
            <Image
              src={venue.heroImageUrl}
              alt={venue.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full flex-col justify-end bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-teal p-5 text-white">
              <p className="text-lg font-bold">{venue.name}</p>
              <p className="text-sm text-surface-teal">
                {venue.area}, {venue.city}
              </p>
            </div>
          )}
        </Link>
        <div className="absolute top-3.5 right-3.5 z-10">
          <FavouriteButton venueId={venue.id} venueName={venue.name} compact />
        </div>
      </div>

      {/* Card Body — Airy Spacing & Unboxed Metadata */}
      <div className="flex flex-1 flex-col justify-between p-6 gap-5">
        <div className="space-y-2.5">
          {/* Unboxed category & setting metadata line */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-semibold text-brand-teal-text">
            <span>{categoryNames.join(' / ')}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{venue.setting}</span>
            {venue.experienceTags.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-brand-navy/65">
                  {venue.experienceTags
                    .slice(0, 2)
                    .map((t) => t.replace(/-/g, ' '))
                    .join(', ')}
                </span>
              </>
            )}
          </div>

          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold tracking-[-0.015em] text-brand-navy leading-snug min-w-0">
              <Link
                href={detailHref}
                className="hover:text-brand-teal-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded"
              >
                {venue.name}
              </Link>
            </h3>

            {venue.ratingAverage > 0 && (
              <div
                className="flex items-center gap-1 shrink-0 text-sm font-semibold text-brand-navy tabular-nums"
                aria-label={`Rated ${venue.ratingAverage} out of 5 from ${venue.reviewCount} verified reviews`}
              >
                <Star className="h-4 w-4 fill-brand-yellow text-brand-yellow shrink-0" />
                <span>{venue.ratingAverage.toFixed(1)}</span>
                <span className="text-xs font-normal text-brand-navy/55">({venue.reviewCount})</span>
              </div>
            )}
          </div>

          <p className="flex items-center gap-1.5 text-sm text-brand-navy/70 min-w-0">
            <MapPin className="h-4 w-4 text-brand-teal shrink-0" />
            <span className="truncate">
              {venue.area} · {venue.neighbourhood}
            </span>
          </p>

          <p className="text-sm text-brand-navy/75 line-clamp-2 leading-relaxed">
            {venue.description}
          </p>
        </div>

        {/* Light Teal Indicative Budget Range Highlight + Capacity + Brand CTAs */}
        <div className="space-y-3.5 pt-1">
          <div className="rounded-2xl bg-surface-teal/85 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <div className="min-w-0">
              <span className="block text-[11px] font-medium text-brand-teal-text">
                Indicative Budget Range
              </span>
              <span className="font-bold text-brand-navy tabular-nums">
                {formatBudgetRange(
                  venue.budgetMinMinor,
                  venue.budgetMaxMinor,
                  venue.currency,
                  venue.budgetBasis
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-brand-navy/70 tabular-nums shrink-0">
              <Users className="h-3.5 w-3.5 text-brand-teal" />
              <span>Up to {venue.capacity}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <BrandLinkButton
              href={detailHref}
              variant="secondary"
              size="sm"
              fullWidthOnMobile
              className="sm:flex-1 text-base"
            >
              View Details
            </BrandLinkButton>
            <BrandLinkButton
              href={bookHref}
              variant="primary"
              size="sm"
              fullWidthOnMobile
              className="sm:flex-1"
            >
              Book Now
            </BrandLinkButton>
          </div>
        </div>
      </div>
    </article>
  );
}
