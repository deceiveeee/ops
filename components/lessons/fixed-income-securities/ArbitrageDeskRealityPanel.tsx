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
 * Lesson 3.3 — Arbitrage desk reality panel.
 * Stack frictions onto a theoretical arbitrage gap and watch the executable
 * opportunity shrink toward zero. Historical story callout: in the 1970s,
 * MIT-trained quants at Salomon Brothers used simultaneous linear equations to
 * find bond mispricings.
 */

type Friction = "none" | "cost" | "short" | "liquidity";

const THEORETICAL = 30; // $ of mispricing
const FRICTION_COST: Record<Friction, number> = {
  none: 0,
  cost: 10,
  short: 8, // additional
  liquidity: 7, // additional
};

const ORDER: Friction[] = ["none", "cost", "short", "liquidity"];

export default function ArbitrageDeskRealityPanel() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<Friction>("none");

  const idx = ORDER.indexOf(active);
  // cumulative frictions applied
  let cumulative = 0;
  for (let i = 1; i <= idx; i++) cumulative += FRICTION_COST[ORDER[i]];
  const executable = Math.max(0, THEORETICAL - cumulative);

  return (
    <div className="space-y-6">
      <DefinitionCard term="Arbitrage in practice">
        Theoretical mispricing is not profit. Each real-world friction —
        transaction costs, short-sale constraints, liquidity — takes a bite out
        of the gap before it reaches your pocket.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Arbitrage desk reality panel
            </span>
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          From theoretical gap to executable opportunity
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          A {formatMoney(THEORETICAL)} mispricing appears. Add frictions one at
          a time and watch how much of the gap survives all the way to a real
          trade.
        </p>

        {/* Friction stack */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-ink-950/50 p-5">
          <div className="flex flex-wrap gap-2">
            {ORDER.map((f, i) => {
              const enabled = i <= idx;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active === f}
                  onClick={() => setActive(f)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                    enabled
                      ? "border-accent-purple/50 bg-accent-purple/15 text-accent-purple"
                      : "border-white/15 text-slate-500 hover:text-slate-300",
                  )}
                >
                  {i === 0
                    ? "No cost"
                    : i === 1
                      ? "+ Transaction cost"
                      : i === 2
                        ? "+ Short-sale constraint"
                        : "+ Liquidity"}
                </button>
              );
            })}
          </div>

          {/* Stacked bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="ops-caption text-[11px] text-slate-400">
                Gap breakdown
              </span>
              <span className="font-mono text-[13px] text-slate-200">
                Executable:{" "}
                <span className="text-accent-green">
                  {formatMoney(executable)}
                </span>
              </span>
            </div>
            <div className="mt-2 flex h-8 w-full overflow-hidden rounded-md bg-white/5">
              <motion.div
                className="bg-accent-green/70"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${(executable / THEORETICAL) * 100}%` }}
                transition={{ duration: 0.4 }}
                title="Executable opportunity"
              />
              {idx >= 1 && (
                <motion.div
                  className="bg-accent-amber/60"
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${(FRICTION_COST.cost / THEORETICAL) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  title="Transaction cost"
                />
              )}
              {idx >= 2 && (
                <motion.div
                  className="bg-accent-red/60"
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${(FRICTION_COST.short / THEORETICAL) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  title="Short-sale constraint"
                />
              )}
              {idx >= 3 && (
                <motion.div
                  className="bg-accent-purple/60"
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${(FRICTION_COST.liquidity / THEORETICAL) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  title="Liquidity cost"
                />
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-slate-400">
              <span>
                <span className="inline-block h-2 w-2 rounded-full bg-accent-green/70" />{" "}
                Executable
              </span>
              <span>
                <span className="inline-block h-2 w-2 rounded-full bg-accent-amber/60" />{" "}
                Tx cost
              </span>
              <span>
                <span className="inline-block h-2 w-2 rounded-full bg-accent-red/60" />{" "}
                Short-sale
              </span>
              <span>
                <span className="inline-block h-2 w-2 rounded-full bg-accent-purple/60" />{" "}
                Liquidity
              </span>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "mt-5 rounded-xl border p-5",
              executable > 0
                ? "border-accent-green/30 bg-accent-green/[0.06]"
                : "border-accent-red/30 bg-accent-red/[0.06]",
            )}
          >
            <div
              className={cn(
                "ops-caption text-[11px]",
                executable > 0 ? "text-accent-green" : "text-accent-red",
              )}
            >
              Executable opportunity?
            </div>
            <div className="ops-body-strong mt-1 text-[18px] text-slate-50">
              {executable > 0
                ? `${formatMoney(executable)} of the gap survives`
                : "The gap is real but not tradeable"}
            </div>
            <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
              {active === "none" &&
                "No frictions. The full theoretical gap is executable and arbitrageurs will close it."}
              {active === "cost" &&
                "Transaction costs bite. Only mispricings larger than the cost band get traded."}
              {active === "short" &&
                "Short-sale constraints block one side. The expensive security cannot be sold, so the gap persists uncaptured."}
              {active === "liquidity" &&
                "Liquidity dries up. Even when the math works, you cannot move size without moving the price against yourself."}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Story callout */}
        <div className="mt-5 rounded-xl border border-accent-purple/25 bg-accent-purple/[0.05] p-5">
          <div className="ops-caption text-[11px] text-accent-purple">
            From the desk
          </div>
          <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
            In the <span className="text-slate-50">1970s</span>, MIT-trained
            quants at{" "}
            <span className="text-accent-purple">Salomon Brothers</span> used
            simultaneous linear equations to find bond mispricings — pricing
            every Treasury against every other Treasury and pouncing on the
            inconsistent ones.
          </p>
        </div>

        {/* Professor's note */}
        <div className="mt-5 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5">
          <div className="ops-caption text-[11px] text-accent-amber">
            Professor&apos;s note
          </div>
          <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
            Do not try this at home. The easy mispricings were traded away long
            ago; today&apos;s version requires speed, capital, and a tolerance
            for the frictions above.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}
