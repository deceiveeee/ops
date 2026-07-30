"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Verdict = "one-rate" | "stage-specific" | "insufficient";

type Investment = {
  id: string;
  name: string;
  blurb: string;
  correct: Verdict;
  explanation: string;
};

const INVESTMENTS: Investment[] = [
  {
    id: "i1",
    name: "Mature store expansion",
    blurb:
      "A successful retailer opens 100 new locations using its established format, with stable unit economics and no distinct risk stages.",
    correct: "one-rate",
    explanation:
      "All cash flows arise from similar operations with relatively stable risk. A single well-estimated discount rate is a reasonable approximation. Introducing multiple rates would add complexity without economic insight.",
  },
  {
    id: "i2",
    name: "Early-stage drug program",
    blurb:
      "A biotech company is advancing a novel molecule through clinical trials toward potential commercialization.",
    correct: "stage-specific",
    explanation:
      "The development stage carries primarily scientific and regulatory uncertainty. The commercial stage carries market, pricing, and competitive exposure. The risk sources are economically distinguishable, so stage-specific treatment may materially improve the analysis.",
  },
  {
    id: "i3",
    name: "Factory with distinct construction and operating stages",
    blurb:
      "A manufacturer builds a new plant under a fixed-price contract, then operates it to serve cyclical industrial demand.",
    correct: "stage-specific",
    explanation:
      "Construction under a fixed-price contract has different systematic exposure than operating cash flows tied to cyclical demand. Separating the stages captures an economically meaningful risk difference.",
  },
  {
    id: "i4",
    name: "Stable subscription contract",
    blurb:
      "A software company signs long-term subscription contracts with predictable renewal rates and minimal economic-cycle sensitivity.",
    correct: "one-rate",
    explanation:
      "The cash flows arise from one activity with stable risk. Sensitivity testing would likely confirm that the decision does not depend on stage-specific rates.",
  },
  {
    id: "i5",
    name: "Poorly disclosed internal software project",
    blurb:
      "A retailer's filings mention 'continued investment in digital capabilities' without any breakdown of stages, costs, or expected returns.",
    correct: "insufficient",
    explanation:
      "The disclosure is too limited to identify distinct stages, their risks, or their cash flows. The investor must either use one approximate rate with wide sensitivity bands, or wait for better information.",
  },
];

const OPTIONS: { key: Verdict; label: string; tone: "green" | "amber" | "slate" }[] = [
  { key: "one-rate", label: "One rate is reasonable", tone: "green" },
  { key: "stage-specific", label: "Stage-specific may help", tone: "amber" },
  { key: "insufficient", label: "Insufficient information", tone: "slate" },
];

const toneText: Record<string, string> = {
  green: "text-accent-green",
  amber: "text-accent-amber",
  slate: "text-slate-400",
};
const toneBorder: Record<string, string> = {
  green: "border-accent-green/40",
  amber: "border-accent-amber/40",
  slate: "border-white/20",
};
const toneBg: Record<string, string> = {
  green: "bg-accent-green/[0.06]",
  amber: "bg-accent-amber/[0.06]",
  slate: "bg-white/[0.03]",
};

export default function OneRateOrMultipleRatesDecision() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Verdict>>({});

  const assign = (id: string, v: Verdict) => {
    setPicks((prev) => ({ ...prev, [id]: v }));
  };

  return (
    <div className="space-y-6">
      {/* Principle */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          When does complexity help?
        </div>
        <p className="ops-body mt-3 text-[16px] leading-[1.65] text-slate-100">
          The professional objective is not to use the maximum possible number of discount rates. It
          is to represent <span className="text-white">economically meaningful risk differences</span>.
          One rate may be a reasonable approximation when risks cannot be separated or disclosure is
          insufficient.
        </p>
      </div>

      {/* One-rate checklist */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          One rate may be acceptable when…
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            "All cash flows arise from similar operations",
            "Business risk is relatively stable",
            "Stages cannot be separated reliably",
            "Public disclosure is too limited",
            "Comparable risk estimates are highly uncertain",
            "Sensitivity testing shows the decision is not materially affected",
          ].map((x) => (
            <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-200">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />
              {x}
            </li>
          ))}
        </ul>
      </div>

      {/* Classification exercise */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          For each investment, which approach is justified?
        </div>

        <div className="mt-5 space-y-4">
          {INVESTMENTS.map((inv) => {
            const pick = picks[inv.id];
            const isCorrect = pick === inv.correct;
            return (
              <div key={inv.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
                <div className="font-display text-[15px] font-medium text-white">{inv.name}</div>
                <p className="ops-body mt-1 text-[14px] leading-[1.55] text-slate-300">
                  {inv.blurb}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {OPTIONS.map((o) => {
                    const isPicked = pick === o.key;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => assign(inv.id, o.key)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                          !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                          isPicked && cn(toneBorder[o.tone], toneBg[o.tone], toneText[o.tone]),
                        )}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {pick && (
                    <motion.div
                      initial={reduce ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden"
                    >
                      <p
                        className={cn(
                          "mt-2.5 text-[13px] leading-[1.55]",
                          isCorrect ? "text-accent-green" : "text-accent-red",
                        )}
                      >
                        {isCorrect ? "✓ " : "✗ Reconsider — "}
                        <span className="text-slate-300">{inv.explanation}</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
