import { NextRequest, NextResponse } from 'next/server';

const WINDOW_MS = 10 * 60 * 1000; // 10-minute sliding window
const MAX_REQUESTS_PER_WINDOW = 12;
const MAX_TRACKED_BUCKETS = 5_000;

const ipBuckets = new Map<string, number[]>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim().slice(0, 64);
  }
  return (req.headers.get('x-real-ip') || 'unknown-client').slice(0, 64);
}

function pruneStaleBuckets(now: number) {
  if (ipBuckets.size < MAX_TRACKED_BUCKETS) return;
  for (const [key, timestamps] of ipBuckets.entries()) {
    const active = timestamps.filter((ts) => now - ts < WINDOW_MS);
    if (active.length === 0) {
      ipBuckets.delete(key);
    } else {
      ipBuckets.set(key, active);
    }
  }
  if (ipBuckets.size >= MAX_TRACKED_BUCKETS) {
    const oldestKey = ipBuckets.keys().next().value;
    if (oldestKey) ipBuckets.delete(oldestKey);
  }
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
    const formType = String(body.formType || 'general')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 32);
    const bucketKey = `${ip}:${formType || 'general'}`;
    const now = Date.now();

    pruneStaleBuckets(now);

    const recent = (ipBuckets.get(bucketKey) || []).filter((ts) => now - ts < WINDOW_MS);

    if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
      const oldestInWindow = recent[0] ?? now;
      const retryAfterSeconds = Math.max(1, Math.ceil((WINDOW_MS - (now - oldestInWindow)) / 1000));
      return NextResponse.json(
        {
          allowed: false,
          error: 'Too many submissions in a short period. Please wait a few minutes and try again.',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds) },
        }
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
