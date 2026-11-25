import { formatCurrencyMinor } from '@/src/lib/format';

export type EmailTemplateKey =
  | 'booking_received'
  | 'booking_approved'
  | 'booking_unavailable'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'review_request'
  | 'event_request_received'
  | 'event_quote_ready';

export interface EmailNotificationLog {
  id: string;
  template: EmailTemplateKey;
  to: string;
  subject: string;
  previewText: string;
  htmlBody: string;
  plainTextBody: string;
  relatedReference: string;
  sentAtUtc: string;
  provider: string;
}

export interface EmailTemplatePayload {
  recipientName: string;
  recipientEmail: string;
  reference: string;
  venueName?: string;
  eventDate?: string;
  preferredTime?: string;
  guestCount?: number;
  amountMinor?: number;
  currency?: string;
  payUrl?: string;
  reviewUrl?: string;
  invoiceNumber?: string;
  cancellationReason?: string;
  serviceLevelLabel?: string;
  walletOnlyNotice?: boolean;
  supportEmail: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapBrandedHtml(title: string, bodyHtml: string, supportEmail: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#F7F9FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#123B60;">
  <div style="max-width:600px;margin:24px auto;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E5ECF2;">
    <div style="background:#123B60;padding:24px 28px;">
      <p style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;letter-spacing:-0.01em;">Decompress</p>
      <p style="margin:4px 0 0;font-size:13px;color:#E7F5F3;">Curated Social Experiences &amp; Venue Concierge</p>
    </div>
    <div style="padding:28px;">
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#123B60;">${escapeHtml(title)}</h1>
      ${bodyHtml}
    </div>
    <div style="background:#E7F5F3;padding:18px 28px;font-size:12px;color:#123B60;line-height:1.5;">
      <p style="margin:0;">Need assistance? Contact Decompress Support at <a href="mailto:${escapeHtml(supportEmail)}" style="color:#0B6E6C;font-weight:600;">${escapeHtml(supportEmail)}</a>.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Provider-agnostic transactional email renderer for all 8 V1 lifecycle templates (Section 7.4 & 7.6).
 * Strictly omits invented response-time promises and unconfirmed refund rules.
 */
export function buildTransactionalEmail(
  template: EmailTemplateKey,
  payload: EmailTemplatePayload
): Omit<EmailNotificationLog, 'id' | 'sentAtUtc' | 'provider'> {
  const safeName = escapeHtml(payload.recipientName);
  const safeRef = escapeHtml(payload.reference);
  const safeVenue = escapeHtml(payload.venueName || 'Selected Venue');
  const currency = payload.currency || 'NGN';
  const formattedAmount =
    typeof payload.amountMinor === 'number'
      ? formatCurrencyMinor(payload.amountMinor, currency)
      : '';

  switch (template) {
    case 'booking_received': {
      const subject = `Booking Request Received (${payload.reference}) — ${payload.venueName || 'Decompress'}`;
      const previewText = `We have received your booking request ${payload.reference} and our team is checking availability.`;
      const bodyHtml = `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">We have received your booking request for <strong>${safeVenue}</strong>. Our concierge team will confirm availability with the venue and follow up by email.</p>
        <div style="background:#E7F5F3;border-radius:12px;padding:16px;margin:18px 0;">
          <p style="margin:0 0 6px;font-size:13px;"><strong>Reference:</strong> ${safeRef}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Date &amp; Time:</strong> ${escapeHtml(payload.eventDate || '')} ${escapeHtml(payload.preferredTime || '')}</p>
          <p style="margin:0;font-size:13px;"><strong>Guests:</strong> ${payload.guestCount ?? 1}</p>
        </div>
        <p style="margin:0;font-size:14px;color:#4B5563;">No payment is taken until availability is confirmed by our team.</p>`;
      return {
        template,
        to: payload.recipientEmail,
        subject,
        previewText,
        htmlBody: wrapBrandedHtml('Booking Request Received', bodyHtml, payload.supportEmail),
        plainTextBody: `Hi ${payload.recipientName}, we have received your booking request (${payload.reference}) for ${payload.venueName || 'your chosen venue'} on ${payload.eventDate || ''}. Our team is checking availability and will email you with an update.`,
        relatedReference: payload.reference,
      };
    }

    case 'booking_approved': {
      const subject = `Booking Approved — Payment Required (${payload.reference})`;
      const previewText = `Availability is confirmed for ${payload.venueName || 'your booking'}. Complete payment of ${formattedAmount}.`;
      const ctaSection = payload.walletOnlyNotice
        ? `<p style="margin:16px 0;font-size:14px;line-height:1.6;color:#123B60;">Sign in to your Decompress account wallet to complete payment of <strong>${escapeHtml(formattedAmount)}</strong>.</p>`
        : payload.payUrl
          ? `<p style="margin:20px 0;"><a href="${escapeHtml(payload.payUrl)}" style="display:inline-block;background:#FF704F;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;">Complete Payment (${escapeHtml(formattedAmount)})</a></p>`
          : '';
      const bodyHtml = `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Good news — availability has been confirmed for <strong>${safeVenue}</strong> on <strong>${escapeHtml(payload.eventDate || '')}</strong>.</p>
        <div style="background:#E7F5F3;border-radius:12px;padding:16px;margin:18px 0;">
          <p style="margin:0 0 6px;font-size:13px;"><strong>Reference:</strong> ${safeRef}</p>
          <p style="margin:0;font-size:15px;"><strong>Confirmed Amount Due:</strong> ${escapeHtml(formattedAmount)}</p>
        </div>
        ${ctaSection}`;
      return {
        template,
        to: payload.recipientEmail,
        subject,
        previewText,
        htmlBody: wrapBrandedHtml('Availability Confirmed — Payment Required', bodyHtml, payload.supportEmail),
        plainTextBody: `Hi ${payload.recipientName}, your booking (${payload.reference}) for ${payload.venueName} on ${payload.eventDate} is approved. Confirmed amount due: ${formattedAmount}. Complete payment here: ${payload.payUrl || '/account'}.`,
        relatedReference: payload.reference,
      };
    }

    case 'booking_unavailable': {
      const subject = `Update on Your Booking Request (${payload.reference})`;
      const previewText = `${payload.venueName || 'The selected venue'} is unavailable for your requested date.`;
      const bodyHtml = `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Thank you for requesting <strong>${safeVenue}</strong> for <strong>${escapeHtml(payload.eventDate || '')}</strong> (Ref: ${safeRef}). Unfortunately, the venue is unavailable for your requested date or party size.</p>
        <p style="margin:0;font-size:15px;line-height:1.6;">Reply to this email or browse our curated venues to choose an alternative experience.</p>`;
      return {
        template,
        to: payload.recipientEmail,
        subject,
        previewText,
        htmlBody: wrapBrandedHtml('Requested Date Unavailable', bodyHtml, payload.supportEmail),
        plainTextBody: `Hi ${payload.recipientName}, unfortunately ${payload.venueName} is unavailable for your requested date (${payload.eventDate}, Ref: ${payload.reference}). Please contact us or browse alternative venues.`,
        relatedReference: payload.reference,
      };
    }

    case 'booking_confirmed': {
      const subject = `Booking Confirmed & Invoice Ready (${payload.reference})`;
      const previewText = `Payment of ${formattedAmount} received. Your booking at ${payload.venueName || 'Decompress'} is confirmed.`;
      const bodyHtml = `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Your payment has been received and your booking at <strong>${safeVenue}</strong> is now <strong>Confirmed</strong>.</p>
        <div style="background:#E7F5F3;border-radius:12px;padding:16px;margin:18px 0;">
          <p style="margin:0 0 6px;font-size:13px;"><strong>Booking Reference:</strong> ${safeRef}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Invoice Number:</strong> ${escapeHtml(payload.invoiceNumber || '')}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Date &amp; Time:</strong> ${escapeHtml(payload.eventDate || '')} ${escapeHtml(payload.preferredTime || '')}</p>
          <p style="margin:0;font-size:14px;"><strong>Amount Paid:</strong> ${escapeHtml(formattedAmount)}</p>
        </div>
        <p style="margin:0;font-size:14px;color:#4B5563;">You can download your PDF invoice at any time from your confirmation page or Decompress account.</p>`;
      return {
        template,
        to: payload.recipientEmail,
        subject,
        previewText,
        htmlBody: wrapBrandedHtml('Booking Confirmed', bodyHtml, payload.supportEmail),
        plainTextBody: `Hi ${payload.recipientName}, your booking (${payload.reference}) at ${payload.venueName} on ${payload.eventDate} is confirmed. Invoice: ${payload.invoiceNumber}. Amount paid: ${formattedAmount}.`,
        relatedReference: payload.reference,
      };
    }

    case 'booking_cancelled': {
      const subject = `Booking Cancelled (${payload.reference})`;
      const previewText = `Your booking ${payload.reference} has been marked as cancelled.`;
      const reason = payload.cancellationReason
        ? `<p style="margin:0 0 14px;font-size:14px;"><strong>Reason noted:</strong> ${escapeHtml(payload.cancellationReason)}</p>`
        : '';
      const bodyHtml = `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">This confirms that booking <strong>${safeRef}</strong> for <strong>${safeVenue}</strong> has been cancelled.</p>
        ${reason}
        <p style="margin:0;font-size:14px;color:#4B5563;">If you have any questions about this cancellation or next steps, please reach out to our support team.</p>`;
      return {
        template,
        to: payload.recipientEmail,
        subject,
        previewText,
        htmlBody: wrapBrandedHtml('Booking Cancelled', bodyHtml, payload.supportEmail),
        plainTextBody: `Hi ${payload.recipientName}, booking ${payload.reference} for ${payload.venueName} has been cancelled. ${payload.cancellationReason ? `Reason: ${payload.cancellationReason}. ` : ''}Please contact support with any questions.`,
        relatedReference: payload.reference,
      };
    }

    case 'review_request': {
      const subject = `How was ${payload.venueName || 'your experience'}? Leave a Verified Review (${payload.reference})`;
      const previewText = `Share your 1–5 star Verified rating and optional feedback for ${payload.venueName || 'your booking'}.`;
      const reviewCta = payload.reviewUrl
        ? `<p style="margin:20px 0;"><a href="${escapeHtml(payload.reviewUrl)}" style="display:inline-block;background:#13A6A3;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:10px;">Leave a Verified Review</a></p>`
        : '';
      const bodyHtml = `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Thank you for celebrating with Decompress at <strong>${safeVenue}</strong> (Ref: ${safeRef}). We would love your 1–5 star rating and optional feedback on both the venue and your Decompress booking experience.</p>
        ${reviewCta}`;
      return {
        template,
        to: payload.recipientEmail,
        subject,
        previewText,
        htmlBody: wrapBrandedHtml('Share Your Verified Experience', bodyHtml, payload.supportEmail),
        plainTextBody: `Hi ${payload.recipientName}, thank you for visiting ${payload.venueName} (Ref: ${payload.reference}). Share your Verified review here: ${payload.reviewUrl || '/account'}.`,
        relatedReference: payload.reference,
      };
    }

    case 'event_request_received': {
      const subject = `Event Planning Request Received (${payload.reference})`;
      const previewText = `We have received your ${payload.serviceLevelLabel || 'Event Planning'} enquiry ${payload.reference}.`;
      const bodyHtml = `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Thank you for sharing your event brief with Decompress. Our event planning team has received request <strong>${safeRef}</strong>.</p>
        <div style="background:#E7F5F3;border-radius:12px;padding:16px;margin:18px 0;">
          <p style="margin:0 0 6px;font-size:13px;"><strong>Service Level:</strong> ${escapeHtml(payload.serviceLevelLabel || 'Event Planning')}</p>
          <p style="margin:0 0 6px;font-size:13px;"><strong>Preferred Date:</strong> ${escapeHtml(payload.eventDate || '')}</p>
          <p style="margin:0;font-size:13px;"><strong>Guests:</strong> ${payload.guestCount ?? 1}</p>
        </div>
        <p style="margin:0;font-size:14px;color:#4B5563;">We will review your details and follow up with tailored options and a custom quote.</p>`;
      return {
        template,
        to: payload.recipientEmail,
        subject,
        previewText,
        htmlBody: wrapBrandedHtml('Event Planning Request Received', bodyHtml, payload.supportEmail),
        plainTextBody: `Hi ${payload.recipientName}, we have received your event planning request (${payload.reference}) for ${payload.serviceLevelLabel || 'Event Planning'}. Our team will review your brief and follow up.`,
        relatedReference: payload.reference,
      };
    }

    case 'event_quote_ready': {
      const subject = `Your Decompress Event Quote is Ready (${payload.reference})`;
      const previewText = `Your custom quote of ${formattedAmount} for ${payload.reference} is ready for review.`;
      const bodyHtml = `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Our team has prepared a custom quote for your event planning request <strong>${safeRef}</strong> (${escapeHtml(payload.serviceLevelLabel || 'Event Planning')}).</p>
        <div style="background:#E7F5F3;border-radius:12px;padding:16px;margin:18px 0;">
          <p style="margin:0;font-size:15px;"><strong>Quoted Amount:</strong> ${escapeHtml(formattedAmount)}</p>
        </div>
        <p style="margin:0;font-size:14px;color:#4B5563;">Reply to this email or contact ${escapeHtml(payload.supportEmail)} to confirm or refine your plan.</p>`;
      return {
        template,
        to: payload.recipientEmail,
        subject,
        previewText,
        htmlBody: wrapBrandedHtml('Your Custom Event Quote is Ready', bodyHtml, payload.supportEmail),
        plainTextBody: `Hi ${payload.recipientName}, your custom quote for event request ${payload.reference} is ${formattedAmount}. Reply or contact ${payload.supportEmail} to proceed.`,
        relatedReference: payload.reference,
      };
    }
  }
}
