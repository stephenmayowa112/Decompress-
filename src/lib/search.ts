import { BookingType, Facility, Venue, VenueSetting } from '@/src/types/domain';

export interface VenueSearchFilters {
  q: string;
  location: string; // matches city, area, or neighbourhood
  category: string; // category slug
  budgetRange: string; // preset key or 'custom'
  budgetMin?: number; // minor units
  budgetMax?: number; // minor units
  occasion: string;
  experience: string; // experience tag slug
  setting: VenueSetting | '';
  guests?: number;
  facilities: string[]; // facility slugs
  bookingType: BookingType | '';
  minRating?: number;
  date: string; // strictly to pre-fill booking form, never implies availability
  sort: 'relevance' | 'budget_asc' | 'budget_desc' | 'rating_desc';
}

export const DEFAULT_VENUE_FILTERS: VenueSearchFilters = {
  q: '',
  location: '',
  category: '',
  budgetRange: '',
  budgetMin: undefined,
  budgetMax: undefined,
  occasion: '',
  experience: '',
  setting: '',
  guests: undefined,
  facilities: [],
  bookingType: '',
  minRating: undefined,
  date: '',
  sort: 'relevance',
};

export interface BudgetRangePreset {
  id: string;
  label: string;
  minMinor?: number;
  maxMinor?: number;
}

/**
 * Indicative Budget Range filter presets (never called "Minimum Spend").
 * Amounts in NGN minor units (kobo).
 */
export const BUDGET_RANGE_PRESETS: BudgetRangePreset[] = [
  { id: 'under_30k', label: 'Up to ₦30,000', minMinor: 0, maxMinor: 3000000 },
  { id: '30k_75k', label: '₦30,000 – ₦75,000', minMinor: 3000000, maxMinor: 7500000 },
  { id: '75k_250k', label: '₦75,000 – ₦250,000', minMinor: 7500000, maxMinor: 25000000 },
  { id: '250k_1m', label: '₦250,000 – ₦1,000,000', minMinor: 25000000, maxMinor: 100000000 },
  { id: 'above_1m', label: '₦1,000,000+ (Full / Large Events)', minMinor: 100000000 },
];

/**
 * Generate character trigrams for fuzzy trigram similarity matching (simulating pg_trgm).
 */
function getTrigrams(input: string): Set<string> {
  const normalized = `  ${input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()}  `;
  const trigrams = new Set<string>();
  if (normalized.length < 3) {
    if (normalized.trim()) trigrams.add(normalized.trim());
    return trigrams;
  }
  for (let i = 0; i <= normalized.length - 3; i++) {
    trigrams.add(normalized.slice(i, i + 3));
  }
  return trigrams;
}

function trigramSimilarity(a: string, b: string): number {
  const triA = getTrigrams(a);
  const triB = getTrigrams(b);
  if (triA.size === 0 || triB.size === 0) return 0;
  let intersection = 0;
  for (const t of triA) {
    if (triB.has(t)) intersection++;
  }
  const union = triA.size + triB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Computes a weighted full-text + trigram similarity score for a venue against a query.
 * Weights mirror PostgreSQL weighted tsvector (A: name, B: experience tags & categories,
 * C: location/facilities/occasions/setting, D: description) combined with trigram similarity
 * so searches like "salsa" or "salza" return venues offering salsa.
 */
export function scoreVenueQuery(venue: Venue, rawQuery: string): number {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return 1;

  const tokens = query
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9-]/g, ''))
    .filter((t) => t.length >= 2);

  if (tokens.length === 0) return 1;

  const nameLower = venue.name.toLowerCase();
  const experiencesText = venue.experienceTags.map((t) => t.replace(/-/g, ' ')).join(' ').toLowerCase();
  const categoriesText = venue.categorySlugs.map((c) => c.replace(/-/g, ' ')).join(' ').toLowerCase();
  const locationAndFacilitiesText = [
    venue.city,
    venue.area,
    venue.neighbourhood,
    venue.setting,
    ...venue.facilitySlugs.map((f) => f.replace(/-/g, ' ')),
    ...venue.occasions,
  ]
    .join(' ')
    .toLowerCase();
  const descriptionLower = venue.description.toLowerCase();

  let totalScore = 0;

  // Whole-phrase bonus
  if (nameLower.includes(query)) totalScore += 18;
  if (experiencesText.includes(query)) totalScore += 15;
  if (categoriesText.includes(query)) totalScore += 10;
  if (locationAndFacilitiesText.includes(query)) totalScore += 8;
  if (descriptionLower.includes(query)) totalScore += 5;

  // Token-level weighted FTS + trigram similarity
  const candidateWords = Array.from(
    new Set(
      [
        ...nameLower.split(/\s+/),
        ...experiencesText.split(/\s+/),
        ...categoriesText.split(/\s+/),
        ...locationAndFacilitiesText.split(/\s+/),
      ].filter((w) => w.length >= 3)
    )
  );

  for (const token of tokens) {
    let tokenMatched = false;

    if (nameLower.includes(token)) {
      totalScore += 10;
      tokenMatched = true;
    }
    if (experiencesText.includes(token)) {
      totalScore += 9;
      tokenMatched = true;
    }
    if (categoriesText.includes(token)) {
      totalScore += 6;
      tokenMatched = true;
    }
    if (locationAndFacilitiesText.includes(token)) {
      totalScore += 5;
      tokenMatched = true;
    }
    if (descriptionLower.includes(token)) {
      totalScore += 3;
      tokenMatched = true;
    }

    // Trigram fallback for fuzzy / typo matching (e.g. "salza" -> "salsa")
    if (!tokenMatched && token.length >= 3) {
      let bestSim = 0;
      for (const word of candidateWords) {
        const sim = trigramSimilarity(token, word);
        if (sim > bestSim) bestSim = sim;
      }
      if (bestSim >= 0.32) {
        totalScore += bestSim * 7;
      }
    }
  }

  return totalScore;
}

/**
 * Returns facilities relevant to the currently selected category (Section 7.1).
 * When no category is selected, returns all facilities.
 */
export function getRelevantFacilities(
  allFacilities: Facility[],
  selectedCategorySlug: string
): Facility[] {
  if (!selectedCategorySlug) return allFacilities;
  return allFacilities.filter((f) => f.applicableCategorySlugs.includes(selectedCategorySlug));
}

/**
 * Filter and sort venues using all primary & More Filters criteria.
 */
export function filterAndSortVenues(
  venues: Venue[],
  filters: VenueSearchFilters
): Venue[] {
  const scored: { venue: Venue; score: number }[] = [];

  // Resolve effective Budget Range bounds (indicative overlap matching)
  let effectiveMin = filters.budgetMin;
  let effectiveMax = filters.budgetMax;
  if (filters.budgetRange && filters.budgetRange !== 'custom') {
    const preset = BUDGET_RANGE_PRESETS.find((p) => p.id === filters.budgetRange);
    if (preset) {
      effectiveMin = preset.minMinor;
      effectiveMax = preset.maxMinor;
    }
  }

  for (const venue of venues) {
    if (!venue.isPublished) continue;

    // 1. Weighted Full-Text + Trigram Search
    const score = scoreVenueQuery(venue, filters.q);
    if (filters.q.trim() && score <= 0) continue;

    // 2. Location (city, area, or neighbourhood)
    if (filters.location) {
      const locQuery = filters.location.toLowerCase();
      const locMatch =
        venue.area.toLowerCase() === locQuery ||
        venue.city.toLowerCase() === locQuery ||
        venue.neighbourhood.toLowerCase().includes(locQuery) ||
        venue.locationId === filters.location;
      if (!locMatch) continue;
    }

    // 3. Category (multi-category supported)
    if (filters.category && !venue.categorySlugs.includes(filters.category)) {
      continue;
    }

    // 4. Indicative Budget Range overlap (does not block spending, helps match range)
    if (typeof effectiveMin === 'number' && venue.budgetMaxMinor < effectiveMin) {
      continue;
    }
    if (typeof effectiveMax === 'number' && venue.budgetMinMinor > effectiveMax) {
      continue;
    }

    // 5. Occasion
    if (
      filters.occasion &&
      !venue.occasions.some((o) => o.toLowerCase() === filters.occasion.toLowerCase())
    ) {
      continue;
    }

    // 6. Experience Tag
    if (filters.experience && !venue.experienceTags.includes(filters.experience)) {
      continue;
    }

    // 7. Venue Setting
    if (filters.setting && venue.setting !== filters.setting) {
      continue;
    }

    // 8. Group size / capacity
    if (typeof filters.guests === 'number' && filters.guests > 0 && venue.capacity < filters.guests) {
      continue;
    }

    // 9. Facilities (all selected facilities must be present)
    if (filters.facilities.length > 0) {
      const hasAll = filters.facilities.every((fac) => venue.facilitySlugs.includes(fac));
      if (!hasAll) continue;
    }

    // 10. Booking Type
    if (filters.bookingType && !venue.bookingTypes.includes(filters.bookingType)) {
      continue;
    }

    // 11. Minimum Rating
    if (typeof filters.minRating === 'number' && venue.ratingAverage < filters.minRating) {
      continue;
    }

    scored.push({ venue, score });
  }

  scored.sort((a, b) => {
    if (filters.sort === 'budget_asc') {
      return a.venue.budgetMinMinor - b.venue.budgetMinMinor;
    }
    if (filters.sort === 'budget_desc') {
      return b.venue.budgetMaxMinor - a.venue.budgetMaxMinor;
    }
    if (filters.sort === 'rating_desc') {
      return b.venue.ratingAverage - a.venue.ratingAverage || b.venue.reviewCount - a.venue.reviewCount;
    }
    // Default: relevance (score desc, then featured, then rating)
    if (b.score !== a.score) return b.score - a.score;
    if (a.venue.isFeatured !== b.venue.isFeatured) return a.venue.isFeatured ? -1 : 1;
    return b.venue.ratingAverage - a.venue.ratingAverage;
  });

  return scored.map((item) => item.venue);
}

/**
 * Parse URL query string into VenueSearchFilters so filter state is shareable via URL.
 */
export function parseFiltersFromSearchParams(
  params: Pick<URLSearchParams, 'get'>
): VenueSearchFilters {
  const q = params.get('q') || '';
  const location = params.get('location') || '';
  const category = params.get('category') || '';
  const budgetRange = params.get('budgetRange') || '';
  const budgetMinRaw = params.get('budgetMin');
  const budgetMaxRaw = params.get('budgetMax');
  const occasion = params.get('occasion') || '';
  const experience = params.get('experience') || '';
  const settingRaw = params.get('setting') || '';
  const guestsRaw = params.get('guests');
  const facilitiesRaw = params.get('facilities') || '';
  const bookingTypeRaw = params.get('bookingType') || '';
  const minRatingRaw = params.get('minRating');
  const date = params.get('date') || '';
  const sortRaw = params.get('sort') || 'relevance';

  const setting: VenueSetting | '' =
    settingRaw === 'indoor' ||
    settingRaw === 'outdoor' ||
    settingRaw === 'rooftop' ||
    settingRaw === 'beachfront'
      ? settingRaw
      : '';

  const bookingType: BookingType | '' =
    bookingTypeRaw === 'table' ||
    bookingTypeRaw === 'group' ||
    bookingTypeRaw === 'private_hire'
      ? bookingTypeRaw
      : '';

  const sort: VenueSearchFilters['sort'] =
    sortRaw === 'budget_asc' ||
    sortRaw === 'budget_desc' ||
    sortRaw === 'rating_desc'
      ? sortRaw
      : 'relevance';

  return {
    q,
    location,
    category,
    budgetRange,
    budgetMin: budgetMinRaw && !Number.isNaN(Number(budgetMinRaw)) ? Number(budgetMinRaw) : undefined,
    budgetMax: budgetMaxRaw && !Number.isNaN(Number(budgetMaxRaw)) ? Number(budgetMaxRaw) : undefined,
    occasion,
    experience,
    setting,
    guests: guestsRaw && !Number.isNaN(Number(guestsRaw)) ? Number(guestsRaw) : undefined,
    facilities: facilitiesRaw ? facilitiesRaw.split(',').filter(Boolean) : [],
    bookingType,
    minRating:
      minRatingRaw && !Number.isNaN(Number(minRatingRaw)) ? Number(minRatingRaw) : undefined,
    date,
    sort,
  };
}

/**
 * Serialize VenueSearchFilters to clean URL query string (omitting empty defaults).
 */
export function serializeFiltersToQueryString(filters: VenueSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.location) params.set('location', filters.location);
  if (filters.category) params.set('category', filters.category);
  if (filters.budgetRange) params.set('budgetRange', filters.budgetRange);
  if (typeof filters.budgetMin === 'number') params.set('budgetMin', String(filters.budgetMin));
  if (typeof filters.budgetMax === 'number') params.set('budgetMax', String(filters.budgetMax));
  if (filters.occasion) params.set('occasion', filters.occasion);
  if (filters.experience) params.set('experience', filters.experience);
  if (filters.setting) params.set('setting', filters.setting);
  if (typeof filters.guests === 'number' && filters.guests > 0) {
    params.set('guests', String(filters.guests));
  }
  if (filters.facilities.length > 0) params.set('facilities', filters.facilities.join(','));
  if (filters.bookingType) params.set('bookingType', filters.bookingType);
  if (typeof filters.minRating === 'number' && filters.minRating > 0) {
    params.set('minRating', String(filters.minRating));
  }
  if (filters.date) params.set('date', filters.date);
  if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort);
  return params.toString();
}
