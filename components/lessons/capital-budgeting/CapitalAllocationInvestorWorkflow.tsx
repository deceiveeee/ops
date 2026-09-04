"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Phase = "assess" | "evaluate" | "decide" | "monitor";

type Step = { n: number; title: string; detail: string; phase: Phase };

const STEPS: Step[] = [
  { n: 1, title: "Determine how much cash the business generates", detail: "Start with operating cash flow, adjusted for cyclicality and sustainability.", phase: "assess" },
  { n: 2, title: "Separate mandatory maintenance from discretionary capital", detail: "Estimate the minimum required to sustain operations. Only residual capital is available for discretionary allocation.", phase: "assess" },
  { n: 3, title: "Evaluate balance-sheet needs", detail: "Assess leverage, liquidity, room under its loan terms, and refinancing risk before considering growth or distributions.", phase: "assess" },
  { n: 4, title: "Estimate returns on incremental organic investment", detail: "Use marginal analysis: what return does the next dollar of growth capital earn?", phase: "evaluate" },
  { n: 5, title: "Evaluate acquisition price and synergies", detail: "Separate target quality from purchase price. Include integration costs and test synergy credibility.", phase: "evaluate" },
  { n: 6, title: "Assess debt-repayment benefits", detail: "Interest savings, distress-risk reduction, and financing flexibility versus opportunity cost.", phase: "evaluate" },
  { n: 7, title: "Compare repurchase price with intrinsic value", detail: "Buybacks create value only when the stock is attractively priced and the balance sheet can support it.", phase: "decide" },
  { n: 8, title: "Evaluate dividend sustainability", detail: "Can the dividend be maintained after maintenance and valuable growth spending?", phase: "decide" },
  { n: 9, title: "Determine whether retained cash has a credible purpose", detail: "Option value does not justify unlimited accumulation.", phase: "decide" },
  { n: 10, title: "Compare each use with the alternatives forgone", detail: "Capital allocation is an opportunity-cost problem at every step.", phase: "decide" },
  { n: 11, title: "Track actual outcomes", detail: "Compare original claims with realized results. Has the capital-allocation thesis been confirmed?", phase: "monitor" },
  { n: 12, title: "Judge management's credibility and discipline", detail: "Accumulate evidence over multiple cycles. Does management allocate capital well consistently?", phase: "monitor" },
];

const PHASES: Record<Phase, { label: string; tone: "cyan" | "amber" | "green" | "purple" }> = {
  assess: { label: "Assess", tone: "cyan" },
  evaluate: { label: "Evaluate", tone: "amber" },
  decide: { label: "Decide", tone: "green" },
  monitor: { label: "Monitor", tone: "purple" },
};

const toneText: Record<string, string> = { cyan: "text-accent-cyan", amber: "text-accent-amber", green: "text-accent-green", purple: "text-accent-purple" };
const toneDot: Record<string, string> = { cyan: "bg-accent-cyan", amber: "bg-accent-amber", green: "bg-accent-green", purple: "bg-accent-purple" };
const toneBorder: Record<string, string> = { cyan: "border-accent-cyan/40", amber: "border-accent-amber/40", green: "border-accent-green/40", purple: "border-accent-purple/40" };

export default function CapitalAllocationInvestorWorkflow() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        {(Object.keys(PHASES) as Phase[]).map((p) => (
          <div key={p} className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", toneDot[PHASES[p].tone])} aria-hidden />
            <span className={cn("font-sans text-[11px] uppercase tracking-[0.14em]", toneText[PHASES[p].tone])}>{PHASES[p].label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step) => {
          const isOpen = active === step.n;
          const phase = PHASES[step.phase];
          return (
            <button key={step.n} type="button"
              onClick={() => setActive(isOpen ? null : step.n)}
              className={cn("rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                isOpen ? cn(toneBorder[phase.tone], "bg-white/[0.04]") : "border-white/12 bg-white/[0.02] hover:border-white/25")}>
              <div className="flex items-center gap-3">
                <span className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[11px] tabular-nums",
                  toneBorder[phase.tone], toneText[phase.tone])}>{step.n}</span>
                <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", toneDot[phase.tone])} aria-hidden />
              </div>
              <span className="mt-2 block text-[14px] font-medium leading-snug text-white">{step.title}</span>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
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
          Evaluating a company requires more than valuing its existing operations. Investors must judge
          what management is likely to do with the next dollar of cash and whether its historical
          decisions justify confidence in future allocation.
        </p>
      </div>
    </div>
  );
}
