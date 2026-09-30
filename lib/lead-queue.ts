import { randomBytes } from 'node:crypto';
import { del, get, list, put } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { assignLeadToRep, createCRMLead, type LeadInput } from '@/lib/crm';

/**
 * Safety net for website enquiries when the database is down.
 *
 * Every form on the site writes a lead straight to the database. If that write
 * fails — an outage, or the provider suspending the database for exceeding a
 * quota — the enquiry used to be lost and the visitor saw an error. Instead the
 * enquiry is written to the private Vercel Blob store under `lead-queue/`, and
 * imported into the CRM as soon as the database is reachable again.
 *
 * The queue is flushed:
 *   - whenever anyone opens the CRM dashboard (see app/crm/page.tsx),
 *   - by the daily cron (app/api/cron/followups),
 *   - on demand via /api/cron/flush-leads.
 *
 * Queued files hold customer contact details, so their names carry 128 random
 * bits and the public media proxy refuses to serve anything outside the
 * website-image folder.
 */

export const LEAD_QUEUE_PREFIX = 'lead-queue/';

interface QueuedLead {
  queueId: string;
  receivedAt: string;
  form: string;
  lead: LeadInput;
}

function token() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Keep an enquiry that could not be written to the database. Returns true if it
 * was safely stored for later import.
 */
export async function queueLead(form: string, lead: LeadInput): Promise<boolean> {
  if (!token()) {
    console.error(`[lead-queue] BLOB_READ_WRITE_TOKEN not set — cannot queue ${form} enquiry from ${lead.fullName}`);
    return false;
  }
  const queueId = randomBytes(16).toString('hex');
  const entry: QueuedLead = { queueId, receivedAt: new Date().toISOString(), form, lead };
  try {
    await put(`${LEAD_QUEUE_PREFIX}${Date.now()}-${queueId}.json`, JSON.stringify(entry), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      token: token(),
    });
    console.warn(`[lead-queue] database unavailable — queued ${form} enquiry ${queueId} for later import`);
    return true;
  } catch (err) {
    console.error(`[lead-queue] could not queue ${form} enquiry from ${lead.fullName}:`, err);
    return false;
  }
}

export interface FlushResult {
  imported: number;
  skipped: number;
  failed: number;
  remaining: number;
}

/**
 * Import every queued enquiry into the CRM. Safe to call often: it does nothing
 * when the queue is empty, stops at the first database failure (the database is
 * evidently still down), and never imports the same enquiry twice.
 */
export async function flushLeadQueue(): Promise<FlushResult> {
  const result: FlushResult = { imported: 0, skipped: 0, failed: 0, remaining: 0 };
  if (!token()) return result;

  let blobs: { pathname: string; url: string }[] = [];
  try {
    const listing = await list({ prefix: LEAD_QUEUE_PREFIX, token: token(), limit: 200 });
    blobs = listing.blobs;
  } catch (err) {
    console.error('[lead-queue] could not list the queue:', err);
    return result;
  }
  if (blobs.length === 0) return result;

  // Oldest first, so leads appear in the CRM in the order they arrived.
  blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));

  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i];
    let entry: QueuedLead;
    try {
      const file = await get(blob.pathname, { access: 'private', token: token() });
      if (!file) continue;
      entry = JSON.parse(await new Response(file.stream).text());
    } catch (err) {
      console.error(`[lead-queue] unreadable queue file ${blob.pathname}:`, err);
      result.failed += 1;
      continue;
    }

    try {
      const marker = `[queue:${entry.queueId}]`;
      // Already imported on an earlier run whose delete did not complete?
      const done = await prisma.activity.findFirst({ where: { note: { contains: marker } }, select: { id: true } });
      if (done) {
        result.skipped += 1;
      } else {
        const lead = await createCRMLead(entry.lead);
        // Keep the real arrival time, so the lead's age and response time are honest.
        await prisma.lead.update({ where: { id: lead.id }, data: { createdAt: new Date(entry.receivedAt) } });
        await prisma.activity.create({
          data: {
            leadId: lead.id,
            type: 'STATUS_CHANGE',
            note: `Recovered from the outage queue — submitted ${new Date(entry.receivedAt).toUTCString()} via the ${entry.form} form ${marker}`,
          },
        });
        await assignLeadToRep(lead.id, entry.lead.productCategory);
        result.imported += 1;
      }
      await del(blob.url, { token: token() });
    } catch (err) {
      // The database is still unreachable — leave this and the rest for next time.
      console.error('[lead-queue] database still unavailable, stopping flush:', err);
      result.remaining = blobs.length - i;
      return result;
    }
  }

  if (result.imported > 0) console.warn(`[lead-queue] imported ${result.imported} queued enquiries into the CRM`);
  return result;
}
