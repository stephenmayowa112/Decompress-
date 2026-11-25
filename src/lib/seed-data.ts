import {
  AddOn,
  Category,
  ExperienceTag,
  Facility,
  FAQItem,
  FAQTopic,
  Location,
  SiteSettings,
  Venue,
} from '@/src/types/domain';

/**
 * Generates an inline SVG data URI illustration in Decompress brand colours
 * so venue cards and galleries render with zero external URL dependencies.
 */
function createVenueSvgDataUri(
  title: string,
  subtitle: string,
  accentHex: string,
  secondaryHex: string
): string {
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSubtitle = subtitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#123B60" />
        <stop offset="60%" stop-color="${secondaryHex}" />
        <stop offset="100%" stop-color="${accentHex}" />
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#bg)" />
    <circle cx="680" cy="110" r="140" fill="#FFC857" fill-opacity="0.16" />
    <circle cx="140" cy="420" r="190" fill="#13A6A3" fill-opacity="0.22" />
    <rect x="48" y="310" width="704" height="142" rx="20" fill="#123B60" fill-opacity="0.76" />
    <text x="76" y="368" fill="#FFFFFF" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="30" font-weight="700">${safeTitle}</text>
    <text x="76" y="408" fill="#E7F5F3" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="18" font-weight="500">${safeSubtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// TODO(founder): Confirm final support contacts, operating hours, guest payment mode, wallet flag, currency & timezone
export const SEED_SITE_SETTINGS: SiteSettings = {
  supportEmail: 'support@decompress.ng', // TODO(founder): placeholder customer-care email
  supportPhone: '+234 800 332 6677', // TODO(founder): placeholder customer-care phone
  supportHours: 'Monday – Saturday, 9:00 AM – 8:00 PM WAT', // TODO(founder): placeholder operating hours
  guestPaymentMode: 'guest_checkout', // TODO(founder): 'guest_checkout' | 'wallet_only'
  walletEnabled: true, // TODO(founder): feature flag for account wallet
  defaultCurrency: 'NGN', // TODO(founder): configurable currency code
  defaultTimezone: 'Africa/Lagos', // TODO(founder): configurable display timezone
  internalResponseTargetMinutes: 30, // TODO(founder): internal ops target only; NEVER shown in public UI
};

export const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat_restaurants_dining',
    name: 'Restaurants & Dining',
    slug: 'restaurants-dining',
    description:
      'Fine dining, casual eateries, Nigerian and international cuisine, rooftop restaurants and curated buffets.',
    iconName: 'Utensils',
    order: 1,
  },
  {
    id: 'cat_nightlife',
    name: 'Nightlife',
    slug: 'nightlife',
    description: 'Clubs, cocktail lounges, late-night bars, beach clubs and skyline rooftop bars.',
    iconName: 'GlassWater',
    order: 2,
  },
  {
    id: 'cat_music_entertainment',
    name: 'Music & Entertainment',
    slug: 'music-entertainment',
    description: 'Karaoke studios, live bands, salsa and dance nights, live performances and comedy clubs.',
    iconName: 'Music',
    order: 3,
  },
  {
    id: 'cat_hotels_resorts',
    name: 'Hotels & Resorts',
    slug: 'hotels-resorts',
    description:
      'Hotels and beach resorts offering signature dining, day-pass leisure, poolside cabanas or event facilities.',
    iconName: 'Palmtree',
    order: 4,
  },
  {
    id: 'cat_event_venues',
    name: 'Event Venues',
    slug: 'event-venues',
    description:
      'Event centres, wedding and reception halls, corporate conference spaces, private-party and outdoor garden venues.',
    iconName: 'CalendarHeart',
    order: 5,
  },
  {
    id: 'cat_games_recreation',
    name: 'Games & Recreation',
    slug: 'games-recreation',
    description: 'Bowling alleys, paintball arenas, go-karting tracks, arcades, escape rooms and group play.',
    iconName: 'Gamepad2',
    order: 6,
  },
  {
    id: 'cat_relaxation_experiences',
    name: 'Relaxation & Experiences',
    slug: 'relaxation-experiences',
    description: 'Day spas, wellness retreats, thermal pools, private lounges and restorative leisure experiences.',
    iconName: 'Sparkles',
    order: 7,
  },
];

export const SEED_OCCASIONS: string[] = [
  'Date night',
  'Birthday celebration',
  "Friends' hangout",
  'Family outing',
  'Corporate hangout and team bonding',
  'Team dinner',
  'Company outing',
  'Office celebration',
  'End-of-year event',
  'Private event',
  'Wedding celebration',
  'Other special occasion',
];

// TODO(founder): Confirm pilot launch geography (seeded with Lagos areas)
export const SEED_LOCATIONS: Location[] = [
  {
    id: 'loc_vi_adeola_odeku',
    city: 'Lagos',
    area: 'Victoria Island',
    neighbourhood: 'Adeola Odeku & Saka Tinubu',
  },
  {
    id: 'loc_vi_oniru',
    city: 'Lagos',
    area: 'Victoria Island',
    neighbourhood: 'Oniru Waterfront',
  },
  {
    id: 'loc_ikoyi_old',
    city: 'Lagos',
    area: 'Ikoyi',
    neighbourhood: 'Old Ikoyi & Alexander Road',
  },
  {
    id: 'loc_ikoyi_banana',
    city: 'Lagos',
    area: 'Ikoyi',
    neighbourhood: 'Banana Island Foreshore',
  },
  {
    id: 'loc_lekki_phase1',
    city: 'Lagos',
    area: 'Lekki',
    neighbourhood: 'Lekki Phase 1 (Admiralty Way)',
  },
  {
    id: 'loc_ilage_beach',
    city: 'Lagos',
    area: 'Ilashe & Tarkwa Bay',
    neighbourhood: 'Lagos Lagoon & Beach Coast',
  },
  {
    id: 'loc_ikeja_gra',
    city: 'Lagos',
    area: 'Ikeja',
    neighbourhood: 'Ikeja GRA & Isaac John',
  },
  {
    id: 'loc_yaba_tech',
    city: 'Lagos',
    area: 'Yaba',
    neighbourhood: 'Sabo & Herbert Macaulay Corridor',
  },
];

/**
 * Facilities linked strictly to the categories they apply to (Section 7.1).
 * For example, 'pool' applies to Hotels & Resorts, Relaxation & Experiences, and Nightlife (beach clubs),
 * and does NOT apply to Music & Entertainment (Karaoke).
 */
export const SEED_FACILITIES: Facility[] = [
  {
    id: 'fac_pool',
    name: 'Swimming Pool & Cabanas',
    slug: 'pool',
    applicableCategorySlugs: ['hotels-resorts', 'relaxation-experiences', 'nightlife'],
  },
  {
    id: 'fac_parking',
    name: 'Secure Valet & On-Site Parking',
    slug: 'parking',
    applicableCategorySlugs: [
      'restaurants-dining',
      'nightlife',
      'music-entertainment',
      'hotels-resorts',
      'event-venues',
      'games-recreation',
      'relaxation-experiences',
    ],
  },
  {
    id: 'fac_private_room',
    name: 'Private Dining / VIP Room',
    slug: 'private-room',
    applicableCategorySlugs: [
      'restaurants-dining',
      'nightlife',
      'music-entertainment',
      'hotels-resorts',
      'event-venues',
      'relaxation-experiences',
    ],
  },
  {
    id: 'fac_wifi',
    name: 'High-Speed Wi-Fi',
    slug: 'wi-fi',
    applicableCategorySlugs: [
      'restaurants-dining',
      'hotels-resorts',
      'event-venues',
      'games-recreation',
      'relaxation-experiences',
    ],
  },
  {
    id: 'fac_live_music',
    name: 'Live Music & Band Stage',
    slug: 'live-music',
    applicableCategorySlugs: ['restaurants-dining', 'nightlife', 'music-entertainment', 'event-venues'],
  },
  {
    id: 'fac_karaoke_booths',
    name: 'Soundproof Karaoke Booths',
    slug: 'karaoke-booths',
    applicableCategorySlugs: ['music-entertainment', 'nightlife', 'games-recreation'],
  },
  {
    id: 'fac_dance_floor',
    name: 'Dedicated Dance Floor',
    slug: 'dance-floor',
    applicableCategorySlugs: ['nightlife', 'music-entertainment', 'event-venues', 'restaurants-dining'],
  },
  {
    id: 'fac_av_projector',
    name: 'AV, Stage Lighting & Projector',
    slug: 'av-projector',
    applicableCategorySlugs: ['event-venues', 'hotels-resorts', 'music-entertainment'],
  },
  {
    id: 'fac_spa_thermal',
    name: 'Spa, Sauna & Steam Suite',
    slug: 'spa-suite',
    applicableCategorySlugs: ['relaxation-experiences', 'hotels-resorts'],
  },
  {
    id: 'fac_arcade_lanes',
    name: 'Bowling Lanes & Arcade Arena',
    slug: 'arcade-lanes',
    applicableCategorySlugs: ['games-recreation'],
  },
];

export const SEED_EXPERIENCE_TAGS: ExperienceTag[] = [
  {
    id: 'tag_salsa',
    name: 'Salsa & Latin Dance',
    slug: 'salsa',
    categorySlugs: ['music-entertainment', 'restaurants-dining', 'nightlife'],
  },
  {
    id: 'tag_karaoke',
    name: 'Karaoke Nights',
    slug: 'karaoke',
    categorySlugs: ['music-entertainment', 'nightlife', 'games-recreation'],
  },
  {
    id: 'tag_live_band',
    name: 'Live Band & Afrobeats Acoustic',
    slug: 'live-band',
    categorySlugs: ['music-entertainment', 'restaurants-dining', 'nightlife'],
  },
  {
    id: 'tag_fine_dining',
    name: 'Fine Dining & Tasting Menu',
    slug: 'fine-dining',
    categorySlugs: ['restaurants-dining', 'hotels-resorts'],
  },
  {
    id: 'tag_rooftop_cocktails',
    name: 'Rooftop Cocktails & Tapas',
    slug: 'rooftop-cocktails',
    categorySlugs: ['nightlife', 'restaurants-dining'],
  },
  {
    id: 'tag_beach_club',
    name: 'Beach Club & Day Cabanas',
    slug: 'beach-club',
    categorySlugs: ['nightlife', 'hotels-resorts', 'relaxation-experiences'],
  },
  {
    id: 'tag_bowling',
    name: 'Ten-Pin Bowling & Arcade',
    slug: 'bowling',
    categorySlugs: ['games-recreation'],
  },
  {
    id: 'tag_paintball',
    name: 'Paintball & Tactical Tag',
    slug: 'paintball',
    categorySlugs: ['games-recreation'],
  },
  {
    id: 'tag_go_karting',
    name: 'Go-Karting Circuit',
    slug: 'go-karting',
    categorySlugs: ['games-recreation'],
  },
  {
    id: 'tag_escape_room',
    name: 'Immersive Escape Rooms',
    slug: 'escape-room',
    categorySlugs: ['games-recreation'],
  },
  {
    id: 'tag_day_spa',
    name: 'Day Spa, Hammam & Massage',
    slug: 'day-spa',
    categorySlugs: ['relaxation-experiences', 'hotels-resorts'],
  },
  {
    id: 'tag_comedy',
    name: 'Stand-Up Comedy & Open Mic',
    slug: 'comedy',
    categorySlugs: ['music-entertainment', 'nightlife'],
  },
  {
    id: 'tag_wedding_reception',
    name: 'Wedding & Grand Reception',
    slug: 'wedding-reception',
    categorySlugs: ['event-venues', 'hotels-resorts'],
  },
  {
    id: 'tag_corporate_retreat',
    name: 'Corporate Offsite & Team Bonding',
    slug: 'corporate-retreat',
    categorySlugs: ['event-venues', 'hotels-resorts', 'games-recreation'],
  },
];

/**
 * 18 Clearly Fictional Sample Venues across all 7 categories in Lagos (Section 12).
 * Prices are stored in NGN integer minor units (kobo: 1 NGN = 100 kobo).
 */
export const SEED_VENUES: Venue[] = [
  {
    id: 'ven_casa_marina_salsa',
    name: 'Casa Marina Kitchen & Salsa Social (Fictional Sample)',
    slug: 'casa-marina-kitchen-salsa-social',
    description:
      'A lively open-air tapas restaurant and Latin dance social house in Victoria Island. Guests enjoy wood-fired seafood, craft sangria, and guided Thursday-to-Sunday salsa, bachata, and live percussion nights.',
    address: '14B Adeola Odeku Street, Victoria Island, Lagos (Fictional)',
    locationId: 'loc_vi_adeola_odeku',
    city: 'Lagos',
    area: 'Victoria Island',
    neighbourhood: 'Adeola Odeku & Saka Tinubu',
    setting: 'outdoor',
    capacity: 140,
    openingHours: 'Tue – Sun: 5:00 PM – 1:00 AM',
    budgetMinMinor: 2500000, // NGN 25,000
    budgetMaxMinor: 6500000, // NGN 65,000
    currency: 'NGN',
    budgetBasis: 'per_person',
    categorySlugs: ['restaurants-dining', 'music-entertainment', 'nightlife'],
    experienceTags: ['salsa', 'live-band', 'rooftop-cocktails'],
    facilitySlugs: ['parking', 'live-music', 'dance-floor', 'private-room'],
    occasions: ['Date night', 'Birthday celebration', "Friends' hangout", 'Corporate hangout and team bonding'],
    bookingTypes: ['table', 'group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'Casa Marina Kitchen & Salsa Social',
      'Victoria Island · Salsa, Tapas & Live Percussion',
      '#FF704F',
      '#13A6A3'
    ),
    galleryImages: [
      createVenueSvgDataUri('Casa Marina Courtyard', 'Open-Air Salsa Dance Floor', '#FF704F', '#123B60'),
      createVenueSvgDataUri('Casa Marina Private Mezzanine', 'Group Dining & Sangria Bar', '#13A6A3', '#123B60'),
    ],
    confirmedOfferText: 'Complimentary 30-minute salsa intro session for group bookings of 8+ guests on Thursdays.',
    ratingAverage: 4.9,
    reviewCount: 24,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'ven_zobo_ember_grill',
    name: 'Zobo & Ember Contemporary Grill (Fictional Sample)',
    slug: 'zobo-and-ember-contemporary-grill',
    description:
      'Modern Nigerian fire-pit cuisine and tasting rooms in Old Ikoyi. Specialises in aged suya ribs, smoked lagoon snapper, and intimate chef-table dinners for date nights and executive team dinners.',
    address: '22 Alexander Road, Old Ikoyi, Lagos (Fictional)',
    locationId: 'loc_ikoyi_old',
    city: 'Lagos',
    area: 'Ikoyi',
    neighbourhood: 'Old Ikoyi & Alexander Road',
    setting: 'indoor',
    capacity: 90,
    openingHours: 'Mon – Sun: 12:00 PM – 11:30 PM',
    budgetMinMinor: 4500000, // NGN 45,000
    budgetMaxMinor: 11000000, // NGN 110,000
    currency: 'NGN',
    budgetBasis: 'per_person',
    categorySlugs: ['restaurants-dining'],
    experienceTags: ['fine-dining'],
    facilitySlugs: ['parking', 'private-room', 'wi-fi'],
    occasions: ['Date night', 'Team dinner', 'Birthday celebration', 'Private event'],
    bookingTypes: ['table', 'group'],
    heroImageUrl: createVenueSvgDataUri(
      'Zobo & Ember Contemporary Grill',
      'Old Ikoyi · Modern Nigerian Fire-Pit Fine Dining',
      '#123B60',
      '#FF704F'
    ),
    galleryImages: [
      createVenueSvgDataUri('Zobo & Ember Chef Table', '14-Seat Private Dining Vault', '#123B60', '#13A6A3'),
    ],
    confirmedOfferText: 'Confirmed Decompress Welcome Mocktail Pairing for confirmed table reservations.',
    ratingAverage: 4.8,
    reviewCount: 31,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'ven_lagoon_breeze_bistro',
    name: 'Lagoon Breeze Terrace & Buffet (Fictional Sample)',
    slug: 'lagoon-breeze-terrace-and-buffet',
    description:
      'Breezy waterfront restaurant along Admiralty Way in Lekki Phase 1 offering weekend family buffets, wood-oven flatbreads, and relaxed outdoor seating overlooking the creek.',
    address: '88 Admiralty Way, Lekki Phase 1, Lagos (Fictional)',
    locationId: 'loc_lekki_phase1',
    city: 'Lagos',
    area: 'Lekki',
    neighbourhood: 'Lekki Phase 1 (Admiralty Way)',
    setting: 'outdoor',
    capacity: 180,
    openingHours: 'Daily: 10:00 AM – 10:30 PM',
    budgetMinMinor: 1800000, // NGN 18,000
    budgetMaxMinor: 4000000, // NGN 40,000
    currency: 'NGN',
    budgetBasis: 'per_person',
    categorySlugs: ['restaurants-dining'],
    experienceTags: ['live-band'],
    facilitySlugs: ['parking', 'wi-fi', 'live-music'],
    occasions: ['Family outing', 'Birthday celebration', "Friends' hangout", 'Office celebration'],
    bookingTypes: ['table', 'group'],
    heroImageUrl: createVenueSvgDataUri(
      'Lagoon Breeze Terrace & Buffet',
      'Lekki Phase 1 · Waterfront Family & Group Dining',
      '#13A6A3',
      '#123B60'
    ),
    galleryImages: [],
    ratingAverage: 4.6,
    reviewCount: 19,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'ven_skyline_mirage_rooftop',
    name: 'Skyline Mirage Rooftop Lounge (Fictional Sample)',
    slug: 'skyline-mirage-rooftop-lounge',
    description:
      '12th-floor panoramic cocktail lounge in Oniru with sunset DJ sets, signature botanical cocktails, and reserved terrace booths for birthday celebrations and after-work hangouts.',
    address: 'Plot 9 Water Corporation Drive, Oniru, Victoria Island, Lagos (Fictional)',
    locationId: 'loc_vi_oniru',
    city: 'Lagos',
    area: 'Victoria Island',
    neighbourhood: 'Oniru Waterfront',
    setting: 'rooftop',
    capacity: 220,
    openingHours: 'Wed – Sun: 4:00 PM – 3:00 AM',
    budgetMinMinor: 15000000, // NGN 150,000
    budgetMaxMinor: 45000000, // NGN 450,000
    currency: 'NGN',
    budgetBasis: 'per_table',
    categorySlugs: ['nightlife', 'restaurants-dining'],
    experienceTags: ['rooftop-cocktails', 'salsa'],
    facilitySlugs: ['parking', 'private-room', 'dance-floor', 'live-music'],
    occasions: ['Birthday celebration', "Friends' hangout", 'Date night', 'Office celebration'],
    bookingTypes: ['table', 'group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'Skyline Mirage Rooftop Lounge',
      'Oniru Waterfront · 12th-Floor Sunset Lounge & DJ Sets',
      '#123B60',
      '#13A6A3'
    ),
    galleryImages: [
      createVenueSvgDataUri('Skyline Mirage Sunset Deck', 'Panoramic Atlantic View Booths', '#FF704F', '#123B60'),
    ],
    confirmedOfferText: 'Priority terrace seating for Decompress group bookings before 8:00 PM.',
    ratingAverage: 4.7,
    reviewCount: 28,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'ven_velvet_echo_karaoke',
    name: 'Velvet Echo Karaoke & Vinyl Club (Fictional Sample)',
    slug: 'velvet-echo-karaoke-and-vinyl-club',
    description:
      'Boutique karaoke studio and late-night lounge in Lekki Phase 1 featuring 8 private soundproof suites, wireless studio microphones, curated Afrobeats/90s R&B catalogues, and table-side sliders.',
    address: '31 Fola Osibo Street, Lekki Phase 1, Lagos (Fictional)',
    locationId: 'loc_lekki_phase1',
    city: 'Lagos',
    area: 'Lekki',
    neighbourhood: 'Lekki Phase 1 (Admiralty Way)',
    setting: 'indoor',
    capacity: 120,
    openingHours: 'Tue – Sun: 4:00 PM – 2:00 AM',
    budgetMinMinor: 8000000, // NGN 80,000
    budgetMaxMinor: 25000000, // NGN 250,000
    currency: 'NGN',
    budgetBasis: 'per_table',
    categorySlugs: ['music-entertainment', 'nightlife', 'games-recreation'],
    experienceTags: ['karaoke', 'comedy'],
    facilitySlugs: ['parking', 'private-room', 'karaoke-booths'],
    occasions: ['Birthday celebration', "Friends' hangout", 'Corporate hangout and team bonding', 'Office celebration'],
    bookingTypes: ['table', 'group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'Velvet Echo Karaoke & Vinyl Club',
      'Lekki Phase 1 · Private Soundproof Karaoke Suites',
      '#FF704F',
      '#123B60'
    ),
    galleryImages: [
      createVenueSvgDataUri('Velvet Echo VIP Suite 1', '18-Guest Private Karaoke Room', '#13A6A3', '#123B60'),
    ],
    confirmedOfferText: '1 extra complimentary studio hour on weekday private booth bookings.',
    ratingAverage: 4.9,
    reviewCount: 36,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'ven_indigo_note_jazz_hall',
    name: 'The Indigo Note Live Band & Jazz Hall (Fictional Sample)',
    slug: 'the-indigo-note-live-band-and-jazz-hall',
    description:
      'Intimate acoustic concert supper club in Ikeja GRA showcasing live Highlife, Afrobeats brass ensembles, Friday salsa socials, and Sunday stand-up comedy nights.',
    address: '45 Isaac John Street, Ikeja GRA, Lagos (Fictional)',
    locationId: 'loc_ikeja_gra',
    city: 'Lagos',
    area: 'Ikeja',
    neighbourhood: 'Ikeja GRA & Isaac John',
    setting: 'indoor',
    capacity: 160,
    openingHours: 'Wed – Sun: 6:00 PM – 1:00 AM',
    budgetMinMinor: 2000000, // NGN 20,000
    budgetMaxMinor: 5000000, // NGN 50,000
    currency: 'NGN',
    budgetBasis: 'per_person',
    categorySlugs: ['music-entertainment', 'restaurants-dining'],
    experienceTags: ['live-band', 'salsa', 'comedy'],
    facilitySlugs: ['parking', 'live-music', 'dance-floor', 'av-projector'],
    occasions: ['Date night', 'Birthday celebration', 'Team dinner', "Friends' hangout"],
    bookingTypes: ['table', 'group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'The Indigo Note Live Band & Jazz Hall',
      'Ikeja GRA · Highlife, Salsa & Live Comedy Supper Club',
      '#123B60',
      '#13A6A3'
    ),
    galleryImages: [],
    ratingAverage: 4.8,
    reviewCount: 22,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'ven_solstice_beach_club',
    name: 'Solstice Cabana & Beach Club (Fictional Sample)',
    slug: 'solstice-cabana-and-beach-club',
    description:
      'Oceanfront beach club and infinity pool retreat along the Ilashe coast. Features shaded daybeds, beachfront grills, acoustic sunset sessions, and full-venue private party charters.',
    address: 'Plot 4 Lighthouse Creek, Ilashe Beach Coast, Lagos (Fictional)',
    locationId: 'loc_ilage_beach',
    city: 'Lagos',
    area: 'Ilashe & Tarkwa Bay',
    neighbourhood: 'Lagos Lagoon & Beach Coast',
    setting: 'beachfront',
    capacity: 250,
    openingHours: 'Thu – Sun: 10:00 AM – 10:00 PM',
    budgetMinMinor: 12000000, // NGN 120,000
    budgetMaxMinor: 38000000, // NGN 380,000
    currency: 'NGN',
    budgetBasis: 'per_table',
    categorySlugs: ['nightlife', 'hotels-resorts', 'relaxation-experiences'],
    experienceTags: ['beach-club', 'live-band'],
    facilitySlugs: ['pool', 'private-room', 'live-music', 'dance-floor'],
    occasions: ['Birthday celebration', "Friends' hangout", 'Company outing', 'Private event'],
    bookingTypes: ['table', 'group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'Solstice Cabana & Beach Club',
      'Ilashe Coast · Beachfront Cabanas & Infinity Pool',
      '#13A6A3',
      '#FF704F'
    ),
    galleryImages: [],
    ratingAverage: 4.8,
    reviewCount: 27,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'ven_azure_palm_resort',
    name: 'Azure Palm Boutique Hotel & Leisure Resort (Fictional Sample)',
    slug: 'azure-palm-boutique-hotel-and-leisure-resort',
    description:
      'Curated luxury hotel and lagoon resort in Banana Island Foreshore offering poolside weekend brunch experiences, executive retreat boardrooms, thermal spa day passes, and garden courtyard dining.',
    address: '7 Foreshore Boulevard, Banana Island, Ikoyi, Lagos (Fictional)',
    locationId: 'loc_ikoyi_banana',
    city: 'Lagos',
    area: 'Ikoyi',
    neighbourhood: 'Banana Island Foreshore',
    setting: 'outdoor',
    capacity: 300,
    openingHours: 'Daily: 8:00 AM – 11:00 PM (Experience & Day Bookings)',
    budgetMinMinor: 5500000, // NGN 55,000
    budgetMaxMinor: 14000000, // NGN 140,000
    currency: 'NGN',
    budgetBasis: 'per_person',
    categorySlugs: ['hotels-resorts', 'restaurants-dining', 'relaxation-experiences', 'event-venues'],
    experienceTags: ['fine-dining', 'day-spa', 'corporate-retreat', 'beach-club'],
    facilitySlugs: ['pool', 'parking', 'private-room', 'wi-fi', 'spa-suite', 'av-projector'],
    occasions: [
      'Date night',
      'Family outing',
      'Corporate hangout and team bonding',
      'Company outing',
      'Wedding celebration',
    ],
    bookingTypes: ['table', 'group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'Azure Palm Boutique Hotel & Leisure Resort',
      'Banana Island · Lagoon Pool Brunch, Spa & Retreats',
      '#13A6A3',
      '#123B60'
    ),
    galleryImages: [
      createVenueSvgDataUri('Azure Palm Lagoon Deck', 'Cabanas & Sunday Brunch Lawn', '#13A6A3', '#123B60'),
    ],
    confirmedOfferText: 'Includes complimentary poolside towel & welcome sorbet on day-experience bookings.',
    ratingAverage: 4.9,
    reviewCount: 41,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'ven_kora_courtyard_hotel',
    name: 'Kora Courtyard Hotel & Rooftop Pavilion (Fictional Sample)',
    slug: 'kora-courtyard-hotel-and-rooftop-pavilion',
    description:
      'Design-forward hospitality space in Victoria Island combining a rooftop dining conservatory, heated lap pool, and modular event salons for corporate offsites and milestone dinners.',
    address: '19 Saka Tinubu Street, Victoria Island, Lagos (Fictional)',
    locationId: 'loc_vi_adeola_odeku',
    city: 'Lagos',
    area: 'Victoria Island',
    neighbourhood: 'Adeola Odeku & Saka Tinubu',
    setting: 'rooftop',
    capacity: 200,
    openingHours: 'Daily: 9:00 AM – 11:30 PM',
    budgetMinMinor: 3500000, // NGN 35,000
    budgetMaxMinor: 8500000, // NGN 85,000
    currency: 'NGN',
    budgetBasis: 'per_person',
    categorySlugs: ['hotels-resorts', 'event-venues', 'restaurants-dining'],
    experienceTags: ['rooftop-cocktails', 'corporate-retreat', 'fine-dining'],
    facilitySlugs: ['pool', 'parking', 'private-room', 'wi-fi', 'av-projector'],
    occasions: ['Team dinner', 'Company outing', 'Office celebration', 'End-of-year event'],
    bookingTypes: ['table', 'group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'Kora Courtyard Hotel & Rooftop Pavilion',
      'Victoria Island · Rooftop Conservatory & Event Salons',
      '#123B60',
      '#13A6A3'
    ),
    galleryImages: [],
    ratingAverage: 4.7,
    reviewCount: 16,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'ven_the_atrium_hall_oniru',
    name: 'The Atrium Glasshouse & Event Centre (Fictional Sample)',
    slug: 'the-atrium-glasshouse-and-event-centre',
    description:
      'Architectural glass-walled banquet hall and landscaped garden terrace in Oniru built for weddings, end-of-year corporate galas, product launches, and private celebrations up to 600 guests.',
    address: 'Plot 15 Akiogun Road, Oniru, Victoria Island, Lagos (Fictional)',
    locationId: 'loc_vi_oniru',
    city: 'Lagos',
    area: 'Victoria Island',
    neighbourhood: 'Oniru Waterfront',
    setting: 'indoor',
    capacity: 600,
    openingHours: 'Daily by Event Schedule: 8:00 AM – 2:00 AM',
    budgetMinMinor: 250000000, // NGN 2,500,000
    budgetMaxMinor: 650000000, // NGN 6,500,000
    currency: 'NGN',
    budgetBasis: 'total',
    categorySlugs: ['event-venues'],
    experienceTags: ['wedding-reception', 'corporate-retreat'],
    facilitySlugs: ['parking', 'private-room', 'wi-fi', 'av-projector', 'dance-floor', 'live-music'],
    occasions: [
      'Wedding celebration',
      'End-of-year event',
      'Company outing',
      'Private event',
      'Other special occasion',
    ],
    bookingTypes: ['group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'The Atrium Glasshouse & Event Centre',
      'Oniru · Architectural Banquet Hall & Garden Terrace',
      '#123B60',
      '#FF704F'
    ),
    galleryImages: [],
    confirmedOfferText: 'Dedicated bridal/VIP holding suite included with all full-venue bookings.',
    ratingAverage: 4.9,
    reviewCount: 18,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'ven_veranda_gardens_ikoyi',
    name: 'Veranda Botanical Gardens & Pavilion (Fictional Sample)',
    slug: 'veranda-botanical-gardens-and-pavilion',
    description:
      'Lush tropical garden venue in Old Ikoyi ideal for outdoor birthday brunches, intimate wedding receptions, corporate team mixers, and acoustic evening recitals.',
    address: '11 Bourdillon Extension, Old Ikoyi, Lagos (Fictional)',
    locationId: 'loc_ikoyi_old',
    city: 'Lagos',
    area: 'Ikoyi',
    neighbourhood: 'Old Ikoyi & Alexander Road',
    setting: 'outdoor',
    capacity: 280,
    openingHours: 'Daily: 9:00 AM – 11:00 PM',
    budgetMinMinor: 120000000, // NGN 1,200,000
    budgetMaxMinor: 350000000, // NGN 3,500,000
    currency: 'NGN',
    budgetBasis: 'total',
    categorySlugs: ['event-venues', 'music-entertainment'],
    experienceTags: ['wedding-reception', 'corporate-retreat', 'live-band'],
    facilitySlugs: ['parking', 'private-room', 'live-music', 'dance-floor', 'av-projector'],
    occasions: ['Wedding celebration', 'Birthday celebration', 'Company outing', 'Private event'],
    bookingTypes: ['group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'Veranda Botanical Gardens & Pavilion',
      'Old Ikoyi · Open-Air Garden Receptions & Pavilions',
      '#13A6A3',
      '#123B60'
    ),
    galleryImages: [],
    ratingAverage: 4.8,
    reviewCount: 14,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'ven_pin_strike_bowling_lekki',
    name: 'PinStrike Bowling, VR & Arcade Social (Fictional Sample)',
    slug: 'pinstrike-bowling-vr-and-arcade-social',
    description:
      'High-energy 10-lane bowling alley, VR racing simulator zone, private karaoke pods, and craft burger diner in Lekki Phase 1 designed for friends hangouts, family outings, and team bonding tournaments.',
    address: '52 Admiralty Way, Lekki Phase 1, Lagos (Fictional)',
    locationId: 'loc_lekki_phase1',
    city: 'Lagos',
    area: 'Lekki',
    neighbourhood: 'Lekki Phase 1 (Admiralty Way)',
    setting: 'indoor',
    capacity: 200,
    openingHours: 'Mon – Sun: 11:00 AM – 12:00 AM',
    budgetMinMinor: 1500000, // NGN 15,000
    budgetMaxMinor: 3800000, // NGN 38,000
    currency: 'NGN',
    budgetBasis: 'per_person',
    categorySlugs: ['games-recreation', 'music-entertainment'],
    experienceTags: ['bowling', 'karaoke', 'corporate-retreat'],
    facilitySlugs: ['parking', 'wi-fi', 'arcade-lanes', 'karaoke-booths', 'private-room'],
    occasions: [
      "Friends' hangout",
      'Family outing',
      'Birthday celebration',
      'Corporate hangout and team bonding',
      'Office celebration',
    ],
    bookingTypes: ['table', 'group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'PinStrike Bowling, VR & Arcade Social',
      'Lekki Phase 1 · 10-Lane Bowling, VR & Karaoke Pods',
      '#FF704F',
      '#123B60'
    ),
    galleryImages: [],
    confirmedOfferText: 'Includes complimentary shoe hire and 20 arcade tokens per guest on group bookings.',
    ratingAverage: 4.8,
    reviewCount: 45,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'ven_apex_kart_paintball_arena',
    name: 'Apex Circuit Go-Karting & Paintball Park (Fictional Sample)',
    slug: 'apex-circuit-go-karting-and-paintball-park',
    description:
      'Outdoor floodlit 650-metre go-kart track and woodland paintball tactical arena at Oniru Waterfront with a shaded pit-lane barbecue deck for corporate team-bonding challenges and birthday groups.',
    address: 'Plot 22 Remi Olowude Way, Oniru Corridor, Lagos (Fictional)',
    locationId: 'loc_vi_oniru',
    city: 'Lagos',
    area: 'Victoria Island',
    neighbourhood: 'Oniru Waterfront',
    setting: 'outdoor',
    capacity: 180,
    openingHours: 'Tue – Sun: 10:00 AM – 9:00 PM',
    budgetMinMinor: 2200000, // NGN 22,000
    budgetMaxMinor: 5000000, // NGN 50,000
    currency: 'NGN',
    budgetBasis: 'per_person',
    categorySlugs: ['games-recreation'],
    experienceTags: ['go-karting', 'paintball', 'corporate-retreat'],
    facilitySlugs: ['parking', 'wi-fi', 'private-room'],
    occasions: [
      'Corporate hangout and team bonding',
      "Friends' hangout",
      'Birthday celebration',
      'Company outing',
    ],
    bookingTypes: ['group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'Apex Circuit Go-Karting & Paintball Park',
      'Oniru · Floodlit Karting Circuit & Tactical Paintball',
      '#123B60',
      '#FF704F'
    ),
    galleryImages: [],
    ratingAverage: 4.7,
    reviewCount: 33,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'ven_cipher_vault_escape_yaba',
    name: 'CipherVault Escape Rooms & Boardgame Café (Fictional Sample)',
    slug: 'ciphervault-escape-rooms-and-boardgame-cafe',
    description:
      'Four themed 60-minute puzzle escape rooms and a specialty coffee & waffle boardgame lounge in Yaba. Built for analytical team-bonding sessions, student/tech socials, and weekend hangouts.',
    address: '302 Herbert Macaulay Way, Sabo, Yaba, Lagos (Fictional)',
    locationId: 'loc_yaba_tech',
    city: 'Lagos',
    area: 'Yaba',
    neighbourhood: 'Sabo & Herbert Macaulay Corridor',
    setting: 'indoor',
    capacity: 85,
    openingHours: 'Tue – Sun: 11:00 AM – 9:30 PM',
    budgetMinMinor: 1200000, // NGN 12,000
    budgetMaxMinor: 2800000, // NGN 28,000
    currency: 'NGN',
    budgetBasis: 'per_person',
    categorySlugs: ['games-recreation'],
    experienceTags: ['escape-room', 'corporate-retreat'],
    facilitySlugs: ['parking', 'wi-fi', 'private-room'],
    occasions: ['Corporate hangout and team bonding', "Friends' hangout", 'Birthday celebration', 'Date night'],
    bookingTypes: ['table', 'group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'CipherVault Escape Rooms & Boardgame Café',
      'Yaba · 4 Immersive Escape Rooms & Boardgame Lounge',
      '#13A6A3',
      '#123B60'
    ),
    galleryImages: [],
    ratingAverage: 4.9,
    reviewCount: 29,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'ven_sanaa_hammam_wellness_ikoyi',
    name: 'Sanaa Thermal Hammam & Wellness Sanctuary (Fictional Sample)',
    slug: 'sanaa-thermal-hammam-and-wellness-sanctuary',
    description:
      'Tranquil urban day spa and Moroccan hammam sanctuary in Old Ikoyi featuring heated vitality pools, eucalyptus steam chambers, couples massage suites, and an organic herbal tea courtyard.',
    address: '8 Lugard Avenue, Old Ikoyi, Lagos (Fictional)',
    locationId: 'loc_ikoyi_old',
    city: 'Lagos',
    area: 'Ikoyi',
    neighbourhood: 'Old Ikoyi & Alexander Road',
    setting: 'indoor',
    capacity: 60,
    openingHours: 'Tue – Sun: 9:00 AM – 8:30 PM',
    budgetMinMinor: 4000000, // NGN 40,000
    budgetMaxMinor: 9500000, // NGN 95,000
    currency: 'NGN',
    budgetBasis: 'per_person',
    categorySlugs: ['relaxation-experiences'],
    experienceTags: ['day-spa'],
    facilitySlugs: ['pool', 'parking', 'private-room', 'wi-fi', 'spa-suite'],
    occasions: ['Date night', 'Birthday celebration', "Friends' hangout", 'Private event'],
    bookingTypes: ['table', 'group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'Sanaa Thermal Hammam & Wellness Sanctuary',
      'Old Ikoyi · Vitality Pool, Hammam & Couples Spa Suites',
      '#13A6A3',
      '#123B60'
    ),
    galleryImages: [],
    confirmedOfferText: 'Complimentary hibiscus & lemongrass wellness infusion after every group spa circuit.',
    ratingAverage: 4.9,
    reviewCount: 38,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'ven_haven_float_lounge_vi',
    name: 'Haven Floatation, Pool & Tea Lounge (Fictional Sample)',
    slug: 'haven-floatation-pool-and-tea-lounge',
    description:
      'Restorative garden oasis in Victoria Island offering salt-water float pods, a quiet palm-fringed lap pool, sound-bath sessions, and private wellness cabanas for small groups.',
    address: '29A Idejo Street, Victoria Island, Lagos (Fictional)',
    locationId: 'loc_vi_adeola_odeku',
    city: 'Lagos',
    area: 'Victoria Island',
    neighbourhood: 'Adeola Odeku & Saka Tinubu',
    setting: 'outdoor',
    capacity: 50,
    openingHours: 'Daily: 9:00 AM – 8:00 PM',
    budgetMinMinor: 3000000, // NGN 30,000
    budgetMaxMinor: 7500000, // NGN 75,000
    currency: 'NGN',
    budgetBasis: 'per_person',
    categorySlugs: ['relaxation-experiences'],
    experienceTags: ['day-spa'],
    facilitySlugs: ['pool', 'parking', 'private-room', 'wi-fi', 'spa-suite'],
    occasions: ['Date night', "Friends' hangout", 'Birthday celebration', 'Other special occasion'],
    bookingTypes: ['table', 'group'],
    heroImageUrl: createVenueSvgDataUri(
      'Haven Floatation, Pool & Tea Lounge',
      'Victoria Island · Float Pods, Quiet Pool & Wellness Cabanas',
      '#13A6A3',
      '#123B60'
    ),
    galleryImages: [],
    ratingAverage: 4.8,
    reviewCount: 21,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'ven_nocturne_velvet_club_vi',
    name: 'Nocturne Supper Club & Late Lounge (Fictional Sample)',
    slug: 'nocturne-supper-club-and-late-lounge',
    description:
      'Sophisticated supper club in Victoria Island blending Pan-Asian small plates with late-night resident DJs, bespoke bottle service tables, and private velvet booths.',
    address: '1062 Akin Adesola Street, Victoria Island, Lagos (Fictional)',
    locationId: 'loc_vi_adeola_odeku',
    city: 'Lagos',
    area: 'Victoria Island',
    neighbourhood: 'Adeola Odeku & Saka Tinubu',
    setting: 'indoor',
    capacity: 240,
    openingHours: 'Thu – Sun: 7:00 PM – 4:00 AM',
    budgetMinMinor: 20000000, // NGN 200,000
    budgetMaxMinor: 60000000, // NGN 600,000
    currency: 'NGN',
    budgetBasis: 'per_table',
    categorySlugs: ['nightlife', 'restaurants-dining'],
    experienceTags: ['fine-dining', 'rooftop-cocktails'],
    facilitySlugs: ['parking', 'private-room', 'dance-floor'],
    occasions: ['Birthday celebration', "Friends' hangout", 'End-of-year event', 'Private event'],
    bookingTypes: ['table', 'group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'Nocturne Supper Club & Late Lounge',
      'Victoria Island · Pan-Asian Supper Club & Late Lounge',
      '#123B60',
      '#FF704F'
    ),
    galleryImages: [],
    ratingAverage: 4.7,
    reviewCount: 25,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: 'ven_palm_court_conference_ikeja',
    name: 'Palm Court Grand Hall & Executive Suites (Fictional Sample)',
    slug: 'palm-court-grand-hall-and-executive-suites',
    description:
      'Mainland event and conference complex in Ikeja GRA featuring a 450-seat pillarless hall, breakout rooms, stage lighting rig, and dedicated catering bays for corporate summits and weddings.',
    address: '60 Joel Ogunnaike Street, Ikeja GRA, Lagos (Fictional)',
    locationId: 'loc_ikeja_gra',
    city: 'Lagos',
    area: 'Ikeja',
    neighbourhood: 'Ikeja GRA & Isaac John',
    setting: 'indoor',
    capacity: 450,
    openingHours: 'Daily: 8:00 AM – 11:00 PM',
    budgetMinMinor: 180000000, // NGN 1,800,000
    budgetMaxMinor: 480000000, // NGN 4,800,000
    currency: 'NGN',
    budgetBasis: 'total',
    categorySlugs: ['event-venues', 'hotels-resorts'],
    experienceTags: ['corporate-retreat', 'wedding-reception'],
    facilitySlugs: ['parking', 'private-room', 'wi-fi', 'av-projector', 'dance-floor'],
    occasions: ['Company outing', 'End-of-year event', 'Wedding celebration', 'Office celebration'],
    bookingTypes: ['group', 'private_hire'],
    heroImageUrl: createVenueSvgDataUri(
      'Palm Court Grand Hall & Executive Suites',
      'Ikeja GRA · 450-Seat Pillarless Event & Summit Hall',
      '#123B60',
      '#13A6A3'
    ),
    galleryImages: [],
    ratingAverage: 4.7,
    reviewCount: 15,
    isFeatured: false,
    isPublished: true,
  },
];

export const SEED_EVENT_SERVICE_LEVELS = [
  {
    id: 'event_planning_assistance',
    name: 'Event planning assistance',
    description: 'Help the customer discover a suitable venue and organise the main arrangements.',
  },
  {
    id: 'on_the_day_coordination',
    name: 'On-the-day event coordination',
    description:
      'A coordinator helps manage arrangements and timing on the event day so the organiser can enjoy the event.',
  },
  {
    id: 'full_planning_and_coordination',
    name: 'Full event planning and coordination',
    description: 'Support from initial planning through to coordination on the event day.',
  },
] as const;

// TODO(founder): Confirm whether event add-ons use fixed prices, custom quotations, or both
export const SEED_ADD_ONS: AddOn[] = [
  {
    id: 'addon_event_coordinator',
    type: 'event_coordinator',
    name: 'Event coordinator',
    description: 'Dedicated on-site Decompress coordinator managing venue liaison, guest arrival, and schedule.',
    fixedPriceMinor: 7500000, // NGN 75,000 placeholder (TODO(founder))
    currency: 'NGN',
    isOptionalFixedPrice: true,
  },
  {
    id: 'addon_professional_photographer',
    type: 'professional_photographer',
    name: 'Professional photographer',
    description: 'Curated event photographer with edited high-resolution gallery delivery.',
    fixedPriceMinor: 12000000, // NGN 120,000 placeholder (TODO(founder))
    currency: 'NGN',
    isOptionalFixedPrice: true,
  },
  {
    id: 'addon_event_content_creator',
    type: 'event_content_creator',
    name: 'Event content creator',
    description: 'Behind-the-scenes short-form video reels and instant social highlights captured during the event.',
    fixedPriceMinor: 9000000, // NGN 90,000 placeholder (TODO(founder))
    currency: 'NGN',
    isOptionalFixedPrice: true,
  },
  {
    id: 'addon_coordinator_and_content_package',
    type: 'coordinator_and_content_creator_package',
    name: 'Coordinator and content-creator package',
    description: 'Combined on-the-day event coordinator plus dedicated social content creator.',
    fixedPriceMinor: 15000000, // NGN 150,000 placeholder (TODO(founder))
    currency: 'NGN',
    isOptionalFixedPrice: true,
  },
];

export const SEED_FAQ_TOPICS: FAQTopic[] = [
  { id: 'topic_bookings', title: 'Bookings', slug: 'bookings', order: 1 },
  { id: 'topic_accounts', title: 'Accounts', slug: 'accounts', order: 2 },
  { id: 'topic_payments_invoices', title: 'Payments and invoices', slug: 'payments-and-invoices', order: 3 },
  {
    id: 'topic_refunds_changes',
    title: 'Refunds and booking changes',
    slug: 'refunds-and-booking-changes',
    order: 4,
  },
  { id: 'topic_event_planning', title: 'Event planning', slug: 'event-planning', order: 5 },
  { id: 'topic_support', title: 'Support', slug: 'support', order: 6 },
];

/**
 * Section 7.7: All 6 topics and 21 questions are seeded as unpublished drafts (isPublished: false)
 * with placeholder answers. Never publish refund, cancellation or payment answers until founder confirms.
 */
export const SEED_FAQ_ITEMS: FAQItem[] = [
  // Topic 1: Bookings
  {
    id: 'faq_bookings_1',
    topicId: 'topic_bookings',
    topicSlug: 'bookings',
    question: 'How do I make a booking?',
    answer:
      'Browse or search for a venue on Decompress, review its indicative Budget Range and facilities, and select Book Now. Fill in your preferred date, time, guest count, occasion and contact details to submit a booking request.',
    order: 1,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  {
    id: 'faq_bookings_2',
    topicId: 'topic_bookings',
    topicSlug: 'bookings',
    question: 'Can I book as a guest?',
    answer:
      'Yes. You can browse venues and submit a booking request as a guest using your name, email address and phone number without creating an account.',
    order: 2,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  {
    id: 'faq_bookings_3',
    topicId: 'topic_bookings',
    topicSlug: 'bookings',
    question: 'How do I know whether my booking is confirmed?',
    answer:
      'When you submit a request, you receive a booking reference (DCP-XXXXXX) with status Pending while our team confirms availability with the venue. Once approved and payment is completed, your booking status moves to Confirmed and you receive an email confirmation and invoice.',
    order: 3,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  {
    id: 'faq_bookings_4',
    topicId: 'topic_bookings',
    topicSlug: 'bookings',
    question: 'Can I change or cancel a booking?',
    answer:
      'TODO(founder): Placeholder draft — contact Decompress support with your booking reference (DCP-XXXXXX) to request a date, guest-count or cancellation update. Do not publish until founder cancellation terms are confirmed.',
    order: 4,
    isPublished: false,
    requiresPolicyConfirmation: true,
  },
  // Topic 2: Accounts
  {
    id: 'faq_accounts_1',
    topicId: 'topic_accounts',
    topicSlug: 'accounts',
    question: 'Do I need an account to browse Decompress?',
    answer:
      'No. Anyone can visit Decompress, search venues and experiences, filter by Budget Range and location, and submit a guest booking request without an account.',
    order: 1,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  {
    id: 'faq_accounts_2',
    topicId: 'topic_accounts',
    topicSlug: 'accounts',
    question: 'How do I create an account?',
    answer:
      'Select Register to create a Personal or Corporate account using your email address and password, or choose Continue with Google.',
    order: 2,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  {
    id: 'faq_accounts_3',
    topicId: 'topic_accounts',
    topicSlug: 'accounts',
    question: 'Can I sign in with Google?',
    answer:
      'Yes. Continue with Google is available as a quick sign-up and sign-in option alongside email and password. All bookings still take place directly on Decompress.',
    order: 3,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  {
    id: 'faq_accounts_4',
    topicId: 'topic_accounts',
    topicSlug: 'accounts',
    question: 'What details does Google share with Decompress?',
    answer:
      'With your permission, Google shares only your basic profile information (your name and verified email address) to pre-fill your Decompress profile and link any earlier guest bookings made with that verified email.',
    order: 4,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  // Topic 3: Payments and invoices (TODO(founder): keep unpublished until founder policy confirmation)
  {
    id: 'faq_payments_1',
    topicId: 'topic_payments_invoices',
    topicSlug: 'payments-and-invoices',
    question: 'What payment methods can I use?',
    answer:
      'TODO(founder): Placeholder draft — approved bookings can be paid via the secure payment checkout link sent to your email or through your Decompress account wallet where enabled. Keep unpublished until payment provider is confirmed.',
    order: 1,
    isPublished: false,
    requiresPolicyConfirmation: true,
  },
  {
    id: 'faq_payments_2',
    topicId: 'topic_payments_invoices',
    topicSlug: 'payments-and-invoices',
    question: 'How does the Decompress wallet work?',
    answer:
      'TODO(founder): Placeholder draft — registered account holders can fund their Decompress wallet through our payment partner and use the balance to pay for approved bookings and deposits.',
    order: 2,
    isPublished: false,
    requiresPolicyConfirmation: true,
  },
  {
    id: 'faq_payments_3',
    topicId: 'topic_payments_invoices',
    topicSlug: 'payments-and-invoices',
    question: 'When do I need to pay?',
    answer:
      'TODO(founder): Placeholder draft — you only pay after the Decompress team confirms venue availability, marks your booking request Approved, and sends the confirmed amount due.',
    order: 3,
    isPublished: false,
    requiresPolicyConfirmation: true,
  },
  {
    id: 'faq_payments_4',
    topicId: 'topic_payments_invoices',
    topicSlug: 'payments-and-invoices',
    question: 'Where can I find my invoice or payment confirmation?',
    answer:
      'TODO(founder): Placeholder draft — once your payment succeeds, an itemised invoice and downloadable PDF receipt are sent to your email and saved in your Account bookings dashboard.',
    order: 4,
    isPublished: false,
    requiresPolicyConfirmation: true,
  },
  // Topic 4: Refunds and booking changes (TODO(founder): keep unpublished until founder policy confirmation)
  {
    id: 'faq_refunds_1',
    topicId: 'topic_refunds_changes',
    topicSlug: 'refunds-and-booking-changes',
    question: 'What happens if a venue is unavailable?',
    answer:
      'If a venue is unavailable for your requested date or time, our team marks the request Unavailable and notifies you immediately—no payment is charged, and we can help suggest suitable alternatives.',
    order: 1,
    isPublished: false,
    requiresPolicyConfirmation: true,
  },
  {
    id: 'faq_refunds_2',
    topicId: 'topic_refunds_changes',
    topicSlug: 'refunds-and-booking-changes',
    question: 'How do I request a refund?',
    answer:
      'TODO(founder): Placeholder draft — contact customer support quoting your booking reference (DCP-XXXXXX). Never publish until founder refund eligibility and timing policies are confirmed.',
    order: 2,
    isPublished: false,
    requiresPolicyConfirmation: true,
  },
  {
    id: 'faq_refunds_3',
    topicId: 'topic_refunds_changes',
    topicSlug: 'refunds-and-booking-changes',
    question: 'How are cancellations and changes handled?',
    answer:
      'TODO(founder): Placeholder draft — cancellations and venue changes are reviewed manually by our operations team in line with the venue and Decompress policy. Keep unpublished until founder confirmation.',
    order: 3,
    isPublished: false,
    requiresPolicyConfirmation: true,
  },
  // Topic 5: Event planning
  {
    id: 'faq_events_1',
    topicId: 'topic_event_planning',
    topicSlug: 'event-planning',
    question: 'What event-planning and coordination services does Decompress offer?',
    answer:
      'We offer three service levels: Event planning assistance, On-the-day event coordination, and Full event planning and coordination—so you can enjoy the occasion instead of managing arrangements all night.',
    order: 1,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  {
    id: 'faq_events_2',
    topicId: 'topic_event_planning',
    topicSlug: 'event-planning',
    question: 'Can I request an event coordinator, photographer or content creator?',
    answer:
      'Yes. You can add an Event coordinator, Professional photographer, Event content creator, or the combined Coordinator and content-creator package either while booking a venue or on the Plan an Event page.',
    order: 2,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  {
    id: 'faq_events_3',
    topicId: 'topic_event_planning',
    topicSlug: 'event-planning',
    question: 'How do I request a quotation?',
    answer:
      'Visit Plan an Event, tell us your occasion, preferred date, location, guest count, indicative budget and the assistance needed. Our team will follow up with a tailored quotation.',
    order: 3,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  // Topic 6: Support
  {
    id: 'faq_support_1',
    topicId: 'topic_support',
    topicSlug: 'support',
    question: 'How can I contact Decompress?',
    answer:
      'You can reach our team anytime via the public Contact Us page, by emailing our customer-care address, or through Help & Support inside your Account Settings.',
    order: 1,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  {
    id: 'faq_support_2',
    topicId: 'topic_support',
    topicSlug: 'support',
    question: 'What are the customer-care email address and phone number?',
    answer:
      'Our current customer-care email, phone number and operating hours are displayed on the Contact Us page and in Help & Support settings.',
    order: 2,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
  {
    id: 'faq_support_3',
    topicId: 'topic_support',
    topicSlug: 'support',
    question: 'What information should I provide when asking about a booking?',
    answer:
      'Please include your booking reference (in the form DCP-XXXXXX), the email address or phone number used when submitting the request, and a brief note on how we can help.',
    order: 3,
    isPublished: false,
    requiresPolicyConfirmation: false,
  },
];
