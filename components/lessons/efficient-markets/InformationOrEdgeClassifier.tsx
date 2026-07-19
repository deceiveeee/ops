"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Category = "known" | "expectation" | "edge" | "opinion";

type Card = { id: string; text: string; correct: Category; explanation: string };

const CARDS: Card[] = [
  {
    id: "c1",
    text: "The company opened 40 new stores last year.",
    correct: "known",
    explanation: "This is a historical fact reported in public filings. It is almost certainly already reflected in the current price.",
  },
  {
    id: "c2",
    text: "The market expects new stores to earn lower returns than mature stores.",
    correct: "expectation",
    explanation: "This describes what investors collectively believe and what the price already assumes. It is a market expectation, not new information.",
  },
  {
    id: "c3",
    text: "The new store format appears to reach profitability six months faster than analysts assume.",
    correct: "edge",
    explanation: "If true and not yet recognized by others, this could be a differentiated analytical insight — a potential edge. The key question is whether other investors have already reached the same conclusion.",
  },
  {
    id: "c4",
    text: "The stores are always crowded, so the stock must be cheap.",
    correct: "opinion",
    explanation: "Crowded stores are observable by anyone. The conclusion that the stock 'must be cheap' is an unsupported inference — it ignores the price, the valuation, and what the market already knows.",
  },
  {
    id: "c5",
    text: "The company filed its 10-K yesterday afternoon.",
    correct: "known",
    explanation: "A regulatory filing is public information. By the time you read it, thousands of analysts have already processed its contents.",
  },
  {
    id: "c6",
    text: "The company's new pricing strategy will reduce customer churn by 15%, but no sell-side analyst has modeled this effect.",
    correct: "edge",
    explanation: "If your analysis of the pricing strategy is correct and others have not yet incorporated it, this could be a genuine analytical edge. But you must test whether the insight is truly original or merely overlooked.",
  },
  {
    id: "c7",
    text: "The stock will go up because the company is great.",
    correct: "opinion",
    explanation: "A great company does not automatically mean a great stock. If everyone already knows the company is great, the price already reflects that greatness. You need to show the price assumes something worse than reality.",
  },
];

const OPTIONS: { key: Category; label: string; tone: "cyan" | "amber" | "green" | "red" }[] = [
  { key: "known", label: "Known information", tone: "cyan" },
  { key: "expectation", label: "Market expectation", tone: "amber" },
  { key: "edge", label: "Possible edge", tone: "green" },
  { key: "opinion", label: "Unsupported opinion", tone: "red" },
];

const toneText: Record<string, string> = { cyan: "text-accent-cyan", amber: "text-accent-amber", green: "text-accent-green", red: "text-accent-red" };
const toneBorder: Record<string, string> = { cyan: "border-accent-cyan/40", amber: "border-accent-amber/40", green: "border-accent-green/40", red: "border-accent-red/40" };
const toneBg: Record<string, string> = { cyan: "bg-accent-cyan/[0.06]", amber: "bg-accent-amber/[0.06]", green: "bg-accent-green/[0.06]", red: "bg-accent-red/[0.06]" };

export default function InformationOrEdgeClassifier() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Category>>({});
  const assign = (id: string, c: Category) => setPicks((p) => ({ ...p, [id]: c }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Classify each statement. The distinction between information and edge is the most important
          analytical skill in this lesson.
        </p>
      </div>

      <div className="space-y-4">
        {CARDS.map((card) => {
          const pick = picks[card.id];
          const isCorrect = pick === card.correct;
          return (
            <div key={card.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <p className="text-[15px] leading-[1.55] text-slate-100">{card.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {OPTIONS.map((o) => {
                  const isPicked = pick === o.key;
                  return (
                    <button key={o.key} type="button"
                      onClick={() => assign(card.id, o.key)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                        isPicked && cn(toneBorder[o.tone], toneBg[o.tone], toneText[o.tone]),
                      )}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {pick && (
                  <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <p className={cn("mt-2.5 text-[13px] leading-[1.55]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                      {isCorrect ? "✓ " : "✗ Reconsider — "}<span className="text-slate-300">{card.explanation}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
