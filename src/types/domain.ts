/**
 * Decompress — Core Normalized Domain Models
 *
 * Conventions:
 * - Monetary amounts are stored as integer minor units (e.g., kobo for NGN)
 *   alongside an explicit ISO currency code.
 * - Timestamps are stored in UTC ISO-8601 format and displayed in a configurable
 *   timezone (default 'Africa/Lagos').
 * - Always use "Budget Range" for indicative venue guides.
 * - Commission rates, discount amounts, deposit amounts, and settlement figures
 *   are configurable rather than hard-coded.
 */

export type AccountType = 'personal' | 'corporate';

export type StaffGroup = 'Operations' | 'Finance' | 'Content & Support' | 'Superuser';

export type VenueSetting = 'indoor' | 'outdoor' | 'rooftop' | 'beachfront';

export type BudgetBasis = 'per_person' | 'per_table' | 'total';

export type BookingType = 'table' | 'group' | 'private_hire';

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'unavailable'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type EventServiceLevel =
  | 'event_planning_assistance'
  | 'on_the_day_coordination'
  | 'full_planning_and_coordination';

export type EventRequestStatus =
  | 'new'
  | 'in_discussion'
  | 'quoted'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'declined';

export type GuestPaymentMode = 'guest_checkout' | 'wallet_only';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'reversed';

export type SettlementStatus = 'unreconciled' | 'pending_payout' | 'settled' | 'disputed';

export type SupportEnquiryStatus = 'open' | 'in_progress' | 'resolved';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  accountType: AccountType;
  companyName?: string;
  googleLinked: boolean;
  emailVerified: boolean;
  promotionalEmailsOptIn: boolean;
  createdAtUtc: string;
}

export interface AdminMember {
  uid: string;
  email: string;
  staffGroup: StaffGroup;
}

export interface Favourite {
  id: string;
  userId: string;
  venueId: string;
  createdAtUtc: string;
}

export interface Location {
  id: string;
  city: string;
  area: string;
  neighbourhood: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  order: number;
}

export interface ExperienceTag {
  id: string;
  name: string;
  slug: string;
  categorySlugs: string[];
}

export interface Facility {
  id: string;
  name: string;
  slug: string;
  /** Links each facility to the categories it applies to */
  applicableCategorySlugs: string[];
}

export interface VenueImage {
  id: string;
  venueId: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
}

export interface Offer {
  id: string;
  venueId: string;
  text: string;
  validFromUtc?: string;
  validUntilUtc?: string;
  /** Only confirmed offers (isConfirmed === true) may be displayed publicly */
  isConfirmed: boolean;
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  locationId: string;
  city: string;
  area: string;
  neighbourhood: string;
  setting: VenueSetting;
  capacity: number;
  openingHours: string;
  /** Indicative Budget Range minimum in minor units (never called Minimum Spend) */
  budgetMinMinor: number;
  /** Indicative Budget Range maximum in minor units */
  budgetMaxMinor: number;
  currency: string;
  budgetBasis: BudgetBasis;
  categorySlugs: string[];
  experienceTags: string[];
  facilitySlugs: string[];
  occasions: string[];
  bookingTypes: BookingType[];
  heroImageUrl: string;
  galleryImages: string[];
  confirmedOfferText?: string;
  ratingAverage: number;
  reviewCount: number;
  isFeatured: boolean;
  isPublished: boolean;
}

export interface Booking {
  id: string;
  /** Unambiguous alphanumeric reference in the form DCP-XXXXXX */
  reference: string;
  status: BookingStatus;
  venueId: string;
  venueName: string;
  venueSlug: string;
  userId?: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string; // YYYY-MM-DD
  preferredTime: string; // HH:mm
  guestCount: number;
  occasion: string;
  bookingType: BookingType;
  specialRequests?: string;
  eventServiceLevel?: EventServiceLevel | null;
  selectedAddOnIds?: string[];
  /** Admin sets amountDueMinor when approving a booking */
  amountDueMinor?: number | null;
  currency: string;
  cancellationReason?: string;
  reviewToken?: string;
  createdAtUtc: string;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus | 'none';
  toStatus: BookingStatus;
  actor: string;
  note: string;
  timestampUtc: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  bookingReference: string;
  provider: string;
  providerReference: string;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  method: 'guest_checkout_link' | 'wallet' | 'card_sandbox';
  guestPayToken: string;
  createdAtUtc: string;
}

export interface InvoiceLineItem {
  description: string;
  amountMinor: number;
}

export interface Invoice {
  id: string;
  bookingId: string;
  bookingReference: string;
  invoiceNumber: string;
  venueName: string;
  eventDate: string;
  customerName: string;
  customerEmail: string;
  companyName?: string;
  lineItems: InvoiceLineItem[];
  discountOrFeeMinor: number;
  amountPaidMinor: number;
  currency: string;
  status: 'paid' | 'refunded';
  issuedAtUtc: string;
}

export interface Wallet {
  id: string;
  userId: string;
  /** Local mirror of payment-provider wallet balance in minor units */
  balanceMinor: number;
  currency: string;
  providerAccountRef: string;
  updatedAtUtc: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'funding' | 'booking_payment' | 'refund' | 'reversal';
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  providerReference: string;
  bookingReference?: string;
  description: string;
  createdAtUtc: string;
}

export interface Settlement {
  id: string;
  bookingId: string;
  bookingReference: string;
  /** Settlement fields are editable by Finance/Superuser admins */
  customerAmountReceivedMinor: number;
  venueBillAmountMinor: number;
  venueBillFileName?: string;
  agreedDiscountMinor: number;
  decompressShareMinor: number;
  amountPayableToVenueMinor: number;
  amountRetainedMinor: number;
  currency: string;
  settlementStatus: SettlementStatus;
  settledAtUtc?: string;
  updatedBy: string;
  updatedAtUtc: string;
}

export interface AddOn {
  id: string;
  type:
    | 'event_coordinator'
    | 'professional_photographer'
    | 'event_content_creator'
    | 'coordinator_and_content_creator_package';
  name: string;
  description: string;
  /** Optional fixed price in minor units when configured */
  fixedPriceMinor?: number;
  currency: string;
  isOptionalFixedPrice: boolean;
}

export interface EventPlanningRequest {
  id: string;
  reference: string;
  userId?: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  serviceLevel: EventServiceLevel;
  occasion: string;
  date: string;
  location: string;
  guestCount: number;
  budgetMinor: number;
  currency: string;
  assistanceNeeded: string;
  selectedAddOnIds: string[];
  status: EventRequestStatus;
  /** Quoted amount per request set by admin */
  quotedAmountMinor?: number | null;
  notes?: string;
  linkedBookingId?: string | null;
  createdAtUtc: string;
}

export interface EventRequestAddOn {
  id: string;
  requestId: string;
  addOnId: string;
}

export interface Review {
  id: string;
  bookingId: string;
  bookingReference: string;
  venueId: string;
  venueName: string;
  reviewerName: string;
  /** 1 to 5 star rating */
  rating: number;
  venueFeedback?: string;
  experienceFeedback?: string;
  /** All reviews come strictly from a completed booking and are labelled Verified */
  isVerified: true;
  isHidden: boolean;
  createdAtUtc: string;
}

export interface FAQTopic {
  id: string;
  title: string;
  slug: string;
  order: number;
}

export interface FAQItem {
  id: string;
  topicId: string;
  topicSlug: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
  /** True for refund, cancellation, or payment items that must remain unpublished until founder confirmation */
  requiresPolicyConfirmation?: boolean;
}

export interface SupportEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bookingReference?: string;
  message: string;
  status: SupportEnquiryStatus;
  createdAtUtc: string;
}

export interface SiteSettings {
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
  guestPaymentMode: GuestPaymentMode; // default 'guest_checkout'
  walletEnabled: boolean; // feature flag
  defaultCurrency: string; // default 'NGN'
  defaultTimezone: string; // default 'Africa/Lagos'
  internalResponseTargetMinutes?: number; // never shown in public UI
}
