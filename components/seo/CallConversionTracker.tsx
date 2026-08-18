'use client';

import { useEffect } from 'react';
import { reportCallConversion } from '@/lib/gtag';

/**
 * Reports a "Click to call" conversion whenever a `tel:` link is clicked
 * anywhere on the public site.
 *
 * Delegated from the document rather than bolted onto each link: the phone
 * number appears in the header, mobile nav, footer, contact page, hero CTA,
 * the interest modal and the chatbot, and any new one is covered automatically.
 *
 * Mounted in the public site layout only — the CRM also renders `tel:` links
 * for each lead, and staff dialling a customer is not an ad conversion.
 *
 * The event is fired without holding navigation: a `tel:` link hands off to the
 * dialer without unloading the page, so the request completes normally.
 */
export default function CallConversionTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.('a[href^="tel:"]');
      if (link) reportCallConversion();
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
