'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  CreditCard,
  Download,
  Lock,
  ShieldCheck,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { formatCurrencyMinor, formatUtcTimestamp } from '@/src/lib/format';
import { downloadInvoicePdf } from '@/src/lib/pdf-invoice';
import { BrandButton, BrandLinkButton } from '@/src/components/ui/Button';

export default function TokenisedPaymentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const {
    payments,
    bookings,
    invoices,
    wallet,
    siteSettings,
    currentUser,
    completePaymentCheckout,
    payBookingWithWallet,
  } = useDecompress();

  const payment = payments.find((p) => p.guestPayToken === token);
  const booking = payment ? bookings.find((b) => b.id === payment.bookingId) : undefined;
  const existingInvoice = booking ? invoices.find((inv) => inv.bookingId === booking.id) : undefined;

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paidInvoiceId, setPaidInvoiceId] = useState<string | null>(null);
  const [idempotentNotice, setIdempotentNotice] = useState(false);

  const activeInvoice =
    existingInvoice || invoices.find((inv) => inv.id === paidInvoiceId);

  if (!payment || !booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-brand-navy">Payment link not found</h1>
        <p className="text-sm text-brand-navy/75">
          This payment link may have expired or does not match an approved booking in this session.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <BrandLinkButton href="/account" variant="primary" size="md" fullWidthOnMobile={false}>
            View My Account
          </BrandLinkButton>
          <BrandLinkButton href="/contact" variant="alternative" size="md" fullWidthOnMobile={false}>
            Contact Support
          </BrandLinkButton>
        </div>
      </div>
    );
  }

  const isPaid = payment.status === 'succeeded' && booking.status === 'confirmed' && Boolean(activeInvoice);
  const canUseWallet =
    siteSettings.walletEnabled &&
    Boolean(currentUser?.emailVerified) &&
    Boolean(wallet && wallet.balanceMinor >= payment.amountMinor);

  const handleGatewayCheckout = async () => {
    setErrorMessage(null);
    setProcessing(true);
    try {
      const res = await completePaymentCheckout(token, 'card_sandbox');
      setPaidInvoiceId(res.invoice.id);
      if (res.duplicate) setIdempotentNotice(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to complete payment. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleWalletCheckout = async () => {
    setErrorMessage(null);
    setProcessing(true);
    try {
      const res = await payBookingWithWallet(booking.id);
      setPaidInvoiceId(res.invoice.id);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to pay with wallet. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
      <div className="rounded-3xl bg-white p-6 sm:p-10 border border-brand-navy/15 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-brand-teal-text">
              Decompress Secure Payment · Ref {booking.reference}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              {isPaid ? 'Booking Confirmed & Paid' : `Complete Payment for ${booking.venueName}`}
            </h1>
          </div>
          <div className="rounded-xl bg-surface-teal px-4 py-2.5 text-left sm:text-right shrink-0">
            <span className="block text-xs text-brand-navy/70">
              {isPaid ? 'Amount Paid' : 'Confirmed Amount Due'}
            </span>
            <span className="text-xl font-bold text-brand-navy tabular-nums">
              {formatCurrencyMinor(payment.amountMinor, payment.currency)}
            </span>
          </div>
        </div>

        {/* Booking Summary Grid */}
        <div className="rounded-2xl bg-surface p-5 border border-brand-navy/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="block text-xs text-brand-navy/65">Venue</span>
            <span className="font-semibold text-brand-navy">{booking.venueName}</span>
          </div>
          <div>
            <span className="block text-xs text-brand-navy/65">Guest Name</span>
            <span className="font-semibold text-brand-navy">{booking.guestName}</span>
          </div>
          <div>
            <span className="block text-xs text-brand-navy/65">Event Date &amp; Time</span>
            <span className="font-semibold text-brand-navy">
              {booking.date} at {booking.preferredTime}
            </span>
          </div>
          <div>
            <span className="block text-xs text-brand-navy/65">Party &amp; Occasion</span>
            <span className="font-semibold text-brand-navy">
              {booking.guestCount} guests · {booking.occasion}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-sm text-[#B91C1C]"
          >
            {errorMessage}
          </div>
        )}

        {isPaid && activeInvoice ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-surface-teal p-5 border border-brand-teal/30 flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-brand-teal shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-bold text-brand-navy">
                  Payment Verified (Invoice {activeInvoice.invoiceNumber})
                </p>
                <p className="text-brand-navy/80">
                  Your booking at <strong>{booking.venueName}</strong> is confirmed. Provider
                  reference: <span className="font-mono">{payment.providerReference}</span>.
                </p>
                <p className="text-xs text-brand-navy/65">
                  Issued: {formatUtcTimestamp(activeInvoice.issuedAtUtc, siteSettings.defaultTimezone)}
                  {idempotentNotice ? ' · Duplicate webhook delivery safely ignored.' : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <BrandButton
                type="button"
                variant="primary"
                size="md"
                onClick={() => downloadInvoicePdf(activeInvoice, siteSettings.defaultTimezone)}
              >
                <Download className="h-4 w-4 mr-2 inline" />
                Download PDF Invoice
              </BrandButton>
              <BrandLinkButton href={`/venues/${booking.venueSlug}`} variant="alternative" size="md">
                View Venue Details
              </BrandLinkButton>
              {currentUser && (
                <BrandLinkButton href="/account" variant="secondary" size="md">
                  Go to My Bookings
                </BrandLinkButton>
              )}
            </div>
          </div>
        ) : siteSettings.guestPaymentMode === 'wallet_only' && !currentUser ? (
          <div className="rounded-2xl bg-[#FFF3E8] p-5 border border-[#FDBA74] space-y-3">
            <p className="text-sm font-bold text-[#9A3412]">
              Sign in required for Wallet-Only Payment Mode
            </p>
            <p className="text-xs text-[#9A3412] leading-relaxed">
              This platform is currently configured to accept booking payments via a funded
              Decompress Wallet. Sign in or create an account to fund your wallet and confirm
              booking {booking.reference}.
            </p>
            <BrandLinkButton
              href={`/login?next=${encodeURIComponent(`/pay/${token}`)}`}
              variant="primary"
              size="md"
            >
              Sign In to Pay with Wallet
            </BrandLinkButton>
          </div>
        ) : (
          <div className="space-y-4">
            {siteSettings.guestPaymentMode !== 'wallet_only' && (
              <div className="rounded-2xl border border-brand-navy/15 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-brand-teal shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h2 className="text-base font-bold text-brand-navy">
                        Direct Checkout (Mock / Sandbox Payment Gateway)
                      </h2>
                      <p className="text-xs text-brand-navy/75 leading-relaxed">
                        Processes payment via our provider-agnostic adapter with server-side
                        HMAC-SHA256 webhook signature verification and idempotency protection.
                      </p>
                    </div>
                  </div>
                </div>

                <BrandButton
                  type="button"
                  variant="primary"
                  size="lg"
                  disabled={processing}
                  onClick={handleGatewayCheckout}
                  className="w-full sm:w-auto"
                >
                  {processing
                    ? 'Verifying Payment Webhook...'
                    : `Pay ${formatCurrencyMinor(payment.amountMinor, payment.currency)} Now`}
                </BrandButton>
              </div>
            )}

            {siteSettings.walletEnabled && (
              <div className="rounded-2xl border border-brand-teal/25 bg-surface-teal/40 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <WalletIcon className="h-5 w-5 text-brand-teal shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-brand-navy">
                      Pay with Decompress Wallet
                    </h2>
                    {currentUser && wallet ? (
                      <p className="text-xs text-brand-navy/80">
                        Available provider-backed balance:{' '}
                        <strong className="tabular-nums">
                          {formatCurrencyMinor(wallet.balanceMinor, wallet.currency)}
                        </strong>
                      </p>
                    ) : (
                      <p className="text-xs text-brand-navy/75">
                        Sign in to pay using your Decompress Wallet balance.
                      </p>
                    )}
                  </div>
                </div>

                {currentUser ? (
                  canUseWallet ? (
                    <BrandButton
                      type="button"
                      variant="secondary"
                      size="md"
                      disabled={processing}
                      onClick={handleWalletCheckout}
                    >
                      {processing ? 'Processing Wallet Payment...' : 'Pay Using Wallet Balance'}
                    </BrandButton>
                  ) : (
                    <Link
                      href="/account/wallet"
                      className="inline-block text-sm font-semibold text-brand-teal-text underline"
                    >
                      Fund your wallet to pay this booking →
                    </Link>
                  )
                ) : (
                  <Link
                    href={`/login?next=${encodeURIComponent(`/pay/${token}`)}`}
                    className="inline-block text-sm font-semibold text-brand-teal-text underline"
                  >
                    Sign in to use Wallet →
                  </Link>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-brand-navy/65 pt-1">
              <Lock className="h-3.5 w-3.5 text-brand-teal shrink-0" />
              <span>
                Your booking is confirmed immediately once the signed payment webhook is verified,
                and your downloadable PDF invoice is issued automatically.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-brand-navy/65">
        <ShieldCheck className="h-4 w-4 text-brand-teal" />
        <span>
          Need assistance with booking {booking.reference}? Contact{' '}
          <a href={`mailto:${siteSettings.supportEmail}`} className="underline font-semibold">
            {siteSettings.supportEmail}
          </a>
        </span>
      </div>
    </div>
  );
}
