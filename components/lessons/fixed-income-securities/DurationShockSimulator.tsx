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
 * Lesson 3.3 — Duration shock simulator.
 * Modified duration gives a linear first-order estimate of price change for a
 * yield shock: %ΔP ≈ -D*_m × Δy. Slide a shock from -200 to +200 bps and watch
 * the estimated price card rise or fall.
 */

export default function DurationShockSimulator() {
  const reduce = useReducedMotion();
  const [modDur, setModDur] = useState(6.86);
  const [bps, setBps] = useState(10);
  const [price, setPrice] = useState(103.5);

  const deltaY = bps / 10000; // bps → decimal
  const pctChange = -modDur * deltaY;
  const newPrice = price * (1 + pctChange);

  const up = pctChange >= 0;

  return (
    <div className="space-y-6">
      <DefinitionCard term="Duration as price risk">
        Modified duration is the bond&apos;s{" "}
        <span className="text-slate-50">interest-rate sensitivity</span>. For a
        small yield shock, the percentage price change is approximately minus
        the modified duration times the yield change.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Duration shock simulator
            </span>
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          What happens to price when yields move?
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Set the modified duration and shock the yield. A{" "}
          <span className="text-accent-cyan">+10 bps</span> rise on a bond with{" "}
          modified duration 6.86 cuts the price by roughly{" "}
          <span className="text-accent-red">0.686%</span>.
        </p>

        {/* Inputs */}
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <NumField
            label="Modified duration D*_m"
            value={modDur}
            step={0.01}
            onChange={setModDur}
          />
          <NumField
            label="Starting price"
            value={price}
            step={0.5}
            onChange={setPrice}
          />
          <div>
            <div className="flex items-center justify-between">
              <span className="ops-caption text-[11px] text-slate-400">
                Yield shock Δy
              </span>
              <span
                className={cn(
                  "font-mono text-[13px]",
                  up ? "text-accent-green" : "text-accent-red",
                )}
              >
                {bps >= 0 ? "+" : "−"}
                {Math.abs(bps)} bps
              </span>
            </div>
            <input
              type="range"
              min={-200}
              max={200}
              step={5}
              value={bps}
              onChange={(e) => setBps(Number(e.target.value))}
              aria-label="Yield shock in basis points"
              className="mt-2 w-full accent-accent-amber"
            />
            <div className="mt-1 flex justify-between font-mono text-[11px] text-slate-500">
              <span>−200 bps</span>
              <span>+200 bps</span>
            </div>
          </div>
        </div>

        {/* Price cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PriceCard tone="cyan" label="Starting price" value={price} />
          <PriceCard
            tone={up ? "green" : "red"}
            label="Estimated new price"
            value={newPrice}
            delta={newPrice - price}
            pct={pctChange}
            up={up}
            reduce={reduce}
            highlight
          />
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="ops-caption text-[11px] text-slate-400">
              %ΔP estimate
            </div>
            <div
              className={cn(
                "mt-1 font-mono text-[20px]",
                up ? "text-accent-green" : "text-accent-red",
              )}
            >
              {pctChange >= 0 ? "+" : "−"}
              {formatPercent(Math.abs(pctChange), 3)}
            </div>
            <div className="ops-caption mt-1 text-[11px] text-slate-500">
              −{modDur.toFixed(2)} × {formatPercent(deltaY, 2)}
            </div>
          </div>
        </div>

        <FormulaExplainer
          className="mt-4"
          label="Duration price-change rule"
          tone="amber"
          formula={String.raw`\frac{\Delta P}{P} \approx -D_m^* \, \Delta y`}
          meaning="The percentage price change is approximately minus modified duration times the yield change. This is a first-order (linear) approximation."
          substitution={String.raw`\frac{\Delta P}{P} \approx -${modDur.toFixed(2)} \times ${formatPercentTex(deltaY, 2)} = ${formatPercentTex(pctChange, 3)}`}
          result={`P_new ≈ ${formatMoney(price)} × (1 + ${formatPercent(pctChange, 3)}) = ${formatMoney(newPrice)}`}
          interpretation="Duration is symmetric and linear — it overestimates gains and underestimates losses for large shocks. Convexity corrects this (see the next interactives)."
        />

        <p className="ops-body mt-4 rounded-xl border border-accent-red/20 bg-accent-red/[0.04] p-4 text-[14px] leading-6 text-slate-200">
          <span className="text-accent-red">First-order only.</span> The rule
          ignores convexity, so for shocks of 100+ bps the real price will
          differ — especially the downside.
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
      <span className="ops-caption text-[11px] text-slate-400">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full rounded-md border border-white/10 bg-ink-950/60 px-3 py-2 font-mono text-[15px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
      />
    </label>
  );
}

function PriceCard({
  tone,
  label,
  value,
  delta,
  pct,
  up,
  reduce,
  highlight,
}: {
  tone: "cyan" | "green" | "red";
  label: string;
  value: number;
  delta?: number;
  pct?: number;
  up?: boolean;
  reduce?: boolean | null;
  highlight?: boolean;
}) {
  const accent = {
    cyan: "text-accent-cyan border-accent-cyan/30",
    green: "text-accent-green border-accent-green/30",
    red: "text-accent-red border-accent-red/30",
  }[tone];
  return (
    <motion.div
      animate={
        highlight && !reduce ? { y: up ? [0, -6, 0] : [0, 6, 0] } : { y: 0 }
      }
      transition={{ duration: 0.4 }}
      className={cn("rounded-xl border bg-white/[0.02] p-4", accent)}
    >
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className="mt-1 font-mono text-[22px] text-slate-100">
        {formatMoney(value)}
      </div>
      {delta !== undefined && (
        <div
          className={cn(
            "mt-0.5 font-mono text-[13px]",
            up ? "text-accent-green" : "text-accent-red",
          )}
        >
          {delta >= 0 ? "+" : "−"}
          {formatMoney(Math.abs(delta))} (
          {pct !== undefined ? (pct >= 0 ? "+" : "−") : ""}
          {formatPercent(Math.abs(pct ?? 0), 3)})
        </div>
      )}
    </motion.div>
  );
}
