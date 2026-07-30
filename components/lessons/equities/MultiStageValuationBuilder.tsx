"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag } from "./shared";
import { MathText } from "@/components/ui/MathText";

/**
 * Lesson 4.4 — Multi-Stage Valuation Builder.
 *
 * P₀ = Σ Dₜ/(1+r)ᵗ + TV_N/(1+r)ᴺ, with TV_N = D_{N+1}/(r − g_S).
 *
 * Learner sets D₀, the number of high-growth years N, the high-growth
 * rate g_H, the stable growth rate g_S, and the cost of equity r. The
 * builder produces a year-by-year dividend table, the terminal value,
 * and the present-value decomposition. It refuses to compute a terminal
 * value when g_S ≥ r (the Gordon model is invalid there) and shows a
 * red warning instead.
 */

const money = (v: number) =>
  isFinite(v)
    ? v.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      })
    : "—";

const money2 = (v: number) =>
  isFinite(v)
    ? v.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";

const pct = (v: number, digits = 1) =>
  isFinite(v) ? `${(v * 100).toFixed(digits)}%` : "—";

interface Row {
  t: number;
  dividend: number;
  pv: number;
}

function buildRows(d0: number, n: number, gH: number, r: number): Row[] {
  const rows: Row[] = [];
  for (let t = 1; t <= n; t++) {
    const dividend = d0 * Math.pow(1 + gH, t);
    const pv = dividend / Math.pow(1 + r, t);
    rows.push({ t, dividend, pv });
  }
  return rows;
}

export default function MultiStageValuationBuilder() {
  const reduce = useReducedMotion();
  const [d0, setD0] = useState(1);
  const [n, setN] = useState(7);
  const [gHPct, setGHPct] = useState(6);
  const [gSPct, setGSPct] = useState(0);
  const [rPct, setRPct] = useState(20);

  const gH = gHPct / 100;
  const gS = gSPct / 100;
  const r = rPct / 100;

  const invalid = gS >= r;

  const rows = buildRows(d0, n, gH, r);
  const pvDividends = rows.reduce((acc, row) => acc + row.pv, 0);

  // D_{N+1} = D_N * (1 + g_S)
  const dN = rows.length > 0 ? rows[rows.length - 1].dividend : 0;
  const dNplus1 = invalid ? NaN : dN * (1 + gS);
  const tvN = invalid ? NaN : dNplus1 / (r - gS);
  const pvTV = invalid ? NaN : tvN / Math.pow(1 + r, n);
  const total = invalid ? NaN : pvDividends + pvTV;
  const tvShare = invalid || total <= 0 ? NaN : pvTV / total;

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Multi-stage valuation builder
          </span>
        </div>
        <span className="ops-caption font-sans text-[11px] text-slate-500">
          <MathText>P₀ = Σ Dₜ/(1+r)ᵗ + TV_N/(1+r)ᴺ</MathText>
        </span>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Value a company through growth and maturity
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Set the most recent dividend{" "}
        <span className="text-slate-50">D₀</span>, the number of high-growth
        years <span className="text-slate-50">N</span>, the high-growth rate{" "}
        <span className="text-slate-50"><MathText>g_H</MathText></span>, the stable growth rate{" "}
        <span className="text-slate-50"><MathText>g_S</MathText></span>, and the cost of equity{" "}
        <span className="text-slate-50">r</span>. The builder forecasts each
        dividend, attaches a Gordon terminal value at year N, and discounts
        everything back to today.
      </p>

      {/* Inputs */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <NumberField
          label="Most recent dividend D₀"
          value={d0}
          step={0.25}
          onChange={setD0}
        />
        <NumberField
          label="High-growth years N"
          value={n}
          step={1}
          onChange={setN}
        />
        <SliderField
          label="High-growth rate g_H"
          value={gHPct}
          min={0}
          max={20}
          step={0.5}
          onChange={setGHPct}
          display={pct(gH)}
          accent="accent-green"
        />
        <SliderField
          label="Stable growth rate g_S"
          value={gSPct}
          min={0}
          max={12}
          step={0.5}
          onChange={setGSPct}
          display={pct(gS)}
          accent="accent-amber"
          danger={gSPct >= rPct}
        />
        <SliderField
          label="Cost of equity r"
          value={rPct}
          min={1}
          max={25}
          step={0.5}
          onChange={setRPct}
          display={pct(r)}
          accent="accent-cyan"
        />
      </div>

      {/* Invalid warning */}
      {invalid && (
        <div className="mt-5 rounded-xl border border-accent-red/40 bg-accent-red/10 p-5">
          <div className="ops-caption text-[11px] uppercase tracking-[0.14em] text-accent-red">
            <span className="mr-1" aria-hidden>
              !
            </span>
            Terminal value invalid
          </div>
          <p className="ops-body mt-2.5 text-[15px] leading-7 text-slate-100">
            The Gordon terminal value requires{" "}
            <span className="text-accent-cyan">g_S &lt; r</span>. When the
            stable growth rate equals or exceeds the cost of equity, the
            perpetuity does not converge and no terminal value can be computed.
            Lower g_S or raise r to continue.
          </p>
        </div>
      )}

      {/* Results */}
      {!invalid && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 space-y-5"
        >
          {/* Dividend forecast table */}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="text-[12px] text-slate-400">
                  <th className="border-b border-white/15 px-4 py-2 font-sans font-normal">
                    Year t
                  </th>
                  <th className="border-b border-white/15 px-4 py-2 font-sans font-normal">
                    Dividend Dₜ
                  </th>
                  <th className="border-b border-white/15 px-4 py-2 font-sans font-normal">
                    Discount (1+r)ᵗ
                  </th>
                  <th className="border-b border-white/15 px-4 py-2 font-sans font-normal">
                    PV of Dₜ
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-[14px] text-slate-200">
                {rows.map((row) => (
                  <tr key={row.t} className="odd:bg-white/[0.015]">
                    <td className="px-4 py-1.5">{row.t}</td>
                    <td className="px-4 py-1.5">{money(row.dividend)}</td>
                    <td className="px-4 py-1.5 text-slate-400">
                      {Math.pow(1 + r, row.t).toFixed(4)}
                    </td>
                    <td className="px-4 py-1.5 text-slate-100">
                      {money(row.pv)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-sans text-[14px] text-accent-green">
                  <td className="border-t border-white/15 px-4 py-2" colSpan={3}>
                    PV of explicit dividends (years 1–{n})
                  </td>
                  <td className="border-t border-white/15 px-4 py-2">
                    {money(pvDividends)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Terminal value derivation */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OutputCard
              label={`D_{N+1} = D_${"{N}"} × (1 + g_S)`}
              sub={`${money(dN)} × (1 + ${pct(gS)})`}
              value={money(dNplus1)}
              tone="amber"
            />
            <OutputCard
              label={`TV_N = D_{N+1} / (r − g_S)`}
              sub={`${money(dNplus1)} ÷ (${pct(r)} − ${pct(gS)})`}
              value={money2(tvN)}
              tone="amber"
            />
            <OutputCard
              label={`PV of TV = TV_N / (1+r)ᴺ`}
              sub={`${money2(tvN)} ÷ ${(1 + r).toFixed(2)}^${n}`}
              value={money2(pvTV)}
              tone="amber"
            />
            <OutputCard
              label="Total value P₀"
              sub={`${money(pvDividends)} + ${money2(pvTV)}`}
              value={money2(total)}
              tone="cyan"
              highlight
            />
          </div>

          {/* Terminal share bar */}
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Share of value from terminal value
              </div>
              <span className="font-sans text-[14px] text-slate-100">
                {pct(tvShare, 1)}
              </span>
            </div>
            <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
              <motion.div
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${(pvDividends / total) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-accent-green/70"
                aria-hidden
              />
              <motion.div
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${(pvTV / total) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                className="bg-accent-amber/70"
                aria-hidden
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 font-sans text-[12px] text-slate-300">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent-green/70" aria-hidden />
                PV of dividends {pct(pvDividends / total, 1)}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent-amber/70" aria-hidden />
                PV of terminal {pct(tvShare, 1)}
              </span>
            </div>
            <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
              Terminal value often represents a large share of total value
              because it bundles every dividend from year {n + 1} onward into a
              single perpetuity. The further out the horizon, the larger this
              share tends to be.
            </p>
          </div>
        </motion.div>
      )}
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
        <span className="ops-caption text-[11px] text-slate-400"><MathText>{label}</MathText></span>
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
  tone: "green" | "cyan" | "amber";
  highlight?: boolean;
}) {
  const toneText = {
    green: "text-accent-green",
    cyan: "text-accent-cyan",
    amber: "text-accent-amber",
  }[tone];
  const toneBorder = {
    green: "border-accent-green/30",
    cyan: "border-accent-cyan/30",
    amber: "border-accent-amber/30",
  }[tone];
  return (
    <motion.div
      layout
      className={cn("rounded-xl border bg-white/[0.02] p-4", toneBorder)}
    >
      <div className="ops-caption font-sans text-[11px] text-slate-400">
        <MathText>{label}</MathText>
      </div>
      <div
        className={cn(
          "mt-1 font-sans text-[18px]",
          highlight ? toneText : "text-slate-100",
        )}
      >
        {value}
      </div>
      <div className="ops-caption mt-1 font-sans text-[11px] text-slate-500">
        {sub}
      </div>
    </motion.div>
  );
}
