"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  InteractiveFrame,
  TryItTag,
  FormulaExplainer,
} from "./shared";
import { solveZeroCouponRate, formatPercent } from "@/lib/fixed-income";

/**
 * Interactive translator: drag the price (and maturity) of a $1 zero-coupon
 * bond and read off the implied spot rate. Demonstrates that the spot rate
 * is simply a re-expression of the price.
 */
export default function ZeroCouponTranslator() {
  const reduce = useReducedMotion();
  const [price, setPrice] = useState(0.797);
  const [maturity, setMaturity] = useState(5);

  const rate = solveZeroCouponRate(1, price, maturity);
  const rateLabel = formatPercent(rate, 2);

  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Price → rate translator
        </span>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Translate a price into today&apos;s spot rate
      </h4>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,300px)_1fr]">
        {/* Inputs */}
        <div className="space-y-5 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <Slider
            label="Price today (P₀, per $1 face)"
            min={0.1}
            max={1}
            step={0.001}
            value={price}
            display={`$${price.toFixed(3)}`}
            onChange={setPrice}
          />
          <Slider
            label="Maturity (years)"
            min={1}
            max={10}
            step={1}
            value={maturity}
            display={`${maturity} yr`}
            onChange={setMaturity}
          />
        </div>

        {/* Output */}
        <div className="space-y-4">
          <motion.div
            key={rateLabel}
            initial={reduce ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-5"
          >
            <div className="ops-caption text-[11px] text-accent-cyan">
              Implied {maturity}-year spot rate
            </div>
            <div className="mt-1 font-mono text-[32px] text-white">{rateLabel}</div>
            <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
              This price implies today&apos;s{" "}
              <span className="text-accent-amber font-mono">{maturity}-year</span>{" "}
              spot rate of{" "}
              <span className="text-accent-cyan font-mono">{rateLabel}</span>.
            </p>
          </motion.div>

          <FormulaExplainer
            label="Solve the spot rate"
            tone="cyan"
            formula={"r_{0,T} = \\left(\\frac{1}{P_0}\\right)^{1/T} - 1"}
            substitution={`r_{0,${maturity}} = \\left(\\frac{1}{${price.toFixed(3)}}\\right)^{1/${maturity}} - 1`}
            result={`r(0,${maturity}) ≈ ${formatPercent(rate, 2)}`}
            interpretation="A higher price means investors accept a lower rate to wait for that future dollar."
          />
        </div>
      </div>
    </InteractiveFrame>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
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
