import type { Question, SectionRequirement } from "../types";
import { categoryLabel } from "../categories";

export interface PassRule {
  /** Official number correct needed, when the test is the full official length. */
  passingCorrect: number | null;
  /** Official percent needed. */
  passingPercent: number | null;
  /** The official question count the passingCorrect refers to. */
  officialQuestionCount: number | null;
  sectionRequirements?: SectionRequirement[];
  /** When nothing official is known, results are judged against this readiness target instead. */
  readinessPercent?: number;
}

export interface TopicStat {
  category: string;
  label: string;
  correct: number;
  total: number;
  percent: number;
}

export interface SectionResult extends SectionRequirement {
  asked: number;
  correct: number;
  met: boolean;
}

export interface TestResult {
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  percent: number;
  requiredCorrect: number;
  passed: boolean;
  /** "official": scored against the state's published rule. "readiness": our own target. */
  basis: "official" | "readiness";
  scaled: boolean;
  sections: SectionResult[];
  topics: TopicStat[];
  weakTopics: TopicStat[];
  incorrectIds: string[];
}

export type Answers = Record<string, string | null | undefined>;

export function computeResult(questions: Question[], answers: Answers, rule: PassRule): TestResult {
  let correct = 0;
  let skipped = 0;
  const incorrectIds: string[] = [];
  const topicMap = new Map<string, { correct: number; total: number }>();

  for (const q of questions) {
    const a = answers[q.id];
    const ok = a === q.correctAnswer;
    if (a == null) skipped++;
    if (ok) correct++;
    else incorrectIds.push(q.id);
    const t = topicMap.get(q.category) ?? { correct: 0, total: 0 };
    t.total++;
    if (ok) t.correct++;
    topicMap.set(q.category, t);
  }

  const total = questions.length;
  const percent = total ? Math.round((correct / total) * 100) : 0;

  let basis: TestResult["basis"] = "official";
  let scaled = false;
  let requiredCorrect: number;
  if (rule.passingCorrect != null && rule.officialQuestionCount != null && total === rule.officialQuestionCount) {
    requiredCorrect = rule.passingCorrect;
  } else if (rule.passingPercent != null) {
    requiredCorrect = Math.ceil((total * rule.passingPercent) / 100);
    scaled = rule.officialQuestionCount != null && total !== rule.officialQuestionCount;
  } else if (rule.passingCorrect != null && rule.officialQuestionCount) {
    requiredCorrect = Math.ceil((total * rule.passingCorrect) / rule.officialQuestionCount);
    scaled = true;
  } else {
    basis = "readiness";
    requiredCorrect = Math.ceil((total * (rule.readinessPercent ?? 80)) / 100);
  }

  const sections: SectionResult[] = (rule.sectionRequirements ?? []).map((req) => {
    const qs = questions.filter((q) => q.tags?.includes(req.tag));
    const c = qs.filter((q) => answers[q.id] === q.correctAnswer).length;
    // If fewer section questions were asked than the official count, scale the minimum.
    const min = qs.length >= req.questionCount ? req.minCorrect : Math.ceil((qs.length * req.minCorrect) / req.questionCount);
    return { ...req, asked: qs.length, correct: c, met: c >= min };
  });

  const passed = total > 0 && correct >= requiredCorrect && sections.every((s) => s.met);

  const topics: TopicStat[] = [...topicMap.entries()]
    .map(([category, v]) => ({
      category,
      label: categoryLabel(category),
      correct: v.correct,
      total: v.total,
      percent: Math.round((v.correct / v.total) * 100),
    }))
    .sort((a, b) => a.percent - b.percent || b.total - a.total);

  const weakTopics = topics.filter((t) => t.percent < 80).slice(0, 3);

  return {
    total,
    correct,
    incorrect: total - correct,
    skipped,
    percent,
    requiredCorrect,
    passed,
    basis,
    scaled,
    sections,
    topics,
    weakTopics,
    incorrectIds,
  };
}

export function resultHeadline(percent: number): string {
  if (percent >= 95) return "Outstanding";
  if (percent >= 85) return "Excellent";
  if (percent >= 75) return "Good progress";
  if (percent >= 60) return "Getting there";
  return "Keep practicing";
}
