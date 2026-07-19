"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Classification =
  | "include"
  | "exclude"
  | "sunk"
  | "opportunity"
  | "cannibalization"
  | "insufficient";

type Item = {
  id: string;
  text: string;
  correct: Classification;
  explanation: string;
};

const ITEMS: Item[] = [
  {
    id: "i1",
    text: "Revenue from customers attracted to the new store location.",
    correct: "include",
    explanation: "This is incremental revenue caused by undertaking the investment.",
  },
  {
    id: "i2",
    text: "$500K already spent on a market study completed last year.",
    correct: "sunk",
    explanation: "The money is already spent regardless of whether the project proceeds. It is a sunk cost and should not affect the current decision — though it remains relevant when evaluating past capital allocation.",
  },
  {
    id: "i3",
    text: "Sales lost at an existing nearby store because some customers switch to the new location.",
    correct: "cannibalization",
    explanation: "The new store takes sales from an existing store. This reduction in existing cash flows is an incremental cost of the project.",
  },
  {
    id: "i4",
    text: "Additional inventory required to stock the new location before opening.",
    correct: "include",
    explanation: "Working-capital investment is a project cash flow. Cash is committed before revenue is collected.",
  },
  {
    id: "i5",
    text: "The company owns land that could be sold for $2M; it will be used for the new store instead.",
    correct: "opportunity",
    explanation: "The foregone $2M sale is an economic cost of using the land for the project. It should be included as an opportunity cost.",
  },
  {
    id: "i6",
    text: "The CEO's salary, which is paid regardless of whether the project is undertaken.",
    correct: "exclude",
    explanation: "The CEO's salary is not incremental — it would be paid with or without the project. It is not a project cash flow.",
  },
  {
    id: "i7",
    text: "Additional labor, utilities, and marketing costs specific to the new location.",
    correct: "include",
    explanation: "These are incremental operating costs caused by the project.",
  },
  {
    id: "i8",
    text: "A potential increase in brand awareness from the new location that might help online sales.",
    correct: "insufficient",
    explanation: "This synergy may or may not be material. Without estimating the incremental online sales, it cannot be classified reliably. Investigate before including.",
  },
];

const OPTIONS: { key: Classification; label: string; tone: "green" | "red" | "amber" | "cyan" | "purple" | "slate" }[] = [
  { key: "include", label: "Include (project CF)", tone: "green" },
  { key: "exclude", label: "Exclude", tone: "red" },
  { key: "sunk", label: "Sunk cost", tone: "amber" },
  { key: "opportunity", label: "Opportunity cost", tone: "cyan" },
  { key: "cannibalization", label: "Cannibalization", tone: "purple" },
  { key: "insufficient", label: "Insufficient info", tone: "slate" },
];

const toneText: Record<string, string> = {
  green: "text-accent-green", red: "text-accent-red", amber: "text-accent-amber",
  cyan: "text-accent-cyan", purple: "text-accent-purple", slate: "text-slate-400",
};
const toneBorder: Record<string, string> = {
  green: "border-accent-green/40", red: "border-accent-red/40", amber: "border-accent-amber/40",
  cyan: "border-accent-cyan/40", purple: "border-accent-purple/40", slate: "border-white/20",
};
const toneBg: Record<string, string> = {
  green: "bg-accent-green/[0.06]", red: "bg-accent-red/[0.06]", amber: "bg-accent-amber/[0.06]",
  cyan: "bg-accent-cyan/[0.06]", purple: "bg-accent-purple/[0.06]", slate: "bg-white/[0.03]",
};

export default function IncrementalCashFlowSorter() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Classification>>({});

  const assign = (id: string, c: Classification) => setPicks((p) => ({ ...p, [id]: c }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          The incremental test
        </div>
        <p className="ops-body mt-3 text-[17px] leading-[1.55] text-white">
          How would the company&apos;s future cash flows differ with the investment compared with
          without it?
        </p>
      </div>

      <div className="space-y-4">
        {ITEMS.map((item) => {
          const pick = picks[item.id];
          const isCorrect = pick === item.correct;
          return (
            <div key={item.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <p className="text-[15px] leading-[1.55] text-slate-100">{item.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {OPTIONS.map((o) => {
                  const isPicked = pick === o.key;
                  return (
                    <button
                      key={o.key} type="button"
                      onClick={() => assign(item.id, o.key)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                        !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                        isPicked && cn(toneBorder[o.tone], toneBg[o.tone], toneText[o.tone]),
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {pick && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <p className={cn("mt-2.5 text-[13px] leading-[1.55]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                      {isCorrect ? "✓ " : "✗ Reconsider — "}
                      <span className="text-slate-300">{item.explanation}</span>
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
