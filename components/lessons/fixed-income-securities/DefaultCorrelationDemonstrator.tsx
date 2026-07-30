"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";

/**
 * Section 12 — Default correlation demonstrator.
 * 20 loan dots. Independent mode: defaults scatter randomly. Correlated mode:
 * many defaults cluster together. As correlation / common shock rises,
 * diversification fails and losses jump through to the senior tranche.
 *
 * Uses a seeded RNG so re-rolling produces a fresh but stable scenario.
 */
const N_LOANS = 20;

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Loan = { id: number; defaulted: boolean };

export default function DefaultCorrelationDemonstrator() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"independent" | "correlated">("independent");
  const [pDefault, setPDefault] = useState(20); // %
  const [correlation, setCorrelation] = useState(50); // %
  const [seed, setSeed] = useState(1);

  const loans: Loan[] = useMemo(() => {
    const rng = mulberry32(seed * 7919 + 1);
    const p = pDefault / 100;
    const corr = correlation / 100;
    // Common shock: with probability = corr, a systemic event forces defaults.
    const commonShock = rng() < corr * Math.max(p, 0.1);
    return Array.from({ length: N_LOANS }, (_, i) => {
      let defaulted: boolean;
      if (mode === "independent") {
        defaulted = rng() < p;
      } else {
        // correlated: if common shock fires, most loans default; else idiosyncratic
        if (commonShock) {
          defaulted = rng() < 0.5 + p; // systemic → many default
        } else {
          defaulted = rng() < p * (1 - corr); // idiosyncratic, reduced
        }
      }
      return { id: i, defaulted };
    });
  }, [mode, pDefault, correlation, seed]);

  const nDefaults = loans.filter((l) => l.defaulted).length;
  const lossPerDefault = 100 / N_LOANS; // each default is 5% of pool
  const poolLossPct = (nDefaults / N_LOANS) * 100;

  // tranche absorption
  const juniorCapacity = 15; // % of pool
  const mezzCapacity = 25;
  const juniorLoss = Math.min(poolLossPct, juniorCapacity);
  const mezzLoss = Math.min(Math.max(poolLossPct - juniorCapacity, 0), mezzCapacity);
  const seniorLoss = Math.max(poolLossPct - juniorCapacity - mezzCapacity, 0);
  const seniorHit = seniorLoss > 0;

  return (
    <div className="space-y-6">
      <DefinitionCard term="Diversification depends on correlation">
        Pooling many loans reduces risk only when defaults are independent. If
        defaults are driven by a common shock — a recession, a housing crash —
        they cluster together. Then diversification disappears exactly when it
        is needed most, and losses punch through to the senior tranche.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Default correlation demonstrator
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Re-roll
          </button>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          20 loans, two worlds
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Toggle between independent and correlated defaults. In independent
          mode, defaults scatter and Junior absorbs them. In correlated mode,
          defaults cluster and losses can jump straight to Senior.
        </p>

        {/* Mode toggle */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("independent")}
            aria-pressed={mode === "independent"}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              mode === "independent"
                ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                : "border-white/15 text-slate-300 hover:bg-white/5",
            )}
          >
            Independent
          </button>
          <button
            type="button"
            onClick={() => setMode("correlated")}
            aria-pressed={mode === "correlated"}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              mode === "correlated"
                ? "border-accent-red/60 bg-accent-red/15 text-accent-red"
                : "border-white/15 text-slate-300 hover:bg-white/5",
            )}
          >
            Correlated
          </button>
        </div>

        {/* Loan dots */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="grid min-w-[480px] grid-cols-5 gap-2 sm:grid-cols-10">
            {loans.map((l) => (
              <motion.div
                key={l.id}
                initial={reduce ? false : { scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, delay: reduce ? 0 : l.id * 0.01 }}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg border font-sans text-[12px]",
                  l.defaulted
                    ? "border-accent-red/60 bg-accent-red/20 text-accent-red"
                    : "border-accent-green/30 bg-accent-green/[0.06] text-accent-green",
                )}
              >
                {l.defaulted ? "✕" : "•"}
              </motion.div>
            ))}
          </div>
          <div className="ops-caption mt-3 text-[11px] text-slate-500">
            {nDefaults} of {N_LOANS} loans defaulted · pool loss {poolLossPct.toFixed(0)}%
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
            <div className="flex items-center justify-between">
              <span className="ops-caption text-[11px] text-slate-400">
                Default probability (per loan)
              </span>
              <span className="font-sans text-[13px] text-accent-amber">
                {pDefault}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={1}
              value={pDefault}
              onChange={(e) => setPDefault(Number(e.target.value))}
              aria-label="Default probability per loan"
              className="mt-4 w-full accent-accent-amber"
            />
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
            <div className="flex items-center justify-between">
              <span className="ops-caption text-[11px] text-slate-400">
                Correlation / common shock
              </span>
              <span
                className={cn(
                  "font-sans text-[13px]",
                  correlation > 60
                    ? "text-accent-red"
                    : correlation > 30
                      ? "text-accent-amber"
                      : "text-accent-green",
                )}
              >
                {correlation}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={correlation}
              onChange={(e) => setCorrelation(Number(e.target.value))}
              aria-label="Default correlation"
              className="mt-4 w-full accent-accent-red"
              disabled={mode === "independent"}
            />
            {mode === "independent" && (
              <p className="ops-caption mt-2 text-[11px] text-slate-500">
                Disabled in independent mode.
              </p>
            )}
          </div>
        </div>

        {/* Tranche absorption */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <AbsorbCard name="Junior" loss={juniorLoss} capacity={juniorCapacity} tone="red" reduce={reduce} />
          <AbsorbCard name="Mezzanine" loss={mezzLoss} capacity={mezzCapacity} tone="amber" reduce={reduce} />
          <AbsorbCard name="Senior" loss={seniorLoss} capacity={60} tone="green" reduce={reduce} hit={seniorHit} />
        </div>

        {/* Takeaway */}
        <AnimatePresence mode="wait">
          <motion.div
            key={seniorHit ? "hit" : "ok"}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "mt-6 rounded-xl border p-5",
              seniorHit
                ? "border-accent-red/40 bg-accent-red/[0.08]"
                : "border-accent-green/30 bg-accent-green/[0.06]",
            )}
          >
            <div
              className={cn(
                "ops-caption text-[11px] uppercase tracking-[0.14em]",
                seniorHit ? "text-accent-red" : "text-accent-green",
              )}
            >
              {seniorHit ? "Senior breached" : "Senior protected"}
            </div>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
              Diversification works when defaults are not all driven by the same
              shock. When correlation rises, diversification can disappear
              exactly when it is needed most.
            </p>
          </motion.div>
        </AnimatePresence>
      </InteractiveFrame>
    </div>
  );
}

function AbsorbCard({
  name,
  loss,
  capacity,
  tone,
  reduce,
  hit = false,
}: {
  name: string;
  loss: number;
  capacity: number;
  tone: "red" | "amber" | "green";
  reduce: boolean | null;
  hit?: boolean;
}) {
  const fill = {
    red: "bg-accent-red",
    amber: "bg-accent-amber",
    green: "bg-accent-green",
  }[tone];
  const text = {
    red: "text-accent-red",
    amber: "text-accent-amber",
    green: "text-accent-green",
  }[tone];
  const pct = Math.min(100, (loss / capacity) * 100);
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[13px] text-slate-200">{name}</span>
        <span className={cn("font-sans text-[12px]", text)}>
          {loss.toFixed(0)} / {capacity}
        </span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.3 }}
          className={cn("h-full rounded-full", fill)}
        />
      </div>
      <div className="ops-caption mt-2 text-[11px] text-slate-500">
        {tone === "green"
          ? hit
            ? "Breached — losses reached senior"
            : "Protected"
          : loss >= capacity
            ? "Exhausted"
            : "Absorbing losses"}
      </div>
    </div>
  );
}
