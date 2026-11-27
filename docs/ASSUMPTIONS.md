# Decompress — Architecture & Configuration Notes

Configurable commercial policies, payment providers, and operational defaults are stored in `SiteSettings` and managed through `/admin` rather than hard-coded.

---

## 1. Runtime & Database Architecture

- **Full-Stack Next.js 15 + Firebase Firestore & Auth**:
  - Uses Next.js App Router for server-rendered pages and API routes (`/api/health`, `/api/guest-guard`, `/api/payments/webhook`), backed by Firebase Firestore and Firebase Authentication.
  - **Normalized Domain Modeling & Security Rules**: Core entities (`User`, `Favourite`, `Venue`, `Location`, `Category`, `ExperienceTag`, `Facility`, `Booking`, `Payment`, `Invoice`, `Wallet`, `WalletTransaction`, `Settlement`, `EventPlanningRequest`, `AddOn`, `Review`, `FAQTopic`, `FAQItem`, `SupportEnquiry`, `SiteSettings`) are validated by `firebase-blueprint.json` and `firestore.rules`.
  - **Weighted Full-Text + Similarity Search**: Scores matches across venue `name`, `experienceTags`, `categories`, `facilities`, `location`, and `description` so activity queries such as `"salsa"`, `"karaoke"`, or `"rooftop"` rank relevant venues accurately.

---

## 2. Configurable Operational Defaults

| Decision Area | Default Behaviour | Configurable Where |
| :--- | :--- | :--- |
| **Guest payment route** | `GUEST_PAYMENT_MODE = 'guest_checkout'` by default. Guests pay via tokenised `/pay/[token]` link. When switched to `'wallet_only'`, a pre-submission notice informs guests before submitting. | `SiteSettings.guestPaymentMode` (`/admin` → Settings) |
| **Wallet & payment provider** | Pluggable `PaymentProvider` adapter (`src/lib/payments/types.ts`). Wallet is gated by `SiteSettings.walletEnabled` (default `true`). | `SiteSettings.walletEnabled`, `SiteSettings.paymentProvider` |
| **Booking payment model** | No deposit percentage is hard-coded. Admins specify `amountDueMinor` and payment label (`Full Payment` or `Booking Deposit`) upon approval. | Admin Booking Approval modal |
| **Cancellation & refund policy** | Cancellations require a written reason recorded in `BookingStatusHistory`. Policy FAQ articles remain unpublished until reviewed by operations. | Admin Booking Queue & FAQ Manager |
| **Commercial settlement** | `Settlement` records capture received amounts, venue bills, agreed discounts, and net figures without hard-coded commission formulas. | Admin Bookings → Settlements |
| **Event-service pricing** | Supports per-request quotes (`quotedAmountMinor`) and optional indicative pricing on add-ons. | Admin Event Requests & Add-Ons |
| **Support contacts & hours** | Seeded editable defaults (`support@decompress.ng`, `+234 800 332 6677`, `Monday – Saturday, 9:00 AM – 8:00 PM WAT`). | `SiteSettings` (`/admin` → Settings) |
| **Currency & Budget Range** | Monetary values stored in integer minor units with ISO currency code (default `NGN`) and displayed as indicative **Budget Ranges**. | `SiteSettings.defaultCurrency`, Venue Editor |
| **Timezone** | Timestamps stored in UTC ISO-8601 and formatted in `SiteSettings.defaultTimezone` (default `Africa/Lagos`). | `SiteSettings.defaultTimezone` |
