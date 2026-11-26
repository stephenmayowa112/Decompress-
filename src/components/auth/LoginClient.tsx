'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { BrandButton } from '@/src/components/ui/Button';
import { getSafeRedirectPath, mapAuthErrorMessage } from '@/src/lib/auth-helpers';

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeRedirectPath(searchParams.get('next'), '/account');

  const { currentUser, signInWithEmail, signInWithGoogle, sendPasswordReset } = useDecompress();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  if (currentUser) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-2xl bg-white p-6 sm:p-8 border border-brand-navy/15 space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-teal text-brand-teal-text">
            <CheckCircle2 className="h-6 w-6 text-brand-teal" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-brand-navy">You are already signed in</h1>
            <p className="text-sm text-brand-navy/75">
              Signed in as <strong className="text-brand-navy">{currentUser.email}</strong>.
            </p>
          </div>
          <BrandButton
            type="button"
            variant="primary"
            size="md"
            onClick={() => router.push(nextPath)}
            className="w-full"
          >
            Go to Your Account
          </BrandButton>
        </div>
      </div>
    );
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      router.push(nextPath);
    } catch (err) {
      setErrorMsg(mapAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      router.push(nextPath);
    } catch (err) {
      setErrorMsg(mapAuthErrorMessage(err));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    const target = (resetEmail || email).trim();
    if (!target) {
      setErrorMsg('Enter your email address to receive a password reset link.');
      return;
    }
    setSubmitting(true);
    try {
      await sendPasswordReset(target);
      setInfoMsg(
        `If an account exists for ${target}, a password reset link has been sent to that inbox.`
      );
      setShowResetForm(false);
    } catch (err) {
      setErrorMsg(mapAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-10 sm:py-14 space-y-6">
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy/70 hover:text-brand-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-xs sm:text-sm font-semibold text-brand-teal-text">Member Access</p>
        <h1 className="text-3xl font-bold text-brand-navy">Sign in to Decompress</h1>
        <p className="text-sm text-brand-navy/75">
          Access your booking dashboard, saved venues, wallet, and profile settings.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 sm:p-8 border border-brand-navy/15 space-y-6">
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl bg-brand-coral/10 border border-brand-coral/35 p-3.5 text-sm text-brand-coral-text"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl bg-surface-teal border border-brand-teal/35 p-3.5 text-sm text-brand-navy"
          >
            <CheckCircle2 className="h-4 w-4 text-brand-teal shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* 1. Manual Email / Password Form */}
        {!showResetForm ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-semibold text-brand-navy">
                Email Address
              </label>
              <div className="relative flex items-center rounded-xl border border-brand-navy/20 bg-surface focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/25">
                <Mail className="h-4 w-4 text-brand-teal ml-3 shrink-0" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full min-h-[44px] bg-transparent px-3 py-2 text-sm text-brand-navy placeholder:text-brand-navy/45 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-brand-navy"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowResetForm(true);
                    setErrorMsg(null);
                  }}
                  className="text-xs font-semibold text-brand-teal-text hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center rounded-xl border border-brand-navy/20 bg-surface focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/25">
                <Lock className="h-4 w-4 text-brand-teal ml-3 shrink-0" aria-hidden="true" />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full min-h-[44px] bg-transparent px-3 py-2 text-sm text-brand-navy placeholder:text-brand-navy/45 focus:outline-none"
                />
              </div>
            </div>

            <BrandButton
              type="submit"
              variant="secondary"
              size="md"
              disabled={submitting || googleSubmitting}
              className="w-full"
            >
              {submitting ? 'Signing in...' : 'Sign In with Email'}
            </BrandButton>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-brand-navy">Reset your password</h2>
              <p className="text-xs text-brand-navy/75">
                We will send a secure password reset link to your email address.
              </p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="block text-xs font-semibold text-brand-navy">
                Account Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <BrandButton
                type="submit"
                variant="secondary"
                size="sm"
                disabled={submitting}
                className="sm:flex-1"
              >
                {submitting ? 'Sending link...' : 'Send Reset Link'}
              </BrandButton>
              <BrandButton
                type="button"
                variant="alternative"
                size="sm"
                onClick={() => setShowResetForm(false)}
                className="sm:flex-1"
              >
                Back to Sign In
              </BrandButton>
            </div>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center" aria-hidden="true">
          <div className="flex-grow border-t border-brand-navy/15" />
          <span className="mx-3 text-xs font-semibold text-brand-navy/55">or</span>
          <div className="flex-grow border-t border-brand-navy/15" />
        </div>

        {/* 2. Separate Continue with Google Option (Section 7.3) */}
        <div className="space-y-2.5">
          <BrandButton
            type="button"
            variant="alternative"
            size="md"
            disabled={submitting || googleSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full"
          >
            {googleSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
          </BrandButton>
          <p className="text-xs text-brand-navy/65 text-center leading-relaxed">
            Google sign-in is an authentication option only. With your permission, Google pre-fills
            your basic profile (name and verified email). All bookings happen directly on Decompress.
          </p>
        </div>
      </div>

      {/* Footer Links */}
      <div className="text-center space-y-2 text-sm text-brand-navy/80">
        <p>
          New to Decompress?{' '}
          <Link
            href={nextPath !== '/account' ? `/register?next=${encodeURIComponent(nextPath)}` : '/register'}
            className="font-semibold text-brand-teal-text hover:underline"
          >
            Create a Personal or Corporate account
          </Link>
        </p>
        <p className="text-xs text-brand-navy/65">
          Just browsing? You do not need an account to explore venues or submit a guest booking.{' '}
          <Link
            href="/venues"
            className="inline-flex items-center gap-0.5 font-semibold text-brand-navy hover:underline"
          >
            <span>Explore Venues</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
