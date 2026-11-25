import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-brand-navy">Privacy Notice</h1>
      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-brand-navy/15 space-y-4 text-sm text-brand-navy/85 leading-relaxed">
        <p>
          Decompress collects only the minimal personal details required to process your booking
          requests, event-planning enquiries, and account preferences (name, email address, phone
          number, and optional company name for corporate profiles).
        </p>
        <p>
          When you choose Continue with Google, we request only basic profile details (your name and
          verified email address) to pre-fill your profile and securely link earlier guest bookings
          matching that verified email.
        </p>
        <p>
          User contact PII is isolated in restricted records accessible only to the verified account
          owner and authorised Decompress operations staff.
        </p>
      </div>
    </div>
  );
}
