'use client';

import React, { useState } from 'react';
import {
  CalendarCheck2,
  ClipboardList,
  Mail,
  MessageSquare,
  Receipt,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { AdminBookingsTab } from '@/src/components/admin/AdminBookingsTab';
import { AdminFinanceTab } from '@/src/components/admin/AdminFinanceTab';
import { AdminEventsTab } from '@/src/components/admin/AdminEventsTab';
import { AdminCmsTab } from '@/src/components/admin/AdminCmsTab';
import { AdminVenuesSettingsTab } from '@/src/components/admin/AdminVenuesSettingsTab';
import { formatUtcTimestamp } from '@/src/lib/format';
import { BrandLinkButton } from '@/src/components/ui/Button';

type AdminTab = 'bookings' | 'finance' | 'events' | 'cms' | 'settings' | 'emails';

export default function AdminDashboardPage() {
  const {
    currentUser,
    isAdminUser,
    bookings,
    eventPlanningRequests,
    reviews,
    supportEnquiries,
    emailLogs,
    siteSettings,
  } = useDecompress();

  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;
  const approvedAwaitingPayCount = bookings.filter((b) => b.status === 'approved').length;
  const newEventsCount = eventPlanningRequests.filter((r) => r.status === 'new').length;
  const visibleReviewsCount = reviews.filter((r) => !r.isHidden).length;
  const openSupportCount = supportEnquiries.filter((e) => e.status === 'open').length;

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'bookings',
      label: `Bookings (${bookings.length})`,
      icon: <CalendarCheck2 className="h-4 w-4" />,
    },
    {
      id: 'finance',
      label: 'Settlements & Invoices',
      icon: <Receipt className="h-4 w-4" />,
    },
    {
      id: 'events',
      label: `Event Requests (${eventPlanningRequests.length})`,
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      id: 'cms',
      label: 'FAQ, Reviews & Support',
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: 'settings',
      label: 'Venues & Settings',
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: 'emails',
      label: `Emails (${emailLogs.length})`,
      icon: <Mail className="h-4 w-4" />,
    },
  ];

  const activeEmail = emailLogs.find((e) => e.id === selectedEmailId) || emailLogs[0] || null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Branded Admin Header */}
      <div className="rounded-3xl bg-brand-navy text-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-surface-teal">
            <ShieldCheck className="h-4 w-4 text-brand-teal" />
            <span>Decompress Operations &amp; Concierge Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Operations Console</h1>
          <p className="text-sm text-surface-teal/85 max-w-2xl">
            Manage booking approvals, tokenised payment links, commercial settlements, event
            planning quotations, live FAQ publishing, Verified review moderation, and support
            enquiries.
          </p>
        </div>

        <div className="shrink-0 text-xs text-surface-teal/90 space-y-1">
          {isAdminUser ? (
            <p className="font-semibold">
              Signed in as Superuser ({currentUser?.email})
            </p>
          ) : (
            <div className="rounded-2xl bg-white/10 p-3.5 space-y-2 max-w-xs">
              <p className="font-semibold text-white">Preview Mode</p>
              <p className="text-[11px] text-surface-teal/90">
                Sign in with administrator credentials to manage and save changes to the database.
              </p>
              <BrandLinkButton
                href="/login?next=/admin"
                variant="primary"
                size="sm"
                fullWidthOnMobile={false}
              >
                Admin Sign In
              </BrandLinkButton>
            </div>
          )}
        </div>
      </div>

      {/* Top KPI Summary Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className="text-left rounded-2xl bg-white p-4 border border-brand-navy/15 hover:border-brand-teal transition-colors cursor-pointer"
        >
          <span className="block text-xs text-brand-navy/65">Pending Bookings</span>
          <span className="text-2xl font-bold text-brand-navy tabular-nums">
            {pendingBookingsCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className="text-left rounded-2xl bg-white p-4 border border-brand-navy/15 hover:border-brand-teal transition-colors cursor-pointer"
        >
          <span className="block text-xs text-brand-navy/65">Awaiting Payment</span>
          <span className="text-2xl font-bold text-brand-navy tabular-nums">
            {approvedAwaitingPayCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className="text-left rounded-2xl bg-white p-4 border border-brand-navy/15 hover:border-brand-teal transition-colors cursor-pointer"
        >
          <span className="block text-xs text-brand-navy/65">New Event Briefs</span>
          <span className="text-2xl font-bold text-brand-navy tabular-nums">{newEventsCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cms')}
          className="text-left rounded-2xl bg-white p-4 border border-brand-navy/15 hover:border-brand-teal transition-colors cursor-pointer"
        >
          <span className="block text-xs text-brand-navy/65">Verified Reviews</span>
          <span className="text-2xl font-bold text-brand-navy tabular-nums">
            {visibleReviewsCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cms')}
          className="text-left rounded-2xl bg-white p-4 border border-brand-navy/15 hover:border-brand-teal transition-colors cursor-pointer col-span-2 md:col-span-1"
        >
          <span className="block text-xs text-brand-navy/65">Open Enquiries</span>
          <span className="text-2xl font-bold text-brand-navy tabular-nums">
            {openSupportCount}
          </span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Admin sections"
        className="flex items-center gap-2 overflow-x-auto pb-1"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-brand-teal text-white border-brand-teal'
                  : 'bg-white text-brand-navy border-brand-navy/15 hover:bg-surface-teal'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'bookings' && <AdminBookingsTab />}
        {activeTab === 'finance' && <AdminFinanceTab />}
        {activeTab === 'events' && <AdminEventsTab />}
        {activeTab === 'cms' && <AdminCmsTab />}
        {activeTab === 'settings' && <AdminVenuesSettingsTab />}
        {activeTab === 'emails' && (
          <section className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-brand-navy">
                Transactional Email Dispatch Log
              </h2>
              <p className="text-xs text-brand-navy/75">
                Inspect branded Decompress HTML &amp; plain-text notifications triggered by booking
                and event lifecycle transitions.
              </p>
            </div>

            {emailLogs.length === 0 ? (
              <p className="text-sm text-brand-navy/70">
                No transactional emails triggered yet. Submit a booking or event request to see
                rendered emails here.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2 max-h-[520px] overflow-y-auto">
                  {emailLogs.map((log) => (
                    <button
                      key={log.id}
                      type="button"
                      onClick={() => setSelectedEmailId(log.id)}
                      className={`w-full text-left rounded-xl p-3.5 border transition-colors cursor-pointer space-y-1 ${
                        activeEmail?.id === log.id
                          ? 'bg-surface-teal border-brand-teal'
                          : 'bg-surface border-brand-navy/10 hover:bg-surface-teal/40'
                      }`}
                    >
                      <p className="text-[11px] font-mono font-bold text-brand-teal-text">
                        {log.template} · {log.relatedReference}
                      </p>
                      <p className="text-xs font-bold text-brand-navy line-clamp-1">
                        {log.subject}
                      </p>
                      <p className="text-[11px] text-brand-navy/65">
                        To: {log.to} ·{' '}
                        {formatUtcTimestamp(log.sentAtUtc, siteSettings.defaultTimezone)}
                      </p>
                    </button>
                  ))}
                </div>

                {activeEmail && (
                  <div className="lg:col-span-2 rounded-2xl border border-brand-navy/15 overflow-hidden bg-surface">
                    <div className="p-4 bg-white border-b border-brand-navy/10 space-y-1 text-xs">
                      <p className="font-bold text-brand-navy text-sm">{activeEmail.subject}</p>
                      <p className="text-brand-navy/70">
                        To: <strong>{activeEmail.to}</strong> · Template:{' '}
                        <span className="font-mono">{activeEmail.template}</span>
                      </p>
                      <p className="text-brand-navy/65">{activeEmail.plainTextBody}</p>
                    </div>
                    <iframe
                      title={`Email preview ${activeEmail.subject}`}
                      sandbox=""
                      srcDoc={activeEmail.htmlBody}
                      className="w-full h-[420px] bg-white"
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
