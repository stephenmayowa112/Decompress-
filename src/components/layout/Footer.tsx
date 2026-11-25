'use client';

import React from 'react';
import Link from 'next/link';
import { useDecompress } from '@/src/context/DecompressContext';

/**
 * Deep Navy (#123B60) Footer present on every page (Section 6).
 * Includes mandatory links: Contact Us, FAQ, Terms, Privacy.
 */
export function Footer() {
  const { siteSettings } = useDecompress();

  return (
    <footer className="bg-brand-navy text-white border-t border-brand-navy-light mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand & Concierge Mission */}
          <div className="space-y-3">
            <Link href="/" className="inline-block text-xl font-bold tracking-tight text-white">
              Decompress
            </Link>
            <p className="text-sm text-surface-teal/85 leading-relaxed">
              Discover social experiences, understand indicative Budget Ranges, request bookings,
              and arrange event coordination across Lagos—so you spend less time organising and
              more time enjoying the plan.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Discover &amp; Plan</h2>
            <ul className="space-y-1.5 text-sm text-surface-teal/85">
              <li>
                <Link href="/venues" className="inline-block py-1 hover:text-white hover:underline">
                  Explore Venues
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="inline-block py-1 hover:text-white hover:underline"
                >
                  Explore Experiences
                </Link>
              </li>
              <li>
                <Link
                  href="/plan-event"
                  className="inline-block py-1 hover:text-white hover:underline"
                >
                  Plan an Event
                </Link>
              </li>
              <li>
                <Link href="/account" className="inline-block py-1 hover:text-white hover:underline">
                  Account &amp; Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Mandatory Footer Links (Contact Us, FAQ, Terms, Privacy) */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Support &amp; Legal</h2>
            <ul className="space-y-1.5 text-sm text-surface-teal/85">
              <li>
                <Link href="/contact" className="inline-block py-1 hover:text-white hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="inline-block py-1 hover:text-white hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="inline-block py-1 hover:text-white hover:underline">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="inline-block py-1 hover:text-white hover:underline">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/admin" className="inline-block py-1 hover:text-white hover:underline">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Configurable Customer Care from SiteSettings */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Customer Care</h2>
            <p className="text-sm text-surface-teal/85 break-words">
              Email:{' '}
              <a
                href={`mailto:${siteSettings.supportEmail}`}
                className="text-white underline decoration-brand-teal underline-offset-4"
              >
                {siteSettings.supportEmail}
              </a>
            </p>
            <p className="text-sm text-surface-teal/85">
              Phone:{' '}
              <a
                href={`tel:${siteSettings.supportPhone.replace(/\s+/g, '')}`}
                className="text-white underline decoration-brand-teal underline-offset-4"
              >
                {siteSettings.supportPhone}
              </a>
            </p>
            <p className="text-xs text-surface-teal/75">{siteSettings.supportHours}</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-navy-light flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-teal/75">
          <p>© {new Date().getFullYear()} Decompress. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/contact" className="py-1 hover:text-white">
              Contact Us
            </Link>
            <Link href="/faq" className="py-1 hover:text-white">
              FAQ
            </Link>
            <Link href="/terms" className="py-1 hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="py-1 hover:text-white">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
