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
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400"
      >
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">
          {prefix}
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
        aria-valuetext={`${prefix}${value}${suffix}`}
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

export default function OilStageSpecificValuation() {
  const [pDisc, setPDisc] = useState(1 / 3); // probability of discovery
  const [payoff, setPayoff] = useState(60); // $M if oil found, end of year 2
  const [prodRate, setProdRate] = useState(20); // % production discount rate
  const [explRate, setExplRate] = useState(5); // % exploration discount rate

  // Step 1: Value at Year 1 conditional on success
  const v1Success = payoff / (1 + prodRate / 100);

  // Step 2: Probability-weighted Year 1 value
  const ev1 = pDisc * v1Success + (1 - pDisc) * 0;

  // Step 3: Discount to today
  const v0 = ev1 / (1 + explRate / 100);

  const pPct = Math.round(pDisc * 100);

  return (
    <div className="space-y-6">
      {/* Simplified label */}
      <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] px-4 py-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent-amber">
          Simplified instructional model
        </p>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Project timeline
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.04] p-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-cyan">
              Year 1 · Exploration
            </div>
            <p className="ops-body mt-1.5 text-[13px] leading-[1.5] text-slate-200">
              Drilling occurs. At year-end: oil found ({pPct}%) or nothing ({100 - pPct}%).
            </p>
          </div>
          <span className="hidden text-accent-amber sm:inline" aria-hidden>→</span>
          <div className="flex-1 rounded-xl border border-accent-amber/30 bg-accent-amber/[0.04] p-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-amber">
              Year 2 · Production
            </div>
            <p className="ops-body mt-1.5 text-[13px] leading-[1.5] text-slate-200">
              If oil is found, production generates ${fmt(payoff, 0)}M.
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Assumptions (adjust to explore)
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <LabeledSlider
            label="Discovery probability"
            value={pPct}
            min={5}
            max={80}
            step={5}
            suffix="%"
            onChange={(v) => setPDisc(v / 100)}
          />
          <LabeledSlider
            label="Production payoff (Year 2)"
            value={payoff}
            min={20}
            max={120}
            step={5}
            prefix="$"
            suffix="M"
            onChange={setPayoff}
          />
          <LabeledSlider
            label="Production discount rate"
            value={prodRate}
            min={8}
            max={30}
            step={1}
            suffix="%"
            onChange={setProdRate}
          />
          <LabeledSlider
            label="Exploration-stage discount rate"
            value={explRate}
            min={2}
            max={20}
            step={0.5}
            suffix="%"
            onChange={setExplRate}
          />
        </div>
      </div>

      {/* Step-by-step calculation */}
      <div className="space-y-4">
        {/* STEP 1 */}
        <CalcStep
          n={1}
          title="Value the production cash flow at Year 1 (conditional on success)"
          tone="amber"
        >
          <p className="ops-body text-[15px] leading-[1.65] text-slate-200">
            Once oil is discovered, the remaining cash flow comes from producing and selling oil.
            That cash flow is valued using the required return associated with{" "}
            <span className="text-white">oil-production risk</span>.
          </p>
          <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <BlockMath>
              {String.raw`V_1(\text{success}) = \frac{\$${fmt(payoff, 0)}\,\text{M}}{1 + ${prodRate}\%} = \$${fmt(v1Success)}\,\text{M}`}
            </BlockMath>
          </div>
          <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-400">
            The production cash flow is discounted one year at the production-required return because
            it arrives at the end of Year 2, and at Year 1 one year remains.
          </p>
        </CalcStep>

        {/* STEP 2 */}
        <CalcStep
          n={2}
          title="Incorporate the exploration outcome"
          tone="cyan"
        >
          <p className="ops-body text-[15px] leading-[1.65] text-slate-200">
            The probability of finding oil is incorporated through the{" "}
            <span className="text-white">expected value</span>. This is probability weighting, not
            discounting.
          </p>
          <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <BlockMath>
              {String.raw`E[V_1] = ${pPct}\%\times \$${fmt(v1Success)}\,\text{M} + ${100 - pPct}\%\times \$0 = \$${fmt(ev1)}\,\text{M}`}
            </BlockMath>
          </div>
          <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-400">
            The {100 - pPct}% probability of finding nothing enters as a zero payoff. It lowers the
            expected value without inflating the discount rate.
          </p>
        </CalcStep>

        {/* STEP 3 */}
        <CalcStep
          n={3}
          title="Discount the exploration-stage value to today"
          tone="green"
        >
          <p className="ops-body text-[15px] leading-[1.65] text-slate-200">
            Because this simplified example assumes the exploration outcome has beta 0, the Year 1
            expected value is discounted at the risk-free rate.
          </p>
          <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <BlockMath>
              {String.raw`V_0 = \frac{\$${fmt(ev1)}\,\text{M}}{1 + ${explRate}\%} = \$${fmt(v0)}\,\text{M}`}
            </BlockMath>
          </div>
          <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-400">
            Zero beta does not mean zero uncertainty. It means the uncertainty is{" "}
            <span className="text-white">not priced as systematic market risk</span> in this example.
          </p>
        </CalcStep>
      </div>

      {/* Result readout */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Readout label="Value if oil found (Yr 1)" value={`$${fmt(v1Success)}M`} tone="amber" />
        <Readout label="Probability-wtd Yr 1 value" value={`$${fmt(ev1)}M`} tone="cyan" />
        <Readout label="Present value today" value={`$${fmt(v0)}M`} tone="green" />
      </div>

      {/* Interpretation */}
      <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-green">
          Interpretation
        </div>
        <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-100">
          The two stages use <span className="text-white">different discount rates</span> because
          they carry different risks. Production cash flows are valued at {prodRate}% — the return
          investors require for oil-production market exposure. The exploration outcome is valued at{" "}
          {explRate}% because its uncertainty is assumed unrelated to the market in this simplified
          model.
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-300">
          Move the exploration-stage rate to match the production rate and watch the present value
          change. The next section compares this stage-specific approach with using one rate for
          everything.
        </p>
      </div>
    </div>
  );
}

function CalcStep({
  n,
  title,
  tone,
  children,
}: {
  n: number;
  title: string;
  tone: "amber" | "cyan" | "green";
  children: React.ReactNode;
}) {
  const toneText: Record<string, string> = {
    amber: "text-accent-amber",
    cyan: "text-accent-cyan",
    green: "text-accent-green",
  };
  const toneBorder: Record<string, string> = {
    amber: "border-accent-amber/25",
    cyan: "border-accent-cyan/25",
    green: "border-accent-green/25",
  };
  return (
    <div className={cn("rounded-2xl border bg-white/[0.03] p-5 sm:p-6", toneBorder[tone])}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[12px]",
            toneBorder[tone],
            toneText[tone],
          )}
        >
          {n}
        </span>
        <span className="text-[15px] font-medium leading-snug text-white">{title}</span>
      </div>
      <div className="mt-3">{children}</div>
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
  tone?: "neutral" | "green" | "amber" | "cyan";
}) {
  const text =
    tone === "green"
      ? "text-accent-green"
      : tone === "amber"
        ? "text-accent-amber"
        : tone === "cyan"
          ? "text-accent-cyan"
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
