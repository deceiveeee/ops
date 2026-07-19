"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";

type ScenarioKey = "bear" | "base" | "bull";

type Scenario = {
  key: ScenarioKey;
  name: string;
  icon: string;
  matureSales: number;
  rampYears: number;
  margin: number;
  devCost: number;
  closureRate: number;
  cannibalization: number;
  discountRate: number;
  tone: "red" | "amber" | "green";
};

const SCENARIOS: Scenario[] = [
  {
    key: "bear",
    name: "Bear",
    icon: "▼",
    matureSales: 2.0,
    rampYears: 4,
    margin: 16,
    devCost: 1.4,
    closureRate: 5,
    cannibalization: 10,
    discountRate: 12,
    tone: "red",
  },
  {
    key: "base",
    name: "Base",
    icon: "●",
    matureSales: 2.5,
    rampYears: 3,
    margin: 20,
    devCost: 1.2,
    closureRate: 3,
    cannibalization: 5,
    discountRate: 10,
    tone: "amber",
  },
  {
    key: "bull",
    name: "Bull",
    icon: "▲",
    matureSales: 3.0,
    rampYears: 2,
    margin: 24,
    devCost: 1.1,
    closureRate: 1,
    cannibalization: 2,
    discountRate: 10,
    tone: "green",
  },
];

const HORIZON = 8;

function perStoreNPV(s: Pick<Scenario, "matureSales" | "rampYears" | "margin" | "devCost" | "closureRate" | "cannibalization" | "discountRate">): number {
  const flows: number[] = [-s.devCost];
  let active = 1;
  for (let y = 1; y <= HORIZON; y++) {
    const ramp = Math.min(y / s.rampYears, 1);
    const sales = s.matureSales * ramp * (1 - s.cannibalization / 100);
    const opProfit = sales * (s.margin / 100);
    const maint = sales * 0.04;
    flows.push((opProfit - maint) * active);
    active *= 1 - s.closureRate / 100;
  }
  const final = flows[flows.length - 1];
  flows[flows.length - 1] += final * 4;
  let total = 0;
  for (let t = 0; t < flows.length; t++) {
    total += flows[t] / Math.pow(1 + s.discountRate / 100, t);
  }
  return total;
}

function breakEvenSales(s: Scenario): number {
  const npvAtCurrent = perStoreNPV(s);
  const zero = { ...s, matureSales: 0 };
  const npvAtZero = perStoreNPV(zero);
  const slope = npvAtCurrent - npvAtZero;
  if (Math.abs(slope) < 0.001) return s.matureSales;
  return Math.max(0, (-npvAtZero * s.matureSales) / slope);
}

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtM(n: number) {
  return `$${fmt(n)}M`;
}

const toneText: Record<string, string> = {
  red: "text-accent-red",
  amber: "text-accent-amber",
  green: "text-accent-green",
};
const toneBorder: Record<string, string> = {
  red: "border-accent-red/40",
  amber: "border-accent-amber/40",
  green: "border-accent-green/40",
};
const toneBg: Record<string, string> = {
  red: "bg-accent-red/[0.06]",
  amber: "bg-accent-amber/[0.06]",
  green: "bg-accent-green/[0.06]",
};

export default function ProjectScenarioExplorer() {
  const [active, setActive] = useState<ScenarioKey>("base");
  const s = SCENARIOS.find((x) => x.key === active)!;
  const npv = perStoreNPV(s);
  const programNPV = npv * 50 + (npv * 50) / Math.pow(1 + s.discountRate / 100, 1);
  const be = breakEvenSales(s);

  return (
    <div className="space-y-6">
      {/* Scenario selector — not color-only: each has a shape icon */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="tablist" aria-label="Scenario">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.key}
            type="button"
            role="tab"
            aria-selected={active === sc.key}
            onClick={() => setActive(sc.key)}
            className={cn(
              "rounded-2xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              active === sc.key
                ? cn(toneBorder[sc.tone], toneBg[sc.tone])
                : "border-white/12 bg-white/[0.02] hover:border-white/25",
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("font-mono text-[16px]", active === sc.key ? toneText[sc.tone] : "text-slate-400")}>
                {sc.icon}
              </span>
              <span className={cn("font-display text-[17px] font-medium", active === sc.key ? "text-white" : "text-slate-200")}>
                {sc.name}
              </span>
            </div>
            <p className="ops-body mt-2 text-[13px] leading-[1.5] text-slate-300">
              {sc.key === "bear" && "Lower mature sales, slower ramp, thinner margin, higher opening cost."}
              {sc.key === "base" && "Management's central assumptions."}
              {sc.key === "bull" && "Higher sales, faster ramp, stronger margin, controlled costs."}
            </p>
          </button>
        ))}
      </div>

      {/* Scenario assumption table */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Assumptions by scenario
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-white/20 text-left">
                <th className="py-2 pr-6 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Assumption</th>
                <th className="py-2 pr-6 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-accent-red">Bear</th>
                <th className="py-2 pr-6 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-accent-amber">Base</th>
                <th className="py-2 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-accent-green">Bull</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums text-slate-100">
              {[
                { label: "Mature sales / store", get: (x: Scenario) => fmtM(x.matureSales) },
                { label: "Years to maturity", get: (x: Scenario) => `${x.rampYears}` },
                { label: "Store-level margin", get: (x: Scenario) => `${x.margin}%` },
                { label: "Dev cost / store", get: (x: Scenario) => fmtM(x.devCost) },
                { label: "Closure rate", get: (x: Scenario) => `${x.closureRate}%` },
                { label: "Cannibalization", get: (x: Scenario) => `${x.cannibalization}%` },
                { label: "Discount rate", get: (x: Scenario) => `${x.discountRate}%` },
              ].map((row) => (
                <tr key={row.label} className="border-b border-white/5">
                  <td className="py-2 pr-6 text-slate-300">{row.label}</td>
                  {SCENARIOS.map((sc) => (
                    <td key={sc.key} className={cn("py-2 pr-6 text-right", active === sc.key ? "text-white" : "text-slate-400")}>
                      {row.get(sc)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="py-3 pr-6 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">NPV / store</td>
                {SCENARIOS.map((sc) => {
                  const n = perStoreNPV(sc);
                  return (
                    <td key={sc.key} className={cn("py-3 pr-6 text-right font-mono text-[15px]", n > 0 ? "text-accent-green" : "text-accent-red")}>
                      {fmtM(n)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Active scenario detail */}
      <div className={cn("rounded-2xl border p-5 sm:p-6", toneBorder[s.tone], toneBg[s.tone])}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={cn("font-mono text-[12px] uppercase tracking-[0.16em]", toneText[s.tone])}>
            {s.name} case · active
          </span>
          <span className={cn("font-mono text-[15px] tabular-nums", npv > 0 ? "text-accent-green" : "text-accent-red")}>
            per-store NPV {fmtM(npv)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Readout label="Per-store NPV" value={fmtM(npv)} tone={npv > 0 ? "green" : "red"} />
          <Readout label="Program NPV (100 stores)" value={fmtM(programNPV)} tone={npv > 0 ? "green" : "red"} />
          <Readout label="Break-even mature sales" value={fmtM(be)} tone="amber" />
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
          <BlockMath>
            {String.raw`\text{break-even sales} \approx ${fmt(be)}\,\text{M / store / year}`}
          </BlockMath>
        </div>

        <p className="ops-body mt-4 text-[15px] leading-[1.7] text-slate-100">
          {s.key === "bear" && (
            <>
              Under adverse assumptions, the program destroys value. Stores would need to reach{" "}
              <span className="text-white">{fmtM(be)}</span> in mature sales — well above the
              bear-case {fmtM(s.matureSales)} — just to break even at the higher {s.discountRate}%
              discount rate. The combination of weaker unit economics and a higher required return
              compounds against the investment.
            </>
          )}
          {s.key === "base" && (
            <>
              At management&apos;s central assumptions, the program appears modestly value-creating.
              But the cushion is thin: mature sales would need to fall only to{" "}
              <span className="text-white">{fmtM(be)}</span> before value creation disappears. The
              investor should watch actual openings, sales-per-store, and margins closely.
            </>
          )}
          {s.key === "bull" && (
            <>
              Under favorable assumptions, the program creates substantial value. But this is the
              upside case — the investor should not anchor on it. The relevant question is whether
              value survives in the base and bear cases, not whether it is large in the bull case.
            </>
          )}
        </p>
      </div>

      {/* Required analytical questions */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          The questions scenario analysis should answer
        </div>
        <ul className="mt-4 space-y-2.5">
          {[
            "What sales level produces zero NPV?",
            "How much cost overrun can the project tolerate?",
            "How long can the ramp-up take before value disappears?",
            "Does the project remain attractive across a reasonable discount-rate range?",
            "Which assumption has the greatest impact on value?",
          ].map((q) => (
            <li key={q} className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
              <span className="text-[15px] leading-[1.6] text-slate-100">{q}</span>
            </li>
          ))}
        </ul>
        <p className="ops-body mt-4 text-[16px] leading-[1.65] text-white">
          The purpose of scenario analysis is not to guess one perfectly accurate number. It is to
          identify <span className="text-accent-amber">which assumptions determine whether the
          investment creates value</span>.
        </p>
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red" | "amber";
}) {
  const text =
    tone === "green"
      ? "text-accent-green"
      : tone === "red"
        ? "text-accent-red"
        : tone === "amber"
          ? "text-accent-amber"
          : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className={cn("mt-2 font-mono text-[16px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
