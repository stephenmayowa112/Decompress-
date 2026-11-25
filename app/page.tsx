'use client';

import React, { useState, useMemo } from 'react';
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
  CheckCircle2,
  Database,
  ShieldCheck,
  Palette,
} from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { BrandButton, BrandLinkButton } from '@/src/components/ui/Button';
import { VenueCard } from '@/src/components/ui/VenueCard';
import { SEED_OCCASIONS } from '@/src/lib/seed-data';

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  GlassWater,
  Music,
  Palmtree,
  CalendarHeart,
  Gamepad2,
  Sparkles,
};

export default function HomePage() {
  const router = useRouter();
  const {
    venues,
    categories,
    locations,
    facilities,
    experienceTags,
    faqTopics,
    faqItems,
    addOns,
    siteSettings,
    currentUser,
    isAdminUser,
    isSeedingFirestore,
    firestoreSeedStatus,
    signInWithGoogle,
    syncSeedDataToFirestore,
  } = useDecompress();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFoundationInspector, setShowFoundationInspector] = useState(false);

  // Instant homepage preview search matching venue name, category, activity & experience terms (e.g. "salsa")
  const filteredFeaturedVenues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return venues.filter((venue) => {
      if (!venue.isPublished) return false;
      if (selectedCategory !== 'all' && !venue.categorySlugs.includes(selectedCategory)) {
        return false;
      }
      if (!q) {
        return selectedCategory === 'all' ? venue.isFeatured : true;
      }
      const haystack = [
        venue.name,
        venue.description,
        venue.area,
        venue.neighbourhood,
        ...venue.categorySlugs,
        ...venue.experienceTags,
        ...venue.facilitySlugs,
        ...venue.occasions,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [venues, searchQuery, selectedCategory]);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/venues?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/venues');
    }
  };

  return (
    <div className="space-y-16">
      {/* 1. Homepage Hero (Section 4): Headline, main search bar, then the three brand action buttons */}
      <section className="bg-surface-teal/60 border-b border-brand-teal/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm font-semibold text-brand-teal-text">
              Social-Experience Discovery, Venue Booking &amp; Concierge Coordination
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-navy leading-tight">
              Spend less time organising and more time enjoying the plan.
            </h1>
            <p className="text-base sm:text-lg text-brand-navy/80 leading-relaxed max-w-2xl">
              Discover restaurants, rooftop lounges, salsa and karaoke nights, beach clubs, games
              arenas, spas, and event halls across Lagos. Compare indicative{' '}
              <strong className="font-semibold text-brand-navy">Budget Ranges</strong>, request a
              booking as a guest or member, and let Decompress coordinate the occasion.
            </p>

            {/* Main Search Box matching venue name, category, activity and experience terms */}
            <form
              onSubmit={handleHeroSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-2.5 rounded-2xl border border-brand-navy/15 shadow-sm"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="h-5 w-5 text-brand-teal ml-3 shrink-0" aria-hidden="true" />
                <label htmlFor="hero-main-search" className="sr-only">
                  Search venue name, category, activity or experience such as salsa or karaoke
                </label>
                <input
                  id="hero-main-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Try "salsa", "karaoke", "Victoria Island", "rooftop" or a venue name...'
                  className="w-full bg-transparent px-3 py-2.5 text-base text-brand-navy placeholder:text-brand-navy/50 focus:outline-none"
                />
              </div>
              <BrandButton type="submit" variant="primary" size="md" fullWidthOnMobile>
                Search
              </BrandButton>
            </form>

            {/* Quick experience search suggestions to test weighted experience search immediately */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-brand-navy/75">
              <span className="font-medium text-brand-navy">Popular experience searches:</span>
              {['salsa', 'karaoke', 'live-band', 'beach-club', 'bowling', 'day-spa'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="underline decoration-brand-teal underline-offset-4 hover:text-brand-teal-text font-medium cursor-pointer"
                >
                  {term}
                </button>
              ))}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="ml-2 text-brand-coral-text font-semibold hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* The Three Homepage Hero Buttons (Section 4):
                1. Primary (Coral fill, white >=18px semibold): "Explore Experiences" -> /experiences
                2. Secondary (Deep Navy fill, white >=18px semibold): "Explore Venues" -> /venues
                3. Alternative (Transparent fill, 2px teal border, dark-teal >=18px semibold): "Plan an Event" -> /plan-event */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5">
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

      {/* 2. Category Tiles (7 Main Categories from Section 7.1) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              Browse by Category
            </h2>
            <p className="text-sm sm:text-base text-brand-navy/75">
              A venue can belong to multiple categories where it offers dining, entertainment, or
              leisure experiences.
            </p>
          </div>
          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-sm font-semibold text-brand-teal-text hover:underline self-start sm:self-auto cursor-pointer"
            >
              Show all categories ({venues.length} sample venues)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const IconComponent = CATEGORY_ICON_MAP[cat.iconName] || Sparkles;
            const matchingCount = venues.filter(
              (v) => v.isPublished && v.categorySlugs.includes(cat.slug)
            ).length;
            const isSelected = selectedCategory === cat.slug;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setSelectedCategory((prev) => (prev === cat.slug ? 'all' : cat.slug))
                }
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal ${
                  isSelected
                    ? 'bg-surface-teal border-brand-teal shadow-sm'
                    : 'bg-white border-brand-navy/10 hover:bg-surface-teal/50'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-teal text-brand-teal-text">
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
            );
          })}
        </div>
      </section>

      {/* 3. Featured & Popular Venues (or instant search/category filter results) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              {searchQuery.trim()
                ? `Venues matching "${searchQuery.trim()}" (${filteredFeaturedVenues.length})`
                : selectedCategory !== 'all'
                ? `${
                    categories.find((c) => c.slug === selectedCategory)?.name || 'Category'
                  } Venues (${filteredFeaturedVenues.length})`
                : 'Featured & Popular Venues'}
            </h2>
            <p className="text-sm sm:text-base text-brand-navy/75">
              Indicative Budget Ranges help you find comfortable options—never a strict rule or
              minimum spend.
            </p>
          </div>
          <Link
            href="/venues"
            className="text-sm font-semibold text-brand-teal-text hover:underline whitespace-nowrap"
          >
            View all {venues.length} sample venues →
          </Link>
        </div>

        {filteredFeaturedVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeaturedVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center border border-brand-navy/10 space-y-3">
            <p className="text-lg font-semibold text-brand-navy">
              No sample venues matched &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-sm text-brand-navy/75">
              Try searching for an experience like &ldquo;salsa&rdquo;, &ldquo;karaoke&rdquo;,
              &ldquo;bowling&rdquo;, or clear your filter to browse all 18 sample venues.
            </p>
            <BrandButton
              variant="secondary"
              size="sm"
              fullWidthOnMobile={false}
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </BrandButton>
          </div>
        )}
      </section>

      {/* 4. Occasion Strip (12 Occasions from Section 7.1) */}
      <section className="bg-surface-teal py-12 border-y border-brand-teal/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">
                Plan by Occasion
              </h2>
              <p className="text-sm sm:text-base text-brand-navy/80">
                Whether it is a quiet date night, a birthday hangout, or an end-of-year corporate
                outing, filter venues or ask our event team to coordinate.
              </p>
            </div>
            <BrandLinkButton
              href="/plan-event"
              variant="alternative"
              size="sm"
              fullWidthOnMobile={false}
            >
              Request Event Coordination
            </BrandLinkButton>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                  className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3.5 border border-brand-navy/10 hover:border-brand-teal transition-colors"
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

      {/* 5. Milestone 1 Foundation Verification & Design System Inspector */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-brand-navy/15 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal-text">
                <CheckCircle2 className="h-4 w-4 text-brand-teal" />
                <span>Milestone 1: Foundation Ready</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
                Foundation Architecture, Design System &amp; Seed Dataset Inspector
              </h2>
              <p className="text-sm text-brand-navy/75">
                Inspect the Section 4 WCAG 2.1 AA brand tokens, button variants, core data models,
                category-linked facilities, and live Firestore synchronization.
              </p>
            </div>
            <BrandButton
              variant="alternative"
              size="sm"
              fullWidthOnMobile={false}
              onClick={() => setShowFoundationInspector((prev) => !prev)}
            >
              {showFoundationInspector ? 'Hide Foundation Details' : 'Inspect Milestone 1 Foundation'}
            </BrandButton>
          </div>

          {/* Core Seed Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 pt-2 border-t border-brand-navy/10 text-sm">
            <div>
              <span className="block text-xs text-brand-navy/65">Sample Venues</span>
              <span className="text-lg font-bold text-brand-navy tabular-nums">
                {venues.length} fictional
              </span>
            </div>
            <div>
              <span className="block text-xs text-brand-navy/65">Categories</span>
              <span className="text-lg font-bold text-brand-navy tabular-nums">
                {categories.length} categories
              </span>
            </div>
            <div>
              <span className="block text-xs text-brand-navy/65">Lagos Locations</span>
              <span className="text-lg font-bold text-brand-navy tabular-nums">
                {locations.length} areas
              </span>
            </div>
            <div>
              <span className="block text-xs text-brand-navy/65">Category Facilities</span>
              <span className="text-lg font-bold text-brand-navy tabular-nums">
                {facilities.length} linked
              </span>
            </div>
            <div>
              <span className="block text-xs text-brand-navy/65">Experience Tags</span>
              <span className="text-lg font-bold text-brand-navy tabular-nums">
                {experienceTags.length} tags
              </span>
            </div>
            <div>
              <span className="block text-xs text-brand-navy/65">Unpublished FAQs</span>
              <span className="text-lg font-bold text-brand-navy tabular-nums">
                {faqTopics.length} topics / {faqItems.length} drafts
              </span>
            </div>
          </div>

          {showFoundationInspector && (
            <div className="space-y-8 pt-6 border-t border-brand-navy/10">
              {/* A. Design Tokens & Accessibility Swatches */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-base font-bold text-brand-navy">
                  <Palette className="h-4 w-4 text-brand-teal" />
                  <span>Section 4 Brand Colour Tokens &amp; WCAG 2.1 AA Derived Shades</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl p-3 bg-brand-navy text-white">
                    <p className="font-bold">brand-navy</p>
                    <p className="opacity-85">#123B60 · Primary / Header / Footer</p>
                  </div>
                  <div className="rounded-xl p-3 bg-brand-teal text-white">
                    <p className="font-bold">brand-teal</p>
                    <p className="opacity-90">#13A6A3 · Icons, Borders &amp; Accents</p>
                  </div>
                  <div className="rounded-xl p-3 bg-surface border border-brand-teal text-brand-teal-text">
                    <p className="font-bold">brand-teal-text (AA Derived)</p>
                    <p>#0B6E6C · 5.68:1 on Soft White</p>
                  </div>
                  <div className="rounded-xl p-3 bg-brand-coral text-white">
                    <p className="font-bold text-sm">brand-coral (≥18px Bold)</p>
                    <p>#FF704F · Hover #E55A38</p>
                  </div>
                  <div className="rounded-xl p-3 bg-brand-yellow text-brand-navy">
                    <p className="font-bold">brand-yellow</p>
                    <p>#FFC857 · Verified Rating Stars</p>
                  </div>
                  <div className="rounded-xl p-3 bg-surface border border-brand-navy/15 text-brand-navy">
                    <p className="font-bold">surface</p>
                    <p>#F5F8FA · Soft White Background</p>
                  </div>
                  <div className="rounded-xl p-3 bg-surface-teal border border-brand-teal/30 text-brand-navy">
                    <p className="font-bold">surface-teal</p>
                    <p>#E7F5F3 · Light Teal Surface</p>
                  </div>
                  <div className="rounded-xl p-3 bg-white border border-brand-navy/15 text-brand-navy">
                    <p className="font-bold">Currency &amp; Timezone</p>
                    <p>
                      {siteSettings.defaultCurrency} (minor units) · {siteSettings.defaultTimezone}
                    </p>
                  </div>
                </div>
              </div>

              {/* B. Category-Relevant Facilities Mapping Matrix */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-base font-bold text-brand-navy">
                  <ShieldCheck className="h-4 w-4 text-brand-teal" />
                  <span>
                    Section 7.1 Data-Driven Facility → Category Relevance (e.g. Pool shows for
                    Hotels &amp; Resorts, not Music &amp; Entertainment)
                  </span>
                </h3>
                <div className="overflow-x-auto rounded-xl border border-brand-navy/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-teal text-brand-navy font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Facility</th>
                        <th className="py-2.5 px-3">Slug</th>
                        <th className="py-2.5 px-3">Applicable Categories</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-navy/10">
                      {facilities.map((fac) => (
                        <tr key={fac.id}>
                          <td className="py-2 px-3 font-medium text-brand-navy">{fac.name}</td>
                          <td className="py-2 px-3 font-mono text-brand-teal-text">{fac.slug}</td>
                          <td className="py-2 px-3 text-brand-navy/80">
                            {fac.applicableCategorySlugs.join(' · ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* C. Optional Add-Ons & Firestore Sync Control */}
              <div className="rounded-xl bg-surface p-5 border border-brand-navy/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-brand-navy">
                    <Database className="h-4 w-4 text-brand-teal" />
                    <span>Firestore Database Seed Sync ({addOns.length} Event Add-Ons &amp; 18 Venues)</span>
                  </h4>
                  <p className="text-xs text-brand-navy/75">
                    {currentUser
                      ? `Signed in as ${currentUser.email} (${
                          isAdminUser ? 'Verified Bootstrapped Superuser' : 'Standard User'
                        })`
                      : 'Sign in with the founder Google account to write/update seed collections directly in Firestore.'}
                  </p>
                  {firestoreSeedStatus && (
                    <p className="text-xs font-medium text-brand-teal-text pt-1">
                      {firestoreSeedStatus}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {!currentUser ? (
                    <BrandButton
                      variant="secondary"
                      size="sm"
                      fullWidthOnMobile={false}
                      onClick={() => signInWithGoogle()}
                    >
                      Sign in with Google
                    </BrandButton>
                  ) : (
                    <BrandButton
                      variant="primary"
                      size="sm"
                      fullWidthOnMobile={false}
                      disabled={isSeedingFirestore || !isAdminUser}
                      onClick={() => syncSeedDataToFirestore()}
                    >
                      {isSeedingFirestore ? 'Syncing to Firestore...' : 'Sync Seed Data to Firestore'}
                    </BrandButton>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
