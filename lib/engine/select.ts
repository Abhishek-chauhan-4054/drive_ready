import type { Difficulty, Question, SectionRequirement } from "../types";
import { categoryGroup } from "../categories";
import { defaultRng, shuffle, type Rng } from "./random";

/** Per-question history the engine can use. Supplied by the progress store (or, later, a user account). */
export interface QuestionHistory {
  [questionId: string]: { seen: number; correct: number; lastCorrect: boolean; lastAt: number };
}

export interface PoolFilter {
  categories?: string[];
  groups?: Array<"signs" | "laws" | "safety">;
  difficulties?: Difficulty[];
  includeTags?: string[];
  excludeTags?: string[];
  ids?: string[];
  /** "unseen": never answered · "incorrect": last answer was wrong · "answered": seen at least once */
  history?: "unseen" | "incorrect" | "answered";
}

export function filterPool(pool: Question[], filter: PoolFilter = {}, history: QuestionHistory = {}): Question[] {
  const ids = filter.ids ? new Set(filter.ids) : null;
  return pool.filter((q) => {
    if (ids && !ids.has(q.id)) return false;
    if (filter.categories?.length && !filter.categories.includes(q.category)) return false;
    if (filter.groups?.length) {
      const g = categoryGroup(q.category);
      if (!g || !filter.groups.includes(g)) return false;
    }
    if (filter.difficulties?.length && !filter.difficulties.includes(q.difficulty)) return false;
    if (filter.includeTags?.length && !filter.includeTags.some((t) => q.tags?.includes(t))) return false;
    if (filter.excludeTags?.length && filter.excludeTags.some((t) => q.tags?.includes(t))) return false;
    const h = history[q.id];
    if (filter.history === "unseen" && h?.seen) return false;
    if (filter.history === "incorrect" && !(h && h.seen && !h.lastCorrect)) return false;
    if (filter.history === "answered" && !h?.seen) return false;
    return true;
  });
}

export interface SelectOptions {
  count: number;
  rng?: Rng;
  /** Spread questions across categories (round-robin) instead of pure random. */
  balanceTopics?: boolean;
  /** Pick unseen questions before ones already answered. */
  preferUnseen?: boolean;
  history?: QuestionHistory;
  /** Guarantee a number of questions carrying a tag (e.g. NY's 4 road-sign questions). */
  sectionRequirements?: SectionRequirement[];
}

function orderBucket(qs: Question[], rng: Rng, preferUnseen: boolean, history: QuestionHistory): Question[] {
  const shuffled = shuffle(qs, rng);
  if (!preferUnseen) return shuffled;
  const unseen = shuffled.filter((q) => !history[q.id]?.seen);
  const seen = shuffled.filter((q) => history[q.id]?.seen);
  return [...unseen, ...seen];
}

function balanced(pool: Question[], count: number, rng: Rng, preferUnseen: boolean, history: QuestionHistory): Question[] {
  const buckets = new Map<string, Question[]>();
  for (const q of pool) {
    const arr = buckets.get(q.category) ?? [];
    arr.push(q);
    buckets.set(q.category, arr);
  }
  const queues = shuffle([...buckets.values()], rng).map((b) => orderBucket(b, rng, preferUnseen, history));
  const out: Question[] = [];
  while (out.length < count && queues.some((q) => q.length)) {
    for (const q of queues) {
      if (out.length >= count) break;
      const next = q.shift();
      if (next) out.push(next);
    }
  }
  return out;
}

/**
 * Core selection pipeline:
 *   pool → required sections → topic-balanced fill → shuffled order.
 * Returns at most `count` questions (fewer if the pool is smaller).
 */
export function selectQuestions(pool: Question[], opts: SelectOptions): Question[] {
  const rng = opts.rng ?? defaultRng;
  const history = opts.history ?? {};
  const preferUnseen = Boolean(opts.preferUnseen);
  const picked: Question[] = [];
  const used = new Set<string>();

  for (const req of opts.sectionRequirements ?? []) {
    const candidates = orderBucket(
      pool.filter((q) => q.tags?.includes(req.tag) && !used.has(q.id)),
      rng,
      preferUnseen,
      history,
    ).slice(0, req.questionCount);
    for (const q of candidates) {
      picked.push(q);
      used.add(q.id);
    }
  }

  const rest = pool.filter((q) => !used.has(q.id) && !(opts.sectionRequirements ?? []).some((r) => q.tags?.includes(r.tag)));
  const remaining = Math.max(0, opts.count - picked.length);
  const fill = opts.balanceTopics
    ? balanced(rest, remaining, rng, preferUnseen, history)
    : orderBucket(rest, rng, preferUnseen, history).slice(0, remaining);

  return shuffle([...picked, ...fill], rng);
}

const ORDER_SENSITIVE = /\b(all|none|both) of the above\b|\bboth [a-d] and [a-d]\b/i;

/** Randomizes answer order unless the wording makes order meaningful. */
export function prepareQuestion(q: Question, rng: Rng = defaultRng): Question {
  if (q.lockOptionOrder || q.options.some((o) => ORDER_SENSITIVE.test(o))) return q;
  return { ...q, options: shuffle(q.options, rng) };
}
