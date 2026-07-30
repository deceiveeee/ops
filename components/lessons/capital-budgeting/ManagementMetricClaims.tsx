"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Claim = {
  id: string;
  statement: string;
  emphasizedMetric: string;
  questionNeeded: string;
};

const CLAIMS: Claim[] = [
  {
    id: "cl1",
    statement: "\"This acquisition has a compelling 25% IRR.\"",
    emphasizedMetric: "IRR",
    questionNeeded: "Is the investment large enough to create meaningful value? A 25% IRR on a small acquisition may be immaterial. What is the NPV?",
  },
  {
    id: "cl2",
    statement: "\"The project pays back in just two years.\"",
    emphasizedMetric: "Payback",
    questionNeeded: "Are valuable or costly later cash flows being ignored? What happens after the payback date?",
  },
  {
    id: "cl3",
    statement: "\"The transaction is EPS accretive in year one.\"",
    emphasizedMetric: "EPS accretion",
    questionNeeded: "Was the acquisition price economically attractive? EPS accretion can arise from financing effects even when value is destroyed.",
  },
  {
    id: "cl4",
    statement: "\"This investment will grow revenue by 20%.\"",
    emphasizedMetric: "Revenue growth",
    questionNeeded: "How much capital is required, and at what margin? Revenue growth without adequate returns destroys value.",
  },
  {
    id: "cl5",
    statement: "\"Our ROIC is 15%, well above our cost of capital.\"",
    emphasizedMetric: "ROIC",
    questionNeeded: "Is the calculation excluding unsuccessful investments or goodwill? Does this ROIC reflect the new project, or only legacy assets?",
  },
  {
    id: "cl6",
    statement: "\"We are returning $5 billion to shareholders through buybacks.\"",
    emphasizedMetric: "Buyback",
    questionNeeded: "Did the share count actually decline (vs. offsetting stock-based compensation)? At what price were shares repurchased relative to intrinsic value?",
  },
];

const METRICS = ["IRR", "Payback", "EPS accretion", "Revenue growth", "ROIC", "Buyback", "Not sure"];

export default function ManagementMetricClaims() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const assign = (id: string, metric: string) => {
    setPicks((p) => ({ ...p, [id]: metric }));
    setRevealed((p) => ({ ...p, [id]: true }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          Management may emphasize the measure that presents a decision most favorably. The
          investor should ask <span className="text-white">why this metric was selected</span> and{" "}
          <span className="text-white">what it leaves out</span>. This is analytical discipline, not
          an assumption of deception.
        </p>
      </div>

      <div className="space-y-4">
        {CLAIMS.map((c) => {
          const pick = picks[c.id];
          const isShown = revealed[c.id];
          const isCorrect = pick === c.emphasizedMetric;
          return (
            <div key={c.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <p className="text-[15px] font-medium leading-[1.55] text-slate-100">{c.statement}</p>
              <div className="mt-3">
                <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">
                  Which metric is being emphasized?
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {METRICS.map((m) => (
                    <button key={m} type="button"
                      onClick={() => assign(c.id, m)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                        !isShown && "border-white/15 text-slate-300 hover:border-white/30",
                        isShown && pick === m && isCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                        isShown && pick === m && !isCorrect && "border-accent-red bg-accent-red/15 text-accent-red",
                        isShown && pick !== m && "border-white/10 text-slate-500",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <AnimatePresence>
                {isShown && (
                  <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <div className={cn("mt-3 rounded-lg border p-3",
                      isCorrect ? "border-accent-green/20 bg-accent-green/[0.04]" : "border-accent-red/20 bg-accent-red/[0.04]")}>
                      <div className={cn("font-sans text-[10px] uppercase tracking-[0.14em]",
                        isCorrect ? "text-accent-green" : "text-accent-red")}>
                        {isCorrect ? "Correct metric identified" : "Reconsider"}
                      </div>
                      <p className="ops-body mt-1.5 text-[14px] leading-[1.6] text-slate-100">
                        <span className="font-medium">Question the investor should ask: </span>
                        {c.questionNeeded}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
