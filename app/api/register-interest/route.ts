import { z } from 'zod';
import { assignLeadToRep, createCRMLead, notifyRep, sendAutoReply } from '@/lib/crm';
import { clientIp, rateLimit } from '@/lib/rate-limit';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal('')),
});

export async function POST(request: Request) {
  if (!rateLimit(clientIp(request))) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { name, phone, email } = parsed.data;

  // Capture the interest as a CRM lead first — nothing is ever lost even if
  // email delivery isn't configured (RESEND_API_KEY).
  try {
    const lead = await createCRMLead({
      fullName: name,
      phone,
      email: email || undefined,
      productCategory: 'general-enquiry',
      message: 'Registered interest via homepage popup.',
      sourcePage: request.headers.get('referer') ?? undefined,
    });
    const rep = await assignLeadToRep(lead.id, 'general-enquiry');
    await notifyRep(lead, rep); // emails the sales team / assigned rep
    if (email) await sendAutoReply(email, name); // confirmation to the visitor
  } catch (err) {
    // Never fail the visitor's submission because of a CRM/DB hiccup.
    console.error('[api/register-interest] Could not save lead:', err);
  }

  return Response.json({ success: true });
}
