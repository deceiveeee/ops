"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Classification = "expected-cf" | "systematic" | "both" | "insufficient";

const FACTORS: { id: string; text: string; correct: Classification; explanation: string }[] = [
  { id: "f1", text: "Construction delay at a specific site due to permitting.", correct: "expected-cf", explanation: "Site-specific delay affects the timing and amount of expected cash flow. It is largely idiosyncratic and does not increase the required return." },
  { id: "f2", text: "Consumer spending declines during a recession.", correct: "systematic", explanation: "Recession-driven traffic decline is covariance with broad market conditions. This is systematic risk that should be reflected in the discount rate." },
  { id: "f3", text: "Food-cost inflation across the industry.", correct: "both", explanation: "Food inflation may be partially cyclical (systematic) and partially commodity-specific (idiosyncratic). It affects both expected cash flow and potentially the discount rate." },
  { id: "f4", text: "Individual-site failure due to poor local management.", correct: "expected-cf", explanation: "Site-specific management quality is idiosyncratic. It affects the probability-weighted expected cash flow, not the required return." },
  { id: "f5", text: "Labor-cost pressure during a tight employment market.", correct: "both", explanation: "Labor costs have both cyclical (systematic) and structural components. Rising wages during an expansion affect margins and may carry systematic exposure." },
  { id: "f6", text: "Changes in consumer dining preferences over the next decade.", correct: "insufficient", explanation: "Long-term preference shifts may or may not be related to market conditions. Without more analysis, the classification is uncertain." },
];

const OPTIONS: { key: Classification; label: string }[] = [
  { key: "expected-cf", label: "Expected CF uncertainty" },
  { key: "systematic", label: "Systematic risk" },
  { key: "both", label: "Both" },
  { key: "insufficient", label: "Insufficient info" },
];

const toneText: Record<string, string> = {
  "expected-cf": "text-accent-cyan", systematic: "text-accent-red", both: "text-accent-amber", insufficient: "text-slate-400",
};
const toneBorder: Record<string, string> = {
  "expected-cf": "border-accent-cyan/40", systematic: "border-accent-red/40", both: "border-accent-amber/40", insufficient: "border-white/20",
};
const toneBg: Record<string, string> = {
  "expected-cf": "bg-accent-cyan/[0.06]", systematic: "bg-accent-red/[0.06]", both: "bg-accent-amber/[0.06]", insufficient: "bg-white/[0.03]",
};

export default function MeridianRiskClassification() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Classification>>({});
  const assign = (id: string, c: Classification) => setPicks((p) => ({ ...p, [id]: c }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Do not automatically increase the discount rate for every source of uncertainty. Some risks
          belong in expected cash flow, some affect the required return, and some affect both.
        </p>
      </div>
      <div className="space-y-4">
        {FACTORS.map((f) => {
          const pick = picks[f.id]; const isCorrect = pick === f.correct;
          return (
            <div key={f.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <p className="text-[15px] leading-[1.55] text-slate-100">{f.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {OPTIONS.map((o) => {
                  const isPicked = pick === o.key;
                  return (
                    <button key={o.key} type="button" onClick={() => assign(f.id, o.key)}
                      className={cn("rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                        !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                        isPicked && cn(toneBorder[o.key], toneBg[o.key], toneText[o.key]))}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {pick && (
                  <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <p className={cn("mt-2.5 text-[13px] leading-[1.55]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                      {isCorrect ? "✓ " : "✗ Reconsider — "}<span className="text-slate-300">{f.explanation}</span>
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
