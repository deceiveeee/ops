"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Step = {
  n: number;
  title: string;
  detail: string;
  phase: "identify" | "estimate" | "decide" | "monitor";
};

const STEPS: Step[] = [
  {
    n: 1,
    title: "Identify the major use of capital",
    detail: "Find the investment the market will judge: a factory, a store program, an acquisition, a drug program.",
    phase: "identify",
  },
  {
    n: 2,
    title: "Locate the relevant disclosures",
    detail: "10-K, MD&A, capex guidance, segment notes, 10-Qs, earnings calls, investor decks, 8-Ks.",
    phase: "identify",
  },
  {
    n: 3,
    title: "Estimate how much capital is committed",
    detail: "Reconstruct total spending from guidance, the PP&E note, and transaction announcements.",
    phase: "estimate",
  },
  {
    n: 4,
    title: "Identify the economic drivers of future cash flow",
    detail: "Unit economics, volumes, prices, margins, utilization, milestones — whichever metrics carry the economics.",
    phase: "estimate",
  },
  {
    n: 5,
    title: "Separate known facts from investor assumptions",
    detail: "Distinguish what management has disclosed from what the investor must estimate independently.",
    phase: "estimate",
  },
  {
    n: 6,
    title: "Estimate incremental cash flows",
    detail: "Build a range of cash-flow paths. Include ramp, maintenance, closures, cannibalization, and taxes.",
    phase: "estimate",
  },
  {
    n: 7,
    title: "Match the discount rate to the project's systematic risk",
    detail: "Use the project's own beta — via pure-play comparables — not automatically the parent company's rate.",
    phase: "decide",
  },
  {
    n: 8,
    title: "Use scenarios and sensitivity analysis",
    detail: "Run bear, base, and bull cases. Identify which assumptions move NPV the most.",
    phase: "decide",
  },
  {
    n: 9,
    title: "Identify break-even assumptions",
    detail: "Find the sales level, margin, or cost at which NPV turns negative. That is the cushion the project has.",
    phase: "decide",
  },
  {
    n: 10,
    title: "Track actual results against management's original claims",
    detail: "Compare execution, operating, financial, and strategic outcomes with the original targets.",
    phase: "monitor",
  },
];

const PHASES = {
  identify: { label: "Identify", tone: "cyan" as const },
  estimate: { label: "Estimate", tone: "amber" as const },
  decide: { label: "Decide", tone: "green" as const },
  monitor: { label: "Monitor", tone: "purple" as const },
};

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan",
  amber: "text-accent-amber",
  green: "text-accent-green",
  purple: "text-accent-purple",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/40",
  amber: "border-accent-amber/40",
  green: "border-accent-green/40",
  purple: "border-accent-purple/40",
};
const toneDot: Record<string, string> = {
  cyan: "bg-accent-cyan",
  amber: "bg-accent-amber",
  green: "bg-accent-green",
  purple: "bg-accent-purple",
};

export default function InvestorProjectWorkflow() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Phase legend */}
      <div className="flex flex-wrap gap-3">
        {(Object.keys(PHASES) as (keyof typeof PHASES)[]).map((p) => (
          <div key={p} className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", toneDot[PHASES[p].tone])} aria-hidden />
            <span className={cn("font-mono text-[11px] uppercase tracking-[0.14em]", toneText[PHASES[p].tone])}>
              {PHASES[p].label}
            </span>
          </div>
        ))}
      </div>

      {/* Connected process */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {STEPS.map((step) => {
          const isOpen = active === step.n;
          return (
            <button
              key={step.n}
              type="button"
              onClick={() => setActive(isOpen ? null : step.n)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                isOpen
                  ? cn(toneBorder[PHASES[step.phase].tone], "bg-white/[0.04]")
                  : "border-white/12 bg-white/[0.02] hover:border-white/25",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[11px] tabular-nums",
                    toneBorder[PHASES[step.phase].tone],
                    toneText[PHASES[step.phase].tone],
                  )}
                >
                  {step.n}
                </span>
                <span className="text-[15px] font-medium leading-snug text-white">
                  {step.title}
                </span>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="ops-body mt-3 pl-10 text-[14px] leading-[1.6] text-slate-300">
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
          The workflow is a connected loop, not a checklist.{" "}
          <span className="text-white">Monitoring</span> feeds back into{" "}
          <span className="text-white">identification</span> — actual results revise the
          investor&apos;s assumptions about the next round of capital allocation. A company that
          repeatedly misses targets loses credibility, and its future guidance deserves more
          skeptical weighting.
        </p>
      </div>
    </div>
  );
}
