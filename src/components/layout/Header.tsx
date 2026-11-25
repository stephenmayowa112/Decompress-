'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
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
 * Strictly enforces the 3-Zone Top Bar Contract on desktop and keeps mobile sticky height
 * compact (64px) with a slide-down drawer for touch-friendly navigation.
 */
export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-brand-navy text-white border-b border-brand-navy-light">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded"
        >
          Decompress
        </Link>

        {/* Zone 2: 5 single-line text navigation links (Desktop & Tablet >= md) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-surface-teal"
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

        {/* Zone 3: 1 primary action on desktop; accessible drawer trigger on mobile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/experiences"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-lg font-semibold text-white bg-brand-coral hover:bg-brand-coral-hover active:bg-brand-coral-active rounded-2xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal"
          >
            Explore Experiences
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex md:hidden items-center justify-center h-11 w-11 rounded-xl text-white hover:bg-brand-navy-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer (< md) */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-brand-navy-light bg-brand-navy px-4 py-4 space-y-2"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center min-h-[44px] px-3 rounded-xl text-base font-medium text-surface-teal hover:bg-brand-navy-light hover:text-white transition-colors',
                  isActive && 'bg-brand-navy-light text-white font-semibold'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/experiences"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center min-h-[48px] px-4 py-3 text-lg font-semibold text-white bg-brand-coral hover:bg-brand-coral-hover active:bg-brand-coral-active rounded-2xl transition-colors"
            >
              Explore Experiences
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
