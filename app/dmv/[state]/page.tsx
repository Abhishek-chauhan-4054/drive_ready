import Link from "next/link";
import type { Metadata } from "next";
import { getContent } from "@/lib/repositories";
import { loadStateView, groupQuestions, formatFacts } from "@/lib/state-view";
import { pageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { categoryLabel, groupLabel } from "@/lib/categories";
import { Breadcrumbs, ExternalLink, Faq, JsonLd, PracticeDisclaimer, StatusBadge, StateCard } from "@/components/Common";
import { Icon, type IconName } from "@/components/Icon";
import { TrackStateView } from "@/components/ClientBoot";
import type { Question, ResourceKind } from "@/lib/types";

export const dynamicParams = false;

export async function generateStaticParams() {
  const states = await getContent().states.listStates();
  return states.map((s) => ({ state: s.slug }));
}

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const v = await loadStateView(state);
  const name = v.summary.name;
  const path = `/dmv/${state}`;
  if (v.summary.status === "available") {
    return pageMetadata({
      title: `${name} DMV Practice Test — Free ${name} Permit Test`,
      description: `Practice ${name} DMV knowledge test questions based on official ${name} driver resources. ${v.questions.length} verified questions with explanations, a mock test, and a source link on every answer.`,
      path,
    });
  }
  if (v.summary.status === "study-hub") {
    return pageMetadata({
      title: `${name} Permit Test Guide — Questions, Passing Score & Official Resources`,
      description: `How the ${name} knowledge test works, verified from official ${v.content?.agencyShortName ?? name} sources, with direct links to the official handbook. Practice questions coming soon.`,
      path,
    });
  }
  return pageMetadata({
    title: `${name} DMV Practice Test — Coming Soon`,
    description: `${name} permit test practice is coming to DriveReady once the official handbook is verified.`,
    path,
    noindex: true,
  });
}

const RES_ICON: Record<ResourceKind, IconName> = { agency: "globe", handbook: "book", "sample-test": "clipboard", licensing: "id" };
const RES_LABEL: Record<ResourceKind, string> = { agency: "Official agency", handbook: "Driver handbook", "sample-test": "Official practice test", licensing: "Licensing information" };

function FactList({ items }: { items: Question[] }) {
  return (
    <ul className="factlist">
      {items.map((q) => (
        <li key={q.id}>
          {q.explanation}
          <span className="src">
            {categoryLabel(q.category)} · <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer">{q.sourceSection}</a>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function StatePage({ params }: Props) {
  const { state } = await params;
  const v = await loadStateView(state);
  const { summary, content, primary, questions } = v;
  const name = summary.name;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "DMV practice tests", path: "/dmv" },
    { name: `${name}`, path: `/dmv/${state}` },
  ];

  // ---------------------------------------------------------------- not yet available
  if (summary.status === "in-review" || summary.status === "coming-soon") {
    const others = (await getContent().states.listStates()).filter((s) => s.status === "available").slice(0, 3);
    return (
      <>
        <section className="state-hero dark-band">
          <div className="container container-narrow">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "DMV practice tests", href: "/dmv" }, { name }]} />
            <div className="row" style={{ marginBottom: 12 }}>
              <span className="plate">{summary.code}</span>
              <StatusBadge status={summary.status} />
            </div>
            <h1 style={{ fontSize: "clamp(2rem,4.5vw,3rem)" }}>{name} DMV practice test — coming soon</h1>
            <p className="lead">
              {summary.status === "in-review"
                ? `${name} is on our launch list. We're verifying the official ${name} driver handbook now, and we won't publish questions, passing scores or test rules until every fact is confirmed against it.`
                : `${name} is on our roadmap. We only open a state after verifying its official driver handbook, so we won't show ${name} rules we haven't confirmed.`}
            </p>
            {summary.agency && (
              <div className="notice" style={{ marginTop: 20 }}>
                <Icon name="globe" size={18} />
                <span>
                  Until then, study from the official source: <ExternalLink href={summary.agency.url}>{summary.agency.name}</ExternalLink>.
                </span>
              </div>
            )}
            <div className="row" style={{ marginTop: 24 }}>
              <Link href="/dmv" className="btn btn-dark">Browse all states</Link>
            </div>
          </div>
        </section>
        {others.length > 0 && (
          <section className="section-tight">
            <div className="container container-narrow">
              <h2 style={{ fontSize: "1.3rem" }}>Available now</h2>
              <div className="grid grid-3">{others.map((s) => <StateCard key={s.code} s={s} />)}</div>
            </div>
          </section>
        )}
      </>
    );
  }

  if (!content) return null;
  const facts = formatFacts(primary);
  const rules = primary?.testRules;
  const groups = groupQuestions(questions);
  const isLive = summary.status === "available";
  const handbook = content.resources.find((r) => r.kind === "handbook");

  return (
    <>
      <TrackStateView code={summary.code} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {content.faq.length > 0 && <JsonLd data={faqJsonLd(content.faq)} />}

      <section className="state-hero dark-band">
        <div className="container">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "DMV practice tests", href: "/dmv" }, { name }]} />
          <div className="row" style={{ marginBottom: 12 }}>
            <span className="plate">{summary.code}</span>
            <StatusBadge status={summary.status} />
            <span className="small muted">Last reviewed {content.lastReviewed}</span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.3rem)" }}>{isLive ? `${name} DMV Practice Test` : `${name} Permit Test Guide`}</h1>
          <p className="lead">{content.intro}</p>

          {(facts.length > 0 || isLive) && (
            <div className="facts">
              {facts.map((f) => (
                <div className="fact" key={f.k}>
                  <div className="k">{f.k}</div>
                  <div className="v tnum">{f.v}</div>
                </div>
              ))}
              {isLive && (
                <div className="fact">
                  <div className="k">Verified practice questions</div>
                  <div className="v tnum">{questions.length}</div>
                </div>
              )}
            </div>
          )}
          {rules?.source && (
            <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
              Test format source: <ExternalLink href={rules.source.url}>{rules.source.title}{rules.source.section ? ` — ${rules.source.section}` : ""}</ExternalLink>
            </p>
          )}

          {isLive ? (
            <div className="action-tiles" style={{ marginTop: 28 }}>
              <Link href={`/dmv/${state}/practice-test`} className="tile tile-primary">
                <Icon name="zap" size={22} />
                <span className="t">Practice test</span>
                <span className="d">Instant feedback & explanations</span>
              </Link>
              <Link href={`/dmv/${state}/mock-test`} className="tile">
                <Icon name="clock" size={22} />
                <span className="t">Mock test</span>
                <span className="d">{v.presets[0]?.isOfficialFormat ? "Official test format" : "Full review, scored at the end"}</span>
              </Link>
              {v.hasRoadSignsPage && (
                <Link href={`/dmv/${state}/road-signs`} className="tile">
                  <Icon name="sign" size={22} />
                  <span className="t">Road signs</span>
                  <span className="d">{v.signCount} sign & signal questions</span>
                </Link>
              )}
              <a href="#study-guide" className="tile">
                <Icon name="book" size={22} />
                <span className="t">Study guide</span>
                <span className="d">Key facts with sources</span>
              </a>
            </div>
          ) : (
            <div className="notice notice-info" style={{ marginTop: 24 }}>
              <Icon name="info" size={18} />
              <span>
                We&rsquo;ve verified how the {name} test works from official sources. Our {name} practice questions are still being verified against the
                official handbook — they&rsquo;ll appear here as soon as they pass review. {handbook && <>Meanwhile, study the <ExternalLink href={handbook.url}>official handbook</ExternalLink>.</>}
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="container">
        <nav className="toc" aria-label="On this page">
          {isLive && <a href="#study-guide">Study guide</a>}
          {groups.signs.length > 0 && <a href="#road-signs">Road signs</a>}
          {groups.laws.length > 0 && <a href="#traffic-laws">Traffic laws</a>}
          {groups.safety.length > 0 && <a href="#safe-driving">Safe driving</a>}
          {content.commonMistakes.length > 0 && <a href="#common-mistakes">Common mistakes</a>}
          {primary && <a href="#test-types">Test types</a>}
          {content.faq.length > 0 && <a href="#faq">FAQ</a>}
          <a href="#official-resources">Official resources</a>
        </nav>
      </div>

      <div className="container section-tight">
        <div className="layout-side">
          <div className="stack" style={{ minWidth: 0 }}>
            {isLive && (
              <section id="study-guide" className="anchor">
                <h2>{name} study guide</h2>
                <p className="muted">
                  Key facts from the official {content.agencyShortName} handbook, organized the way the test asks about them. Each one links to its source
                  section.
                </p>
                <div className="grid grid-3" style={{ marginTop: 16 }}>
                  {(["signs", "laws", "safety"] as const).map((g) =>
                    groups[g].length ? (
                      <a key={g} href={`#${g === "signs" ? "road-signs" : g === "laws" ? "traffic-laws" : "safe-driving"}`} className="tile">
                        <span className="t">{groupLabel(g)}</span>
                        <span className="d">{groups[g].length} key facts</span>
                      </a>
                    ) : null,
                  )}
                </div>
              </section>
            )}

            {groups.signs.length > 0 && (
              <section id="road-signs" className="anchor" style={{ marginTop: 40 }}>
                <h2>Road signs, signals & markings</h2>
                <FactList items={groups.signs} />
                <div className="row" style={{ marginTop: 14 }}>
                  <Link href={`/dmv/${state}/practice-test?mode=signs`} className="btn btn-sm btn-primary">Practice road signs</Link>
                  {v.hasRoadSignsPage && <Link href={`/dmv/${state}/road-signs`} className="btn btn-sm">{name} road signs guide</Link>}
                </div>
              </section>
            )}

            {groups.laws.length > 0 && (
              <section id="traffic-laws" className="anchor" style={{ marginTop: 40 }}>
                <h2>Traffic laws & licensing</h2>
                <FactList items={groups.laws} />
                <Link href={`/dmv/${state}/practice-test?mode=laws`} className="btn btn-sm btn-primary" style={{ marginTop: 14 }}>Practice traffic laws</Link>
              </section>
            )}

            {groups.safety.length > 0 && (
              <section id="safe-driving" className="anchor" style={{ marginTop: 40 }}>
                <h2>Safe driving</h2>
                <FactList items={groups.safety} />
                <Link href={`/dmv/${state}/practice-test?mode=safety`} className="btn btn-sm btn-primary" style={{ marginTop: 14 }}>Practice safe driving</Link>
              </section>
            )}

            {content.commonMistakes.length > 0 && (
              <section id="common-mistakes" className="anchor" style={{ marginTop: 40 }}>
                <h2>Common mistakes</h2>
                <ul className="factlist">
                  {content.commonMistakes.map((m, i) => (
                    <li key={i} className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
                      <Icon name="alert" size={18} style={{ color: "var(--caution)", marginTop: 3, flex: "none" }} />
                      <span>
                        {m.text}
                        <span className="src">
                          <a href={m.sourceUrl} target="_blank" rel="noopener noreferrer">{m.sourceSection ?? "Official source"}</a>
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {primary && (
              <section id="test-types" className="anchor" style={{ marginTop: 40 }}>
                <h2>Test types</h2>
                <div className="grid grid-2">
                  {content.testTypes.map((t) => (
                    <div key={t.id} className="card">
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <h3 style={{ margin: 0 }}>{t.name}</h3>
                        <span className={`badge ${t.available ? "badge-available" : "badge-coming-soon"}`}>{t.available ? "Practice available" : "Coming soon"}</span>
                      </div>
                      <p className="muted small" style={{ margin: "8px 0 0" }}>{t.description}</p>
                      {t.testRules?.notes?.length ? (
                        <ul className="small" style={{ margin: "10px 0 0", paddingLeft: "1.1em" }}>
                          {t.testRules.notes.map((n, i) => <li key={i}>{n}</li>)}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {content.faq.length > 0 && (
              <section id="faq" className="anchor" style={{ marginTop: 40 }}>
                <h2>{name} permit test FAQ</h2>
                <Faq items={content.faq} />
              </section>
            )}
          </div>

          <aside className="sticky-side stack" aria-label="Official resources">
            <section id="official-resources" className="anchor card resources">
              <h2 style={{ fontSize: "1.15rem" }}>Official {name} resources</h2>
              <div className="stack" style={{ marginTop: 12 }}>
                {content.resources.map((r) => (
                  <a key={r.url} className="res" href={r.url} target="_blank" rel="noopener noreferrer">
                    <span className="ico"><Icon name={RES_ICON[r.kind]} size={18} /></span>
                    <span style={{ minWidth: 0 }}>
                      <span className="kind">{RES_LABEL[r.kind]}</span>
                      <span style={{ display: "block", fontWeight: 600, fontSize: "0.92rem", lineHeight: 1.35 }}>{r.title}</span>
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ))}
              </div>
            </section>
            <PracticeDisclaimer />
            {isLive && (
              <Link href={`/dmv/${state}/practice-test`} className="btn btn-primary btn-block">
                Start {name} practice <Icon name="arrowRight" size={18} />
              </Link>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
