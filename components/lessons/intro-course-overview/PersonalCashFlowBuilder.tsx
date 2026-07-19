"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag } from "./shared";

type Step = {
  key: "source" | "real" | "financial" | "liability";
  prompt: string;
  choices: string[];
};

const STEPS: Step[] = [
  {
    key: "source",
    prompt: "What is your likely future source of cash?",
    choices: [
      "Job income",
      "Business income",
      "Family support",
      "Scholarship / financial aid",
      "Other",
    ],
  },
  {
    key: "real",
    prompt: "What real asset are you investing in?",
    choices: [
      "Education",
      "Skills",
      "Housing",
      "Equipment",
      "Business project",
    ],
  },
  {
    key: "financial",
    prompt: "What financial asset might you invest in?",
    choices: [
      "Savings account",
      "Stock index fund",
      "Individual stocks",
      "Bonds",
      "Retirement account",
    ],
  },
  {
    key: "liability",
    prompt: "What liability might you have?",
    choices: [
      "Student loan",
      "Credit card debt",
      "Car loan",
      "Mortgage",
      "No debt",
    ],
  },
];

export default function PersonalCashFlowBuilder({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const reduce = useReducedMotion();
  const done = Object.keys(picks).length === STEPS.length;

  const choose = (key: string, val: string) => {
    setPicks((prev) => {
      const next = { ...prev, [key]: val };
      if (Object.keys(next).length === STEPS.length) onComplete?.();
      return next;
    });
  };

  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Personal cash-flow builder
        </span>
      </div>
      <div className="mt-5 space-y-5">
        {STEPS.map((s) => (
          <div key={s.key}>
            <p className="ops-body-strong text-[16px] text-slate-50">
              {s.prompt}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.choices.map((c) => {
                const picked = picks[s.key] === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={picked}
                    onClick={() => choose(s.key, c)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      picked
                        ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                        : "border-white/20 text-slate-100 hover:border-accent-cyan/60 hover:text-accent-cyan",
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {done && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ops-definition-card mt-6 p-5"
        >
          <div className="ops-caption text-[11px] text-accent-cyan">
            Your financial map
          </div>
          <p className="ops-definition mt-3 text-[16px]">
            {picks.source} → spending and saving → {picks.financial} → future
            goals
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-200">
            Personal finance is not separate from finance theory. It uses the
            same logic as corporate finance, but the objective is different. A
            corporation may try to maximize shareholder value. A household may
            try to maximize lifetime well-being.
          </p>
        </motion.div>
      )}
    </InteractiveFrame>
  );
}
