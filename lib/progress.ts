"use client";

import type { QuestionHistory } from "./engine/select";

/**
 * Browser-only progress store (localStorage). The shape mirrors what a future
 * `user_progress` table would hold, so syncing to Supabase later is a straight copy.
 */
const VERSION = "v1";
const key = (stateCode: string) => `gl:${VERSION}:progress:${stateCode}`;

export interface SessionRecord {
  kind: "practice" | "mock";
  mode: string;
  correct: number;
  total: number;
  at: number;
}

export interface StateProgress {
  history: QuestionHistory;
  /** category → running totals */
  topics: Record<string, { correct: number; total: number }>;
  sessions: SessionRecord[];
}

const empty = (): StateProgress => ({ history: {}, topics: {}, sessions: [] });

function safeGet(k: string): string | null {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string) {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    /* storage unavailable (private mode, quota) — progress just won't persist */
  }
}

export function loadProgress(stateCode: string): StateProgress {
  if (typeof window === "undefined") return empty();
  const raw = safeGet(key(stateCode));
  if (!raw) return empty();
  try {
    const p = JSON.parse(raw) as StateProgress;
    return { history: p.history ?? {}, topics: p.topics ?? {}, sessions: p.sessions ?? [] };
  } catch {
    return empty();
  }
}

function save(stateCode: string, p: StateProgress) {
  safeSet(key(stateCode), JSON.stringify(p));
}

export function recordAnswer(stateCode: string, questionId: string, category: string, correct: boolean) {
  const p = loadProgress(stateCode);
  const h = p.history[questionId] ?? { seen: 0, correct: 0, lastCorrect: false, lastAt: 0 };
  h.seen += 1;
  if (correct) h.correct += 1;
  h.lastCorrect = correct;
  h.lastAt = Date.now();
  p.history[questionId] = h;
  const t = p.topics[category] ?? { correct: 0, total: 0 };
  t.total += 1;
  if (correct) t.correct += 1;
  p.topics[category] = t;
  save(stateCode, p);
}

export function recordSession(stateCode: string, s: Omit<SessionRecord, "at">) {
  const p = loadProgress(stateCode);
  p.sessions = [{ ...s, at: Date.now() }, ...p.sessions].slice(0, 25);
  save(stateCode, p);
}

/** Categories ordered weakest-first (needs at least 2 attempts to count). */
export function weakCategories(p: StateProgress, limit = 3): string[] {
  return Object.entries(p.topics)
    .filter(([, v]) => v.total >= 2)
    .map(([c, v]) => ({ c, pct: v.correct / v.total }))
    .filter((x) => x.pct < 0.8)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, limit)
    .map((x) => x.c);
}

export function incorrectIds(p: StateProgress): string[] {
  return Object.entries(p.history)
    .filter(([, h]) => h.seen && !h.lastCorrect)
    .map(([id]) => id);
}

export function resetProgress(stateCode: string) {
  try {
    window.localStorage.removeItem(key(stateCode));
  } catch {
    /* ignore */
  }
}

export function rememberState(slug: string) {
  safeSet(`gl:${VERSION}:lastState`, slug);
}

export function lastState(): string | null {
  return typeof window === "undefined" ? null : safeGet(`gl:${VERSION}:lastState`);
}

/** Returns true when this browser has visited before (used for the "returning user" event). */
export function markVisit(): boolean {
  const k = `gl:${VERSION}:visits`;
  const n = Number(safeGet(k) ?? "0");
  safeSet(k, String(n + 1));
  return n > 0;
}
