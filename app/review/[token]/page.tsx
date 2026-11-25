'use client';

import React, { use, useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { BrandButton, BrandLinkButton } from '@/src/components/ui/Button';
import { Review } from '@/src/types/domain';

export default function VerifiedReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { bookings, reviews, submitVerifiedReview } = useDecompress();

  const booking = bookings.find((b) => b.reviewToken === token || b.id === token);
  const alreadyReviewed = booking
    ? reviews.find((r) => r.bookingId === booking.id)
    : undefined;

  const [rating, setRating] = useState<number>(5);
  const [venueFeedback, setVenueFeedback] = useState('');
  const [experienceFeedback, setExperienceFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdReview, setCreatedReview] = useState<Review | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const review = await submitVerifiedReview({
        reviewToken: booking.reviewToken === token ? token : undefined,
        bookingId: booking.id,
        rating,
        venueFeedback,
        experienceFeedback,
      });
      setCreatedReview(review);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to submit Verified review.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (createdReview || alreadyReviewed) {
    const rev = createdReview || alreadyReviewed!;
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14 space-y-6">
        <div className="rounded-3xl bg-white p-6 sm:p-10 border border-brand-teal/30 space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-teal shrink-0">
              <CheckCircle2 className="h-6 w-6 text-brand-teal" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-teal-text">
                Verified Review Published · Ref {rev.bookingReference}
              </p>
              <h1 className="text-2xl font-bold text-brand-navy">
                Thank you for reviewing {rev.venueName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1" aria-label={`Rated ${rev.rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 ${
                  star <= rev.rating
                    ? 'fill-brand-yellow text-brand-yellow'
                    : 'text-brand-navy/20'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-bold text-brand-navy">{rev.rating}.0 / 5.0</span>
          </div>

          {rev.venueFeedback && (
            <p className="text-sm text-brand-navy/85 leading-relaxed">{rev.venueFeedback}</p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {booking && (
              <BrandLinkButton
                href={`/venues/${booking.venueSlug}`}
                variant="primary"
                size="md"
                fullWidthOnMobile={false}
              >
                View Review on {rev.venueName}
              </BrandLinkButton>
            )}
            <BrandLinkButton
              href="/venues"
              variant="alternative"
              size="md"
              fullWidthOnMobile={false}
            >
              Explore More Venues
            </BrandLinkButton>
          </div>
        </div>
      </div>
    );
  }

  if (!booking || booking.status !== 'completed') {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-brand-navy">Verified review link unavailable</h1>
        <p className="text-sm text-brand-navy/75 leading-relaxed">
          Reviews on Decompress are strictly tied to completed bookings and one-time links. This
          link may have already been used or the booking has not yet been marked Completed.
        </p>
        <BrandLinkButton href="/venues" variant="secondary" size="md" fullWidthOnMobile={false}>
          Explore Venues
        </BrandLinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="rounded-3xl bg-white p-6 sm:p-10 border border-brand-navy/15 space-y-6">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-brand-teal-text">
            Verified Post-Event Review · {booking.reference}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy">
            How was your visit to {booking.venueName}?
          </h1>
          <p className="text-sm text-brand-navy/75">
            Booking completed on {booking.date}. Your review will be labelled{' '}
            <strong className="text-brand-navy">Verified</strong> on the venue page.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-sm text-[#B91C1C]"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <span className="block text-sm font-semibold text-brand-navy">
              Overall Star Rating (1–5) <span className="text-red-600">*</span>
            </span>
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                  onClick={() => setRating(star)}
                  className="p-1.5 rounded-xl hover:bg-surface-teal transition-colors cursor-pointer"
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      star <= rating
                        ? 'fill-brand-yellow text-brand-yellow'
                        : 'text-brand-navy/20'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-base font-bold text-brand-navy tabular-nums">
                {rating} / 5
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="venue-feedback" className="block text-sm font-semibold text-brand-navy">
              Venue Feedback (Optional)
            </label>
            <textarea
              id="venue-feedback"
              rows={3}
              maxLength={1500}
              placeholder="How was the atmosphere, service, food, music, or space at the venue?"
              value={venueFeedback}
              onChange={(e) => setVenueFeedback(e.target.value)}
              className="w-full rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="experience-feedback"
              className="block text-sm font-semibold text-brand-navy"
            >
              Decompress Booking Experience Feedback (Optional)
            </label>
            <textarea
              id="experience-feedback"
              rows={3}
              maxLength={1500}
              placeholder="How smooth was discovering, requesting, and confirming through Decompress?"
              value={experienceFeedback}
              onChange={(e) => setExperienceFeedback(e.target.value)}
              className="w-full rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
            />
          </div>

          <BrandButton type="submit" variant="primary" size="lg" disabled={submitting}>
            {submitting ? 'Publishing Verified Review...' : 'Submit Verified Review'}
          </BrandButton>
        </form>
      </div>
    </div>
  );
}
