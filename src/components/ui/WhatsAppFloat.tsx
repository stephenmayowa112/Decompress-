'use client';

import Image from 'next/image';
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

  // WhatsApp Web link format requires digits only: https://wa.me/<country_code><phone_number>
  const cleanPhone = siteSettings.supportPhone.replace(/\D/g, '');
  if (!cleanPhone) {
    return null;
  }
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 hover:bg-[#20BD5A] hover:shadow-[0_12px_28px_rgba(37,211,102,0.5)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal focus-visible:ring-offset-2 active:scale-95 sm:bottom-8 sm:right-8"
    >
      <Image
        src="/assets/images/whatsapp-logo.png"
        alt=""
        width={30}
        height={30}
        referrerPolicy="no-referrer"
        className="h-7 w-7 object-contain"
      />
    </a>
  );
}
