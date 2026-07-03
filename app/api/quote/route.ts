import { z } from 'zod';
import { assignLeadToRep, createCRMLead, notifyRep, sendAutoReply } from '@/lib/crm';
import { sendWhatsAppAlert } from '@/lib/whatsapp';
import { clientIp, rateLimit } from '@/lib/rate-limit';

const quoteSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal('')),
  productCategory: z.string().min(1),
  projectSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'COMMERCIAL']),
  timeline: z.string().optional(),
  message: z.string().optional(),
  sourcePage: z.string().optional(),
});

export async function POST(request: Request) {
  if (!rateLimit(clientIp(request))) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  const parsed = quoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const email = data.email && data.email.length > 0 ? data.email : undefined;

  try {
    // 1. Save lead to DB
    const lead = await createCRMLead({ ...data, email });
    // 2. Assign to a sales rep
    const rep = await assignLeadToRep(lead.id, data.productCategory);
    // 3. Email notification to rep
    await notifyRep(lead, rep);
    // 4. Auto-reply to client (if they gave an email)
    if (email) await sendAutoReply(email, data.fullName);
    // 5. WhatsApp alert for large / commercial
    if (rep && ['LARGE', 'COMMERCIAL'].includes(data.projectSize)) {
      await sendWhatsAppAlert(lead, rep);
    }
    return Response.json({ success: true, leadId: lead.id });
  } catch (err) {
    console.error('[api/quote] Failed to process lead:', err);
    return Response.json({ error: 'Could not process request' }, { status: 500 });
  }
}
