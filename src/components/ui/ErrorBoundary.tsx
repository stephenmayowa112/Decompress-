'use client';

import React from 'react';
import { BrandButton } from '@/src/components/ui/Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Decompress ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const showDebugDetails = process.env.NODE_ENV !== 'production';
      return (
        <div className="mx-auto max-w-2xl px-4 py-16">
          <div className="rounded-[28px] bg-white p-8 border border-brand-navy/8 shadow-[0_12px_36px_rgba(18,59,96,0.06)] space-y-4">
            <h2 className="text-2xl font-bold text-brand-navy">Something went wrong</h2>
            <p className="text-sm text-brand-navy/80 leading-relaxed">
              We encountered an unexpected issue while loading this section. You can reset the view
              below and continue browsing Decompress.
            </p>
            {showDebugDetails && this.state.errorMessage && (
              <pre className="overflow-x-auto rounded-2xl bg-surface p-4 text-xs text-brand-navy/80 border border-brand-navy/10">
                {this.state.errorMessage}
              </pre>
            )}
            <BrandButton
              variant="secondary"
              size="sm"
              fullWidthOnMobile={false}
              onClick={() => this.setState({ hasError: false, errorMessage: null })}
            >
              Reset View
            </BrandButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
