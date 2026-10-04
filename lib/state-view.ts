import "server-only";
import { notFound } from "next/navigation";
import { getContent } from "./repositories";
import { categoryGroup } from "./categories";
import type { MockPreset, Question, StateContent, StateSummary, TestType } from "./types";
import type { PassRule } from "./engine/score";

export interface StateView {
  summary: StateSummary;
  content: StateContent | null;
  primary: TestType | null;
  questions: Question[];
  presets: MockPreset[];
  signCount: number;
  hasRoadSignsPage: boolean;
  practiceRule: PassRule;
}

export const MIN_SIGN_QUESTIONS_FOR_PAGE = 5;

export async function loadStateView(slug: string): Promise<StateView> {
  const c = getContent();
  const summary = await c.states.getStateSummary(slug);
  if (!summary) notFound();
  const content = await c.states.getStateBySlug(slug);
  const primary = await c.tests.getPrimaryTestType(slug);
  const questions = content && primary?.available ? await c.questions.getQuestions(content.stateCode, { licenseType: primary.id }) : [];
  const presets = primary ? await c.tests.getMockPresets(slug, primary.id) : [];
  const signCount = questions.filter((q) => categoryGroup(q.category) === "signs").length;
  const r = primary?.testRules;
  return {
    summary,
    content,
    primary,
    questions,
    presets,
    signCount,
    hasRoadSignsPage: summary.status === "available" && signCount >= MIN_SIGN_QUESTIONS_FOR_PAGE,
    practiceRule: {
      passingCorrect: null,
      passingPercent: r?.officialPassingPercent ?? (r?.officialPassingCorrect && r.officialQuestionCount ? Math.round((r.officialPassingCorrect / r.officialQuestionCount) * 100) : null),
      officialQuestionCount: null,
      readinessPercent: 80,
    },
  };
}

export async function availableSlugs(filter?: (v: StateView) => boolean): Promise<{ state: string }[]> {
  const states = await getContent().states.listStates();
  const out: { state: string }[] = [];
  for (const s of states) {
    if (s.status !== "available") continue;
    if (filter && !filter(await loadStateView(s.slug))) continue;
    out.push({ state: s.slug });
  }
  return out;
}

export function groupQuestions(questions: Question[]) {
  const groups: Record<"signs" | "laws" | "safety", Question[]> = { signs: [], laws: [], safety: [] };
  for (const q of questions) {
    const g = categoryGroup(q.category);
    if (g) groups[g].push(q);
  }
  return groups;
}

/** Human summary of the official test format, using only verified fields. */
export function formatFacts(t: TestType | null) {
  const r = t?.testRules;
  if (!r) return [];
  const facts: { k: string; v: string }[] = [];
  if (r.officialQuestionCount != null) facts.push({ k: "Questions", v: String(r.officialQuestionCount) });
  if (r.officialPassingCorrect != null) facts.push({ k: "Correct to pass", v: String(r.officialPassingCorrect) });
  if (r.officialPassingPercent != null) facts.push({ k: "Passing score", v: `${r.officialPassingPercent}%` });
  else if (r.officialPassingCorrect != null && r.officialQuestionCount) facts.push({ k: "Passing score", v: `${Math.round((r.officialPassingCorrect / r.officialQuestionCount) * 100)}%` });
  return facts;
}
