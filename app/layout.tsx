import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter, WhatsAppFloat } from "@/components/SiteChrome";
import { Analytics } from "@/components/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { ClientBoot } from "@/components/ClientBoot";
import { JsonLd } from "@/components/Common";
import { COMPANY, SITE } from "@/lib/site";
import { websiteJsonLd } from "@/lib/seo";
import { getContent } from "@/lib/repositories";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Free DMV Practice Tests by State`, template: `%s | ${SITE.name}` },
  description: SITE.tagline,
  applicationName: SITE.name,
  authors: [{ name: COMPANY.name, url: COMPANY.url }],
  creator: COMPANY.name,
  publisher: COMPANY.name,
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#070d1f" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const states = await getContent().states.listStates();
  const featured = states.filter((s) => s.status === "available" || s.status === "study-hub").map((s) => ({ name: s.name, slug: s.slug }));
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap"
        />
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter featured={featured} />
        <WhatsAppFloat />
        <ClientBoot />
        <Analytics />
        <VercelAnalytics />
      </body>
    </html>
  );
}
