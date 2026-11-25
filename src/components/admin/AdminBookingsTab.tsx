'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle2, ExternalLink, History, Users } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { BookingStatus } from '@/src/types/domain';
import {
  formatBookingStatusLabel,
  getBookingStatusBadgeClass,
} from '@/src/lib/booking-machine';
import { formatCurrencyMinor, formatUtcTimestamp } from '@/src/lib/format';

const STATUS_FILTERS: Array<BookingStatus | 'all'> = [
  'all',
  'pending',
  'approved',
  'confirmed',
  'completed',
  'unavailable',
  'cancelled',
];

export function AdminBookingsTab() {
  const {
    bookings,
    bookingHistory,
    payments,
    siteSettings,
    adminTransitionBookingStatus,
  } = useDecompress();

  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({});
  const [cancelReasonDrafts, setCancelReasonDrafts] = useState<Record<string, string>>({});
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      b.reference.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) ||
      b.guestEmail.toLowerCase().includes(q) ||
      b.venueName.toLowerCase().includes(q)
    );
  });

  const handleAction = async (
    bookingId: string,
    toStatus: BookingStatus,
    extra?: { amountDueMinor?: number; cancellationReason?: string; note?: string }
  ) => {
    setNotice(null);
    setBusyId(bookingId);
    try {
      const { booking } = await adminTransitionBookingStatus(bookingId, toStatus, extra);
      setNotice({
        type: 'ok',
        text: `Booking ${booking.reference} transitioned to ${formatBookingStatusLabel(booking.status)}.`,
      });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Status update failed.',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer capitalize ${
                statusFilter === st
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-brand-navy border-brand-navy/15 hover:bg-surface-teal'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search DCP-XXXXXX, guest, or venue..."
          className="w-full md:w-72 min-h-[40px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2 text-xs text-brand-navy focus:border-brand-teal focus:outline-none"
        />
      </div>

      {notice && (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            notice.type === 'ok'
              ? 'bg-surface-teal border-brand-teal/30 text-brand-navy'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]'
          }`}
        >
          {notice.text}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 border border-brand-navy/15 text-center space-y-2">
          <p className="text-base font-bold text-brand-navy">No booking requests match this filter</p>
          <p className="text-sm text-brand-navy/70">
            Submit a test booking from any venue page (e.g.{' '}
            <Link href="/venues" className="text-brand-teal-text underline font-semibold">
              Explore Venues
            </Link>
            ) to process approvals, payment links, and verified reviews here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const payment = payments.find((p) => p.bookingId === booking.id);
            const historyItems = bookingHistory.filter((h) => h.bookingId === booking.id);
            const amountDraft = amountDrafts[booking.id] ?? '250000';
            const cancelReason = cancelReasonDrafts[booking.id] ?? '';

            return (
              <article
                key={booking.id}
                className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
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
                      <span className="text-brand-navy/60">
                        {formatUtcTimestamp(booking.createdAtUtc, siteSettings.defaultTimezone)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-brand-navy">{booking.venueName}</h3>
                    <p className="text-xs text-brand-navy/80">
                      <strong>{booking.guestName}</strong> · {booking.guestEmail} ·{' '}
                      {booking.guestPhone}
                    </p>
                  </div>

                  {typeof booking.amountDueMinor === 'number' && booking.amountDueMinor > 0 && (
                    <div className="text-left sm:text-right shrink-0">
                      <span className="block text-xs text-brand-navy/65">Confirmed Amount</span>
                      <span className="text-base font-bold text-brand-navy tabular-nums">
                        {formatCurrencyMinor(booking.amountDueMinor, booking.currency)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-navy/80">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-brand-teal" />
                    {booking.date} at {booking.preferredTime}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-brand-teal" />
                    {booking.guestCount} guests ({booking.bookingType.replace('_', ' ')})
                  </span>
                  <span>Occasion: {booking.occasion}</span>
                </div>

                {booking.specialRequests && (
                  <p className="text-xs text-brand-navy/80 bg-surface rounded-xl px-3.5 py-2.5 border border-brand-navy/10">
                    <strong>Special requests:</strong> {booking.specialRequests}
                  </p>
                )}

                {/* Operational Actions by Status */}
                <div className="pt-3 border-t border-brand-navy/10 space-y-3">
                  {booking.status === 'pending' && (
                    <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                      <div className="space-y-1">
                        <label
                          htmlFor={`amt-${booking.id}`}
                          className="block text-xs font-semibold text-brand-navy"
                        >
                          Confirmed Amount Due ({booking.currency})
                        </label>
                        <input
                          id={`amt-${booking.id}`}
                          type="number"
                          min={1000}
                          step={5000}
                          value={amountDraft}
                          onChange={(e) =>
                            setAmountDrafts((prev) => ({
                              ...prev,
                              [booking.id]: e.target.value,
                            }))
                          }
                          className="w-full sm:w-48 min-h-[40px] rounded-xl border border-brand-navy/20 px-3 py-1.5 text-sm text-brand-navy"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busyId === booking.id}
                          onClick={() =>
                            handleAction(booking.id, 'approved', {
                              amountDueMinor: Math.round((Number(amountDraft) || 0) * 100),
                              note: 'Availability confirmed with venue and payment link dispatched.',
                            })
                          }
                          className="min-h-[40px] px-4 py-2 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:bg-brand-teal-dark transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Approve &amp; Send Payment Link
                        </button>
                        <button
                          type="button"
                          disabled={busyId === booking.id}
                          onClick={() =>
                            handleAction(booking.id, 'unavailable', {
                              note: 'Venue unavailable for requested date/party size.',
                            })
                          }
                          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-surface text-brand-navy border border-brand-navy/20 text-xs font-semibold hover:bg-brand-navy/5 cursor-pointer"
                        >
                          Mark Unavailable
                        </button>
                      </div>
                    </div>
                  )}

                  {booking.status === 'approved' && payment && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-teal/70 p-3.5 border border-brand-teal/25">
                      <div className="text-xs text-brand-navy">
                        <strong>Guest Payment Link Ready:</strong>{' '}
                        <span className="font-mono">/pay/{payment.guestPayToken}</span>
                      </div>
                      <Link
                        href={`/pay/${payment.guestPayToken}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal-text hover:underline"
                      >
                        <span>Open Payment Page</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === booking.id}
                        onClick={() =>
                          handleAction(booking.id, 'completed', {
                            note: 'Visit completed; one-time Verified review invitation sent.',
                          })
                        }
                        className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navy-light cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Mark Completed &amp; Send Review Link</span>
                      </button>
                    </div>
                  )}

                  {booking.status === 'completed' && booking.reviewToken && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-teal/70 p-3.5 border border-brand-teal/25">
                      <div className="text-xs text-brand-navy">
                        <strong>One-Time Verified Review Link:</strong>{' '}
                        <span className="font-mono">/review/{booking.reviewToken}</span>
                      </div>
                      <Link
                        href={`/review/${booking.reviewToken}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal-text hover:underline"
                      >
                        <span>Open Review Page</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}

                  {/* Cancellation Option for non-terminal bookings */}
                  {(booking.status === 'pending' ||
                    booking.status === 'approved' ||
                    booking.status === 'confirmed') && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Cancellation reason (required to cancel)..."
                        value={cancelReason}
                        onChange={(e) =>
                          setCancelReasonDrafts((prev) => ({
                            ...prev,
                            [booking.id]: e.target.value,
                          }))
                        }
                        className="flex-1 min-h-[38px] rounded-xl border border-brand-navy/15 px-3 py-1.5 text-xs text-brand-navy"
                      />
                      <button
                        type="button"
                        disabled={busyId === booking.id || !cancelReason.trim()}
                        onClick={() =>
                          handleAction(booking.id, 'cancelled', {
                            cancellationReason: cancelReason,
                          })
                        }
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50 disabled:opacity-40 cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}

                  {/* Audit Trail Toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedHistoryId(expandedHistoryId === booking.id ? null : booking.id)
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal-text hover:underline cursor-pointer"
                    >
                      <History className="h-3.5 w-3.5" />
                      <span>
                        {expandedHistoryId === booking.id
                          ? 'Hide Status Audit Trail'
                          : `View Status Audit Trail (${historyItems.length})`}
                      </span>
                    </button>

                    {expandedHistoryId === booking.id && (
                      <div className="mt-2.5 rounded-xl bg-surface p-3.5 border border-brand-navy/10 space-y-2 text-xs">
                        {historyItems.length === 0 ? (
                          <p className="text-brand-navy/65">No status transitions recorded.</p>
                        ) : (
                          historyItems.map((h) => (
                            <div
                              key={h.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-brand-navy/5 last:border-0 pb-1.5 last:pb-0"
                            >
                              <div>
                                <span className="font-semibold text-brand-navy">
                                  {h.fromStatus} → {h.toStatus}
                                </span>{' '}
                                <span className="text-brand-navy/75">· {h.note}</span>
                              </div>
                              <span className="text-brand-navy/55 shrink-0">
                                {h.actor} ·{' '}
                                {formatUtcTimestamp(h.timestampUtc, siteSettings.defaultTimezone)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
