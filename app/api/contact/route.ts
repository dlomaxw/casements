import { z } from 'zod';
import { contactEmailTemplate, sendEmail, SALES_EMAIL } from '@/lib/email';
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
  await sendEmail({
    to: SALES_EMAIL,
    subject: `New contact from ${data.name}`,
    html: contactEmailTemplate(data),
  });

  return Response.json({ success: true });
}
