'use client';

import React from 'react';
import Link from 'next/link';
import { useDecompress } from '@/src/context/DecompressContext';
import { BrandLinkButton } from '@/src/components/ui/Button';

/**
 * Public FAQ Page (/faq) — accessible without login (Section 7.7).
 * Strictly displays ONLY published items (isPublished === true).
 * All 21 seeded questions start as unpublished drafts (isPublished: false)
 * until an admin explicitly publishes them in Milestone 8 / Admin Console.
 */
export default function FAQPage() {
  const { faqTopics, faqItems } = useDecompress();
  const publishedItems = faqItems.filter((item) => item.isPublished);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
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

      {publishedItems.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 border border-brand-navy/15 space-y-4">
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
            <Link
              href="/admin"
              className="text-sm font-semibold text-brand-teal-text hover:underline"
            >
              Review unpublished FAQ drafts in Admin →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {faqTopics.map((topic) => {
            const topicItems = publishedItems
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
                      <p className="mt-3 text-sm text-brand-navy/80 leading-relaxed">
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
    </div>
  );
}
