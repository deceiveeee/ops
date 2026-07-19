"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, DefinitionCard } from "./shared";

/**
 * Section 14 — Risk stack summary.
 * Five stacked layers of fixed-income risk: (1) time value of money,
 * (2) interest-rate risk, (3) default risk, (4) liquidity and spread risk,
 * (5) structure / model / correlation risk. Click each layer to reveal which
 * lesson section introduced it. Final takeaway: fixed income is not risk-free;
 * it is risk-specified.
 */
type Layer = {
  id: number;
  title: string;
  origin: string;
  desc: string;
  tone: "cyan" | "amber" | "red" | "purple" | "green";
};

const LAYERS: Layer[] = [
  {
    id: 1,
    title: "Time value of money",
    origin: "Lesson 3.1 · Pricing a single future payment",
    desc: "A dollar today is worth more than a dollar tomorrow. Even a default-free Treasury embeds the opportunity cost of waiting — the risk-free rate.",
    tone: "green",
  },
  {
    id: 2,
    title: "Interest-rate risk",
    origin: "Lesson 3.2 · Yield curves and price sensitivity",
    desc: "When rates move, bond prices move. Duration and convexity measure how much. Even a risk-free bond is not free of price risk.",
    tone: "cyan",
  },
  {
    id: 3,
    title: "Default risk",
    origin: "Lesson 3.4 · Corporate bonds and credit",
    desc: "The issuer may not pay as promised. Promised yield exceeds expected yield by the default premium. Recovery and probability both matter.",
    tone: "amber",
  },
  {
    id: 4,
    title: "Liquidity and spread risk",
    origin: "Lesson 3.4 · Credit spreads and liquidity",
    desc: "Even sound bonds can be hard to sell at a fair price. Spreads bundle default, liquidity, taxes, risk premia, and pricing noise.",
    tone: "purple",
  },
  {
    id: 5,
    title: "Structure / model / correlation risk",
    origin: "Lesson 3.4 · Securitization and structured credit",
    desc: "Tranching reallocates risk but depends on assumptions about correlation, models, and markets. When assumptions break, labels crack.",
    tone: "red",
  },
];

const TONE_BORDER: Record<Layer["tone"], string> = {
  green: "border-accent-green/40",
  cyan: "border-accent-cyan/40",
  amber: "border-accent-amber/40",
  purple: "border-accent-purple/40",
  red: "border-accent-red/40",
};
const TONE_FILL: Record<Layer["tone"], string> = {
  green: "bg-accent-green",
  cyan: "bg-accent-cyan",
  amber: "bg-accent-amber",
  purple: "bg-accent-purple",
  red: "bg-accent-red",
};
const TONE_TEXT: Record<Layer["tone"], string> = {
  green: "text-accent-green",
  cyan: "text-accent-cyan",
  amber: "text-accent-amber",
  purple: "text-accent-purple",
  red: "text-accent-red",
};

export default function RiskStackSummary() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(1);

  return (
    <div className="space-y-6">
      <DefinitionCard term="The fixed-income risk stack">
        Fixed income is not one risk — it is a stack. Each layer sits on top of
        the one below. A Treasury carries the first two layers; a corporate bond
        adds default and spread; a structured product adds model and correlation
        risk. The deeper you go, the more the risk depends on assumptions.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Risk stack summary
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            Click a layer to expand
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Five layers of fixed-income risk
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Each layer was introduced somewhere in this module. Click a layer to
          see where it came from and what it means. The stack grows from
          unavoidable time value up to the most assumption-dependent structure
          risk.
        </p>

        {/* Stack */}
        <div className="mt-6 space-y-2.5">
          {LAYERS.map((layer) => {
            const isOpen = open === layer.id;
            return (
              <div
                key={layer.id}
                className={cn(
                  "rounded-2xl border bg-white/[0.02] transition-colors",
                  TONE_BORDER[layer.tone],
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : layer.id)}
                  aria-expanded={isOpen}
                  aria-label={`Layer ${layer.id}: ${layer.title}`}
                  className="flex w-full items-center gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border font-mono text-[14px]",
                      TONE_BORDER[layer.tone],
                      TONE_TEXT[layer.tone],
                    )}
                  >
                    {layer.id}
                  </span>
                  <span className="ops-body-strong flex-1 text-[16px] text-slate-50">
                    {layer.title}
                  </span>
                  <span
                    className={cn(
                      "h-2.5 w-2.5 flex-shrink-0 rounded-full",
                      TONE_FILL[layer.tone],
                    )}
                    aria-hidden
                  />
                  <span className="font-mono text-[12px] text-slate-400">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={
                        reduce ? { opacity: 0 } : { opacity: 0, height: 0 }
                      }
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5">
                        <div
                          className={cn(
                            "ops-caption text-[11px] uppercase tracking-[0.14em]",
                            TONE_TEXT[layer.tone],
                          )}
                        >
                          Introduced in
                        </div>
                        <p className="ops-body mt-1 text-[14px] leading-6 text-slate-200">
                          {layer.origin}
                        </p>
                        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
                          {layer.desc}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Final takeaway */}
        <div className="mt-6 rounded-2xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-6 text-center">
          <div className="ops-caption text-[11px] uppercase tracking-[0.14em] text-accent-cyan">
            The stack, summarized
          </div>
          <p className="ops-body-strong mt-2 text-[20px] leading-8 text-slate-50">
            Fixed income is not risk-free.{" "}
            <span className="text-accent-cyan">It is risk-specified.</span>
          </p>
          <p className="ops-body mt-2 text-[15px] leading-7 text-slate-300">
            Each instrument specifies which layers of risk it carries — and
            which it does not. Understanding the stack is understanding fixed
            income.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}
