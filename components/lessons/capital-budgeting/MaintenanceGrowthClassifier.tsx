"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Classification = "maintenance" | "growth" | "mixed" | "insufficient";

type Item = { id: string; text: string; correct: Classification; explanation: string };

const ITEMS: Item[] = [
  { id: "i1", text: "Replacing worn conveyor belts in an existing factory.", correct: "maintenance", explanation: "This preserves existing capacity. Without it, production would decline." },
  { id: "i2", text: "Building a second factory to serve a new geographic market.", correct: "growth", explanation: "This adds new capacity intended to increase future cash flows." },
  { id: "i3", text: "Upgrading all store point-of-sale systems to comply with new payment regulations.", correct: "maintenance", explanation: "Regulatory compliance spending preserves the ability to operate. It does not increase capacity." },
  { id: "i4", text: "Renovating 50 existing stores while simultaneously adding 20 new locations in the same program.", correct: "mixed", explanation: "The program contains both maintenance (renovations) and growth (new locations). The investor must estimate the split." },
  { id: "i5", text: "A $200M technology investment described as 'digital transformation' with no breakdown of maintenance versus new capability.", correct: "insufficient", explanation: "Without further detail, the investor cannot classify this reliably. Digital transformation often blends required upgrades with new capabilities." },
  { id: "i6", text: "Replacing an aging aircraft fleet with newer, more fuel-efficient models.", correct: "mixed", explanation: "Partly maintenance (replacing old aircraft to preserve capacity) and partly growth (fuel efficiency may reduce costs or enable new routes). The split depends on the specifics." },
  { id: "i7", text: "R&D spending on a new drug candidate.", correct: "growth", explanation: "This creates a potential future product. It does not maintain existing operations." },
  { id: "i8", text: "A 15% increase in total capital expenditure with no change in store count, production capacity, or segment assets.", correct: "insufficient", explanation: "Without unit-level data, the investor cannot determine whether the increase is maintenance (costs rising) or growth (early-stage projects not yet operational)." },
];

const OPTIONS: { key: Classification; label: string; tone: "cyan" | "amber" | "purple" | "slate" }[] = [
  { key: "maintenance", label: "Maintenance", tone: "cyan" },
  { key: "growth", label: "Growth", tone: "amber" },
  { key: "mixed", label: "Mixed", tone: "purple" },
  { key: "insufficient", label: "Insufficient info", tone: "slate" },
];

const toneText: Record<string, string> = { cyan: "text-accent-cyan", amber: "text-accent-amber", purple: "text-accent-purple", slate: "text-slate-400" };
const toneBorder: Record<string, string> = { cyan: "border-accent-cyan/40", amber: "border-accent-amber/40", purple: "border-accent-purple/40", slate: "border-white/20" };
const toneBg: Record<string, string> = { cyan: "bg-accent-cyan/[0.06]", amber: "bg-accent-amber/[0.06]", purple: "bg-accent-purple/[0.06]", slate: "bg-white/[0.03]" };

export default function MaintenanceGrowthClassifier() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Classification>>({});
  const assign = (id: string, c: Classification) => setPicks((p) => ({ ...p, [id]: c }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">Maintenance investment</div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">Capital required to preserve existing operating capacity and cash flows.</p>
        </div>
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-amber">Growth investment</div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">Capital intended to increase future capacity, customers, products, or cash flows.</p>
        </div>
      </div>
      <div className="space-y-4">
        {ITEMS.map((item) => {
          const pick = picks[item.id]; const isCorrect = pick === item.correct;
          return (
            <div key={item.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <p className="text-[15px] leading-[1.55] text-slate-100">{item.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {OPTIONS.map((o) => {
                  const isPicked = pick === o.key;
                  return (
                    <button key={o.key} type="button" onClick={() => assign(item.id, o.key)}
                      className={cn("rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                        !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                        isPicked && cn(toneBorder[o.tone], toneBg[o.tone], toneText[o.tone]))}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {pick && (
                  <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <p className={cn("mt-2.5 text-[13px] leading-[1.55]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                      {isCorrect ? "✓ " : "✗ Reconsider — "}<span className="text-slate-300">{item.explanation}</span>
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
