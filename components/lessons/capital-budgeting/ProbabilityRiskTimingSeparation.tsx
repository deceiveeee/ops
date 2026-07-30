"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";

type Bucket = "expected-cf" | "systematic-risk" | "timing";

type Statement = {
  id: string;
  text: string;
  correct: Bucket;
};

const STATEMENTS: Statement[] = [
  {
    id: "s1",
    text: "A trial has a 50% probability of success, producing $60M if it works.",
    correct: "expected-cf",
  },
  {
    id: "s2",
    text: "The project's cash flows are strongly correlated with recessions.",
    correct: "systematic-risk",
  },
  {
    id: "s3",
    text: "The payoff arrives in three years rather than tomorrow.",
    correct: "timing",
  },
  {
    id: "s4",
    text: "Construction will cost $40M in year 1 and $20M in year 2.",
    correct: "expected-cf",
  },
  {
    id: "s5",
    text: "A dollar expected in ten years is worth less than a dollar expected in one year, even before risk.",
    correct: "timing",
  },
  {
    id: "s6",
    text: "Demand for the product falls sharply when the overall economy contracts.",
    correct: "systematic-risk",
  },
];

const BUCKETS: Record<
  Bucket,
  { label: string; tone: "amber" | "red" | "cyan"; desc: string }
> = {
  "expected-cf": {
    label: "Expected cash flow",
    tone: "amber",
    desc: "Which outcomes may occur, and with what probability.",
  },
  "systematic-risk": {
    label: "Systematic risk",
    tone: "red",
    desc: "Whether the value moves with broad market conditions.",
  },
  timing: {
    label: "Timing",
    tone: "cyan",
    desc: "When the cash flow is received.",
  },
};

const toneText: Record<string, string> = {
  amber: "text-accent-amber",
  red: "text-accent-red",
  cyan: "text-accent-cyan",
};
const toneBorder: Record<string, string> = {
  amber: "border-accent-amber/40",
  red: "border-accent-red/40",
  cyan: "border-accent-cyan/40",
};
const toneBg: Record<string, string> = {
  amber: "bg-accent-amber/[0.06]",
  red: "bg-accent-red/[0.06]",
  cyan: "bg-accent-cyan/[0.06]",
};

export default function ProbabilityRiskTimingSeparation() {
  const reduce = useReducedMotion();
  const [assigned, setAssigned] = useState<Record<string, Bucket>>({});

  const allAssigned = STATEMENTS.every((s) => assigned[s.id]);

  const assign = (id: string, bucket: Bucket) => {
    setAssigned((prev) => ({ ...prev, [id]: bucket }));
  };

  const correctCount = STATEMENTS.filter((s) => assigned[s.id] === s.correct).length;

  return (
    <div className="space-y-6">
      {/* Concept definitions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ConceptCard
          label="A · Expected cash flow"
          tone="amber"
        >
          <div className="mt-2">
            <BlockMath>{String.raw`E[CF] = \sum_i p_i \cdot CF_i`}</BlockMath>
          </div>
          <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
            Possible outcomes weighted by their probabilities.
          </p>
        </ConceptCard>
        <ConceptCard label="B · Systematic risk" tone="red">
          <p className="ops-body mt-2 text-[14px] leading-[1.55] text-slate-300">
            Is the cash flow especially likely to be low when the overall market and
            investors&apos; wealth are also low? This is what CAPM compensates.
          </p>
        </ConceptCard>
        <ConceptCard label="C · Timing" tone="cyan">
          <div className="mt-2">
            <BlockMath>{String.raw`PV = \frac{CF_t}{(1+r)^t}`}</BlockMath>
          </div>
          <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
            A dollar expected later is worth less today, even before adding risk.
          </p>
        </ConceptCard>
      </div>

      {/* Worked example for expected CF */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Worked example · expected cash flow
        </div>
        <div className="mt-4 space-y-2">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <BlockMath>
              {String.raw`E[CF] = \tfrac{1}{3}(\$60\,\text{M}) + \tfrac{2}{3}(\$0) = \$20\,\text{M}`}
            </BlockMath>
          </div>
        </div>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-300">
          The 2/3 probability of finding nothing reduces the expected value. This is handled by{" "}
          <span className="text-white">probability weighting</span>, not by inflating the discount rate.
        </p>
      </div>

      {/* Sorting exercise */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Sort each statement into its concept
        </div>
        <p className="ops-body mt-2 text-[14px] leading-[1.55] text-slate-300">
          Click the concept that each statement primarily describes.
        </p>

        <div className="mt-5 space-y-4">
          {STATEMENTS.map((s) => {
            const pick = assigned[s.id];
            const isCorrect = pick === s.correct;
            return (
              <div key={s.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
                <p className="text-[15px] leading-[1.55] text-slate-100">{s.text}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(Object.keys(BUCKETS) as Bucket[]).map((b) => {
                    const isPicked = pick === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => assign(s.id, b)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                          !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                          isPicked && cn(toneBorder[b], toneBg[b], toneText[b]),
                        )}
                      >
                        {BUCKETS[b].label}
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
                          "mt-2.5 text-[13px] leading-[1.5]",
                          isCorrect ? "text-accent-green" : "text-accent-red",
                        )}
                      >
                        {isCorrect ? "✓ Correct." : "✗ Reconsider."}{" "}
                        <span className="text-slate-300">{BUCKETS[s.correct].desc}</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {allAssigned && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] px-4 py-4"
          >
            <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
              {correctCount}/{STATEMENTS.length} correct. The critical distinction:{" "}
              <span className="text-white">probability</span> belongs in the expected-cash-flow
              calculation. <span className="text-white">Systematic risk</span> determines the
              discount rate. <span className="text-white">Timing</span> determines how many periods
              to discount. Confusing these three is the most common valuation error.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ConceptCard({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "amber" | "red" | "cyan";
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border p-4", toneBorder[tone], toneBg[tone])}>
      <div className={cn("font-sans text-[11px] uppercase tracking-[0.14em]", toneText[tone])}>
        {label}
      </div>
      {children}
    </div>
  );
}
