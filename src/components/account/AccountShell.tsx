'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarCheck,
  Heart,
  Settings,
  Wallet,
  LogOut,
  MailWarning,
  CheckCircle2,
  Building2,
  User,
  RefreshCw,
} from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { BrandButton, BrandLinkButton } from '@/src/components/ui/Button';
import { mapAuthErrorMessage } from '@/src/lib/auth-helpers';
import { cn } from '@/lib/utils';

export interface AccountShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AccountShell({ title, subtitle, children }: AccountShellProps) {
  const pathname = usePathname();
  const {
    currentUser,
    userProfile,
    authReady,
    siteSettings,
    favouriteVenueIds,
    userBookings,
    linkedGuestBookingsCount,
    resendVerificationEmail,
    refreshUserVerification,
    signOutUser,
  } = useDecompress();

  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [verifyBusy, setVerifyBusy] = useState(false);

  const navItems = [
    {
      href: '/account',
      label: 'Bookings',
      count: userBookings.length,
      icon: CalendarCheck,
    },
    ...(siteSettings.walletEnabled
      ? [
          {
            href: '/account/wallet',
            label: 'Wallet',
            count: undefined,
            icon: Wallet,
          },
        ]
      : []),
    {
      href: '/account/favourites',
      label: 'Favourites',
      count: favouriteVenueIds.length,
      icon: Heart,
    },
    {
      href: '/account/settings',
      label: 'Settings',
      count: undefined,
      icon: Settings,
    },
  ];

  const handleResendVerification = async () => {
    setVerifyBusy(true);
    setVerifyMsg(null);
    try {
      await resendVerificationEmail();
      setVerifyMsg(
        'Verification email sent! Click the link in your inbox, then select "Refresh Verification Status".'
      );
    } catch (err) {
      setVerifyMsg(mapAuthErrorMessage(err));
    } finally {
      setVerifyBusy(false);
    }
  };

  const handleRefreshVerification = async () => {
    setVerifyBusy(true);
    setVerifyMsg(null);
    try {
      const verified = await refreshUserVerification();
      if (verified) {
        setVerifyMsg(
          'Email verified! Your profile, saved favourites, and verified-email guest booking linking are now active.'
        );
      } else {
        setVerifyMsg(
          'Your email is not marked verified yet. Please click the verification link in your inbox and try again.'
        );
      }
    } catch (err) {
      setVerifyMsg(mapAuthErrorMessage(err));
    } finally {
      setVerifyBusy(false);
    }
  };

  if (!authReady) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 text-sm text-brand-navy">
        Loading your account...
      </div>
    );
  }

  if (!currentUser) {
    const nextQuery = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-2xl bg-white p-6 sm:p-10 border border-brand-navy/15 space-y-6 text-center">
          <p className="text-xs font-semibold text-brand-teal-text">Account-Only Section</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy">
            Sign in to access your Decompress account
          </h1>
          <p className="text-sm sm:text-base text-brand-navy/80 max-w-lg mx-auto leading-relaxed">
            Your booking dashboard, saved favourites, Decompress wallet, and Personal or Corporate
            profile settings are available to registered members. Visitors can always browse venues
            and submit guest bookings without an account.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
            <BrandLinkButton href={`/login${nextQuery}`} variant="primary" size="md">
              Sign In
            </BrandLinkButton>
            <BrandLinkButton href={`/register${nextQuery}`} variant="secondary" size="md">
              Create Account
            </BrandLinkButton>
          </div>
          <div className="pt-2">
            <Link
              href="/venues"
              className="text-sm font-semibold text-brand-teal-text hover:underline"
            >
              Continue browsing venues as a guest →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = userProfile?.name || currentUser.displayName || currentUser.email || 'Member';
  const accountTypeLabel =
    userProfile?.accountType === 'corporate'
      ? `Corporate${userProfile.companyName ? ` · ${userProfile.companyName}` : ''}`
      : 'Personal Account';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Account Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-brand-navy/10">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-teal-text">
            {userProfile?.accountType === 'corporate' ? (
              <Building2 className="h-4 w-4 text-brand-teal shrink-0" />
            ) : (
              <User className="h-4 w-4 text-brand-teal shrink-0" />
            )}
            <span>{accountTypeLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate text-brand-navy/75">{currentUser.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy">{title}</h1>
          <p className="text-sm text-brand-navy/75">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="hidden sm:inline text-sm font-semibold text-brand-navy">
            {displayName}
          </span>
          <button
            type="button"
            onClick={() => signOutUser()}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border border-brand-navy/20 bg-white text-xs sm:text-sm font-semibold text-brand-navy hover:bg-surface-teal transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-brand-teal shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Email Verification Gate Banner */}
      {!currentUser.emailVerified && (
        <div
          role="status"
          className="rounded-2xl bg-brand-yellow/20 border border-brand-yellow p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-start gap-3">
            <MailWarning className="h-5 w-5 text-brand-navy shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-bold text-brand-navy">
                Verify your email address to unlock full account features
              </p>
              <p className="text-xs sm:text-sm text-brand-navy/85 leading-relaxed">
                We sent a verification link to <strong>{currentUser.email}</strong>. Saving
                favourites, syncing profile settings, and attaching earlier guest bookings strictly
                require a verified email address.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
            <BrandButton
              type="button"
              variant="secondary"
              size="sm"
              disabled={verifyBusy}
              onClick={handleRefreshVerification}
            >
              <RefreshCw className="h-4 w-4" />
              <span>I&apos;ve Verified — Refresh Status</span>
            </BrandButton>
            <BrandButton
              type="button"
              variant="alternative"
              size="sm"
              disabled={verifyBusy}
              onClick={handleResendVerification}
            >
              Resend Verification Email
            </BrandButton>
          </div>
          {verifyMsg && <p className="text-xs font-semibold text-brand-navy">{verifyMsg}</p>}
        </div>
      )}

      {/* Positive Verified-Email Guest-Booking Linking Confirmation */}
      {currentUser.emailVerified && linkedGuestBookingsCount > 0 && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl bg-surface-teal border border-brand-teal/35 p-4 text-sm text-brand-navy"
        >
          <CheckCircle2 className="h-5 w-5 text-brand-teal shrink-0 mt-0.5" />
          <p>
            <strong>
              Attached {linkedGuestBookingsCount} earlier guest{' '}
              {linkedGuestBookingsCount === 1 ? 'booking' : 'bookings'}
            </strong>{' '}
            matching your verified email ({currentUser.email}) to your Decompress account.
          </p>
        </div>
      )}

      {/* Responsive Account Navigation + Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <nav
          aria-label="Account Sections"
          className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between gap-2 min-h-[46px] px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors border',
                  isActive
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-white text-brand-navy border-brand-navy/10 hover:bg-surface-teal'
                )}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Icon
                    className={cn('h-4 w-4 shrink-0', isActive ? 'text-brand-yellow' : 'text-brand-teal')}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.count === 'number' && (
                  <span
                    className={cn(
                      'text-xs tabular-nums shrink-0',
                      isActive ? 'text-surface-teal' : 'text-brand-teal-text'
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="lg:col-span-9 min-w-0 space-y-6">{children}</div>
      </div>
    </div>
  );
}
