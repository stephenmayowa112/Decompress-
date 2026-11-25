import {
  BookingStatus,
  EventRequestStatus,
  EventServiceLevel,
  SettlementStatus,
  SupportEnquiryStatus,
} from '@/src/types/domain';

/**
 * Valid Decompress V1 booking lifecycle transitions (Section 7.4).
 * Terminal states: unavailable, completed, cancelled.
 */
const ALLOWED_BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['approved', 'unavailable', 'cancelled'],
  approved: ['confirmed', 'cancelled', 'unavailable'],
  confirmed: ['completed', 'cancelled'],
  unavailable: [],
  completed: [],
  cancelled: [],
};

export function canTransitionBookingStatus(
  from: BookingStatus,
  to: BookingStatus
): boolean {
  return ALLOWED_BOOKING_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedNextBookingStatuses(status: BookingStatus): BookingStatus[] {
  return ALLOWED_BOOKING_TRANSITIONS[status] ?? [];
}

export function formatBookingStatusLabel(status: BookingStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved — Payment Required';
    case 'unavailable':
      return 'Unavailable';
    case 'confirmed':
      return 'Confirmed';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
  }
}

export function getBookingStatusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-[#F5F7FA] text-[#123B60] border-[#D9E2EC]';
    case 'approved':
      return 'bg-[#FFF3E8] text-[#9A3412] border-[#FDBA74]';
    case 'confirmed':
      return 'bg-[#E7F5F3] text-[#0B6E6C] border-[#99D6D0]';
    case 'completed':
      return 'bg-[#123B60] text-white border-[#123B60]';
    case 'unavailable':
      return 'bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]';
    case 'cancelled':
      return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
  }
}

export const EVENT_REQUEST_STATUSES: EventRequestStatus[] = [
  'new',
  'in_discussion',
  'quoted',
  'accepted',
  'in_progress',
  'completed',
  'declined',
];

export function formatEventRequestStatusLabel(status: EventRequestStatus): string {
  switch (status) {
    case 'new':
      return 'New';
    case 'in_discussion':
      return 'In Discussion';
    case 'quoted':
      return 'Quoted';
    case 'accepted':
      return 'Accepted';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'declined':
      return 'Declined';
  }
}

export function formatEventServiceLevelLabel(level: EventServiceLevel): string {
  switch (level) {
    case 'event_planning_assistance':
      return 'Event Planning Assistance';
    case 'on_the_day_coordination':
      return 'On-the-Day Coordination';
    case 'full_planning_and_coordination':
      return 'Full Event Planning & Coordination';
  }
}

export function formatSettlementStatusLabel(status: SettlementStatus): string {
  switch (status) {
    case 'unreconciled':
      return 'Unreconciled';
    case 'pending_payout':
      return 'Pending Payout';
    case 'settled':
      return 'Settled';
    case 'disputed':
      return 'Disputed';
  }
}

export function formatSupportEnquiryStatusLabel(status: SupportEnquiryStatus): string {
  switch (status) {
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
  }
}

const UNAMBIGUOUS_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomFromAlphabet(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += UNAMBIGUOUS_ALPHABET[Math.floor(Math.random() * UNAMBIGUOUS_ALPHABET.length)];
  }
  return out;
}

export function generateEventRequestReference(): string {
  return `EVR-${randomFromAlphabet(6)}`;
}

export function generateInvoiceNumber(): string {
  return `INV-${randomFromAlphabet(6)}`;
}

export function generateSecureToken(prefix: 'pay' | 'rev' | 'tx' | 'id'): string {
  return `${prefix}_${randomFromAlphabet(12).toLowerCase()}${Date.now().toString(36).slice(-4)}`;
}
