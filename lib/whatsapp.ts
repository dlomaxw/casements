import type { Lead, User } from '@prisma/client';

// Fires for project_size: 'LARGE' or 'COMMERCIAL' — WhatsApp Business Cloud API.
export async function sendWhatsAppAlert(lead: Lead, rep: User): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId || !rep.whatsappNumber) {
    console.warn('[whatsapp] Not configured or rep has no WhatsApp number — skipping alert');
    return;
  }

  await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: rep.whatsappNumber,
      type: 'text',
      text: {
        body: `\u{1F514} NEW LEAD [${lead.projectSize.toUpperCase()}]\n${lead.fullName}\n${lead.phone}\n${lead.productCategory}`,
      },
    }),
  });
}
