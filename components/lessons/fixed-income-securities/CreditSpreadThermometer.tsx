"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";

/**
 * Section 5 — Credit spread thermometer.
 * Stylized teaching chart (NOT current data) showing how credit spreads have
 * moved across historical episodes. A regime slider (Easy / Normal / Stress /
 * Panic) widens or narrows the spread and updates the interpretation.
 */
type Regime = "easy" | "normal" | "stress" | "panic";

const REGIMES: { id: Regime; label: string; spread: number; color: string }[] = [
  { id: "easy", label: "Easy credit", spread: 30, color: "bg-accent-green" },
  { id: "normal", label: "Normal", spread: 60, color: "bg-accent-cyan" },
  { id: "stress", label: "Stress", spread: 120, color: "bg-accent-amber" },
  { id: "panic", label: "Panic", spread: 220, color: "bg-accent-red" },
];

// Stylized historical episodes (teaching only, not data)
const EPISODES: { year: string; label: string; height: number; note: string }[] = [
  { year: "1930s", label: "Great Depression", height: 90, note: "High — broad default and banking stress." },
  { year: "1987", label: "Crash", height: 35, note: "Blip — short-lived liquidity shock." },
  { year: "1998", label: "LTCM", height: 45, note: "Blip — concentrated counterparty fear." },
  { year: "2001", label: "Recession", height: 60, note: "Widening — recession and credit deterioration." },
  { year: "2005", label: "Boom", height: 18, note: "Low — easy credit compressed spreads." },
  { year: "2006", label: "Peak boom", height: 15, note: "Low — risk priced very cheaply." },
];

const INTERPRETATION: Record<Regime, string> = {
  easy: "Investors demand little extra compensation. Spreads are tight and credit is plentiful. Risk feels absent — which is itself a risk.",
  normal: "Spreads compensate for expected default loss plus a moderate risk premium. Markets function, credit is reasonably available.",
  stress: "Investors demand more compensation for credit, liquidity, and risk aversion. Spreads widen as default fear rises.",
  panic: "Spreads blow out. Liquidity vanishes, risk aversion spikes, and even sound issuers may be priced for trouble.",
};

export default function CreditSpreadThermometer() {
  const reduce = useReducedMotion();
  const [regime, setRegime] = useState<Regime>("normal");
  const current = REGIMES.find((r) => r.id === regime)!;

  return (
    <div className="space-y-6">
      <DefinitionCard term="The credit spread thermometer">
        A credit spread is the extra yield a corporate bond offers over a
        comparable Treasury. It widens when investors fear default, illiquidity,
        or risk aversion — and narrows when credit feels safe. The spread is a
        market price, and like other prices it tells a story about fear and
        compensation.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Credit spread thermometer
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            Pick a regime to move the spread
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Spreads breathe with fear
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Below is a stylized teaching chart of how credit spreads behaved in
          notable episodes. Switch regimes to see how the spread widens or
          narrows.
        </p>

        {/* Regime selector */}
        <div className="mt-6 flex flex-wrap gap-2">
          {REGIMES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRegime(r.id)}
              aria-pressed={regime === r.id}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                regime === r.id
                  ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                  : "border-white/15 text-slate-300 hover:bg-white/5",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Current spread meter */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="flex items-center justify-between">
            <span className="ops-caption text-[11px] text-slate-400">
              Current regime spread (stylized)
            </span>
            <motion.span
              key={regime}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "rounded-full border px-3 py-1 font-sans text-[13px]",
                regime === "easy"
                  ? "border-accent-green/50 text-accent-green"
                  : regime === "normal"
                    ? "border-accent-cyan/50 text-accent-cyan"
                    : regime === "stress"
                      ? "border-accent-amber/50 text-accent-amber"
                      : "border-accent-red/50 text-accent-red",
              )}
            >
              {current.spread} bps
            </motion.span>
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
            <motion.div
              initial={false}
              animate={{ width: `${(current.spread / 250) * 100}%` }}
              transition={reduce ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
              className={cn("h-full rounded-full", current.color)}
            />
          </div>
        </div>

        {/* Historical episodes chart */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Stylized episodes (teaching only)
          </div>
          <div className="mt-4 flex min-w-[520px] items-end justify-between gap-3">
            {EPISODES.map((e) => (
              <div key={e.year} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={false}
                  animate={{ height: e.height * 1.4 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.4 }}
                  className={cn(
                    "w-full rounded-t",
                    e.height > 70
                      ? "bg-accent-red/70"
                      : e.height > 45
                        ? "bg-accent-amber/70"
                        : "bg-accent-green/60",
                  )}
                  title={e.note}
                />
                <span className="font-sans text-[11px] text-slate-400">
                  {e.year}
                </span>
                <span className="ops-caption text-[10px] text-slate-500">
                  {e.label}
                </span>
              </div>
            ))}
          </div>
          <div className="ops-caption mt-4 text-[11px] text-slate-500">
            Stylized teaching chart based on MIT 15.401 credit-spread
            discussion. Not current market data.
          </div>
        </div>

        {/* Interpretation */}
        <div className="mt-6 rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
          <div className="ops-caption text-[11px] text-accent-amber">
            Interpretation · {current.label}
          </div>
          <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
            {INTERPRETATION[regime]}
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}
