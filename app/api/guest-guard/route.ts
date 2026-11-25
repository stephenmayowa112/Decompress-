import { NextRequest, NextResponse } from 'next/server';

const WINDOW_MS = 10 * 60 * 1000; // 10-minute sliding window
const MAX_REQUESTS_PER_WINDOW = 12;

const ipBuckets = new Map<string, number[]>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown-client';
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      formType?: string;
      honeypot?: string;
    };

    // Honeypot check: bots filling hidden fields are rejected cleanly
    if (typeof body.honeypot === 'string' && body.honeypot.trim().length > 0) {
      return NextResponse.json(
        { allowed: false, error: 'Submission rejected by spam protection.' },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);
    const bucketKey = `${ip}:${String(body.formType || 'general').slice(0, 32)}`;
    const now = Date.now();
    const recent = (ipBuckets.get(bucketKey) || []).filter((ts) => now - ts < WINDOW_MS);

    if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        {
          allowed: false,
          error: 'Too many submissions in a short period. Please wait a few minutes and try again.',
        },
        { status: 429 }
      );
    }

    recent.push(now);
    ipBuckets.set(bucketKey, recent);

    return NextResponse.json({
      allowed: true,
      remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - recent.length),
    });
  } catch {
    return NextResponse.json(
      { allowed: false, error: 'Invalid request payload.' },
      { status: 400 }
    );
  }
}
