// Google Ads conversion tracking.
//
// The base tag (components/seo/GoogleAdsTag.tsx) only builds remarketing
// audiences; a conversion is only recorded when this event fires.

export const GOOGLE_ADS_ID = 'AW-18332719306';

export interface ConversionAction {
  sendTo: string;
  value: number;
  currency: string;
}

/** Conversion action from Google Ads: "Submit lead form". */
export const LEAD_CONVERSION: ConversionAction = {
  sendTo: `${GOOGLE_ADS_ID}/SqrDCK3M09IcEMqx3KVE`,
  value: 1.0,
  currency: 'USD',
};

/** Conversion action from Google Ads: "Click to call". */
export const CALL_CONVERSION: ConversionAction = {
  sendTo: `${GOOGLE_ADS_ID}/-SzQCLTT7uMcEMqx3KVE`,
  value: 0.2,
  currency: 'USD',
};

type GtagFn = (command: string, ...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
    gtag_report_conversion?: (url?: string) => boolean;
    gtag_report_call_conversion?: (url?: string) => boolean;
  }
}

/**
 * Reports a conversion to Google Ads.
 *
 * Pass `url` when the conversion happens on a link click that navigates away:
 * navigation is held until the tag has been sent (or ~1s has passed, whichever
 * is first), so the hit isn't lost to the page unloading. Omit it for in-page
 * submissions and for `tel:` links, which don't unload the page.
 *
 * Always returns false so it can be used directly from an onClick handler that
 * needs to suppress the default navigation.
 */
function report(action: ConversionAction, url?: string): boolean {
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
    send_to: action.sendTo,
    value: action.value,
    currency: action.currency,
    event_callback: go,
  });

  // Safety net: Google's callback occasionally never fires (blocked request,
  // slow network). Don't strand the user on the page.
  if (url) setTimeout(go, 1000);

  return false;
}

/** Lead-form conversion — quote and contact form submissions. */
export const reportLeadConversion = (url?: string): boolean => report(LEAD_CONVERSION, url);

/** Click-to-call conversion — taps on a `tel:` link. */
export const reportCallConversion = (url?: string): boolean => report(CALL_CONVERSION, url);
