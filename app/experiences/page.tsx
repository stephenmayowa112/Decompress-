'use client';

import React, { useState } from 'react';
import { useDecompress } from '@/src/context/DecompressContext';
import { VenueCard } from '@/src/components/ui/VenueCard';
import { SEED_OCCASIONS } from '@/src/lib/seed-data';

export default function ExperiencesPage() {
  const { venues, experienceTags } = useDecompress();
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');

  const matchingVenues = venues.filter((v) => {
    if (!v.isPublished) return false;
    if (selectedTag !== 'all' && !v.experienceTags.includes(selectedTag)) return false;
    if (
      selectedOccasion !== 'all' &&
      !v.occasions.some((o) => o.toLowerCase() === selectedOccasion.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-2 max-w-3xl">
        <p className="text-xs font-semibold text-brand-teal-text">
          Activities &amp; Occasions · {experienceTags.length} Curated Experiences
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">
          Explore by Experience &amp; Occasion
        </h1>
        <p className="text-base text-brand-navy/80">
          Discover venues offering salsa nights, private karaoke booths, live bands, day spas,
          bowling, karting, and beach cabanas across Lagos.
        </p>
      </div>

      {/* Interactive Filter Tabs for Experience Tags */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-brand-navy">Activity &amp; Experience Tags</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-brand-navy text-white'
                : 'bg-white text-brand-navy border border-brand-navy/15 hover:bg-surface-teal'
            }`}
          >
            All Experiences
          </button>
          {experienceTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTag(tag.slug)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                selectedTag === tag.slug
                  ? 'bg-brand-navy text-white'
                  : 'bg-white text-brand-navy border border-brand-navy/15 hover:bg-surface-teal'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Filter Tabs for Occasions */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-brand-navy">Filter by Occasion</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedOccasion('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedOccasion === 'all'
                ? 'bg-brand-teal text-white'
                : 'bg-surface-teal text-brand-navy hover:bg-brand-teal/20'
            }`}
          >
            All Occasions
          </button>
          {SEED_OCCASIONS.map((occ) => (
            <button
              key={occ}
              type="button"
              onClick={() => setSelectedOccasion(occ)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                selectedOccasion === occ
                  ? 'bg-brand-teal text-white'
                  : 'bg-surface-teal text-brand-navy hover:bg-brand-teal/20'
              }`}
            >
              {occ}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchingVenues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </div>
  );
}
