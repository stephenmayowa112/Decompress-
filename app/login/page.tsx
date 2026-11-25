import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { LoginClient } from '@/src/components/auth/LoginClient';

export const metadata: Metadata = {
  title: 'Sign In | Decompress',
  description:
    'Sign in to your Decompress account with email and password or Continue with Google to manage bookings, saved favourites, and profile settings.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-12 text-center text-sm text-brand-navy">
          Loading sign-in...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
