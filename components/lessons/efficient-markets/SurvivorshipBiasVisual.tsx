"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SurvivorshipBiasVisual() {
  const [revealed, setRevealed] = useState(false);

  const years = [0, 1, 2, 3, 4, 5];
  const totalStart = 100;
  const survivors = [100, 92, 82, 74, 67, 60];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Fund survival over 5 years
        </div>
        <div className="mt-4 space-y-2">
          {years.map((yr, i) => {
            const alive = revealed ? survivors[i] : totalStart;
            const dead = totalStart - survivors[i];
            return (
              <div key={yr} className="flex items-center gap-3">
                <div className="w-12 flex-shrink-0 font-mono text-[11px] text-slate-400">Yr {yr}</div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-lg border border-white/10 bg-ink-950/40">
                  <div className="absolute inset-y-0 left-0 flex items-center justify-end rounded-lg bg-accent-green/20 px-2"
                    style={{ width: `${alive}%` }}>
                    <span className="font-mono text-[10px] text-accent-green">{alive}</span>
                  </div>
                  {revealed && dead > 0 && (
                    <div className="absolute inset-y-0 flex items-center justify-start px-2"
                      style={{ left: `${alive}%`, width: `${dead}%` }}>
                      <span className="font-mono text-[10px] text-accent-red/70 line-through">{dead} closed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setRevealed(!revealed)}
          className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
          {revealed ? "Hide closed funds" : "Reveal closed funds"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={cn("rounded-xl border p-4", revealed ? "border-accent-red/25 bg-accent-red/[0.04]" : "border-white/10 bg-ink-950/30")}>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">What databases show</div>
          <p className="ops-body mt-1.5 text-[14px] leading-[1.55] text-slate-100">
            Only the 60 surviving funds appear in performance databases. Their average return looks
            healthy because the 40 worst performers have disappeared.
          </p>
        </div>
        <div className={cn("rounded-xl border p-4", revealed ? "border-accent-amber/25 bg-accent-amber/[0.04]" : "border-white/10 bg-ink-950/30")}>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">What actually happened</div>
          <p className="ops-body mt-1.5 text-[14px] leading-[1.55] text-slate-100">
            The original investor could have bought any of 100 funds. Examining only survivors makes
            historical performance look better than the real experience.
          </p>
        </div>
      </div>
    </div>
  );
}
