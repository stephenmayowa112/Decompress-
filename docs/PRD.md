# DECOMPRESS — Product Requirements & V1 Launch Scope

*Source of truth | Updated working document: 10 November 2026 (with FAQ specification & 22 November 2026 Build Prompt alignment)*

> A platform for discovering social experiences, booking venues and arranging support so customers can spend less time organising and more time enjoying their plans.

---

## 1. Product Overview

Decompress is a social-experience discovery and booking platform. It helps individuals and companies find suitable venues and activities, submit booking requests, make payments and access optional event-planning and coordination support.

The product is intended to make organising a social outing easier. A customer should be able to discover a venue, understand its indicative **Budget Range**, request a booking and, where needed, ask Decompress to help coordinate the event. The organiser should not have to spend the entire event managing arrangements.

### Product Objectives
- Make it easy to discover venues and activities by name, location, category, occasion and Budget Range.
- Allow visitors to browse without creating an account.
- Allow customers to submit a booking as guests, without mandatory registration.
- Offer account-based features such as a personal booking dashboard, wallet, transaction history and saved venues to registered users.
- Provide manual booking support and event coordination in the first release where venue systems are not integrated.
- Collect real customer feedback after launch and use it to guide V2.

---

## 2. V1 Product Direction

V1 is **concierge-style**. The public website collects discovery traffic and booking requests; the Decompress admin team manually confirms availability with venues, tracks payments and fulfils event-planning requests. There is **no live availability** and **no venue-system integration** in V1. Commercial rules, payment-provider arrangements and unresolved operational policies are configurable and tagged `TODO(founder)` until confirmed.

---

## 3. User Access, Registration and Sign-In

| User Action | Account Required? |
| :--- | :--- |
| Visit the website and browse the homepage | No |
| Search venues, activities, categories and locations | No |
| View venue pages, photos, facilities and Budget Ranges | No |
| Submit a booking request as a guest | No |
| View personal booking history and manage bookings in an account dashboard | Yes |
| Use the Decompress wallet and view wallet transactions | Yes |
| Save favourites and manage a personal or corporate profile | Yes |

### Registration & Sign-In Rules
- Manual registration using required details and email/password (`personal` or `corporate` account type; corporate adds `company_name`).
- Separate **Continue with Google** option for sign-up and sign-in; pre-fills basic profile details (name, email) with permission.
- Customers can browse and make a guest booking without being forced to register mid-flow.
- When a user registers or signs in with a **verified** email matching earlier guest bookings, those guest bookings are attached to the account. Never attach on an unverified email.

---

## 4. Venue Categories, Experiences & Occasions

| Main Category | Examples |
| :--- | :--- |
| **Restaurants & Dining** | Fine dining, casual eateries, Nigerian and international cuisine, rooftop restaurants, buffet |
| **Nightlife** | Clubs, lounges, bars, beach clubs, rooftop bars |
| **Music & Entertainment** | Karaoke, live bands, salsa/dance, live performances, comedy |
| **Hotels & Resorts** | Hotels with relevant dining, leisure or event facilities; resorts and beach resorts |
| **Event Venues** | Event centres, wedding/reception venues, conference centres, private-party and outdoor venues |
| **Games & Recreation** | Bowling, paintball, go-karting, arcades, escape rooms and similar activities |
| **Relaxation & Experiences** | Spas, wellness centres, swimming pools, private lounges and leisure experiences |

- A venue may belong to multiple categories.
- Hotels are included only where they offer relevant dining, leisure, accommodation or event experiences (not a general hotel-booking product).
- **Occasions**: Date night; birthday celebration; friends' hangout; family outing; corporate hangout and team bonding; team dinner; company outing; office celebration; end-of-year event; private event; wedding celebration; other special occasion.

---

## 5. Discovery, Search & Filters

- **One main search box** matching venue name, category, activity and experience terms (e.g., searching `"salsa"` returns venues offering salsa via weighted search across name, description, categories, experience tags and facilities).
- **Primary discovery controls**: Search, Location (city, area, neighbourhood), Category, Budget Range.
- **Expandable More Filters**: Occasion or experience type; venue setting (`indoor`, `outdoor`, `rooftop`, `beachfront`); group size or capacity; facilities (`pool`, `parking`, `private room`, `Wi-Fi`, `live music`, etc. linked to applicable categories); booking type (`table`, `group`, `private_hire`); minimum rating; optional date strictly to pre-fill the booking form (never implying live availability).
- **Budget Range terminology**: Always use **"Budget Range"** (never "Minimum Spend"). It is an indicative guide, never a blocker.
- Filter state lives in the URL query string so searches are shareable.

---

## 6. Venue Details Page (`/venues/[slug]`)

Displays available and relevant data only (hiding any empty section):
- Venue name, description and photo gallery
- Address, area and location information
- Categories and experiences offered
- Indicative Budget Range (with basis: per person, per table, or total)
- Opening hours and relevant operating information
- Facilities and guest capacity (where supplied)
- Confirmed offers or discounts only (`is_confirmed = true`)
- Additional Decompress services (event planning & add-ons)
- Ratings and verified customer reviews (yellow stars)
- Clear **Book Now** action button (Coral fill)

---

## 7. Booking Request & Manual Availability Workflow

1. Customer submits a booking request: venue, date, preferred time, guest count, occasion/event type, booking type, contact details, special requests, and optional event-planning service or add-ons.
2. System creates a booking with reference `DCP-XXXXXX` (unambiguous alphanumerics) and status `pending`, logs initial history, places it in the admin queue, and sends an acknowledgement email.
3. Admin contacts the venue and records the outcome: `approved` (setting `amount_due` in minor units) or `unavailable`. Customer is notified.
4. For `approved`, customer receives payment instructions / tokenised checkout link (`/pay/[token]`) or pays via wallet.
5. On successful idempotent payment webhook/confirmation, booking transitions to `confirmed` and confirmation + downloadable PDF invoice are issued.
6. After the event, admin marks the booking `completed`, unlocking verified reviews.
- **Statuses**: `pending`, `approved`, `unavailable`, `confirmed`, `completed`, `cancelled` (admin action with reason). Every transition is logged in `BookingStatusHistory` with actor, timestamp and note.

---

## 8. Event Planning & Coordination

- **Service levels**:
  1. `Event planning assistance` — Help discover a suitable venue and organise main arrangements.
  2. `On-the-day event coordination` — A coordinator manages arrangements and timing on the event day.
  3. `Full event planning and coordination` — Support from initial planning through to event-day coordination.
- **Optional event add-ons**:
  1. `Event coordinator`
  2. `Professional photographer`
  3. `Event content creator`
  4. `Coordinator and content-creator package`
- **Statuses**: `new`, `in_discussion`, `quoted`, `accepted`, `in_progress`, `completed`, `declined`.
- Supports both a quoted amount per request and an optional fixed price per add-on (`TODO(founder)`).

---

## 9. Payments, Wallet, Invoices & Reconciliation

- **PaymentProvider adapter interface**: `createCheckout`, `verifyWebhook`, `fetchStatus`, `refund` with a full Mock/Sandbox provider in development.
- **Guest payment mode (`GUEST_PAYMENT_MODE`)**: `guest_checkout` (default, tokenised `/pay/[token]` link) or `wallet_only` (displays a clear notice before submission so there is never a surprise registration requirement).
- **Wallet (`WALLET_ENABLED`)**: Account-only mirror of fintech-backed balance, funding, booking payment, transaction history, and refund/reversal tracking.
- **Invoices**: Booking reference, venue/event details, itemised charges, discounts/fees, amount paid, payment status, and downloadable PDF once paid.
- **Internal Settlement (admin-only)**: `customer_amount_received`, `venue_bill_amount`, `venue_bill_file`, `agreed_discount`, `decompress_share`, `amount_payable_to_venue`, `amount_retained`, `settlement_status` — all free-form editable by admin with zero hard-coded formulas.

---

## 10. Reviews, FAQ & Customer Support

- **Verified Reviews**: Available only on `completed` bookings (1–5 yellow stars + optional venue and Decompress experience feedback). Guests receive a one-time review token link. Admins can moderate/hide reviews.
- **FAQ (`/faq`)**: Publicly accessible without login; grouped by topic with expandable plain-language answers and lightweight search. Only `is_published = true` items appear publicly. All 6 topics and 21 questions are seeded as **unpublished drafts**; refund, cancellation and payment answers remain unpublished until founder confirmation.
- **Contact Us (`/contact`) & Settings Help & Support**: Displays customer-care email, phone and support hours from `SiteSettings` plus a public support enquiry form visible in `/admin`.
