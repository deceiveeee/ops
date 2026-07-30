"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";
import {
  Reveal,
  Panel,
  DefinitionCard,
  FormulaExplainer,
  Feedback,
  InteractiveFrame,
  MasteryCheck,
  type MasteryQuestion,
  LessonSummary,
  ConceptSection,
  CalculationWorksheet,
} from "./shared";
import SecurityMarketLineBuilder from "./SecurityMarketLineBuilder";
import MarketRiskPremiumShift from "./MarketRiskPremiumShift";
import SMLChart from "./SMLChart";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CAPMLayout from "./CAPMLayout";
import CAPMSourcePanel from "./CAPMSourcePanel";
import { useReportCAPMComplete } from "@/lib/capm-progress";

const LEARNING_OBJECTIVES = [
  "Explain why greater beta requires greater expected return.",
  "Define the market risk premium as compensation per unit of market exposure.",
  "Interpret beta as the quantity of market exposure and the market risk premium as the price per unit.",
  "Calculate the CAPM required return.",
  "Construct and read the Security Market Line.",
  "Explain why the SML is linear.",
  "Distinguish required return, forecast expected return, and realized return.",
  "Explain why high expected return is not automatically attractive.",
  "Distinguish the Security Market Line from the Capital Market Line.",
  "Interpret required return as investor opportunity cost and company cost of equity.",
];

const SUMMARY_POINTS = [
  "Beta measures the quantity of systematic market exposure an investment carries.",
  "The market risk premium E[R_M] − R_f is the price of one unit of market exposure.",
  "Required return = R_f + β × (E[R_M] − R_f): base compensation plus systematic-risk compensation.",
  "Each additional unit of beta earns the same premium, so the SML is a straight line.",
  "The SML plots β on the horizontal axis and E[R] on the vertical axis, with intercept R_f and slope equal to the market risk premium.",
  "A negative-beta asset may have a required return below R_f because of its hedging value.",
  "Higher expected return compensates for higher systematic risk; it is not a sign of superiority.",
  "Required return is an equilibrium benchmark, distinct from a forecast and from the realized return that actually occurs.",
  "The CML uses total volatility of efficient portfolios; the SML uses priced market risk (beta) of any investment.",
  "The same required return is, from different viewpoints, investor required return, company cost of equity, and project opportunity cost.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "What does the market risk premium E[R_M] − R_f represent?",
    choices: [
      { id: "a", label: "The additional expected return investors require for one full unit of market exposure" },
      { id: "b", label: "The total volatility of the market portfolio" },
      { id: "c", label: "The risk-free rate of return" },
    ],
    correctId: "a",
    hint: "It is the price per unit of market risk: the compensation for β = 1.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "Why is the Security Market Line a straight line?",
    choices: [
      { id: "a", label: "Because each unit of beta receives the same market risk premium, so compensation scales linearly with beta" },
      { id: "b", label: "Because the risk-free rate is always zero" },
      { id: "c", label: "Because beta is capped at one" },
    ],
    correctId: "a",
    hint: "A constant price per unit of market risk produces a constant slope.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "With R_f = 4% and a market risk premium of 6%, what is the required return for β = 1.5?",
    choices: [
      { id: "a", label: "13% (4% + 1.5 × 6%)" },
      { id: "b", label: "9%" },
      { id: "c", label: "7%" },
    ],
    correctId: "a",
    hint: "Required return = R_f + β × (E[R_M] − R_f).",
  },
  {
    id: "q4",
    type: "single",
    prompt: "Does a higher required return mean an investment is superior?",
    choices: [
      { id: "a", label: "No — it is compensation for bearing more systematic market risk, not a sign of better quality" },
      { id: "b", label: "Yes — higher required return always means a better investment" },
    ],
    correctId: "a",
    hint: "Higher expected return must be evaluated relative to the beta required to earn it.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "What distinguishes the Security Market Line from the Capital Market Line?",
    choices: [
      { id: "a", label: "The SML uses beta of any investment; the CML uses total volatility of efficient complete portfolios" },
      { id: "b", label: "They use the same risk measure but different axes" },
      { id: "c", label: "The CML prices systematic risk; the SML prices total risk" },
    ],
    correctId: "a",
    hint: "CML: total risk of efficient portfolios. SML: priced market risk of any investment.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "Is the CAPM required return a guaranteed realized outcome?",
    choices: [
      { id: "a", label: "No — it is an equilibrium benchmark, distinct from the return that actually occurs" },
      { id: "b", label: "Yes — managers must deliver it" },
    ],
    correctId: "a",
    hint: "Required return is a benchmark; realized return is whatever actually happens after uncertainty resolves.",
  },
];

function CentralQuestion() {
  return (
    <Reveal className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-accent-cyan/25 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="font-sans text-[12px] uppercase tracking-[0.18em] text-accent-cyan">Central question</div>
        <p className="ops-body mt-4 max-w-3xl text-[20px] leading-[1.5] text-white sm:text-[22px]">
          Beta tells us how much market risk an investment carries. How much expected return should
          investors require as compensation for carrying it?
        </p>
      </div>
    </Reveal>
  );
}

function CMLVsSMLPanel() {
  const rows: { label: string; cml: string; sml: string }[] = [
    { label: "Risk measure", cml: "Standard deviation", sml: "Beta" },
    { label: "Applies to", cml: "Efficient complete portfolios", sml: "Any asset, portfolio, or project" },
    { label: "Horizontal axis", cml: "Total volatility", sml: "Market exposure" },
    { label: "Main use", cml: "Efficient risk-return combinations", sml: "Required return for systematic risk" },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-[15px]">
        <thead>
          <tr className="border-b border-white/20 text-left">
            <th className="py-3 pr-6 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400" />
            <th className="py-3 pr-6 font-sans text-[13px] uppercase tracking-[0.14em] text-accent-purple">Capital Market Line</th>
            <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-accent-cyan">Security Market Line</th>
          </tr>
        </thead>
        <tbody className="text-slate-200">
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-white/5">
              <td className="py-3 pr-6 font-sans text-[13px] uppercase tracking-[0.12em] text-slate-400">{r.label}</td>
              <td className="py-3 pr-6 text-[15px]">{r.cml}</td>
              <td className="py-3 text-[15px]">{r.sml}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FinalCheckRow({
  prompt,
  options,
  correctId,
  answerLabel,
  feedback,
}: {
  prompt: ReactNode;
  options: { id: string; label: string }[];
  correctId: string;
  answerLabel: string;
  feedback: ReactNode;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === correctId;
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
      <div className="text-[16px] leading-[1.6] text-slate-200">{prompt}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const showCorrect = answered && opt.id === correctId;
          const showWrong = isSelected && !isCorrect;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={answered}
              onClick={() => setSelected(opt.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                showCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                showWrong && "border-accent-red bg-accent-red/15 text-accent-red",
                !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                answered && !showCorrect && !showWrong && "border-white/10 text-slate-500",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3">
          <Feedback status={isCorrect ? "correct" : "incorrect"}>
            <span className="block font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Expected: {answerLabel}</span>
            <span className="mt-1 block">{feedback}</span>
          </Feedback>
        </div>
      )}
    </div>
  );
}

export default function Lesson7_3() {
  const report = useReportCAPMComplete("security-market-line");

  return (
    <CAPMLayout>
      <PVHero
        index="7.3"
        eyebrow="Lesson 7.3 · Module 7 — The CAPM and APT"
        heading="The Security Market Line: What Return Is Enough for This Beta?"
        subheading="Beta measures how much market risk an investment carries. CAPM turns that exposure into a required expected return through one equilibrium price for market risk."
        bullets={[
          "Market risk premium = E[R_M] − R_f",
          "Required return = R_f + β × (E[R_M] − R_f)",
          "Beta = quantity of exposure; premium = price per unit",
          "The SML is a straight line",
          "Required return ≠ guaranteed realized return",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== SECTION 1 — THE MISSING PIECE ===================== */}
      <ConceptSection
        index="7.3.1"
        eyebrow="Section 1 · The missing piece"
        title="Higher expected return, higher systematic exposure"
        intro={<>From Lesson 7.2, beta measures how aggressively an asset participates in market movements. Consider two portfolios:</>}
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Portfolio</th>
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Beta</th>
                  <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Expected return</th>
                </tr>
              </thead>
              <tbody className="font-sans tabular-nums text-slate-100">
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-8">Defensive</td>
                  <td className="py-3 pr-8 text-accent-green">0.5</td>
                  <td className="py-3">7%</td>
                </tr>
                <tr>
                  <td className="py-3 pr-8">Aggressive</td>
                  <td className="py-3 pr-8 text-accent-red">1.5</td>
                  <td className="py-3">13%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">The question we cannot yet answer</div>
            <p className="mt-3 text-[20px] leading-[1.45] text-white sm:text-[22px]">
              Is the aggressive portfolio automatically better because its expected return is higher?
            </p>
          </div>
        </Reveal>
        <Reveal>
          <ul className="space-y-2.5">
            {[
              "The aggressive portfolio offers more expected return.",
              "It also bears more systematic market exposure.",
              "Returns must be evaluated relative to beta — not in isolation.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                <span className="text-[17px] leading-[1.6] text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required conclusion</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              Beta tells us how much market risk an investment carries, but not whether the offered
              expected return is enough compensation.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 2 — THE PRICE OF MARKET RISK ===================== */}
      <ConceptSection
        index="7.3.2"
        eyebrow="Section 2 · The price of market risk"
        title="The market risk premium"
        intro="To judge whether a return is sufficient, we first need the compensation investors require for one unit of market exposure."
      >
        <Reveal>
          <FormulaExplainer
            label="Market risk premium"
            tone="cyan"
            formula={String.raw`E[R_M] - R_f`}
            meaning="The market risk premium is the expected return on the market portfolio minus the risk-free rate."
            variables={[
              { symbol: String.raw`R_f`, description: "The return available without taking market exposure." },
              { symbol: String.raw`E[R_M]`, description: "The expected return on the market portfolio (one full unit of market exposure)." },
            ]}
            substitution={String.raw`E[R_M] - R_f = 10\% - 4\%`}
            result="= 6%"
            interpretation="Investors require 6 percentage points of additional expected return for bearing one full unit of market exposure."
          />
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { term: "Beta", gloss: "Quantity of market risk", tone: "cyan" as const },
              { term: "Market risk premium", gloss: "Compensation per unit", tone: "amber" as const },
              { term: "β × premium", gloss: "Total compensation for systematic risk", tone: "green" as const },
            ].map((c) => (
              <div
                key={c.term}
                className={cn(
                  "rounded-2xl border p-5",
                  c.tone === "cyan" && "border-accent-cyan/25 bg-accent-cyan/[0.05]",
                  c.tone === "amber" && "border-accent-amber/25 bg-accent-amber/[0.05]",
                  c.tone === "green" && "border-accent-green/25 bg-accent-green/[0.05]",
                )}
              >
                <div
                  className={cn(
                    "font-sans text-[12px] uppercase tracking-[0.16em]",
                    c.tone === "cyan" && "text-accent-cyan",
                    c.tone === "amber" && "text-accent-amber",
                    c.tone === "green" && "text-accent-green",
                  )}
                >
                  {c.term}
                </div>
                <p className="mt-2 text-[15px] leading-[1.6] text-slate-200">{c.gloss}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 3 — BUILD THE CAPM EQUATION ===================== */}
      <ConceptSection
        index="7.3.3"
        eyebrow="Section 3 · Build the CAPM equation"
        title="Base return plus systematic-risk compensation"
        intro="Combine the risk-free base with compensation proportional to beta."
      >
        <Reveal>
          <FormulaExplainer
            label="CAPM required return"
            tone="cyan"
            formula={String.raw`E[R_i] = R_f + \beta_i\bigl(E[R_M] - R_f\bigr)`}
            meaning="Required expected return equals the risk-free return plus compensation for the investment's systematic market exposure."
            variables={[
              { symbol: String.raw`E[R_i]`, description: "Required expected return for investment i." },
              { symbol: String.raw`R_f`, description: "Base return with no market exposure." },
              { symbol: String.raw`\beta_i`, description: "Quantity of market exposure for investment i." },
              { symbol: String.raw`(E[R_M] - R_f)`, description: "Price per unit of market exposure (the market risk premium)." },
            ]}
            interpretation="Required return = base compensation + systematic-risk compensation. This is an equilibrium benchmark, not a guaranteed future return."
          />
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">Labeled components</div>
            <div className="mt-4">
              <BlockMath>{String.raw`\underbrace{E[R_i]}_{\text{required expected return}} = \underbrace{R_f}_{\text{base return}} + \underbrace{\beta_i}_{\text{quantity of market exposure}} \times \underbrace{\bigl(E[R_M] - R_f\bigr)}_{\text{price per unit of market exposure}}`}</BlockMath>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="Plain-language statement">
            Required return equals the risk-free return plus compensation for the investment&apos;s
            systematic market exposure.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <Feedback status="info">
            The CAPM result is a required expected return — an equilibrium benchmark. It is not a
            promise of what the investment will actually deliver.
          </Feedback>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 4 — WHY THE RELATIONSHIP IS A STRAIGHT LINE ===================== */}
      <ConceptSection
        index="7.3.4"
        eyebrow="Section 4 · Why the relationship is a straight line"
        title="One price per unit of market risk"
        intro="With a 6% market risk premium, every unit of beta earns the same compensation."
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Beta</th>
                  <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-accent-cyan">Risk compensation (β × 6%)</th>
                </tr>
              </thead>
              <tbody className="font-sans tabular-nums text-slate-100">
                {[
                  { b: 0.0, c: "0%" },
                  { b: 0.5, c: "3%" },
                  { b: 1.0, c: "6%" },
                  { b: 1.5, c: "9%" },
                  { b: 2.0, c: "12%" },
                ].map((r) => (
                  <tr key={r.b} className="border-b border-white/5">
                    <td className="py-3 pr-8">{r.b.toFixed(1)}</td>
                    <td className="py-3 text-accent-cyan">{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal>
          <ul className="space-y-2.5">
            {[
              "Every additional unit of beta receives the same 6-percentage-point premium.",
              "Doubling beta doubles systematic-risk compensation.",
              "A constant price per unit creates a linear relationship.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                <span className="text-[17px] leading-[1.6] text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required conclusion</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              CAPM assigns one equilibrium price to market risk. Each additional unit of beta adds the
              same market risk premium to required return.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 5 — CONSTRUCT THE SML ===================== */}
      <ConceptSection
        index="7.3.5"
        eyebrow="Section 5 · Construct the Security Market Line"
        title="Plot beta against required return"
        intro={<>The Security Market Line puts <InlineMath>{String.raw`\beta`}</InlineMath> on the horizontal axis and <InlineMath>{String.raw`E[R]`}</InlineMath> on the vertical axis. Its intercept is <InlineMath>{String.raw`R_f`}</InlineMath> and its slope is the market risk premium.</>}
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { expr: String.raw`\beta = 0 \Rightarrow E[R] = 4\%`, tone: "text-accent-cyan" },
              { expr: String.raw`\beta = 0.5 \Rightarrow E[R] = 7\%`, tone: "text-accent-green" },
              { expr: String.raw`\beta = 1 \Rightarrow E[R] = 10\%`, tone: "text-accent-cyan" },
              { expr: String.raw`\beta = 1.5 \Rightarrow E[R] = 13\%`, tone: "text-accent-red" },
            ].map((r) => (
              <div key={r.expr} className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
                <span className={cn("font-sans text-[15px]", r.tone)}>
                  <BlockMath>{r.expr}</BlockMath>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-4">
            <SMLChart
              rf={4}
              mrp={6}
              points={[
                { beta: 0.5, onLine: true, label: "7%", tone: "green" },
                { beta: 1.5, onLine: true, label: "13%", tone: "red" },
                { beta: -0.25, onLine: true, label: "2.5%", tone: "purple" },
              ]}
              caption="The SML: intercept (0, 4%), market point (1, 10%), slope = 6%. The purple point shows a negative-beta asset."
            />
          </div>
        </Reveal>
        <Reveal>
          <div className="max-w-2xl">
            <BlockMath>{String.raw`\beta = -0.25 \;\Rightarrow\; E[R] = 4\% + (-0.25)(6\%) = 2.5\%`}</BlockMath>
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="Negative beta">
            A negative-beta asset may have a required return below the risk-free rate because it tends
            to move opposite the market and can offer hedging value. This is introduced briefly — most
            assets have positive beta.
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* ===================== INTERACTION 1 — BUILD THE SML ===================== */}
      <ConceptSection
        index="7.3.6"
        eyebrow="Interaction · Build the Security Market Line"
        title="Compute, then place, then read"
        intro="Find the market risk premium, locate the line, compute required returns for several betas, and explain why each is what it is. The full SML appears only after correct submission."
      >
        <Reveal>
          <InteractiveFrame>
            <SecurityMarketLineBuilder />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 6 — HIGHER RETURN IS COMPENSATION ===================== */}
      <ConceptSection
        index="7.3.7"
        eyebrow="Section 6 · Higher return is compensation, not superiority"
        title="All three can be fairly priced at once"
        intro="Return to the defensive, market-like, and aggressive portfolios — now with their CAPM-required returns."
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Portfolio</th>
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Beta</th>
                  <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-accent-cyan">CAPM-required return</th>
                </tr>
              </thead>
              <tbody className="font-sans tabular-nums text-slate-100">
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-8">Defensive</td>
                  <td className="py-3 pr-8 text-accent-green">0.5</td>
                  <td className="py-3">7%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-8">Market-like</td>
                  <td className="py-3 pr-8 text-accent-cyan">1.0</td>
                  <td className="py-3">10%</td>
                </tr>
                <tr>
                  <td className="py-3 pr-8">Aggressive</td>
                  <td className="py-3 pr-8 text-accent-red">1.5</td>
                  <td className="py-3">13%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.65] text-slate-200">
            All three portfolios may be fairly priced at the same time. The aggressive portfolio is not
            automatically better — its higher required return compensates investors for:
          </p>
          <ul className="mt-3 space-y-2.5">
            {[
              "stronger participation in market gains;",
              "stronger participation in market losses;",
              "greater non-diversifiable exposure.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />
                <span className="text-[17px] leading-[1.6] text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required takeaway</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              CAPM does not tell investors to seek the highest expected return. It tells them to compare
              expected return with the amount of beta required to earn it.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 7 — REQUIRED IS NOT REALIZED ===================== */}
      <ConceptSection
        index="7.3.8"
        eyebrow="Section 7 · Required return is not realized return"
        title="Three different concepts of return"
        intro="Do not confuse the equilibrium benchmark with a forecast or with what actually happens."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Required return</div>
              <p className="mt-3 text-[15px] leading-[1.6] text-slate-200">The return investors demand for the investment&apos;s beta.</p>
            </div>
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">Forecast expected return</div>
              <p className="mt-3 text-[15px] leading-[1.6] text-slate-200">The return an analyst currently believes the investment may produce.</p>
            </div>
            <div className="rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-purple">Realized return</div>
              <p className="mt-3 text-[15px] leading-[1.6] text-slate-200">The return that actually occurs after uncertainty is resolved.</p>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
            <div className="max-w-2xl">
              <BlockMath>{String.raw`R_i^{\text{required}} = 11.2\%`}</BlockMath>
            </div>
            <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
              The realized result for the same investment might be any of:
            </p>
            <div className="mt-3 max-w-2xl">
              <BlockMath>{String.raw`30\%, \quad 4\%, \quad -18\%`}</BlockMath>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required statement</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              Required return is an equilibrium benchmark, not a guaranteed realized outcome.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 8 — FORECAST VS REQUIRED ===================== */}
      <ConceptSection
        index="7.3.9"
        eyebrow="Section 8 · Forecast return versus required return"
        title="When a forecast differs from the benchmark"
        intro="If an analyst's forecast exceeds the CAPM-required return, the gap is a signal — not yet proof."
      >
        <Reveal>
          <FormulaExplainer
            label="Required return for β = 1.2"
            tone="cyan"
            formula={String.raw`R_i^{\text{required}} = R_f + \beta_i\bigl(E[R_M] - R_f\bigr)`}
            substitution={String.raw`R_i^{\text{required}} = 4\% + 1.2 \times 6\%`}
            result="= 11.2%"
            interpretation="With R_f = 4% and a market risk premium of 6%, an asset with β = 1.2 requires an expected return of 11.2%."
          />
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">Analyst forecast</div>
                <div className="mt-2">
                  <BlockMath>{String.raw`E[R_i]^{\text{forecast}} = 13\%`}</BlockMath>
                </div>
              </div>
              <div>
                <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">Difference</div>
                <div className="mt-2">
                  <BlockMath>{String.raw`13\% - 11.2\% = 1.8\%`}</BlockMath>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.65] text-slate-200">The 1.8% gap could mean any of the following:</p>
          <ul className="mt-3 space-y-2.5">
            {[
              "the investment may be underpriced;",
              "the forecast may be overly optimistic;",
              "beta may be estimated incorrectly;",
              "CAPM may omit another relevant source of risk.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                <span className="text-[17px] leading-[1.6] text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <Feedback status="info">
            The difference will later become the basis for measuring alpha, but it is not proof of
            mispricing or skill. Alpha belongs to Lesson 7.5.
          </Feedback>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 9 — WHY PRICES MOVE TOWARD THE SML ===================== */}
      <ConceptSection
        index="7.3.10"
        eyebrow="Section 9 · Why prices move assets toward the SML"
        title="Same beta, different offered return"
        intro="Equilibrium logic: if two assets carry identical systematic risk, prices must adjust until their required returns match."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-red">Asset A</div>
              <div className="mt-3 max-w-xs">
                <BlockMath>{String.raw`\beta_A = 1,\quad E[R_A] = 10\%`}</BlockMath>
              </div>
            </div>
            <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-green">Asset B</div>
              <div className="mt-3 max-w-xs">
                <BlockMath>{String.raw`\beta_B = 1,\quad E[R_B] = 14\%`}</BlockMath>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <ol className="space-y-2.5">
            {[
              "Investors prefer B for the same systematic exposure.",
              "Demand for B raises its current price.",
              "A higher current price lowers its expected return.",
              "Weaker demand lowers A's current price.",
              "A lower price raises A's expected return.",
            ].map((item, i) => (
              <li key={item} className="flex items-start gap-3">
                <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-accent-cyan/50 font-sans text-[12px] text-accent-cyan">{i + 1}</span>
                <span className="text-[17px] leading-[1.6] text-slate-200">{item}</span>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required conclusion</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              Under CAPM equilibrium, investments with the same beta should offer the same required
              expected return. This is the same market-clearing price logic introduced in Lesson 7.1.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 10 — SML VS CML ===================== */}
      <ConceptSection
        index="7.3.11"
        eyebrow="Section 10 · Security Market Line versus Capital Market Line"
        title="Two lines, two risk measures"
        intro="Both lines look similar, but they price different kinds of risk. Read the axes carefully."
      >
        <Reveal>
          <CMLVsSMLPanel />
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-purple">Capital Market Line</div>
              <div className="mt-3">
                <BlockMath>{String.raw`E[R_P] = R_f + \frac{\sigma_P}{\sigma_M}\bigl(E[R_M] - R_f\bigr)`}</BlockMath>
              </div>
            </div>
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Security Market Line</div>
              <div className="mt-3">
                <BlockMath>{String.raw`E[R_i] = R_f + \beta_i\bigl(E[R_M] - R_f\bigr)`}</BlockMath>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="Memory aid">
            <span className="block">CML: total risk of efficient portfolios.</span>
            <span className="mt-1 block">SML: priced market risk of any investment.</span>
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* ===================== INTERACTION 2 — CHANGE THE PRICE OF MARKET RISK ===================== */}
      <ConceptSection
        index="7.3.12"
        eyebrow="Interaction · Change the price of market risk"
        title="Predict what a steeper SML does"
        intro="Hold R_f constant and compare a 4% market risk premium against an 8% one. Predict the intercept, the slope, and which betas move most — then see the lines."
      >
        <Reveal>
          <InteractiveFrame>
            <MarketRiskPremiumShift />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 11 — THREE INTERPRETATIONS ===================== */}
      <ConceptSection
        index="7.3.13"
        eyebrow="Section 11 · Three interpretations of required return"
        title="Investor, company, and project"
        intro="The same number answers three different questions, depending on who asks."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Investor</div>
              <p className="mt-3 text-[15px] leading-[1.6] text-slate-200">The expected return I require for bearing this equity risk.</p>
            </div>
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">Company</div>
              <p className="mt-3 text-[15px] leading-[1.6] text-slate-200">The return shareholders require, so this is the company&apos;s cost of equity.</p>
            </div>
            <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-green">Project</div>
              <p className="mt-3 text-[15px] leading-[1.6] text-slate-200">The opportunity cost for a project with comparable systematic risk.</p>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
            <div className="max-w-2xl">
              <BlockMath>{String.raw`\text{investor required return} = \text{company cost of equity} = \text{opportunity cost for comparable risk}`}</BlockMath>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <Panel>
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-green">Project example</div>
            <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
              A company with beta 0.7 considers a project whose comparable businesses have beta 1.3.
              With <InlineMath>{String.raw`R_f = 4\%`}</InlineMath> and a market risk premium of{" "}
              <InlineMath>{String.raw`5.5\%`}</InlineMath>:
            </p>
            <div className="mt-3 max-w-xl">
              <BlockMath>{String.raw`R_{\text{project}} = 4\% + 1.3 \times 5.5\%`}</BlockMath>
            </div>
            <div className="mt-2 max-w-xl">
              <BlockMath>{String.raw`R_{\text{project}} = 11.15\%`}</BlockMath>
            </div>
          </Panel>
        </Reveal>
        <Reveal>
          <Feedback status="info">
            The discount rate should reflect the project&apos;s systematic risk, not automatically the
            parent company&apos;s existing beta.
          </Feedback>
        </Reveal>
      </ConceptSection>

      {/* ===================== EXERCISE — IS THE RETURN ENOUGH? ===================== */}
      <ConceptSection
        index="7.3.14"
        eyebrow="Exercise · Is the return enough?"
        title="Compute, then classify, then judge"
        intro={<>With <InlineMath>{String.raw`R_f = 3.5\%`}</InlineMath> and a market risk premium of <InlineMath>{String.raw`6\%`}</InlineMath>, compute each required return and compare it to the forecast. The classification appears only after you check.</>}
      >
        <Reveal>
          <InteractiveFrame>
            <CalculationWorksheet
              submitLabel="Check required returns"
              retryLabel="Clear wrong answers"
              groups={[
                {
                  heading: "CAPM-required returns (R_f = 3.5%, MRP = 6%)",
                  hint: "E[R] = 3.5% + β × 6%.",
                  fields: [
                    { id: "ra", label: "R_A for β = 0.6", answer: 7.1, tolerance: 0.05, unit: "%", hints: ["3.5% + 0.6 × 6%.", "= 7.1%."], solution: "3.5% + 0.6 × 6% = 7.1%." },
                    { id: "rb", label: "R_B for β = 1.0", answer: 9.5, tolerance: 0.05, unit: "%", hints: ["3.5% + 1.0 × 6%.", "= 9.5%."], solution: "3.5% + 1.0 × 6% = 9.5%." },
                    { id: "rc", label: "R_C for β = 1.4", answer: 11.9, tolerance: 0.05, unit: "%", hints: ["3.5% + 1.4 × 6%.", "= 11.9%."], solution: "3.5% + 1.4 × 6% = 11.9%." },
                  ],
                },
              ]}
              interpretationTone="correct"
              interpretation={
                <span>
                  Compare each forecast to its required return: A forecasts 6.5% vs 7.1% required
                  (below); B forecasts 10.0% vs 9.5% (approximately equal); C forecasts 13.0% vs 11.9%
                  (above).
                </span>
              }
              extraOnSolved={
                <div className="space-y-5">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-[15px]">
                      <thead>
                        <tr className="border-b border-white/20 text-left">
                          <th className="py-3 pr-6 font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400">Investment</th>
                          <th className="py-3 pr-6 font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400">β</th>
                          <th className="py-3 pr-6 font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400">Forecast</th>
                          <th className="py-3 pr-6 font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400">Required</th>
                          <th className="py-3 font-sans text-[12px] uppercase tracking-[0.14em] text-accent-cyan">Classification</th>
                        </tr>
                      </thead>
                      <tbody className="font-sans tabular-nums text-slate-100">
                        <tr className="border-b border-white/5">
                          <td className="py-3 pr-6">A</td><td className="py-3 pr-6">0.6</td><td className="py-3 pr-6">6.5%</td><td className="py-3 pr-6">7.1%</td>
                          <td className="py-3 text-accent-red">Below required</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-3 pr-6">B</td><td className="py-3 pr-6">1.0</td><td className="py-3 pr-6">10.0%</td><td className="py-3 pr-6">9.5%</td>
                          <td className="py-3 text-accent-cyan">≈ Equal to required</td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-6">C</td><td className="py-3 pr-6">1.4</td><td className="py-3 pr-6">13.0%</td><td className="py-3 pr-6">11.9%</td>
                          <td className="py-3 text-accent-green">Above required</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <FinalCheckRow
                    prompt="Can we conclude that Investment C is definitely the best investment?"
                    options={[
                      { id: "no", label: "No — the forecast, beta estimate, and CAPM model may all be imperfect" },
                      { id: "yes", label: "Yes — the highest forecast-above-required always wins" },
                    ]}
                    correctId="no"
                    answerLabel="No"
                    feedback="No. An above-required forecast is a signal worth investigating, not proof. The forecast may be optimistic, beta may be mis-estimated, and CAPM may omit another source of risk."
                  />
                </div>
              }
            />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== EXPLICIT ENDING ===================== */}
      <ConceptSection
        index="7.3.15"
        eyebrow="Explicit ending · The takeaway"
        title="Required return = base + compensation for systematic risk"
        intro="This conclusion must be visible before the completion gate."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <div className="max-w-2xl">
              <BlockMath>{String.raw`\boxed{\text{required return} = R_f + \beta \times \text{market risk premium}}`}</BlockMath>
            </div>
            <ul className="mt-6 space-y-2.5">
              {[
                "Beta measures the quantity of systematic market exposure.",
                "The market risk premium measures the price of that exposure.",
                "The Security Market Line combines them to determine the required expected return.",
                "A higher expected return is not automatically better. It must be evaluated relative to beta.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                  <span className="text-[17px] leading-[1.6] text-slate-100">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== FINAL CHECK ===================== */}
      <ConceptSection
        index="7.3.16"
        eyebrow="Final check · The core conclusions"
        title="Confirm what the SML does and does not mean"
        intro="Five questions on required return, linearity, and the distinction between concepts of return."
      >
        <Reveal>
          <InteractiveFrame>
            <div className="space-y-4">
              <FinalCheckRow
                prompt="1. What does the market risk premium represent?"
                options={[
                  { id: "a", label: "Compensation investors require per unit of market exposure" },
                  { id: "b", label: "The total volatility of the market" },
                  { id: "c", label: "The risk-free rate" },
                ]}
                correctId="a"
                answerLabel="Price per unit of market risk"
                feedback="It is the additional expected return required for one full unit (β = 1) of market exposure."
              />
              <FinalCheckRow
                prompt="2. Why is the SML a straight line?"
                options={[
                  { id: "a", label: "Each unit of beta earns the same market risk premium, so compensation scales linearly" },
                  { id: "b", label: "Because beta is always one" },
                ]}
                correctId="a"
                answerLabel="Constant price per unit"
                feedback="A constant price per unit of market risk produces a constant slope."
              />
              <FinalCheckRow
                prompt="3. Is a higher required return a sign of a better investment?"
                options={[
                  { id: "a", label: "No — it compensates for greater systematic risk, not superiority" },
                  { id: "b", label: "Yes — higher return always means better" },
                ]}
                correctId="a"
                answerLabel="No"
                feedback="No. Higher expected return must be judged relative to the beta required to earn it."
              />
              <FinalCheckRow
                prompt="4. Is the required return guaranteed to be realized?"
                options={[
                  { id: "a", label: "No — it is an equilibrium benchmark, not the realized outcome" },
                  { id: "b", label: "Yes — managers must deliver it" },
                ]}
                correctId="a"
                answerLabel="No"
                feedback="Required return is a benchmark. The realized return can differ substantially after uncertainty resolves."
              />
              <FinalCheckRow
                prompt="5. What risk measure does the SML use?"
                options={[
                  { id: "a", label: "Beta (market exposure) of any investment" },
                  { id: "b", label: "Standard deviation of efficient portfolios" },
                ]}
                correctId="a"
                answerLabel="Beta"
                feedback="The SML prices systematic market risk (beta). The CML uses total volatility of efficient complete portfolios."
              />
            </div>
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== TRANSITION TO 7.4 ===================== */}
      <ConceptSection
        index="7.3.17"
        eyebrow="Transition · Toward estimating beta"
        title="CAPM can compute a required return — once beta is known"
        intro="The SML turns beta into a required return. But where does a company's beta actually come from?"
        topMargin="mt-12"
      >
        <Reveal>
          <Panel>
            <p className="text-[17px] leading-[1.7] text-slate-200">
              In reality, beta is not directly observable. It must be estimated from how the security
              moved relative to a market benchmark — and that estimate is uncertain.
            </p>
            <div className="mt-4 max-w-xl">
              <BlockMath>{String.raw`E[R_i] = R_f + \hat{\beta}_i\bigl(E[R_M] - R_f\bigr)`}</BlockMath>
            </div>
            <p className="mt-3 text-[16px] leading-[1.65] text-slate-400">
              The hat means &ldquo;estimated from data.&rdquo; Lesson 7.4 builds beta from return data
              and explains why the estimate is not a permanent label.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-16">
        <MasteryCheck
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Estimating Beta"
          continueHref="/lessons/capm-estimating-beta"
          questions={QUESTIONS}
        />
      </Reveal>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Estimating Beta"
          continueHref="/lessons/capm-estimating-beta"
        />
      </Reveal>

      <Reveal className="mt-8">
        <CAPMSourcePanel />
      </Reveal>
    </CAPMLayout>
  );
}
