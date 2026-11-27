'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
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
  ChevronDown,
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

const HERO_PHRASES = [
  'Date nights in Lagos',
  'Salsa, dining & lounges',
  'Group outings & events',
];

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Discover & compare',
    description:
      'Browse curated Lagos restaurants, rooftop lounges, beach clubs, games arenas, and spas with clear indicative Budget Ranges.',
  },
  {
    number: '02',
    title: 'Request without upfront charges',
    description:
      'Submit your booking request as a guest or signed-in member. Add optional event coordination whenever you need extra support.',
  },
  {
    number: '03',
    title: 'Confirm & enjoy the plan',
    description:
      'Our concierge team confirms venue availability, sends your payment link and PDF invoice when confirmed, and handles the details.',
  },
];

export function HomeClient() {
  const router = useRouter();
  const { venues, categories, faqItems } = useDecompress();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [failedHeroIds, setFailedHeroIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, []);

  const showcaseVenues = useMemo(() => {
    const featured = venues.filter((v) => v.isPublished && v.isFeatured && v.heroImageUrl);
    return (
      featured.length >= 3
        ? featured
        : venues.filter((v) => v.isPublished && v.heroImageUrl)
    ).slice(0, 3);
  }, [venues]);

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

  const publishedFaqs = useMemo(
    () =>
      faqItems
        .filter((item) => item.isPublished)
        .sort((a, b) => a.order - b.order)
        .slice(0, 4),
    [faqItems]
  );

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
    <div className="overflow-x-clip">
      {/* 1. Hero Section */}
      <section className="relative pt-14 sm:pt-20 lg:pt-24 pb-10 sm:pb-14">
        {/* Subtle ambient floating gradient blobs & radial dot-grid texture */}
        <div
          aria-hidden="true"
          className="dc-hero-blob pointer-events-none absolute -top-10 left-[4%] h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-brand-teal/20 blur-[80px]"
        />
        <div
          aria-hidden="true"
          className="dc-hero-blob-delayed pointer-events-none absolute top-28 right-[4%] h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-brand-yellow/20 blur-[80px]"
        />
        <div aria-hidden="true" className="dc-hero-dots pointer-events-none absolute inset-0" />

        <div className="relative z-10 mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
            className="mx-auto max-w-[880px]"
          >
            <h1 className="text-[clamp(2.45rem,6vw,4.85rem)] font-bold leading-[1.04] tracking-[-0.035em] text-brand-navy">
              <span className="block min-h-[1.12em] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={HERO_PHRASES[phraseIndex]}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                    className="inline-block text-brand-teal"
                  >
                    {HERO_PHRASES[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="block text-brand-navy">made effortless.</span>
            </h1>

            <p className="mx-auto mt-6 mb-9 max-w-[560px] text-base sm:text-lg lg:text-[19px] leading-relaxed text-brand-navy/75">
              Discover curated restaurants, rooftop lounges, salsa nights, beach clubs, and event
              spaces across Lagos. Compare indicative{' '}
              <strong className="font-semibold text-brand-navy">Budget Ranges</strong> and let
              Decompress handle the booking.
            </p>

            {/* The 3 Signature Brand Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4">
              <BrandLinkButton href="/experiences" variant="highlight" size="lg">
                Explore Experiences
              </BrandLinkButton>
              <BrandLinkButton href="/venues" variant="secondary" size="lg">
                Explore Venues
              </BrandLinkButton>
              <BrandLinkButton href="/plan-event" variant="alternative" size="lg">
                Plan an Event
              </BrandLinkButton>
            </div>

            {/* Instant Search Bar right in hero for fast discovery */}
            <div className="mt-9 space-y-3.5">
              <form
                onSubmit={handleHeroSearchSubmit}
                className="mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-[640px]"
              >
                <div className="relative flex flex-1 items-center rounded-full border border-brand-navy/15 bg-white px-5 min-h-[54px] shadow-[0_8px_28px_rgba(18,59,96,0.06)] focus-within:border-brand-teal focus-within:ring-4 focus-within:ring-brand-teal/15 transition-all">
                  <Search className="h-4 w-4 text-brand-teal shrink-0" aria-hidden="true" />
                  <label htmlFor="hero-main-search" className="sr-only">
                    Search venue name, category, activity or experience such as salsa or karaoke
                  </label>
                  <input
                    id="hero-main-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search "salsa", "karaoke", "Victoria Island", or "rooftop"...'
                    className="w-full min-w-0 bg-transparent px-3 py-2.5 text-[15px] text-brand-navy placeholder:text-brand-navy/45 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[54px] px-8 rounded-full bg-brand-navy text-white text-[15px] font-semibold hover:bg-brand-navy-hover hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(18,59,96,0.22)] transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal"
                >
                  Search venues
                </button>
              </form>

              {/* Quick popular experience links */}
              <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-xs sm:text-sm text-brand-navy/65">
                <span className="font-medium text-brand-navy/80">Popular:</span>
                {['salsa', 'karaoke', 'live-band', 'beach-club', 'bowling', 'day-spa'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      document.getElementById('featured-venues-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="py-1 underline decoration-brand-teal/60 underline-offset-4 hover:text-brand-teal-text font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded px-1"
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
                    Clear
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Editorial Showcase Frame (3-Panel Hospitality Mosaic with venue labels) */}
          {showcaseVenues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
              className="mt-10 sm:mt-12 rounded-[28px] overflow-hidden bg-white p-2 sm:p-2.5 shadow-[0_28px_64px_rgba(18,59,96,0.12)] border border-brand-navy/8"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-2.5">
                {showcaseVenues.map((venue, idx) => {
                  const colClass = idx === 0 ? 'md:col-span-6' : 'md:col-span-3';
                  const hasFailed = Boolean(failedHeroIds[venue.id]);
                  return (
                    <Link
                      key={venue.id}
                      href={`/venues/${venue.slug}`}
                      className={`${colClass} group relative aspect-[16/10] md:aspect-auto md:h-[300px] lg:h-[340px] rounded-[20px] overflow-hidden bg-brand-navy block focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal`}
                    >
                      {!hasFailed && venue.heroImageUrl ? (
                        <Image
                          src={venue.heroImageUrl}
                          alt={venue.name}
                          fill
                          priority={idx === 0}
                          sizes={idx === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 25vw'}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedHeroIds((prev) => ({ ...prev, [venue.id]: true }))
                          }
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-teal" />
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/35 to-transparent p-4 text-left">
                        <p className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                          {venue.name}
                        </p>
                        <p className="text-xs text-surface-teal/90 truncate">{venue.area}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Animated Minimal Concierge Journey Strip */}
          <div className="mx-auto mt-7 flex max-w-[680px] items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm font-semibold text-brand-navy/70">
            <span className="whitespace-nowrap">Discover Venues</span>
            <div className="relative h-[2px] flex-1 dc-route-line" aria-hidden="true">
              <span className="dc-route-dot absolute -top-1 h-2.5 w-2.5 rounded-full bg-brand-teal" />
            </div>
            <span className="whitespace-nowrap text-brand-teal-text">Confirm Availability</span>
            <div className="relative hidden sm:block h-[2px] flex-1 dc-route-line" aria-hidden="true">
              <span className="dc-route-dot absolute -top-1 h-2.5 w-2.5 rounded-full bg-brand-yellow" />
            </div>
            <span className="hidden sm:inline whitespace-nowrap">Arrive &amp; Enjoy</span>
          </div>
        </div>
      </section>

      {/* 2. Curated Categories */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
                Curated Categories
              </p>
              <h2 className="text-3xl sm:text-[42px] font-bold tracking-[-0.03em] leading-[1.1] text-brand-navy">
                Seven ways to unwind across Lagos.
              </h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 sm:gap-6">
            {categories.map((cat, idx) => {
              const IconComponent = CATEGORY_ICON_MAP[cat.iconName] || Sparkles;
              const matchingCount = venues.filter(
                (v) => v.isPublished && v.categorySlugs.includes(cat.slug)
              ).length;
              const isSelected = selectedCategory === cat.slug;
              const spanClass =
                idx < 2 || idx >= 5 ? 'lg:col-span-3' : 'lg:col-span-2';

              return (
                <div
                  key={cat.id}
                  className={`${spanClass} group flex flex-col justify-between rounded-[28px] p-7 sm:p-9 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(18,59,96,0.10)] ${
                    isSelected
                      ? 'bg-brand-navy text-white shadow-[0_20px_44px_rgba(18,59,96,0.18)]'
                      : 'bg-surface-teal text-brand-navy'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const next = isSelected ? 'all' : cat.slug;
                      setSelectedCategory(next);
                      if (next !== 'all') {
                        document
                          .getElementById('featured-venues-preview')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    aria-pressed={isSelected}
                    className="text-left cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal rounded-2xl"
                  >
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm shrink-0 ${
                          isSelected ? 'bg-white/15 text-brand-yellow' : 'bg-white text-brand-teal'
                        }`}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          isSelected ? 'text-surface-teal' : 'text-brand-teal-text'
                        }`}
                      >
                        {matchingCount} {matchingCount === 1 ? 'venue' : 'venues'}
                      </span>
                    </div>
                    <h3
                      className={`text-xl sm:text-2xl font-semibold tracking-[-0.02em] mb-2.5 ${
                        isSelected ? 'text-white' : 'text-brand-navy'
                      }`}
                    >
                      {cat.name}
                    </h3>
                    <p
                      className={`text-sm sm:text-[15px] leading-relaxed ${
                        isSelected ? 'text-surface-teal/85' : 'text-brand-navy/70'
                      }`}
                    >
                      {cat.description}
                    </p>
                  </button>

                  <div className="pt-6 mt-4">
                    <Link
                      href={`/venues?category=${encodeURIComponent(cat.slug)}`}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] uppercase transition-transform duration-200 group-hover:translate-x-1 ${
                        isSelected ? 'text-brand-yellow' : 'text-brand-teal-text'
                      }`}
                    >
                      <span>Explore category</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Featured & Popular Venues (Live Preview) */}
      <section id="featured-venues-preview" className="py-12 sm:py-16 lg:py-20 scroll-mt-20">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3 min-w-0">
              <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
                {searchQuery.trim() || selectedCategory !== 'all'
                  ? 'Filtered Results'
                  : 'Featured Venues'}
              </p>
              <h2 className="text-3xl sm:text-[42px] font-bold tracking-[-0.03em] leading-[1.1] text-brand-navy">
                {searchQuery.trim()
                  ? `Matches for "${searchQuery.trim()}" (${previewVenues.length})`
                  : selectedCategory !== 'all'
                  ? `${
                      categories.find((c) => c.slug === selectedCategory)?.name || 'Category'
                    } (${previewVenues.length})`
                  : 'Handpicked places to decompress.'}
              </h2>
              <p className="text-sm sm:text-base text-brand-navy/70 max-w-2xl">
                Every venue lists an indicative Budget Range so you can compare options comfortably—never
                a strict minimum spend rule.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 self-start sm:self-auto">
              {(searchQuery.trim() || selectedCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-sm font-semibold text-brand-coral-text hover:underline cursor-pointer whitespace-nowrap"
                >
                  Clear filter
                </button>
              )}
              <Link
                href={
                  searchQuery.trim() || selectedCategory !== 'all'
                    ? `/venues?${new URLSearchParams({
                        ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
                        ...(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
                      }).toString()}`
                    : '/venues'
                }
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-text hover:translate-x-1 transition-transform whitespace-nowrap"
              >
                <span>View all {venues.filter((v) => v.isPublished).length} venues</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {previewVenues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {previewVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] bg-white p-10 sm:p-12 text-center border border-brand-navy/8 shadow-[0_8px_28px_rgba(18,59,96,0.05)] space-y-3">
              <p className="text-lg font-semibold text-brand-navy">
                No venues matched &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-sm text-brand-navy/70 max-w-md mx-auto">
                Try searching for an experience like &ldquo;salsa&rdquo;, &ldquo;karaoke&rdquo;,
                &ldquo;bowling&rdquo;, or reset filters to browse all venues.
              </p>
              <div className="pt-2 flex justify-center">
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
        </div>
      </section>

      {/* 5. How Decompress Works */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="space-y-3 mb-12">
            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-[42px] font-bold tracking-[-0.03em] leading-[1.1] text-brand-navy">
              Discover, request, enjoy.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.number}
                className="transition-transform duration-200 hover:-translate-y-1 space-y-2.5"
              >
                <p className="text-sm font-bold text-brand-teal tabular-nums">{step.number}</p>
                <h3 className="text-xl font-semibold tracking-[-0.015em] text-brand-navy">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-brand-navy/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Plan by Occasion (12 Occasions on Light Teal Surface) */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-surface-teal p-7 sm:p-10 lg:p-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div className="space-y-2.5 max-w-2xl">
                <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
                  Occasions
                </p>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-[-0.03em] leading-[1.1] text-brand-navy">
                  Plan around the moment.
                </h2>
                <p className="text-sm sm:text-base text-brand-navy/75">
                  Filter venues curated for quiet date nights, milestone birthdays, corporate
                  off-sites, or weekend group hangouts.
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
                    className="flex items-center justify-between gap-2 min-h-[50px] rounded-2xl bg-white px-4 py-3 shadow-[0_2px_10px_rgba(18,59,96,0.04)] hover:shadow-[0_10px_24px_rgba(18,59,96,0.09)] hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                  >
                    <span className="text-sm font-semibold text-brand-navy">{occasion}</span>
                    <span className="text-xs font-semibold text-brand-teal-text tabular-nums shrink-0">
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
                FAQ
              </p>
              <h2 className="text-3xl sm:text-[42px] font-bold tracking-[-0.03em] leading-[1.1] text-brand-navy">
                Questions, answered.
              </h2>
            </div>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-text hover:translate-x-1 transition-transform whitespace-nowrap"
            >
              <span>Visit Help Centre</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {publishedFaqs.length > 0 ? (
            <div className="border-t border-brand-navy/12">
              {publishedFaqs.map((item, idx) => (
                <details
                  key={item.id}
                  className="group border-b border-brand-navy/12 py-6"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base sm:text-lg font-semibold text-brand-navy">
                    <span className="flex items-baseline gap-5">
                      <span className="text-sm font-medium text-brand-navy/45 tabular-nums">
                        0{idx + 1}
                      </span>
                      <span>{item.question}</span>
                    </span>
                    <ChevronDown className="h-5 w-5 text-brand-teal shrink-0 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 pl-10 text-sm sm:text-[15px] leading-relaxed text-brand-navy/75 whitespace-pre-line">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          ) : (
            <div className="border-y border-brand-navy/12 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm sm:text-base text-brand-navy/75 max-w-2xl">
                Our published policy answers appear here as soon as they are finalised. Need help
                with a venue, Budget Range, or booking reference right now?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-text hover:underline whitespace-nowrap shrink-0"
              >
                <span>Message customer care</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 8. Event Planning CTA Banner */}
      <section className="pb-6 pt-4">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-brand-navy text-white px-7 py-12 sm:px-14 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-[0_24px_56px_rgba(18,59,96,0.18)]">
            <div className="lg:col-span-7 space-y-3">
              <h2 className="text-3xl sm:text-[40px] font-bold tracking-[-0.03em] leading-[1.1] text-white">
                Planning something bigger than a table?
              </h2>
              <p className="text-base sm:text-lg text-surface-teal/85 leading-relaxed max-w-xl">
                Choose from venue sourcing, partial planning, or full event coordination with
                optional photography, DJ curation, and on-the-day support.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end items-stretch sm:items-center gap-3.5">
              <BrandLinkButton href="/plan-event" variant="primary" size="lg">
                Plan an Event
              </BrandLinkButton>
              <BrandLinkButton href="/contact" variant="alternativeOnDark" size="lg">
                Talk to us
              </BrandLinkButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
