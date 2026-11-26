'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type BrandButtonVariant =
  | 'primary'
  | 'highlight'
  | 'secondary'
  | 'alternative'
  | 'alternativeOnDark';
export type BrandButtonSize = 'lg' | 'md' | 'sm';

const VARIANT_CLASSES: Record<BrandButtonVariant, string> = {
  /**
   * Primary action: Coral fill (#FF704F), crisp white semibold label (>= 18px).
   * Matches Decompress button guideline ("Explore Experiences", "Book Now").
   */
  primary:
    'bg-brand-coral text-white hover:bg-brand-coral-hover active:bg-brand-coral-active shadow-[0_8px_20px_rgba(255,112,79,0.22)] hover:shadow-[0_14px_28px_rgba(255,112,79,0.32)] border-2 border-transparent',
  /**
   * Golden Yellow action (#FFC857) with high-contrast Deep Navy label (#123B60).
   */
  highlight:
    'bg-brand-yellow text-brand-navy hover:bg-brand-yellow-hover active:bg-brand-yellow-active shadow-[0_8px_20px_rgba(255,200,87,0.32)] hover:shadow-[0_14px_28px_rgba(255,200,87,0.44)] border-2 border-transparent',
  /**
   * Secondary action: Deep Navy fill (#123B60), crisp white semibold label.
   * Matches Decompress button guideline ("Explore Venues").
   */
  secondary:
    'bg-brand-navy text-white hover:bg-brand-navy-hover active:bg-brand-navy shadow-[0_8px_20px_rgba(18,59,96,0.18)] hover:shadow-[0_14px_28px_rgba(18,59,96,0.26)] border-2 border-transparent',
  /**
   * Alternative action on light surface: transparent background, crisp 2px Vibrant Teal border (#13A6A3),
   * accessible darker teal label (#0B6E6C).
   * Matches Decompress button guideline ("Plan an Event").
   */
  alternative:
    'bg-transparent border-2 border-brand-teal text-brand-teal-text hover:bg-surface-teal hover:shadow-[0_10px_24px_rgba(19,166,163,0.14)] active:bg-surface-teal/80',
  /**
   * Alternative action on Deep Navy dark surfaces:
   * transparent background, 2px Vibrant Teal border (#13A6A3), crisp Vibrant/Light Teal text.
   */
  alternativeOnDark:
    'bg-transparent border-2 border-brand-teal text-surface-teal hover:bg-brand-teal/15 hover:shadow-[0_10px_24px_rgba(19,166,163,0.22)] active:bg-brand-teal/25',
};

const SIZE_CLASSES: Record<BrandButtonSize, string> = {
  // Accessibility requirement: semibold labels at 18px (text-lg) or larger on coral buttons
  lg: 'px-6 sm:px-8 py-3.5 text-lg font-semibold rounded-2xl min-h-[54px]',
  md: 'px-5 sm:px-6 py-3 text-lg font-semibold rounded-2xl min-h-[50px]',
  sm: 'px-4 sm:px-5 py-2.5 text-base font-semibold rounded-2xl min-h-[44px]',
};

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

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
  // Enforce >= 18px (text-lg) on primary coral buttons for WCAG AA compliance
  const effectiveSizeClass =
    variant === 'primary' && size === 'sm'
      ? 'px-4 sm:px-5 py-2.5 text-lg font-semibold rounded-2xl min-h-[44px]'
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
      ? 'px-4 sm:px-5 py-2.5 text-lg font-semibold rounded-2xl min-h-[44px]'
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
