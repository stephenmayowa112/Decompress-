'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type BrandButtonVariant = 'primary' | 'secondary' | 'alternative' | 'alternativeOnDark';
export type BrandButtonSize = 'lg' | 'md' | 'sm';

const VARIANT_CLASSES: Record<BrandButtonVariant, string> = {
  /**
   * Primary action: Coral fill (#FF704F), white semibold label at >= 18px (text-lg).
   * Used for "Explore Experiences", "Book Now" and "Request Booking".
   */
  primary:
    'bg-brand-coral text-white hover:bg-brand-coral-hover active:bg-brand-coral-active shadow-sm border-2 border-transparent',
  /**
   * Secondary action: Deep Navy fill (#123B60), white semibold label.
   * Used for "Explore Venues".
   */
  secondary:
    'bg-brand-navy text-white hover:bg-brand-navy-hover active:bg-brand-navy shadow-sm border-2 border-transparent',
  /**
   * Alternative action on light surface: transparent background, 2px teal border (#13A6A3),
   * accessible darker teal label (brand-teal-text #0B6E6C, >= 4.5:1 on #F5F8FA).
   * Used for "Plan an Event".
   */
  alternative:
    'bg-transparent border-2 border-brand-teal text-brand-teal-text hover:bg-surface-teal active:bg-surface-teal/80',
  /**
   * Alternative action when placed inside a Deep Navy hero container:
   * transparent background, 2px teal border (#13A6A3), crisp light-teal text (#E7F5F3).
   */
  alternativeOnDark:
    'bg-transparent border-2 border-brand-teal text-surface-teal hover:bg-brand-teal/15 active:bg-brand-teal/25',
};

const SIZE_CLASSES: Record<BrandButtonSize, string> = {
  // Section 4 Accessibility requirement: semibold labels at 18px (text-lg) or larger on coral buttons
  lg: 'px-4 sm:px-6 py-3.5 text-lg font-semibold rounded-2xl min-h-[52px]',
  md: 'px-4 sm:px-5 py-3 text-lg font-semibold rounded-2xl min-h-[48px]',
  sm: 'px-4 py-2.5 text-base font-semibold rounded-xl min-h-[44px]',
};

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

export interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BrandButtonVariant;
  size?: BrandButtonSize;
  fullWidthOnMobile?: boolean;
}

export function BrandButton({
  variant = 'primary',
  size = 'lg',
  fullWidthOnMobile = true,
  className,
  children,
  ...props
}: BrandButtonProps) {
  // Always enforce >= 18px (text-lg) on primary coral buttons per Section 4 accessibility rules
  const effectiveSizeClass =
    variant === 'primary' && size === 'sm'
      ? 'px-4 py-2.5 text-lg font-semibold rounded-xl min-h-[44px]'
      : SIZE_CLASSES[size];

  return (
    <button
      className={cn(
        BASE_CLASSES,
        VARIANT_CLASSES[variant],
        effectiveSizeClass,
        fullWidthOnMobile ? 'w-full sm:w-auto' : 'w-auto',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface BrandLinkButtonProps {
  href: string;
  variant?: BrandButtonVariant;
  size?: BrandButtonSize;
  fullWidthOnMobile?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function BrandLinkButton({
  href,
  variant = 'primary',
  size = 'lg',
  fullWidthOnMobile = true,
  className,
  children,
}: BrandLinkButtonProps) {
  const effectiveSizeClass =
    variant === 'primary' && size === 'sm'
      ? 'px-4 py-2.5 text-lg font-semibold rounded-xl min-h-[44px]'
      : SIZE_CLASSES[size];

  return (
    <Link
      href={href}
      className={cn(
        BASE_CLASSES,
        VARIANT_CLASSES[variant],
        effectiveSizeClass,
        fullWidthOnMobile ? 'w-full sm:w-auto' : 'w-auto',
        className
      )}
    >
      {children}
    </Link>
  );
}
