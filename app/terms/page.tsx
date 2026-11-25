import React from 'react';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-brand-navy">Terms of Service</h1>
      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-brand-navy/15 space-y-4 text-sm text-brand-navy/85 leading-relaxed">
        <p>
          Decompress V1 operates as a concierge social-experience discovery and booking request
          service. Submitting a booking request creates a pending request (DCP-XXXXXX) while our
          operations team manually confirms availability with the venue.
        </p>
        <p>
          All displayed venue Budget Ranges are indicative guides to help you select a comfortable
          venue; they are not strict minimum-spend rules.
        </p>
        <p>
          Commercial cancellation, deposit, and refund policies are subject to founder confirmation
          (tagged <code>TODO(founder)</code>) and communicated prior to payment.
        </p>
      </div>
    </div>
  );
}
