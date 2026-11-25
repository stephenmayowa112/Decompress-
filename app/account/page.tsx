'use client';

import React from 'react';
import { useDecompress } from '@/src/context/DecompressContext';
import { BrandButton } from '@/src/components/ui/Button';

export default function AccountPage() {
  const { currentUser, signInWithGoogle, signOutUser } = useDecompress();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-brand-teal-text">Member Dashboard</p>
        <h1 className="text-3xl font-bold text-brand-navy">Your Decompress Account</h1>
        <p className="text-sm text-brand-navy/80">
          Manage your booking dashboard, Decompress wallet, saved favourites, and Personal or
          Corporate settings (full access and settings flows arrive in Milestone 3).
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-brand-navy/15 space-y-4">
        {currentUser ? (
          <div className="space-y-3">
            <p className="text-base font-bold text-brand-navy">
              Signed in as {currentUser.displayName || currentUser.email}
            </p>
            <p className="text-xs text-brand-navy/75">
              Email: {currentUser.email} · Verified:{' '}
              {currentUser.emailVerified ? 'Yes' : 'No'}
            </p>
            <BrandButton
              variant="secondary"
              size="sm"
              fullWidthOnMobile={false}
              onClick={() => signOutUser()}
            >
              Sign Out
            </BrandButton>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-brand-navy/80">
              You are currently browsing as a visitor. Visitors can browse venues and submit guest
              bookings without an account, or sign in to access account-only features.
            </p>
            <BrandButton
              variant="primary"
              size="md"
              fullWidthOnMobile={false}
              onClick={() => signInWithGoogle()}
            >
              Continue with Google
            </BrandButton>
          </div>
        )}
      </div>
    </div>
  );
}
