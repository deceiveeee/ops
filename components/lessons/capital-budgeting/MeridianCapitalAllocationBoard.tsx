"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number) { return `$${Math.round(n).toLocaleString("en-US")}M`; }

type Key = "maintenance" | "stores50" | "stores100" | "stores150" | "acquisition" | "debt" | "buyback" | "dividend" | "liquidity";

const INFO: Record<Key, { label: string; max: number; npvPer: number; note: string }> = {
  maintenance: { label: "Maintenance", max: 100, npvPer: 0, note: "Protects existing operations (required)" },
  stores50: { label: "Best 50 stores", max: 80, npvPer: 0.375, note: "NPV +$0.30M/store · highest returns" },
  stores100: { label: "Next 50 stores", max: 90, npvPer: 0.133, note: "NPV +$0.12M/store · moderate returns" },
  stores150: { label: "Final 50 stores", max: 90, npvPer: -0.089, note: "NPV −$0.08M/store · negative marginal" },
  acquisition: { label: "Coastal acquisition", max: 300, npvPer: -0.117, note: "NPV −$35M at $300M price" },
  debt: { label: "Debt repayment", max: 150, npvPer: 0.08, note: "NPV +$12M at full $150M" },
  buyback: { label: "Share repurchase", max: 300, npvPer: 0.07, note: "~7% value benefit if IV=$45" },
  dividend: { label: "Dividend", max: 600, npvPer: 0, note: "Transfers cash; no new NPV" },
  liquidity: { label: "Retained liquidity", max: 600, npvPer: 0, note: "Resilience without precise NPV" },
};

const ORDER: Key[] = ["maintenance", "stores50", "stores100", "stores150", "acquisition", "debt", "buyback", "dividend", "liquidity"];
const TOTAL = 600;

export default function MeridianCapitalAllocationBoard() {
  const [alloc, setAlloc] = useState<Record<Key, number>>({
    maintenance: 100, stores50: 80, stores100: 90, stores150: 0, acquisition: 0,
    debt: 150, buyback: 100, dividend: 0, liquidity: 80,
  });

  const total = ORDER.reduce((s, k) => s + alloc[k], 0);
  const remaining = TOTAL - total;
  const maintenanceOK = alloc.maintenance >= 100;
  const liquidityOK = alloc.liquidity >= 80;

  let totalNPV = 0;
  ORDER.forEach((k) => { totalNPV += alloc[k] * INFO[k].npvPer; });

  const adjust = (key: Key, val: number) => {
    const clamped = Math.max(0, Math.min(val, INFO[key].max));
    const otherTotal = ORDER.reduce((s, k) => k === key ? s : s + alloc[k], 0);
    setAlloc((p) => ({ ...p, [key]: Math.min(clamped, TOTAL - otherTotal) }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">Allocate $600M</span>
          <span className={cn("font-sans text-[20px] tabular-nums", remaining < 0 ? "text-accent-red" : "text-white")}>
            {remaining >= 0 ? `${fmt(remaining)} remaining` : `${fmt(Math.abs(remaining))} over`}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-accent-amber transition-all" style={{ width: `${Math.min(100, (total / TOTAL) * 100)}%` }} />
        </div>
      </div>

      {/* Warnings */}
      <div className="space-y-2">
        {!maintenanceOK && <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.06] px-4 py-2.5"><span className="text-[14px] text-accent-red">⚠ Maintenance underfunded by {fmt(100 - alloc.maintenance)}.</span></div>}
        {!liquidityOK && <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] px-4 py-2.5"><span className="text-[14px] text-accent-amber">⚠ Liquidity below prudent minimum ({fmt(80)}).</span></div>}
        {alloc.acquisition > 0 && <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.06] px-4 py-2.5"><span className="text-[14px] text-accent-red">⚠ Acquisition has negative NPV (−{fmt(35 * alloc.acquisition / 300)}).</span></div>}
        {alloc.stores150 > 0 && <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.06] px-4 py-2.5"><span className="text-[14px] text-accent-red">⚠ Final store block has negative marginal NPV.</span></div>}
      </div>

      {/* Allocation sliders */}
      <div className="space-y-3">
        {ORDER.map((key) => {
          const info = INFO[key];
          const val = alloc[key];
          return (
            <div key={key} className="rounded-xl border border-white/10 bg-ink-950/30 p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-medium text-white">{info.label}</span>
                <span className="font-sans text-[13px] tabular-nums text-accent-amber">{fmt(val)}</span>
              </div>
              <div className="text-[11px] text-slate-400">{info.note}</div>
              <input type="range" min={0} max={info.max} step={5} value={val}
                onChange={(e) => adjust(key, Number(e.target.value))}
                className="mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
                aria-label={`${info.label} allocation`} />
            </div>
          );
        })}
      </div>

      {/* Result */}
      <div className={cn("rounded-2xl border p-5 sm:p-6",
        totalNPV > 30 && maintenanceOK && liquidityOK ? "border-accent-green/25 bg-accent-green/[0.05]"
        : totalNPV > 0 ? "border-accent-amber/25 bg-accent-amber/[0.05]"
        : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">Estimated total NPV</span>
          <span className={cn("font-sans text-[28px] tabular-nums", totalNPV > 0 ? "text-accent-green" : "text-accent-red")}>
            {totalNPV >= 0 ? "+" : "−"}{fmt(Math.abs(totalNPV))}
          </span>
        </div>
        <p className="ops-body mt-3 text-[15px] leading-[1.7] text-slate-100">
          {!maintenanceOK ? "Maintenance must be funded before any discretionary allocation."
          : !liquidityOK ? "Increase liquidity reserve to at least $80M."
          : totalNPV > 30 ? "Strong allocation: maintenance funded, liquidity preserved, positive-NPV stores and debt repayment prioritized, negative-NPV acquisition and weak stores avoided."
          : totalNPV > 0 ? "Creates some value but may not be optimal. Review whether the acquisition or weak stores are justified."
          : "Destroys value. Remove negative-NPV uses (acquisition, weak store tranche)."}
          {" "}Multiple defensible allocations exist — the goal is maximizing risk-adjusted value, not matching one answer.
        </p>
      </div>
    </div>
  );
}
