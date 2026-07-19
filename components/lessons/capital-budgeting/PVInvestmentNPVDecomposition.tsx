"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function PVInvestmentNPVDecomposition() {
  const [pv, setPv] = useState(120);
  const [cost, setCost] = useState(100);
  const npv = pv - cost;

  const npvPositive = npv > 0;
  const npvZero = Math.abs(npv) < 0.01;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Adjust the two components of NPV
        </div>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Slider label="Present value of benefits" value={pv} min={50} max={200} step={1} prefix="$" suffix="M" onChange={setPv} />
          <Slider label="Capital committed" value={cost} min={50} max={200} step={1} prefix="$" suffix="M" onChange={setCost} />
        </div>
      </div>

      {/* Formula */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          The decomposition
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
          <BlockMath>
            {String.raw`NPV = \underbrace{PV}_{\substack{\text{what the future}\\\text{cash flows are}\\\text{worth today}}} - \underbrace{C_0}_{\substack{\text{capital}\\\text{committed}}}`}
          </BlockMath>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
          <BlockMath>
            {String.raw`NPV = \$${fmt(pv)}\,\text{M} - \$${fmt(cost)}\,\text{M} = \$${fmt(npv)}\,\text{M}`}
          </BlockMath>
        </div>
      </div>

      {/* Visual decomposition bar */}
      <div className={cn(
        "rounded-2xl border p-5 sm:p-6",
        npvPositive ? "border-accent-green/25" : npvZero ? "border-accent-amber/25" : "border-accent-red/25",
      )}>
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Visual decomposition
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-32 flex-shrink-0 text-[13px] text-slate-300">PV of benefits</div>
            <div className="relative h-8 flex-1 overflow-hidden rounded-lg border border-white/10 bg-ink-950/40">
              <div className="absolute inset-y-0 left-0 flex items-center justify-end rounded-lg bg-accent-cyan/30 px-3"
                style={{ width: `${Math.min(100, (pv / 200) * 100)}%` }}>
                <span className="font-mono text-[12px] tabular-nums text-white">${fmt(pv)}M</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 flex-shrink-0 text-[13px] text-slate-300">Capital committed</div>
            <div className="relative h-8 flex-1 overflow-hidden rounded-lg border border-white/10 bg-ink-950/40">
              <div className="absolute inset-y-0 left-0 flex items-center justify-end rounded-lg bg-accent-red/30 px-3"
                style={{ width: `${Math.min(100, (cost / 200) * 100)}%` }}>
                <span className="font-mono text-[12px] tabular-nums text-white">−${fmt(cost)}M</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-white/10 pt-3">
            <div className={cn(
              "w-32 flex-shrink-0 text-[13px] font-medium",
              npvPositive ? "text-accent-green" : npvZero ? "text-accent-amber" : "text-accent-red",
            )}>
              Net present value
            </div>
            <div className="relative h-8 flex-1 overflow-hidden rounded-lg border border-white/10 bg-ink-950/40">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 flex items-center justify-end rounded-lg px-3",
                  npvPositive ? "bg-accent-green/30" : npvZero ? "bg-accent-amber/30" : "bg-accent-red/30",
                )}
                style={{ width: `${Math.min(100, (Math.abs(npv) / 100) * 100)}%` }}
              >
                <span className="font-mono text-[12px] tabular-nums text-white">
                  {npv >= 0 ? "+" : "−"}${fmt(Math.abs(npv))}M
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className={cn(
        "rounded-2xl border p-5 sm:p-6",
        npvPositive ? "border-accent-green/25 bg-accent-green/[0.05]"
        : npvZero ? "border-accent-amber/25 bg-accent-amber/[0.05]"
        : "border-accent-red/25 bg-accent-red/[0.05]",
      )}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {npvPositive ? (
            <>
              After paying <span className="text-white">${fmt(cost)}M</span> for the investment, an
              estimated <span className="text-accent-green">${fmt(npv)}M</span> of economic value
              remains. The investment is expected to earn more than investors require for its risk.
            </>
          ) : npvZero ? (
            <>
              The present value exactly equals the capital committed. The investment is expected to
              earn <span className="text-white">exactly</span> the required return — no more, no less.
            </>
          ) : (
            <>
              The investment costs <span className="text-white">${fmt(cost)}M</span> but its future
              cash flows are worth only <span className="text-white">${fmt(pv)}M</span> today. It is
              expected to destroy <span className="text-accent-red">${fmt(Math.abs(npv))}M</span> of
              value.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Slider({
  label, value, min, max, step, suffix, prefix, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`}
      />
    </div>
  );
}
