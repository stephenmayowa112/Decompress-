'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Building2,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { AccountType } from '@/src/types/domain';
import { BrandButton } from '@/src/components/ui/Button';
import { getSafeRedirectPath, mapAuthErrorMessage } from '@/src/lib/auth-helpers';

export function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeRedirectPath(searchParams.get('next'), '/account');

  const { currentUser, registerWithEmail, signInWithGoogle } = useDecompress();

  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  if (currentUser) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-2xl bg-white p-6 sm:p-8 border border-brand-navy/15 space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-teal text-brand-teal-text">
            <CheckCircle2 className="h-6 w-6 text-brand-teal" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-brand-navy">Account ready</h1>
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
            Open Your Dashboard
          </BrandButton>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (accountType === 'corporate' && !companyName.trim()) {
      setErrorMsg('Please enter your company or organisation name for a Corporate account.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter them.');
      return;
    }

    setSubmitting(true);
    try {
      await registerWithEmail({
        name,
        email,
        password,
        phone,
        accountType,
        companyName: accountType === 'corporate' ? companyName : undefined,
      });
      router.push(nextPath);
    } catch (err) {
      setErrorMsg(mapAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMsg(null);
    if (accountType === 'corporate' && !companyName.trim()) {
      setErrorMsg(
        'Enter your company name first if you want your Google sign-up to start as a Corporate profile (or switch to Personal).'
      );
      return;
    }
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle(accountType, companyName);
      router.push(nextPath);
    } catch (err) {
      setErrorMsg(mapAuthErrorMessage(err));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-10 sm:py-14 space-y-6">
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
        <p className="text-xs sm:text-sm font-semibold text-brand-teal-text">
          Personal &amp; Corporate Accounts
        </p>
        <h1 className="text-3xl font-bold text-brand-navy">Create your Decompress account</h1>
        <p className="text-sm text-brand-navy/75">
          Save favourite venues, track bookings in one dashboard, and manage corporate or personal
          events easily.
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

        {/* Account Type Selector: Personal vs Corporate */}
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-brand-navy">Account Type</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setAccountType('personal')}
              aria-pressed={accountType === 'personal'}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                accountType === 'personal'
                  ? 'border-brand-teal bg-surface-teal'
                  : 'border-brand-navy/15 bg-surface hover:border-brand-teal/50'
              }`}
            >
              <User className="h-5 w-5 text-brand-teal shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-brand-navy">Personal</p>
                <p className="text-xs text-brand-navy/70">
                  Date nights, birthdays, friends&apos; hangouts &amp; private plans.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('corporate')}
              aria-pressed={accountType === 'corporate'}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                accountType === 'corporate'
                  ? 'border-brand-teal bg-surface-teal'
                  : 'border-brand-navy/15 bg-surface hover:border-brand-teal/50'
              }`}
            >
              <Building2 className="h-5 w-5 text-brand-teal shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-brand-navy">Corporate</p>
                <p className="text-xs text-brand-navy/70">
                  Team dinners, company outings &amp; end-of-year events (adds company name).
                </p>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {accountType === 'corporate' && (
            <div className="space-y-1.5">
              <label
                htmlFor="register-company"
                className="block text-xs font-semibold text-brand-navy"
              >
                Company / Organisation Name <span className="text-brand-coral-text">*</span>
              </label>
              <div className="relative flex items-center rounded-xl border border-brand-navy/20 bg-surface focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/25">
                <Building2 className="h-4 w-4 text-brand-teal ml-3 shrink-0" aria-hidden="true" />
                <input
                  id="register-company"
                  type="text"
                  required
                  maxLength={160}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Lagoon Ventures Ltd"
                  className="w-full min-h-[44px] bg-transparent px-3 py-2 text-sm text-brand-navy placeholder:text-brand-navy/45 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="block text-xs font-semibold text-brand-navy">
                Full Name <span className="text-brand-coral-text">*</span>
              </label>
              <div className="relative flex items-center rounded-xl border border-brand-navy/20 bg-surface focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/25">
                <User className="h-4 w-4 text-brand-teal ml-3 shrink-0" aria-hidden="true" />
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adaeze Okafor"
                  className="w-full min-h-[44px] bg-transparent px-3 py-2 text-sm text-brand-navy placeholder:text-brand-navy/45 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-phone" className="block text-xs font-semibold text-brand-navy">
                Phone Number (Optional)
              </label>
              <div className="relative flex items-center rounded-xl border border-brand-navy/20 bg-surface focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/25">
                <Phone className="h-4 w-4 text-brand-teal ml-3 shrink-0" aria-hidden="true" />
                <input
                  id="register-phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full min-h-[44px] bg-transparent px-3 py-2 text-sm text-brand-navy placeholder:text-brand-navy/45 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-email" className="block text-xs font-semibold text-brand-navy">
              Email Address <span className="text-brand-coral-text">*</span>
            </label>
            <div className="relative flex items-center rounded-xl border border-brand-navy/20 bg-surface focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/25">
              <Mail className="h-4 w-4 text-brand-teal ml-3 shrink-0" aria-hidden="true" />
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                maxLength={160}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full min-h-[44px] bg-transparent px-3 py-2 text-sm text-brand-navy placeholder:text-brand-navy/45 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold text-brand-navy"
              >
                Password <span className="text-brand-coral-text">*</span>
              </label>
              <div className="relative flex items-center rounded-xl border border-brand-navy/20 bg-surface focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/25">
                <Lock className="h-4 w-4 text-brand-teal ml-3 shrink-0" aria-hidden="true" />
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full min-h-[44px] bg-transparent px-3 py-2 text-sm text-brand-navy placeholder:text-brand-navy/45 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-semibold text-brand-navy"
              >
                Confirm Password <span className="text-brand-coral-text">*</span>
              </label>
              <div className="relative flex items-center rounded-xl border border-brand-navy/20 bg-surface focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/25">
                <Lock className="h-4 w-4 text-brand-teal ml-3 shrink-0" aria-hidden="true" />
                <input
                  id="register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full min-h-[44px] bg-transparent px-3 py-2 text-sm text-brand-navy placeholder:text-brand-navy/45 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <BrandButton
            type="submit"
            variant="primary"
            size="md"
            disabled={submitting || googleSubmitting}
            className="w-full"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </BrandButton>
        </form>

        {/* Divider */}
        <div className="relative flex items-center" aria-hidden="true">
          <div className="flex-grow border-t border-brand-navy/15" />
          <span className="mx-3 text-xs font-semibold text-brand-navy/55">or</span>
          <div className="flex-grow border-t border-brand-navy/15" />
        </div>

        {/* Separate Continue with Google Option */}
        <div className="space-y-2.5">
          <BrandButton
            type="button"
            variant="alternative"
            size="md"
            disabled={submitting || googleSubmitting}
            onClick={handleGoogleSignUp}
            className="w-full"
          >
            {googleSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
          </BrandButton>
          <div className="flex items-start gap-2 rounded-xl bg-surface-teal/70 p-3 text-xs text-brand-navy/80">
            <ShieldCheck className="h-4 w-4 text-brand-teal shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Booked as a guest previously? Once your email address is verified, any earlier guest
              bookings matching that verified email will automatically attach to your account.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-brand-navy/80">
        Already have an account?{' '}
        <Link
          href={nextPath !== '/account' ? `/login?next=${encodeURIComponent(nextPath)}` : '/login'}
          className="font-semibold text-brand-teal-text hover:underline"
        >
          Sign in instead
        </Link>
      </p>
    </div>
  );
}
