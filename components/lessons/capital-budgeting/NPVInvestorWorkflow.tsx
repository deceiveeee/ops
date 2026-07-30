"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Phase = "estimate" | "decide" | "monitor";

type Step = {
  n: number;
  title: string;
  detail: string;
  phase: Phase;
};

const STEPS: Step[] = [
  {
    n: 1, title: "Identify the capital being committed",
    detail: "Construction, equipment, pre-opening costs, working capital, acquisition price, and opportunity costs.",
    phase: "estimate",
  },
  {
    n: 2, title: "Estimate incremental after-tax cash flows",
    detail: "Revenue, operating costs, taxes, working capital, cannibalization, synergies — only what changes because of the project.",
    phase: "estimate",
  },
  {
    n: 3, title: "Match discount rates to the risk of those cash flows",
    detail: "Use the project's own systematic risk (Lesson 8.2) and stage-specific rates where meaningful (Lesson 8.3).",
    phase: "estimate",
  },
  {
    n: 4, title: "Calculate present value",
    detail: "Discount each cash flow at the appropriate rate. The sum is the estimated value of the future benefits.",
    phase: "estimate",
  },
  {
    n: 5, title: "Subtract capital committed",
    detail: "PV minus capital committed equals NPV. This is the estimated value created or destroyed.",
    phase: "decide",
  },
  {
    n: 6, title: "Test scenarios and break-even assumptions",
    detail: "Run bear, base, and bull cases. Identify which assumptions determine whether NPV is positive.",
    phase: "decide",
  },
  {
    n: 7, title: "Compare estimated value with market expectations",
    detail: "Corporate value creation differs from stock-price reaction. The market may already expect more or less.",
    phase: "decide",
  },
  {
    n: 8, title: "Track actual performance against the original thesis",
    detail: "Compare execution, operating results, cash returns, and management credibility with the original NPV assumptions.",
    phase: "monitor",
  },
];

const PHASES: Record<Phase, { label: string; tone: "cyan" | "amber" | "green" }> = {
  estimate: { label: "Estimate", tone: "cyan" },
  decide: { label: "Decide", tone: "amber" },
  monitor: { label: "Monitor", tone: "green" },
};

const toneText: Record<string, string> = { cyan: "text-accent-cyan", amber: "text-accent-amber", green: "text-accent-green" };
const toneDot: Record<string, string> = { cyan: "bg-accent-cyan", amber: "bg-accent-amber", green: "bg-accent-green" };
const toneBorder: Record<string, string> = { cyan: "border-accent-cyan/40", amber: "border-accent-amber/40", green: "border-accent-green/40" };

export default function NPVInvestorWorkflow() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        {(Object.keys(PHASES) as Phase[]).map((p) => (
          <div key={p} className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", toneDot[PHASES[p].tone])} aria-hidden />
            <span className={cn("font-sans text-[11px] uppercase tracking-[0.14em]", toneText[PHASES[p].tone])}>
              {PHASES[p].label}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => {
          const isOpen = active === step.n;
          const phase = PHASES[step.phase];
          return (
            <button
              key={step.n} type="button"
              onClick={() => setActive(isOpen ? null : step.n)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                isOpen ? cn(toneBorder[phase.tone], "bg-white/[0.04]") : "border-white/12 bg-white/[0.02] hover:border-white/25",
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[11px] tabular-nums",
                  toneBorder[phase.tone], toneText[phase.tone],
                )}>
                  {step.n}
                </span>
                <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", toneDot[phase.tone])} aria-hidden />
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
          The workflow is a continuous loop. Monitoring (step 8) feeds back into estimation (step 1):
          actual results revise the investor&apos;s assumptions, which change the estimated NPV, which
          may change the investment thesis itself.
        </p>
      </div>
    </div>
  );
}
