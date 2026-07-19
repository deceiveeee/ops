"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Classification = "idiosyncratic" | "systematic" | "both" | "insufficient";

type Event = {
  id: string;
  text: string;
  correct: Classification;
  explanation: string;
};

const EVENTS: Event[] = [
  {
    id: "e1",
    text: "A Phase 2 clinical trial fails because the molecule did not reach statistical significance on its endpoint.",
    correct: "idiosyncratic",
    explanation:
      "The scientific outcome of a specific trial is largely unrelated to broad market conditions. It primarily affects the probability-weighted expected cash flow, not the discount rate.",
  },
  {
    id: "e2",
    text: "Demand for the company's products falls during a recession as consumers cut discretionary spending.",
    correct: "systematic",
    explanation:
      "This is covariance with broad market conditions — exactly what CAPM compensates. It affects the discount rate for commercial-stage cash flows.",
  },
  {
    id: "e3",
    text: "A factory construction project experiences cost overruns because steel prices spike during a global supply crisis.",
    correct: "both",
    explanation:
      "The cost overrun has an idiosyncratic component (contractor performance) and a systematic component (commodity prices tied to global demand). The analyst must investigate how much of the risk is market-sensitive.",
  },
  {
    id: "e4",
    text: "An early-stage software startup's product fails to achieve product-market fit.",
    correct: "insufficient",
    explanation:
      "Product-market fit may or may not be related to market conditions. Without examining whether adoption tracks the economic cycle, the classification cannot be determined. Do not assume it is automatically idiosyncratic.",
  },
  {
    id: "e5",
    text: "Oil production revenue falls because global oil prices collapse during an economic downturn.",
    correct: "systematic",
    explanation:
      "Oil prices are strongly tied to global economic conditions. This is systematic risk that should be reflected in the discount rate for oil-production cash flows.",
  },
  {
    id: "e6",
    text: "A specific construction contractor goes bankrupt due to poor management.",
    correct: "idiosyncratic",
    explanation:
      "A single contractor's failure is company-specific and diversifiable. It affects the probability of on-time completion but is not systematic market risk.",
  },
];

const OPTIONS: { key: Classification; label: string; tone: "cyan" | "red" | "amber" | "slate" }[] = [
  { key: "idiosyncratic", label: "Idiosyncratic", tone: "cyan" },
  { key: "systematic", label: "Systematic", tone: "red" },
  { key: "both", label: "Both", tone: "amber" },
  { key: "insufficient", label: "Insufficient info", tone: "slate" },
];

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan",
  red: "text-accent-red",
  amber: "text-accent-amber",
  slate: "text-slate-400",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/40",
  red: "border-accent-red/40",
  amber: "border-accent-amber/40",
  slate: "border-white/20",
};
const toneBg: Record<string, string> = {
  cyan: "bg-accent-cyan/[0.06]",
  red: "bg-accent-red/[0.06]",
  amber: "bg-accent-amber/[0.06]",
  slate: "bg-white/[0.03]",
};

export default function TotalUncertaintyVsSystematicRisk() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Classification>>({});

  const assign = (id: string, c: Classification) => {
    setPicks((prev) => ({ ...prev, [id]: c }));
  };

  const answeredCount = Object.keys(picks).length;

  return (
    <div className="space-y-6">
      {/* Setup */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          The clinical-trial question
        </div>
        <p className="ops-body mt-3 text-[16px] leading-[1.65] text-slate-100">
          A trial has a <span className="text-white">50% probability of success</span>. The
          scientific outcome may be largely unrelated to broad market movements. Does a 50%
          probability of failure automatically justify a very high CAPM discount rate?
        </p>
        <div className="mt-4 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] px-4 py-3">
          <p className="ops-body text-[16px] leading-[1.55] text-white">
            No. The probability of success belongs in the expected cash-flow estimate. The
            discount rate should reflect whether the value of the resulting cash flow moves with
            systematic market conditions.
          </p>
        </div>
      </div>

      {/* Contrast table */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={cn("rounded-2xl border p-5", toneBorder.cyan, toneBg.cyan)}>
          <div className={cn("font-mono text-[11px] uppercase tracking-[0.16em]", toneText.cyan)}>
            Scientific uncertainty
          </div>
          <ul className="mt-3 space-y-2">
            {[
              "Will the molecule work?",
              "May be largely idiosyncratic",
              "Primarily affects probability-weighted cash flow",
            ].map((x) => (
              <li key={x} className="flex items-start gap-2 text-[14px] leading-[1.5] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className={cn("rounded-2xl border p-5", toneBorder.red, toneBg.red)}>
          <div className={cn("font-mono text-[11px] uppercase tracking-[0.16em]", toneText.red)}>
            Commercial market exposure
          </div>
          <ul className="mt-3 space-y-2">
            {[
              "Demand, reimbursement, competition, pricing",
              "Cyclical conditions",
              "May affect systematic risk and required return",
            ].map((x) => (
              <li key={x} className="flex items-start gap-2 text-[14px] leading-[1.5] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Classification exercise */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Classify each uncertain event
        </div>
        <p className="ops-body mt-2 text-[14px] leading-[1.55] text-slate-300">
          Is the risk primarily idiosyncratic, systematic, both, or is there insufficient information
          to tell?
        </p>

        <div className="mt-5 space-y-4">
          {EVENTS.map((e) => {
            const pick = picks[e.id];
            const isCorrect = pick === e.correct;
            return (
              <div key={e.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
                <p className="text-[15px] leading-[1.55] text-slate-100">{e.text}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {OPTIONS.map((o) => {
                    const isPicked = pick === o.key;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => assign(e.id, o.key)}
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
                        <span className="text-slate-300">{e.explanation}</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.55] text-white">
          Total uncertainty and systematic risk are not the same concept.
        </p>
        <p className="ops-body mt-2 text-[15px] leading-[1.65] text-slate-200">
          A project can carry enormous total uncertainty yet have low systematic risk — or vice
          versa. The CAPM discount rate compensates only for the portion that covaries with the
          market. ({answeredCount}/{EVENTS.length} classified above.)
        </p>
      </div>
    </div>
  );
}
