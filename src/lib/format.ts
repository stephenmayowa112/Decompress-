import { BudgetBasis } from '@/src/types/domain';

const BASIS_LABELS: Record<BudgetBasis, string> = {
  per_person: 'per person',
  per_table: 'per table',
  total: 'total',
};

/**
 * Format integer minor units (e.g., kobo for NGN) into human-readable currency.
 */
export function formatMoneyMinor(amountMinor: number, currency = 'NGN'): string {
  const majorUnits = amountMinor / 100;
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: majorUnits % 1 === 0 ? 0 : 2,
    }).format(majorUnits);
  } catch {
    return `${currency} ${majorUnits.toLocaleString()}`;
  }
}

/**
 * Format indicative Budget Range (never called "Minimum Spend").
 */
export function formatBudgetRange(
  budgetMinMinor: number,
  budgetMaxMinor: number,
  currency = 'NGN',
  budgetBasis: BudgetBasis = 'per_person'
): string {
  const minFormatted = formatMoneyMinor(budgetMinMinor, currency);
  const maxFormatted = formatMoneyMinor(budgetMaxMinor, currency);
  const basisLabel = BASIS_LABELS[budgetBasis] || 'per person';
  return `${minFormatted} – ${maxFormatted} (${basisLabel})`;
}

/**
 * Format UTC timestamp into the configurable display timezone (default Africa/Lagos, TODO(founder)).
 */
export function formatUtcTimestamp(
  utcIsoString: string,
  timezone = 'Africa/Lagos'
): string {
  try {
    const date = new Date(utcIsoString);
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(date);
  } catch {
    return utcIsoString;
  }
}

/**
 * Generate an unambiguous alphanumeric booking reference in the form DCP-XXXXXX (Section 7.4).
 * Excludes easily confused characters (0, O, 1, I, L).
 */
export function generateBookingReference(): string {
  const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * alphabet.length);
    code += alphabet[idx];
  }
  return `DCP-${code}`;
}
