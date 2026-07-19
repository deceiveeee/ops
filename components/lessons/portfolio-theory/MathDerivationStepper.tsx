"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

export type DerivationStep = {
  heading: string;
  explanation: ReactNode;
  /** Either a LaTeX string (rendered as BlockMath) or arbitrary ReactNode. */
  formula: ReactNode;
  changeNote?: ReactNode;
};

/**
 * Full-width derivation stepper. Shows ONE principal formula per step with a
 * short explanation and a "what changed" note, replacing fragmented accordion
 * rows. Used for required mathematical arguments that must read as a coherent
 * sequence. Provides a full text alternative for screen readers.
 */
export default function MathDerivationStepper({
  steps,
  title,
  ariaSummary,
  className,
}: {
  steps: DerivationStep[];
  title?: ReactNode;
  ariaSummary?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const step = steps[i];
  const first = i === 0;
  const last = i === steps.length - 1;

  const goto = (next: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, next));
    if (clamped !== i) setI(clamped);
  };

  return (
    <div className={cn("ops-interactive-frame relative overflow-hidden p-6 sm:p-8", className)}>
      <div
        className="flex flex-wrap items-center gap-3"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goto(i + 1);
          if (e.key === "ArrowLeft") goto(i - 1);
        }}
        tabIndex={-1}
      >
        <ol className="flex flex-wrap items-center gap-2">
          {steps.map((s, idx) => {
            const active = idx === i;
            const done = idx < i;
            return (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => setI(idx)}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Step ${idx + 1}: ${s.heading}`}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-full border px-3.5 font-mono text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                    active
                      ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                      : done
                        ? "border-accent-green/50 bg-accent-green/10 text-accent-green hover:border-accent-green/70"
                        : "border-white/15 text-slate-400 hover:border-white/30 hover:text-slate-200",
                  )}
                >
                  <span className="tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="hidden font-sans text-[13px] normal-case tracking-normal sm:inline">
                    {s.heading}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        {title !== undefined && (
          <span className="ml-auto font-mono text-[12px] uppercase tracking-[0.18em] text-slate-400">
            {title}
          </span>
        )}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="font-mono text-[13px] uppercase tracking-[0.18em] text-accent-cyan">
              Step {i + 1} · {step.heading}
            </div>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 px-5 py-8 text-slate-50">
              {typeof step.formula === "string" ? (
                <BlockMath>{step.formula}</BlockMath>
              ) : (
                step.formula
              )}
            </div>
            <p className="ops-body mt-5 max-w-3xl text-[17px] leading-[1.7] text-slate-200">
              {step.explanation}
            </p>
            {step.changeNote !== undefined && (
              <p className="mt-3 max-w-3xl border-l-2 border-accent-amber/60 pl-4 text-[16px] leading-[1.65] text-accent-amber/90">
                {step.changeNote}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goto(i - 1)}
          disabled={first}
          className="rounded-full border border-white/15 px-5 py-2 font-mono text-[13px] text-slate-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          ← Back
        </button>
        <span className="font-mono text-[13px] tabular-nums text-slate-500" aria-hidden>
          {i + 1} / {steps.length}
        </span>
        {!last ? (
          <button
            type="button"
            onClick={() => goto(i + 1)}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-5 py-2 font-mono text-[13px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setI(0)}
            className="rounded-full border border-white/15 px-5 py-2 font-mono text-[13px] text-slate-300 transition-colors hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            ↺ Restart
          </button>
        )}
      </div>

      <div className="sr-only">
        {ariaSummary && <p>{ariaSummary}</p>}
        <ol>
          {steps.map((s, idx) => (
            <li key={idx}>
              Step {idx + 1}: {s.heading}.
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
