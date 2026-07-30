"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmtK(n: number, d = 0) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}

const HORIZON = 5;

function computeNPV(
  matureSales: number, margin: number, yearsToMature: number,
  maintPct: number, construction: number, preOpening: number,
  workingCapital: number, residual: number, rate: number,
) {
  let total = -(construction + preOpening + workingCapital);
  for (let y = 1; y <= HORIZON; y++) {
    const ramp = Math.min(y / yearsToMature, 1);
    const sales = matureSales * 1000 * ramp;
    const opProfit = sales * (margin / 100);
    const maint = sales * (maintPct / 100);
    let cf = opProfit - maint;
    if (y === HORIZON) cf += residual + workingCapital;
    total += cf / Math.pow(1 + rate / 100, y);
  }
  return total;
}

type BreakKey = "sales" | "margin" | "cost" | "ramp";

const PRE_OPENING = 100;
const WORKING_CAPITAL = 100;
const MAINT_PCT = 4;
const RESIDUAL = 150;
const RATE = 10;

function solveBreakEven(
  variable: BreakKey,
  baseMatureSales: number, baseMargin: number,
  baseConstruction: number, baseRamp: number,
) {
  // Binary search for the value that produces NPV = 0
  const testNPV = (val: number) => {
    switch (variable) {
      case "sales":
        return computeNPV(val, baseMargin, baseRamp, MAINT_PCT, baseConstruction, PRE_OPENING, WORKING_CAPITAL, RESIDUAL, RATE);
      case "margin":
        return computeNPV(baseMatureSales, val, baseRamp, MAINT_PCT, baseConstruction, PRE_OPENING, WORKING_CAPITAL, RESIDUAL, RATE);
      case "cost":
        return computeNPV(baseMatureSales, baseMargin, baseRamp, MAINT_PCT, val, PRE_OPENING, WORKING_CAPITAL, RESIDUAL, RATE);
      case "ramp":
        return computeNPV(baseMatureSales, baseMargin, val, MAINT_PCT, baseConstruction, PRE_OPENING, WORKING_CAPITAL, RESIDUAL, RATE);
    }
  };

  let lo: number, hi: number;
  switch (variable) {
    case "sales": lo = 0; hi = 10; break;
    case "margin": lo = 0; hi = 40; break;
    case "cost": lo = 0; hi = 3000; break;
    case "ramp": lo = 1; hi = 10; break;
  }
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (testNPV(mid) < 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

const TABS: { key: BreakKey; label: string; unit: string; format: (v: number) => string }[] = [
  { key: "sales", label: "Break-even mature sales", unit: "M/yr", format: (v) => `$${v.toFixed(2)}M` },
  { key: "margin", label: "Break-even margin", unit: "%", format: (v) => `${v.toFixed(1)}%` },
  { key: "cost", label: "Max tolerable construction", unit: "K", format: (v) => fmtK(Math.round(v)) },
  { key: "ramp", label: "Max years to maturity", unit: "yrs", format: (v) => `${v.toFixed(1)} yrs` },
];

export default function NPVBreakEvenSolver() {
  const [tab, setTab] = useState<BreakKey>("sales");

  const baseSales = 2.5;
  const baseMargin = 20;
  const baseConstruction = 900;
  const baseRamp = 3;

  const baseNPV = computeNPV(baseSales, baseMargin, baseRamp, MAINT_PCT, baseConstruction, PRE_OPENING, WORKING_CAPITAL, RESIDUAL, RATE);
  const breakEven = solveBreakEven(tab, baseSales, baseMargin, baseConstruction, baseRamp);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          Instead of asking only &ldquo;What is the exact NPV?&rdquo; ask:{" "}
          <span className="text-white">&ldquo;What must be true for NPV to equal zero?&rdquo;</span>
        </p>
        <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-300">
          Base case: mature sales ${baseSales}M, margin {baseMargin}%, construction {fmtK(baseConstruction)},
          {baseRamp}-year ramp, {RATE}% discount rate. Base NPV:{" "}
          <span className={baseNPV > 0 ? "text-accent-green" : "text-accent-red"}>
            {baseNPV >= 0 ? "+" : "−"}{fmtK(Math.abs(Math.round(baseNPV)))}
          </span>.
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Break-even variable">
        {TABS.map((t) => (
          <button
            key={t.key} type="button" role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              tab === t.key
                ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Result */}
      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          {TABS.find((t) => t.key === tab)!.label}
        </div>
        <div className="mt-4">
          <BlockMath>
            {String.raw`\text{NPV} = 0 \;\;\text{when}\;\; ${tab === "sales" ? `S = \\$${breakEven.toFixed(2)}\\,\\text{M}` : tab === "margin" ? `m = ${breakEven.toFixed(1)}\\%` : tab === "cost" ? `C = \\$${Math.round(breakEven).toLocaleString()}` : `T = ${breakEven.toFixed(1)}\\,\\text{yrs}`}`}
          </BlockMath>
        </div>
        <div className="mt-4 font-sans text-[28px] tabular-nums text-white sm:text-[32px]">
          {TABS.find((t) => t.key === tab)!.format(breakEven)}
        </div>
      </div>

      {/* Comparison with base case */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-ink-950/40 p-5">
          <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">Base case</div>
          <div className="mt-2 font-sans text-[18px] text-white">
            {tab === "sales" ? `$${baseSales}M` : tab === "margin" ? `${baseMargin}%` : tab === "cost" ? fmtK(baseConstruction) : `${baseRamp} yrs`}
          </div>
        </div>
        <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5">
          <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-accent-amber">Break-even</div>
          <div className="mt-2 font-sans text-[18px] text-white">
            {TABS.find((t) => t.key === tab)!.format(breakEven)}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.7] text-slate-100">
          {tab === "sales" && (
            <>If mature sales fall below <span className="text-white">${breakEven.toFixed(2)}M/year</span>,
            the project destroys value. Compare this with the company&apos;s historical sales-per-store
            and later actual results.</>
          )}
          {tab === "margin" && (
            <>If restaurant-level margin falls below <span className="text-white">{breakEven.toFixed(1)}%</span>,
            NPV turns negative. This tells the investor how much cost pressure the project can absorb.</>
          )}
          {tab === "cost" && (
            <>If total construction exceeds <span className="text-white">{fmtK(Math.round(breakEven))}</span>,
            the project no longer creates value. This is the maximum the company can spend before
            destroying value.</>
          )}
          {tab === "ramp" && (
            <>If it takes longer than <span className="text-white">{breakEven.toFixed(1)} years</span> to
            reach mature operations, the delayed cash flows push NPV below zero.</>
          )}
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-300">
          A break-even assumption can be compared with the company&apos;s historical performance and
          later actual results. This is often more useful than a single point-estimate NPV.
        </p>
      </div>
    </div>
  );
}
