"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Statement = { id: string; claim: string; flag: string; evidenceNeeded: string };

const STATEMENTS: Statement[] = [
  { id: "s1", claim: "\"Revenue grew 30% this year through strategic acquisitions.\"", flag: "Acquisition dependence", evidenceNeeded: "What was organic growth? Are acquired businesses performing, or just adding revenue? Are integration costs recurring 'one-time' charges?" },
  { id: "s2", claim: "\"We returned $2 billion to shareholders through buybacks.\"", flag: "Buybacks offsetting dilution", evidenceNeeded: "Did the diluted share count actually decline? Was stock compensation offsetting the buyback? What price was paid?" },
  { id: "s3", claim: "\"We're investing aggressively in growth — capex is up 40%.\"", flag: "Reinvestment despite declining returns", evidenceNeeded: "Are new-store economics deteriorating? Is incremental ROIC above the cost of capital? Is capacity utilization falling?" },
  { id: "s4", claim: "\"Our ROIC of 18% demonstrates excellent capital allocation.\"", flag: "Selective metrics", evidenceNeeded: "Does the ROIC calculation exclude failed investments or goodwill impairments? Is this company-wide or legacy-asset ROIC?" },
  { id: "s5", claim: "\"We maintain a strong cash position of $5 billion for strategic flexibility.\"", flag: "Excess cash without a plan", evidenceNeeded: "What specific opportunities require this balance? Is the cash earning an adequate return? Has management deployed cash well historically?" },
  { id: "s6", claim: "\"This acquisition is EPS accretive and strategically transformative.\"", flag: "EPS without price", evidenceNeeded: "What was the purchase price relative to standalone and synergy value? What is the NPV? Is 'transformative' masking overpayment?" },
];

const FLAGS = ["Acquisition dependence", "Buybacks offsetting dilution", "Reinvestment despite declining returns", "Selective metrics", "Excess cash without a plan", "EPS without price", "None of these"];

export default function CapitalAllocationRedFlags() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, string>>({});
  const assign = (id: string, flag: string) => setPicks((p) => ({ ...p, [id]: flag }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Management may not be acting improperly. But the investor should identify which red flag
          pattern each statement suggests and what evidence is needed to evaluate it.
        </p>
      </div>

      <div className="space-y-4">
        {STATEMENTS.map((s) => {
          const pick = picks[s.id];
          const isCorrect = pick === s.flag;
          return (
            <div key={s.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <p className="text-[15px] leading-[1.55] text-slate-100">{s.claim}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FLAGS.map((f) => (
                  <button key={f} type="button"
                    onClick={() => assign(s.id, f)}
                    className={cn("rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                      !pick && "border-white/15 text-slate-300 hover:border-white/30",
                      pick === f && isCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                      pick === f && !isCorrect && "border-accent-red bg-accent-red/15 text-accent-red")}>
                    {f}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {pick && (
                  <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <p className={cn("mt-2.5 text-[13px] leading-[1.55]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                      {isCorrect ? "✓ " : "✗ Reconsider — "}<span className="text-slate-300">{s.evidenceNeeded}</span>
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
