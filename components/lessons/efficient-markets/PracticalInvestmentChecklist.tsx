"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const CHECKLIST = [
  {
    q: "What specific information supports my thesis?",
    detail: "Be precise. 'The company is growing' is not information. 'Same-store sales grew 8% in the most recent quarter while new-store openings accelerated' is information.",
  },
  {
    q: "Is that information already public and widely known?",
    detail: "If it appeared in a press release, earnings call, or 10-K, assume other investors have seen it. The question is whether the market has fully processed its implications.",
  },
  {
    q: "What does the current price appear to assume?",
    detail: "Estimate the growth rate, margin level, or cash-flow trajectory that the current valuation implies. This is the benchmark your thesis must beat.",
  },
  {
    q: "How does my forecast differ from the market's forecast?",
    detail: "If your forecast matches the consensus, there is no edge. The difference must be specific, quantifiable, and defensible — not merely optimism.",
  },
  {
    q: "Why might other investors be overlooking or misinterpreting this?",
    detail: "If you cannot explain why others have missed it, you may be the one who is wrong. The best edges come with a logical explanation for the market's oversight.",
  },
  {
    q: "What evidence would prove my thesis wrong?",
    detail: "If you cannot identify falsifying evidence in advance, your thesis may be unfalsifiable — which means it is faith, not analysis.",
  },
  {
    q: "Could the expected return simply compensate me for taking more risk?",
    detail: "A higher expected return may reflect higher systematic risk, not mispricing. Compare your expected return with the return required for the investment's risk.",
  },
];

const STORAGE_KEY = "ops-m9-l91-checklist";

export default function PracticalInvestmentChecklist() {
  const reduce = useReducedMotion();
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const completed = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
            Pre-investment checklist
          </span>
          <span className="font-sans text-[12px] text-slate-400">{completed}/{CHECKLIST.length}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-accent-cyan transition-all duration-300"
            style={{ width: `${(completed / CHECKLIST.length) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-2.5">
        {CHECKLIST.map((item, i) => {
          const isChecked = checked[i];
          return (
            <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <button type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                aria-pressed={isChecked}>
                <span className={cn(
                  "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border text-[11px] transition-colors",
                  isChecked ? "border-accent-green bg-accent-green/20 text-accent-green" : "border-white/20 text-transparent",
                )}>
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <span className={cn("text-[15px] leading-[1.5]", isChecked ? "text-slate-300" : "text-white")}>
                    {item.q}
                  </span>
                </div>
                <span className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center font-sans text-xs text-accent-cyan transition-transform",
                  isChecked && "rotate-45")} aria-hidden>+</span>
              </button>
              <AnimatePresence initial={false}>
                {isChecked && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="ops-body px-5 pb-4 pl-14 text-[14px] leading-[1.65] text-slate-300">
                      {item.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {completed === CHECKLIST.length && (
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-5 sm:p-6">
          <p className="ops-body text-[16px] leading-[1.65] text-slate-100">
            All seven questions checked. This checklist does not guarantee success — but it forces the
            discipline of distinguishing a genuine thesis from a favorable opinion.
          </p>
        </div>
      )}
    </div>
  );
}
