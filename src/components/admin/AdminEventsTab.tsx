'use client';

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useDecompress } from '@/src/context/DecompressContext';
import { EventRequestStatus } from '@/src/types/domain';
import {
  EVENT_REQUEST_STATUSES,
  formatEventRequestStatusLabel,
  formatEventServiceLevelLabel,
} from '@/src/lib/booking-machine';
import { formatCurrencyMinor } from '@/src/lib/format';

export function AdminEventsTab() {
  const { eventPlanningRequests, addOns, adminUpdateEventRequest } = useDecompress();

  const [draftStatus, setDraftStatus] = useState<Record<string, EventRequestStatus>>({});
  const [draftQuoteNgn, setDraftQuoteNgn] = useState<Record<string, string>>({});
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const handleSave = async (requestId: string) => {
    const target = eventPlanningRequests.find((r) => r.id === requestId);
    if (!target) return;
    const status = draftStatus[requestId] || target.status;
    const quoteRaw = draftQuoteNgn[requestId];
    const quotedAmountMinor =
      quoteRaw !== undefined
        ? Math.round((Number(quoteRaw) || 0) * 100)
        : target.quotedAmountMinor ?? null;
    const notes = draftNotes[requestId] ?? target.notes ?? '';

    const updated = await adminUpdateEventRequest(requestId, {
      status,
      quotedAmountMinor,
      notes,
    });
    setBanner(
      `Updated event request ${updated.reference} to "${formatEventRequestStatusLabel(updated.status)}".`
    );
  };

  return (
    <div className="space-y-4">
      {banner && (
        <div className="rounded-xl bg-surface-teal border border-brand-teal/30 px-4 py-3 text-sm text-brand-navy">
          {banner}
        </div>
      )}

      {eventPlanningRequests.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 border border-brand-navy/15 text-center text-sm text-brand-navy/75">
          No event planning requests yet. Requests submitted on /plan-event or attached to venue
          bookings appear here.
        </div>
      ) : (
        eventPlanningRequests.map((req) => {
          const status = draftStatus[req.id] || req.status;
          const quoteNgn =
            draftQuoteNgn[req.id] ??
            (typeof req.quotedAmountMinor === 'number'
              ? String(Math.round(req.quotedAmountMinor / 100))
              : '');
          const notes = draftNotes[req.id] ?? req.notes ?? '';
          const addOnNames = req.selectedAddOnIds.map(
            (id) => addOns.find((a) => a.id === id)?.name || id
          );

          return (
            <article
              key={req.id}
              className="rounded-2xl bg-white p-5 sm:p-6 border border-brand-navy/15 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-brand-navy">{req.reference}</span>
                    <span className="font-semibold text-brand-teal-text">
                      {formatEventServiceLevelLabel(req.serviceLevel)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy">
                    {req.occasion} · {req.location} ({req.date})
                  </h3>
                  <p className="text-xs text-brand-navy/75">
                    {req.guestName} ({req.guestEmail} · {req.guestPhone}) · {req.guestCount} guests ·
                    Indicative budget:{' '}
                    <strong className="tabular-nums">
                      {formatCurrencyMinor(req.budgetMinor, req.currency)}
                    </strong>
                  </p>
                </div>
              </div>

              <p className="text-xs text-brand-navy/85 bg-surface rounded-xl p-3.5 border border-brand-navy/10">
                <strong>Brief:</strong> {req.assistanceNeeded}
              </p>

              {addOnNames.length > 0 && (
                <p className="text-xs text-brand-navy/80">
                  <strong>Selected Add-Ons:</strong> {addOnNames.join(' · ')}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-brand-navy/10 text-xs">
                <label className="space-y-1">
                  <span className="block font-semibold text-brand-navy">Pipeline Status</span>
                  <select
                    value={status}
                    onChange={(e) =>
                      setDraftStatus((prev) => ({
                        ...prev,
                        [req.id]: e.target.value as EventRequestStatus,
                      }))
                    }
                    className="w-full min-h-[40px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-sm text-brand-navy"
                  >
                    {EVENT_REQUEST_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {formatEventRequestStatusLabel(st)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="block font-semibold text-brand-navy">
                    Custom Quote ({req.currency})
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    placeholder="Set amount when quoting"
                    value={quoteNgn}
                    onChange={(e) =>
                      setDraftQuoteNgn((prev) => ({ ...prev, [req.id]: e.target.value }))
                    }
                    className="w-full min-h-[40px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-sm text-brand-navy"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block font-semibold text-brand-navy">Internal Notes</span>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) =>
                      setDraftNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                    }
                    placeholder="Coordinator follow-up notes..."
                    className="w-full min-h-[40px] rounded-xl border border-brand-navy/20 bg-white px-3 py-1.5 text-sm text-brand-navy"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => handleSave(req.id)}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:bg-brand-teal-dark cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Request &amp; Dispatch Quote (if Quoted)</span>
              </button>
            </article>
          );
        })
      )}
    </div>
  );
}
