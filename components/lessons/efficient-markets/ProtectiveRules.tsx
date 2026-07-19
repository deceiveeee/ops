"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Rule = {
  n: number;
  title: string;
  prompt: string;
  why: string;
  details: string[];
  callout?: string;
};

const RULES: Rule[] = [
  {
    n: 1,
    title: "Write the thesis before buying",
    prompt: "Force the reasoning into written form before the trade.",
    why: "Before buying, record why the asset appears attractive, what the market seems to expect, the valuation assumptions, the major risks, the correction mechanism, and the evidence that would invalidate the thesis.",
    details: [
      "Why the asset appears attractive",
      "What the market seems to expect",
      "Valuation assumptions",
      "Major risks",
      "Correction mechanism",
      "Evidence that would invalidate the thesis",
    ],
    callout: "Writing before buying reduces hindsight bias and thesis drift. A thesis that cannot be written cannot be tested.",
  },
  {
    n: 2,
    title: "Define position size in advance",
    prompt: "High conviction does not justify unlimited exposure.",
    why: "Position size should reflect confidence, downside, liquidity, concentration, correlation with other holdings, and potential permanent loss — not the strength of the feeling that motivated the trade.",
    details: [
      "Confidence in the thesis",
      "Worst plausible downside",
      "Liquidity of the position",
      "Concentration in the same name or sector",
      "Correlation with other holdings",
      "Potential permanent loss of capital",
    ],
    callout: "High conviction does not justify unlimited exposure.",
  },
  {
    n: 3,
    title: "Separate price changes from thesis changes",
    prompt: "Price moved. Did the thesis?",
    why: "A lower price does not automatically mean buy more. A lower price does not automatically mean sell. A higher price does not automatically validate the thesis. The investor must identify what actually changed.",
    details: [
      "Fundamentals",
      "Market expectations",
      "Risk profile",
      "Liquidity",
      "Sentiment only",
    ],
    callout: "Price moved. Did the thesis? If the answer is 'nothing changed,' the right action is often no action.",
  },
  {
    n: 4,
    title: "Use a cooling-off period",
    prompt: "Pause before emotionally charged decisions.",
    why: "For major decisions made under fear, excitement, or social pressure, pause, reread the thesis, seek disconfirming evidence, recalculate position size, and distinguish urgency from emotion.",
    details: [
      "Pause for a defined window before acting",
      "Reread the written thesis",
      "Actively seek disconfirming evidence",
      "Recalculate position size from scratch",
      "Distinguish genuine urgency from emotional pressure",
    ],
    callout: "The purpose of rules is not to eliminate judgment. It is to structure judgment before emotion dominates.",
  },
  {
    n: 5,
    title: "Schedule portfolio reviews",
    prompt: "Review at predefined intervals, not after every price tick.",
    why: "Review at predefined intervals, after material information arrives, after a thesis is invalidated, or after a risk-limit breach. Avoid reacting to every daily price movement.",
    details: [
      "Predefined calendar reviews (quarterly, annually)",
      "After material new information",
      "After thesis invalidation",
      "After a risk-limit breach",
      "Not after every daily price move",
    ],
    callout: "Discipline is not the same as constant monitoring. Over-checking invites over-trading.",
  },
];

export default function ProtectiveRules() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(1);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Investors often make their worst decisions during fear, excitement, and social pressure.
          The purpose of rules is not to eliminate judgment. It is to structure judgment before
          emotion dominates.
        </p>
      </div>

      <div className="space-y-3">
        {RULES.map((r) => {
          const isOpen = open === r.n;
          return (
            <div key={r.n} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <button type="button" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : r.n)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                <span className={cn("flex h-7 w-9 flex-shrink-0 items-center justify-center rounded-md border font-mono text-[11px]",
                  isOpen ? "border-accent-cyan text-accent-cyan" : "border-accent-amber/40 text-accent-amber")}>
                  {String(r.n).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[15px] font-medium", isOpen ? "text-white" : "text-slate-200")}>{r.title}</span>
                  <span className="block text-[12px] leading-snug text-slate-400">{r.prompt}</span>
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
                    <div className="ops-body px-5 pb-5">
                      <p className="text-[15px] leading-[1.65] text-slate-100">{r.why}</p>
                      <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {r.details.map((d) => (
                          <li key={d} className="flex items-start gap-2 text-[13px] leading-[1.55] text-slate-200">
                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{d}
                          </li>
                        ))}
                      </ul>
                      {r.callout && (
                        <div className="mt-3 rounded-lg border border-accent-cyan/25 bg-accent-cyan/[0.05] px-3 py-2.5">
                          <p className="text-[14px] leading-[1.55] text-slate-100">{r.callout}</p>
                        </div>
                      )}
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
