'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@/lib/roles';

interface Rep {
  id: string;
  name: string;
  role: Role;
}

const field =
  'w-full rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export default function ReassignForm({
  leadId,
  currentAssigneeId,
  reps,
}: {
  leadId: string;
  currentAssigneeId: string | null;
  reps: Rep[];
}) {
  const router = useRouter();
  const [assignee, setAssignee] = useState(currentAssigneeId ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/crm/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedToId: assignee || null }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-outline-variant bg-white p-6">
      <h2 className="font-work font-semibold text-industrial-blue">Assign Lead</h2>
      <p className="font-mono text-[11px] text-on-surface-variant">Route this lead to a team member. They&rsquo;ll see it in their own CRM.</p>
      <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={field}>
        <option value="">— Unassigned —</option>
        {reps.map((r) => (
          <option key={r.id} value={r.id}>{r.name}{r.role !== 'SALES_REP' ? ` (${r.role.charAt(0) + r.role.slice(1).toLowerCase()})` : ''}</option>
        ))}
      </select>
      <button type="submit" disabled={saving}
        className="w-full rounded-lg bg-industrial-blue px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50">
        {saving ? 'Saving…' : 'Update assignment'}
      </button>
      {saved && <p className="font-mono text-xs text-primary">Assignment updated.</p>}
    </form>
  );
}
