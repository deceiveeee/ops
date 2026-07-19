"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag } from "./shared";

/**
 * Lesson 4.5 — Earnings & Reinvestment Simulator.
 *
 * Shows how payout, retention, book equity, and ROE produce sustainable
 * growth g = b × ROE, and whether reinvestment creates value (ROE > r),
 * is neutral (ROE = r), or destroys value (ROE < r).
 *
 * Entry mode toggles between payout ratio p and retention ratio b. The two
 * always sum to 1.
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

const pct = (v: number, digits = 1) =>
  isFinite(v) ? `${(v * 100).toFixed(digits)}%` : "—";

export default function EarningsReinvestmentSimulator() {
  const reduce = useReducedMotion();
  const [eps, setEps] = useState(5);
  const [bvps, setBvps] = useState(30);
  const [payoutPct, setPayoutPct] = useState(40);
  const [roePct, setRoePct] = useState(15);
  const [rPct, setRPct] = useState(10);
  const [entry, setEntry] = useState<"payout" | "retention">("payout");

  const p = payoutPct / 100;
  const b = 1 - p;
  const roe = roePct / 100;
  const r = rPct / 100;

  const dividend = eps * p;
  const retained = eps * b;
  const endingBvps = bvps + retained;
  const nextEps = endingBvps * roe;
  const g = b * roe;

  // Historical ROE check (on existing book)
  const historicalRoe = bvps > 0 ? eps / bvps : 0;

  // Value verdict
  const verdict: {
    label: string;
    tone: "green" | "amber" | "red";
    desc: string;
  } =
    roe > r + 1e-9
      ? {
          label: "Value-creating",
          tone: "green",
          desc: `ROE on new investment (${pct(roe)}) exceeds the cost of equity (${pct(
            r,
          )}). Each dollar retained generates more than a dollar of value.`,
        }
      : roe < r - 1e-9
        ? {
            label: "Value-destroying",
            tone: "red",
            desc: `ROE on new investment (${pct(roe)}) is below the cost of equity (${pct(
              r,
            )}). Growth comes at the cost of value.`,
          }
        : {
            label: "Value-neutral",
            tone: "amber",
            desc: `ROE on new investment (${pct(roe)}) equals the cost of equity (${pct(
              r,
            )}). Retained earnings earn exactly their required return, so NPV = 0.`,
          };

  const verdictText = {
    green: "text-accent-green",
    red: "text-accent-red",
    amber: "text-accent-amber",
  }[verdict.tone];
  const verdictBorder = {
    green: "border-accent-green/30",
    red: "border-accent-red/30",
    amber: "border-accent-amber/30",
  }[verdict.tone];
  const verdictBg = {
    green: "bg-accent-green/[0.05]",
    red: "bg-accent-red/[0.05]",
    amber: "bg-accent-amber/[0.05]",
  }[verdict.tone];

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Earnings &amp; reinvestment simulator
          </span>
        </div>
        <span className="ops-caption font-mono text-[11px] text-slate-500">
          g = b × ROE
        </span>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        From earnings to sustainable growth
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Set earnings per share, book value per share, the payout or retention
        ratio, the ROE earned on retained capital, and the cost of equity. The
        simulator traces the chain{" "}
        <span className="text-slate-50">earn → retain → reinvest → grow</span>{" "}
        and shows whether growth creates value.
      </p>

      {/* Entry-mode toggle */}
      <div className="mt-5 inline-flex rounded-full border border-white/10 bg-ink-950/60 p-1">
        <button
          type="button"
          onClick={() => setEntry("payout")}
          aria-pressed={entry === "payout"}
          className={cn(
            "rounded-full px-4 py-1.5 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            entry === "payout"
              ? "bg-accent-cyan/15 text-accent-cyan"
              : "text-slate-300 hover:text-slate-100",
          )}
        >
          Enter payout ratio p
        </button>
        <button
          type="button"
          onClick={() => setEntry("retention")}
          aria-pressed={entry === "retention"}
          className={cn(
            "rounded-full px-4 py-1.5 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            entry === "retention"
              ? "bg-accent-cyan/15 text-accent-cyan"
              : "text-slate-300 hover:text-slate-100",
          )}
        >
          Enter retention ratio b
        </button>
      </div>

      {/* Inputs */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField
          label="Earnings per share EPS₁"
          value={eps}
          step={0.25}
          onChange={setEps}
        />
        <NumberField
          label="Book value per share BVPS₀"
          value={bvps}
          step={1}
          onChange={setBvps}
        />
        <SliderField
          label={entry === "payout" ? "Payout ratio p = DPS/EPS" : "Retention ratio b"}
          value={entry === "payout" ? payoutPct : (1 - payoutPct) * 100}
          min={0}
          max={100}
          step={5}
          onChange={(v) =>
            setPayoutPct(entry === "payout" ? v : (1 - v / 100) * 100)
          }
          display={
            entry === "payout" ? pct(p, 0) : pct(b, 0)
          }
          accent="accent-cyan"
        />
        <SliderField
          label="ROE on retained capital"
          value={roePct}
          min={0}
          max={30}
          step={0.5}
          onChange={setRoePct}
          display={pct(roe)}
          accent="accent-green"
          danger={roePct < rPct}
        />
        <SliderField
          label="Cost of equity r"
          value={rPct}
          min={1}
          max={25}
          step={0.5}
          onChange={setRPct}
          display={pct(r)}
          accent="accent-purple"
        />
      </div>

      {/* Linked ratio note */}
      <p className="ops-caption mt-3 text-[12px] text-slate-500">
        Payout and retention always sum to 1: p = {pct(p, 0)}, b ={" "}
        {pct(b, 0)}.
      </p>

      {/* Results */}
      <motion.div
        key={`${eps}-${bvps}-${payoutPct}-${roePct}-${rPct}`}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6 space-y-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OutputCard
            label="Dividend per share DPS"
            sub={`p × EPS = ${pct(p, 0)} × ${money(eps)}`}
            value={money(dividend)}
            tone="cyan"
          />
          <OutputCard
            label="Retained per share"
            sub={`b × EPS = ${pct(b, 0)} × ${money(eps)}`}
            value={money(retained)}
            tone="green"
          />
          <OutputCard
            label="Ending BVPS₁"
            sub={`${money(bvps)} + ${money(retained)}`}
            value={money(endingBvps)}
            tone="green"
          />
          <OutputCard
            label="Next-year EPS₂"
            sub={`ROE × BVPS₁ = ${pct(roe)} × ${money(endingBvps)}`}
            value={money(nextEps)}
            tone="cyan"
          />
        </div>

        {/* Growth + verdict */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
            <div className="ops-caption text-[11px] text-accent-cyan">
              Sustainable growth
            </div>
            <div className="mt-2 font-mono text-[24px] text-accent-cyan">
              {pct(g, 2)}
            </div>
            <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
              g = b × ROE = {pct(b, 0)} × {pct(roe)} = {pct(g, 2)}.
            </p>
          </div>
          <div
            className={cn(
              "rounded-xl border p-5",
              verdictBorder,
              verdictBg,
            )}
          >
            <div className={cn("ops-caption text-[11px]", verdictText)}>
              ROE vs r
            </div>
            <div className={cn("mt-2 font-mono text-[20px]", verdictText)}>
              {verdict.label}
            </div>
            <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
              {verdict.desc}
            </p>
          </div>
        </div>

        {/* Historical ROE context */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Two different ROEs
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="font-mono text-[15px] text-slate-100">
                Historical ROE = {pct(historicalRoe)}
              </div>
              <p className="ops-body mt-1 text-[14px] leading-6 text-slate-400">
                Profitability on the existing book:{" "}
                <span className="font-mono">EPS₁ / BVPS₀</span> = {money(eps)} ÷{" "}
                {money(bvps)}.
              </p>
            </div>
            <div>
              <div className="font-mono text-[15px] text-slate-100">
                ROE on new investment = {pct(roe)}
              </div>
              <p className="ops-body mt-1 text-[14px] leading-6 text-slate-400">
                What the next dollar of retained capital earns. Future value
                creation depends on this number, not the historical one.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
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
        className="mt-1.5 w-full rounded-md border border-white/10 bg-ink-950/60 px-2.5 py-1.5 font-mono text-[14px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
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
  danger,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accent: string;
  display: string;
  danger?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-1">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span
          className={cn(
            "font-mono text-[12px]",
            danger ? "text-accent-red" : "text-slate-200",
          )}
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className={cn("mt-1.5 w-full", accent)}
      />
    </div>
  );
}

function OutputCard({
  label,
  sub,
  value,
  tone,
}: {
  label: string;
  sub: string;
  value: string;
  tone: "green" | "cyan";
}) {
  const toneText = {
    green: "text-accent-green",
    cyan: "text-accent-cyan",
  }[tone];
  const toneBorder = {
    green: "border-accent-green/30",
    cyan: "border-accent-cyan/30",
  }[tone];
  return (
    <motion.div
      layout
      className={cn("rounded-xl border bg-white/[0.02] p-4", toneBorder)}
    >
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-mono text-[18px]", toneText)}>{value}</div>
      <div className="ops-caption mt-1 font-mono text-[11px] text-slate-500">
        {sub}
      </div>
    </motion.div>
  );
}
