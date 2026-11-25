'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { VenueCard } from '@/src/components/ui/VenueCard';
import { SEED_OCCASIONS } from '@/src/lib/seed-data';
import { DEFAULT_VENUE_FILTERS, filterAndSortVenues } from '@/src/lib/search';

export function ExperiencesClient() {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get('experience') || 'all';
  const initialOccasion = searchParams.get('occasion') || 'all';

  const { venues, experienceTags } = useDecompress();
  const [selectedTag, setSelectedTag] = useState<string>(initialTag);
  const [selectedOccasion, setSelectedOccasion] = useState<string>(initialOccasion);

  const matchingVenues = useMemo(() => {
    return filterAndSortVenues(venues, {
      ...DEFAULT_VENUE_FILTERS,
      experience: selectedTag === 'all' ? '' : selectedTag,
      occasion: selectedOccasion === 'all' ? '' : selectedOccasion,
    });
  }, [venues, selectedTag, selectedOccasion]);

  const activeDirectoryHref = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedTag !== 'all') params.set('experience', selectedTag);
    if (selectedOccasion !== 'all') params.set('occasion', selectedOccasion);
    const qs = params.toString();
    return qs ? `/venues?${qs}` : '/venues';
  }, [selectedTag, selectedOccasion]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs sm:text-sm font-semibold text-brand-teal-text">
            Activities &amp; Occasions · {experienceTags.length} Curated Experiences
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">
            Explore by Experience &amp; Occasion
          </h1>
          <p className="text-sm sm:text-base text-brand-navy/80">
            Discover venues offering salsa nights, private karaoke booths, live bands, day spas,
            bowling, go-karting, and beach cabanas across Lagos.
          </p>
        </div>

        <Link
          href={activeDirectoryHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-text hover:underline whitespace-nowrap self-start md:self-auto"
        >
          <span>Open current selection in Venues</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Curated Experience Cards Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-brand-navy">Activity &amp; Experience Tags</h2>
          {(selectedTag !== 'all' || selectedOccasion !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSelectedTag('all');
                setSelectedOccasion('all');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-coral-text hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset selection</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            aria-pressed={selectedTag === 'all'}
            className={`text-left min-h-[48px] px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-between gap-2 ${
              selectedTag === 'all'
                ? 'bg-brand-navy text-white'
                : 'bg-white text-brand-navy border border-brand-navy/15 hover:bg-surface-teal'
            }`}
          >
            <span className="truncate">All Experiences</span>
            <span
              className={`text-xs tabular-nums shrink-0 ${
                selectedTag === 'all' ? 'text-surface-teal' : 'text-brand-teal-text'
              }`}
            >
              {venues.filter((v) => v.isPublished).length}
            </span>
          </button>

          {experienceTags.map((tag) => {
            const count = venues.filter(
              (v) => v.isPublished && v.experienceTags.includes(tag.slug)
            ).length;
            const isSelected = selectedTag === tag.slug;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTag((prev) => (prev === tag.slug ? 'all' : tag.slug))}
                aria-pressed={isSelected}
                className={`text-left min-h-[48px] px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-brand-navy text-white'
                    : 'bg-white text-brand-navy border border-brand-navy/15 hover:bg-surface-teal'
                }`}
              >
                <span className="truncate">{tag.name}</span>
                <span
                  className={`text-xs tabular-nums shrink-0 ${
                    isSelected ? 'text-surface-teal' : 'text-brand-teal-text'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Occasions Filter Controls */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-brand-navy">Filter by Occasion</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedOccasion('all')}
            aria-pressed={selectedOccasion === 'all'}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              selectedOccasion === 'all'
                ? 'bg-brand-teal text-white'
                : 'bg-surface-teal text-brand-navy hover:bg-brand-teal/20'
            }`}
          >
            All Occasions
          </button>
          {SEED_OCCASIONS.map((occ) => {
            const isSelected = selectedOccasion === occ;
            return (
              <button
                key={occ}
                type="button"
                onClick={() => setSelectedOccasion((prev) => (prev === occ ? 'all' : occ))}
                aria-pressed={isSelected}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-brand-teal text-white'
                    : 'bg-surface-teal text-brand-navy hover:bg-brand-teal/20'
                }`}
              >
                {occ}
              </button>
            );
          })}
        </div>
      </section>

      {/* Matching Venues */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-brand-navy tabular-nums">
          {matchingVenues.length} matching {matchingVenues.length === 1 ? 'venue' : 'venues'}
        </p>

        {matchingVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {matchingVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center border border-brand-navy/15 space-y-3">
            <p className="text-base font-bold text-brand-navy">
              No venues matched that combination of experience and occasion.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedTag('all');
                setSelectedOccasion('all');
              }}
              className="text-sm font-semibold text-brand-teal-text underline cursor-pointer"
            >
              Show all experiences
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
