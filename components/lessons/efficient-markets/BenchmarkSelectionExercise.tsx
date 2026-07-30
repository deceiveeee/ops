"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Portfolio = {
  id: string;
  description: string;
  options: { id: string; label: string; correct: boolean; feedback: string }[];
};

const PORTFOLIOS: Portfolio[] = [
  {
    id: "p1",
    description: "Large US company portfolio (Apple, Microsoft, Johnson & Johnson, etc.)",
    options: [
      { id: "sp500", label: "S&P 500", correct: true, feedback: "Correct — a broad large-cap US equity index matches the opportunity set and risk profile." },
      { id: "tech", label: "Technology-sector index", correct: false, feedback: "Too narrow — this portfolio is diversified across sectors, not concentrated in technology." },
      { id: "bond", label: "Total bond index", correct: false, feedback: "Wrong asset class — comparing equities to bonds tells you nothing about manager skill." },
      { id: "intl", label: "International developed-market index", correct: false, feedback: "Wrong geography — these are US companies, not international ones." },
    ],
  },
  {
    id: "p2",
    description: "Small technology company portfolio (emerging software and semiconductor firms)",
    options: [
      { id: "sp500", label: "S&P 500", correct: false, feedback: "Too broad and large-cap — the S&P 500 contains large companies across all sectors. It does not isolate small-cap tech risk." },
      { id: "smalltech", label: "Small-cap technology index", correct: true, feedback: "Correct — a small-cap technology index captures both the size and sector exposure of this portfolio." },
      { id: "bond", label: "Total bond index", correct: false, feedback: "Wrong asset class entirely." },
      { id: "intl", label: "International developed-market index", correct: false, feedback: "Wrong geography and wrong size profile." },
    ],
  },
  {
    id: "p3",
    description: "70% US technology stocks, 20% semiconductor stocks, 10% cash",
    options: [
      { id: "sp500", label: "S&P 500", correct: false, feedback: "The S&P 500 is diversified across sectors. This portfolio is 90% technology — the benchmark should reflect that concentration." },
      { id: "tech", label: "Technology-sector index (adjusted for cash)", correct: true, feedback: "Correct — a technology-sector index reflects the concentration. A 90/10 stock/cash blend is the most defensible comparison." },
      { id: "bond", label: "Total bond index", correct: false, feedback: "Wrong asset class." },
      { id: "blended", label: "60/40 stock-and-bond benchmark", correct: false, feedback: "This portfolio has no bonds. A 60/40 mix introduces a completely different risk profile." },
    ],
  },
  {
    id: "p4",
    description: "High-yield corporate bond fund",
    options: [
      { id: "sp500", label: "S&P 500", correct: false, feedback: "Equity benchmark for a bond fund — this comparison is meaningless." },
      { id: "tech", label: "Technology-sector index", correct: false, feedback: "Wrong asset class entirely." },
      { id: "hy", label: "High-yield bond index", correct: true, feedback: "Correct — a high-yield bond index matches the credit quality and asset class of this fund." },
      { id: "intl", label: "International developed-market index", correct: false, feedback: "Wrong asset class and geography." },
    ],
  },
];

export default function BenchmarkSelectionExercise() {
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const assign = (pid: string, oid: string) => setAnswers((p) => ({ ...p, [pid]: oid }));
  const correctCount = PORTFOLIOS.filter((p) => {
    const a = answers[p.id];
    return a && p.options.find((o) => o.id === a)?.correct;
  }).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          A benchmark should resemble the opportunity set and risks of the strategy being evaluated.
          A manager should be judged against the return available from taking similar risks without
          paying for active selection.
        </p>
      </div>

      <div className="space-y-4">
        {PORTFOLIOS.map((p, pi) => {
          const pick = answers[p.id];
          const pickedOption = p.options.find((o) => o.id === pick);
          const isCorrect = pickedOption?.correct;
          return (
            <div key={p.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-[11px] text-slate-500">{pi + 1}</span>
                <p className="text-[15px] leading-[1.55] text-slate-100">{p.description}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.options.map((o) => {
                  const isPicked = pick === o.id;
                  return (
                    <button key={o.id} type="button"
                      onClick={() => assign(p.id, o.id)}
                      className={cn("rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        !pick && "border-white/15 text-slate-300 hover:border-white/30",
                        pick && isPicked && o.correct && "border-accent-green bg-accent-green/15 text-accent-green",
                        pick && isPicked && !o.correct && "border-accent-red bg-accent-red/15 text-accent-red",
                        pick && !isPicked && "border-white/10 text-slate-500")}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {pick && (
                  <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <p className={cn("mt-2.5 text-[13px] leading-[1.55]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                      {isCorrect ? "✓ " : "✗ "}<span className="text-slate-300">{pickedOption?.feedback}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {correctCount === PORTFOLIOS.length && (
        <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5">
          <p className="ops-body text-[15px] leading-[1.6] text-slate-100">
            No benchmark is always perfect. The goal is a defensible comparison — not false precision.
          </p>
        </div>
      )}
    </div>
  );
}
