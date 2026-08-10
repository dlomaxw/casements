import Link from 'next/link';
import type { LeadStatus } from '@prisma/client';

const STATUS: Record<LeadStatus, { label: string; dot: string }> = {
  NEW: { label: 'New', dot: 'bg-primary' },
  CONTACTED: { label: 'Contacted', dot: 'bg-blue-500' },
  SITE_ASSESSED: { label: 'Site Assessed', dot: 'bg-purple-500' },
  QUOTED: { label: 'Quoted', dot: 'bg-safety-orange' },
  WON: { label: 'Won', dot: 'bg-emerald-600' },
  LOST: { label: 'Lost', dot: 'bg-error' },
};

const CHIP = ['bg-primary-container/20 text-primary', 'bg-blue-100 text-blue-700', 'bg-amber-100 text-amber-800', 'bg-purple-100 text-purple-700', 'bg-slate-100 text-slate-700'];

export interface RecentLeadRow {
  id: string;
  fullName: string;
  productCategory: string;
  sourcePage: string | null;
  status: LeadStatus;
  createdAt: Date;
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

// A stable colour per category, so the same product always reads the same.
function chipFor(category: string): string {
  let h = 0;
  for (const ch of category) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return CHIP[h % CHIP.length];
}

export default function RecentLeads({ leads, labels }: { leads: RecentLeadRow[]; labels: Record<string, string> }) {
  if (leads.length === 0) {
    return <p className="py-10 text-center text-sm text-on-surface-variant">No leads yet.</p>;
  }

  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-outline-variant text-left font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">
            <th className="px-2 pb-3 font-medium">Lead</th>
            <th className="px-2 pb-3 font-medium">Category</th>
            <th className="px-2 pb-3 font-medium">Source</th>
            <th className="px-2 pb-3 font-medium">Status</th>
            <th className="px-2 pb-3 font-medium">Date Added</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            const s = STATUS[l.status];
            const label = labels[l.productCategory] ?? (l.productCategory === 'general-enquiry' ? 'General' : l.productCategory);
            return (
              <tr key={l.id} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-low">
                <td className="px-2 py-3">
                  <Link href={`/crm/leads/${l.id}`} className="flex items-center gap-2.5 font-medium text-industrial-blue hover:text-safety-orange">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-container/20 font-mono text-[10px] font-bold text-primary">
                      {initials(l.fullName)}
                    </span>
                    {l.fullName}
                  </Link>
                </td>
                <td className="px-2 py-3">
                  <span className={`inline-block rounded px-2 py-0.5 font-mono text-[11px] ${chipFor(l.productCategory)}`}>{label}</span>
                </td>
                <td className="px-2 py-3 font-mono text-xs text-on-surface-variant">{l.sourcePage ?? 'Website'}</td>
                <td className="px-2 py-3">
                  <span className="flex items-center gap-2 text-xs text-on-surface">
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} /> {s.label}
                  </span>
                </td>
                <td className="px-2 py-3 font-mono text-xs text-on-surface-variant">
                  {new Date(l.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
