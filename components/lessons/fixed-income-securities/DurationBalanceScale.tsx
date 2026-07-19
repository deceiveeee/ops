"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";
import {
  couponCashFlows,
  macaulayDuration,
  annualMacaulay,
  formatMoney,
  formatPercent,
} from "@/lib/fixed-income";

/**
 * Lesson 3.3 — Duration as a balance point.
 * Plot each cash flow as a weight on a timeline. The balance point (Macaulay
 * duration) is the weighted-average time of the cash flows. Controls:
 * coupon rate, yield, maturity, zero-coupon toggle. Demonstrates:
 *  - higher coupon → duration falls (more weight near the start)
 *  - higher yield → duration falls (far CFs discounted more)
 *  - longer maturity → duration rises (usually)
 *  - zero-coupon → duration = maturity
 */

type Mode = "coupon" | "zero";

export default function DurationBalanceScale() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("coupon");
  const [couponPct, setCouponPct] = useState(7);
  const [yieldPct, setYieldPct] = useState(6);
  const [maturity, setMaturity] = useState(4);
  const FREQ = mode === "zero" ? 1 : 1; // annual periods for clarity

  const ytm = yieldPct / 100;
  const couponRate = mode === "zero" ? 0 : couponPct / 100;

  const cfs = useMemo(
    () => couponCashFlows(100, couponRate, maturity, FREQ),
    [couponRate, maturity, FREQ],
  );

  const macPeriods = macaulayDuration(cfs, ytm, FREQ);
  const durationYears = annualMacaulay(macPeriods, FREQ);

  return (
    <div className="space-y-6">
      <DefinitionCard term="Macaulay duration">
        The <span className="text-slate-50">weighted-average time</span> to
        receive a bond&apos;s cash flows, weighted by each flow&apos;s present
        value. It is the balance point of the cash-flow timeline.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Duration balance scale
            </span>
          </div>
          <div className="inline-flex rounded-full border border-white/15 bg-ink-950/60 p-1">
            <button
              type="button"
              aria-pressed={mode === "coupon"}
              onClick={() => setMode("coupon")}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                mode === "coupon"
                  ? "bg-accent-cyan/15 text-accent-cyan"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              Coupon bond
            </button>
            <button
              type="button"
              aria-pressed={mode === "zero"}
              onClick={() => setMode("zero")}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                mode === "zero"
                  ? "bg-accent-cyan/15 text-accent-cyan"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              Zero-coupon
            </button>
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Where does the timeline balance?
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Each cash flow is a weight hung on the timeline. The fulcrum that
          balances them is the duration. Move the levers and watch the balance
          point shift.
        </p>

        {/* Controls */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Slider
              label="Coupon rate"
              value={couponPct}
              min={0}
              max={15}
              step={0.5}
              disabled={mode === "zero"}
              display={formatPercent(couponRate, 1)}
              onChange={setCouponPct}
            />
            <Slider
              label="Yield (ytm)"
              value={yieldPct}
              min={0.5}
              max={15}
              step={0.5}
              display={formatPercent(ytm, 1)}
              onChange={setYieldPct}
            />
            <Slider
              label="Maturity (years)"
              value={maturity}
              min={1}
              max={20}
              step={1}
              display={`${maturity} yr`}
              onChange={setMaturity}
            />
          </div>
        </div>

        {/* Balance timeline */}
        <BalanceTimeline
          cfs={cfs}
          ytm={ytm}
          freq={FREQ}
          maturity={maturity}
          durationYears={durationYears}
          reduce={reduce}
        />

        {/* Big readout */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
            <div className="ops-caption text-[11px] text-accent-amber">
              Macaulay duration
            </div>
            <div className="mt-1 font-mono text-[28px] text-white">
              {durationYears.toFixed(2)}{" "}
              <span className="text-[16px] text-slate-400">years</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <div className="ops-caption text-[11px] text-slate-400">
              Why this value?
            </div>
            <p className="ops-body mt-1.5 text-[14px] leading-6 text-slate-200">
              {mode === "zero"
                ? `Zero-coupon: one cash flow at maturity, so duration equals maturity (${maturity} yr).`
                : `Coupon spreads cash flows across time, pulling the balance point below maturity.`}
            </p>
          </div>
        </div>

        {/* Intuition */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Intuition tag="Higher coupon" effect="Duration falls" tone="cyan" />
          <Intuition tag="Higher yield" effect="Duration falls" tone="amber" />
          <Intuition tag="Longer maturity" effect="Duration rises" tone="purple" />
        </div>
      </InteractiveFrame>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn(disabled && "opacity-40")}>
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span className="font-mono text-[13px] text-slate-100">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-accent-cyan disabled:cursor-not-allowed"
      />
    </div>
  );
}

function BalanceTimeline({
  cfs,
  ytm,
  freq,
  maturity,
  durationYears,
  reduce,
}: {
  cfs: number[];
  ytm: number;
  freq: number;
  maturity: number;
  durationYears: number;
  reduce: boolean | null;
}) {
  const W = 600;
  const H = 200;
  const padX = 30;
  const baseY = 150;
  const tMax = Math.max(maturity, 1);
  const xAt = (t: number) =>
    padX + (t / tMax) * (W - padX * 2);

  // PV weights for sizing bars
  const perRate = ytm / freq;
  const pvWeights = cfs.map(
    (cf, i) => cf / Math.pow(1 + perRate, i + 1),
  );
  const maxPV = Math.max(...pvWeights, 1);
  const maxBarH = 90;

  const fulcrumX = xAt(durationYears);

  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[560px]"
        role="img"
        aria-label={`Cash flow timeline. Balance point (duration) at ${durationYears.toFixed(2)} years out of ${maturity} year maturity.`}
      >
        {/* timeline rail */}
        <line
          x1={padX}
          y1={baseY}
          x2={W - padX}
          y2={baseY}
          stroke="rgba(148,163,184,0.35)"
          strokeWidth={2}
        />
        {/* year ticks */}
        {Array.from({ length: tMax + 1 }, (_, t) => (
          <g key={t}>
            <line
              x1={xAt(t)}
              y1={baseY - 4}
              x2={xAt(t)}
              y2={baseY + 4}
              stroke="rgba(148,163,184,0.4)"
            />
            <text
              x={xAt(t)}
              y={baseY + 18}
              textAnchor="middle"
              className="fill-slate-500 font-mono"
              fontSize="10"
            >
              {t}
            </text>
          </g>
        ))}
        {/* PV weight bars hanging from rail */}
        {cfs.map((cf, i) => {
          const t = i + 1;
          const x = xAt(t);
          const pv = pvWeights[i];
          const h = (pv / maxPV) * maxBarH;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={baseY}
                x2={x}
                y2={baseY - h}
                stroke="rgba(34,211,238,0.5)"
                strokeWidth={6}
                strokeLinecap="round"
              />
              <text
                x={x}
                y={baseY - h - 6}
                textAnchor="middle"
                className="fill-slate-300 font-mono"
                fontSize="10"
              >
                {formatMoney(cf)}
              </text>
            </g>
          );
        })}
        {/* fulcrum / balance point */}
        <motion.g
          animate={{ x: reduce ? 0 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <polygon
            points={`${fulcrumX},${baseY} ${fulcrumX - 12},${baseY + 20} ${fulcrumX + 12},${baseY + 20}`}
            fill="#fbbf24"
          />
          <line
            x1={fulcrumX}
            y1={baseY - maxBarH - 14}
            x2={fulcrumX}
            y2={baseY}
            stroke="rgba(251,191,36,0.5)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          <text
            x={fulcrumX}
            y={baseY - maxBarH - 20}
            textAnchor="middle"
            className="fill-accent-amber font-mono"
            fontSize="11"
          >
            D = {durationYears.toFixed(2)}
          </text>
        </motion.g>
      </svg>
      <div className="ops-caption mt-1 text-center text-[11px] text-slate-500">
        Bar height = present value of that cash flow · fulcrum = Macaulay
        duration
      </div>
    </div>
  );
}

function Intuition({
  tag,
  effect,
  tone,
}: {
  tag: string;
  effect: string;
  tone: "cyan" | "amber" | "purple";
}) {
  const accent = {
    cyan: "text-accent-cyan",
    amber: "text-accent-amber",
    purple: "text-accent-purple",
  }[tone];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="ops-caption text-[11px] text-slate-400">{tag}</div>
      <div className={cn("ops-body-strong mt-1 text-[15px]", accent)}>
        {effect}
      </div>
    </div>
  );
}
