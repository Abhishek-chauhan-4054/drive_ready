import Script from "next/script";

/**
 * Loads Google Analytics 4 when NEXT_PUBLIC_GA4_ID is set.
 * Events from lib/analytics.ts are sent to GA4 automatically in that case.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA4_ID;
  if (!id) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
