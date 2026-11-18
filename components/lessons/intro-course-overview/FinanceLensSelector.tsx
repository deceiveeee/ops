"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type LensKey = "analyst" | "quant" | "manager";

/**
 * The lesson's opening question. It needs nothing the learner has not been
 * told, and no answer is wrong, so it can come before any reading: each choice
 * is a name and one plain line, and the fuller description opens only for the
 * one that was picked.
 *
 * `summary` is a one-line plain restatement of `copy`; it adds no claim.
 */
const LENSES: {
  key: LensKey;
  label: string;
  inspired: string;
  summary: string;
  object: string;
  copy: string;
  highlight: string[];
  /** The hue of this lens: a dot beside its name, and its tint once picked. */
  tone: string;
  /** Phone order: each choice, then a free slot after it for the opened description. */
  choiceOrder: string;
  detailOrder: string;
}[] = [
  {
    key: "analyst",
    label: "The Business Analyst",
    inspired: "Inspired by Warren Buffett",
    summary: "Works out what a business is worth.",
    object: "Annual report · company filing · valuation notes",
    copy: "Represents business analysis, accounting, and valuation. This side of finance relies on reading financial statements, understanding businesses, and estimating value.",
    highlight: ["filing", "value", "statements", "valuation"],
    tone: "ops-tone-teal",
    choiceOrder: "order-1",
    detailOrder: "order-2",
  },
  {
    key: "quant",
    label: "The Quant Investor",
    inspired: "Inspired by James Simons",
    summary: "Uses data and models to invest.",
    object: "Data grid · algorithmic signal · statistical pattern",
    copy: "Represents quantitative finance and mathematical investing. This side of finance uses data, statistics, algorithms, and models.",
    highlight: ["data", "model", "statistics", "algorithm"],
    tone: "ops-tone-plum",
    choiceOrder: "order-3",
    detailOrder: "order-4",
  },
  {
    key: "manager",
    label: "The Corporate Manager",
    inspired: "Inspired by Jack Welch",
    summary: "Decides where a company puts its money.",
    object:
      "Capital allocation board · factory investment map · operating dashboard",
    copy: "Represents financial decision-making inside a corporation. This side of finance focuses on capital allocation, cost decisions, investment, and operations.",
    highlight: ["capital allocation", "investment", "operations", "cost"],
    tone: "ops-tone-ochre",
    choiceOrder: "order-5",
    detailOrder: "order-6",
  },
];

export default function FinanceLensSelector({
  onSelected,
}: {
  onSelected?: () => void;
}) {
  const [selected, setSelected] = useState<LensKey | null>(null);
  const reduce = useReducedMotion();
  const active = LENSES.find((l) => l.key === selected) ?? null;

  return (
    <section aria-labelledby="lens-question">
      <h2
        id="lens-question"
        className="ops-interactive-title text-[19px] leading-snug sm:text-[22px]"
      >
        Which one feels most like finance to you?
      </h2>
      <p className="ops-muted mt-1 text-[14px] leading-snug">
        Pick one to start. There is no wrong answer.
      </p>

      {/* One column on a phone, where the opened description sits directly
          under the choice that was tapped; three across from 768px, where it
          spans the row beneath them. */}
      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">
        {LENSES.map((l) => {
          const isSel = selected === l.key;
          return (
            <button
              key={l.key}
              type="button"
              aria-pressed={isSel}
              onClick={() => {
                setSelected(l.key);
                onSelected?.();
              }}
              // A white sheet with the control border, so a choice reads as
              // something to press and not as one more panel to read. Content
              // is pinned to the top: a button centres it by default, which
              // left the three names on different lines when one card's text
              // wrapped.
              className={cn(
                "flex min-h-11 flex-col justify-start rounded-xl border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 md:order-none md:p-4",
                l.choiceOrder,
                l.tone,
                isSel
                  ? "border-[color:var(--ops-accent-strong)] bg-[var(--ops-accent-soft)]"
                  : "border-[color:var(--ops-control-border)] bg-[var(--ops-surface)] hover:border-[color:var(--ops-accent-strong)]",
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="ops-interactive-title flex items-baseline gap-2 text-[17px] leading-snug">
                  <span
                    aria-hidden
                    className="h-2 w-2 flex-shrink-0 -translate-y-px rounded-full bg-[var(--ops-accent-strong)]"
                  />
                  {l.label}
                </span>
                {isSel && (
                  <span className="mt-0.5 flex flex-shrink-0 items-center gap-1 font-sans text-[12px] font-medium tracking-[0.01em] text-[color:var(--ops-accent-strong)]">
                    <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3">
                      <path
                        d="M2.5 6.5 5 9l4.5-5.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {/* The word needs a full-width row; in three columns the
                        tick, the tint and aria-pressed carry the state. */}
                    <span className="md:hidden">Selected</span>
                  </span>
                )}
              </span>
              <span className="ops-caption mt-0.5 block text-[12px]">
                {l.inspired}
              </span>
              <span className="ops-body mt-1 block text-[14px] leading-snug">
                {l.summary}
              </span>
            </button>
          );
        })}

        {active && (
          <motion.div
            key={active.key}
            role="status"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "rounded-xl border border-[color:color-mix(in_srgb,var(--ops-accent-strong)_35%,transparent)] px-4 py-3 md:order-last md:col-span-3 md:p-4",
              active.detailOrder,
              active.tone,
            )}
          >
            <div className="font-sans text-[12px] tracking-[0.01em] text-slate-400">
              {active.object}
            </div>
            <p className="ops-body mt-2 text-[14px] leading-relaxed text-slate-300">
              {active.copy}
            </p>
          </motion.div>
        )}
      </div>

      {active && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          // The answer takes the hue of the lens that was picked.
          className={cn("ops-interactive-frame mt-4 p-5 sm:p-6", active.tone)}
        >
          <h3 className="ops-interactive-title text-[18px] leading-snug">
            Three ways into the same subject
          </h3>
          <p className="ops-body mt-2 text-[16px] text-slate-100">
            All three are finance. Finance is not one career or one method.
            The common link is the ability to understand{" "}
            <strong className="text-white">value</strong>,{" "}
            <strong className="text-white">cash flows</strong>,{" "}
            <strong className="text-white">risk</strong>, and{" "}
            <strong className="text-white">financial decisions</strong>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {active.highlight.map((h) => (
              <span
                key={h}
                className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 font-sans text-[12px] tracking-[0.01em] text-accent-cyan"
              >
                {h}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
