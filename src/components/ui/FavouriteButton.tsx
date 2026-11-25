'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { cn } from '@/lib/utils';

export interface FavouriteButtonProps {
  venueId: string;
  venueName: string;
  compact?: boolean;
  className?: string;
}

export function FavouriteButton({
  venueId,
  venueName,
  compact = false,
  className,
}: FavouriteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { favouriteVenueIds, toggleFavouriteVenue } = useDecompress();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const isSaved = favouriteVenueIds.includes(venueId);

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await toggleFavouriteVenue(venueId);
      if (result === 'requires_auth') {
        const nextUrl = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
        router.push(`/login${nextUrl}`);
      } else if (result === 'requires_verification') {
        setNotice('Verify your email in Account to save favourites.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn('relative inline-flex flex-col items-end', className)}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={busy}
        aria-pressed={isSaved}
        aria-label={isSaved ? `Remove ${venueName} from favourites` : `Save ${venueName} to favourites`}
        title={isSaved ? 'Saved in favourites' : 'Save to favourites'}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-xl border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-teal disabled:opacity-60',
          compact ? 'h-10 w-10 bg-white/95 border-brand-navy/15 shadow-sm' : 'min-h-[44px] px-3.5 py-2 text-sm font-semibold bg-white border-brand-navy/15',
          isSaved
            ? 'text-brand-coral-text border-brand-coral/40 bg-white'
            : 'text-brand-navy hover:bg-surface-teal'
        )}
      >
        <Heart
          className={cn(
            'h-4 w-4 shrink-0 transition-transform',
            isSaved ? 'fill-brand-coral text-brand-coral' : 'text-brand-navy/75'
          )}
        />
        {!compact && <span className="whitespace-nowrap">{isSaved ? 'Saved' : 'Save Venue'}</span>}
      </button>
      {notice && (
        <span
          role="status"
          className="mt-1 rounded-lg bg-brand-navy px-2.5 py-1 text-[11px] font-medium text-white shadow-sm whitespace-nowrap"
        >
          {notice}
        </span>
      )}
    </div>
  );
}
