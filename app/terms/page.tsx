import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { COMPANY, SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: "Terms for using the DriveReady DMV permit practice platform.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="2026-10-04">
      <h2>Who provides DriveReady</h2>
      <p>
        DriveReady is provided by {COMPANY.name}. Contact: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
      <h2>Educational use</h2>
      <p>
        DriveReady provides free practice material for personal, educational use. {SITE.disclaimer}
      </p>
      <h2>No guarantee</h2>
      <p>
        We work to keep content accurate and cite official sources, but we provide the service &ldquo;as is&rdquo; without warranties. Results on
        DriveReady do not guarantee results on any official test. Official handbooks and agencies are the final authority.
      </p>
      <h2>Acceptable use</h2>
      <p>Don&rsquo;t scrape, resell or republish DriveReady&rsquo;s original questions, or attempt to disrupt the service.</p>
      <h2>Content</h2>
      <p>
        Practice questions, explanations and design are original to DriveReady. Official handbooks and agency pages belong to their respective
        government publishers and are linked, not reproduced.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms. Continued use after changes means you accept the updated terms.</p>
    </LegalPage>
  );
}
