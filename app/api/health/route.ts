import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'decompress',
      timestamp: new Date().toISOString(),
      paymentMode: (process.env.PAYMENT_PROVIDER || 'mock_sandbox').trim().toLowerCase(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
