"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function StrategyLifecycleDecay() {
  const [capital, setCapital] = useState(3);

  const stages = [
    { n: 1, label: "Discovery", detail: "A strategy generates attractive returns. Early investors benefit.", edge: 100 },
    { n: 2, label: "Visibility", detail: "Performance becomes visible. More capital enters.", edge: 70 },
    { n: 3, label: "Crowding", detail: "Trades occur earlier and at less favorable prices.", edge: 35 },
    { n: 4, label: "Saturation", detail: "The advantage shrinks. Capacity limits are reached.", edge: 10 },
    { n: 5, label: "Decay", detail: "Changed conditions or crowding weaken the strategy.", edge: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
          <span>Capital entering the strategy</span>
          <span className="text-[14px] tabular-nums text-accent-amber">{["Minimal", "Growing", "Moderate", "Heavy", "Saturated"][capital]}</span>
        </label>
        <input type="range" min={0} max={4} step={1} value={capital}
          onChange={(e) => setCapital(Number(e.target.value))}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
          aria-label="Capital entering the strategy"
        />
      </div>

      {/* Stage display */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">Strategy lifecycle</div>
        <div className="mt-4 space-y-2">
          {stages.map((s, i) => {
            const active = i === capital;
            const past = i < capital;
            return (
              <div key={s.n} className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-all",
                active ? "border-accent-amber/40 bg-accent-amber/[0.06]" : past ? "border-white/5 opacity-50" : "border-white/8",
              )}>
                <span className={cn("flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[10px]",
                  active ? "border-accent-amber text-accent-amber" : past ? "border-white/20 text-slate-500" : "border-white/15 text-slate-400")}>
                  {s.n}
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className={cn("text-[14px] font-medium", active ? "text-white" : "text-slate-300")}>{s.label}</span>
                    <span className="font-sans text-[11px] text-slate-400">Edge: {s.edge}%</span>
                  </div>
                  {(active || past) && <p className="mt-0.5 text-[12px] leading-[1.45] text-slate-300">{s.detail}</p>}
                </div>
                <div className="h-2 w-16 flex-shrink-0 overflow-hidden rounded-full bg-white/8">
                  <div className={cn("h-full rounded-full", s.edge > 50 ? "bg-accent-green" : s.edge > 20 ? "bg-accent-amber" : "bg-accent-red")}
                    style={{ width: `${s.edge}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-white">
          The evidence that attracts investors to a strategy may help eliminate the strategy&apos;s
          future advantage.
        </p>
        <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-200">
          This does not mean every strategy must disappear permanently. Effectiveness may vary by market
          conditions, competition, and investor participation. But the lifecycle is a real risk that
          every active investor should consider.
        </p>
      </div>
    </div>
  );
}
