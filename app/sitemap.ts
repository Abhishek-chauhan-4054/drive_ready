import type { MetadataRoute } from "next";
import { getContent } from "@/lib/repositories";
import { loadStateView } from "@/lib/state-view";
import { absoluteUrl } from "@/lib/site";

/** Only published, useful pages: available states (+ their practice pages) and test-guide states. "Coming soon" pages are excluded. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const states = await getContent().states.listStates();
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/dmv"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/disclaimer"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.2 },
  ];
  for (const s of states) {
    if (s.status !== "available" && s.status !== "study-hub") continue;
    const v = await loadStateView(s.slug);
    const lastModified = v.content?.lastReviewed ? new Date(v.content.lastReviewed) : undefined;
    entries.push({ url: absoluteUrl(`/dmv/${s.slug}`), lastModified, changeFrequency: "weekly", priority: 0.9 });
    if (s.status === "available") {
      entries.push({ url: absoluteUrl(`/dmv/${s.slug}/practice-test`), lastModified, changeFrequency: "weekly", priority: 0.8 });
      if (v.presets.length) entries.push({ url: absoluteUrl(`/dmv/${s.slug}/mock-test`), lastModified, changeFrequency: "weekly", priority: 0.7 });
      if (v.hasRoadSignsPage) entries.push({ url: absoluteUrl(`/dmv/${s.slug}/road-signs`), lastModified, changeFrequency: "weekly", priority: 0.7 });
    }
  }
  return entries;
}
