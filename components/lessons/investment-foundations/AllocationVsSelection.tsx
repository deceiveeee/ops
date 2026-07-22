"use client";

import { useMemo, useState } from "react";
import { Reveal, InteractiveFrame, TryItTag, Feedback } from "./shared";
import { cn } from "@/lib/utils";

/**
 * Section 8 — Where does the decision belong?
 * Six cases: asset allocation vs security selection.
 */

type Category = "allocation" | "selection";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "allocation", label: "Asset allocation" },
  { id: "selection", label: "Security selection" },
];

const CASES: { id: string; statement: string; correct: Category; feedback: string }[] = [
  {
    id: "c1",
    statement: "Increase the portfolio’s bond allocation from 20% to 35%.",
    correct: "allocation",
    feedback: "This changes the exposure to an entire asset class.",
  },
  {
    id: "c2",
    statement: "Choose one restaurant company instead of another.",
    correct: "selection",
    feedback: "This chooses a specific security within the equity allocation.",
  },
  {
    id: "c3",
    statement: "Shift part of the portfolio from domestic stocks to international stocks.",
    correct: "allocation",
    feedback: "This changes the portfolio’s geographic market exposure.",
  },
  {
    id: "c4",
    statement: "Purchase a five-year bond issued by a specific company.",
    correct: "selection",
    feedback: "This selects a particular bond issuer and maturity within fixed income.",
  },
  {
    id: "c5",
    statement: "Decide whether the portfolio should hold real estate exposure.",
    correct: "allocation",
    feedback: "This determines whether a broad asset category belongs in the portfolio.",
  },
  {
    id: "c6",
    statement: "Choose between two real-estate investment funds.",
    correct: "selection",
    feedback: "This selects the vehicle used to obtain the previously approved exposure.",
  },
];

export default function AllocationVsSelection() {
  const [answers, setAnswers] = useState<Record<string, Category>>({});
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);

  const correctCount = useMemo(
    () => CASES.filter((c) => answers[c.id] === c.correct).length,
    [answers],
  );
  const allAnswered = Object.keys(answers).length === CASES.length;

  const choose = (caseId: string, cat: Category) => {
    if (answers[caseId]) return;
    setAnswers((p) => ({ ...p, [caseId]: cat }));
    setFeedbackFor(caseId);
  };

  const reset = () => {
    setAnswers({});
    setFeedbackFor(null);
  };

  return (
    <Reveal>
      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Where does the decision belong?
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            {Object.keys(answers).length}/{CASES.length} answered · {correctCount} correct
          </span>
        </div>

        <ol className="mt-5 space-y-3">
          {CASES.map((c, i) => {
            const picked = answers[c.id];
            const showFeedback = feedbackFor === c.id || (allAnswered && picked !== undefined);
            return (
              <li
                key={c.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="ops-caption mt-0.5 text-[11px] text-slate-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="ops-body-strong text-[15px] text-slate-50">
                      {c.statement}
                    </p>
                    <div
                      className="mt-3 flex flex-wrap gap-2"
                      role="radiogroup"
                      aria-label={`Classify: ${c.statement}`}
                    >
                      {CATEGORIES.map((cat) => {
                        const isPicked = picked === cat.id;
                        const isCorrect = c.correct === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            role="radio"
                            aria-checked={isPicked}
                            disabled={picked !== undefined}
                            onClick={() => choose(c.id, cat.id)}
                            className={cn(
                              "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                              !picked &&
                                "border-white/20 text-slate-100 hover:border-accent-amber/60 hover:text-accent-amber",
                              picked && isCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                              picked && isPicked && !isCorrect && "border-accent-red bg-accent-red/15 text-accent-red",
                              picked && !isPicked && !isCorrect && "border-white/10 text-slate-500",
                            )}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                    {showFeedback && (
                      <div className="mt-3 rounded-lg border border-white/10 bg-ink-950/40 p-2.5 text-[13px] text-slate-300">
                        <span className={cn("font-mono text-[10px] uppercase tracking-[0.14em]", picked === c.correct ? "text-accent-green" : "text-accent-amber")}>
                          {picked === c.correct ? "Correct" : "Review"}
                        </span>
                        <span className="ml-2">{c.feedback}</span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {allAnswered && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "font-mono text-[14px] tabular-nums",
                correctCount === CASES.length ? "text-accent-green" : "text-accent-amber",
              )}
            >
              {correctCount}/{CASES.length} correct
            </span>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
            >
              Retry
            </button>
          </div>
        )}
      </InteractiveFrame>
    </Reveal>
  );
}
