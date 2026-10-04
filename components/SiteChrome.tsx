import Link from "next/link";
import { Brand } from "./Brand";
import { Icon } from "./Icon";
import { COMPANY, SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container bar">
        <Brand />
        <nav className="nav" aria-label="Main">
          <Link href="/dmv" className="hide-sm">States</Link>
          <Link href="/#how-it-works" className="hide-sm">How it works</Link>
          <Link href="/about" className="hide-sm">About</Link>
          <Link href="/dmv" className="btn btn-primary btn-sm">Start practicing</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ featured }: { featured: { name: string; slug: string }[] }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          <div>
            <Brand />
            <p className="muted small" style={{ marginTop: 14, maxWidth: 340 }}>
              Free, state-specific permit test practice written from official driver handbooks — with a source link on every question.
            </p>
            <div className="company-card small">
              <div className="k">A product by</div>
              <a className="cname" href={COMPANY.url} target="_blank" rel="noopener noreferrer">
                {COMPANY.name} ↗
              </a>
              <div className="muted">{COMPANY.descriptor}</div>
            </div>
          </div>
          <div>
            <h4>Practice tests</h4>
            <ul>
              {featured.map((s) => (
                <li key={s.slug}>
                  <Link href={`/dmv/${s.slug}`}>{s.name} DMV practice test</Link>
                </li>
              ))}
              <li><Link href="/dmv">All 50 states</Link></li>
            </ul>
          </div>
          <div>
            <h4>{SITE.name}</h4>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/about#how-we-verify">How we verify content</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><a href={COMPANY.url} target="_blank" rel="noopener noreferrer">{COMPANY.name}</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
              <li><a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp {COMPANY.phoneDisplay}</a></li>
              <li><span className="muted">{COMPANY.location}</span></li>
            </ul>
            <h4 style={{ marginTop: 20 }}>Legal</h4>
            <ul>
              <li><Link href="/disclaimer">Disclaimer</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="footnote">
          <p style={{ margin: 0 }}>
            <strong>Independent practice platform.</strong> {SITE.disclaimer} Always confirm requirements with your state&rsquo;s official agency.
          </p>
          <p style={{ margin: "8px 0 0" }}>
            © {new Date().getFullYear()} {SITE.name} · Built by{" "}
            <a href={COMPANY.url} target="_blank" rel="noopener noreferrer">{COMPANY.name}</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Small floating WhatsApp button for phones (hidden on desktop and during tests). */
export function WhatsAppFloat() {
  return (
    <a
      className="wa-float"
      href={COMPANY.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${COMPANY.name} on WhatsApp (opens in a new tab)`}
    >
      <Icon name="chat" size={24} />
    </a>
  );
}
