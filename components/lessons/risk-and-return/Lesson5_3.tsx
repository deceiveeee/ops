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
import { AnswerInput, AnswerWorksheet } from "./AnswerInput";
import RRLayout from "./RRLayout";
import RRSourcePanel from "./RRSourcePanel";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import ExpandableQA from "@/components/lessons/equities/ExpandableQA";
import { useReportRRComplete } from "@/lib/rr-progress";
import {
  portfolioExpectedReturn,
  twoAssetPortfolioVolatility,
} from "@/lib/risk-return";
import { useState } from "react";

const LEARNING_OBJECTIVES = [
  "Compute portfolio weights and portfolio returns as weighted averages.",
  "Explain why portfolio volatility is not a simple weighted average of asset volatilities.",
  "Define covariance and correlation and interpret their signs and magnitudes.",
  "Compute two-asset portfolio volatility using the variance formula.",
  "Show how lower correlation increases the diversification benefit.",
  "Distinguish diversifiable (idiosyncratic) risk from systematic risk.",
];

const SUMMARY_POINTS = [
  "Portfolio return is a weighted average of asset returns.",
  "Portfolio volatility is NOT a weighted average — it depends on correlation.",
  "Covariance measures how two assets co-move. Correlation standardizes it to [−1,1].",
  "Lower correlation creates more diversification benefit.",
  "Two risky assets can form a less risky portfolio when ρ < 1.",
  "Diversification reduces idiosyncratic risk but not systematic risk.",
  "Diversification depends on distinct risk sources, not just the number of stocks.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "$60K in A and $40K in B, total $100K. What is w_A?",
    choices: [
      { id: "a", label: "60%" },
      { id: "b", label: "40%" },
      { id: "c", label: "100%" },
    ],
    correctId: "a",
    hint: "w_A = 60,000 / 100,000 = 0.60.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "w_A = 60%, R_A = 10%, w_B = 40%, R_B = 5%. What is the portfolio return?",
    choices: [
      { id: "a", label: "8%" },
      { id: "b", label: "15%" },
      { id: "c", label: "7.5%" },
    ],
    correctId: "a",
    hint: "0.60 × 10% + 0.40 × 5% = 6% + 2% = 8%.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "ρ = 1, equal weights, σ_A = σ_B = 20%. What is σ_P?",
    choices: [
      { id: "a", label: "20%" },
      { id: "b", label: "14.14%" },
      { id: "c", label: "0%" },
    ],
    correctId: "a",
    hint: "With ρ = 1 there is no diversification — volatility is the weighted average, 20%.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "ρ = −1, equal weights, σ_A = σ_B = 20%. What is σ_P?",
    choices: [
      { id: "a", label: "0%" },
      { id: "b", label: "20%" },
      { id: "c", label: "14.14%" },
    ],
    correctId: "a",
    hint: "Perfect negative correlation with equal vols means the assets fully offset — risk can be driven to zero.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "w_A = 60%, w_B = 40%, σ_A = 12%, σ_B = 18%, ρ = 0.25. What is σ_P (approximately)?",
    choices: [
      { id: "a", label: "11.38%" },
      { id: "b", label: "14.4%" },
      { id: "c", label: "12%" },
    ],
    correctId: "a",
    hint: "Use σ_P² = w_A²σ_A² + w_B²σ_B² + 2w_Aw_Bρσ_Aσ_B, then take the square root.",
  },
  {
    id: "q6",
    type: "single",
    prompt:
      "Why is portfolio volatility not a simple weighted average of asset volatilities?",
    choices: [
      { id: "a", label: "Because assets are imperfectly correlated" },
      { id: "b", label: "Because weights don't sum to 1" },
      { id: "c", label: "Because returns are negative" },
    ],
    correctId: "a",
    hint: "When assets don't move in lockstep, their fluctuations partially offset, lowering portfolio variance.",
  },
];

export default function Lesson5_3() {
  const report = useReportRRComplete(
    "risk-covariance-correlation-diversification",
  );

  return (
    <RRLayout>
      {/* =================================================================== */}
      {/* HERO                                                                */}
      {/* =================================================================== */}
      <PVHero
        index="5.3"
        eyebrow="Lesson 5.3 · Module 5 — Risk and Return"
        heading="Covariance, Correlation, and Diversification"
        subheading="How assets combine into portfolios, what covariance and correlation measure, and why diversification reduces risk."
        bullets={[
          "Portfolio return = weighted average",
          "Portfolio volatility is NOT a weighted average",
          "Correlation determines diversification benefit",
          "Two risky assets can form a safer portfolio",
          "Diversification reduces idiosyncratic but not systematic risk",
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
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-purple/40 bg-accent-purple/10 px-1.5 font-sans text-[12px] text-accent-purple">
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
      {/* SECTION 1 — Portfolio Weights                                        */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.3.1"
          eyebrow="Section 1"
          title="Portfolio weights"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            A portfolio is a collection of assets. Each asset&apos;s{" "}
            <strong className="text-white">weight</strong> is the fraction of
            total wealth invested in it. Weights always sum to 1 (or 100%).
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Portfolio weight"
          formula={String.raw`w_i = \frac{\text{value}_i}{\text{total value}}`}
          meaning="Each weight is the dollar amount in asset i divided by the total portfolio value. The weights across all assets sum to 1."
          variables={[
            {
              symbol: String.raw`\text{value}_i`,
              description: "Dollar amount invested in asset i.",
            },
            {
              symbol: String.raw`\text{total value}`,
              description: "Sum of all asset values.",
            },
          ]}
          substitution={String.raw`w_A = \frac{60{,}000}{100{,}000} = 0.60, \quad w_B = \frac{40{,}000}{100{,}000} = 0.40`}
          result="w_A + w_B = 60% + 40% = 100%"
          tone="purple"
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 2 — Portfolio Return                                         */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.3.2"
          eyebrow="Section 2"
          title="Portfolio return"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Portfolio return"
          formula={String.raw`R_P = w_A R_A + w_B R_B`}
          meaning="The portfolio return is a weighted average of the asset returns, using the portfolio weights."
          variables={[
            {
              symbol: String.raw`w_A, w_B`,
              description: "Weights on assets A and B.",
            },
            {
              symbol: String.raw`R_A, R_B`,
              description: "Returns on assets A and B.",
            },
          ]}
          substitution={String.raw`R_P = 0.60(10\%) + 0.40(5\%) = 6\% + 2\% = 8\%`}
          result="Portfolio return = 8%"
          interpretation="The same weighted-average logic applies to expected returns: E[R_P] = w_A E[R_A] + w_B E[R_B]. Returns combine linearly."
          tone="purple"
        />
      </Reveal>

      <Reveal className="mt-6">
        <PortfolioReturnWorksheet />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 3 — Why Portfolio Risk Is Different                          */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.3.3"
          eyebrow="Section 3"
          title="Why portfolio risk is different"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Expected return <em>is</em> a weighted average. But portfolio
            volatility is <strong className="text-white">not</strong>. Here is
            the key two-state example. Stock A does well in expansions and
            poorly in recessions; asset B (think bonds) does the opposite.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    State
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Stock A
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Asset B
                  </th>
                  <th className="py-2 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    50/50 portfolio
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-slate-200">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-8 text-slate-100">Expansion</td>
                  <td className="py-2 pr-8 text-accent-green">+30%</td>
                  <td className="py-2 pr-8 text-accent-red">−2%</td>
                  <td className="py-2 text-slate-100">
                    0.5×30% + 0.5×(−2%) = 14%
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-8 text-slate-100">Recession</td>
                  <td className="py-2 pr-8 text-accent-red">−10%</td>
                  <td className="py-2 pr-8 text-accent-green">+18%</td>
                  <td className="py-2 text-slate-100">
                    0.5×(−10%) + 0.5×18% = 4%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            Stock A alone swings between{" "}
            <span className="font-sans text-accent-red">−10%</span> and{" "}
            <span className="font-sans text-accent-green">+30%</span> — a
            40-point range. The 50/50 portfolio swings only between{" "}
            <span className="font-sans">4%</span> and{" "}
            <span className="font-sans">14%</span> — a 10-point range. The two
            assets <strong className="text-white">partially offset</strong> each
            other, smoothing the portfolio&apos;s outcomes. That offset is the
            essence of diversification, and it is driven by how the assets{" "}
            <em>co-move</em>.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 4 — Covariance                                               */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading index="5.3.4" eyebrow="Section 4" title="Covariance" />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Covariance"
          formula={String.raw`\text{Cov}(R_A, R_B) = E\!\left[(R_A - E[R_A])(R_B - E[R_B])\right]`}
          meaning="Covariance measures how two assets move together. It averages the product of each asset's deviation from its own mean."
          variables={[
            {
              symbol: String.raw`R_A - E[R_A]`,
              description: "Surprise in asset A's return.",
            },
            {
              symbol: String.raw`R_B - E[R_B]`,
              description: "Surprise in asset B's return.",
            },
          ]}
          interpretation="A positive covariance means the assets tend to move in the same direction; negative means opposite directions; near zero means little linear co-movement. But covariance depends on units, making it hard to interpret on its own — which motivates correlation."
          tone="purple"
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 5 — Correlation                                              */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading index="5.3.5" eyebrow="Section 5" title="Correlation" />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Correlation"
          formula={String.raw`\rho_{A,B} = \frac{\text{Cov}(R_A, R_B)}{\sigma_A \, \sigma_B}`}
          meaning="Correlation standardizes covariance by dividing by the product of the two standard deviations, pinning it to the range [−1, 1]."
          variables={[
            {
              symbol: String.raw`\sigma_A, \sigma_B`,
              description: "Standard deviations of assets A and B.",
            },
            {
              symbol: String.raw`\rho_{A,B}`,
              description: "Correlation, always between −1 and +1.",
            },
          ]}
          interpretation="ρ = +1 means perfect positive co-movement; ρ = −1 means perfect opposite movement; ρ = 0 means no linear relationship. The lower the correlation, the more diversification two assets provide."
          tone="purple"
        />
      </Reveal>

      <Reveal className="mt-6">
        <CorrelationExplorer />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 6 — Two-Asset Portfolio Variance                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.3.6"
          eyebrow="Section 6"
          title="Two-asset portfolio variance"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Two-asset portfolio variance"
          formula={String.raw`\sigma_P^2 = w_A^2 \sigma_A^2 + w_B^2 \sigma_B^2 + 2 w_A w_B \rho_{A,B} \sigma_A \sigma_B`}
          meaning="Portfolio variance has three terms: each asset's weighted variance, plus a co-movement term. The third term is where diversification lives."
          variables={[
            {
              symbol: String.raw`w_A^2 \sigma_A^2`,
              description: "Weighted variance of asset A.",
            },
            {
              symbol: String.raw`w_B^2 \sigma_B^2`,
              description: "Weighted variance of asset B.",
            },
            {
              symbol: String.raw`2 w_A w_B \rho_{A,B} \sigma_A \sigma_B`,
              description:
                "Co-movement (covariance) term — the diversification channel.",
            },
          ]}
          interpretation="When ρ is less than 1, the third term is smaller than it would be for perfectly correlated assets, so portfolio variance falls below the weighted-average variance. That reduction is the diversification benefit."
          tone="purple"
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 7 — Correlation Comparison                                   */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.3.7"
          eyebrow="Section 7"
          title="Correlation comparison"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Hold the weights at <span className="font-sans">50/50</span> and the
            volatilities at <span className="font-sans">σ_A = σ_B = 20%</span>.
            Only the correlation changes. Watch what happens to portfolio
            volatility — while expected return stays fixed.
          </p>
        </Panel>
      </Reveal>

      <Reveal className="mt-6">
        <CorrelationComparison />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 8 — Realistic Portfolio Example                              */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.3.8"
          eyebrow="Section 8"
          title="A realistic portfolio example"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Now a realistic case: <span className="font-sans">w_A = 60%</span>,{" "}
            <span className="font-sans">w_B = 40%</span>,{" "}
            <span className="font-sans">E[R_A] = 8%</span>,{" "}
            <span className="font-sans">E[R_B] = 12%</span>,{" "}
            <span className="font-sans">σ_A = 12%</span>,{" "}
            <span className="font-sans">σ_B = 18%</span>, and{" "}
            <span className="font-sans">ρ = 0.25</span>. The portfolio&apos;s
            expected return is a weighted average, but its volatility must come
            from the variance formula.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormulaExplainer
              label="Expected return"
              formula={String.raw`E[R_P] = w_A E[R_A] + w_B E[R_B]`}
              substitution={String.raw`0.60(8\%) + 0.40(12\%) = 4.8\% + 4.8\% = 9.6\%`}
              result="E[R_P] = 9.6%"
              tone="cyan"
            />
            <FormulaExplainer
              label="Portfolio volatility"
              formula={String.raw`\sigma_P = \sqrt{w_A^2 \sigma_A^2 + w_B^2 \sigma_B^2 + 2 w_A w_B \rho \sigma_A \sigma_B}`}
              substitution={String.raw`\sigma_P^2 = 0.005184 + 0.005184 + 0.002592 \approx 0.01296`}
              result="σ_P ≈ 11.38%"
              interpretation="σ_P ≈ 11.38% is below both σ_A (12%) and σ_B (18%). The portfolio is safer than either asset held alone — the payoff of imperfect correlation."
              tone="purple"
            />
          </div>
        </Panel>
      </Reveal>

      <Reveal className="mt-6">
        <TwoAssetPortfolioWorksheet />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 9 — Diversification Is Not Just Number of Stocks             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.3.9"
          eyebrow="Section 9"
          title="Diversification is not just the number of stocks"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Owning many stocks does not automatically mean you are diversified.
            What matters is whether those stocks are exposed to{" "}
            <strong className="text-white">distinct risk sources</strong>.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-5">
              <div className="ops-caption text-[11px] text-accent-red">
                Not diversified
              </div>
              <p className="ops-body mt-2 text-[15px] leading-6 text-slate-200">
                Twenty semiconductor companies all share the same demand cycle,
                the same supply chain, and the same technology risk. When chip
                demand falls, they fall together.
              </p>
            </div>
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-5">
              <div className="ops-caption text-[11px] text-accent-red">
                Also not diversified
              </div>
              <p className="ops-body mt-2 text-[15px] leading-6 text-slate-200">
                Twenty regional banks all depend on the same interest-rate
                environment and the same local credit conditions. A rate shock
                hits all of them at once.
              </p>
            </div>
          </div>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            Diversification comes from combining assets whose risks are
            genuinely <em className="text-slate-100">different</em> — not from
            stacking many tickers that share the same exposures.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 10 — Diversifiable vs Systematic Risk                         */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.3.10"
          eyebrow="Section 10"
          title="Diversifiable versus systematic risk"
        />
      </Reveal>
      <Reveal className="mt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DefinitionCard term="Diversifiable (idiosyncratic) risk">
            Risk specific to a single company:{" "}
            <span className="text-slate-50">
              product failure, fraud, a factory accident, a lawsuit.
            </span>{" "}
            Because it is company-specific, holding many unrelated assets drives
            this risk toward zero.
          </DefinitionCard>
          <DefinitionCard term="Systematic (market) risk">
            Risk that affects <span className="text-slate-50">all</span> assets:{" "}
            <span className="text-slate-50">
              recession, inflation, rate shocks, financial crises.
            </span>{" "}
            Diversification cannot eliminate it because no asset is immune.
          </DefinitionCard>
        </div>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            Diversification reduces company-specific risk, but it{" "}
            <strong className="text-white">cannot</strong> eliminate market-wide
            risk. A portfolio of fifty stocks still falls when the whole market
            crashes. The risk that remains after full diversification is the
            systematic risk — and it is the only risk that earns a premium.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 11 — Limitations of Correlation                               */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.3.11"
          eyebrow="Section 11"
          title="Limitations of correlation"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <ul className="space-y-3">
            {[
              [
                "Historical and estimated",
                "Correlation is measured from past data and is itself an estimate, not a fixed constant.",
              ],
              [
                "Can change over time",
                "Correlations shift as industries, economies, and market structures evolve.",
              ],
              [
                "Linear only",
                "Correlation captures straight-line co-movement. It can miss nonlinear dependencies (e.g. assets that crash together but rise independently).",
              ],
              [
                "Rises in crises",
                "Assets that looked uncorrelated in calm periods often move together in panics — exactly when diversification is needed most.",
              ],
              [
                "Low correlation is not enough",
                "A low-correlation asset with poor expected return or high standalone risk can still be a bad addition to a portfolio.",
              ],
            ].map(([term, desc]) => (
              <li key={term} className="flex items-start gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber"
                  aria-hidden
                />
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  <strong className="text-white">{term}.</strong> {desc}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* EXPANDABLE Q&A                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.3.QA"
          eyebrow="Common questions"
          title="Diversification Q&A"
        />
      </Reveal>
      <Reveal className="mt-5 space-y-3">
        <ExpandableQA question="Can two risky assets form a safer portfolio than either asset alone?">
          Yes — when their correlation is low enough. With ρ &lt; 1, the
          portfolio&apos;s variance is below the weighted average of the
          individual variances, so σ_P can fall below both{" "}
          <span className="font-sans">σ_A</span> and{" "}
          <span className="font-sans">σ_B</span>. At{" "}
          <span className="font-sans">ρ = −1</span> and equal volatilities, a
          50/50 portfolio can reach zero risk.
        </ExpandableQA>
        <ExpandableQA question="Does diversification prevent losses?">
          No. Diversification reduces the <em>spread</em> of portfolio outcomes
          — it does not guarantee a positive return. A diversified portfolio
          still loses money in a broad market decline, because systematic risk
          cannot be diversified away.
        </ExpandableQA>
        <ExpandableQA question="Should you always choose the lowest-correlation assets?">
          Not automatically. A low correlation helps only if the asset also
          contributes acceptable expected return. An asset with very negative
          correlation but deeply negative expected return can drag the portfolio
          down. Diversification is about the whole portfolio, not a single
          statistic.
        </ExpandableQA>
        <ExpandableQA question="Does zero correlation mean the assets are independent?">
          Not necessarily. A correlation of zero means there is no{" "}
          <em>linear</em> relationship. Assets can be uncorrelated yet still
          dependent in nonlinear ways — for example, an asset that is calm when
          the other is calm but crashes alongside it during panics.
        </ExpandableQA>
      </Reveal>

      {/* =================================================================== */}
      {/* CONCEPT CHECK (inline)                                               */}
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
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Systematic Risk and Beta"
          continueHref="/lessons/risk-systematic-idiosyncratic-beta"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Systematic Risk and Beta"
          continueHref="/lessons/risk-systematic-idiosyncratic-beta"
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
/* INTERACTIVE: Portfolio return worksheet (Section 2)                       */
/* ========================================================================= */
function PortfolioReturnWorksheet() {
  // w_A = 0.6, R_A = 12%, w_B = 0.4, R_B = 4% → 8.8%
  const wA = 0.6;
  const wB = 0.4;
  const rA = 12;
  const rB = 4;
  const rp = portfolioExpectedReturn([wA, wB], [rA / 100, rB / 100]) * 100;

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Portfolio return worksheet
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Compute a weighted-average return
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        You hold{" "}
        <span className="font-sans">w_A = {(wA * 100).toFixed(0)}%</span> in
        stock A (return <span className="font-sans">{rA}%</span>) and{" "}
        <span className="font-sans">w_B = {(wB * 100).toFixed(0)}%</span> in
        asset B (return <span className="font-sans">{rB}%</span>). What is the
        portfolio return?
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3">
        <AnswerInput
          label="Contribution of stock A (w_A × R_A)"
          answer={wA * rA}
          tolerance={0.05}
          unit="%"
          hints={["0.60 × 12%.", "0.60 × 12 = 7.2."]}
          solution="Each asset's contribution is its weight times its return."
          ariaLabel="Stock A contribution in percent"
        />
        <AnswerInput
          label="Contribution of asset B (w_B × R_B)"
          answer={wB * rB}
          tolerance={0.05}
          unit="%"
          hints={["0.40 × 4%.", "0.40 × 4 = 1.6."]}
          solution="Each asset's contribution is its weight times its return."
          ariaLabel="Asset B contribution in percent"
        />
        <AnswerInput
          label="Portfolio return R_P"
          answer={rp}
          tolerance={0.05}
          unit="%"
          hints={["Sum the two contributions.", "7.2% + 1.6% = 8.8%."]}
          solution="Portfolio return is the weighted average of asset returns."
          ariaLabel="Portfolio return in percent"
        />
      </div>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Correlation explorer (Section 5)                             */
/* ========================================================================= */
type ScatterPoint = { x: number; y: number };

function makeScatter(rho: number, seed: number): ScatterPoint[] {
  // Deterministic pseudo-random scatter with target correlation rho.
  // Uses a simple LCG so the points are stable across renders.
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const n = 40;
  const pts: ScatterPoint[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = rand();
    const u2 = rand();
    // Box-Muller for two independent normals
    const r = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-9)));
    const z1 = r * Math.cos(2 * Math.PI * u2);
    const z2 = r * Math.sin(2 * Math.PI * u2);
    // Combine to produce correlation rho: y = rho*x + sqrt(1-rho^2)*z
    const x = z1;
    const y = rho * z1 + Math.sqrt(Math.max(1 - rho * rho, 0)) * z2;
    pts.push({ x, y });
  }
  return pts;
}

const CORR_CASES = [
  {
    rho: 0.8,
    label: "ρ = 0.8",
    note: "Strong positive — assets move mostly together.",
    tone: "text-accent-red",
  },
  {
    rho: 0.5,
    label: "ρ = 0.5",
    note: "Moderate positive — loose same-direction tendency.",
    tone: "text-accent-amber",
  },
  {
    rho: 0,
    label: "ρ = 0",
    note: "No linear relationship — scattered cloud.",
    tone: "text-slate-200",
  },
  {
    rho: -0.5,
    label: "ρ = −0.5",
    note: "Moderate negative — loose opposite tendency.",
    tone: "text-accent-cyan",
  },
];

function CorrelationExplorer() {
  const [active, setActive] = useState(0);
  const sel = CORR_CASES[active];
  const points = makeScatter(sel.rho, 42);
  const size = 200;
  const pad = 18;

  const toPx = (v: number) => pad + ((v + 3) / 6) * (size - 2 * pad);
  const toPy = (v: number) => size - pad - ((v + 3) / 6) * (size - 2 * pad);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Correlation explorer
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        See how correlation shapes the scatter
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Each plot shows returns of asset A (x-axis) against asset B (y-axis).
        Click a correlation level to see how the cloud of points changes.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-[200px_1fr] sm:items-start">
        <div className="flex flex-wrap gap-2 sm:flex-col">
          {CORR_CASES.map((c, i) => (
            <button
              key={c.label}
              type="button"
              aria-label={`Show scatter for ${c.label}`}
              aria-pressed={active === i}
              onClick={() => setActive(i)}
              className={`rounded-full border px-4 py-2 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 ${
                active === i
                  ? "border-accent-purple bg-accent-purple/15 text-accent-purple"
                  : "border-white/20 text-slate-100 hover:border-accent-purple/60"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-ink-950/50 p-4">
          <div className="flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-label={`Scatter plot of two assets with correlation ${sel.label}`}
              className="max-w-full"
            >
              {/* axes */}
              <line
                x1={pad}
                y1={size - pad}
                x2={size - pad}
                y2={size - pad}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
              />
              <line
                x1={pad}
                y1={pad}
                x2={pad}
                y2={size - pad}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
              />
              {/* zero lines */}
              <line
                x1={toPx(0)}
                y1={pad}
                x2={toPx(0)}
                y2={size - pad}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <line
                x1={pad}
                y1={toPy(0)}
                x2={size - pad}
                y2={toPy(0)}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              {/* points */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={toPx(p.x)}
                  cy={toPy(p.y)}
                  r={2.6}
                  fill="rgba(168,85,247,0.75)"
                />
              ))}
              {/* axis labels */}
              <text
                x={size - pad}
                y={size - 4}
                textAnchor="end"
                fontSize={9}
                fill="rgba(255,255,255,0.45)"
                fontFamily="monospace"
              >
                Asset A →
              </text>
              <text
                x={6}
                y={pad - 4}
                textAnchor="start"
                fontSize={9}
                fill="rgba(255,255,255,0.45)"
                fontFamily="monospace"
              >
                Asset B ↑
              </text>
            </svg>
          </div>
          <p
            className={`ops-body mt-3 text-center text-[14px] leading-6 ${sel.tone}`}
          >
            {sel.note}
          </p>
        </div>
      </div>

      <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
        As ρ moves from <span className="font-sans">+1</span> toward{" "}
        <span className="font-sans">−1</span>, the cloud rotates from a tight
        upward line to a loose disk to a downward line. The tighter the cloud
        hugs a line, the stronger the linear co-movement — and the smaller the
        diversification benefit.
      </p>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Correlation comparison (Section 7)                          */
/* ========================================================================= */
const COMP_CASES = [
  { rho: 1, sigmaP: 20, label: "ρ = 1" },
  { rho: 0, sigmaP: 14.14, label: "ρ = 0" },
  { rho: -0.5, sigmaP: 10, label: "ρ = −0.5" },
  { rho: -1, sigmaP: 0, label: "ρ = −1" },
];

function CorrelationComparison() {
  // 50/50, σ_A = σ_B = 20%
  const wA = 0.5;
  const wB = 0.5;
  const sA = 20;
  const sB = 20;

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const allCorrect = COMP_CASES.every((c) => checked[c.label]);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Correlation comparison
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          w_A = w_B = 50%, σ_A = σ_B = 20%
        </span>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Compute σ_P for each correlation
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Expected return is fixed — only correlation changes. Compute the
        portfolio volatility for each case using the two-asset variance formula.
        Each field reveals its answer after attempts.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {COMP_CASES.map((c) => (
          <AnswerInput
            key={c.label}
            label={`Portfolio volatility σ_P when ${c.label}`}
            answer={c.sigmaP}
            tolerance={0.15}
            unit="%"
            hints={[
              "σ_P² = 0.5²(20²) + 0.5²(20²) + 2(0.5)(0.5)(ρ)(20)(20).",
              `With ${c.label}: σ_P² = 200 + 200ρ, so σ_P = √(200 + 200ρ).`,
            ]}
            solution={`At ${c.label}, σ_P² = ${(200 + 200 * c.rho).toFixed(1)}, σ_P ≈ ${c.sigmaP}%.`}
            ariaLabel={`Portfolio volatility for ${c.label} in percent`}
            className="sm:col-span-1"
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            setChecked(
              COMP_CASES.reduce((acc, c) => ({ ...acc, [c.label]: true }), {}),
            )
          }
          className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-4 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          Reveal comparison
        </button>
      </div>

      {allCorrect && (
        <Feedback status="info">
          <strong className="text-white">The pattern:</strong> as correlation
          falls, portfolio volatility falls — but expected return does{" "}
          <em>not</em>. At <span className="font-sans">ρ = 1</span> there is no
          diversification (σ_P = 20%); at{" "}
          <span className="font-sans">ρ = 0</span> risk drops to 14.14%; at{" "}
          <span className="font-sans">ρ = −0.5</span> to 10%; and at{" "}
          <span className="font-sans">ρ = −1</span> with equal volatilities,
          risk can be driven to zero. Lower correlation is a free lunch — less
          risk for the same expected return.
        </Feedback>
      )}

      {allCorrect && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-white/15 text-left">
                <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                  Correlation
                </th>
                <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                  σ_P
                </th>
                <th className="py-2 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                  Diversification benefit
                </th>
              </tr>
            </thead>
            <tbody className="font-sans text-slate-200">
              {COMP_CASES.map((c) => (
                <tr key={c.label} className="border-b border-white/5">
                  <td className="py-2 pr-8 text-slate-100">{c.label}</td>
                  <td className="py-2 pr-8 text-accent-amber">
                    {c.sigmaP.toFixed(2)}%
                  </td>
                  <td className="py-2 text-slate-300">
                    {c.rho === 1
                      ? "None — volatility is the weighted average"
                      : c.rho === -1
                        ? "Maximum — risk eliminated"
                        : `Reduces σ_P below 20%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Two-asset portfolio worksheet (Section 8)                   */
/* ========================================================================= */
function TwoAssetPortfolioWorksheet() {
  // w_A = 0.6, w_B = 0.4, E[R_A] = 8%, E[R_B] = 12%, σ_A = 12%, σ_B = 18%, ρ = 0.25
  const wA = 0.6;
  const wB = 0.4;
  const eA = 8;
  const eB = 12;
  const sA = 0.12;
  const sB = 0.18;
  const rho = 0.25;

  const erp = portfolioExpectedReturn([wA, wB], [eA / 100, eB / 100]) * 100; // 9.6
  const termA = wA * wA * sA * sA; // 0.005184
  const termB = wB * wB * sB * sB; // 0.005184
  const covTerm = 2 * wA * wB * rho * sA * sB; // 0.000648... wait
  // 2*0.6*0.4*0.25*0.12*0.18 = 2*0.24*0.25*0.0216 = 0.12*0.0216 = 0.002592
  const varP = termA + termB + covTerm; // 0.01296
  const sdP = Math.sqrt(varP); // 0.1138

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Two-asset portfolio worksheet
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          w_A = 60%, w_B = 40%, σ_A = 12%, σ_B = 18%, ρ = 0.25
        </span>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Build the portfolio variance step by step
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Enter expected returns as percents (e.g.{" "}
        <span className="font-sans">9.6</span>) and the variance terms as
        decimals (e.g. <span className="font-sans">0.0052</span>). Work each
        piece, then assemble the total.
      </p>

      <div className="mt-5">
        <AnswerWorksheet
          title="Portfolio"
          fields={[
            {
              id: "erp",
              label: "Expected return E[R_P] (percent)",
              answer: erp,
              tolerance: 0.05,
              unit: "%",
              hints: ["E[R_P] = 0.60×8% + 0.40×12%.", "4.8 + 4.8 = 9.6."],
            },
            {
              id: "termA",
              label: "w_A² σ_A² (decimal)",
              answer: termA,
              tolerance: 0.0005,
              unit: "",
              decimals: 6,
              hints: ["(0.60)² × (0.12)².", "0.36 × 0.0144 = 0.005184."],
            },
            {
              id: "termB",
              label: "w_B² σ_B² (decimal)",
              answer: termB,
              tolerance: 0.0005,
              unit: "",
              decimals: 6,
              hints: ["(0.40)² × (0.18)².", "0.16 × 0.0324 = 0.005184."],
            },
            {
              id: "cov",
              label: "2 w_A w_B ρ σ_A σ_B (decimal)",
              answer: covTerm,
              tolerance: 0.0005,
              unit: "",
              decimals: 6,
              hints: [
                "2 × 0.60 × 0.40 × 0.25 × 0.12 × 0.18.",
                "2 × 0.24 × 0.25 × 0.0216 = 0.002592.",
              ],
            },
            {
              id: "varP",
              label: "Total portfolio variance σ_P² (decimal)",
              answer: varP,
              tolerance: 0.0005,
              unit: "",
              decimals: 6,
              hints: [
                "Sum the three terms.",
                "0.005184 + 0.005184 + 0.002592 = 0.01296.",
              ],
            },
            {
              id: "sdP",
              label: "Portfolio standard deviation σ_P (percent)",
              answer: sdP * 100,
              tolerance: 0.05,
              unit: "%",
              hints: [
                "Take the square root of the variance.",
                "√0.01296 ≈ 0.1138 → 11.38%.",
              ],
            },
          ]}
          interpretation={
            <>
              The portfolio has expected return{" "}
              <span className="font-sans text-accent-cyan">
                {erp.toFixed(1)}%
              </span>{" "}
              and volatility{" "}
              <span className="font-sans text-accent-purple">
                {(sdP * 100).toFixed(2)}%
              </span>
              . That volatility is <em>below</em> both individual assets (12%
              and 18%) and well below the naïve weighted average of{" "}
              <span className="font-sans">
                {(wA * sA * 100 + wB * sB * 100).toFixed(1)}%
              </span>{" "}
              — the payoff of imperfect correlation.
            </>
          }
        >
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Asset
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Weight
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    E[R]
                  </th>
                  <th className="py-2 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    σ
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-slate-200">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-8 text-slate-100">A</td>
                  <td className="py-2 pr-8">60%</td>
                  <td className="py-2 pr-8">{eA}%</td>
                  <td className="py-2">{(sA * 100).toFixed(0)}%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-8 text-slate-100">B</td>
                  <td className="py-2 pr-8">40%</td>
                  <td className="py-2 pr-8">{eB}%</td>
                  <td className="py-2">{(sB * 100).toFixed(0)}%</td>
                </tr>
                <tr>
                  <td className="py-2 pr-8 font-semibold text-slate-50">
                    Portfolio
                  </td>
                  <td className="py-2 pr-8">100%</td>
                  <td className="py-2 pr-8 font-semibold text-accent-cyan">
                    {erp.toFixed(1)}%
                  </td>
                  <td className="py-2 font-semibold text-accent-purple">
                    {(sdP * 100).toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AnswerWorksheet>
      </div>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Concept check (inline)                                      */
/* ========================================================================= */
function ConceptCheck() {
  const wA = 0.6;
  const wB = 0.4;
  const eA = 8;
  const eB = 12;
  const sA = 0.12;
  const sB = 0.18;
  const rho = 0.25;
  const erp = portfolioExpectedReturn([wA, wB], [eA / 100, eB / 100]) * 100;
  const sdP = twoAssetPortfolioVolatility(wA, wB, sA, sB, rho) * 100;
  const weightedAvg = (wA * sA + wB * sB) * 100;

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
        A portfolio has <span className="font-sans">w_A = 60%</span>,{" "}
        <span className="font-sans">w_B = 40%</span>,{" "}
        <span className="font-sans">E[R_A] = 8%</span>,{" "}
        <span className="font-sans">E[R_B] = 12%</span>,{" "}
        <span className="font-sans">σ_A = 12%</span>,{" "}
        <span className="font-sans">σ_B = 18%</span>,{" "}
        <span className="font-sans">ρ = 0.25</span>. Compute the expected return
        and the volatility.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AnswerInput
          label="Portfolio expected return E[R_P]"
          answer={erp}
          tolerance={0.05}
          unit="%"
          hints={["0.60 × 8% + 0.40 × 12%.", "4.8 + 4.8 = 9.6."]}
          solution="Return is a weighted average."
          ariaLabel="Portfolio expected return in percent"
        />
        <AnswerInput
          label="Portfolio volatility σ_P"
          answer={sdP}
          tolerance={0.1}
          unit="%"
          hints={[
            "Use σ_P² = w_A²σ_A² + w_B²σ_B² + 2w_Aw_Bρσ_Aσ_B, then take the root.",
            "0.01296 → √0.01296 ≈ 0.1138.",
          ]}
          solution="Volatility uses the variance formula, not a weighted average."
          ariaLabel="Portfolio volatility in percent"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setReveal(true)}
          className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-4 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          Why isn&apos;t σ_P the weighted average?
        </button>
      </div>

      {reveal && (
        <Feedback status="info">
          The naïve weighted average of volatilities would be{" "}
          <span className="font-sans">{weightedAvg.toFixed(1)}%</span>, but the
          true <span className="font-sans">σ_P ≈ {sdP.toFixed(2)}%</span>. The
          difference exists because the weighted average{" "}
          <strong className="text-white">ignores correlation</strong>. When
          assets are imperfectly correlated (here{" "}
          <span className="font-sans">ρ = 0.25 &lt; 1</span>), their
          fluctuations partially offset, so the portfolio variance&apos;s
          co-movement term is smaller than it would be under perfect
          correlation. That offset is the diversification benefit.
        </Feedback>
      )}
    </InteractiveFrame>
  );
}
