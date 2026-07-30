"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Diagnosis = "execution" | "aggressive" | "external" | "timing" | "design" | "insufficient";

const VARIANCES: { id: string; metric: string; variance: string; correct: Diagnosis; explanation: string }[] = [
  { id: "v1", metric: "Store openings", variance: "40 vs 50 planned", correct: "execution", explanation: "Fewer openings may reflect construction delays, permitting issues, or site-availability problems — execution-related rather than strategic." },
  { id: "v2", metric: "Opening cost", variance: "$1.75M vs $1.60M", correct: "aggressive", explanation: "Higher cost suggests the original $1.60M estimate may have been too optimistic, or that construction inflation was underestimated." },
  { id: "v3", metric: "Sales 8% below plan", variance: "Below target trajectory", correct: "aggressive", explanation: "Below-plan sales suggest the $2.7M mature-sales assumption may have been too optimistic for newer markets, or consumer demand is weaker." },
  { id: "v4", metric: "Margin 18% vs 21%", variance: "300 bps below target", correct: "external", explanation: "Margin pressure may reflect industry-wide labor or food-cost inflation — external conditions rather than company-specific errors." },
  { id: "v5", metric: "Synergies $8M vs $25M", variance: "68% below target", correct: "aggressive", explanation: "Synergy shortfall suggests the original $25M target may have been aggressive, or integration execution was poor. Possibly both." },
  { id: "v6", metric: "Integration $65M vs $40M", variance: "63% over budget", correct: "design", explanation: "Higher integration costs may reflect a poorly designed acquisition plan, underestimated complexity, or both." },
];

const OPTIONS: { key: Diagnosis; label: string }[] = [
  { key: "execution", label: "Execution failure" },
  { key: "aggressive", label: "Aggressive assumptions" },
  { key: "external", label: "External conditions" },
  { key: "timing", label: "Temporary timing" },
  { key: "design", label: "Capital-allocation design" },
  { key: "insufficient", label: "Insufficient info" },
];

export default function ForecastActualDiagnosis() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Diagnosis>>({});
  const assign = (id: string, d: Diagnosis) => setPicks((p) => ({ ...p, [id]: d }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Classify each variance
        </div>
        <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
          Each miss may have multiple causes. Choose the most likely primary driver. Mixed classifications are acceptable.
        </p>
        <div className="mt-4 space-y-3">
          {VARIANCES.map((v) => {
            const pick = picks[v.id];
            return (
              <div key={v.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[14px] text-white">{v.metric}</span>
                  <span className="font-sans text-[12px] text-accent-red">{v.variance}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {OPTIONS.map((o) => {
                    const isPicked = pick === o.key;
                    return (
                      <button key={o.key} type="button" onClick={() => assign(v.id, o.key)}
                        className={cn("rounded-full border px-3 py-1 text-[11px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                          !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                          isPicked && "border-accent-amber bg-accent-amber/15 text-accent-amber")}>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {pick && (
                    <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                      <p className="mt-2 text-[12px] leading-[1.5] text-slate-300">{v.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          A single year of misses does not prove the strategy is wrong. But repeated variances in the
          same direction — consistently higher costs, lower margins, weaker synergies — suggest
          systematic optimism in the original assumptions rather than one-time bad luck.
        </p>
      </div>
    </div>
  );
}
