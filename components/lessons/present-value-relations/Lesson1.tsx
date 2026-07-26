"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import {
  Reveal,
  SectionHeading,
  Panel,
  DefinitionCard,
  ConceptTag,
  InteractiveFrame,
  TryItTag,
} from "@/components/lessons/intro-course-overview/shared";
import { Subsection, BodyLead } from "@/components/lessons/typography";
import { FormulaCard, Var, Sub, Sup, Frac, Inline } from "./FormulaCard";
import PVLayout from "./PVLayout";
import PVHero from "./PVHero";
import ModuleMap from "./ModuleMap";
import MasteryCheck, { type MasteryQuestion } from "./MasteryCheck";
import LessonSummary from "./LessonSummary";
import { useReportLessonComplete } from "@/lib/pv-progress";
import AssetScanner from "./AssetScanner";
import TimelineBuilder from "./TimelineBuilder";

const ASSET_EXAMPLES: {
  label: string;
  concept: "value" | "time" | "risk" | "market" | "cashflow";
}[] = [
  { label: "Business entity", concept: "value" },
  { label: "Property, plant & equipment", concept: "cashflow" },
  { label: "Patents and R&D", concept: "market" },
  { label: "Stocks, bonds & options", concept: "market" },
  { label: "Knowledge, reputation, opportunities", concept: "value" },
  { label: "Future salary stream", concept: "cashflow" },
];

const TIMELINE_NODES: { t: string; label: string }[] = [
  { t: "t = 0", label: "Today" },
  { t: "t = 1", label: "Year 1" },
  { t: "t = 2", label: "Year 2" },
  { t: "t = 3", label: "Year 3" },
  { t: "…", label: "…" },
  { t: "t = T", label: "Final date" },
];

/* ------------------------------------------------------------------ */
/* Worked example (step-by-step reveal, inline component)             */
/* ------------------------------------------------------------------ */

type ExampleCF = { amount: string; tone: "red" | "green"; note: string };
type WorkedExampleData = {
  title: string;
  caption: string;
  cashflows: { year0: ExampleCF; year1: ExampleCF; year2: ExampleCF };
  rate1: string;
  rate2: string;
  calc: ReactNode;
  decision: string;
  followup?: ReactNode;
};

function MiniTimeline({ cf }: { cf: WorkedExampleData["cashflows"] }) {
  const nodes: { t: string; cf: ExampleCF }[] = [
    { t: "Year 0", cf: cf.year0 },
    { t: "Year 1", cf: cf.year1 },
    { t: "Year 2", cf: cf.year2 },
  ];
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-5">
      <div className="relative flex items-start justify-between gap-3">
        <div
          className="pointer-events-none absolute left-0 right-0 top-[7px] h-px bg-accent-cyan/40"
          aria-hidden
        />
        {nodes.map((n) => (
          <div
            key={n.t}
            className="relative flex w-1/3 flex-col items-center text-center"
          >
            <span
              className={cn(
                "h-3.5 w-3.5 rounded-full ring-4 ring-ink-950",
                n.t === "Year 0" ? "bg-accent-amber" : "bg-accent-cyan",
              )}
              aria-hidden
            />
            <div className="mt-3 font-mono text-[12px] text-slate-300">
              {n.t}
            </div>
            <div
              className={cn(
                "mt-2 font-mono text-[15px] sm:text-[16px]",
                n.cf.tone === "red" ? "text-accent-red" : "text-accent-green",
              )}
            >
              {n.cf.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-mono text-[12px] text-accent-cyan">
      {n}
    </span>
  );
}

function WorkedExample({ data }: { data: WorkedExampleData }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => (s >= 4 ? 1 : s + 1));

  const steps: { n: number; title: string; body: ReactNode }[] = [
    {
      n: 1,
      title: "Draw the timeline",
      body: <MiniTimeline cf={data.cashflows} />,
    },
    {
      n: 2,
      title: "Write the NPV formula",
      body: (
        <FormulaCard label="Net present value" ariaLabel="NPV formula">
          <Var>V</Var>
          <Sub>0</Sub> = <Var>CF</Var>
          <Sub>0</Sub> +{" "}
          <Frac
            num={
              <>
                <Var>CF</Var>
                <Sub>1</Sub>
              </>
            }
            den={
              <>
                1+<Var>r</Var>
              </>
            }
          />{" "}
          +{" "}
          <Frac
            num={
              <>
                <Var>CF</Var>
                <Sub>2</Sub>
              </>
            }
            den={
              <>
                (1+<Var>r</Var>)<Sup>2</Sup>
              </>
            }
          />{" "}
          +{" "}
          <Frac
            num={
              <>
                <Var>CF</Var>
                <Sub>3</Sub>
              </>
            }
            den={
              <>
                (1+<Var>r</Var>)<Sup>3</Sup>
              </>
            }
          />{" "}
          + …
        </FormulaCard>
      ),
    },
    {
      n: 3,
      title: "Substitute the exchange rates and solve",
      body: data.calc,
    },
    {
      n: 4,
      title: "Decide",
      body: (
        <div>
          <div className="rounded-xl border border-accent-green/40 bg-accent-green/10 p-4">
            <div className="ops-caption text-[11px] text-accent-green">
              Decision
            </div>
            <p className="ops-body-strong mt-2 text-[16px] text-slate-50">
              {data.decision}
            </p>
          </div>
          {data.followup && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="ops-caption text-[11px] text-slate-400">
                Follow-up
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                {data.followup}
              </p>
            </div>
          )}
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
            {data.caption}
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          Step {Math.min(step, 4)} of 4
        </span>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        {data.title}
      </h3>

      {/* Cashflow summary + rates */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(
          [
            { t: "Year 0 · Today", cf: data.cashflows.year0 },
            { t: "Year 1", cf: data.cashflows.year1 },
            { t: "Year 2", cf: data.cashflows.year2 },
          ] as { t: string; cf: ExampleCF }[]
        ).map((row) => (
          <div
            key={row.t}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="ops-caption text-[11px] text-slate-400">
              {row.t}
            </div>
            <div
              className={cn(
                "mt-1.5 font-mono text-[16px]",
                row.cf.tone === "red" ? "text-accent-red" : "text-accent-green",
              )}
            >
              {row.cf.amount}
            </div>
            <div className="ops-muted mt-1 text-[12px] text-slate-400">
              {row.cf.note}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2.5">
        <ConceptTag concept="time">{data.rate1}</ConceptTag>
        <ConceptTag concept="time">{data.rate2}</ConceptTag>
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

const EXAMPLE_1: WorkedExampleData = {
  title: "Worked Example: Current investment, future cashflows",
  caption: "Worked example 01",
  cashflows: {
    year0: { amount: "−$10.0M", tone: "red", note: "Investment today" },
    year1: { amount: "+$5.0M", tone: "green", note: "Inflow" },
    year2: { amount: "+$7.0M", tone: "green", note: "Inflow" },
  },
  rate1: "$1 in Year 1 = $0.90 today",
  rate2: "$1 in Year 2 = $0.80 today",
  calc: (
    <FormulaCard
      label="Substitute and solve"
      ariaLabel="NPV equals negative 10 plus 5 times 0.90 plus 7 times 0.80 equals 0.1 million equals 100000 dollars"
    >
      <div className="space-y-2">
        <div>
          NPV = <span className="text-accent-red">−10.0</span> + 5.0(0.90) +
          7.0(0.80)
        </div>
        <div>
          = <span className="text-accent-red">−10.0</span> + 4.5 + 5.6
        </div>
        <div>
          = <span className="text-accent-green">$0.1M = $100,000</span>
        </div>
      </div>
    </FormulaCard>
  ),
  decision: "Accept. The project creates $100,000 of value today.",
  followup:
    "If a buyer pays in Year 2, ask for $125,000, because $0.1M ÷ $0.80 = $0.125M. Today's value converts back into any date's currency.",
};

const EXAMPLE_2: WorkedExampleData = {
  title: "Worked Example: Future investment",
  caption: "Worked example 02",
  cashflows: {
    year0: { amount: "+$2.0M", tone: "green", note: "Inflow today" },
    year1: { amount: "+$5.0M", tone: "green", note: "Inflow" },
    year2: { amount: "−$8.0M", tone: "red", note: "Future investment" },
  },
  rate1: "$1 in Year 1 = $0.90 today",
  rate2: "$1 in Year 2 = $0.80 today",
  calc: (
    <FormulaCard
      label="Substitute and solve"
      ariaLabel="NPV equals 2 plus 5 times 0.90 minus 8 times 0.80 equals 0.1 million equals 100000 dollars"
    >
      <div className="space-y-2">
        <div>NPV = 2.0 + 5.0(0.90) − 8.0(0.80)</div>
        <div>= 2.0 + 4.5 − 6.4</div>
        <div>
          = <span className="text-accent-green">$0.1M = $100,000</span>
        </div>
      </div>
    </FormulaCard>
  ),
  decision:
    "Accept. The future investment is still a cashflow and must be discounted with the correct sign.",
};

/* ------------------------------------------------------------------ */
/* Mastery questions                                                  */
/* ------------------------------------------------------------------ */

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "multi",
    prompt: "Select all that are assets under the cashflow definition.",
    choices: [
      { id: "A future salary stream", label: "A future salary stream" },
      { id: "A brand's reputation", label: "A brand's reputation" },
      { id: "This morning's weather", label: "This morning's weather" },
      { id: "A stock option", label: "A stock option" },
    ],
    correctIds: [
      "A future salary stream",
      "A brand's reputation",
      "A stock option",
    ],
    hint: "Weather is not a cashflow. The others generate or may generate future cash.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "Place the cashflow on a timeline: a $5.0M inflow received one year from now goes on which date?",
    choices: [
      { id: "t = 0", label: "t = 0" },
      { id: "t = 1", label: "t = 1" },
      { id: "t = 2", label: "t = 2" },
    ],
    correctId: "t = 1",
    hint: "Today is t = 0; one year from now is t = 1.",
  },
  {
    id: "q3",
    type: "explain",
    prompt:
      "Why can ¥150 + £300 not be added directly? (Mention conversion or currency.)",
    keywords: ["convert", "currency", "same"],
    hint: "Different currencies must be converted to a common unit first.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "Which is the correct NPV formula?",
    choices: [
      {
        id: "V0 = CF0 + CF1/(1+r) + CF2/(1+r)^2 ...",
        label: "V₀ = CF₀ + CF₁/(1+r) + CF₂/(1+r)² …",
      },
      { id: "V0 = CF0 × CF1 × r", label: "V₀ = CF₀ × CF₁ × r" },
      { id: "V1 = CF1 + CF2", label: "V₁ = CF₁ + CF₂" },
    ],
    correctId: "V0 = CF0 + CF1/(1+r) + CF2/(1+r)^2 ...",
    hint: "NPV sums each cashflow discounted back to today.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "A project has NPV = −$50,000. Do you accept or reject?",
    choices: [
      { id: "Accept", label: "Accept" },
      { id: "Reject", label: "Reject" },
    ],
    correctId: "Reject",
    hint: "Negative NPV destroys value.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function Lesson1() {
  const report = useReportLessonComplete("present-value-cashflows-assets-npv", [
    "timeline-reading",
    "discounting",
    "npv-decisions",
  ]);

  return (
    <PVLayout>
      <PVHero
        index="01"
        eyebrow="Lesson 1 · Module 2"
        heading="Future money is not the same as today's money."
        subheading="A company may receive cash next year. A bond may pay interest for decades. A career may generate salary for 20 years. Present value is the tool that converts future cashflows into today's terms."
        bullets={[
          "Turn assets into cashflow timelines",
          "Convert future cashflows into present value",
          "Decide whether projects create value",
          "Prepare for perpetuities, annuities, compounding, and inflation",
        ]}
        primaryLabel="Start Cashflows and NPV"
        secondaryLabel="View module map"
      />

      <div id="lesson-content" />
      <Reveal className="mt-10">
        <ModuleMap />
      </Reveal>

      {/* Part I */}
      <Reveal className="mt-section">
        <SectionHeading
          index="02"
          eyebrow="Part I"
          title="Cashflows, Assets, and the Present Value Operator"
        />
      </Reveal>

      {/* 1. Overview */}
      <Reveal className="mt-6">
        <Panel>
          <div className="ops-caption text-[11px] text-slate-400">
            Lesson objectives
          </div>
          <Subsection className="mt-2">
            What you should understand in this lesson
          </Subsection>
          <BodyLead className="mt-4">
            Finance starts by translating assets into cashflows. A factory, a
            patent, a stock, a bond, a business, a brand, and a career are
            different on the surface, but from a finance perspective they can
            all be analyzed as current and future cashflows.
          </BodyLead>
        </Panel>
      </Reveal>

      {/* 2. What is an asset? */}
      <Reveal className="mt-12">
        <Panel>
          <Subsection>
            What is an asset?
          </Subsection>
          <BodyLead className="mt-4">
            In everyday language, an asset sounds like something you own. In
            finance, that is not precise enough. A finance analyst asks: What
            cash will this asset generate, and when will that cash arrive?
          </BodyLead>
          <div className="mt-5">
            <DefinitionCard term="Asset">
              An asset is a sequence of current and future cashflows.
            </DefinitionCard>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ASSET_EXAMPLES.map((ex) => (
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
          <p className="ops-muted mt-5 text-[14px] leading-7 text-slate-400">
            A sequence of negative cashflows may be a liability, but it still
            fits the cashflow framework.
          </p>
        </Panel>
      </Reveal>

      {/* 3. Asset Scanner */}
      <Reveal className="mt-12">
        <AssetScanner />
      </Reveal>

      {/* 4. Timeline rule */}
      <Reveal className="mt-12">
        <Panel>
          <Subsection>
            Always draw a timeline
          </Subsection>
          <BodyLead className="mt-4">
            Before calculating anything, draw a timeline. A cashflow today is
            not the same as a cashflow in Year 1 or Year 2. If the cashflow is
            placed on the wrong date, the formula may look correct but the
            answer will be wrong.
          </BodyLead>
          <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-6">
            <div className="relative flex items-start justify-between gap-2">
              <div
                className="pointer-events-none absolute left-0 right-0 top-[7px] h-px bg-accent-cyan/40"
                aria-hidden
              />
              {TIMELINE_NODES.map((n) => (
                <div
                  key={n.t}
                  className="relative flex flex-col items-center text-center"
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full bg-accent-amber ring-4 ring-ink-950"
                    aria-hidden
                  />
                  <div className="mt-3 font-mono text-[13px] text-slate-100">
                    {n.t}
                  </div>
                  <div className="ops-caption mt-1 text-[11px] text-slate-400">
                    {n.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* 5. Timeline Builder */}
      <Reveal className="mt-12">
        <TimelineBuilder />
      </Reveal>

      {/* 6. Present value operator */}
      <Reveal className="mt-12">
        <Panel>
          <Subsection>
            The present value operator
          </Subsection>
          <BodyLead className="mt-4">
            The present value operator takes a sequence of cashflows and returns
            a value at a chosen date. In this lesson, the chosen date is usually
            today.
          </BodyLead>
        </Panel>
        <div className="mt-6">
          <FormulaCard
            label="Present value operator"
            ariaLabel="Value of an asset at time t equals V sub t of CF sub t, CF sub t plus 1, through CF sub T"
          >
            Value of Asset
            <Sub>t</Sub> = <Var>V</Var>
            <Sub>t</Sub>(<Var>CF</Var>
            <Sub>t</Sub>, <Var>CF</Var>
            <Sub>t+1</Sub>, <Var>CF</Var>
            <Sub>t+2</Sub>, … , <Var>CF</Var>
            <Sub>T</Sub>)
          </FormulaCard>
        </div>
      </Reveal>

      {/* 7. Currency analogy */}
      <Reveal className="mt-12">
        <Panel>
          <Subsection>
            Cashflows at different dates are different currencies
          </Subsection>
          <BodyLead className="mt-4">
            You would not directly add ¥150 and £300. You first convert them
            into the same currency. The same is true for money at different
            dates. You cannot directly add money today and money in Year 2 until
            both are converted into the same date.
          </BodyLead>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-lg border border-accent-amber/40 bg-accent-amber/10 px-3 py-1.5 font-mono text-[14px] text-accent-amber">
              ¥150 + £300 = ?
            </span>
            <span className="ops-muted text-[14px] text-slate-400">
              Meaningless until converted to a common currency.
            </span>
          </div>
          <div className="mt-6">
            <DefinitionCard term="Numeraire date">
              the date used as the common unit of measurement. Usually today, t
              = 0.
            </DefinitionCard>
          </div>
        </Panel>
      </Reveal>

      {/* 8. NPV */}
      <Reveal className="mt-12">
        <Panel>
          <Subsection>
            Net present value
          </Subsection>
          <BodyLead className="mt-4">
            Present value converts future cashflows into today&apos;s terms. Net
            present value includes the initial cost or investment.
          </BodyLead>
          <p className="ops-muted mt-4 text-[15px] leading-7 text-slate-300">
            If there is an initial investment,{" "}
            <Inline>
              CF<Sub>0</Sub> &lt; 0
            </Inline>
            . Any future{" "}
            <Inline>
              CF<Sub>t</Sub>
            </Inline>{" "}
            can also be negative.
          </p>
        </Panel>
        <div className="mt-6">
          <FormulaCard label="Net present value" ariaLabel="NPV formula">
            <Var>V</Var>
            <Sub>0</Sub> = <Var>CF</Var>
            <Sub>0</Sub> +{" "}
            <Frac
              num={
                <>
                  <Var>CF</Var>
                  <Sub>1</Sub>
                </>
              }
              den={
                <>
                  1+<Var>r</Var>
                </>
              }
            />{" "}
            +{" "}
            <Frac
              num={
                <>
                  <Var>CF</Var>
                  <Sub>2</Sub>
                </>
              }
              den={
                <>
                  (1+<Var>r</Var>)<Sup>2</Sup>
                </>
              }
            />{" "}
            +{" "}
            <Frac
              num={
                <>
                  <Var>CF</Var>
                  <Sub>3</Sub>
                </>
              }
              den={
                <>
                  (1+<Var>r</Var>)<Sup>3</Sup>
                </>
              }
            />{" "}
            + …
          </FormulaCard>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-accent-green/40 bg-accent-green/10 p-5">
            <div className="ops-caption text-[11px] text-accent-green">
              Value creator
            </div>
            <p className="ops-body-strong mt-2 text-[17px] text-slate-50">
              If NPV &gt; 0, accept.
            </p>
          </div>
          <div className="rounded-xl border border-accent-red/40 bg-accent-red/10 p-5">
            <div className="ops-caption text-[11px] text-accent-red">
              Value destroyer
            </div>
            <p className="ops-body-strong mt-2 text-[17px] text-slate-50">
              If NPV &lt; 0, reject.
            </p>
          </div>
        </div>
      </Reveal>

      {/* 9. Discount rate */}
      <Reveal className="mt-12">
        <Panel>
          <Subsection>
            Where does r come from?
          </Subsection>
          <BodyLead className="mt-4">
            The discount rate reflects the opportunity cost of capital: what
            investors could earn on comparable opportunities in financial
            markets. It is not chosen arbitrarily.
          </BodyLead>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <ConceptTag concept="market">Opportunity cost</ConceptTag>
            <ConceptTag concept="risk">Comparable alternatives</ConceptTag>
            <ConceptTag concept="value">Market-determined</ConceptTag>
          </div>
        </Panel>
      </Reveal>

      {/* 10. Worked example 1 */}
      <Reveal className="mt-12">
        <WorkedExample data={EXAMPLE_1} />
      </Reveal>

      {/* 11. Worked example 2 */}
      <Reveal className="mt-12">
        <WorkedExample data={EXAMPLE_2} />
      </Reveal>

      {/* 12. Closing note */}
      <Reveal className="mt-12">
        <Panel>
          <Subsection>
            What this lesson gives you
          </Subsection>
          <BodyLead className="mt-4">
            You can now value known cashflows if cashflow amounts, signs,
            timing, and exchange rates are known and there are no conversion
            frictions. Later lessons relax these assumptions.
          </BodyLead>
        </Panel>
      </Reveal>

      {/* Mastery check */}
      <Reveal className="mt-12">
        <MasteryCheck
          title="Part I mastery check"
          passCount={4}
          onComplete={() => report(true)}
          continueLabel="Continue to Special Cashflows"
          continueHref="/lessons/present-value-perpetuities-annuities-compounding"
          skills={["timeline-reading", "discounting", "npv-decisions"]}
          onSkillsMastered={() => {}}
          questions={QUESTIONS}
        />
      </Reveal>

      {/* Summary */}
      <Reveal className="mt-12">
        <LessonSummary
          points={[
            "Assets are sequences of cashflows.",
            "Cashflows at different dates are different economic units.",
            "Present value converts future cashflows into today's dollars.",
            "NPV is the present value of benefits minus costs.",
            "Positive-NPV projects create value.",
            "Perpetuities and annuities are special cashflow patterns.",
            "Compounding affects the true annual rate.",
            "Inflation changes purchasing power.",
            "Real and nominal cashflows must be discounted consistently.",
          ]}
          continueLabel="Continue to Special Cashflows"
          continueHref="/lessons/present-value-perpetuities-annuities-compounding"
          backLabel="Back to Module 1"
          backHref="/lessons/finance-roadmap-and-personal-application"
        />
      </Reveal>
    </PVLayout>
  );
}
