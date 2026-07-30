"use client";

import {
  Reveal,
  SectionHeading,
  Panel,
  DefinitionCard,
  FormulaExplainer,
  Feedback,
  InteractiveFrame,
  TryItTag,
  type MasteryQuestion,
  LessonSummary,
  MasteryCheck,
} from "./shared";
import { AnswerInput } from "./AnswerInput";
import RRLayout from "./RRLayout";
import RRSourcePanel from "./RRSourcePanel";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import { useReportRRComplete } from "@/lib/rr-progress";
import { expectedReturnFromStates } from "@/lib/risk-return";
import { useState } from "react";

const LEARNING_OBJECTIVES = [
  "Compute total shareholder return from beginning price, distribution, and ending price.",
  "Distinguish realized return from expected return as a probability-weighted average.",
  "Explain risk as uncertainty about the return an investor will actually receive.",
  "Define the risk premium and the realized excess return relative to a risk-free rate.",
  "Connect higher risk to a higher discount rate and therefore a lower present value.",
  "Recognize the limitations of standard deviation as a measure of risk.",
];

const SUMMARY_POINTS = [
  "Total return = (distribution + price change) / beginning price.",
  "Expected return is the probability-weighted average of possible future returns.",
  "Realized return is what actually occurred — it may differ from expected.",
  "Risk is the uncertainty in the return the investor will actually receive.",
  "Risk premium = expected return − risk-free rate.",
  "A positive expected premium does not guarantee a positive realized excess return.",
  "Higher risk raises the discount rate, lowering current value, all else equal.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "P₀ = $50, D₁ = $1, P₁ = $54. What is the total return?",
    choices: [
      { id: "ten", label: "10%" },
      { id: "eight", label: "8%" },
      { id: "two", label: "2%" },
    ],
    correctId: "ten",
    hint: "R = (1 + 54 − 50) / 50 = 5 / 50 = 10%.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "E[R] = 10%, r_f = 4%. What is the expected risk premium?",
    choices: [
      { id: "six", label: "6%" },
      { id: "ten", label: "10%" },
      { id: "four", label: "4%" },
    ],
    correctId: "six",
    hint: "Risk premium = E[R] − r_f = 10% − 4% = 6%.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "Which of the following is NOT guaranteed in advance: the expected risk premium, or the realized excess return?",
    choices: [
      { id: "neither", label: "Neither is guaranteed" },
      { id: "both", label: "Both are guaranteed" },
      { id: "premium", label: "Only the premium is guaranteed" },
    ],
    correctId: "neither",
    hint: "The premium is an expectation over future returns, and the realized return is uncertain. Neither is guaranteed.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "A riskier company with the same expected payoff as a safer company should have:",
    choices: [
      { id: "lower", label: "A lower current price" },
      { id: "higher", label: "A higher current price" },
      { id: "same", label: "The same price" },
    ],
    correctId: "lower",
    hint: "Higher risk → higher required return → heavier discounting → lower present value, all else equal.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "Realized return = −12%, r_f = 4%. What is the realized excess return?",
    choices: [
      { id: "neg16", label: "−16%" },
      { id: "neg8", label: "−8%" },
      { id: "neg12", label: "−12%" },
    ],
    correctId: "neg16",
    hint: "Excess return = R − r_f = −12% − 4% = −16%.",
  },
];

export default function Lesson5_1() {
  const report = useReportRRComplete("risk-return-what-they-mean");

  return (
    <RRLayout>
      {/* =================================================================== */}
      {/* HERO                                                                */}
      {/* =================================================================== */}
      <PVHero
        index="5.1"
        eyebrow="Lesson 5.1 · Module 5 — Risk and Return"
        heading="What Risk and Return Actually Mean"
        subheading="Total shareholder return, realized versus expected return, risk as uncertainty, and why investors demand a risk premium."
        bullets={[
          "Total return = (distribution + price change) / beginning price",
          "Expected return = probability-weighted average",
          "Risk premium = expected return − risk-free rate",
          "Risk affects the discount rate used in valuation",
        ]}
        primaryLabel="Start"
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
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-amber/40 bg-accent-amber/10 px-1.5 font-sans text-[12px] text-accent-amber">
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
      {/* SECTION 1 — Total Shareholder Return                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.1.1"
          eyebrow="Section 1"
          title="Total shareholder return"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            When you own a stock, your return over a period comes from two
            sources: any <strong className="text-white">distribution</strong>{" "}
            the company pays (a dividend or buyback), and the{" "}
            <strong className="text-white">change in price</strong>. Together
            these make up the{" "}
            <em className="text-slate-100">total shareholder return</em>.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Total return"
          formula={String.raw`R = \frac{D_1 + P_1 - P_0}{P_0}`}
          meaning="The total return is the cash distribution plus the price change, divided by the price you paid at the start."
          variables={[
            {
              symbol: String.raw`P_0`,
              description: "Beginning price (what you paid).",
            },
            {
              symbol: String.raw`P_1`,
              description: "Ending price (what it is worth at period end).",
            },
            {
              symbol: String.raw`D_1`,
              description: "Cash distribution received during the period.",
            },
            {
              symbol: String.raw`R`,
              description: "Total holding-period return.",
            },
          ]}
          substitution={String.raw`R = \frac{1 + 54 - 50}{50} = \frac{5}{50} = 0.10`}
          result="Total return = 10%"
          interpretation="The $2 dividend yield (2%) plus the $4 capital gain (8%) add up to the 10% total return. The two components are independent ways to be paid — they always sum to total return."
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            We can decompose the return into two yields. The{" "}
            <strong className="text-white">dividend yield</strong> is{" "}
            <span className="font-sans text-slate-100">D₁ / P₀</span>, and the{" "}
            <strong className="text-white">capital gain yield</strong> is{" "}
            <span className="font-sans text-slate-100">(P₁ − P₀) / P₀</span>. In
            the example:{" "}
            <span className="font-sans text-accent-green">2% + 8% = 10%</span>.
          </p>
        </Panel>
      </Reveal>

      <Reveal className="mt-6">
        <InteractiveFrame>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <TryItTag />
              <span className="ops-caption text-[11px] text-slate-400">
                Total return worksheet
              </span>
            </div>
          </div>
          <h4 className="ops-interactive-title mt-4 text-xl text-white">
            Practice: a stock you bought for $80
          </h4>
          <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
            You bought a share for <span className="font-sans">$80</span>. A
            year later it trades at <span className="font-sans">$74</span> and
            paid a <span className="font-sans">$2</span> dividend. Compute each
            component of the return, then the total.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3">
            <AnswerInput
              label="Dividend yield (D₁ / P₀)"
              answer={2.5}
              tolerance={0.05}
              unit="%"
              hints={[
                "Dividend yield = D₁ ÷ P₀ = 2 ÷ 80.",
                "2 ÷ 80 = 0.025, i.e. 2.5%.",
              ]}
              solution="The $2 dividend on an $80 starting price is a 2.5% yield."
              ariaLabel="Dividend yield in percent"
            />
            <AnswerInput
              label="Capital gain yield ((P₁ − P₀) / P₀)"
              answer={-7.5}
              tolerance={0.05}
              unit="%"
              hints={[
                "Capital gain yield = (P₁ − P₀) ÷ P₀ = (74 − 80) ÷ 80.",
                "(74 − 80) ÷ 80 = −6 ÷ 80 = −0.075.",
              ]}
              solution="The price fell $6 on an $80 base — a −7.5% capital gain yield."
              ariaLabel="Capital gain yield in percent"
            />
            <AnswerInput
              label="Total return R"
              answer={-5}
              tolerance={0.05}
              unit="%"
              hints={[
                "Total return = dividend yield + capital gain yield.",
                "2.5% + (−7.5%) = −5%.",
              ]}
              solution="Even with a dividend, the price drop produced a negative total return."
              ariaLabel="Total return in percent"
            />
          </div>
        </InteractiveFrame>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 2 — Realized vs Expected Return                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.1.2"
          eyebrow="Section 2"
          title="Realized versus expected return"
        />
      </Reveal>
      <Reveal className="mt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DefinitionCard term="Realized return">
            The return that{" "}
            <span className="text-slate-50">actually occurred</span> over a
            period. It is a historical fact — the prices and cash flows that
            happened.
          </DefinitionCard>
          <DefinitionCard term="Expected return">
            The return an investor{" "}
            <span className="text-slate-50">anticipates</span> looking forward,
            calculated as a probability-weighted average across possible future
            states.
          </DefinitionCard>
        </div>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Expected return"
          formula={String.raw`E[R] = \sum_{s} p_s \, R_s`}
          meaning="The expected return multiplies each possible return by the probability of that state, then sums across all states."
          variables={[
            {
              symbol: String.raw`p_s`,
              description: "Probability of state s occurring.",
            },
            {
              symbol: String.raw`R_s`,
              description: "Return if state s occurs.",
            },
            {
              symbol: String.raw`E[R]`,
              description: "Expected (probability-weighted) return.",
            },
          ]}
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            Consider a stock whose returns depend on the economy next year:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="py-2 pr-6 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    State
                  </th>
                  <th className="py-2 pr-6 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Probability
                  </th>
                  <th className="py-2 pr-6 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Return
                  </th>
                  <th className="py-2 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Contribution
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-slate-200">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-6 text-slate-100">Strong</td>
                  <td className="py-2 pr-6">30%</td>
                  <td className="py-2 pr-6 text-accent-green">+25%</td>
                  <td className="py-2 text-slate-300">0.30 × 25% = 7.5%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-6 text-slate-100">Normal</td>
                  <td className="py-2 pr-6">50%</td>
                  <td className="py-2 pr-6 text-accent-green">+8%</td>
                  <td className="py-2 text-slate-300">0.50 × 8% = 4.0%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-6 text-slate-100">Recession</td>
                  <td className="py-2 pr-6">20%</td>
                  <td className="py-2 pr-6 text-accent-red">−20%</td>
                  <td className="py-2 text-slate-300">0.20 × (−20%) = −4.0%</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6 font-semibold text-slate-50">Sum</td>
                  <td className="py-2 pr-6 font-semibold text-slate-50">
                    100%
                  </td>
                  <td className="py-2 pr-6" />
                  <td className="py-2 font-semibold text-accent-cyan">
                    E[R] = 7.5%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            Adding the three contributions:{" "}
            <span className="font-sans text-slate-100">
              7.5% + 4.0% − 4.0% = 7.5%
            </span>
            . The expected return is{" "}
            <span className="font-sans text-accent-cyan">7.5%</span> — but no
            single state actually produces exactly 7.5%. The realized return
            will be one of +25%, +8%, or −20%.
          </p>
        </Panel>
      </Reveal>

      <Reveal className="mt-6">
        <StateOfTheWorldExercise />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 3 — Expected Return Is Not a Smooth Path                     */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.1.3"
          eyebrow="Section 3"
          title="Expected return is not a smooth path"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            A positive expected return does{" "}
            <strong className="text-white">not</strong> mean the stock goes up
            steadily every year. The realized path can be jagged — strong years,
            painful years, and quiet years — while the long-run average still
            reflects the expectation.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Year
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    1
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    2
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    3
                  </th>
                  <th className="py-2 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    4
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-slate-200">
                <tr>
                  <td className="py-2 pr-8 text-slate-400">Return</td>
                  <td className="py-2 pr-8 text-accent-green">+25%</td>
                  <td className="py-2 pr-8 text-accent-red">−15%</td>
                  <td className="py-2 pr-8 text-accent-green">+12%</td>
                  <td className="py-2 text-accent-green">+6%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            One year loses 15%. Another gains 25%. There is no guarantee in any
            single year — only a distribution of possible outcomes centered on
            the expected return. This gap between the{" "}
            <em className="text-slate-100">expectation</em> and the{" "}
            <em className="text-slate-100">actual outcome</em> is exactly what
            we mean by risk.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 4 — Risk as Uncertainty                                     */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.1.4"
          eyebrow="Section 4"
          title="Risk as uncertainty"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Two investments can have the{" "}
            <strong className="text-white">same expected return</strong> but
            very different risk. Consider:
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-5">
              <div className="ops-caption text-[11px] text-accent-green">
                Investment A
              </div>
              <p className="ops-body mt-2 text-[15px] text-slate-200">
                A guaranteed 8% return. No uncertainty — you always get 8%.
              </p>
              <div className="mt-3 font-sans text-[18px] text-slate-100">
                E[R] = 8%
              </div>
            </div>
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-5">
              <div className="ops-caption text-[11px] text-accent-amber">
                Investment B
              </div>
              <p className="ops-body mt-2 text-[15px] text-slate-200">
                50% chance of +30%, 50% chance of −14%. The same expectation,
                but outcomes are spread far apart.
              </p>
              <div className="mt-3 font-sans text-[14px] text-slate-300">
                0.5 × 30% + 0.5 × (−14%) = 8%
              </div>
            </div>
          </div>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-200">
            Both have{" "}
            <span className="font-sans text-accent-cyan">E[R] = 8%</span>, but
            investment B is plainly riskier: its outcomes (−14% or +30%) are far
            more spread out than A&apos;s certain 8%. An investor who cannot
            tolerate losing 14% would prefer A even though the expectation is
            identical.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="Risk">
          Risk is the <span className="text-slate-50">uncertainty</span> in the
          return the investor will actually receive. Two investments with the
          same expected return can have different risk because their possible
          outcomes are spread differently.
        </DefinitionCard>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 5 — Risk Premium and Excess Return                           */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.1.5"
          eyebrow="Section 5"
          title="Risk premium and excess return"
        />
      </Reveal>
      <Reveal className="mt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormulaExplainer
            label="Expected risk premium"
            formula={String.raw`\text{Expected risk premium} = E[R_i] - r_f`}
            meaning="The extra return investors expect to earn above the risk-free rate as compensation for bearing risk."
            variables={[
              {
                symbol: String.raw`E[R_i]`,
                description: "Expected return on the risky asset.",
              },
              {
                symbol: String.raw`r_f`,
                description:
                  "Risk-free rate (e.g. short-term government bills).",
              },
            ]}
            substitution={String.raw`10\% - 4\% = 6\%`}
            result="Expected premium = 6%"
          />
          <FormulaExplainer
            label="Realized excess return"
            formula={String.raw`\text{Realized excess return} = R_i - r_f`}
            meaning="How much the actually-realized return beat (or missed) the risk-free rate."
            variables={[
              {
                symbol: String.raw`R_i`,
                description: "Realized return on the risky asset.",
              },
              {
                symbol: String.raw`r_f`,
                description: "Risk-free rate over the same period.",
              },
            ]}
            substitution={String.raw`-12\% - 4\% = -16\%`}
            result="Realized excess = −16%"
            tone="amber"
          />
        </div>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            Suppose the risk-free rate is <span className="font-sans">4%</span>{" "}
            and a stock has an expected return of{" "}
            <span className="font-sans">10%</span>. The expected risk premium is{" "}
            <span className="font-sans text-accent-cyan">6%</span>. But if the
            stock actually returns <span className="font-sans">−12%</span>, the
            realized excess return is{" "}
            <span className="font-sans text-accent-red">−16%</span> — the
            investor did far worse than holding the risk-free asset. A positive
            expected premium does <strong className="text-white">not</strong>{" "}
            guarantee a positive realized excess return.
          </p>
        </Panel>
      </Reveal>

      <Reveal className="mt-6">
        <ReturnClassificationExercise />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 6 — Connection to Cost of Equity                            */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.1.6"
          eyebrow="Section 6"
          title="Connection to the cost of equity"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            In Module 4 you valued equities by discounting expected payoffs at a
            required return. That required return is the risk-free rate plus a
            risk premium:
          </p>
          <div className="mt-4">
            <FormulaExplainer
              label="Cost of equity (required return)"
              formula={String.raw`r_e = r_f + \text{risk premium}`}
              meaning="The rate investors demand for holding a risky equity is the risk-free rate plus compensation for bearing that equity's risk."
              variables={[
                {
                  symbol: String.raw`r_e`,
                  description: "Cost of equity / required return.",
                },
                { symbol: String.raw`r_f`, description: "Risk-free rate." },
              ]}
            />
          </div>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-200">
            Two companies with the{" "}
            <strong className="text-white">same expected payoff</strong> can
            have different values today, because risk changes the discount rate.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="py-2 pr-6 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Company
                  </th>
                  <th className="py-2 pr-6 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    E[payoff]
                  </th>
                  <th className="py-2 pr-6 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Cost of equity
                  </th>
                  <th className="py-2 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    P₀ = payoff / (1 + r_e)
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-slate-200">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-6 text-accent-green">Safer</td>
                  <td className="py-2 pr-6">$110</td>
                  <td className="py-2 pr-6">6%</td>
                  <td className="py-2 text-slate-100">$110 / 1.06 = $103.77</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6 text-accent-amber">Riskier</td>
                  <td className="py-2 pr-6">$110</td>
                  <td className="py-2 pr-6">12%</td>
                  <td className="py-2 text-slate-100">$110 / 1.12 = $98.21</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            Same expected payoff, but the riskier company is worth less today:{" "}
            <span className="font-sans text-accent-red">
              $98.21 &lt; $103.77
            </span>
            . Higher risk → higher required return → heavier discounting → lower
            present value, all else equal.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 7 — Limitations of Volatility                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.1.7"
          eyebrow="Section 7"
          title="Limitations of volatility as a risk measure"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            In the next lesson we will measure risk with standard deviation
            (volatility). It is a useful starting point, but it is{" "}
            <strong className="text-white">not</strong> a complete picture of
            risk. Volatility treats large gains and large losses symmetrically
            as &ldquo;fluctuations,&rdquo; which understates the dangers
            investors actually fear.
          </p>
          <ul className="mt-5 space-y-2.5">
            {[
              "Permanent capital loss — a position you cannot recover from.",
              "Downside risk and drawdowns — the pain of large peak-to-trough drops.",
              "Negative skewness — rare but severe losses hidden by an otherwise calm average.",
              "Illiquidity — assets you cannot sell when you need to.",
              "Leverage — losses amplified by borrowed money.",
              "Tail events — extreme outcomes far outside the normal range.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber"
                  aria-hidden
                />
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            Standard deviation counts a +40% gain and a −40% loss as equally
            &ldquo;risky.&rdquo; But investors experience losses far more
            painfully than equivalent gains. Volatility is the introduction —
            not the final word — on risk.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* CONCEPT CHECK (inline)                                              */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <ConceptCheck />
      </Reveal>

      {/* =================================================================== */}
      {/* MASTERY CHECK                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <MasteryCheck
          title="Mastery check"
          passCount={3}
          onComplete={() => report()}
          continueLabel="Continue to Measuring Historical Return and Volatility"
          continueHref="/lessons/risk-measuring-historical-return-volatility"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Measuring Historical Return and Volatility"
          continueHref="/lessons/risk-measuring-historical-return-volatility"
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SOURCES                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <RRSourcePanel />
      </Reveal>
    </RRLayout>
  );
}

/* ========================================================================= */
/* INTERACTIVE: State-of-the-World exercise (Section 2)                      */
/* ========================================================================= */
function StateOfTheWorldExercise() {
  const STATES = [
    { name: "Strong", p: 0.3, r: 0.25 },
    { name: "Normal", p: 0.5, r: 0.08 },
    { name: "Recession", p: 0.2, r: -0.2 },
  ];
  const probSum = STATES.reduce((s, st) => s + st.p, 0);
  const er = expectedReturnFromStates(
    STATES.map((s) => ({ probability: s.p, return: s.r })),
  );
  const [contradiction, setContradiction] = useState<"yes" | "no" | null>(null);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            State-of-the-world exercise
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Verify the expected return
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        The table lists three states. First confirm the probabilities sum to
        100%, then work out each state&apos;s weighted contribution and the
        resulting expected return.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <AnswerInput
          label="Do the probabilities sum to 100%? (enter the sum as a percent)"
          answer={100}
          tolerance={0.5}
          unit="%"
          hints={[
            "Add the three probabilities: 30% + 50% + 20%.",
            "30 + 50 + 20 = 100 — the probabilities must cover all states.",
          ]}
          solution="Probabilities must sum to 100% so every possible outcome is accounted for."
          ariaLabel="Probability sum in percent"
        />
        <AnswerInput
          label="Weighted contribution of the Strong state (p × R)"
          answer={7.5}
          tolerance={0.05}
          unit="%"
          hints={[
            "Contribution = probability × return = 0.30 × 25%.",
            "0.30 × 25 = 7.5.",
          ]}
          solution="Each state's contribution is its probability times its return."
          ariaLabel="Strong state contribution in percent"
        />
        <AnswerInput
          label="Expected return E[R] (sum of all contributions)"
          answer={7.5}
          tolerance={0.05}
          unit="%"
          hints={[
            "E[R] = 7.5% + 4.0% + (−4.0%).",
            "Add all three contributions: 7.5 + 4 − 4 = 7.5.",
          ]}
          solution="Sum the contributions: 0.30×25% + 0.50×8% + 0.20×(−20%) = 7.5%."
          ariaLabel="Expected return in percent"
        />
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="ops-body text-[15px] leading-7 text-slate-200">
          If the realized return turned out to be{" "}
          <span className="font-sans text-accent-red">−20%</span>, does this
          contradict <span className="font-sans">E[R] = 7.5%</span>?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            aria-label="Yes, it contradicts the expectation"
            onClick={() => setContradiction("yes")}
            className={`rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 ${
              contradiction === "yes"
                ? "border-accent-red bg-accent-red/15 text-accent-red"
                : "border-white/20 text-slate-100 hover:border-accent-red/60"
            }`}
          >
            Yes — it contradicts E[R]
          </button>
          <button
            type="button"
            aria-label="No, it does not contradict the expectation"
            onClick={() => setContradiction("no")}
            className={`rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 ${
              contradiction === "no"
                ? "border-accent-green bg-accent-green/15 text-accent-green"
                : "border-white/20 text-slate-100 hover:border-accent-green/60"
            }`}
          >
            No — it does not
          </button>
        </div>
        {contradiction === "yes" && (
          <Feedback status="incorrect">
            Not quite. The expected return is an average across states.
            Observing one state&apos;s return (−20%) does not contradict the
            expectation — it is simply the recession state occurring.
          </Feedback>
        )}
        {contradiction === "no" && (
          <Feedback status="correct">
            Correct. The <span className="font-sans">−20%</span> is exactly the
            recession state. The expectation of{" "}
            <span className="font-sans">7.5%</span> is an average across
            possible states; a single realized outcome cannot contradict it.
            (Quietly, the math checks out:{" "}
            <span className="font-sans">E[R] = {(er * 100).toFixed(1)}%</span>,
            probabilities sum to{" "}
            <span className="font-sans">{(probSum * 100).toFixed(0)}%</span>.)
          </Feedback>
        )}
      </div>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Return classification exercise (Section 5)                   */
/* ========================================================================= */
function ReturnClassificationExercise() {
  const rf = 0.04;
  const items = [
    {
      id: "expected",
      text: "A stock you are considering has an 11% expected return. What is the expected risk premium? (r_f = 4%)",
      answer: 7,
      unit: "%",
      label: "Expected risk premium",
    },
    {
      id: "excess",
      text: "The stock actually returned 3%. What is the realized excess return? (r_f = 4%)",
      answer: -1,
      unit: "%",
      label: "Realized excess return",
    },
  ];
  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Return classification exercise
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Distinguish the four return concepts
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Each quantity below looks similar but means something different. Compute
        each one. The risk-free rate is{" "}
        <span className="font-sans">{(rf * 100).toFixed(0)}%</span>.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <AnswerInput
          label={items[0].text}
          answer={items[0].answer}
          tolerance={0.05}
          unit={items[0].unit}
          hints={["Expected risk premium = E[R] − r_f.", "11% − 4% = 7%."]}
          solution="The premium is what you expect to earn above the risk-free rate."
          ariaLabel="Expected risk premium in percent"
        />
        <AnswerInput
          label={items[1].text}
          answer={items[1].answer}
          tolerance={0.05}
          unit={items[1].unit}
          hints={["Realized excess return = R − r_f.", "3% − 4% = −1%."]}
          solution="Even though the stock rose, it failed to beat the risk-free rate."
          ariaLabel="Realized excess return in percent"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-accent-cyan">
            Expected return
          </div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
            The probability-weighted average of possible future returns. A
            forward-looking expectation — not a promise.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-accent-green">
            Realized return
          </div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
            The return that actually happened. A backward-looking fact about
            prices and cash flows.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-accent-purple">
            Expected risk premium
          </div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
            Expected return <em>minus</em> the risk-free rate. The compensation
            expected for bearing risk — also forward-looking.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-accent-amber">
            Realized excess return
          </div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
            Realized return <em>minus</em> the risk-free rate. How much you
            actually beat (or missed) the risk-free asset.
          </p>
        </div>
      </div>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Concept check (inline)                                      */
/* ========================================================================= */
function ConceptCheck() {
  const rf = 3;
  const eR = 9;
  const realized = -5;
  const [reveal, setReveal] = useState(false);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Concept check
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Pulling it together
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Given <span className="font-sans">r_f = {rf}%</span>,{" "}
        <span className="font-sans">E[R] = {eR}%</span>, and a realized return
        of <span className="font-sans text-accent-red">{realized}%</span>,
        compute the two excess-return measures and interpret them.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <AnswerInput
          label="Expected risk premium (E[R] − r_f)"
          answer={6}
          tolerance={0.05}
          unit="%"
          hints={["E[R] − r_f = 9% − 3%.", "9 − 3 = 6."]}
          solution="Investors expected to earn 6% over the risk-free rate."
          ariaLabel="Expected risk premium in percent"
        />
        <AnswerInput
          label="Realized excess return (R − r_f)"
          answer={-8}
          tolerance={0.05}
          unit="%"
          hints={["R − r_f = −5% − 3%.", "−5 − 3 = −8."]}
          solution="The investor earned 8% less than the risk-free asset."
          ariaLabel="Realized excess return in percent"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setReveal(true)}
          className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-4 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          Reveal interpretation
        </button>
      </div>

      {reveal && (
        <Feedback status="info">
          Investors <span className="text-slate-100">expected</span> to be
          rewarded with a 6% premium for bearing this stock&apos;s risk.{" "}
          <span className="text-slate-100">In reality</span> they earned an 8%
          shortfall relative to the risk-free asset. The lesson: a positive
          expected premium is a forward-looking compensation, not a guarantee of
          a positive realized outcome.
        </Feedback>
      )}
    </InteractiveFrame>
  );
}
