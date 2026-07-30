"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";
import { formatMoney } from "@/lib/fixed-income";

/**
 * Lesson 3.3 — Short-sale friction switch.
 * A theoretical arbitrage gap exists between two identical streams. Toggle the
 * friction regime and watch the executable gap close, shrink, or persist.
 *  - Frictionless: gap fully executable.
 *  - Transaction costs: gap shrinks; only survives if larger than costs.
 *  - Short-sale restriction: gap persists but cannot be captured.
 */

type Friction = "none" | "costs" | "restricted";

const THEORETICAL_GAP = 20; // $ of mispricing between identical streams
const TX_COST = 8; // round-trip cost per side

export default function ShortSaleFrictionSwitch() {
  const reduce = useReducedMotion();
  const [friction, setFriction] = useState<Friction>("none");

  const executable =
    friction === "none"
      ? THEORETICAL_GAP
      : friction === "costs"
        ? Math.max(0, THEORETICAL_GAP - TX_COST)
        : 0;

  const blocked = friction === "restricted";

  return (
    <div className="space-y-6">
      <DefinitionCard term="Short sale">
        Selling a security you do{" "}
        <span className="text-slate-50">not</span> own, by borrowing it first.
        Short sales are essential to enforcing the Law of One Price downward:
        they let you sell the expensive side of a mispricing.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Short-sale friction switch
            </span>
          </div>
          <div className="inline-flex rounded-full border border-white/15 bg-ink-950/60 p-1">
            {(
              [
                ["none", "Frictionless"],
                ["costs", "Transaction costs"],
                ["restricted", "Short-sale restriction"],
              ] as [Friction, string][]
            ).map(([f, lbl]) => (
              <button
                key={f}
                type="button"
                aria-pressed={friction === f}
                onClick={() => setFriction(f)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  friction === f
                    ? "bg-accent-purple/15 text-accent-purple"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          What survives when you actually try to trade?
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          A {formatMoney(THEORETICAL_GAP)} mispricing shows on the screen. Toggle
          the friction and see how much of that gap you can actually capture.
        </p>

        {/* Gap bar */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-ink-950/50 p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Theoretical gap vs executable opportunity
          </div>

          <div className="mt-4 space-y-4">
            <GapBar
              label="Theoretical gap"
              value={THEORETICAL_GAP}
              max={THEORETICAL_GAP}
              tone="amber"
              caption="What the screen shows"
              reduce={reduce}
            />
            <GapBar
              label="Executable opportunity"
              value={executable}
              max={THEORETICAL_GAP}
              tone={executable > 0 ? "green" : "red"}
              caption={
                blocked
                  ? "Blocked — cannot short"
                  : executable > 0
                    ? "Capturable after frictions"
                    : "Eaten by transaction costs"
              }
              reduce={reduce}
              blocked={blocked}
            />
          </div>
        </div>

        {/* Regime explanation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={friction}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "mt-5 rounded-xl border p-5",
              friction === "none"
                ? "border-accent-green/30 bg-accent-green/[0.06]"
                : friction === "costs"
                  ? "border-accent-amber/30 bg-accent-amber/[0.06]"
                  : "border-accent-red/30 bg-accent-red/[0.06]",
            )}
          >
            {friction === "none" && (
              <>
                <div className="ops-caption text-[11px] text-accent-green">
                  Frictionless
                </div>
                <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
                  No costs, no constraints. The full {formatMoney(THEORETICAL_GAP)}{" "}
                  gap is executable. Arbitrageurs sell the expensive side, buy
                  the cheap side, and the gap closes.
                </p>
              </>
            )}
            {friction === "costs" && (
              <>
                <div className="ops-caption text-[11px] text-accent-amber">
                  With transaction costs
                </div>
                <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
                  Round-trip costs of {formatMoney(TX_COST)} eat into the profit.
                  Only {formatMoney(executable)} survives. Small mispricings
                  become <span className="text-slate-50">not worth trading</span>{" "}
                  — the gap can persist inside the cost band.
                </p>
              </>
            )}
            {friction === "restricted" && (
              <>
                <div className="ops-caption text-[11px] text-accent-red">
                  Short-sale restriction
                </div>
                <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
                  You cannot borrow the expensive security to short it. The gap
                  stays visible but{" "}
                  <span className="text-slate-50">cannot be captured</span>. The
                  market enforcement mechanism is disabled.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Professor's note */}
        <div className="mt-5 rounded-xl border border-accent-purple/25 bg-accent-purple/[0.05] p-5">
          <div className="ops-caption text-[11px] text-accent-purple">
            Professor&apos;s note
          </div>
          <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
            When short sales are restricted, one of the mechanisms that enforces
            pricing relationships is{" "}
            <span className="text-accent-purple">on vacation</span>.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function GapBar({
  label,
  value,
  max,
  tone,
  caption,
  reduce,
  blocked,
}: {
  label: string;
  value: number;
  max: number;
  tone: "amber" | "green" | "red";
  caption: string;
  reduce: boolean | null;
  blocked?: boolean;
}) {
  const color =
    tone === "amber"
      ? "bg-accent-amber/70"
      : tone === "green"
        ? "bg-accent-green/70"
        : "bg-accent-red/70";
  const pct = max === 0 ? 0 : (value / max) * 100;
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-slate-300">{label}</span>
        <span className="font-sans text-[13px] text-slate-100">
          {blocked ? "0 (blocked)" : formatMoney(value)}
        </span>
      </div>
      <div className="mt-1.5 h-6 overflow-hidden rounded-md bg-white/5">
        {blocked ? (
          <div className="flex h-full items-center justify-center font-sans text-[11px] text-accent-red">
            ✕ cannot short
          </div>
        ) : (
          <motion.div
            className={cn("h-full rounded-md", color)}
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </div>
      <div className="ops-caption mt-1 text-[11px] text-slate-500">{caption}</div>
    </div>
  );
}
