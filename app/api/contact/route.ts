import { z } from 'zod';
import { contactEmailTemplate, sendEmail, SALES_EMAIL } from '@/lib/email';
import { assignLeadToRep, createCRMLead, notifyRep } from '@/lib/crm';
import { clientIp, rateLimit } from '@/lib/rate-limit';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  if (!rateLimit(clientIp(request))) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Capture every contact message as a CRM lead so nothing is ever lost —
  // even when email delivery isn't configured.
  try {
    const lead = await createCRMLead({
      fullName: data.name,
      email: data.email,
      productCategory: 'general-enquiry',
      message: data.message,
      sourcePage: request.headers.get('referer') ?? undefined,
    });
    const rep = await assignLeadToRep(lead.id, 'general-enquiry');
    await notifyRep(lead, rep);
  } catch (err) {
    // Never fail the visitor's submission because of a CRM/DB hiccup — still email.
    console.error('[api/contact] Could not save lead:', err);
  }

  await sendEmail({
    to: SALES_EMAIL,
    subject: `New contact from ${data.name}`,
    html: contactEmailTemplate(data),
  });

  return Response.json({ success: true });
}
