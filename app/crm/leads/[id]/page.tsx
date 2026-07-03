import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import LeadStatusForm from '@/components/crm/LeadStatusForm';

export const dynamic = 'force-dynamic';

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  await requireSession();

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { name: true, email: true } },
      activities: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!lead) notFound();

  const detail = (label: string, value?: string | null) => (
    <div>
      <dt className="text-xs uppercase tracking-wide text-brand-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-brand-900">{value || '—'}</dd>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/crm/leads" className="text-sm text-brand-600 hover:text-accent-600">← Back to leads</Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-950">{lead.fullName}</h1>
          <p className="mt-1 text-sm text-brand-500">
            Created {new Date(lead.createdAt).toLocaleString()} · Status <span className="font-semibold text-brand-700">{lead.status}</span>
          </p>
        </div>
        <a href={`tel:${lead.phone}`} className="rounded-md bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
          Call {lead.phone}
        </a>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
            <h2 className="font-display font-bold text-brand-950">Lead Details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {detail('Phone', lead.phone)}
              {detail('Email', lead.email)}
              {detail('Product Category', lead.productCategory)}
              {detail('Project Size', lead.projectSize)}
              {detail('Timeline', lead.timeline)}
              {detail('Source Page', lead.sourcePage)}
              {detail('Assigned To', lead.assignedTo?.name)}
            </dl>
            {lead.message && (
              <div className="mt-4">
                <dt className="text-xs uppercase tracking-wide text-brand-500">Message</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-brand-900">{lead.message}</dd>
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
            <h2 className="font-display font-bold text-brand-950">Activity Log</h2>
            {lead.activities.length === 0 ? (
              <p className="mt-3 text-sm text-brand-500">No activity yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {lead.activities.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                    <div>
                      <p className="text-sm text-brand-900">{a.note ?? a.type}</p>
                      <p className="text-xs text-brand-500">{a.type} · {new Date(a.createdAt).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <LeadStatusForm
            leadId={lead.id}
            currentStatus={lead.status}
            currentFollowUp={lead.followUpDate ? lead.followUpDate.toISOString() : null}
          />
        </div>
      </div>
    </div>
  );
}
