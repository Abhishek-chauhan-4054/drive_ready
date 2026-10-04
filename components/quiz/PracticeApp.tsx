"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Difficulty, Question } from "@/lib/types";
import { PRACTICE_MODES, modeById, type PracticeModeDef, type PracticeModeId } from "@/lib/engine/modes";
import { filterPool, prepareQuestion, selectQuestions, type PoolFilter } from "@/lib/engine/select";
import type { PassRule } from "@/lib/engine/score";
import { categoryLabel } from "@/lib/categories";
import { incorrectIds, loadProgress, rememberState, weakCategories, resetProgress, type StateProgress } from "@/lib/progress";
import { track } from "@/lib/analytics";
import { Icon, type IconName } from "../Icon";
import { QuizRunner } from "./QuizRunner";

const MODE_ICONS: Record<PracticeModeId, IconName> = {
  quick: "zap",
  random: "shuffle",
  topic: "layers",
  signs: "sign",
  laws: "scale",
  safety: "heart",
  weak: "trendDown",
  mistakes: "clipboard",
  unseen: "sparkle",
};

interface Session {
  key: number;
  modeId: string;
  label: string;
  questions: Question[];
}

export function PracticeApp({
  stateCode,
  stateSlug,
  stateName,
  questions,
  categories,
  rule,
}: {
  stateCode: string;
  stateSlug: string;
  stateName: string;
  questions: Question[];
  categories: string[];
  rule: PassRule;
}) {
  const [progress, setProgress] = useState<StateProgress | null>(null);
  const [topic, setTopic] = useState<string>(categories[0] ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [session, setSession] = useState<Session | null>(null);
  const [lastRequest, setLastRequest] = useState<{ mode: PracticeModeDef; filter: PoolFilter; label: string } | null>(null);

  const refresh = useCallback(() => setProgress(loadProgress(stateCode)), [stateCode]);
  useEffect(() => {
    refresh();
    rememberState(stateSlug);
  }, [refresh, stateSlug]);

  const history = progress?.history ?? {};
  const mistakes = useMemo(() => (progress ? incorrectIds(progress) : []), [progress]);
  const weak = useMemo(() => (progress ? weakCategories(progress) : []), [progress]);
  const answeredIds = Object.keys(history);
  const unseenCount = questions.filter((q) => !history[q.id]?.seen).length;

  const start = useCallback(
    (mode: PracticeModeDef, extra: PoolFilter = {}, labelOverride?: string) => {
      const filter: PoolFilter = { ...mode.filter, ...extra };
      if (difficulty !== "all" && (mode.id === "quick" || mode.id === "random" || mode.id === "topic")) filter.difficulties = [difficulty];
      const pool = filterPool(questions, filter, history);
      const picked = selectQuestions(pool, {
        count: mode.count,
        balanceTopics: mode.balanceTopics,
        preferUnseen: mode.preferUnseen,
        history,
      }).map((q) => prepareQuestion(q));
      if (!picked.length) return;
      const label = labelOverride ?? mode.label;
      setLastRequest({ mode, filter: extra, label });
      setSession({ key: Date.now(), modeId: mode.id, label, questions: picked });
      track("practice_started", { state: stateCode, mode: mode.id, count: picked.length });
      if (mode.id === "signs") track("road_sign_practice", { state: stateCode });
      window.scrollTo({ top: 0 });
    },
    [difficulty, history, questions, stateCode],
  );

  const startMode = (id: PracticeModeId) => {
    const mode = modeById(id)!;
    if (id === "topic") return start(mode, { categories: [topic] }, `Topic: ${categoryLabel(topic)}`);
    if (id === "weak") return start(mode, { categories: weak.length ? weak : undefined });
    if (id === "mistakes") return start(mode, { ids: mistakes, history: undefined });
    return start(mode);
  };

  // Deep links from results pages: ?mode=topic&topic=parking  or  ?mode=weak&cats=a,b
  useEffect(() => {
    if (!progress || session) return;
    const params = new URLSearchParams(window.location.search);
    const m = params.get("mode");
    if (!m) return;
    const mode = modeById(m);
    if (!mode) return;
    const cats = (params.get("cats") ?? params.get("topic") ?? "").split(",").filter((c) => categories.includes(c));
    window.history.replaceState(null, "", window.location.pathname);
    if (cats.length) start({ ...modeById("topic")! }, { categories: cats }, cats.length === 1 ? `Topic: ${categoryLabel(cats[0])}` : "Weak topics");
    else if (m !== "topic") startMode(m as PracticeModeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  if (session) {
    return (
      <QuizRunner
        key={session.key}
        stateCode={stateCode}
        stateSlug={stateSlug}
        questions={session.questions}
        kind="practice"
        modeId={session.modeId}
        modeLabel={session.label}
        rule={rule}
        onExit={() => {
          setSession(null);
          refresh();
        }}
        onRestart={() => {
          refresh();
          if (lastRequest) start(lastRequest.mode, lastRequest.filter, lastRequest.label);
        }}
        onPracticeTopics={(cats) => {
          refresh();
          start({ ...modeById("topic")! }, { categories: cats }, cats.length === 1 ? `Topic: ${categoryLabel(cats[0])}` : "Weak topics");
        }}
        onReviewMistakes={(ids) => {
          refresh();
          start({ ...modeById("mistakes")! }, { ids, history: undefined }, "Review mistakes");
        }}
      />
    );
  }

  const countFor = (m: PracticeModeDef): { n: number; disabled: boolean; note: string } => {
    if (m.id === "mistakes") return { n: mistakes.length, disabled: mistakes.length === 0, note: mistakes.length ? `${mistakes.length} to review` : "No mistakes yet" };
    if (m.id === "weak") {
      if (!weak.length) return { n: 0, disabled: true, note: answeredIds.length ? "No weak topics yet — nice!" : "Answer a few questions first" };
      return { n: 0, disabled: false, note: weak.map(categoryLabel).join(", ") };
    }
    if (m.id === "unseen") return { n: unseenCount, disabled: unseenCount === 0, note: `${unseenCount} not yet seen` };
    const pool = filterPool(questions, m.filter, history);
    return { n: pool.length, disabled: pool.length === 0, note: m.id === "topic" ? "Choose a topic below" : `${Math.min(m.count, pool.length)} questions` };
  };

  const answered = progress ? Object.values(progress.history).filter((h) => h.seen).length : 0;
  const accuracy = progress
    ? (() => {
        const t = Object.values(progress.topics).reduce((a, v) => ({ c: a.c + v.correct, n: a.n + v.total }), { c: 0, n: 0 });
        return t.n ? Math.round((t.c / t.n) * 100) : null;
      })()
    : null;

  return (
    <div className="container section-tight">
      <div
        className="row dark-band"
        style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, borderRadius: "var(--radius-lg)", padding: "clamp(24px,4vw,40px)" }}
      >
        <div>
          <p className="eyebrow">{stateName} · {questions.length} verified questions</p>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", marginBottom: 6 }}>
            Choose how you want to <span className="text-grad">practice</span>
          </h1>
          <p style={{ margin: 0 }}>Instant feedback, a plain-English explanation, and the official source after every answer.</p>
        </div>
        {answered > 0 && (
          <div className="row small muted" aria-label="Your progress on this device">
            <span><strong className="tnum" style={{ color: "#fff" }}>{answered}</strong>/{questions.length} answered</span>
            {accuracy != null && <span>· <strong className="tnum" style={{ color: "#fff" }}>{accuracy}%</strong> accuracy</span>}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (window.confirm(`Reset your ${stateName} progress on this device?`)) {
                  resetProgress(stateCode);
                  refresh();
                }
              }}
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div className="filter-bar" role="group" aria-label="Difficulty (Quick, Random and Topic practice)">
        <span className="small muted" style={{ marginRight: 4 }}>Difficulty:</span>
        {(["all", "easy", "medium", "hard"] as const).map((d) => (
          <button key={d} type="button" className="chip" aria-pressed={difficulty === d} onClick={() => setDifficulty(d)} style={{ textTransform: "capitalize" }}>
            {d}
          </button>
        ))}
      </div>

      <div className="modes">
        {PRACTICE_MODES.map((m) => {
          const c = countFor(m);
          return (
            <button key={m.id} type="button" className="mode" disabled={c.disabled} onClick={() => startMode(m.id)}>
              <span className="t">
                <Icon name={MODE_ICONS[m.id]} size={20} /> {m.label}
              </span>
              <span className="d">{m.blurb}</span>
              <span className="n">{c.note}</span>
            </button>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <label htmlFor="topic-select" className="eyebrow" style={{ display: "block", marginBottom: 10 }}>
          Topic practice
        </label>
        <div className="row">
          <select
            id="topic-select"
            className="search"
            style={{ flex: "1 1 240px", borderRadius: 12 }}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c)} ({questions.filter((q) => q.category === c).length})
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-primary" onClick={() => startMode("topic")}>
            Start topic <Icon name="arrowRight" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
