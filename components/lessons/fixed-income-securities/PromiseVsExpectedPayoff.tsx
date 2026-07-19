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
 * Section 2 — Promised vs expected payoff.
 * Corporate zero promises $1,000 in 10yr. User dials probability of full
 * payment p and recovery R. Expected payoff updates live.
 * Misconception callout: "Promised yield is what I will earn."
 * Correction: "No. Promised yield is what you earn IF default does not occur."
 */
const FACE = 1000;
const MATURITY = 10;

export default function PromiseVsExpectedPayoff() {
  const reduce = useReducedMotion();
  const [p, setP] = useState(0.9); // probability of full payment
  const [recovery, setRecovery] = useState(300); // recovery in default

  const expectedPayoff = p * FACE + (1 - p) * recovery;
  const expectedRatio = expectedPayoff / FACE;

  return (
    <div className="space-y-6">
      <DefinitionCard term="Promised is not expected">
        A corporate zero-coupon bond promises a fixed face value at maturity.
        But promised cash is not the same as expected cash. If default is
        possible, the expected payoff blends the full-payment scenario with the
        recovery-in-default scenario — weighted by their probabilities.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Promised vs expected payoff
            </span>
          </div>
          <div className="font-mono text-[12px] text-slate-400">
            Corporate zero · face {formatMoney(FACE)} · {MATURITY}yr
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          What you are promised vs what you expect
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Dial the probability of full payment and the recovery value. The
          expected payoff updates live. Notice how a high promised payoff can
          hide a much lower expectation once default risk is included.
        </p>

        {/* Two payoff cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-5">
            <div className="ops-caption text-[11px] text-accent-green">
              Promised payoff
            </div>
            <div className="mt-1 font-mono text-[28px] text-white">
              {formatMoney(FACE)}
            </div>
            <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
              The face value written into the bond contract — paid if default
              does not occur.
            </p>
          </div>
          <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
            <div className="ops-caption text-[11px] text-accent-amber">
              Expected payoff
            </div>
            <motion.div
              key={expectedPayoff.toFixed(2)}
              initial={reduce ? false : { opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-1 font-mono text-[28px] text-white"
            >
              {formatMoney(expectedPayoff)}
            </motion.div>
            <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
              Probability-weighted blend of full payment and recovery.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Slider
            label="Probability of full payment (p)"
            value={p}
            min={0}
            max={1}
            step={0.01}
            display={`${(p * 100).toFixed(0)}%`}
            onChange={setP}
            ariaLabel="Probability of full payment"
            tone="cyan"
          />
          <Slider
            label="Recovery in default (R)"
            value={recovery}
            min={0}
            max={1000}
            step={10}
            display={formatMoney(recovery)}
            onChange={setRecovery}
            ariaLabel="Recovery value in default"
            tone="amber"
          />
        </div>

        {/* Misconception */}
        <div className="mt-6 rounded-2xl border border-accent-red/30 bg-accent-red/[0.06] p-5">
          <div className="ops-caption text-[11px] uppercase tracking-[0.14em] text-accent-red">
            Common misconception
          </div>
          <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
            &ldquo;Promised yield is what I will earn.&rdquo;
          </p>
          <div className="mt-3 rounded-lg border border-accent-green/30 bg-accent-green/10 px-4 py-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-green">
              Correction
            </span>
            <p className="ops-body mt-1 text-[15px] leading-7 text-slate-100">
              No. Promised yield is what you earn{" "}
              <span className="text-slate-50">if default does not occur</span>.
              It is computed from the promised payoff, not the expected payoff.
              Expected yield is lower whenever default risk is real.
            </p>
          </div>
        </div>

        <FormulaExplainer
          className="mt-5"
          label="Expected payoff"
          tone="amber"
          formula={String.raw`E[\text{Payoff}] = p \cdot F + (1-p) \cdot R`}
          variables={[
            { symbol: String.raw`p`, description: "probability of full payment" },
            { symbol: String.raw`F`, description: "promised face value" },
            { symbol: String.raw`R`, description: "recovery value in default" },
          ]}
          substitution={String.raw`E[\text{Payoff}] = ${p.toFixed(2)} \cdot ${FACE} + ${(1 - p).toFixed(2)} \cdot ${recovery} = ${expectedPayoff.toFixed(2)}`}
          result={`Expected / Promised = ${(expectedRatio * 100).toFixed(1)}% of face`}
          interpretation="The expected payoff is what a risk-neutral investor would weigh against the price. It is always at or below the promised payoff whenever default is possible."
        />
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
  ariaLabel,
  tone,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  ariaLabel: string;
  tone: "cyan" | "amber";
}) {
  const accent = tone === "cyan" ? "accent-accent-cyan" : "accent-accent-amber";
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span
          className={cn(
            "font-mono text-[13px]",
            tone === "cyan" ? "text-accent-cyan" : "text-accent-amber",
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
        aria-label={ariaLabel}
        className={cn("mt-4 w-full", accent)}
      />
    </div>
  );
}
