"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Level = 1 | 2 | 3;

type Case = {
  id: string;
  announcement: string;
  correct: Level;
  explanation: string;
};

const CASES: Case[] = [
  {
    id: "fab-named",
    announcement:
      "A semiconductor company announces a $10 billion fabrication plant in Arizona, with a named customer, a construction timeline, and production capacity targets.",
    correct: 1,
    explanation:
      "Named, large, and specifically disclosed. The cost, timing, capacity, and operating milestones are available, allowing a project-specific scenario valuation.",
  },
  {
    id: "acquisition-major",
    announcement:
      "A buyer announces the acquisition of a target for $4.2 billion, including the financing structure, expected cost and revenue synergies, and a closing timetable.",
    correct: 1,
    explanation:
      "A major acquisition with a disclosed price, financing, synergy targets, and rationale. Project-specific cost and expected benefits are available.",
  },
  {
    id: "store-program",
    announcement:
      "A restaurant chain guides to opening 100–120 new locations per year for the next three years, with an average development cost per store.",
    correct: 2,
    explanation:
      "A repeated investment program. Individual store NPV is not disclosed, but average unit economics and program-level capital expenditure support aggregate-return estimates.",
  },
  {
    id: "warehouse-program",
    announcement:
      "A logistics company reports capital expenditure rising 18% and mentions continued warehouse-capacity expansion across its network.",
    correct: 2,
    explanation:
      "A repeated program, but with less unit detail than the restaurant case. The investor can estimate aggregate returns but must work harder for unit economics.",
  },
  {
    id: "internal-software",
    announcement:
      "A retailer's capital expenditure includes a line item for 'technology and systems' without further breakdown; management cites continued investment in digital capabilities.",
    correct: 3,
    explanation:
      "Poorly disclosed internal investment. The investor can observe only aggregate spending, margin progression, free cash flow, and company-level ROIC.",
  },
  {
    id: "minor-product",
    announcement:
      "A consumer-goods company mentions several product-line extensions in its MD&A without quantifying spending, timing, or expected contribution.",
    correct: 3,
    explanation:
      "Minor and diffuse. The investor must rely on aggregate R&D, segment trends, and management credibility rather than project-level analysis.",
  },
];

const LEVELS: Record<
  Level,
  { name: string; tone: "green" | "amber" | "red"; analysis: string }
> = {
  1: {
    name: "Level 1 · Clearly disclosed major investment",
    tone: "green",
    analysis:
      "Project-specific cost, timing, and operating milestones are available. Scenario valuation is feasible.",
  },
  2: {
    name: "Level 2 · Repeated investment program",
    tone: "amber",
    analysis:
      "Average unit economics and program-level capital expenditure support aggregate-return estimates.",
  },
  3: {
    name: "Level 3 · Poorly disclosed internal investment",
    tone: "red",
    analysis:
      "Only aggregate R&D or capex, margin progression, free cash flow, and company-level ROIC are observable.",
  },
};

const toneText: Record<string, string> = {
  green: "text-accent-green",
  amber: "text-accent-amber",
  red: "text-accent-red",
};
const toneBorder: Record<string, string> = {
  green: "border-accent-green/40",
  amber: "border-accent-amber/40",
  red: "border-accent-red/40",
};
const toneBg: Record<string, string> = {
  green: "bg-accent-green/[0.06]",
  amber: "bg-accent-amber/[0.06]",
  red: "bg-accent-red/[0.06]",
};

export default function ProjectVisibilityClassifier() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Level | null>(null);

  const c = CASES[idx];
  const answered = picked !== null;
  const correct = picked === c.correct;

  const next = () => {
    setIdx((i) => (i + 1) % CASES.length);
    setPicked(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <span className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Announcement {idx + 1} of {CASES.length}
        </span>
        <button
          type="button"
          onClick={next}
          className="rounded-full border border-white/20 px-4 py-1.5 text-[13px] text-slate-200 transition-colors hover:border-accent-amber/60 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        >
          Next announcement →
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={c.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : undefined}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6"
        >
          <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
            Company announcement
          </div>
          <p className="ops-body mt-3 text-[17px] leading-[1.6] text-slate-100">
            {c.announcement}
          </p>
        </motion.div>
      </AnimatePresence>

      <div>
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          What level of analysis is feasible?
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {([1, 2, 3] as Level[]).map((lvl) => {
            const isPicked = picked === lvl;
            const isCorrect = c.correct === lvl;
            return (
              <button
                key={lvl}
                type="button"
                disabled={answered}
                onClick={() => setPicked(lvl)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                  !answered &&
                    "border-white/15 hover:border-accent-amber/50 hover:bg-white/[0.03]",
                  answered && isCorrect && toneBorder[LEVELS[lvl].tone] + " " + toneBg[LEVELS[lvl].tone],
                  answered &&
                    isPicked &&
                    !isCorrect &&
                    "border-accent-red/40 bg-accent-red/[0.06]",
                  answered && !isPicked && !isCorrect && "border-white/10 opacity-50",
                )}
              >
                <div
                  className={cn(
                    "font-sans text-[11px] uppercase tracking-[0.14em]",
                    answered && isCorrect
                      ? toneText[LEVELS[lvl].tone]
                      : "text-slate-400",
                  )}
                >
                  Level {lvl}
                </div>
                <p className="ops-body mt-2 text-[13px] leading-[1.5] text-slate-200">
                  {LEVELS[lvl].analysis}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl border p-5 sm:p-6",
              correct ? toneBorder[LEVELS[c.correct].tone] : "border-accent-red/30 bg-accent-red/[0.05]",
              correct && toneBg[LEVELS[c.correct].tone],
            )}
          >
            <div
              className={cn(
                "font-sans text-[12px] uppercase tracking-[0.16em]",
                correct ? toneText[LEVELS[c.correct].tone] : "text-accent-red",
              )}
            >
              {correct ? "Correct" : "Not quite"} · {LEVELS[c.correct].name}
            </div>
            <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-100">
              {c.explanation}
            </p>
            {!correct && (
              <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-300">
                Project-level NPV is not always possible. The appropriate level of analysis
                depends on the quality and granularity of the disclosure.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
