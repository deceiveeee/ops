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
        className="flex items-baseline justify-between font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400"
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

export default function RequiredReturnToPV() {
  const [cf, setCf] = useState(110);
  const [r, setR] = useState(10);

  const pv = cf / (1 + r / 100);
  const impliedReturn = ((cf - pv) / pv) * 100;

  // Interpretation sentence: what changed the PV
  const interpretation = `To earn exactly the required ${r}% expected return from an expected \$${fmt(
    cf,
  )} next year, an investor can pay no more than \$${fmt(
    pv,
  )} today. Raising the required return lowers the price you can pay, because the same expected future payoff must deliver a higher expected return.`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <LabeledSlider
          label="Expected future cash flow"
          value={cf}
          min={80}
          max={200}
          step={1}
          suffix=""
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
      </div>

      {/* Derivation */}
      <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Solve for the price that earns exactly the required return
        </div>
        <div className="mt-4 space-y-3">
          <div className="text-slate-100">
            <BlockMath>{String.raw`PV \times (1 + r) = E[CF_1]`}</BlockMath>
          </div>
          <div className="text-slate-100">
            <BlockMath>{String.raw`PV = \frac{E[CF_1]}{1 + r}`}</BlockMath>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <div className="text-slate-200">
              <BlockMath>
                {String.raw`PV = \frac{\$${fmt(cf)}}{1 + ${r}\%} = \$${fmt(pv)}`}
              </BlockMath>
            </div>
          </div>
        </div>
      </div>

      {/* Readouts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-ink-950/40 p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Present value
          </div>
          <div className="mt-2 font-mono text-[22px] tabular-nums text-white">
            ${fmt(pv)}
          </div>
          <div className="mt-1 text-slate-400">
            <InlineMath>{String.raw`PV = E[CF_1] / (1+r)`}</InlineMath>
          </div>
        </div>
        <div className="rounded-xl border border-accent-green/25 bg-accent-green/[0.05] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-green">
            Implied expected return at this price
          </div>
          <div className="mt-2 font-mono text-[22px] tabular-nums text-white">
            {fmt(impliedReturn)}%
          </div>
          <div className="mt-1 text-slate-400">
            <InlineMath>{String.raw`(E[CF_1] - PV) / PV`}</InlineMath>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Why the present value changes
        </div>
        <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-100">
          {interpretation}
        </p>
        <div className="mt-4 max-w-2xl">
          <BlockMath>
            {String.raw`\boxed{PV = \dfrac{E[CF_1]}{1 + r}}`}
          </BlockMath>
        </div>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-300">
          The <span className="text-accent-amber">$100</span> present value (when{" "}
          <InlineMath>{String.raw`E[CF_1]=110`}</InlineMath> and{" "}
          <InlineMath>{String.raw`r=10\%`}</InlineMath>) is the price at which paying $100
          today for an expected $110 next year provides exactly the required 10% expected
          return.
        </p>
      </div>
    </div>
  );
}
