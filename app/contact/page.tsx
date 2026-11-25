'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Mail, Phone } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { BrandButton } from '@/src/components/ui/Button';
import { SupportEnquiry } from '@/src/types/domain';

export default function ContactPage() {
  const { siteSettings, userProfile, currentUser, submitSupportEnquiry } = useDecompress();

  const [name, setName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || currentUser?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [bookingReference, setBookingReference] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<SupportEnquiry | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please enter your name, email address, and message.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await submitSupportEnquiry({
        name,
        email,
        phone,
        bookingReference,
        message,
        honeypot,
      });
      setSubmittedEnquiry(created);
      setMessage('');
      setBookingReference('');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to send support enquiry. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-2 min-w-0">
          <Mail className="h-5 w-5 text-brand-teal" />
          <h2 className="text-base font-bold text-brand-navy">Customer-Care Email</h2>
          <a
            href={`mailto:${siteSettings.supportEmail}`}
            className="block text-sm font-semibold text-brand-teal-text underline break-words"
          >
            {siteSettings.supportEmail}
          </a>
        </div>

        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-2 min-w-0">
          <Phone className="h-5 w-5 text-brand-teal" />
          <h2 className="text-base font-bold text-brand-navy">Customer-Care Phone</h2>
          <a
            href={`tel:${siteSettings.supportPhone.replace(/\s+/g, '')}`}
            className="block text-sm font-semibold text-brand-teal-text underline break-words"
          >
            {siteSettings.supportPhone}
          </a>
        </div>

        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-2 min-w-0">
          <Clock className="h-5 w-5 text-brand-teal" />
          <h2 className="text-base font-bold text-brand-navy">Support Hours</h2>
          <p className="text-sm text-brand-navy/80">{siteSettings.supportHours}</p>
        </div>
      </div>

      {/* Public Support Enquiry Form */}
      <section className="rounded-3xl bg-white p-6 sm:p-8 border border-brand-navy/15 space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-brand-navy">Send a Support Enquiry</h2>
          <p className="text-sm text-brand-navy/75">
            Include your booking reference if your message relates to an existing venue request.
          </p>
        </div>

        {submittedEnquiry && (
          <div className="rounded-2xl bg-surface-teal p-4 border border-brand-teal/30 flex items-start gap-3 text-sm text-brand-navy">
            <CheckCircle2 className="h-5 w-5 text-brand-teal shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Support enquiry received</p>
              <p className="text-xs text-brand-navy/80">
                Thank you, {submittedEnquiry.name}. Our customer-care team has logged your message
                and will reply to {submittedEnquiry.email}.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-sm text-[#B91C1C]"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="support_website">Website</label>
            <input
              id="support_website"
              name="support_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="sup-name" className="block text-sm font-semibold text-brand-navy">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                id="sup-name"
                type="text"
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sup-email" className="block text-sm font-semibold text-brand-navy">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                id="sup-email"
                type="email"
                required
                maxLength={160}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sup-phone" className="block text-sm font-semibold text-brand-navy">
                Phone Number (Optional)
              </label>
              <input
                id="sup-phone"
                type="tel"
                maxLength={40}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sup-ref" className="block text-sm font-semibold text-brand-navy">
                Booking Reference (Optional)
              </label>
              <input
                id="sup-ref"
                type="text"
                maxLength={30}
                placeholder="e.g. DCP-8K2M4P"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm font-mono text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sup-message" className="block text-sm font-semibold text-brand-navy">
              How can we help? <span className="text-red-600">*</span>
            </label>
            <textarea
              id="sup-message"
              rows={4}
              required
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your question or feedback..."
              className="w-full rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
            />
          </div>

          <BrandButton type="submit" variant="primary" size="md" disabled={submitting}>
            {submitting ? 'Sending Message...' : 'Send Support Enquiry'}
          </BrandButton>
        </form>
      </section>
    </div>
  );
}
