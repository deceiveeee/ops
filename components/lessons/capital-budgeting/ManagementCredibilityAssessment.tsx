"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Rating = "strong" | "adequate" | "weak" | "unclear";

type Dimension = { key: string; label: string; question: string; evidence: string };

const DIMENSIONS: Dimension[] = [
  { key: "forecasting", label: "Forecasting discipline", question: "Were original assumptions clearly disclosed?", evidence: "Cost targets and synergy estimates were disclosed but proved optimistic." },
  { key: "disclosure", label: "Disclosure quality", question: "Were misses acknowledged promptly?", evidence: "Year 1 results were reported; revision timing and transparency varied." },
  { key: "revision", label: "Willingness to revise", question: "Did management revise guidance realistically?", evidence: "Integration costs were revised upward; synergy claims were maintained." },
  { key: "execution", label: "Execution", question: "Were stores opened on schedule and on budget?", evidence: "40 of 50 stores opened; costs 9% above plan." },
  { key: "integration", label: "Acquisition integration", question: "Were acquisition problems described transparently?", evidence: "Synergies well below target; integration costs raised; deal still 'strategically important.'" },
  { key: "balance", label: "Balance-sheet discipline", question: "Was leverage controlled?", evidence: "Debt increased; buyback not executed despite authorization." },
  { key: "metrics", label: "Metric consistency", question: "Did management maintain consistent metrics?", evidence: "EPS accretion emphasized despite negative NPV; ROIC not prominently discussed after decline." },
];

const RATINGS: { key: Rating; label: string }[] = [
  { key: "strong", label: "Strong" }, { key: "adequate", label: "Adequate" },
  { key: "weak", label: "Weak" }, { key: "unclear", label: "Insufficient evidence" },
];

const toneText: Record<string, string> = { strong: "text-accent-green", adequate: "text-accent-amber", weak: "text-accent-red", unclear: "text-slate-400" };

export default function ManagementCredibilityAssessment() {
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const assign = (key: string, r: Rating) => setRatings((p) => ({ ...p, [key]: r }));
  const answered = Object.keys(ratings).length;
  const weakCount = Object.values(ratings).filter((r) => r === "weak").length;
  const strongCount = Object.values(ratings).filter((r) => r === "strong").length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Judge credibility from evidence, not tone. Rate each dimension using the Year 1 evidence
          provided. Mixed conclusions are acceptable.
        </p>
      </div>

      <div className="space-y-3">
        {DIMENSIONS.map((d) => (
          <div key={d.key} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex-1">
                <div className="text-[14px] font-medium text-white">{d.label}</div>
                <div className="text-[12px] text-slate-400">{d.question}</div>
                <div className="mt-1 text-[12px] text-slate-300"><span className="text-slate-500">Evidence: </span>{d.evidence}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {RATINGS.map((r) => (
                <button key={r.key} type="button" onClick={() => assign(d.key, r.key)}
                  className={cn("rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                    !ratings[d.key] && "border-white/15 text-slate-300 hover:border-white/30",
                    ratings[d.key] === r.key && cn("border-current", toneText[r.key]))}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {answered >= 4 && (
        <div className={cn("rounded-2xl border p-5 sm:p-6",
          weakCount > strongCount ? "border-accent-red/25 bg-accent-red/[0.05]"
          : strongCount > weakCount ? "border-accent-green/25 bg-accent-green/[0.05]"
          : "border-accent-amber/25 bg-accent-amber/[0.05]")}>
          <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
            {weakCount > strongCount
              ? "The evidence suggests declining confidence. Multiple dimensions show weakness. The investor should discount future management forecasts and increase scrutiny."
              : strongCount > weakCount
                ? "The evidence is broadly supportive, though not without concerns. Management appears to face execution challenges but may be fundamentally sound."
                : "Mixed record. Some dimensions are strong; others are weak. Management credibility is uncertain — the investor should wait for more evidence before forming a firm judgment."}
          </p>
          <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-400">
            Do not produce an unsupported single letter grade. Credibility should accumulate over
            multiple cycles and comparisons between claims and outcomes.
          </p>
        </div>
      )}
    </div>
  );
}
