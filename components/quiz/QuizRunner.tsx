"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Question } from "@/lib/types";
import { categoryLabel } from "@/lib/categories";
import { computeResult, type PassRule, type TestResult } from "@/lib/engine/score";
import { recordAnswer, recordSession } from "@/lib/progress";
import { track } from "@/lib/analytics";
import { Icon } from "../Icon";
import { ResultView } from "./ResultView";

export interface QuizRunnerProps {
  stateCode: string;
  stateSlug: string;
  questions: Question[];
  kind: "practice" | "mock";
  modeId: string;
  modeLabel: string;
  rule: PassRule;
  timeLimitMinutes?: number | null;
  onExit: () => void;
  onRestart: () => void;
  onPracticeTopics: (categories: string[]) => void;
  onReviewMistakes: (ids: string[]) => void;
}

const KEYS = ["A", "B", "C", "D", "E", "F"];

function fmt(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function QuizRunner(props: QuizRunnerProps) {
  const { questions, kind, stateCode } = props;
  const isPractice = kind === "practice";
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  const liveRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const q = questions[index];
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const limitSec = props.timeLimitMinutes ? props.timeLimitMinutes * 60 : null;
  const remaining = limitSec != null ? limitSec - elapsed : null;

  // timer
  useEffect(() => {
    if (result) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [result]);

  const finish = useCallback(() => {
    const r = computeResult(questions, answers, props.rule);
    if (!isPractice) {
      for (const qq of questions) {
        const a = answers[qq.id];
        if (a != null) recordAnswer(stateCode, qq.id, qq.category, a === qq.correctAnswer);
      }
    }
    recordSession(stateCode, { kind, mode: props.modeId, correct: r.correct, total: r.total });
    track(isPractice ? "practice_completed" : "mock_test_completed", {
      state: stateCode,
      mode: props.modeId,
      score: r.correct,
      total: r.total,
      percent: r.percent,
      passed: r.passed,
    });
    setResult(r);
    window.scrollTo({ top: 0 });
  }, [answers, isPractice, kind, props.modeId, props.rule, questions, stateCode]);

  useEffect(() => {
    if (remaining != null && remaining <= 0 && !result) finish();
  }, [remaining, result, finish]);

  // bring the explanation into view on small screens after answering
  useEffect(() => {
    if (q && revealed[q.id]) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      feedbackRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    }
  }, [q, revealed]);

  // move focus to the question on navigation for screen-reader & keyboard users
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  const choose = useCallback(
    (option: string) => {
      if (!q || result) return;
      if (isPractice && revealed[q.id]) return;
      setAnswers((a) => ({ ...a, [q.id]: option }));
      if (isPractice) {
        const ok = option === q.correctAnswer;
        setRevealed((r) => ({ ...r, [q.id]: true }));
        recordAnswer(stateCode, q.id, q.category, ok);
        track("question_answered", { state: stateCode, mode: props.modeId, category: q.category, correct: ok });
        if (liveRef.current) liveRef.current.textContent = ok ? "Correct." : `Incorrect. The correct answer is: ${q.correctAnswer}`;
      }
    },
    [q, result, isPractice, revealed, stateCode, props.modeId],
  );

  const go = useCallback((i: number) => setIndex(Math.max(0, Math.min(total - 1, i))), [total]);
  const next = useCallback(() => (index < total - 1 ? go(index + 1) : finish()), [index, total, go, finish]);

  // keyboard shortcuts
  useEffect(() => {
    if (result) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toUpperCase();
      const byLetter = KEYS.indexOf(k);
      const byNumber = Number(e.key) - 1;
      const idx = byLetter >= 0 ? byLetter : byNumber >= 0 && byNumber < 6 ? byNumber : -1;
      if (q && idx >= 0 && idx < q.options.length) {
        e.preventDefault();
        choose(q.options[idx]);
      } else if (e.key === "ArrowRight" || (e.key === "Enter" && target.tagName !== "BUTTON")) {
        if (!isPractice || (q && revealed[q.id])) next();
      } else if (e.key === "ArrowLeft") {
        go(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, choose, next, go, index, isPractice, revealed, result]);

  const pct = useMemo(() => Math.round(((isPractice ? Object.keys(revealed).length : answeredCount) / Math.max(1, total)) * 100), [isPractice, revealed, answeredCount, total]);

  if (result) {
    return (
      <ResultView
        result={result}
        questions={questions}
        answers={answers}
        kind={kind}
        modeLabel={props.modeLabel}
        stateSlug={props.stateSlug}
        onRestart={props.onRestart}
        onExit={props.onExit}
        onPracticeTopics={props.onPracticeTopics}
        onReviewMistakes={props.onReviewMistakes}
      />
    );
  }
  if (!q) return null;

  const chosen = answers[q.id];
  const isRevealed = isPractice && revealed[q.id];
  const isLast = index === total - 1;
  const unanswered = total - answeredCount;

  const onFinishClick = () => {
    if (!isPractice && unanswered > 0) {
      const ok = window.confirm(`You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Unanswered questions count as incorrect. Finish anyway?`);
      if (!ok) return;
    }
    finish();
  };

  return (
    <div className="quiz-shell">
      <div className="quiz-top">
        <span>
          <strong>{props.modeLabel}</strong> · Question <strong className="tnum">{index + 1}</strong> of <span className="tnum">{total}</span>
        </span>
        <span className={`timer ${remaining != null && remaining < 60 ? "low" : ""}`} aria-label={remaining != null ? "Time remaining" : "Time elapsed"}>
          <Icon name="clock" size={16} />
          {remaining != null ? fmt(remaining) : fmt(elapsed)}
        </span>
      </div>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progress">
        <span style={{ width: `${pct}%` }} />
      </div>

      {!isPractice && (
        <div className="dots" aria-label="Jump to question">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              type="button"
              className={`${answers[qq.id] ? "answered" : ""} ${i === index ? "current" : ""} ${flagged[qq.id] ? "flagged" : ""}`}
              onClick={() => go(i)}
              aria-label={`Question ${i + 1}${answers[qq.id] ? ", answered" : ""}${flagged[qq.id] ? ", flagged" : ""}`}
              aria-current={i === index ? "step" : undefined}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <article className="qcard" key={q.id}>
        <div className="qmeta">
          <span className="badge badge-plain">{categoryLabel(q.category)}</span>
          <span className="badge badge-plain" style={{ textTransform: "capitalize" }}>{q.difficulty}</span>
          {flagged[q.id] && <span className="badge badge-in-review">Flagged</span>}
        </div>
        <h2 className="qtext" tabIndex={-1} ref={headingRef}>
          {q.question}
        </h2>

        <ul className="options" role="list">
          {q.options.map((opt, i) => {
            const isChosen = chosen === opt;
            let cls = "opt";
            if (isRevealed) {
              if (opt === q.correctAnswer) cls += " is-correct";
              else if (isChosen) cls += " is-wrong";
            }
            return (
              <li key={opt}>
                <button
                  type="button"
                  className={cls}
                  aria-pressed={isChosen}
                  disabled={Boolean(isRevealed)}
                  onClick={() => choose(opt)}
                >
                  <span className="key" aria-hidden="true">{KEYS[i]}</span>
                  <span>{opt}</span>
                  {isRevealed && opt === q.correctAnswer && <Icon name="check" className="mark" size={20} />}
                  {isRevealed && isChosen && opt !== q.correctAnswer && <Icon name="x" className="mark" size={20} />}
                </button>
              </li>
            );
          })}
        </ul>

        {isRevealed && (
          <div ref={feedbackRef} style={{ scrollMarginBottom: 96 }} className={`feedback ${chosen === q.correctAnswer ? "ok" : "no"}`}>
            <div className="verdict">
              <Icon name={chosen === q.correctAnswer ? "check" : "x"} size={22} />
              {chosen === q.correctAnswer ? "Correct" : "Not quite"}
            </div>
            {chosen !== q.correctAnswer && (
              <p style={{ margin: "0 0 6px" }}>
                Correct answer: <strong>{q.correctAnswer}</strong>
              </p>
            )}
            <div className="why">Why?</div>
            <p style={{ margin: 0 }}>{q.explanation}</p>
            <SourceBlock q={q} />
          </div>
        )}
      </article>

      <div ref={liveRef} className="sr-only" aria-live="polite" />

      <div className="quiz-actions">
        <div className="inner">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous question">
            <Icon name="arrowLeft" size={18} />
            <span className="hide-xs">Previous</span>
          </button>
          {!isPractice && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
              aria-pressed={Boolean(flagged[q.id])}
            >
              <Icon name="flag" size={18} /> {flagged[q.id] ? "Unflag" : "Flag"}
            </button>
          )}
          <span className="spacer" />
          <span className="kbd-hint">Keys A–D to answer · Enter for next</span>
          {isPractice && !isRevealed && (
            <button type="button" className="btn btn-sm" onClick={next}>
              Skip
            </button>
          )}
          {!isPractice && !chosen && !isLast && (
            <button type="button" className="btn btn-sm" onClick={next}>
              Skip
            </button>
          )}
          {isLast ? (
            <button type="button" className="btn btn-primary" onClick={onFinishClick} disabled={isPractice && !isRevealed && answeredCount === 0}>
              {isPractice ? "See results" : "Finish test"} <Icon name="check" size={18} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={next} disabled={(isPractice && !isRevealed) || (!isPractice && !chosen)}>
              Next <Icon name="arrowRight" size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SourceBlock({ q }: { q: Question }) {
  return (
    <div className="source">
      <span>
        <strong>Source:</strong> {q.sourceTitle} — {q.sourceSection}
      </span>
      <span>
        <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer">
          View official source <span className="sr-only">(opens in a new tab)</span>
        </a>{" "}
        · Verified {q.lastVerified}
      </span>
      <span>{q.contentType === "PRACTICE" ? "Practice question based on the official driver handbook." : "Official reference question."}</span>
    </div>
  );
}
