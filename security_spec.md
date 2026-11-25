# Decompress V1 — Phase 0: Payload-First Security TDD Specification

## 1. Data Invariants

1. **Master Gate & PII Split Isolation**: User PII (`email`, `phone`, `promotionalEmailsOptIn`) lives strictly in `/users/{userId}/private/{docId}` where `docId == 'info'` and can only be read or written by the verified owner (`request.auth.uid == userId && request.auth.token.email_verified == true` and parent `/users/{userId}` exists) or a verified Decompress Admin.
2. **No Self-Assigned Admin Roles**: Only a verified bootstrapped superuser (`stephenmayowa112@gmail.com` with `email_verified == true`) or an existing verified `/admins/{uid}` member with `staffGroup == 'Superuser'` can create or update `/admins/{adminId}` documents.
3. **Public Discovery vs. Unpublished Drafts**:
   - Visitors (including unauthenticated guests) can read `/categories`, `/locations`, `/facilities`, `/experienceTags`, `/addOns`, `/siteSettings`, and `/faqTopics`.
   - Visitors can only read `/venues/{venueId}` and `/faqItems/{itemId}` when `resource.data.isPublished == true`. Unpublished FAQ drafts (such as unconfirmed refund/cancellation policies) and draft venues are readable only by verified Admins (`isAdmin()`).
4. **Strict Blueprint Key & Size Validation**: Every write to any collection must pass `isValidId()` on its document ID (max 128 chars, `^[a-zA-Z0-9_\-]+$`) and its entity validation helper `isValid[Entity](incoming())`, enforcing `.keys().hasAll(...)`, `.keys().hasOnly(...)`, string `.size()` limits, bounded arrays, and enum domains.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Identity Spoofing on User Profile)**: Authenticated user `uid_attacker` creates `/users/uid_victim` with `{ "uid": "uid_victim", "name": "Attacker", "accountType": "personal" }`. -> `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Admin Spoof)**: User with `email == "stephenmayowa112@gmail.com"` but `email_verified == false` attempts to create `/venues/v1`. -> `PERMISSION_DENIED`
3. **Payload 3 (Self-Assigned Admin Escalation)**: Regular verified user `uid_regular` attempts to create `/admins/uid_regular` with `{ "uid": "uid_regular", "email": "user@example.com", "staffGroup": "Superuser" }`. -> `PERMISSION_DENIED`
4. **Payload 4 (PII Blanket Read Attack)**: Verified user `uid_attacker` attempts `get` on `/users/uid_victim/private/info`. -> `PERMISSION_DENIED`
5. **Payload 5 (Orphaned Private Profile Write)**: Verified user `uid_user` attempts to create `/users/uid_user/private/info` when parent `/users/uid_user` does not exist. -> `PERMISSION_DENIED`
6. **Payload 6 (Shadow Field Injection on UserPublic)**: Verified user `uid_user` updates `/users/uid_user` adding `{ "isAdmin": true }`. -> `PERMISSION_DENIED`
7. **Payload 7 (Unpublished FAQ Draft Scrape)**: Unauthenticated visitor attempts `get` or `list` on `/faqItems/faq_refunds_1` where `isPublished == false`. -> `PERMISSION_DENIED`
8. **Payload 8 (Unpublished Venue Draft Read)**: Unauthenticated visitor attempts `get` on `/venues/draft_venue` where `isPublished == false`. -> `PERMISSION_DENIED`
9. **Payload 9 (Denial-of-Wallet Oversized String)**: Verified user `uid_user` creates `/users/uid_user` with a `name` of 5,000 characters (`maxLength` is 120). -> `PERMISSION_DENIED`
10. **Payload 10 (ID Poisoning Attack)**: Admin attempts to create `/categories/bad$id!with/slashes` failing `^[a-zA-Z0-9_\-]+$`. -> `PERMISSION_DENIED`
11. **Payload 11 (Value Poisoning on Update)**: Verified user `uid_user` updates `/users/uid_user` changing `accountType` to `"enterprise_hack"` (outside `["personal", "corporate"]`). -> `PERMISSION_DENIED`
12. **Payload 12 (Unauthorized SiteSettings Mutation)**: Regular verified user `uid_user` attempts to update `/siteSettings/global` to change `guestPaymentMode` to `"wallet_only"`. -> `PERMISSION_DENIED`
