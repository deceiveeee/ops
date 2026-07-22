"use client";

import { useMemo, useState } from "react";
import { Reveal, InteractiveFrame, TryItTag, Feedback } from "./shared";
import { cn } from "@/lib/utils";

/**
 * Section 4 — Philosophy, strategy, or trade?
 * Classify 10 statements, immediate feedback, final score.
 */

type CategoryId =
  | "belief"
  | "strategy"
  | "trade"
  | "insufficient";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "belief", label: "Market belief or philosophy" },
  { id: "strategy", label: "Investment strategy" },
  { id: "trade", label: "Portfolio decision or trade" },
  { id: "insufficient", label: "Insufficiently specified" },
];

type Case = {
  id: string;
  statement: string;
  correct: CategoryId;
  feedback: string;
  belief?: string;
};

const CASES: Case[] = [
  {
    id: "c1",
    statement: "Invest in stocks with dividend yields above 4%.",
    correct: "strategy",
    feedback:
      "This provides a rule for selecting stocks, but it does not explain why high-dividend stocks should outperform or why the opportunity should persist.",
    belief:
      "Investors may undervalue stable cash distributions or overpay for companies that promise distant growth.",
  },
  {
    id: "c2",
    statement: "Investors often extrapolate recent growth too far into the future.",
    correct: "belief",
    feedback:
      "This is a claim about recurring investor behavior. It could support strategies that avoid overpriced growth companies or search for neglected companies with temporarily weak results.",
  },
  {
    id: "c3",
    statement: "Buy companies trading below book value.",
    correct: "strategy",
    feedback:
      "This is an implementable selection rule. It becomes part of a philosophy only after the investor explains why low price-to-book companies may be mispriced and how value traps will be identified.",
  },
  {
    id: "c4",
    statement:
      "Public information is incorporated into prices too quickly for me to trade profitably.",
    correct: "belief",
    feedback:
      "This is a belief about market efficiency. A strategy consistent with it may be broad, low-cost indexing rather than active security selection.",
  },
  {
    id: "c5",
    statement: "Investors respond slowly to positive earnings surprises.",
    correct: "belief",
    feedback:
      "This belief can support a strategy that investigates companies after unexpectedly strong earnings because prices may continue adjusting after the announcement.",
  },
  {
    id: "c6",
    statement: "Buy shares of Company X at a 3% portfolio weight.",
    correct: "trade",
    feedback:
      "This is a specific portfolio action. The philosophy, analysis, valuation, and position-sizing logic are not stated.",
  },
  {
    id: "c7",
    statement: "Buy undervalued companies.",
    correct: "insufficient",
    feedback:
      "This indicates an intention, but it does not define the market mistake, valuation method, catalyst, risk controls, or implementation rule.",
  },
  {
    id: "c8",
    statement:
      "Investors may sell unfamiliar companies too aggressively when uncertainty rises.",
    correct: "belief",
    feedback:
      "This is a claim about how ambiguity and familiarity may affect prices.",
  },
  {
    id: "c9",
    statement:
      "Purchase the ten lowest-P/E companies in the industry and rebalance annually.",
    correct: "strategy",
    feedback:
      "This is a complete rule, but it still requires evidence that the underlying market belief is valid after risk, costs, and failed companies are considered.",
  },
  {
    id: "c10",
    statement:
      "Reduce the position from 5% to 2% after the company loses its largest customer.",
    correct: "trade",
    feedback:
      "This is a specific portfolio adjustment based on a change in the investment thesis.",
  },
];

export default function PhilosophyClassifier() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, CategoryId>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  const current = CASES[idx];
  const picked = answers[current.id];
  const correct = picked === current.correct;
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => CASES.filter((c) => answers[c.id] === c.correct).length,
    [answers],
  );
  const finished = answeredCount === CASES.length;

  const choose = (cat: CategoryId) => {
    if (showFeedback) return;
    setAnswers((p) => ({ ...p, [current.id]: cat }));
    setShowFeedback(true);
  };

  const next = () => {
    setShowFeedback(false);
    setIdx((i) => Math.min(CASES.length - 1, i + 1));
  };

  const prev = () => {
    setShowFeedback(false);
    setIdx((i) => Math.max(0, i - 1));
  };

  const retry = () => {
    setAnswers({});
    setShowFeedback(false);
    setIdx(0);
  };

  return (
    <Reveal>
      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Philosophy, strategy, or trade?
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            Case {idx + 1} of {CASES.length} · {correctCount} correct so far
          </span>
        </div>

        {!finished ? (
          <>
            <p className="ops-body mt-4 text-[15px] text-slate-300">
              Classify each statement. Then examine what the statement reveals —
              and what it leaves unexplained.
            </p>

            <div
              role="radiogroup"
              aria-label={`Classify statement: ${current.statement}`}
              className="mt-5 rounded-xl border border-white/10 bg-ink-950/40 p-5"
            >
              <p className="ops-body-strong text-[16px] text-slate-50">
                {current.statement}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CATEGORIES.map((c) => {
                  const isPicked = picked === c.id;
                  const isCorrect = current.correct === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={isPicked}
                      disabled={showFeedback}
                      onClick={() => choose(c.id)}
                      className={cn(
                        "rounded-lg border px-4 py-2.5 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                        !showFeedback &&
                          (isPicked
                            ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                            : "border-white/20 text-slate-100 hover:border-accent-amber/60 hover:bg-accent-amber/[0.04]"),
                        showFeedback &&
                          isCorrect &&
                          "border-accent-green bg-accent-green/15 text-accent-green",
                        showFeedback &&
                          isPicked &&
                          !isCorrect &&
                          "border-accent-red bg-accent-red/15 text-accent-red",
                        showFeedback &&
                          !isPicked &&
                          !isCorrect &&
                          "border-white/10 text-slate-500",
                      )}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {showFeedback && (
              <Feedback status={correct ? "correct" : "incorrect"}>
                <span className="block">
                  <strong className="text-white">
                    {CATEGORIES.find((c) => c.id === current.correct)?.label}.
                  </strong>{" "}
                  {current.feedback}
                </span>
                {current.belief && (
                  <span className="mt-2 block border-t border-white/10 pt-2 text-[14px] text-slate-300">
                    <span className="ops-caption text-[10px] text-accent-amber">
                      Possible underlying belief:{" "}
                    </span>
                    {current.belief}
                  </span>
                )}
              </Feedback>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={prev}
                disabled={idx === 0 || !showFeedback}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition-colors hover:border-white/30 disabled:cursor-default disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
              >
                ← Previous
              </button>
              {showFeedback && idx < CASES.length - 1 && (
                <button
                  type="button"
                  onClick={next}
                  className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-2 text-sm text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
                >
                  Next case →
                </button>
              )}
              {showFeedback && idx === CASES.length - 1 && (
                <button
                  type="button"
                  onClick={() => setIdx(CASES.length - 1)}
                  className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-2 text-sm text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
                >
                  See summary →
                </button>
              )}
              <span className="ml-auto font-mono text-[12px] tabular-nums text-slate-500">
                {answeredCount}/{CASES.length} answered
              </span>
            </div>
          </>
        ) : (
          <FinalSummary
            correctCount={correctCount}
            total={CASES.length}
            onRetry={retry}
          />
        )}
      </InteractiveFrame>
    </Reveal>
  );
}

function FinalSummary({
  correctCount,
  total,
  onRetry,
}: {
  correctCount: number;
  total: number;
  onRetry: () => void;
}) {
  const pct = Math.round((correctCount / total) * 100);
  const passed = correctCount >= 7;
  return (
    <div className="mt-4">
      <div className="ops-caption text-[11px] text-accent-amber">
        Final score
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <span
          className={cn(
            "font-mono text-4xl tabular-nums",
            passed ? "text-accent-green" : "text-accent-amber",
          )}
        >
          {correctCount}/{total}
        </span>
        <span className="font-mono text-sm text-slate-400">{pct}%</span>
      </div>
      <div className="ops-definition-card mt-5 p-5">
        <div className="ops-caption text-[10px] text-accent-cyan">
          Recurring pattern
        </div>
        <p className="ops-body mt-2 text-[16px] text-slate-100">
          Most weak investment ideas fail at the same point: they describe an
          action without explaining the market belief that makes the action
          sensible.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
      >
        Retry all cases
      </button>
    </div>
  );
}
