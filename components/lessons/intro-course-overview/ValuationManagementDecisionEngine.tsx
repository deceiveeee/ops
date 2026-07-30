"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag } from "./shared";

type Side = "valuation" | "management";

const CARDS: { id: string; text: string; side: Side }[] = [
  { id: "c1", text: "What is this company worth?", side: "valuation" },
  {
    id: "c2",
    text: "What price should I pay for this bond?",
    side: "valuation",
  },
  {
    id: "c3",
    text: "How does the market determine this asset's value?",
    side: "valuation",
  },
  { id: "c4", text: "Should I buy this stock?", side: "management" },
  {
    id: "c5",
    text: "Should the company build a new factory?",
    side: "management",
  },
  { id: "c6", text: "How much should I save this month?", side: "management" },
  { id: "c7", text: "When should I sell this asset?", side: "management" },
];

const TOTAL = CARDS.length;

export default function ValuationManagementDecisionEngine({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, Side>>({});
  const reduce = useReducedMotion();

  const choose = (id: string, side: Side) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: side };
      if (Object.keys(next).length === TOTAL) onComplete?.();
      return next;
    });
  };

  const done = Object.keys(answers).length === TOTAL;

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Classify each question
          </span>
        </div>
        <span className="font-sans text-[12px] tabular-nums text-accent-cyan">
          {Object.keys(answers).length}/{TOTAL}
        </span>
      </div>
      <p className="ops-body mt-4 text-[15px] text-slate-300">
        Sort each question as a{" "}
        <span className="text-accent-cyan">valuation</span> question or a{" "}
        <span className="text-accent-amber">management</span> question.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((c) => {
          const picked = answers[c.id];
          const correct = picked === c.side;
          return (
            <div
              key={c.id}
              className={cn(
                "rounded-xl border bg-white/[0.02] p-5 transition-colors",
                picked
                  ? correct
                    ? "border-accent-green/50"
                    : "border-accent-red/50"
                  : "border-white/10",
              )}
            >
              <p className="ops-body-strong text-[16px] text-slate-50">
                {c.text}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-pressed={picked === "valuation"}
                  onClick={() => choose(c.id, "valuation")}
                  className={cn(
                    "rounded-full border px-4 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                    picked === "valuation"
                      ? correct
                        ? "border-accent-green bg-accent-green/15 text-accent-green"
                        : "border-accent-red bg-accent-red/15 text-accent-red"
                      : "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                  )}
                >
                  Valuation
                </button>
                <button
                  type="button"
                  aria-pressed={picked === "management"}
                  onClick={() => choose(c.id, "management")}
                  className={cn(
                    "rounded-full border px-4 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                    picked === "management"
                      ? correct
                        ? "border-accent-green bg-accent-green/15 text-accent-green"
                        : "border-accent-red bg-accent-red/15 text-accent-red"
                      : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
                  )}
                >
                  Management
                </button>
                {picked && (
                  <span
                    className={cn(
                      "self-center font-sans text-[11px] uppercase tracking-[0.14em]",
                      correct ? "text-accent-green" : "text-accent-red",
                    )}
                  >
                    {correct ? "Correct" : "Try again — reclassify"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="ops-definition-card mt-5 p-6"
          >
            <div className="ops-caption text-[11px] text-accent-cyan">
              Principle
            </div>
            <p className="ops-definition mt-3 text-[16px]">
              Finance begins with{" "}
              <strong className="text-white">valuation</strong> because you
              cannot manage what you cannot measure.
            </p>
            <p className="ops-body mt-3 text-[15px] text-slate-200">
              If a stock is worth more than its market price, an investor may
              consider buying it. If a project is worth more than it costs, a
              company may consider investing in it. If a loan costs too much
              relative to its benefit, a household may avoid borrowing.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveFrame>
  );
}
