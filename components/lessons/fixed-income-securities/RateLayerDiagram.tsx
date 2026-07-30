"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaCard,
  Var,
  Sub,
  Sup,
} from "./shared";

/**
 * Section 2 — Two layers of rates.
 * Top row: unobserved future one-year rates R_1..R_T.
 * Bottom row: the observed T-year spot rate r_{0,T}.
 * User selects maturity T (1–10); number of hidden blocks and formula update.
 */
export default function RateLayerDiagram() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <DefinitionCard term="One-year rate in year t  ( R_t )">
          <Var>R</Var>
          <Sub>1</Sub> is the rate from year 0&rarr;1, <Var>R</Var>
          <Sub>2</Sub> from year 1&rarr;2, <Var>R</Var>
          <Sub>3</Sub> from year 2&rarr;3, and so on. We do{" "}
          <span className="text-slate-50">not</span> observe the full future
          sequence today.
        </DefinitionCard>
        <DefinitionCard term="Today's T-year spot rate  ( r₀,ₜ )">
          The rate on a loan starting today and ending in <Var>T</Var> years.
          For example <Var>r</Var>
          <Sub>0,5</Sub> is today&apos;s 5-year spot rate.
        </DefinitionCard>
      </div>

      <FormulaCard
        label="Discounting with future one-year rates"
        ariaLabel="P zero equals F over the product of one plus R one times one plus R two through one plus R T"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Var>P</Var>
          <Sub>0</Sub>
          <span>=</span>
          <span className="text-slate-300">
            <Var>F</Var>
          </span>
          <span className="text-slate-400">/</span>
          <span className="inline-flex flex-col items-center align-middle leading-none">
            <span className="px-1 pb-0.5">
              [ (1+<Var>R</Var>
              <Sub>1</Sub>)(1+<Var>R</Var>
              <Sub>2</Sub>)&hellip;(1+<Var>R</Var>
              <Sub>
                <Var>T</Var>
              </Sub>
              ) ]
            </span>
          </span>
        </div>
      </FormulaCard>
      <p className="ops-muted text-[14px] leading-6 text-slate-400">
        Note: we do not observe the full future sequence <Var>R</Var>
        <sub className="text-[0.7em]">1</sub>&hellip;<Var>R</Var>
        <sub className="text-[0.7em]">T</sub> today.
      </p>

      <FormulaCard
        label="Today's T-year spot rate"
        ariaLabel="P zero equals F over one plus r sub 0 T raised to T"
      >
        <div className="flex items-center gap-2">
          <Var>P</Var>
          <Sub>0</Sub>
          <span>=</span>
          <span>
            <Var>F</Var> / (1+<Var>r</Var>
            <Sub>0,T</Sub>)<Sup>T</Sup>
          </span>
        </div>
      </FormulaCard>

      <RateLayerInteractive />
    </div>
  );
}

function RateLayerInteractive() {
  const reduce = useReducedMotion();
  const [T, setT] = useState(5);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Choose maturity T
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={T}
            onChange={(e) => setT(Number(e.target.value))}
            aria-label="Maturity in years"
            className="w-40 accent-accent-cyan"
          />
          <span className="font-sans text-[15px] text-slate-100">T = {T}</span>
        </div>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Hidden one-year rates vs the observed spot rate
      </h4>

      <div className="mt-5 rounded-2xl border border-white/10 bg-ink-950/50 p-5 sm:p-6">
        {/* Top row: hidden future one-year rates */}
        <div className="ops-caption text-[11px] text-slate-400">
          Top — unobserved future one-year rates
        </div>
        <div className="mt-2 flex flex-wrap items-stretch gap-1.5">
          {Array.from({ length: T }).map((_, i) => (
            <motion.div
              key={i}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className={cn(
                "relative flex flex-1 min-w-[58px] flex-col items-center justify-center rounded-lg border border-dashed border-accent-purple/40 bg-accent-purple/[0.06] px-2 py-3",
              )}
            >
              <span className="font-sans text-[13px] text-accent-purple">
                R<sub className="text-[0.7em]">{i + 1}</sub>
              </span>
              <span className="ops-caption mt-0.5 text-[10px] text-slate-500">
                ?
              </span>
              {i < T - 1 && (
                <span
                  className="absolute -right-[7px] top-1/2 -translate-y-1/2 text-slate-600"
                  aria-hidden
                >
                  &middot;
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bracket connector */}
        <div className="mt-3 flex justify-center">
          <svg
            width="120"
            height="36"
            viewBox="0 0 120 36"
            aria-hidden
            className="text-accent-cyan/50"
          >
            <path
              d="M10 2 L10 18 L110 18 L110 2"
              fill="none"
              stroke="rgba(34,211,238,0.45)"
              strokeWidth="1.4"
            />
            <line
              x1="60"
              y1="18"
              x2="60"
              y2="32"
              stroke="rgba(34,211,238,0.45)"
              strokeWidth="1.4"
            />
            <polygon points="56,28 64,28 60,34" fill="rgba(34,211,238,0.5)" />
          </svg>
        </div>

        {/* Bottom row: observed T-year spot rate */}
        <div className="ops-caption mt-1 text-[11px] text-slate-400">
          Bottom — observed today from the T-year discount bond price
        </div>
        <motion.div
          layout={!reduce}
          className="mt-2 flex items-center justify-center"
        >
          <motion.div
            key={T}
            initial={reduce ? false : { opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 rounded-lg border border-accent-cyan/50 bg-accent-cyan/10 px-5 py-3"
            style={{ minWidth: Math.max(120, T * 62) }}
          >
            <span className="font-sans text-[16px] text-accent-cyan">
              r<sub className="text-[0.7em]">0,{T}</sub>
            </span>
            <span className="ops-caption text-[11px] text-slate-400">
              today&apos;s {T}-year spot rate
            </span>
          </motion.div>
        </motion.div>

        <p className="ops-body mt-5 text-[14px] leading-6 text-slate-200">
          We do not know each future one-year rate, but the price of a{" "}
          <span className="text-accent-cyan">{T}-year zero</span> tells us
          today&apos;s {T}-year spot rate. Today&apos;s T-year spot rate is a{" "}
          <span className="text-slate-50">geometric average</span> of one-year
          rates over the period.
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-accent-cyan">
            Current substitution
          </div>
          <div className="mt-2 font-sans text-[15px] text-slate-100">
            <Var>P</Var>
            <Sub>0</Sub> = <Var>F</Var> / (1+<Var>r</Var>
            <Sub>0,{T}</Sub>)<Sup>{T}</Sup>
          </div>
          <div className="mt-1 font-sans text-[13px] text-slate-400">
            {T} hidden one-year rates collapse into one observable {T}-year
            rate.
          </div>
        </div>
      </div>
    </InteractiveFrame>
  );
}
