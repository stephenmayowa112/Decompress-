import { AccountType } from '@/src/types/domain';

/**
 * Ensures any post-login redirect parameter (?next=...) is a safe same-origin relative path.
 */
export function getSafeRedirectPath(rawNext: string | null | undefined, fallback = '/account'): string {
  if (!rawNext) return fallback;
  const trimmed = rawNext.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }
  if (/^\/[a-zA-Z0-9\-_/?=&.%]+$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

/**
 * Sanitizes and bounds profile inputs strictly to firebase-blueprint.json constraints.
 */
export function sanitizeProfileFields(input: {
  name: string;
  phone?: string;
  accountType: AccountType;
  companyName?: string;
}) {
  const name = input.name.trim().slice(0, 120);
  const phone = (input.phone || '').trim().slice(0, 40);
  const accountType: AccountType = input.accountType === 'corporate' ? 'corporate' : 'personal';
  const companyName =
    accountType === 'corporate' ? (input.companyName || '').trim().slice(0, 160) : '';

  return { name, phone, accountType, companyName };
}

/**
 * Translates Firebase Auth error codes into clear, helpful plain-language messages.
 */
export function mapAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled yet in Firebase Authentication. Enable "Email/Password" in the Firebase Console (Authentication → Sign-in method), or use Continue with Google.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead or use Continue with Google.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Please choose a stronger password (at least 8 characters with letters and numbers).';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email address or password did not match our records. Please try again or reset your password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few moments before trying again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before completing.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.';
    case 'auth/credential-already-in-use':
      return 'This Google account is already linked to another Decompress profile.';
    case 'auth/provider-already-linked':
      return 'Google is already linked to your Decompress account.';
    case 'auth/requires-recent-login':
      return 'For your security, please sign out and sign back in before changing your password.';
    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }
      return 'Something went wrong while completing your request. Please try again.';
  }
}
