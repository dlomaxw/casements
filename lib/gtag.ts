// Google Ads conversion tracking.
//
// The base tag (components/seo/GoogleAdsTag.tsx) only builds remarketing
// audiences; a conversion is only recorded when this event fires.

export const GOOGLE_ADS_ID = 'AW-18332719306';

/** Conversion action from Google Ads: "Submit lead form". */
export const LEAD_CONVERSION = {
  sendTo: `${GOOGLE_ADS_ID}/SqrDCK3M09IcEMqx3KVE`,
  value: 1.0,
  currency: 'USD',
};

type GtagFn = (command: string, ...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
    gtag_report_conversion?: (url?: string) => boolean;
  }
}

/**
 * Reports a lead-form conversion.
 *
 * Pass `url` when the conversion happens on a link click: navigation is held
 * until the tag has been sent (or ~1s has passed, whichever is first), so the
 * hit isn't lost to the page unloading. Omit it for in-page submissions.
 *
 * Always returns false so it can be used directly from an onClick handler that
 * needs to suppress the default navigation.
 */
export function reportLeadConversion(url?: string): boolean {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    // Ad blocker, or the tag hasn't loaded — never block the user's navigation.
    if (url) window.location.href = url;
    return false;
  }

  let navigated = false;
  const go = () => {
    if (navigated || !url) return;
    navigated = true;
    window.location.href = url;
  };

  window.gtag('event', 'conversion', {
    send_to: LEAD_CONVERSION.sendTo,
    value: LEAD_CONVERSION.value,
    currency: LEAD_CONVERSION.currency,
    event_callback: go,
  });

  // Safety net: Google's callback occasionally never fires (blocked request,
  // slow network). Don't strand the user on the page.
  if (url) setTimeout(go, 1000);

  return false;
}
