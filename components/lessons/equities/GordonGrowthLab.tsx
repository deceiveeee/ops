"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
} from "./shared";

/**
 * Lesson 4.3 — Gordon Growth lab.
 *
 * P₀ = D₁ / (r − g), where D₁ = D₀(1 + g). The learner sets D₀, the growth
 * rate g, and the required return r. The lab warns explicitly when g ≥ r and
 * refuses to display a negative value — the model is simply invalid in that
 * region. A sensitivity strip shows how P₀ explodes as g approaches r, and an
 * optional side-by-side panel compares two assumption sets.
 */

const money = (v: number) =>
  isFinite(v)
    ? v.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";

const pct = (v: number, digits = 2) =>
  isFinite(v) ? `${(v * 100).toFixed(digits)}%` : "—";

function computeP0(d0: number, g: number, r: number): number | null {
  if (r - g <= 0) return null;
  const d1 = d0 * (1 + g);
  return d1 / (r - g);
}

export default function GordonGrowthLab() {
  const [d0, setD0] = useState(2);
  const [gPct, setGPct] = useState(4);
  const [rPct, setRPct] = useState(10);

  // second assumption set for comparison
  const [d0b, setD0b] = useState(2);
  const [gPctB, setGPctB] = useState(6);
  const [rPctB, setRPctB] = useState(10);

  const g = gPct / 100;
  const r = rPct / 100;
  const d1 = d0 * (1 + g);
  const p0 = computeP0(d0, g, r);
  const invalid = p0 === null;

  const dividendYield = p0 !== null ? d1 / p0 : null;
  const totalReturn = dividendYield !== null ? dividendYield + g : null;

  // Sensitivity: hold D₀ and r fixed, vary g from 0 up to r
  const sensitivity = (() => {
    const rows: { gPct: number; p0: number | null }[] = [];
    const step = 1;
    const maxG = Math.min(Math.floor(rPct) - 1, 12);
    for (let gi = 0; gi <= maxG; gi += step) {
      const gv = gi / 100;
      rows.push({ gPct: gi, p0: computeP0(d0, gv, r) });
    }
    return rows;
  })();

  // Comparison B
  const gb = gPctB / 100;
  const rb = rPctB / 100;
  const d1b = d0b * (1 + gb);
  const p0b = computeP0(d0b, gb, rb);
  const invalidB = p0b === null;
  const yieldB = p0b !== null ? d1b / p0b : null;

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Gordon Growth lab
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-500">
          P₀ = D₁ / (r − g)
        </span>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Value a constant-growth stock
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Set the most recent dividend <span className="text-slate-50">D₀</span>,
        the constant growth rate <span className="text-slate-50">g</span>, and
        the required return <span className="text-slate-50">r</span>. The model
        requires <span className="text-accent-cyan">r &gt; g</span> — when that
        fails, the constant-growth perpetuity formula cannot be used.
      </p>

      {/* Primary inputs */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <NumberField
          label="Most recent dividend D₀"
          value={d0}
          step={0.5}
          onChange={setD0}
        />
        <SliderField
          label="Growth rate g"
          value={gPct}
          min={0}
          max={12}
          step={0.5}
          onChange={setGPct}
          display={pct(g)}
          accent="accent-green"
          danger={gPct >= rPct}
        />
        <SliderField
          label="Required return r"
          value={rPct}
          min={1}
          max={20}
          step={0.5}
          onChange={setRPct}
          display={pct(r)}
          accent="accent-cyan"
        />
      </div>

      {/* Invalid warning */}
      {invalid && (
        <div className="mt-5 rounded-xl border border-accent-red/40 bg-accent-red/10 p-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-accent-red/60 px-2 py-0.5 font-sans text-[11px] uppercase tracking-[0.14em] text-accent-red">
              <span className="mr-1" aria-hidden>
                !
              </span>
              Model invalid
            </span>
          </div>
          <p className="ops-body mt-2.5 text-[15px] leading-7 text-slate-100">
            The model is invalid when g ≥ r. The constant-growth perpetuity
            formula P₀ = D₁ / (r − g) requires r &gt; g. A growth rate equal to
            or above the required return does not mean the stock is worthless —
            it means this particular formula cannot be applied. You would need a
            different model (for example, multi-stage growth).
          </p>
        </div>
      )}

      {/* Output cards (only when valid) */}
      {!invalid && p0 !== null && dividendYield !== null && totalReturn !== null && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OutputCard
              label="Next dividend D₁"
              sub={`${money(d0)} × (1 + ${pct(g)})`}
              value={money(d1)}
              tone="green"
            />
            <OutputCard
              label="Estimated value P₀"
              sub={`${money(d1)} ÷ (${pct(r)} − ${pct(g)})`}
              value={money(p0)}
              tone="cyan"
              highlight
            />
            <OutputCard
              label="Dividend yield"
              sub={`${money(d1)} ÷ ${money(p0)}`}
              value={pct(dividendYield)}
              tone="green"
            />
            <OutputCard
              label="Expected total return"
              sub={`${pct(dividendYield)} + ${pct(g)}`}
              value={pct(totalReturn)}
              tone="cyan"
              highlight
            />
          </div>

          <div className="mt-5 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-4">
            <div className="ops-caption text-[11px] text-accent-cyan">
              Return decomposition
            </div>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
              Expected total return = dividend yield + growth ={" "}
              <span className="font-sans text-accent-green">
                {pct(dividendYield)}
              </span>{" "}
              +{" "}
              <span className="font-sans text-accent-green">{pct(g)}</span> ={" "}
              <span className="font-sans text-accent-cyan">
                {pct(totalReturn)}
              </span>
              . Under Gordon, price grows at g, so the capital-gains yield equals
              g.
            </p>
          </div>
        </>
      )}

      {/* Sensitivity strip */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="ops-caption text-[11px] text-slate-400">
          Sensitivity: P₀ as g approaches r (D₀ = {money(d0)}, r = {pct(r)})
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse text-left">
            <thead>
              <tr className="text-[12px] text-slate-400">
                <th className="border-b border-white/10 pb-2 pr-4 font-sans font-normal">
                  g
                </th>
                <th className="border-b border-white/10 pb-2 pr-4 font-sans font-normal">
                  r − g
                </th>
                <th className="border-b border-white/10 pb-2 pr-4 font-sans font-normal">
                  P₀
                </th>
                <th className="border-b border-white/10 pb-2 font-sans font-normal">
                  bar
                </th>
              </tr>
            </thead>
            <tbody className="font-sans text-[13px]">
              {sensitivity.map((row) => {
                const isCurrent = Math.abs(row.gPct - gPct) < 0.01;
                const rg = rPct - row.gPct;
                return (
                  <tr
                    key={row.gPct}
                    className={cn(
                      isCurrent && "bg-accent-cyan/[0.08]",
                    )}
                  >
                    <td className="py-1.5 pr-4 text-slate-300">{pct(row.gPct / 100, 0)}</td>
                    <td className="py-1.5 pr-4 text-slate-300">{pct(rg / 100, 0)}</td>
                    <td className={cn("py-1.5 pr-4", isCurrent ? "text-accent-cyan" : "text-slate-200")}>
                      {row.p0 !== null ? money(row.p0) : "—"}
                    </td>
                    <td className="py-1.5">
                      <div className="h-2 w-28 overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            isCurrent ? "bg-accent-cyan" : "bg-slate-500",
                          )}
                          animate={{
                            width: `${Math.min((row.p0 ?? 0) / Math.max(...sensitivity.map((s) => s.p0 ?? 0), 1) * 100, 100)}%`,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
          Notice how P₀ grows rapidly as g approaches r. A small change in the{" "}
          r − g gap produces a large change in value. That is why realistic
          long-run growth assumptions matter so much.
        </p>
      </div>

      {/* Side-by-side comparison */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="ops-caption text-[11px] text-slate-400">
          Compare two assumption sets
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Scenario A */}
          <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-4">
            <div className="ops-caption text-[11px] text-accent-cyan">
              Scenario A
            </div>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-[12px]">
                <NumberField
                  label="D₀"
                  value={d0}
                  step={0.5}
                  onChange={setD0}
                />
                <SliderField
                  label="g"
                  value={gPct}
                  min={0}
                  max={12}
                  step={0.5}
                  onChange={setGPct}
                  display={pct(g, 0)}
                  accent="accent-green"
                  danger={gPct >= rPct}
                />
                <SliderField
                  label="r"
                  value={rPct}
                  min={1}
                  max={20}
                  step={0.5}
                  onChange={setRPct}
                  display={pct(r, 0)}
                  accent="accent-cyan"
                />
              </div>
              <div className="border-t border-white/10 pt-3">
                {invalid ? (
                  <p className="font-sans text-[13px] text-accent-red">
                    Invalid: g ≥ r
                  </p>
                ) : (
                  <p className="font-sans text-[15px] text-accent-cyan">
                    P₀ = {money(p0 ?? 0)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Scenario B */}
          <div className="rounded-xl border border-accent-purple/25 bg-accent-purple/[0.04] p-4">
            <div className="ops-caption text-[11px] text-accent-purple">
              Scenario B
            </div>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-[12px]">
                <NumberField
                  label="D₀"
                  value={d0b}
                  step={0.5}
                  onChange={setD0b}
                />
                <SliderField
                  label="g"
                  value={gPctB}
                  min={0}
                  max={12}
                  step={0.5}
                  onChange={setGPctB}
                  display={pct(gb, 0)}
                  accent="accent-green"
                  danger={gPctB >= rPctB}
                />
                <SliderField
                  label="r"
                  value={rPctB}
                  min={1}
                  max={20}
                  step={0.5}
                  onChange={setRPctB}
                  display={pct(rb, 0)}
                  accent="accent-purple"
                />
              </div>
              <div className="border-t border-white/10 pt-3">
                {invalidB ? (
                  <p className="font-sans text-[13px] text-accent-red">
                    Invalid: g ≥ r
                  </p>
                ) : (
                  <p className="font-sans text-[15px] text-accent-purple">
                    P₀ = {money(p0b ?? 0)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
          {!invalid && !invalidB && p0 !== null && p0b !== null && yieldB !== null && dividendYield !== null ? (
            <>
              Scenario A values the stock at{" "}
              <span className="font-sans text-accent-cyan">{money(p0)}</span> on
              a {pct(r)} required return and {pct(g)} growth. Scenario B values
              it at{" "}
              <span className="font-sans text-accent-purple">{money(p0b)}</span>{" "}
              — the difference comes entirely from the assumptions, not the
              formula.
            </>
          ) : (
            <>
              Adjust both scenarios so that r &gt; g in each. The same formula
              can produce very different values from different, plausible
              assumptions.
            </>
          )}
        </p>
      </div>
    </InteractiveFrame>
  );
}

function NumberField({
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
        className="mt-1.5 w-full rounded-md border border-white/10 bg-ink-950/60 px-2.5 py-1.5 font-sans text-[14px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
      />
    </label>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  accent,
  display,
  danger,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accent: string;
  display: string;
  danger?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-1">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span
          className={cn(
            "font-sans text-[12px]",
            danger ? "text-accent-red" : "text-slate-200",
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
        aria-label={label}
        className={cn("mt-1.5 w-full", accent)}
      />
    </div>
  );
}

function OutputCard({
  label,
  sub,
  value,
  tone,
  highlight,
}: {
  label: string;
  sub: string;
  value: string;
  tone: "green" | "cyan";
  highlight?: boolean;
}) {
  const toneText = {
    green: "text-accent-green",
    cyan: "text-accent-cyan",
  }[tone];
  const toneBorder = {
    green: "border-accent-green/30",
    cyan: "border-accent-cyan/30",
  }[tone];
  return (
    <motion.div
      layout
      className={cn("rounded-xl border bg-white/[0.02] p-4", toneBorder)}
    >
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-sans text-[20px]", highlight ? toneText : "text-slate-100")}>
        {value}
      </div>
      <div className="ops-caption mt-1 font-sans text-[11px] text-slate-500">
        {sub}
      </div>
    </motion.div>
  );
}
