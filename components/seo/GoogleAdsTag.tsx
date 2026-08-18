import Script from 'next/script';
import { CALL_CONVERSION, GOOGLE_ADS_ID, LEAD_CONVERSION } from '@/lib/gtag';

/**
 * Google Ads global site tag (gtag.js).
 *
 * Loaded alongside the GTM container: Google's documented pattern is one
 * gtag.js load plus a `config` call per destination, and a second request for
 * the same library is served from cache and de-duplicated by gtag itself.
 *
 * This tag alone only builds remarketing audiences. Conversions are recorded
 * from lib/gtag.ts: the quote and contact forms call reportLeadConversion() on
 * a successful submission, and CallConversionTracker reports a click-to-call
 * for every `tel:` link on the public site.
 *
 * Both are also published globally for inline use from a link or button:
 *   window.gtag_report_conversion(url)       -> Submit lead form
 *   window.gtag_report_call_conversion(url)  -> Click to call
 *
 * Google names every pasted snippet `gtag_report_conversion`, so the call
 * action gets its own name here — otherwise the second definition would
 * silently overwrite the first and every conversion would report as one action.
 */
export default function GoogleAdsTag() {
  return (
    <>
      <Script
        id="google-ads-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');
function reportConversion(sendTo, value, currency, url) {
  var navigated = false;
  var go = function () { if (!navigated && typeof url !== 'undefined') { navigated = true; window.location = url; } };
  gtag('event', 'conversion', { send_to: sendTo, value: value, currency: currency, event_callback: go });
  if (typeof url !== 'undefined') setTimeout(go, 1000);
  return false;
}
window.gtag_report_conversion = function (url) {
  return reportConversion('${LEAD_CONVERSION.sendTo}', ${LEAD_CONVERSION.value}, '${LEAD_CONVERSION.currency}', url);
};
window.gtag_report_call_conversion = function (url) {
  return reportConversion('${CALL_CONVERSION.sendTo}', ${CALL_CONVERSION.value}, '${CALL_CONVERSION.currency}', url);
};`}
      </Script>
    </>
  );
}
