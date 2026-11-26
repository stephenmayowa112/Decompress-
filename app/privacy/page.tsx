import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description:
    'Learn how Decompress collects, isolates, and protects your personal contact details for venue bookings and event coordination.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[920px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
          Legal &amp; Policies
        </p>
        <h1 className="text-3xl sm:text-[42px] font-bold tracking-[-0.03em] leading-[1.1] text-brand-navy">
          Privacy Notice
        </h1>
      </div>

      <div className="rounded-[28px] bg-white p-7 sm:p-10 border border-brand-navy/8 shadow-[0_10px_34px_rgba(18,59,96,0.05)] space-y-5 text-sm sm:text-base text-brand-navy/80 leading-relaxed">
        <p>
          Decompress collects only the minimal personal details required to process your booking
          requests, event-planning enquiries, and account preferences—specifically your name, email
          address, phone number, and optional company name for corporate accounts.
        </p>
        <p>
          When you choose Continue with Google, we request only basic profile details (your name and
          verified email address) to pre-fill your profile and securely link earlier guest bookings
          matching that verified email.
        </p>
        <p>
          Personal contact information is isolated in restricted records accessible only to the
          verified account owner and authorised Decompress operations staff. To request a profile
          update or data removal, please reach out via{' '}
          <Link href="/contact" className="text-brand-teal-text font-semibold underline underline-offset-4">
            Contact Us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
