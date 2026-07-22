"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaExplainer,
} from "./shared";
import { formatMoney, formatPercent, formatPercentTex } from "@/lib/fixed-income";

/**
 * Lesson 3.3 — Approximation console.
 * Worked example: P(y)=100, y=6%, y0=8%, D*_m=3.509846, V_m=14.805972.
 *  - duration term = -3.509846 × 0.02 = -0.0701969
 *  - convexity term = 0.5 × 14.805972 × 0.04 = 0.0029611
 *  - factor = 0.9327642
 *  - P(0.08) ≈ 93.276 ; exact = 93.267
 * Show duration-only price, duration+convexity price, exact reference, error.
 */

export default function ApproximationConsole() {
  const reduce = useReducedMotion();
  // defaults from spec
  const [pY, setPY] = useState(100);
  const [yPct, setYPct] = useState(6);
  const [y0Pct, setY0Pct] = useState(8);
  const [dStar, setDStar] = useState(3.509846);
  const [vM, setVM] = useState(14.805972);
  const [exact, setExact] = useState(93.267);

  const y = yPct / 100;
  const y0 = y0Pct / 100;
  const dy = y0 - y;

  const durTerm = -dStar * dy;
  const convTerm = 0.5 * vM * dy * dy;
  const factor = 1 + durTerm + convTerm;
  const pDurConv = pY * factor;
  const pDurOnly = pY * (1 + durTerm);

  const errDur = Math.abs(pDurOnly - exact);
  const errConv = Math.abs(pDurConv - exact);

  return (
    <div className="space-y-6">
      <DefinitionCard term="Duration + convexity approximation">
        The full second-order approximation combines a linear duration term with
        a quadratic convexity term. It tracks the true price far better than
        duration alone — for one bond the difference is a penny, but across a
        large portfolio those pennies add up.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Approximation console
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPY(100);
              setYPct(6);
              setY0Pct(8);
              setDStar(3.509846);
              setVM(14.805972);
              setExact(93.267);
            }}
            className="rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Reset defaults
          </button>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Compute the approximated price
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Start from a price {formatMoney(pY)} at y = {formatPercent(y, 0)}.
          Estimate the price at y₀ = {formatPercent(y0, 0)} (Δy ={" "}
          {formatPercent(dy, 2)}). Step through each term of the approximation.
        </p>

        {/* Inputs */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <NumField label="P(y)" value={pY} step={1} onChange={setPY} />
          <NumField label="y (%)" value={yPct} step={0.5} onChange={setYPct} />
          <NumField
            label="y₀ (%)"
            value={y0Pct}
            step={0.5}
            onChange={setY0Pct}
          />
          <NumField
            label="D*_m"
            value={dStar}
            step={0.001}
            onChange={setDStar}
          />
          <NumField
            label="V_m (convexity)"
            value={vM}
            step={0.001}
            onChange={setVM}
          />
          <NumField
            label="Exact P(y₀)"
            value={exact}
            step={0.001}
            onChange={setExact}
          />
        </div>

        {/* Step computation */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <TermCard
            label="Duration term"
            expr={`-D*_m × Δy = -${dStar.toFixed(6)} × ${formatPercent(dy, 2)}`}
            value={durTerm}
            tone="amber"
            reduce={reduce}
          />
          <TermCard
            label="Convexity term"
            expr={`½ × V_m × Δy² = 0.5 × ${vM.toFixed(6)} × ${(dy * dy).toFixed(4)}`}
            value={convTerm}
            tone="purple"
            reduce={reduce}
          />
          <TermCard
            label="Factor 1 + dur + conv"
            expr={`1 + (${durTerm.toFixed(7)}) + (${convTerm.toFixed(7)})`}
            value={factor}
            tone="cyan"
            reduce={reduce}
          />
        </div>

        {/* Results */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PriceResult
            label="Duration-only"
            value={pDurOnly}
            tone="amber"
            err={errDur}
          />
          <PriceResult
            label="Duration + convexity"
            value={pDurConv}
            tone="purple"
            err={errConv}
            highlight
          />
          <PriceResult label="Exact reference" value={exact} tone="green" />
        </div>

        <FormulaExplainer
          className="mt-4"
          label="Second-order price approximation"
          tone="purple"
          formula={String.raw`P(y_0) \approx P(y)\left[1 - D_m^*(y_0-y) + \frac{1}{2}V_m(y_0-y)^2\right]`}
          meaning="Duration gives the linear slope; convexity adds the curvature correction. The bracket is the price factor applied to P(y)."
          substitution={String.raw`P(${formatPercentTex(y0, 0)}) \approx ${pY.toFixed(2)}\left[1 - ${dStar.toFixed(6)}\times ${formatPercentTex(dy, 2)} + \tfrac{1}{2}\times ${vM.toFixed(6)}\times ${(dy * dy).toFixed(4)}\right]`}
          result={`P(${formatPercent(y0, 0)}) ≈ ${formatMoney(pDurConv)}  (exact ≈ ${formatMoney(exact)})`}
          interpretation={`A ${formatMoney(errConv)} error is small for one bond, but meaningful for large portfolios — especially when duration-only alone is off by ${formatMoney(errDur)}.`}
        />

        <p className="ops-body mt-4 rounded-xl border border-accent-green/20 bg-accent-green/[0.04] p-4 text-[14px] leading-6 text-slate-200">
          <span className="text-accent-green">
            A penny is small for one bond
          </span>
          , but meaningful for large portfolios. Convexity shaves the
          duration-only error from {formatMoney(errDur)} down to{" "}
          {formatMoney(errConv)}.
        </p>
      </InteractiveFrame>
    </div>
  );
}

function NumField({
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
      <span className="ops-caption text-[10px] text-slate-500">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-1 w-full rounded-md border border-white/10 bg-ink-950/60 px-2 py-1.5 font-mono text-[14px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
      />
    </label>
  );
}

function TermCard({
  label,
  expr,
  value,
  tone,
  reduce,
}: {
  label: string;
  expr: string;
  value: number;
  tone: "amber" | "purple" | "cyan";
  reduce: boolean | null;
}) {
  const accent = {
    amber: "text-accent-amber border-accent-amber/30",
    purple: "text-accent-purple border-accent-purple/30",
    cyan: "text-accent-cyan border-accent-cyan/30",
  }[tone];
  return (
    <motion.div
      key={value.toFixed(6)}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("rounded-xl border bg-white/[0.02] p-4", accent)}
    >
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className="mt-1 font-mono text-[12px] text-slate-300">{expr}</div>
      <div className={cn("mt-1 font-mono text-[18px]", accent.split(" ")[0])}>
        {value.toFixed(7)}
      </div>
    </motion.div>
  );
}

function PriceResult({
  label,
  value,
  tone,
  err,
  highlight,
}: {
  label: string;
  value: number;
  tone: "amber" | "purple" | "green";
  err?: number;
  highlight?: boolean;
}) {
  const accent = {
    amber: "text-accent-amber",
    purple: "text-accent-purple",
    green: "text-accent-green",
  }[tone];
  const border = {
    amber: "border-accent-amber/30",
    purple: "border-accent-purple/30",
    green: "border-accent-green/30",
  }[tone];
  return (
    <div
      className={cn(
        "rounded-xl border bg-white/[0.02] p-4",
        border,
        highlight && "shadow-glow",
      )}
    >
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-mono text-[22px]", accent)}>
        {formatMoney(value)}
      </div>
      {err !== undefined && (
        <div className="ops-caption mt-0.5 text-[11px] text-slate-500">
          error: {formatMoney(err)}
        </div>
      )}
    </div>
  );
}
