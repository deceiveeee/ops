"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

type View = "return" | "npv";

export default function ReturnViewVsNPVView() {
  const [cost, setCost] = useState(100);
  const [payoff, setPayoff] = useState(115);
  const [rate, setRate] = useState(10);
  const [view, setView] = useState<View>("return");

  const expectedReturn = cost > 0 ? ((payoff - cost) / cost) * 100 : 0;
  const pv = payoff / (1 + rate / 100);
  const npv = pv - cost;
  const exceeds = expectedReturn >= rate;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          One investment, two lenses
        </div>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Slider label="Cost" value={cost} min={50} max={200} step={1} prefix="$" onChange={setCost} />
          <Slider label="Expected payoff (1 yr)" value={payoff} min={50} max={250} step={1} prefix="$" onChange={setPayoff} />
          <Slider label="Required return" value={rate} min={3} max={25} step={0.5} suffix="%" onChange={setRate} />
        </div>
      </div>

      {/* View toggle */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Valuation view">
        <button
          type="button" role="tab" aria-selected={view === "return"}
          onClick={() => setView("return")}
          className={cn(
            "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
            view === "return" ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan" : "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
          )}
        >
          Expected return view
        </button>
        <button
          type="button" role="tab" aria-selected={view === "npv"}
          onClick={() => setView("npv")}
          className={cn(
            "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
            view === "npv" ? "border-accent-amber bg-accent-amber/15 text-accent-amber" : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
          )}
        >
          NPV view
        </button>
      </div>

      {/* Active view */}
      <div className={cn(
        "rounded-2xl border p-5 sm:p-6",
        view === "return" ? "border-accent-cyan/25 bg-accent-cyan/[0.04]" : "border-accent-amber/25 bg-accent-amber/[0.04]",
      )}>
        {view === "return" ? (
          <>
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
              Expected return view
            </div>
            <p className="ops-body mt-2 text-[15px] leading-[1.6] text-slate-200">
              Does the project&apos;s expected percentage return exceed the required return?
            </p>
            <div className="mt-3 space-y-2">
              <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
                <BlockMath>{String.raw`E[R] = \frac{\$${fmt(payoff)} - \$${fmt(cost)}}{\$${fmt(cost)}} = ${fmt(expectedReturn)}\%`}</BlockMath>
              </div>
              <div className={cn(
                "rounded-xl border px-4 py-3",
                exceeds ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-accent-red/30 bg-accent-red/[0.05]",
              )}>
                <BlockMath>{String.raw`${fmt(expectedReturn)}\% \;\;${exceeds ? "\\geq" : "<"}\;\; ${fmt(rate)}\%`}</BlockMath>
              </div>
            </div>
            <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">
              {exceeds
                ? <>The expected return exceeds the required return. The project appears attractive by this measure.</>
                : <>The expected return is below the required return. The project appears unattractive by this measure.</>}
            </p>
          </>
        ) : (
          <>
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
              NPV view
            </div>
            <p className="ops-body mt-2 text-[15px] leading-[1.6] text-slate-200">
              How many dollars of value does the project create today?
            </p>
            <div className="mt-3 space-y-2">
              <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
                <BlockMath>{String.raw`NPV = \frac{\$${fmt(payoff)}}{1 + ${rate}\%} - \$${fmt(cost)} = \$${fmt(npv)}`}</BlockMath>
              </div>
              <div className={cn(
                "rounded-xl border px-4 py-3",
                npv > 0 ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-accent-red/30 bg-accent-red/[0.05]",
              )}>
                <BlockMath>{String.raw`NPV = \$${fmt(npv)}`}</BlockMath>
              </div>
            </div>
            <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">
              {npv > 0
                ? <>The project creates an estimated ${fmt(npv)} of value today.</>
                : <>The project destroys an estimated ${fmt(Math.abs(npv))} of value today.</>}
            </p>
          </>
        )}
      </div>

      {/* Unifying statement */}
      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          For one simple project, the two measures point in the same direction: if the expected
          return exceeds the required return, NPV is positive. NPV becomes more informative when
          investments differ in <span className="text-white">scale, timing, or cash-flow
          pattern</span> — because NPV measures total dollars of value created, not just a
          percentage.
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
      <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
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
