import { Payment, PaymentStatus } from '@/src/types/domain';
import { generateSecureToken } from '@/src/lib/booking-machine';

export interface CreateCheckoutInput {
  bookingId: string;
  bookingReference: string;
  amountMinor: number;
  currency: string;
  method: 'guest_checkout_link' | 'wallet' | 'card_sandbox';
  userId?: string | null;
}

export interface WebhookVerificationResult {
  verified: boolean;
  duplicate: boolean;
  eventId: string;
  providerReference: string;
  error?: string;
}

/**
 * Provider-agnostic PaymentProvider adapter interface (Section 9).
 * Concrete providers (Paystack, Flutterwave, Stripe, or MockSandboxProvider) implement this contract.
 */
export interface PaymentProvider {
  readonly providerName: string;
  createCheckout(input: CreateCheckoutInput): Payment;
  verifyWebhook(payload: {
    eventId: string;
    bookingReference: string;
    providerReference: string;
    amountMinor: number;
    currency: string;
  }): Promise<WebhookVerificationResult>;
  fetchStatus(payment: Payment): PaymentStatus;
  refund(payment: Payment): Payment;
}

/**
 * Fully working local/sandbox provider using server-side HMAC-SHA256 webhook signing
 * and idempotent webhook verification via /api/payments/webhook.
 */
export const MockSandboxProvider: PaymentProvider = {
  providerName: 'mock_sandbox_gateway',

  createCheckout(input: CreateCheckoutInput): Payment {
    const token = generateSecureToken('pay');
    const providerRef = `SBX-${token.slice(-10).toUpperCase()}`;
    return {
      id: generateSecureToken('id'),
      bookingId: input.bookingId,
      bookingReference: input.bookingReference,
      provider: 'mock_sandbox_gateway',
      providerReference: providerRef,
      amountMinor: input.amountMinor,
      currency: input.currency,
      status: 'pending',
      method: input.method,
      guestPayToken: token,
      createdAtUtc: new Date().toISOString(),
    };
  },

  async verifyWebhook(payload): Promise<WebhookVerificationResult> {
    // Step 1: Request server-side sandbox signature (secret never exposed to browser)
    const signRes = await fetch('/api/payments/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sign_sandbox_event',
        payload,
      }),
    });

    if (!signRes.ok) {
      return {
        verified: false,
        duplicate: false,
        eventId: payload.eventId,
        providerReference: payload.providerReference,
        error: 'Unable to sign sandbox payment event.',
      };
    }

    const signed = (await signRes.json()) as { rawBody: string; signature: string };

    // Step 2: Deliver webhook with signature header for server-side HMAC + idempotency verification
    const verifyRes = await fetch('/api/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-decompress-signature': signed.signature,
      },
      body: JSON.stringify({
        action: 'deliver_webhook',
        rawBody: signed.rawBody,
      }),
    });

    const data = (await verifyRes.json()) as {
      accepted?: boolean;
      duplicate?: boolean;
      error?: string;
    };

    if (!verifyRes.ok || !data.accepted) {
      return {
        verified: false,
        duplicate: false,
        eventId: payload.eventId,
        providerReference: payload.providerReference,
        error: data.error || 'Webhook signature verification failed.',
      };
    }

    return {
      verified: true,
      duplicate: Boolean(data.duplicate),
      eventId: payload.eventId,
      providerReference: payload.providerReference,
    };
  },

  fetchStatus(payment: Payment): PaymentStatus {
    return payment.status;
  },

  refund(payment: Payment): Payment {
    return {
      ...payment,
      status: 'refunded',
    };
  },
};
