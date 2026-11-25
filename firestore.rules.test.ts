/**
 * Phase 0 Test Runner Specification for Hardened Firestore Rules
 * Verifies that all 12 "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: {
    uid: string;
    email?: string;
    email_verified?: boolean;
  } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_CASES: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on User Profile',
    operation: 'create',
    path: '/users/uid_victim',
    auth: { uid: 'uid_attacker', email: 'attacker@example.com', email_verified: true },
    payload: { uid: 'uid_victim', name: 'Attacker', accountType: 'personal' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Admin Spoof',
    operation: 'create',
    path: '/categories/cat_spoof',
    auth: { uid: 'uid_spoof', email: 'stephenmayowa112@gmail.com', email_verified: false },
    payload: {
      id: 'cat_spoof',
      name: 'Spoof Category',
      slug: 'spoof-category',
      description: 'Spoofed with unverified email',
      order: 1,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Self-Assigned Admin Escalation',
    operation: 'create',
    path: '/admins/uid_regular',
    auth: { uid: 'uid_regular', email: 'user@example.com', email_verified: true },
    payload: { uid: 'uid_regular', email: 'user@example.com', staffGroup: 'Superuser' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'PII Blanket Read Attack',
    operation: 'get',
    path: '/users/uid_victim/private/info',
    auth: { uid: 'uid_attacker', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Orphaned Private Profile Write without Parent User',
    operation: 'create',
    path: '/users/uid_no_parent/private/info',
    auth: { uid: 'uid_no_parent', email: 'noparent@example.com', email_verified: true },
    payload: {
      uid: 'uid_no_parent',
      email: 'noparent@example.com',
      googleLinked: false,
      emailVerified: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Shadow Field Injection on UserPublic',
    operation: 'update',
    path: '/users/uid_user',
    auth: { uid: 'uid_user', email: 'user@example.com', email_verified: true },
    payload: { uid: 'uid_user', name: 'Valid Name', accountType: 'personal', isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Unpublished FAQ Draft Scrape',
    operation: 'get',
    path: '/faqItems/faq_refunds_unpublished',
    auth: null,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Unpublished Venue Draft Read',
    operation: 'get',
    path: '/venues/venue_draft_unpublished',
    auth: null,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Denial-of-Wallet Oversized String',
    operation: 'create',
    path: '/users/uid_user',
    auth: { uid: 'uid_user', email: 'user@example.com', email_verified: true },
    payload: { uid: 'uid_user', name: 'A'.repeat(500), accountType: 'personal' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'ID Poisoning Attack',
    operation: 'create',
    path: '/categories/invalid$id!',
    auth: { uid: 'uid_admin', email: 'stephenmayowa112@gmail.com', email_verified: true },
    payload: {
      id: 'invalid$id!',
      name: 'Invalid ID',
      slug: 'invalid-id',
      description: 'Invalid ID characters',
      order: 1,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Value Poisoning on Update',
    operation: 'update',
    path: '/users/uid_user',
    auth: { uid: 'uid_user', email: 'user@example.com', email_verified: true },
    payload: { uid: 'uid_user', name: 'Valid Name', accountType: 'enterprise_hack' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unauthorized SiteSettings Mutation',
    operation: 'update',
    path: '/siteSettings/global',
    auth: { uid: 'uid_user', email: 'user@example.com', email_verified: true },
    payload: {
      supportEmail: 'hacked@example.com',
      supportPhone: '+234000',
      supportHours: '24/7',
      guestPaymentMode: 'wallet_only',
      walletEnabled: false,
      defaultCurrency: 'NGN',
      defaultTimezone: 'Africa/Lagos',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
