"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type LensKey = "analyst" | "quant" | "manager";

const LENSES: {
  key: LensKey;
  label: string;
  inspired: string;
  object: string;
  copy: string;
  // accent border/text when selected; ring tint for glow
  accent: string;
  glow: string;
  pill: string;
  highlight: string[];
}[] = [
  {
    key: "analyst",
    label: "The Business Analyst",
    inspired: "Inspired by Warren Buffett",
    object: "annual report · company filing · valuation notes",
    copy: "Represents business analysis, accounting, and valuation. This side of finance relies on reading financial statements, understanding businesses, and estimating value.",
    accent: "border-accent-green/60 text-accent-green",
    glow: "bg-accent-green/10",
    pill: "text-accent-green",
    highlight: ["filing", "value", "statements", "valuation"],
  },
  {
    key: "quant",
    label: "The Quant Investor",
    inspired: "Inspired by James Simons",
    object: "data grid · algorithmic signal · statistical pattern",
    copy: "Represents quantitative finance and mathematical investing. This side of finance uses data, statistics, algorithms, and models.",
    accent: "border-accent-purple/60 text-accent-purple",
    glow: "bg-accent-purple/10",
    pill: "text-accent-purple",
    highlight: ["data", "model", "statistics", "algorithm"],
  },
  {
    key: "manager",
    label: "The Corporate Manager",
    inspired: "Inspired by Jack Welch",
    object:
      "capital allocation board · factory investment map · operating dashboard",
    copy: "Represents financial decision-making inside a corporation. This side of finance focuses on capital allocation, cost decisions, investment, and operations.",
    accent: "border-accent-amber/60 text-accent-amber",
    glow: "bg-accent-amber/10",
    pill: "text-accent-amber",
    highlight: ["capital allocation", "investment", "operations", "cost"],
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
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-white/[0.02] p-6 text-left transition-all hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                isSel ? l.accent : "border-white/10",
              )}
            >
              {isSel && (
                <span
                  className={cn(
                    "pointer-events-none absolute inset-0 -z-10 blur-2xl",
                    l.glow,
                  )}
                />
              )}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 font-sans text-[11px] uppercase tracking-[0.14em]",
                    isSel ? l.accent : "border-white/15 text-slate-400",
                  )}
                >
                  Lens
                </span>
                {isSel && (
                  <span
                    className={cn(
                      "font-sans text-[11px] uppercase tracking-[0.14em]",
                      l.pill,
                    )}
                  >
                    ● Selected
                  </span>
                )}
              </div>
              <div className="ops-interactive-title mt-5 text-xl sm:text-[1.35rem]">
                {l.label}
              </div>
              <div className="ops-caption mt-2 text-[11px] text-slate-500">
                {l.inspired}
              </div>
              <div className="mt-4 rounded-lg border border-white/10 bg-ink-950/60 px-3.5 py-2.5 font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
                {l.object}
              </div>
              <p className="ops-body mt-4 text-[14px] text-slate-300">
                {l.copy}
              </p>
            </button>
          );
        })}
      </div>

      <p className="ops-muted mt-6 text-[13px]">
        Which one feels most like finance to you?
      </p>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="ops-interactive-frame mt-5 p-6"
          >
            <div className="ops-caption text-[11px] text-accent-cyan">
              Reveal
            </div>
            <p className="ops-body mt-3 text-[16px] text-slate-100">
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
                  className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 font-sans text-[11px] uppercase tracking-[0.14em] text-accent-cyan"
                >
                  {h}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
