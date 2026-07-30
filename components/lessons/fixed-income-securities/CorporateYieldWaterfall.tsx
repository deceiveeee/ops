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
import { formatMoney } from "@/lib/fixed-income";

/**
 * Section 8 — Corporate yield waterfall.
 * MIT XYZ example: Treasury STRIPS price $463.19, yield 8%; XYZ price
 * $321.97, promised $1,000, expected $762.22, T=10yr.
 * Waterfall: risk-free 8% + risk premium 1% = expected YTM 9%; + default
 * premium 3% = promised YTM 12%. Sliders adjust expected payoff and corporate
 * price; waterfall updates live.
 */
const T = 10;
const FACE = 1000;

function nthRoot(base: number, n: number) {
  return Math.pow(base, 1 / n);
}

export default function CorporateYieldWaterfall() {
  const reduce = useReducedMotion();
  const [treasuryPrice, setTreasuryPrice] = useState(463.19);
  const [corpPrice, setCorpPrice] = useState(321.97);
  const [expectedPayoff, setExpectedPayoff] = useState(762.22);

  const yRiskFree = nthRoot(FACE / treasuryPrice, T) - 1;
  const yPromised = nthRoot(FACE / corpPrice, T) - 1;
  const yExpected = nthRoot(expectedPayoff / corpPrice, T) - 1;
  const riskPremium = yExpected - yRiskFree;
  const defaultPremium = yPromised - yExpected;

  const pct = (x: number) => `${(x * 100).toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <DefinitionCard term="The corporate yield waterfall">
        A corporate promised yield is built in layers: start at the risk-free
        rate, add a risk premium to reach the expected yield, then add a default
        premium to reach the promised yield. The headline 12% sits on top of a
        much smaller expected return.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Corporate yield waterfall
            </span>
          </div>
          <div className="font-sans text-[12px] text-slate-400">
            MIT XYZ · 10yr zero · face {formatMoney(FACE)}
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          From risk-free to promised yield
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          The waterfall starts at the risk-free rate (8%), adds a risk premium
          to reach expected YTM (9%), then adds a default premium to reach
          promised YTM (12%). Adjust the inputs to see the layers shift.
        </p>

        {/* Waterfall visual */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="flex min-w-[560px] items-end gap-2">
            <WaterfallBar
              label="Risk-free"
              value={yRiskFree}
              height={yRiskFree}
              tone="green"
              reduce={reduce}
              display={pct(yRiskFree)}
            />
            <WaterfallBar
              label="+ Risk premium"
              value={riskPremium}
              height={riskPremium}
              tone="cyan"
              reduce={reduce}
              display={`+${pct(riskPremium)}`}
              stacked
            />
            <WaterfallBar
              label="= Expected YTM"
              value={yExpected}
              height={yExpected}
              tone="cyan"
              reduce={reduce}
              display={pct(yExpected)}
              total
            />
            <WaterfallBar
              label="+ Default premium"
              value={defaultPremium}
              height={defaultPremium}
              tone="red"
              reduce={reduce}
              display={`+${pct(defaultPremium)}`}
              stacked
            />
            <WaterfallBar
              label="= Promised YTM"
              value={yPromised}
              height={yPromised}
              tone="amber"
              reduce={reduce}
              display={pct(yPromised)}
              total
            />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <WaterfallSlider
            label="Treasury STRIPS price"
            value={treasuryPrice}
            min={300}
            max={700}
            step={0.01}
            display={formatMoney(treasuryPrice)}
            onChange={setTreasuryPrice}
            tone="green"
          />
          <WaterfallSlider
            label="XYZ corporate price"
            value={corpPrice}
            min={200}
            max={700}
            step={0.01}
            display={formatMoney(corpPrice)}
            onChange={setCorpPrice}
            tone="amber"
          />
          <WaterfallSlider
            label="Expected payoff"
            value={expectedPayoff}
            min={300}
            max={1000}
            step={0.01}
            display={formatMoney(expectedPayoff)}
            onChange={setExpectedPayoff}
            tone="cyan"
          />
        </div>

        {/* Misconception */}
        <div className="mt-6 rounded-2xl border border-accent-red/30 bg-accent-red/[0.06] p-5">
          <div className="ops-caption text-[11px] uppercase tracking-[0.14em] text-accent-red">
            Common misconception
          </div>
          <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
            &ldquo;{pct(yPromised)} promised yield means investors expect to
            earn {pct(yPromised)}.&rdquo;
          </p>
          <div className="mt-3 rounded-lg border border-accent-green/30 bg-accent-green/10 px-4 py-3">
            <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-accent-green">
              Correction
            </span>
            <p className="ops-body mt-1 text-[15px] leading-7 text-slate-100">
              No. Expected YTM is {pct(yExpected)}, risk premium is{" "}
              {pct(riskPremium)}. The default premium ({pct(defaultPremium)})
              compensates for the chance you never receive the promised payoff.
            </p>
          </div>
        </div>

        {/* Formula explainers with substitutions */}
        <div className="mt-6 space-y-5">
          <FormulaExplainer
            label="Risk-free yield (Treasury STRIPS)"
            tone="green"
            formula={String.raw`y_{\text{risk-free}} = \left(\frac{F}{P_{\text{tsy}}}\right)^{1/T} - 1`}
            substitution={String.raw`y_{\text{risk-free}} = \left(\frac{1000}{${treasuryPrice.toFixed(2)}}\right)^{1/10} - 1 \approx ${pct(yRiskFree)}`}
            interpretation="The baseline: what a default-free Treasury promises for the same maturity."
          />
          <FormulaExplainer
            label="Promised yield (XYZ)"
            tone="amber"
            formula={String.raw`y_{\text{promised}} = \left(\frac{F}{P_{\text{corp}}}\right)^{1/T} - 1`}
            substitution={String.raw`y_{\text{promised}} = \left(\frac{1000}{${corpPrice.toFixed(2)}}\right)^{1/10} - 1 \approx ${pct(yPromised)}`}
            interpretation="The headline corporate yield — computed from the promised face value, ignoring default."
          />
          <FormulaExplainer
            label="Expected yield (XYZ)"
            tone="cyan"
            formula={String.raw`y_{\text{expected}} = \left(\frac{E[\text{Payoff}]}{P_{\text{corp}}}\right)^{1/T} - 1`}
            substitution={String.raw`y_{\text{expected}} = \left(\frac{${expectedPayoff.toFixed(2)}}{${corpPrice.toFixed(2)}}\right)^{1/10} - 1 \approx ${pct(yExpected)}`}
            interpretation="The yield investors actually expect, blending full payment and recovery scenarios."
          />
          <FormulaExplainer
            label="Default premium and risk premium"
            tone="red"
            formula={String.raw`\text{Default Premium} = y_{\text{promised}} - y_{\text{expected}}, \quad \text{Risk Premium} = y_{\text{expected}} - y_{\text{risk-free}}`}
            substitution={String.raw`\text{DP} = ${pct(yPromised)} - ${pct(yExpected)} = ${pct(defaultPremium)}, \quad \text{RP} = ${pct(yExpected)} - ${pct(yRiskFree)} = ${pct(riskPremium)}`}
            interpretation="As expected payoff falls, expected YTM falls and the default premium widens. As the corporate price falls, promised yield rises."
          />
        </div>
      </InteractiveFrame>
    </div>
  );
}

function WaterfallBar({
  label,
  height,
  tone,
  reduce,
  display,
  stacked = false,
  total = false,
}: {
  label: string;
  value: number;
  height: number;
  tone: "green" | "cyan" | "red" | "amber";
  reduce: boolean | null;
  display: string;
  stacked?: boolean;
  total?: boolean;
}) {
  const fill = {
    green: "bg-accent-green",
    cyan: "bg-accent-cyan",
    red: "bg-accent-red",
    amber: "bg-accent-amber",
  }[tone];
  const text = {
    green: "text-accent-green",
    cyan: "text-accent-cyan",
    red: "text-accent-red",
    amber: "text-accent-amber",
  }[tone];
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className={cn("font-sans text-[12px]", text)}>{display}</span>
      <div
        className={cn(
          "mt-1 w-full rounded-t border-x border-t",
          total ? "border-white/20" : "border-white/5",
          stacked ? "opacity-90" : "",
        )}
        style={{ minHeight: 8 }}
      >
        <motion.div
          initial={false}
          animate={{ height: Math.max(8, height * 1200) }}
          transition={reduce ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
          className={cn("w-full rounded-t", fill)}
        />
      </div>
      <span className="ops-caption mt-2 text-center text-[11px] text-slate-400">
        {label}
      </span>
    </div>
  );
}

function WaterfallSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  tone,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  tone: "green" | "amber" | "cyan";
}) {
  const accent = {
    green: "accent-accent-green",
    amber: "accent-accent-amber",
    cyan: "accent-accent-cyan",
  }[tone];
  const text = {
    green: "text-accent-green",
    amber: "text-accent-amber",
    cyan: "text-accent-cyan",
  }[tone];
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span className={cn("font-sans text-[13px]", text)}>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className={cn("mt-4 w-full", accent)}
      />
    </div>
  );
}
