'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Rep {
  id: string;
  name: string;
  role: 'ADMIN' | 'SALES_REP';
}

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

  const field =
    'w-full rounded-md border border-brand-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
      <h2 className="font-display font-bold text-brand-950">Assign Lead</h2>
      <p className="text-xs text-brand-500">Route this lead to a team member. They&rsquo;ll see it in their own CRM.</p>
      <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={field}>
        <option value="">— Unassigned —</option>
        {reps.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}{r.role === 'ADMIN' ? ' (Admin)' : ''}
          </option>
        ))}
      </select>
      <button type="submit" disabled={saving}
        className="w-full rounded-md bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
        {saving ? 'Saving…' : 'Update assignment'}
      </button>
      {saved && <p className="text-sm text-green-700">Assignment updated.</p>}
    </form>
  );
}
