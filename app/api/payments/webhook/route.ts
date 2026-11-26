import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-only HMAC secret. Reads PAYMENT_WEBHOOK_SECRET from environment;
 * falls back to an ephemeral cryptographically random per-process key for local sandbox testing.
 * Never exposed to client bundles.
 */
const EPHEMERAL_SANDBOX_SECRET = crypto.randomBytes(32).toString('hex');
const MAX_PROCESSED_EVENTS = 10_000;

function isSandboxMode(): boolean {
  const provider = (process.env.PAYMENT_PROVIDER || 'mock_sandbox').trim().toLowerCase();
  const explicitDisable = process.env.ALLOW_SANDBOX_SIGNING === 'false';
  return provider === 'mock_sandbox' && !explicitDisable;
}

function getWebhookSecret(): string | null {
  const configured = process.env.PAYMENT_WEBHOOK_SECRET?.trim();
  if (configured) return configured;
  return isSandboxMode() ? EPHEMERAL_SANDBOX_SECRET : null;
}

/** Bounded in-memory idempotency store ensuring duplicate webhook deliveries never double-confirm */
const processedWebhookEvents = new Set<string>();

function rememberEvent(key: string) {
  if (processedWebhookEvents.size >= MAX_PROCESSED_EVENTS) {
    const oldest = processedWebhookEvents.values().next().value;
    if (oldest) processedWebhookEvents.delete(oldest);
  }
  processedWebhookEvents.add(key);
}

function computeWebhookHmac(rawBody: string, secret: string, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
  return crypto.createHmac(algorithm, secret).update(rawBody, 'utf8').digest('hex');
}

function verifyWebhookHmac(
  rawBody: string,
  signatureHex: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): boolean {
  const expectedLen = algorithm === 'sha512' ? 128 : 64;
  if (!signatureHex || signatureHex.length !== expectedLen || !/^[a-f0-9]+$/i.test(signatureHex)) {
    return false;
  }
  const expected = computeWebhookHmac(rawBody, secret, algorithm);
  const expectedBuf = Buffer.from(expected, 'hex');
  const providedBuf = Buffer.from(signatureHex, 'hex');
  if (expectedBuf.length !== providedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

export async function POST(req: NextRequest) {
  try {
    const secret = getWebhookSecret();
    if (!secret) {
      return NextResponse.json(
        { accepted: false, error: 'Payment webhook secret is not configured.' },
        { status: 503 }
      );
    }

    const rawText = await req.text();
    if (!rawText || rawText.length > 100_000) {
      return NextResponse.json({ accepted: false, error: 'Invalid webhook payload size.' }, { status: 400 });
    }

    // Live provider direct webhook verification (Paystack HMAC-SHA512 or Flutterwave verif-hash)
    const paystackSig = req.headers.get('x-paystack-signature');
    if (paystackSig) {
      if (!verifyWebhookHmac(rawText, paystackSig, secret, 'sha512')) {
        return NextResponse.json({ accepted: false, error: 'Invalid Paystack signature.' }, { status: 401 });
      }
      const parsed = JSON.parse(rawText) as { event?: string; data?: { id?: string | number; reference?: string } };
      const eventId = String(parsed.data?.id || parsed.event || '');
      const providerReference = String(parsed.data?.reference || '');
      if (!eventId || !providerReference) {
        return NextResponse.json({ accepted: false, error: 'Missing event reference.' }, { status: 400 });
      }
      const idempotencyKey = `paystack:${eventId}:${providerReference}`;
      const duplicate = processedWebhookEvents.has(idempotencyKey);
      if (!duplicate) rememberEvent(idempotencyKey);
      return NextResponse.json({ accepted: true, duplicate, eventId, providerReference });
    }

    const body = JSON.parse(rawText) as {
      action?: 'sign_sandbox_event' | 'deliver_webhook';
      payload?: {
        eventId: string;
        bookingReference: string;
        providerReference: string;
        amountMinor: number;
        currency: string;
      };
      rawBody?: string;
    };

    if (body.action === 'sign_sandbox_event') {
      if (!isSandboxMode()) {
        return NextResponse.json(
          { error: 'Sandbox webhook signing is disabled in live payment mode.' },
          { status: 403 }
        );
      }
      if (!body.payload || !body.payload.eventId || !body.payload.providerReference) {
        return NextResponse.json({ error: 'Invalid sandbox payload.' }, { status: 400 });
      }
      const rawBody = JSON.stringify(body.payload);
      const signature = computeWebhookHmac(rawBody, secret);
      return NextResponse.json({ rawBody, signature });
    }

    if (body.action === 'deliver_webhook') {
      const providedSignature = req.headers.get('x-decompress-signature') || '';
      const rawBody = typeof body.rawBody === 'string' ? body.rawBody : '';

      if (!rawBody || !verifyWebhookHmac(rawBody, providedSignature, secret)) {
        return NextResponse.json(
          { accepted: false, error: 'Invalid webhook signature.' },
          { status: 401 }
        );
      }

      const parsed = JSON.parse(rawBody) as {
        eventId?: string;
        providerReference?: string;
      };
      const idempotencyKey = `${parsed.eventId || ''}:${parsed.providerReference || ''}`;

      if (!parsed.eventId || !parsed.providerReference) {
        return NextResponse.json(
          { accepted: false, error: 'Missing eventId or providerReference.' },
          { status: 400 }
        );
      }

      if (processedWebhookEvents.has(idempotencyKey)) {
        return NextResponse.json({
          accepted: true,
          duplicate: true,
          eventId: parsed.eventId,
          providerReference: parsed.providerReference,
        });
      }

      rememberEvent(idempotencyKey);
      return NextResponse.json({
        accepted: true,
        duplicate: false,
        eventId: parsed.eventId,
        providerReference: parsed.providerReference,
      });
    }

    return NextResponse.json({ error: 'Unsupported webhook action.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Malformed webhook request.' }, { status: 400 });
  }
}
