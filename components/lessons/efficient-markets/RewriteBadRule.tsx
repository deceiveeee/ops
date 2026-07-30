"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Case = {
  id: string;
  label: string;
  badRule: string;
  flaws: string[];
  improved: string;
  principle: string;
};

const CASES: Case[] = [
  {
    id: "c1",
    label: "Case 1",
    badRule: "Sell any stock that falls 10%.",
    flaws: [
      "Ignores normal volatility — many sound investments regularly move 10%.",
      "Ignores fundamentals — a decline says nothing about whether the business is impaired.",
      "Can force selling after temporary declines, locking in losses.",
    ],
    improved: "Review the thesis after a material decline. Sell if expected cash flows deteriorate, risk rises materially, or the original assumptions are invalidated.",
    principle: "React to changes in the thesis, not to changes in the price.",
  },
  {
    id: "c2",
    label: "Case 2",
    badRule: "Buy more whenever the price falls.",
    flaws: [
      "Assumes every decline creates value — sometimes the price is falling for good reason.",
      "Can magnify valuation error if the original analysis was wrong.",
      "Confuses a price signal with new information.",
    ],
    improved: "Add only if estimated value remains intact, the expected return has improved, and portfolio risk remains acceptable.",
    principle: "Adding to a position is a fresh investment decision — make it on its own merits.",
  },
  {
    id: "c3",
    label: "Case 3",
    badRule: "Hold forever.",
    flaws: [
      "Ignores valuation — even great businesses can become overpriced.",
      "Ignores business deterioration — competitive advantages erode.",
      "Confuses discipline with inflexibility.",
    ],
    improved: "Hold while the expected return remains attractive relative to alternatives and the investment thesis remains valid.",
    principle: "Time in the market is not the same as refusing to reassess.",
  },
  {
    id: "c4",
    label: "Case 4",
    badRule: "Sell when I return to my purchase price.",
    flaws: [
      "Anchors on an irrelevant historical value — the purchase price is sunk.",
      "Says nothing about the current value, future cash flows, or risk.",
      "Turns an emotional target into a strategy.",
    ],
    improved: "Evaluate the investment using current price, current information, and expected future cash flows.",
    principle: "The market does not care what you paid. Neither should your decision.",
  },
  {
    id: "c5",
    label: "Case 5",
    badRule: "Buy because everyone else is buying.",
    flaws: [
      "Outsources judgment to the crowd without explaining why the crowd is right.",
      "Confuses price action with validation.",
      "Often peaks exactly when sentiment is most extreme.",
    ],
    improved: "Buy only when my own analysis supports the investment, with a written thesis, defined risk, and an appropriate position size.",
    principle: "The crowd may be right or wrong — but it is never a reason.",
  },
  {
    id: "c6",
    label: "Case 6",
    badRule: "Increase position size after several recent wins.",
    flaws: [
      "Treats recent wins as evidence of skill when they may be luck.",
      "Concentrates risk after gains, when position sizes have already grown.",
      "Invites the next drawdown to be far more painful than the last.",
    ],
    improved: "Size each position based on estimated value, downside, and portfolio risk — independent of recent outcomes.",
    principle: "Position sizing follows the current opportunity, not the recent past.",
  },
];

export default function RewriteBadRule() {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [identifiedFlaws, setIdentifiedFlaws] = useState<Record<string, number>>({});
  const [showImproved, setShowImproved] = useState<Record<string, boolean>>({});

  const toggleFlaw = (caseId: string, flawIdx: number) => {
    setIdentifiedFlaws((p) => {
      const cur = p[caseId] ?? -1;
      return { ...p, [caseId]: cur === flawIdx ? -1 : flawIdx };
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Each rule below sounds decisive — but each one confuses action with reasoning. For each
          case, identify the flaw you most recognize, then reveal a stronger replacement.
        </p>
      </div>

      <div className="space-y-4">
        {CASES.map((c) => {
          const isOpen = revealed[c.id];
          const flawIdx = identifiedFlaws[c.id] ?? -1;
          const improvedShown = showImproved[c.id];
          return (
            <div key={c.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-500">{c.label}</span>
              </div>
              <div className="mt-1.5 rounded-lg border border-accent-red/25 bg-accent-red/[0.05] px-3 py-2.5">
                <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-red">Bad rule · </span>
                <span className="text-[14px] italic leading-[1.55] text-slate-100">&ldquo;{c.badRule}&rdquo;</span>
              </div>

              {!isOpen && (
                <button type="button" onClick={() => setRevealed((p) => ({ ...p, [c.id]: true }))}
                  className="mt-3 rounded-full border border-white/20 px-4 py-1.5 font-sans text-[12px] uppercase tracking-[0.14em] text-slate-200 transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                  Identify the flaw →
                </button>
              )}

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden">
                    <div className="mt-3">
                      <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">
                        Which flaw do you recognize? (Select one)
                      </div>
                      <div className="mt-2 space-y-2">
                        {c.flaws.map((f, i) => (
                          <button key={i} type="button"
                            onClick={() => toggleFlaw(c.id, i)}
                            aria-pressed={flawIdx === i}
                            className={cn("flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-[13px] leading-[1.55] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                              flawIdx === i
                                ? "border-accent-amber/40 bg-accent-amber/[0.06] text-slate-100"
                                : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25")}>
                            <span className={cn("mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full",
                              flawIdx === i ? "bg-accent-amber" : "bg-slate-500")} aria-hidden />
                            <span>{f}</span>
                          </button>
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button"
                          disabled={flawIdx === -1}
                          onClick={() => setShowImproved((p) => ({ ...p, [c.id]: true }))}
                          className={cn("rounded-full border px-4 py-1.5 font-sans text-[12px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                            flawIdx === -1
                              ? "border-white/10 text-slate-500 cursor-not-allowed"
                              : "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20")}>
                          Reveal improved rule →
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {improvedShown && (
                        <motion.div
                          initial={reduce ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 space-y-2">
                          <div className="rounded-lg border border-accent-green/25 bg-accent-green/[0.05] px-3 py-2.5">
                            <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-green">Stronger rule · </span>
                            <span className="text-[14px] leading-[1.55] text-slate-100">{c.improved}</span>
                          </div>
                          <div className="rounded-lg border border-accent-cyan/25 bg-accent-cyan/[0.05] px-3 py-2.5">
                            <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-cyan">Principle · </span>
                            <span className="text-[13px] leading-[1.55] text-slate-100">{c.principle}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
