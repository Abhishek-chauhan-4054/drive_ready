import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Disclaimer",
  description: "DriveReady is an independent educational practice platform and is not affiliated with or endorsed by any DMV or government agency.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" updated="2026-10-04">
      <div className="notice notice-caution" style={{ marginBottom: 24 }}>
        <strong>{SITE.disclaimer}</strong>
      </div>
      <h2>Practice questions, not official test questions</h2>
      <p>
        Questions on DriveReady are original practice questions written from official state driver handbooks and DMV resources. They are not the
        questions on any official knowledge test, and DriveReady does not claim they are. Where we ever show material that comes from an official source,
        it is labeled as such along with its source.
      </p>
      <h2>No government branding</h2>
      <p>
        DriveReady does not use DMV logos, government seals or official branding. Names of agencies and handbooks are used only to identify and link to
        the official sources our content is based on.
      </p>
      <h2>Accuracy and changes in law</h2>
      <p>
        We verify each fact against an official source and show the date it was verified. Laws, fees, test formats and requirements change, and
        official sources are updated without notice. DriveReady may not reflect the most recent changes. Always confirm requirements with your
        state&rsquo;s official agency before your test.
      </p>
      <h2>Not legal advice</h2>
      <p>Nothing on this site is legal advice. Passing a DriveReady practice or mock test does not guarantee you will pass an official test.</p>
    </LegalPage>
  );
}
