"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
} from "./shared";

/**
 * Lesson 4.1 — Reinvestment decision lab.
 *
 * A company can distribute earnings or retain/reinvest them. Retaining is only
 * value-creating when the company earns a return above the shareholders'
 * required return (the cost of equity). This lab lets the learner set the
 * retained amount, the expected return the company will earn, and the required
 * return, then watch FV, required FV, PV, and NPV update live.
 *
 * Key teaching point: distinguish dollar returns from percentage rates.
 *  - $4  = actual dollar return produced
 *  - 4%  = return rate the company earns
 *  - 10% = required return (cost of equity)
 *  - $10 = required dollar return
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

export default function ReinvestmentDecisionLab() {
  const [retained, setRetained] = useState(100);
  const [expectedPct, setExpectedPct] = useState(4);
  const [requiredPct, setRequiredPct] = useState(10);

  const expected = expectedPct / 100;
  const required = requiredPct / 100;

  const fv = retained * (1 + expected);
  const requiredFv = retained * (1 + required);
  const pv = fv / (1 + required);
  const npv = pv - retained;

  const dollarProduced = fv - retained; // actual dollar return produced
  const dollarRequired = requiredFv - retained; // required dollar return

  let verdict: "create" | "preserve" | "destroy";
  let verdictLabel: string;
  let verdictTone: "green" | "cyan" | "red";
  if (npv > 0.5) {
    verdict = "create";
    verdictLabel = "Creates value";
    verdictTone = "green";
  } else if (npv < -0.5) {
    verdict = "destroy";
    verdictLabel = "Destroys value";
    verdictTone = "red";
  } else {
    verdict = "preserve";
    verdictLabel = "Preserves value";
    verdictTone = "cyan";
  }

  // Bar widths for the comparison visual (capped for layout)
  const maxBar = Math.max(dollarProduced, dollarRequired, 1);
  const producedPct = Math.min((dollarProduced / maxBar) * 100, 100);
  const requiredPctW = Math.min((dollarRequired / maxBar) * 100, 100);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Reinvestment decision lab
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-500">
          Return vs. cost of equity
        </span>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Does reinvesting create or destroy value?
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        A company retains <span className="text-slate-50">{money(retained)}</span>{" "}
        instead of distributing it. Whether that decision creates value depends
        entirely on the return the company earns versus what shareholders
        require. Set the three inputs below and watch the value calculation
        update.
      </p>

      {/* Inputs */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <NumberField
          label="Amount retained"
          value={retained}
          step={5}
          onChange={setRetained}
        />
        <SliderField
          label="Return the company earns"
          value={expectedPct}
          min={0}
          max={25}
          step={0.5}
          onChange={setExpectedPct}
          accent="accent-green"
          display={pct(expected)}
        />
        <SliderField
          label="Return shareholders require (cost of equity)"
          value={requiredPct}
          min={0}
          max={25}
          step={0.5}
          onChange={setRequiredPct}
          accent="accent-cyan"
          display={pct(required)}
        />
      </div>

      {/* Output cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OutputCard
          label="Future value produced"
          sub={`FV = ${money(retained)} × (1 + ${pct(expected)})`}
          value={money(fv)}
          tone="green"
        />
        <OutputCard
          label="Required future value"
          sub={`Required FV = ${money(retained)} × (1 + ${pct(required)})`}
          value={money(requiredFv)}
          tone="cyan"
        />
        <OutputCard
          label="Present value of FV"
          sub={`PV = ${money(fv)} ÷ (1 + ${pct(required)})`}
          value={money(pv)}
          tone="slate"
        />
        <OutputCard
          label="NPV (value created)"
          sub={`PV − ${money(retained)}`}
          value={`${npv >= 0 ? "+" : "−"}${money(Math.abs(npv))}`}
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
          {verdict === "create" &&
            `The company earns ${pct(expected)}, above the ${pct(required)} shareholders require. The retained cash grows into an asset worth more than its cost, so the decision creates value.`}
          {verdict === "preserve" &&
            `The company earns roughly ${pct(expected)}, matching the ${pct(required)} shareholders require. The decision preserves value — neither creating nor destroying it.`}
          {verdict === "destroy" &&
            `The company earns ${pct(expected)}, below the ${pct(required)} shareholders require. Even though earnings grew, the asset is worth less than its cost, so the decision destroys value.`}
        </p>
      </div>

      {/* Dollar-return comparison visual */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="ops-caption text-[11px] text-slate-400">
          Dollar return: what the company produces vs. what investors require
        </div>

        <div className="mt-4 space-y-4">
          <BarRow
            label="Company produces"
            caption={`${money(dollarProduced)} = ${money(retained)} × ${pct(expected)}`}
            width={producedPct}
            tone="bg-accent-green"
            value={money(dollarProduced)}
          />
          <BarRow
            label="Investors require"
            caption={`${money(dollarRequired)} = ${money(retained)} × ${pct(required)}`}
            width={requiredPctW}
            tone="bg-accent-cyan"
            value={money(dollarRequired)}
          />
          <div className="border-t border-white/10 pt-4">
            <BarRow
              label={npv >= 0 ? "Value created" : "Value destroyed"}
              caption={`NPV = ${money(pv)} − ${money(retained)}`}
              width={Math.min((Math.abs(npv) / maxBar) * 100, 100)}
              tone={npv >= 0 ? "bg-accent-green/70" : "bg-accent-red"}
              value={`${npv >= 0 ? "+" : "−"}${money(Math.abs(npv))}`}
            />
          </div>
        </div>
      </div>

      {/* Rates vs dollars clarification */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-4">
          <div className="ops-caption text-[11px] text-accent-cyan">
            Percentage rates
          </div>
          <div className="ops-body mt-2 text-[15px] text-slate-200">
            <span className="font-mono text-accent-green">{pct(expected)}</span>{" "}
            = return rate the company earns.{" "}
            <span className="font-mono text-accent-cyan">{pct(required)}</span> =
            required return (cost of equity).
          </div>
        </div>
        <div className="rounded-xl border border-accent-green/20 bg-accent-green/[0.04] p-4">
          <div className="ops-caption text-[11px] text-accent-green">
            Dollar returns
          </div>
          <div className="ops-body mt-2 text-[15px] text-slate-200">
            <span className="font-mono text-accent-green">
              {money(dollarProduced)}
            </span>{" "}
            = actual dollars produced.{" "}
            <span className="font-mono text-accent-cyan">
              {money(dollarRequired)}
            </span>{" "}
            = dollars investors required.
          </div>
        </div>
      </div>
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
  accent,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accent: string;
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
        className={cn("mt-2 w-full", accent)}
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
  tone: "green" | "cyan" | "red" | "slate";
  highlight?: boolean;
}) {
  const toneCls = {
    green: "border-accent-green/30 text-accent-green",
    cyan: "border-accent-cyan/30 text-accent-cyan",
    red: "border-accent-red/30 text-accent-red",
    slate: "border-white/10 text-slate-200",
  }[tone];
  return (
    <motion.div
      layout
      className={cn("rounded-xl border bg-white/[0.02] p-4", toneCls)}
    >
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div
        className={cn(
          "mt-1 font-mono text-[20px]",
          highlight ? toneCls.split(" ")[1] : "text-slate-100",
        )}
      >
        {value}
      </div>
      <div className="ops-caption mt-1 font-mono text-[11px] text-slate-500">
        {sub}
      </div>
    </motion.div>
  );
}

function BarRow({
  label,
  caption,
  width,
  tone,
  value,
}: {
  label: string;
  caption: string;
  width: number;
  tone: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="ops-caption text-[11px] text-slate-300">{label}</span>
        <span className="font-mono text-[13px] text-slate-200">{value}</span>
      </div>
      <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
        <motion.div
          className={cn("h-full rounded-full", tone)}
          animate={{ width: `${Math.max(width, 2)}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <div className="ops-caption mt-1 font-mono text-[11px] text-slate-500">
        {caption}
      </div>
    </div>
  );
}
