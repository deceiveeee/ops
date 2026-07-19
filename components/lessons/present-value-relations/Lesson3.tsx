"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import {
  Reveal,
  SectionHeading,
  Panel,
  ConceptTag,
  InteractiveFrame,
  TryItTag,
} from "@/components/lessons/intro-course-overview/shared";
import { FormulaCard, Var, Sub, Sup, Frac, Inline } from "./FormulaCard";
import PVLayout from "./PVLayout";
import PVHero from "./PVHero";
import ModuleMap from "./ModuleMap";
import MasteryCheck, { type MasteryQuestion } from "./MasteryCheck";
import LessonSummary from "./LessonSummary";
import { useReportLessonComplete } from "@/lib/pv-progress";
import InflationFixIt from "./InflationFixIt";

/* ------------------------------------------------------------------ */
/* Worked Example 5: Present value of future income (step reveal)      */
/* ------------------------------------------------------------------ */

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-mono text-[12px] text-accent-cyan">
      {n}
    </span>
  );
}

const CAREER_CHIPS = [
  { concept: "cashflow" as const, label: "Current income · $100,000" },
  { concept: "time" as const, label: "Real income growth · 2% / year" },
  { concept: "time" as const, label: "Career length · 20 years" },
  { concept: "market" as const, label: "Nominal interest rate · 5%" },
  { concept: "risk" as const, label: "Inflation · 2%" },
];

function WorkedExample5() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(1);
  const next = () => setStep((s) => (s >= 4 ? 1 : s + 1));

  const realCashflows = [
    { t: "Year 1", value: "$102,000", note: "100,000 × 1.02" },
    { t: "Year 2", value: "$104,040", note: "100,000 × 1.02²" },
    { t: "Year 20", value: "$148,595", note: "100,000 × 1.02²⁰" },
  ];
  const discounted = [
    { t: "Year 1", value: "$99,086", note: "102,000 / 1.0294" },
    { t: "Year 2", value: "$98,180", note: "104,040 / 1.0294²" },
    { t: "Year 20", value: "$83,219", note: "148,595 / 1.0294²⁰" },
  ];

  const steps: { n: number; title: string; body: ReactNode }[] = [
    {
      n: 1,
      title: "Find the real interest rate",
      body: (
        <FormulaCard
          label="Real interest rate"
          ariaLabel="Real rate equals 1.05 over 1.02 minus 1, which equals 2.94 percent"
        >
          <div className="space-y-2">
            <div>
              <Var>r</Var>
              <Sub>real</Sub> ={" "}
              <Frac
                num={
                  <>
                    (1 + <Var>r</Var>
                    <Sub>nominal</Sub>)
                  </>
                }
                den={<>(1 + π)</>}
              />{" "}
              − 1
            </div>
            <div>
              = <Frac num="1.05" den="1.02" /> − 1 ={" "}
              <span className="text-accent-cyan">2.94%</span>
            </div>
          </div>
        </FormulaCard>
      ),
    },
    {
      n: 2,
      title: "Build the real cashflow stream",
      body: (
        <div>
          <p className="ops-body text-[15px] leading-7 text-slate-300">
            Income grows at 2% in real terms, so each year&apos;s cashflow is
            stated in today&apos;s dollars.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {realCashflows.map((row) => (
              <div
                key={row.t}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="ops-caption text-[11px] text-slate-400">
                  {row.t}
                </div>
                <div className="mt-1.5 font-mono text-[16px] text-accent-green">
                  {row.value}
                </div>
                <div className="ops-muted mt-1 font-mono text-[12px] text-slate-400">
                  {row.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      n: 3,
      title: "Discount each cashflow at the real rate",
      body: (
        <div>
          <p className="ops-body text-[15px] leading-7 text-slate-300">
            Real cashflows are discounted at the real rate. Each future amount is
            divided by{" "}
            <Inline>
              (1.0294)<Sup>t</Sup>
            </Inline>
            .
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {discounted.map((row) => (
              <div
                key={row.t}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="ops-caption text-[11px] text-slate-400">
                  PV at {row.t}
                </div>
                <div className="mt-1.5 font-mono text-[16px] text-accent-cyan">
                  {row.value}
                </div>
                <div className="ops-muted mt-1 font-mono text-[12px] text-slate-400">
                  {row.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      n: 4,
      title: "Present value of lifetime income",
      body: (
        <div className="rounded-xl border border-accent-green/40 bg-accent-green/10 p-5">
          <div className="ops-caption text-[11px] text-accent-green">
            Present value
          </div>
          <p className="ops-body-strong mt-2 font-mono text-[18px] text-slate-50">
            Sum of all 20 discounted real cashflows ={" "}
            <span className="text-accent-green">$1,818,674</span>
          </p>
          <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
            Because the cashflows and the discount rate both speak the real
            language, the result is a valid present value stated in today&apos;s
            dollars.
          </p>
        </div>
      ),
    },
  ];

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Worked example 05
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          Step {Math.min(step, 4)} of 4
        </span>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        Worked Example 5: Present value of future income
      </h3>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {CAREER_CHIPS.map((chip) => (
          <ConceptTag key={chip.label} concept={chip.concept}>
            {chip.label}
          </ConceptTag>
        ))}
      </div>

      <ol className="mt-6 space-y-4">
        {steps
          .filter((s) => s.n <= step)
          .map((s) => (
            <motion.li
              key={s.n}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex items-center gap-3">
                <StepBadge n={s.n} />
                <span className="ops-body-strong text-[16px] text-slate-50">
                  {s.title}
                </span>
              </div>
              <div className="mt-4">{s.body}</div>
            </motion.li>
          ))}
      </ol>

      <div className="mt-5">
        <Button size="md" onClick={next}>
          {step < 4 ? "Next step" : "Replay"}
        </Button>
      </div>
    </InteractiveFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Extensions and qualifications                                       */
/* ------------------------------------------------------------------ */

const EXTENSIONS = [
  { concept: "risk" as const, label: "Taxes" },
  { concept: "market" as const, label: "Currencies" },
  { concept: "time" as const, label: "Term structure of interest rates" },
  { concept: "cashflow" as const, label: "Forecasting cashflows" },
  { concept: "value" as const, label: "Choosing the right discount rate for risk" },
];

/* ------------------------------------------------------------------ */
/* Lesson recap                                                        */
/* ------------------------------------------------------------------ */

const RECAP_POINTS = [
  "Assets are sequences of cashflows.",
  "Cashflows at different dates are different economic units.",
  "Present value converts future cashflows into today's dollars.",
  "NPV is the present value of benefits minus costs.",
  "Positive-NPV projects create value.",
  "Perpetuities and annuities are special cashflow patterns.",
  "Compounding affects the true annual rate.",
  "Inflation changes purchasing power.",
  "Real and nominal cashflows must be discounted consistently.",
];

/* ------------------------------------------------------------------ */
/* Mastery questions                                                   */
/* ------------------------------------------------------------------ */

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "Which best distinguishes inflation from the time value of money?",
    choices: [
      {
        id: "Time value is about now vs later; inflation is about what money can buy.",
        label:
          "Time value is about now vs later; inflation is about what money can buy.",
      },
      { id: "They are the same thing.", label: "They are the same thing." },
      {
        id: "Inflation only affects bonds.",
        label: "Inflation only affects bonds.",
      },
    ],
    correctId:
      "Time value is about now vs later; inflation is about what money can buy.",
    hint: "One is about timing, the other about purchasing power.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "Nominal return 15%, inflation 10%. Real return is approximately:",
    choices: [
      { id: "5%", label: "5%" },
      { id: "25%", label: "25%" },
      { id: "1.5%", label: "1.5%" },
    ],
    correctId: "5%",
    hint: "r_real ≈ r_nominal − inflation.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "Real cashflows should be discounted with:",
    choices: [
      { id: "Real discount rate", label: "Real discount rate" },
      { id: "Nominal discount rate", label: "Nominal discount rate" },
      { id: "Any rate", label: "Any rate" },
    ],
    correctId: "Real discount rate",
    hint: "Cashflows and the discount rate must speak the same language.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "Nominal cashflows should be discounted with:",
    choices: [
      { id: "Nominal discount rate", label: "Nominal discount rate" },
      { id: "Real discount rate", label: "Real discount rate" },
    ],
    correctId: "Nominal discount rate",
    hint: "Keep both sides of the NPV in nominal terms.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "In the lifetime-income example, the real interest rate was 2.94% and the present value was about:",
    choices: [
      { id: "$1,818,674", label: "$1,818,674" },
      { id: "$100,000", label: "$100,000" },
      { id: "$2,000,000", label: "$2,000,000" },
    ],
    correctId: "$1,818,674",
    hint: "Sum the 20 real cashflows discounted at the real rate.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Lesson3() {
  const report = useReportLessonComplete("present-value-inflation-real-nominal", [
    "real-vs-nominal",
    "compounding",
  ]);

  return (
    <PVLayout>
      <PVHero
        index="03"
        eyebrow="Lesson 3 · Module 2"
        heading="More dollars is not always more wealth."
        subheading="Inflation changes what money can buy. Present value only works when cashflows and discount rates speak the same language."
        primaryLabel="Start Real vs Nominal Value"
      />

      <div id="lesson-content" />
      <Reveal className="mt-10">
        <ModuleMap />
      </Reveal>

      {/* Part III */}
      <Reveal className="mt-12">
        <SectionHeading
          index="01"
          eyebrow="Part III"
          title="Inflation, Real vs Nominal, and Wrap-Up"
        />
      </Reveal>

      {/* 1. Overview */}
      <Reveal className="mt-6">
        <Panel>
          <div className="ops-caption text-[11px] text-slate-400">
            Lesson objectives
          </div>
          <h3 className="ops-interactive-title mt-2 text-2xl text-white">
            What you should understand in this lesson
          </h3>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            Inflation changes purchasing power. Students must distinguish real
            and nominal returns and use consistent discounting in NPV
            calculations.
          </p>
        </Panel>
      </Reveal>

      {/* 2. Inflation concept */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            Inflation is not the same as the time value of money
          </h3>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            Time value of money concerns money now versus money later. Inflation
            concerns what money can buy now versus later.
          </p>
        </Panel>
      </Reveal>

      {/* 3. Purchasing power */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            Real wealth depends on prices
          </h3>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            If your wealth rises by 10% but the prices of everything you buy also
            rise by 10%, you have more dollars but not more real purchasing
            power.
          </p>
        </Panel>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormulaCard
            label="Increase in cost of living"
            ariaLabel="I sub t plus k over I sub t equals one plus pi to the k"
          >
            <Var>I</Var>
            <Sub>t+k</Sub> / <Var>I</Var>
            <Sub>t</Sub> = (1 + π)<Sup>k</Sup>
          </FormulaCard>
          <FormulaCard
            label="Real wealth"
            ariaLabel="W real equals W sub t plus k over one plus pi to the k"
          >
            <Var>W</Var>
            <Sub>real</Sub> = <Var>W</Var>
            <Sub>t+k</Sub> / (1 + π)<Sup>k</Sup>
          </FormulaCard>
        </div>
      </Reveal>

      {/* 4. Real vs nominal return */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            Real return vs nominal return
          </h3>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            The nominal return is what you see quoted. The real return is what
            your wealth can actually buy after prices move.
          </p>
        </Panel>
        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <FormulaCard
            label="Exact real return"
            ariaLabel="Real return equals one plus nominal over one plus inflation minus one"
          >
            <Var>r</Var>
            <Sub>real</Sub> ={" "}
            <Frac
              num={
                <>
                  (1 + <Var>r</Var>
                  <Sub>nominal</Sub>)
                </>
              }
              den={<>(1 + inflation)</>}
            />{" "}
            − 1
          </FormulaCard>
          <FormulaCard
            label="Approximation"
            ariaLabel="Real return is approximately nominal minus inflation"
          >
            <Var>r</Var>
            <Sub>real</Sub> ≈ <Var>r</Var>
            <Sub>nominal</Sub> − inflation
          </FormulaCard>
        </div>
        <div className="mt-4">
          <Panel className="bg-white/[0.02]">
            <p className="ops-body text-[15px] leading-7 text-slate-200">
              If nominal return is 10% and inflation is 10%, real progress is
              about <span className="text-accent-amber">0%</span>. If nominal
              return is 15% and inflation is 10%, real return is approximately{" "}
              <span className="text-accent-green">5%</span>, but not exactly.
            </p>
          </Panel>
        </div>
      </Reveal>

      {/* 5. InflationFixIt interactive */}
      <Reveal className="mt-12">
        <InflationFixIt />
      </Reveal>

      {/* 6. Consistency rule */}
      <Reveal className="mt-12">
        <div className="rounded-2xl border border-accent-red/40 bg-accent-red/[0.07] p-6 sm:p-7">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center rounded-full border border-accent-red/50 bg-accent-red/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-red">
              High importance
            </span>
            <span className="ops-caption text-[11px] text-slate-400">
              Rule
            </span>
          </div>
          <h3 className="ops-interactive-title mt-4 text-2xl text-white">
            The consistency rule
          </h3>
          <p className="ops-definition mt-4 text-[17px] leading-8 text-slate-100 sm:text-lg">
            Discount nominal cashflows using nominal interest rates. Discount
            real cashflows using real interest rates. Never mix real cashflows
            with nominal discount rates or nominal cashflows with real discount
            rates.
          </p>
        </div>
      </Reveal>

      {/* 7. Worked Example 5 */}
      <Reveal className="mt-12">
        <WorkedExample5 />
      </Reveal>

      {/* 8. Extensions and qualifications */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            What gets harder after this lesson
          </h3>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            Real-world valuation adds frictions on top of the consistency rule.
            Each of these changes either the cashflows, the discount rate, or
            both.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXTENSIONS.map((ex) => (
              <div
                key={ex.label}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <ConceptTag concept={ex.concept}>{ex.concept}</ConceptTag>
                <div className="ops-body-strong mt-2.5 text-[14px] text-slate-100">
                  {ex.label}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </Reveal>

      {/* 9. Lesson recap */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            What Present Value Relations gives you
          </h3>
          <ol className="mt-5 space-y-3">
            {RECAP_POINTS.map((p, i) => (
              <li
                key={p}
                className="ops-body flex items-start gap-3 text-[15px] leading-7 text-slate-200"
              >
                <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-mono text-[12px] text-accent-cyan">
                  {i + 1}
                </span>
                {p}
              </li>
            ))}
          </ol>
        </Panel>
      </Reveal>

      {/* Mastery check */}
      <Reveal className="mt-12">
        <MasteryCheck
          title="Part III mastery check"
          passCount={4}
          onComplete={() => report(true)}
          continueLabel="Continue to CFO Decision Room"
          continueHref="/lessons/present-value-cfo-decision-room"
          skills={["real-vs-nominal", "compounding"]}
          onSkillsMastered={() => {}}
          questions={QUESTIONS}
        />
      </Reveal>

      {/* Summary */}
      <Reveal className="mt-12">
        <LessonSummary
          points={RECAP_POINTS}
          continueLabel="Continue to CFO Decision Room"
          continueHref="/lessons/present-value-cfo-decision-room"
          backLabel="Back to Special Cashflows"
          backHref="/lessons/present-value-perpetuities-annuities-compounding"
        />
      </Reveal>
    </PVLayout>
  );
}
