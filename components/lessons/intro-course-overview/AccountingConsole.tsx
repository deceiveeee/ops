"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import MiniCheck from "./MiniCheck";
import { Feedback, InteractiveFrame, TryItTag } from "./shared";
import { cn } from "@/lib/utils";

type Statement = "balance" | "income";
type Item = { id: string; label: string; value: string; side: Statement };

const BS: Item[] = [
  { id: "cash", label: "Cash", value: "$100", side: "balance" },
  { id: "equip", label: "Equipment", value: "$50", side: "balance" },
  { id: "debt", label: "Debt", value: "$30", side: "balance" },
  { id: "equity", label: "Equity", value: "$120", side: "balance" },
];
const IS: Item[] = [
  { id: "rev", label: "Revenue", value: "$80", side: "income" },
  { id: "costs", label: "Costs", value: "$50", side: "income" },
  { id: "profit", label: "Profit", value: "$30", side: "income" },
];

const CLASSIFY: { id: string; label: string; side: Statement }[] = [
  { id: "cash-bal", label: "Cash: $100", side: "balance" },
  { id: "rev-flow", label: "Revenue: $80", side: "income" },
  { id: "debt-bal", label: "Debt: $30", side: "balance" },
  { id: "costs-flow", label: "Costs: $50", side: "income" },
  { id: "equip-bal", label: "Equipment: $50", side: "balance" },
  { id: "profit-flow", label: "Profit: $30", side: "income" },
];

export default function AccountingConsole({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [tab, setTab] = useState<Statement>("balance");
  const [answers, setAnswers] = useState<Record<string, Statement>>({});
  const reduce = useReducedMotion();
  const items = tab === "balance" ? BS : IS;
  const allClassified = Object.keys(answers).length === CLASSIFY.length;

  const classify = (id: string, side: Statement) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: side };
      if (Object.keys(next).length === CLASSIFY.length) onComplete?.();
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Statement toggle */}
      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Mini Lemonade Stand Inc.
            </span>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-cyan">
            Accounting console
          </span>
        </div>
        <div className="mt-5 inline-flex rounded-full border border-white/15 bg-ink-950/60 p-1">
          <button
            type="button"
            aria-pressed={tab === "balance"}
            onClick={() => setTab("balance")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              tab === "balance"
                ? "bg-accent-cyan/20 text-accent-cyan"
                : "text-slate-300 hover:text-slate-100",
            )}
          >
            Balance Sheet
          </button>
          <button
            type="button"
            aria-pressed={tab === "income"}
            onClick={() => setTab("income")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              tab === "income"
                ? "bg-accent-cyan/20 text-accent-cyan"
                : "text-slate-300 hover:text-slate-100",
            )}
          >
            Income Statement
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4"
          >
            <div className="ops-body mt-2 text-[14px] text-slate-300">
              {tab === "balance"
                ? "Snapshot at a point in time"
                : "Performance over a period of time"}
            </div>
            <div className="mt-3.5 divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <span className="ops-body-strong text-[16px] text-slate-100">
                    {it.label}
                  </span>
                  <span className="font-mono text-[16px] tabular-nums text-white">
                    {it.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </InteractiveFrame>

      {/* Classifier */}
      <InteractiveFrame>
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Line-item classifier
          </span>
        </div>
        <p className="ops-body mt-3 text-[15px] text-slate-200">
          Classify each item as Balance Sheet or Income Statement.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CLASSIFY.map((c) => {
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
                    aria-pressed={picked === "balance"}
                    onClick={() => classify(c.id, "balance")}
                    className={cn(
                      "rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      picked === "balance"
                        ? correct
                          ? "border-accent-green bg-accent-green/15 text-accent-green"
                          : "border-accent-red bg-accent-red/15 text-accent-red"
                        : "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                    )}
                  >
                    Balance Sheet
                  </button>
                  <button
                    type="button"
                    aria-pressed={picked === "income"}
                    onClick={() => classify(c.id, "income")}
                    className={cn(
                      "rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      picked === "income"
                        ? correct
                          ? "border-accent-green bg-accent-green/15 text-accent-green"
                          : "border-accent-red bg-accent-red/15 text-accent-red"
                        : "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                    )}
                  >
                    Income Statement
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {allClassified && (
          <Feedback status="info">
            The balance sheet measures financial status at a point in time. The
            income statement measures financial performance over time.
          </Feedback>
        )}
      </InteractiveFrame>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MiniCheck
          question="Which statement tells you what the company owns right now?"
          choices={[
            { id: "bs", label: "Balance sheet" },
            { id: "is", label: "Income statement" },
          ]}
          correctId="bs"
          feedback="The balance sheet shows assets, liabilities, and equity at a point in time."
        />
        <MiniCheck
          question="Which statement tells you whether the company made money during the month?"
          choices={[
            { id: "bs", label: "Balance sheet" },
            { id: "is", label: "Income statement" },
          ]}
          correctId="is"
          feedback="The income statement shows revenues, expenses, and profit over a period."
        />
      </div>
    </div>
  );
}
