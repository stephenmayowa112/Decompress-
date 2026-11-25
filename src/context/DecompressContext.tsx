'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  EmailAuthProvider,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  linkWithPopup,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
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
  AccountType,
  AddOn,
  Booking,
  BookingStatus,
  BookingStatusHistory,
  BookingType,
  Category,
  EventPlanningRequest,
  EventRequestStatus,
  EventServiceLevel,
  ExperienceTag,
  Facility,
  FAQItem,
  FAQTopic,
  Invoice,
  Location,
  Payment,
  Review,
  Settlement,
  SettlementStatus,
  SiteSettings,
  SupportEnquiry,
  SupportEnquiryStatus,
  UserProfile,
  Venue,
  Wallet,
  WalletTransaction,
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
import { sanitizeProfileFields } from '@/src/lib/auth-helpers';
import { generateBookingReference } from '@/src/lib/format';
import {
  canTransitionBookingStatus,
  formatEventServiceLevelLabel,
  generateEventRequestReference,
  generateInvoiceNumber,
  generateSecureToken,
} from '@/src/lib/booking-machine';
import {
  buildTransactionalEmail,
  EmailNotificationLog,
  EmailTemplateKey,
  EmailTemplatePayload,
} from '@/src/lib/email-templates';
import { MockSandboxProvider } from '@/src/lib/payments';

const LOCAL_OPS_STORAGE_KEY = 'decompress_v1_ops_store_v1';

export interface RegisterEmailPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  accountType: AccountType;
  companyName?: string;
}

export interface ProfileSettingsPatch {
  name: string;
  phone?: string;
  accountType: AccountType;
  companyName?: string;
  promotionalEmailsOptIn: boolean;
}

export type FavouriteToggleResult =
  | 'added'
  | 'removed'
  | 'requires_auth'
  | 'requires_verification';

export interface SubmitBookingInput {
  venueId: string;
  date: string;
  preferredTime: string;
  guestCount: number;
  occasion: string;
  bookingType: BookingType;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  eventServiceLevel?: EventServiceLevel | null;
  selectedAddOnIds?: string[];
  honeypot?: string;
}

export interface SubmitEventRequestInput {
  serviceLevel: EventServiceLevel;
  occasion: string;
  date: string;
  location: string;
  guestCount: number;
  budgetMinor: number;
  assistanceNeeded: string;
  selectedAddOnIds: string[];
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  linkedBookingId?: string | null;
  honeypot?: string;
}

export interface SubmitReviewInput {
  bookingId?: string;
  reviewToken?: string;
  rating: number;
  venueFeedback?: string;
  experienceFeedback?: string;
}

export interface SubmitSupportEnquiryInput {
  name: string;
  email: string;
  phone?: string;
  bookingReference?: string;
  message: string;
  honeypot?: string;
}

export interface AdminBookingTransitionOptions {
  amountDueMinor?: number;
  note?: string;
  cancellationReason?: string;
}

export interface SettlementPatch {
  customerAmountReceivedMinor: number;
  venueBillAmountMinor: number;
  venueBillFileName?: string;
  agreedDiscountMinor: number;
  decompressShareMinor: number;
  amountPayableToVenueMinor: number;
  amountRetainedMinor: number;
  settlementStatus: SettlementStatus;
}

interface PendingProfileDraft {
  name: string;
  phone?: string;
  accountType: AccountType;
  companyName?: string;
}

interface PersistedOpsState {
  bookings: Booking[];
  bookingHistory: BookingStatusHistory[];
  payments: Payment[];
  invoices: Invoice[];
  wallets: Record<string, Wallet>;
  walletTransactions: WalletTransaction[];
  settlements: Settlement[];
  eventPlanningRequests: EventPlanningRequest[];
  reviews: Review[];
  supportEnquiries: SupportEnquiry[];
  emailLogs: EmailNotificationLog[];
  faqItems: FAQItem[];
  venues?: Venue[];
  siteSettings?: SiteSettings;
}

function readLocalOps(): Partial<PersistedOpsState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_OPS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedOpsState>;
  } catch {
    return null;
  }
}

function writeLocalOps(state: PersistedOpsState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_OPS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

function isGoogleLinkedOnUser(user: FirebaseUser): boolean {
  return user.providerData.some((p) => p.providerId === 'google.com');
}

function mergeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of secondary) {
    map.set(item.id, item);
  }
  for (const item of primary) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined && val !== null) {
      out[key] = val;
    }
  }
  return out;
}

async function runGuestGuard(formType: string, honeypot?: string): Promise<void> {
  const res = await fetch('/api/guest-guard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formType, honeypot: honeypot || '' }),
  });
  const data = (await res.json()) as { allowed?: boolean; error?: string };
  if (!res.ok || !data.allowed) {
    throw new Error(data.error || 'Submission could not be verified. Please try again.');
  }
}

interface DecompressContextValue {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  profileLoading: boolean;
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
  favouriteVenueIds: string[];
  bookings: Booking[];
  userBookings: Booking[];
  bookingHistory: BookingStatusHistory[];
  payments: Payment[];
  invoices: Invoice[];
  wallet: Wallet | null;
  walletTransactions: WalletTransaction[];
  settlements: Settlement[];
  eventPlanningRequests: EventPlanningRequest[];
  reviews: Review[];
  supportEnquiries: SupportEnquiry[];
  emailLogs: EmailNotificationLog[];
  linkedGuestBookingsCount: number;
  isSeedingFirestore: boolean;
  firestoreSeedStatus: string | null;
  registerWithEmail: (payload: RegisterEmailPayload) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (
    preferredAccountType?: AccountType,
    preferredCompanyName?: string
  ) => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUserVerification: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserProfileSettings: (patch: ProfileSettingsPatch) => Promise<void>;
  toggleFavouriteVenue: (venueId: string) => Promise<FavouriteToggleResult>;
  syncAndLinkGuestBookings: () => Promise<number>;
  signOutUser: () => Promise<void>;
  syncSeedDataToFirestore: () => Promise<void>;
  // Milestone 4 — Bookings
  submitBookingRequest: (input: SubmitBookingInput) => Promise<{
    booking: Booking;
    eventRequest?: EventPlanningRequest;
  }>;
  adminTransitionBookingStatus: (
    bookingId: string,
    toStatus: BookingStatus,
    options?: AdminBookingTransitionOptions
  ) => Promise<{ booking: Booking; payment?: Payment }>;
  // Milestone 5 — Payments, Invoices, Settlements
  completePaymentCheckout: (
    guestPayToken: string,
    method: 'guest_checkout_link' | 'wallet' | 'card_sandbox'
  ) => Promise<{ booking: Booking; payment: Payment; invoice: Invoice; duplicate: boolean }>;
  adminSaveSettlement: (bookingId: string, patch: SettlementPatch) => Promise<Settlement>;
  // Milestone 6 — Event Planning
  submitEventPlanningRequest: (input: SubmitEventRequestInput) => Promise<EventPlanningRequest>;
  adminUpdateEventRequest: (
    requestId: string,
    patch: { status: EventRequestStatus; quotedAmountMinor?: number | null; notes?: string }
  ) => Promise<EventPlanningRequest>;
  // Milestone 7 — Wallet
  fundWallet: (amountMinor: number) => Promise<WalletTransaction>;
  payBookingWithWallet: (bookingId: string) => Promise<{ booking: Booking; invoice: Invoice }>;
  // Milestone 8 — Reviews, FAQ CMS, Support, Admin Venue & SiteSettings
  submitVerifiedReview: (input: SubmitReviewInput) => Promise<Review>;
  adminToggleReviewHidden: (reviewId: string) => Promise<void>;
  adminSaveFaqItem: (item: FAQItem) => Promise<void>;
  adminToggleFaqPublished: (itemId: string) => Promise<void>;
  submitSupportEnquiry: (input: SubmitSupportEnquiryInput) => Promise<SupportEnquiry>;
  adminUpdateSupportEnquiryStatus: (
    enquiryId: string,
    status: SupportEnquiryStatus
  ) => Promise<void>;
  adminSaveVenue: (venue: Venue) => Promise<void>;
  adminUpdateSiteSettings: (settings: SiteSettings) => Promise<void>;
}

const DecompressContext = createContext<DecompressContextValue | undefined>(undefined);

export function DecompressProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const pendingDraftRef = useRef<PendingProfileDraft | null>(null);
  const opsHydratedRef = useRef(false);

  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [locations, setLocations] = useState<Location[]>(SEED_LOCATIONS);
  const [facilities, setFacilities] = useState<Facility[]>(SEED_FACILITIES);
  const [experienceTags, setExperienceTags] = useState<ExperienceTag[]>(SEED_EXPERIENCE_TAGS);
  const [venues, setVenues] = useState<Venue[]>(SEED_VENUES);
  const [addOns] = useState<AddOn[]>(SEED_ADD_ONS);
  const [faqTopics] = useState<FAQTopic[]>(SEED_FAQ_TOPICS);
  const [faqItems, setFaqItems] = useState<FAQItem[]>(SEED_FAQ_ITEMS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(SEED_SITE_SETTINGS);

  const [favouriteVenueIds, setFavouriteVenueIds] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingHistory, setBookingHistory] = useState<BookingStatusHistory[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [walletsByUser, setWalletsByUser] = useState<Record<string, Wallet>>({});
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [eventPlanningRequests, setEventPlanningRequests] = useState<EventPlanningRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [supportEnquiries, setSupportEnquiries] = useState<SupportEnquiry[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>([]);

  const [linkedGuestBookingsCount, setLinkedGuestBookingsCount] = useState(0);
  const [isSeedingFirestore, setIsSeedingFirestore] = useState(false);
  const [firestoreSeedStatus, setFirestoreSeedStatus] = useState<string | null>(null);

  const isAdminUser = Boolean(
    currentUser?.emailVerified && currentUser?.email === 'stephenmayowa112@gmail.com'
  );

  // Persist operational state locally so guest checkouts, reviews, and admin sessions stay seamless
  useEffect(() => {
    if (!opsHydratedRef.current) return;
    writeLocalOps({
      bookings,
      bookingHistory,
      payments,
      invoices,
      wallets: walletsByUser,
      walletTransactions,
      settlements,
      eventPlanningRequests,
      reviews,
      supportEnquiries,
      emailLogs,
      faqItems,
      venues,
      siteSettings,
    });
  }, [
    bookings,
    bookingHistory,
    payments,
    invoices,
    walletsByUser,
    walletTransactions,
    settlements,
    eventPlanningRequests,
    reviews,
    supportEnquiries,
    emailLogs,
    faqItems,
    venues,
    siteSettings,
  ]);

  const recordEmail = useCallback(
    (template: EmailTemplateKey, payload: Omit<EmailTemplatePayload, 'supportEmail'>) => {
      const built = buildTransactionalEmail(template, {
        ...payload,
        supportEmail: siteSettings.supportEmail,
      });
      const entry: EmailNotificationLog = {
        ...built,
        id: generateSecureToken('id'),
        sentAtUtc: new Date().toISOString(),
        provider: 'decompress_transactional_sandbox',
      };
      setEmailLogs((prev) => [entry, ...prev].slice(0, 100));
      return entry;
    },
    [siteSettings.supportEmail]
  );

  const recalcVenueRating = useCallback((venueId: string, nextReviews: Review[]) => {
    const visible = nextReviews.filter((r) => r.venueId === venueId && !r.isHidden);
    const count = visible.length;
    const avg =
      count > 0
        ? Math.round((visible.reduce((acc, r) => acc + r.rating, 0) / count) * 10) / 10
        : 0;
    setVenues((prev) =>
      prev.map((v) =>
        v.id === venueId
          ? {
              ...v,
              reviewCount: count > 0 ? count : v.reviewCount,
              ratingAverage: count > 0 ? avg : v.ratingAverage,
            }
          : v
      )
    );
  }, []);

  /**
   * Hydrates profile, favourites, wallet, bookings, and (if admin) full operational queues.
   */
  const hydrateSignedInUser = useCallback(async (user: FirebaseUser) => {
    setProfileLoading(true);
    const draft = pendingDraftRef.current;
    const googleLinked = isGoogleLinkedOnUser(user);
    const normalizedEmail = (user.email || '').trim().toLowerCase();
    const userIsAdmin = user.emailVerified && normalizedEmail === 'stephenmayowa112@gmail.com';

    if (!user.emailVerified) {
      setUserProfile({
        uid: user.uid,
        email: normalizedEmail,
        name:
          draft?.name || user.displayName || normalizedEmail.split('@')[0] || 'Decompress Member',
        phone: draft?.phone || '',
        accountType: draft?.accountType || 'personal',
        companyName: draft?.accountType === 'corporate' ? draft.companyName || '' : undefined,
        googleLinked,
        emailVerified: false,
        promotionalEmailsOptIn: false,
        createdAtUtc: user.metadata.creationTime
          ? new Date(user.metadata.creationTime).toISOString()
          : new Date().toISOString(),
      });
      setFavouriteVenueIds([]);
      setLinkedGuestBookingsCount(0);
      setProfileLoading(false);
      return;
    }

    try {
      const publicRef = doc(db, 'users', user.uid);
      const privateRef = doc(db, 'users', user.uid, 'private', 'info');

      let publicData: Record<string, unknown> | null = null;
      let privateData: Record<string, unknown> | null = null;

      try {
        const publicSnap = await getDoc(publicRef);
        if (publicSnap.exists()) publicData = publicSnap.data();
      } catch {
        // Ignore if not yet created
      }

      if (!publicData) {
        const clean = sanitizeProfileFields({
          name:
            draft?.name ||
            user.displayName ||
            normalizedEmail.split('@')[0] ||
            'Decompress Member',
          phone: draft?.phone || '',
          accountType: draft?.accountType || 'personal',
          companyName: draft?.companyName || '',
        });
        const newPublic: Record<string, unknown> = {
          uid: user.uid,
          name: clean.name,
          accountType: clean.accountType,
        };
        if (clean.accountType === 'corporate' && clean.companyName) {
          newPublic.companyName = clean.companyName;
        }
        try {
          await setDoc(publicRef, newPublic);
          publicData = newPublic;
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
        }
      }

      try {
        const privateSnap = await getDoc(privateRef);
        if (privateSnap.exists()) privateData = privateSnap.data();
      } catch {
        // Ignore if not yet created
      }

      if (!privateData) {
        const newPrivate: Record<string, unknown> = {
          uid: user.uid,
          email: normalizedEmail,
          googleLinked,
          emailVerified: true,
          promotionalEmailsOptIn: false,
        };
        if (draft?.phone) {
          newPrivate.phone = draft.phone.trim().slice(0, 40);
        }
        try {
          await setDoc(privateRef, newPrivate);
          privateData = newPrivate;
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/private/info`);
        }
      } else if (
        privateData.googleLinked !== googleLinked ||
        privateData.emailVerified !== true
      ) {
        try {
          await updateDoc(privateRef, { googleLinked, emailVerified: true });
          privateData = { ...privateData, googleLinked, emailVerified: true };
        } catch {
          // Non-fatal sync
        }
      }

      pendingDraftRef.current = null;

      setUserProfile({
        uid: user.uid,
        email: String(privateData?.email || normalizedEmail),
        name: String(publicData?.name || user.displayName || 'Decompress Member'),
        phone: privateData?.phone ? String(privateData.phone) : '',
        accountType: publicData?.accountType === 'corporate' ? 'corporate' : 'personal',
        companyName: publicData?.companyName ? String(publicData.companyName) : undefined,
        googleLinked: Boolean(privateData?.googleLinked ?? googleLinked),
        emailVerified: true,
        promotionalEmailsOptIn: Boolean(privateData?.promotionalEmailsOptIn),
        createdAtUtc: user.metadata.creationTime
          ? new Date(user.metadata.creationTime).toISOString()
          : new Date().toISOString(),
      });

      // Load saved favourites
      try {
        const favQuery = query(
          collection(db, 'users', user.uid, 'favourites'),
          where('userId', '==', user.uid)
        );
        const favSnap = await getDocs(favQuery);
        setFavouriteVenueIds(favSnap.docs.map((d) => String(d.data().venueId || d.id)));
      } catch {
        setFavouriteVenueIds([]);
      }

      // Load or initialize owner-scoped Wallet mirror
      try {
        const walletRef = doc(db, 'users', user.uid, 'wallet', 'primary');
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
          const loadedWallet = walletSnap.data() as Wallet;
          setWalletsByUser((prev) => ({ ...prev, [user.uid]: loadedWallet }));
        } else {
          const initialWallet: Wallet = {
            id: 'primary',
            userId: user.uid,
            balanceMinor: 0,
            currency: 'NGN',
            providerAccountRef: `WAL-${user.uid.slice(0, 8).toUpperCase()}`,
            updatedAtUtc: new Date().toISOString(),
          };
          setWalletsByUser((prev) =>
            prev[user.uid] ? prev : { ...prev, [user.uid]: initialWallet }
          );
          try {
            await setDoc(walletRef, initialWallet);
          } catch {
            // Keep local mirror if rules/offline block
          }
        }

        const txSnap = await getDocs(
          query(
            collection(db, 'users', user.uid, 'walletTransactions'),
            where('userId', '==', user.uid)
          )
        );
        if (!txSnap.empty) {
          const remoteTx = txSnap.docs.map((d) => d.data() as WalletTransaction);
          setWalletTransactions((prev) =>
            mergeById(remoteTx, prev).sort((a, b) => b.createdAtUtc.localeCompare(a.createdAtUtc))
          );
        }
      } catch {
        // Keep local wallet state
      }

      // Link earlier guest bookings strictly on verified email match (Section 7.3)
      let newlyLinked = 0;
      if (normalizedEmail) {
        // 1. Link matching local guest bookings immediately
        setBookings((prev) =>
          prev.map((bk) => {
            if ((!bk.userId || bk.userId === '') && bk.guestEmail.toLowerCase() === normalizedEmail) {
              newlyLinked++;
              return { ...bk, userId: user.uid };
            }
            return bk;
          })
        );

        // 2. Link matching Firestore guest bookings
        try {
          const unlinkedQuery = query(
            collection(db, 'bookings'),
            where('userId', '==', ''),
            where('guestEmail', '==', normalizedEmail)
          );
          const unlinkedSnap = await getDocs(unlinkedQuery);
          for (const bookingDoc of unlinkedSnap.docs) {
            await updateDoc(doc(db, 'bookings', bookingDoc.id), { userId: user.uid });
            newlyLinked++;
          }
        } catch {
          // Non-fatal
        }
      }
      setLinkedGuestBookingsCount(newlyLinked);

      // Load Firestore bookings, payments, invoices, event requests
      try {
        const bookingQuery = userIsAdmin
          ? collection(db, 'bookings')
          : query(collection(db, 'bookings'), where('userId', '==', user.uid));
        const bkSnap = await getDocs(bookingQuery);
        if (!bkSnap.empty) {
          const remoteBookings = bkSnap.docs.map((d) => d.data() as Booking);
          setBookings((prev) =>
            mergeById(remoteBookings, prev).sort((a, b) =>
              (b.createdAtUtc || '').localeCompare(a.createdAtUtc || '')
            )
          );
        }
      } catch {
        // Keep local merged bookings
      }

      try {
        const payQuery = userIsAdmin
          ? collection(db, 'payments')
          : query(collection(db, 'payments'), where('userId', '==', user.uid));
        const paySnap = await getDocs(payQuery);
        if (!paySnap.empty) {
          setPayments((prev) => mergeById(paySnap.docs.map((d) => d.data() as Payment), prev));
        }
      } catch {
        // Keep local payments
      }

      try {
        const invQuery = userIsAdmin
          ? collection(db, 'invoices')
          : query(collection(db, 'invoices'), where('userId', '==', user.uid));
        const invSnap = await getDocs(invQuery);
        if (!invSnap.empty) {
          setInvoices((prev) => mergeById(invSnap.docs.map((d) => d.data() as Invoice), prev));
        }
      } catch {
        // Keep local invoices
      }

      try {
        const evQuery = userIsAdmin
          ? collection(db, 'eventPlanningRequests')
          : query(collection(db, 'eventPlanningRequests'), where('userId', '==', user.uid));
        const evSnap = await getDocs(evQuery);
        if (!evSnap.empty) {
          setEventPlanningRequests((prev) =>
            mergeById(evSnap.docs.map((d) => d.data() as EventPlanningRequest), prev).sort((a, b) =>
              b.createdAtUtc.localeCompare(a.createdAtUtc)
            )
          );
        }
      } catch {
        // Keep local event requests
      }

      if (userIsAdmin) {
        try {
          const setSnap = await getDocs(collection(db, 'settlements'));
          if (!setSnap.empty) {
            setSettlements((prev) =>
              mergeById(setSnap.docs.map((d) => d.data() as Settlement), prev)
            );
          }
          const supSnap = await getDocs(collection(db, 'supportEnquiries'));
          if (!supSnap.empty) {
            setSupportEnquiries((prev) =>
              mergeById(supSnap.docs.map((d) => d.data() as SupportEnquiry), prev)
            );
          }
          const allFaqSnap = await getDocs(collection(db, 'faqItems'));
          if (!allFaqSnap.empty) {
            setFaqItems(
              allFaqSnap.docs
                .map((d) => d.data() as FAQItem)
                .sort((a, b) => a.order - b.order)
            );
          }
          const allRevSnap = await getDocs(collection(db, 'reviews'));
          if (!allRevSnap.empty) {
            setReviews((prev) => mergeById(allRevSnap.docs.map((d) => d.data() as Review), prev));
          }
        } catch {
          // Non-fatal
        }
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    testFirestoreConnection();
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      if (user) {
        void hydrateSignedInUser(user);
      } else {
        setUserProfile(null);
        setFavouriteVenueIds([]);
        setLinkedGuestBookingsCount(0);
        setProfileLoading(false);
      }
    });
    return () => unsub();
  }, [hydrateSignedInUser]);

  // Hydrate local operational store & public Firestore collections asynchronously
  useEffect(() => {
    let active = true;
    async function loadPublicCollections() {
      const local = readLocalOps();
      if (active && local) {
        if (Array.isArray(local.bookings)) setBookings(local.bookings);
        if (Array.isArray(local.bookingHistory)) setBookingHistory(local.bookingHistory);
        if (Array.isArray(local.payments)) setPayments(local.payments);
        if (Array.isArray(local.invoices)) setInvoices(local.invoices);
        if (local.wallets) setWalletsByUser(local.wallets);
        if (Array.isArray(local.walletTransactions)) setWalletTransactions(local.walletTransactions);
        if (Array.isArray(local.settlements)) setSettlements(local.settlements);
        if (Array.isArray(local.eventPlanningRequests))
          setEventPlanningRequests(local.eventPlanningRequests);
        if (Array.isArray(local.reviews)) setReviews(local.reviews);
        if (Array.isArray(local.supportEnquiries)) setSupportEnquiries(local.supportEnquiries);
        if (Array.isArray(local.emailLogs)) setEmailLogs(local.emailLogs);
        if (Array.isArray(local.faqItems) && local.faqItems.length > 0) setFaqItems(local.faqItems);
        if (Array.isArray(local.venues) && local.venues.length > 0) setVenues(local.venues);
        if (local.siteSettings) setSiteSettings(local.siteSettings);
      }
      opsHydratedRef.current = true;

      try {
        const venuesQuery = query(collection(db, 'venues'), where('isPublished', '==', true));
        const venueSnap = await getDocs(venuesQuery);
        if (active && !venueSnap.empty) {
          setVenues(venueSnap.docs.map((d) => d.data() as Venue));
        }

        const settingsSnap = await getDocs(collection(db, 'siteSettings'));
        if (active && !settingsSnap.empty) {
          setSiteSettings(settingsSnap.docs[0].data() as SiteSettings);
        }

        const catSnap = await getDocs(collection(db, 'categories'));
        if (active && !catSnap.empty) {
          setCategories(
            catSnap.docs.map((d) => d.data() as Category).sort((a, b) => a.order - b.order)
          );
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

        const revSnap = await getDocs(
          query(collection(db, 'reviews'), where('isHidden', '==', false))
        );
        if (active && !revSnap.empty) {
          setReviews((prev) => mergeById(revSnap.docs.map((d) => d.data() as Review), prev));
        }

        const pubFaqSnap = await getDocs(
          query(collection(db, 'faqItems'), where('isPublished', '==', true))
        );
        if (active && !pubFaqSnap.empty) {
          const remotePublished = pubFaqSnap.docs.map((d) => d.data() as FAQItem);
          setFaqItems((prev) => mergeById(remotePublished, prev).sort((a, b) => a.order - b.order));
        }
      } catch {
        // Keep deterministic seed & local operational store if Firestore is empty or offline
      }
    }
    void loadPublicCollections();
    return () => {
      active = false;
    };
  }, []);

  // Derived user-scoped bookings & active wallet
  const userBookings = currentUser
    ? bookings.filter((b) => b.userId === currentUser.uid)
    : [];

  const wallet: Wallet | null = currentUser
    ? walletsByUser[currentUser.uid] || {
        id: 'primary',
        userId: currentUser.uid,
        balanceMinor: 0,
        currency: siteSettings.defaultCurrency,
        providerAccountRef: `WAL-${currentUser.uid.slice(0, 8).toUpperCase()}`,
        updatedAtUtc: new Date().toISOString(),
      }
    : null;

  // --- Auth actions ---
  const registerWithEmail = useCallback(async (payload: RegisterEmailPayload) => {
    const clean = sanitizeProfileFields({
      name: payload.name,
      phone: payload.phone,
      accountType: payload.accountType,
      companyName: payload.companyName,
    });
    pendingDraftRef.current = {
      name: clean.name,
      phone: clean.phone,
      accountType: clean.accountType,
      companyName: clean.companyName,
    };
    const credential = await createUserWithEmailAndPassword(
      auth,
      payload.email.trim().toLowerCase(),
      payload.password
    );
    await updateProfile(credential.user, { displayName: clean.name });
    try {
      await sendEmailVerification(credential.user);
    } catch {
      // Verification can also be resent from /account
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  }, []);

  const signInWithGoogle = useCallback(
    async (preferredAccountType?: AccountType, preferredCompanyName?: string) => {
      if (preferredAccountType) {
        pendingDraftRef.current = {
          name: '',
          accountType: preferredAccountType,
          companyName: preferredAccountType === 'corporate' ? preferredCompanyName || '' : '',
        };
      }
      await signInWithPopup(auth, googleAuthProvider);
    },
    []
  );

  const linkGoogleAccount = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('You must be signed in to link a Google account.');
    await linkWithPopup(user, googleAuthProvider);
    await user.reload();
    if (auth.currentUser) {
      setCurrentUser(auth.currentUser);
      await hydrateSignedInUser(auth.currentUser);
    }
  }, [hydrateSignedInUser]);

  const resendVerificationEmail = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Please sign in first.');
    await sendEmailVerification(user);
  }, []);

  const refreshUserVerification = useCallback(async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) return false;
    await user.reload();
    const refreshed = auth.currentUser;
    if (refreshed) {
      setCurrentUser(refreshed);
      if (refreshed.emailVerified) {
        await refreshed.getIdToken(true);
        await hydrateSignedInUser(refreshed);
        return true;
      }
    }
    return false;
  }, [hydrateSignedInUser]);

  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  }, []);

  const changeUserPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Please sign in with an email/password account to change your password.');
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  }, []);

  const updateUserProfileSettings = useCallback(async (patch: ProfileSettingsPatch) => {
    const user = auth.currentUser;
    if (!user) throw new Error('You must be signed in to update settings.');

    const clean = sanitizeProfileFields({
      name: patch.name,
      phone: patch.phone,
      accountType: patch.accountType,
      companyName: patch.companyName,
    });

    if (!clean.name) throw new Error('Full name is required.');
    if (clean.accountType === 'corporate' && !clean.companyName) {
      throw new Error('Company name is required for Corporate accounts.');
    }

    await updateProfile(user, { displayName: clean.name });

    if (!user.emailVerified) {
      pendingDraftRef.current = clean;
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              name: clean.name,
              phone: clean.phone,
              accountType: clean.accountType,
              companyName: clean.accountType === 'corporate' ? clean.companyName : undefined,
              promotionalEmailsOptIn: patch.promotionalEmailsOptIn,
            }
          : prev
      );
      return;
    }

    const publicRef = doc(db, 'users', user.uid);
    const privateRef = doc(db, 'users', user.uid, 'private', 'info');

    const publicPayload: Record<string, unknown> = {
      uid: user.uid,
      name: clean.name,
      accountType: clean.accountType,
    };
    if (clean.accountType === 'corporate' && clean.companyName) {
      publicPayload.companyName = clean.companyName;
    }

    const privatePayload: Record<string, unknown> = {
      uid: user.uid,
      email: (user.email || '').toLowerCase(),
      googleLinked: isGoogleLinkedOnUser(user),
      emailVerified: true,
      promotionalEmailsOptIn: Boolean(patch.promotionalEmailsOptIn),
    };
    if (clean.phone) privatePayload.phone = clean.phone;

    try {
      await setDoc(publicRef, publicPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }

    try {
      await setDoc(privateRef, privatePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/private/info`);
    }

    setUserProfile((prev) => ({
      uid: user.uid,
      email: (user.email || '').toLowerCase(),
      name: clean.name,
      phone: clean.phone,
      accountType: clean.accountType,
      companyName: clean.accountType === 'corporate' ? clean.companyName : undefined,
      googleLinked: isGoogleLinkedOnUser(user),
      emailVerified: true,
      promotionalEmailsOptIn: Boolean(patch.promotionalEmailsOptIn),
      createdAtUtc: prev?.createdAtUtc || new Date().toISOString(),
    }));
  }, []);

  const toggleFavouriteVenue = useCallback(
    async (venueId: string): Promise<FavouriteToggleResult> => {
      const user = auth.currentUser;
      if (!user) return 'requires_auth';
      if (!user.emailVerified) return 'requires_verification';

      const favRef = doc(db, 'users', user.uid, 'favourites', venueId);
      const alreadySaved = favouriteVenueIds.includes(venueId);

      if (alreadySaved) {
        try {
          await deleteDoc(favRef);
          setFavouriteVenueIds((prev) => prev.filter((id) => id !== venueId));
          return 'removed';
        } catch (err) {
          handleFirestoreError(
            err,
            OperationType.DELETE,
            `users/${user.uid}/favourites/${venueId}`
          );
        }
      } else {
        const payload = {
          id: venueId,
          userId: user.uid,
          venueId,
          createdAtUtc: new Date().toISOString(),
        };
        try {
          await setDoc(favRef, payload);
          setFavouriteVenueIds((prev) => (prev.includes(venueId) ? prev : [...prev, venueId]));
          return 'added';
        } catch (err) {
          handleFirestoreError(
            err,
            OperationType.CREATE,
            `users/${user.uid}/favourites/${venueId}`
          );
        }
      }
    },
    [favouriteVenueIds]
  );

  const syncAndLinkGuestBookings = useCallback(async (): Promise<number> => {
    const user = auth.currentUser;
    if (!user || !user.emailVerified || !user.email) return 0;

    const normalizedEmail = user.email.trim().toLowerCase();
    let newlyLinked = 0;

    setBookings((prev) =>
      prev.map((bk) => {
        if ((!bk.userId || bk.userId === '') && bk.guestEmail.toLowerCase() === normalizedEmail) {
          newlyLinked++;
          return { ...bk, userId: user.uid };
        }
        return bk;
      })
    );

    try {
      const unlinkedQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', ''),
        where('guestEmail', '==', normalizedEmail)
      );
      const unlinkedSnap = await getDocs(unlinkedQuery);
      for (const bookingDoc of unlinkedSnap.docs) {
        await updateDoc(doc(db, 'bookings', bookingDoc.id), { userId: user.uid });
        newlyLinked++;
      }
    } catch {
      // Non-fatal
    }

    if (newlyLinked > 0) {
      setLinkedGuestBookingsCount((prev) => prev + newlyLinked);
    }
    return newlyLinked;
  }, []);

  const signOutUser = useCallback(async () => {
    pendingDraftRef.current = null;
    await firebaseSignOut(auth);
  }, []);

  // --- Milestone 4: Booking Request Submission ---
  const submitBookingRequest = useCallback(
    async (input: SubmitBookingInput) => {
      await runGuestGuard('booking_request', input.honeypot);

      const venue = venues.find((v) => v.id === input.venueId);
      if (!venue) throw new Error('Selected venue could not be found.');

      const nowIso = new Date().toISOString();
      const bookingId = generateSecureToken('id');
      const reference = generateBookingReference();
      const verifiedUid = currentUser?.emailVerified ? currentUser.uid : '';

      const booking: Booking = {
        id: bookingId,
        reference,
        status: 'pending',
        venueId: venue.id,
        venueName: venue.name,
        venueSlug: venue.slug,
        userId: verifiedUid,
        guestName: input.guestName.trim().slice(0, 120),
        guestEmail: input.guestEmail.trim().toLowerCase().slice(0, 160),
        guestPhone: input.guestPhone.trim().slice(0, 40),
        date: input.date,
        preferredTime: input.preferredTime,
        guestCount: Math.max(1, Math.min(50000, Number(input.guestCount) || 1)),
        occasion: input.occasion.trim().slice(0, 120),
        bookingType: input.bookingType,
        specialRequests: input.specialRequests?.trim().slice(0, 1500) || undefined,
        eventServiceLevel: input.eventServiceLevel || undefined,
        selectedAddOnIds:
          input.selectedAddOnIds && input.selectedAddOnIds.length > 0
            ? input.selectedAddOnIds.slice(0, 10)
            : undefined,
        currency: venue.currency || siteSettings.defaultCurrency,
        createdAtUtc: nowIso,
      };

      const historyEntry: BookingStatusHistory = {
        id: generateSecureToken('id'),
        bookingId,
        fromStatus: 'none',
        toStatus: 'pending',
        actor: verifiedUid ? booking.guestEmail : 'guest_visitor',
        note: 'Booking request submitted via Decompress.',
        timestampUtc: nowIso,
      };

      setBookings((prev) => [booking, ...prev]);
      setBookingHistory((prev) => [historyEntry, ...prev]);

      if (verifiedUid) {
        try {
          await setDoc(doc(db, 'bookings', booking.id), stripUndefined({ ...booking }));
          await setDoc(
            doc(db, 'bookings', booking.id, 'history', historyEntry.id),
            historyEntry
          );
        } catch {
          // Persisted locally as fallback
        }
      }

      recordEmail('booking_received', {
        recipientName: booking.guestName,
        recipientEmail: booking.guestEmail,
        reference: booking.reference,
        venueName: booking.venueName,
        eventDate: booking.date,
        preferredTime: booking.preferredTime,
        guestCount: booking.guestCount,
      });

      let linkedEventRequest: EventPlanningRequest | undefined;
      if (input.eventServiceLevel || (input.selectedAddOnIds && input.selectedAddOnIds.length > 0)) {
        const serviceLevel: EventServiceLevel =
          input.eventServiceLevel || 'event_planning_assistance';
        linkedEventRequest = {
          id: generateSecureToken('id'),
          reference: generateEventRequestReference(),
          userId: verifiedUid,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone,
          serviceLevel,
          occasion: booking.occasion,
          date: booking.date,
          location: `${venue.name}, ${venue.neighbourhood}`,
          guestCount: booking.guestCount,
          budgetMinor: venue.budgetMinMinor,
          currency: booking.currency,
          assistanceNeeded:
            booking.specialRequests ||
            `Attached to venue booking ${booking.reference} at ${venue.name}.`,
          selectedAddOnIds: input.selectedAddOnIds || [],
          status: 'new',
          linkedBookingId: booking.id,
          createdAtUtc: nowIso,
        };
        setEventPlanningRequests((prev) => [linkedEventRequest!, ...prev]);
        if (verifiedUid) {
          try {
            await setDoc(
              doc(db, 'eventPlanningRequests', linkedEventRequest.id),
              stripUndefined({ ...linkedEventRequest })
            );
          } catch {
            // Non-fatal
          }
        }
        recordEmail('event_request_received', {
          recipientName: linkedEventRequest.guestName,
          recipientEmail: linkedEventRequest.guestEmail,
          reference: linkedEventRequest.reference,
          eventDate: linkedEventRequest.date,
          guestCount: linkedEventRequest.guestCount,
          serviceLevelLabel: formatEventServiceLevelLabel(linkedEventRequest.serviceLevel),
        });
      }

      return { booking, eventRequest: linkedEventRequest };
    },
    [venues, currentUser, siteSettings.defaultCurrency, recordEmail]
  );

  // --- Milestone 4 & 5: Admin Booking Status Transition ---
  const adminTransitionBookingStatus = useCallback(
    async (
      bookingId: string,
      toStatus: BookingStatus,
      options?: AdminBookingTransitionOptions
    ) => {
      const target = bookings.find((b) => b.id === bookingId);
      if (!target) throw new Error('Booking not found.');

      if (!canTransitionBookingStatus(target.status, toStatus)) {
        throw new Error(
          `Invalid booking transition from "${target.status}" to "${toStatus}".`
        );
      }

      if (toStatus === 'approved') {
        if (typeof options?.amountDueMinor !== 'number' || options.amountDueMinor <= 0) {
          throw new Error('Please enter a confirmed Amount Due greater than zero to approve.');
        }
      }
      if (toStatus === 'cancelled' && !options?.cancellationReason?.trim()) {
        throw new Error('Please provide a cancellation reason.');
      }

      const nowIso = new Date().toISOString();
      const reviewToken =
        toStatus === 'completed' ? generateSecureToken('rev') : target.reviewToken;

      const updated: Booking = {
        ...target,
        status: toStatus,
        amountDueMinor:
          toStatus === 'approved' ? options?.amountDueMinor : target.amountDueMinor,
        cancellationReason:
          toStatus === 'cancelled'
            ? options?.cancellationReason?.trim().slice(0, 500)
            : target.cancellationReason,
        reviewToken,
      };

      const historyEntry: BookingStatusHistory = {
        id: generateSecureToken('id'),
        bookingId: target.id,
        fromStatus: target.status,
        toStatus,
        actor: currentUser?.email || 'decompress_admin',
        note:
          options?.note?.trim() ||
          (toStatus === 'cancelled'
            ? `Cancelled: ${options?.cancellationReason}`
            : `Status updated from ${target.status} to ${toStatus}.`),
        timestampUtc: nowIso,
      };

      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      setBookingHistory((prev) => [historyEntry, ...prev]);

      let createdPayment: Payment | undefined;
      if (toStatus === 'approved' && updated.amountDueMinor) {
        createdPayment = MockSandboxProvider.createCheckout({
          bookingId: updated.id,
          bookingReference: updated.reference,
          amountMinor: updated.amountDueMinor,
          currency: updated.currency,
          method:
            siteSettings.guestPaymentMode === 'wallet_only'
              ? 'wallet'
              : 'guest_checkout_link',
          userId: updated.userId,
        });
        setPayments((prev) => [createdPayment!, ...prev]);

        if (isAdminUser) {
          try {
            await setDoc(
              doc(db, 'payments', createdPayment.id),
              stripUndefined({
                ...createdPayment,
                userId: updated.userId || '',
              })
            );
          } catch {
            // Non-fatal
          }
        }

        const payUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}/pay/${createdPayment.guestPayToken}`
            : `/pay/${createdPayment.guestPayToken}`;

        recordEmail('booking_approved', {
          recipientName: updated.guestName,
          recipientEmail: updated.guestEmail,
          reference: updated.reference,
          venueName: updated.venueName,
          eventDate: updated.date,
          amountMinor: updated.amountDueMinor,
          currency: updated.currency,
          payUrl,
          walletOnlyNotice: siteSettings.guestPaymentMode === 'wallet_only',
        });
      } else if (toStatus === 'unavailable') {
        recordEmail('booking_unavailable', {
          recipientName: updated.guestName,
          recipientEmail: updated.guestEmail,
          reference: updated.reference,
          venueName: updated.venueName,
          eventDate: updated.date,
        });
      } else if (toStatus === 'cancelled') {
        recordEmail('booking_cancelled', {
          recipientName: updated.guestName,
          recipientEmail: updated.guestEmail,
          reference: updated.reference,
          venueName: updated.venueName,
          cancellationReason: updated.cancellationReason,
        });
      } else if (toStatus === 'completed' && reviewToken) {
        const reviewUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}/review/${reviewToken}`
            : `/review/${reviewToken}`;
        recordEmail('review_request', {
          recipientName: updated.guestName,
          recipientEmail: updated.guestEmail,
          reference: updated.reference,
          venueName: updated.venueName,
          reviewUrl,
        });
      }

      if (isAdminUser) {
        try {
          await setDoc(doc(db, 'bookings', updated.id), stripUndefined({ ...updated }));
          await setDoc(
            doc(db, 'bookings', updated.id, 'history', historyEntry.id),
            historyEntry
          );
        } catch {
          // Local state remains authoritative in sandbox if doc wasn't initially in Firestore
        }
      }

      return { booking: updated, payment: createdPayment };
    },
    [bookings, currentUser, isAdminUser, siteSettings.guestPaymentMode, recordEmail]
  );

  // --- Milestone 5: Signature-Verified & Idempotent Checkout Completion ---
  const completePaymentCheckout = useCallback(
    async (
      guestPayToken: string,
      method: 'guest_checkout_link' | 'wallet' | 'card_sandbox'
    ) => {
      const payment = payments.find((p) => p.guestPayToken === guestPayToken);
      if (!payment) throw new Error('Payment link is invalid or has expired.');

      const booking = bookings.find((b) => b.id === payment.bookingId);
      if (!booking) throw new Error('Associated booking could not be found.');

      // Idempotency short-circuit if already confirmed & paid
      const existingInvoice = invoices.find((inv) => inv.bookingId === booking.id);
      if (payment.status === 'succeeded' && booking.status === 'confirmed' && existingInvoice) {
        return { booking, payment, invoice: existingInvoice, duplicate: true };
      }

      if (booking.status !== 'approved') {
        throw new Error(
          `This booking is currently "${booking.status}" and cannot accept payment.`
        );
      }

      const webhookResult = await MockSandboxProvider.verifyWebhook({
        eventId: `evt_${payment.providerReference}`,
        bookingReference: booking.reference,
        providerReference: payment.providerReference,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
      });

      if (!webhookResult.verified) {
        throw new Error(webhookResult.error || 'Payment webhook verification failed.');
      }

      if (webhookResult.duplicate && existingInvoice) {
        return { booking, payment, invoice: existingInvoice, duplicate: true };
      }

      const nowIso = new Date().toISOString();
      const paidPayment: Payment = {
        ...payment,
        status: 'succeeded',
        method,
      };
      const confirmedBooking: Booking = {
        ...booking,
        status: 'confirmed',
      };

      const invoice: Invoice = {
        id: generateSecureToken('id'),
        bookingId: booking.id,
        bookingReference: booking.reference,
        invoiceNumber: generateInvoiceNumber(),
        venueName: booking.venueName,
        eventDate: booking.date,
        customerName: booking.guestName,
        customerEmail: booking.guestEmail,
        companyName:
          currentUser && booking.userId === currentUser.uid
            ? userProfile?.companyName
            : undefined,
        lineItems: [
          {
            description: `${booking.venueName} — ${booking.occasion} (${booking.guestCount} guests)`,
            amountMinor: payment.amountMinor,
          },
        ],
        discountOrFeeMinor: 0,
        amountPaidMinor: payment.amountMinor,
        currency: payment.currency,
        status: 'paid',
        issuedAtUtc: nowIso,
      };

      const historyEntry: BookingStatusHistory = {
        id: generateSecureToken('id'),
        bookingId: booking.id,
        fromStatus: 'approved',
        toStatus: 'confirmed',
        actor: `payment_webhook:${payment.provider}`,
        note: `Payment ${payment.providerReference} verified via HMAC webhook. Invoice ${invoice.invoiceNumber} issued.`,
        timestampUtc: nowIso,
      };

      // Initialize Admin-Only Settlement record with zero hard-coded commercial formulas
      const initialSettlement: Settlement = {
        id: booking.id,
        bookingId: booking.id,
        bookingReference: booking.reference,
        customerAmountReceivedMinor: payment.amountMinor,
        venueBillAmountMinor: 0,
        agreedDiscountMinor: 0,
        decompressShareMinor: 0,
        amountPayableToVenueMinor: 0,
        amountRetainedMinor: 0,
        currency: payment.currency,
        settlementStatus: 'unreconciled',
        updatedBy: 'system_on_payment',
        updatedAtUtc: nowIso,
      };

      setPayments((prev) => prev.map((p) => (p.id === paidPayment.id ? paidPayment : p)));
      setBookings((prev) =>
        prev.map((b) => (b.id === confirmedBooking.id ? confirmedBooking : b))
      );
      setInvoices((prev) => [invoice, ...prev]);
      setBookingHistory((prev) => [historyEntry, ...prev]);
      setSettlements((prev) =>
        prev.some((s) => s.bookingId === booking.id) ? prev : [initialSettlement, ...prev]
      );

      recordEmail('booking_confirmed', {
        recipientName: confirmedBooking.guestName,
        recipientEmail: confirmedBooking.guestEmail,
        reference: confirmedBooking.reference,
        venueName: confirmedBooking.venueName,
        eventDate: confirmedBooking.date,
        preferredTime: confirmedBooking.preferredTime,
        invoiceNumber: invoice.invoiceNumber,
        amountMinor: invoice.amountPaidMinor,
        currency: invoice.currency,
      });

      if (currentUser?.emailVerified) {
        try {
          await setDoc(doc(db, 'bookings', confirmedBooking.id), stripUndefined({ ...confirmedBooking }));
          await setDoc(
            doc(db, 'payments', paidPayment.id),
            stripUndefined({ ...paidPayment, userId: confirmedBooking.userId || '' })
          );
          await setDoc(
            doc(db, 'invoices', invoice.id),
            stripUndefined({ ...invoice, userId: confirmedBooking.userId || '' })
          );
          await setDoc(
            doc(db, 'bookings', confirmedBooking.id, 'history', historyEntry.id),
            historyEntry
          );
          if (isAdminUser) {
            await setDoc(
              doc(db, 'settlements', initialSettlement.bookingId),
              stripUndefined({ ...initialSettlement })
            );
          }
        } catch {
          // Non-fatal in guest/sandbox mode
        }
      }

      return { booking: confirmedBooking, payment: paidPayment, invoice, duplicate: false };
    },
    [payments, bookings, invoices, currentUser, userProfile, isAdminUser, recordEmail]
  );

  // --- Milestone 5: Admin-Only Settlement Tracking (Zero hard-coded formulas) ---
  const adminSaveSettlement = useCallback(
    async (bookingId: string, patch: SettlementPatch) => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) throw new Error('Booking not found for settlement.');

      const nowIso = new Date().toISOString();
      const updated: Settlement = {
        id: bookingId,
        bookingId,
        bookingReference: booking.reference,
        customerAmountReceivedMinor: Math.max(0, Math.round(patch.customerAmountReceivedMinor)),
        venueBillAmountMinor: Math.max(0, Math.round(patch.venueBillAmountMinor)),
        venueBillFileName: patch.venueBillFileName?.trim() || undefined,
        agreedDiscountMinor: Math.round(patch.agreedDiscountMinor),
        decompressShareMinor: Math.round(patch.decompressShareMinor),
        amountPayableToVenueMinor: Math.round(patch.amountPayableToVenueMinor),
        amountRetainedMinor: Math.round(patch.amountRetainedMinor),
        currency: booking.currency,
        settlementStatus: patch.settlementStatus,
        settledAtUtc: patch.settlementStatus === 'settled' ? nowIso : undefined,
        updatedBy: currentUser?.email || 'decompress_admin',
        updatedAtUtc: nowIso,
      };

      setSettlements((prev) => {
        const exists = prev.some((s) => s.bookingId === bookingId);
        return exists
          ? prev.map((s) => (s.bookingId === bookingId ? updated : s))
          : [updated, ...prev];
      });

      if (isAdminUser) {
        try {
          await setDoc(doc(db, 'settlements', bookingId), stripUndefined({ ...updated }));
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `settlements/${bookingId}`);
        }
      }

      return updated;
    },
    [bookings, currentUser, isAdminUser]
  );

  // --- Milestone 6: Event Planning Requests ---
  const submitEventPlanningRequest = useCallback(
    async (input: SubmitEventRequestInput) => {
      await runGuestGuard('event_planning_request', input.honeypot);

      const nowIso = new Date().toISOString();
      const verifiedUid = currentUser?.emailVerified ? currentUser.uid : '';
      const request: EventPlanningRequest = {
        id: generateSecureToken('id'),
        reference: generateEventRequestReference(),
        userId: verifiedUid,
        guestName: input.guestName.trim().slice(0, 120),
        guestEmail: input.guestEmail.trim().toLowerCase().slice(0, 160),
        guestPhone: input.guestPhone.trim().slice(0, 40),
        serviceLevel: input.serviceLevel,
        occasion: input.occasion.trim().slice(0, 120),
        date: input.date,
        location: input.location.trim().slice(0, 160),
        guestCount: Math.max(1, Math.min(50000, Number(input.guestCount) || 1)),
        budgetMinor: Math.max(0, Math.round(input.budgetMinor)),
        currency: siteSettings.defaultCurrency,
        assistanceNeeded: input.assistanceNeeded.trim().slice(0, 2000),
        selectedAddOnIds: input.selectedAddOnIds.slice(0, 10),
        status: 'new',
        linkedBookingId: input.linkedBookingId || undefined,
        createdAtUtc: nowIso,
      };

      setEventPlanningRequests((prev) => [request, ...prev]);

      if (verifiedUid) {
        try {
          await setDoc(
            doc(db, 'eventPlanningRequests', request.id),
            stripUndefined({ ...request })
          );
        } catch {
          // Persisted locally
        }
      }

      recordEmail('event_request_received', {
        recipientName: request.guestName,
        recipientEmail: request.guestEmail,
        reference: request.reference,
        eventDate: request.date,
        guestCount: request.guestCount,
        serviceLevelLabel: formatEventServiceLevelLabel(request.serviceLevel),
      });

      return request;
    },
    [currentUser, siteSettings.defaultCurrency, recordEmail]
  );

  const adminUpdateEventRequest = useCallback(
    async (
      requestId: string,
      patch: { status: EventRequestStatus; quotedAmountMinor?: number | null; notes?: string }
    ) => {
      const target = eventPlanningRequests.find((r) => r.id === requestId);
      if (!target) throw new Error('Event planning request not found.');

      const updated: EventPlanningRequest = {
        ...target,
        status: patch.status,
        quotedAmountMinor:
          typeof patch.quotedAmountMinor === 'number'
            ? Math.max(0, Math.round(patch.quotedAmountMinor))
            : target.quotedAmountMinor,
        notes: patch.notes?.trim().slice(0, 1500) || target.notes,
      };

      setEventPlanningRequests((prev) =>
        prev.map((r) => (r.id === requestId ? updated : r))
      );

      if (
        patch.status === 'quoted' &&
        typeof updated.quotedAmountMinor === 'number' &&
        updated.quotedAmountMinor > 0
      ) {
        recordEmail('event_quote_ready', {
          recipientName: updated.guestName,
          recipientEmail: updated.guestEmail,
          reference: updated.reference,
          amountMinor: updated.quotedAmountMinor,
          currency: updated.currency,
          serviceLevelLabel: formatEventServiceLevelLabel(updated.serviceLevel),
        });
      }

      if (isAdminUser) {
        try {
          await setDoc(
            doc(db, 'eventPlanningRequests', requestId),
            stripUndefined({ ...updated })
          );
        } catch {
          // Non-fatal if doc was guest-submitted locally
        }
      }

      return updated;
    },
    [eventPlanningRequests, isAdminUser, recordEmail]
  );

  // --- Milestone 7: Provider-Backed Wallet Mirror ---
  const fundWallet = useCallback(
    async (amountMinor: number) => {
      if (!siteSettings.walletEnabled) {
        throw new Error('Wallet is currently disabled in site settings.');
      }
      if (!currentUser || !currentUser.emailVerified) {
        throw new Error('Please sign in and verify your email to fund your wallet.');
      }
      if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
        throw new Error('Please enter a valid funding amount.');
      }

      const cleanAmount = Math.round(amountMinor);
      const nowIso = new Date().toISOString();
      const currentWallet: Wallet = walletsByUser[currentUser.uid] || {
        id: 'primary',
        userId: currentUser.uid,
        balanceMinor: 0,
        currency: siteSettings.defaultCurrency,
        providerAccountRef: `WAL-${currentUser.uid.slice(0, 8).toUpperCase()}`,
        updatedAtUtc: nowIso,
      };

      const nextWallet: Wallet = {
        ...currentWallet,
        balanceMinor: currentWallet.balanceMinor + cleanAmount,
        updatedAtUtc: nowIso,
      };

      const tx: WalletTransaction = {
        id: generateSecureToken('tx'),
        walletId: nextWallet.id,
        userId: currentUser.uid,
        type: 'funding',
        amountMinor: cleanAmount,
        currency: nextWallet.currency,
        status: 'succeeded',
        providerReference: `FND-${generateSecureToken('tx').slice(-8).toUpperCase()}`,
        description: 'Wallet funding via fintech provider (Sandbox)',
        createdAtUtc: nowIso,
      };

      setWalletsByUser((prev) => ({ ...prev, [currentUser.uid]: nextWallet }));
      setWalletTransactions((prev) => [tx, ...prev]);

      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'wallet', 'primary'), nextWallet);
        await setDoc(
          doc(db, 'users', currentUser.uid, 'walletTransactions', tx.id),
          stripUndefined({ ...tx })
        );
      } catch {
        // Local wallet mirror kept in sync
      }

      return tx;
    },
    [siteSettings.walletEnabled, siteSettings.defaultCurrency, currentUser, walletsByUser]
  );

  const payBookingWithWallet = useCallback(
    async (bookingId: string) => {
      if (!siteSettings.walletEnabled) {
        throw new Error('Wallet payments are currently disabled.');
      }
      if (!currentUser || !currentUser.emailVerified) {
        throw new Error('Please sign in with a verified email to pay using your wallet.');
      }
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking || booking.status !== 'approved' || !booking.amountDueMinor) {
        throw new Error('This booking is not eligible for wallet payment.');
      }

      const activeWallet = walletsByUser[currentUser.uid];
      if (!activeWallet || activeWallet.balanceMinor < booking.amountDueMinor) {
        throw new Error('Insufficient wallet balance. Please fund your wallet first.');
      }

      const payment = payments.find(
        (p) => p.bookingId === booking.id && p.status === 'pending'
      );
      if (!payment) {
        throw new Error('No pending payment record found for this booking.');
      }

      const result = await completePaymentCheckout(payment.guestPayToken, 'wallet');
      if (!result.duplicate) {
        const nowIso = new Date().toISOString();
        const nextWallet: Wallet = {
          ...activeWallet,
          balanceMinor: activeWallet.balanceMinor - booking.amountDueMinor,
          updatedAtUtc: nowIso,
        };
        const tx: WalletTransaction = {
          id: generateSecureToken('tx'),
          walletId: nextWallet.id,
          userId: currentUser.uid,
          type: 'booking_payment',
          amountMinor: booking.amountDueMinor,
          currency: booking.currency,
          status: 'succeeded',
          providerReference: payment.providerReference,
          bookingReference: booking.reference,
          description: `Booking payment for ${booking.venueName} (${booking.reference})`,
          createdAtUtc: nowIso,
        };
        setWalletsByUser((prev) => ({ ...prev, [currentUser.uid]: nextWallet }));
        setWalletTransactions((prev) => [tx, ...prev]);

        try {
          await setDoc(doc(db, 'users', currentUser.uid, 'wallet', 'primary'), nextWallet);
          await setDoc(
            doc(db, 'users', currentUser.uid, 'walletTransactions', tx.id),
            stripUndefined({ ...tx })
          );
        } catch {
          // Non-fatal
        }
      }

      return { booking: result.booking, invoice: result.invoice };
    },
    [
      siteSettings.walletEnabled,
      currentUser,
      bookings,
      walletsByUser,
      payments,
      completePaymentCheckout,
    ]
  );

  // --- Milestone 8: Verified Reviews ---
  const submitVerifiedReview = useCallback(
    async (input: SubmitReviewInput) => {
      const rating = Math.round(Number(input.rating));
      if (rating < 1 || rating > 5) {
        throw new Error('Please choose a star rating between 1 and 5.');
      }

      const targetBooking = input.reviewToken
        ? bookings.find((b) => b.reviewToken === input.reviewToken)
        : bookings.find((b) => b.id === input.bookingId);

      if (!targetBooking) {
        throw new Error('This review link is invalid or has already been used.');
      }
      if (targetBooking.status !== 'completed') {
        throw new Error('Verified reviews can only be submitted for completed bookings.');
      }
      if (reviews.some((r) => r.bookingId === targetBooking.id)) {
        throw new Error('A Verified review has already been submitted for this booking.');
      }

      const nowIso = new Date().toISOString();
      const review: Review = {
        id: generateSecureToken('id'),
        bookingId: targetBooking.id,
        bookingReference: targetBooking.reference,
        venueId: targetBooking.venueId,
        venueName: targetBooking.venueName,
        reviewerName: targetBooking.guestName,
        rating,
        venueFeedback: input.venueFeedback?.trim().slice(0, 1500) || undefined,
        experienceFeedback: input.experienceFeedback?.trim().slice(0, 1500) || undefined,
        isVerified: true,
        isHidden: false,
        createdAtUtc: nowIso,
      };

      const nextReviews = [review, ...reviews];
      setReviews(nextReviews);
      recalcVenueRating(targetBooking.venueId, nextReviews);

      // Consume one-time reviewToken on booking
      setBookings((prev) =>
        prev.map((b) =>
          b.id === targetBooking.id ? { ...b, reviewToken: undefined } : b
        )
      );

      if (currentUser?.emailVerified) {
        try {
          await setDoc(doc(db, 'reviews', review.id), stripUndefined({ ...review }));
        } catch {
          // Kept locally for guest/sandbox review token submissions
        }
      }

      return review;
    },
    [bookings, reviews, currentUser, recalcVenueRating]
  );

  const adminToggleReviewHidden = useCallback(
    async (reviewId: string) => {
      const target = reviews.find((r) => r.id === reviewId);
      if (!target) return;
      const updated: Review = { ...target, isHidden: !target.isHidden };
      const nextReviews = reviews.map((r) => (r.id === reviewId ? updated : r));
      setReviews(nextReviews);
      recalcVenueRating(target.venueId, nextReviews);

      if (isAdminUser) {
        try {
          await updateDoc(doc(db, 'reviews', reviewId), { isHidden: updated.isHidden });
        } catch {
          // Non-fatal
        }
      }
    },
    [reviews, isAdminUser, recalcVenueRating]
  );

  // --- Milestone 8: Live FAQ CMS ---
  const adminSaveFaqItem = useCallback(
    async (item: FAQItem) => {
      setFaqItems((prev) => {
        const exists = prev.some((f) => f.id === item.id);
        const next = exists ? prev.map((f) => (f.id === item.id ? item : f)) : [...prev, item];
        return next.sort((a, b) => a.order - b.order);
      });
      if (isAdminUser) {
        try {
          await setDoc(doc(db, 'faqItems', item.id), stripUndefined({ ...item }));
        } catch {
          // Non-fatal
        }
      }
    },
    [isAdminUser]
  );

  const adminToggleFaqPublished = useCallback(
    async (itemId: string) => {
      const target = faqItems.find((f) => f.id === itemId);
      if (!target) return;
      const updated: FAQItem = { ...target, isPublished: !target.isPublished };
      setFaqItems((prev) => prev.map((f) => (f.id === itemId ? updated : f)));
      if (isAdminUser) {
        try {
          await setDoc(doc(db, 'faqItems', itemId), stripUndefined({ ...updated }));
        } catch {
          // Non-fatal
        }
      }
    },
    [faqItems, isAdminUser]
  );

  // --- Milestone 8: Public Support Enquiries ---
  const submitSupportEnquiry = useCallback(
    async (input: SubmitSupportEnquiryInput) => {
      await runGuestGuard('support_enquiry', input.honeypot);

      const enquiry: SupportEnquiry = {
        id: generateSecureToken('id'),
        name: input.name.trim().slice(0, 120),
        email: input.email.trim().toLowerCase().slice(0, 160),
        phone: input.phone?.trim().slice(0, 40) || undefined,
        bookingReference: input.bookingReference?.trim().toUpperCase().slice(0, 30) || undefined,
        message: input.message.trim().slice(0, 2000),
        status: 'open',
        createdAtUtc: new Date().toISOString(),
      };

      setSupportEnquiries((prev) => [enquiry, ...prev]);

      if (currentUser?.emailVerified) {
        try {
          await setDoc(
            doc(db, 'supportEnquiries', enquiry.id),
            stripUndefined({ ...enquiry })
          );
        } catch {
          // Persisted locally
        }
      }

      return enquiry;
    },
    [currentUser]
  );

  const adminUpdateSupportEnquiryStatus = useCallback(
    async (enquiryId: string, status: SupportEnquiryStatus) => {
      setSupportEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, status } : e))
      );
      if (isAdminUser) {
        try {
          await updateDoc(doc(db, 'supportEnquiries', enquiryId), { status });
        } catch {
          // Non-fatal
        }
      }
    },
    [isAdminUser]
  );

  // --- Admin Venue & Site Settings ---
  const adminSaveVenue = useCallback(
    async (venue: Venue) => {
      setVenues((prev) => {
        const exists = prev.some((v) => v.id === venue.id);
        return exists ? prev.map((v) => (v.id === venue.id ? venue : v)) : [venue, ...prev];
      });
      if (isAdminUser) {
        try {
          await setDoc(doc(db, 'venues', venue.id), stripUndefined({ ...venue }));
        } catch {
          // Non-fatal
        }
      }
    },
    [isAdminUser]
  );

  const adminUpdateSiteSettings = useCallback(
    async (settings: SiteSettings) => {
      setSiteSettings(settings);
      if (isAdminUser) {
        try {
          await setDoc(
            doc(db, 'siteSettings', 'global'),
            stripUndefined({
              supportEmail: settings.supportEmail,
              supportPhone: settings.supportPhone,
              supportHours: settings.supportHours,
              guestPaymentMode: settings.guestPaymentMode,
              walletEnabled: settings.walletEnabled,
              defaultCurrency: settings.defaultCurrency,
              defaultTimezone: settings.defaultTimezone,
            })
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'siteSettings/global');
        }
      }
    },
    [isAdminUser]
  );

  const syncSeedDataToFirestore = useCallback(async () => {
    setIsSeedingFirestore(true);
    setFirestoreSeedStatus('Seeding reference collections and 18 sample venues to Firestore...');
    try {
      await setDoc(
        doc(db, 'siteSettings', 'global'),
        stripUndefined({
          supportEmail: siteSettings.supportEmail,
          supportPhone: siteSettings.supportPhone,
          supportHours: siteSettings.supportHours,
          guestPaymentMode: siteSettings.guestPaymentMode,
          walletEnabled: siteSettings.walletEnabled,
          defaultCurrency: siteSettings.defaultCurrency,
          defaultTimezone: siteSettings.defaultTimezone,
        })
      );

      for (const loc of SEED_LOCATIONS) {
        await setDoc(doc(db, 'locations', loc.id), loc);
      }
      for (const cat of SEED_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      for (const fac of SEED_FACILITIES) {
        await setDoc(doc(db, 'facilities', fac.id), fac);
      }
      for (const tag of SEED_EXPERIENCE_TAGS) {
        await setDoc(doc(db, 'experienceTags', tag.id), tag);
      }
      for (const venue of venues) {
        await setDoc(doc(db, 'venues', venue.id), stripUndefined({ ...venue }));
      }
      for (const topic of SEED_FAQ_TOPICS) {
        await setDoc(doc(db, 'faqTopics', topic.id), topic);
      }
      for (const item of faqItems) {
        await setDoc(doc(db, 'faqItems', item.id), stripUndefined({ ...item }));
      }
      for (const addOn of SEED_ADD_ONS) {
        await setDoc(doc(db, 'addOns', addOn.id), stripUndefined({ ...addOn }));
      }

      setFirestoreSeedStatus(
        `Successfully synced ${venues.length} venues, ${SEED_CATEGORIES.length} categories, ${SEED_LOCATIONS.length} locations, ${SEED_FACILITIES.length} facilities, ${SEED_EXPERIENCE_TAGS.length} experience tags, ${SEED_ADD_ONS.length} add-ons, and ${faqItems.length} FAQ records to Firestore.`
      );
    } catch (error) {
      setFirestoreSeedStatus(
        `Firestore seed failed: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsSeedingFirestore(false);
    }
  }, [siteSettings, venues, faqItems]);

  return (
    <DecompressContext.Provider
      value={{
        currentUser,
        userProfile,
        profileLoading,
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
        favouriteVenueIds,
        bookings,
        userBookings,
        bookingHistory,
        payments,
        invoices,
        wallet,
        walletTransactions: currentUser
          ? walletTransactions.filter((t) => t.userId === currentUser.uid)
          : [],
        settlements,
        eventPlanningRequests,
        reviews,
        supportEnquiries,
        emailLogs,
        linkedGuestBookingsCount,
        isSeedingFirestore,
        firestoreSeedStatus,
        registerWithEmail,
        signInWithEmail,
        signInWithGoogle,
        linkGoogleAccount,
        resendVerificationEmail,
        refreshUserVerification,
        sendPasswordReset,
        changeUserPassword,
        updateUserProfileSettings,
        toggleFavouriteVenue,
        syncAndLinkGuestBookings,
        signOutUser,
        syncSeedDataToFirestore,
        submitBookingRequest,
        adminTransitionBookingStatus,
        completePaymentCheckout,
        adminSaveSettlement,
        submitEventPlanningRequest,
        adminUpdateEventRequest,
        fundWallet,
        payBookingWithWallet,
        submitVerifiedReview,
        adminToggleReviewHidden,
        adminSaveFaqItem,
        adminToggleFaqPublished,
        submitSupportEnquiry,
        adminUpdateSupportEnquiryStatus,
        adminSaveVenue,
        adminUpdateSiteSettings,
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
