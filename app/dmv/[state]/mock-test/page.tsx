import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { availableSlugs, loadStateView } from "@/lib/state-view";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { MockApp } from "@/components/quiz/MockApp";
import { Breadcrumbs, JsonLd, PracticeDisclaimer } from "@/components/Common";

export const dynamicParams = false;
export const generateStaticParams = () => availableSlugs((v) => v.presets.length > 0);

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const v = await loadStateView(state);
  const n = v.summary.name;
  const official = v.presets.find((p) => p.isOfficialFormat);
  return pageMetadata({
    title: `${n} DMV Mock Test — Simulate the Knowledge Test`,
    description: official
      ? `Take a ${n} mock knowledge test in the official format (${official.questionCount} questions${official.passingCorrect ? `, ${official.passingCorrect} correct to pass` : ""}) and get a full breakdown by topic.`
      : `Take a full ${n} mock knowledge test, scored at the end with a topic-by-topic breakdown and mistake review.`,
    path: `/dmv/${state}/mock-test`,
  });
}

export default async function MockPage({ params }: Props) {
  const { state } = await params;
  const v = await loadStateView(state);
  if (v.summary.status !== "available" || !v.primary?.testRules || !v.presets.length) notFound();
  const n = v.summary.name;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "DMV practice tests", path: "/dmv" },
          { name: n, path: `/dmv/${state}` },
          { name: "Mock test", path: `/dmv/${state}/mock-test` },
        ])}
      />
      <div className="container" style={{ paddingTop: 20 }}>
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "States", href: "/dmv" }, { name: n, href: `/dmv/${state}` }, { name: "Mock test" }]} />
      </div>
      <MockApp
        stateCode={v.summary.code}
        stateSlug={state}
        stateName={n}
        questions={v.questions}
        presets={v.presets}
        rules={v.primary.testRules}
      />
      <div className="container" style={{ paddingBottom: 24 }}>
        <PracticeDisclaimer />
      </div>
    </>
  );
}
