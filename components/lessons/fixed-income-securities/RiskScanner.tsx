"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaCard,
  Var,
  Sub,
} from "./shared";

type RiskKey = "inflation" | "credit" | "timing" | "liquidity" | "currency";

type Risk = {
  key: RiskKey;
  label: string;
  short: string;
  detail: string;
  // which part of the bond the risk lights up
  target: "purchasing" | "certainty" | "timeline" | "exit" | "fx";
};

const RISKS: Risk[] = [
  {
    key: "inflation",
    label: "Inflation",
    short: "The dollars you receive later may buy less.",
    detail: "Promised dollars are nominal. Higher inflation erodes real purchasing power.",
    target: "purchasing",
  },
  {
    key: "credit",
    label: "Credit",
    short: "The issuer may fail to pay.",
    detail: "Default risk means promised cash flows may not arrive.",
    target: "certainty",
  },
  {
    key: "timing",
    label: "Timing / Callability",
    short: "The issuer may repay early or cash flows arrive at different times.",
    detail: "Call features and prepayment change the timing of promised cash.",
    target: "timeline",
  },
  {
    key: "liquidity",
    label: "Liquidity",
    short: "You may not be able to sell quickly at a fair price.",
    detail: "Thin markets widen bid-ask spreads and make exit costly.",
    target: "exit",
  },
  {
    key: "currency",
    label: "Currency",
    short: "Foreign-currency cash flows can change value when exchange rates move.",
    detail: "FX risk applies when cash flows are not in your home currency.",
    target: "fx",
  },
];

const TARGET_LABEL: Record<Risk["target"], string> = {
  purchasing: "Purchasing power",
  certainty: "Payment certainty",
  timeline: "Cash-flow timeline",
  exit: "Exit / sell",
  fx: "FX value",
};

/**
 * Section 10 — Valuation & risk menu / Risk Scanner.
 * Toggle risk assumptions; the scanner lights up the affected part of the bond.
 * "Riskless model mode" turns credit off and reveals the valuation formula.
 */
export default function RiskScanner() {
  const [active, setActive] = useState<Set<RiskKey>>(new Set(["credit", "inflation"]));
  const [riskless, setRiskless] = useState(false);

  const reduce = useReducedMotion();

  const toggle = (k: RiskKey) => {
    if (riskless && k === "credit") return; // locked off in riskless mode
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const activeRisks = RISKS.filter((r) => active.has(r.key));
  const activeTargets = new Set(activeRisks.map((r) => r.target));

  return (
    <div className="space-y-6">
      {/* Components of valuation */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <DefinitionCard term="Components of valuation">
          The time value of the principal and the time value of the coupons.
        </DefinitionCard>
        <DefinitionCard term="This lesson's scope">
          We value <span className="text-accent-cyan">riskless debt</span> first. U.S. government debt is treated
          as default-risk-free in the intro model.
        </DefinitionCard>
      </div>

      <div className="glass-panel p-6 sm:p-7">
        <h4 className="ops-interactive-title text-xl text-white">Is it truly riskless?</h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
          Default risk may be very low, but <span className="text-accent-amber">inflation risk</span> and{" "}
          <span className="text-accent-amber">interest-rate risk</span> can still matter. The risk menu below shows
          the dimensions that affect a bond beyond simple default.
        </p>
      </div>

      {/* The scanner */}
      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">Risk scanner</span>
          </div>
          <button
            type="button"
            aria-pressed={riskless}
            onClick={() => {
              setRiskless((v) => !v);
              if (!riskless) {
                // entering riskless mode → force credit off
                setActive((prev) => {
                  const next = new Set(prev);
                  next.delete("credit");
                  return next;
                });
              }
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              riskless
                ? "border-accent-green/60 bg-accent-green/10 text-accent-green"
                : "border-white/20 text-slate-200 hover:bg-white/5",
            )}
          >
            {riskless ? "Riskless model: ON" : "Enable riskless model"}
          </button>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Toggle a risk, watch the bond react
        </h4>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_minmax(0,320px)]">
          {/* Risk toggles */}
          <div className="space-y-2.5">
            {RISKS.map((r) => {
              const on = active.has(r.key);
              const locked = riskless && r.key === "credit";
              return (
                <button
                  key={r.key}
                  type="button"
                  aria-pressed={on}
                  disabled={locked}
                  onClick={() => toggle(r.key)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                    on
                      ? "border-accent-red/50 bg-accent-red/10"
                      : "border-white/10 bg-white/[0.02]",
                    locked && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border font-sans text-[11px]",
                      on
                        ? "border-accent-red/60 bg-accent-red/20 text-accent-red"
                        : "border-white/20 text-transparent",
                    )}
                    aria-hidden
                  >
                    ✕
                  </span>
                  <div className="min-w-0">
                    <div className="ops-body-strong text-[15px] text-slate-100">
                      {r.label}
                      {locked && (
                        <span className="ml-2 rounded border border-accent-green/40 px-1.5 py-0.5 font-sans text-[13px] uppercase tracking-[0.14em] text-accent-green">
                          off · riskless
                        </span>
                      )}
                    </div>
                    <p className="ops-body mt-0.5 text-[13px] leading-6 text-slate-300">{r.short}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scanner output */}
          <div className="rounded-2xl border border-white/10 bg-ink-950/50 p-5">
            <div className="ops-caption text-[11px] text-slate-400">Bond diagram</div>
            <div className="mt-4 space-y-3">
              <BondPart label="Purchasing power" tone="amber" lit={activeTargets.has("purchasing")} reduce={reduce} />
              <BondPart label="Payment certainty" tone="green" lit={activeTargets.has("certainty")} reduce={reduce} />
              <BondPart label="Cash-flow timeline" tone="cyan" lit={activeTargets.has("timeline")} reduce={reduce} />
              <BondPart label="Exit / sell" tone="purple" lit={activeTargets.has("exit")} reduce={reduce} />
              <BondPart label="FX value" tone="red" lit={activeTargets.has("fx")} reduce={reduce} />
            </div>

            <AnimatePresence>
              {activeRisks.length > 0 ? (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-xl border border-accent-red/30 bg-accent-red/5 p-3"
                >
                  <div className="ops-caption text-[11px] text-accent-red">Affected parts</div>
                  <ul className="mt-2 space-y-1">
                    {activeRisks.map((r) => (
                      <li key={r.key} className="text-[13px] text-slate-200">
                        <span className="font-sans text-accent-red">{r.label}</span> →{" "}
                        {TARGET_LABEL[r.target]}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-xl border border-accent-green/30 bg-accent-green/5 p-3"
                >
                  <div className="ops-caption text-[11px] text-accent-green">No risks active</div>
                  <p className="mt-1 text-[13px] text-slate-200">
                    Promised cash flows valued by time value of money only.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Riskless formula reveal */}
        <AnimatePresence>
          {riskless && (
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className="mt-6">
                <FormulaCard label="Riskless valuation = NPV of promised cash flows" ariaLabel="Riskless bond valuation is the net present value of promised cash flows">
                  <div>
                    <Var>P</Var>
                    <Sub>0</Sub> ={" "}
                    <span className="text-slate-300">Σ</span>{" "}
                    CF<Sub>t</Sub> / (1 + <Var>r</Var>)<sup className="text-[0.7em] text-slate-300">t</sup>
                  </div>
                </FormulaCard>
                <p className="ops-muted mt-3 text-[13px] leading-6 text-slate-400">
                  With credit risk switched off, valuation reduces to discounting
                  the promised schedule. The next section starts with the simplest
                  case: a single payment.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveFrame>
    </div>
  );
}

function BondPart({
  label,
  tone,
  lit,
  reduce,
}: {
  label: string;
  tone: "amber" | "green" | "cyan" | "purple" | "red";
  lit: boolean;
  reduce: boolean | null;
}) {
  const toneCls = {
    amber: "border-accent-amber/60 bg-accent-amber/15 text-accent-amber",
    green: "border-accent-green/60 bg-accent-green/15 text-accent-green",
    cyan: "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan",
    purple: "border-accent-purple/60 bg-accent-purple/15 text-accent-purple",
    red: "border-accent-red/60 bg-accent-red/15 text-accent-red",
  }[tone];
  return (
    <motion.div
      animate={reduce ? undefined : { opacity: lit ? 1 : 0.45 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex items-center justify-between rounded-lg border px-3 py-2 transition-colors",
        lit ? toneCls : "border-white/10 bg-white/[0.02] text-slate-500",
      )}
    >
      <span className="text-[13px]">{label}</span>
      <span className={cn("h-2 w-2 rounded-full", lit ? "bg-current" : "bg-slate-600")} aria-hidden />
    </motion.div>
  );
}
