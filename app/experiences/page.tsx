import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { ExperiencesClient } from '@/src/components/discovery/ExperiencesClient';

export const metadata: Metadata = {
  title: 'Explore Experiences | Decompress',
  description:
    'Browse Lagos venues by curated experience—including salsa nights, karaoke, live bands, day spas, bowling, go-karting, and beach clubs—or by occasion.',
};

export default function ExperiencesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-sm text-brand-navy">
          Loading experiences...
        </div>
      }
    >
      <ExperiencesClient />
    </Suspense>
  );
}
