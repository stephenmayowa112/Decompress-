'use client';

import React, { Suspense, use, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { formatBudgetRange, formatMoneyMinor } from '@/src/lib/format';
import { SEED_EVENT_SERVICE_LEVELS, SEED_OCCASIONS } from '@/src/lib/seed-data';
import { Booking, BookingType, EventPlanningRequest, EventServiceLevel } from '@/src/types/domain';
import { BrandButton, BrandLinkButton } from '@/src/components/ui/Button';
import { formatEventServiceLevelLabel } from '@/src/lib/booking-machine';

function formatBookingTypeLabel(type: BookingType): string {
  switch (type) {
    case 'table':
      return 'Table Booking';
    case 'group':
      return 'Group Booking';
    case 'private_hire':
      return 'Private Hire';
  }
}

function BookingFormContent({ venueSlug }: { venueSlug: string }) {
  const searchParams = useSearchParams();
  const prefillDate = searchParams.get('date') || '';

  const {
    venues,
    addOns,
    siteSettings,
    userProfile,
    currentUser,
    isAdminUser,
    submitBookingRequest,
  } = useDecompress();

  const venue = venues.find((v) => v.slug === venueSlug);

  const [date, setDate] = useState(prefillDate);
  const [preferredTime, setPreferredTime] = useState('19:30');
  const [guestCount, setGuestCount] = useState(4);
  const [occasion, setOccasion] = useState(SEED_OCCASIONS[0]);
  const [bookingType, setBookingType] = useState<BookingType>(
    venue?.bookingTypes[0] || 'table'
  );
  const [guestName, setGuestName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [guestEmail, setGuestEmail] = useState(userProfile?.email || currentUser?.email || '');
  const [guestPhone, setGuestPhone] = useState(userProfile?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [eventServiceLevel, setEventServiceLevel] = useState<EventServiceLevel | ''>('');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    booking: Booking;
    eventRequest?: EventPlanningRequest;
  } | null>(null);

  if (!venue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-brand-navy">Venue not found</h1>
        <p className="text-sm text-brand-navy/75">
          The venue you attempted to book could not be found in our directory.
        </p>
        <BrandLinkButton href="/venues" variant="secondary" size="sm" fullWidthOnMobile={false}>
          Explore Venues
        </BrandLinkButton>
      </div>
    );
  }

  const toggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!date) {
      setErrorMessage('Please select a preferred date for your booking request.');
      return;
    }
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setErrorMessage('Please complete your full name, email address, and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitBookingRequest({
        venueId: venue.id,
        date,
        preferredTime,
        guestCount,
        occasion,
        bookingType,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        eventServiceLevel: eventServiceLevel || null,
        selectedAddOnIds,
        honeypot,
      });
      setSubmittedResult(result);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to submit booking request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedResult) {
    const { booking, eventRequest } = submittedResult;
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
        <div className="rounded-3xl bg-white p-6 sm:p-10 border border-brand-teal/30 space-y-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-teal text-brand-teal-text shrink-0">
              <CheckCircle2 className="h-6 w-6 text-brand-teal" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-teal-text">
                Booking Request Received · Status: Pending
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy">
                We have received your request for {booking.venueName}
              </h1>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-teal p-5 border border-brand-teal/25 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs text-brand-navy/65">Booking Reference</span>
              <span className="font-mono text-lg font-bold text-brand-navy">
                {booking.reference}
              </span>
            </div>
            <div>
              <span className="block text-xs text-brand-navy/65">Current Status</span>
              <span className="font-bold text-brand-teal-text">Pending Availability Confirmation</span>
            </div>
            <div>
              <span className="block text-xs text-brand-navy/65">Requested Date &amp; Time</span>
              <span className="font-semibold text-brand-navy">
                {booking.date} at {booking.preferredTime}
              </span>
            </div>
            <div>
              <span className="block text-xs text-brand-navy/65">Party Size &amp; Occasion</span>
              <span className="font-semibold text-brand-navy">
                {booking.guestCount} guests · {booking.occasion}
              </span>
            </div>
          </div>

          {eventRequest && (
            <div className="rounded-2xl bg-surface p-4 border border-brand-navy/15 text-sm space-y-1">
              <p className="font-bold text-brand-navy">
                Linked Event Planning Request ({eventRequest.reference})
              </p>
              <p className="text-brand-navy/80">
                Service level: {formatEventServiceLevelLabel(eventRequest.serviceLevel)}. Our event
                coordinators will prepare a custom quote alongside your venue request.
              </p>
            </div>
          )}

          <div className="space-y-2 text-sm text-brand-navy/80 leading-relaxed">
            <p>
              An acknowledgement email has been logged for{' '}
              <strong className="text-brand-navy">{booking.guestEmail}</strong>. Our concierge team
              is checking availability directly with the venue and will follow up by email with the
              confirmed amount due and your payment link.
            </p>
            <p className="text-xs text-brand-navy/65">
              No payment is taken until availability is confirmed. If you booked as a guest, you can
              create an account later with this same verified email to view this booking in your
              dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2">
            {currentUser ? (
              <BrandLinkButton href="/account" variant="primary" size="md">
                View My Bookings
              </BrandLinkButton>
            ) : (
              <BrandLinkButton href="/venues" variant="primary" size="md">
                Explore More Venues
              </BrandLinkButton>
            )}
            <BrandLinkButton href={`/venues/${venue.slug}`} variant="alternative" size="md">
              Back to {venue.name}
            </BrandLinkButton>
            {isAdminUser && (
              <BrandLinkButton href="/admin" variant="secondary" size="md">
                Review in Admin Console
              </BrandLinkButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-brand-navy/70">
        <Link href="/venues" className="hover:underline text-brand-teal-text font-medium">
          Venues
        </Link>{' '}
        <span aria-hidden="true">·</span>{' '}
        <Link
          href={`/venues/${venue.slug}`}
          className="hover:underline text-brand-teal-text font-medium"
        >
          {venue.name}
        </Link>{' '}
        <span aria-hidden="true">·</span> <span className="text-brand-navy">Request Booking</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Booking Form */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-5 sm:p-8 border border-brand-navy/15 space-y-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-brand-teal-text">
              Concierge Booking Request · Guest Checkout Supported
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              Request a booking at {venue.name}
            </h1>
            <p className="text-sm text-brand-navy/75">
              Submit your request as a guest or signed-in member. No payment is taken until our team
              confirms venue availability.
            </p>
          </div>

          {siteSettings.guestPaymentMode === 'wallet_only' && !currentUser && (
            <div className="rounded-2xl bg-[#FFF3E8] border border-[#FDBA74] p-4 flex items-start gap-3 text-sm text-[#9A3412]">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Wallet-only payment mode is currently active</p>
                <p className="text-xs leading-relaxed">
                  You can still submit this booking request as a guest now, however a verified
                  Decompress account with a funded wallet will be required to complete payment once
                  availability is approved.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-sm text-[#B91C1C]"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden Honeypot Field for Bot Prevention */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="website_url">Website</label>
              <input
                id="website_url"
                name="website_url"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Section 1: Date, Time, Guests & Occasion */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-brand-navy border-b border-brand-navy/10 pb-2">
                1. Experience Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="booking-date" className="block text-sm font-semibold text-brand-navy">
                    Preferred Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                  />
                  <p className="text-xs text-brand-navy/65">
                    Indicates your preferred date only — does not reflect live venue availability.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="booking-time" className="block text-sm font-semibold text-brand-navy">
                    Preferred Time <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    required
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="booking-guests" className="block text-sm font-semibold text-brand-navy">
                    Number of Guests <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="booking-guests"
                    type="number"
                    min={1}
                    max={venue.capacity}
                    required
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                  />
                  <p className="text-xs text-brand-navy/65">
                    Venue capacity: up to {venue.capacity} guests.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="booking-occasion" className="block text-sm font-semibold text-brand-navy">
                    Occasion <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="booking-occasion"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                  >
                    {SEED_OCCASIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-sm font-semibold text-brand-navy">Booking Type</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {venue.bookingTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBookingType(type)}
                      aria-pressed={bookingType === type}
                      className={`min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-semibold border transition-colors cursor-pointer ${
                        bookingType === type
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'bg-white text-brand-navy border-brand-navy/20 hover:bg-surface-teal'
                      }`}
                    >
                      {formatBookingTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details (Guest or Pre-filled Member) */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-navy/10 pb-2">
                <h2 className="text-base font-bold text-brand-navy">2. Contact Details</h2>
                {!currentUser && (
                  <Link
                    href={`/login?next=${encodeURIComponent(`/book/${venue.slug}${prefillDate ? `?date=${prefillDate}` : ''}`)}`}
                    className="text-xs font-semibold text-brand-teal-text hover:underline"
                  >
                    Already have an account? Sign in (optional)
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="guest-name" className="block text-sm font-semibold text-brand-navy">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="guest-name"
                    type="text"
                    required
                    maxLength={120}
                    placeholder="e.g. Tunde Adeyemi"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="guest-email" className="block text-sm font-semibold text-brand-navy">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="guest-email"
                    type="email"
                    required
                    maxLength={160}
                    placeholder="you@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="guest-phone" className="block text-sm font-semibold text-brand-navy">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="guest-phone"
                    type="tel"
                    required
                    maxLength={40}
                    placeholder="+234 800 000 0000"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="special-requests" className="block text-sm font-semibold text-brand-navy">
                  Special Requests or Seating Preferences (Optional)
                </label>
                <textarea
                  id="special-requests"
                  rows={3}
                  maxLength={1500}
                  placeholder="Share dietary preferences, celebration notes, seating requests, or budget preferences..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                />
              </div>
            </div>

            {/* Section 3: Optional Event Planning & Add-Ons */}
            <div className="space-y-4">
              <div className="border-b border-brand-navy/10 pb-2 space-y-0.5">
                <h2 className="text-base font-bold text-brand-navy">
                  3. Optional Event Planning &amp; Add-Ons
                </h2>
                <p className="text-xs text-brand-navy/70">
                  Leave unselected if you only need a standard venue booking.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="event-service-level" className="block text-sm font-semibold text-brand-navy">
                  Event Service Level (Optional)
                </label>
                <select
                  id="event-service-level"
                  value={eventServiceLevel}
                  onChange={(e) => setEventServiceLevel(e.target.value as EventServiceLevel | '')}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                >
                  <option value="">No additional event planning needed</option>
                  {SEED_EVENT_SERVICE_LEVELS.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-semibold text-brand-navy">
                  Optional Add-Ons (Custom quoted or indicative)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {addOns.map((addon) => {
                    const checked = selectedAddOnIds.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className={`flex items-start gap-2.5 rounded-xl p-3 border cursor-pointer transition-colors ${
                          checked
                            ? 'bg-surface-teal border-brand-teal'
                            : 'bg-white border-brand-navy/15 hover:bg-surface'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddOn(addon.id)}
                          className="mt-1 h-4 w-4 accent-brand-teal"
                        />
                        <span className="text-xs space-y-0.5">
                          <span className="block font-bold text-brand-navy">{addon.name}</span>
                          {addon.fixedPriceMinor && (
                            <span className="block font-semibold text-brand-teal-text tabular-nums">
                              Indicative: {formatMoneyMinor(addon.fixedPriceMinor, addon.currency)}
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <BrandButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? 'Submitting Request...' : 'Submit Booking Request'}
              </BrandButton>
              <p className="text-xs text-brand-navy/65">
                You will receive a DCP-XXXXXX reference immediately. Payment is only requested after
                our concierge confirms availability with {venue.name}.
              </p>
            </div>
          </form>
        </div>

        {/* Right: Venue Summary Sidebar */}
        <aside className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-5 lg:sticky lg:top-24">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-brand-teal-text capitalize">
              {venue.setting} Venue · {venue.neighbourhood}
            </span>
            <h2 className="text-xl font-bold text-brand-navy">{venue.name}</h2>
            <p className="flex items-start gap-1.5 text-xs text-brand-navy/75">
              <MapPin className="h-3.5 w-3.5 text-brand-teal shrink-0 mt-0.5" />
              <span>{venue.address}</span>
            </p>
          </div>

          <div className="rounded-xl bg-surface-teal p-4 border border-brand-teal/20 space-y-1">
            <span className="text-xs font-medium text-brand-navy/70">Indicative Budget Range</span>
            <p className="text-lg font-bold text-brand-navy tabular-nums">
              {formatBudgetRange(
                venue.budgetMinMinor,
                venue.budgetMaxMinor,
                venue.currency,
                venue.budgetBasis
              )}
            </p>
            <p className="text-[11px] text-brand-navy/65">
              Indicative planning guide only. Final confirmed amount is sent by our team on approval.
            </p>
          </div>

          <div className="space-y-2 text-xs text-brand-navy/80 border-t border-brand-navy/10 pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-teal shrink-0" />
              <span>{venue.openingHours}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-teal shrink-0" />
              <span>Up to {venue.capacity} guests</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-teal shrink-0" />
              <span>Concierge-verified availability</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-teal shrink-0" />
              <span>No payment charged on request</span>
            </div>
          </div>

          {venue.confirmedOfferText && (
            <div className="rounded-xl bg-surface p-3.5 border border-brand-navy/10 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-brand-teal-text">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Confirmed Decompress Offer</span>
              </div>
              <p className="text-brand-navy/85">{venue.confirmedOfferText}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function BookVenuePage({
  params,
}: {
  params: Promise<{ venueSlug: string }>;
}) {
  const { venueSlug } = use(params);
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-16 text-sm text-brand-navy/75">
          Loading booking form...
        </div>
      }
    >
      <BookingFormContent venueSlug={venueSlug} />
    </Suspense>
  );
}
