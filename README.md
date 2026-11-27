# Decompress

Mobile-first social-experience discovery, concierge venue booking, and event planning platform built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Firebase (Firestore & Auth)**.

Built by **Dreamily Tech Studio**.

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
4. **Run automated tests, lint & build**
   ```bash
   npx tsx --test tests/decompress.test.ts
   npm run lint
   npm run build
   ```

---

## Firebase Setup & Auth Configuration

- Configure your Firestore database and deploy `firestore.rules` via Firebase CLI.
- **Google Sign-In** and **Email/Password Sign-In** can be managed in **Firebase Console → Authentication → Sign-in method**.
- Sign in with an administrator account and visit `/admin` → **Venues & Settings** to configure site settings, manage venues, and sync initial catalog data.

---

## Core Features

- **Discovery & Search (`/`, `/venues`, `/venues/[slug]`, `/experiences`)**:
  - Curated Lagos venues across 7 categories with indicative **Budget Ranges**.
  - Weighted search with typo tolerance, URL-synced filters, category-filtered facilities, and preferred-date pre-fill.
- **Guest & Member Bookings (`/book/[venueSlug]`, `/account`)**:
  - Guest booking requests supported alongside authenticated Personal and Corporate accounts, with server-side rate limiting (`/api/guest-guard`) and `DCP-XXXXXX` booking references.
  - Verified-email members automatically link earlier guest bookings.
- **Operations, Payments, PDF Invoices & Settlements (`/admin`, `/pay/[token]`)**:
  - Admin approval flow with tokenised `/pay/[token]` payment links, HMAC-verified webhooks (`/api/payments/webhook`), downloadable **PDF Invoices**, and commercial settlement tracking.
- **Event Planning (`/plan-event`)**:
  - Three structured service levels and optional creative add-ons with `EVR-XXXXXX` request tracking.
- **Wallet (`/account/wallet`)**:
  - Feature-flagged account wallet supporting top-ups, approved-booking checkout, and transaction history.
- **Verified Reviews, Help Centre & Support (`/review/[token]`, `/faq`, `/contact`)**:
  - Verified post-visit reviews tied to completed bookings, live Help Centre CMS management, and customer care enquiry tracking.
