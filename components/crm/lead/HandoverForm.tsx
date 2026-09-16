'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/crm/Icon';

interface Colleague {
  id: string;
  name: string;
  role: string;
}

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const label = 'mb-1 block font-mono text-[11px] font-medium uppercase tracking-wide text-on-surface-variant';

/**
 * Handing a verified lead to a colleague.
 *
 * This is the front-line rep's exit: every website enquiry lands with them,
 * they call and qualify it, and once it is confirmed real they pass it to
 * whoever will take it forward. Until it is verified the panel explains what
 * is still missing rather than offering a button that would be refused.
 *
 * The same rules are enforced server-side; this only shows them early.
 */
export default function HandoverForm({
  leadId,
  colleagues,
  blockers,
}: {
  leadId: string;
  colleagues: Colleague[];
  /** Reasons this lead is not yet ready, from handoverBlockers(). */
  blockers: string[];
}) {
  const router = useRouter();
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const ready = blockers.length === 0;

  const handOver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to) {
      setError('Choose who is taking this lead.');
      return;
    }
    setSaving(true);
    setError(null);

    const body: Record<string, unknown> = { assignedToId: to };
    if (note.trim()) body.notes = `Handover note: ${note.trim()}`;

    const res = await fetch(`/api/crm/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not hand this lead over.');
      return;
    }

    // The lead now belongs to somebody else, so it drops out of this rep's
    // view entirely — send them back to the list rather than to a 404.
    setDone(colleagues.find((c) => c.id === to)?.name ?? 'your colleague');
    setTimeout(() => {
      router.push('/crm/leads');
      router.refresh();
    }, 1400);
  };

  if (done) {
    return (
      <section className="rounded-xl border border-primary bg-primary-container/10 p-6">
        <h2 className="flex items-center gap-2 font-work font-semibold text-industrial-blue">
          <Icon name="check_circle" className="text-primary" />
          Handed over to {done}
        </h2>
        <p className="mt-2 font-sans text-xs text-on-surface-variant">
          It is now in their pipeline and has left yours. Returning to your leads…
        </p>
      </section>
    );
  }

  return (
    <section className={`rounded-xl border bg-white p-6 ${ready ? 'border-primary/40' : 'border-outline-variant'}`}>
      <h2 className="flex items-center gap-2 font-work font-semibold text-industrial-blue">
        <Icon name="forward_to_inbox" className={ready ? 'text-primary' : 'text-outline'} />
        Hand over
      </h2>

      {!ready ? (
        <>
          <p className="mt-2 font-sans text-xs text-on-surface-variant">
            Verify the lead first. A lead is only passed on once you have spoken to them and
            confirmed it is real work.
          </p>
          <ul className="mt-3 space-y-1.5">
            {blockers.map((b) => (
              <li key={b} className="flex gap-2 font-sans text-xs text-error">
                <Icon name="radio_button_unchecked" className="mt-px text-[14px] shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <form onSubmit={handOver} className="mt-3 space-y-3">
          <p className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary-container/10 p-3 font-sans text-xs text-on-surface">
            <Icon name="verified" className="mt-px text-[16px] shrink-0 text-primary" />
            Verified: contacted, fully qualified and confirmed as real work. Ready to pass on.
          </p>

          <div>
            <label htmlFor="handover-to" className={label}>Hand over to</label>
            <select id="handover-to" value={to} onChange={(e) => setTo(e.target.value)} className={field}>
              <option value="">— Choose a colleague —</option>
              {colleagues.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="handover-note" className={label}>Note for them</label>
            <textarea
              id="handover-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Spoke to the site engineer. Wants 24 casement windows in Najjera, ready to start next month."
              className={field}
            />
          </div>

          {error && <p className="font-mono text-xs text-error">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Handing over…' : 'Confirm and hand over'}
          </button>
          <p className="font-mono text-[11px] text-on-surface-variant">
            This lead will move to their pipeline and leave yours.
          </p>
        </form>
      )}
    </section>
  );
}
