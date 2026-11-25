'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Users } from 'lucide-react';
import { Venue } from '@/src/types/domain';
import { formatBudgetRange } from '@/src/lib/format';
import { SEED_CATEGORIES } from '@/src/lib/seed-data';
import { BrandLinkButton } from '@/src/components/ui/Button';

export interface VenueCardProps {
  venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
  const [imgError, setImgError] = useState(false);

  const categoryNames = venue.categorySlugs
    .map((slug) => SEED_CATEGORIES.find((c) => c.slug === slug)?.name || slug)
    .slice(0, 2);

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-brand-navy/10 overflow-hidden transition-transform duration-150 hover:-translate-y-0.5">
      {/* Representative Venue Image with Zero-Broken-Image Fallback */}
      <Link
        href={`/venues/${venue.slug}`}
        className="relative block aspect-[16/10] w-full bg-brand-navy overflow-hidden focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal"
      >
        {!imgError && venue.heroImageUrl ? (
          <Image
            src={venue.heroImageUrl}
            alt={venue.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col justify-end bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-teal p-5 text-white">
            <p className="text-lg font-bold">{venue.name}</p>
            <p className="text-sm text-surface-teal">{venue.area}, {venue.city}</p>
          </div>
        )}
      </Link>

      {/* Card Body — Clean Unboxed Metadata with Typographic Separators */}
      <div className="flex flex-1 flex-col justify-between p-5 gap-4">
        <div className="space-y-2">
          {/* Unboxed category & setting metadata line */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-brand-teal-text">
            <span>{categoryNames.join(' / ')}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{venue.setting}</span>
            {venue.experienceTags.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-brand-navy/75">
                  {venue.experienceTags.slice(0, 2).join(', ')}
                </span>
              </>
            )}
          </div>

          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-brand-navy leading-snug">
              <Link
                href={`/venues/${venue.slug}`}
                className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded"
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
                <span className="text-xs font-normal text-brand-navy/60">({venue.reviewCount})</span>
              </div>
            )}
          </div>

          <p className="flex items-center gap-1.5 text-sm text-brand-navy/75">
            <MapPin className="h-4 w-4 text-brand-teal shrink-0" />
            <span className="truncate">
              {venue.area} · {venue.neighbourhood}
            </span>
          </p>

          <p className="text-sm text-brand-navy/80 line-clamp-2 leading-relaxed">
            {venue.description}
          </p>
        </div>

        {/* Indicative Budget Range (NEVER Minimum Spend) + Capacity + CTA */}
        <div className="pt-3 border-t border-brand-navy/10 space-y-3">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <div>
              <span className="block text-xs text-brand-navy/65">Indicative Budget Range</span>
              <span className="font-bold text-brand-navy tabular-nums">
                {formatBudgetRange(
                  venue.budgetMinMinor,
                  venue.budgetMaxMinor,
                  venue.currency,
                  venue.budgetBasis
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-brand-navy/70 tabular-nums shrink-0">
              <Users className="h-3.5 w-3.5 text-brand-teal" />
              <span>Up to {venue.capacity}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <BrandLinkButton
              href={`/venues/${venue.slug}`}
              variant="secondary"
              size="sm"
              fullWidthOnMobile={false}
              className="flex-1 text-base"
            >
              View Details
            </BrandLinkButton>
            <BrandLinkButton
              href={`/book/${venue.slug}`}
              variant="primary"
              size="sm"
              fullWidthOnMobile={false}
              className="flex-1"
            >
              Book Now
            </BrandLinkButton>
          </div>
        </div>
      </div>
    </article>
  );
}
