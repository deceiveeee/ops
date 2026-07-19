"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";

const CF = 110; // identical expected cash flow for both investments
const A_RATE = 5; // Investment A required return (fixed)

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

const CHAIN = [
  { label: "Higher systematic risk", tone: "red" as const },
  { label: "Higher required return", tone: "amber" as const },
  { label: "Higher discount rate", tone: "amber" as const },
  { label: "Lower present value", tone: "red" as const },
];

const toneText: Record<string, string> = {
  red: "text-accent-red",
  amber: "text-accent-amber",
};
const toneDot: Record<string, string> = {
  red: "bg-accent-red",
  amber: "bg-accent-amber",
};

export default function SameCashFlowDifferentRisk() {
  const [bRate, setBRate] = useState(12);

  const pvA = CF / (1 + A_RATE / 100);
  const pvB = CF / (1 + bRate / 100);
  const diff = pvA - pvB; // positive => B worth less

  return (
    <div className="space-y-6">
      {/* Fixed cash flow note + B control */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-slate-100">
          Both investments are <span className="text-white">expected</span> to pay{" "}
          <span className="font-mono text-accent-amber">$110</span> next year. Only the
          required return differs. Hold Investment A at{" "}
          <InlineMath>{String.raw`5\%`}</InlineMath> and raise Investment B&apos;s required
          return to see how its present value falls.
        </p>
        <div className="mt-5">
          <label
            htmlFor="b-rate"
            className="flex items-baseline justify-between font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400"
          >
            <span>Investment B required return</span>
            <span className="text-[15px] tabular-nums text-accent-amber">{bRate}%</span>
          </label>
          <input
            id="b-rate"
            type="range"
            min={5}
            max={20}
            step={0.5}
            value={bRate}
            onChange={(e) => setBRate(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
            aria-valuetext={`${bRate}%`}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[5, 8, 12, 15, 20].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBRate(preset)}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                  bRate === preset
                    ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                    : "border-white/15 text-slate-300 hover:border-accent-amber/50 hover:text-accent-amber",
                )}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-6">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-green">
            Investment A · lower risk
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-slate-200">
              <BlockMath>{String.raw`PV_A = \frac{110}{1.05}`}</BlockMath>
            </div>
            <div className="rounded-lg border border-white/10 bg-ink-950/40 px-4 py-3 font-mono text-[20px] tabular-nums text-white">
              ${fmt(pvA)}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.05] p-6">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-red">
            Investment B · higher risk
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-slate-200">
              <BlockMath>{String.raw`PV_B = \frac{110}{1 + ${bRate}\%}`}</BlockMath>
            </div>
            <div className="rounded-lg border border-white/10 bg-ink-950/40 px-4 py-3 font-mono text-[20px] tabular-nums text-white">
              ${fmt(pvB)}
            </div>
          </div>
        </div>
      </div>

      {/* Price comparison */}
      <div
        className={cn(
          "rounded-2xl border p-6",
          diff > 0.0001
            ? "border-accent-red/30 bg-accent-red/[0.06]"
            : "border-white/12 bg-white/[0.03]",
        )}
      >
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Price comparison
        </div>
        <div className="mt-3">
          <BlockMath>
            {String.raw`PV_A - PV_B = \$${fmt(pvA)} - \$${fmt(pvB)} = \$${fmt(diff)}`}
          </BlockMath>
        </div>
        {diff > 0.0001 ? (
          <p className="ops-body mt-4 text-[16px] leading-[1.7] text-slate-100">
            The expected cash flow is identical, yet Investment B is worth{" "}
            <span className="text-accent-red">${fmt(diff)} less</span> today. Investors
            require more compensation for its systematic risk. To earn that higher expected
            return from the same expected future payoff, they must{" "}
            <span className="text-white">pay a lower price today</span>.
          </p>
        ) : (
          <p className="ops-body mt-4 text-[16px] leading-[1.7] text-slate-100">
            With identical required returns, the identical cash flow produces identical
            value. Separate the two only when their systematic risk differs.
          </p>
        )}
      </div>

      {/* Causal chain */}
      <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          The pricing mechanism
        </div>
        <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {CHAIN.map((step, i) => (
            <div key={step.label} className="flex flex-1 items-center gap-2">
              <div className="flex-1 rounded-xl border border-white/10 bg-ink-950/40 px-3 py-3 text-center">
                <span className={cn("block h-1.5 w-1.5 rounded-full mx-auto", toneDot[step.tone])} aria-hidden />
                <span className={cn("mt-2 block text-[13px] leading-tight", toneText[step.tone])}>
                  {step.label}
                </span>
              </div>
              {i < CHAIN.length - 1 && (
                <span className="hidden text-accent-amber sm:inline" aria-hidden>
                  →
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="ops-body mt-5 text-[15px] leading-[1.7] text-slate-200">
          This is not a vague &ldquo;risk reduces value.&rdquo; The mechanism is precise:
          greater systematic risk raises the return investors require, which raises the
          discount rate, which lowers the present value of the very same expected cash
          flow.
        </p>
      </div>
    </div>
  );
}
