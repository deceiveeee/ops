"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";
import ProfessorNote from "./ProfessorNote";

/**
 * Section 6 — Spread decomposition mixer.
 * Total spread: 300 bps. Sliders allocate the spread across: expected default
 * loss, liquidity premium, tax premium, systematic risk premium,
 * option/structure premium, pricing/model error. Total updates live; warnings
 * when over-allocated or default-loss set to 100%.
 */
type Component = {
  id: string;
  label: string;
  tone: "red" | "cyan" | "amber" | "purple" | "green" | "slate";
  max: number;
  default: number;
};

const COMPONENTS: Component[] = [
  { id: "default", label: "Expected default loss", tone: "red", max: 200, default: 60 },
  { id: "liquidity", label: "Liquidity premium", tone: "cyan", max: 150, default: 50 },
  { id: "tax", label: "Tax premium", tone: "amber", max: 100, default: 30 },
  { id: "systematic", label: "Systematic risk premium", tone: "purple", max: 150, default: 70 },
  { id: "option", label: "Option / structure premium", tone: "amber", max: 80, default: 25 },
  { id: "model", label: "Pricing / model error", tone: "cyan", max: 60, default: 15 },
];

const TOTAL = 300;

const TONE_FILL: Record<Component["tone"], string> = {
  red: "bg-accent-red",
  cyan: "bg-accent-cyan",
  amber: "bg-accent-amber",
  purple: "bg-accent-purple",
  green: "bg-accent-green",
  slate: "bg-slate-500",
};
const TONE_TEXT: Record<Component["tone"], string> = {
  red: "text-accent-red",
  cyan: "text-accent-cyan",
  amber: "text-accent-amber",
  purple: "text-accent-purple",
  green: "text-accent-green",
  slate: "text-slate-400",
};

const RESEARCH = [
  { study: "Elton et al. (2001)", finding: "Only ~17.8% of the spread on 10yr A-rated industrials came from default." },
  { study: "Delianedis & Geske (2001)", finding: "Only ~5–22% of spread explained by default risk." },
  { study: "Huang & Huang (2002)", finding: "~20–30% of investment-grade spreads attributable to credit risk." },
  { study: "Saunders & Allen (2002)", finding: "Remaining spread tied to liquidity, taxes, and pricing errors." },
];

export default function SpreadDecompositionMixer() {
  const reduce = useReducedMotion();
  const [vals, setVals] = useState<Record<string, number>>(
    Object.fromEntries(COMPONENTS.map((c) => [c.id, c.default])),
  );
  const [showResearch, setShowResearch] = useState(false);

  const sum = COMPONENTS.reduce((s, c) => s + vals[c.id], 0);
  const over = sum > TOTAL;
  const defaultOnly = vals.default >= TOTAL;

  const setVal = (id: string, v: number) =>
    setVals((prev) => ({ ...prev, [id]: v }));

  return (
    <div className="space-y-6">
      <DefinitionCard term="The spread is a market price">
        A 300 bps corporate spread is not a single number with a single cause.
        It bundles expected default loss, a liquidity premium, a tax premium, a
        systematic risk premium, optionality, and pricing noise. Decomposing it
        is hard — and the decomposition itself is uncertain.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Spread decomposition mixer
            </span>
          </div>
          <div className="font-mono text-[12px] text-slate-400">
            Total spread target: {TOTAL} bps
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          What is the spread made of?
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Allocate the {TOTAL} bps spread across its possible drivers. The total
          updates live. Exceed the target and you get a warning — because the
          pieces cannot sum to more than the whole.
        </p>

        {/* Allocation bar */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="flex items-center justify-between">
            <span className="ops-caption text-[11px] text-slate-400">
              Allocated so far
            </span>
            <span
              className={cn(
                "font-mono text-[14px]",
                over ? "text-accent-red" : "text-accent-green",
              )}
            >
              {sum} / {TOTAL} bps
            </span>
          </div>
          <div className="mt-3 flex h-5 overflow-hidden rounded-lg border border-white/10 bg-ink-950/60">
            {COMPONENTS.map((c) => (
              <motion.div
                key={c.id}
                initial={false}
                animate={{ width: `${(vals[c.id] / TOTAL) * 100}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.25 }}
                className={cn("h-full", TONE_FILL[c.tone])}
                title={`${c.label}: ${vals[c.id]} bps`}
              />
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {COMPONENTS.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-ink-950/40 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="ops-caption text-[11px] text-slate-400">
                  {c.label}
                </span>
                <span
                  className={cn("font-mono text-[13px]", TONE_TEXT[c.tone])}
                >
                  {vals[c.id]} bps
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={c.max}
                step={5}
                value={vals[c.id]}
                onChange={(e) => setVal(c.id, Number(e.target.value))}
                aria-label={c.label}
                className="mt-4 w-full accent-accent-cyan"
              />
            </div>
          ))}
        </div>

        {/* Warnings */}
        <AnimatePresence>
          {over && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-xl border border-accent-red/40 bg-accent-red/[0.08] p-5"
            >
              <div className="ops-caption text-[11px] uppercase tracking-[0.14em] text-accent-red">
                Over-allocated
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
                The components sum to {sum} bps — more than the {TOTAL} bps
                spread. At least one driver is overstated, or the parts overlap.
              </p>
            </motion.div>
          )}
          {defaultOnly && !over && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-xl border border-accent-amber/40 bg-accent-amber/[0.08] p-5"
            >
              <div className="ops-caption text-[11px] uppercase tracking-[0.14em] text-accent-amber">
                Careful
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
                You assigned the entire spread to expected default loss.
                Empirical studies often find default explains only part of the
                spread. Open the Research Lens below.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Research lens */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <button
            type="button"
            onClick={() => setShowResearch((s) => !s)}
            aria-expanded={showResearch}
            className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            <span className="ops-caption text-[11px] uppercase tracking-[0.14em] text-accent-cyan">
              Research Lens
            </span>
            <span className="font-mono text-[12px] text-slate-400">
              {showResearch ? "Hide" : "Expand"}
            </span>
          </button>
          <AnimatePresence>
            {showResearch && (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3">
                  {RESEARCH.map((r) => (
                    <div
                      key={r.study}
                      className="rounded-lg border border-white/10 bg-ink-950/40 p-4"
                    >
                      <div className="font-mono text-[13px] text-accent-purple">
                        {r.study}
                      </div>
                      <p className="ops-body mt-1 text-[14px] leading-6 text-slate-200">
                        {r.finding}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ProfessorNote tone="purple" className="mt-5">
          The spread is a market price. Like other prices, it contains several
          stories at once — default, liquidity, taxes, risk premia, and noise.
          No single decomposition is definitive.
        </ProfessorNote>
      </InteractiveFrame>
    </div>
  );
}
