import Link from 'next/link';
import type { Lead } from '@prisma/client';

type LeadRow = Lead & { assignedTo?: { name: string } | null };

const statusStyles: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-amber-100 text-amber-800',
  SITE_ASSESSED: 'bg-purple-100 text-purple-800',
  QUOTED: 'bg-cyan-100 text-cyan-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-700',
};

export default function LeadsTable({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) {
    return <p className="rounded-lg bg-white p-8 text-center text-sm text-brand-500 ring-1 ring-brand-100">No leads yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-brand-100">
      <table className="min-w-full divide-y divide-brand-100 text-sm">
        <thead className="bg-steel-50 text-left text-xs uppercase tracking-wide text-brand-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Product</th>
            <th className="px-4 py-3 font-semibold">Size</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Assigned</th>
            <th className="px-4 py-3 font-semibold">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-100">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-steel-50">
              <td className="px-4 py-3">
                <Link href={`/crm/leads/${lead.id}`} className="font-medium text-brand-700 hover:text-accent-600">
                  {lead.fullName}
                </Link>
                <div className="text-xs text-brand-500">{lead.phone}</div>
              </td>
              <td className="px-4 py-3 text-brand-900">{lead.productCategory}</td>
              <td className="px-4 py-3 text-brand-900">{lead.projectSize}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[lead.status] ?? 'bg-brand-100 text-brand-700'}`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-3 text-brand-900">{lead.assignedTo?.name ?? '—'}</td>
              <td className="px-4 py-3 text-brand-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
