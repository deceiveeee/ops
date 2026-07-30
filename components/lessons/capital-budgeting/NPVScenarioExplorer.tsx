"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmtK(n: number, d = 0) {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}

const HORIZON = 5;

function computeNPV(
  matureSales: number, margin: number, yearsToMature: number,
  maintPct: number, construction: number, preOpening: number,
  workingCapital: number, cannibalization: number, residual: number, rate: number,
) {
  let total = -(construction + preOpening + workingCapital);
  let active = 1;
  for (let y = 1; y <= HORIZON; y++) {
    const ramp = Math.min(y / yearsToMature, 1);
    const sales = matureSales * 1000 * ramp * (1 - cannibalization / 100);
    const opProfit = sales * (margin / 100);
    const maint = sales * (maintPct / 100);
    let cf = (opProfit - maint) * active;
    if (y === HORIZON) cf += residual + workingCapital;
    total += cf / Math.pow(1 + rate / 100, y);
    active *= 1; // no closure in scenario model for simplicity
  }
  return total;
}

type ScenarioKey = "bear" | "base" | "bull";

type Scenario = {
  key: ScenarioKey;
  name: string;
  icon: string;
  matureSales: number;
  margin: number;
  yearsToMature: number;
  maintPct: number;
  construction: number;
  cannibalization: number;
  residual: number;
  rate: number;
  tone: "red" | "amber" | "green";
};

const SCENARIOS: Scenario[] = [
  {
    key: "bear", name: "Bear", icon: "▼",
    matureSales: 2.0, margin: 15, yearsToMature: 4, maintPct: 5,
    construction: 1050, cannibalization: 8, residual: 100, rate: 12, tone: "red",
  },
  {
    key: "base", name: "Base", icon: "●",
    matureSales: 2.5, margin: 20, yearsToMature: 3, maintPct: 4,
    construction: 900, cannibalization: 0, residual: 150, rate: 10, tone: "amber",
  },
  {
    key: "bull", name: "Bull", icon: "▲",
    matureSales: 3.0, margin: 24, yearsToMature: 2, maintPct: 3,
    construction: 850, cannibalization: 0, residual: 200, rate: 10, tone: "green",
  },
];

const PRE_OPENING = 100;
const WORKING_CAPITAL = 100;

const toneText: Record<string, string> = { red: "text-accent-red", amber: "text-accent-amber", green: "text-accent-green" };
const toneBorder: Record<string, string> = { red: "border-accent-red/40", amber: "border-accent-amber/40", green: "border-accent-green/40" };
const toneBg: Record<string, string> = { red: "bg-accent-red/[0.06]", amber: "bg-accent-amber/[0.06]", green: "bg-accent-green/[0.06]" };

export default function NPVScenarioExplorer() {
  const [active, setActive] = useState<ScenarioKey>("base");
  const s = SCENARIOS.find((x) => x.key === active)!;
  const npv = computeNPV(s.matureSales, s.margin, s.yearsToMature, s.maintPct, s.construction, PRE_OPENING, WORKING_CAPITAL, s.cannibalization, s.residual, s.rate);

  return (
    <div className="space-y-6">
      {/* Scenario selector */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="tablist" aria-label="Scenario">
        {SCENARIOS.map((sc) => {
          const n = computeNPV(sc.matureSales, sc.margin, sc.yearsToMature, sc.maintPct, sc.construction, PRE_OPENING, WORKING_CAPITAL, sc.cannibalization, sc.residual, sc.rate);
          return (
            <button
              key={sc.key} type="button" role="tab"
              aria-selected={active === sc.key}
              onClick={() => setActive(sc.key)}
              className={cn(
                "rounded-2xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                active === sc.key ? cn(toneBorder[sc.tone], toneBg[sc.tone]) : "border-white/12 bg-white/[0.02] hover:border-white/25",
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("font-sans text-[16px]", active === sc.key ? toneText[sc.tone] : "text-slate-400")}>{sc.icon}</span>
                <span className={cn("font-display text-[17px] font-medium", active === sc.key ? "text-white" : "text-slate-200")}>{sc.name}</span>
              </div>
              <div className={cn("mt-2 font-sans text-[15px] tabular-nums", n > 0 ? "text-accent-green" : "text-accent-red")}>
                {fmtK(Math.round(n))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Assumption table */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-white/20 text-right">
                <th className="py-2 pr-6 text-left font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">Assumption</th>
                <th className="py-2 pr-6 font-sans text-[11px] uppercase tracking-[0.14em] text-accent-red">Bear</th>
                <th className="py-2 pr-6 font-sans text-[11px] uppercase tracking-[0.14em] text-accent-amber">Base</th>
                <th className="py-2 font-sans text-[11px] uppercase tracking-[0.14em] text-accent-green">Bull</th>
              </tr>
            </thead>
            <tbody className="font-sans tabular-nums">
              {[
                { label: "Mature sales", get: (s: Scenario) => `$${s.matureSales.toFixed(1)}M` },
                { label: "Margin", get: (s: Scenario) => `${s.margin}%` },
                { label: "Years to maturity", get: (s: Scenario) => `${s.yearsToMature}` },
                { label: "Construction", get: (s: Scenario) => `$${s.construction}K` },
                { label: "Cannibalization", get: (s: Scenario) => `${s.cannibalization}%` },
                { label: "Discount rate", get: (s: Scenario) => `${s.rate}%` },
              ].map((row) => (
                <tr key={row.label} className="border-b border-white/5">
                  <td className="py-2 pr-6 text-left text-slate-300">{row.label}</td>
                  {SCENARIOS.map((sc) => (
                    <td key={sc.key} className={cn("py-2 pr-6 text-right", active === sc.key ? "text-white" : "text-slate-400")}>
                      {row.get(sc)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="py-3 pr-6 text-left font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">NPV</td>
                {SCENARIOS.map((sc) => {
                  const n = computeNPV(sc.matureSales, sc.margin, sc.yearsToMature, sc.maintPct, sc.construction, PRE_OPENING, WORKING_CAPITAL, sc.cannibalization, sc.residual, sc.rate);
                  return (
                    <td key={sc.key} className={cn("py-3 pr-6 text-right font-sans text-[15px]", n > 0 ? "text-accent-green" : "text-accent-red")}>
                      {fmtK(Math.round(n))}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Active scenario interpretation */}
      <div className={cn("rounded-2xl border p-5 sm:p-6", toneBorder[s.tone], toneBg[s.tone])}>
        <div className={cn("font-sans text-[12px] uppercase tracking-[0.16em]", toneText[s.tone])}>
          {s.name} case · interpretation
        </div>
        <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-100">
          {s.key === "bear" && npv < 0 && (
            <>Under adverse assumptions, the location destroys value. Higher construction cost,
            slower ramp, thinner margins, cannibalization, and a higher discount rate combine to
            push NPV negative. The question is whether these assumptions are realistic or pessimistic.</>
          )}
          {s.key === "base" && (
            <>At central assumptions, the location creates modest value. But the cushion is thin —
            small changes in mature sales or margin could push NPV toward zero.</>
          )}
          {s.key === "bull" && (
            <>Under favorable assumptions, the location creates substantial value. But this is the
            upside case. The relevant question is whether value survives in the base and bear cases.</>
          )}
        </p>
      </div>

      {/* Analytical questions */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Questions the investor should answer
        </div>
        <ul className="mt-3 space-y-2.5">
          {[
            "What mature sales level produces zero NPV?",
            "What is the maximum development cost the project can tolerate?",
            "How long can the ramp-up take before value disappears?",
            "Does the investment remain attractive under a higher discount rate?",
            "Which assumption has the largest effect on value?",
            "Is the positive NPV robust, or does it depend on aggressive assumptions?",
          ].map((q) => (
            <li key={q} className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
              <span className="text-[15px] leading-[1.6] text-slate-100">{q}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
