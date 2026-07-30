"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

type BiasKey = "loss" | "anchor" | "overconf" | "herd";

const BIASES: {
  key: BiasKey;
  letter: string;
  label: string;
  short: string;
  example: { setup: string; math?: string; observation?: string };
  disciplined: string;
}[] = [
  {
    key: "loss",
    letter: "A",
    label: "Loss aversion",
    short: "Losses feel larger than equivalent gains.",
    example: {
      setup: "Purchase price $100. Current price $60. Investor says: \u201CI will sell when it returns to $100.\u201D",
      observation: "The original purchase price does not determine future cash flows. The position is a forward-looking bet, not a record of what was paid.",
    },
    disciplined: "At the current price of $60, is this still the best use of capital?",
  },
  {
    key: "anchor",
    letter: "B",
    label: "Anchoring",
    short: "Investors over-rely on irrelevant reference prices.",
    example: {
      setup: "A stock falls from $80 to $40. Investor assumes it is \u201Chalf price.\u201D",
      observation: "A lower price is not automatically a lower valuation. The decline can reflect lower expected earnings, greater risk, debt problems, dilution, or permanent business deterioration.",
    },
    disciplined: "What does the current price imply about future cash flows — and is that implication reasonable?",
  },
  {
    key: "overconf",
    letter: "C",
    label: "Overconfidence",
    short: "Confidence that exceeds the quality of the evidence.",
    example: {
      setup: "Investor overestimates forecast accuracy, information quality, market timing skill, and ability to identify turning points.",
      observation: "The problem is not confidence itself. Confidence supports conviction. The problem is confidence that exceeds the quality of the evidence — and that resists revision when the evidence changes.",
    },
    disciplined: "What evidence would change my mind — and have I looked for it honestly?",
  },
  {
    key: "herd",
    letter: "D",
    label: "Herding",
    short: "Following the crowd can feel safer than being alone.",
    example: {
      setup: "Investors follow others because others may possess information, because following the crowd feels safer socially, and because professional reputations are less damaged by common mistakes than by lonely ones.",
      math: String.raw`\text{Price rises} \rightarrow \text{More attention} \rightarrow \text{More buying} \rightarrow \text{Further price increases}`,
      observation: "Rising prices appear to validate the crowd. The same mechanism can reverse — sharply — during a decline.",
    },
    disciplined: "If nobody else were buying, would I still find this investment attractive on its merits?",
  },
];

const CONSEQUENCES: Record<BiasKey, string[]> = {
  loss: [
    "Refusing to realize losses",
    "Selling winners too early",
    "Taking greater risk to \u201Cget back to even\u201D",
  ],
  anchor: [
    "Anchored to purchase price",
    "Anchored to 52-week high",
    "Anchored to old analyst target",
    "Anchored to prior margins or multiples",
  ],
  overconf: [
    "Excessive trading",
    "Concentrated positions",
    "Weak downside analysis",
    "Unwillingness to revise a thesis",
  ],
  herd: [
    "Buying what others are buying",
    "Avoiding what others avoid",
    "Benchmark-driven pressure",
    "Fear of missing out",
  ],
};

export default function PredictableBiases() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<BiasKey>("loss");
  const current = BIASES.find((b) => b.key === active)!;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          The goal is not to memorize a long catalog of named biases. Four patterns explain most
          predictable investor mistakes — and connect directly to investment decisions.
        </p>
      </div>

      {/* Bias selector */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-slate-400">
          Four directly relevant biases
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BIASES.map((b) => {
            const isActive = active === b.key;
            return (
              <button key={b.key} type="button"
                onClick={() => setActive(b.key)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  isActive
                    ? "border-accent-cyan/50 bg-accent-cyan/[0.08]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25",
                )}>
                <div className={cn("font-sans text-[10px] uppercase tracking-[0.14em]", isActive ? "text-accent-cyan" : "text-slate-400")}>
                  {b.letter}
                </div>
                <div className={cn("mt-1 text-[13px] font-medium leading-tight", isActive ? "text-white" : "text-slate-200")}>
                  {b.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active bias detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.key}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6"
        >
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-cyan">
            {current.label}
          </div>
          <p className="ops-body mt-2 text-[16px] leading-[1.6] text-slate-100">{current.short}</p>

          <div className="mt-4 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] px-4 py-3">
            <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-amber">Example</span>
            <p className="ops-body mt-1.5 text-[14px] leading-[1.6] text-slate-100">{current.example.setup}</p>
            {current.example.math && (
              <div className="mt-3 rounded-lg border border-white/10 bg-ink-950/40 px-3 py-2.5">
                <BlockMath>{current.example.math}</BlockMath>
              </div>
            )}
            {current.example.observation && (
              <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">{current.example.observation}</p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-red/20 bg-accent-red/[0.04] px-4 py-3">
              <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-red">How it shows up</div>
              <ul className="mt-2 space-y-1">
                {CONSEQUENCES[current.key].map((c) => (
                  <li key={c} className="flex items-start gap-2 text-[13px] leading-[1.5] text-slate-200">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />{c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-accent-green/25 bg-accent-green/[0.05] px-4 py-3">
              <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-green">Disciplined question</div>
              <p className="ops-body mt-2 text-[14px] leading-[1.55] text-slate-100">{current.disciplined}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="rounded-2xl border border-accent-cyan/25 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-white">
          A bias is not a personal flaw. It is a predictable pattern in how humans process
          uncertain information. Disciplined investors build habits — checklists, pre-mortems,
          position limits, and required evidence — that catch these patterns before they become
          decisions.
        </p>
      </div>
    </div>
  );
}
