"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type StepKey = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS: Record<StepKey, { title: string; detail: string; items: string[] }> = {
  1: {
    title: "Protect the current business",
    detail: "Before any discretionary spending, fund what preserves existing operations and cash flows.",
    items: ["Maintenance capital expenditure", "Safety and compliance", "Regulatory obligations", "Essential technology", "Working capital"],
  },
  2: {
    title: "Preserve financial resilience",
    detail: "Ensure the balance sheet can absorb adverse scenarios without forcing destructive decisions.",
    items: ["Adequate liquidity", "Covenant headroom", "Manageable leverage", "Adverse-scenario capacity"],
  },
  3: {
    title: "Fund positive-NPV organic investment",
    detail: "Deploy capital where incremental returns exceed the cost of capital — at the margin.",
    items: ["Core competence", "Competitive advantage", "Attractive incremental returns", "Credible execution capacity"],
  },
  4: {
    title: "Compare acquisitions with all alternatives",
    detail: "An acquisition must clear a higher bar because it is typically large, irreversible, and carries integration risk.",
    items: ["Internal growth alternative", "Debt repayment benefit", "Buyback attractiveness", "Distribution option"],
  },
  5: {
    title: "Repurchase shares with price discipline",
    detail: "Buybacks create value only when the stock trades below intrinsic value and the balance sheet remains sound.",
    items: ["Price below intrinsic value", "Balance-sheet capacity preserved", "No superior alternatives forgone"],
  },
  6: {
    title: "Return genuinely excess capital",
    detail: "After higher-value uses are funded, distribute residual cash that has no credible internal purpose.",
    items: ["Dividends for sustainable excess", "Special distributions", "Avoid retaining cash without a plan"],
  },
};

export default function CapitalAllocationHierarchy() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<StepKey>(1);
  const s = STEPS[active];

  return (
    <div className="space-y-6">
      {/* Vertical flow */}
      <div className="space-y-2">
        {(Object.keys(STEPS) as unknown as StepKey[]).map((key, i) => (
          <div key={key} className="flex items-stretch gap-2">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActive(key)}
                className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                  active === key ? "border-accent-amber bg-accent-amber/15 text-accent-amber" : "border-white/20 text-slate-400 hover:border-white/40",
                )}
              >
                {key}
              </button>
              {i < 5 && <div className="my-0.5 w-px flex-1 bg-white/15" aria-hidden />}
            </div>
            <button
              type="button"
              onClick={() => setActive(key)}
              className={cn(
                "flex-1 rounded-xl border px-4 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                active === key ? "border-accent-amber/30 bg-accent-amber/[0.05]" : "border-white/8 bg-white/[0.02] hover:border-white/20",
              )}
            >
              <span className={cn("text-[14px] font-medium", active === key ? "text-white" : "text-slate-300")}>{STEPS[key].title}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Active step detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : undefined}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6"
        >
          <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
            Step {active} · {s.title}
          </div>
          <p className="ops-body mt-3 text-[16px] leading-[1.65] text-slate-100">{s.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {s.items.map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[12px] text-slate-200">{item}</span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-slate-100">
          This is a framework, not a universal law. When assumptions justify a different order — for
          example, when shares are deeply undervalued or an acquisition is exceptional — the hierarchy
          may bend. Management should not prefer internal growth merely because it preserves control
          over the cash.
        </p>
      </div>
    </div>
  );
}
