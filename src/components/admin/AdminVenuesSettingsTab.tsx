'use client';

import React, { useState } from 'react';
import { Database, Save } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { GuestPaymentMode, SiteSettings } from '@/src/types/domain';
import { formatBudgetRange } from '@/src/lib/format';

export function AdminVenuesSettingsTab() {
  const {
    venues,
    siteSettings,
    isSeedingFirestore,
    firestoreSeedStatus,
    adminUpdateSiteSettings,
    adminSaveVenue,
    syncSeedDataToFirestore,
  } = useDecompress();

  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);
  const [offerDrafts, setOfferDrafts] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminUpdateSiteSettings(settingsForm);
    setBanner('Site settings saved.');
  };

  return (
    <div className="space-y-8">
      {banner && (
        <div className="rounded-xl bg-surface-teal border border-brand-teal/30 px-4 py-3 text-sm text-brand-navy">
          {banner}
        </div>
      )}

      {/* 1. Site Settings & Firestore Seeding */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-brand-navy">Platform &amp; Policy Settings</h2>
            <p className="text-xs text-brand-navy/75">
              Toggle guest checkout vs wallet-only mode, feature-flag Wallet, and manage customer
              care details.
            </p>
          </div>
          <button
            type="button"
            disabled={isSeedingFirestore}
            onClick={syncSeedDataToFirestore}
            className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-surface-teal text-brand-teal-text border border-brand-teal/30 text-xs font-semibold hover:bg-brand-teal hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <Database className="h-4 w-4" />
            <span>{isSeedingFirestore ? 'Syncing Firestore...' : 'Sync Seed Data to Firestore'}</span>
          </button>
        </div>

        {firestoreSeedStatus && (
          <p className="text-xs font-semibold text-brand-teal-text bg-surface-teal/60 rounded-xl px-3.5 py-2.5">
            {firestoreSeedStatus}
          </p>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <label className="space-y-1">
              <span className="block font-semibold text-brand-navy">Customer-Care Email</span>
              <input
                type="email"
                value={settingsForm.supportEmail}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, supportEmail: e.target.value }))
                }
                className="w-full min-h-[40px] rounded-xl border border-brand-navy/20 px-3 py-1.5 text-sm text-brand-navy"
              />
            </label>

            <label className="space-y-1">
              <span className="block font-semibold text-brand-navy">Customer-Care Phone</span>
              <input
                type="text"
                value={settingsForm.supportPhone}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, supportPhone: e.target.value }))
                }
                className="w-full min-h-[40px] rounded-xl border border-brand-navy/20 px-3 py-1.5 text-sm text-brand-navy"
              />
            </label>

            <label className="space-y-1">
              <span className="block font-semibold text-brand-navy">Support Hours</span>
              <input
                type="text"
                value={settingsForm.supportHours}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, supportHours: e.target.value }))
                }
                className="w-full min-h-[40px] rounded-xl border border-brand-navy/20 px-3 py-1.5 text-sm text-brand-navy"
              />
            </label>

            <label className="space-y-1">
              <span className="block font-semibold text-brand-navy">Guest Payment Mode</span>
              <select
                value={settingsForm.guestPaymentMode}
                onChange={(e) =>
                  setSettingsForm((prev) => ({
                    ...prev,
                    guestPaymentMode: e.target.value as GuestPaymentMode,
                  }))
                }
                className="w-full min-h-[40px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-sm text-brand-navy"
              >
                <option value="guest_checkout">Guest Checkout Link (Default)</option>
                <option value="wallet_only">Wallet-Only Payment Mode</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="block font-semibold text-brand-navy">Default Currency</span>
              <input
                type="text"
                value={settingsForm.defaultCurrency}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, defaultCurrency: e.target.value }))
                }
                className="w-full min-h-[40px] rounded-xl border border-brand-navy/20 px-3 py-1.5 text-sm text-brand-navy"
              />
            </label>

            <label className="space-y-1">
              <span className="block font-semibold text-brand-navy">Display Timezone</span>
              <input
                type="text"
                value={settingsForm.defaultTimezone}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, defaultTimezone: e.target.value }))
                }
                className="w-full min-h-[40px] rounded-xl border border-brand-navy/20 px-3 py-1.5 text-sm text-brand-navy"
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-brand-navy cursor-pointer">
            <input
              type="checkbox"
              checked={settingsForm.walletEnabled}
              onChange={(e) =>
                setSettingsForm((prev) => ({ ...prev, walletEnabled: e.target.checked }))
              }
              className="h-4 w-4 accent-brand-teal"
            />
            <span>Enable Decompress Wallet Feature Flag</span>
          </label>

          <div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navy-light cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Site Settings</span>
            </button>
          </div>
        </form>
      </section>

      {/* 2. Venues Directory Quick Manager */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-brand-navy">
            Venues Directory ({venues.length} Venues)
          </h2>
          <p className="text-xs text-brand-navy/75">
            Manage publication visibility, Featured status, and Confirmed Decompress Offers.
          </p>
        </div>

        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {venues.map((venue) => {
            const offerValue = offerDrafts[venue.id] ?? venue.confirmedOfferText ?? '';
            return (
              <div
                key={venue.id}
                className="rounded-xl bg-surface p-4 border border-brand-navy/10 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-brand-navy">{venue.name}</p>
                    <p className="text-xs text-brand-navy/70">
                      {venue.neighbourhood}, {venue.city} · Budget Range:{' '}
                      {formatBudgetRange(
                        venue.budgetMinMinor,
                        venue.budgetMaxMinor,
                        venue.currency,
                        venue.budgetBasis
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        adminSaveVenue({ ...venue, isPublished: !venue.isPublished })
                      }
                      className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                        venue.isPublished
                          ? 'bg-surface-teal text-brand-teal-text border-brand-teal/40'
                          : 'bg-white text-brand-navy/60 border-brand-navy/20'
                      }`}
                    >
                      {venue.isPublished ? 'Published' : 'Draft'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        adminSaveVenue({ ...venue, isFeatured: !venue.isFeatured })
                      }
                      className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                        venue.isFeatured
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'bg-white text-brand-navy/70 border-brand-navy/20'
                      }`}
                    >
                      {venue.isFeatured ? 'Featured' : 'Standard'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder="Confirmed Decompress Offer (leave empty to hide)..."
                    value={offerValue}
                    onChange={(e) =>
                      setOfferDrafts((prev) => ({ ...prev, [venue.id]: e.target.value }))
                    }
                    className="flex-1 min-h-[36px] rounded-xl border border-brand-navy/15 bg-white px-3 py-1 text-xs text-brand-navy"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void adminSaveVenue({
                        ...venue,
                        confirmedOfferText: offerValue.trim() || undefined,
                      });
                      setBanner(`Updated confirmed offer for ${venue.name}.`);
                    }}
                    className="min-h-[36px] px-3.5 py-1 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:bg-brand-teal-dark cursor-pointer"
                  >
                    Save Offer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
