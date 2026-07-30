"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  Feedback,
} from "./shared";
import {
  macaulayDuration,
  annualMacaulay,
  annualModifiedDuration,
  couponCashFlows,
  formatPercent,
} from "@/lib/fixed-income";

/**
 * Lesson 3.3 — Duration levers.
 * Three levers — coupon rate, YTM, maturity — drive a bond's duration. Shows
 * the duration number, a balance-point marker, and an explanation. Includes a
 * deep-discount warning and a mini-check on coupon's direction.
 */

type Answer = "rises" | "falls" | null;

export default function DurationLevers() {
  const reduce = useReducedMotion();
  const [couponPct, setCouponPct] = useState(7);
  const [ytmPct, setYtmPct] = useState(6);
  const [maturity, setMaturity] = useState(10);
  const FREQ = 1;

  const couponRate = couponPct / 100;
  const ytm = ytmPct / 100;

  const cfs = useMemo(
    () => couponCashFlows(100, couponRate, maturity, FREQ),
    [couponRate, maturity],
  );

  const macPeriods = macaulayDuration(cfs, ytm, FREQ);
  const macAnnual = annualMacaulay(macPeriods, FREQ);
  const modAnnual = annualModifiedDuration(macPeriods, ytm, FREQ);

  const isDeepDiscount = couponRate < ytm - 0.04;
  const balancePct = maturity === 0 ? 0 : (macAnnual / maturity) * 100;

  // mini-check
  const [answer, setAnswer] = useState<Answer>(null);

  return (
    <div className="space-y-6">
      <DefinitionCard term="What moves duration?">
        Three levers: <span className="text-accent-cyan">coupon rate</span>,{" "}
        <span className="text-accent-amber">yield</span>, and{" "}
        <span className="text-accent-purple">maturity</span>. Higher coupons and
        higher yields both shorten duration; longer maturity usually lengthens
        it.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Duration levers
            </span>
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Pull the three levers of duration
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Watch how each lever shifts the balance point of the cash flows and
          the resulting Macaulay and modified duration.
        </p>

        {/* Levers */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Lever
              label="Coupon rate"
              tone="cyan"
              value={couponPct}
              min={0}
              max={15}
              step={0.5}
              display={formatPercent(couponRate, 1)}
              onChange={setCouponPct}
            />
            <Lever
              label="YTM"
              tone="amber"
              value={ytmPct}
              min={0.5}
              max={15}
              step={0.5}
              display={formatPercent(ytm, 1)}
              onChange={setYtmPct}
            />
            <Lever
              label="Maturity (years)"
              tone="purple"
              value={maturity}
              min={1}
              max={30}
              step={1}
              display={`${maturity} yr`}
              onChange={setMaturity}
            />
          </div>
        </div>

        {/* Readouts */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DurCard label="Macaulay (years)" value={macAnnual} tone="cyan" />
          <DurCard label="Modified (years)" value={modAnnual} tone="amber" />
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="ops-caption text-[11px] text-slate-400">
              Balance point
            </div>
            <div className="mt-1 font-sans text-[18px] text-accent-purple">
              {balancePct.toFixed(0)}% of maturity
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-accent-purple/70"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${Math.min(100, balancePct)}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
            <div className="ops-caption mt-1 flex justify-between text-[10px] text-slate-500">
              <span>0</span>
              <span>{maturity} yr</span>
            </div>
          </div>
        </div>

        {/* Balance bar visualization */}
        <BalanceBar macAnnual={macAnnual} maturity={maturity} reduce={reduce} />

        {/* Deep-discount warning */}
        <AnimatePresence>
          {isDeepDiscount && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-xl border border-accent-red/30 bg-accent-red/[0.06] p-4"
            >
              <div className="ops-caption text-[11px] text-accent-red">
                Deep-discount warning
              </div>
              <p className="ops-body mt-1.5 text-[14px] leading-6 text-slate-200">
                Coupon ({formatPercent(couponRate, 1)}) is far below yield (
                {formatPercent(ytm, 1)}). The bond behaves increasingly like a
                zero-coupon: duration approaches maturity, and price risk is
                high.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explanations */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Explain tag="Coupon ↑" effect="Duration falls" tone="cyan" />
          <Explain tag="Yield ↑" effect="Duration falls" tone="amber" />
          <Explain tag="Maturity ↑" effect="Duration rises" tone="purple" />
        </div>

        {/* Mini-check */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Mini-check
          </div>
          <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
            If the coupon rate rises, duration rises or falls?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={answer === "rises"}
              onClick={() => setAnswer("rises")}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                answer === "rises"
                  ? "border-accent-red/50 bg-accent-red/10 text-accent-red"
                  : "border-white/20 text-slate-300 hover:bg-white/5",
              )}
            >
              Rises
            </button>
            <button
              type="button"
              aria-pressed={answer === "falls"}
              onClick={() => setAnswer("falls")}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                answer === "falls"
                  ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                  : "border-white/20 text-slate-300 hover:bg-white/5",
              )}
            >
              Falls
            </button>
          </div>
          <AnimatePresence>
            {answer !== null && (
              <motion.div
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3"
              >
                {answer === "falls" ? (
                  <Feedback status="correct">
                    Falls. A higher coupon puts more of the bond&apos;s value in
                    the near-term payments, pulling the balance point earlier.
                  </Feedback>
                ) : (
                  <Feedback status="incorrect">
                    Falls. More coupon weight near the start shortens the
                    weighted-average time. Try sliding the coupon lever up and
                    watch the duration drop.
                  </Feedback>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function Lever({
  label,
  tone,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  tone: "cyan" | "amber" | "purple";
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  const accent = {
    cyan: "accent-accent-cyan",
    amber: "accent-accent-amber",
    purple: "accent-accent-purple",
  }[tone];
  const txt = {
    cyan: "text-accent-cyan",
    amber: "text-accent-amber",
    purple: "text-accent-purple",
  }[tone];
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className={cn("ops-caption text-[11px]", txt)}>{label}</span>
        <span className="font-sans text-[13px] text-slate-100">{display}</span>
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

function DurCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "cyan" | "amber";
}) {
  const accent = tone === "cyan" ? "text-accent-cyan" : "text-accent-amber";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-sans text-[22px]", accent)}>
        {value.toFixed(2)}
      </div>
    </div>
  );
}

function BalanceBar({
  macAnnual,
  maturity,
  reduce,
}: {
  macAnnual: number;
  maturity: number;
  reduce: boolean | null;
}) {
  const pct = maturity === 0 ? 0 : Math.min(100, (macAnnual / maturity) * 100);
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
      <div className="ops-caption text-[11px] text-slate-400">
        Maturity timeline · fulcrum = Macaulay duration
      </div>
      <div className="relative mt-4 h-12 min-w-[460px]">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-accent-cyan/30 via-accent-amber/30 to-accent-purple/30" />
        <motion.div
          className="absolute top-0 flex h-full flex-col items-center"
          initial={reduce ? false : { left: "0%" }}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="h-0 w-0 border-x-[7px] border-t-[10px] border-x-transparent border-t-accent-amber" />
          <div className="mt-1 whitespace-nowrap rounded-full border border-accent-amber/50 bg-accent-amber/10 px-2 py-0.5 font-sans text-[11px] text-accent-amber">
            {macAnnual.toFixed(2)} yr
          </div>
        </motion.div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 font-sans text-[11px] text-slate-500">
          {maturity} yr
        </div>
      </div>
    </div>
  );
}

function Explain({
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
