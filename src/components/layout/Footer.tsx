'use client';

import React from 'react';
import Link from 'next/link';
import { useDecompress } from '@/src/context/DecompressContext';

/**
 * Airy Deep Navy (#123B60) Editorial Footer honoring the Decompress brand palette
 * ("Primary: Deep Navy #123B60 — Brand identity, navigation, headings and footer")
 * and the generous 4-column grid rhythm of the minimal template.
 */
export function Footer() {
  const { siteSettings } = useDecompress();

  return (
    <footer className="bg-brand-navy text-white mt-20">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & Concierge Mission */}
          <div className="space-y-3.5">
            <Link
              href="/"
              className="inline-block text-xl font-bold tracking-[-0.02em] text-white"
            >
              Decompress
            </Link>
            <p className="text-sm text-surface-teal/80 leading-relaxed">
              Discover social experiences, compare indicative Budget Ranges, request bookings, and
              arrange event coordination across Lagos—with less organising and more enjoying.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-3.5">
            <h2 className="text-sm font-semibold text-white">Discover &amp; Plan</h2>
            <ul className="space-y-2 text-sm text-surface-teal/80">
              <li>
                <Link
                  href="/venues"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  Explore Venues
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  Explore Experiences
                </Link>
              </li>
              <li>
                <Link
                  href="/plan-event"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  Plan an Event
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  Account &amp; Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Mandatory Support & Legal Links */}
          <div className="space-y-3.5">
            <h2 className="text-sm font-semibold text-white">Support &amp; Legal</h2>
            <ul className="space-y-2 text-sm text-surface-teal/80">
              <li>
                <Link
                  href="/contact"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Configurable Customer Care from SiteSettings */}
          <div className="space-y-3.5">
            <h2 className="text-sm font-semibold text-white">Customer Care</h2>
            <div className="space-y-2 text-sm text-surface-teal/80">
              <p className="break-words">
                <a
                  href={`mailto:${siteSettings.supportEmail}`}
                  className="text-white hover:text-brand-yellow underline decoration-brand-teal underline-offset-4 transition-colors"
                >
                  {siteSettings.supportEmail}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${siteSettings.supportPhone.replace(/\s+/g, '')}`}
                  className="text-white hover:text-brand-yellow underline decoration-brand-teal underline-offset-4 transition-colors"
                >
                  {siteSettings.supportPhone}
                </a>
              </p>
              <p className="text-xs text-surface-teal/65 leading-relaxed pt-1">
                {siteSettings.supportHours}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-teal/70">
          <p>© {new Date().getFullYear()} Decompress. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/contact" className="py-1 hover:text-white transition-colors">
              Contact Us
            </Link>
            <Link href="/faq" className="py-1 hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="/terms" className="py-1 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="py-1 hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
