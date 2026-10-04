"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { MockPreset, Question, TestRules } from "@/lib/types";
import { filterPool, prepareQuestion, selectQuestions } from "@/lib/engine/select";
import type { PassRule } from "@/lib/engine/score";
import { loadProgress } from "@/lib/progress";
import { track } from "@/lib/analytics";
import { Icon } from "../Icon";
import { QuizRunner } from "./QuizRunner";
import s from "./MockApp.module.css";

const EXPECT = [
  { title: "No hints", text: "Answers stay hidden until you finish." },
  { title: "Skip & flag", text: "Jump between questions like the real test." },
  { title: "Scored at the end", text: "See your result, then review every mistake." },
];

export function MockApp({
  stateCode,
  stateSlug,
  stateName,
  questions,
  presets,
  rules,
}: {
  stateCode: string;
  stateSlug: string;
  stateName: string;
  questions: Question[];
  presets: MockPreset[];
  rules: TestRules;
}) {
  const router = useRouter();
  const [run, setRun] = useState<{ key: number; preset: MockPreset; questions: Question[]; ids?: string[] } | null>(null);

  const poolFor = useCallback(
    (p: MockPreset) => filterPool(questions, { includeTags: p.includeTags, excludeTags: p.excludeTags }),
    [questions],
  );

  const start = useCallback(
    (p: MockPreset, ids?: string[]) => {
      const pool = ids ? questions.filter((q) => ids.includes(q.id)) : poolFor(p);
      const picked = selectQuestions(pool, {
        count: ids ? ids.length : p.questionCount,
        balanceTopics: true,
        preferUnseen: true,
        history: loadProgress(stateCode).history,
        sectionRequirements: ids ? undefined : p.sectionRequirements,
      }).map((q) => prepareQuestion(q));
      setRun({ key: Date.now(), preset: p, questions: picked, ids });
      track("mock_test_started", { state: stateCode, preset: p.id, count: picked.length });
      window.scrollTo({ top: 0 });
    },
    [poolFor, questions, stateCode],
  );

  if (run) {
    const p = run.preset;
    const rule: PassRule = run.ids
      ? { passingCorrect: null, passingPercent: p.passingPercent ?? rules.officialPassingPercent, officialQuestionCount: null, readinessPercent: 80 }
      : {
          passingCorrect: p.passingCorrect,
          passingPercent: p.passingPercent,
          officialQuestionCount: p.isOfficialFormat ? p.questionCount : null,
          sectionRequirements: p.sectionRequirements,
          readinessPercent: 80,
        };
    return (
      <QuizRunner
        key={run.key}
        stateCode={stateCode}
        stateSlug={stateSlug}
        questions={run.questions}
        kind="mock"
        modeId={`mock-${p.id}`}
        modeLabel={run.ids ? "Mistake retry" : p.label}
        rule={rule}
        timeLimitMinutes={p.timeLimitMinutes ?? rules.timeLimitMinutes}
        onExit={() => setRun(null)}
        onRestart={() => start(p)}
        onPracticeTopics={(cats) => router.push(`/dmv/${stateSlug}/practice-test?mode=topic&cats=${cats.join(",")}`)}
        onReviewMistakes={(ids) => start(p, ids)}
      />
    );
  }

  return (
    <div className="container section-tight">
      <header className={`${s.hero} dark-band`}>
        <p className="eyebrow">{stateName} mock test</p>
        <h1 className={s.title}>
          Simulate <span className="text-grad">test day</span>
        </h1>
        <p className="lead">
          No hints and no feedback until the end — just like the real knowledge test. You can skip, flag, and jump between questions before you
          finish.
        </p>
        <ul className={s.expect}>
          {EXPECT.map((e) => (
            <li key={e.title} className={s.expectItem}>
              <span className={s.expectIcon}>
                <Icon name="check" size={14} />
              </span>
              <span>
                <strong>{e.title}</strong>
                <span className={s.expectText}>{e.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </header>

      <h2 className={s.sectionTitle}>Choose your test</h2>
      <div className={s.grid}>
        {presets.map((p) => {
          const available = poolFor(p).length;
          const actual = Math.min(available, p.questionCount);
          const short = actual < p.questionCount;
          const minutes = p.timeLimitMinutes ?? rules.timeLimitMinutes;
          const toPass =
            p.passingCorrect != null && !short ? `${p.passingCorrect}/${actual}` : p.passingPercent != null ? `${p.passingPercent}%` : "80%*";
          return (
            <article key={p.id} className={`${s.card} ${p.isOfficialFormat ? s.cardOfficial : ""}`}>
              <div>
                {p.isOfficialFormat ? (
                  <span className="badge badge-available">Official format</span>
                ) : (
                  <span className="badge badge-plain">Practice format</span>
                )}
              </div>
              <h3 className={s.cardTitle}>{p.label}</h3>
              <p className={s.cardText}>{p.description}</p>
              <dl className={s.stats}>
                <div className={s.stat}>
                  <dt>Questions</dt>
                  <dd className="tnum">{actual}</dd>
                </div>
                <div className={s.stat}>
                  <dt>To pass</dt>
                  <dd className="tnum">{toPass}</dd>
                </div>
                <div className={s.stat}>
                  <dt>Timer</dt>
                  <dd>{minutes ? `${minutes} min` : "Untimed"}</dd>
                </div>
              </dl>
              {short && (
                <div className="notice notice-info small">
                  <Icon name="info" size={16} />
                  <span>
                    The official test has {p.questionCount} questions. Our verified bank currently supports {actual}, so this mock is scored at the
                    official passing rate. It grows as we verify more handbook content.
                  </span>
                </div>
              )}
              {p.passingCorrect == null && p.passingPercent == null && (
                <p className="small muted" style={{ margin: 0 }}>*Readiness target, not an official passing score.</p>
              )}
              <button type="button" className={`btn btn-primary ${s.startBtn}`} onClick={() => start(p)} disabled={available === 0}>
                {available === 0 ? "Questions coming soon" : "Start mock test"}
                {available > 0 && <Icon name="arrowRight" size={18} />}
              </button>
            </article>
          );
        })}
      </div>

      <section className={s.rules} aria-labelledby="rules-title">
        <div className={s.rulesHead}>
          <span className={s.rulesIcon} aria-hidden="true">
            <Icon name="shield" size={18} />
          </span>
          <h2 id="rules-title" className={s.rulesTitle}>
            Official test rules we verified
          </h2>
        </div>
        <ul className={s.rulesList}>
          {rules.notes.map((n, i) => (
            <li key={i}>
              <span className={s.ruleCheck}>
                <Icon name="check" size={13} />
              </span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
        <p className={s.source}>
          Source:{" "}
          <a href={rules.source.url} target="_blank" rel="noopener noreferrer">
            {rules.source.title}
            {rules.source.section ? ` — ${rules.source.section}` : ""}
          </a>
        </p>
      </section>
    </div>
  );
}
