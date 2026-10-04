import Link from "next/link";
import { getContent } from "@/lib/repositories";
import { pageMetadata, faqJsonLd } from "@/lib/seo";
import { COMPANY, SITE } from "@/lib/site";
import { categoryLabel } from "@/lib/categories";
import { Icon } from "@/components/Icon";
import { SignShape } from "@/components/Brand";
import { Faq, JsonLd, StateCard, ExternalLink } from "@/components/Common";
import type { FaqItem } from "@/lib/types";

export const metadata = pageMetadata({
  title: "Practice Your DMV Test With Confidence — Free State Permit Practice Tests",
  description: SITE.tagline + " Every question links to the official handbook section it comes from.",
  path: "/",
});

const HOME_FAQ: FaqItem[] = [
  {
    q: "Are these the real DMV test questions?",
    a: "No. DriveReady writes original practice questions from each state's official driver handbook and DMV pages. Every question shows the exact source section and a link so you can read the official wording yourself.",
  },
  {
    q: "Why isn't my state available yet?",
    a: "We only publish a state after we have read and verified its official handbook. States in verification are being checked now; we would rather show “coming soon” than publish rules we haven't confirmed.",
  },
  {
    q: "Is DriveReady free?",
    a: "Yes. Practice, mock tests and progress tracking are free and need no account. Your progress is stored only in your own browser.",
  },
  {
    q: "Is DriveReady affiliated with the DMV?",
    a: SITE.disclaimer + " Always confirm requirements with your state's official agency.",
  },
  {
    q: "Who makes DriveReady?",
    a: "DriveReady is built and maintained by Pytron Digital, a digital growth and technology partner. It is an independent product and is not connected to any government agency.",
  },
  {
    q: "How is the mock test scored?",
    a: "Each state's mock test uses the question count and passing rule published by that state where we have verified them — for example 14 of 20 in New York, including 2 of 4 road sign questions. Where a state doesn't publish a rule we could verify, we say so and use a clearly labeled 80% readiness target instead.",
  },
];

export default async function HomePage() {
  const content = getContent();
  const states = await content.states.listStates();
  const bySlug = new Map(states.map((s) => [s.slug, s]));
  const popular = ["california", "new-york", "pennsylvania", "washington", "oregon", "indiana", "wisconsin", "michigan"].map((s) => bySlug.get(s)!).filter(Boolean);
  const available = states.filter((s) => s.status === "available");
  const totalQuestions = available.reduce((n, s) => n + s.questionCount, 0);
  const counts = {
    available: available.length,
    hub: states.filter((s) => s.status === "study-hub").length,
    review: states.filter((s) => s.status === "in-review").length,
    soon: states.filter((s) => s.status === "coming-soon").length,
  };

  const ca = await content.states.getStateBySlug("california");
  const sample = ca?.questions.find((q) => q.id === "ca-c-003") ?? ca?.questions[0];
  const handbooks = await Promise.all(
    states
      .filter((s) => s.status === "available" || s.status === "study-hub")
      .map(async (s) => {
        const c = await content.states.getStateBySlug(s.slug);
        return { s, handbook: c?.resources.find((r) => r.kind === "handbook"), sampleTest: c?.resources.find((r) => r.kind === "sample-test") };
      }),
  );

  return (
    <>
      <JsonLd data={faqJsonLd(HOME_FAQ)} />

      <section className="hero dark-band">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">
              <Icon name="shield" size={16} /> Built from official driver handbooks
            </p>
            <h1>
              Practice your DMV test <span className="accent">with confidence.</span>
            </h1>
            <p className="lead">State-specific practice tests based on official driver handbooks and DMV resources.</p>
            <div className="row cta">
              <Link href="/dmv" className="btn btn-primary">
                Choose your state <Icon name="arrowRight" size={18} />
              </Link>
              <Link href="/dmv/california/practice-test" className="btn">
                Start free practice
              </Link>
            </div>
            <div className="hero-meta">
              <span><Icon name="check" size={16} /> <strong className="tnum">{totalQuestions}</strong>&nbsp;verified questions</span>
              <span><Icon name="file" size={16} /> Official source on every answer</span>
              <span><Icon name="heart" size={16} /> Free · no sign-up</span>
            </div>
          </div>

          {sample && (
            <div className="preview" aria-label="Example practice question">
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                <span className="badge badge-plain">California · {categoryLabel(sample.category)}</span>
                <span className="small muted tnum">Question 3 of 10</span>
              </div>
              <div className="progress" aria-hidden="true"><span style={{ width: "30%" }} /></div>
              <p className="qtext" style={{ fontSize: "1.25rem", margin: "16px 0" }}>{sample.question}</p>
              <ul className="options" role="list">
                {sample.options.map((o, i) => (
                  <li key={o}>
                    <div className={`opt ${o === sample.correctAnswer ? "is-correct" : ""}`} style={{ minHeight: 50, fontSize: "0.94rem" }}>
                      <span className="key">{"ABCD"[i]}</span>
                      <span>{o}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="source" style={{ fontSize: "0.8rem" }}>
                <span><strong>Source:</strong> {sample.sourceTitle} — {sample.sourceSection}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container">
        <div className="stat-strip">
          {[
            { v: String(counts.available), k: "States with full practice" },
            { v: String(totalQuestions), k: "Verified practice questions" },
            { v: "100%", k: "Answers linked to an official source" },
            { v: "Free", k: "No account, no sign-up" },
          ].map((x) => (
            <div key={x.k} className="s">
              <div className="v tnum">{x.v}</div>
              <div className="k">{x.k}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="section" aria-labelledby="popular-heading">
        <div className="container">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
            <div>
              <p className="eyebrow">Popular states</p>
              <h2 id="popular-heading" style={{ marginBottom: 0 }}>Pick your state, start in seconds</h2>
            </div>
            <Link href="/dmv" className="btn btn-sm">All 50 states <Icon name="arrowRight" size={16} /></Link>
          </div>
          <div className="grid grid-3">
            {popular.map((s) => (
              <StateCard key={s.code} s={s} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section anchor" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }} aria-labelledby="how-heading">
        <div className="container">
          <p className="eyebrow">How it works</p>
          <h2 id="how-heading">Four steps from first question to test day</h2>
          <div className="grid grid-4" style={{ marginTop: 28 }}>
            {[
              { t: "Choose your state", d: "Rules differ by state. Your practice uses your state's handbook — never generic national rules.", shape: "pentagon" as const },
              { t: "Practice state-specific questions", d: "Instant feedback with a plain-English “why” and a link to the official source.", shape: "diamond" as const },
              { t: "Take a mock test", d: "Your state's verified question count and passing rule — no hints until the end.", shape: "circle" as const },
              { t: "Review your mistakes", d: "Retry what you missed and drill your weakest topics until they stick.", shape: "octagon" as const },
            ].map((s, i) => (
              <div key={s.t} className="card step">
                <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="step-num">{i + 1}</div>
                  <SignShape shape={s.shape} size={40} />
                </div>
                <h3>{s.t}</h3>
                <p className="muted" style={{ margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="trust-heading">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "center", gap: 40 }}>
            <div>
              <p className="eyebrow">Accuracy first</p>
              <h2 id="trust-heading">If we can&rsquo;t verify it, we don&rsquo;t publish it</h2>
              <p className="lead">
                Every question starts from an official state handbook or DMV page. We write an original question, check the answer against the source,
                record the section and the date we verified it, and run it through an automated validator before it can go live.
              </p>
              <Link href="/about#how-we-verify" className="btn btn-sm" style={{ marginTop: 8 }}>
                How we verify content <Icon name="arrowRight" size={16} />
              </Link>
            </div>
            <ol className="factlist" style={{ counterReset: "s" }}>
              {[
                "Read the official handbook or DMV page",
                "Extract one specific, checkable fact",
                "Write an original practice question",
                "Record the source URL, section and verification date",
                "Validator blocks anything missing a source",
              ].map((t, i) => (
                <li key={t} className="row" style={{ flexWrap: "nowrap" }}>
                  <span className="step-num" style={{ width: 32, height: 32, margin: 0, fontSize: "0.9rem", flex: "none" }}>{i + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="resources-heading">
        <div className="container">
          <p className="eyebrow">Study resources</p>
          <h2 id="resources-heading">Official handbooks, one tap away</h2>
          <p className="muted">The handbook is the source of truth for your test. Read it alongside your practice.</p>
          <div className="grid grid-3 resources" style={{ marginTop: 20 }}>
            {handbooks.map(({ s, handbook, sampleTest }) =>
              handbook ? (
                <div key={s.code} className="card" style={{ padding: 18 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>{s.name}</strong>
                    <span className="plate" aria-hidden="true" style={{ height: 26, minWidth: 38, fontSize: "0.8rem" }}>{s.code}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 6 }} className="small">
                    <li><ExternalLink href={handbook.url}>{handbook.title} ↗</ExternalLink></li>
                    {sampleTest && <li><ExternalLink href={sampleTest.url}>{sampleTest.title} ↗</ExternalLink></li>}
                    <li><Link href={`/dmv/${s.slug}`}>{s.name} study guide on DriveReady</Link></li>
                  </ul>
                </div>
              ) : null,
            )}
          </div>
        </div>
      </section>

      <section className="section dark-band" aria-labelledby="dir-heading">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "center", gap: 32 }}>
            <div>
              <p className="eyebrow">State directory</p>
              <h2 id="dir-heading">All 50 states, honestly labeled</h2>
              <p style={{ opacity: 0.8 }}>
                We add states one at a time, only after verifying the official handbook. You can see exactly where every state stands.
              </p>
              <Link href="/dmv" className="btn btn-primary" style={{ marginTop: 8 }}>Browse the directory <Icon name="arrowRight" size={18} /></Link>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { n: counts.available, l: "Practice available" },
                { n: counts.hub, l: "Test guide ready" },
                { n: counts.review, l: "In verification" },
                { n: counts.soon, l: "Coming soon" },
              ].map((x) => (
                <div key={x.l} style={{ border: "1px solid rgb(255 255 255 / 0.14)", borderRadius: 16, padding: 18 }}>
                  <div className="tnum" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.4rem", lineHeight: 1 }}>{x.n}</div>
                  <div style={{ opacity: 0.75, fontSize: "0.9rem", marginTop: 6 }}>{x.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }} aria-labelledby="company-heading">
        <div className="container">
          <div className="company-band dark-band">
            <p className="eyebrow">A product by {COMPANY.name}</p>
            <h2 id="company-heading" style={{ maxWidth: "22ch" }}>
              Built by a team that builds <span className="text-grad">digital products.</span>
            </h2>
            <p className="lead" style={{ maxWidth: "62ch" }}>
              {SITE.name} is designed, built and maintained by {COMPANY.name} — a growth and technology partner that builds, markets and
              automates digital products. Have an idea for a tool like this? We build those too.
            </p>
            <div className="row">
              <a href={COMPANY.url} className="btn btn-light" target="_blank" rel="noopener noreferrer">
                Visit {COMPANY.name} <Icon name="arrowRight" size={18} />
              </a>
              <a href={`${COMPANY.url}/contact/`} className="btn" target="_blank" rel="noopener noreferrer">
                Start a project
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-heading">
        <div className="container container-narrow">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-heading">Questions, answered</h2>
          <Faq items={HOME_FAQ} />
          <div className="notice" style={{ marginTop: 24 }}>
            <Icon name="info" size={18} />
            <span>
              <strong>Disclaimer:</strong> {SITE.disclaimer} Practice questions are based on official driver handbooks and are not official DMV test questions.{" "}
              <Link href="/disclaimer">Read the full disclaimer</Link>.
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
