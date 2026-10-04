import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { COMPANY, SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact DriveReady",
  description: "Report a content issue, suggest a state, or get in touch with the DriveReady team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p className="lead">Found something that doesn&rsquo;t match your state&rsquo;s official handbook? We want to know.</p>
      <ul>
        <li>
          Email: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
        </li>
        <li>
          WhatsApp:{" "}
          <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer">
            {COMPANY.phoneDisplay}
          </a>
        </li>
        <li>
          {SITE.name} is built and run by{" "}
          <a href={COMPANY.url} target="_blank" rel="noopener noreferrer">
            {COMPANY.name}
          </a>{" "}
          ({COMPANY.location}).
        </li>
      </ul>
      <h2>Reporting a content issue</h2>
      <p>Please include:</p>
      <ul>
        <li>The state and the question text (or the page URL)</li>
        <li>What you believe is incorrect</li>
        <li>A link to the official source that shows the correct information</li>
      </ul>
      <p>Every report is checked against the official source before anything changes.</p>
      <h2>Want an app like this?</h2>
      <p>
        {COMPANY.name} builds practice platforms, calculators and other digital products for businesses.{" "}
        <a href={`${COMPANY.url}/contact/`} target="_blank" rel="noopener noreferrer">Tell us what you&rsquo;re building</a>.
      </p>
      <h2>Questions about your permit or license?</h2>
      <p>
        We can&rsquo;t help with appointments, applications or records. Please contact your state&rsquo;s official agency — each state page lists its
        official links. <Link href="/dmv">Find your state</Link>.
      </p>
    </LegalPage>
  );
}
