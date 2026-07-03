import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import LeadStatusForm from '@/components/crm/LeadStatusForm';
import ReassignForm from '@/components/crm/ReassignForm';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const isAdmin = session.user.role === 'ADMIN';

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { name: true, email: true } },
      activities: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!lead) notFound();
  // §17: reps can only open their own leads
  if (!isAdmin && lead.assignedToId !== session.user.id) notFound();

  // Admins can reassign — load the active team for the picker
  const reps = isAdmin
    ? await prisma.user.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, role: true },
      })
    : [];

  const detail = (label: string, value?: string | null) => (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-wide text-outline">{label}</dt>
      <dd className="mt-0.5 text-sm text-on-surface">{value || '—'}</dd>
    </div>
  );

  return (
    <div>
      <Link href="/crm/leads" className="flex items-center gap-1 font-mono text-xs text-on-surface-variant hover:text-safety-orange">
        <Icon name="arrow_back" className="text-[16px]" /> Back to leads
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-work text-2xl font-semibold text-industrial-blue">{lead.fullName}</h1>
          <p className="mt-1 font-mono text-xs text-on-surface-variant">
            Created {new Date(lead.createdAt).toLocaleString()} · Status <span className="font-semibold text-primary">{lead.status}</span>
          </p>
        </div>
        {lead.phone ? (
          <a href={`tel:${lead.phone}`} className="flex items-center gap-2 rounded-lg bg-industrial-blue px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90">
            <Icon name="call" className="text-[18px]" /> Call {lead.phone}
          </a>
        ) : lead.email ? (
          <a href={`mailto:${lead.email}`} className="flex items-center gap-2 rounded-lg bg-industrial-blue px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90">
            <Icon name="mail" className="text-[18px]" /> Email
          </a>
        ) : null}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-xl border border-outline-variant bg-white p-6">
            <h2 className="font-work font-semibold text-industrial-blue">Lead Details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {detail('Phone', lead.phone)}
              {detail('Email', lead.email)}
              {detail('Product Category', lead.productCategory === 'general-enquiry' ? 'General enquiry' : lead.productCategory)}
              {detail('Project Size', lead.projectSize)}
              {detail('Timeline', lead.timeline)}
              {detail('Source Page', lead.sourcePage)}
              {detail('Assigned To', lead.assignedTo?.name)}
            </dl>
            {lead.message && (
              <div className="mt-4">
                <dt className="font-mono text-[11px] uppercase tracking-wide text-outline">Message</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-on-surface">{lead.message}</dd>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-outline-variant bg-white p-6">
            <h2 className="font-work font-semibold text-industrial-blue">Activity Log</h2>
            {lead.activities.length === 0 ? (
              <p className="mt-3 text-sm text-on-surface-variant">No activity yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {lead.activities.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-safety-orange" />
                    <div>
                      <p className="text-sm text-on-surface">{a.note ?? a.type}</p>
                      <p className="font-mono text-[11px] text-on-surface-variant">{a.type} · {new Date(a.createdAt).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <LeadStatusForm
            leadId={lead.id}
            currentStatus={lead.status}
            currentFollowUp={lead.followUpDate ? lead.followUpDate.toISOString() : null}
          />
          {isAdmin && (
            <ReassignForm leadId={lead.id} currentAssigneeId={lead.assignedToId} reps={reps} />
          )}
        </div>
      </div>
    </div>
  );
}
