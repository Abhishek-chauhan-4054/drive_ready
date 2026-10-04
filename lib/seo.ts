import type { Metadata } from "next";
import { COMPANY, SITE, absoluteUrl } from "./site";
import type { FaqItem } from "./types";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: { title: opts.title, description: opts.description, url, siteName: SITE.fullName, type: "website" },
    twitter: { card: "summary", title: opts.title, description: opts.description },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function faqJsonLd(faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.fullName,
    alternateName: SITE.name,
    url: SITE.url,
    description: SITE.tagline,
    publisher: {
      "@type": "Organization",
      name: COMPANY.name,
      url: COMPANY.url,
      email: COMPANY.email,
    },
  };
}
