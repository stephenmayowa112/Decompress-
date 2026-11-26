import React from 'react';
import { Compass } from 'lucide-react';
import { BrandLinkButton } from '@/src/components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[720px] px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-teal">
        <Compass className="h-8 w-8 text-brand-teal" aria-hidden="true" />
      </div>
      <div className="space-y-2.5">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
          404 · Page Not Found
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-brand-navy">
          We couldn&apos;t find that page.
        </h1>
        <p className="text-base text-brand-navy/75 max-w-md mx-auto leading-relaxed">
          The link may have moved or expired. Explore curated Lagos venues and experiences or return
          home.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
        <BrandLinkButton href="/venues" variant="secondary" size="md">
          Explore Venues
        </BrandLinkButton>
        <BrandLinkButton href="/" variant="alternative" size="md">
          Back to Home
        </BrandLinkButton>
      </div>
    </div>
  );
}
