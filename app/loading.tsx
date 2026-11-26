import React from 'react';

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-3 max-w-xl">
        <div className="h-3.5 w-32 rounded-full bg-surface-teal animate-pulse" />
        <div className="h-10 w-3/4 rounded-2xl bg-brand-navy/10 animate-pulse" />
        <div className="h-4 w-full rounded-full bg-brand-navy/8 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-72 rounded-[24px] bg-white border border-brand-navy/8 shadow-[0_6px_28px_rgba(18,59,96,0.04)] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
