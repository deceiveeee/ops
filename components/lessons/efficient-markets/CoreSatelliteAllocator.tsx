"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CoreSatelliteAllocator() {
  const [core, setCore] = useState(80);

  const satellite = 100 - core;
  const passive = Math.round(core * 0.95);
  const active = Math.round(core * 0.05 + satellite);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
          <span>Core (broad, passive) allocation</span>
          <span className="text-[14px] tabular-nums text-accent-cyan">{core}%</span>
        </label>
        <input type="range" min={0} max={100} step={5} value={core}
          onChange={(e) => setCore(Number(e.target.value))}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          aria-label="Core allocation percentage"
        />
      </div>

      {/* Visual bar */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400 mb-3">
          Portfolio structure
        </div>
        <div className="flex h-12 overflow-hidden rounded-xl border border-white/10">
          <div className="flex items-center justify-center bg-accent-cyan/25 transition-all" style={{ width: `${core}%` }}>
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-cyan">Core</div>
              <div className="font-mono text-[14px] text-white">{core}%</div>
            </div>
          </div>
          <div className="flex items-center justify-center bg-accent-amber/25 transition-all" style={{ width: `${satellite}%` }}>
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-amber">Satellite</div>
              <div className="font-mono text-[14px] text-white">{satellite}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">Core</div>
          <ul className="mt-2 space-y-1.5 text-[13px] text-slate-100">
            {["Broad market exposure", "Low-cost index funds", "Diversified across sectors", "Generally passive"].map((x) => (
              <li key={x} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-amber">Satellite</div>
          <ul className="mt-2 space-y-1.5 text-[13px] text-slate-100">
            {["Smaller active allocations", "Specialized objectives", "Strategies with a claimed edge", "Deliberate and measurable"].map((x) => (
              <li key={x} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6",
        satellite > 50 ? "border-accent-amber/25 bg-accent-amber/[0.05]" : "border-white/12 bg-white/[0.03]")}>
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          {satellite > 50
            ? `With ${satellite}% in active satellite positions, the portfolio carries significant active risk. Ensure each satellite allocation has a specific thesis and that the active portion is not disguising uncontrolled speculation.`
            : `A ${core}/${satellite} core-satellite split is a common structure. Active and passive investing are not mutually exclusive identities — sizing matters, and the active portion should be deliberate and measurable.`}
        </p>
      </div>
    </div>
  );
}
