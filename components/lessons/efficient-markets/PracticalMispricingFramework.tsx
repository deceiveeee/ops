"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type PillarKey = "valuation" | "explanation" | "correction" | "survival";

const PILLARS: {
  key: PillarKey;
  letter: string;
  title: string;
  prompt: string;
  questions: string[];
}[] = [
  {
    key: "valuation",
    letter: "A",
    title: "Valuation",
    prompt: "What is it worth?",
    questions: [
      "What is the estimated intrinsic value under my central assumptions?",
      "Which assumptions drive most of the value?",
      "How sensitive is the estimate to changes in growth, margins, and discount rate?",
      "What does the current price imply about future cash flows?",
    ],
  },
  {
    key: "explanation",
    letter: "B",
    title: "Explanation",
    prompt: "Why might price differ from value?",
    questions: [
      "Why might the price differ from my estimated value?",
      "Is the market reacting to a genuine risk I have underweighted?",
      "Is forced buying or selling occurring in this name?",
      "Is the asset difficult to analyze, trade, or hold?",
    ],
  },
  {
    key: "correction",
    letter: "C",
    title: "Correction mechanism",
    prompt: "How does the gap close?",
    questions: [
      "What could cause market expectations to change?",
      "Is there an identifiable catalyst — or must I wait for general sentiment to shift?",
      "How long might the correction take?",
      "Could the mispricing widen before it narrows?",
    ],
  },
  {
    key: "survival",
    letter: "D",
    title: "Survival",
    prompt: "Can I stay in the trade?",
    questions: [
      "Can I tolerate the worst plausible adverse movement?",
      "Is leverage involved — mine or the company's?",
      "Could liquidity disappear when I most need to exit?",
      "Is the position size survivable if every risk goes against me at once?",
      "What evidence would invalidate the thesis — and would I actually act on it?",
    ],
  },
];

export default function PracticalMispricingFramework() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<PillarKey>("valuation");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          A four-part framework. Each pillar identifies a different way an apparent mispricing can
          disappoint. A thesis that survives all four is meaningfully stronger than one that
          survives only the first.
        </p>
      </div>

      {/* Pillar selector */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PILLARS.map((p) => {
            const isActive = open === p.key;
            return (
              <button key={p.key} type="button"
                onClick={() => setOpen(p.key)}
                aria-pressed={isActive}
                className={cn("rounded-xl border px-3 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  isActive ? "border-accent-cyan/50 bg-accent-cyan/[0.08]" : "border-white/10 bg-white/[0.02] hover:border-white/25")}>
                <div className={cn("font-mono text-[10px] uppercase tracking-[0.14em]", isActive ? "text-accent-cyan" : "text-slate-400")}>
                  {p.letter}
                </div>
                <div className={cn("mt-1 text-[13px] font-medium leading-tight", isActive ? "text-white" : "text-slate-200")}>
                  {p.title}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">{p.prompt}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active pillar detail */}
      <AnimatePresence mode="wait">
        <motion.div key={open}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
          {(() => {
            const p = PILLARS.find((x) => x.key === open)!;
            return (
              <>
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">
                  Pillar {p.letter} · {p.title}
                </div>
                <p className="ops-body mt-2 text-[15px] leading-[1.6] text-slate-100">{p.prompt}</p>
                <ul className="mt-4 space-y-2.5">
                  {p.questions.map((q) => (
                    <li key={q} className="flex items-start gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5 text-[14px] leading-[1.55] text-slate-100">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{q}
                    </li>
                  ))}
                </ul>
              </>
            );
          })()}
        </motion.div>
      </AnimatePresence>

      <div className="rounded-2xl border border-accent-red/30 bg-gradient-to-br from-accent-red/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.5] text-white">
          An investment thesis is incomplete without a survival plan.
        </p>
        <p className="ops-body mt-2 text-[14px] leading-[1.65] text-slate-200">
          Valuation identifies a possible gap. Explanation rules out hidden risks. Correction
          identifies the path to realization. Survival determines whether the investor is still in
          the seat when the path arrives.
        </p>
      </div>
    </div>
  );
}
