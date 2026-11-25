'use client';

import React, { useState } from 'react';
import { Download, Lock, Save } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { SettlementStatus } from '@/src/types/domain';
import { formatCurrencyMinor, formatUtcTimestamp } from '@/src/lib/format';
import { downloadInvoicePdf } from '@/src/lib/pdf-invoice';

interface SettlementDraft {
  customerAmountReceivedNgn: string;
  venueBillAmountNgn: string;
  venueBillFileName: string;
  agreedDiscountNgn: string;
  decompressShareNgn: string;
  amountPayableToVenueNgn: string;
  amountRetainedNgn: string;
  settlementStatus: SettlementStatus;
}

export function AdminFinanceTab() {
  const { invoices, bookings, settlements, siteSettings, adminSaveSettlement } = useDecompress();

  const [drafts, setDrafts] = useState<Record<string, SettlementDraft>>({});
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const paidOrCompletedBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'completed'
  );

  const getDraft = (bookingId: string): SettlementDraft => {
    if (drafts[bookingId]) return drafts[bookingId];
    const existing = settlements.find((s) => s.bookingId === bookingId);
    const booking = bookings.find((b) => b.id === bookingId);
    return {
      customerAmountReceivedNgn: String(
        Math.round(
          (existing?.customerAmountReceivedMinor ?? booking?.amountDueMinor ?? 0) / 100
        )
      ),
      venueBillAmountNgn: String(Math.round((existing?.venueBillAmountMinor ?? 0) / 100)),
      venueBillFileName: existing?.venueBillFileName || '',
      agreedDiscountNgn: String(Math.round((existing?.agreedDiscountMinor ?? 0) / 100)),
      decompressShareNgn: String(Math.round((existing?.decompressShareMinor ?? 0) / 100)),
      amountPayableToVenueNgn: String(
        Math.round((existing?.amountPayableToVenueMinor ?? 0) / 100)
      ),
      amountRetainedNgn: String(Math.round((existing?.amountRetainedMinor ?? 0) / 100)),
      settlementStatus: existing?.settlementStatus || 'unreconciled',
    };
  };

  const updateDraft = (bookingId: string, patch: Partial<SettlementDraft>) => {
    const current = getDraft(bookingId);
    setDrafts((prev) => ({
      ...prev,
      [bookingId]: { ...current, ...patch },
    }));
  };

  const handleSaveSettlement = async (bookingId: string) => {
    const d = getDraft(bookingId);
    const saved = await adminSaveSettlement(bookingId, {
      customerAmountReceivedMinor: Math.round((Number(d.customerAmountReceivedNgn) || 0) * 100),
      venueBillAmountMinor: Math.round((Number(d.venueBillAmountNgn) || 0) * 100),
      venueBillFileName: d.venueBillFileName,
      agreedDiscountMinor: Math.round((Number(d.agreedDiscountNgn) || 0) * 100),
      decompressShareMinor: Math.round((Number(d.decompressShareNgn) || 0) * 100),
      amountPayableToVenueMinor: Math.round((Number(d.amountPayableToVenueNgn) || 0) * 100),
      amountRetainedMinor: Math.round((Number(d.amountRetainedNgn) || 0) * 100),
      settlementStatus: d.settlementStatus,
    });
    setSavedBanner(`Saved commercial settlement for ${saved.bookingReference}.`);
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Customer Invoices */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-brand-navy">Issued Customer Invoices</h2>
          <p className="text-xs text-brand-navy/70">
            Generated automatically upon signature-verified payment confirmation.
          </p>
        </div>

        {invoices.length === 0 ? (
          <p className="text-sm text-brand-navy/70">No paid customer invoices yet.</p>
        ) : (
          <div className="divide-y divide-brand-navy/10">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5 text-sm">
                  <p className="font-bold text-brand-navy">
                    <span className="font-mono">{inv.invoiceNumber}</span> · {inv.venueName} (
                    <span className="font-mono">{inv.bookingReference}</span>)
                  </p>
                  <p className="text-xs text-brand-navy/75">
                    {inv.customerName} ({inv.customerEmail}) · Issued{' '}
                    {formatUtcTimestamp(inv.issuedAtUtc, siteSettings.defaultTimezone)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-brand-navy tabular-nums">
                    {formatCurrencyMinor(inv.amountPaidMinor, inv.currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadInvoicePdf(inv, siteSettings.defaultTimezone)}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl bg-surface-teal text-brand-teal-text border border-brand-teal/30 text-xs font-semibold hover:bg-brand-teal hover:text-white transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Admin-Only Commercial Settlements */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal-text">
              <Lock className="h-3.5 w-3.5" />
              <span>Admin-Only Finance &amp; Commercial Reconciliation</span>
            </div>
            <h2 className="text-lg font-bold text-brand-navy">Per-Booking Settlement Tracker</h2>
            <p className="text-xs text-brand-navy/75">
              Never visible to customers. All figures are free-form editable per booking with zero
              hard-coded commission or discount formulas.
            </p>
          </div>
        </div>

        {savedBanner && (
          <div className="rounded-xl bg-surface-teal border border-brand-teal/30 px-4 py-2.5 text-xs font-semibold text-brand-navy">
            {savedBanner}
          </div>
        )}

        {paidOrCompletedBookings.length === 0 ? (
          <p className="text-sm text-brand-navy/70">
            Once a booking is confirmed via payment, its commercial settlement worksheet appears
            here.
          </p>
        ) : (
          <div className="space-y-5">
            {paidOrCompletedBookings.map((booking) => {
              const d = getDraft(booking.id);
              return (
                <div
                  key={booking.id}
                  className="rounded-2xl bg-surface p-5 border border-brand-navy/15 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono font-bold text-brand-teal-text">
                        {booking.reference} · {booking.date}
                      </p>
                      <h3 className="text-base font-bold text-brand-navy">
                        {booking.venueName} — {booking.guestName}
                      </h3>
                    </div>
                    <select
                      aria-label={`Settlement status for ${booking.reference}`}
                      value={d.settlementStatus}
                      onChange={(e) =>
                        updateDraft(booking.id, {
                          settlementStatus: e.target.value as SettlementStatus,
                        })
                      }
                      className="min-h-[38px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy"
                    >
                      <option value="unreconciled">Unreconciled</option>
                      <option value="pending_payout">Pending Payout</option>
                      <option value="settled">Settled</option>
                      <option value="disputed">Disputed</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <label className="space-y-1">
                      <span className="block font-semibold text-brand-navy">
                        Customer Amount Received ({booking.currency})
                      </span>
                      <input
                        type="number"
                        value={d.customerAmountReceivedNgn}
                        onChange={(e) =>
                          updateDraft(booking.id, { customerAmountReceivedNgn: e.target.value })
                        }
                        className="w-full min-h-[38px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-sm text-brand-navy"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="block font-semibold text-brand-navy">
                        Venue Bill Amount ({booking.currency})
                      </span>
                      <input
                        type="number"
                        value={d.venueBillAmountNgn}
                        onChange={(e) =>
                          updateDraft(booking.id, { venueBillAmountNgn: e.target.value })
                        }
                        className="w-full min-h-[38px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-sm text-brand-navy"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="block font-semibold text-brand-navy">
                        Venue Bill Reference / Filename
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. venue-bill-001.pdf"
                        value={d.venueBillFileName}
                        onChange={(e) =>
                          updateDraft(booking.id, { venueBillFileName: e.target.value })
                        }
                        className="w-full min-h-[38px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-sm text-brand-navy"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="block font-semibold text-brand-navy">
                        Agreed Discount ({booking.currency})
                      </span>
                      <input
                        type="number"
                        value={d.agreedDiscountNgn}
                        onChange={(e) =>
                          updateDraft(booking.id, { agreedDiscountNgn: e.target.value })
                        }
                        className="w-full min-h-[38px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-sm text-brand-navy"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="block font-semibold text-brand-navy">
                        Decompress Share ({booking.currency})
                      </span>
                      <input
                        type="number"
                        value={d.decompressShareNgn}
                        onChange={(e) =>
                          updateDraft(booking.id, { decompressShareNgn: e.target.value })
                        }
                        className="w-full min-h-[38px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-sm text-brand-navy"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="block font-semibold text-brand-navy">
                        Amount Payable to Venue ({booking.currency})
                      </span>
                      <input
                        type="number"
                        value={d.amountPayableToVenueNgn}
                        onChange={(e) =>
                          updateDraft(booking.id, { amountPayableToVenueNgn: e.target.value })
                        }
                        className="w-full min-h-[38px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-sm text-brand-navy"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="block font-semibold text-brand-navy">
                        Amount Retained ({booking.currency})
                      </span>
                      <input
                        type="number"
                        value={d.amountRetainedNgn}
                        onChange={(e) =>
                          updateDraft(booking.id, { amountRetainedNgn: e.target.value })
                        }
                        className="w-full min-h-[38px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-sm text-brand-navy"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveSettlement(booking.id)}
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navy-light cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Settlement Record</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
