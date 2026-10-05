function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/**
 * ============================================================
 *  BRAND & COMPANY SETTINGS — edit here
 * ============================================================
 */
export const COMPANY = {
  name: "Pytron Digital",
  descriptor: "Digital Growth & Technology Partner",
  /** Company website. Override with NEXT_PUBLIC_COMPANY_URL if the domain changes. */
  url: (process.env.NEXT_PUBLIC_COMPANY_URL || "https://digital.pytron.io").replace(/\/$/, ""),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "business@pytron.io",
  phoneDisplay: "+91 70092 14812",
  whatsapp: "https://wa.me/917009214812",
  location: "Sitapur, India",
} as const;

export const SITE = {
  name: "DriveReady",
  fullName: "DriveReady — DMV Permit Practice by Pytron Digital",
  tagline: "State-specific practice tests based on official driver handbooks and DMV resources.",
  url: resolveSiteUrl(),
  contactEmail: COMPANY.email,
  disclaimer:
    "This is an independent educational practice platform and is not affiliated with or endorsed by any DMV or government agency.",
  /** Minimum approved questions for a state to show practice + mock tests. */
  minQuestionsForPractice: 8,
} as const;

export const absoluteUrl = (path: string) => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
