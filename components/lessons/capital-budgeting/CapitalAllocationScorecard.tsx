"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Rating = "strong" | "adequate" | "weak" | "unclear";

type Category = {
  key: string;
  label: string;
  questions: string[];
};

const CATEGORIES: Category[] = [
  { key: "organic", label: "Organic investment", questions: ["Are incremental returns above the cost of capital?", "Are returns declining as expansion continues?"] },
  { key: "capacity", label: "Reinvestment capacity", questions: ["Can attractive returns be sustained at meaningful scale?"] },
  { key: "acquisitions", label: "Acquisitions", questions: ["Does management pay disciplined prices?", "Are synergies realized?", "Are impairments frequent?"] },
  { key: "balance", label: "Balance sheet", questions: ["Is leverage appropriate?", "Is liquidity sufficient?"] },
  { key: "buybacks", label: "Buybacks", questions: ["Were shares purchased at attractive prices?", "Did diluted share count decline?"] },
  { key: "dividends", label: "Dividends", questions: ["Are distributions sustainable after maintenance and valuable growth?"] },
  { key: "cash", label: "Cash", questions: ["Is retained liquidity purposeful?"] },
  { key: "credibility", label: "Credibility", questions: ["Do actual outcomes resemble original claims?"] },
];

const RATINGS: { key: Rating; label: string; tone: "green" | "amber" | "red" | "slate" }[] = [
  { key: "strong", label: "Strong", tone: "green" },
  { key: "adequate", label: "Adequate", tone: "amber" },
  { key: "weak", label: "Weak", tone: "red" },
  { key: "unclear", label: "Insufficient evidence", tone: "slate" },
];

const toneText: Record<string, string> = { green: "text-accent-green", amber: "text-accent-amber", red: "text-accent-red", slate: "text-slate-400" };
const toneBorder: Record<string, string> = { green: "border-accent-green/40", amber: "border-accent-amber/40", red: "border-accent-red/40", slate: "border-white/20" };
const toneBg: Record<string, string> = { green: "bg-accent-green/[0.06]", amber: "bg-accent-amber/[0.06]", red: "bg-accent-red/[0.06]", slate: "bg-white/[0.03]" };

export default function CapitalAllocationScorecard() {
  const [ratings, setRatings] = useState<Record<string, Rating>>({});

  const assign = (key: string, r: Rating) => setRisks((p) => ({ ...p, [key]: r }));
  const setRisks = setRatings;

  const strongCount = Object.values(ratings).filter((r) => r === "strong").length;
  const weakCount = Object.values(ratings).filter((r) => r === "weak").length;
  const answered = Object.keys(ratings).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">Capital-allocation scorecard</span>
          <span className="font-sans text-[12px] text-slate-400">{answered}/{CATEGORIES.length} rated</span>
        </div>
      </div>

      <div className="space-y-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-medium text-white">{cat.label}</span>
              {ratings[cat.key] && (
                <span className={cn("font-sans text-[11px] uppercase tracking-[0.14em]", toneText[ratings[cat.key]])}>
                  {RATINGS.find((r) => r.key === ratings[cat.key])?.label}
                </span>
              )}
            </div>
            <div className="mt-1.5 space-y-0.5">
              {cat.questions.map((q) => (
                <div key={q} className="text-[12px] leading-[1.45] text-slate-400">{q}</div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {RATINGS.map((r) => {
                const isPicked = ratings[cat.key] === r.key;
                return (
                  <button key={r.key} type="button"
                    onClick={() => assign(cat.key, r.key)}
                    className={cn("rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                      !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                      isPicked && cn(toneBorder[r.tone], toneBg[r.tone], toneText[r.tone]))}>
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {answered >= 4 && (
        <div className={cn("rounded-2xl border p-5 sm:p-6",
          weakCount > strongCount ? "border-accent-red/25 bg-accent-red/[0.05]" : strongCount > weakCount ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-amber/25 bg-accent-amber/[0.05]")}>
          <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
            {weakCount > strongCount
              ? <>The scorecard shows more weaknesses than strengths. The investor should investigate specific concerns and consider whether management&apos;s capital-allocation discipline warrants confidence.</>
              : strongCount > weakCount
                ? <>The scorecard shows more strengths than weaknesses. But verify that each &ldquo;strong&rdquo; rating is supported by specific evidence, not just favorable accounting metrics.</>
                : <>The scorecard shows a mixed picture. Capital allocation quality varies across categories — this is common and requires nuanced judgment rather than a single overall grade.</>}
          </p>
          <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-400">
            Avoid a single unsupported numerical score. Permit mixed conclusions. Confidence depends on disclosure quality.
          </p>
        </div>
      )}
    </div>
  );
}
