"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  ConceptTag,
} from "@/components/lessons/intro-course-overview/shared";

type Tone = "cyan" | "purple" | "amber";

type LensChip = {
  label: string;
  concept: "value" | "time" | "risk" | "market" | "cashflow";
};

type Card = {
  id: string;
  index: string;
  title: string;
  content: string;
  prompt: string;
  tone: Tone;
  chips?: LensChip[];
  answer?: string;
};

const TONE: Record<
  Tone,
  { border: string; text: string; glow: string; dot: string; activeBorder: string }
> = {
  cyan: {
    border: "border-accent-cyan/40",
    activeBorder: "border-accent-cyan/70",
    text: "text-accent-cyan",
    glow: "bg-accent-cyan/15",
    dot: "bg-accent-cyan",
  },
  purple: {
    border: "border-accent-purple/40",
    activeBorder: "border-accent-purple/70",
    text: "text-accent-purple",
    glow: "bg-accent-purple/15",
    dot: "bg-accent-purple",
  },
  amber: {
    border: "border-accent-amber/40",
    activeBorder: "border-accent-amber/70",
    text: "text-accent-amber",
    glow: "bg-accent-amber/15",
    dot: "bg-accent-amber",
  },
};

const CARDS: Card[] = [
  {
    id: "boeing",
    index: "Asset 01",
    title: "Boeing regional jet",
    content:
      "Boeing is evaluating whether to develop a regional jet. Development takes 3 years, costs roughly $850 million, unit costs may fall to $33 million, and Boeing expects to sell 30 planes per year at an average price of $41 million.",
    prompt: "What future cashflows matter?",
    tone: "cyan",
    chips: [
      { label: "Development costs", concept: "cashflow" },
      { label: "Sale revenue", concept: "value" },
      { label: "Production costs", concept: "cashflow" },
      { label: "Timing", concept: "time" },
      { label: "Future demand uncertainty", concept: "risk" },
    ],
  },
  {
    id: "sp500",
    index: "Asset 02",
    title: "S&P 500 dividends and earnings",
    content:
      "Firms in the S&P 500 are expected to earn $66 and pay dividends of $24 per share, adjusted to the index. Dividends and earnings historically grew 6.6% nominally, or about 3.2% in real terms, since 1926.",
    prompt: "What future cashflows matter?",
    tone: "purple",
    chips: [
      { label: "Future dividends", concept: "value" },
      { label: "Earnings support", concept: "cashflow" },
      { label: "Growth rate", concept: "market" },
      { label: "Real vs nominal growth", concept: "time" },
      { label: "Discount rate", concept: "risk" },
    ],
  },
  {
    id: "hp",
    index: "Asset 03",
    title: "HP stock options",
    content:
      "A new HP employee receives 50,000 stock options with a strike price of $24.92 and expiration in 10 years. HP stock ranged from $16.08 to $26.03 over the prior two years.",
    prompt: "Why is this an asset?",
    tone: "amber",
    answer:
      "The option may create future cash if the stock price exceeds the strike price before expiration.",
  },
];

function ScannerCard({ card }: { card: Card }) {
  const [active, setActive] = useState(false);
  const reduce = useReducedMotion();
  const t = TONE[card.tone];

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white/[0.03] p-5 transition-colors sm:p-6",
        active ? t.activeBorder : t.border,
      )}
    >
      {/* lens glow */}
      <AnimatePresence>
        {active && (
          <motion.span
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl",
              t.glow,
            )}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <span className={cn("ops-caption text-[11px]", t.text)}>{card.index}</span>
        <span className={cn("h-1.5 w-1.5 rounded-full", active ? t.dot : "bg-slate-600")} aria-hidden />
      </div>

      <h3 className="ops-interactive-title mt-4 text-xl text-white">{card.title}</h3>
      <p className="ops-body mt-2.5 text-[15px] leading-7 text-slate-300">{card.content}</p>

      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center rounded-md border border-white/15 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-300">
          {card.prompt}
        </span>
      </div>

      <div className="mt-auto pt-5">
        <button
          type="button"
          aria-pressed={active}
          aria-label={`${active ? "Hide" : "Activate"} cashflow lens for ${card.title}`}
          onClick={() => setActive((v) => !v)}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            active
              ? cn(t.border, t.text, "bg-white/[0.04]")
              : "border-white/20 text-slate-100 hover:bg-white/5",
          )}
        >
          {active ? "Hide lens" : "Activate cashflow lens"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            key="lens"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-xl border border-white/10 bg-ink-950/40 p-4">
              {card.chips ? (
                <>
                  <div className="ops-caption text-[11px] text-slate-400">Cashflows that matter</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {card.chips.map((c) => (
                      <ConceptTag key={c.label} concept={c.concept}>
                        {c.label}
                      </ConceptTag>
                    ))}
                  </div>
                </>
              ) : (
                card.answer && (
                  <>
                    <div className="ops-caption text-[11px] text-slate-400">Answer</div>
                    <p className="ops-body-strong mt-2.5 text-[15px] leading-7 text-slate-50">
                      {card.answer}
                    </p>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AssetScanner() {
  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">Asset scanner</span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">Motivation — scan the cashflow lens</span>
      </div>
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
        Each surface looks different — a jet program, an equity index, an employee option. Activate the
        cashflow lens on each to see what a finance analyst actually values.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {CARDS.map((c) => (
          <ScannerCard key={c.id} card={c} />
        ))}
      </div>
    </InteractiveFrame>
  );
}
