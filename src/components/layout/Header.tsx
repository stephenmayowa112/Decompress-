'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
 * Airy Minimal Top Navigation Bar inspired by the minimal redesign template,
 * grounded in Decompress Soft White (#F5F8FA), Deep Navy (#123B60) wordmark/links,
 * Vibrant Teal (#13A6A3) interactive highlights, and Coral (#FF704F) primary CTA.
 */
export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-brand-navy/8">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 lg:px-8 h-16 sm:h-[74px]">
        {/* Zone 1: Decompress logo */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="relative flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded"
        >
          <Image
            src="/assets/images/decompress.png"
            alt="Decompress"
            width={180}
            height={96}
            priority
            className="h-10 sm:h-12 w-auto"
          />
        </Link>

        {/* Zone 2: 5 clean single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-brand-navy/75"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'py-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded',
                  isActive &&
                    'text-brand-navy font-semibold underline underline-offset-8 decoration-brand-teal decoration-2'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Single Golden Yellow CTA + mobile drawer button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/experiences"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-lg font-semibold text-brand-navy bg-brand-yellow hover:bg-brand-yellow-hover active:bg-brand-yellow-active rounded-2xl shadow-[0_6px_18px_rgba(255,200,87,0.32)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(255,200,87,0.44)] transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal"
          >
            Explore Experiences
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex md:hidden items-center justify-center h-11 w-11 rounded-2xl text-brand-navy hover:bg-surface-teal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal cursor-pointer"
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
          className="md:hidden border-t border-brand-navy/10 bg-white px-4 py-4 space-y-1.5 shadow-[0_16px_32px_rgba(18,59,96,0.08)]"
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
                  'flex items-center min-h-[44px] px-3.5 rounded-2xl text-base font-medium text-brand-navy/80 hover:bg-surface-teal hover:text-brand-navy transition-colors',
                  isActive && 'bg-surface-teal text-brand-navy font-semibold'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2.5">
            <Link
              href="/experiences"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center min-h-[50px] px-4 py-3 text-lg font-semibold text-brand-navy bg-brand-yellow hover:bg-brand-yellow-hover active:bg-brand-yellow-active rounded-2xl shadow-[0_6px_18px_rgba(255,200,87,0.32)] transition-colors"
            >
              Explore Experiences
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
