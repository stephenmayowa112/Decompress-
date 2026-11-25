'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { MapPin, Star, Clock, Users, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { formatBudgetRange, formatMoneyMinor } from '@/src/lib/format';
import { SEED_EVENT_SERVICE_LEVELS } from '@/src/lib/seed-data';
import { BrandLinkButton } from '@/src/components/ui/Button';
import { FavouriteButton } from '@/src/components/ui/FavouriteButton';

export interface VenueDetailClientProps {
  slug: string;
}

export function VenueDetailClient({ slug }: VenueDetailClientProps) {
  const searchParams = useSearchParams();
  const prefillDate = searchParams.get('date') || '';

  const { venues, categories, facilities, experienceTags, addOns, reviews } = useDecompress();
  const venue = venues.find((v) => v.slug === slug);

  const venueReviews = useMemo(() => {
    if (!venue) return [];
    return reviews.filter((r) => r.venueId === venue.id && !r.isHidden);
  }, [reviews, venue]);

  const allPhotos = useMemo(() => {
    if (!venue) return [];
    return [venue.heroImageUrl, ...(venue.galleryImages || [])].filter(Boolean);
  }, [venue]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  if (!venue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-brand-navy">Venue not found</h1>
        <p className="text-sm text-brand-navy/75">
          The requested venue could not be located in the directory.
        </p>
        <BrandLinkButton href="/venues" variant="secondary" size="sm" fullWidthOnMobile={false}>
          Back to Venues
        </BrandLinkButton>
      </div>
    );
  }

  const activePhotoUrl = allPhotos[selectedPhotoIndex] || venue.heroImageUrl;

  const categoryLabels = venue.categorySlugs.map(
    (catSlug) => categories.find((c) => c.slug === catSlug)?.name || catSlug
  );
  const facilityLabels = venue.facilitySlugs.map(
    (facSlug) => facilities.find((f) => f.slug === facSlug)?.name || facSlug
  );
  const experienceLabels = venue.experienceTags.map(
    (tagSlug) => experienceTags.find((t) => t.slug === tagSlug)?.name || tagSlug
  );

  const bookHref = prefillDate
    ? `/book/${venue.slug}?date=${encodeURIComponent(prefillDate)}`
    : `/book/${venue.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-brand-navy/70">
        <Link href="/venues" className="hover:underline text-brand-teal-text font-medium">
          Venues
        </Link>{' '}
        <span aria-hidden="true">·</span> <span className="text-brand-navy">{venue.name}</span>
      </nav>

      {/* Responsive CSS Grid:
          Mobile (< lg): Hero & Header -> Sticky/Summary Budget Range & Book Now Card -> Details & Reviews
          Desktop (lg+): 2/3 Left Column (Hero, Header, Details) + 1/3 Right Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Block 1 (Col 1 on lg): Gallery & Venue Header */}
        <div className="lg:col-span-2 lg:col-start-1 space-y-5 min-w-0">
          <div className="space-y-3">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl bg-brand-navy border border-brand-navy/10">
              {!imgError && activePhotoUrl ? (
                <Image
                  src={activePhotoUrl}
                  alt={venue.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col justify-end bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-teal p-6 text-white">
                  <p className="text-xl font-bold">{venue.name}</p>
                  <p className="text-sm text-surface-teal">
                    {venue.area}, {venue.city}
                  </p>
                </div>
              )}
            </div>

            {/* Gallery Thumbnail Switcher (hidden if venue has no extra gallery images - Section 7.2) */}
            {allPhotos.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {allPhotos.map((photoUrl, idx) => (
                  <button
                    key={`${venue.id}_photo_${idx}`}
                    type="button"
                    onClick={() => {
                      setImgError(false);
                      setSelectedPhotoIndex(idx);
                    }}
                    aria-label={`View photo ${idx + 1} of ${venue.name}`}
                    aria-pressed={selectedPhotoIndex === idx}
                    className={`relative aspect-[16/10] overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      selectedPhotoIndex === idx
                        ? 'border-brand-teal ring-2 ring-brand-teal/25'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={photoUrl}
                      alt={`${venue.name} preview ${idx + 1}`}
                      fill
                      sizes="200px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Unboxed metadata line */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm font-semibold text-brand-teal-text">
              <span>{categoryLabels.join(' · ')}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{venue.setting} setting</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <h1 className="text-2xl sm:text-4xl font-bold text-brand-navy leading-tight">
                {venue.name}
              </h1>
              <FavouriteButton
                venueId={venue.id}
                venueName={venue.name}
                className="self-start shrink-0"
              />
            </div>
            <p className="flex items-start gap-2 text-sm sm:text-base text-brand-navy/80">
              <MapPin className="h-4 w-4 text-brand-teal shrink-0 mt-1" />
              <span>
                {venue.address} ({venue.area} · {venue.neighbourhood})
              </span>
            </p>
          </div>
        </div>

        {/* Block 2 (Appears right below Header on mobile, spans sticky right sidebar on lg+): Budget Range & Booking CTA */}
        <aside className="lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-medium text-brand-navy/65">Indicative Budget Range</span>
            <p className="text-xl sm:text-2xl font-bold text-brand-navy tabular-nums">
              {formatBudgetRange(
                venue.budgetMinMinor,
                venue.budgetMaxMinor,
                venue.currency,
                venue.budgetBasis
              )}
            </p>
            <p className="text-xs text-brand-navy/65 leading-relaxed">
              Indicative guide only — never a strict minimum spend rule.
            </p>
          </div>

          {prefillDate && (
            <div className="rounded-xl bg-surface-teal px-3.5 py-2.5 border border-brand-teal/25 text-xs text-brand-navy space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-brand-teal-text">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Selected Date Pre-fill: {prefillDate}</span>
              </div>
              <p className="text-brand-navy/75">
                Pre-fills your booking request; does not indicate live venue availability.
              </p>
            </div>
          )}

          <div className="space-y-2.5 pt-3 border-t border-brand-navy/10 text-sm text-brand-navy/85">
            {venue.openingHours && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-brand-teal shrink-0 mt-0.5" />
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

          <div className="pt-1 space-y-3">
            <BrandLinkButton href={bookHref} variant="primary" size="lg" className="w-full">
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

        {/* Block 3 (Col 1-2 on lg): Description, Confirmed Offer, Facilities, Services, Verified Reviews */}
        <div className="lg:col-span-2 lg:col-start-1 space-y-8 min-w-0">
          {venue.description && (
            <section className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-brand-navy">About This Venue</h2>
              <p className="text-sm sm:text-base text-brand-navy/85 leading-relaxed">
                {venue.description}
              </p>
            </section>
          )}

          {/* Confirmed Offers/Discounts ONLY (Section 7.2 — hidden if empty) */}
          {venue.confirmedOfferText && (
            <section className="rounded-2xl bg-surface-teal p-5 border border-brand-teal/30 space-y-1.5">
              <p className="text-xs font-bold text-brand-teal-text">Confirmed Decompress Offer</p>
              <p className="text-sm sm:text-base text-brand-navy font-medium">
                {venue.confirmedOfferText}
              </p>
            </section>
          )}

          {/* Experience Tags & Occasions (hidden if both empty) */}
          {(experienceLabels.length > 0 || venue.occasions.length > 0) && (
            <section className="space-y-4 pt-2 border-t border-brand-navy/10">
              {experienceLabels.length > 0 && (
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold text-brand-navy">Experiences &amp; Vibe</h2>
                  <p className="text-sm text-brand-navy/80 leading-relaxed">
                    {experienceLabels.join(' · ')}
                  </p>
                </div>
              )}
              {venue.occasions.length > 0 && (
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold text-brand-navy">Popular Occasions</h2>
                  <p className="text-sm text-brand-navy/80 leading-relaxed">
                    {venue.occasions.join(' · ')}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Facilities & Guest Capacity (hidden if no facilities) */}
          {facilityLabels.length > 0 && (
            <section className="space-y-3 pt-4 border-t border-brand-navy/10">
              <h2 className="text-lg sm:text-xl font-bold text-brand-navy">
                Facilities &amp; Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-brand-navy/85">
                {facilityLabels.map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-teal shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Additional Decompress Services (Service Levels & Optional Add-Ons) */}
          <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal-text">
                <Sparkles className="h-4 w-4 text-brand-teal shrink-0" />
                <span>Concierge Coordination</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-brand-navy">
                Additional Decompress Services for This Booking
              </h2>
              <p className="text-sm text-brand-navy/75">
                Add planning assistance, on-the-day coordination, photography, or content creation
                when submitting your booking request.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SEED_EVENT_SERVICE_LEVELS.map((level) => (
                <div
                  key={level.id}
                  className="rounded-xl bg-surface p-4 border border-brand-navy/10 space-y-1"
                >
                  <h3 className="text-sm font-bold text-brand-navy">{level.name}</h3>
                  <p className="text-xs text-brand-navy/75 leading-relaxed">{level.description}</p>
                </div>
              ))}
            </div>

            {addOns.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-brand-navy/10">
                <h3 className="text-sm font-bold text-brand-navy">Optional Event Add-Ons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {addOns.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-baseline justify-between gap-2 rounded-xl bg-surface px-3.5 py-2.5 border border-brand-navy/10"
                    >
                      <span className="font-semibold text-brand-navy">{addon.name}</span>
                      {addon.fixedPriceMinor && (
                        <span className="font-medium text-brand-teal-text tabular-nums shrink-0">
                          {formatMoneyMinor(addon.fixedPriceMinor, addon.currency)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Ratings & Verified Reviews (hidden if no rating/reviews - Section 7.2) */}
          {(venue.ratingAverage > 0 || venue.reviewCount > 0 || venueReviews.length > 0) && (
            <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-brand-navy">
                  Verified Guest Reviews
                </h2>
                <div className="flex items-center gap-1.5 text-sm font-bold text-brand-navy tabular-nums">
                  <Star className="h-4 w-4 fill-brand-yellow text-brand-yellow shrink-0" />
                  <span>{venue.ratingAverage.toFixed(1)} / 5.0</span>
                  <span className="text-xs font-normal text-brand-navy/65">
                    ({Math.max(venue.reviewCount, venueReviews.length)} Verified reviews)
                  </span>
                </div>
              </div>

              {venueReviews.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {venueReviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-xl bg-surface p-4 border border-brand-navy/10 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-brand-navy">{review.reviewerName}</span>
                          <span aria-hidden="true" className="text-brand-navy/40">
                            ·
                          </span>
                          <span className="font-semibold text-brand-teal-text">Verified</span>
                        </div>
                        <div
                          className="flex items-center gap-0.5"
                          aria-label={`${review.rating} out of 5 stars`}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= review.rating
                                  ? 'fill-brand-yellow text-brand-yellow'
                                  : 'text-brand-navy/20'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.venueFeedback && (
                        <p className="text-sm text-brand-navy/85 leading-relaxed">
                          {review.venueFeedback}
                        </p>
                      )}
                      {review.experienceFeedback && (
                        <p className="text-xs text-brand-navy/70 italic leading-relaxed">
                          Decompress experience: {review.experienceFeedback}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-brand-navy/75 leading-relaxed">
                  All reviews on Decompress come strictly from completed bookings and are labelled{' '}
                  <strong className="font-semibold text-brand-navy">Verified</strong>. Written
                  post-event feedback appears here as guests complete their visits.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
