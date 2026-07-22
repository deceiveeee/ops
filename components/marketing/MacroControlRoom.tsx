"use client";

import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Section 08 — Macro.
 *
 * One scenario selector. One simple transmission chain. One portfolio
 * consequence. Removed: MACRO CONTROL ROOM label, FED LEVER, RIPPLE,
 * gauge dashboard, multiple yield values, separate yield curve, equity
 * reaction panel.
 */
type ScenarioId = "inflation-shock" | "rate-hike" | "soft-landing";

const SCENARIOS: {
  id: ScenarioId;
  label: string;
  chain: string[];
  outcome: string;
  tone: "red" | "amber" | "green";
}[] = [
  {
    id: "inflation-shock",
    label: "Inflation shock",
    chain: [
      "Inflation rises",
      "Central bank tightens",
      "Bond yields jump",
      "Equity multiples compress",
      "Portfolio value declines",
    ],
    outcome: "Higher rates across the curve; growth hit hardest.",
    tone: "red",
  },
  {
    id: "rate-hike",
    label: "Rate hike",
    chain: [
      "Central bank raises rate",
      "Bond prices fall",
      "Equity discount rate rises",
      "Long-duration assets hit",
      "Growth-style portfolios lag",
    ],
    outcome: "Tighter financial conditions; bond–equity correlation turns positive.",
    tone: "amber",
  },
  {
    id: "soft-landing",
    label: "Soft landing",
    chain: [
      "Inflation cools",
      "Central bank pauses cuts",
      "Yields stabilize",
      "Equity multiples expand",
      "Broadly positive for risk assets",
    ],
    outcome: "Risk-on; quality and growth both supported.",
    tone: "green",
  },
];

const toneText: Record<string, string> = {
  red: "text-accent-red",
  amber: "text-accent-amber",
  green: "text-accent-green",
};

export default function MacroControlRoom() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<ScenarioId>("rate-hike");
  const scenario = SCENARIOS.find((s) => s.id === active)!;

  return (
    <section className="hp-section-pad relative w-full overflow-hidden border-t border-white/5">
      <div className="hp-container">
        <div className="hp-marker">08 / Macro</div>
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="hp-section mt-5"
        >
          See how policy moves through markets.
        </motion.h2>
        <p className="hp-lead mt-6">
          Choose a scenario to trace the effect across assets and portfolios.
        </p>

        {/* Scenario selector — sans-serif text, not glowing chips */}
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2">
          {SCENARIOS.map((s) => {
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                aria-pressed={isActive}
                className={cn(
                  "text-[15px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 rounded-md",
                  isActive ? toneText[s.tone] : "text-slate-500 hover:text-slate-300",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Transmission chain — one column, animated reveal */}
        <div className="mt-14">
          <AnimatePresence mode="wait">
            <motion.ol
              key={scenario.id}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              {scenario.chain.map((step, i) => (
                <motion.li
                  key={step}
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className="flex items-center gap-6 border-t border-white/10 py-5 sm:gap-10"
                >
                  <span className="hp-marker w-8 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[18px] font-medium text-white sm:text-[22px]">
                    {step}
                  </span>
                  {i === scenario.chain.length - 1 && (
                    <span
                      className={cn(
                        "ml-auto text-[14px] font-medium",
                        toneText[scenario.tone],
                      )}
                    >
                      ↓
                    </span>
                  )}
                </motion.li>
              ))}
            </motion.ol>
          </AnimatePresence>

          {/* Final portfolio consequence */}
          <div className="mt-10 border-t border-white/10 pt-6">
            <div className="text-[15px] font-medium text-slate-400">
              Portfolio consequence
            </div>
            <p
              className={cn(
                "mt-2 text-[20px] font-medium sm:text-[24px]",
                toneText[scenario.tone],
              )}
            >
              {scenario.outcome}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
