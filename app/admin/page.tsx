'use client';

import React from 'react';
import { useDecompress } from '@/src/context/DecompressContext';
import { BrandButton } from '@/src/components/ui/Button';

export default function AdminDashboardPage() {
  const {
    currentUser,
    isAdminUser,
    venues,
    categories,
    locations,
    facilities,
    faqTopics,
    faqItems,
    addOns,
    siteSettings,
    isSeedingFirestore,
    firestoreSeedStatus,
    signInWithGoogle,
    syncSeedDataToFirestore,
  } = useDecompress();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-brand-teal-text">
            Decompress Operations, Finance &amp; Content Console
          </p>
          <h1 className="text-3xl font-bold text-brand-navy">Admin Dashboard</h1>
          <p className="text-sm text-brand-navy/75">
            Default staff groups: Operations, Finance, Content &amp; Support, and Superuser.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!currentUser ? (
            <BrandButton
              variant="secondary"
              size="sm"
              fullWidthOnMobile={false}
              onClick={() => signInWithGoogle()}
            >
              Admin Sign In with Google
            </BrandButton>
          ) : (
            <BrandButton
              variant="primary"
              size="sm"
              fullWidthOnMobile={false}
              disabled={isSeedingFirestore || !isAdminUser}
              onClick={() => syncSeedDataToFirestore()}
            >
              {isSeedingFirestore ? 'Syncing Seed Data...' : 'Sync Seed Data to Firestore'}
            </BrandButton>
          )}
        </div>
      </div>

      {firestoreSeedStatus && (
        <div className="rounded-2xl bg-surface-teal p-4 border border-brand-teal/30 text-sm font-medium text-brand-navy">
          {firestoreSeedStatus}
        </div>
      )}

      {/* Admin Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-brand-navy/15">
          <span className="text-xs text-brand-navy/65">Sample Venues (7 Categories)</span>
          <p className="text-2xl font-bold text-brand-navy tabular-nums mt-1">{venues.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 border border-brand-navy/15">
          <span className="text-xs text-brand-navy/65">Locations &amp; Facilities</span>
          <p className="text-2xl font-bold text-brand-navy tabular-nums mt-1">
            {locations.length} areas · {facilities.length} facilities
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 border border-brand-navy/15">
          <span className="text-xs text-brand-navy/65">Unpublished FAQ Drafts</span>
          <p className="text-2xl font-bold text-brand-navy tabular-nums mt-1">
            {faqItems.filter((i) => !i.isPublished).length} / {faqItems.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 border border-brand-navy/15">
          <span className="text-xs text-brand-navy/65">Guest Payment Mode (TO CONFIRM)</span>
          <p className="text-lg font-bold text-brand-teal-text mt-1">
            {siteSettings.guestPaymentMode}
          </p>
        </div>
      </div>

      {/* Preview of Unpublished FAQ Drafts (Section 7.7) */}
      <div className="rounded-2xl bg-white p-6 border border-brand-navy/15 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-brand-navy">
            Seeded Unpublished FAQ Drafts ({faqTopics.length} Topics · {faqItems.length} Questions)
          </h2>
          <p className="text-xs text-brand-navy/75">
            All FAQ items are seeded as unpublished drafts (`isPublished: false`). Refund,
            cancellation, and payment items are flagged `requiresPolicyConfirmation: true`.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-teal text-brand-navy font-semibold">
              <tr>
                <th className="py-2.5 px-3">Topic</th>
                <th className="py-2.5 px-3">Question</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Founder Policy Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/10">
              {faqItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 px-3 font-medium text-brand-navy capitalize">
                    {item.topicSlug.replace(/-/g, ' ')}
                  </td>
                  <td className="py-2 px-3 text-brand-navy">{item.question}</td>
                  <td className="py-2 px-3 text-brand-navy/75">
                    {item.isPublished ? 'Published' : 'Unpublished Draft'}
                  </td>
                  <td className="py-2 px-3 text-brand-coral-text font-medium">
                    {item.requiresPolicyConfirmation ? 'TODO(founder): Hold until confirmed' : 'Ready'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview of Categories & Optional Add-Ons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white p-6 border border-brand-navy/15 space-y-3">
          <h2 className="text-base font-bold text-brand-navy">
            7 Venue Categories ({categories.length})
          </h2>
          <ul className="space-y-2 text-xs text-brand-navy/85">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <span className="font-semibold">{c.name}</span>
                <span className="font-mono text-brand-teal-text">{c.slug}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-brand-navy/15 space-y-3">
          <h2 className="text-base font-bold text-brand-navy">
            4 Optional Event Add-Ons ({addOns.length})
          </h2>
          <ul className="space-y-2 text-xs text-brand-navy/85">
            {addOns.map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <span className="font-semibold">{a.name}</span>
                <span className="font-mono text-brand-teal-text">{a.type}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
