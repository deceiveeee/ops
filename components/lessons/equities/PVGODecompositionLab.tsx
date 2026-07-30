"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag } from "./shared";

/**
 * Lesson 4.6 — PVGO Decomposition Lab.
 *
 * P₀ = EPS₁/r + PVGO, and P/E = 1/r + PVGO/EPS₁.
 *
 * Learner sets EPS₁, retention b, ROE on new investment, and r. The lab
 * computes no-growth value, implied g, D₁, growth value (Gordon), PVGO,
 * forward P/E, and decomposes both the price and the P/E into their
 * existing-business and growth components. Guards g ≥ r.
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

export default function PVGODecompositionLab() {
  const reduce = useReducedMotion();
  const [eps, setEps] = useState(8.33);
  const [bPct, setBPct] = useState(40);
  const [roePct, setRoePct] = useState(25);
  const [rPct, setRPct] = useState(15);

  const b = bPct / 100;
  const roe = roePct / 100;
  const r = rPct / 100;

  const noGrowth = r > 0 ? eps / r : NaN;
  const g = b * roe;
  const d1 = (1 - b) * eps;
  const invalid = g >= r;
  const growthValue = invalid ? NaN : d1 / (r - g);
  const pvgo = invalid ? NaN : growthValue - noGrowth;
  const price = invalid ? noGrowth : growthValue;
  const forwardPE = eps > 0 ? price / eps : NaN;
  const noGrowthPE = r > 0 ? 1 / r : NaN;
  const growthPEComponent = eps > 0 ? pvgo / eps : NaN;

  const verdict: {
    label: string;
    tone: "green" | "amber" | "red";
    desc: string;
  } = invalid
    ? {
        label: "Gordon invalid (g ≥ r)",
        tone: "red",
        desc: `Implied growth ${pct(g)} meets or exceeds r ${pct(
          r,
        )}. The Gordon perpetuity cannot be used, so PVGO from this model is not defined. The lab falls back to the no-growth value.`,
      }
    : roe > r + 1e-9
      ? {
          label: "PVGO > 0",
          tone: "green",
          desc: `ROE on new investment (${pct(roe)}) exceeds r (${pct(
            r,
          )}). Retained capital earns above its cost, so future investment creates value.`,
        }
      : roe < r - 1e-9
        ? {
            label: "PVGO < 0",
            tone: "red",
            desc: `ROE on new investment (${pct(roe)}) is below r (${pct(
              r,
            )}). The firm grows earnings but destroys value by reinvesting below cost.`,
          }
        : {
            label: "PVGO = 0",
            tone: "amber",
            desc: `ROE on new investment equals r. Reinvestment is NPV-neutral, so growth adds nothing to value.`,
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

  // Bar widths (cap at reasonable share for display)
  const existingShare =
    price > 0 && isFinite(pvgo) ? Math.max(0, noGrowth / price) : 1;
  const pvgoShare =
    price > 0 && isFinite(pvgo) ? Math.max(0, pvgo / price) : 0;
  const negativePvgo = isFinite(pvgo) && pvgo < 0;

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            PVGO decomposition lab
          </span>
        </div>
        <span className="ops-caption font-sans text-[11px] text-slate-500">
          P₀ = EPS₁/r + PVGO
        </span>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Decompose value into existing business and growth
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Set next-year earnings <span className="text-slate-50">EPS₁</span>, the
        retention ratio <span className="text-slate-50">b</span>, the ROE on new
        investment, and the cost of equity{" "}
        <span className="text-slate-50">r</span>. The lab splits the stock price
        into the value of existing operations and the present value of growth
        opportunities, then decomposes the P/E the same way.
      </p>

      {/* Inputs */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField
          label="Next earnings EPS₁"
          value={eps}
          step={0.25}
          onChange={setEps}
        />
        <SliderField
          label="Retention ratio b"
          value={bPct}
          min={0}
          max={100}
          step={5}
          onChange={setBPct}
          display={pct(b, 0)}
          accent="accent-cyan"
        />
        <SliderField
          label="ROE on new investment"
          value={roePct}
          min={0}
          max={35}
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

      {/* Results */}
      <motion.div
        key={`${eps}-${bPct}-${roePct}-${rPct}`}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6 space-y-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OutputCard
            label="No-growth value EPS₁/r"
            sub={`${money(eps)} ÷ ${pct(r)}`}
            value={money(noGrowth)}
            tone="cyan"
          />
          <OutputCard
            label="Implied growth g = b × ROE"
            sub={`${pct(b, 0)} × ${pct(roe)}`}
            value={pct(g, 2)}
            tone="green"
          />
          <OutputCard
            label="Gordon growth value D₁/(r−g)"
            sub={`${money(d1)} ÷ (${pct(r)} − ${pct(g)})`}
            value={invalid ? "—" : money(growthValue)}
            tone="green"
          />
          <OutputCard
            label="PVGO"
            sub={`${invalid ? "—" : money(growthValue)} − ${money(noGrowth)}`}
            value={invalid ? "—" : money(pvgo)}
            tone="cyan"
            highlight
          />
        </div>

        {/* PVGO verdict */}
        <div className={cn("rounded-xl border bg-white/[0.02] p-5", verdictBorder)}>
          <div className={cn("ops-caption text-[11px]", verdictText)}>
            Growth-opportunity verdict
          </div>
          <div className={cn("mt-2 font-sans text-[20px]", verdictText)}>
            {verdict.label}
          </div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
            {verdict.desc}
          </p>
        </div>

        {/* Price decomposition bar */}
        {!invalid && (
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-5">
            <div className="ops-caption text-[11px] text-accent-cyan">
              Stock price = existing business + PVGO
            </div>
            <div className="mt-2 font-sans text-[18px] text-slate-100">
              {money(price)} = {money(noGrowth)} + {money(pvgo)}
            </div>
            <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
              <motion.div
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${existingShare * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-accent-cyan/70"
                aria-hidden
              />
              {!negativePvgo && (
                <motion.div
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${pvgoShare * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                  className={cn(
                    pvgo >= 0 ? "bg-accent-green/70" : "bg-accent-red/70",
                  )}
                  aria-hidden
                />
              )}
            </div>
            {negativePvgo && (
              <p className="ops-caption mt-2 text-[12px] text-accent-red">
                PVGO is negative — growth destroys value, so the growth-value bar
                is omitted and the growth value falls below the no-growth value.
              </p>
            )}
          </div>
        )}

        {/* P/E decomposition */}
        <div className="rounded-xl border border-accent-purple/20 bg-accent-purple/[0.04] p-5">
          <div className="ops-caption text-[11px] text-accent-purple">
            P/E = 1/r + PVGO/EPS₁ (forward)
          </div>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-ink-950/40 px-4 py-3">
              <div className="ops-caption text-[11px] text-slate-400">
                Forward P/E
              </div>
              <div className="mt-1 font-sans text-[18px] text-slate-100">
                {forwardPE > 0 ? `${forwardPE.toFixed(2)}×` : "—"}
              </div>
              <div className="ops-caption mt-1 font-sans text-[11px] text-slate-500">
                {money(price)} ÷ {money(eps)}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-ink-950/40 px-4 py-3">
              <div className="ops-caption text-[11px] text-slate-400">
                Risk component 1/r
              </div>
              <div className="mt-1 font-sans text-[18px] text-accent-cyan">
                {noGrowthPE > 0 ? `${noGrowthPE.toFixed(2)}×` : "—"}
              </div>
              <div className="ops-caption mt-1 font-sans text-[11px] text-slate-500">
                1 ÷ {pct(r)}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-ink-950/40 px-4 py-3">
              <div className="ops-caption text-[11px] text-slate-400">
                Growth component PVGO/EPS₁
              </div>
              <div
                className={cn(
                  "mt-1 font-sans text-[18px]",
                  invalid ? "text-slate-400" : pvgo >= 0 ? "text-accent-green" : "text-accent-red",
                )}
              >
                {invalid ? "—" : `${growthPEComponent.toFixed(2)}×`}
              </div>
              <div className="ops-caption mt-1 font-sans text-[11px] text-slate-500">
                {invalid ? "—" : `${money(pvgo)} ÷ ${money(eps)}`}
              </div>
            </div>
          </div>
          {!invalid && (
            <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
              {forwardPE.toFixed(2)}× ≈ {noGrowthPE.toFixed(2)}× +{" "}
              {growthPEComponent.toFixed(2)}×. The risk component is what a
              no-growth version of the firm would earn; the growth component is
              the extra multiple the market pays for future opportunities.
            </p>
          )}
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
        className="mt-1.5 w-full rounded-md border border-white/10 bg-ink-950/60 px-2.5 py-1.5 font-sans text-[14px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
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
            "font-sans text-[12px]",
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
  highlight,
}: {
  label: string;
  sub: string;
  value: string;
  tone: "green" | "cyan";
  highlight?: boolean;
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
      <div
        className={cn(
          "mt-1 font-sans text-[18px]",
          highlight ? toneText : "text-slate-100",
        )}
      >
        {value}
      </div>
      <div className="ops-caption mt-1 font-sans text-[11px] text-slate-500">
        {sub}
      </div>
    </motion.div>
  );
}
