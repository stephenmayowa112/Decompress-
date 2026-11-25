'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Utensils,
  GlassWater,
  Music,
  Palmtree,
  CalendarHeart,
  Gamepad2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { BrandButton, BrandLinkButton } from '@/src/components/ui/Button';
import { VenueCard } from '@/src/components/ui/VenueCard';
import { SEED_OCCASIONS } from '@/src/lib/seed-data';
import { DEFAULT_VENUE_FILTERS, filterAndSortVenues } from '@/src/lib/search';

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  GlassWater,
  Music,
  Palmtree,
  CalendarHeart,
  Gamepad2,
  Sparkles,
};

export function HomeClient() {
  const router = useRouter();
  const { venues, categories } = useDecompress();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const previewVenues = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed && selectedCategory === 'all') {
      return venues.filter((v) => v.isPublished && v.isFeatured);
    }
    return filterAndSortVenues(venues, {
      ...DEFAULT_VENUE_FILTERS,
      q: trimmed,
      category: selectedCategory === 'all' ? '' : selectedCategory,
    });
  }, [venues, searchQuery, selectedCategory]);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const trimmed = searchQuery.trim();
    if (trimmed) params.set('q', trimmed);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    const qs = params.toString();
    router.push(qs ? `/venues?${qs}` : '/venues');
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-4">
      {/* 1. Hero Section (Section 4): Headline, Search Bar, and Three Brand Action Buttons */}
      <section className="bg-surface-teal/65 border-b border-brand-teal/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="max-w-3xl space-y-5 sm:space-y-6">
            <p className="text-xs sm:text-sm font-semibold text-brand-teal-text">
              Social-Experience Discovery, Venue Booking &amp; Concierge Coordination
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-navy leading-[1.15]">
              Spend less time organising and more time enjoying the plan.
            </h1>
            <p className="text-base sm:text-lg text-brand-navy/80 leading-relaxed max-w-2xl">
              Discover restaurants, rooftop lounges, salsa and karaoke nights, beach clubs, games
              arenas, spas, and event halls across Lagos. Compare indicative{' '}
              <strong className="font-semibold text-brand-navy">Budget Ranges</strong>, request a
              booking as a guest or member, and let Decompress coordinate the occasion.
            </p>

            {/* Main Search Box */}
            <form
              onSubmit={handleHeroSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-brand-navy/15 shadow-sm"
            >
              <div className="relative flex-1 flex items-center min-w-0">
                <Search className="h-5 w-5 text-brand-teal ml-2.5 sm:ml-3 shrink-0" aria-hidden="true" />
                <label htmlFor="hero-main-search" className="sr-only">
                  Search venue name, category, activity or experience such as salsa or karaoke
                </label>
                <input
                  id="hero-main-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Try "salsa", "karaoke", "Victoria Island", or "rooftop"...'
                  className="w-full min-w-0 bg-transparent px-3 py-2.5 text-base text-brand-navy placeholder:text-brand-navy/50 focus:outline-none"
                />
              </div>
              <BrandButton type="submit" variant="primary" size="md" fullWidthOnMobile>
                Search
              </BrandButton>
            </form>

            {/* Quick experience search triggers */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-brand-navy/75">
              <span className="font-medium text-brand-navy">Popular searches:</span>
              {['salsa', 'karaoke', 'live-band', 'beach-club', 'bowling', 'day-spa'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="min-h-[32px] underline decoration-brand-teal underline-offset-4 hover:text-brand-teal-text font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded px-1"
                >
                  {term}
                </button>
              ))}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-brand-coral-text font-semibold hover:underline cursor-pointer px-1"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* The Three Homepage Hero Action Buttons */}
            <div className="pt-1 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-3.5">
              <BrandLinkButton href="/experiences" variant="primary" size="lg">
                Explore Experiences
              </BrandLinkButton>
              <BrandLinkButton href="/venues" variant="secondary" size="lg">
                Explore Venues
              </BrandLinkButton>
              <BrandLinkButton href="/plan-event" variant="alternative" size="lg">
                Plan an Event
              </BrandLinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Tiles (7 Main Categories) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">Browse by Category</h2>
            <p className="text-sm sm:text-base text-brand-navy/75 max-w-2xl">
              Venues can belong to multiple categories where they offer dining, music, nightlife, or
              leisure experiences.
            </p>
          </div>
          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-sm font-semibold text-brand-teal-text hover:underline self-start sm:self-auto cursor-pointer min-h-[36px]"
            >
              Show all categories ({venues.filter((v) => v.isPublished).length} venues)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {categories.map((cat) => {
            const IconComponent = CATEGORY_ICON_MAP[cat.iconName] || Sparkles;
            const matchingCount = venues.filter(
              (v) => v.isPublished && v.categorySlugs.includes(cat.slug)
            ).length;
            const isSelected = selectedCategory === cat.slug;

            return (
              <div
                key={cat.id}
                className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-colors ${
                  isSelected
                    ? 'bg-surface-teal border-brand-teal shadow-sm'
                    : 'bg-white border-brand-navy/10 hover:border-brand-teal/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategory((prev) => (prev === cat.slug ? 'all' : cat.slug))
                  }
                  aria-pressed={isSelected}
                  className="text-left cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal rounded-xl"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-teal text-brand-teal-text shrink-0">
                      <IconComponent className="h-5 w-5 text-brand-teal" />
                    </div>
                    <span className="text-xs font-semibold text-brand-teal-text tabular-nums">
                      {matchingCount} {matchingCount === 1 ? 'venue' : 'venues'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-brand-navy mb-1">{cat.name}</h3>
                  <p className="text-xs text-brand-navy/75 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </button>
                <div className="pt-3 mt-3 border-t border-brand-navy/10">
                  <Link
                    href={`/venues?category=${encodeURIComponent(cat.slug)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal-text hover:underline"
                  >
                    <span>Open in Venues</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Featured & Popular Venues (or live instant search/category preview) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              {searchQuery.trim()
                ? `Venues matching "${searchQuery.trim()}" (${previewVenues.length})`
                : selectedCategory !== 'all'
                ? `${
                    categories.find((c) => c.slug === selectedCategory)?.name || 'Category'
                  } Venues (${previewVenues.length})`
                : 'Featured & Popular Venues'}
            </h2>
            <p className="text-sm sm:text-base text-brand-navy/75">
              Indicative Budget Ranges help you compare options comfortably—never a strict minimum
              spend rule.
            </p>
          </div>
          <Link
            href={
              searchQuery.trim() || selectedCategory !== 'all'
                ? `/venues?${new URLSearchParams({
                    ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
                    ...(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
                  }).toString()}`
                : '/venues'
            }
            className="text-sm font-semibold text-brand-teal-text hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            View all {venues.filter((v) => v.isPublished).length} venues →
          </Link>
        </div>

        {previewVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {previewVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 sm:p-10 text-center border border-brand-navy/10 space-y-3">
            <p className="text-lg font-semibold text-brand-navy">
              No venues matched &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-sm text-brand-navy/75 max-w-md mx-auto">
              Try searching for an experience like &ldquo;salsa&rdquo;, &ldquo;karaoke&rdquo;,
              &ldquo;bowling&rdquo;, or reset filters to browse all venues.
            </p>
            <div className="pt-1 flex justify-center">
              <BrandButton
                variant="secondary"
                size="sm"
                fullWidthOnMobile={false}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Reset Preview Filters
              </BrandButton>
            </div>
          </div>
        )}
      </section>

      {/* 4. Occasion Strip (12 Occasions) */}
      <section className="bg-surface-teal py-10 sm:py-12 border-y border-brand-teal/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">Plan by Occasion</h2>
              <p className="text-sm sm:text-base text-brand-navy/80 max-w-2xl">
                Whether it is a quiet date night, a birthday celebration, or an end-of-year corporate
                outing, filter matching venues or ask our event team to coordinate.
              </p>
            </div>
            <BrandLinkButton
              href="/plan-event"
              variant="alternative"
              size="sm"
              fullWidthOnMobile
            >
              Request Event Coordination
            </BrandLinkButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SEED_OCCASIONS.map((occasion) => {
              const count = venues.filter(
                (v) =>
                  v.isPublished &&
                  v.occasions.some((o) => o.toLowerCase() === occasion.toLowerCase())
              ).length;
              return (
                <Link
                  key={occasion}
                  href={`/venues?occasion=${encodeURIComponent(occasion)}`}
                  className="flex items-center justify-between gap-2 min-h-[48px] rounded-2xl bg-white px-4 py-3 border border-brand-navy/10 hover:border-brand-teal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                >
                  <span className="text-sm font-semibold text-brand-navy">{occasion}</span>
                  <span className="text-xs font-medium text-brand-teal-text tabular-nums shrink-0">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
