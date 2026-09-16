/**
 * The single Casements sales pipeline — vocabulary and rules.
 *
 * Everything the CRM enforces about a lead lives here: the stages, the order
 * they run in, which fields are mandatory at which stage, and the controlled
 * vocabularies (source, loss reason, qualification).
 *
 * The API imports this to enforce; the UI imports this to render. Neither
 * keeps its own copy, so the rules cannot drift apart.
 *
 *   NEW → CONTACTED → QUALIFIED → SITE_ASSESSED → QUOTED → WON
 *                  ↘ DISQUALIFIED          any open stage ↘ LOST
 *
 * Mandatory at all times:  source, owner, stage
 * Mandatory while open:    next action + next action date
 * Mandatory to close:      loss reason (LOST / DISQUALIFIED)
 * Mandatory to qualify:    need, location, budget, urgency, decision readiness
 */

export type Stage =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'SITE_ASSESSED'
  | 'QUOTED'
  | 'WON'
  | 'LOST'
  | 'DISQUALIFIED';

export const STAGES: Stage[] = [
  'NEW', 'CONTACTED', 'QUALIFIED', 'SITE_ASSESSED', 'QUOTED', 'WON', 'LOST', 'DISQUALIFIED',
];

/** Stages that represent live work, in pipeline order. */
export const OPEN_STAGES: Stage[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'SITE_ASSESSED', 'QUOTED'];

/** Terminal stages — no next action required, lead is off the board. */
export const CLOSED_STAGES: Stage[] = ['WON', 'LOST', 'DISQUALIFIED'];

/** Stages that require a loss reason before they can be saved. */
export const LOSS_STAGES: Stage[] = ['LOST', 'DISQUALIFIED'];

export const STAGE_LABELS: Record<Stage, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  SITE_ASSESSED: 'Site assessed',
  QUOTED: 'Quoted',
  WON: 'Won',
  LOST: 'Lost',
  DISQUALIFIED: 'Disqualified',
};

export const STAGE_HELP: Record<Stage, string> = {
  NEW: 'Captured. Nobody has spoken to them yet.',
  CONTACTED: 'We have reached them, or tried to. Qualification not finished.',
  QUALIFIED: 'Verified: real need, in our area, budget and urgency understood.',
  SITE_ASSESSED: 'Site visited and measurements taken.',
  QUOTED: 'Quotation issued. Awaiting their decision.',
  WON: 'Order placed.',
  LOST: 'A genuine prospect that did not close.',
  DISQUALIFIED: 'Never a genuine prospect — spam, duplicate, out of area, no need.',
};

export function isOpen(stage: string): boolean {
  return (OPEN_STAGES as string[]).includes(stage);
}
export function isClosed(stage: string): boolean {
  return (CLOSED_STAGES as string[]).includes(stage);
}
export function needsLossReason(stage: string): boolean {
  return (LOSS_STAGES as string[]).includes(stage);
}

/**
 * Allowed moves. A lead may always be closed (LOST/DISQUALIFIED) from any open
 * stage, and may step forward one stage at a time. Stepping backwards is
 * allowed too — a quote can fall back to site assessment — but skipping the
 * qualification gate is not.
 */
const FORWARD: Record<Stage, Stage[]> = {
  // NEW may jump straight to QUALIFIED: qualifying is a single act of work —
  // you call, you establish the five answers, the lead is qualified. Nothing is
  // skipped by doing it in one save, because validateLead still demands all
  // five answers before QUALIFIED can be reached.
  NEW: ['CONTACTED', 'QUALIFIED'],
  CONTACTED: ['QUALIFIED'],
  QUALIFIED: ['SITE_ASSESSED', 'QUOTED'],
  SITE_ASSESSED: ['QUOTED'],
  QUOTED: ['WON'],
  WON: [],
  LOST: [],
  DISQUALIFIED: [],
};

export function allowedNextStages(current: Stage): Stage[] {
  if (isClosed(current)) {
    // A closed lead can be reopened — deliberately, back to CONTACTED.
    return [current, 'CONTACTED'];
  }
  const back = OPEN_STAGES.slice(0, OPEN_STAGES.indexOf(current));
  return Array.from(new Set<Stage>([...back, current, ...FORWARD[current], 'LOST', 'DISQUALIFIED']));
}

// ---------------------------------------------------------------------------
// Source — where the lead came from. Controlled, so spend can be measured.
// ---------------------------------------------------------------------------

export type LeadSource =
  | 'WEBSITE_FORM' | 'WEBSITE_CHAT' | 'PHONE_CALL' | 'WHATSAPP' | 'WALK_IN'
  | 'REFERRAL' | 'REPEAT_CLIENT' | 'FACEBOOK' | 'INSTAGRAM' | 'GOOGLE_ADS'
  | 'EXHIBITION' | 'OTHER';

export const LEAD_SOURCES: LeadSource[] = [
  'WEBSITE_FORM', 'WEBSITE_CHAT', 'PHONE_CALL', 'WHATSAPP', 'WALK_IN',
  'REFERRAL', 'REPEAT_CLIENT', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE_ADS',
  'EXHIBITION', 'OTHER',
];

export const SOURCE_LABELS: Record<LeadSource, string> = {
  WEBSITE_FORM: 'Website form',
  WEBSITE_CHAT: 'Website chat',
  PHONE_CALL: 'Phone call',
  WHATSAPP: 'WhatsApp',
  WALK_IN: 'Walk-in',
  REFERRAL: 'Referral',
  REPEAT_CLIENT: 'Repeat client',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  GOOGLE_ADS: 'Google Ads',
  EXHIBITION: 'Exhibition / trade show',
  OTHER: 'Other',
};

/** Sources a member of staff can pick when entering a lead by hand. */
export const MANUAL_SOURCES: LeadSource[] = LEAD_SOURCES.filter(
  (s) => s !== 'WEBSITE_FORM' && s !== 'WEBSITE_CHAT',
);

// ---------------------------------------------------------------------------
// Loss reasons — split by which exit they belong to.
// ---------------------------------------------------------------------------

export type LossReason =
  | 'NO_RESPONSE' | 'NOT_INTERESTED' | 'PRICE_TOO_HIGH' | 'NO_BUDGET'
  | 'TIMING_POSTPONED' | 'CHOSE_COMPETITOR' | 'PROJECT_CANCELLED'
  | 'SPAM_OR_IRRELEVANT' | 'DUPLICATE' | 'OUT_OF_AREA' | 'OUT_OF_SCOPE'
  | 'BAD_CONTACT_DETAILS' | 'NO_REAL_NEED' | 'OTHER';

/** Reasons valid when closing a genuine prospect as LOST. */
export const LOST_REASONS: LossReason[] = [
  'NO_RESPONSE', 'NOT_INTERESTED', 'PRICE_TOO_HIGH', 'NO_BUDGET',
  'TIMING_POSTPONED', 'CHOSE_COMPETITOR', 'PROJECT_CANCELLED', 'OTHER',
];

/** Reasons valid when marking a lead DISQUALIFIED — it was never real. */
export const DISQUALIFIED_REASONS: LossReason[] = [
  'SPAM_OR_IRRELEVANT', 'DUPLICATE', 'OUT_OF_AREA', 'OUT_OF_SCOPE',
  'BAD_CONTACT_DETAILS', 'NO_REAL_NEED', 'OTHER',
];

export const LOSS_REASON_LABELS: Record<LossReason, string> = {
  NO_RESPONSE: 'No response after repeated attempts',
  NOT_INTERESTED: 'Not interested',
  PRICE_TOO_HIGH: 'Price too high',
  NO_BUDGET: 'No budget available',
  TIMING_POSTPONED: 'Postponed / timing not right',
  CHOSE_COMPETITOR: 'Chose a competitor',
  PROJECT_CANCELLED: 'Project cancelled',
  SPAM_OR_IRRELEVANT: 'Spam or irrelevant enquiry',
  DUPLICATE: 'Duplicate of an existing lead',
  OUT_OF_AREA: 'Outside our service area',
  OUT_OF_SCOPE: 'Work we do not do',
  BAD_CONTACT_DETAILS: 'Contact details wrong or unreachable',
  NO_REAL_NEED: 'No genuine need (browsing, student, research)',
  OTHER: 'Other',
};

export function reasonsForStage(stage: string): LossReason[] {
  return stage === 'DISQUALIFIED' ? DISQUALIFIED_REASONS : LOST_REASONS;
}

// ---------------------------------------------------------------------------
// Qualification — the structured first-contact check.
// ---------------------------------------------------------------------------

export type BudgetBand = 'UNKNOWN' | 'UNDER_5M' | 'M5_20' | 'M20_50' | 'M50_200' | 'OVER_200M';
export const BUDGET_BANDS: BudgetBand[] = ['UNDER_5M', 'M5_20', 'M20_50', 'M50_200', 'OVER_200M', 'UNKNOWN'];
export const BUDGET_LABELS: Record<BudgetBand, string> = {
  UNDER_5M: 'Under UGX 5M',
  M5_20: 'UGX 5M – 20M',
  M20_50: 'UGX 20M – 50M',
  M50_200: 'UGX 50M – 200M',
  OVER_200M: 'Over UGX 200M',
  UNKNOWN: 'Would not say / unknown',
};

export type Urgency = 'IMMEDIATE' | 'WITHIN_MONTH' | 'ONE_TO_THREE_MONTHS' | 'OVER_THREE_MONTHS' | 'EXPLORING';
export const URGENCIES: Urgency[] = ['IMMEDIATE', 'WITHIN_MONTH', 'ONE_TO_THREE_MONTHS', 'OVER_THREE_MONTHS', 'EXPLORING'];
export const URGENCY_LABELS: Record<Urgency, string> = {
  IMMEDIATE: 'Ready now',
  WITHIN_MONTH: 'Within a month',
  ONE_TO_THREE_MONTHS: '1 – 3 months',
  OVER_THREE_MONTHS: 'More than 3 months',
  EXPLORING: 'Just exploring',
};

export type DecisionReadiness = 'DECISION_MAKER' | 'INFLUENCER' | 'GATHERING_QUOTES' | 'UNKNOWN';
export const DECISION_READINESS: DecisionReadiness[] = ['DECISION_MAKER', 'INFLUENCER', 'GATHERING_QUOTES', 'UNKNOWN'];
export const DECISION_LABELS: Record<DecisionReadiness, string> = {
  DECISION_MAKER: 'Speaking to the decision maker',
  INFLUENCER: 'Influencer — decision made by someone else',
  GATHERING_QUOTES: 'Collecting quotes for a decision later',
  UNKNOWN: 'Not established',
};

export interface Qualification {
  qualNeed?: string | null;
  qualLocation?: string | null;
  qualBudget?: string | null;
  qualUrgency?: string | null;
  qualDecision?: string | null;
}

/** Which of the five qualification answers are still missing. */
export function missingQualification(q: Qualification): string[] {
  const missing: string[] = [];
  if (!q.qualNeed?.trim()) missing.push('what they need');
  if (!q.qualLocation?.trim()) missing.push('site location');
  if (!q.qualBudget) missing.push('budget band');
  if (!q.qualUrgency) missing.push('urgency');
  if (!q.qualDecision) missing.push('decision readiness');
  return missing;
}

/** Stages at or beyond QUALIFIED require the qualification block to be complete. */
export function requiresQualification(stage: string): boolean {
  return ['QUALIFIED', 'SITE_ASSESSED', 'QUOTED', 'WON'].includes(stage);
}

// ---------------------------------------------------------------------------
// Contact attempts — structured outcomes, so "called, no response" is a fact.
// ---------------------------------------------------------------------------

export type ContactOutcome =
  | 'SPOKE' | 'NO_ANSWER' | 'PHONE_OFF' | 'WRONG_NUMBER' | 'ASKED_CALL_BACK'
  | 'WHATSAPP_SENT' | 'EMAIL_SENT' | 'VISITED';

export const CONTACT_OUTCOMES: ContactOutcome[] = [
  'SPOKE', 'NO_ANSWER', 'PHONE_OFF', 'ASKED_CALL_BACK', 'WHATSAPP_SENT', 'EMAIL_SENT', 'VISITED', 'WRONG_NUMBER',
];

export const OUTCOME_LABELS: Record<ContactOutcome, string> = {
  SPOKE: 'Spoke to them',
  NO_ANSWER: 'Called — no answer',
  PHONE_OFF: 'Phone off / unreachable',
  WRONG_NUMBER: 'Wrong number',
  ASKED_CALL_BACK: 'Asked us to call back',
  WHATSAPP_SENT: 'WhatsApp message sent',
  EMAIL_SENT: 'Email sent',
  VISITED: 'Met in person / site visit',
};

// ---------------------------------------------------------------------------
// The rule check. One function, used by every write path.
// ---------------------------------------------------------------------------

export interface LeadState extends Qualification {
  status: string;
  assignedToId?: string | null;
  source?: string | null;
  nextAction?: string | null;
  nextActionDate?: Date | string | null;
  lossReason?: string | null;
  dealValue?: bigint | number | string | null;
}

/** Stages that cannot be recorded without a value in shillings. */
export function requiresDealValue(stage: string): boolean {
  return stage === 'QUOTED' || stage === 'WON';
}

/**
 * Returns the list of rule violations for the state a lead would be left in.
 * An empty array means the write is allowed.
 */
export function validateLead(next: LeadState): string[] {
  const errors: string[] = [];
  const stage = next.status;

  if (!next.source) errors.push('A lead source is required.');
  else if (!(LEAD_SOURCES as string[]).includes(next.source)) errors.push('Unknown lead source.');

  if (!next.assignedToId) errors.push('Every lead must have an owner.');

  if (!(STAGES as string[]).includes(stage)) errors.push('Unknown stage.');

  if (isOpen(stage)) {
    if (!next.nextAction?.trim()) errors.push('A next action is required while the lead is open.');
    if (!next.nextActionDate) errors.push('A next action date is required while the lead is open.');
  }

  if (needsLossReason(stage)) {
    if (!next.lossReason) {
      errors.push('A loss reason is required to close this lead.');
    } else if (!reasonsForStage(stage).map(String).includes(next.lossReason)) {
      errors.push(`"${next.lossReason}" is not a valid reason for ${STAGE_LABELS[stage as Stage] ?? stage}.`);
    }
  }

  if (requiresDealValue(stage)) {
    const value = next.dealValue === null || next.dealValue === undefined || next.dealValue === ''
      ? null
      : Number(next.dealValue);
    if (value === null || Number.isNaN(value) || value <= 0) {
      errors.push('A quotation value in UGX is required at this stage.');
    }
  }

  if (requiresQualification(stage)) {
    const missing = missingQualification(next);
    if (missing.length > 0) {
      errors.push(`Qualification incomplete — still missing: ${missing.join(', ')}.`);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Handover — passing a verified lead to a colleague.
// ---------------------------------------------------------------------------

export interface HandoverCandidate {
  status: string;
  firstResponseAt?: Date | string | null;
  contactAttempts?: number | null;
}

/**
 * Why this lead cannot be handed over yet.
 *
 * The bar is the phone call, not a form. Once the rep has actually tried to
 * reach the customer and logged what happened, they know whether it is real
 * work and may pass it to whoever takes it forward. Qualification detail is
 * captured during handover where it is known, but a rep is not made to fill in
 * five fields before they are allowed to route a lead to a colleague.
 *
 * An empty array means the lead can be handed over.
 */
export function handoverBlockers(lead: HandoverCandidate): string[] {
  const blockers: string[] = [];

  if (isClosed(lead.status)) {
    blockers.push('This lead is closed. Reopen it before handing it over.');
    return blockers;
  }

  if (!lead.firstResponseAt && !lead.contactAttempts) {
    blockers.push('Log what happened when you contacted them first — use the buttons above.');
  }

  return blockers;
}

/** True when the lead has been verified and may be passed to a colleague. */
export function canHandOver(lead: HandoverCandidate): boolean {
  return handoverBlockers(lead).length === 0;
}

/** Whether a stage move is permitted from where the lead is now. */
export function canMove(from: string, to: string): boolean {
  if (from === to) return true;
  return (allowedNextStages(from as Stage) as string[]).includes(to);
}

// ---------------------------------------------------------------------------
// Presentation helpers
// ---------------------------------------------------------------------------

/** UGX amounts, grouped — 12500000 → "UGX 12,500,000". */
export function formatUgx(value: bigint | number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `UGX ${Number(value).toLocaleString('en-US')}`;
}

export type AttentionState = 'overdue' | 'due-today' | 'no-action' | 'no-owner' | 'stale' | 'ok';

/**
 * Why a lead needs attention today. Drives the red flags on the list and the
 * dashboard queue — the nudge that makes staff actually update the record.
 */
export function attentionState(
  lead: {
    status: string;
    assignedToId?: string | null;
    nextActionDate?: Date | string | null;
    lastContactedAt?: Date | string | null;
    createdAt?: Date | string | null;
  },
  staleDays = 7,
): AttentionState {
  if (isClosed(lead.status)) return 'ok';
  if (!lead.assignedToId) return 'no-owner';
  if (!lead.nextActionDate) return 'no-action';

  const due = new Date(lead.nextActionDate);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (due < startOfToday) return 'overdue';
  if (due <= endOfToday) return 'due-today';

  const last = lead.lastContactedAt ?? lead.createdAt;
  if (last) {
    const days = (Date.now() - new Date(last).getTime()) / 86_400_000;
    if (days > staleDays) return 'stale';
  }
  return 'ok';
}

export const ATTENTION_LABELS: Record<AttentionState, string> = {
  overdue: 'Action overdue',
  'due-today': 'Due today',
  'no-action': 'No next action set',
  'no-owner': 'No owner assigned',
  stale: 'No contact in over a week',
  ok: '',
};

/** Hours between capture and the first contact attempt — the response-time SLA. */
export function responseHours(lead: {
  createdAt: Date | string;
  firstResponseAt?: Date | string | null;
}): number | null {
  if (!lead.firstResponseAt) return null;
  return (new Date(lead.firstResponseAt).getTime() - new Date(lead.createdAt).getTime()) / 3_600_000;
}

/**
 * Builds a wa.me link from a Ugandan phone number written any of the usual
 * ways (0752…, +256752…, 256 752…). WhatsApp is the channel most enquiries
 * actually answer on, so this sits next to the call button on every lead.
 */
export function whatsappLink(phone: string | null | undefined, message?: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return null;
  if (digits.startsWith('0')) digits = `256${digits.slice(1)}`;
  else if (digits.length === 9) digits = `256${digits}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

/** Date helpers for the next-action quick presets. */
export function dateInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The SLA the business works to: first contact attempt within 4 working hours. */
export const RESPONSE_SLA_HOURS = 4;
