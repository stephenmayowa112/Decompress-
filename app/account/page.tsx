'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CreditCard,
  Download,
  RefreshCw,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { AccountShell } from '@/src/components/account/AccountShell';
import { BrandLinkButton } from '@/src/components/ui/Button';
import { formatMoneyMinor } from '@/src/lib/format';
import {
  formatBookingStatusLabel,
  getBookingStatusBadgeClass,
} from '@/src/lib/booking-machine';
import { downloadInvoicePdf } from '@/src/lib/pdf-invoice';

export default function AccountBookingsDashboardPage() {
  const {
    currentUser,
    userBookings,
    payments,
    invoices,
    reviews,
    siteSettings,
    profileLoading,
    syncAndLinkGuestBookings,
  } = useDecompress();

  const [checkingGuestBookings, setCheckingGuestBookings] = useState(false);
  const [linkStatusMessage, setLinkStatusMessage] = useState<string | null>(null);

  const handleCheckGuestBookings = async () => {
    setCheckingGuestBookings(true);
    setLinkStatusMessage(null);
    try {
      const count = await syncAndLinkGuestBookings();
      if (count > 0) {
        setLinkStatusMessage(
          `Found and attached ${count} earlier guest ${count === 1 ? 'booking' : 'bookings'} to your account.`
        );
      } else {
        setLinkStatusMessage('No additional unlinked guest bookings found for your verified email.');
      }
    } finally {
      setCheckingGuestBookings(false);
    }
  };

  return (
    <AccountShell
      title="Bookings Dashboard"
      subtitle="Track your venue booking requests, complete payment on approved bookings, download PDF invoices, and leave Verified reviews."
    >
      {/* Verified-Email Guest Booking Sync Action */}
      {currentUser?.emailVerified && (
        <div className="rounded-2xl bg-surface-teal/70 p-4 sm:p-5 border border-brand-teal/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-bold text-brand-navy">
              Verified-Email Guest Booking Linking
            </p>
            <p className="text-xs text-brand-navy/75">
              Earlier guest bookings made with <strong>{currentUser.email}</strong> attach
              automatically when you sign in.
            </p>
            {linkStatusMessage && (
              <p className="text-xs font-semibold text-brand-teal-text pt-1">{linkStatusMessage}</p>
            )}
          </div>
          <button
            type="button"
            disabled={checkingGuestBookings}
            onClick={handleCheckGuestBookings}
            className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl bg-white border border-brand-teal text-xs font-semibold text-brand-teal-text hover:bg-surface-teal transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${checkingGuestBookings ? 'animate-spin' : ''}`} />
            <span>{checkingGuestBookings ? 'Checking...' : 'Check for Guest Bookings'}</span>
          </button>
        </div>
      )}

      {/* Bookings List or Empty State */}
      {profileLoading ? (
        <div className="rounded-2xl bg-white p-8 border border-brand-navy/10 text-sm text-brand-navy/75">
          Loading your bookings...
        </div>
      ) : userBookings.length > 0 ? (
        <div className="space-y-4">
          {userBookings.map((booking) => {
            const payment = payments.find((p) => p.bookingId === booking.id);
            const invoice = invoices.find((inv) => inv.bookingId === booking.id);
            const hasReview = reviews.some((r) => r.bookingId === booking.id);

            return (
              <article
                key={booking.id}
                className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-brand-navy">
                        {booking.reference}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 font-semibold ${getBookingStatusBadgeClass(
                          booking.status
                        )}`}
                      >
                        {formatBookingStatusLabel(booking.status)}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-brand-navy">
                      <Link href={`/venues/${booking.venueSlug}`} className="hover:underline">
                        {booking.venueName}
                      </Link>
                    </h2>
                  </div>
                  {typeof booking.amountDueMinor === 'number' && booking.amountDueMinor > 0 && (
                    <div className="text-left sm:text-right shrink-0">
                      <span className="block text-xs text-brand-navy/65">
                        {booking.status === 'confirmed' || booking.status === 'completed'
                          ? 'Amount Paid'
                          : 'Confirmed Amount Due'}
                      </span>
                      <span className="text-base font-bold text-brand-navy tabular-nums">
                        {formatMoneyMinor(booking.amountDueMinor, booking.currency)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-brand-navy/80">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-brand-teal" />
                    <span>
                      {booking.date} at {booking.preferredTime}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-brand-teal" />
                    <span>{booking.guestCount} guests</span>
                  </span>
                  <span>{booking.occasion}</span>
                </div>

                {booking.cancellationReason && (
                  <p className="text-xs text-[#B91C1C] bg-[#FEF2F2] rounded-xl px-3.5 py-2 border border-[#FECACA]">
                    Cancellation note: {booking.cancellationReason}
                  </p>
                )}

                {/* Contextual Lifecycle Actions */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-brand-navy/10">
                  {booking.status === 'approved' && payment && (
                    <BrandLinkButton
                      href={`/pay/${payment.guestPayToken}`}
                      variant="primary"
                      size="sm"
                      fullWidthOnMobile={false}
                    >
                      <CreditCard className="h-4 w-4 mr-1.5 inline" />
                      Complete Payment
                    </BrandLinkButton>
                  )}

                  {invoice && (
                    <button
                      type="button"
                      onClick={() => downloadInvoicePdf(invoice, siteSettings.defaultTimezone)}
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl bg-surface-teal text-brand-teal-text border border-brand-teal/30 text-xs font-semibold hover:bg-brand-teal hover:text-white transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PDF Invoice ({invoice.invoiceNumber})</span>
                    </button>
                  )}

                  {booking.status === 'completed' && !hasReview && (
                    <Link
                      href={`/review/${booking.reviewToken || booking.id}`}
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navy-light transition-colors"
                    >
                      <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
                      <span>Leave Verified Review</span>
                    </Link>
                  )}

                  {booking.status === 'completed' && hasReview && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal-text">
                      <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
                      <span>Verified Review Submitted</span>
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-6 sm:p-10 border border-brand-navy/15 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-teal text-brand-teal-text">
            <Sparkles className="h-6 w-6 text-brand-teal" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-brand-navy">No booking requests yet</h2>
            <p className="text-sm text-brand-navy/75 max-w-md mx-auto leading-relaxed">
              Once you submit a venue booking request—or when an earlier guest booking matches your
              verified email—it will appear here with its status and DCP-XXXXXX reference.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-1">
            <BrandLinkButton href="/venues" variant="primary" size="md">
              Explore Venues
            </BrandLinkButton>
            <BrandLinkButton href="/plan-event" variant="alternative" size="md">
              Plan an Event
            </BrandLinkButton>
          </div>
        </div>
      )}
    </AccountShell>
  );
}
