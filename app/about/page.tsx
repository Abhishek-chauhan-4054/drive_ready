import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { COMPANY, SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About DriveReady — Independent DMV Permit Practice by Pytron Digital",
  description: "DriveReady is an independent practice platform by Pytron Digital that builds state-specific permit test practice from official driver handbooks. Here's how we verify content.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <LegalPage title="About DriveReady">
      <p className="lead">
        DriveReady helps new drivers prepare for their state&rsquo;s learner permit knowledge test with practice that is specific to their state and
        traceable to official sources.
      </p>
      <p>
        Driving rules are not the same everywhere. Passing scores, test lengths, permit ages, speed limits and even what you may do at a red light
        differ from state to state. Generic &ldquo;national&rdquo; practice tests blur those differences. DriveReady doesn&rsquo;t.
      </p>

      <h2>Built by {COMPANY.name}</h2>
      <p>
        {SITE.name} is a product of <a href={COMPANY.url} target="_blank" rel="noopener noreferrer">{COMPANY.name}</a>, a digital growth and
        technology partner that designs, builds, markets and automates digital products. We build our own public tools alongside client work —
        the same product thinking, engineering and SEO go into both.
      </p>
      <p>
        Want a tool like this for your business — a test-prep app, a calculator, an eligibility checker or something else?{" "}
        <a href={`${COMPANY.url}/contact/`} target="_blank" rel="noopener noreferrer">Start a project with {COMPANY.name}</a>.
      </p>

      <h2 id="how-we-verify">How we verify content</h2>
      <ol>
        <li><strong>Start from the official source.</strong> We read the state&rsquo;s official driver handbook or DMV web pages — never third-party summaries.</li>
        <li><strong>Extract one checkable fact.</strong> Each question is built around a single statement in the source.</li>
        <li><strong>Write an original practice question.</strong> We write our own wording and plausible wrong answers. We don&rsquo;t copy official exam questions.</li>
        <li><strong>Record the source.</strong> Every question stores the source title, URL, section and the date we verified it. You see all of this after every answer.</li>
        <li><strong>Validate automatically.</strong> A validator rejects any question with a missing source, a non-government source URL, an answer that doesn&rsquo;t match an option, or a duplicate. The site will not build if it finds one.</li>
      </ol>
      <p>
        If we can&rsquo;t verify a state&rsquo;s rules from official sources, we label it &ldquo;Coming soon&rdquo; or &ldquo;Verification in progress&rdquo; rather than
        guessing. See the <Link href="/dmv">state directory</Link> for each state&rsquo;s status.
      </p>

      <h2>What DriveReady is not</h2>
      <p>
        {SITE.disclaimer} We don&rsquo;t provide official DMV test questions, we can&rsquo;t book appointments, and nothing here replaces reading your
        state&rsquo;s official handbook. Laws change — always confirm requirements with your state&rsquo;s official agency.
      </p>

      <h2>Your data</h2>
      <p>
        Practice needs no account. Your progress is saved only in your own browser on your device. See our <Link href="/privacy">privacy policy</Link>.
      </p>
    </LegalPage>
  );
}
