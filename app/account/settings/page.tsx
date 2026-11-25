'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Building2,
  Shield,
  Bell,
  CreditCard,
  HelpCircle,
  FileText,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { AccountShell } from '@/src/components/account/AccountShell';
import { BrandButton, BrandLinkButton } from '@/src/components/ui/Button';
import { AccountType } from '@/src/types/domain';
import { mapAuthErrorMessage } from '@/src/lib/auth-helpers';

export default function AccountSettingsPage() {
  const {
    currentUser,
    userProfile,
    siteSettings,
    updateUserProfileSettings,
    linkGoogleAccount,
    changeUserPassword,
    sendPasswordReset,
    resendVerificationEmail,
    refreshUserVerification,
  } = useDecompress();

  // Form state initialized from profile and synced safely when profile arrives
  const profileSyncKey = userProfile
    ? `${userProfile.uid}|${userProfile.name}|${userProfile.phone || ''}|${userProfile.accountType}|${userProfile.companyName || ''}|${String(userProfile.promotionalEmailsOptIn)}`
    : '';

  const [syncedKey, setSyncedKey] = useState(profileSyncKey);
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [accountType, setAccountType] = useState<AccountType>(
    userProfile?.accountType || 'personal'
  );
  const [companyName, setCompanyName] = useState(userProfile?.companyName || '');
  const [promoOptIn, setPromoOptIn] = useState(Boolean(userProfile?.promotionalEmailsOptIn));

  if (profileSyncKey && profileSyncKey !== syncedKey && userProfile) {
    setSyncedKey(profileSyncKey);
    setName(userProfile.name);
    setPhone(userProfile.phone || '');
    setAccountType(userProfile.accountType);
    setCompanyName(userProfile.companyName || '');
    setPromoOptIn(Boolean(userProfile.promotionalEmailsOptIn));
  }

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const [securityBusy, setSecurityBusy] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [notifSaving, setNotifSaving] = useState(false);
  const [notifStatus, setNotifStatus] = useState<string | null>(null);

  const hasPasswordProvider = Boolean(
    currentUser?.providerData.some((p) => p.providerId === 'password')
  );
  const hasGoogleProvider = Boolean(
    currentUser?.providerData.some((p) => p.providerId === 'google.com')
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);
    setProfileSaving(true);
    try {
      await updateUserProfileSettings({
        name,
        phone,
        accountType,
        companyName: accountType === 'corporate' ? companyName : undefined,
        promotionalEmailsOptIn: promoOptIn,
      });
      setProfileStatus({
        type: 'ok',
        text: currentUser?.emailVerified
          ? 'Profile settings saved to your Decompress account.'
          : 'Profile draft updated locally. Verify your email address to persist changes.',
      });
    } catch (err) {
      setProfileStatus({ type: 'err', text: mapAuthErrorMessage(err) });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifStatus(null);
    setNotifSaving(true);
    try {
      await updateUserProfileSettings({
        name: name || userProfile?.name || currentUser?.displayName || 'Decompress Member',
        phone,
        accountType,
        companyName: accountType === 'corporate' ? companyName : undefined,
        promotionalEmailsOptIn: promoOptIn,
      });
      setNotifStatus('Notification preferences updated.');
    } catch (err) {
      setNotifStatus(mapAuthErrorMessage(err));
    } finally {
      setNotifSaving(false);
    }
  };

  const handleLinkGoogle = async () => {
    setSecurityStatus(null);
    setSecurityBusy(true);
    try {
      await linkGoogleAccount();
      setSecurityStatus({
        type: 'ok',
        text: 'Google account linked! You can now sign in using Continue with Google.',
      });
    } catch (err) {
      setSecurityStatus({ type: 'err', text: mapAuthErrorMessage(err) });
    } finally {
      setSecurityBusy(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityStatus(null);
    if (newPassword.length < 8) {
      setSecurityStatus({
        type: 'err',
        text: 'New password must be at least 8 characters long.',
      });
      return;
    }
    setSecurityBusy(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setSecurityStatus({ type: 'ok', text: 'Your password has been updated.' });
    } catch (err) {
      setSecurityStatus({ type: 'err', text: mapAuthErrorMessage(err) });
    } finally {
      setSecurityBusy(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!currentUser?.email) return;
    setSecurityStatus(null);
    setSecurityBusy(true);
    try {
      await sendPasswordReset(currentUser.email);
      setSecurityStatus({
        type: 'ok',
        text: `Password reset email sent to ${currentUser.email}.`,
      });
    } catch (err) {
      setSecurityStatus({ type: 'err', text: mapAuthErrorMessage(err) });
    } finally {
      setSecurityBusy(false);
    }
  };

  return (
    <AccountShell
      title="Account Settings"
      subtitle="Manage your Personal or Corporate profile, security, notification preferences, payment settings, and support contacts."
    >
      {/* Quick Section Jump Links */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm font-semibold text-brand-teal-text">
        <a href="#profile-settings" className="hover:underline">
          1. Profile Settings
        </a>
        <a href="#account-security" className="hover:underline">
          2. Account &amp; Security
        </a>
        <a href="#notifications" className="hover:underline">
          3. Notifications
        </a>
        <a href="#payment-settings" className="hover:underline">
          4. Payment Settings
        </a>
        <a href="#help-support" className="hover:underline">
          5. Help &amp; Support
        </a>
        <a href="#terms-privacy" className="hover:underline">
          6. Terms &amp; Privacy
        </a>
      </div>

      {/* Section 1: Profile Settings (Personal or Corporate) */}
      <section
        id="profile-settings"
        className="rounded-2xl bg-white p-5 sm:p-7 border border-brand-navy/15 space-y-5 scroll-mt-24"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal-text">
            {accountType === 'corporate' ? (
              <Building2 className="h-4 w-4 text-brand-teal" />
            ) : (
              <User className="h-4 w-4 text-brand-teal" />
            )}
            <span>01. Profile Settings</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-brand-navy">
            Personal or Company Details
          </h2>
          <p className="text-xs sm:text-sm text-brand-navy/75">
            Personal and Corporate accounts have identical V1 capabilities; Corporate profiles
            include your company name for event bookings and invoices.
          </p>
        </div>

        {profileStatus && (
          <div
            role="status"
            className={`flex items-start gap-2 rounded-xl p-3 text-xs sm:text-sm border ${
              profileStatus.type === 'ok'
                ? 'bg-surface-teal border-brand-teal/35 text-brand-navy'
                : 'bg-brand-coral/10 border-brand-coral/35 text-brand-coral-text'
            }`}
          >
            {profileStatus.type === 'ok' ? (
              <CheckCircle2 className="h-4 w-4 text-brand-teal shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <span>{profileStatus.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType('personal')}
              aria-pressed={accountType === 'personal'}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-colors cursor-pointer ${
                accountType === 'personal'
                  ? 'border-brand-teal bg-surface-teal text-brand-navy'
                  : 'border-brand-navy/15 bg-surface text-brand-navy/80 hover:border-brand-teal/40'
              }`}
            >
              Personal Account
            </button>
            <button
              type="button"
              onClick={() => setAccountType('corporate')}
              aria-pressed={accountType === 'corporate'}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-colors cursor-pointer ${
                accountType === 'corporate'
                  ? 'border-brand-teal bg-surface-teal text-brand-navy'
                  : 'border-brand-navy/15 bg-surface text-brand-navy/80 hover:border-brand-teal/40'
              }`}
            >
              Corporate Account
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="settings-name" className="block text-xs font-semibold text-brand-navy">
                Full Name <span className="text-brand-coral-text">*</span>
              </label>
              <input
                id="settings-name"
                type="text"
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="settings-phone" className="block text-xs font-semibold text-brand-navy">
                Phone Number
              </label>
              <input
                id="settings-phone"
                type="tel"
                maxLength={40}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>

          {accountType === 'corporate' && (
            <div className="space-y-1.5">
              <label
                htmlFor="settings-company"
                className="block text-xs font-semibold text-brand-navy"
              >
                Company / Organisation Name <span className="text-brand-coral-text">*</span>
              </label>
              <input
                id="settings-company"
                type="text"
                required
                maxLength={160}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Lagoon Ventures Ltd"
                className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
              />
            </div>
          )}

          <div>
            <BrandButton type="submit" variant="secondary" size="sm" disabled={profileSaving}>
              {profileSaving ? 'Saving Profile...' : 'Save Profile Settings'}
            </BrandButton>
          </div>
        </form>
      </section>

      {/* Section 2: Account & Security */}
      <section
        id="account-security"
        className="rounded-2xl bg-white p-5 sm:p-7 border border-brand-navy/15 space-y-5 scroll-mt-24"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal-text">
            <Shield className="h-4 w-4 text-brand-teal" />
            <span>02. Account &amp; Security</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-brand-navy">
            Sign-In Methods &amp; Password
          </h2>
        </div>

        {securityStatus && (
          <div
            role="status"
            className={`flex items-start gap-2 rounded-xl p-3 text-xs sm:text-sm border ${
              securityStatus.type === 'ok'
                ? 'bg-surface-teal border-brand-teal/35 text-brand-navy'
                : 'bg-brand-coral/10 border-brand-coral/35 text-brand-coral-text'
            }`}
          >
            {securityStatus.type === 'ok' ? (
              <CheckCircle2 className="h-4 w-4 text-brand-teal shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <span>{securityStatus.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-surface p-4 border border-brand-navy/10 space-y-1">
            <span className="text-xs text-brand-navy/65">Email Verification</span>
            <p className="font-bold text-brand-navy break-words">{currentUser?.email}</p>
            <p className="text-xs font-semibold text-brand-teal-text">
              {currentUser?.emailVerified ? 'Verified Email' : 'Pending Verification'}
            </p>
            {!currentUser?.emailVerified && (
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  disabled={securityBusy}
                  onClick={async () => {
                    setSecurityBusy(true);
                    try {
                      await resendVerificationEmail();
                      setSecurityStatus({
                        type: 'ok',
                        text: 'Verification email sent to your inbox.',
                      });
                    } catch (err) {
                      setSecurityStatus({ type: 'err', text: mapAuthErrorMessage(err) });
                    } finally {
                      setSecurityBusy(false);
                    }
                  }}
                  className="text-xs font-semibold text-brand-teal-text underline cursor-pointer"
                >
                  Resend verification
                </button>
                <button
                  type="button"
                  disabled={securityBusy}
                  onClick={async () => {
                    setSecurityBusy(true);
                    try {
                      const ok = await refreshUserVerification();
                      setSecurityStatus({
                        type: ok ? 'ok' : 'err',
                        text: ok
                          ? 'Email verified successfully.'
                          : 'Still awaiting verification click in your inbox.',
                      });
                    } finally {
                      setSecurityBusy(false);
                    }
                  }}
                  className="text-xs font-semibold text-brand-navy underline cursor-pointer"
                >
                  Refresh status
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-surface p-4 border border-brand-navy/10 space-y-1.5">
            <span className="text-xs text-brand-navy/65">Google Sign-In</span>
            <p className="font-bold text-brand-navy">
              {hasGoogleProvider ? 'Connected to Google' : 'Not linked yet'}
            </p>
            <p className="text-xs text-brand-navy/75">
              {hasGoogleProvider
                ? 'You can sign in quickly using Continue with Google.'
                : 'Link your Google account for one-click sign-in.'}
            </p>
            {!hasGoogleProvider && (
              <div className="pt-1">
                <button
                  type="button"
                  disabled={securityBusy}
                  onClick={handleLinkGoogle}
                  className="text-xs font-semibold text-brand-teal-text underline cursor-pointer"
                >
                  Link Google Account
                </button>
              </div>
            )}
          </div>
        </div>

        {hasPasswordProvider ? (
          <form
            onSubmit={handleChangePassword}
            className="pt-4 border-t border-brand-navy/10 space-y-4"
          >
            <h3 className="text-sm font-bold text-brand-navy">Change Password</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="settings-cur-pw"
                  className="block text-xs font-semibold text-brand-navy"
                >
                  Current Password
                </label>
                <input
                  id="settings-cur-pw"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="settings-new-pw"
                  className="block text-xs font-semibold text-brand-navy"
                >
                  New Password (Min. 8 Characters)
                </label>
                <input
                  id="settings-new-pw"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-brand-navy/20 bg-surface px-3 py-2 text-sm text-brand-navy focus:border-brand-teal focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <BrandButton type="submit" variant="secondary" size="sm" disabled={securityBusy}>
                Update Password
              </BrandButton>
              <BrandButton
                type="button"
                variant="alternative"
                size="sm"
                disabled={securityBusy}
                onClick={handleSendResetEmail}
              >
                Send Password Reset Email
              </BrandButton>
            </div>
          </form>
        ) : (
          <div className="pt-3 border-t border-brand-navy/10 text-xs sm:text-sm text-brand-navy/75">
            You signed in using Google. Password management is handled securely through your Google
            Account.
          </div>
        )}
      </section>

      {/* Section 3: Notifications */}
      <section
        id="notifications"
        className="rounded-2xl bg-white p-5 sm:p-7 border border-brand-navy/15 space-y-4 scroll-mt-24"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal-text">
            <Bell className="h-4 w-4 text-brand-teal" />
            <span>03. Notifications</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-brand-navy">Email Preferences</h2>
          <p className="text-xs sm:text-sm text-brand-navy/75">
            Essential transactional booking emails (received, approved, unavailable, confirmed with
            invoice, cancelled, and event quotes) are always delivered by email in V1.
          </p>
        </div>

        <form onSubmit={handleSaveNotifications} className="space-y-4">
          <label className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-brand-navy/10 cursor-pointer">
            <input
              type="checkbox"
              checked={promoOptIn}
              onChange={(e) => setPromoOptIn(e.target.checked)}
              className="mt-1 h-4 w-4 accent-brand-teal shrink-0"
            />
            <span className="text-sm text-brand-navy">
              <strong className="block font-semibold">
                Optional curated venue &amp; experience highlights
              </strong>
              <span className="text-xs text-brand-navy/75">
                Receive occasional promotional emails about new Lagos venues, seasonal experiences,
                and confirmed offers.
              </span>
            </span>
          </label>

          {notifStatus && (
            <p role="status" className="text-xs font-semibold text-brand-teal-text">
              {notifStatus}
            </p>
          )}

          <BrandButton type="submit" variant="secondary" size="sm" disabled={notifSaving}>
            {notifSaving ? 'Saving Preferences...' : 'Save Notification Preferences'}
          </BrandButton>
        </form>
      </section>

      {/* Section 4: Payment Settings */}
      <section
        id="payment-settings"
        className="rounded-2xl bg-white p-5 sm:p-7 border border-brand-navy/15 space-y-4 scroll-mt-24"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal-text">
            <CreditCard className="h-4 w-4 text-brand-teal" />
            <span>04. Payment Settings</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-brand-navy">
            Checkout &amp; Wallet Options
          </h2>
          <p className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed">
            Payments are processed exclusively through our configured payment provider adapter—never
            stored directly as raw card details on Decompress.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-surface p-4 border border-brand-navy/10 space-y-1">
            <span className="text-xs text-brand-navy/65">Guest Payment Mode</span>
            <p className="font-bold text-brand-navy">
              {siteSettings.guestPaymentMode === 'guest_checkout'
                ? 'Tokenised Guest Checkout Link'
                : 'Wallet Only'}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-4 border border-brand-navy/10 space-y-1">
            <span className="text-xs text-brand-navy/65">Account Wallet</span>
            <p className="font-bold text-brand-navy">
              {siteSettings.walletEnabled ? 'Enabled (Provider-Backed)' : 'Disabled'}
            </p>
          </div>
        </div>

        {siteSettings.walletEnabled && (
          <div>
            <BrandLinkButton
              href="/account/wallet"
              variant="alternative"
              size="sm"
              fullWidthOnMobile={false}
            >
              Open Decompress Wallet
            </BrandLinkButton>
          </div>
        )}
      </section>

      {/* Section 5: Help & Support (FAQ link + customer-care email & phone from SiteSettings) */}
      <section
        id="help-support"
        className="rounded-2xl bg-white p-5 sm:p-7 border border-brand-navy/15 space-y-4 scroll-mt-24"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal-text">
            <HelpCircle className="h-4 w-4 text-brand-teal" />
            <span>05. Help &amp; Support</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-brand-navy">
            Customer Care &amp; FAQ
          </h2>
          <p className="text-xs sm:text-sm text-brand-navy/75">
            Need help with a booking reference (DCP-XXXXXX), an invoice, or event planning?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-sm">
          <div className="rounded-xl bg-surface p-4 border border-brand-navy/10 space-y-1 min-w-0">
            <Mail className="h-4 w-4 text-brand-teal" />
            <span className="block text-xs text-brand-navy/65">Customer-Care Email</span>
            <a
              href={`mailto:${siteSettings.supportEmail}`}
              className="block font-semibold text-brand-teal-text underline break-words"
            >
              {siteSettings.supportEmail}
            </a>
          </div>

          <div className="rounded-xl bg-surface p-4 border border-brand-navy/10 space-y-1 min-w-0">
            <Phone className="h-4 w-4 text-brand-teal" />
            <span className="block text-xs text-brand-navy/65">Customer-Care Phone</span>
            <a
              href={`tel:${siteSettings.supportPhone.replace(/\s+/g, '')}`}
              className="block font-semibold text-brand-teal-text underline break-words"
            >
              {siteSettings.supportPhone}
            </a>
          </div>

          <div className="rounded-xl bg-surface p-4 border border-brand-navy/10 space-y-1 min-w-0">
            <Clock className="h-4 w-4 text-brand-teal" />
            <span className="block text-xs text-brand-navy/65">Support Hours</span>
            <p className="font-medium text-brand-navy text-xs sm:text-sm">
              {siteSettings.supportHours}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
          <BrandLinkButton href="/faq" variant="alternative" size="sm" fullWidthOnMobile>
            Read Frequently Asked Questions
          </BrandLinkButton>
          <BrandLinkButton href="/contact" variant="secondary" size="sm" fullWidthOnMobile>
            Open Contact Us Form
          </BrandLinkButton>
        </div>
      </section>

      {/* Section 6: Terms & Privacy */}
      <section
        id="terms-privacy"
        className="rounded-2xl bg-white p-5 sm:p-7 border border-brand-navy/15 space-y-4 scroll-mt-24"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal-text">
            <FileText className="h-4 w-4 text-brand-teal" />
            <span>06. Terms &amp; Privacy</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-brand-navy">
            Legal Policies &amp; Data Permissions
          </h2>
          <p className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed">
            When you use Continue with Google, Decompress requests only your basic profile name and
            verified email address to pre-fill your account and link matching guest bookings.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm font-semibold text-brand-teal-text">
          <Link href="/terms" className="underline hover:text-brand-navy">
            Terms of Service
          </Link>
          <Link href="/privacy" className="underline hover:text-brand-navy">
            Privacy Policy
          </Link>
        </div>
      </section>
    </AccountShell>
  );
}
