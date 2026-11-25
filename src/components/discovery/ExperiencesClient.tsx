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
    <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10 sm:space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
            Experiences &amp; Occasions · {experienceTags.length} Curated Activities
          </p>
          <h1 className="text-3xl sm:text-[44px] font-bold tracking-[-0.03em] leading-[1.1] text-brand-navy">
            Explore by experience &amp; occasion.
          </h1>
          <p className="text-base text-brand-navy/75 leading-relaxed">
            Discover venues offering salsa nights, private karaoke booths, live bands, day spas,
            bowling, go-karting, and beach cabanas across Lagos.
          </p>
        </div>

        <Link
          href={activeDirectoryHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-text hover:translate-x-1 transition-transform whitespace-nowrap self-start md:self-auto"
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            aria-pressed={selectedTag === 'all'}
            className={`text-left min-h-[50px] px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 ${
              selectedTag === 'all'
                ? 'bg-brand-navy text-white shadow-[0_10px_24px_rgba(18,59,96,0.18)]'
                : 'bg-white text-brand-navy border border-brand-navy/10 shadow-[0_2px_10px_rgba(18,59,96,0.04)] hover:bg-surface-teal hover:-translate-y-0.5'
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
                className={`text-left min-h-[50px] px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-brand-navy text-white shadow-[0_10px_24px_rgba(18,59,96,0.18)]'
                    : 'bg-white text-brand-navy border border-brand-navy/10 shadow-[0_2px_10px_rgba(18,59,96,0.04)] hover:bg-surface-teal hover:-translate-y-0.5'
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
      <section className="rounded-[28px] bg-surface-teal p-6 sm:p-8 space-y-4">
        <h2 className="text-sm font-bold text-brand-navy">Filter by Occasion</h2>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedOccasion('all')}
            aria-pressed={selectedOccasion === 'all'}
            className={`min-h-[42px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              selectedOccasion === 'all'
                ? 'bg-brand-teal text-white shadow-sm'
                : 'bg-white text-brand-navy hover:shadow-sm'
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
                className={`min-h-[42px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-teal text-white shadow-sm'
                    : 'bg-white text-brand-navy hover:shadow-sm'
                }`}
              >
                {occ}
              </button>
            );
          })}
        </div>
      </section>

      {/* Matching Venues */}
      <section className="space-y-5">
        <p className="text-sm font-semibold text-brand-navy tabular-nums">
          {matchingVenues.length} matching {matchingVenues.length === 1 ? 'venue' : 'venues'}
        </p>

        {matchingVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {matchingVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] bg-white p-10 text-center border border-brand-navy/8 shadow-[0_8px_28px_rgba(18,59,96,0.05)] space-y-3">
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
