'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/venues', label: 'Venues' },
  { href: '/experiences', label: 'Experiences' },
  { href: '/plan-event', label: 'Plan an Event' },
  { href: '/faq', label: 'FAQ' },
  { href: '/account', label: 'Account' },
];

/**
 * Deep Navy (#123B60) Top Navigation Bar
 * Strictly enforces the 3-Zone Top Bar Contract:
 * Zone 1: Single-line Brand Wordmark ("Decompress")
 * Zone 2: 5 concise single-line text links with subtle hover underlines
 * Zone 3: 1 primary CTA ("Explore Experiences")
 */
export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-brand-navy text-white border-b border-brand-navy-light">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded"
        >
          Decompress
        </Link>

        {/* Zone 2: 5 single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-surface-teal"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'py-1 transition-colors whitespace-nowrap shrink-0 hover:text-white hover:underline underline-offset-8 decoration-brand-teal decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded',
                  isActive && 'text-white underline'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <Link
            href="/experiences"
            className="inline-flex items-center justify-center px-4 py-2 text-lg font-semibold text-white bg-brand-coral hover:bg-brand-coral-hover active:bg-brand-coral-active rounded-2xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal"
          >
            Explore Experiences
          </Link>
        </div>
      </div>

      {/* Compact Mobile Navigation Row for screens < md (stays well under 15% mobile sticky cap) */}
      <nav
        aria-label="Mobile Navigation"
        className="flex md:hidden items-center justify-around border-t border-brand-navy-light bg-brand-navy px-2 py-2 text-xs font-medium text-surface-teal overflow-x-auto"
      >
        {NAV_LINKS.map((link) => {
          const isActive =
            pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-2.5 py-1 whitespace-nowrap shrink-0 rounded hover:text-white',
                isActive && 'text-white underline decoration-brand-teal decoration-2 underline-offset-4'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
