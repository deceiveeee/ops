"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
} from "./shared";

/**
 * Lesson 4.2 — One-period valuation explorer.
 *
 * P₀ = (D₁ + P₁) / (1 + r). The learner sets the expected dividend, expected
 * future price, the required return, and a separate purchase price. The lab
 * computes the estimated current value, dividend yield, expected capital gain,
 * and expected total return — and flags whether the purchase price offers a
 * return below, equal to, or above the required return.
 */

const money = (v: number) =>
  isFinite(v)
    ? v.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";

const pct = (v: number, digits = 2) =>
  isFinite(v) ? `${(v * 100).toFixed(digits)}%` : "—";

export default function OnePeriodValuationExplorer() {
  const [d1, setD1] = useState(2);
  const [p1, setP1] = useState(108);
  const [requiredPct, setRequiredPct] = useState(10);
  const [purchasePrice, setPurchasePrice] = useState(100);

  const r = requiredPct / 100;

  const value = (d1 + p1) / (1 + r);
  const dividendYield = d1 / purchasePrice;
  const capitalGain = (p1 - purchasePrice) / purchasePrice;
  const totalReturn = (d1 + p1 - purchasePrice) / purchasePrice;

  let verdict: "above" | "equal" | "below";
  let verdictLabel: string;
  let verdictDesc: string;
  let verdictTone: "green" | "cyan" | "red";
  const gap = totalReturn - r;
  if (gap > 0.005) {
    verdict = "above";
    verdictLabel = "Expected return above required";
    verdictDesc = `At this purchase price you expect ${pct(totalReturn)}, above the ${pct(r)} required. The stock looks undervalued relative to your assumptions.`;
    verdictTone = "green";
  } else if (gap < -0.005) {
    verdict = "below";
    verdictLabel = "Expected return below required";
    verdictDesc = `At this purchase price you expect ${pct(totalReturn)}, below the ${pct(r)} required. The stock looks overvalued relative to your assumptions.`;
    verdictTone = "red";
  } else {
    verdict = "equal";
    verdictLabel = "Expected return matches required";
    verdictDesc = `At this purchase price you expect ${pct(totalReturn)}, matching the ${pct(r)} required. This is fair value given your assumptions.`;
    verdictTone = "cyan";
  }

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            One-period valuation explorer
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-500">
          P₀ = (D₁ + P₁) / (1 + r)
        </span>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Value a stock over one period
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Set what you expect to receive next period (a dividend{" "}
        <span className="text-slate-50">D₁</span> and a future price{" "}
        <span className="text-slate-50">P₁</span>), the return you require, and
        the price you would actually pay. The lab computes the stock&apos;s
        estimated value and tells you whether the purchase price delivers more or
        less than your required return.
      </p>

      {/* Inputs */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField
          label="Expected dividend D₁"
          value={d1}
          step={0.5}
          onChange={setD1}
        />
        <NumberField
          label="Expected future price P₁"
          value={p1}
          step={1}
          onChange={setP1}
        />
        <SliderField
          label="Required return r"
          value={requiredPct}
          min={1}
          max={20}
          step={0.5}
          onChange={setRequiredPct}
          display={pct(r)}
        />
        <NumberField
          label="Purchase price"
          value={purchasePrice}
          step={1}
          onChange={setPurchasePrice}
        />
      </div>

      {/* Output cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OutputCard
          label="Estimated current value"
          sub={`(${money(d1)} + ${money(p1)}) ÷ (1 + ${pct(r)})`}
          value={money(value)}
          tone="cyan"
          highlight
        />
        <OutputCard
          label="Dividend yield"
          sub={`${money(d1)} ÷ ${money(purchasePrice)}`}
          value={pct(dividendYield)}
          tone="green"
        />
        <OutputCard
          label="Expected capital gain"
          sub={`(${money(p1)} − ${money(purchasePrice)}) ÷ ${money(purchasePrice)}`}
          value={pct(capitalGain)}
          tone={capitalGain >= 0 ? "green" : "red"}
        />
        <OutputCard
          label="Expected total return"
          sub={`(${money(d1)} + ${money(p1)} − ${money(purchasePrice)}) ÷ ${money(purchasePrice)}`}
          value={pct(totalReturn)}
          tone={verdictTone}
          highlight
        />
      </div>

      {/* Verdict */}
      <div
        className={cn(
          "mt-5 rounded-xl border p-5",
          verdictTone === "green" && "border-accent-green/30 bg-accent-green/[0.06]",
          verdictTone === "cyan" && "border-accent-cyan/30 bg-accent-cyan/[0.06]",
          verdictTone === "red" && "border-accent-red/30 bg-accent-red/[0.06]",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={cn(
              "font-mono text-[13px] uppercase tracking-[0.14em]",
              verdictTone === "green" && "text-accent-green",
              verdictTone === "cyan" && "text-accent-cyan",
              verdictTone === "red" && "text-accent-red",
            )}
          >
            Verdict
          </span>
          <span
            className={cn(
              "ops-body-strong text-lg",
              verdictTone === "green" && "text-accent-green",
              verdictTone === "cyan" && "text-accent-cyan",
              verdictTone === "red" && "text-accent-red",
            )}
          >
            {verdictLabel}
          </span>
        </div>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          {verdictDesc}
        </p>
      </div>

      {/* Value vs purchase price visual */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="ops-caption text-[11px] text-slate-400">
          Estimated value vs. purchase price
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-cyan">
              Estimated value
            </div>
            <div className="mt-1 font-mono text-[22px] text-slate-100">
              {money(value)}
            </div>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/[0.03] p-4">
            <div className="ops-caption text-[11px] text-slate-400">
              Purchase price
            </div>
            <div className="mt-1 font-mono text-[22px] text-slate-100">
              {money(purchasePrice)}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <ValueVsPriceBar value={value} price={purchasePrice} />
        </div>
      </div>

      <p className="ops-body mt-4 rounded-xl border border-accent-amber/20 bg-accent-amber/[0.04] p-4 text-[14px] leading-6 text-slate-200">
        <span className="text-accent-amber">Remember:</span> the estimated
        current value depends on your assumptions about D₁, P₁, and r. Change r
        and watch how the same expected payoff maps to a different value today.
      </p>
    </InteractiveFrame>
  );
}

function NumberField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="ops-caption text-[11px] text-slate-400">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full rounded-md border border-white/10 bg-ink-950/60 px-3 py-2 font-mono text-[15px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
      />
    </label>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span className="font-mono text-[13px] text-slate-200">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-accent-cyan"
      />
    </div>
  );
}

function OutputCard({
  label,
  sub,
  value,
  tone,
  highlight,
}: {
  label: string;
  sub: string;
  value: string;
  tone: "green" | "cyan" | "red";
  highlight?: boolean;
}) {
  const toneText = {
    green: "text-accent-green",
    cyan: "text-accent-cyan",
    red: "text-accent-red",
  }[tone];
  const toneBorder = {
    green: "border-accent-green/30",
    cyan: "border-accent-cyan/30",
    red: "border-accent-red/30",
  }[tone];
  return (
    <motion.div
      layout
      className={cn("rounded-xl border bg-white/[0.02] p-4", toneBorder)}
    >
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-mono text-[20px]", highlight ? toneText : "text-slate-100")}>
        {value}
      </div>
      <div className="ops-caption mt-1 font-mono text-[11px] text-slate-500">
        {sub}
      </div>
    </motion.div>
  );
}

function ValueVsPriceBar({ value, price }: { value: number; price: number }) {
  const max = Math.max(value, price, 1);
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="ops-caption text-[11px] text-accent-cyan">
            Estimated value
          </span>
          <span className="font-mono text-[13px] text-slate-200">
            {money(value)}
          </span>
        </div>
        <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
          <motion.div
            className="h-full rounded-full bg-accent-cyan"
            animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="ops-caption text-[11px] text-slate-400">
            Purchase price
          </span>
          <span className="font-mono text-[13px] text-slate-200">
            {money(price)}
          </span>
        </div>
        <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
          <motion.div
            className="h-full rounded-full bg-slate-400"
            animate={{ width: `${Math.min((price / max) * 100, 100)}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
