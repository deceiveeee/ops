"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Phase = "identify" | "separate" | "price" | "test";

type Step = {
  n: number;
  title: string;
  detail: string;
  phase: Phase;
};

const STEPS: Step[] = [
  {
    n: 1,
    title: "Identify the major project stages",
    detail:
      "Map the investment from inception through mature operation. Where does the nature of the cash flow change?",
    phase: "identify",
  },
  {
    n: 2,
    title: "Identify what uncertainty resolves at each stage",
    detail:
      "What becomes known after a trial, a regulatory decision, a construction milestone, or a product launch?",
    phase: "identify",
  },
  {
    n: 3,
    title: "Separate possible outcomes and assign reasonable probabilities",
    detail:
      "Estimate the probability of success at each gate. Use disclosure, comparable outcomes, and informed judgment.",
    phase: "separate",
  },
  {
    n: 4,
    title: "Estimate cash flows conditional on each outcome",
    detail:
      "Build a cash-flow path for each branch — not just the base case. What happens if the trial fails? If construction is delayed?",
    phase: "separate",
  },
  {
    n: 5,
    title: "Identify which risks are connected to broad market conditions",
    detail:
      "Does the remaining cash flow move with the market? Or is its uncertainty primarily idiosyncratic?",
    phase: "price",
  },
  {
    n: 6,
    title: "Use comparable businesses where relevant",
    detail:
      "Pure-play comparables (from Lesson 8.2) provide evidence for the systematic risk of each stage.",
    phase: "price",
  },
  {
    n: 7,
    title: "Apply stage-specific rates only where the distinction is meaningful",
    detail:
      "Multiple rates are useful when stages carry economically different risks. Otherwise one reasonable rate suffices.",
    phase: "price",
  },
  {
    n: 8,
    title: "Test a range of probabilities and discount rates",
    detail:
      "Run sensitivity analysis. Does the investment conclusion survive across a reasonable range?",
    phase: "test",
  },
  {
    n: 9,
    title: "Update the analysis after major milestones",
    detail:
      "A successful trial or completed construction changes both the probability and the remaining risk profile. Revalue.",
    phase: "test",
  },
];

const PHASES: Record<Phase, { label: string; tone: "cyan" | "amber" | "red" | "green" }> = {
  identify: { label: "Identify", tone: "cyan" },
  separate: { label: "Separate", tone: "amber" },
  price: { label: "Price", tone: "red" },
  test: { label: "Test & update", tone: "green" },
};

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan",
  amber: "text-accent-amber",
  red: "text-accent-red",
  green: "text-accent-green",
};
const toneDot: Record<string, string> = {
  cyan: "bg-accent-cyan",
  amber: "bg-accent-amber",
  red: "bg-accent-red",
  green: "bg-accent-green",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/40",
  amber: "border-accent-amber/40",
  red: "border-accent-red/40",
  green: "border-accent-green/40",
};

export default function StageRiskInvestorWorkflow() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Phase legend */}
      <div className="flex flex-wrap gap-4">
        {(Object.keys(PHASES) as Phase[]).map((p) => (
          <div key={p} className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", toneDot[PHASES[p].tone])} aria-hidden />
            <span className={cn("font-mono text-[11px] uppercase tracking-[0.14em]", toneText[PHASES[p].tone])}>
              {PHASES[p].label}
            </span>
          </div>
        ))}
      </div>

      {/* Connected process */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step) => {
          const isOpen = active === step.n;
          const phase = PHASES[step.phase];
          return (
            <button
              key={step.n}
              type="button"
              onClick={() => setActive(isOpen ? null : step.n)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                isOpen
                  ? cn(toneBorder[phase.tone], "bg-white/[0.04]")
                  : "border-white/12 bg-white/[0.02] hover:border-white/25",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[11px] tabular-nums",
                    toneBorder[phase.tone],
                    toneText[phase.tone],
                  )}
                >
                  {step.n}
                </span>
                <span
                  className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", toneDot[phase.tone])}
                  aria-hidden
                />
              </div>
              <span className="mt-2 block text-[14px] font-medium leading-snug text-white">
                {step.title}
              </span>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="ops-body mt-2 text-[13px] leading-[1.6] text-slate-300">
                      {step.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          The loop closes at step 9: monitoring a milestone feeds back into step 1 of the next
          round. A successful trial does not merely confirm the old model — it produces a{" "}
          <span className="text-white">new project</span> with different remaining risks, and the
          valuation should reflect that.
        </p>
      </div>
    </div>
  );
}
