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
  InlineMath,
  type MasteryQuestion,
  LessonSummary,
  MasteryCheck,
} from "./shared";
import { AnswerInput } from "./AnswerInput";
import RRLayout from "./RRLayout";
import RRSourcePanel from "./RRSourcePanel";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import ExpandableQA from "@/components/lessons/equities/ExpandableQA";
import { useReportRRComplete } from "@/lib/rr-progress";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const LEARNING_OBJECTIVES = [
  "Distinguish idiosyncratic (firm-specific) risk from systematic (market-wide) risk.",
  "Explain why diversification reduces idiosyncratic risk but not systematic risk.",
  "Decompose a stock's unexpected return into a market component and a firm surprise.",
  "Contrast total volatility (standard deviation) with market exposure (beta).",
  "Compute and interpret beta as Cov(R_i, R_M) / Var(R_M).",
  "Recognize that beta describes an average statistical relationship, not a guarantee.",
];

const SUMMARY_POINTS = [
  "Total stock risk = systematic risk + idiosyncratic risk (conceptual decomposition).",
  "Diversification reduces idiosyncratic risk but not systematic risk.",
  "Beta = Cov(R_i,R_M)/Var(R_M) measures a stock's market sensitivity.",
  "A stock can have high volatility but low beta.",
  "Beta describes an average statistical relationship — it is not a guarantee.",
  "Portfolio beta is the weighted average of individual betas.",
  "CAPM and APT will later connect beta to expected return.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "Diversification can substantially reduce:",
    choices: [
      { id: "idio", label: "Idiosyncratic risk" },
      { id: "syst", label: "Systematic risk" },
      { id: "both", label: "Both equally" },
    ],
    correctId: "idio",
    hint: "Firm-specific events are diluted across many holdings. Market-wide events are not.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "Beta measures:",
    choices: [
      { id: "sens", label: "Market sensitivity" },
      { id: "vol", label: "Total volatility" },
      { id: "ret", label: "Expected return" },
    ],
    correctId: "sens",
    hint: "Beta = Cov(R_i, R_M) / Var(R_M). It captures how strongly a stock moves with the market.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "Market falls 5%, beta 1.4, firm surprise +3%. What is the stock's unexpected return?",
    choices: [
      { id: "neg4", label: "−4%" },
      { id: "neg7", label: "−7%" },
      { id: "pos3", label: "+3%" },
    ],
    correctId: "neg4",
    hint: "Market component = 1.4 × (−5%) = −7%. Total = −7% + 3% = −4%.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "A stock with SD 30% and beta 0.4:",
    choices: [
      { id: "low", label: "Is volatile but has low market exposure" },
      { id: "high", label: "Has high market risk" },
      { id: "zero", label: "Is riskless" },
    ],
    correctId: "low",
    hint: "High SD means large total fluctuations. Low beta means most of that movement is idiosyncratic, not market-driven.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "Portfolio: 60% at beta 1.2, 40% at beta 0.6. What is the portfolio beta?",
    choices: [
      { id: "a", label: "0.96" },
      { id: "b", label: "1.80" },
      { id: "c", label: "0.72" },
    ],
    correctId: "a",
    hint: "β_P = 0.60 × 1.2 + 0.40 × 0.6 = 0.72 + 0.24 = 0.96.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "Beta = 1.5, market +4%. Which statement is correct?",
    choices: [
      { id: "est", label: "Estimated market-related component ≈ 6%" },
      { id: "exact", label: "Stock will return exactly 6%" },
      { id: "norisk", label: "Stock has no risk" },
    ],
    correctId: "est",
    hint: "Beta gives an average relationship. 1.5 × 4% = 6% is the estimated market component, before firm-specific effects.",
  },
];

/* Deterministic pseudo-random generator for stable SVG scatter points. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export default function Lesson5_4() {
  const report = useReportRRComplete("risk-systematic-idiosyncratic-beta");

  return (
    <RRLayout>
      <PVHero
        index="5.4"
        eyebrow="Lesson 5.4 · Module 5 — Risk and Return"
        heading="Systematic Risk, Idiosyncratic Risk, and Beta"
        subheading="Diversification reduces some risks but not others. Beta measures a stock's market sensitivity. Standard deviation measures total fluctuation — beta isolates market exposure."
        bullets={[
          "Idiosyncratic risk can be diversified away",
          "Systematic risk cannot",
          "Beta = Cov(R_i,R_M)/Var(R_M)",
          "Beta ≠ total volatility",
          "Beta ≠ guaranteed return multiplier",
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
      {/* PRIOR-LESSON BRIDGE                                                 */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <Panel className="border-l-2 border-l-accent-cyan/40">
          <div className="ops-eyebrow text-[11px] text-accent-cyan">
            Recap · Lesson 5.3
          </div>
          <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
            In Lesson 5.3 we saw that diversification reduces portfolio risk
            when assets are not perfectly correlated. But there is a floor: no
            matter how many stocks you hold, some risk remains. This lesson
            explains <strong className="text-white">why</strong> — by splitting
            total risk into two parts — and introduces{" "}
            <strong className="text-white">beta</strong>, the statistic that
            measures the part diversification cannot eliminate.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 1 — Two Kinds of Bad News                                   */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.4.1"
          eyebrow="Section 1"
          title="Two kinds of bad news"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Suppose two bad things happen on the same day:
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
              <div className="ops-caption text-[11px] text-accent-amber">
                Event A — Company-specific
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                A pharmaceutical company announces its lead drug candidate
                failed a clinical trial. Its stock drops sharply.{" "}
                <strong className="text-white">
                  Other stocks are barely affected.
                </strong>
              </p>
            </div>
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.06] p-5">
              <div className="ops-caption text-[11px] text-accent-red">
                Event B — Market-wide
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                A recession hits.{" "}
                <strong className="text-white">Nearly every stock falls</strong>{" "}
                because revenues, margins, and cash flows deteriorate across the
                entire economy.
              </p>
            </div>
          </div>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            The clinical-trial failure can be{" "}
            <strong className="text-white">diluted</strong>: in a 100-stock
            portfolio the single company is a small weight, so the blow is
            minor. The recession <strong className="text-white">cannot</strong>{" "}
            be diluted because it hits every holding at once. This is the
            difference between <em>idiosyncratic</em> and <em>systematic</em>{" "}
            risk.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <RiskEventClassifier />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 2 — Idiosyncratic Risk                                      */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.4.2"
          eyebrow="Section 2"
          title="Idiosyncratic risk"
        />
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="Idiosyncratic risk">
          Risk that is specific to a single company (or a small group of
          companies). It can be reduced — sometimes nearly eliminated — by
          holding a diversified portfolio.
        </DefinitionCard>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            Idiosyncratic risk goes by several names — all describe the same
            idea:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Firm-specific", "Unsystematic", "Diversifiable"].map((s) => (
              <span
                key={s}
                className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 font-sans text-[12px] text-accent-cyan"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <p className="ops-body text-[15px] leading-7 text-slate-200">
              <strong className="text-white">100-stock example.</strong> Each
              stock has a 1% weight. If one stock falls 50%, the portfolio
              impact is only{" "}
              <span className="font-sans text-accent-red">
                1% × 50% = −0.5%
              </span>
              . The blow is tiny because the position is tiny.
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <DiversificationWorksheet />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 3 — Systematic Risk                                         */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.4.3"
          eyebrow="Section 3"
          title="Systematic risk"
        />
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="Systematic risk">
          Risk that affects the entire market or a broad segment of it. It
          cannot be eliminated by diversification within that market.
        </DefinitionCard>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            Systematic risk also has several names:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Market risk",
              "Non-diversifiable risk",
              "Undiversifiable risk",
            ].map((s) => (
              <span
                key={s}
                className="rounded-full border border-accent-red/30 bg-accent-red/10 px-3 py-1 font-sans text-[12px] text-accent-red"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <p className="ops-body text-[15px] leading-7 text-slate-200">
              <strong className="text-white">100-stock recession.</strong> A
              downturn pushes <em>all</em> stocks down roughly 20%. Even with
              100 holdings the portfolio still falls about{" "}
              <span className="font-sans text-accent-red">−20%</span>. Adding
              more stocks does not help because the risk source is shared.
            </p>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Property
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-accent-cyan">
                    Idiosyncratic
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-accent-red">
                    Systematic
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {[
                  ["Scope", "One firm", "Entire market"],
                  ["Diversifiable?", "Yes", "No"],
                  ["100-stock impact", "Tiny (diluted)", "Full (shared)"],
                  [
                    "Examples",
                    "Fraud, recall, factory fire",
                    "Recession, rate hike",
                  ],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="px-4 py-3 font-medium text-slate-300">
                      {row[0]}
                    </td>
                    <td className="px-4 py-3">{row[1]}</td>
                    <td className="px-4 py-3">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 4 — Total Risk Decomposition                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.4.4"
          eyebrow="Section 4"
          title="Total risk decomposition"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Conceptually, a stock&apos;s{" "}
            <strong className="text-white">total risk</strong> has two
            components:
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-lg border border-accent-purple/30 bg-accent-purple/10 px-4 py-2 font-sans text-[14px] text-accent-purple">
              Total risk
            </span>
            <span className="font-sans text-slate-400">=</span>
            <span className="rounded-lg border border-accent-red/30 bg-accent-red/10 px-4 py-2 font-sans text-[14px] text-accent-red">
              Systematic
            </span>
            <span className="font-sans text-slate-400">+</span>
            <span className="rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-2 font-sans text-[14px] text-accent-cyan">
              Idiosyncratic
            </span>
          </div>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            Note: this is a <strong className="text-white">conceptual</strong>{" "}
            decomposition. Standard deviations are not added directly —
            variances combine under specific rules. The equation below
            decomposes the <em>unexpected return</em>, not the variance.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Return decomposition"
          formula={String.raw`R_i - E[R_i] = \beta_i\,(R_M - E[R_M]) + \varepsilon_i`}
          meaning="A stock's surprise return equals a market-driven component (beta times the market's surprise) plus a firm-specific surprise."
          variables={[
            {
              symbol: String.raw`R_i - E[R_i]`,
              description: "Stock i's unexpected (surprise) return.",
            },
            {
              symbol: String.raw`\beta_i`,
              description: "Stock i's beta — sensitivity to market movements.",
            },
            {
              symbol: String.raw`R_M - E[R_M]`,
              description: "The market's unexpected (surprise) return.",
            },
            {
              symbol: String.raw`\varepsilon_i`,
              description: "Firm-specific surprise (idiosyncratic component).",
            },
          ]}
          tone="amber"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            <strong className="text-white">Worked example.</strong> The market
            surprise is <span className="font-sans">−5%</span>, the stock&apos;s
            beta is <span className="font-sans">1.4</span>, and the
            firm-specific surprise is <span className="font-sans">+3%</span>.
          </p>
          <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-5 font-sans text-[14px] text-slate-200">
            <div>
              Market component = β × market surprise = 1.4 × (−5%) ={" "}
              <span className="text-accent-red">−7%</span>
            </div>
            <div>
              Firm surprise (ε) = <span className="text-accent-green">+3%</span>
            </div>
            <div className="border-t border-white/10 pt-2">
              Total unexpected = −7% + 3% ={" "}
              <span className="text-accent-amber">−4%</span>
            </div>
          </div>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            The market dragged the stock down 7%, but firm-specific news
            partially offset that with a 3% gain, leaving a net surprise of −4%.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <SurpriseDecomposer />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 5 — Total Volatility vs Market Exposure                     */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.4.5"
          eyebrow="Section 5"
          title="Total volatility vs market exposure"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Standard deviation and beta answer{" "}
            <strong className="text-white">different questions</strong>:
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-purple/30 bg-accent-purple/[0.06] p-5">
              <div className="ops-caption text-[11px] text-accent-purple">
                Standard deviation (σ)
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                &ldquo;How large are <strong className="text-white">all</strong>{" "}
                fluctuations — market-driven and firm-specific combined?&rdquo;
              </p>
            </div>
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
              <div className="ops-caption text-[11px] text-accent-amber">
                Beta (β)
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                &ldquo;How strongly does the stock move{" "}
                <strong className="text-white">with the market</strong>{" "}
                specifically?&rdquo;
              </p>
            </div>
          </div>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            A stock can have{" "}
            <strong className="text-white">
              high standard deviation but low beta
            </strong>{" "}
            if most of its movement is idiosyncratic — it swings a lot, but not
            because of the market. Conversely, a stock can have modest
            volatility but high beta if its movements track the market closely.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 6 — Introducing Beta                                        */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.4.6"
          eyebrow="Section 6"
          title="Introducing beta"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Beta"
          formula={String.raw`\beta_i = \frac{\text{Cov}(R_i, R_M)}{\text{Var}(R_M)}`}
          meaning="Beta is the stock's typical market-related movement relative to the market's own movement. It is NOT a measure of total risk and NOT a guaranteed return multiplier."
          variables={[
            {
              symbol: String.raw`\text{Cov}(R_i, R_M)`,
              description: "How stock i and the market co-move.",
            },
            {
              symbol: String.raw`\text{Var}(R_M)`,
              description:
                "The market's variance (how much the market fluctuates).",
            },
          ]}
          tone="amber"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            In plain English: beta captures the stock&apos;s typical
            market-related movement relative to the market&apos;s movement. If
            you plot each period&apos;s stock return against the market return,
            beta is the{" "}
            <strong className="text-white">slope of the best-fit line</strong>.
            The scatter around that line is the idiosyncratic component.
          </p>
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <BetaScatter beta={1.2} />
            <p className="ops-body mt-2 text-center text-[13px] text-slate-500">
              Illustrative conceptual scatterplot. Each dot = one period. Fitted
              line slope ≈ beta. Scatter around the line = idiosyncratic risk.
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <BetaSlopeExplorer />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 7 — Interpreting Beta                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.4.7"
          eyebrow="Section 7"
          title="Interpreting beta"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Beta
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Interpretation
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {[
                  ["β = 1", "Same sensitivity as the market"],
                  ["β > 1", "Amplifies market movements"],
                  ["0 < β < 1", "Less sensitive than the market"],
                  ["β ≈ 0", "Little linear market sensitivity"],
                  ["β < 0", "Tends to move opposite the market"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="px-4 py-3 font-sans text-accent-amber">
                      {row[0]}
                    </td>
                    <td className="px-4 py-3">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="font-sans text-[13px] text-slate-400">
                β = 1.5, market +4%
              </div>
              <div className="mt-1 font-sans text-[16px] text-accent-green">
                → +6% est.
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="font-sans text-[13px] text-slate-400">
                β = 1.5, market −4%
              </div>
              <div className="mt-1 font-sans text-[16px] text-accent-red">
                → −6% est.
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="font-sans text-[13px] text-slate-400">
                β = 0.6, market −5%
              </div>
              <div className="mt-1 font-sans text-[16px] text-accent-red">
                → −3% est.
              </div>
            </div>
          </div>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            <strong className="text-accent-amber">Warning:</strong> These
            estimates describe an <em>average</em> statistical relationship, not
            a guarantee. The actual return also includes the idiosyncratic
            surprise <InlineMath>{String.raw`\varepsilon_i`}</InlineMath>, which
            can be large.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 8 — Beta Is Not a Prediction Rule                            */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.4.8"
          eyebrow="Section 8"
          title="Beta is not a prediction rule"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Beta = 1.5, market +4%. The estimated market-related component is
            about +6%. But this does <strong className="text-white">not</strong>{" "}
            mean the stock will return exactly 6%.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-accent-green/20 bg-accent-green/[0.06] p-4 text-center">
              <div className="font-sans text-[20px] text-accent-green">
                +12%
              </div>
              <div className="mt-1 text-[13px] text-slate-400">
                Firm news was great
              </div>
            </div>
            <div className="rounded-lg border border-accent-amber/20 bg-accent-amber/[0.06] p-4 text-center">
              <div className="font-sans text-[20px] text-accent-amber">+1%</div>
              <div className="mt-1 text-[13px] text-slate-400">
                Firm news offset most of it
              </div>
            </div>
            <div className="rounded-lg border border-accent-red/20 bg-accent-red/[0.06] p-4 text-center">
              <div className="font-sans text-[20px] text-accent-red">−5%</div>
              <div className="mt-1 text-[13px] text-slate-400">
                Firm news was terrible
              </div>
            </div>
          </div>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            All three outcomes are consistent with β = 1.5 and market +4%. The
            difference is the idiosyncratic surprise, which beta does{" "}
            <em>not</em> capture.
          </p>
          <div className="mt-5 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-4">
            <p className="ops-body text-[15px] leading-7 text-slate-200">
              <span className="text-accent-red">Wrong:</span> &ldquo;The stock
              will return exactly 6%.&rdquo;
              <br />
              <span className="text-accent-green">Right:</span> &ldquo;The
              estimated market-related component is ≈6%, before company-specific
              effects.&rdquo;
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <BetaMisconceptionReview />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 9 — Takeaway                                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading index="5.4.9" eyebrow="Section 9" title="Takeaway" />
      </Reveal>
      <Reveal className="mt-5">
        <Panel className="border-l-2 border-l-accent-amber/40">
          <ul className="space-y-3">
            {[
              "Total risk = systematic risk + idiosyncratic risk.",
              "Diversification reduces idiosyncratic risk but leaves systematic risk intact.",
              "Beta measures a stock's market exposure — the part of risk that diversification cannot remove.",
              "CAPM and APT (later lessons) address how that exposure affects expected return.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber"
                  aria-hidden
                />
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  {t}
                </span>
              </li>
            ))}
          </ul>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            <strong className="text-white">Connection to Module 4:</strong> Beta
            provides a candidate risk measure for the discount rate{" "}
            <InlineMath>{String.raw`r`}</InlineMath> used in valuation. But beta
            alone does not determine <InlineMath>{String.raw`r`}</InlineMath> —
            we need an asset-pricing model to connect beta to expected return.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* OPTIONAL SECTIONS                                                   */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.4+"
          eyebrow="Going deeper"
          title="Optional deep dives"
        />
      </Reveal>
      <Reveal className="mt-5 space-y-3">
        <ExpandableQA question="Beta vs correlation — how do they relate?">
          <p className="text-slate-200">
            Beta can be decomposed into correlation and a volatility ratio:
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/50 p-4 text-center text-slate-50">
            <InlineMath>{String.raw`\beta_i = \rho_{i,M} \times \frac{\sigma_i}{\sigma_M}`}</InlineMath>
          </div>
          <p className="mt-4 text-slate-300">
            This shows beta depends on <em>both</em> correlation and relative
            volatility. A stock can have low correlation but high volatility,
            producing a moderate beta — or vice versa.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Stock
                  </th>
                  <th className="px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    σ_i
                  </th>
                  <th className="px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    ρ
                  </th>
                  <th className="px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Beta
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                <tr className="border-b border-white/10">
                  <td className="px-3 py-2">Stock A</td>
                  <td className="px-3 py-2 font-sans">30%</td>
                  <td className="px-3 py-2 font-sans">0.20</td>
                  <td className="px-3 py-2 font-sans text-accent-amber">
                    0.40
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="px-3 py-2">Stock B</td>
                  <td className="px-3 py-2 font-sans">20%</td>
                  <td className="px-3 py-2 font-sans">0.90</td>
                  <td className="px-3 py-2 font-sans text-accent-amber">
                    1.20
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[13px] text-slate-500">
            Market volatility σ_M = 15% assumed for illustration.
          </p>
          <div className="mt-4">
            <AnswerInput
              label="Stock C: σ_i = 25%, ρ = 0.60, σ_M = 15%. What is beta?"
              answer={1.0}
              tolerance={0.03}
              unit=""
              decimals={2}
              hints={[
                "β = ρ × (σ_i / σ_M) = 0.60 × (25 / 15).",
                "0.60 × 1.667 = 1.00.",
              ]}
              solution="Beta combines correlation with the volatility ratio."
              ariaLabel="Beta from correlation and volatilities"
            />
          </div>
        </ExpandableQA>

        <ExpandableQA question="Covariance-based beta — compute it from three states">
          <p className="text-slate-200">
            Three equally likely states. Market and stock returns:
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    State
                  </th>
                  <th className="px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    R_M
                  </th>
                  <th className="px-3 py-2 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    R_i
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                <tr className="border-b border-white/10">
                  <td className="px-3 py-2">Weak</td>
                  <td className="px-3 py-2 font-sans">−10%</td>
                  <td className="px-3 py-2 font-sans">−20%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="px-3 py-2">Normal</td>
                  <td className="px-3 py-2 font-sans">0%</td>
                  <td className="px-3 py-2 font-sans">0%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="px-3 py-2">Strong</td>
                  <td className="px-3 py-2 font-sans">+10%</td>
                  <td className="px-3 py-2 font-sans">+20%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] text-slate-500">
            Each state has probability 1/3. Expected returns are both 0%, so
            deviations equal the returns themselves.
          </p>
          <div className="mt-4 space-y-3">
            <AnswerInput
              label="Market variance Var(R_M) in percent-squared (use the return numbers in %)"
              answer={66.67}
              tolerance={0.5}
              unit=""
              decimals={2}
              hints={[
                "Var = (1/3) × [(−10)² + 0² + 10²] = (1/3) × 200.",
                "(1/3) × 200 = 66.67.",
              ]}
              solution="Var(R_M) = (1/3)(100 + 0 + 100) = 66.67 %²."
              ariaLabel="Market variance"
            />
            <AnswerInput
              label="Covariance Cov(R_i, R_M) in percent-squared"
              answer={133.33}
              tolerance={0.5}
              unit=""
              decimals={2}
              hints={[
                "Cov = (1/3) × [(−10)(−20) + 0 + (10)(20)] = (1/3) × 400.",
                "(1/3) × 400 = 133.33.",
              ]}
              solution="Cov(R_i, R_M) = (1/3)(200 + 0 + 200) = 133.33 %²."
              ariaLabel="Covariance"
            />
            <AnswerInput
              label="Beta = Cov / Var"
              answer={2.0}
              tolerance={0.05}
              unit=""
              decimals={2}
              hints={["β = 133.33 / 66.67.", "133.33 / 66.67 = 2.00."]}
              solution="The stock moves twice as much as the market, on average."
              ariaLabel="Beta from covariance"
            />
          </div>
        </ExpandableQA>

        <ExpandableQA question="Portfolio beta — the weighted average">
          <p className="text-slate-200">
            A portfolio&apos;s beta is simply the weighted average of its
            holdings&apos; betas:
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/50 p-4 text-center text-slate-50">
            <InlineMath>{String.raw`\beta_P = \sum_i w_i \, \beta_i`}</InlineMath>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 font-sans text-[14px] text-slate-200">
            Example: 60% × 1.2 + 40% × 0.6 = 0.72 + 0.24 ={" "}
            <span className="text-accent-amber">0.96</span>
          </div>
          <div className="mt-4">
            <AnswerInput
              label="Portfolio: 50% at β=1.4, 30% at β=0.8, 20% at β=0.3. What is β_P?"
              answer={1.0}
              tolerance={0.03}
              unit=""
              decimals={2}
              hints={[
                "β_P = 0.50 × 1.4 + 0.30 × 0.8 + 0.20 × 0.3.",
                "0.70 + 0.24 + 0.06 = 1.00.",
              ]}
              solution="Portfolio beta is the weighted average of individual betas."
              ariaLabel="Portfolio beta"
            />
          </div>
        </ExpandableQA>

        <ExpandableQA question="Why does the market have beta 1?">
          <p className="text-slate-200">
            The market portfolio&apos;s beta with itself is by definition 1:
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/50 p-4 text-center text-slate-50">
            <InlineMath>{String.raw`\beta_M = \frac{\text{Cov}(R_M, R_M)}{\text{Var}(R_M)} = \frac{\text{Var}(R_M)}{\text{Var}(R_M)} = 1`}</InlineMath>
          </div>
          <p className="mt-3 text-slate-300">
            Any asset&apos;s covariance with itself is its own variance, so the
            ratio is always 1. This is why beta is interpreted{" "}
            <em>relative to the market</em>: a stock with β = 1 has the same
            market sensitivity as the market itself.
          </p>
        </ExpandableQA>

        <ExpandableQA question="What changes a stock's beta?">
          <p className="text-slate-200">
            Beta is not fixed. It reflects business and financial
            characteristics:
          </p>
          <ul className="mt-3 space-y-2 text-slate-300">
            {[
              "Operating leverage — high fixed costs amplify revenue swings.",
              "Financial leverage — debt magnifies equity returns.",
              "Product mix — cyclical products have higher betas.",
              "Cyclicality — demand tied to the business cycle increases beta.",
              "Maturity — young, high-growth firms often have higher betas.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber"
                  aria-hidden
                />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="ops-caption text-[11px] text-accent-amber">
              Leverage example
            </div>
            <p className="mt-2 text-[15px] text-slate-200">
              Assets fall from 100 to 90 (−10%). If equity was 40, it falls to
              30 — a <span className="font-sans text-accent-red">−25%</span>{" "}
              equity loss. Debt amplifies the impact on equity holders, raising
              the stock&apos;s beta.
            </p>
          </div>
        </ExpandableQA>

        <ExpandableQA question="What are beta's limitations?">
          <ul className="space-y-2 text-slate-300">
            {[
              "Beta is estimated from historical data — it comes with sampling error.",
              "Beta can change over time as the business evolves.",
              "Beta captures only the linear relationship with the market.",
              "Beta is not a measure of total risk — a low-beta stock can still be volatile.",
              "Beta does not directly capture downside or crash risk.",
              "Beta does not capture liquidity risk or tail risk.",
              "Beta depends on the choice of market benchmark, time period, and return frequency.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red"
                  aria-hidden
                />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </ExpandableQA>
      </Reveal>

      {/* =================================================================== */}
      {/* MASTERY CHECK                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <MasteryCheck
          title="Mastery check"
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Empirical Properties of Stock Returns"
          continueHref="/lessons/risk-empirical-properties-stock-returns"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Empirical Properties of Stock Returns"
          continueHref="/lessons/risk-empirical-properties-stock-returns"
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
/* INTERACTIVE: Risk Event Classifier (Section 1)                            */
/* ========================================================================= */
type RiskClass = "idiosyncratic" | "systematic" | "mixed";

const EVENTS: {
  id: string;
  label: string;
  correct: RiskClass;
  explain: string;
}[] = [
  {
    id: "recall",
    label: "Product recall at a consumer goods firm",
    correct: "idiosyncratic",
    explain:
      "Affects mainly this company. Other firms in the portfolio are largely unaffected, so diversification dilutes the impact.",
  },
  {
    id: "fraud",
    label: "Accounting fraud discovered at a single company",
    correct: "idiosyncratic",
    explain:
      "Company-specific news. Across many holdings, one firm's fraud is a small portfolio weight.",
  },
  {
    id: "recession",
    label: "Economy enters recession",
    correct: "systematic",
    explain:
      "Nearly all stocks fall. No amount of diversification within equities removes this risk.",
  },
  {
    id: "rates",
    label: "Central bank raises interest rates",
    correct: "systematic",
    explain:
      "Higher discount rates compress valuations broadly across the market.",
  },
  {
    id: "fire",
    label: "Factory fire destroys one firm's plant",
    correct: "idiosyncratic",
    explain:
      "Specific to one company's operations. Other holdings are unaffected.",
  },
  {
    id: "oil",
    label: "Oil prices surge unexpectedly",
    correct: "mixed",
    explain:
      "Broad macro impact (systematic), but airlines, consumers, and oil producers are affected very differently — uneven across sectors.",
  },
  {
    id: "customer",
    label: "Firm loses its largest customer contract",
    correct: "idiosyncratic",
    explain:
      "Specific to this company. Diluted across a diversified portfolio.",
  },
  {
    id: "liquidity",
    label: "Market-wide liquidity crisis (credit freeze)",
    correct: "systematic",
    explain:
      "Affects all assets that rely on market liquidity — systematic and non-diversifiable.",
  },
];

const CLASS_LABELS: Record<RiskClass, string> = {
  idiosyncratic: "Idiosyncratic",
  systematic: "Systematic",
  mixed: "Mixed",
};

function RiskEventClassifier() {
  const [answers, setAnswers] = useState<Record<string, RiskClass | undefined>>(
    {},
  );

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Risk event classifier
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Classify each event
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        For each event, decide whether it is{" "}
        <span className="text-accent-cyan">idiosyncratic</span> (firm-specific),{" "}
        <span className="text-accent-red">systematic</span> (market-wide), or{" "}
        <span className="text-accent-purple">mixed</span> (broad but uneven).
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3">
        {EVENTS.map((ev) => {
          const picked = answers[ev.id];
          const isCorrect = picked === ev.correct;
          return (
            <div
              key={ev.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <p className="ops-body text-[15px] leading-6 text-slate-100">
                {ev.label}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["idiosyncratic", "systematic", "mixed"] as RiskClass[]).map(
                  (c) => {
                    const active = picked === c;
                    const showResult = picked !== undefined;
                    const thisCorrect = c === ev.correct;
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-label={`${ev.label}: classify as ${CLASS_LABELS[c]}`}
                        onClick={() =>
                          setAnswers((p) => ({ ...p, [ev.id]: c }))
                        }
                        className={cn(
                          "rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                          !active &&
                            "border-white/20 text-slate-200 hover:border-accent-cyan/60",
                          active &&
                            !showResult &&
                            "border-accent-cyan bg-accent-cyan/15 text-accent-cyan",
                          showResult &&
                            active &&
                            thisCorrect &&
                            "border-accent-green bg-accent-green/15 text-accent-green",
                          showResult &&
                            active &&
                            !thisCorrect &&
                            "border-accent-red bg-accent-red/15 text-accent-red",
                          showResult &&
                            !active &&
                            thisCorrect &&
                            "border-accent-green/40 text-accent-green/80",
                        )}
                      >
                        {CLASS_LABELS[c]}
                      </button>
                    );
                  },
                )}
              </div>
              {picked !== undefined && (
                <Feedback status={isCorrect ? "correct" : "incorrect"}>
                  {isCorrect
                    ? "Correct. "
                    : `The best classification is ${CLASS_LABELS[ev.correct]}. `}
                  {ev.explain}
                </Feedback>
              )}
            </div>
          );
        })}
      </div>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Diversification Dilution Worksheet (Section 2)               */
/* ========================================================================= */
function DiversificationWorksheet() {
  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Diversification dilution worksheet
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        How small is one stock&apos;s blow?
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        In an equally-weighted portfolio, each stock has weight{" "}
        <span className="font-sans">1/N</span>. The portfolio impact of one
        stock falling is{" "}
        <span className="font-sans text-accent-cyan">
          weight × that stock&apos;s return
        </span>
        . Compute the impact in each case.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <AnswerInput
          label="Case A: 50 equally-weighted stocks. One falls 40%. Portfolio impact?"
          answer={-0.8}
          tolerance={0.05}
          unit="%"
          decimals={2}
          hints={[
            "Weight = 1/50 = 2%. Impact = 2% × (−40%).",
            "0.02 × (−40) = −0.8.",
          ]}
          solution="With 50 stocks, each is 2% of the portfolio. One stock's 40% drop moves the portfolio by only 0.8%."
          ariaLabel="Case A portfolio impact"
        />
        <AnswerInput
          label="Case B: 20 equally-weighted stocks. One falls 60%. Portfolio impact?"
          answer={-3.0}
          tolerance={0.05}
          unit="%"
          decimals={2}
          hints={[
            "Weight = 1/20 = 5%. Impact = 5% × (−60%).",
            "0.05 × (−60) = −3.0.",
          ]}
          solution="With only 20 stocks, each is 5%. One stock's 60% drop costs 3% — much more concentrated than Case A."
          ariaLabel="Case B portfolio impact"
        />
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="ops-body text-[15px] leading-7 text-slate-300">
          More holdings → smaller weight per stock → smaller idiosyncratic
          impact. This is the mechanical core of diversification: it dilutes
          firm-specific shocks. But notice that a{" "}
          <strong className="text-white">market-wide</strong> event — where{" "}
          <em>every</em> stock falls — is not diluted at all.
        </p>
      </div>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Surprise Decomposer (Section 4)                              */
/* ========================================================================= */
function SurpriseDecomposer() {
  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Market vs firm surprise decomposer
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Split a stock&apos;s surprise into two parts
      </h4>

      <div className="mt-5 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-4">
        <div className="ops-caption text-[11px] text-accent-cyan">
          Case 1 — Forward
        </div>
        <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
          Market surprise = <span className="font-sans">−5%</span>, beta ={" "}
          <span className="font-sans">1.4</span>, firm surprise ={" "}
          <span className="font-sans">+3%</span>. Find the components and total.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3">
          <AnswerInput
            label="Market-related component (β × market surprise)"
            answer={-7}
            tolerance={0.05}
            unit="%"
            hints={["1.4 × (−5%) = ?", "1.4 × (−5) = −7."]}
            solution="The market dragged this stock down 7%."
            ariaLabel="Case 1 market component"
          />
          <AnswerInput
            label="Total unexpected return (market component + firm surprise)"
            answer={-4}
            tolerance={0.05}
            unit="%"
            hints={[
              "Total = market component + firm surprise = −7% + 3%.",
              "−7 + 3 = −4.",
            ]}
            solution="The net surprise is −4%: the market hurt, firm news partially offset."
            ariaLabel="Case 1 total unexpected return"
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-accent-purple/20 bg-accent-purple/[0.04] p-4">
        <div className="ops-caption text-[11px] text-accent-purple">
          Case 2 — Reverse
        </div>
        <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
          Stock&apos;s total unexpected return ={" "}
          <span className="font-sans">−2%</span>, beta ={" "}
          <span className="font-sans">1.2</span>, market surprise ={" "}
          <span className="font-sans">−4%</span>. Back out the components.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3">
          <AnswerInput
            label="Market-related component (β × market surprise)"
            answer={-4.8}
            tolerance={0.05}
            unit="%"
            hints={["1.2 × (−4%) = ?", "1.2 × (−4) = −4.8."]}
            solution="The market component is −4.8%."
            ariaLabel="Case 2 market component"
          />
          <AnswerInput
            label="Firm-specific surprise (total − market component)"
            answer={2.8}
            tolerance={0.05}
            unit="%"
            hints={[
              "Firm surprise = total − market component = −2% − (−4.8%).",
              "−2 − (−4.8) = +2.8.",
            ]}
            solution="The firm-specific surprise was +2.8% — positive company news partially offset the market drag."
            ariaLabel="Case 2 firm surprise"
          />
        </div>
      </div>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* SVG: Beta Scatter (reusable)                                             */
/* ========================================================================= */
function BetaScatter({
  beta,
  seed = 7,
  height = 260,
}: {
  beta: number;
  seed?: number;
  height?: number;
}) {
  const width = 360;
  const points = useMemo(() => {
    const rng = makeRng(seed);
    const N = 22;
    const arr: { x: number; y: number }[] = [];
    for (let i = 0; i < N; i++) {
      const x = -8 + (16 * i) / (N - 1);
      const noise = (rng() - 0.5) * 7;
      const y = beta * x + noise;
      arr.push({ x, y });
    }
    return arr;
  }, [beta, seed]);

  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 38;
  const xMin = -10;
  const xMax = 10;
  const yMin = -16;
  const yMax = 16;
  const sx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (width - padL - padR);
  const sy = (y: number) =>
    height - padB - ((y - yMin) / (yMax - yMin)) * (height - padT - padB);

  const xGrid = [-10, -5, 0, 5, 10];
  const yGrid = [-15, -10, -5, 0, 5, 10, 15];
  const clampedSy = (y: number) =>
    Math.max(padT, Math.min(height - padB, sy(y)));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={`Illustrative scatterplot of stock return vs market return with fitted line slope ${beta}`}
    >
      <rect
        x={padL}
        y={padT}
        width={width - padL - padR}
        height={height - padT - padB}
        fill="rgba(255,255,255,0.02)"
      />
      {xGrid.map((x) => (
        <g key={`xg${x}`}>
          <line
            x1={sx(x)}
            y1={padT}
            x2={sx(x)}
            y2={height - padB}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={0.5}
          />
          <text
            x={sx(x)}
            y={height - padB + 16}
            textAnchor="middle"
            fill="rgba(148,163,184,0.7)"
            fontSize={10}
          >
            {x}
          </text>
        </g>
      ))}
      {yGrid.map((y) => (
        <g key={`yg${y}`}>
          <line
            x1={padL}
            y1={sy(y)}
            x2={width - padR}
            y2={sy(y)}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={0.5}
          />
          <text
            x={padL - 8}
            y={sy(y) + 3}
            textAnchor="end"
            fill="rgba(148,163,184,0.7)"
            fontSize={10}
          >
            {y}
          </text>
        </g>
      ))}
      {/* axes */}
      <line
        x1={sx(0)}
        y1={padT}
        x2={sx(0)}
        y2={height - padB}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
      <line
        x1={padL}
        y1={sy(0)}
        x2={width - padR}
        y2={sy(0)}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
      {/* fitted line */}
      <line
        x1={sx(-9)}
        y1={clampedSy(beta * -9)}
        x2={sx(9)}
        y2={clampedSy(beta * 9)}
        stroke="rgb(34,211,238)"
        strokeWidth={2}
      />
      {/* scatter points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={sx(p.x)}
          cy={clampedSy(p.y)}
          r={3.5}
          fill="rgba(251,191,36,0.7)"
          stroke="rgb(251,191,36)"
          strokeWidth={0.5}
        />
      ))}
      {/* axis labels */}
      <text
        x={(padL + width - padR) / 2}
        y={height - 4}
        textAnchor="middle"
        fill="rgba(148,163,184,0.9)"
        fontSize={11}
      >
        Market return (%)
      </text>
      <text
        x={12}
        y={(padT + height - padB) / 2}
        textAnchor="middle"
        transform={`rotate(-90 12 ${(padT + height - padB) / 2})`}
        fill="rgba(148,163,184,0.9)"
        fontSize={11}
      >
        Stock return (%)
      </text>
    </svg>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Beta Slope Explorer (Section 6)                             */
/* ========================================================================= */
const SLOPES = [-0.5, 0, 0.6, 1.0, 1.5];

const SLOPE_EXPLANATIONS: Record<number, string> = {
  [-0.5]:
    "Negative beta. This stock historically moved opposite to the market — when the market rose, it tended to fall, and vice versa. Rare in practice; examples include gold or certain hedging assets.",
  [0]: "Near-zero beta. The stock's returns show little linear relationship with market movements. Most of its fluctuation is idiosyncratic.",
  [0.6]:
    "Defensive beta. The stock moves in the same direction as the market but less aggressively — about 60% of the market's movement.",
  [1.0]:
    "Market-tracking beta. The stock moves with the market at similar magnitude, on average.",
  [1.5]:
    "Aggressive beta. The stock amplifies market movements — about 1.5× the market's swings.",
};

function BetaSlopeExplorer() {
  const [beta, setBeta] = useState(1.0);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Beta slope explorer
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Explore how the fitted line changes with beta
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Each dot is one period&apos;s stock return plotted against the market
        return. The fitted line&apos;s slope is beta. Click a slope to see how
        the relationship changes.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {SLOPES.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`Set beta to ${s}`}
            onClick={() => setBeta(s)}
            className={cn(
              "rounded-full border px-4 py-2 font-sans text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              beta === s
                ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                : "border-white/20 text-slate-200 hover:border-accent-cyan/60",
            )}
          >
            β = {s}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <BetaScatter beta={beta} seed={42} />
        <p className="mt-2 text-center text-[13px] text-slate-500">
          Illustrative conceptual scatterplot. Fitted line slope = {beta}.
        </p>
      </div>

      <Feedback status="info">{SLOPE_EXPLANATIONS[beta]}</Feedback>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Beta Misconception Review (Section 8)                       */
/* ========================================================================= */
const STATEMENTS: {
  id: string;
  text: string;
  valid: boolean;
  explain: string;
}[] = [
  {
    id: "s1",
    text: "Beta of 1.3 means the stock always returns 1.3× the market.",
    valid: false,
    explain:
      "Invalid. Beta describes an average statistical relationship, not a guarantee for every period. Firm-specific news adds idiosyncratic variation.",
  },
  {
    id: "s2",
    text: "Beta of 0 means the stock has no risk.",
    valid: false,
    explain:
      "Invalid. Beta 0 means low market sensitivity, but the stock can still have large idiosyncratic fluctuations — its total volatility may be high.",
  },
  {
    id: "s3",
    text: "Beta below 1 indicates lower historical market sensitivity than the market.",
    valid: true,
    explain:
      "Valid. A beta below 1 means the stock has historically moved less than the market, on average.",
  },
  {
    id: "s4",
    text: "A negative beta means the stock has historically tended to move opposite the market.",
    valid: true,
    explain:
      "Valid. Negative beta indicates an inverse average relationship with market returns.",
  },
];

function BetaMisconceptionReview() {
  const [answers, setAnswers] = useState<Record<string, boolean | undefined>>(
    {},
  );

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Beta misconception review
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Valid or invalid?
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Read each statement about beta. Classify it as{" "}
        <span className="text-accent-green">valid</span> or{" "}
        <span className="text-accent-red">invalid</span>.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3">
        {STATEMENTS.map((st) => {
          const picked = answers[st.id];
          const isCorrect = picked === st.valid;
          return (
            <div
              key={st.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <p className="ops-body text-[15px] leading-6 text-slate-100">
                &ldquo;{st.text}&rdquo;
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-label={`Statement: mark as valid`}
                  onClick={() => setAnswers((p) => ({ ...p, [st.id]: true }))}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                    picked === undefined &&
                      "border-white/20 text-slate-200 hover:border-accent-green/60",
                    picked === true &&
                      st.valid &&
                      "border-accent-green bg-accent-green/15 text-accent-green",
                    picked === true &&
                      !st.valid &&
                      "border-accent-red bg-accent-red/15 text-accent-red",
                    picked === false && "border-white/10 text-slate-500",
                  )}
                >
                  Valid
                </button>
                <button
                  type="button"
                  aria-label={`Statement: mark as invalid`}
                  onClick={() => setAnswers((p) => ({ ...p, [st.id]: false }))}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                    picked === undefined &&
                      "border-white/20 text-slate-200 hover:border-accent-red/60",
                    picked === false &&
                      !st.valid &&
                      "border-accent-green bg-accent-green/15 text-accent-green",
                    picked === false &&
                      st.valid &&
                      "border-accent-red bg-accent-red/15 text-accent-red",
                    picked === true && "border-white/10 text-slate-500",
                  )}
                >
                  Invalid
                </button>
              </div>
              {picked !== undefined && (
                <Feedback status={isCorrect ? "correct" : "incorrect"}>
                  {isCorrect
                    ? st.valid
                      ? "Correct — this is valid. "
                      : "Correct — this is invalid. "
                    : st.valid
                      ? "This statement is actually valid. "
                      : "This statement is actually invalid. "}
                  {st.explain}
                </Feedback>
              )}
            </div>
          );
        })}
      </div>
    </InteractiveFrame>
  );
}
