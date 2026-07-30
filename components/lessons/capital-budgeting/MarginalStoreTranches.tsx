"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number, d = 0) { return `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`; }

const TRANCHES = [
  { stores: 50, capitalPer: 1.6, npvPer: 0.30, label: "Best locations" },
  { stores: 50, capitalPer: 1.7, npvPer: 0.12, label: "Middle locations" },
  { stores: 50, capitalPer: 1.7, npvPer: -0.08, label: "Weakest proposed" },
];

export default function MarginalStoreTranches() {
  const [cutoff, setCutoff] = useState(2); // 1, 2, or 3 tranches

  const selected = TRANCHES.slice(0, cutoff);
  const totalCapital = selected.reduce((s, t) => s + t.stores * t.capitalPer, 0);
  const totalNPV = selected.reduce((s, t) => s + t.stores * t.npvPer, 0);
  const totalStores = selected.reduce((s, t) => s + t.stores, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Declining returns by location tranche
        </div>
        <div className="mt-4 space-y-3">
          {TRANCHES.map((t, i) => {
            const included = i < cutoff;
            const trancheNPV = t.stores * t.npvPer;
            return (
              <div key={i} className={cn("rounded-xl border p-4 transition-opacity",
                included ? cn("border-white/12", t.npvPer > 0 ? "bg-accent-green/[0.04]" : "bg-accent-red/[0.04]")
                : "border-white/5 opacity-40")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border font-sans text-[11px]",
                      included ? "border-accent-amber text-accent-amber" : "border-white/20 text-slate-500")}>{i + 1}</span>
                    <span className="text-[14px] text-white">{t.label} ({t.stores} stores)</span>
                  </div>
                  <span className={cn("font-sans text-[14px] tabular-nums", t.npvPer > 0 ? "text-accent-green" : "text-accent-red")}>
                    {trancheNPV >= 0 ? "+" : "−"}{fmt(Math.abs(trancheNPV))}M
                  </span>
                </div>
                <div className="mt-1 ml-9 text-[12px] text-slate-400">
                  Capital: {fmt(t.stores * t.capitalPer)}M · NPV/store: {t.npvPer > 0 ? "+" : "−"}{fmt(Math.abs(t.npvPer * 1000))}K
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-2">Select program size</div>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button key={n} type="button"
                onClick={() => setCutoff(n)}
                className={cn("rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                  cutoff === n ? "border-accent-amber bg-accent-amber/15 text-accent-amber" : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber")}>
                {n * 50} stores
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Readout label="Total stores" value={`${totalStores}`} />
        <Readout label="Total capital" value={`${fmt(totalCapital)}M`} />
        <Readout label="Total NPV" value={`${totalNPV >= 0 ? "+" : "−"}${fmt(Math.abs(totalNPV))}M`} tone={totalNPV > 0 ? "green" : "red"} />
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6",
        cutoff < 3 ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {cutoff === 3 ? (
            <>All 150 stores produce positive <em>total</em> program NPV of +{fmt(totalNPV)}M. But the
            final 50 stores have <span className="text-accent-red">negative marginal NPV</span> (−$4M).
            Hiding weak investments inside an attractive average program is a capital-allocation error.</>
          ) : cutoff === 2 ? (
            <>Funding only the best 100 stores produces +{fmt(totalNPV)}M of NPV with {fmt(totalCapital)}M of
            capital. The weakest 50 stores would have destroyed $4M. The 100-store cutoff is defensible.</>
          ) : (
            <>Funding only the best 50 stores produces +{fmt(totalNPV)}M of NPV with minimal capital. This
            is the most disciplined option — but forgoes the $6M of positive NPV from the middle tranche.</>
          )}
        </p>
        <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-200">
          Continue expanding while marginal NPV &gt; 0. The cutoff is defensible at 100 stores under
          base-case assumptions — but not mechanically universal if assumptions change.
        </p>
      </div>
    </div>
  );
}

function Readout({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "green" | "red" }) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-sans text-[15px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
