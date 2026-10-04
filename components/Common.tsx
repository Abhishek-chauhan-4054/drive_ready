import Link from "next/link";
import type { FaqItem, StateStatus, StateSummary } from "@/lib/types";
import { Icon } from "./Icon";

export const STATUS_LABEL: Record<StateStatus, string> = {
  available: "Available",
  "study-hub": "Test guide",
  "in-review": "Verification in progress",
  "coming-soon": "Coming soon",
};

export function StatusBadge({ status }: { status: StateStatus }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function StateCard({ s }: { s: StateSummary }) {
  const live = s.status === "available" || s.status === "study-hub";
  const meta =
    s.status === "available"
      ? `${s.questionCount} verified questions`
      : s.status === "study-hub"
        ? "Official test format · questions in progress"
        : s.status === "in-review"
          ? "Handbook verification underway"
          : "On the roadmap";
  const cls = `card card-link state-card${s.status === "available" ? " is-available" : ""}${live ? "" : " is-dim"}`;
  return (
    <Link href={`/dmv/${s.slug}`} className={cls}>
      <div className="top">
        <span className="plate" aria-hidden="true">{s.code}</span>
        <StatusBadge status={s.status} />
      </div>
      <div className="name">
        {s.name}
        <span className="sr-only"> — {STATUS_LABEL[s.status]}</span>
      </div>
      <div className="meta">{meta}</div>
    </Link>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            {it.href && i < items.length - 1 ? <Link href={it.href}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="faq">
      {items.map((f, i) => (
        <details key={i}>
          <summary>{f.q}</summary>
          <div className="answer">
            <p style={{ margin: 0 }}>{f.a}</p>
            {f.sourceUrl && (
              <p className="small muted" style={{ margin: "8px 0 0" }}>
                Source: <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer">official page</a>
              </p>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

export function ExternalLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function PracticeDisclaimer() {
  return (
    <div className="notice">
      <Icon name="info" size={18} />
      <span>
        Practice questions based on the official driver handbook. These are not official DMV test questions. DriveReady is an independent
        platform, not affiliated with or endorsed by any DMV or government agency.
      </span>
    </div>
  );
}
