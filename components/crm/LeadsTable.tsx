import Link from 'next/link';
import type { Lead } from '@prisma/client';

type LeadRow = Lead & { assignedTo?: { name: string } | null };

const statusStyles: Record<string, string> = {
  NEW: 'bg-safety-orange/15 text-safety-orange',
  CONTACTED: 'bg-secondary-container text-on-secondary-container',
  SITE_ASSESSED: 'bg-tertiary-container/20 text-tertiary',
  QUOTED: 'bg-primary-container/15 text-primary',
  WON: 'bg-primary text-white',
  LOST: 'bg-error-container text-on-error-container',
};

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function LeadsTable({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) {
    return (
      <p className="rounded-xl border border-outline-variant bg-white p-8 text-center text-sm text-on-surface-variant">
        No leads yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white">
      <table className="w-full border-collapse text-left">
        <thead className="border-b border-outline-variant bg-surface-container-high">
          <tr>
            <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Lead</th>
            <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Product</th>
            <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Size</th>
            <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Status</th>
            <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Assigned</th>
            <th className="p-4 font-mono text-xs uppercase tracking-wide text-industrial-blue">Created</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="zebra-stripe border-b border-outline-variant/30 transition-colors hover:bg-primary/5">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant/30 bg-primary-container/20 font-mono text-xs font-bold text-primary">
                    {initials(lead.fullName)}
                  </div>
                  <div>
                    <Link href={`/crm/leads/${lead.id}`} className="font-semibold text-industrial-blue hover:text-safety-orange">
                      {lead.fullName}
                    </Link>
                    <div className="font-mono text-[11px] text-on-surface-variant">{lead.phone ?? lead.email ?? '—'}</div>
                  </div>
                </div>
              </td>
              <td className="p-4 text-sm text-on-surface">
                {lead.productCategory === 'general-enquiry' ? 'General enquiry' : lead.productCategory}
              </td>
              <td className="p-4 font-mono text-xs text-on-surface-variant">{lead.projectSize ?? '—'}</td>
              <td className="p-4">
                <span className={`rounded px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide ${statusStyles[lead.status] ?? 'bg-surface-container-highest text-industrial-blue'}`}>
                  {lead.status}
                </span>
              </td>
              <td className="p-4 text-sm font-medium text-industrial-blue">{lead.assignedTo?.name ?? '—'}</td>
              <td className="p-4 font-mono text-xs text-on-surface-variant">{new Date(lead.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
