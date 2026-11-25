# Decompress V1

Mobile-first social-experience discovery, concierge venue booking, and event planning platform built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Firebase (Firestore & Auth)**.

---

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   Copy `.env.example` to `.env.local` and set server-only secrets (`PAYMENT_WEBHOOK_SECRET`, `APP_URL`, etc.). Never expose secrets via `NEXT_PUBLIC_`.
3. **Run the development server (port 3000)**
   ```bash
   npm run dev
   ```
4. **Run automated tests & lint**
   ```bash
   npx tsx --test tests/decompress.test.ts
   npm run lint
   npx eslint firestore.rules DRAFT_firestore.rules
   npm run build
   ```

---

## Firebase Setup & Email/Password Auth Note

- Firestore database (`ai-studio-4ffb0036-2702-4fdf-9b82-4a2f1a634849`) and hardened `firestore.rules` are provisioned and deployed.
- **Google Sign-In** is enabled automatically.
- To enable **Email & Password Sign-In** in production: open your Firebase Console → **Authentication → Sign-in method** → enable **Email/Password**.
- Sign in with the bootstrapped founder superuser account (`stephenmayowa112@gmail.com`) and open `/admin` → **Venues & Settings** → **Sync Seed Data to Firestore** to push the 18 sample Lagos venues, 7 categories, 8 locations, 10 facilities, 14 experience tags, 4 event add-ons, and 21 unpublished FAQ drafts into Firestore.

---

## V1 Pre-Launch End-to-End Checklist

- **Discovery & Search (`/`, `/venues`, `/venues/[slug]`, `/experiences`)**:
  - 18 Lagos venues across 7 categories with indicative **Budget Ranges** (never "Minimum Spend").
  - Weighted search with typo tolerance (`"salsa"`, `"salza"`), URL-synced filters, category-pruned facilities, and preferred-date pre-fill with explicit non-live-availability copy.
- **Guest & Member Bookings (`/book/[venueSlug]`, `/account`)**:
  - Guest checkout works without forced account creation, protected by server-side honeypot + IP rate limiting (`/api/guest-guard`), generating `DCP-XXXXXX` references.
  - Verified-email members automatically link earlier guest bookings.
- **Admin Approvals, Payments, PDF Invoices & Settlements (`/admin`, `/pay/[token]`)**:
  - Admin approves bookings with confirmed Amount Due, generating tokenised `/pay/[token]` links and branded transactional emails.
  - Sandbox payment provider verifies HMAC-SHA256 webhooks with idempotency (`/api/payments/webhook`), confirms bookings once, issues downloadable **PDF Invoices**, and unlocks **Admin-Only Commercial Settlements** (free-form editable, zero hard-coded formulas).
- **Event Planning (`/plan-event`)**:
  - 3 service levels & 4 optional add-ons with `EVR-XXXXXX` tracking across all 7 statuses (`new` → `completed`/`declined`).
- **Wallet (`/account/wallet`)**:
  - Feature-flagged (`siteSettings.walletEnabled`) provider-backed mirror with funding, approved-booking checkout, and transaction history.
- **Verified Reviews, Live FAQ CMS & Support (`/review/[token]`, `/faq`, `/contact`)**:
  - One-time Verified reviews tied strictly to `completed` bookings (1–5 golden yellow stars + optional venue & Decompress feedback).
  - Public `/faq` shows strictly `isPublished === true` items with live Admin CMS publishing and founder-confirmation warnings on refund/cancellation drafts.
  - Public `/contact` logs support enquiries into `/admin`.
