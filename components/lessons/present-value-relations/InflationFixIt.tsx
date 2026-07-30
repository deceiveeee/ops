"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import {
  InteractiveFrame,
  TryItTag,
  Feedback,
} from "@/components/lessons/intro-course-overview/shared";
import { FormulaCard, Var, Sub, Sup } from "./FormulaCard";

type World = "nominal" | "real";

type CaseRow = {
  id: string;
  asset: string;
  cfType: World;
  cfNote: string;
  amount: string;
};

const INFLATION = 0.03;
const NOMINAL_RATE = 0.08;
const REAL_RATE = (1 + NOMINAL_RATE) / (1 + INFLATION) - 1; // 4.854...%

const CASES: CaseRow[] = [
  {
    id: "factory",
    asset: "Factory expansion",
    cfType: "nominal",
    cfNote:
      "Forecast by operations in the actual dollars to be received, with 3% price inflation built into every line.",
    amount: "$1,000 nominal · t = 1",
  },
  {
    id: "pension",
    asset: "Pension obligation",
    cfType: "real",
    cfNote:
      "Benefits fixed in today's purchasing power, with no inflation escalation written into the plan.",
    amount: "$1,000 real · t = 1",
  },
  {
    id: "lease",
    asset: "Indexed lease",
    cfType: "real",
    cfNote:
      "Rent is set in constant dollars and reviewed only for real wage growth, not for headline inflation.",
    amount: "$1,000 real · t = 1",
  },
];

function pct(n: number, digits = 2) {
  return (n * 100).toFixed(digits) + "%";
}

export default function InflationFixIt() {
  const reduce = useReducedMotion();
  const [world, setWorld] = useState<World>("nominal");
  const [picks, setPicks] = useState<Record<string, World>>({});
  const [checked, setChecked] = useState(false);

  const selectRate = (caseId: string, rate: World) => {
    setPicks((p) => ({ ...p, [caseId]: rate }));
    setChecked(false);
  };

  const results = CASES.map((c) => {
    const pick = picks[c.id];
    const consistent = pick === c.cfType;
    return { case: c, pick, consistent };
  });
  const allPicked = results.every((r) => r.pick !== undefined);
  const allConsistent = allPicked && results.every((r) => r.consistent);

  const nominalToReal = 1000 / (1 + INFLATION); // 970.87
  const realToNominal = 1000 * (1 + INFLATION); // 1030.00
  const consistentCount = results.filter((r) => r.consistent).length;

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            NPV consistency diagnostic
          </span>
        </div>
        {/* Global world toggle */}
        <div
          role="radiogroup"
          aria-label="Build NPV in"
          className="inline-flex items-center rounded-full border border-white/10 bg-ink-950/60 p-1"
        >
          {(["nominal", "real"] as World[]).map((w) => (
            <button
              key={w}
              type="button"
              role="radio"
              aria-checked={world === w}
              onClick={() => {
                setWorld(w);
                setChecked(false);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                world === w
                  ? w === "nominal"
                    ? "bg-accent-cyan/15 text-accent-cyan"
                    : "bg-accent-amber/15 text-accent-amber"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              {w} world
            </button>
          ))}
        </div>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        Fix invalid NPV setups
      </h3>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
        Each case states a cashflow and the language it is written in. Pick the
        discount rate that keeps the whole setup in one language. Mixing real
        cashflows with a nominal rate, or nominal cashflows with a real rate,
        breaks the NPV before any arithmetic begins.
      </p>

      {/* Inflation adjustment card + available rate cards */}
      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <FormulaCard
          label={`Inflation adjustment · building in ${world} terms`}
          ariaLabel="Converting between nominal and real cashflows using inflation"
        >
          <div className="space-y-2 text-[15px] sm:text-[16px]">
            {world === "nominal" ? (
              <>
                <div>
                  <Var>CF</Var>
                  <Sub>nominal,t</Sub> = <Var>CF</Var>
                  <Sub>real,t</Sub> × (1 + π)
                  <Sup>t</Sup>
                </div>
                <div className="text-slate-300">
                  $1,000 real at t = 1 →{" "}
                  <span className="text-slate-100">
                    ${realToNominal.toFixed(2)}
                  </span>{" "}
                  nominal, then discount at{" "}
                  <span className="text-accent-cyan">8.00%</span>.
                </div>
              </>
            ) : (
              <>
                <div>
                  <Var>CF</Var>
                  <Sub>real,t</Sub> = <Var>CF</Var>
                  <Sub>nominal,t</Sub> / (1 + π)
                  <Sup>t</Sup>
                </div>
                <div className="text-slate-300">
                  $1,000 nominal at t = 1 →{" "}
                  <span className="text-slate-100">
                    ${nominalToReal.toFixed(2)}
                  </span>{" "}
                  real, then discount at{" "}
                  <span className="text-accent-amber">{pct(REAL_RATE)}</span>.
                </div>
              </>
            )}
          </div>
        </FormulaCard>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Rate cards on the bench
          </div>
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center justify-between rounded-lg border border-accent-cyan/30 bg-accent-cyan/[0.06] px-3 py-2">
              <span className="font-sans text-[13px] text-accent-cyan">
                Nominal rate
              </span>
              <span className="font-sans text-[14px] text-slate-100">8.00%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-accent-amber/30 bg-accent-amber/[0.06] px-3 py-2">
              <span className="font-sans text-[13px] text-accent-amber">
                Real rate
              </span>
              <span className="font-sans text-[14px] text-slate-100">
                {pct(REAL_RATE)}
              </span>
            </div>
          </div>
          <div className="ops-muted mt-3 text-[12px] text-slate-400">
            Inflation π = 3.00%. Real rate is exact: (1.08 / 1.03) − 1.
          </div>
        </div>
      </div>

      {/* Cases */}
      <div className="mt-5 space-y-3">
        {results.map(({ case: c, pick, consistent }) => {
          const reveal = checked;
          return (
            <div
              key={c.id}
              className={cn(
                "rounded-2xl border p-5 transition-colors",
                reveal
                  ? consistent
                    ? "border-accent-green/40 bg-accent-green/[0.05]"
                    : pick
                      ? "border-accent-red/40 bg-accent-red/[0.05]"
                      : "border-white/10 bg-white/[0.02]"
                  : "border-white/10 bg-white/[0.02]",
              )}
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                {/* Cashflow card */}
                <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
                  <div className="ops-caption text-[11px] text-slate-400">
                    Case · {c.asset}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[11px] uppercase tracking-[0.14em]",
                        c.cfType === "nominal"
                          ? "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan"
                          : "border-accent-amber/30 bg-accent-amber/10 text-accent-amber",
                      )}
                    >
                      {c.cfType} CF
                    </span>
                    <span className="font-sans text-[13px] text-slate-200">
                      {c.amount}
                    </span>
                  </div>
                  <p className="ops-muted mt-2 text-[13px] leading-6 text-slate-400">
                    {c.cfNote}
                  </p>
                </div>

                {/* Connector */}
                <div className="flex items-center justify-center">
                  <span className="font-sans text-[12px] text-slate-500">
                    discount at
                  </span>
                </div>

                {/* Rate selector */}
                <div>
                  <div className="ops-caption mb-2 text-[11px] text-slate-400">
                    Choose the matching rate
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(["nominal", "real"] as World[]).map((r) => {
                      const selected = pick === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => selectRate(c.id, r)}
                          className={cn(
                            "rounded-lg border px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                            selected
                              ? r === "nominal"
                                ? "border-accent-cyan/60 bg-accent-cyan/15"
                                : "border-accent-amber/60 bg-accent-amber/15"
                              : "border-white/10 bg-white/[0.02] hover:border-white/25",
                          )}
                        >
                          <div
                            className={cn(
                              "font-sans text-[11px] uppercase tracking-[0.14em]",
                              r === "nominal"
                                ? "text-accent-cyan"
                                : "text-accent-amber",
                            )}
                          >
                            {r} rate
                          </div>
                          <div className="mt-0.5 font-sans text-[14px] text-slate-100">
                            {r === "nominal" ? "8.00%" : pct(REAL_RATE)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Per-row feedback */}
              <AnimatePresence initial={false}>
                {reveal && pick && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    {consistent ? (
                      <Feedback status="correct">
                        Consistent. This NPV setup is valid. ({c.cfType} cashflows
                        matched with a {pick} rate.)
                      </Feedback>
                    ) : (
                      <Feedback status="incorrect">
                        Mixed real and nominal. Convert the rate or the cashflows
                        first. These cashflows are {c.cfType}; you selected a{" "}
                        {pick} rate.
                      </Feedback>
                    )}
                  </motion.div>
                )}
                {reveal && !pick && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <Feedback status="info">
                      No rate chosen yet. Pick a discount rate that matches these{" "}
                      {c.cfType} cashflows.
                    </Feedback>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button size="md" onClick={() => setChecked(true)}>
          Check setup
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => {
            setPicks({});
            setChecked(false);
          }}
        >
          Reset
        </Button>
        {checked && (
          <span
            className={cn(
              "font-sans text-[12px] uppercase tracking-[0.14em]",
              allConsistent ? "text-accent-green" : "text-slate-400",
            )}
          >
            {allConsistent
              ? "All setups consistent"
              : `${consistentCount} of ${CASES.length} consistent`}
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {checked && allConsistent && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Feedback status="correct">
              Consistent. This NPV setup is valid. Every cashflow is discounted in
              its own language, so the present value is meaningful.
            </Feedback>
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveFrame>
  );
}
