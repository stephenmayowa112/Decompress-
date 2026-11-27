'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { BrandLinkButton } from '@/src/components/ui/Button';

/**
 * Public FAQ Page (/faq) — accessible without login.
 * Strictly displays ONLY published items (isPublished === true) with minimal numbered hairline accordions.
 */
export default function FAQPage() {
  const { faqTopics, faqItems, isAdminUser } = useDecompress();
  const [searchQuery, setSearchQuery] = useState('');

  const publishedItems = useMemo(
    () => faqItems.filter((item) => item.isPublished),
    [faqItems]
  );

  const filteredPublished = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return publishedItems;
    return publishedItems.filter(
      (item) =>
        item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [publishedItems, searchQuery]);

  return (
    <div className="mx-auto max-w-[920px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="space-y-3 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-brand-teal-text">
          Public Help Centre · No Account Required
        </p>
        <h1 className="text-3xl sm:text-[44px] font-bold tracking-[-0.03em] leading-[1.1] text-brand-navy">
          Questions, answered.
        </h1>
        <p className="text-base text-brand-navy/75 leading-relaxed">
          Plain-language answers about discovering venues, making guest or member bookings,
          payments, and event coordination on Decompress.
        </p>
      </div>

      {publishedItems.length > 0 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-teal" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search published FAQs (e.g. booking, invoice, event planning)..."
            aria-label="Search frequently asked questions"
            className="w-full min-h-[54px] rounded-full border border-brand-navy/15 bg-white pl-12 pr-5 py-3 text-sm text-brand-navy shadow-[0_8px_28px_rgba(18,59,96,0.05)] focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/15"
          />
        </div>
      )}

      {publishedItems.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 sm:p-10 border border-brand-navy/8 shadow-[0_8px_28px_rgba(18,59,96,0.05)] space-y-4">
          <h2 className="text-xl font-bold text-brand-navy">
            Help Centre updates in progress
          </h2>
          <p className="text-sm sm:text-base text-brand-navy/75 leading-relaxed">
            We are currently updating our published Help Centre articles. In the meantime, feel
            free to reach out to our customer care team directly with any questions about venues,
            bookings, or event coordination.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <BrandLinkButton href="/contact" variant="primary" size="sm" fullWidthOnMobile={false}>
              Contact Customer Care
            </BrandLinkButton>
            {isAdminUser && (
              <Link
                href="/admin"
                className="text-sm font-semibold text-brand-teal-text hover:underline"
              >
                Publish FAQ items in Admin →
              </Link>
            )}
          </div>
        </div>
      ) : filteredPublished.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 sm:p-10 border border-brand-navy/8 shadow-[0_8px_28px_rgba(18,59,96,0.05)] space-y-3 text-center">
          <p className="text-base font-bold text-brand-navy">
            No published FAQ answers match &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-sm text-brand-navy/75">
            Try a different keyword or reach out directly to our customer-care team.
          </p>
          <div className="pt-2">
            <BrandLinkButton href="/contact" variant="secondary" size="sm" fullWidthOnMobile={false}>
              Contact Customer Care
            </BrandLinkButton>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {faqTopics.map((topic) => {
            const topicItems = filteredPublished
              .filter((item) => item.topicId === topic.id)
              .sort((a, b) => a.order - b.order);
            if (topicItems.length === 0) return null;
            return (
              <section key={topic.id} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-brand-navy">
                  {topic.title}
                </h2>
                <div className="border-t border-brand-navy/12">
                  {topicItems.map((item, idx) => (
                    <details
                      key={item.id}
                      className="group border-b border-brand-navy/12 py-6"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base sm:text-lg font-semibold text-brand-navy">
                        <span className="flex items-baseline gap-5">
                          <span className="text-sm font-medium text-brand-navy/45 tabular-nums">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span>{item.question}</span>
                        </span>
                        <ChevronDown className="h-5 w-5 text-brand-teal shrink-0 transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <p className="mt-4 pl-10 text-sm sm:text-[15px] text-brand-navy/75 leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Deep Navy Compact Help Banner */}
      <div className="rounded-[28px] bg-brand-navy text-white p-7 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-[0_18px_40px_rgba(18,59,96,0.16)]">
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-white">Still have a question?</h2>
          <p className="text-sm text-surface-teal/85">
            Send our concierge support team a message or quote your DCP-XXXXXX booking reference.
          </p>
        </div>
        <BrandLinkButton href="/contact" variant="primary" size="sm" fullWidthOnMobile={false}>
          Contact Us
        </BrandLinkButton>
      </div>
    </div>
  );
}
