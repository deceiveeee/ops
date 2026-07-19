"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export default function SingleRateVsStageSpecific() {
  const [pDisc, setPDisc] = useState(1 / 3);
  const [payoff, setPayoff] = useState(60);
  const [singleRate, setSingleRate] = useState(20);

  const pPct = Math.round(pDisc * 100);

  // Stage-specific (from the previous section's defaults)
  const prodRate = 20;
  const explRate = 5;
  const v1Success = payoff / (1 + prodRate / 100);
  const ev1 = pDisc * v1Success;
  const v0Stage = ev1 / (1 + explRate / 100);

  // Single-rate approach: discount the expected payoff two periods at one rate
  const expectedPayoff = pDisc * payoff;
  const v0Single = expectedPayoff / Math.pow(1 + singleRate / 100, 2);

  const diff = v0Stage - v0Single;
  const ratesEqual = Math.abs(singleRate - prodRate) < 0.01 && Math.abs(explRate - prodRate) < 0.01;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Same cash flows, different rate treatment
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Slider
            label="Discovery probability"
            value={pPct}
            min={5}
            max={80}
            step={5}
            suffix="%"
            onChange={(v) => setPDisc(v / 100)}
          />
          <Slider
            label="Production payoff"
            value={payoff}
            min={20}
            max={120}
            step={5}
            prefix="$"
            suffix="M"
            onChange={setPayoff}
          />
          <Slider
            label="Single-rate (both years)"
            value={singleRate}
            min={5}
            max={30}
            step={0.5}
            suffix="%"
            onChange={setSingleRate}
          />
        </div>
        <p className="ops-body mt-3 text-[13px] leading-[1.55] text-slate-400">
          The stage-specific approach uses {prodRate}% for production and {explRate}% for exploration.
          The single-rate approach uses one rate for both years.
        </p>
      </div>

      {/* Side-by-side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Stage-specific */}
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5 sm:p-6">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-green">
            Stage-specific approach
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
              <BlockMath>{String.raw`V_1 = \frac{\$${fmt(payoff, 0)}\,\text{M}}{1.${prodRate}} = \$${fmt(v1Success)}\,\text{M}`}</BlockMath>
            </div>
            <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
              <BlockMath>{String.raw`E[V_1] = ${pPct}\%\times \$${fmt(v1Success)} = \$${fmt(ev1)}\,\text{M}`}</BlockMath>
            </div>
            <div className="rounded-xl border border-accent-green/20 bg-accent-green/[0.05] px-4 py-3">
              <BlockMath>{String.raw`V_0 = \frac{\$${fmt(ev1)}}{1.0${explRate}} = \$${fmt(v0Stage)}\,\text{M}`}</BlockMath>
            </div>
          </div>
          <p className="ops-body mt-3 text-[13px] leading-[1.6] text-slate-300">
            Production risk is priced at {prodRate}%. Exploration outcome is priced at {explRate}%
            because it is assumed uncorrelated with the market.
          </p>
        </div>

        {/* Single-rate */}
        <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5 sm:p-6">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-red">
            Single-rate approach
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
              <BlockMath>{String.raw`E[CF_2] = ${pPct}\%\times \$${fmt(payoff, 0)} = \$${fmt(expectedPayoff)}\,\text{M}`}</BlockMath>
            </div>
            <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
              <BlockMath>{String.raw`V_0 = \frac{\$${fmt(expectedPayoff)}}{(1.${fmt(singleRate, 0).padStart(2, "0")})^2}`}</BlockMath>
            </div>
            <div className="rounded-xl border border-accent-red/20 bg-accent-red/[0.05] px-4 py-3">
              <BlockMath>{String.raw`V_0 = \$${fmt(v0Single)}\,\text{M}`}</BlockMath>
            </div>
          </div>
          <p className="ops-body mt-3 text-[13px] leading-[1.6] text-slate-300">
            The expected payoff is discounted two full periods at {singleRate}% — as if exploration
            uncertainty carries the same market-risk compensation as oil production.
          </p>
        </div>
      </div>

      {/* Comparison */}
      <div
        className={cn(
          "rounded-2xl border p-5 sm:p-6",
          ratesEqual
            ? "border-accent-cyan/25 bg-accent-cyan/[0.04]"
            : "border-accent-amber/25 bg-accent-amber/[0.05]",
        )}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Readout label="Stage-specific V₀" value={`$${fmt(v0Stage)}M`} tone="green" />
          <Readout label="Single-rate V₀" value={`$${fmt(v0Single)}M`} tone="red" />
          <Readout label="Difference" value={`$${fmt(diff)}M`} tone={diff > 0.01 ? "amber" : "neutral"} />
        </div>

        {ratesEqual ? (
          <p className="ops-body mt-4 text-[16px] leading-[1.7] text-slate-100">
            When both stages genuinely carry the same systematic risk, the two approaches converge.
            Multiple rates add no value when the risk difference is not economically meaningful.
          </p>
        ) : (
          <p className="ops-body mt-4 text-[16px] leading-[1.7] text-slate-100">
            The single-rate approach treats the exploration uncertainty as though investors require
            the same market-risk compensation as they require for oil production. That understates
            value by <span className="text-accent-amber">${fmt(Math.abs(diff))}M</span> here, because
            it double-charges for risk that the stage-specific model already handles via probability
            weighting.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Important limitation
        </div>
        <p className="ops-body mt-3 text-[15px] leading-[1.7] text-slate-100">
          This does not mean exploration always has zero beta. It means the analyst should{" "}
          <span className="text-white">identify the actual source of risk</span> rather than applying
          one industry label to every stage. If exploration outcomes do move with market conditions
          — for example, drilling becomes uneconomic when oil prices collapse — then a higher
          exploration-stage rate is justified.
        </p>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  prefix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">
          {prefix}
          {value}
          {suffix}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`}
      />
    </div>
  );
}

function Readout({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red" | "amber";
}) {
  const text =
    tone === "green"
      ? "text-accent-green"
      : tone === "red"
        ? "text-accent-red"
        : tone === "amber"
          ? "text-accent-amber"
          : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className={cn("mt-2 font-mono text-[17px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
