"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

type Verdict = "appropriate" | "double-count" | "omits-risk" | "insufficient";

type Approach = {
  id: string;
  text: string;
  correct: Verdict;
  explanation: string;
};

const APPROACHES: Approach[] = [
  {
    id: "a1",
    text:
      "An investor multiplies the commercial payoff by a 30% probability of approval, then discounts the result at 25% because 'the project may fail.'",
    correct: "double-count",
    explanation:
      "The failure probability is already captured by probability weighting. Adding a 25% discount rate on top double-charges for the same uncertainty — unless that 25% is independently justified by systematic risk, not by failure probability.",
  },
  {
    id: "a2",
    text:
      "An investor probability-weights a drug's value by approval probability, then discounts at a rate estimated from commercial-stage comparables (demand, pricing, competition).",
    correct: "appropriate",
    explanation:
      "Probability handles the binary success/failure outcome. The discount rate handles the systematic risk of the resulting commercial cash flows. Each adjustment compensates for a different source of risk.",
  },
  {
    id: "a3",
    text:
      "An investor ignores the probability of construction delays entirely and discounts expected operating cash flows at the risk-free rate.",
    correct: "omits-risk",
    explanation:
      "The risk-free rate assumes zero systematic risk. If the operating cash flows carry market exposure — and most commercial cash flows do — then a risk-free discount rate understates the required return and overstates value.",
  },
  {
    id: "a4",
    text:
      "An investor applies a 15% discount rate to all cash flows of a mining project, citing 'high risk,' without separating geological discovery risk from commodity-price exposure.",
    correct: "insufficient",
    explanation:
      "The 15% may or may not be appropriate. Without identifying whether the discovery risk is idiosyncratic and whether the commodity exposure is systematic, the analyst cannot tell if the rate double-counts, under-counts, or is approximately right. More investigation is needed.",
  },
  {
    id: "a5",
    text:
      "An investor discounts construction costs at a low rate (financed by fixed-price contract) but discounts operating revenue at a higher rate reflecting cyclical demand.",
    correct: "appropriate",
    explanation:
      "The two cash-flow streams genuinely carry different risks. The fixed-price construction commitment has low systematic exposure; the operating revenue has market-sensitive demand exposure. Stage-specific rates are economically justified.",
  },
];

const OPTIONS: { key: Verdict; label: string; tone: "green" | "red" | "amber" | "slate" }[] = [
  { key: "appropriate", label: "Handles risk appropriately", tone: "green" },
  { key: "double-count", label: "May double count", tone: "red" },
  { key: "omits-risk", label: "Omits systematic risk", tone: "amber" },
  { key: "insufficient", label: "Insufficient information", tone: "slate" },
];

const toneText: Record<string, string> = {
  green: "text-accent-green",
  red: "text-accent-red",
  amber: "text-accent-amber",
  slate: "text-slate-400",
};
const toneBorder: Record<string, string> = {
  green: "border-accent-green/40",
  red: "border-accent-red/40",
  amber: "border-accent-amber/40",
  slate: "border-white/20",
};
const toneBg: Record<string, string> = {
  green: "bg-accent-green/[0.06]",
  red: "bg-accent-red/[0.06]",
  amber: "bg-accent-amber/[0.06]",
  slate: "bg-white/[0.03]",
};

export default function DoubleCountingRiskCheck() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Verdict>>({});

  const assign = (id: string, v: Verdict) => {
    setPicks((prev) => ({ ...prev, [id]: v }));
  };

  return (
    <div className="space-y-6">
      {/* Setup */}
      <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-red">
          The double-counting trap
        </div>
        <p className="ops-body mt-3 text-[16px] leading-[1.65] text-slate-100">
          An investor multiplies the commercial payoff by a low probability of success{" "}
          <span className="text-white">and then</span> uses an extremely high discount rate because
          &ldquo;the project may fail.&rdquo; This may count the same uncertainty twice — unless the
          higher discount rate is independently justified by systematic risk.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Probability weighting
            </div>
            <div className="mt-2">
              <BlockMath>{String.raw`p \times CF_{\text{success}}`}</BlockMath>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Discounting
            </div>
            <div className="mt-2">
              <BlockMath>{String.raw`\frac{1}{(1+r)^t}`}</BlockMath>
            </div>
            <p className="ops-body mt-1 text-[12px] text-slate-400">
              Adjust for time and systematic risk only.
            </p>
          </div>
        </div>
        <p className="ops-body mt-4 text-[16px] leading-[1.6] text-white">
          Probabilities answer <span className="text-accent-amber">which outcomes may occur</span>.
          Discount rates answer{" "}
          <span className="text-accent-amber">how investors price the systematic risk</span> of those
          outcomes.
        </p>
      </div>

      {/* Classification exercise */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Evaluate each analyst approach
        </div>

        <div className="mt-5 space-y-4">
          {APPROACHES.map((a) => {
            const pick = picks[a.id];
            const isCorrect = pick === a.correct;
            return (
              <div key={a.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
                <p className="text-[15px] leading-[1.55] text-slate-100">{a.text}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {OPTIONS.map((o) => {
                    const isPicked = pick === o.key;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => assign(a.id, o.key)}
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
                        <span className="text-slate-300">{a.explanation}</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nuance */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Important nuance
        </div>
        <ul className="mt-3 space-y-2.5">
          {[
            "Some failure risk may be systematic.",
            "Construction failures may become more common during financing crises.",
            "Commodity projects may fail because market prices collapse.",
            "The analyst must investigate the source of uncertainty.",
            "Do not mechanically assign all failure probability to either category.",
          ].map((x) => (
            <li key={x} className="flex items-start gap-2.5 text-[15px] leading-[1.6] text-slate-100">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
              {x}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
