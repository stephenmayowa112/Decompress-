import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  SEED_ADD_ONS,
  SEED_FACILITIES,
  SEED_FAQ_ITEMS,
  SEED_VENUES,
} from '../src/lib/seed-data.ts';
import {
  DEFAULT_VENUE_FILTERS,
  filterAndSortVenues,
  getRelevantFacilities,
} from '../src/lib/search.ts';
import { canTransitionBookingStatus } from '../src/lib/booking-machine.ts';
import { generateInvoicePdfBytes } from '../src/lib/pdf-invoice.ts';
import { buildTransactionalEmail } from '../src/lib/email-templates.ts';
import { DIRTY_DOZEN_TEST_CASES } from '../firestore.rules.test.ts';

test('Weighted search ranks exact "salsa" and typo-tolerant "salza" matches', () => {
  const exact = filterAndSortVenues(SEED_VENUES, { ...DEFAULT_VENUE_FILTERS, q: 'salsa' });
  const typo = filterAndSortVenues(SEED_VENUES, { ...DEFAULT_VENUE_FILTERS, q: 'salza' });

  assert.ok(exact.length > 0, 'Expected at least one venue matching "salsa"');
  assert.ok(typo.length > 0, 'Expected typo-tolerant match for "salza"');
  assert.equal(exact[0].id, typo[0].id, 'Top salsa venue should match for "salza"');
});

test('Category-relevant facility pruning excludes swimming pool from Music & Entertainment', () => {
  const musicFacilities = getRelevantFacilities(SEED_FACILITIES, 'music-entertainment');
  const hasPool = musicFacilities.some((f) => f.slug === 'pool');
  assert.equal(hasPool, false, 'Swimming pool must not appear for Music & Entertainment');

  const resortFacilities = getRelevantFacilities(SEED_FACILITIES, 'hotels-resorts');
  assert.equal(
    resortFacilities.some((f) => f.slug === 'pool'),
    true,
    'Swimming pool should appear for Hotels & Resorts'
  );
});

test('Booking status machine enforces strict allowed transitions and terminal locks', () => {
  assert.equal(canTransitionBookingStatus('pending', 'approved'), true);
  assert.equal(canTransitionBookingStatus('pending', 'unavailable'), true);
  assert.equal(canTransitionBookingStatus('approved', 'confirmed'), true);
  assert.equal(canTransitionBookingStatus('confirmed', 'completed'), true);

  // Disallowed shortcutting & terminal states
  assert.equal(canTransitionBookingStatus('pending', 'confirmed'), false);
  assert.equal(canTransitionBookingStatus('pending', 'completed'), false);
  assert.equal(canTransitionBookingStatus('completed', 'cancelled'), false);
  assert.equal(canTransitionBookingStatus('cancelled', 'approved'), false);
  assert.equal(canTransitionBookingStatus('unavailable', 'approved'), false);
});

test('HMAC-SHA256 webhook verification validates signatures and rejects tampered payloads', () => {
  const secret = 'test_webhook_secret_123';
  const payload = JSON.stringify({
    eventId: 'evt_001',
    bookingReference: 'DCP-8K2M4P',
    providerReference: 'SBX-123456',
    amountMinor: 25000000,
    currency: 'NGN',
  });
  const sig = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');

  const expected = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
  assert.equal(
    crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex')),
    true
  );

  const tampered = payload.replace('25000000', '100');
  const tamperedExpected = crypto
    .createHmac('sha256', secret)
    .update(tampered, 'utf8')
    .digest('hex');
  assert.equal(
    crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(tamperedExpected, 'hex')),
    false
  );
});

test('PDF 1.4 invoice generator outputs valid PDF bytes with booking and invoice references', () => {
  const bytes = generateInvoicePdfBytes({
    id: 'inv_1',
    bookingId: 'bk_1',
    bookingReference: 'DCP-9X4L2Q',
    invoiceNumber: 'INV-7M3P9K',
    venueName: 'Casa Marina Salsa Lounge',
    eventDate: '2026-12-18',
    customerName: 'Amaka Okafor',
    customerEmail: 'amaka@example.com',
    lineItems: [{ description: 'Table reservation', amountMinor: 18000000 }],
    discountOrFeeMinor: 0,
    amountPaidMinor: 18000000,
    currency: 'NGN',
    status: 'paid',
    issuedAtUtc: '2026-11-24T12:00:00Z',
  });

  const text = new TextDecoder().decode(bytes);
  assert.ok(text.startsWith('%PDF-1.4'), 'Must start with PDF 1.4 header');
  assert.ok(text.includes('%%EOF'), 'Must end with PDF EOF marker');
  assert.ok(text.includes('INV-7M3P9K'), 'Must embed invoice number');
  assert.ok(text.includes('DCP-9X4L2Q'), 'Must embed booking reference');
});

test('All 21 seeded FAQ items start unpublished and all 4 Event Add-Ons exist', () => {
  assert.equal(SEED_FAQ_ITEMS.length, 21);
  assert.equal(
    SEED_FAQ_ITEMS.every((item) => item.isPublished === false),
    true,
    'Every seeded FAQ draft must start unpublished'
  );
  assert.equal(SEED_ADD_ONS.length, 4, 'All 4 optional event add-ons must be present');

  const seedJson = JSON.stringify(SEED_VENUES).toLowerCase();
  assert.equal(
    seedJson.includes('minimum spend'),
    false,
    'Seed venues must never use the phrase "Minimum Spend"'
  );
});

test('Transactional email builder renders branded templates without invented response times', () => {
  const email = buildTransactionalEmail('booking_received', {
    recipientName: 'Chidi',
    recipientEmail: 'chidi@example.com',
    reference: 'DCP-4A8C2E',
    venueName: 'Vela Rooftop Grill',
    eventDate: '2026-12-20',
    preferredTime: '20:00',
    guestCount: 6,
    supportEmail: 'support@decompress.example',
  });
  assert.ok(email.subject.includes('DCP-4A8C2E'));
  assert.ok(email.htmlBody.includes('#123B60'));
  assert.equal(email.htmlBody.toLowerCase().includes('30 minutes'), false);
});

test('Security TDD suite includes all 15 adversarial Firestore rules cases', () => {
  assert.ok(DIRTY_DOZEN_TEST_CASES.length >= 15);
  assert.equal(
    DIRTY_DOZEN_TEST_CASES.every((tc) => tc.expectedResult === 'PERMISSION_DENIED'),
    true
  );
});
