import { Resend } from 'resend';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const FROM = process.env.EMAIL_FROM ?? 'Casements Africa <sales@casements.co.ug>';
export const SALES_EMAIL = process.env.EMAIL_SALES ?? 'sales@casements.co.ug';

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No email provider configured (local dev) — log instead of failing the request.
    console.warn(`[email] RESEND_API_KEY not set — would send "${subject}" to ${to}`);
    return;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({ from: FROM, to, subject, html });
}

const shell = (body: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
    <div style="background:#132a3c;color:#ffffff;padding:20px 24px">
      <h2 style="margin:0;font-size:18px">Casements Africa Limited</h2>
      <p style="margin:4px 0 0;font-size:12px;color:#c0dcec">Built to Last, Delivered as Promised</p>
    </div>
    <div style="padding:24px">${body}</div>
    <div style="background:#f6f7f8;padding:16px 24px;font-size:12px;color:#6b7280">
      Plot 86, 5th Street, Industrial Area, Kampala &middot; +256 752 700 700 &middot; casements.co.ug
    </div>
  </div>`;

export function contactEmailTemplate(data: { name: string; email: string; message: string }): string {
  return shell(`
    <h3 style="margin-top:0">New contact form message</h3>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>`);
}

export function quoteNotificationTemplate(lead: {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  productCategory: string;
  projectSize: string;
  timeline?: string | null;
  message?: string | null;
}): string {
  const base = process.env.NEXTAUTH_URL ?? 'https://casements.co.ug';
  return shell(`
    <h3 style="margin-top:0">New quote request — action required</h3>
    <p><strong>Client:</strong> ${escapeHtml(lead.fullName)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(lead.phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(lead.email ?? '—')}</p>
    <p><strong>Product:</strong> ${escapeHtml(lead.productCategory)}</p>
    <p><strong>Project size:</strong> ${escapeHtml(lead.projectSize)}</p>
    <p><strong>Timeline:</strong> ${escapeHtml(lead.timeline ?? '—')}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(lead.message ?? '—')}</p>
    <p style="margin-top:24px">
      <a href="${base}/crm/leads/${lead.id}"
         style="background:#f0a821;color:#132a3c;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:bold">
        Open lead in CRM
      </a>
    </p>`);
}

export function autoReplyTemplate(name: string): string {
  return shell(`
    <h3 style="margin-top:0">Thank you for your enquiry, ${escapeHtml(name)}!</h3>
    <p>We have received your quote request and one of our sales engineers will contact you shortly
       — usually within one business day.</p>
    <p>If your enquiry is urgent, call us directly on
       <a href="tel:+256752700700" style="color:#236c95">+256 752 700 700</a>.</p>
    <p>— The Casements Africa Team</p>`);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
