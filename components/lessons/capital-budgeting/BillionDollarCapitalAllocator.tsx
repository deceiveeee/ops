"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number, d = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

const TOTAL_CAPITAL = 1000;
const REQUIRED_MAINTENANCE = 150;
const MIN_LIQUIDITY = 100;

type AllocKey = "maintenance" | "growth" | "acquisition" | "debt" | "buyback" | "dividend" | "cash";

const ALLOC_INFO: Record<AllocKey, {
  label: string; max: number; npvPer: number; note: string;
}> = {
  maintenance: { label: "Maintenance (required)", max: REQUIRED_MAINTENANCE, npvPer: 0, note: "Protects existing operations. Underfunding erodes value." },
  growth: { label: "Organic expansion", max: 400, npvPer: 0.20, note: "First $400M earns ~20% NPV. Excess earns 5%." },
  acquisition: { label: "Acquisition", max: 300, npvPer: -0.083, note: "Destroys value under current assumptions: $275M value for $300M cost." },
  debt: { label: "Debt repayment", max: 150, npvPer: 0.10, note: "10% economic benefit from interest and distress reduction." },
  buyback: { label: "Share repurchase", max: 150, npvPer: 0.15, note: "15% value gain assuming shares are ~15% undervalued." },
  dividend: { label: "Dividend", max: 1000, npvPer: 0, note: "Transfers cash to shareholders. No new value created." },
  cash: { label: "Retain cash", max: 1000, npvPer: 0, note: "Flexibility without immediate value creation." },
};

const ORDER: AllocKey[] = ["maintenance", "growth", "acquisition", "debt", "buyback", "dividend", "cash"];

export default function BillionDollarCapitalAllocator() {
  const [alloc, setAlloc] = useState<Record<AllocKey, number>>({
    maintenance: 150, growth: 300, acquisition: 0, debt: 100, buyback: 100, dividend: 250, cash: 100,
  });

  const totalAllocated = ORDER.reduce((s, k) => s + alloc[k], 0);
  const remaining = TOTAL_CAPITAL - totalAllocated;

  const adjust = (key: AllocKey, val: number) => {
    const clamped = Math.max(0, Math.min(val, ALLOC_INFO[key].max));
    const otherTotal = ORDER.reduce((s, k) => (k === key ? s : s + alloc[k]), 0);
    const maxAllowed = TOTAL_CAPITAL - otherTotal;
    setAlloc((p) => ({ ...p, [key]: Math.min(clamped, maxAllowed) }));
  };

  // Calculate total NPV
  let totalNPV = 0;
  ORDER.forEach((k) => {
    if (k === "growth") {
      const within = Math.min(alloc[k], ALLOC_INFO[k].max);
      const excess = Math.max(0, alloc[k] - ALLOC_INFO[k].max);
      totalNPV += within * 0.20;
      totalNPV += excess * 0.05;
    } else {
      totalNPV += alloc[k] * ALLOC_INFO[k].npvPer;
    }
  });

  const maintenanceUnderfunded = alloc.maintenance < REQUIRED_MAINTENANCE;
  const liquidityWarning = alloc.cash < MIN_LIQUIDITY && alloc.cash + alloc.dividend < MIN_LIQUIDITY;
  const acquisitionWarning = alloc.acquisition > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">Available capital</span>
          <span className="font-sans text-[24px] tabular-nums text-white">${fmt(TOTAL_CAPITAL)}M</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-accent-amber transition-all" style={{ width: `${(totalAllocated / TOTAL_CAPITAL) * 100}%` }} />
          </div>
          <span className={cn("font-sans text-[12px] tabular-nums", remaining < 0 ? "text-accent-red" : "text-slate-400")}>
            {remaining >= 0 ? `$${fmt(remaining)}M remaining` : `−$${fmt(Math.abs(remaining))}M over`}
          </span>
        </div>
      </div>

      {/* Allocation controls */}
      <div className="space-y-3">
        {ORDER.map((key) => {
          const info = ALLOC_INFO[key];
          const val = alloc[key];
          const pct = (val / TOTAL_CAPITAL) * 100;
          return (
            <div key={key} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] font-medium text-white">{info.label}</span>
                <span className="font-sans text-[14px] tabular-nums text-accent-amber">${fmt(val)}M</span>
              </div>
              <div className="mt-1 text-[12px] leading-[1.5] text-slate-400">{info.note}</div>
              <input
                type="range" min={0} max={info.max === 1000 ? TOTAL_CAPITAL : info.max} step={10}
                value={val}
                onChange={(e) => adjust(key, Number(e.target.value))}
                className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
                aria-label={`${info.label} allocation`}
              />
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div className={cn("h-full rounded-full transition-all",
                  key === "maintenance" ? "bg-accent-cyan" : key === "growth" ? "bg-accent-green"
                  : key === "acquisition" ? "bg-accent-purple" : key === "debt" ? "bg-accent-amber"
                  : key === "buyback" ? "bg-accent-red" : "bg-slate-500"
                )} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {(maintenanceUnderfunded || liquidityWarning || acquisitionWarning) && (
        <div className="space-y-2">
          {maintenanceUnderfunded && (
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.06] px-4 py-3">
              <span className="text-[14px] text-accent-red">⚠ Maintenance is underfunded by ${fmt(REQUIRED_MAINTENANCE - alloc.maintenance)}M. Existing operations are at risk.</span>
            </div>
          )}
          {liquidityWarning && (
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] px-4 py-3">
              <span className="text-[14px] text-accent-amber">⚠ Liquidity reserve is below ${MIN_LIQUIDITY}M. The company may lack resilience for downturns.</span>
            </div>
          )}
          {acquisitionWarning && (
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.06] px-4 py-3">
              <span className="text-[14px] text-accent-red">⚠ The acquisition has negative NPV under current assumptions (${fmt(ALLOC_INFO.acquisition.npvPer * alloc.acquisition)}M estimated value loss).</span>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      <div className={cn("rounded-2xl border p-5 sm:p-6",
        totalNPV > 50 ? "border-accent-green/25 bg-accent-green/[0.05]" : totalNPV > 0 ? "border-accent-amber/25 bg-accent-amber/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">Estimated total NPV from allocation</span>
          <span className={cn("font-sans text-[28px] tabular-nums", totalNPV > 0 ? "text-accent-green" : "text-accent-red")}>
            {totalNPV >= 0 ? "+" : "−"}${fmt(Math.abs(Math.round(totalNPV)))}M
          </span>
        </div>
        <p className="ops-body mt-3 text-[15px] leading-[1.7] text-slate-100">
          {maintenanceUnderfunded
            ? "This allocation underfunds required maintenance, putting existing operations at risk. No amount of growth investment compensates for eroding the current business."
            : totalNPV > 80
              ? "This allocation funds maintenance, preserves liquidity, invests in organic growth where returns exceed the cost of capital, repays high-cost debt, repurchases undervalued shares, and distributes residual capital. Multiple defensible allocations exist."
              : totalNPV > 0
                ? "This allocation creates value but may not be optimal. Consider whether the acquisition is justified or whether that capital would create more value through organic growth, debt repayment, or buybacks."
                : "This allocation is estimated to destroy value. The negative-NPV acquisition or underfunded maintenance outweighs the value created elsewhere."}
        </p>
        <p className="ops-body mt-2 text-[13px] leading-[1.6] text-slate-400">
          Hard constraint: $1B total. Required: $150M maintenance. Estimates are simplified.
          Multiple defensible allocations exist — the goal is to maximize risk-adjusted value, not to match one exact answer.
        </p>
      </div>
    </div>
  );
}
