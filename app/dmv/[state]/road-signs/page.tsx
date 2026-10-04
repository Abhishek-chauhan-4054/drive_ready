import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { availableSlugs, loadStateView, groupQuestions } from "@/lib/state-view";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs, JsonLd, PracticeDisclaimer } from "@/components/Common";
import { Icon } from "@/components/Icon";

export const dynamicParams = false;
export const generateStaticParams = () => availableSlugs((v) => v.hasRoadSignsPage);

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const v = await loadStateView(state);
  const n = v.summary.name;
  return pageMetadata({
    title: `${n} Road Signs Practice Test — Signs, Signals & Markings`,
    description: `Learn the ${n} road signs, traffic signals and pavement markings from the official handbook, then practice ${v.signCount} road-sign questions with instant feedback.`,
    path: `/dmv/${state}/road-signs`,
  });
}

export default async function RoadSignsPage({ params }: Props) {
  const { state } = await params;
  const v = await loadStateView(state);
  if (!v.hasRoadSignsPage || !v.content) notFound();
  const n = v.summary.name;
  const signs = groupQuestions(v.questions).signs;
  const roadSigns = signs.filter((q) => q.tags?.includes("road-sign"));
  const signals = signs.filter((q) => !q.tags?.includes("road-sign"));
  const signsTest = v.presets.find((p) => p.includeTags?.includes("road-sign"));
  const section = v.primary?.testRules?.sectionRequirements.find((s) => s.tag === "road-sign");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "DMV practice tests", path: "/dmv" },
          { name: n, path: `/dmv/${state}` },
          { name: "Road signs", path: `/dmv/${state}/road-signs` },
        ])}
      />
      <section className="state-hero dark-band">
        <div className="container container-narrow">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "States", href: "/dmv" }, { name: n, href: `/dmv/${state}` }, { name: "Road signs" }]} />
          <p className="eyebrow"><Icon name="sign" size={16} /> {n} road signs</p>
          <h1 style={{ fontSize: "clamp(2rem,4.5vw,3rem)" }}>{n} road signs & signals</h1>
          <p className="lead">
            What every sign shape, color, signal and pavement marking means — straight from the official {v.content.agencyShortName} handbook.
          </p>
          {(signsTest || section) && (
            <div className="notice notice-info" style={{ marginTop: 16 }}>
              <Icon name="info" size={18} />
              <span>
                {signsTest
                  ? `${n} has a separate signs test: ${signsTest.questionCount} questions, ${signsTest.passingCorrect} correct to pass.`
                  : `The ${n} written test includes ${section!.questionCount} road sign questions — you must get at least ${section!.minCorrect} right to pass.`}
              </span>
            </div>
          )}
          <div className="row" style={{ marginTop: 20 }}>
            <Link href={`/dmv/${state}/practice-test?mode=signs`} className="btn btn-primary">
              Practice road signs <Icon name="arrowRight" size={18} />
            </Link>
            {signsTest && <Link href={`/dmv/${state}/mock-test`} className="btn">Take the signs mock test</Link>}
          </div>
        </div>
      </section>

      <div className="container container-narrow section-tight">
        {[
          { title: "Sign shapes & colors", items: roadSigns },
          { title: "Signals & pavement markings", items: signals },
        ].map((block) =>
          block.items.length ? (
            <section key={block.title} style={{ marginBottom: 36 }}>
              <h2>{block.title}</h2>
              <ul className="factlist">
                {block.items.map((q) => (
                  <li key={q.id}>
                    <strong style={{ display: "block", marginBottom: 4 }}>{q.question}</strong>
                    {q.explanation}
                    <span className="src">
                      <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer">{q.sourceTitle} — {q.sourceSection}</a>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null,
        )}
        <PracticeDisclaimer />
      </div>
    </>
  );
}
