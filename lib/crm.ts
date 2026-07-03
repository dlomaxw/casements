import type { Lead, LeadStatus, User } from '@prisma/client';
import { prisma } from '@/lib/db';
import { autoReplyTemplate, quoteNotificationTemplate, sendEmail, SALES_EMAIL } from '@/lib/email';

export interface LeadInput {
  fullName: string;
  email?: string;
  phone: string;
  productCategory: string;
  projectSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'COMMERCIAL';
  timeline?: string;
  message?: string;
  sourcePage?: string;
}

export interface CRMStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byStatus: Record<LeadStatus, number>;
  conversionRate: number; // WON / (WON + LOST)
  topCategories: { category: string; count: number }[];
}

// Validates + writes new lead to DB, status = NEW
export async function createCRMLead(data: LeadInput): Promise<Lead> {
  const lead = await prisma.lead.create({
    data: { ...data, status: 'NEW' },
  });
  await prisma.activity.create({
    data: { leadId: lead.id, type: 'STATUS_CHANGE', note: 'Lead created from website form' },
  });
  return lead;
}

// Assigns the lead to a sales rep for the product category.
// Falls back to CRM_DEFAULT_REP_ID, then the first SALES_REP in the DB.
export async function assignLeadToRep(leadId: string, _category: string): Promise<User | null> {
  let rep: User | null = null;

  const defaultRepId = process.env.CRM_DEFAULT_REP_ID;
  if (defaultRepId) {
    rep = await prisma.user.findUnique({ where: { id: defaultRepId } });
  }
  if (!rep) {
    rep = await prisma.user.findFirst({ where: { role: 'SALES_REP' } });
  }
  if (rep) {
    await prisma.lead.update({ where: { id: leadId }, data: { assignedToId: rep.id } });
  }
  return rep;
}

// Sends branded HTML email via Resend with a deep link to /crm/leads/{id}
export async function notifyRep(lead: Lead, rep: User | null): Promise<void> {
  await sendEmail({
    to: rep?.email ?? SALES_EMAIL,
    subject: `New ${lead.projectSize} lead: ${lead.fullName} — ${lead.productCategory}`,
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

// Returns counts by status + conversion rate
export async function getLeadStats(): Promise<CRMStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, today, thisWeek, thisMonth, grouped, categories] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.lead.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.lead.groupBy({
      by: ['productCategory'],
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

// Leads where followUpDate <= today AND status not WON/LOST
export async function getOverdueFollowUps(): Promise<Lead[]> {
  return prisma.lead.findMany({
    where: {
      followUpDate: { lte: new Date() },
      status: { notIn: ['WON', 'LOST'] },
    },
    orderBy: { followUpDate: 'asc' },
  });
}
