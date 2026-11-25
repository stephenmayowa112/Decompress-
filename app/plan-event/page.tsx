'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { SEED_EVENT_SERVICE_LEVELS, SEED_OCCASIONS } from '@/src/lib/seed-data';
import { formatCurrencyMinor, formatMoneyMinor } from '@/src/lib/format';
import { EventPlanningRequest, EventServiceLevel } from '@/src/types/domain';
import { formatEventServiceLevelLabel } from '@/src/lib/booking-machine';
import { BrandButton, BrandLinkButton } from '@/src/components/ui/Button';

export default function PlanEventPage() {
  const {
    addOns,
    locations,
    userProfile,
    currentUser,
    isAdminUser,
    submitEventPlanningRequest,
  } = useDecompress();

  const [serviceLevel, setServiceLevel] = useState<EventServiceLevel>(
    'full_planning_and_coordination'
  );
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [occasion, setOccasion] = useState(SEED_OCCASIONS[0]);
  const [date, setDate] = useState('');
  const [location, setLocation] = useState(locations[0]?.neighbourhood || 'Victoria Island');
  const [guestCount, setGuestCount] = useState(30);
  const [budgetNgn, setBudgetNgn] = useState('1500000');
  const [assistanceNeeded, setAssistanceNeeded] = useState('');
  const [guestName, setGuestName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [guestEmail, setGuestEmail] = useState(userProfile?.email || currentUser?.email || '');
  const [guestPhone, setGuestPhone] = useState(userProfile?.phone || '');
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<EventPlanningRequest | null>(null);

  const toggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!date) {
      setErrorMessage('Please choose a preferred event date.');
      return;
    }
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setErrorMessage('Please enter your name, email address, and phone number.');
      return;
    }
    if (!assistanceNeeded.trim()) {
      setErrorMessage('Please briefly describe the event planning assistance you need.');
      return;
    }

    const parsedBudgetMinor = Math.max(0, Math.round((Number(budgetNgn) || 0) * 100));

    setSubmitting(true);
    try {
      const req = await submitEventPlanningRequest({
        serviceLevel,
        occasion,
        date,
        location,
        guestCount,
        budgetMinor: parsedBudgetMinor,
        assistanceNeeded,
        selectedAddOnIds,
        guestName,
        guestEmail,
        guestPhone,
        honeypot,
      });
      setSubmittedRequest(req);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to submit event request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      <div className="space-y-3 max-w-3xl">
        <p className="text-xs font-semibold text-brand-teal-text">
          Event Planning &amp; Coordination
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy leading-tight">
          Let Decompress coordinate the event while you enjoy the occasion.
        </h1>
        <p className="text-base text-brand-navy/80 leading-relaxed">
          Choose from three structured service levels and four optional creative and coordination
          add-ons. Our team reviews every brief and sends a tailored quote directly to your inbox.
        </p>
      </div>

      {/* 3 Service Levels (Interactive Selector Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {SEED_EVENT_SERVICE_LEVELS.map((level, idx) => {
          const isSelected = serviceLevel === level.id;
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => setServiceLevel(level.id)}
              aria-pressed={isSelected}
              className={`text-left rounded-2xl p-6 border transition-all cursor-pointer space-y-2.5 ${
                isSelected
                  ? 'bg-surface-teal border-brand-teal ring-2 ring-brand-teal/25'
                  : 'bg-white border-brand-navy/15 hover:border-brand-teal/60'
              }`}
            >
              <span className="text-xs font-bold text-brand-teal-text">
                0{idx + 1}. {isSelected ? 'Selected Level' : 'Service Level'}
              </span>
              <h2 className="text-lg font-bold text-brand-navy">{level.name}</h2>
              <p className="text-sm text-brand-navy/80 leading-relaxed">{level.description}</p>
            </button>
          );
        })}
      </div>

      {/* 4 Optional Add-Ons */}
      <div className="rounded-2xl bg-surface-teal p-6 sm:p-8 border border-brand-teal/25 space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-brand-navy">Optional Event Add-Ons</h2>
          <p className="text-sm text-brand-navy/75">
            Select any optional add-ons below to include them in your quotation brief.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addOns.map((addon) => {
            const checked = selectedAddOnIds.includes(addon.id);
            return (
              <label
                key={addon.id}
                className={`flex items-start gap-3 rounded-xl p-5 border cursor-pointer transition-colors ${
                  checked
                    ? 'bg-white border-brand-teal ring-2 ring-brand-teal/20'
                    : 'bg-white/90 border-brand-navy/10 hover:border-brand-teal/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAddOn(addon.id)}
                  className="mt-1 h-4 w-4 accent-brand-teal shrink-0"
                />
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base font-bold text-brand-navy">{addon.name}</h3>
                    {addon.fixedPriceMinor && (
                      <span className="text-xs font-semibold text-brand-teal-text tabular-nums">
                        Indicative: {formatMoneyMinor(addon.fixedPriceMinor, addon.currency)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-navy/75 leading-relaxed">{addon.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Request Form or Confirmation */}
      {submittedRequest ? (
        <div className="rounded-3xl bg-white p-6 sm:p-10 border border-brand-teal/35 space-y-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-teal shrink-0">
              <CheckCircle2 className="h-6 w-6 text-brand-teal" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-teal-text">
                Event Request Logged · Status: New
              </p>
              <h2 className="text-2xl font-bold text-brand-navy">
                We have received your event brief ({submittedRequest.reference})
              </h2>
            </div>
          </div>

          <div className="rounded-2xl bg-surface p-5 border border-brand-navy/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs text-brand-navy/65">Service Level</span>
              <span className="font-semibold text-brand-navy">
                {formatEventServiceLevelLabel(submittedRequest.serviceLevel)}
              </span>
            </div>
            <div>
              <span className="block text-xs text-brand-navy/65">Occasion &amp; Date</span>
              <span className="font-semibold text-brand-navy">
                {submittedRequest.occasion} · {submittedRequest.date}
              </span>
            </div>
            <div>
              <span className="block text-xs text-brand-navy/65">Guests &amp; Location</span>
              <span className="font-semibold text-brand-navy">
                {submittedRequest.guestCount} guests · {submittedRequest.location}
              </span>
            </div>
            <div>
              <span className="block text-xs text-brand-navy/65">Indicative Budget Range</span>
              <span className="font-semibold text-brand-navy tabular-nums">
                {formatCurrencyMinor(submittedRequest.budgetMinor, submittedRequest.currency)}
              </span>
            </div>
          </div>

          <p className="text-sm text-brand-navy/80">
            An acknowledgement email has been logged for{' '}
            <strong>{submittedRequest.guestEmail}</strong>. Our planning specialists will review
            your brief and send a custom quote.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <BrandLinkButton href="/venues" variant="primary" size="md">
              Explore Venues
            </BrandLinkButton>
            <button
              type="button"
              onClick={() => setSubmittedRequest(null)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl border border-brand-navy/20 text-sm font-semibold text-brand-navy hover:bg-surface-teal transition-colors cursor-pointer"
            >
              Submit Another Request
            </button>
            {isAdminUser && (
              <Link
                href="/admin"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-semibold"
              >
                Manage in Admin Console
              </Link>
            )}
          </div>
        </div>
      ) : (
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-brand-navy/15 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal-text">
              <Sparkles className="h-4 w-4 text-brand-teal" />
              <span>Custom Quotation Brief</span>
            </div>
            <h2 className="text-2xl font-bold text-brand-navy">
              Submit Your Event Planning Request
            </h2>
            <p className="text-sm text-brand-navy/75">
              Currently selected:{' '}
              <strong className="text-brand-navy">
                {formatEventServiceLevelLabel(serviceLevel)}
              </strong>
              {selectedAddOnIds.length > 0 ? ` + ${selectedAddOnIds.length} add-on(s)` : ''}.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-sm text-[#B91C1C]"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="event_website">Website</label>
              <input
                id="event_website"
                name="event_website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="ev-occasion" className="block text-sm font-semibold text-brand-navy">
                  Occasion <span className="text-red-600">*</span>
                </label>
                <select
                  id="ev-occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                >
                  {SEED_OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ev-date" className="block text-sm font-semibold text-brand-navy">
                  Preferred Event Date <span className="text-red-600">*</span>
                </label>
                <input
                  id="ev-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ev-location" className="block text-sm font-semibold text-brand-navy">
                  Preferred Location / Area <span className="text-red-600">*</span>
                </label>
                <input
                  id="ev-location"
                  type="text"
                  required
                  maxLength={160}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Victoria Island, Ikoyi, or Lekki Phase 1"
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ev-guests" className="block text-sm font-semibold text-brand-navy">
                  Estimated Guest Count <span className="text-red-600">*</span>
                </label>
                <input
                  id="ev-guests"
                  type="number"
                  min={1}
                  max={50000}
                  required
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="ev-budget" className="block text-sm font-semibold text-brand-navy">
                  Indicative Event Budget Range (NGN)
                </label>
                <input
                  id="ev-budget"
                  type="number"
                  min={0}
                  step={50000}
                  value={budgetNgn}
                  onChange={(e) => setBudgetNgn(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="ev-assistance" className="block text-sm font-semibold text-brand-navy">
                  What Assistance Do You Need? <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="ev-assistance"
                  rows={4}
                  required
                  maxLength={2000}
                  placeholder="Tell us about the vibe, venue ideas, entertainment, decor, photography, or schedule support you have in mind..."
                  value={assistanceNeeded}
                  onChange={(e) => setAssistanceNeeded(e.target.value)}
                  className="w-full rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="ev-name" className="block text-sm font-semibold text-brand-navy">
                  Your Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="ev-name"
                  type="text"
                  required
                  maxLength={120}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ev-email" className="block text-sm font-semibold text-brand-navy">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  id="ev-email"
                  type="email"
                  required
                  maxLength={160}
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ev-phone" className="block text-sm font-semibold text-brand-navy">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  id="ev-phone"
                  type="tel"
                  required
                  maxLength={40}
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-white px-3.5 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <BrandButton type="submit" variant="primary" size="lg" disabled={submitting}>
                {submitting ? 'Submitting Brief...' : 'Request Event Quote'}
              </BrandButton>
              <BrandLinkButton href="/venues" variant="alternative" size="md">
                Browse Venues Instead
              </BrandLinkButton>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
