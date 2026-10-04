import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { availableSlugs, loadStateView } from "@/lib/state-view";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PracticeApp } from "@/components/quiz/PracticeApp";
import { Breadcrumbs, JsonLd, PracticeDisclaimer } from "@/components/Common";

export const dynamicParams = false;
export const generateStaticParams = () => availableSlugs();

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const v = await loadStateView(state);
  const n = v.summary.name;
  return pageMetadata({
    title: `${n} Permit Practice Test — Free Questions With Explanations`,
    description: `Free ${n} permit practice test: ${v.questions.length} questions written from the official ${n} driver handbook, with instant feedback, explanations and a source link on every answer.`,
    path: `/dmv/${state}/practice-test`,
  });
}

export default async function PracticePage({ params }: Props) {
  const { state } = await params;
  const v = await loadStateView(state);
  if (v.summary.status !== "available" || !v.content) notFound();
  const n = v.summary.name;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "DMV practice tests", path: "/dmv" },
          { name: n, path: `/dmv/${state}` },
          { name: "Practice test", path: `/dmv/${state}/practice-test` },
        ])}
      />
      <div className="container" style={{ paddingTop: 20 }}>
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "States", href: "/dmv" }, { name: n, href: `/dmv/${state}` }, { name: "Practice test" }]} />
      </div>
      <PracticeApp
        stateCode={v.summary.code}
        stateSlug={state}
        stateName={n}
        questions={v.questions}
        categories={v.content.categories}
        rule={v.practiceRule}
      />
      <div className="container" style={{ paddingBottom: 24 }}>
        <PracticeDisclaimer />
      </div>
    </>
  );
}
