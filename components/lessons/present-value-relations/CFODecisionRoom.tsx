"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import {
  InteractiveFrame,
  TryItTag,
  Feedback,
} from "@/components/lessons/intro-course-overview/shared";
import { FormulaCard, Var, Sub, Sup } from "./FormulaCard";

/* ------------------------------------------------------------------ */
/* Scenario constants                                                  */
/* ------------------------------------------------------------------ */

const INITIAL_COST = -500_000;
const ANNUAL_SAVINGS = 140_000;
const N_YEARS = 5;
const INFLATION = 0.02;
const NOMINAL_RATE = 0.07;
const MAINT_YR = 3;
const MAINT_COST = -25_000;

/** NPV computed dynamically from the scenario cashflows so the worked
 * calc, the expected answer, and the tolerance are always consistent. */
function computeNPV() {
  let pv = INITIAL_COST;
  for (let t = 1; t <= N_YEARS; t++) {
    pv += ANNUAL_SAVINGS / Math.pow(1 + NOMINAL_RATE, t);
  }
  pv += MAINT_COST / Math.pow(1 + NOMINAL_RATE, MAINT_YR);
  return pv;
}

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

const NPV_TOLERANCE = 1000;

/* ------------------------------------------------------------------ */
/* Timeline build definitions                                          */
/* ------------------------------------------------------------------ */

type Cashflow = {
  id: string;
  label: string;
  amount: number;
  year: number;
  tone: "red" | "green";
};

const REQUIRED_FLOWS: Cashflow[] = [
  {
    id: "equip",
    label: "Equipment purchase",
    amount: INITIAL_COST,
    year: 0,
    tone: "red",
  },
  {
    id: "s1",
    label: "Year 1 savings",
    amount: ANNUAL_SAVINGS,
    year: 1,
    tone: "green",
  },
  {
    id: "s2",
    label: "Year 2 savings",
    amount: ANNUAL_SAVINGS,
    year: 2,
    tone: "green",
  },
  {
    id: "s3",
    label: "Year 3 savings",
    amount: ANNUAL_SAVINGS,
    year: 3,
    tone: "green",
  },
  {
    id: "s4",
    label: "Year 4 savings",
    amount: ANNUAL_SAVINGS,
    year: 4,
    tone: "green",
  },
  {
    id: "s5",
    label: "Year 5 savings",
    amount: ANNUAL_SAVINGS,
    year: 5,
    tone: "green",
  },
  {
    id: "maint",
    label: "Year 3 maintenance",
    amount: MAINT_COST,
    year: 3,
    tone: "red",
  },
];

/* ------------------------------------------------------------------ */
/* Step badge                                                          */
/* ------------------------------------------------------------------ */

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-mono text-[12px] text-accent-cyan">
      {n}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function CFODecisionRoom({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const reduce = useReducedMotion();
  const expectedNPV = useMemo(computeNPV, []);

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  /* --- Step 1: timeline --- */
  const [placed, setPlaced] = useState<Set<string>>(new Set());

  /* --- Step 2: classification --- */
  const [classification, setClassification] = useState<
    "nominal" | "real" | null
  >(null);
  const classificationCorrect = classification === "nominal";

  /* --- Step 3: discount rate --- */
  const [ratePick, setRatePick] = useState<string | null>(null);
  const rateCorrect = ratePick === "7-nominal";

  /* --- Step 4: NPV --- */
  const [npvInput, setNpvInput] = useState("");
  const [npvChecked, setNpvChecked] = useState(false);
  const npvNum = parseFloat(npvInput.replace(/[, $]/g, ""));
  const npvCorrect =
    !isNaN(npvNum) && Math.abs(npvNum - expectedNPV) <= NPV_TOLERANCE;

  /* --- Step 5: accept/reject --- */
  const [decision, setDecision] = useState<"accept" | "reject" | null>(null);
  const decisionCorrect = decision === (expectedNPV > 0 ? "accept" : "reject");

  /* --- Step 6: justification --- */
  const [justification, setJustification] = useState("");
  const [justChecked, setJustChecked] = useState(false);
  const justCorrect =
    /\bvalue\b/i.test(justification.trim()) && justification.trim().length >= 8;

  const allPlaced = REQUIRED_FLOWS.every((f) => placed.has(f.id));
  const timelineDone = allPlaced;

  const advance = (next: number) =>
    setStep(Math.max(step, Math.min(next, totalSteps)));

  const solved =
    timelineDone &&
    classificationCorrect &&
    rateCorrect &&
    npvCorrect &&
    decisionCorrect &&
    justCorrect;

  // Fire onComplete exactly once when the capstone is solved.
  const [reported, setReported] = useState(false);
  useEffect(() => {
    if (solved && !reported) {
      setReported(true);
      onComplete?.();
    }
  }, [solved, reported, onComplete]);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            CFO Decision Room · capstone
          </span>
        </div>
        <span className="ops-caption font-mono text-[12px] text-slate-300">
          Step {step} of {totalSteps}
        </span>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        Advise the CFO
      </h3>
      <p className="ops-body mt-3 max-w-2xl text-[15px] leading-7 text-slate-200">
        You are a junior analyst. The board has proposed a capital project. Walk
        it through the full present-value workflow and make a recommendation.
      </p>

      {/* Scenario brief */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-slate-400">
            Project brief
          </div>
          <ul className="ops-body mt-2.5 space-y-1.5 text-[14px] leading-6 text-slate-200">
            <li>
              Upfront equipment cost today:{" "}
              <span className="text-accent-red font-mono">
                {money(INITIAL_COST)}
              </span>
            </li>
            <li>
              Annual nominal savings, Years 1–5:{" "}
              <span className="text-accent-green font-mono">
                +{money(ANNUAL_SAVINGS)}
              </span>
            </li>
            <li>
              One-off nominal maintenance in Year 3:{" "}
              <span className="text-accent-red font-mono">
                {money(MAINT_COST)}
              </span>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-slate-400">
            Market assumptions
          </div>
          <ul className="ops-body mt-2.5 space-y-1.5 text-[14px] leading-6 text-slate-200">
            <li>
              Expected inflation:{" "}
              <span className="text-accent-amber font-mono">
                {(INFLATION * 100).toFixed(0)}%
              </span>
            </li>
            <li>
              Nominal discount rate:{" "}
              <span className="text-accent-cyan font-mono">
                {(NOMINAL_RATE * 100).toFixed(0)}%
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Step rail */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <span
            key={n}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              n <= step ? "bg-accent-cyan/70" : "bg-white/10",
            )}
            aria-hidden
          />
        ))}
      </div>

      {/* Steps */}
      <ol className="mt-6 space-y-4">
        {/* STEP 1 — TIMELINE */}
        <li>
          <AnimatePresence mode="wait">
            {step >= 1 && (
              <motion.div
                key="s1"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-center gap-3">
                  <StepBadge n={1} />
                  <span className="ops-body-strong text-[16px] text-slate-50">
                    Build the timeline
                  </span>
                </div>
                <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
                  Confirm each cashflow on its date. Tap a cashflow chip, then
                  tap the year it lands on.
                </p>

                {/* Year columns */}
                <div className="mt-4 overflow-x-auto">
                  <div className="grid min-w-[560px] grid-cols-6 gap-2">
                    {[0, 1, 2, 3, 4, 5].map((yr) => {
                      const flowsHere = REQUIRED_FLOWS.filter(
                        (f) => placed.has(f.id) && f.year === yr,
                      );
                      return (
                        <div
                          key={yr}
                          className="rounded-lg border border-white/10 bg-ink-950/40 p-3"
                        >
                          <div className="text-center font-mono text-[12px] text-slate-300">
                            t = {yr}
                          </div>
                          <div className="mt-2 flex min-h-[44px] flex-col items-center justify-center gap-1">
                            {flowsHere.length === 0 ? (
                              <span className="text-slate-600">·</span>
                            ) : (
                              flowsHere.map((f) => (
                                <span
                                  key={f.id}
                                  className={cn(
                                    "font-mono text-[12px]",
                                    f.tone === "red"
                                      ? "text-accent-red"
                                      : "text-accent-green",
                                  )}
                                >
                                  {f.amount > 0 ? "+" : ""}
                                  {money(f.amount)}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Placeable chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {REQUIRED_FLOWS.filter((f) => !placed.has(f.id)).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setPlaced((prev) => {
                          const next = new Set(prev);
                          next.add(f.id);
                          return next;
                        })
                      }
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 font-mono text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        f.tone === "red"
                          ? "border-accent-red/40 bg-accent-red/10 text-accent-red hover:border-accent-red/60"
                          : "border-accent-green/40 bg-accent-green/10 text-accent-green hover:border-accent-green/60",
                      )}
                    >
                      {f.label} ({f.amount > 0 ? "+" : ""}
                      {money(f.amount)})
                    </button>
                  ))}
                  {allPlaced && (
                    <span className="inline-flex items-center rounded-lg border border-accent-green/40 bg-accent-green/10 px-2.5 py-1.5 font-mono text-[12px] text-accent-green">
                      ✓ all placed
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Button
                    size="sm"
                    onClick={() => advance(2)}
                    className={
                      timelineDone ? "" : "opacity-50 pointer-events-none"
                    }
                  >
                    Confirm timeline →
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPlaced(new Set())}
                  >
                    Reset
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        {/* STEP 2 — CLASSIFICATION */}
        <li>
          <AnimatePresence mode="wait">
            {step >= 2 && (
              <motion.div
                key="s2"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-center gap-3">
                  <StepBadge n={2} />
                  <span className="ops-body-strong text-[16px] text-slate-50">
                    Classify the cashflows
                  </span>
                </div>
                <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
                  Operations forecast the savings and maintenance in actual
                  dollars to be received. Are these cashflows nominal or real?
                </p>
                <div
                  role="radiogroup"
                  aria-label="Classify the cashflows"
                  className="mt-4 grid grid-cols-2 gap-3"
                >
                  {(
                    [
                      {
                        w: "nominal",
                        lbl: "All nominal",
                        note: "Inflation is given and the discount rate is nominal",
                      },
                      {
                        w: "real",
                        lbl: "All real",
                        note: "Stated in today's purchasing power",
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.w}
                      type="button"
                      role="radio"
                      aria-checked={classification === opt.w}
                      onClick={() => setClassification(opt.w)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        classification === opt.w
                          ? opt.w === "nominal"
                            ? "border-accent-cyan/60 bg-accent-cyan/10"
                            : "border-accent-amber/60 bg-accent-amber/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/25",
                      )}
                    >
                      <div
                        className={cn(
                          "font-mono text-[13px] uppercase tracking-[0.14em]",
                          opt.w === "nominal"
                            ? "text-accent-cyan"
                            : "text-accent-amber",
                        )}
                      >
                        {opt.lbl}
                      </div>
                      <div className="ops-body mt-1.5 text-[13px] text-slate-300">
                        {opt.note}
                      </div>
                    </button>
                  ))}
                </div>

                {classification && (
                  <Feedback
                    status={classificationCorrect ? "correct" : "incorrect"}
                  >
                    {classificationCorrect
                      ? "Correct. These are nominal cashflows — actual dollars to be received, with inflation baked into the forecasts."
                      : "Reconsider. The savings are forecast in actual dollars with 2% price inflation, and the discount rate is nominal. They are nominal cashflows."}
                  </Feedback>
                )}

                <div className="mt-4">
                  <Button
                    size="sm"
                    onClick={() => advance(3)}
                    className={
                      classificationCorrect
                        ? ""
                        : "opacity-50 pointer-events-none"
                    }
                  >
                    Continue →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        {/* STEP 3 — DISCOUNT RATE */}
        <li>
          <AnimatePresence mode="wait">
            {step >= 3 && (
              <motion.div
                key="s3"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-center gap-3">
                  <StepBadge n={3} />
                  <span className="ops-body-strong text-[16px] text-slate-50">
                    Choose the discount rate
                  </span>
                </div>
                <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
                  You classified the cashflows as nominal. Which rate discounts
                  them consistently?
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {(
                    [
                      {
                        id: "7-nominal",
                        lbl: "7% nominal",
                        note: "Matches nominal cashflows",
                      },
                      {
                        id: "5-real",
                        lbl: "≈ 5% real",
                        note: "For real cashflows only",
                      },
                      {
                        id: "2-inflation",
                        lbl: "2% inflation",
                        note: "Not a discount rate",
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={ratePick === opt.id}
                      onClick={() => setRatePick(opt.id)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        ratePick === opt.id
                          ? "border-accent-cyan/60 bg-accent-cyan/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/25",
                      )}
                    >
                      <div className="font-mono text-[14px] text-slate-50">
                        {opt.lbl}
                      </div>
                      <div className="ops-body mt-1 text-[12px] text-slate-400">
                        {opt.note}
                      </div>
                    </button>
                  ))}
                </div>

                {ratePick && (
                  <Feedback status={rateCorrect ? "correct" : "incorrect"}>
                    {rateCorrect
                      ? "Correct. Nominal cashflows must be discounted at the nominal rate. Inflation alone is not a discount rate, and a real rate would mix worlds."
                      : ratePick === "5-real"
                        ? "That real rate would mix a real rate with nominal cashflows — inconsistent."
                        : "Inflation measures price growth; it is not a discount rate. Pick the nominal rate."}
                  </Feedback>
                )}

                <div className="mt-4">
                  <Button
                    size="sm"
                    onClick={() => advance(4)}
                    className={
                      rateCorrect ? "" : "opacity-50 pointer-events-none"
                    }
                  >
                    Continue →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        {/* STEP 4 — NPV */}
        <li>
          <AnimatePresence mode="wait">
            {step >= 4 && (
              <motion.div
                key="s4"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-center gap-3">
                  <StepBadge n={4} />
                  <span className="ops-body-strong text-[16px] text-slate-50">
                    Calculate NPV
                  </span>
                </div>
                <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
                  Discount every nominal cashflow at{" "}
                  {(NOMINAL_RATE * 100).toFixed(0)}% and sum. Enter your NPV in
                  dollars (accepted within ±{money(NPV_TOLERANCE)}).
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <label
                    className="ops-caption text-[11px] text-slate-400"
                    htmlFor="npv-input"
                  >
                    NPV ($)
                  </label>
                  <input
                    id="npv-input"
                    type="text"
                    inputMode="decimal"
                    value={npvInput}
                    onChange={(e) => {
                      setNpvInput(e.target.value);
                      setNpvChecked(false);
                    }}
                    placeholder="e.g. 53000"
                    className="w-48 rounded-lg border border-white/15 bg-ink-950/60 px-3 py-2 font-mono text-[15px] text-slate-50 placeholder:text-slate-600 focus:border-accent-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                  />
                  <Button
                    size="sm"
                    onClick={() => setNpvChecked(true)}
                    className={
                      npvInput.trim() === ""
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  >
                    Check
                  </Button>
                </div>

                {npvChecked && (
                  <>
                    <Feedback status={npvCorrect ? "correct" : "incorrect"}>
                      {npvCorrect
                        ? `Correct. NPV ≈ ${money(expectedNPV)} — within tolerance. The project is positive-NPV.`
                        : `Not within tolerance. Recompute: discount each savings year at ${(NOMINAL_RATE * 100).toFixed(0)}%, subtract the Year 3 maintenance, then subtract the upfront cost. The answer is around ${money(expectedNPV)}.`}
                    </Feedback>
                    {npvCorrect && (
                      <div className="mt-4">
                        <FormulaCard
                          label="Worked calculation"
                          ariaLabel="NPV equals negative 500000 plus sum of 140000 over 1.07 to the t for t from 1 to 5, minus 25000 over 1.07 cubed"
                        >
                          <div className="space-y-2 text-[15px] sm:text-[16px]">
                            <div>
                              NPV ={" "}
                              <span className="text-accent-red">
                                {money(INITIAL_COST)}
                              </span>{" "}
                              + Σ{" "}
                              <span className="text-accent-green">
                                {money(ANNUAL_SAVINGS)}
                              </span>
                              /(1+<Var>r</Var>)<Sup>t</Sup>{" "}
                              <span className="text-slate-400">
                                (t = 1…{N_YEARS})
                              </span>{" "}
                              −{" "}
                              <span className="text-accent-red">
                                {money(Math.abs(MAINT_COST))}
                              </span>
                              /(1+<Var>r</Var>)<Sup>{MAINT_YR}</Sup>
                            </div>
                            <div className="text-slate-300">
                              r = {(NOMINAL_RATE * 100).toFixed(0)}% (nominal)
                            </div>
                            <div>
                              ={" "}
                              <span className="text-accent-green">
                                {money(expectedNPV)}
                              </span>
                            </div>
                          </div>
                        </FormulaCard>
                      </div>
                    )}
                  </>
                )}

                <div className="mt-4">
                  <Button
                    size="sm"
                    onClick={() => advance(5)}
                    className={
                      npvCorrect ? "" : "opacity-50 pointer-events-none"
                    }
                  >
                    Continue →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        {/* STEP 5 — ACCEPT / REJECT */}
        <li>
          <AnimatePresence mode="wait">
            {step >= 5 && (
              <motion.div
                key="s5"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-center gap-3">
                  <StepBadge n={5} />
                  <span className="ops-body-strong text-[16px] text-slate-50">
                    Recommend: accept or reject
                  </span>
                </div>
                <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
                  You found NPV ≈{" "}
                  <span className="font-mono text-accent-green">
                    {money(expectedNPV)}
                  </span>
                  . What do you tell the CFO?
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision("accept")}
                    aria-pressed={decision === "accept"}
                    className={cn(
                      "rounded-xl border p-4 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      decision === "accept"
                        ? "border-accent-green/60 bg-accent-green/10 text-accent-green"
                        : "border-white/10 bg-white/[0.02] text-slate-200 hover:border-white/25",
                    )}
                  >
                    <div className="font-mono text-[14px] uppercase tracking-[0.14em]">
                      Accept
                    </div>
                    <div className="ops-body mt-1 text-[12px] text-slate-400">
                      NPV &gt; 0
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("reject")}
                    aria-pressed={decision === "reject"}
                    className={cn(
                      "rounded-xl border p-4 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      decision === "reject"
                        ? "border-accent-red/60 bg-accent-red/10 text-accent-red"
                        : "border-white/10 bg-white/[0.02] text-slate-200 hover:border-white/25",
                    )}
                  >
                    <div className="font-mono text-[14px] uppercase tracking-[0.14em]">
                      Reject
                    </div>
                    <div className="ops-body mt-1 text-[12px] text-slate-400">
                      NPV &lt; 0
                    </div>
                  </button>
                </div>

                {decision && (
                  <Feedback status={decisionCorrect ? "correct" : "incorrect"}>
                    {decisionCorrect
                      ? "Correct. A positive NPV means the project creates value today."
                      : "Reconsider. With a positive NPV, the present value of benefits exceeds the present value of costs."}
                  </Feedback>
                )}

                <div className="mt-4">
                  <Button
                    size="sm"
                    onClick={() => advance(6)}
                    className={
                      decisionCorrect ? "" : "opacity-50 pointer-events-none"
                    }
                  >
                    Continue →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        {/* STEP 6 — JUSTIFICATION */}
        <li>
          <AnimatePresence mode="wait">
            {step >= 6 && (
              <motion.div
                key="s6"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-center gap-3">
                  <StepBadge n={6} />
                  <span className="ops-body-strong text-[16px] text-slate-50">
                    Write a one-sentence justification
                  </span>
                </div>
                <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
                  The CFO wants one clear sentence. Be sure to mention{" "}
                  <span className="text-accent-cyan">value</span>.
                </p>
                <textarea
                  value={justification}
                  onChange={(e) => {
                    setJustification(e.target.value);
                    setJustChecked(false);
                  }}
                  rows={3}
                  placeholder="e.g. Accept — the project creates value today because the present value of savings exceeds the cost."
                  className="mt-4 w-full resize-y rounded-lg border border-white/15 bg-ink-950/60 px-3 py-2.5 text-[15px] leading-7 text-slate-50 placeholder:text-slate-600 focus:border-accent-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                />
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <Button
                    size="sm"
                    onClick={() => setJustChecked(true)}
                    className={
                      justification.trim().length < 4
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  >
                    Check
                  </Button>
                </div>

                {justChecked && (
                  <Feedback status={justCorrect ? "correct" : "incorrect"}>
                    {justCorrect
                      ? "Clear. You tied the decision back to value creation — exactly what a CFO needs to hear."
                      : 'Make sure your sentence explains the decision in terms of value (e.g. "creates value" or "positive value").'}
                  </Feedback>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </li>
      </ol>

      {/* Completion panel */}
      {timelineDone &&
        classificationCorrect &&
        rateCorrect &&
        npvCorrect &&
        decisionCorrect &&
        justChecked &&
        justCorrect && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mt-6 rounded-2xl border border-accent-green/40 bg-accent-green/[0.08] p-6"
            role="status"
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center rounded-full border border-accent-green/50 bg-accent-green/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-green">
                ✓ Recommendation accepted
              </span>
            </div>
            <p className="ops-body-strong mt-3 text-[17px] text-slate-50">
              Recommendation accepted — the project creates value today.
            </p>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
              You converted a messy capital proposal into a timeline, kept real
              and nominal worlds consistent, discounted at the right rate,
              solved NPV ≈ {money(expectedNPV)}, and recommended accept. That is
              the full present-value workflow.
            </p>
          </motion.div>
        )}
    </InteractiveFrame>
  );
}
