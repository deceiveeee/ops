"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Phase = "estimate" | "anchor" | "diagnose" | "monitor";

type Step = {
  n: number;
  title: string;
  detail: string;
  phase: Phase;
};

const STEPS: Step[] = [
  { n: 1, title: "Estimate incremental cash flows", detail: "Revenue, costs, taxes, working capital, cannibalization, opportunity costs.", phase: "estimate" },
  { n: 2, title: "Select a risk-appropriate discount rate", detail: "Match the rate to the systematic risk of the cash flows (Lessons 8.1–8.3).", phase: "estimate" },
  { n: 3, title: "Calculate NPV", detail: "NPV anchors the economic decision. This is the primary value-creation measure.", phase: "anchor" },
  { n: 4, title: "Calculate IRR and payback as supplementary views", detail: "IRR: implied percentage return. Payback: speed of capital recovery.", phase: "diagnose" },
  { n: 5, title: "Examine capital efficiency through PI", detail: "How much present value per dollar committed?", phase: "diagnose" },
  { n: 6, title: "Examine accounting impact through EPS", detail: "What is the near-term accounting effect? Does it agree or conflict with NPV?", phase: "diagnose" },
  { n: 7, title: "Monitor realized returns through ROIC", detail: "Are operating returns actually exceeding the cost of capital over time?", phase: "monitor" },
  { n: 8, title: "Investigate contradictions", detail: "When metrics disagree, do not pick the favorable one — ask what the conflict reveals.", phase: "monitor" },
  { n: 9, title: "Compare original forecasts with actual results", detail: "Track whether the assumptions behind the NPV are being realized.", phase: "monitor" },
  { n: 10, title: "Do not allow one favorable metric to substitute for the full analysis", detail: "No single metric answers every investment question.", phase: "monitor" },
];

const PHASES: Record<Phase, { label: string; tone: "cyan" | "amber" | "green" | "purple" }> = {
  estimate: { label: "Estimate", tone: "cyan" },
  anchor: { label: "Anchor", tone: "amber" },
  diagnose: { label: "Diagnose", tone: "green" },
  monitor: { label: "Monitor", tone: "purple" },
};

const toneText: Record<string, string> = { cyan: "text-accent-cyan", amber: "text-accent-amber", green: "text-accent-green", purple: "text-accent-purple" };
const toneDot: Record<string, string> = { cyan: "bg-accent-cyan", amber: "bg-accent-amber", green: "bg-accent-green", purple: "bg-accent-purple" };
const toneBorder: Record<string, string> = { cyan: "border-accent-cyan/40", amber: "border-accent-amber/40", green: "border-accent-green/40", purple: "border-accent-purple/40" };

export default function AlternativeMetricsInvestorWorkflow() {
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                )}>{step.n}</span>
                <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", toneDot[phase.tone])} aria-hidden />
              </div>
              <span className="mt-2 block text-[14px] font-medium leading-snug text-white">{step.title}</span>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="ops-body mt-2 text-[13px] leading-[1.6] text-slate-300">{step.detail}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          Use NPV to anchor the economic decision. Use the other metrics as diagnostic tools that
          reveal liquidity, timing, percentage return, capital efficiency, accounting effects, and
          realized operating performance.
        </p>
      </div>
    </div>
  );
}
