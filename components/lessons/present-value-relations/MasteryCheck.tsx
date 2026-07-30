"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, Feedback } from "@/components/lessons/intro-course-overview/shared";
import Button from "@/components/ui/Button";
import { MathText } from "@/components/ui/MathText";

export type MasteryQuestion =
  | {
      id: string;
      type: "single";
      prompt: ReactNode;
      choices: { id: string; label: string }[];
      correctId: string;
      hint: ReactNode;
    }
  | {
      id: string;
      type: "multi";
      prompt: ReactNode;
      choices: { id: string; label: string }[];
      correctIds: string[];
      hint: ReactNode;
    }
  | {
      id: string;
      type: "explain";
      prompt: ReactNode;
      keywords: string[];
      hint: ReactNode;
    };

export default function MasteryCheck({
  title = "Mastery check",
  questions,
  passCount,
  onComplete,
  continueLabel,
  continueHref,
  skills,
  onSkillsMastered,
}: {
  title?: string;
  questions: MasteryQuestion[];
  passCount: number;
  onComplete?: () => void;
  continueLabel?: string;
  continueHref?: string;
  skills?: string[];
  onSkillsMastered?: () => void;
}) {
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);

  const scored = questions.map((q) => {
    const a = answers[q.id];
    let correct = false;
    if (q.type === "single") correct = a === q.correctId;
    else if (q.type === "multi") {
      const chosen = (a as string[] | undefined) ?? [];
      correct =
        chosen.length === q.correctIds.length &&
        q.correctIds.every((c) => chosen.includes(c));
    } else if (q.type === "explain") {
      const text = String(a ?? "").toLowerCase();
      correct = q.keywords.some((k) => text.includes(k.toLowerCase()));
    }
    return { q, correct, answered: a !== undefined && a !== "" && !(Array.isArray(a) && a.length === 0) };
  });

  const correctCount = scored.filter((s) => s.correct).length;
  const allAnswered = scored.every((s) => s.answered);

  const submit = () => {
    setSubmitted(true);
    const ok = correctCount >= passCount;
    setPassed(ok);
    if (ok) {
      onComplete?.();
      onSkillsMastered?.();
    }
  };

  const retry = () => {
    setSubmitted(false);
    setPassed(false);
    setAnswers({});
  };

  const setSingle = (qid: string, cid: string) =>
    setAnswers((p) => ({ ...p, [qid]: submitted ? (p[qid] ?? cid) : cid }));

  const toggleMulti = (qid: string, cid: string) => {
    if (submitted) return;
    setAnswers((p) => {
      const cur = (p[qid] as string[] | undefined) ?? [];
      const next = cur.includes(cid) ? cur.filter((x) => x !== cid) : [...cur, cid];
      return { ...p, [qid]: next };
    });
  };

  const setExplain = (qid: string, v: string) => {
    if (submitted) return;
    setAnswers((p) => ({ ...p, [qid]: v }));
  };

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">{title}</span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          Pass with {passCount} of {questions.length} correct
        </span>
      </div>
      <p className="ops-body mt-4 text-[15px] text-slate-300">
        Answer all questions, then check your work. You can retry any time — mastery is based on correctness, not speed.
      </p>

      <ol className="mt-6 space-y-6">
        {questions.map((q, qi) => {
          const s = scored[qi];
          return (
            <li key={q.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-start gap-3">
                <span className="ops-caption mt-1 text-[11px] text-slate-500">
                  {String(qi + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="ops-body-strong text-[16px] text-slate-50"><MathText>{q.prompt}</MathText></p>

                  {q.type === "single" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {q.choices.map((c) => {
                        const picked = answers[q.id] === c.id;
                        const isCorrect = c.id === q.correctId;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            disabled={submitted}
                            onClick={() => setSingle(q.id, c.id)}
                            className={cn(
                              "rounded-full border px-4 py-2 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-default",
                              !submitted &&
                                (picked
                                  ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                                  : "border-white/20 text-slate-100 hover:border-accent-cyan/60 hover:text-accent-cyan"),
                              submitted &&
                                isCorrect &&
                                "border-accent-green bg-accent-green/15 text-accent-green",
                              submitted &&
                                picked &&
                                !isCorrect &&
                                "border-accent-red bg-accent-red/15 text-accent-red",
                              submitted && !picked && !isCorrect && "border-white/10 text-slate-500",
                            )}
                          >
                            <MathText>{c.label}</MathText>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "multi" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {q.choices.map((c) => {
                        const chosen = ((answers[q.id] as string[] | undefined) ?? []).includes(c.id);
                        const isCorrect = q.correctIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            disabled={submitted}
                            onClick={() => toggleMulti(q.id, c.id)}
                            className={cn(
                              "rounded-full border px-4 py-2 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-default",
                              !submitted &&
                                (chosen
                                  ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                                  : "border-white/20 text-slate-100 hover:border-accent-cyan/60 hover:text-accent-cyan"),
                              submitted && isCorrect && chosen && "border-accent-green bg-accent-green/15 text-accent-green",
                              submitted && !isCorrect && chosen && "border-accent-red bg-accent-red/15 text-accent-red",
                              submitted && isCorrect && !chosen && "border-accent-green/40 text-accent-green/80",
                              submitted && !isCorrect && !chosen && "border-white/10 text-slate-500",
                            )}
                          >
                            <MathText>{c.label}</MathText>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "explain" && (
                    <textarea
                      aria-label={`Question ${qi + 1} written answer`}
                      value={String(answers[q.id] ?? "")}
                      onChange={(e) => setExplain(q.id, e.target.value)}
                      disabled={submitted}
                      rows={2}
                      placeholder="Type your answer…"
                      className={cn(
                        "ops-body mt-3 w-full resize-y rounded-xl border bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30",
                        submitted && s.correct
                          ? "border-accent-green/50"
                          : submitted
                            ? "border-accent-red/50"
                            : "border-white/15 focus:border-accent-cyan/50",
                      )}
                    />
                  )}

                  {submitted && (
                    <Feedback status={s.correct ? "correct" : "incorrect"}>
                      {s.correct
                        ? "Correct."
                        : (
                          <span>
                            Not quite. <span className="text-slate-300"><MathText>{q.hint}</MathText></span>
                          </span>
                        )}
                    </Feedback>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!passed ? (
          <Button size="md" onClick={submit} disabled={!allAnswered}>
            {submitted ? "Re-check" : "Check answers"}
          </Button>
        ) : null}
        {submitted && !passed && (
          <Button size="md" variant="outline" onClick={retry}>
            Retry
          </Button>
        )}
        {submitted && (
          <span
            className={cn(
              "font-sans text-[13px] tabular-nums",
              passed ? "text-accent-green" : "text-accent-amber",
            )}
          >
            {correctCount}/{questions.length} correct {passed ? "— passed" : "— keep going"}
          </span>
        )}
      </div>

      <AnimatePresence>
        {passed && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="ops-definition-card mt-6 p-6"
          >
            <div className="ops-caption text-[11px] text-accent-green">Lesson complete</div>
            <p className="ops-definition mt-2.5 text-[17px]">
              You passed the mastery check. {skills && skills.length > 0 ? `Mastery updated: ${skills.join(", ")}.` : ""}
            </p>
            {continueLabel && continueHref && (
              <div className="mt-5">
                <Button href={continueHref} size="md">
                  {continueLabel}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveFrame>
  );
}
