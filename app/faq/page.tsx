'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { BrandLinkButton } from '@/src/components/ui/Button';

/**
 * Public FAQ Page (/faq) — accessible without login (Section 7.7).
 * Strictly displays ONLY published items (isPublished === true) and supports lightweight search.
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
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold text-brand-teal-text">
          Public Help Centre · No Account Required
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-brand-navy/80">
          Plain-language answers about discovering venues, making guest or member bookings,
          payments, and event coordination on Decompress.
        </p>
      </div>

      {publishedItems.length > 0 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-navy/50" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search published FAQs (e.g. booking, invoice, event planning)..."
            aria-label="Search frequently asked questions"
            className="w-full min-h-[48px] rounded-2xl border border-brand-navy/15 bg-white pl-11 pr-4 py-3 text-sm text-brand-navy focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
          />
        </div>
      )}

      {publishedItems.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 sm:p-8 border border-brand-navy/15 space-y-4">
          <h2 className="text-lg font-bold text-brand-navy">
            FAQ topics are currently in draft review
          </h2>
          <p className="text-sm text-brand-navy/75 leading-relaxed">
            In accordance with V1 launch rules, all {faqTopics.length} FAQ topics and{' '}
            {faqItems.length} questions are seeded as <strong>unpublished drafts</strong> so refund,
            cancellation, and payment policies are never shown publicly until confirmed and
            published by an administrator.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
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
        <div className="rounded-2xl bg-white p-6 sm:p-8 border border-brand-navy/15 space-y-3 text-center">
          <p className="text-base font-bold text-brand-navy">
            No published FAQ answers match &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-sm text-brand-navy/75">
            Try a different keyword or reach out directly to our customer-care team.
          </p>
          <div className="pt-1">
            <BrandLinkButton href="/contact" variant="secondary" size="sm" fullWidthOnMobile={false}>
              Contact Customer Care
            </BrandLinkButton>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {faqTopics.map((topic) => {
            const topicItems = filteredPublished
              .filter((item) => item.topicId === topic.id)
              .sort((a, b) => a.order - b.order);
            if (topicItems.length === 0) return null;
            return (
              <section key={topic.id} className="space-y-3">
                <h2 className="text-xl font-bold text-brand-navy">{topic.title}</h2>
                <div className="space-y-2.5">
                  {topicItems.map((item) => (
                    <details
                      key={item.id}
                      className="group rounded-2xl bg-white p-5 border border-brand-navy/10"
                    >
                      <summary className="cursor-pointer text-base font-semibold text-brand-navy">
                        {item.question}
                      </summary>
                      <p className="mt-3 text-sm text-brand-navy/80 leading-relaxed whitespace-pre-line">
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

      <div className="rounded-2xl bg-surface-teal p-6 border border-brand-teal/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-brand-navy">Still have a question?</h2>
          <p className="text-sm text-brand-navy/75">
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
