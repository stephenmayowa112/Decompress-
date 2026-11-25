import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-only HMAC secret. Reads PAYMENT_WEBHOOK_SECRET from environment;
 * falls back to an ephemeral cryptographically random per-process key for local sandbox testing.
 * Never exposed to client bundles.
 */
const EPHEMERAL_SANDBOX_SECRET = crypto.randomBytes(32).toString('hex');

function getWebhookSecret(): string {
  return process.env.PAYMENT_WEBHOOK_SECRET || EPHEMERAL_SANDBOX_SECRET;
}

/** In-memory idempotency store ensuring duplicate webhook deliveries never double-confirm */
const processedWebhookEvents = new Set<string>();

function computeWebhookHmac(rawBody: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
}

function verifyWebhookHmac(
  rawBody: string,
  signatureHex: string,
  secret: string
): boolean {
  if (!signatureHex || !/^[a-f0-9]{64}$/i.test(signatureHex)) {
    return false;
  }
  const expected = computeWebhookHmac(rawBody, secret);
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
    const body = (await req.json()) as {
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

      processedWebhookEvents.add(idempotencyKey);
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
