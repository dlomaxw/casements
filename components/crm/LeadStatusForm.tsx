'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = ['NEW', 'CONTACTED', 'SITE_ASSESSED', 'QUOTED', 'WON', 'LOST'] as const;

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

  const field = 'w-full rounded-md border border-brand-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
      <h2 className="font-display font-bold text-brand-950">Update Lead</h2>
      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-brand-900">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="followUp" className="mb-1 block text-sm font-medium text-brand-900">Follow-up date</label>
        <input id="followUp" type="date" value={followUpDate ? followUpDate.slice(0, 10) : ''} onChange={(e) => setFollowUpDate(e.target.value)} className={field} />
      </div>
      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-brand-900">Add a note</label>
        <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={field} placeholder="Logged a call, sent quote…" />
      </div>
      <button type="submit" disabled={saving} className="w-full rounded-md bg-accent-500 px-4 py-2.5 text-sm font-semibold text-brand-950 hover:bg-accent-400 disabled:opacity-50">
        {saving ? 'Saving…' : 'Save'}
      </button>
      {saved && <p className="text-sm text-green-700">Saved.</p>}
    </form>
  );
}
