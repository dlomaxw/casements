import Script from 'next/script';
import { GOOGLE_ADS_ID, LEAD_CONVERSION } from '@/lib/gtag';

/**
 * Google Ads global site tag (gtag.js).
 *
 * Loaded alongside the GTM container: Google's documented pattern is one
 * gtag.js load plus a `config` call per destination, and a second request for
 * the same library is served from cache and de-duplicated by gtag itself.
 *
 * This tag alone only builds remarketing audiences. Conversions are recorded by
 * reportLeadConversion() in lib/gtag.ts, which the quote and contact forms call
 * on a successful submission. The same function is also published globally as
 * window.gtag_report_conversion(url) so a plain link or button can fire it
 * inline, exactly as Google's pasted snippet expects.
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
window.gtag_report_conversion = function (url) {
  var navigated = false;
  var go = function () { if (!navigated && typeof url !== 'undefined') { navigated = true; window.location = url; } };
  gtag('event', 'conversion', {
    send_to: '${LEAD_CONVERSION.sendTo}',
    value: ${LEAD_CONVERSION.value},
    currency: '${LEAD_CONVERSION.currency}',
    event_callback: go
  });
  if (typeof url !== 'undefined') setTimeout(go, 1000);
  return false;
};`}
      </Script>
    </>
  );
}
