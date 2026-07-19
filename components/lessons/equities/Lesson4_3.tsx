"use client";

import {
  Reveal,
  SectionHeading,
  Panel,
  DefinitionCard,
  FormulaExplainer,
  InlineMath,
  Feedback,
  InteractiveFrame,
  TryItTag,
  MasteryCheck,
  type MasteryQuestion,
  LessonSummary,
} from "./shared";
import EqLayout from "./EqLayout";
import EqSourcePanel from "./EqSourcePanel";
import ExpandableQA from "./ExpandableQA";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import { useReportEqComplete } from "@/lib/eq-progress";
import { useState } from "react";
import GordonGrowthLab from "./GordonGrowthLab";

const LEARNING_OBJECTIVES = [
  "Value a constant-dividend stock as a perpetuity: P₀ = D / r.",
  "Value a constant-growth stock using the Gordon Growth Model: P₀ = D₁ / (r − g).",
  "Distinguish D₀ (just paid) from D₁ (the next dividend) and use the correct one.",
  "Explain why the model requires r > g, both mathematically and economically.",
  "Explain why small changes in r − g produce large changes in value.",
  "Decompose expected return into dividend yield plus growth.",
  "Solve the Gordon model for value, return, or growth depending on the unknown.",
  "Identify when the Gordon model is appropriate and when it is not.",
];

const SUMMARY_POINTS = [
  "A constant-dividend stock is valued as P₀ = D/r.",
  "The Gordon Growth Model values a growing perpetuity: P₀ = D₁/(r−g).",
  "D₀ was just paid; D₁ is the next dividend.",
  "The model requires r > g.",
  "Small changes in r−g cause large valuation changes.",
  "Expected return = dividend yield + growth rate.",
  "The Gordon model suits stable, mature companies with sustainable payout.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "A constant dividend of $5/year forever, r = 10%. What is P₀?",
    choices: [
      { id: "fifty", label: "$50" },
      { id: "fiftyfive", label: "$55" },
      { id: "fortyfive", label: "$45" },
    ],
    correctId: "fifty",
    hint: "P₀ = D / r = 5 / 0.10.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "D₀ = $2, g = 4%. What is D₁?",
    choices: [
      { id: "two08", label: "$2.08" },
      { id: "two", label: "$2.00" },
      { id: "two40", label: "$2.40" },
    ],
    correctId: "two08",
    hint: "D₁ = D₀ × (1 + g) = 2 × 1.04.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "D₁ = $2.08, r = 10%, g = 4%. What is P₀?",
    choices: [
      { id: "34", label: "$34.67" },
      { id: "fifty", label: "$50" },
      { id: "twentyfive", label: "$25" },
    ],
    correctId: "34",
    hint: "P₀ = D₁ / (r − g) = 2.08 / (0.10 − 0.04) = 2.08 / 0.06.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "P₀ = $60, D₁ = $2.40, g = 5%. What is the implied r?",
    choices: [
      { id: "nine", label: "9%" },
      { id: "five", label: "5%" },
      { id: "four", label: "4%" },
    ],
    correctId: "nine",
    hint: "r = D₁/P₀ + g = 2.40/60 + 0.05 = 0.04 + 0.05.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "What happens when g ≥ r in the Gordon Growth Model?",
    choices: [
      { id: "invalid", label: "The Gordon model is invalid" },
      { id: "negative", label: "P₀ is negative" },
      { id: "zero", label: "P₀ is zero" },
    ],
    correctId: "invalid",
    hint: "The series only converges when g < r. Otherwise the model cannot be used (the value is not negative or zero — the model simply does not apply).",
  },
  {
    id: "q6",
    type: "single",
    prompt: "Under the Gordon model, the expected total return equals:",
    choices: [
      { id: "yieldgrowth", label: "Dividend yield + g" },
      { id: "justg", label: "Just g" },
      { id: "justyield", label: "Just the dividend yield" },
    ],
    correctId: "yieldgrowth",
    hint: "Rearranging P₀ = D₁/(r−g) gives r = D₁/P₀ + g.",
  },
];

export default function Lesson4_3() {
  const report = useReportEqComplete("equity-gordon-growth-model");

  return (
    <EqLayout>
      {/* =================================================================== */}
      {/* HERO                                                                */}
      {/* =================================================================== */}
      <PVHero
        index="4.3"
        eyebrow="Lesson 4.3 · Module 4"
        heading="The Gordon Growth Model"
        subheading="Turn the DDM into usable constant-dividend and constant-growth formulas. The model's usefulness depends on realistic long-run assumptions, especially the gap between r and g."
        bullets={[
          "Constant-dividend stock = perpetuity",
          "Gordon Growth: P₀ = D₁/(r−g)",
          "D₀ was just paid; D₁ is next",
          "Why r > g is required",
          "Expected return = dividend yield + growth",
        ]}
        primaryLabel="Start"
        secondaryLabel="View module map"
      />

      {/* =================================================================== */}
      {/* LEARNING OBJECTIVES                                                 */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <div className="glass-panel p-6 sm:p-7">
          <div className="ops-eyebrow text-[11px] text-slate-400">
            Learning objectives
          </div>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            By the end of this lesson, you should be able to:
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LEARNING_OBJECTIVES.map((o, i) => (
              <li key={o} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-mono text-[12px] text-accent-cyan">
                  {i + 1}
                </span>
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  {o}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* PRIOR-LESSON BRIDGE                                                 */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <Panel>
          <div className="ops-caption text-[11px] text-accent-green">
            From Lesson 4.2
          </div>
          <p className="ops-body mt-2 text-[16px] text-slate-200">
            In Lesson 4.2 we derived the Dividend Discount Model by pushing the
            resale price infinitely far into the future:{" "}
            <InlineMath>{String.raw`P_0 = \sum_{t=1}^{\infty} E[D_t]/(1+r)^t`}</InlineMath>
            . That formula is correct but impractical — forecasting every
            individual dividend forever is impossible. This lesson introduces
            two simplifying assumptions that turn the DDM into closed-form
            formulas you can actually compute: constant dividends, and constant
            growth.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 1 — Begin from the general DDM                              */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.1"
          eyebrow="Section 1"
          title="Begin from the general DDM"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="General Dividend Discount Model"
          formula={String.raw`P_0 = \sum_{t=1}^{\infty} \frac{E[D_t]}{(1+r)^t}`}
          meaning="The stock's value is the present value of all expected future dividends."
          interpretation="This is exact in principle but unusable in practice: forecasting E[D_t] for every year into the indefinite future is not feasible. We need simplifying assumptions."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 2 — Constant-dividend stock                                 */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.2"
          eyebrow="Section 2"
          title="A constant-dividend stock is a perpetuity"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Suppose a company pays a{" "}
            <strong className="text-white">constant</strong>{" "}
            <InlineMath>{String.raw`\$5`}</InlineMath> dividend every year,
            forever, and the required return is{" "}
            <InlineMath>{String.raw`r = 10\%`}</InlineMath>. The DDM becomes a
            familiar geometric series:
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Constant-dividend series"
          formula={String.raw`P_0 = \frac{5}{1.10} + \frac{5}{1.10^2} + \frac{5}{1.10^3} + \cdots`}
          meaning="Each $5 dividend is discounted back by one more power of (1+r). This is a level perpetuity."
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Perpetuity formula"
          tone="green"
          formula={String.raw`P_0 = \frac{D}{r}`}
          meaning="A level perpetuity paying D each period, discounted at r, is worth D divided by r."
          substitution={String.raw`P_0 = \frac{5}{0.10}`}
          result="P₀ = $50"
          interpretation="At $50 the dividend yield is D/P₀ = 5/50 = 10%, which equals r. Growth is 0%, so the total expected return is 10%."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 3 — Dividend and discount-rate effects                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.3"
          eyebrow="Section 3"
          title="Dividend and discount-rate effects"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            From <InlineMath>{String.raw`P_0 = D/r`}</InlineMath> the
            comparative statics are immediate:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-green">
                Higher dividend D
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                D ↑ → P₀ ↑. More cash to shareholders means more value.
              </p>
            </div>
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-red">
                Higher required return r
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                r ↑ → P₀ ↓. A higher discount rate shrinks the present value of
                the same dividends.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 4 — Constant dividend growth                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.4"
          eyebrow="Section 4"
          title="Constant dividend growth"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Now relax the assumption slightly: instead of a flat dividend,
            assume the dividend grows at a constant rate{" "}
            <InlineMath>{String.raw`g`}</InlineMath> forever. So{" "}
            <InlineMath>{String.raw`D_2 = D_1(1+g)`}</InlineMath>,{" "}
            <InlineMath>{String.raw`D_3 = D_1(1+g)^2`}</InlineMath>, and so on.
            The same geometric-series math collapses the infinite sum into a
            single, elegant formula.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="The Gordon Growth Model"
          tone="green"
          formula={String.raw`P_0 = \frac{D_1}{r-g}`}
          meaning="A dividend growing at a constant rate g forever, discounted at r, is worth next year's dividend divided by (r − g). This is a growing perpetuity."
          variables={[
            { symbol: String.raw`P_0`, description: "stock value today" },
            {
              symbol: String.raw`D_1`,
              description: "next dividend (one period from now)",
            },
            {
              symbol: String.raw`r`,
              description: "required return (cost of equity)",
            },
            {
              symbol: String.raw`g`,
              description: "constant dividend growth rate",
            },
          ]}
          interpretation="This is the Gordon Growth Model (also called the constant-growth DDM). It is the workhorse formula for valuing mature, stable dividend payers."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 5 — Full worked example                                     */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.5"
          eyebrow="Section 5"
          title="A full worked example"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Worked example"
          tone="green"
          formula={String.raw`P_0 = \frac{D_1}{r-g} = \frac{D_0(1+g)}{r-g}`}
          meaning="Given D₀ = $2, g = 4%, r = 10%. First compute D₁, then plug into the model."
          substitution={String.raw`D_1 = \$2 \times (1.04) = \$2.08, \quad P_0 = \frac{\$2.08}{0.10 - 0.04} = \frac{\$2.08}{0.06}`}
          result="P₀ = $34.67"
          interpretation="A stock that just paid a $2 dividend, growing at 4% per year, with a 10% required return, is worth $34.67 per share."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 6 — D₀ vs D₁                                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.6"
          eyebrow="Section 6"
          title="D₀ vs. D₁: which dividend do you use?"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A common and costly mistake is using the wrong dividend. The two
            look similar but are separated by one full period.
          </p>
          <ul className="mt-4 space-y-2.5">
            <li className="flex items-start gap-3">
              <span
                className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber"
                aria-hidden
              />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">D₀</strong> — the dividend{" "}
                <em>just paid</em>. If you buy today, you will{" "}
                <strong className="text-white">not</strong> receive D₀; it
                already went to the previous owner.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span
                className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green"
                aria-hidden
              />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">D₁</strong> — the <em>next</em>{" "}
                dividend, the first one available to a buyer today. This is what
                enters the Gordon formula.
              </span>
            </li>
          </ul>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            If you are given D₀, grow it one period first.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Gordon model using D₀"
          tone="amber"
          formula={String.raw`P_0 = \frac{D_0(1+g)}{r-g}`}
          meaning="When the most recent dividend D₀ is what you know, grow it by one period to obtain D₁ = D₀(1+g), then divide by (r − g)."
          interpretation="The numerator must always be the next dividend the buyer will receive — never the one already paid."
        />
      </Reveal>
      <Reveal className="mt-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Payment timeline
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[13px] text-slate-200">
            <span className="rounded-md border border-accent-amber/40 bg-accent-amber/10 px-3 py-1.5 text-accent-amber">
              D₀ (just paid)
            </span>
            <span className="text-slate-500" aria-hidden>
              —
            </span>
            <span className="rounded-md border border-accent-cyan/40 bg-accent-cyan/15 px-3 py-1.5 text-accent-cyan">
              You buy today
            </span>
            <span className="text-slate-500" aria-hidden>
              —
            </span>
            <span className="rounded-md border border-accent-green/40 bg-accent-green/10 px-3 py-1.5 text-accent-green">
              D₁ (first dividend you receive)
            </span>
          </div>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 7 — Why r > g                                               */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.7"
          eyebrow="Section 7"
          title="Why the model requires r > g"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The Gordon formula only makes sense when{" "}
            <InlineMath>{String.raw`r > g`}</InlineMath>. There are two reasons.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Mathematical
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                The infinite series converges only when{" "}
                <InlineMath>{String.raw`(1+g)/(1+r) < 1`}</InlineMath>, i.e.{" "}
                <InlineMath>{String.raw`g < r`}</InlineMath>. Otherwise the sum
                diverges and no finite price exists.
              </p>
            </div>
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-amber">
                Economic
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                No company can grow faster than the overall economy forever. A
                perpetual growth rate above the economy&apos;s long-run rate is
                not credible.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-accent-red/30 bg-accent-red/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-red">
              What when g ≥ r?
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              The model is <strong className="text-white">invalid</strong>. It
              does <strong className="text-white">not</strong> imply negative
              value or infinite value — it simply cannot be used. You would need
              a different model, such as multi-stage growth.
            </p>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 8 — Sensitivity to r − g                                    */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.8"
          eyebrow="Section 8"
          title="Sensitivity to the r − g gap"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Hold <InlineMath>{String.raw`D_1 = \$2`}</InlineMath> and{" "}
            <InlineMath>{String.raw`r = 10\%`}</InlineMath> fixed, and vary{" "}
            <InlineMath>{String.raw`g`}</InlineMath> from 2% to 9%. Watch how{" "}
            <InlineMath>{String.raw`P_0`}</InlineMath> explodes as{" "}
            <InlineMath>{String.raw`g`}</InlineMath> approaches{" "}
            <InlineMath>{String.raw`r`}</InlineMath>.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left">
              <thead>
                <tr className="text-[12px] text-slate-400">
                  <th className="border-b border-white/15 pb-2 pr-6 font-mono font-normal">
                    g
                  </th>
                  <th className="border-b border-white/15 pb-2 pr-6 font-mono font-normal">
                    r − g
                  </th>
                  <th className="border-b border-white/15 pb-2 font-mono font-normal">
                    P₀ = 2 / (r − g)
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-[15px] text-slate-200">
                <tr>
                  <td className="py-1.5 pr-6">2%</td>
                  <td className="py-1.5 pr-6">8%</td>
                  <td className="py-1.5 text-slate-100">$25.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-6">4%</td>
                  <td className="py-1.5 pr-6">6%</td>
                  <td className="py-1.5 text-slate-100">$33.33</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-6">6%</td>
                  <td className="py-1.5 pr-6">4%</td>
                  <td className="py-1.5 text-slate-100">$50.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-6">8%</td>
                  <td className="py-1.5 pr-6">2%</td>
                  <td className="py-1.5 text-accent-amber">$100.00</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-6">9%</td>
                  <td className="py-1.5 pr-6">1%</td>
                  <td className="py-1.5 text-accent-red">$200.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            Moving <InlineMath>{String.raw`g`}</InlineMath> from 2% to 9% — a
            seven-point change in an assumption about the indefinite future —
            multiplies the value by{" "}
            <strong className="text-white">eight times</strong>. This is why
            realistic, defensible long-run growth assumptions matter enormously
            when using the Gordon model.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 9 — Expected return decomposition                           */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.9"
          eyebrow="Section 9"
          title="Expected return = dividend yield + growth"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Rearrange the Gordon model"
          tone="cyan"
          formula={String.raw`r = \frac{D_1}{P_0} + g`}
          meaning="Solving the Gordon model for r splits the expected total return into two pieces: the dividend yield (D₁/P₀) plus the growth rate g."
          interpretation="Under the Gordon assumptions, the price grows at g, so P₁ = P₀(1 + g) and the capital-gains yield (P₁ − P₀)/P₀ equals g. Total expected return is therefore dividend yield plus growth."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 10 — Return example                                         */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.10"
          eyebrow="Section 10"
          title="A return example"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Return decomposition example"
          tone="green"
          formula={String.raw`r = \frac{D_1}{P_0} + g`}
          meaning="P₀ = $40, D₁ = $2, g = 5%. The dividend yield is D₁/P₀, and the capital-gains yield is g."
          substitution={String.raw`r = \frac{\$2}{\$40} + 5\% = 5\% + 5\%`}
          result="r = 10%"
          interpretation="Next year the price should be P₁ = $40 × (1.05) = $42. Total gain = $2 dividend + $2 price increase = $4, which is 10% of the $40 paid."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 11 — Solve for different variables                          */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.11"
          eyebrow="Section 11"
          title="Solve for value, return, or growth"
        />
      </Reveal>
      <Reveal className="mt-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
            <div className="ops-caption text-[11px] text-accent-cyan">
              Solve for value
            </div>
            <div className="mt-3 rounded-lg border border-white/10 bg-ink-950/50 px-3 py-4 text-slate-50">
              <InlineMath>{String.raw`P_0 = \frac{D_1}{r-g}`}</InlineMath>
            </div>
            <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
              Given D₁, r, and g, compute the price.
            </p>
          </div>
          <div className="rounded-xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
            <div className="ops-caption text-[11px] text-accent-green">
              Solve for return
            </div>
            <div className="mt-3 rounded-lg border border-white/10 bg-ink-950/50 px-3 py-4 text-slate-50">
              <InlineMath>{String.raw`r = \frac{D_1}{P_0} + g`}</InlineMath>
            </div>
            <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
              Given the market price P₀, D₁, and g, infer the implied required
              return.
            </p>
          </div>
          <div className="rounded-xl border border-accent-purple/25 bg-accent-purple/[0.04] p-5">
            <div className="ops-caption text-[11px] text-accent-purple">
              Solve for growth
            </div>
            <div className="mt-3 rounded-lg border border-white/10 bg-ink-950/50 px-3 py-4 text-slate-50">
              <InlineMath>{String.raw`g = r - \frac{D_1}{P_0}`}</InlineMath>
            </div>
            <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
              Given r, P₀, and D₁, infer the growth rate the market is pricing
              in.
            </p>
          </div>
        </div>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] text-slate-300">
            These &ldquo;implied&rdquo; values are{" "}
            <strong className="text-white">model-dependent estimates</strong>.
            Solving for an implied growth rate tells you what the market must be
            assuming for the Gordon model to hold — it does not tell you whether
            that assumption is realistic.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 12 — Model limitations                                      */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.12"
          eyebrow="Section 12"
          title="When the Gordon model fits — and when it does not"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The Gordon model is a precision tool, not a universal one. It fits
            companies whose dividends plausibly grow at a steady rate forever.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-green">
                Appropriate for
              </div>
              <ul className="mt-2 space-y-2">
                {[
                  "Stable, mature companies",
                  "Sustainable, predictable payout ratios",
                  "Constant, credible long-run growth",
                  "Stable required return r",
                  "Indefinite dividend stream",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2.5">
                    <span
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green"
                      aria-hidden
                    />
                    <span className="ops-body text-[15px] leading-7 text-slate-200">
                      {x}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-red">
                Inappropriate for
              </div>
              <ul className="mt-2 space-y-2">
                {[
                  "Early-stage growth companies",
                  "No foreseeable dividend or payout",
                  "Unstable or cyclical dividends",
                  "Restructurings and turnarounds",
                  "Temporarily very high growth (g would approach or exceed r)",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2.5">
                    <span
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red"
                      aria-hidden
                    />
                    <span className="ops-body text-[15px] leading-7 text-slate-200">
                      {x}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-accent-purple/30 bg-accent-purple/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-purple">
              Preview: multi-stage growth
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              Real companies often grow fast for a while, then settle. A future
              lesson introduces{" "}
              <strong className="text-white">multi-stage</strong> models: value
              an initial high-growth period explicitly, then attach a Gordon
              terminal value once growth normalizes.
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <GordonGrowthLab />
      </Reveal>

      {/* =================================================================== */}
      {/* INLINE CONCEPT CHECKS                                               */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.13"
          eyebrow="Concept check"
          title="Two quick checks"
        />
      </Reveal>
      <Reveal className="mt-6">
        <ConceptChecks />
      </Reveal>

      {/* =================================================================== */}
      {/* EXPANDABLE Q&A                                                      */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.14"
          eyebrow="Common questions"
          title="Questions on growth, value, and the r > g condition"
        />
      </Reveal>
      <Reveal className="mt-6">
        <div className="space-y-3">
          <ExpandableQA question="Why does the model use D₁ instead of D₀?">
            <p>
              Because of the payment timeline.{" "}
              <InlineMath>{String.raw`D_0`}</InlineMath> was just paid — it
              already went to the previous owner. When you buy the share today,
              the first dividend <em>you</em> will receive is{" "}
              <InlineMath>{String.raw`D_1`}</InlineMath>, one period from now.
              The Gordon formula values the stream of dividends starting from
              the buyer&apos;s first receipt, so the numerator must be{" "}
              <InlineMath>{String.raw`D_1`}</InlineMath>. If you are given{" "}
              <InlineMath>{String.raw`D_0`}</InlineMath>, grow it once:{" "}
              <InlineMath>{String.raw`D_1 = D_0(1+g)`}</InlineMath>.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Does g > r mean the company is worthless?">
            <p>
              No. It means the{" "}
              <strong className="text-white">Gordon model</strong> cannot be
              applied. When <InlineMath>{String.raw`g \ge r`}</InlineMath>, the
              infinite series does not converge, so the constant-growth
              perpetuity formula has no finite answer. This says nothing bad
              about the company — it says the assumption of constant growth at
              that rate, forever, is not credible. You would switch to a
              different model (for example, multi-stage growth) that lets growth
              slow down over time.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Is the stock expected to grow at rate r?">
            <p>
              No. Under the Gordon model, the <em>price</em> grows at{" "}
              <InlineMath>{String.raw`g`}</InlineMath>, not at{" "}
              <InlineMath>{String.raw`r`}</InlineMath>. The expected total
              return
              <em> to the investor</em> is{" "}
              <InlineMath>{String.raw`r`}</InlineMath>, and it comes from two
              sources: the dividend yield{" "}
              <InlineMath>{String.raw`D_1/P_0`}</InlineMath> plus the price
              growth <InlineMath>{String.raw`g`}</InlineMath>. The stock price
              itself appreciates at the dividend growth rate.
            </p>
          </ExpandableQA>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* MASTERY CHECK                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="04"
          eyebrow="Mastery"
          title="Summary and mastery check"
        />
      </Reveal>
      <Reveal className="mt-6">
        <MasteryCheck
          title="Lesson 4.3 mastery check"
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Multi-Stage Growth Valuation"
          continueHref="/lessons/equity-multi-stage-growth-valuation"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Multi-Stage Growth Valuation"
          continueHref="/lessons/equity-multi-stage-growth-valuation"
          replayLabel="Replay this lesson"
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SOURCES AND NOTES                                                   */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <EqSourcePanel />
      </Reveal>
    </EqLayout>
  );
}

function ConceptChecks() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Concept checks
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Check 1 */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <h4 className="ops-interactive-title text-lg text-white">
            Check 1 — Gordon valuation
          </h4>
          <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
            D₀ = $3, g = 4%, r = 12%. Find D₁ and P₀.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setChecked1(true)}
              className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-4 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            >
              Reveal
            </button>
          </div>
          {checked1 && (
            <Feedback status="correct">
              <InlineMath>{String.raw`D_1 = \$3 \times 1.04 = \$3.12`}</InlineMath>
              . Then{" "}
              <InlineMath>{String.raw`P_0 = \$3.12 / (0.12 - 0.04) = \$3.12 / 0.08 = \$39.00`}</InlineMath>
              .
            </Feedback>
          )}
        </div>

        {/* Check 2 */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <h4 className="ops-interactive-title text-lg text-white">
            Check 2 — Implied return
          </h4>
          <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
            P₀ = $60, D₁ = $2.40, g = 5%. What is the implied r?
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setChecked2(true)}
              className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-4 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            >
              Reveal
            </button>
          </div>
          {checked2 && (
            <Feedback status="correct">
              <InlineMath>{String.raw`r = D_1/P_0 + g = \$2.40/\$60 + 5\% = 4\% + 5\% = 9\%`}</InlineMath>
              .
            </Feedback>
          )}
        </div>
      </div>
    </InteractiveFrame>
  );
}
