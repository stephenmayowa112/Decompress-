'use client';

import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, Plus, Star } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { FAQItem, SupportEnquiryStatus } from '@/src/types/domain';
import { generateSecureToken } from '@/src/lib/booking-machine';
import { formatUtcTimestamp } from '@/src/lib/format';

export function AdminCmsTab() {
  const {
    faqTopics,
    faqItems,
    reviews,
    supportEnquiries,
    siteSettings,
    adminToggleFaqPublished,
    adminSaveFaqItem,
    adminToggleReviewHidden,
    adminUpdateSupportEnquiryStatus,
  } = useDecompress();

  const [newTopicId, setNewTopicId] = useState(faqTopics[0]?.id || '');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newPublishNow, setNewPublishNow] = useState(false);
  const [cmsFeedback, setCmsFeedback] = useState<string | null>(null);

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const topic = faqTopics.find((t) => t.id === newTopicId) || faqTopics[0];
    const item: FAQItem = {
      id: generateSecureToken('id'),
      topicId: topic.id,
      topicSlug: topic.slug,
      question: newQuestion.trim().slice(0, 300),
      answer: newAnswer.trim().slice(0, 2500),
      order: faqItems.length + 1,
      isPublished: newPublishNow,
      requiresPolicyConfirmation: false,
    };
    await adminSaveFaqItem(item);
    setNewQuestion('');
    setNewAnswer('');
    setNewPublishNow(false);
    setCmsFeedback(`Added FAQ item (${item.isPublished ? 'Published live' : 'Saved as draft'}).`);
  };

  return (
    <div className="space-y-8">
      {/* 1. Live FAQ CMS */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-brand-navy">Live FAQ CMS (Publish / Unpublish)</h2>
          <p className="text-xs text-brand-navy/75">
            Changes publish immediately to /faq without redeploying. Refund, cancellation, and
            payment drafts carry a founder-confirmation warning until explicitly approved.
          </p>
        </div>

        {cmsFeedback && (
          <div className="rounded-xl bg-surface-teal border border-brand-teal/30 px-4 py-2.5 text-xs font-semibold text-brand-navy">
            {cmsFeedback}
          </div>
        )}

        {/* Quick Add FAQ Item */}
        <form
          onSubmit={handleAddFaq}
          className="rounded-2xl bg-surface p-4 border border-brand-navy/10 space-y-3"
        >
          <p className="text-xs font-bold text-brand-navy">Create New FAQ Entry</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={newTopicId}
              onChange={(e) => setNewTopicId(e.target.value)}
              className="min-h-[40px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-xs text-brand-navy"
            >
              {faqTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="min-h-[40px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-xs text-brand-navy"
            />
          </div>
          <textarea
            rows={2}
            placeholder="Plain-language answer..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="w-full rounded-xl border border-brand-navy/20 bg-white px-3 py-2 text-xs text-brand-navy"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-xs text-brand-navy cursor-pointer">
              <input
                type="checkbox"
                checked={newPublishNow}
                onChange={(e) => setNewPublishNow(e.target.checked)}
                className="h-4 w-4 accent-brand-teal"
              />
              <span>Publish immediately to public /faq</span>
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 min-h-[38px] px-4 py-1.5 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navy-light cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add FAQ Item</span>
            </button>
          </div>
        </form>

        {/* Existing FAQ Items */}
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {faqItems.map((item) => {
            const topic = faqTopics.find((t) => t.id === item.topicId);
            return (
              <div
                key={item.id}
                className="rounded-xl bg-surface/60 p-4 border border-brand-navy/10 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-semibold text-brand-teal-text">
                      {topic?.title || item.topicSlug}
                    </span>
                    <span
                      className={`font-bold ${
                        item.isPublished ? 'text-brand-teal-text' : 'text-brand-navy/55'
                      }`}
                    >
                      · {item.isPublished ? 'Published Live' : 'Unpublished Draft'}
                    </span>
                    {item.requiresPolicyConfirmation && (
                      <span className="inline-flex items-center gap-1 text-[#9A3412] font-semibold">
                        <AlertTriangle className="h-3 w-3" />
                        Confirm policy before publishing
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-brand-navy">{item.question}</p>
                  <p className="text-xs text-brand-navy/75 line-clamp-2">{item.answer}</p>
                </div>
                <button
                  type="button"
                  onClick={() => adminToggleFaqPublished(item.id)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                    item.isPublished
                      ? 'bg-white text-brand-navy border-brand-navy/20 hover:bg-red-50 hover:text-red-700'
                      : 'bg-brand-teal text-white border-brand-teal hover:bg-brand-teal-dark'
                  }`}
                >
                  {item.isPublished ? 'Unpublish' : 'Publish Live'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Verified Reviews Moderation */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-brand-navy">Verified Reviews Moderation</h2>
          <p className="text-xs text-brand-navy/75">
            Every review is strictly linked to a completed booking. Hide or unhide reviews here.
          </p>
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-brand-navy/70">No Verified reviews submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl bg-surface p-4 border border-brand-navy/10 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-brand-navy">{rev.venueName}</span>
                    <span className="font-mono text-brand-teal-text">{rev.bookingReference}</span>
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
                      <strong>{rev.rating}.0</strong>
                    </span>
                    <span className="text-brand-navy/60">by {rev.reviewerName}</span>
                  </div>
                  {rev.venueFeedback && (
                    <p className="text-xs text-brand-navy/85">{rev.venueFeedback}</p>
                  )}
                  {rev.experienceFeedback && (
                    <p className="text-xs text-brand-navy/70 italic">
                      Decompress feedback: {rev.experienceFeedback}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => adminToggleReviewHidden(rev.id)}
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl bg-white border border-brand-navy/20 text-xs font-semibold text-brand-navy hover:bg-surface-teal cursor-pointer shrink-0"
                >
                  {rev.isHidden ? (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>Unhide Review</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Hide Review</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Customer Support Enquiries */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-brand-navy">Customer Support Enquiries</h2>
          <p className="text-xs text-brand-navy/75">
            Messages submitted via /contact, including optional booking references.
          </p>
        </div>

        {supportEnquiries.length === 0 ? (
          <p className="text-sm text-brand-navy/70">No support enquiries received yet.</p>
        ) : (
          <div className="space-y-3">
            {supportEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="rounded-xl bg-surface p-4 border border-brand-navy/10 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-brand-navy">{enq.name}</span>
                    <span className="text-brand-navy/70">{enq.email}</span>
                    {enq.bookingReference && (
                      <span className="font-mono font-semibold text-brand-teal-text">
                        Ref: {enq.bookingReference}
                      </span>
                    )}
                    <span className="text-brand-navy/55">
                      {formatUtcTimestamp(enq.createdAtUtc, siteSettings.defaultTimezone)}
                    </span>
                  </div>
                  <p className="text-xs text-brand-navy/85 leading-relaxed">{enq.message}</p>
                </div>
                <select
                  aria-label={`Support enquiry status for ${enq.name}`}
                  value={enq.status}
                  onChange={(e) =>
                    adminUpdateSupportEnquiryStatus(
                      enq.id,
                      e.target.value as SupportEnquiryStatus
                    )
                  }
                  className="min-h-[36px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy shrink-0"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
