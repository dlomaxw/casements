import type { Lead, LeadStatus, User } from '@prisma/client';
import { prisma } from '@/lib/db';
import { autoReplyTemplate, quoteNotificationTemplate, sendEmail, SALES_EMAIL } from '@/lib/email';
import type { LeadSource } from '@/lib/pipeline';

export interface LeadInput {
  fullName: string;
  email?: string;
  phone?: string;
  productCategory: string;
  projectSize?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'COMMERCIAL';
  timeline?: string;
  message?: string;
  sourcePage?: string;
  /** Where the lead came from. Web forms default to WEBSITE_FORM. */
  source?: LeadSource;
  sourceDetail?: string;
}

/**
 * How long a newly captured lead has before its first action falls due.
 * Every lead is created with a next action already set, so no lead can enter
 * the system without one — the rule holds from the moment of capture.
 */
const FIRST_ACTION_HOURS = 4;

export interface CRMStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byStatus: Record<LeadStatus, number>;
  conversionRate: number; // WON / (WON + LOST)
  topCategories: { category: string; count: number }[];
}

// Validates + writes new lead to DB, status = NEW.
// Every lead is born with a source and an opening next action so it can never
// sit in the pipeline as an undefined, actionless record.
export async function createCRMLead(data: LeadInput): Promise<Lead> {
  const { source = 'WEBSITE_FORM', sourceDetail, ...rest } = data;

  const nextActionDate = new Date();
  nextActionDate.setHours(nextActionDate.getHours() + FIRST_ACTION_HOURS);

  const lead = await prisma.lead.create({
    data: {
      ...rest,
      source: source as any,
      sourceDetail,
      status: 'NEW',
      nextAction: 'First contact — call and qualify',
      nextActionDate,
    },
  });
  await prisma.activity.create({
    data: {
      leadId: lead.id,
      type: 'STATUS_CHANGE',
      note: `Lead captured (${source.toLowerCase().replace(/_/g, ' ')})`,
    },
  });
  return lead;
}

/**
 * Records a contact attempt with a structured outcome. This is the entry point
 * behind the one-click buttons on the lead page — "called, no answer" becomes a
 * recorded fact with a timestamp instead of a note nobody typed.
 *
 * Also stamps firstResponseAt the first time anyone reaches out, which is what
 * the response-time SLA is measured from.
 */
export async function logContactAttempt(
  leadId: string,
  outcome: string,
  note: string | undefined,
  actor: { id?: string | null; name?: string | null },
): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { firstResponseAt: true, contactAttempts: true },
  });
  if (!lead) return;

  const now = new Date();
  await prisma.$transaction([
    prisma.lead.update({
      where: { id: leadId },
      data: {
        lastContactedAt: now,
        contactAttempts: { increment: 1 },
        ...(lead.firstResponseAt ? {} : { firstResponseAt: now }),
      },
    }),
    prisma.activity.create({
      data: {
        leadId,
        type: 'CONTACT_ATTEMPT',
        outcome,
        note: note?.trim() || null,
        actorId: actor.id ?? null,
        actorName: actor.name ?? null,
      },
    }),
  ]);
}

// Assigns the lead to the sales rep mapped to the product category (rep_product_map).
// Falls back to CRM_DEFAULT_REP_ID, then the first active SALES_REP in the DB.
export async function assignLeadToRep(leadId: string, category: string): Promise<User | null> {
  let rep: User | null = null;

  const mapping = await prisma.repProductMap.findUnique({
    where: { category },
    include: { user: true },
  });
  if (mapping?.user.active) rep = mapping.user;

  if (!rep) {
    const defaultRepId = process.env.CRM_DEFAULT_REP_ID;
    if (defaultRepId) {
      rep = await prisma.user.findUnique({ where: { id: defaultRepId } });
      if (rep && !rep.active) rep = null;
    }
  }
  if (!rep) {
    rep = await prisma.user.findFirst({ where: { role: 'SALES_REP', active: true } });
  }
  // Last resort: an owner is mandatory, so rather than leave the lead
  // unassigned, hand it to a manager or admin who will see it immediately.
  if (!rep) {
    rep = await prisma.user.findFirst({
      where: { active: true, role: { in: ['ADMIN', 'MANAGER'] } },
      orderBy: { role: 'asc' },
    });
  }
  if (rep) {
    await prisma.lead.update({ where: { id: leadId }, data: { assignedToId: rep.id } });
    await prisma.activity.create({
      data: { leadId, type: 'STATUS_CHANGE', note: `Assigned to ${rep.name}` },
    });
  }
  return rep;
}

// Sends branded HTML email via Resend with a deep link to /crm/leads/{id}
export async function notifyRep(lead: Lead, rep: User | null): Promise<void> {
  await sendEmail({
    to: rep?.email ?? SALES_EMAIL,
    subject: lead.productCategory === 'general-enquiry'
      ? `New enquiry: ${lead.fullName}`
      : `New ${lead.projectSize} lead: ${lead.fullName} — ${lead.productCategory}`,
    html: quoteNotificationTemplate(lead),
  });
}

// Sends confirmation email to the client
export async function sendAutoReply(email: string, name: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'We received your enquiry — Casements Africa Limited',
    html: autoReplyTemplate(name),
  });
}

// Updates status + appends to activity log
export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  notes?: string,
): Promise<Lead> {
  const lead = await prisma.lead.update({ where: { id: leadId }, data: { status } });
  await prisma.activity.create({
    data: { leadId, type: 'STATUS_CHANGE', note: notes ?? `Status changed to ${status}` },
  });
  return lead;
}

// Returns counts by status + conversion rate.
// Pass userId to scope to one rep's pipeline (SALES_REP view); omit for ADMIN.
export async function getLeadStats(userId?: string): Promise<CRMStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const scope = userId ? { assignedToId: userId } : {};
  const [total, today, thisWeek, thisMonth, grouped, categories] = await Promise.all([
    prisma.lead.count({ where: scope }),
    prisma.lead.count({ where: { ...scope, createdAt: { gte: startOfDay } } }),
    prisma.lead.count({ where: { ...scope, createdAt: { gte: startOfWeek } } }),
    prisma.lead.count({ where: { ...scope, createdAt: { gte: startOfMonth } } }),
    prisma.lead.groupBy({ by: ['status'], where: scope, _count: { _all: true } }),
    prisma.lead.groupBy({
      by: ['productCategory'],
      where: scope,
      _count: { _all: true },
      orderBy: { _count: { productCategory: 'desc' } },
      take: 5,
    }),
  ]);

  const byStatus = {
    NEW: 0, CONTACTED: 0, SITE_ASSESSED: 0, QUOTED: 0, WON: 0, LOST: 0,
  } as Record<LeadStatus, number>;
  for (const g of grouped) byStatus[g.status] = g._count._all;

  const closed = byStatus.WON + byStatus.LOST;
  return {
    total,
    today,
    thisWeek,
    thisMonth,
    byStatus,
    conversionRate: closed > 0 ? byStatus.WON / closed : 0,
    topCategories: categories.map((c) => ({ category: c.productCategory, count: c._count._all })),
  };
}

// Leads where followUpDate <= today AND status not WON/LOST.
// Pass userId to scope to one rep.
export async function getOverdueFollowUps(userId?: string): Promise<Lead[]> {
  return prisma.lead.findMany({
    where: {
      ...(userId ? { assignedToId: userId } : {}),
      followUpDate: { lte: new Date() },
      status: { notIn: ['WON', 'LOST'] },
    },
    orderBy: { followUpDate: 'asc' },
  });
}
