'use client';

import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, Wallet as WalletIcon } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { AccountShell } from '@/src/components/account/AccountShell';
import { formatCurrencyMinor, formatUtcTimestamp } from '@/src/lib/format';
import { BrandButton, BrandLinkButton } from '@/src/components/ui/Button';
import { downloadInvoicePdf } from '@/src/lib/pdf-invoice';

const QUICK_FUND_NGN = [50000, 150000, 300000, 500000];

export default function AccountWalletPage() {
  const {
    currentUser,
    wallet,
    walletTransactions,
    userBookings,
    siteSettings,
    fundWallet,
    payBookingWithWallet,
  } = useDecompress();

  const [fundAmountNgn, setFundAmountNgn] = useState('150000');
  const [funding, setFunding] = useState(false);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const eligibleApprovedBookings = userBookings.filter(
    (b) => b.status === 'approved' && typeof b.amountDueMinor === 'number' && b.amountDueMinor > 0
  );

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const ngn = Number(fundAmountNgn);
    if (!Number.isFinite(ngn) || ngn <= 0) {
      setFeedback({ type: 'error', text: 'Please enter a valid funding amount in NGN.' });
      return;
    }

    setFunding(true);
    try {
      const tx = await fundWallet(Math.round(ngn * 100));
      setFeedback({
        type: 'success',
        text: `Wallet funded with ${formatCurrencyMinor(tx.amountMinor, tx.currency)} (Ref: ${tx.providerReference}).`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to fund wallet.',
      });
    } finally {
      setFunding(false);
    }
  };

  const handlePayApproved = async (bookingId: string) => {
    setFeedback(null);
    setPayingBookingId(bookingId);
    try {
      const { booking, invoice } = await payBookingWithWallet(bookingId);
      setFeedback({
        type: 'success',
        text: `Booking ${booking.reference} confirmed via Wallet! Invoice ${invoice.invoiceNumber} is ready.`,
      });
      downloadInvoicePdf(invoice, siteSettings.defaultTimezone);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Wallet payment failed.',
      });
    } finally {
      setPayingBookingId(null);
    }
  };

  return (
    <AccountShell
      title="Decompress Wallet"
      subtitle="Provider-backed wallet balance mirror for seamless funding and booking checkout."
    >
      {!siteSettings.walletEnabled ? (
        <div className="rounded-2xl bg-white p-6 sm:p-8 border border-brand-navy/15 space-y-3">
          <h2 className="text-lg font-bold text-brand-navy">Wallet Feature Currently Disabled</h2>
          <p className="text-sm text-brand-navy/75 leading-relaxed">
            Decompress Wallet is currently turned off in platform settings. You can continue paying
            for approved bookings via direct payment links.
          </p>
          <BrandLinkButton href="/account" variant="secondary" size="sm" fullWidthOnMobile={false}>
            Back to My Bookings
          </BrandLinkButton>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="rounded-3xl bg-brand-navy text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-surface-teal">
                <WalletIcon className="h-4 w-4 text-brand-teal" />
                <span>Provider-Backed Mirror Balance</span>
              </div>
              <p className="text-3xl sm:text-4xl font-bold tabular-nums">
                {wallet
                  ? formatCurrencyMinor(wallet.balanceMinor, wallet.currency)
                  : formatCurrencyMinor(0, siteSettings.defaultCurrency)}
              </p>
              {wallet && (
                <p className="text-xs text-surface-teal/80 font-mono">
                  Account Ref: {wallet.providerAccountRef}
                </p>
              )}
            </div>
            <div className="max-w-xs text-xs text-surface-teal/85 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-teal shrink-0 mt-0.5" />
              <span>
                Decompress does not hold customer funds directly; this balance mirrors your
                fintech provider wallet.
              </span>
            </div>
          </div>

          {feedback && (
            <div
              role="status"
              className={`rounded-2xl px-4 py-3 text-sm border ${
                feedback.type === 'success'
                  ? 'bg-surface-teal border-brand-teal/30 text-brand-navy'
                  : 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Fund Wallet Form */}
          <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-brand-navy">Fund Wallet (Sandbox Provider)</h2>
              <p className="text-xs text-brand-navy/75">
                Top up your provider-backed wallet balance for instant payment once bookings are
                approved.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_FUND_NGN.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFundAmountNgn(String(amt))}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer tabular-nums ${
                    fundAmountNgn === String(amt)
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-surface text-brand-navy border-brand-navy/15 hover:bg-surface-teal'
                  }`}
                >
                  {formatCurrencyMinor(amt * 100, siteSettings.defaultCurrency)}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleFund}
              className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
            >
              <div className="flex-1 space-y-1">
                <label htmlFor="fund-amount" className="block text-xs font-semibold text-brand-navy">
                  Amount ({siteSettings.defaultCurrency})
                </label>
                <input
                  id="fund-amount"
                  type="number"
                  min={1000}
                  step={1000}
                  value={fundAmountNgn}
                  onChange={(e) => setFundAmountNgn(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                />
              </div>
              <BrandButton
                type="submit"
                variant="primary"
                size="md"
                disabled={funding || !currentUser?.emailVerified}
              >
                {funding ? 'Funding...' : 'Fund Wallet'}
              </BrandButton>
            </form>
          </section>

          {/* Eligible Approved Bookings */}
          {eligibleApprovedBookings.length > 0 && (
            <section className="rounded-2xl bg-surface-teal/50 p-5 sm:p-6 border border-brand-teal/25 space-y-4">
              <h2 className="text-lg font-bold text-brand-navy">
                Approved Bookings Ready for Wallet Checkout
              </h2>
              <div className="space-y-3">
                {eligibleApprovedBookings.map((bk) => {
                  const amountDue = bk.amountDueMinor || 0;
                  const enoughBalance = Boolean(wallet && wallet.balanceMinor >= amountDue);
                  return (
                    <div
                      key={bk.id}
                      className="rounded-xl bg-white p-4 border border-brand-navy/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-mono font-semibold text-brand-teal-text">
                          {bk.reference} · {bk.date}
                        </p>
                        <p className="text-sm font-bold text-brand-navy">{bk.venueName}</p>
                        <p className="text-xs text-brand-navy/75 tabular-nums">
                          Amount Due: <strong>{formatCurrencyMinor(amountDue, bk.currency)}</strong>
                        </p>
                      </div>
                      <BrandButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={!enoughBalance || payingBookingId === bk.id}
                        onClick={() => handlePayApproved(bk.id)}
                      >
                        {payingBookingId === bk.id
                          ? 'Paying...'
                          : enoughBalance
                            ? 'Pay with Wallet'
                            : 'Fund Wallet First'}
                      </BrandButton>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Transaction History */}
          <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4">
            <h2 className="text-lg font-bold text-brand-navy">Wallet Transaction History</h2>
            {walletTransactions.length === 0 ? (
              <p className="text-sm text-brand-navy/70">
                No wallet transactions yet. Fund your wallet above to get started.
              </p>
            ) : (
              <div className="divide-y divide-brand-navy/10">
                {walletTransactions.map((tx) => {
                  const isCredit = tx.type === 'funding' || tx.type === 'refund';
                  return (
                    <div
                      key={tx.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-surface-teal text-brand-teal-text shrink-0">
                          {isCredit ? (
                            <ArrowDownLeft className="h-4 w-4 text-brand-teal" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-brand-navy" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-brand-navy">{tx.description}</p>
                          <p className="text-xs text-brand-navy/65">
                            <span className="capitalize">{tx.type.replace(/_/g, ' ')}</span> ·{' '}
                            <span className="font-mono">{tx.providerReference}</span> ·{' '}
                            {formatUtcTimestamp(tx.createdAtUtc, siteSettings.defaultTimezone)}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right pl-11 sm:pl-0 shrink-0">
                        <p
                          className={`text-sm font-bold tabular-nums ${
                            isCredit ? 'text-brand-teal-text' : 'text-brand-navy'
                          }`}
                        >
                          {isCredit ? '+' : '−'}
                          {formatCurrencyMinor(tx.amountMinor, tx.currency)}
                        </p>
                        <p className="text-xs capitalize text-brand-navy/65">{tx.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </AccountShell>
  );
}
