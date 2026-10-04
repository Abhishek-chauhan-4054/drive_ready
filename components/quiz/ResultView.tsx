"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/types";
import { resultHeadline, type TestResult } from "@/lib/engine/score";
import { categoryLabel } from "@/lib/categories";
import { Icon } from "../Icon";
import { SourceBlock } from "./QuizRunner";

function Ring({ percent, pass }: { percent: number; pass: boolean }) {
  const r = 72;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(percent));
    return () => cancelAnimationFrame(t);
  }, [percent]);
  return (
    <div className="ring" role="img" aria-label={`Score ${percent} percent`}>
      <svg width="168" height="168" viewBox="0 0 168 168">
        <circle cx="84" cy="84" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="14" />
        <circle
          cx="84"
          cy="84"
          r={r}
          fill="none"
          stroke={pass ? "var(--go)" : "var(--caution)"}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * shown) / 100}
        />
      </svg>
      <div className="center">
        <div>
          <div className="pct tnum">{percent}%</div>
        </div>
      </div>
    </div>
  );
}

export function ResultView(props: {
  result: TestResult;
  questions: Question[];
  answers: Record<string, string>;
  kind: "practice" | "mock";
  modeLabel: string;
  stateSlug: string;
  onRestart: () => void;
  onExit: () => void;
  onPracticeTopics: (categories: string[]) => void;
  onReviewMistakes: (ids: string[]) => void;
}) {
  const { result: r, questions, answers } = props;
  const [showReview, setShowReview] = useState(false);
  const wrong = questions.filter((q) => answers[q.id] !== q.correctAnswer);
  const weakCats = r.weakTopics.map((t) => t.category);

  const verdictText =
    props.kind === "practice"
      ? r.passed
        ? "On track"
        : "Needs practice"
      : r.basis === "official"
      ? r.passed
        ? "Pass"
        : "Needs practice"
      : r.passed
        ? "On track"
        : "Needs practice";

  return (
    <div className="quiz-shell" style={{ paddingBottom: 48 }}>
      <p className="eyebrow">Your {props.kind === "mock" ? "mock test" : "practice"} result · {props.modeLabel}</p>

      <section className="card card-pad-lg" aria-labelledby="result-heading" style={{ marginTop: 12 }}>
        <div className="result-hero">
          <Ring percent={r.percent} pass={r.passed} />
          <div>
            <h1 id="result-heading" style={{ fontSize: "clamp(2rem,5vw,2.8rem)", marginBottom: 8 }}>
              <span className="tnum">{r.correct}</span> / <span className="tnum">{r.total}</span> · {resultHeadline(r.percent)}
            </h1>
            <span className={`verdict-pill ${r.passed ? "pass" : "fail"}`}>
              <Icon name={r.passed ? "check" : "target"} size={16} /> {verdictText}
            </span>
            <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
              {props.kind === "practice"
                ? `Practice sessions are judged against ${r.basis === "official" ? "the state's passing rate" : "an 80% readiness target"} — ${r.requiredCorrect} correct here. Take a mock test for the full test format.`
                : r.basis === "official"
                ? `You needed ${r.requiredCorrect} correct${r.scaled ? " (official passing rate applied to this shorter test)" : " under the state's published passing rule"}.`
                : `No official passing score is published in the sources we verified, so this is judged against an 80% readiness target (${r.requiredCorrect} correct).`}
            </p>
          </div>
        </div>

        <div className="stats">
          <div className="stat"><div className="v tnum" style={{ color: "var(--go-strong)" }}>{r.correct}</div><div className="k">Correct</div></div>
          <div className="stat"><div className="v tnum" style={{ color: "var(--stop)" }}>{r.incorrect - r.skipped}</div><div className="k">Incorrect</div></div>
          <div className="stat"><div className="v tnum">{r.skipped}</div><div className="k">Skipped</div></div>
        </div>

        {r.sections.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {r.sections.map((s) => (
              <div key={s.tag} className={`notice ${s.met ? "" : "notice-caution"}`}>
                <Icon name={s.met ? "check" : "alert"} size={18} />
                <span>
                  {s.label}: <strong className="tnum">{s.correct} of {s.asked}</strong> correct — {s.met ? "requirement met" : `you need at least ${s.minCorrect} of ${s.questionCount}`}.
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="row" style={{ marginTop: 16 }}>
        {wrong.length > 0 && (
          <button type="button" className="btn btn-dark" onClick={() => setShowReview((v) => !v)} aria-expanded={showReview}>
            <Icon name="clipboard" size={18} /> {showReview ? "Hide mistakes" : `Review mistakes (${wrong.length})`}
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={props.onRestart}>
          <Icon name="rotate" size={18} /> Practice again
        </button>
        {weakCats.length > 0 && (
          <button type="button" className="btn" onClick={() => props.onPracticeTopics(weakCats)}>
            <Icon name="target" size={18} /> Practice weak topics
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={props.onExit}>
          Try another test
        </button>
      </div>

      {showReview && (
        <section style={{ marginTop: 24 }} aria-label="Review your mistakes">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Review mistakes</h2>
            <button type="button" className="btn btn-sm" onClick={() => props.onReviewMistakes(wrong.map((q) => q.id))}>
              Retry these questions
            </button>
          </div>
          {wrong.map((q) => (
            <div className="review-item" key={q.id}>
              <span className="badge badge-plain">{categoryLabel(q.category)}</span>
              <h3 style={{ marginTop: 10, marginBottom: 6, fontFamily: "var(--font-body)", fontSize: "1.05rem" }}>{q.question}</h3>
              <div className="ans">
                <span className="you">
                  <Icon name="x" size={16} style={{ display: "inline", verticalAlign: "-3px" }} /> Your answer: {answers[q.id] ?? "Skipped"}
                </span>
                <span className="right">
                  <Icon name="check" size={16} style={{ display: "inline", verticalAlign: "-3px" }} /> Correct: {q.correctAnswer}
                </span>
              </div>
              <div className="why">Why?</div>
              <p style={{ margin: 0 }}>{q.explanation}</p>
              <SourceBlock q={q} />
            </div>
          ))}
        </section>
      )}

      <section className="card" style={{ marginTop: 24 }} aria-labelledby="topics-heading">
        <h2 id="topics-heading" style={{ fontSize: "1.3rem" }}>Topic performance</h2>
        {r.topics.map((t) => (
          <div className="topic-row" key={t.category}>
            <span>
              {t.label} <span className="muted small tnum">({t.correct}/{t.total})</span>
            </span>
            <span className="p">{t.percent}%</span>
            <div className="bar" aria-hidden="true">
              <span className={t.percent >= 80 ? "" : t.percent >= 60 ? "warn" : "bad"} style={{ width: `${Math.max(4, t.percent)}%` }} />
            </div>
          </div>
        ))}
        {r.weakTopics.length > 0 ? (
          <div style={{ marginTop: 18 }}>
            <p className="why" style={{ marginTop: 0 }}>Recommended practice</p>
            <div className="row">
              {r.weakTopics.map((t) => (
                <button key={t.category} type="button" className="btn btn-sm" onClick={() => props.onPracticeTopics([t.category])}>
                  Practice {t.label} <Icon name="arrowRight" size={16} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="muted small" style={{ marginTop: 14, marginBottom: 0 }}>
            Every topic is at 80% or higher. Try a mock test or new questions next.
          </p>
        )}
      </section>
    </div>
  );
}
