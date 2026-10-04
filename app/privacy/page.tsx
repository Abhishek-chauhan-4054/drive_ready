import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "DriveReady needs no account. Practice progress is stored only in your browser.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="2026-10-04">
      <p className="lead">Short version: no account, no sign-up, and your practice history stays in your own browser.</p>
      <h2>Who we are</h2>
      <p>
        DriveReady is operated by {COMPANY.name} ({COMPANY.location}). Questions about privacy:{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
      <h2>What we store on your device</h2>
      <p>
        To show your progress, mistakes and weak topics, DriveReady saves which questions you answered and whether you got them right in your
        browser&rsquo;s local storage. This data never leaves your device through DriveReady, and you can erase it at any time with the
        &ldquo;Reset&rdquo; button on a state&rsquo;s practice page or by clearing your browser&rsquo;s site data.
      </p>
      <h2>Analytics</h2>
      <p>
        We may use privacy-friendly, aggregate analytics to understand which states and features are used (for example, &ldquo;practice
        started&rdquo; or &ldquo;mock test completed&rdquo;). These events do not include your name, email or answers to individual questions. If analytics
        are enabled, the provider will be named on this page.
      </p>
      {process.env.NEXT_PUBLIC_GA4_ID && (
        <p>
          <strong>Currently enabled:</strong> Google Analytics 4, which may set cookies or similar identifiers to measure page views and the
          events listed above. You can block these in your browser settings.
        </p>
      )}
      <h2>Accounts and payments</h2>
      <p>DriveReady currently has no accounts and takes no payments. If that changes, this policy will be updated before those features launch.</p>
      <h2>Links to official sites</h2>
      <p>We link to official government websites. Their privacy practices are governed by their own policies.</p>
      <h2>Children</h2>
      <p>DriveReady is an educational resource and does not knowingly collect personal information from anyone.</p>
    </LegalPage>
  );
}
