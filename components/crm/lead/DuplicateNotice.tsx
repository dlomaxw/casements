'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/crm/Icon';

export interface DuplicateRow {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  assignedTo: string | null;
}

/**
 * Shown when another lead shares this one's phone, email or name.
 *
 * Closing it as a duplicate keeps both records and the link between them —
 * the business can still count how many duplicate enquiries a campaign
 * produced, which deleting would throw away.
 */
export default function DuplicateNotice({
  leadId,
  duplicates,
}: {
  leadId: string;
  duplicates: DuplicateRow[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (duplicates.length === 0) return null;

  const closeAsDuplicate = async (originalId: string) => {
    setBusy(originalId);
    setError(null);
    const res = await fetch(`/api/crm/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'DISQUALIFIED',
        lossReason: 'DUPLICATE',
        duplicateOfId: originalId,
      }),
    });
    setBusy(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not close this lead as a duplicate.');
    }
  };

  return (
    <section className="rounded-xl border border-safety-orange bg-safety-orange/5 p-5">
      <h2 className="flex items-center gap-2 font-work font-semibold text-industrial-blue">
        <Icon name="content_copy" className="text-safety-orange" />
        Possible duplicate{duplicates.length > 1 ? 's' : ''}
      </h2>
      <p className="mt-1 font-sans text-xs text-on-surface-variant">
        These leads share a phone number, an email address or a name with this one.
      </p>
      <ul className="mt-3 space-y-2">
        {duplicates.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant bg-white px-3 py-2">
            <span className="min-w-0">
              <Link href={`/crm/leads/${d.id}`} className="font-semibold text-industrial-blue hover:text-safety-orange">
                {d.fullName}
              </Link>
              <span className="ml-2 font-mono text-[11px] text-on-surface-variant">
                {d.phone ?? d.email ?? '—'} · {d.status} · {new Date(d.createdAt).toLocaleDateString()}
                {d.assignedTo ? ` · ${d.assignedTo}` : ''}
              </span>
            </span>
            <button
              type="button"
              onClick={() => closeAsDuplicate(d.id)}
              disabled={busy !== null}
              className="shrink-0 rounded-lg border border-outline-variant px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant hover:border-error hover:text-error disabled:opacity-50"
            >
              {busy === d.id ? 'Closing…' : 'This is the same lead'}
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 font-mono text-xs text-error">{error}</p>}
    </section>
  );
}
