"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, ConceptTag } from "./shared";

/**
 * Section 2 — Critical concepts roadmap.
 * Shows the full MIT fixed-income sequence and highlights the 4 steps this
 * lesson covers (Market map, Cash-flow anatomy, Risk menu, Discount-bond
 * valuation). A subway-map style path with progress beads.
 */
type SeqStep = {
  n: number;
  title: string;
  coveredHere: boolean;
  concept: "value" | "time" | "risk" | "market" | "cashflow";
};

const SEQUENCE: SeqStep[] = [
  { n: 1, title: "Industry overview", coveredHere: true, concept: "market" },
  { n: 2, title: "Valuation basics", coveredHere: true, concept: "value" },
  { n: 3, title: "Discount bonds", coveredHere: true, concept: "value" },
  { n: 4, title: "Coupon bonds", coveredHere: false, concept: "value" },
  { n: 5, title: "Interest-rate risk", coveredHere: false, concept: "risk" },
  {
    n: 6,
    title: "Corporate & default risk",
    coveredHere: false,
    concept: "risk",
  },
  {
    n: 7,
    title: "The sub-prime crisis",
    coveredHere: false,
    concept: "market",
  },
];

const HIGHLIGHT: { label: string; concept: SeqStep["concept"] }[] = [
  { label: "1 · Market map", concept: "market" },
  { label: "2 · Cash-flow anatomy", concept: "cashflow" },
  { label: "3 · Risk menu", concept: "risk" },
  { label: "4 · Discount-bond valuation", concept: "value" },
];

export default function FixedIncomeRoadmap() {
  const reduce = useReducedMotion();

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Fixed-income roadmap
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          Where this lesson sits
        </span>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        The fixed-income sequence
      </h3>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
        Fixed income is taught as a sequence: map the industry, value the cash
        flows, then add risk. This lesson covers the first three pieces — the
        industry overview, valuation basics, and discount bonds — so that coupon
        bonds, duration, and credit risk have a foundation later.
      </p>

      {/* Subway-map path of the full sequence */}
      <div className="mt-7 overflow-x-auto">
        <div className="relative flex min-w-[640px] items-center gap-3 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          {/* connecting line */}
          <div
            className="pointer-events-none absolute left-5 right-5 top-[34px] h-0.5 bg-white/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-5 top-[34px] h-0.5 bg-gradient-to-r from-accent-purple to-accent-cyan"
            style={{ width: "calc((100% - 40px) * 3 / 7)" }}
            aria-hidden
          />
          {SEQUENCE.map((s, i) => (
            <motion.div
              key={s.n}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="relative flex flex-1 flex-col items-center text-center"
            >
              <span
                className={cn(
                  "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[12px]",
                  s.coveredHere
                    ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                    : "border-white/15 bg-ink-900 text-slate-400",
                )}
              >
                {s.n}
              </span>
              <div
                className={cn(
                  "mt-3 text-[12px] leading-tight",
                  s.coveredHere ? "text-slate-100" : "text-slate-500",
                )}
              >
                {s.title}
              </div>
              {s.coveredHere && (
                <span className="ops-caption mt-1 text-[10px] uppercase tracking-[0.14em] text-accent-cyan">
                  This lesson
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Four highlighted steps in this lesson */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHT.map((h, i) => (
          <div
            key={h.label}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            <ConceptTag concept={h.concept}>{`Step ${i + 1}`}</ConceptTag>
            <div className="ops-body-strong mt-2.5 text-[14px] text-slate-100">
              {h.label}
            </div>
          </div>
        ))}
      </div>
    </InteractiveFrame>
  );
}
