"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

const DEFAULT_FLOWS = [30, 40, 35, 0, 0];

export default function PaybackTimeline() {
  const [initial, setInitial] = useState(100);
  const [flows, setFlows] = useState(DEFAULT_FLOWS);

  const cumulative: number[] = [];
  let running = 0;
  for (const f of flows) {
    running += f;
    cumulative.push(running);
  }

  let paybackYear = -1;
  let paybackFraction = 0;
  let prevCum = 0;
  for (let i = 0; i < cumulative.length; i++) {
    if (cumulative[i] >= initial) {
      paybackYear = i + 1;
      const needed = initial - prevCum;
      const yearFlow = flows[i];
      paybackFraction = yearFlow > 0 ? needed / yearFlow : 0;
      break;
    }
    prevCum = cumulative[i];
  }

  const maxCum = Math.max(initial, ...cumulative, 1);

  const adjustFlow = (i: number, val: number) => {
    setFlows((prev) => prev.map((f, idx) => (idx === i ? val : f)));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
          <span>Initial investment</span>
          <span className="text-[14px] tabular-nums text-accent-amber">${initial}</span>
        </label>
        <input type="range" min={50} max={200} step={5} value={initial}
          onChange={(e) => setInitial(Number(e.target.value))}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
          {flows.map((f, i) => (
            <div key={i}>
              <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                Year {i + 1}
              </label>
              <input type="range" min={0} max={80} step={5} value={f}
                onChange={(e) => adjustFlow(i, Number(e.target.value))}
                className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
                aria-label={`Year ${i + 1} cash flow`}
              />
              <div className="mt-0.5 text-center font-mono text-[12px] tabular-nums text-white">${f}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Cumulative cash recovery
        </div>
        <div className="mt-4 space-y-2">
          {/* Initial outflow bar */}
          <div className="flex items-center gap-3">
            <div className="w-16 flex-shrink-0 font-mono text-[11px] text-slate-400">Year 0</div>
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg border border-white/10 bg-ink-950/40">
              <div className="absolute inset-y-0 right-0 flex items-center justify-end rounded-lg bg-accent-red/30 px-3"
                style={{ width: `${(initial / maxCum) * 100}%` }}>
                <span className="font-mono text-[11px] text-white">−${initial}</span>
              </div>
            </div>
          </div>
          {cumulative.map((c, i) => {
            const recovered = c >= initial;
            const widthPct = (Math.abs(c) / maxCum) * 100;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-16 flex-shrink-0 font-mono text-[11px] text-slate-400">Year {i + 1}</div>
                <div className="relative h-7 flex-1 overflow-hidden rounded-lg border border-white/10 bg-ink-950/40">
                  <div className={cn("absolute inset-y-0 left-0 flex items-center justify-end rounded-lg px-3",
                    recovered ? "bg-accent-green/30" : "bg-accent-amber/25")}
                    style={{ width: `${widthPct}%` }}>
                    <span className="font-mono text-[11px] text-white">${c}</span>
                  </div>
                  {!recovered && c < initial && (
                    <div className="absolute inset-y-0 border-l-2 border-dashed border-accent-amber/50"
                      style={{ left: `${(initial / maxCum) * 100}%` }} />
                  )}
                </div>
              </div>
            );
          })}
          {/* Target line indicator */}
          <div className="flex items-center gap-3">
            <div className="w-16 flex-shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-amber">Target</div>
            <div className="text-[12px] text-slate-400">Initial investment recovered: ${initial}</div>
          </div>
        </div>
      </div>

      {/* Payback result */}
      <div className={cn(
        "rounded-2xl border p-5 sm:p-6",
        paybackYear > 0 ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]",
      )}>
        <div className={cn(
          "font-mono text-[12px] uppercase tracking-[0.16em]",
          paybackYear > 0 ? "text-accent-green" : "text-accent-red",
        )}>
          Payback period
        </div>
        {paybackYear > 0 ? (
          <>
            <div className="mt-2 font-mono text-[24px] tabular-nums text-white">
              {paybackYear - 1 + paybackFraction > 0 ? (paybackYear - 1 + paybackFraction).toFixed(1) : paybackYear} years
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
              <BlockMath>{String.raw`\text{Recovered during Year } ${paybackYear}`}</BlockMath>
            </div>
            <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">
              The project recovers its initial ${initial} investment during Year {paybackYear}. This
              measures <span className="text-white">speed of capital recovery</span> — not value
              created. Cash flows after recovery are not considered.
            </p>
          </>
        ) : (
          <>
            <div className="mt-2 font-mono text-[24px] tabular-nums text-white">Not recovered</div>
            <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">
              The cumulative cash flows (${cumulative[cumulative.length - 1]}) do not recover the
              initial investment (${initial}) within the horizon.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
