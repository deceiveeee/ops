"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type RedFlag = {
  id: string;
  weak: string;
  why: string;
  missing: string;
  stronger: string;
};

const FLAGS: RedFlag[] = [
  {
    id: "rf1",
    weak: "My strategy works because I am smarter than the market.",
    why: "Intelligence and effort do not, by themselves, change decisions in ways others cannot replicate. Without specifying how your decisions differ from consensus, the claim is untestable.",
    missing: "A specific description of the analytical lens, information source, time horizon, or behavioral advantage that produces different conclusions.",
    stronger: "My decisions differ from consensus in [specific way]. I have tested the edge on [N prior decisions] and the differential outcomes are large enough to overcome costs.",
  },
  {
    id: "rf2",
    weak: "The stock has already fallen, so downside is limited.",
    why: "A lower price does not imply lower risk. The decline can reflect genuine deterioration, and the next leg down can be larger than the last.",
    missing: "An estimate of current value, current risk, and current expected return — independent of the historical price.",
    stronger: "Based on current cash flows, current risk, and current price, the expected return is X% with a worst-case downside of Y%.",
  },
  {
    id: "rf3",
    weak: "This time is different.",
    why: "Sometimes things genuinely are different. But the phrase is most often used to dismiss historical evidence that contradicts a desired conclusion.",
    missing: "A specific explanation of which structural feature has changed, why prior patterns no longer apply, and what evidence would test the claim.",
    stronger: "[Specific feature] has changed in [specific way]. I expect [prior pattern] to weaken for [specific reason]. I will revisit if [evidence] appears.",
  },
  {
    id: "rf4",
    weak: "I will know when to sell.",
    why: "Without predefined conditions, the investor usually sells too late — after the thesis has already broken, or not at all.",
    missing: "Written invalidation conditions, defined in advance, while reasoning is still clear.",
    stronger: "I will sell if [specific fundamentals deteriorate], [specific risks materialize], or [price exceeds estimated value by X%].",
  },
  {
    id: "rf5",
    weak: "The manager has a great track record.",
    why: "Track records are noisy. With enough managers, chance alone produces impressive winners. A short record tells you almost nothing about skill.",
    missing: "Long horizon, risk adjustment, after-cost analysis, consistency with stated strategy, and a coherent process explanation.",
    stronger: "The manager's process is [specific], applied over [N years] across [N market environments], with [risk-adjusted] results that exceed a passive comparison after fees.",
  },
  {
    id: "rf6",
    weak: "I can tolerate volatility.",
    why: "Volatility tolerance is easy to overestimate in calm markets. The real test is behavior during a drawdown — which most investors have not experienced at the size they imagine.",
    missing: "A realistic stress test of behavior and finances under an actual large drawdown, ideally before it occurs.",
    stronger: "I have stress-tested my behavior and finances against a [X%] drawdown lasting [Y years]. My plan survives, and my rules will hold.",
  },
  {
    id: "rf7",
    weak: "The market is irrational.",
    why: "Markets can be irrational in aggregate without offering any particular investor a way to profit. 'Irrational' is a description, not a strategy.",
    missing: "An explanation of the specific mispricing, the mechanism creating it, and the mechanism that will correct it.",
    stronger: "I believe forced selling has temporarily reduced the price below a conservative estimate of value, and I can identify the mechanism, holding period, and risks.",
  },
];

export default function PhilosophyRedFlags() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>("rf1");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Diagnostic for common warning signs. Each red flag sounds decisive — but each one
          substitutes a feeling for evidence. Tap a flag to see what is missing and how to make
          the claim defensible.
        </p>
      </div>

      <div className="space-y-3">
        {FLAGS.map((f, i) => {
          const isOpen = open === f.id;
          return (
            <div key={f.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <button type="button" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                <span className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
                  isOpen ? "border-accent-cyan text-accent-cyan" : "border-accent-red/40 text-accent-red",
                )}>
                  {i + 1}
                </span>
                <span className="flex-1 text-[15px] font-medium leading-snug text-white">
                  <span className="text-accent-red/80">Flag · </span>&ldquo;{f.weak}&rdquo;
                </span>
                <span className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-mono text-sm text-accent-cyan transition-transform",
                  isOpen && "rotate-45")} aria-hidden>+</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden">
                    <div className="ops-body px-5 pb-5 space-y-3">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">Why it is insufficient</div>
                        <p className="mt-1 text-[14px] leading-[1.6] text-slate-100">{f.why}</p>
                      </div>
                      <div className="rounded-lg border border-accent-amber/20 bg-accent-amber/[0.05] px-3 py-2.5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-amber">Missing evidence · </span>
                        <span className="text-[13px] leading-[1.55] text-slate-100">{f.missing}</span>
                      </div>
                      <div className="rounded-lg border border-accent-green/25 bg-accent-green/[0.05] px-3 py-2.5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-green">Stronger replacement · </span>
                        <span className="text-[13px] italic leading-[1.55] text-slate-100">{f.stronger}</span>
                      </div>
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
