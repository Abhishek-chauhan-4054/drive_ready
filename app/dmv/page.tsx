import Link from "next/link";
import { getContent } from "@/lib/repositories";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { StateDirectory } from "@/components/StateDirectory";
import { Breadcrumbs, JsonLd } from "@/components/Common";

export const metadata = pageMetadata({
  title: "DMV Practice Tests by State — All 50 States",
  description:
    "Find your state's DMV permit practice test. Every available state is built from its official driver handbook, with a source link on every question.",
  path: "/dmv",
});

export default async function DirectoryPage() {
  const states = await getContent().states.listStates();
  const live = states.filter((s) => s.status === "available" || s.status === "study-hub");
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "DMV practice tests", path: "/dmv" }])} />
      <section className="state-hero dark-band">
        <div className="container">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "DMV practice tests" }]} />
          <p className="eyebrow">State directory</p>
          <h1 style={{ fontSize: "clamp(2rem,4.5vw,3rem)" }}>DMV practice tests by state</h1>
          <p className="lead">
            Rules, passing scores and test formats differ by state. Choose yours. We only open a state after verifying its official handbook — every
            state below is labeled with exactly where it stands.
          </p>
        </div>
      </section>
      <section className="section-tight">
        <div className="container">
          <StateDirectory states={states} />

          {/* Crawlable plain-link index for available states */}
          <nav aria-label="Available practice tests" style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: "1.2rem" }}>DMV practice tests</h2>
            <ul style={{ columns: "2 220px", paddingLeft: "1.2em", margin: 0 }}>
              {live.map((s) => (
                <li key={s.code}>
                  <Link href={`/dmv/${s.slug}`}>{s.name} DMV practice test</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
}
