import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { RegisterClient } from '@/src/components/auth/RegisterClient';

export const metadata: Metadata = {
  title: 'Create Account | Decompress',
  description:
    'Register a Personal or Corporate Decompress account using email and password or Continue with Google.',
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-12 text-center text-sm text-brand-navy">
          Loading registration...
        </div>
      }
    >
      <RegisterClient />
    </Suspense>
  );
}
