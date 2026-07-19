"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  InlineMath,
} from "./shared";

/**
 * Section 11 — Term structure theories.
 * Expectations Hypothesis, Liquidity Preference, Preferred Habitat, Market
 * Segmentation, Continuous-time models (Vasicek, CIR, HJM).
 * Learner matches a scenario to a theory; correct answer animates onto curve.
 */

type TheoryKey =
  "expectations" | "liquidity" | "habitat" | "segmentation" | "continuous";

const THEORIES: { key: TheoryKey; label: string; short: string }[] = [
  {
    key: "expectations",
    label: "Expectations Hypothesis",
    short: "E[Rₖ] = fₖ",
  },
  {
    key: "liquidity",
    label: "Liquidity Preference",
    short: "fₖ − liquidity premium",
  },
  {
    key: "habitat",
    label: "Preferred Habitat",
    short: "preferred maturity ranges",
  },
  {
    key: "segmentation",
    label: "Market Segmentation",
    short: "separate markets",
  },
  {
    key: "continuous",
    label: "Continuous-time models",
    short: "Vasicek · CIR · HJM",
  },
];

const SCENARIOS: {
  id: string;
  text: string;
  answer: TheoryKey;
  explain: string;
}[] = [
  {
    id: "s1",
    text: "Forward rates are the market's best estimate of future spot rates.",
    answer: "expectations",
    explain:
      "Expectations Hypothesis: E₀[Rₖ] = fₖ — forward rates are unbiased forecasts.",
  },
  {
    id: "s2",
    text: "Long-term borrowers must pay extra because investors prefer liquidity.",
    answer: "liquidity",
    explain:
      "Liquidity Preference: E[Rₖ] < fₖ = fₖ − liquidity premium. Lenders demand compensation for giving up liquidity.",
  },
  {
    id: "s3",
    text: "Some investors prefer specific maturity ranges.",
    answer: "habitat",
    explain:
      "Preferred Habitat: investors have preferred maturity neighborhoods but will shift for adequate yield.",
  },
  {
    id: "s4",
    text: "Different maturity markets are partly separated by investor mandates.",
    answer: "segmentation",
    explain:
      "Market Segmentation: supply and demand in each maturity bucket can set rates somewhat independently.",
  },
  {
    id: "s5",
    text: "A mathematical model describes rate dynamics over continuous time.",
    answer: "continuous",
    explain:
      "Continuous-time models (Vasicek, Cox-Ingersoll-Ross, Heath-Jarrow-Morton) describe how rates evolve stochastically.",
  },
];

export default function TermStructureTheoryArena() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <DefinitionCard term="Expectations Hypothesis">
          <InlineMath>{"E_0[R_k] = f_k"}</InlineMath> — forward rates are
          unbiased forecasts of future spot rates.
        </DefinitionCard>
        <DefinitionCard term="Liquidity Preference">
          <InlineMath>{"E[R_k] < f_k"}</InlineMath> =
          <InlineMath>{"f_k - \\text{Liquidity Premium}"}</InlineMath>. Lenders
          demand compensation for giving up liquidity.
        </DefinitionCard>
      </div>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Match each scenario to a theory
            </span>
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Term structure theory arena
        </h4>

        <div className="mt-5 space-y-4">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      </InteractiveFrame>
    </div>
  );
}

function ScenarioCard({
  scenario,
}: {
  scenario: { id: string; text: string; answer: TheoryKey; explain: string };
}) {
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<TheoryKey | null>(null);
  const correct = picked === scenario.answer;

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
      <p className="ops-body text-[15px] leading-7 text-slate-100">
        &ldquo;{scenario.text}&rdquo;
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {THEORIES.map((t) => {
          const isPicked = picked === t.key;
          const reveal = picked !== null;
          const isAnswer = t.key === scenario.answer;
          return (
            <button
              key={t.key}
              type="button"
              disabled={reveal}
              aria-pressed={isPicked}
              onClick={() => setPicked(t.key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                !reveal && "border-white/20 text-slate-200 hover:bg-white/5",
                reveal &&
                  isAnswer &&
                  "border-accent-green/60 bg-accent-green/15 text-accent-green",
                reveal &&
                  isPicked &&
                  !isAnswer &&
                  "border-accent-red/60 bg-accent-red/15 text-accent-red",
                reveal &&
                  !isAnswer &&
                  !isPicked &&
                  "border-white/10 text-slate-500",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {picked !== null && (
          <motion.div
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "mt-4 rounded-xl border p-4",
                correct
                  ? "border-accent-green/40 bg-accent-green/[0.06]"
                  : "border-accent-amber/40 bg-accent-amber/[0.06]",
              )}
            >
              <div
                className={cn(
                  "ops-caption text-[11px]",
                  correct ? "text-accent-green" : "text-accent-amber",
                )}
              >
                {correct ? "Correct" : "Not quite — see the answer"}
              </div>
              <p className="ops-body mt-1.5 text-[14px] leading-6 text-slate-200">
                {scenario.explain}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
