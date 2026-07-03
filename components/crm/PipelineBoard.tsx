import Link from 'next/link';
import type { Lead } from '@prisma/client';

type LeadRow = Lead & { assignedTo?: { name: string } | null };

const columns: { status: string; label: string; accent: string }[] = [
  { status: 'NEW', label: 'New Lead', accent: 'border-t-safety-orange' },
  { status: 'CONTACTED', label: 'Contacted', accent: 'border-t-secondary-fixed-dim' },
  { status: 'SITE_ASSESSED', label: 'Site Assessment', accent: 'border-t-tertiary' },
  { status: 'QUOTED', label: 'Quoted', accent: 'border-t-primary-container' },
  { status: 'WON', label: 'Won', accent: 'border-t-primary' },
  { status: 'LOST', label: 'Lost', accent: 'border-t-error' },
];

export default function PipelineBoard({ leads }: { leads: LeadRow[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[900px] grid-cols-6 gap-3">
        {columns.map((col) => {
          const items = leads.filter((l) => l.status === col.status);
          return (
            <div key={col.status} className={`rounded-xl border border-outline-variant border-t-4 bg-white ${col.accent}`}>
              <div className="flex items-center justify-between px-3 py-2.5">
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wide text-industrial-blue">{col.label}</h3>
                <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-mono text-xs font-semibold text-on-surface-variant">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2 px-2 pb-3">
                {items.length === 0 ? (
                  <p className="px-1 py-2 text-center text-xs text-outline-variant">—</p>
                ) : (
                  items.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/crm/leads/${lead.id}`}
                      className="block rounded-lg border border-outline-variant/50 bg-surface-container-low p-3 transition-colors hover:bg-surface-container-high"
                    >
                      <p className="truncate text-sm font-semibold text-industrial-blue">{lead.fullName}</p>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-on-surface-variant">
                        {lead.productCategory === 'general-enquiry' ? 'General enquiry' : lead.productCategory}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-outline">
                        <span>{lead.projectSize ?? 'Enquiry'}</span>
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                      {lead.assignedTo?.name && (
                        <p className="mt-1 truncate text-[11px] font-medium text-primary">→ {lead.assignedTo.name}</p>
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
