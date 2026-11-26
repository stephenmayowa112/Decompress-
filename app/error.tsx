'use client';

import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { BrandButton, BrandLinkButton } from '@/src/components/ui/Button';

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Decompress route error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[720px] px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-teal">
        <AlertCircle className="h-8 w-8 text-brand-teal" aria-hidden="true" />
      </div>
      <div className="space-y-2.5">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
          Temporary Issue
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-brand-navy">
          Something unexpected happened.
        </h1>
        <p className="text-base text-brand-navy/75 max-w-md mx-auto leading-relaxed">
          Please try reloading this view. If the issue persists, our concierge team is ready to help
          via Contact Us.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
        <BrandButton variant="secondary" size="md" onClick={reset}>
          Try Again
        </BrandButton>
        <BrandLinkButton href="/" variant="alternative" size="md">
          Return Home
        </BrandLinkButton>
      </div>
    </div>
  );
}
