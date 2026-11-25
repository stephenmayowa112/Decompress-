'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '@/src/lib/firebase';
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
import {
  SEED_ADD_ONS,
  SEED_CATEGORIES,
  SEED_EXPERIENCE_TAGS,
  SEED_FACILITIES,
  SEED_FAQ_ITEMS,
  SEED_FAQ_TOPICS,
  SEED_LOCATIONS,
  SEED_SITE_SETTINGS,
  SEED_VENUES,
} from '@/src/lib/seed-data';

interface DecompressContextValue {
  currentUser: FirebaseUser | null;
  authReady: boolean;
  isAdminUser: boolean;
  categories: Category[];
  locations: Location[];
  facilities: Facility[];
  experienceTags: ExperienceTag[];
  venues: Venue[];
  addOns: AddOn[];
  faqTopics: FAQTopic[];
  faqItems: FAQItem[];
  siteSettings: SiteSettings;
  isSeedingFirestore: boolean;
  firestoreSeedStatus: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  syncSeedDataToFirestore: () => Promise<void>;
}

const DecompressContext = createContext<DecompressContextValue | undefined>(undefined);

export function DecompressProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Zero-latency initial state populated from deterministic seed dataset,
  // then hydrated with live Firestore documents when available.
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [locations, setLocations] = useState<Location[]>(SEED_LOCATIONS);
  const [facilities, setFacilities] = useState<Facility[]>(SEED_FACILITIES);
  const [experienceTags, setExperienceTags] = useState<ExperienceTag[]>(SEED_EXPERIENCE_TAGS);
  const [venues, setVenues] = useState<Venue[]>(SEED_VENUES);
  const [addOns] = useState<AddOn[]>(SEED_ADD_ONS);
  const [faqTopics] = useState<FAQTopic[]>(SEED_FAQ_TOPICS);
  const [faqItems] = useState<FAQItem[]>(SEED_FAQ_ITEMS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(SEED_SITE_SETTINGS);
  const [isSeedingFirestore, setIsSeedingFirestore] = useState(false);
  const [firestoreSeedStatus, setFirestoreSeedStatus] = useState<string | null>(null);

  const isAdminUser = Boolean(
    currentUser?.emailVerified && currentUser?.email === 'stephenmayowa112@gmail.com'
  );

  useEffect(() => {
    testFirestoreConnection();
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Fetch published venues and public reference collections from Firestore if already seeded
  useEffect(() => {
    let active = true;
    async function loadPublicCollections() {
      try {
        const venuesQuery = query(collection(db, 'venues'), where('isPublished', '==', true));
        const venueSnap = await getDocs(venuesQuery);
        if (active && !venueSnap.empty) {
          const loadedVenues = venueSnap.docs.map((d) => d.data() as Venue);
          setVenues(loadedVenues);
        }

        const settingsSnap = await getDocs(collection(db, 'siteSettings'));
        if (active && !settingsSnap.empty) {
          setSiteSettings(settingsSnap.docs[0].data() as SiteSettings);
        }

        const catSnap = await getDocs(collection(db, 'categories'));
        if (active && !catSnap.empty) {
          const loadedCats = catSnap.docs
            .map((d) => d.data() as Category)
            .sort((a, b) => a.order - b.order);
          setCategories(loadedCats);
        }

        const locSnap = await getDocs(collection(db, 'locations'));
        if (active && !locSnap.empty) {
          setLocations(locSnap.docs.map((d) => d.data() as Location));
        }

        const facSnap = await getDocs(collection(db, 'facilities'));
        if (active && !facSnap.empty) {
          setFacilities(facSnap.docs.map((d) => d.data() as Facility));
        }

        const tagSnap = await getDocs(collection(db, 'experienceTags'));
        if (active && !tagSnap.empty) {
          setExperienceTags(tagSnap.docs.map((d) => d.data() as ExperienceTag));
        }
      } catch {
        // Keep deterministic seed dataset if Firestore collection is empty or offline
      }
    }
    loadPublicCollections();
    return () => {
      active = false;
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleAuthProvider);
  }, []);

  const signOutUser = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  /**
   * Synchronizes all Milestone 1 seed records into Firestore using validated schemas.
   * Requires verified admin sign-in per firestore.rules.
   */
  const syncSeedDataToFirestore = useCallback(async () => {
    setIsSeedingFirestore(true);
    setFirestoreSeedStatus('Seeding reference collections and 18 sample venues to Firestore...');
    try {
      // 1. SiteSettings
      try {
        await setDoc(doc(db, 'siteSettings', 'global'), SEED_SITE_SETTINGS);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'siteSettings/global');
      }

      // 2. Locations (must exist before Venues per firestore.rules relational check)
      for (const loc of SEED_LOCATIONS) {
        try {
          await setDoc(doc(db, 'locations', loc.id), loc);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `locations/${loc.id}`);
        }
      }

      // 3. Categories
      for (const cat of SEED_CATEGORIES) {
        try {
          await setDoc(doc(db, 'categories', cat.id), cat);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `categories/${cat.id}`);
        }
      }

      // 4. Facilities
      for (const fac of SEED_FACILITIES) {
        try {
          await setDoc(doc(db, 'facilities', fac.id), fac);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `facilities/${fac.id}`);
        }
      }

      // 5. Experience Tags
      for (const tag of SEED_EXPERIENCE_TAGS) {
        try {
          await setDoc(doc(db, 'experienceTags', tag.id), tag);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `experienceTags/${tag.id}`);
        }
      }

      // 6. Venues (18 sample venues)
      for (const venue of SEED_VENUES) {
        const payload: Record<string, unknown> = {
          id: venue.id,
          name: venue.name,
          slug: venue.slug,
          description: venue.description,
          address: venue.address,
          locationId: venue.locationId,
          city: venue.city,
          area: venue.area,
          neighbourhood: venue.neighbourhood,
          setting: venue.setting,
          capacity: venue.capacity,
          openingHours: venue.openingHours,
          budgetMinMinor: venue.budgetMinMinor,
          budgetMaxMinor: venue.budgetMaxMinor,
          currency: venue.currency,
          budgetBasis: venue.budgetBasis,
          categorySlugs: venue.categorySlugs,
          experienceTags: venue.experienceTags,
          facilitySlugs: venue.facilitySlugs,
          occasions: venue.occasions,
          bookingTypes: venue.bookingTypes,
          heroImageUrl: venue.heroImageUrl,
          galleryImages: venue.galleryImages,
          ratingAverage: venue.ratingAverage,
          reviewCount: venue.reviewCount,
          isFeatured: venue.isFeatured,
          isPublished: venue.isPublished,
        };
        if (venue.confirmedOfferText) {
          payload.confirmedOfferText = venue.confirmedOfferText;
        }
        try {
          await setDoc(doc(db, 'venues', venue.id), payload);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `venues/${venue.id}`);
        }
      }

      // 7. FAQ Topics & Unpublished Draft FAQ Items
      for (const topic of SEED_FAQ_TOPICS) {
        try {
          await setDoc(doc(db, 'faqTopics', topic.id), topic);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `faqTopics/${topic.id}`);
        }
      }

      for (const item of SEED_FAQ_ITEMS) {
        try {
          await setDoc(doc(db, 'faqItems', item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `faqItems/${item.id}`);
        }
      }

      // 8. Event Add-Ons
      for (const addOn of SEED_ADD_ONS) {
        try {
          await setDoc(doc(db, 'addOns', addOn.id), addOn);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `addOns/${addOn.id}`);
        }
      }

      setFirestoreSeedStatus(
        'Successfully synced 18 sample venues, 7 categories, 8 locations, 10 facilities, 14 experience tags, 4 add-ons, and 21 unpublished FAQ drafts to Firestore.'
      );
    } catch (error) {
      setFirestoreSeedStatus(
        `Firestore seed failed: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsSeedingFirestore(false);
    }
  }, []);

  return (
    <DecompressContext.Provider
      value={{
        currentUser,
        authReady,
        isAdminUser,
        categories,
        locations,
        facilities,
        experienceTags,
        venues,
        addOns,
        faqTopics,
        faqItems,
        siteSettings,
        isSeedingFirestore,
        firestoreSeedStatus,
        signInWithGoogle,
        signOutUser,
        syncSeedDataToFirestore,
      }}
    >
      {children}
    </DecompressContext.Provider>
  );
}

export function useDecompress(): DecompressContextValue {
  const ctx = useContext(DecompressContext);
  if (!ctx) {
    throw new Error('useDecompress must be used within a DecompressProvider');
  }
  return ctx;
}
