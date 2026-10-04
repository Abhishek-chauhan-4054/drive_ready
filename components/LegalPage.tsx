import { Breadcrumbs } from "./Common";

export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <>
      <section className="state-hero dark-band">
        <div className="container container-narrow">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: title }]} />
          <h1 style={{ fontSize: "clamp(2rem,4.5vw,3rem)" }}>{title}</h1>
          {updated && <p className="muted small" style={{ margin: 0 }}>Last updated {updated}</p>}
        </div>
      </section>
      <div className="container container-narrow section-tight">
        <div className="prose">{children}</div>
      </div>
    </>
  );
}
