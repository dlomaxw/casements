import Script from 'next/script';

/**
 * Google Ads global site tag (gtag.js).
 *
 * Loaded alongside the GTM container: Google's documented pattern is one
 * gtag.js load plus a `config` call per destination, and a second request for
 * the same library is served from cache and de-duplicated by gtag itself.
 *
 * This tag alone only builds remarketing audiences — recording a *conversion*
 * additionally needs a `gtag('event', 'conversion', { send_to: 'AW-…/<label>' })`
 * call fired on the action you count (quote submitted, call clicked). Supply the
 * conversion label from Google Ads and it can be wired to the form handlers.
 */
export const GOOGLE_ADS_ID = 'AW-18332719306'; // public identifier, safe to commit

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
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
