import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { can } from '@/lib/roles';
import { getProductNav } from '@/lib/products-db';
import { findPossibleDuplicates } from '@/lib/leads-query';
import {
  ATTENTION_LABELS,
  BUDGET_LABELS,
  DECISION_LABELS,
  LOSS_REASON_LABELS,
  OUTCOME_LABELS,
  RESPONSE_SLA_HOURS,
  SOURCE_LABELS,
  STAGE_LABELS,
  URGENCY_LABELS,
  attentionState,
  formatUgx,
  isClosed,
  responseHours,
  type Stage,
} from '@/lib/pipeline';
import PipelineForm from '@/components/crm/lead/PipelineForm';
import ContactStrip from '@/components/crm/lead/ContactStrip';
import LeadDetailsForm from '@/components/crm/lead/LeadDetailsForm';
import DuplicateNotice from '@/components/crm/lead/DuplicateNotice';
import HandoverForm from '@/components/crm/lead/HandoverForm';
import Icon from '@/components/crm/Icon';

export const dynamic = 'force-dynamic';

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!can(session.user.role, 'view_leads')) notFound();
  const canAssign = can(session.user.role, 'assign_leads');
  // A rep who owns the lead may pass it on once it is verified.
  const canHandover = !canAssign && can(session.user.role, 'handover_leads');

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      duplicateOf: { select: { id: true, fullName: true } },
      activities: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!lead) notFound();
  // Reps can only open their own leads
  if (!canAssign && lead.assignedToId !== session.user.id) notFound();

  const [reps, categories, duplicates] = await Promise.all([
    canAssign || canHandover
      ? prisma.user.findMany({
          where: { active: true, role: { in: ['ADMIN', 'MANAGER', 'SALES_REP'] } },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, role: true },
        })
      : Promise.resolve(
          lead.assignedTo ? [{ id: lead.assignedTo.id, name: lead.assignedTo.name, role: 'SALES_REP' }] : [],
        ),
    getProductNav(),
    lead.duplicateOfId
      ? Promise.resolve([])
      : findPossibleDuplicates({
          phone: lead.phone,
          email: lead.email,
          fullName: lead.fullName,
          excludeId: lead.id,
        }),
  ]);

  const attention = attentionState(lead);
  const hours = responseHours(lead);
  const closed = isClosed(lead.status);

  const qualification: [string, string | null][] = [
    ['What they need', lead.qualNeed],
    ['Site location', lead.qualLocation],
    ['Budget', lead.qualBudget ? BUDGET_LABELS[lead.qualBudget as keyof typeof BUDGET_LABELS] ?? lead.qualBudget : null],
    ['Urgency', lead.qualUrgency ? URGENCY_LABELS[lead.qualUrgency as keyof typeof URGENCY_LABELS] ?? lead.qualUrgency : null],
    ['Decision', lead.qualDecision ? DECISION_LABELS[lead.qualDecision as keyof typeof DECISION_LABELS] ?? lead.qualDecision : null],
  ];
  const answered = qualification.filter(([, v]) => v).length;

  return (
    <div>
      <Link href="/crm/leads" className="flex items-center gap-1 font-mono text-xs text-on-surface-variant hover:text-safety-orange">
        <Icon name="arrow_back" className="text-[16px]" /> Back to leads
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-work text-2xl font-semibold text-industrial-blue">{lead.fullName}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-on-surface-variant">
            <span className="rounded bg-industrial-blue px-2 py-0.5 font-semibold text-white">
              {STAGE_LABELS[lead.status as Stage] ?? lead.status}
            </span>
            <span>{lead.source ? SOURCE_LABELS[lead.source as keyof typeof SOURCE_LABELS] ?? lead.source : 'No source'}</span>
            <span>·</span>
            <span>{lead.assignedTo?.name ?? 'No owner'}</span>
            <span>·</span>
            <span>Captured {new Date(lead.createdAt).toLocaleDateString()}</span>
            {lead.dealValue != null && (
              <>
                <span>·</span>
                <span className="font-semibold text-primary">{formatUgx(lead.dealValue)}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Why this lead needs attention today */}
      {attention !== 'ok' && (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-safety-orange bg-safety-orange/10 px-4 py-2.5 font-mono text-xs font-semibold text-industrial-blue">
          <Icon name="priority_high" className="text-safety-orange" />
          {ATTENTION_LABELS[attention]}
          {attention === 'overdue' && lead.nextActionDate
            ? ` — "${lead.nextAction}" was due ${new Date(lead.nextActionDate).toLocaleDateString()}`
            : ''}
        </p>
      )}

      {/* Closed summary */}
      {closed && lead.lossReason && (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 font-mono text-xs text-on-surface-variant">
          <Icon name="block" className="text-error" />
          {STAGE_LABELS[lead.status as Stage]} — {LOSS_REASON_LABELS[lead.lossReason as keyof typeof LOSS_REASON_LABELS] ?? lead.lossReason}
          {lead.lossDetail ? `: ${lead.lossDetail}` : ''}
          {lead.duplicateOf && (
            <Link href={`/crm/leads/${lead.duplicateOf.id}`} className="text-primary hover:underline">
              → {lead.duplicateOf.fullName}
            </Link>
          )}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {!closed && (
            <ContactStrip
              leadId={lead.id}
              fullName={lead.fullName}
              phone={lead.phone}
              email={lead.email}
              contactAttempts={lead.contactAttempts}
              lastContactedAt={iso(lead.lastContactedAt)}
            />
          )}

          <DuplicateNotice
            leadId={lead.id}
            duplicates={duplicates.map((d) => ({
              id: d.id,
              fullName: d.fullName,
              phone: d.phone,
              email: d.email,
              status: d.status,
              createdAt: d.createdAt.toISOString(),
              assignedTo: d.assignedTo?.name ?? null,
            }))}
          />

          <LeadDetailsForm
            lead={{
              id: lead.id,
              fullName: lead.fullName,
              phone: lead.phone,
              email: lead.email,
              productCategory: lead.productCategory,
              projectSize: lead.projectSize,
              timeline: lead.timeline,
              message: lead.message,
            }}
            categories={categories.map((c) => ({ slug: c.slug, title: c.title }))}
          />

          {/* Qualification summary */}
          <section className="rounded-xl border border-outline-variant bg-white p-6">
            <h2 className="flex items-center justify-between font-work font-semibold text-industrial-blue">
              Qualification
              <span className={`font-mono text-[11px] font-normal ${answered === 5 ? 'text-primary' : 'text-on-surface-variant'}`}>
                {answered} of 5 answered
              </span>
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {qualification.map(([name, value]) => (
                <div key={name}>
                  <dt className="font-mono text-[11px] uppercase tracking-wide text-outline">{name}</dt>
                  <dd className={`mt-0.5 text-sm ${value ? 'text-on-surface' : 'text-error'}`}>
                    {value ?? 'Not established'}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Activity */}
          <section className="rounded-xl border border-outline-variant bg-white p-6">
            <h2 className="font-work font-semibold text-industrial-blue">Activity log</h2>
            {lead.activities.length === 0 ? (
              <p className="mt-3 text-sm text-on-surface-variant">No activity yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {lead.activities.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        a.type === 'CONTACT_ATTEMPT'
                          ? 'bg-primary'
                          : a.type === 'HANDOVER'
                            ? 'bg-[#25D366]'
                            : a.type === 'NOTE'
                              ? 'bg-outline'
                              : 'bg-safety-orange'
                      }`}
                    />
                    <div>
                      <p className="text-sm text-on-surface">
                        {a.outcome
                          ? OUTCOME_LABELS[a.outcome as keyof typeof OUTCOME_LABELS] ?? a.outcome
                          : a.note ?? a.type}
                        {a.outcome && a.note ? ` — ${a.note}` : ''}
                      </p>
                      <p className="font-mono text-[11px] text-on-surface-variant">
                        {a.actorName ? `${a.actorName} · ` : ''}
                        {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <PipelineForm
            lead={{
              id: lead.id,
              status: lead.status,
              source: lead.source,
              sourceDetail: lead.sourceDetail,
              assignedToId: lead.assignedToId,
              nextAction: lead.nextAction,
              nextActionDate: iso(lead.nextActionDate),
              lossReason: lead.lossReason,
              lossDetail: lead.lossDetail,
              qualNeed: lead.qualNeed,
              qualLocation: lead.qualLocation,
              qualBudget: lead.qualBudget,
              qualUrgency: lead.qualUrgency,
              qualDecision: lead.qualDecision,
              dealValue: lead.dealValue == null ? null : String(lead.dealValue),
              quotationRef: lead.quotationRef,
              quotationUrl: lead.quotationUrl,
            }}
            reps={reps}
            canAssign={canAssign}
          />

          {canHandover && !closed && lead.assignedToId === session.user.id && (
            <HandoverForm
              lead={{
                id: lead.id,
                status: lead.status,
                contactAttempts: lead.contactAttempts,
                firstResponseAt: iso(lead.firstResponseAt),
                qualNeed: lead.qualNeed,
                qualLocation: lead.qualLocation,
                qualBudget: lead.qualBudget,
                qualUrgency: lead.qualUrgency,
                qualDecision: lead.qualDecision,
                nextAction: lead.nextAction,
                nextActionDate: iso(lead.nextActionDate),
              }}
              colleagues={reps.filter((r) => r.id !== session.user.id)}
            />
          )}

          {/* Response time */}
          <section className="rounded-xl border border-outline-variant bg-white p-6">
            <h2 className="font-work font-semibold text-industrial-blue">Response time</h2>
            {hours === null ? (
              <p className="mt-2 font-mono text-xs text-error">
                Nobody has contacted this lead yet.
              </p>
            ) : (
              <p className={`mt-2 font-work text-2xl font-bold ${hours <= RESPONSE_SLA_HOURS ? 'text-primary' : 'text-error'}`}>
                {hours < 1 ? `${Math.round(hours * 60)} min` : `${hours.toFixed(1)} hrs`}
              </p>
            )}
            <p className="mt-1 font-mono text-[11px] text-on-surface-variant">
              Target: first contact within {RESPONSE_SLA_HOURS} hours of capture.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
