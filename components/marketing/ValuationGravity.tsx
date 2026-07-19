"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import { valuationScenarios } from "@/data/marketing";
import { cn } from "@/lib/utils";

export default function ValuationGravity() {
  const [active, setActive] = useState(valuationScenarios[1].key);
  const scenario = valuationScenarios.find((s) => s.key === active)!;

  // Force magnitudes (normalized 0..1) for the visual.
  const growthForce = scenario.growth / 16;
  const rateForce = (scenario.discount - 6) / 6;
  const multipleForce = (scenario.terminalMultiple - 14) / 18;

  const upForce = (growthForce + multipleForce) / 2;
  const downForce = rateForce;

  // Net force determines the value orb's vertical position on the scale.
  // Positive net = value pulled up; negative = pulled down.
  const netForce = upForce - downForce;
  const orbY = -netForce * 90; // px offset within the scale

  const tone =
    scenario.key === "bull" ? "green" : scenario.key === "bear" ? "red" : "amber";
  const orbColor = { green: "#34d399", red: "#f87171", amber: "#fbbf24" }[tone];

  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(251,191,36,0.07),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Centered header — varied layout, not text-left/card-right */}
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel index="06" eyebrow="Valuation is a force system" tone="amber" className="justify-center" />
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Value is expectations, cash flows, and required return.
          </h2>
          <p className="mt-5 text-balance text-slate-300">
            Growth pulls value up. Risk and interest rates pull it down. Cash flow stabilizes. Change an assumption —
            the implied value moves.
          </p>
        </div>

        {/* Scenario chips — centered */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {valuationScenarios.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={cn(
                "rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.16em] transition-all",
                active === s.key
                  ? s.key === "bull"
                    ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                    : s.key === "bear"
                      ? "border-accent-red/50 bg-accent-red/10 text-accent-red"
                      : "border-accent-amber/50 bg-accent-amber/10 text-accent-amber"
                  : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Force system — full-width scale */}
        <div className="mt-12">
          <div className="glass-panel relative overflow-hidden p-6 sm:p-10">
            <div className="mb-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <span>Valuation gravity · implied value</span>
              <span className="text-accent-amber">FORCE SYSTEM</span>
            </div>

            {/* The scale: a vertical track with the value orb that moves up/down */}
            <div className="relative mx-auto h-80 max-w-3xl">
              {/* vertical track */}
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-accent-green/30 via-white/10 to-accent-red/30" />

              {/* up arrow + label (top) */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 text-center">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-green">↑ Growth + Multiple</div>
                <ForceBar strength={upForce} color="#34d399" direction="up" />
              </div>

              {/* down arrow + label (bottom) */}
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 text-center">
                <ForceBar strength={downForce} color="#f87171" direction="down" />
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-red">↓ Rates + Risk</div>
              </div>

              {/* value orb — moves along the track based on net force */}
              <motion.div
                animate={{ y: orbY }}
                transition={{ type: "spring", stiffness: 80, damping: 14 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 bg-ink-950/80 backdrop-blur-sm sm:h-32 sm:w-32"
                  style={{ borderColor: orbColor, boxShadow: `0 0 50px -8px ${orbColor}` }}
                >
                  <div className="text-center">
                    <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">Implied</div>
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={scenario.key}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.35 }}
                        className="text-2xl font-semibold sm:text-3xl"
                        style={{ color: orbColor }}
                      >
                        ${scenario.impliedValue}B
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {/* orbit ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border"
                    style={{ borderColor: orbColor }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.div>

              {/* side stabilizer: cash flow */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-cyan">Cash flow →</div>
                <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-accent-cyan/40" />
                <div className="mt-1 font-mono text-[9px] text-slate-500">stabilizes</div>
              </div>
            </div>

            {/* assumption readout + interpretation */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">Assumptions</div>
                <div className="mt-2 space-y-1.5 font-mono text-xs text-slate-400">
                  <Row label="Growth" value={`${scenario.growth}%`} tone="up" />
                  <Row label="Discount rate" value={`${scenario.discount}%`} tone="down" />
                  <Row label="Terminal multiple" value={`${scenario.terminalMultiple}x`} tone="up" />
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">Interpretation</div>
                <div className="mt-2 text-sm text-slate-300">{scenario.note}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: "up" | "down" }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
      <span className="text-slate-400">{label}</span>
      <span className={tone === "up" ? "text-accent-green" : "text-accent-red"}>{value}</span>
    </div>
  );
}

function ForceBar({
  strength,
  color,
  direction,
}: {
  strength: number;
  color: string;
  direction: "up" | "down";
}) {
  const len = 8 + Math.max(0, Math.min(1, strength)) * 40;
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: len }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-1 rounded-full"
      style={{ background: `linear-gradient(${direction === "up" ? "to top" : "to bottom"}, ${color}, transparent)` }}
    />
  );
}
