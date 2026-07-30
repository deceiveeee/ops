"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type ChoiceKey = "expand" | "acquire" | "debt" | "buyback" | "dividend" | "cash";

const CHOICES: Record<ChoiceKey, { label: string; icon: string; questions: string[] }> = {
  expand: { label: "Expand operations", icon: "🏭", questions: ["What return can it earn?", "How much capital can be deployed at that return?"] },
  acquire: { label: "Acquire a competitor", icon: "🤝", questions: ["What is the target worth?", "What price must be paid?", "Are the synergies credible?"] },
  debt: { label: "Repay debt", icon: "💳", questions: ["What interest and distress costs are being reduced?"] },
  buyback: { label: "Repurchase shares", icon: "🔄", questions: ["Is the stock undervalued or overvalued?", "What alternative uses of cash are available?"] },
  dividend: { label: "Pay a dividend", icon: "💵", questions: ["Does management lack attractive internal uses?", "Would distribution weaken the balance sheet?"] },
  cash: { label: "Retain cash", icon: "🏦", questions: ["What liquidity and future commitments justify retention?"] },
};

export default function CapitalAllocationOpening() {
  const reduce = useReducedMotion();
  const [pick, setPick] = useState<ChoiceKey | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.6] text-slate-100">
          A profitable company has <span className="text-white">$1 billion of excess cash</span>.
          Which choice is best for shareholders?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(Object.keys(CHOICES) as ChoiceKey[]).map((key) => {
          const c = CHOICES[key];
          return (
            <button
              key={key} type="button"
              disabled={pick !== null}
              onClick={() => setPick(key)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                pick === key ? "border-accent-amber/50 bg-accent-amber/10" : "border-white/12 hover:border-white/25",
                pick !== null && pick !== key && "opacity-40",
              )}
            >
              <div className="text-[20px]" aria-hidden>{c.icon}</div>
              <div className="mt-1.5 text-[14px] font-medium text-white">{c.label}</div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {pick && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6"
          >
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
              Before choosing, the investor must ask
            </div>
            <ul className="mt-3 space-y-2">
              {CHOICES[pick].questions.map((q) => (
                <li key={q} className="flex items-start gap-2.5 text-[15px] leading-[1.6] text-slate-100">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />{q}
                </li>
              ))}
            </ul>
            <p className="ops-body mt-4 text-[16px] leading-[1.65] text-white">
              The category of the decision does not determine whether it is good. Value depends on{" "}
              <span className="text-accent-amber">price, cash flow, risk, scale, constraints, and the
              alternatives forgone</span>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
