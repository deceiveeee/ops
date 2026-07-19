"use client";

import {
  Reveal,
  SectionHeading,
  Panel,
  DefinitionCard,
  FormulaExplainer,
  InlineMath,
  MasteryCheck,
  type MasteryQuestion,
  LessonSummary,
} from "./shared";
import EqLayout from "./EqLayout";
import EqSourcePanel from "./EqSourcePanel";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import { useReportEqComplete } from "@/lib/eq-progress";
import NorthstarCase from "./NorthstarCase";
import ExpandableQA from "./ExpandableQA";

const SUMMARY_POINTS = [
  "A defensible valuation requires separating temporary growth from sustainable growth.",
  "Terminal value captures all post-forecast dividends and often represents the majority of total value.",
  "Payout policy affects value only when ROE differs from the cost of equity.",
  "When ROE = r, changing payout changes dividend timing but not present value.",
  "A higher cost of equity reduces valuation without changing the company's cash generation.",
  "The simple PVGO decomposition is reliable only when the earnings baseline is sustainable.",
  "Temporary earnings growth cannot be used as a perpetual Gordon growth rate.",
  "Equity valuation is not mechanical — it requires judgment about which assumptions are plausible.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt:
      "Northstar's ROE falls to 10% (equal to r) in Year 4. What does this imply about mature-stage reinvestment?",
    choices: [
      {
        id: "zero",
        label:
          "Mature-stage reinvestment has zero NPV — growth continues but adds no value.",
      },
      { id: "nogrowth", label: "The company stops growing entirely." },
      { id: "negative", label: "Mature-stage reinvestment destroys value." },
    ],
    correctId: "zero",
    hint: "When ROE = r, each retained dollar earns exactly the required return.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "Why does raising early-stage payout from 30% to 60% reduce Northstar's value slightly?",
    choices: [
      {
        id: "roe",
        label:
          "Because retained capital earns 15% while investors require only 10% — sacrificing positive-NPV growth.",
      },
      { id: "less", label: "Because paying dividends is always bad." },
      { id: "tax", label: "Because dividends are taxed." },
    ],
    correctId: "roe",
    hint: "During Years 1–3, ROE (15%) exceeds r (10%). Less retention means fewer positive-NPV investments.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "Why does raising mature-stage payout from 60% to 90% leave value unchanged?",
    choices: [
      {
        id: "eqr",
        label:
          "Because mature ROE = r, so reinvestment is zero-NPV regardless of payout.",
      },
      { id: "growth", label: "Because the company has no growth." },
      { id: "div", label: "Because dividends don't matter." },
    ],
    correctId: "eqr",
    hint: "When ROE = r, any retention rate produces the same present value.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "A junior analyst computes PVGO = P₀ − EPS₁/r = 113.70 − 150 = −$36.30. What is wrong?",
    choices: [
      {
        id: "temp",
        label:
          "EPS₁ = $15 is temporary (15% ROE). Capitalizing it forever overstates assets-in-place.",
      },
      { id: "formula", label: "The PVGO formula is wrong." },
      { id: "price", label: "The stock price is wrong." },
    ],
    correctId: "temp",
    hint: "The simple decomposition requires a sustainable no-growth earnings baseline.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "An analyst says 'dividend yield 1% + next-year EPS growth 15% = 16% expected return.' What is wrong?",
    choices: [
      {
        id: "perp",
        label:
          "The Gordon formula requires sustainable perpetual growth, not one-year earnings growth.",
      },
      { id: "math", label: "The arithmetic is wrong." },
      { id: "yield", label: "The yield should be higher." },
    ],
    correctId: "perp",
    hint: "g in r = D₁/P₀ + g must be a long-run sustainable rate.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "When r − g is small, what happens to valuation sensitivity?",
    choices: [
      {
        id: "high",
        label:
          "Small changes in r or g cause large changes in estimated value.",
      },
      { id: "low", label: "Valuation becomes insensitive." },
      { id: "none", label: "Sensitivity is unaffected." },
    ],
    correctId: "high",
    hint: "P₀ = D₁/(r−g). When the denominator is small, small changes in either variable cause large swings.",
  },
];

export default function Lesson4_7() {
  const report = useReportEqComplete("equity-valuation-case-lab");

  return (
    <EqLayout>
      <PVHero
        index="4.7"
        eyebrow="Lesson 4.7 · Module 4"
        heading="Equity Valuation Case Lab"
        subheading="Integrate every concept from Lessons 4.1–4.6 into one connected analyst case. Build a forecast, calculate terminal value, evaluate payout policies, stress-test assumptions, diagnose errors, and prepare an investment memo for Northstar Systems."
        bullets={[
          "Build a multi-stage earnings and dividend forecast",
          "Evaluate payout policies when ROE ≠ r and when ROE = r",
          "Stress-test valuation under different costs of equity",
          "Diagnose common analyst errors and prepare an investment memo",
        ]}
        primaryLabel="Start the Northstar Case"
        secondaryLabel="View module map"
      />

      {/* Case brief */}
      <Reveal className="mt-8">
        <div className="glass-panel p-6 sm:p-7">
          <div className="ops-eyebrow text-[11px] text-slate-400">
            Case brief
          </div>
          <h2 className="ops-section-title mt-3 text-2xl sm:text-3xl">
            Northstar Systems
          </h2>
          <p className="ops-body mt-3 text-[16px] text-slate-200">
            You are an equity analyst preparing a recommendation for the
            investment committee. Northstar Systems currently enjoys temporary
            above-normal investment opportunities. Competition is expected to
            reduce its ROE after three years. Your job is to value the company,
            evaluate policy alternatives, stress-test assumptions, and produce a
            defensible memo.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-3 py-2">Assumption</th>
                  <th className="px-3 py-2">Years 1–3</th>
                  <th className="px-3 py-2">Year 4+</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="px-3 py-2.5 text-slate-300">BVPS₀</td>
                  <td className="px-3 py-2.5 font-mono text-slate-100">
                    $100.00
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-400">—</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="px-3 py-2.5 text-slate-300">ROE</td>
                  <td className="px-3 py-2.5 font-mono text-accent-green">
                    15%
                  </td>
                  <td className="px-3 py-2.5 font-mono text-accent-amber">
                    10%
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="px-3 py-2.5 text-slate-300">Payout ratio</td>
                  <td className="px-3 py-2.5 font-mono text-slate-100">30%</td>
                  <td className="px-3 py-2.5 font-mono text-slate-100">60%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 text-slate-300">
                    Cost of equity (r)
                  </td>
                  <td className="px-3 py-2.5 font-mono text-accent-cyan">
                    10%
                  </td>
                  <td className="px-3 py-2.5 font-mono text-accent-cyan">
                    10%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-accent-purple/30 bg-accent-purple/5 p-4">
            <div className="ops-caption text-[11px] text-accent-purple">
              Key economic context
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              During Years 1–3, ROE (15%) exceeds the cost of equity (10%), so
              reinvestment creates value. From Year 4 onward, ROE equals r, so
              mature-stage growth continues but has zero NPV. Northstar can
              still grow — but that growth does not add shareholder value.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Prior-lesson bridge */}
      <Reveal className="mt-8">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Lessons 4.1–4.6 built the toolkit: equity ownership, the DDM, the
            Gordon model, multi-stage growth, earnings retention (
            <InlineMath>{String.raw`g = b \times ROE`}</InlineMath>), and PVGO.
            Now you will apply all of them to a single company in a structured
            analyst workflow. This is not a collection of separate quiz
            questions — it is a connected case.
          </p>
        </Panel>
      </Reveal>

      {/* The case */}
      <Reveal className="mt-10">
        <NorthstarCase />
      </Reveal>

      {/* Module synthesis */}
      <Reveal className="mt-16">
        <SectionHeading
          index="★"
          eyebrow="Module 4 synthesis"
          title="Equity valuation is judgment, not arithmetic"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <div className="space-y-3">
            {[
              "Equity ownership → you hold a residual claim on the company's future economic benefits.",
              "Shareholder distributions → dividends, buybacks, acquisition proceeds, or capital gains.",
              "One-period valuation → P₀ = E[D₁ + P₁] / (1+r).",
              "DDM → P₀ = Σ E[Dₜ] / (1+r)ᵗ — the stock is worth the PV of all future distributions.",
              "Gordon Growth → P₀ = D₁/(r−g) — a shortcut that requires r > g and sustainable growth.",
              "Multi-stage growth → separate explicit forecasts from terminal value.",
              "Earnings and retention → g = b × ROE — growth comes from reinvesting at the firm's ROE.",
              "ROE vs cost of equity → growth creates value only when ROE > r.",
              "PVGO → P₀ = EPS₁/r + PVGO — decompose value into existing assets and future opportunities.",
              "P/E → P/E = 1/r + PVGO/EPS₁ — safer earnings and profitable growth both raise the multiple.",
              "Analyst judgment → which growth is temporary? Which earnings are sustainable? How sensitive is the conclusion?",
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-mono text-[12px] text-accent-cyan">
                  {i + 1}
                </span>
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  {point}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-accent-green/30 bg-accent-green/[0.06] p-4">
            <p className="ops-definition text-[16px]">
              Equity valuation is not a mechanical exercise of inserting numbers
              into a formula. A defensible valuation requires the analyst to
              determine which growth is temporary, which earnings are
              sustainable, whether reinvestment earns more than the cost of
              equity, whether terminal assumptions are economically plausible,
              and how sensitive the conclusion is to market-required returns.
            </p>
          </div>
        </Panel>
      </Reveal>

      {/* Mastery check */}
      <Reveal className="mt-12">
        <SectionHeading
          index="✓"
          eyebrow="Mastery"
          title="Case mastery check"
        />
      </Reveal>
      <Reveal className="mt-6">
        <MasteryCheck
          title="Lesson 4.7 mastery check"
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Risk and Return"
          continueHref="/lessons/risk-return-what-they-mean"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* Summary */}
      <Reveal className="mt-8">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Risk and Return"
          continueHref="/lessons/risk-return-what-they-mean"
          backLabel="Back to PVGO and P/E"
          backHref="/lessons/equity-growth-opportunities-pvgo-pe"
        />
      </Reveal>

      {/* Sources */}
      <Reveal className="mt-8">
        <EqSourcePanel
          sources={[
            "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo and Jiang Wang, Common Stock Problems and Solutions.",
            "MIT 15.401 Lecture 7: Equities slides and transcript.",
            "FINRA investor education, stocks, dividends, and shareholder rights.",
          ]}
        />
      </Reveal>
    </EqLayout>
  );
}
