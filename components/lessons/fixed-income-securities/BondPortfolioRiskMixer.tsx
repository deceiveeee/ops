"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";
import {
  portfolioDuration,
  portfolioConvexity,
  formatMoney,
  formatPercent,
} from "@/lib/fixed-income";

/**
 * Lesson 3.3 — Bond portfolio risk mixer.
 * Three bonds A, B, C with market values, modified durations, and convexities.
 * Outputs portfolio MV, weights, weighted modified duration, weighted
 * convexity, and estimated price impact from a yield shock. The long-duration
 * bond stretches the risk bar.
 */

type Bond = {
  key: string;
  name: string;
  tone: "cyan" | "amber" | "purple";
  mv: number;
  modDur: number;
  conv: number;
};

const DEFAULTS: Bond[] = [
  { key: "A", name: "Short bond", tone: "cyan", mv: 50000, modDur: 1.8, conv: 4.0 },
  { key: "B", name: "Medium bond", tone: "amber", mv: 30000, modDur: 5.2, conv: 25.0 },
  { key: "C", name: "Long bond", tone: "purple", mv: 20000, modDur: 9.0, conv: 90.0 },
];

export default function BondPortfolioRiskMixer() {
  const reduce = useReducedMotion();
  const [bonds, setBonds] = useState<Bond[]>(DEFAULTS);
  const [bps, setBps] = useState(100);

  const totalMV = bonds.reduce((s, b) => s + b.mv, 0);
  const weights = bonds.map((b) => b.mv / totalMV);
  const portDur = portfolioDuration(
    bonds.map((b) => b.mv),
    bonds.map((b) => b.modDur),
  );
  const portConv = portfolioConvexity(
    bonds.map((b) => b.mv),
    bonds.map((b) => b.conv),
  );

  const dy = bps / 10000;
  const pctImpact = -portDur * dy + 0.5 * portConv * dy * dy;
  const dollarImpact = totalMV * pctImpact;

  const setBond = (i: number, patch: Partial<Bond>) =>
    setBonds((bs) => bs.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  return (
    <div className="space-y-6">
      <DefinitionCard term="Portfolio duration and convexity">
        A portfolio&apos;s modified duration and convexity are{" "}
        <span className="text-slate-50">value-weighted averages</span> of the
        holdings. Add a long-duration bond and the whole portfolio stretches —
        even if it is a small slice by count.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Bond portfolio risk mixer
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBonds(DEFAULTS)}
            className="rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Reset
          </button>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Mix the bonds, watch the portfolio risk stretch
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Change each bond&apos;s market value, then shock the whole portfolio.
          The long-duration bond drags the portfolio duration up
          disproportionately.
        </p>

        {/* Bond cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {bonds.map((b, i) => (
            <BondCard
              key={b.key}
              bond={b}
              weight={weights[i]}
              onChange={(patch) => setBond(i, patch)}
            />
          ))}
        </div>

        {/* Risk bar */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-ink-950/50 p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Portfolio composition (by market value)
          </div>
          <div className="mt-3 flex h-8 w-full overflow-hidden rounded-md bg-white/5">
            {bonds.map((b, i) => {
              const color = {
                cyan: "bg-accent-cyan/70",
                amber: "bg-accent-amber/70",
                purple: "bg-accent-purple/70",
              }[b.tone];
              return (
                <motion.div
                  key={b.key}
                  className={cn("h-full", color)}
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${weights[i] * 100}%` }}
                  transition={{ duration: 0.4 }}
                  title={`${b.name}: ${formatPercent(weights[i], 1)}`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[11px] text-slate-400">
            {bonds.map((b, i) => (
              <span key={b.key}>
                {b.key}: {formatPercent(weights[i], 1)}
              </span>
            ))}
          </div>
        </div>

        {/* Shock control */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="flex items-center justify-between">
            <span className="ops-caption text-[11px] text-slate-400">
              Parallel yield shock
            </span>
            <span
              className={cn(
                "font-sans text-[13px]",
                bps >= 0 ? "text-accent-red" : "text-accent-green",
              )}
            >
              {bps >= 0 ? "+" : "−"}
              {Math.abs(bps)} bps
            </span>
          </div>
          <input
            type="range"
            min={-300}
            max={300}
            step={10}
            value={bps}
            onChange={(e) => setBps(Number(e.target.value))}
            aria-label="Parallel yield shock in basis points"
            className="mt-2 w-full accent-accent-amber"
          />
          <div className="mt-1 flex justify-between font-sans text-[11px] text-slate-500">
            <span>−300 bps</span>
            <span>+300 bps</span>
          </div>
        </div>

        {/* Outputs */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <OutCard label="Portfolio MV" value={formatMoney(totalMV)} tone="cyan" />
          <OutCard
            label="Weighted mod. duration"
            value={`${portDur.toFixed(2)} yr`}
            tone="amber"
          />
          <OutCard
            label="Weighted convexity"
            value={portConv.toFixed(1)}
            tone="purple"
          />
          <OutCard
            label="Est. % price impact"
            value={`${pctImpact >= 0 ? "+" : "−"}${formatPercent(Math.abs(pctImpact), 2)}`}
            tone={pctImpact >= 0 ? "green" : "red"}
          />
        </div>

        {/* Dollar impact + summary */}
        <div
          className={cn(
            "mt-5 rounded-xl border p-5",
            dollarImpact >= 0
              ? "border-accent-green/30 bg-accent-green/[0.06]"
              : "border-accent-red/30 bg-accent-red/[0.06]",
          )}
        >
          <div className="ops-caption text-[11px] text-slate-400">
            Estimated dollar impact
          </div>
          <div
            className={cn(
              "mt-1 font-sans text-[26px]",
              dollarImpact >= 0 ? "text-accent-green" : "text-accent-red",
            )}
          >
            {dollarImpact >= 0 ? "+" : "−"}
            {formatMoney(Math.abs(dollarImpact))}
          </div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">
            This portfolio behaves like a bond with approximately{" "}
            <span className="text-accent-amber">
              {portDur.toFixed(2)} modified duration
            </span>{" "}
            and convexity{" "}
            <span className="text-accent-purple">{portConv.toFixed(1)}</span>.
            The long bond (C) is only{" "}
            {formatPercent(weights[2], 0)} of value but contributes most of the
            duration.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function BondCard({
  bond,
  weight,
  onChange,
}: {
  bond: Bond;
  weight: number;
  onChange: (patch: Partial<Bond>) => void;
}) {
  const accent = {
    cyan: "text-accent-cyan",
    amber: "text-accent-amber",
    purple: "text-accent-purple",
  }[bond.tone];
  const border = {
    cyan: "border-accent-cyan/30",
    amber: "border-accent-amber/30",
    purple: "border-accent-purple/30",
  }[bond.tone];
  return (
    <div className={cn("rounded-2xl border bg-white/[0.02] p-5", border)}>
      <div className="flex items-center justify-between">
        <span className={cn("ops-caption text-[11px]", accent)}>
          Bond {bond.key} · {bond.name}
        </span>
        <span className="font-sans text-[11px] text-slate-500">
          {formatPercent(weight, 1)}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 font-sans text-[12px] text-slate-400">
        <div>
          modDur <span className="text-slate-200">{bond.modDur.toFixed(1)}</span>
        </div>
        <div>
          conv <span className="text-slate-200">{bond.conv.toFixed(1)}</span>
        </div>
      </div>
      <label className="mt-3 block">
        <span className="ops-caption text-[10px] text-slate-500">
          Market value
        </span>
        <input
          type="range"
          min={0}
          max={100000}
          step={5000}
          value={bond.mv}
          onChange={(e) => onChange({ mv: Number(e.target.value) })}
          aria-label={`Bond ${bond.key} market value`}
          className="mt-2 w-full accent-accent-cyan"
        />
        <div className="mt-1 font-sans text-[13px] text-slate-100">
          {formatMoney(bond.mv)}
        </div>
      </label>
    </div>
  );
}

function OutCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "amber" | "purple" | "green" | "red";
}) {
  const accent = {
    cyan: "text-accent-cyan",
    amber: "text-accent-amber",
    purple: "text-accent-purple",
    green: "text-accent-green",
    red: "text-accent-red",
  }[tone];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-sans text-[18px]", accent)}>{value}</div>
    </div>
  );
}
