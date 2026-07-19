"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Feedback, InteractiveFrame, TryItTag } from "./shared";
import { cn } from "@/lib/utils";

type Kind = "stock" | "flow";

const CARDS: { id: string; label: string; side: Kind }[] = [
  { id: "cash", label: "Cash balance on December 31", side: "stock" },
  { id: "rev", label: "Revenue during 2025", side: "flow" },
  { id: "debt", label: "Debt outstanding today", side: "stock" },
  { id: "exp", label: "Expenses during Q1", side: "flow" },
  { id: "inv", label: "Inventory at year-end", side: "stock" },
  { id: "profit", label: "Profit during the year", side: "flow" },
];

const METAPHORS = [
  {
    key: "company",
    title: "Company dashboard",
    stock: "Balance Sheet",
    flow: "Income Statement",
  },
  {
    key: "bath",
    title: "Bathtub",
    stock: "Water level",
    flow: "Water entering or leaving per minute",
  },
  {
    key: "bank",
    title: "Bank account",
    stock: "Account balance",
    flow: "Deposits / spending over a period",
  },
];

export default function StockFlowVisualizer({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, Kind>>({});
  const [meta, setMeta] = useState(0);
  const reduce = useReducedMotion();
  const allDone = Object.keys(answers).length === CARDS.length;

  const classify = (id: string, side: Kind) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: side };
      if (Object.keys(next).length === CARDS.length) onComplete?.();
      return next;
    });
  };

  const m = METAPHORS[meta];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.07] p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-amber">
            Important
          </span>
        </div>
        <p className="ops-body mt-3 text-[15px] text-slate-100">
          In this lesson,{" "}
          <strong className="text-white">&quot;stock variable&quot;</strong>{" "}
          does not mean common stock. It means a quantity measured at a point in
          time.
        </p>
      </div>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Stock vs. Flow · three metaphors
            </span>
          </div>
          <div className="flex gap-1">
            {METAPHORS.map((mm, i) => (
              <button
                key={mm.key}
                type="button"
                aria-pressed={meta === i}
                onClick={() => setMeta(i)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  meta === i
                    ? "bg-accent-cyan/20 text-accent-cyan"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <motion.div
          key={m.key}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <div className="ops-interactive-title text-lg text-white">
            {m.title}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.07] p-5">
              <div className="ops-caption text-[10px] text-accent-cyan">
                Stock
              </div>
              <div className="ops-body-strong mt-1.5 text-[15px] text-slate-100">
                {m.stock}
              </div>
              <div className="ops-muted mt-1 text-[13px]">
                measured at a point in time
              </div>
            </div>
            <div className="rounded-xl border border-accent-purple/30 bg-accent-purple/[0.07] p-5">
              <div className="ops-caption text-[10px] text-accent-purple">
                Flow
              </div>
              <div className="ops-body-strong mt-1.5 text-[15px] text-slate-100">
                {m.flow}
              </div>
              <div className="ops-muted mt-1 text-[13px]">
                measured over a period
              </div>
            </div>
          </div>
        </motion.div>
      </InteractiveFrame>

      <InteractiveFrame>
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Classify each card
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CARDS.map((c) => {
            const picked = answers[c.id];
            const correct = picked === c.side;
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-xl border bg-white/[0.02] p-4",
                  picked
                    ? correct
                      ? "border-accent-green/50"
                      : "border-accent-red/50"
                    : "border-white/10",
                )}
              >
                <div className="ops-body-strong text-[16px] text-slate-100">
                  {c.label}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    aria-pressed={picked === "stock"}
                    onClick={() => classify(c.id, "stock")}
                    className={cn(
                      "rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      picked === "stock"
                        ? correct
                          ? "border-accent-green bg-accent-green/15 text-accent-green"
                          : "border-accent-red bg-accent-red/15 text-accent-red"
                        : "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                    )}
                  >
                    Stock
                  </button>
                  <button
                    type="button"
                    aria-pressed={picked === "flow"}
                    onClick={() => classify(c.id, "flow")}
                    className={cn(
                      "rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      picked === "flow"
                        ? correct
                          ? "border-accent-green bg-accent-green/15 text-accent-green"
                          : "border-accent-red bg-accent-red/15 text-accent-red"
                        : "border-white/20 text-slate-200 hover:border-accent-purple/60 hover:text-accent-purple",
                    )}
                  >
                    Flow
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {allDone && (
          <Feedback status="info">
            Assets, liabilities, and equity are stock variables. Revenue,
            expenses, profit, and losses are flow variables.
          </Feedback>
        )}
      </InteractiveFrame>
    </div>
  );
}
