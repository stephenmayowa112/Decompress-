import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Read the Decompress Terms of Service covering concierge venue booking requests, indicative Budget Ranges, and payment confirmations.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[920px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
          Legal &amp; Policies
        </p>
        <h1 className="text-3xl sm:text-[42px] font-bold tracking-[-0.03em] leading-[1.1] text-brand-navy">
          Terms of Service
        </h1>
      </div>

      <div className="rounded-[28px] bg-white p-7 sm:p-10 border border-brand-navy/8 shadow-[0_10px_34px_rgba(18,59,96,0.05)] space-y-5 text-sm sm:text-base text-brand-navy/80 leading-relaxed">
        <p>
          Decompress operates as a curated social-experience discovery, venue booking request, and
          event coordination service across Lagos. Submitting a booking request creates a pending
          request (<span className="font-mono text-brand-navy">DCP-XXXXXX</span>) while our
          operations team confirms availability directly with the selected venue.
        </p>
        <p>
          All displayed venue <strong className="font-semibold text-brand-navy">Budget Ranges</strong>{' '}
          are indicative guides intended to help you select a comfortable venue; they are not strict
          minimum-spend rules unless explicitly stated in a confirmed booking quote.
        </p>
        <p>
          No payment is collected when submitting an initial venue request. Applicable deposit,
          cancellation, rescheduling, and refund terms for each confirmed venue or event quotation
          are shared in writing prior to payment.
        </p>
        <p>
          Questions regarding a booking reference or these terms can be directed to our team on the{' '}
          <Link href="/contact" className="text-brand-teal-text font-semibold underline underline-offset-4">
            Contact Us
          </Link>{' '}
          page.
        </p>
      </div>
    </div>
  );
}
