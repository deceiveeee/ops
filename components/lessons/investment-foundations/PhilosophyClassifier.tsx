"use client";

import { useMemo, useState } from "react";
import { Reveal, InteractiveFrame, TryItTag, Feedback } from "./shared";
import { cn } from "@/lib/utils";

type CategoryId = "belief" | "philosophy" | "strategy" | "trade";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "belief", label: "Market belief" },
  { id: "philosophy", label: "Investment philosophy" },
  { id: "strategy", label: "Investment strategy" },
  { id: "trade", label: "Individual trade" },
];

type Case = {
  id: string;
  statement: string;
  correct: CategoryId;
  feedback: string;
};

const CASES: Case[] = [
  {
    id: "slow-revision",
    statement:
      "Investors often revise long-term expectations too slowly after important new information.",
    correct: "belief",
    feedback:
      "This is a claim about investor behavior. It does not yet explain where an investable opportunity appears or how to pursue it.",
  },
  {
    id: "underreaction",
    statement:
      "Because prices can underreact when expectations change gradually, post-announcement drift may offer a temporary return opportunity.",
    correct: "philosophy",
    feedback:
      "This connects a market belief to a source of opportunity and explains why the opportunity may persist for a time.",
  },
  {
    id: "earnings-screen",
    statement:
      "Each quarter, rank companies by positive earnings surprise, then investigate whether the price fully reflects the change in expected cash flows.",
    correct: "strategy",
    feedback:
      "This is a repeatable method for finding candidates consistent with an underreaction philosophy.",
  },
  {
    id: "company-a",
    statement:
      "Buy a 2% position in Company A at the next market open after the thesis and portfolio-risk checks pass.",
    correct: "trade",
    feedback:
      "This is one specific portfolio action. The earlier layers must supply the reason, selection rules, and risk limits.",
  },
  {
    id: "low-pe",
    statement:
      "Buy the ten lowest-P/E companies in each industry and rebalance annually.",
    correct: "strategy",
    feedback:
      "This is a complete selection rule, but the rule still needs a philosophy explaining why low-P/E stocks should outperform after risk and costs.",
  },
  {
    id: "extrapolation",
    statement:
      "When investors extrapolate temporary deterioration too far, prices can fall below long-term value; patient investors may benefit as expectations normalize.",
    correct: "philosophy",
    feedback:
      "This states the behavioral mistake, the pricing effect, and the source of the possible return.",
  },
  {
    id: "efficient-prices",
    statement:
      "Most widely available public information is incorporated into liquid-stock prices too quickly for me to trade on it profitably.",
    correct: "belief",
    feedback:
      "This is a belief about market efficiency. It could support a low-cost indexing philosophy, but that conclusion has not yet been stated.",
  },
  {
    id: "trim-position",
    statement:
      "Reduce Company B from 5% to 2% of the portfolio after it loses its largest customer.",
    correct: "trade",
    feedback:
      "This is a specific adjustment. Whether it is sensible depends on the original thesis, the new cash-flow expectations, and the position-sizing rules.",
  },
];

export default function PhilosophyClassifier() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, CategoryId>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);

  const current = CASES[index];
  const picked = answers[current.id];
  const correct = picked === current.correct;
  const correctCount = useMemo(
    () => CASES.filter((item) => answers[item.id] === item.correct).length,
    [answers],
  );

  const choose = (category: CategoryId) => {
    if (showFeedback) return;
    setAnswers((previous) => ({ ...previous, [current.id]: category }));
    setShowFeedback(true);
  };

  const advance = () => {
    if (index === CASES.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setShowFeedback(false);
  };

  const retry = () => {
    setAnswers({});
    setIndex(0);
    setShowFeedback(false);
    setFinished(false);
  };

  return (
    <Reveal>
      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Classify eight statements
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            {finished ? "Complete" : `Case ${index + 1} of ${CASES.length}`} · {correctCount} correct
          </span>
        </div>

        {!finished ? (
          <>
            <p className="ops-body mt-4 text-[15px] text-slate-300">
              Read the wording carefully. A belief describes markets. A
              philosophy connects that belief to an opportunity. A strategy
              supplies a repeatable method. A trade applies it once.
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-ink-950/40 p-5">
              <p className="ops-body-strong text-[16px] text-slate-50">
                {current.statement}
              </p>
              <div
                className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"
                role="radiogroup"
                aria-label={`Classify statement: ${current.statement}`}
              >
                {CATEGORIES.map((category) => {
                  const isPicked = picked === category.id;
                  const isCorrect = current.correct === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="radio"
                      aria-checked={isPicked}
                      disabled={showFeedback}
                      onClick={() => choose(category.id)}
                      className={cn(
                        "rounded-lg border px-4 py-2.5 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                        !showFeedback &&
                          "border-white/20 text-slate-100 hover:border-accent-amber/60 hover:bg-accent-amber/[0.04]",
                        showFeedback && isCorrect &&
                          "border-accent-green bg-accent-green/15 text-accent-green",
                        showFeedback && isPicked && !isCorrect &&
                          "border-accent-red bg-accent-red/15 text-accent-red",
                        showFeedback && !isPicked && !isCorrect &&
                          "border-white/10 text-slate-500",
                      )}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {showFeedback && (
              <>
                <Feedback status={correct ? "correct" : "incorrect"}>
                  <strong className="text-white">
                    {CATEGORIES.find((category) => category.id === current.correct)?.label}.
                  </strong>{" "}
                  {current.feedback}
                </Feedback>
                <button
                  type="button"
                  onClick={advance}
                  className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
                >
                  {index === CASES.length - 1 ? "See summary" : "Next case"} →
                </button>
              </>
            )}
          </>
        ) : (
          <FinalSummary correctCount={correctCount} onRetry={retry} />
        )}
      </InteractiveFrame>
    </Reveal>
  );
}

function FinalSummary({
  correctCount,
  onRetry,
}: {
  correctCount: number;
  onRetry: () => void;
}) {
  return (
    <div className="mt-5">
      <div className="ops-caption text-[11px] text-accent-amber">Final score</div>
      <div className="mt-2 font-sans text-4xl tabular-nums text-white">
        {correctCount}/{CASES.length}
      </div>
      <div className="ops-definition-card mt-5 p-5">
        <div className="ops-caption text-[10px] text-accent-cyan">
          The diagnostic question
        </div>
        <p className="ops-body mt-2 text-[16px] text-slate-100">
          Does the statement explain how markets work, why an opportunity
          exists, how to pursue it repeatedly, or what to do in one case?
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
      >
        Retry all cases
      </button>
    </div>
  );
}
