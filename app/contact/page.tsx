'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, Clock } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';

export default function ContactPage() {
  const { siteSettings } = useDecompress();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-brand-teal-text">Customer Care &amp; Support</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">Contact Us</h1>
        <p className="text-base text-brand-navy/80">
          Have a question about a venue, a booking reference (DCP-XXXXXX), or event coordination?
          Reach our team directly or browse our{' '}
          <Link href="/faq" className="text-brand-teal-text font-semibold underline">
            Frequently Asked Questions
          </Link>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white p-6 border border-brand-navy/15 space-y-2">
          <Mail className="h-5 w-5 text-brand-teal" />
          <h2 className="text-base font-bold text-brand-navy">Customer-Care Email</h2>
          <a
            href={`mailto:${siteSettings.supportEmail}`}
            className="text-sm font-semibold text-brand-teal-text underline"
          >
            {siteSettings.supportEmail}
          </a>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-brand-navy/15 space-y-2">
          <Phone className="h-5 w-5 text-brand-teal" />
          <h2 className="text-base font-bold text-brand-navy">Customer-Care Phone</h2>
          <a
            href={`tel:${siteSettings.supportPhone.replace(/\s+/g, '')}`}
            className="text-sm font-semibold text-brand-teal-text underline"
          >
            {siteSettings.supportPhone}
          </a>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-brand-navy/15 space-y-2">
          <Clock className="h-5 w-5 text-brand-teal" />
          <h2 className="text-base font-bold text-brand-navy">Support Hours</h2>
          <p className="text-sm text-brand-navy/80">{siteSettings.supportHours}</p>
        </div>
      </div>
    </div>
  );
}
