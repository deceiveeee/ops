"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type CaseKey = "A" | "B" | "C" | "D";

type Case = {
  key: CaseKey;
  label: string;
  scenario: string;
  thesis: 1 | 2 | 3 | 4 | 5;
  valuation: 1 | 2 | 3 | 4 | 5;
  benchmark: 1 | 2 | 3 | 4 | 5;
  risk: 1 | 2 | 3 | 4 | 5;
  implementation: 1 | 2 | 3 | 4 | 5;
  outcome: 1 | 2 | 3 | 4 | 5;
  process: 1 | 2 | 3 | 4 | 5;
  interpretation: string;
  principle: string;
};

const CASES: Case[] = [
  {
    key: "A",
    label: "Case A",
    scenario: "An investor writes a clear thesis for a diversified industrial company, sizes the position conservatively at 2% of the portfolio, defines invalidation conditions in advance, and the position still loses 25% over twelve months because the company's largest customer cancels a contract.",
    thesis: 4, valuation: 4, benchmark: 4, risk: 4, implementation: 4, outcome: 1, process: 4,
    interpretation: "Poor outcome, potentially good process. The investor did everything right at the decision point — the loss came from an unpredictable event.",
    principle: "A bad outcome does not always mean a bad decision. Evaluate the reasoning, not just the result.",
  },
  {
    key: "B",
    label: "Case B",
    scenario: "An investor buys a single speculative biotech stock on a rumor with no written thesis, sizing it at 35% of the portfolio. The stock doubles in three months on positive trial news.",
    thesis: 1, valuation: 1, benchmark: 1, risk: 1, implementation: 1, outcome: 5, process: 1,
    interpretation: "Good outcome, poor process. The gain does not validate the strategy — it validates the danger of confusing luck with skill.",
    principle: "A profitable result does not validate the reasoning that produced it.",
  },
  {
    key: "C",
    label: "Case C",
    scenario: "An investor correctly identifies an overvalued momentum stock, takes a large leveraged short position, is forced to cover after a 40% adverse move wipes out the collateral, and then watches the stock fall 60% over the following year.",
    thesis: 4, valuation: 3, benchmark: 3, risk: 1, implementation: 1, outcome: 1, process: 2,
    interpretation: "Potentially sound analysis, poor implementation and survival planning. The investor was directionally correct but could not stay in the trade.",
    principle: "Being right eventually does not guarantee that the investor survives long enough to benefit.",
  },
  {
    key: "D",
    label: "Case D",
    scenario: "A diversified passive portfolio returns 7% over a year in which a speculative crypto sector returns 80%. The investor is tempted to abandon the passive strategy.",
    thesis: 5, valuation: 5, benchmark: 5, risk: 5, implementation: 5, outcome: 3, process: 5,
    interpretation: "Short-term underperformance does not automatically invalidate the philosophy. A passive portfolio trailing a speculative sector is exactly what the strategy predicts.",
    principle: "Judge the process over the correct horizon. One year tells you nothing about a 20-year strategy.",
  },
];

const DIMENSIONS = [
  { key: "thesis" as const, label: "Thesis quality" },
  { key: "valuation" as const, label: "Valuation discipline" },
  { key: "benchmark" as const, label: "Benchmark quality" },
  { key: "risk" as const, label: "Risk control" },
  { key: "implementation" as const, label: "Implementation" },
  { key: "outcome" as const, label: "Outcome" },
  { key: "process" as const, label: "Process" },
];

function scoreLabel(s: 1 | 2 | 3 | 4 | 5): string {
  return ["—", "Weak", "Below avg", "Average", "Above avg", "Strong"][s];
}
function scoreTone(s: 1 | 2 | 3 | 4 | 5): string {
  if (s <= 1) return "text-accent-red";
  if (s <= 2) return "text-accent-amber";
  if (s <= 3) return "text-slate-200";
  if (s <= 4) return "text-accent-cyan";
  return "text-accent-green";
}

export default function ProcessScorecard() {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState<Record<CaseKey, boolean>>({ A: false, B: false, C: false, D: false });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Score each case across seven dimensions. The distinction that matters most is between
          <span className="text-white"> outcome</span> (what the investor did not control) and{" "}
          <span className="text-white">process</span> (what they did).
        </p>
      </div>

      <div className="space-y-4">
        {CASES.map((c) => {
          const isOpen = revealed[c.key];
          return (
            <div key={c.key} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{c.label}</span>
              </div>
              <p className="mt-1.5 text-[14px] leading-[1.55] text-slate-100">{c.scenario}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {DIMENSIONS.map((d) => {
                  const score = c[d.key];
                  return (
                    <div key={d.key} className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1.5 text-center">
                      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-400">
                        {d.label}
                      </div>
                      <div className={cn("mt-0.5 font-mono text-[12px] font-semibold", scoreTone(score))}>
                        {scoreLabel(score)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden">
                    <div className="mt-3 space-y-2">
                      <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/[0.05] px-3 py-2.5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-cyan">Interpretation · </span>
                        <span className="text-[13px] leading-[1.55] text-slate-100">{c.interpretation}</span>
                      </div>
                      <div className="rounded-lg border border-accent-amber/25 bg-accent-amber/[0.05] px-3 py-2.5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-amber">Principle · </span>
                        <span className="text-[13px] leading-[1.55] text-slate-100">{c.principle}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="button"
                onClick={() => setRevealed((p) => ({ ...p, [c.key]: !p[c.key] }))}
                className="mt-3 rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-300 transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                {isOpen ? "Hide interpretation" : "Reveal interpretation"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.5] text-white">
          A profitable result does not validate the reasoning that produced it.
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-200">
          The discipline is to evaluate process and outcome separately — over many decisions, sound
          process produces better risk-adjusted outcomes than impulsive speculation, even if any
          single gamble can succeed by chance.
        </p>
      </div>
    </div>
  );
}
