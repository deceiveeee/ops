"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  InlineMath,
  FormulaExplainer,
} from "./shared";
import { forwardRateFromSpotRates, formatPercent, formatPercentTex } from "@/lib/fixed-income";

/**
 * Section 7 — Synthetic forward loan builder.
 * Customer wants to borrow $20MM three years from now for one year.
 * Quote f_4 (Y3->Y4) via synthetic replication:
 *  buy 3-yr discount bonds (face 20MM, cost 16.556MM),
 *  finance by short-selling 4-yr discount bonds (face 21.701MM).
 * Synthetic return = 21.701/20 - 1 = 8.51%.
 */
const PRICES = { 3: 0.8278, 4: 0.7629 } as const;
const RATES = { 3: 0.065, 4: 0.07 } as const;
const FACE_NEED = 20.0; // $MM needed in Y3
const COST_3YR = FACE_NEED * PRICES[3]; // 16.556
const SHORT_FACE_4YR = COST_3YR / PRICES[4]; // ~21.701
const F4 = forwardRateFromSpotRates(RATES[3], RATES[4], 4); // ~0.0851

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export default function SyntheticForwardLoanBuilder() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>(0);

  return (
    <div className="space-y-6">
      <DefinitionCard term="Synthetic forward contract">
        A bank can create a forward loan synthetically by{" "}
        <span className="text-slate-50">buying</span> a shorter discount bond
        and <span className="text-slate-50">short-selling</span> a longer one.
        The cash flows at Year 0 cancel, leaving money received in one future
        year and repaid in a later one — a forward loan at the forward rate.
      </DefinitionCard>

      <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.05] p-5">
        <div className="ops-caption text-[11px] text-accent-amber">
          Short selling
        </div>
        <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
          Short selling means selling a security you do not own by borrowing it
          or creating the obligation. You receive proceeds now but must deliver
          the promised future payoff later.
        </p>
      </div>

      {/* Given table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/40">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-2.5 text-left ops-caption text-[11px] text-slate-400">
                Maturity t (yr)
              </th>
              <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                Price P_t
              </th>
              <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                Spot r(0,t)
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { t: 1, p: 0.9524, r: 0.05 },
              { t: 2, p: 0.89, r: 0.06 },
              { t: 3, p: 0.8278, r: 0.065 },
              { t: 4, p: 0.7629, r: 0.07 },
            ].map((row) => (
              <tr key={row.t} className="border-b border-white/5">
                <td className="px-4 py-2.5 text-left font-sans text-[14px] text-slate-200">
                  {row.t}
                </td>
                <td className="px-4 py-2.5 font-sans text-[14px] text-slate-200">
                  {row.p.toFixed(4)}
                </td>
                <td className="px-4 py-2.5 font-sans text-[14px] text-accent-cyan">
                  {formatPercent(row.r)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormulaExplainer
        label="Forward rate f₄ (Year 3 → Year 4)"
        tone="purple"
        formula={"f_4 = \\frac{(1+r_{0,4})^4}{(1+r_{0,3})^3} - 1"}
        substitution={"f_4 = \\frac{1.07^4}{1.065^3} - 1 \\approx 8.51\\%"}
        result="f₄ ≈ 8.51%"
      />

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Build the synthetic forward loan &middot; step by step
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`Go to step ${n + 1}`}
                aria-current={step === n}
                onClick={() => setStep(n as Step)}
                className={cn(
                  "h-7 w-7 rounded-full border font-sans text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  step === n
                    ? "border-accent-cyan/60 bg-accent-cyan/20 text-accent-cyan"
                    : step > n
                      ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                      : "border-white/15 text-slate-400 hover:bg-white/5",
                )}
              >
                {n + 1}
              </button>
            ))}
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Quote the Year 3 &rarr; Year 4 loan
        </h4>
        <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
          A customer wants a forward contract to borrow{" "}
          <span className="text-accent-cyan">$20MM</span> three years from now,
          repaying one year later. You are the bank. Build the loan
          synthetically and quote the rate.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Step content */}
          <StepPanel
            step={step}
            reduce={reduce}
            onNext={() => setStep((s) => (s < 6 ? ((s + 1) as Step) : s))}
          />

          {/* Timeline visual */}
          <TimelineVisual step={step} reduce={reduce} />
        </div>

        {/* CF table once built */}
        <AnimatePresence>
          {step >= 5 && (
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50">
                <table className="w-full border-collapse text-center">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-2.5 text-left ops-caption text-[11px] text-slate-400">
                        Strategy ($MM)
                      </th>
                      <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                        Year 0
                      </th>
                      <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                        Year 1–2
                      </th>
                      <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                        Year 3
                      </th>
                      <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                        Year 4
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <CFRow
                      label="Long 3-Yr Bond"
                      tone="cyan"
                      y0={-COST_3YR}
                      mid="0"
                      y3={FACE_NEED}
                      y4="0"
                    />
                    <CFRow
                      label="Short 4-Yr Bond"
                      tone="red"
                      y0={COST_3YR}
                      mid="0"
                      y3="0"
                      y4={-SHORT_FACE_4YR}
                    />
                    <tr className="border-t-2 border-white/15">
                      <td className="px-4 py-3 text-left ops-body-strong text-[13px] text-slate-50">
                        Total
                      </td>
                      <td className="px-4 py-3 font-sans text-[15px] font-semibold text-accent-green">
                        0
                      </td>
                      <td className="px-4 py-3 font-sans text-[14px] text-slate-600">
                        0
                      </td>
                      <td className="px-4 py-3 font-sans text-[15px] font-semibold text-accent-green">
                        +{FACE_NEED.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 font-sans text-[15px] font-semibold text-accent-red">
                        −{SHORT_FACE_4YR.toFixed(3)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final quote */}
        <AnimatePresence>
          {step >= 6 && (
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-5 rounded-2xl border border-accent-green/40 bg-accent-green/[0.08] p-5"
            >
              <div className="ops-caption text-[11px] text-accent-green">
                Quote for the customer
              </div>
              <div className="mt-1 font-sans text-[28px] text-accent-green">
                Borrow at {formatPercent(F4)} (Year 3 → Year 4)
              </div>
              <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">
                Synthetic return ={" "}
                <span className="text-accent-green">
                  <InlineMath>{`\\frac{${SHORT_FACE_4YR.toFixed(3)}}{${FACE_NEED.toFixed(3)}} - 1 = ${formatPercentTex(F4)}`}</InlineMath>
                </span>{" "}
                = the forward rate <InlineMath>{"f_4"}</InlineMath>. No net cash
                at Year 0; the bank receives $20MM in Year 3 and the customer
                repays ${SHORT_FACE_4YR.toFixed(1)}MM in Year 4.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveFrame>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StepPanel({
  step,
  reduce,
  onNext,
}: {
  step: Step;
  reduce: boolean | null;
  onNext: () => void;
}) {
  const content: Record<
    Step,
    { title: string; body: React.ReactNode; answer?: React.ReactNode }
  > = {
    0: {
      title: "Step 1 — Which bond delivers $20MM in Year 3?",
      body: (
        <p className="ops-body text-[14px] leading-6 text-slate-200">
          The customer needs $20MM in Year 3. A discount bond that matures in
          Year 3 pays its face value then. So buy a{" "}
          <span className="text-accent-cyan">3-year discount bond</span> with
          $20MM face.
        </p>
      ),
      answer: <AnswerPill>3-year discount bond, face = $20MM</AnswerPill>,
    },
    1: {
      title: "Step 2 — What does it cost today?",
      body: (
        <p className="ops-body text-[14px] leading-6 text-slate-200">
          The 3-year STRIPS price is{" "}
          <span className="font-sans text-slate-100">0.8278</span> per $1.{" "}
          <InlineMath>
            {"\\text{Cost} = 20{,}000{,}000 \\times 0.8278"}
          </InlineMath>
          .
        </p>
      ),
      answer: <AnswerPill>Cost = $16.556MM</AnswerPill>,
    },
    2: {
      title: "Step 3 — How do you finance it without your own cash?",
      body: (
        <p className="ops-body text-[14px] leading-6 text-slate-200">
          To keep Year-0 cash at zero, raise the $16.556MM by{" "}
          <span className="text-accent-red">short-selling</span> a longer
          discount bond — one that matures after Year 3.
        </p>
      ),
      answer: <AnswerPill>Short-sell 4-year discount bonds</AnswerPill>,
    },
    3: {
      title: "Step 4 — How much 4-year face must you short?",
      body: (
        <p className="ops-body text-[14px] leading-6 text-slate-200">
          You need $16.556MM of proceeds today. The 4-year price is{" "}
          <span className="font-sans text-slate-100">0.7629</span>.{" "}
          <InlineMath>
            {"\\text{Face shorted} = \\frac{16.556}{0.7629}"}
          </InlineMath>
          .
        </p>
      ),
      answer: <AnswerPill>Short ≈ $21.701MM face of 4-yr bonds</AnswerPill>,
    },
    4: {
      title: "Step 5 — Check the net cash flows",
      body: (
        <p className="ops-body text-[14px] leading-6 text-slate-200">
          Year 0: +16.556 (short) and −16.556 (long) cancel to zero. Year 3:
          receive +20.000. Year 4: pay −21.701. That is a forward loan.
        </p>
      ),
      answer: <AnswerPill>Year 0 nets to 0 — replication works</AnswerPill>,
    },
    5: {
      title: "Step 6 — Read the implied forward rate",
      body: (
        <p className="ops-body text-[14px] leading-6 text-slate-200">
          The customer receives $20MM in Year 3 and repays $21.701MM in Year 4.
          The implied one-year rate is{" "}
          <InlineMath>{"\\frac{21.701}{20.000} - 1"}</InlineMath>.
        </p>
      ),
      answer: (
        <AnswerPill tone="green">
          <InlineMath>{`${formatPercentTex(F4)} = f_4`}</InlineMath>
        </AnswerPill>
      ),
    },
    6: {
      title: "Done — you quoted the forward loan",
      body: (
        <p className="ops-body text-[14px] leading-6 text-slate-200">
          The synthetic replication matches the forward-rate formula exactly:
          buy the shorter, short the longer, and the spread is the forward rate.
        </p>
      ),
    },
  };

  const c = content[step];
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
        >
          <div className="ops-caption text-[11px] text-accent-purple">
            Step {step + 1} of 7
          </div>
          <h5 className="ops-body-strong mt-1.5 text-[16px] text-slate-50">
            {c.title}
          </h5>
          <div className="mt-2">{c.body}</div>
          {c.answer && <div className="mt-4">{c.answer}</div>}
        </motion.div>
      </AnimatePresence>
      {step < 6 && (
        <button
          type="button"
          onClick={onNext}
          className="mt-5 rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-4 py-2 text-[13px] font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          Next step →
        </button>
      )}
    </div>
  );
}

function AnswerPill({
  children,
  tone = "cyan",
}: {
  children: React.ReactNode;
  tone?: "cyan" | "green";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-3 py-1.5 font-sans text-[14px]",
        tone === "green"
          ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
          : "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan",
      )}
    >
      {children}
    </span>
  );
}

function StepChip({
  active,
  n,
  label,
  done,
}: {
  active: boolean;
  n: number;
  label: string;
  done?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-[11px] uppercase tracking-[0.1em] transition-colors",
        active
          ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
          : done
            ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
            : "border-white/10 text-slate-500",
      )}
    >
      <span>{n}</span>
      {label}
      {done && !active && <span aria-hidden>✓</span>}
    </span>
  );
}

function CFRow({
  label,
  tone,
  y0,
  mid,
  y3,
  y4,
}: {
  label: string;
  tone: "cyan" | "red";
  y0: number | string;
  mid: string;
  y3: number | string;
  y4: number | string;
}) {
  const toneText = tone === "cyan" ? "text-accent-cyan" : "text-accent-red";
  const fmt = (v: number | string) =>
    typeof v === "number"
      ? `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(3)}`
      : v;
  return (
    <tr className="border-b border-white/5">
      <td className="px-4 py-3 text-left">
        <span className={cn("text-[13px]", toneText)}>{label}</span>
      </td>
      <td className="px-4 py-3 font-sans text-[14px] text-slate-200">
        {fmt(y0)}
      </td>
      <td className="px-4 py-3 font-sans text-[14px] text-slate-500">{mid}</td>
      <td className="px-4 py-3 font-sans text-[14px] text-slate-200">
        {fmt(y3)}
      </td>
      <td className="px-4 py-3 font-sans text-[14px] text-slate-200">
        {fmt(y4)}
      </td>
    </tr>
  );
}

function TimelineVisual({
  step,
  reduce,
}: {
  step: Step;
  reduce: boolean | null;
}) {
  // show long 3-yr from step>=1, short 4-yr from step>=3
  const showLong = step >= 1;
  const showShort = step >= 3;
  const W = 420;
  const H = 200;
  const padX = 40;
  const baseY = 110;
  const span = (W - padX * 2) / 4;
  const xAt = (p: number) => padX + span * p;

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
      <div className="ops-caption text-[11px] text-slate-400">
        Bond blocks on the timeline
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full min-w-[360px]"
        role="img"
        aria-label="Timeline of long 3-year bond and short 4-year bond positions"
      >
        <line
          x1={padX}
          y1={baseY}
          x2={W - padX}
          y2={baseY}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1={xAt(i)}
              y1={baseY - 5}
              x2={xAt(i)}
              y2={baseY + 5}
              stroke="rgba(255,255,255,0.3)"
            />
            <text
              x={xAt(i)}
              y={baseY + 22}
              textAnchor="middle"
              className="fill-slate-400 font-sans"
              fontSize="11"
            >
              {i}
            </text>
          </g>
        ))}

        {/* Long 3-yr bond */}
        <AnimatePresence>
          {showLong && (
            <motion.g
              initial={reduce ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <line
                x1={xAt(0)}
                y1={baseY - 36}
                x2={xAt(3)}
                y2={baseY - 36}
                stroke="#22d3ee"
                strokeWidth="2"
              />
              <circle cx={xAt(0)} cy={baseY - 36} r="4" fill="#22d3ee" />
              <circle cx={xAt(3)} cy={baseY - 36} r="5" fill="#22d3ee" />
              <text
                x={xAt(0) + 6}
                y={baseY - 44}
                className="fill-accent-cyan font-sans"
                fontSize="11"
              >
                Long 3-yr (−{COST_3YR.toFixed(2)} @Y0)
              </text>
              <text
                x={xAt(3)}
                y={baseY - 44}
                textAnchor="end"
                className="fill-accent-cyan font-sans"
                fontSize="11"
              >
                +{FACE_NEED.toFixed(1)} @Y3
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Short 4-yr bond */}
        <AnimatePresence>
          {showShort && (
            <motion.g
              initial={reduce ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <line
                x1={xAt(0)}
                y1={baseY + 36}
                x2={xAt(4)}
                y2={baseY + 36}
                stroke="#f87171"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <circle cx={xAt(0)} cy={baseY + 36} r="5" fill="#f87171" />
              <circle cx={xAt(4)} cy={baseY + 36} r="4" fill="#f87171" />
              <text
                x={xAt(0) + 6}
                y={baseY + 52}
                className="fill-accent-red font-sans"
                fontSize="11"
              >
                Short 4-yr (+{COST_3YR.toFixed(2)} @Y0)
              </text>
              <text
                x={xAt(4)}
                y={baseY + 52}
                textAnchor="end"
                className="fill-accent-red font-sans"
                fontSize="11"
              >
                −{SHORT_FACE_4YR.toFixed(2)} @Y4
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Net 0 marker */}
        {showLong && showShort && (
          <motion.g
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <text
              x={xAt(0)}
              y={baseY - 4}
              textAnchor="middle"
              className="fill-accent-green font-sans"
              fontSize="10"
            >
              net 0
            </text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
