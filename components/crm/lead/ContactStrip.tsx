'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/crm/Icon';
import { CONTACT_OUTCOMES, OUTCOME_LABELS, whatsappLink, type ContactOutcome } from '@/lib/pipeline';

/** The icon shown on each one-click outcome button. */
const OUTCOME_ICONS: Record<ContactOutcome, string> = {
  SPOKE: 'record_voice_over',
  NO_ANSWER: 'phone_missed',
  PHONE_OFF: 'phonelink_erase',
  ASKED_CALL_BACK: 'schedule',
  WHATSAPP_SENT: 'chat',
  EMAIL_SENT: 'mail',
  VISITED: 'handshake',
  WRONG_NUMBER: 'report',
};

/**
 * Reach the customer, then record what happened in one click.
 *
 * The whole reason the CRM went stale is that logging an outcome used to mean
 * typing a note. Here "called, no answer" is a single button, so there is no
 * excuse for a lead with no history.
 */
export default function ContactStrip({
  leadId,
  fullName,
  phone,
  email,
  contactAttempts,
  lastContactedAt,
}: {
  leadId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  contactAttempts: number;
  lastContactedAt: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [logged, setLogged] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wa = whatsappLink(
    phone,
    `Hello ${fullName.split(' ')[0]}, this is Casements Africa Limited following up on your enquiry.`,
  );

  const log = async (outcome: ContactOutcome) => {
    setBusy(outcome);
    setError(null);
    const res = await fetch(`/api/crm/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact: { outcome } }),
    });
    setBusy(null);
    if (res.ok) {
      setLogged(OUTCOME_LABELS[outcome]);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not log that.');
    }
  };

  const action =
    'flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90';

  return (
    <section className="rounded-xl border border-outline-variant bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        {phone && (
          <a href={`tel:${phone}`} className={`${action} bg-industrial-blue`}>
            <Icon name="call" className="text-[18px]" /> Call
          </a>
        )}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className={`${action} bg-[#25D366]`}>
            <Icon name="chat" className="text-[18px]" /> WhatsApp
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className={`${action} bg-primary`}>
            <Icon name="mail" className="text-[18px]" /> Email
          </a>
        )}
        <span className="ml-auto font-mono text-[11px] text-on-surface-variant">
          {contactAttempts > 0
            ? `${contactAttempts} contact ${contactAttempts === 1 ? 'attempt' : 'attempts'}${
                lastContactedAt ? ` · last ${new Date(lastContactedAt).toLocaleDateString()}` : ''
              }`
            : 'Never contacted'}
        </span>
      </div>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-on-surface-variant">
        Log what happened
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CONTACT_OUTCOMES.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => log(o)}
            disabled={busy !== null}
            className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 font-sans text-xs text-on-surface transition-colors hover:border-safety-orange hover:bg-safety-orange/5 disabled:opacity-50"
          >
            <Icon name={OUTCOME_ICONS[o]} className="text-[16px] text-on-surface-variant" />
            {busy === o ? 'Logging…' : OUTCOME_LABELS[o]}
          </button>
        ))}
      </div>

      {logged && <p className="mt-3 font-mono text-xs text-primary">Logged: {logged}.</p>}
      {error && <p className="mt-3 font-mono text-xs text-error">{error}</p>}
    </section>
  );
}
