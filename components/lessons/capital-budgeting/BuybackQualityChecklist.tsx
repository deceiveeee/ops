"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type CheckKey = "price" | "diluted" | "debt" | "opportunity" | "balance" | "timing";

const CHECKS: { key: CheckKey; question: string; green: string; red: string }[] = [
  { key: "price", question: "What price was paid?", green: "Shares repurchased below intrinsic value — continuing shareholders benefit.", red: "Shares repurchased above intrinsic value — value transferred to sellers." },
  { key: "diluted", question: "Did the diluted share count actually decline?", green: "Net share count fell, confirming real ownership concentration.", red: "Buybacks merely offset stock-based compensation — no real share-count reduction." },
  { key: "debt", question: "Was debt issued to fund the repurchase?", green: "Funded from excess cash without increasing leverage.", red: "Debt-funded buyback weakened the balance sheet and increased refinancing risk." },
  { key: "opportunity", question: "What internal opportunities were forgone?", green: "No attractive positive-NPV investments were available.", red: "Higher-return organic investments were starved to fund the buyback." },
  { key: "balance", question: "Was the balance sheet weakened?", green: "Liquidity and solvency remain adequate after the repurchase.", red: "The buyback depleted reserves needed for downturn resilience." },
  { key: "timing", question: "Did management buy consistently or only after price increases?", green: "Repurchases were disciplined across market conditions.", red: "Heavy buying at highs, none at lows — suggesting price-insensitive execution." },
];

export default function BuybackQualityChecklist() {
  const [answers, setAnswers] = useState<Record<CheckKey, "green" | "red" | null>>({
    price: null, diluted: null, debt: null, opportunity: null, balance: null, timing: null,
  });

  const answered = Object.values(answers).filter((v) => v !== null).length;
  const greenCount = Object.values(answers).filter((v) => v === "green").length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Buyback quality checklist · {answered}/{CHECKS.length} answered
        </div>
        <div className="mt-4 space-y-4">
          {CHECKS.map((c) => (
            <div key={c.key} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <p className="text-[15px] font-medium leading-[1.55] text-white">{c.question}</p>
              <div className="mt-3 flex gap-2">
                <button type="button"
                  onClick={() => setAnswers((p) => ({ ...p, [c.key]: "green" }))}
                  className={cn("rounded-full border px-4 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                    answers[c.key] === "green" ? "border-accent-green bg-accent-green/15 text-accent-green" : "border-white/15 text-slate-300 hover:border-white/30")}>
                  ✓ Supports buyback
                </button>
                <button type="button"
                  onClick={() => setAnswers((p) => ({ ...p, [c.key]: "red" }))}
                  className={cn("rounded-full border px-4 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                    answers[c.key] === "red" ? "border-accent-red bg-accent-red/15 text-accent-red" : "border-white/15 text-slate-300 hover:border-white/30")}>
                  ✗ Concern
                </button>
              </div>
              {answers[c.key] && (
                <p className={cn("mt-2.5 text-[13px] leading-[1.55]",
                  answers[c.key] === "green" ? "text-accent-green" : "text-accent-red")}>
                  {answers[c.key] === "green" ? c.green : c.red}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {answered === CHECKS.length && (
        <div className={cn("rounded-2xl border p-5 sm:p-6",
          greenCount >= 4 ? "border-accent-green/25 bg-accent-green/[0.05]" : greenCount >= 2 ? "border-accent-amber/25 bg-accent-amber/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
          <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
            {greenCount >= 4
              ? <>The buyback shows multiple signs of discipline: attractive price, real share-count reduction, sound balance sheet, and no better alternatives forgone. This is consistent with value creation.</>
              : greenCount >= 2
                ? <>The buyback shows a mix of supportive and concerning signs. The investor should weigh which factors matter most for this specific company.</>
                : <>Multiple concerns suggest the buyback may be destroying value. The investor should investigate price, dilution offset, leverage, and forgone opportunities.</>}
          </p>
        </div>
      )}
    </div>
  );
}
