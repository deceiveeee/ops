"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Action = "investigate-distant" | "check-scale" | "check-price" | "check-marginal" | "check-ramp" | "insufficient";

type Conflict = {
  id: string;
  pattern: string;
  correct: Action;
  explanation: string;
};

const CONFLICTS: Conflict[] = [
  {
    id: "c1",
    pattern: "Positive NPV, but an eight-year payback period.",
    correct: "investigate-distant",
    explanation: "Test distant cash-flow assumptions. A long payback means the NPV depends heavily on forecasts years away, which may be less reliable. Also check liquidity exposure — can the company finance the capital commitment through the recovery period?",
  },
  {
    id: "c2",
    pattern: "High IRR (35%), but low NPV ($0.5M on a $1M investment).",
    correct: "check-scale",
    explanation: "The project may be efficient but immaterial in scale. A 35% return on $1M creates less value than a 15% return on $50M. Investigate whether the project can be scaled up, or whether it diverts attention from larger opportunities.",
  },
  {
    id: "c3",
    pattern: "EPS accretive, but negative estimated NPV.",
    correct: "check-price",
    explanation: "Accounting improvement may coexist with economic overpayment. Investigate the purchase price relative to the value acquired. EPS accretion can arise from financing structure or accounting treatment even when the buyer overpaid.",
  },
  {
    id: "c4",
    pattern: "Strong current ROIC (18%), but weak NPV on a new project ($2M).",
    correct: "check-marginal",
    explanation: "Historical performance may not describe marginal new investment. The company's existing assets may earn high returns while the new project earns inadequate ones. Investigate whether the new project truly resembles the existing business.",
  },
  {
    id: "c5",
    pattern: "Low first-year ROIC (4%), but positive NPV ($10M).",
    correct: "check-ramp",
    explanation: "Ramp-up costs may delay economic returns. A new factory, store, or product line typically earns low returns initially before reaching mature profitability. Investigate whether the low early ROIC reflects a normal ramp or a structural problem.",
  },
];

const OPTIONS: { key: Action; label: string }[] = [
  { key: "investigate-distant", label: "Test distant cash flows & liquidity" },
  { key: "check-scale", label: "Check scale materiality" },
  { key: "check-price", label: "Check price vs. value" },
  { key: "check-marginal", label: "Check marginal vs. historical" },
  { key: "check-ramp", label: "Check ramp-up timing" },
  { key: "insufficient", label: "Request more information" },
];

export default function MetricContradictionInvestigator() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Action>>({});
  const assign = (id: string, a: Action) => setPicks((p) => ({ ...p, [id]: a }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          The discipline
        </div>
        <p className="ops-body mt-3 text-[16px] leading-[1.65] text-slate-100">
          Contradictions between metrics should trigger{" "}
          <span className="text-white">investigation</span> rather than mechanical metric selection.
          Do not simply pick the favorable number — ask what the conflict reveals.
        </p>
      </div>

      <div className="space-y-4">
        {CONFLICTS.map((c) => {
          const pick = picks[c.id];
          const isCorrect = pick === c.correct;
          return (
            <div key={c.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <div className="flex items-start gap-2">
                <span className="mt-1 text-accent-amber" aria-hidden>⚠</span>
                <p className="text-[15px] leading-[1.55] text-slate-100">{c.pattern}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {OPTIONS.map((o) => {
                  const isPicked = pick === o.key;
                  return (
                    <button key={o.key} type="button"
                      onClick={() => assign(c.id, o.key)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                        !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                        isPicked && pick === c.correct && "border-accent-green bg-accent-green/15 text-accent-green",
                        isPicked && pick !== c.correct && "border-accent-red bg-accent-red/15 text-accent-red",
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {pick && (
                  <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <p className={cn("mt-2.5 text-[13px] leading-[1.6]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                      {isCorrect ? "✓ " : "✗ Reconsider — "}
                      <span className="text-slate-300">{c.explanation}</span>
                    </p>
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
