import Link from 'next/link';
import type { Lead } from '@prisma/client';

type LeadRow = Lead & { assignedTo?: { name: string } | null };

const columns: { status: string; label: string; accent: string }[] = [
  { status: 'NEW', label: 'New Lead', accent: 'border-t-blue-500' },
  { status: 'CONTACTED', label: 'Contacted', accent: 'border-t-amber-500' },
  { status: 'SITE_ASSESSED', label: 'Site Assessment', accent: 'border-t-purple-500' },
  { status: 'QUOTED', label: 'Quoted', accent: 'border-t-cyan-500' },
  { status: 'WON', label: 'Won', accent: 'border-t-green-500' },
  { status: 'LOST', label: 'Lost', accent: 'border-t-red-400' },
];

export default function PipelineBoard({ leads }: { leads: LeadRow[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[900px] grid-cols-6 gap-3">
        {columns.map((col) => {
          const items = leads.filter((l) => l.status === col.status);
          return (
            <div key={col.status} className={`rounded-lg border-t-4 bg-white shadow-sm ring-1 ring-brand-100 ${col.accent}`}>
              <div className="flex items-center justify-between px-3 py-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-brand-700">{col.label}</h3>
                <span className="rounded-full bg-steel-50 px-2 py-0.5 text-xs font-semibold text-brand-500">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2 px-2 pb-3">
                {items.length === 0 ? (
                  <p className="px-1 py-2 text-center text-xs text-brand-300">—</p>
                ) : (
                  items.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/crm/leads/${lead.id}`}
                      className="block rounded-md bg-steel-50 p-3 ring-1 ring-brand-100 transition-colors hover:bg-brand-50"
                    >
                      <p className="truncate text-sm font-semibold text-brand-950">{lead.fullName}</p>
                      <p className="mt-0.5 truncate text-xs text-brand-500">
                        {lead.productCategory === 'general-enquiry' ? 'General enquiry' : lead.productCategory}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-brand-400">
                        <span>{lead.projectSize ?? 'Enquiry'}</span>
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                      {lead.assignedTo?.name && (
                        <p className="mt-1 truncate text-[11px] font-medium text-brand-600">→ {lead.assignedTo.name}</p>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
