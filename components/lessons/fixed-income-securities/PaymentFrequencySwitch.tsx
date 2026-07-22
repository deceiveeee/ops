"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaExplainer,
} from "./shared";
import {
  couponCashFlows,
  macaulayDuration,
  annualMacaulay,
  annualModifiedDuration,
  formatPercent,
  formatPercentTex,
} from "@/lib/fixed-income";

/**
 * Lesson 3.3 — Payment frequency switch.
 * Annual / Semiannual / Quarterly. The number of periods per year (q) changes
 * the period-level duration; converting to annual divides by q. The modified
 * annual duration adjusts by (1 + y/q).
 */

type Freq = 1 | 2 | 4;

const FREQ_LABEL: Record<Freq, string> = {
  1: "Annual",
  2: "Semiannual",
  4: "Quarterly",
};

export default function PaymentFrequencySwitch() {
  const reduce = useReducedMotion();
  const [freq, setFreq] = useState<Freq>(2);
  const [couponPct, setCouponPct] = useState(8);
  const [ytmPct, setYtmPct] = useState(8);
  const maturity = 2; // years, fixed for a clean comparison

  const couponRate = couponPct / 100;
  const ytm = ytmPct / 100;

  const cfs = useMemo(
    () => couponCashFlows(100, couponRate, maturity, freq),
    [couponRate, freq],
  );

  const macPeriods = macaulayDuration(cfs, ytm, freq);
  const macAnnual = annualMacaulay(macPeriods, freq);
  const modAnnual = annualModifiedDuration(macPeriods, ytm, freq);

  const periods = cfs.length;

  return (
    <div className="space-y-6">
      <DefinitionCard term="Frequency and duration units">
        Duration computed in <span className="text-slate-50">periods</span>{" "}
        depends on how many periods a year (q) the bond pays. To compare bonds,
        convert to <span className="text-slate-50">annual</span>: divide the
        period-level Macaulay by q, then adjust modified duration by (1 + y/q).
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Payment frequency switch
            </span>
          </div>
          <div className="inline-flex rounded-full border border-white/15 bg-ink-950/60 p-1">
            {([1, 2, 4] as Freq[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={freq === f}
                onClick={() => setFreq(f)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  freq === f
                    ? "bg-accent-cyan/15 text-accent-cyan"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {FREQ_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Same bond, different compounding rhythm
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          A 2-year bond, coupon and yield matched. Switch the frequency: the
          period-level duration moves, but once annualized the durations sit
          close together.
        </p>

        {/* Levers */}
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <RangeSlider
            label="Coupon rate"
            value={couponPct}
            min={0}
            max={15}
            step={0.5}
            display={formatPercent(couponRate, 1)}
            onChange={setCouponPct}
          />
          <RangeSlider
            label="Yield (ytm)"
            value={ytmPct}
            min={0.5}
            max={15}
            step={0.5}
            display={formatPercent(ytm, 1)}
            onChange={setYtmPct}
          />
        </div>

        {/* Period strip */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
          <div className="ops-caption text-[11px] text-slate-400">
            {periods} periods · q = {freq} per year
          </div>
          <div className="mt-3 flex min-w-[420px] items-end gap-1.5">
            {cfs.map((cf, i) => (
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, scaleY: 0.6 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="flex-1 rounded-t bg-accent-cyan/40 text-center"
                style={{ height: 28 + (cf / 100) * 30 }}
              >
                <span className="ops-caption block pt-1 text-[10px] text-slate-400">
                  {i + 1}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Readouts */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ReadCard label="Periods (q·T)" value={`${periods}`} tone="cyan" />
          <ReadCard
            label="Macaulay (periods)"
            value={macPeriods.toFixed(2)}
            tone="amber"
          />
          <ReadCard
            label="Macaulay (annual)"
            value={`${macAnnual.toFixed(2)} yr`}
            tone="purple"
          />
        </div>

        <FormulaExplainer
          className="mt-4"
          label="Annualizing across frequency"
          tone="cyan"
          formula={String.raw`D_m^{annual} = \sum_{k=1}^{T}\frac{k\,\omega_k}{q}`}
          meaning="Period-level weights k are divided by q to convert from periods to years."
          variables={[
            { symbol: "q", description: "Coupons per year (1, 2, or 4)" },
            { symbol: "k", description: "Period index" },
            { symbol: "\\omega_k", description: "PV-weight of period k" },
          ]}
        />
        <FormulaExplainer
          className="mt-4"
          label="Annual modified duration"
          tone="amber"
          formula={String.raw`D_m^{*,annual} = \frac{D_m^{annual}}{1+y/q}`}
          substitution={String.raw`D_m^{*,annual} = \frac{${macAnnual.toFixed(2)}}{1 + ${formatPercentTex(ytm, 2)}/${freq}} = ${modAnnual.toFixed(2)}`}
          result={`Modified (annual) = ${modAnnual.toFixed(2)} years`}
          interpretation="More frequent coupons mean a finer compounding grid; once annualized, duration is comparable across bonds regardless of frequency."
        />
      </InteractiveFrame>
    </div>
  );
}

function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
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
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-accent-cyan"
      />
    </div>
  );
}

function ReadCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "amber" | "purple";
}) {
  const accent = {
    cyan: "text-accent-cyan",
    amber: "text-accent-amber",
    purple: "text-accent-purple",
  }[tone];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-mono text-[20px]", accent)}>{value}</div>
    </div>
  );
}
