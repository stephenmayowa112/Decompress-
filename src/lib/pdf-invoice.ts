import { Invoice } from '@/src/types/domain';
import { formatCurrencyMinor, formatUtcTimestamp } from '@/src/lib/format';

function escapePdfText(input: string): string {
  return input
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Generates a real, standards-compliant PDF 1.4 binary document (zero native dependencies)
 * containing the Decompress customer invoice: invoice number, booking reference,
 * venue, event date, customer/company details, itemised charges, discounts/fees,
 * amount paid, status, and issue date in the configured timezone.
 */
export function generateInvoicePdfBytes(
  invoice: Invoice,
  timezone = 'Africa/Lagos'
): Uint8Array {
  const issuedDisplay = formatUtcTimestamp(invoice.issuedAtUtc, timezone);
  const amountPaidDisplay = formatCurrencyMinor(invoice.amountPaidMinor, invoice.currency);
  const discountDisplay = formatCurrencyMinor(invoice.discountOrFeeMinor, invoice.currency);

  const lines: Array<{ text: string; size: number; bold?: boolean; x: number; y: number }> = [
    { text: 'DECOMPRESS', size: 22, bold: true, x: 54, y: 745 },
    { text: 'Curated Social Experiences & Venue Concierge', size: 10, x: 54, y: 727 },
    { text: 'PAYMENT RECEIPT & INVOICE', size: 14, bold: true, x: 350, y: 745 },
    { text: `Invoice No: ${invoice.invoiceNumber}`, size: 10, x: 350, y: 727 },
    { text: `Booking Ref: ${invoice.bookingReference}`, size: 10, x: 350, y: 712 },
    { text: `Status: ${invoice.status.toUpperCase()}`, size: 10, bold: true, x: 350, y: 697 },
    { text: `Issued: ${issuedDisplay}`, size: 9, x: 54, y: 697 },

    { text: 'BILLED TO', size: 10, bold: true, x: 54, y: 654 },
    { text: invoice.customerName, size: 11, x: 54, y: 638 },
    ...(invoice.companyName
      ? [{ text: `Company: ${invoice.companyName}`, size: 10, x: 54, y: 623 }]
      : []),
    {
      text: invoice.customerEmail,
      size: 10,
      x: 54,
      y: invoice.companyName ? 608 : 623,
    },

    { text: 'EXPERIENCE DETAILS', size: 10, bold: true, x: 300, y: 654 },
    { text: `Venue: ${invoice.venueName}`, size: 10, x: 300, y: 638 },
    { text: `Event Date: ${invoice.eventDate}`, size: 10, x: 300, y: 623 },

    { text: 'ITEMISED CHARGES', size: 10, bold: true, x: 54, y: 565 },
    { text: 'AMOUNT', size: 10, bold: true, x: 455, y: 565 },
  ];

  let cursorY = 542;
  const items =
    invoice.lineItems.length > 0
      ? invoice.lineItems
      : [{ description: `Confirmed Booking — ${invoice.venueName}`, amountMinor: invoice.amountPaidMinor }];

  for (const item of items) {
    lines.push({ text: item.description.slice(0, 68), size: 10, x: 54, y: cursorY });
    lines.push({
      text: formatCurrencyMinor(item.amountMinor, invoice.currency),
      size: 10,
      x: 455,
      y: cursorY,
    });
    cursorY -= 20;
  }

  if (invoice.discountOrFeeMinor !== 0) {
    lines.push({ text: 'Adjustments / Discounts / Fees', size: 10, x: 54, y: cursorY });
    lines.push({ text: discountDisplay, size: 10, x: 455, y: cursorY });
    cursorY -= 24;
  } else {
    cursorY -= 12;
  }

  lines.push({ text: 'TOTAL AMOUNT PAID', size: 12, bold: true, x: 54, y: cursorY });
  lines.push({ text: amountPaidDisplay, size: 12, bold: true, x: 445, y: cursorY });

  lines.push({
    text: 'Thank you for booking with Decompress. Present this reference upon arrival.',
    size: 9,
    x: 54,
    y: 90,
  });

  const streamOps: string[] = [
    // Deep Navy header bar accent line
    '0.071 0.231 0.376 rg',
    '54 714 504 2 re f',
    '0.075 0.651 0.639 rg',
    '54 556 504 1 re f',
    '0.071 0.231 0.376 rg',
  ];

  for (const line of lines) {
    const fontKey = line.bold ? '/F2' : '/F1';
    streamOps.push(
      `BT ${fontKey} ${line.size} Tf 1 0 0 1 ${line.x} ${line.y} Tm (${escapePdfText(line.text)}) Tj ET`
    );
  }

  const contentStream = streamOps.join('\n');
  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
    `6 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return new TextEncoder().encode(pdf);
}

export function downloadInvoicePdf(invoice: Invoice, timezone = 'Africa/Lagos'): void {
  const bytes = generateInvoicePdfBytes(invoice, timezone);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Decompress-Invoice-${invoice.invoiceNumber}-${invoice.bookingReference}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
