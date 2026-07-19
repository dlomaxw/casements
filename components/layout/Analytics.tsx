'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Fires one lightweight beacon per page view on the public site.
// The API strips bots, admin paths and self-referrals; no IP is stored.
export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/crm')) return;
    // Guard against double-fire from Strict Mode / re-renders on the same URL
    const key = `${pathname}?${searchParams?.toString() ?? ''}`;
    if (last.current === key) return;
    last.current = key;

    const body = JSON.stringify({ path: pathname, referrer: document.referrer || undefined });
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* analytics must never break the page */
    });
  }, [pathname, searchParams]);

  return null;
}
