'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { SEED_OCCASIONS } from '@/src/lib/seed-data';
import {
  BUDGET_RANGE_PRESETS,
  DEFAULT_VENUE_FILTERS,
  VenueSearchFilters,
  filterAndSortVenues,
  getRelevantFacilities,
  parseFiltersFromSearchParams,
  serializeFiltersToQueryString,
} from '@/src/lib/search';
import { formatMoneyMinor } from '@/src/lib/format';
import { BookingType, VenueSetting } from '@/src/types/domain';
import { VenueCard } from '@/src/components/ui/VenueCard';
import { BrandButton, BrandLinkButton } from '@/src/components/ui/Button';

const SETTING_OPTIONS: { value: VenueSetting; label: string }[] = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'rooftop', label: 'Rooftop' },
  { value: 'beachfront', label: 'Beachfront' },
];

const BOOKING_TYPE_OPTIONS: { value: BookingType; label: string }[] = [
  { value: 'table', label: 'Table booking' },
  { value: 'group', label: 'Group booking' },
  { value: 'private_hire', label: 'Private hire' },
];

export function VenueDiscoveryClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  const { venues, categories, locations, facilities, experienceTags } = useDecompress();

  const [filters, setFilters] = useState<VenueSearchFilters>(() =>
    parseFiltersFromSearchParams(searchParams)
  );
  const [syncedSearchKey, setSyncedSearchKey] = useState<string>(searchKey);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState<boolean>(() => {
    const initial = parseFiltersFromSearchParams(searchParams);
    return Boolean(
      initial.occasion ||
        initial.experience ||
        initial.setting ||
        initial.guests ||
        initial.facilities.length > 0 ||
        initial.bookingType ||
        initial.minRating ||
        initial.date
    );
  });

  // Sync cleanly when navigating to /venues with new query params from external links
  if (searchKey !== syncedSearchKey) {
    const parsed = parseFiltersFromSearchParams(searchParams);
    setSyncedSearchKey(searchKey);
    setFilters(parsed);
  }

  const applyFilters = (next: VenueSearchFilters) => {
    const qs = serializeFiltersToQueryString(next);
    setSyncedSearchKey(qs);
    setFilters(next);
    if (typeof window !== 'undefined') {
      const nextUrl = qs ? `${pathname}?${qs}` : pathname;
      window.history.replaceState(null, '', nextUrl);
    }
  };

  const updateFilterPatch = (patch: Partial<VenueSearchFilters>) => {
    const next: VenueSearchFilters = { ...filters, ...patch };
    // Prune facilities that do not apply to the newly selected category (Section 7.1)
    if (patch.category !== undefined) {
      const relevant = getRelevantFacilities(facilities, patch.category);
      next.facilities = next.facilities.filter((slug) =>
        relevant.some((f) => f.slug === slug)
      );
    }
    applyFilters(next);
  };

  const toggleFacility = (slug: string) => {
    const exists = filters.facilities.includes(slug);
    const nextFacilities = exists
      ? filters.facilities.filter((s) => s !== slug)
      : [...filters.facilities, slug];
    updateFilterPatch({ facilities: nextFacilities });
  };

  const clearAllFilters = () => {
    applyFilters({ ...DEFAULT_VENUE_FILTERS });
  };

  const uniqueAreas = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const loc of locations) {
      if (!seen.has(loc.area)) {
        seen.add(loc.area);
        result.push(loc.area);
      }
    }
    return result;
  }, [locations]);

  const relevantFacilities = useMemo(
    () => getRelevantFacilities(facilities, filters.category),
    [facilities, filters.category]
  );

  const filteredVenues = useMemo(
    () => filterAndSortVenues(venues, filters),
    [venues, filters]
  );

  const moreFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.occasion) count++;
    if (filters.experience) count++;
    if (filters.setting) count++;
    if (filters.guests && filters.guests > 0) count++;
    if (filters.facilities.length > 0) count += filters.facilities.length;
    if (filters.bookingType) count++;
    if (filters.minRating) count++;
    if (filters.date) count++;
    return count;
  }, [filters]);

  const activeFilterItems = useMemo(() => {
    const items: { id: string; label: string; onClear: () => void }[] = [];
    if (filters.q.trim()) {
      items.push({
        id: 'q',
        label: `Search: "${filters.q.trim()}"`,
        onClear: () => updateFilterPatch({ q: '' }),
      });
    }
    if (filters.location) {
      items.push({
        id: 'location',
        label: `Location: ${filters.location}`,
        onClear: () => updateFilterPatch({ location: '' }),
      });
    }
    if (filters.category) {
      const catName = categories.find((c) => c.slug === filters.category)?.name || filters.category;
      items.push({
        id: 'category',
        label: `Category: ${catName}`,
        onClear: () => updateFilterPatch({ category: '' }),
      });
    }
    if (filters.budgetRange && filters.budgetRange !== 'custom') {
      const preset = BUDGET_RANGE_PRESETS.find((p) => p.id === filters.budgetRange);
      if (preset) {
        items.push({
          id: 'budgetRange',
          label: `Budget Range: ${preset.label}`,
          onClear: () =>
            updateFilterPatch({ budgetRange: '', budgetMin: undefined, budgetMax: undefined }),
        });
      }
    } else if (
      typeof filters.budgetMin === 'number' ||
      typeof filters.budgetMax === 'number'
    ) {
      const minLabel =
        typeof filters.budgetMin === 'number'
          ? formatMoneyMinor(filters.budgetMin, 'NGN')
          : 'Any';
      const maxLabel =
        typeof filters.budgetMax === 'number'
          ? formatMoneyMinor(filters.budgetMax, 'NGN')
          : 'Any';
      items.push({
        id: 'budgetCustom',
        label: `Budget Range: ${minLabel} – ${maxLabel}`,
        onClear: () =>
          updateFilterPatch({ budgetRange: '', budgetMin: undefined, budgetMax: undefined }),
      });
    }
    if (filters.occasion) {
      items.push({
        id: 'occasion',
        label: `Occasion: ${filters.occasion}`,
        onClear: () => updateFilterPatch({ occasion: '' }),
      });
    }
    if (filters.experience) {
      const tagName =
        experienceTags.find((t) => t.slug === filters.experience)?.name || filters.experience;
      items.push({
        id: 'experience',
        label: `Experience: ${tagName}`,
        onClear: () => updateFilterPatch({ experience: '' }),
      });
    }
    if (filters.setting) {
      items.push({
        id: 'setting',
        label: `Setting: ${filters.setting}`,
        onClear: () => updateFilterPatch({ setting: '' }),
      });
    }
    if (filters.guests && filters.guests > 0) {
      items.push({
        id: 'guests',
        label: `Group Size: ${filters.guests}+ guests`,
        onClear: () => updateFilterPatch({ guests: undefined }),
      });
    }
    for (const facSlug of filters.facilities) {
      const facName = facilities.find((f) => f.slug === facSlug)?.name || facSlug;
      items.push({
        id: `fac_${facSlug}`,
        label: `Facility: ${facName}`,
        onClear: () => toggleFacility(facSlug),
      });
    }
    if (filters.bookingType) {
      const btName =
        BOOKING_TYPE_OPTIONS.find((b) => b.value === filters.bookingType)?.label ||
        filters.bookingType;
      items.push({
        id: 'bookingType',
        label: `Booking Type: ${btName}`,
        onClear: () => updateFilterPatch({ bookingType: '' }),
      });
    }
    if (filters.minRating) {
      items.push({
        id: 'minRating',
        label: `Rating: ${filters.minRating.toFixed(1)}+ stars`,
        onClear: () => updateFilterPatch({ minRating: undefined }),
      });
    }
    if (filters.date) {
      items.push({
        id: 'date',
        label: `Preferred Date: ${filters.date}`,
        onClear: () => updateFilterPatch({ date: '' }),
      });
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, categories, experienceTags, facilities]);

  const selectedCategoryName = filters.category
    ? categories.find((c) => c.slug === filters.category)?.name || filters.category
    : 'All Categories';

  return (
    <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 sm:space-y-10">
      {/* Page Heading */}
      <div className="space-y-3 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
          Venues Directory
        </p>
        <h1 className="text-3xl sm:text-[44px] font-bold tracking-[-0.03em] leading-[1.1] text-brand-navy">
          Explore venues across Lagos.
        </h1>
        <p className="text-base text-brand-navy/75 leading-relaxed">
          Search by venue name, experience such as &ldquo;salsa&rdquo; or &ldquo;karaoke&rdquo;,
          location, category, and indicative{' '}
          <strong className="font-semibold text-brand-navy">Budget Range</strong>.
        </p>
      </div>

      {/* Primary Discovery Controls Card */}
      <section
        aria-label="Venue Search and Filters"
        className="rounded-[28px] bg-white p-5 sm:p-7 border border-brand-navy/8 shadow-[0_10px_36px_rgba(18,59,96,0.06)] space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4">
          {/* 1. Main Search Input */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-1.5 min-w-0">
            <label htmlFor="venues-search-q" className="block text-xs font-semibold text-brand-navy">
              Search Venue or Experience
            </label>
            <div className="relative flex items-center rounded-xl border border-brand-navy/20 bg-surface focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/25">
              <Search className="h-4 w-4 text-brand-teal ml-3 shrink-0" aria-hidden="true" />
              <input
                id="venues-search-q"
                type="search"
                value={filters.q}
                onChange={(e) => updateFilterPatch({ q: e.target.value })}
                placeholder='Try "salsa", "karaoke", "rooftop"...'
                className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm text-brand-navy placeholder:text-brand-navy/50 focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          {/* 2. Location Filter */}
          <div className="lg:col-span-3 space-y-1.5 min-w-0">
            <label
              htmlFor="venues-filter-location"
              className="block text-xs font-semibold text-brand-navy"
            >
              Location
            </label>
            <select
              id="venues-filter-location"
              value={filters.location}
              onChange={(e) => updateFilterPatch({ location: e.target.value })}
              className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
            >
              <option value="">All Lagos Areas</option>
              {uniqueAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Category Filter */}
          <div className="lg:col-span-3 space-y-1.5 min-w-0">
            <label
              htmlFor="venues-filter-category"
              className="block text-xs font-semibold text-brand-navy"
            >
              Category
            </label>
            <select
              id="venues-filter-category"
              value={filters.category}
              onChange={(e) => updateFilterPatch({ category: e.target.value })}
              className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Indicative Budget Range Filter (NEVER "Minimum Spend") */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-1.5 min-w-0">
            <label
              htmlFor="venues-filter-budget"
              className="block text-xs font-semibold text-brand-navy"
            >
              Budget Range
            </label>
            <select
              id="venues-filter-budget"
              value={filters.budgetRange}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  updateFilterPatch({ budgetRange: 'custom' });
                } else {
                  updateFilterPatch({
                    budgetRange: value,
                    budgetMin: undefined,
                    budgetMax: undefined,
                  });
                }
              }}
              className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2.5 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
            >
              <option value="">Any Budget Range</option>
              {BUDGET_RANGE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
              <option value="custom">Custom Budget Range (₦)</option>
            </select>
          </div>
        </div>

        {/* Optional Custom Budget Range Inputs */}
        {filters.budgetRange === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-brand-navy/10">
            <div className="space-y-1">
              <label
                htmlFor="venues-budget-min"
                className="block text-xs font-semibold text-brand-navy"
              >
                Custom Budget Range Min (NGN)
              </label>
              <input
                id="venues-budget-min"
                type="number"
                min={0}
                step={5000}
                value={typeof filters.budgetMin === 'number' ? Math.round(filters.budgetMin / 100) : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateFilterPatch({
                    budgetMin: val ? Math.max(0, Number(val)) * 100 : undefined,
                  });
                }}
                placeholder="e.g. 25000"
                className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none tabular-nums"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="venues-budget-max"
                className="block text-xs font-semibold text-brand-navy"
              >
                Custom Budget Range Max (NGN)
              </label>
              <input
                id="venues-budget-max"
                type="number"
                min={0}
                step={5000}
                value={typeof filters.budgetMax === 'number' ? Math.round(filters.budgetMax / 100) : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateFilterPatch({
                    budgetMax: val ? Math.max(0, Number(val)) * 100 : undefined,
                  });
                }}
                placeholder="e.g. 150000"
                className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none tabular-nums"
              />
            </div>
          </div>
        )}

        {/* Toolbar Row: More Filters Toggle + Sort + Clear */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-brand-navy/10">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMoreFiltersOpen((prev) => !prev)}
              aria-expanded={moreFiltersOpen}
              aria-controls="venues-more-filters-panel"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border-2 border-brand-teal text-sm font-semibold text-brand-teal-text hover:bg-surface-teal transition-colors cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              <span>
                More Filters{moreFiltersCount > 0 ? ` (${moreFiltersCount})` : ''}
              </span>
              {moreFiltersOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
            </button>

            {activeFilterItems.length > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl text-sm font-semibold text-brand-coral-text hover:bg-surface transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span>Clear all filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            <label
              htmlFor="venues-sort"
              className="text-xs font-semibold text-brand-navy whitespace-nowrap"
            >
              Sort by
            </label>
            <select
              id="venues-sort"
              value={filters.sort}
              onChange={(e) =>
                updateFilterPatch({
                  sort: e.target.value as VenueSearchFilters['sort'],
                })
              }
              className="flex-1 sm:flex-initial min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="budget_asc">Budget Range: Low to High</option>
              <option value="budget_desc">Budget Range: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Expandable "More Filters" Panel */}
        {moreFiltersOpen && (
          <div
            id="venues-more-filters-panel"
            className="pt-4 border-t border-brand-navy/10 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Occasion */}
              <div className="space-y-1.5">
                <label
                  htmlFor="venues-filter-occasion"
                  className="block text-xs font-semibold text-brand-navy"
                >
                  Occasion
                </label>
                <select
                  id="venues-filter-occasion"
                  value={filters.occasion}
                  onChange={(e) => updateFilterPatch({ occasion: e.target.value })}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
                >
                  <option value="">Any Occasion</option>
                  {SEED_OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience / Activity */}
              <div className="space-y-1.5">
                <label
                  htmlFor="venues-filter-experience"
                  className="block text-xs font-semibold text-brand-navy"
                >
                  Experience or Activity
                </label>
                <select
                  id="venues-filter-experience"
                  value={filters.experience}
                  onChange={(e) => updateFilterPatch({ experience: e.target.value })}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
                >
                  <option value="">Any Experience</option>
                  {experienceTags.map((tag) => (
                    <option key={tag.id} value={tag.slug}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Venue Setting */}
              <div className="space-y-1.5">
                <label
                  htmlFor="venues-filter-setting"
                  className="block text-xs font-semibold text-brand-navy"
                >
                  Venue Setting
                </label>
                <select
                  id="venues-filter-setting"
                  value={filters.setting}
                  onChange={(e) =>
                    updateFilterPatch({ setting: e.target.value as VenueSetting | '' })
                  }
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
                >
                  <option value="">Any Setting</option>
                  {SETTING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Size */}
              <div className="space-y-1.5">
                <label
                  htmlFor="venues-filter-guests"
                  className="block text-xs font-semibold text-brand-navy"
                >
                  Expected Group Size (Min Capacity)
                </label>
                <input
                  id="venues-filter-guests"
                  type="number"
                  min={1}
                  max={2000}
                  value={typeof filters.guests === 'number' ? filters.guests : ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateFilterPatch({
                      guests: v && Number(v) > 0 ? Number(v) : undefined,
                    });
                  }}
                  placeholder="e.g. 12"
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none tabular-nums"
                />
              </div>

              {/* Booking Type */}
              <div className="space-y-1.5">
                <label
                  htmlFor="venues-filter-booking-type"
                  className="block text-xs font-semibold text-brand-navy"
                >
                  Booking Type
                </label>
                <select
                  id="venues-filter-booking-type"
                  value={filters.bookingType}
                  onChange={(e) =>
                    updateFilterPatch({ bookingType: e.target.value as BookingType | '' })
                  }
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
                >
                  <option value="">Any Booking Type</option>
                  {BOOKING_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-1.5">
                <label
                  htmlFor="venues-filter-rating"
                  className="block text-xs font-semibold text-brand-navy"
                >
                  Minimum Verified Rating
                </label>
                <select
                  id="venues-filter-rating"
                  value={typeof filters.minRating === 'number' ? String(filters.minRating) : ''}
                  onChange={(e) =>
                    updateFilterPatch({
                      minRating: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
                >
                  <option value="">Any Rating</option>
                  <option value="4.0">4.0+ stars</option>
                  <option value="4.5">4.5+ stars</option>
                  <option value="4.8">4.8+ stars</option>
                </select>
              </div>
            </div>

            {/* Preferred Date (strictly pre-fills booking request form, never implies live availability) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-2 border-t border-brand-navy/10">
              <div className="space-y-1.5">
                <label
                  htmlFor="venues-filter-date"
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy"
                >
                  <Calendar className="h-3.5 w-3.5 text-brand-teal" />
                  <span>Preferred Date (Optional Pre-fill)</span>
                </label>
                <input
                  id="venues-filter-date"
                  type="date"
                  value={filters.date}
                  onChange={(e) => updateFilterPatch({ date: e.target.value })}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none tabular-nums"
                />
                <p className="text-xs text-brand-navy/70">
                  Pre-fills your booking request form; does not indicate live venue availability.
                </p>
              </div>
            </div>

            {/* Category-Relevant Facilities (Section 7.1) */}
            <div className="space-y-2.5 pt-2 border-t border-brand-navy/10">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="text-xs font-bold text-brand-navy">
                  Facilities Relevant to {selectedCategoryName}
                </h2>
                <p className="text-xs text-brand-navy/65">
                  Facility options adapt automatically based on the selected category.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {relevantFacilities.map((fac) => {
                  const checked = filters.facilities.includes(fac.slug);
                  return (
                    <label
                      key={fac.id}
                      className={`flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-xl border text-sm cursor-pointer transition-colors ${
                        checked
                          ? 'bg-surface-teal border-brand-teal font-semibold text-brand-navy'
                          : 'bg-surface border-brand-navy/15 text-brand-navy/85 hover:border-brand-teal/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFacility(fac.slug)}
                        className="h-4 w-4 rounded accent-brand-teal shrink-0"
                      />
                      <span className="leading-snug">{fac.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Active Filter Summary & Result Count */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
          <p className="font-semibold text-brand-navy tabular-nums">
            Showing {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'}
            {filters.date ? ` · Booking date pre-fill: ${filters.date}` : ''}
          </p>
          <p className="text-xs text-brand-navy/65">
            All Budget Ranges are indicative guides only.
          </p>
        </div>

        {activeFilterItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
            {activeFilterItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClear}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl bg-surface-teal border border-brand-teal/35 text-xs font-semibold text-brand-navy hover:bg-brand-teal/15 transition-colors cursor-pointer"
              >
                <span>{item.label}</span>
                <X className="h-3.5 w-3.5 text-brand-teal-text shrink-0" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Grid or Helpful Empty State */}
      {filteredVenues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} prefillDate={filters.date} />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] bg-white p-10 sm:p-14 text-center border border-brand-navy/8 shadow-[0_8px_28px_rgba(18,59,96,0.05)] space-y-4">
          <h2 className="text-xl font-bold text-brand-navy">No venues matched those filters</h2>
          <p className="text-sm text-brand-navy/75 max-w-lg mx-auto leading-relaxed">
            Try widening your Budget Range, clearing a facility filter, or tell our concierge team
            what you have in mind on Plan an Event.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
            <BrandButton
              variant="secondary"
              size="sm"
              fullWidthOnMobile
              onClick={clearAllFilters}
            >
              Clear All Filters
            </BrandButton>
            <BrandLinkButton href="/plan-event" variant="alternative" size="sm" fullWidthOnMobile>
              Ask Decompress to Plan an Event
            </BrandLinkButton>
          </div>
          <p className="text-xs text-brand-navy/60 pt-1">
            Or{' '}
            <Link href="/experiences" className="text-brand-teal-text font-semibold underline">
              browse by activity and occasion
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
