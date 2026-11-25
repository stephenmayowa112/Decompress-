# Decompress V1 — Architectural & Product Assumptions

All items marked `TO CONFIRM` in Section 15 of the Build Prompt and Section 15 of the PRD are tracked here and tagged `TODO(founder)` in code. No commercial rates, deposit percentages, cancellation windows, or response-time promises are hard-coded.

---

## 1. Runtime & Database Architecture Adaptation

- **Full-Stack Next.js 15 + Firebase Firestore & Auth**:
  - In Step 0, we planned a Next.js 15 full-stack app with Cloud SQL (PostgreSQL). During Milestone 1 provisioning, the AI Studio environment reported `NO_VALID_PROJECT` for Cloud SQL Developer Edition (no billing-enabled GCP project attached to this sandbox).
  - Following platform rules, we provisioned **Firebase Firestore (Enterprise Edition)** and **Firebase Authentication** (`gen-lang-client-0828454544`, database `ai-studio-4ffb0036-2702-4fdf-9b82-4a2f1a634849`).
  - **Normalized Relational Modeling in Firestore + Weighted Search Engine**: All 20+ entities from Section 8 (`User`, `Favourite`, `Venue`, `VenueImage`, `Location`, `Category`, `ExperienceTag`, `Facility`, `Offer`, `Booking`, `BookingStatusHistory`, `Payment`, `Invoice`, `Wallet`, `WalletTransaction`, `Settlement`, `EventPlanningRequest`, `AddOn`, `EventRequestAddOn`, `Review`, `FAQTopic`, `FAQItem`, `SupportEnquiry`, `SiteSettings`) are modelled as strongly-typed normalized collections with relational foreign keys, validated by `firebase-blueprint.json` and hardened `firestore.rules`.
  - **Weighted Full-Text + Trigram Similarity Search**: Implemented via an indexable search vector & trigram similarity scorer over venue `name` (weight A), `experienceTags` & `categories` (weight B), `facilities` & `location` (weight C), and `description` (weight D), so searching `"salsa"` or `"karaoke"` or `"rooftop"` matches venues offering that experience even when the venue name does not contain the word.

---

## 2. Section 15 `TO CONFIRM` Safe Defaults (`TODO(founder)`)

| Decision Area | Safe Default Built (`TODO(founder)`) | Configurable Where |
| :--- | :--- | :--- |
| **Guest payment route** | `GUEST_PAYMENT_MODE = 'guest_checkout'` by default. Guests pay via tokenised `/pay/[token]` link. When switched to `'wallet_only'`, a prominent pre-submission banner warns guests before they submit a request. | `SiteSettings.guestPaymentMode` (`/admin` -> Settings) |
| **Wallet & payment provider** | `PaymentProvider` adapter interface (`src/lib/payments/types.ts`) + working `MockSandboxPaymentProvider`. Wallet behind `SiteSettings.walletEnabled` (default `true`). Local ledger mirrors provider transactions only. | `SiteSettings.walletEnabled`, `SiteSettings.paymentProvider` |
| **Booking payment model (full vs. deposit)** | No deposit percentage is hard-coded. When approving a booking in `/admin`, the admin explicitly enters `amountDueMinor` (in kobo/minor units) and payment label (`Full Payment` or `Booking Deposit`). | Admin Booking Approval modal |
| **Cancellation & refund policy** | `cancelled` is an admin-only action requiring a written reason logged in `BookingStatusHistory`. Zero automated cancellation/refund rules. All refund/cancellation FAQ items are seeded with `isPublished: false`. | Admin Booking Queue & FAQ Manager |
| **Commercial settlement** | `Settlement` record (`customerAmountReceivedMinor`, `venueBillAmountMinor`, `venueBillFileUrl`, `agreedDiscountMinor`, `decompressShareMinor`, `amountPayableToVenueMinor`, `amountRetainedMinor`, `settlementStatus`) has free-form integer inputs edited by Finance/Superuser admins with zero hard-coded commission formulas. | Admin Bookings -> Settlement tab |
| **Event-service pricing** | Supports both a per-request `quotedAmountMinor` entered by admin and an optional `fixedPriceMinor` on each `AddOn`. | Admin Event Requests & Add-Ons manager |
| **Support contacts & hours** | Seeded as editable placeholders in `SiteSettings`: `support@decompress.ng` (`TODO(founder)`), `+234 800 DECOMPRESS` (`TODO(founder)`), `Mon–Sat, 9:00 AM – 8:00 PM WAT` (`TODO(founder)`). | `SiteSettings` (`/admin` -> Settings) |
| **Availability response target** | Never promised or displayed in customer-facing UI. Stored only as an optional internal operational target (`internalResponseTargetMinutes = 30`) in `SiteSettings`. | `SiteSettings.internalResponseTargetMinutes` |
| **Currency** | All monetary values stored as integer minor units (e.g., kobo) alongside an ISO currency code (default `'NGN'`, configurable in `SiteSettings.defaultCurrency`). | `SiteSettings.defaultCurrency` |
| **Budget Range basis** | Each venue has `budgetMinMinor`, `budgetMaxMinor`, `currency`, and `budgetBasis` (`'per_person'`, `'per_table'`, or `'total'`), displayed exclusively as **"Budget Range"**. | Admin Venue Editor |
| **Admin roles & staff groups** | Three default staff groups (`Operations`, `Finance`, `Content & Support`) plus `Superuser`. Bootstrapped admin access is granted to the founder/runtime email (`stephenmayowa112@gmail.com`) and manageable in `/admin`. Every admin mutation is logged in `adminAuditLogs`. | `/admin` Staff & Permissions |
| **Seed locations & venues** | 18 clearly fictional sample venues across all 7 categories set in Lagos areas (Victoria Island, Ikoyi, Lekki Phase 1, Oniru, Ikeja GRA, Yaba). Tagged `TODO(founder)` for launch city confirmation. | `src/lib/seed-data.ts` & `/admin` Venues |
| **Timezone** | All timestamps stored in UTC ISO-8601 / Firestore server timestamps and formatted in `SiteSettings.defaultTimezone` (default `'Africa/Lagos'`). | `SiteSettings.defaultTimezone` |
