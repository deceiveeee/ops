"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";

function LabeledSlider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400"
      >
        <span>{label}</span>
        <span className="text-[15px] tabular-nums text-accent-amber">
          {value}
          {suffix}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${value}${suffix ?? ""}`}
      />
    </div>
  );
}

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export default function DiscountRateNPVDecision() {
  const [cf, setCf] = useState(110);
  const [r, setR] = useState(12);
  const [cost, setCost] = useState(100);

  const pv = cf / (1 + r / 100);
  const npv = pv - cost;
  const undiscountedPayoff = cf - cost;
  const impliedProjectReturn = cost > 0 ? ((cf - cost) / cost) * 100 : 0;
  const accept = npv > 0;
  const sufficient = impliedProjectReturn >= r;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <LabeledSlider
          label="Expected future cash flow"
          value={cf}
          min={80}
          max={200}
          step={1}
          onChange={setCf}
        />
        <LabeledSlider
          label="Required return"
          value={r}
          min={1}
          max={25}
          step={0.5}
          suffix="%"
          onChange={setR}
        />
        <LabeledSlider
          label="Initial investment"
          value={cost}
          min={50}
          max={150}
          step={1}
          onChange={setCost}
        />
      </div>

      {/* Formula */}
      <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Present value, then net present value
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <div className="text-slate-200">
              <BlockMath>
                {String.raw`PV = \frac{E[CF_1]}{1 + r} = \frac{\$${fmt(cf)}}{1 + ${r}\%} = \$${fmt(pv)}`}
              </BlockMath>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <div className="text-slate-200">
              <BlockMath>
                {String.raw`NPV = PV - C_0 = \$${fmt(pv)} - \$${fmt(cost)} = \$${fmt(npv)}`}
              </BlockMath>
            </div>
          </div>
        </div>
      </div>

      {/* Readouts */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Readout label="Present value" value={`$${fmt(pv)}`} />
        <Readout
          label="NPV"
          value={`$${fmt(npv)}`}
          tone={accept ? "green" : "red"}
        />
        <Readout label="Implied project return" value={`${fmt(impliedProjectReturn)}%`} />
        <Readout label="Required return" value={`${fmt(r)}%`} tone="amber" />
      </div>

      {/* The critical contrast: undiscounted payoff vs NPV */}
      <div
        className={cn(
          "rounded-2xl border p-6",
          accept
            ? "border-accent-green/30 bg-accent-green/[0.06]"
            : "border-accent-red/30 bg-accent-red/[0.06]",
        )}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 p-5">
            <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Expected undiscounted payoff
            </div>
            <div className="mt-2 font-sans text-[20px] tabular-nums text-white">
              <InlineMath>
                {String.raw`E[CF_1] - C_0 = \$${fmt(cf)} - \$${fmt(cost)} = \$${fmt(
                  undiscountedPayoff,
                )}`}
              </InlineMath>
            </div>
            <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
              In expected dollars, the project{" "}
              {undiscountedPayoff >= 0 ? "returns more than it costs" : "returns less than it costs"}.
            </p>
          </div>
          <div
            className={cn(
              "rounded-xl border p-5",
              accept ? "border-accent-green/30" : "border-accent-red/30",
              "bg-ink-950/40",
            )}
          >
            <div
              className={cn(
                "font-sans text-[11px] uppercase tracking-[0.16em]",
                accept ? "text-accent-green" : "text-accent-red",
              )}
            >
              Net present value
            </div>
            <div className="mt-2 font-sans text-[20px] tabular-nums text-white">
              ${fmt(npv)}
            </div>
            <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
              After discounting at the required return for its risk, the project{" "}
              {accept ? "creates value" : "destroys value"}.
            </p>
          </div>
        </div>

        {/* Decision + interpretation */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-sans text-[13px] uppercase tracking-[0.14em]",
              accept
                ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                : "border-accent-red/50 bg-accent-red/10 text-accent-red",
            )}
          >
            {accept ? "Accept" : "Reject"}
          </span>
          <span className="font-sans text-[13px] tabular-nums text-slate-300">
            implied {fmt(impliedProjectReturn)}% {sufficient ? "≥" : "<"} required {fmt(r)}%
          </span>
        </div>
        <p className="ops-body mt-4 text-[16px] leading-[1.7] text-slate-100">
          {accept ? (
            <>
              The project is expected to return{" "}
              <span className="text-white">{fmt(impliedProjectReturn)}%</span>, which{" "}
              <span className="text-accent-green">exceeds</span> the{" "}
              <span className="text-white">{fmt(r)}%</span> required for its systematic risk.
              Its present value is greater than the capital committed, so it offers
              sufficient compensation and creates value.
            </>
          ) : (
            <>
              The project is expected to return{" "}
              <span className="text-white">{fmt(impliedProjectReturn)}%</span> &mdash; yet that
              is <span className="text-accent-red">below</span> the{" "}
              <span className="text-white">{fmt(r)}%</span> required for its systematic risk.
              It can produce a positive expected dollar payoff and{" "}
              <span className="text-white">still have negative NPV</span>, because that payoff
              is inadequate compensation for the risk borne.
            </>
          )}
        </p>
      </div>

      {/* Reset to signature example */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
        <span className="ops-body text-[14px] leading-[1.55] text-slate-300">
          Signature example: <InlineMath>{String.raw`E[CF_1]=110,\; r=12\%,\; C_0=100`}</InlineMath>{" "}
          &rarr; expected payoff{" "}
          <span className="text-white">+$10</span>, NPV{" "}
          <span className="text-accent-red">−$1.79</span>.
        </span>
        <button
          type="button"
          onClick={() => {
            setCf(110);
            setR(12);
            setCost(100);
          }}
          className="rounded-full border border-white/20 px-4 py-1.5 text-[13px] text-slate-200 transition-colors hover:border-accent-amber/60 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        >
          Reset to example
        </button>
      </div>
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
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className={cn("mt-2 font-sans text-[17px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
