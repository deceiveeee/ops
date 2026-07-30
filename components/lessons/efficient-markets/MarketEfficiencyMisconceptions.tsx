"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Myth = {
  id: string;
  myth: string;
  reality: string;
  explanation: string;
};

const MYTHS: Myth[] = [
  {
    id: "m1",
    myth: "Market efficiency means prices are always correct.",
    reality: "Prices can be wrong. The challenge is identifying errors before they become obvious to everyone.",
    explanation: "Efficiency is a matter of degree. The practical question is not whether prices are perfect, but whether they are close enough, often enough, that exploiting deviations is difficult after costs.",
  },
  {
    id: "m2",
    myth: "Market efficiency means every investor is rational.",
    reality: "Some investors are irrational. Competition can still limit easily exploitable mistakes.",
    explanation: "Even if some participants behave irrationally, other participants who recognize the error can trade against it. The combined effect can still produce prices that are difficult to beat.",
  },
  {
    id: "m3",
    myth: "Market efficiency means prices cannot move sharply.",
    reality: "New information can justify rapid repricing. A sharp move may be exactly what efficiency predicts.",
    explanation: "When significant new information arrives, the correct price may change dramatically. A large price move does not prove inefficiency — it may reflect a correct, rapid adjustment to news.",
  },
  {
    id: "m4",
    myth: "Market efficiency means financial analysis is useless.",
    reality: "Analysis is essential to understand expectations, valuation, risk, and possible mispricing.",
    explanation: "Efficiency does not mean prices are magically correct. It means investors who do analysis compete to find errors, and their effort is what makes prices informative. Without analysis, prices would be less efficient.",
  },
  {
    id: "m5",
    myth: "Market efficiency means nobody can outperform.",
    reality: "Some investors may outperform. The difficulty is distinguishing skill from luck, risk exposure, and costs.",
    explanation: "Efficiency does not claim outperformance is impossible. It claims that consistently identifying mispriced assets after costs is very difficult, and that past outperformance does not reliably predict future outperformance.",
  },
];

export default function MarketEfficiencyMisconceptions() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {MYTHS.map((m, i) => {
        const isOpen = open === m.id;
        return (
          <div key={m.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : m.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            >
              <span className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[10px]",
                isOpen ? "border-accent-cyan text-accent-cyan" : "border-accent-red/40 text-accent-red",
              )}>
                {i + 1}
              </span>
              <span className="flex-1 text-[15px] font-medium leading-snug text-white">
                <span className="text-accent-red/80">Myth: </span>{m.myth}
              </span>
              <span className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-sans text-sm text-accent-cyan transition-transform",
                isOpen && "rotate-45")} aria-hidden>+</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="ops-body px-5 pb-5">
                    <div className="rounded-lg border border-accent-green/20 bg-accent-green/[0.05] p-3">
                      <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-green">Reality</span>
                      <p className="mt-1 text-[15px] leading-[1.65] text-slate-100">{m.reality}</p>
                    </div>
                    <p className="mt-3 text-[14px] leading-[1.65] text-slate-300">{m.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.05] px-5 py-4">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Market efficiency is not an unquestionable truth. It is a practical challenge and a
          reasonable baseline assumption — the default against which any claim of investment edge must
          be measured.
        </p>
      </div>
    </div>
  );
}
