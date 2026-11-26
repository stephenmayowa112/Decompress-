'use client';

import { MessageCircle } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';

/**
 * Floating WhatsApp support button anchored to bottom-right corner.
 * Uses supportPhone from SiteSettings, formatted as WhatsApp Web/API link.
 * Includes accessibility labels and smooth hover transitions.
 */
export function WhatsAppFloat() {
  const { siteSettings } = useDecompress();

  if (!siteSettings?.supportPhone) {
    return null;
  }

  // Convert phone number to WhatsApp format: remove spaces, hyphens, parentheses
  // WhatsApp Web link format: https://wa.me/<country_code><phone_number>
  const cleanPhone = siteSettings.supportPhone.replace(/[\s\-()]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal focus-visible:ring-offset-2 active:scale-95 sm:bottom-8 sm:right-8"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={2} />
    </a>
  );
}
