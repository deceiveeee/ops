"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  InteractiveFrame,
  TryItTag,
  FormulaExplainer,
} from "./shared";
import { forwardRateFromSpotRates, formatPercent } from "@/lib/fixed-income";
import { MathText } from "@/components/ui/MathText";

/**
 * Two paths to Year 2.
 * PATH A: invest for 2 years at r_{0,2}.
 * PATH B: invest for 1 year at r_{0,1}, then roll into forward f_2.
 * No-arbitrage pins f_2 from the two spot rates. Sliders update both paths
 * and the implied forward live.
 */
export default function TwoPathForwardRateBuilder() {
  const reduce = useReducedMotion();
  const [r1Pct, setR1Pct] = useState(5); // r_{0,1} in percent
  const [r2Pct, setR2Pct] = useState(7); // r_{0,2} in percent

  const r1 = r1Pct / 100;
  const r2 = r2Pct / 100;

  const f2 = forwardRateFromSpotRates(r1, r2, 2);
  const f2Label = formatPercent(f2, 2);

  // Terminal value of $1 along each path
  const pathA = Math.pow(1 + r2, 2);
  const pathB = (1 + r1) * (1 + f2);

  return (
    <InteractiveFrame>
      <div className="flex items-center gap-2.5">
        <TryItTag />
        <span className="ops-caption text-[11px] text-slate-400">
          Build the forward rate
        </span>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Two ways to reach Year 2 must agree
      </h4>

      {/* Sliders */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Slider
          label="1-year spot rate (r₀,₁)"
          value={r1Pct}
          min={0}
          max={15}
          step={0.1}
          display={formatPercent(r1, 1)}
          onChange={setR1Pct}
        />
        <Slider
          label="2-year spot rate (r₀,₂)"
          value={r2Pct}
          min={0}
          max={15}
          step={0.1}
          display={formatPercent(r2, 1)}
          onChange={setR2Pct}
        />
      </div>

      {/* Two-path visual */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* PATH A */}
        <PathCard
          tag="Path A · one move"
          tone="cyan"
          title="2 years at r_{0,2}"
          steps={[
            { k: "today", v: "$1.00" },
            { k: "year 2", v: `$${pathA.toFixed(4)}` },
          ]}
          footer={`(1 + ${formatPercent(r2, 2)})²`}
        />
        {/* PATH B */}
        <PathCard
          tag="Path B · two moves"
          tone="purple"
          title={`1 year at r_{0,1}, then forward f₂`}
          steps={[
            { k: "today", v: "$1.00" },
            { k: "year 1", v: `$${(1 + r1).toFixed(4)}` },
            { k: "year 2", v: `$${pathB.toFixed(4)}` },
          ]}
          footer={`(1 + ${formatPercent(r1, 2)})(1 + ${f2Label})`}
        />
      </div>

      {/* Implied forward */}
      <motion.div
        key={f2Label}
        initial={reduce ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="mt-6 rounded-2xl border border-accent-purple/30 bg-accent-purple/[0.06] p-5"
      >
        <div className="ops-caption text-[11px] text-accent-purple">
          Implied year-2 forward rate (f₂)
        </div>
        <div className="mt-1 font-mono text-[32px] text-white">{f2Label}</div>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          {r1Pct <= r2Pct
            ? `If year 1 is ${formatPercent(r1, 1)}, the implied year-2 forward must be above ${formatPercent(r2, 1)} — the 2-year rate is an average, and the first year is the cheap one.`
            : `With year 1 (${formatPercent(r1, 1)}) above the 2-year rate, the implied year-2 forward falls below ${formatPercent(r2, 1)} to compensate.`}
        </p>
      </motion.div>

      <FormulaExplainer
        className="mt-5"
        label="No-arbitrage forward"
        tone="purple"
        formula={"1+f_2 = \\frac{(1+r_{0,2})^2}{1+r_{0,1}}"}
        substitution={`f_2 = \\frac{${(1 + r2).toFixed(4)}^{2}}{${(1 + r1).toFixed(4)}} - 1`}
        result={`f₂ ≈ ${f2Label}`}
        interpretation="If year 1 is 5%, the implied year-2 forward must be above 7%."
      />
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
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
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
        className="mt-2 w-full accent-accent-purple"
      />
    </div>
  );
}

function PathCard({
  tag,
  tone,
  title,
  steps,
  footer,
}: {
  tag: string;
  tone: "cyan" | "purple";
  title: string;
  steps: { k: string; v: string }[];
  footer: string;
}) {
  const border = tone === "cyan" ? "border-accent-cyan/25" : "border-accent-purple/25";
  const bg = tone === "cyan" ? "bg-accent-cyan/[0.05]" : "bg-accent-purple/[0.05]";
  const text = tone === "cyan" ? "text-accent-cyan" : "text-accent-purple";
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-5`}>
      <div className={`ops-caption text-[11px] ${text}`}>{tag}</div>
      <div className="mt-1 font-mono text-[16px] text-slate-100"><MathText>{title}</MathText></div>
      <div className="mt-4 space-y-2">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-ink-950/50 px-3 py-2"
          >
            <span className="ops-caption text-[11px] text-slate-400">{s.k}</span>
            <span className="font-mono text-[14px] text-slate-100">{s.v}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center font-mono text-[12px] text-slate-400">
        {footer}
      </div>
    </div>
  );
}
