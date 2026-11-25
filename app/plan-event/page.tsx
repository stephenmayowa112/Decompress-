'use client';

import React from 'react';
import { useDecompress } from '@/src/context/DecompressContext';
import { SEED_EVENT_SERVICE_LEVELS } from '@/src/lib/seed-data';
import { formatMoneyMinor } from '@/src/lib/format';
import { BrandLinkButton } from '@/src/components/ui/Button';

export default function PlanEventPage() {
  const { addOns } = useDecompress();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3 max-w-3xl">
        <p className="text-xs font-semibold text-brand-teal-text">
          Event Planning &amp; Coordination
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">
          Let Decompress coordinate the event while you enjoy the occasion.
        </h1>
        <p className="text-base text-brand-navy/80">
          Choose from three service levels and four optional add-ons. Full quotation workflow and
          admin tracking arrive in Milestone 6.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SEED_EVENT_SERVICE_LEVELS.map((level, idx) => (
          <div
            key={level.id}
            className="rounded-2xl bg-white p-6 border border-brand-navy/15 space-y-3"
          >
            <span className="text-xs font-bold text-brand-teal-text">
              0{idx + 1}. Service Level
            </span>
            <h2 className="text-lg font-bold text-brand-navy">{level.name}</h2>
            <p className="text-sm text-brand-navy/80 leading-relaxed">{level.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-surface-teal p-6 sm:p-8 border border-brand-teal/25 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-brand-navy">Optional Event Add-Ons</h2>
          <p className="text-sm text-brand-navy/75">
            Supports both custom quotations per request and optional indicative fixed prices
            (configurable in Admin).
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addOns.map((addon) => (
            <div
              key={addon.id}
              className="rounded-xl bg-white p-5 border border-brand-navy/10 space-y-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-brand-navy">{addon.name}</h3>
                {addon.fixedPriceMinor && (
                  <span className="text-xs font-semibold text-brand-teal-text tabular-nums">
                    Indicative: {formatMoneyMinor(addon.fixedPriceMinor, addon.currency)}
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-navy/75 leading-relaxed">{addon.description}</p>
            </div>
          ))}
        </div>
        <div>
          <BrandLinkButton href="/venues" variant="secondary" size="md">
            Browse Venues First
          </BrandLinkButton>
        </div>
      </div>
    </div>
  );
}
