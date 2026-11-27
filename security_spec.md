# Decompress V1 — Phase 0: Payload-First Security TDD Specification

## 1. Data Invariants

1. **Master Gate & PII Split Isolation**: User PII (`email`, `phone`, `promotionalEmailsOptIn`) lives strictly in `/users/{userId}/private/{docId}` where `docId == 'info'` and can only be read or written by the verified owner (`request.auth.uid == userId && request.auth.token.email_verified == true` and parent `/users/{userId}` exists) or a verified Decompress Admin.
2. **Saved Favourites Ownership**: Saved venues in `/users/{userId}/favourites/{favouriteId}` require parent `/users/{userId}` to exist, match `favouriteId == venueId`, and restrict all reads/creates/deletes to the verified owner (`isOwner(userId)`) or Admin.
3. **Verified-Email Guest-Booking Linking Only**: Earlier guest bookings in `/bookings/{bookingId}` (`userId == ''`) may ONLY be attached (`affectedKeys().hasOnly(['userId'])`) by a signed-in user whose `request.auth.token.email_verified == true` AND whose lowercased token email matches `existing().guestEmail`. Unverified users or non-matching emails are strictly denied. Terminal statuses (`completed`, `cancelled`, `unavailable`) are locked against non-admin edits.
4. **No Self-Assigned Admin Roles**: Only a verified bootstrapped superuser (`stephenmayowa112@gmail.com` or `onwukavivian9@gmail.com` with `email_verified == true`) or an existing verified `/admins/{uid}` member with `staffGroup == 'Superuser'` can create or update `/admins/{adminId}` documents.
5. **Public Discovery vs. Unpublished Drafts**:
   - Visitors (including unauthenticated guests) can read `/categories`, `/locations`, `/facilities`, `/experienceTags`, `/addOns`, `/siteSettings`, and `/faqTopics`.
   - Visitors can only read `/venues/{venueId}` and `/faqItems/{itemId}` when `resource.data.isPublished == true`. Unpublished FAQ drafts (such as unconfirmed refund/cancellation policies) and draft venues are readable only by verified Admins (`isAdmin()`).
6. **Strict Blueprint Key & Size Validation**: Every write to any collection must pass `isValidId()` on its document ID (max 128 chars, `^[a-zA-Z0-9_\-]+$`) and its entity validation helper `isValid[Entity](incoming())`, enforcing `.keys().hasAll(...)`, `.keys().hasOnly(...)`, string `.size()` limits, bounded arrays, and enum domains.
7. **Commercial Settlement Admin-Only Isolation**: `/settlements/{bookingId}` stores venue bills, agreed discounts, and Decompress shares. It is strictly readable and writable by verified Admins (`isAdmin()`) only — customers and guests are unconditionally denied.
8. **Verified Completed-Booking Reviews Only**: `/reviews/{reviewId}` requires `isVerified == true`, `isHidden == false` on create, and verifies via `get()` that `/bookings/{bookingId}` exists, belongs to the signed-in user (or created by Admin), and has `status == 'completed'`. Only Admins may moderate (`isHidden`).
9. **Owner-Scoped Wallet Mirror**: `/users/{userId}/wallet/primary` and `/users/{userId}/walletTransactions/{txId}` require parent `/users/{userId}` to exist and restrict access strictly to the verified owner or Admin.

---

## 2. The "Dirty Dozen" + Milestone 4–8 Adversarial Payloads

1. **Payload 1 (Identity Spoofing on User Profile)**: Authenticated user `uid_attacker` creates `/users/uid_victim` with `{ "uid": "uid_victim", "name": "Attacker", "accountType": "personal" }`. -> `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Admin Spoof)**: User with `email == "stephenmayowa112@gmail.com"` but `email_verified == false` attempts to create `/categories/cat_spoof`. -> `PERMISSION_DENIED`
3. **Payload 3 (Self-Assigned Admin Escalation)**: Regular verified user `uid_regular` attempts to create `/admins/uid_regular` with `{ "uid": "uid_regular", "email": "user@example.com", "staffGroup": "Superuser" }`. -> `PERMISSION_DENIED`
4. **Payload 4 (PII Blanket Read Attack)**: Verified user `uid_attacker` attempts `get` on `/users/uid_victim/private/info`. -> `PERMISSION_DENIED`
5. **Payload 5 (Orphaned Private Profile Write)**: Verified user `uid_user` attempts to create `/users/uid_user/private/info` when parent `/users/uid_user` does not exist. -> `PERMISSION_DENIED`
6. **Payload 6 (Shadow Field Injection on UserPublic)**: Verified user `uid_user` updates `/users/uid_user` adding `{ "isAdmin": true }`. -> `PERMISSION_DENIED`
7. **Payload 7 (Unpublished FAQ Draft Scrape)**: Unauthenticated visitor attempts `get` or `list` on `/faqItems/faq_refunds_1` where `isPublished == false`. -> `PERMISSION_DENIED`
8. **Payload 8 (Unverified Email Guest-Booking Hijack)**: User with `email == "guest@example.com"` and `email_verified == false` attempts to link `/bookings/bk_guest_1` by setting `userId`. -> `PERMISSION_DENIED`
9. **Payload 9 (Cross-User Booking Status Tampering during Linking)**: Verified user claiming `/bookings/bk_guest_1` tries to also change `status` from `"pending"` to `"confirmed"`. -> `PERMISSION_DENIED`
10. **Payload 10 (Cross-User Favourite Injection)**: Verified user `uid_attacker` creates `/users/uid_victim/favourites/ven_casa_marina_salsa`. -> `PERMISSION_DENIED`
11. **Payload 11 (Value Poisoning on Update)**: Verified user `uid_user` updates `/users/uid_user` changing `accountType` to `"enterprise_hack"` (outside `["personal", "corporate"]`). -> `PERMISSION_DENIED`
12. **Payload 12 (Unauthorized SiteSettings Mutation)**: Regular verified user `uid_user` attempts to update `/siteSettings/global` to change `guestPaymentMode` to `"wallet_only"`. -> `PERMISSION_DENIED`
13. **Payload 13 (Customer Settlement Read Leak)**: Verified customer `uid_user` attempts `get` on `/settlements/bk_1` to inspect venue bill or Decompress commercial share. -> `PERMISSION_DENIED`
14. **Payload 14 (Uncompleted Booking Review Forgery)**: Verified user `uid_user` attempts to create `/reviews/rev_fake` referencing a booking whose status is `"pending"` instead of `"completed"`. -> `PERMISSION_DENIED`
15. **Payload 15 (Cross-User Wallet Tampering)**: Verified user `uid_attacker` attempts to update `/users/uid_victim/wallet/primary` balance. -> `PERMISSION_DENIED`
