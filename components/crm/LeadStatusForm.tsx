'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = ['NEW', 'CONTACTED', 'SITE_ASSESSED', 'QUOTED', 'WON', 'LOST'] as const;

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant';

export default function LeadStatusForm({
  leadId,
  currentStatus,
  currentFollowUp,
}: {
  leadId: string;
  currentStatus: string;
  currentFollowUp?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState(currentFollowUp ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const body: Record<string, unknown> = { status };
    if (notes.trim()) body.notes = notes.trim();
    if (followUpDate) body.followUpDate = new Date(followUpDate).toISOString();

    const res = await fetch(`/api/crm/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setNotes('');
      router.refresh();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-outline-variant bg-white p-6">
      <h2 className="font-work font-semibold text-industrial-blue">Update Lead</h2>
      <div>
        <label htmlFor="status" className={label}>Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="followUp" className={label}>Follow-up date</label>
        <input id="followUp" type="date" value={followUpDate ? followUpDate.slice(0, 10) : ''} onChange={(e) => setFollowUpDate(e.target.value)} className={field} />
      </div>
      <div>
        <label htmlFor="notes" className={label}>Add a note</label>
        <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={field} placeholder="Logged a call, sent quote…" />
      </div>
      <button type="submit" disabled={saving}
        className="w-full rounded-lg bg-primary px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
        {saving ? 'Saving…' : 'Save'}
      </button>
      {saved && <p className="font-mono text-xs text-primary">Saved.</p>}
    </form>
  );
}
