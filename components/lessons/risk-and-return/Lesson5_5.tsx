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
import { useReportRRComplete } from "@/lib/rr-progress";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const LEARNING_OBJECTIVES = [
  "Interpret historical risk-return data and its limitations as a forecast.",
  "Explain why individual stocks are riskier than diversified indexes.",
  "Recognize same-period co-movement (beta) versus lagged predictability.",
  "Describe volatility clustering and regime-dependent volatility.",
  "Identify fat tails and why the normal model is only approximate.",
  "Evaluate historical anomalies critically — they are not guaranteed free money.",
  "Preview how CAPM and APT organize these empirical questions.",
];

const SUMMARY_POINTS = [
  "Historically, higher-volatility categories generally had higher average returns — but this is not a guarantee.",
  "Individual stocks are riskier than diversified indexes because of idiosyncratic risk.",
  "Stocks show positive same-period co-movement with the market.",
  "Short-term returns show limited obvious linear predictability.",
  "Volatility is regime-dependent, not constant.",
  "Stock returns have fat tails — the normal model is a useful approximation, not complete.",
  "Historical anomalies challenge simple models but do not guarantee future outperformance.",
  "These empirical questions motivate formal asset-pricing models like CAPM and APT.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "Historically, higher-volatility asset categories generally had:",
    choices: [
      { id: "higher", label: "Higher average returns" },
      { id: "lower", label: "Lower average returns" },
      { id: "same", label: "Same returns" },
    ],
    correctId: "higher",
    hint: "The historical risk-return tradeoff: more volatile categories tended to deliver higher average returns over long samples.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "Individual stock volatility is typically ___ diversified index volatility.",
    choices: [
      { id: "much", label: "Much higher than" },
      { id: "similar", label: "Similar to" },
      { id: "lower", label: "Lower than" },
    ],
    correctId: "much",
    hint: "An index averages across many stocks, washing out idiosyncratic risk and leaving mostly systematic risk.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "Same-period stock-market co-movement shows:",
    choices: [
      { id: "pos", label: "Positive relationship (beta)" },
      { id: "none", label: "No relationship" },
      { id: "perfect", label: "Perfect predictability" },
    ],
    correctId: "pos",
    hint: "When you plot stock returns against same-period market returns, you see an upward-sloping cloud — positive beta.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "Rolling volatility through time shows:",
    choices: [
      { id: "regimes", label: "Calm and turbulent regimes" },
      { id: "const", label: "Constant volatility" },
      { id: "declining", label: "Declining volatility" },
    ],
    correctId: "regimes",
    hint: "Volatility clusters: calm periods are followed by calm, turbulent by turbulent. It is not constant.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "Historical return tails compared to a normal curve:",
    choices: [
      { id: "heavier", label: "Are heavier (fat tails)" },
      { id: "thinner", label: "Are thinner" },
      { id: "match", label: "Match exactly" },
    ],
    correctId: "heavier",
    hint: "Real returns produce more extreme outcomes than a normal distribution predicts — especially on the downside.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "Historical return anomalies are:",
    choices: [
      { id: "notguar", label: "Not guaranteed to persist" },
      { id: "free", label: "Guaranteed free money" },
      { id: "ineff", label: "Proof markets are inefficient" },
    ],
    correctId: "notguar",
    hint: "Anomalies may reflect risk, behavior, costs, data mining, or structural change. They are not guaranteed to persist.",
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

export default function Lesson5_5() {
  const report = useReportRRComplete("risk-empirical-properties-stock-returns");

  return (
    <RRLayout>
      <PVHero
        index="5.5"
        eyebrow="Lesson 5.5 · Module 5 — Risk and Return"
        heading="Empirical Properties of Stock Returns"
        subheading="Historical risk-return patterns, co-movement, predictability, volatility regimes, fat tails, and why asset-pricing models are needed."
        bullets={[
          "Higher-volatility categories historically had higher average returns",
          "Individual stocks are riskier than diversified indexes",
          "Stocks move together in the same period",
          "Short-term returns show limited obvious predictability",
          "Volatility changes through time",
          "Returns have fat tails — normal model is approximate",
          "Historical anomalies challenge simple models",
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
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-amber/40 bg-accent-amber/10 px-1.5 font-mono text-[12px] text-accent-amber">
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
            Recap · Lesson 5.4
          </div>
          <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
            Lesson 5.4 introduced <strong className="text-white">beta</strong>{" "}
            as the measure of a stock&apos;s market exposure — the systematic
            risk that diversification cannot remove. This lesson shifts from{" "}
            <em>theory</em> to <strong className="text-white">data</strong>:
            What do stock returns actually look like historically? Do the
            patterns we expect — higher risk for higher return, co-movement with
            the market — actually show up? And where do the data surprise us?
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 1 — Historical Risk and Return                              */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5.1"
          eyebrow="Section 1"
          title="Historical risk and return (1946–2001)"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            The table below summarizes{" "}
            <strong className="text-white">
              historical monthly statistics
            </strong>{" "}
            for several asset categories over 1946–2001. It shows what actually
            happened — not what is expected to happen going forward.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Asset
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Mean monthly return
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Monthly SD
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {[
                  ["T-bill", "0.38%", "0.24%"],
                  ["10-yr T-note", "0.46%", "2.63%"],
                  ["VW market index", "1.01%", "4.23%"],
                  ["EW market index", "1.18%", "5.30%"],
                  ["Motorola (single stock)", "1.66%", "10.02%"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {row[0]}
                    </td>
                    <td className="px-4 py-3 font-mono">{row[1]}</td>
                    <td className="px-4 py-3 font-mono">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ops-body mt-4 text-[13px] leading-6 text-slate-500">
            Historical monthly statistics, 1946–2001 sample.{" "}
            <strong className="text-slate-400">
              NOT current expected returns.
            </strong>{" "}
            VW = value-weighted; EW = equal-weighted. Source: MIT 15.401,
            Lecture 12.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            Plotting mean return against standard deviation reveals the
            historical pattern:
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <RiskReturnScatter />
            <p className="mt-2 text-center text-[13px] text-slate-500">
              Historical monthly data, 1946–2001. Each point is one asset
              category plotted at its (SD, mean return). Source: MIT 15.401,
              Lecture 12.
            </p>
          </div>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            Higher-volatility categories generally had higher average returns{" "}
            <em>historically</em>. This is suggestive of a risk-return tradeoff,
            but it is <strong className="text-white">not proof</strong> that
            every volatile security will outperform. It is a long-sample
            average, not a guarantee.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 2 — Individual Stocks vs Market                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5.2"
          eyebrow="Section 2"
          title="Individual stocks vs the market"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            A single company carries{" "}
            <strong className="text-white">both</strong> systematic and
            idiosyncratic risk. A diversified index averages across many
            companies, washing out most idiosyncratic risk and leaving mostly
            the systematic component.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-purple/30 bg-accent-purple/[0.06] p-5">
              <div className="ops-caption text-[11px] text-accent-purple">
                Motorola (single stock)
              </div>
              <div className="mt-2 font-mono text-[28px] text-white">
                10.02%
              </div>
              <div className="text-[13px] text-slate-400">monthly SD</div>
            </div>
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.06] p-5">
              <div className="ops-caption text-[11px] text-accent-green">
                VW market index
              </div>
              <div className="mt-2 font-mono text-[28px] text-white">4.23%</div>
              <div className="text-[13px] text-slate-400">monthly SD</div>
            </div>
          </div>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            The single stock&apos;s volatility is more than double the
            index&apos;s. Higher SD means returns commonly move by more
            percentage points away from the average — bigger surprises, both up
            and down. This is the practical cost of failing to diversify.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 3 — Stocks Move Together                                    */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5.3"
          eyebrow="Section 3"
          title="Stocks move together"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            When you plot a stock&apos;s return in each period against the{" "}
            <strong className="text-white">same period&apos;s</strong> market
            return, an upward-sloping cloud appears. This is the visual
            signature of beta from Lesson 5.4.
          </p>
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <SamePeriodScatter />
            <p className="mt-2 text-center text-[13px] text-slate-500">
              Illustrative conceptual scatterplot. Each dot = one period. The
              upward slope indicates positive beta; scatter around the line is
              idiosyncratic risk.
            </p>
          </div>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            The slope of the best-fit line tells you the stock&apos;s beta. The
            scatter around that line — the vertical noise — is the idiosyncratic
            component that diversification reduces.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <ChartReadingExercise />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 4 — Same-Period ≠ Predictability                            */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5.4"
          eyebrow="Section 4"
          title="Same-period co-movement is not predictability"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Co-movement and predictability are different things:
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-5">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Same-period: R_i,t vs R_M,t
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                Both returns are from the{" "}
                <strong className="text-white">same period</strong>. Shows clear
                co-movement — positive beta.
              </p>
            </div>
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
              <div className="ops-caption text-[11px] text-accent-amber">
                Lagged: R_M,t vs R_M,t+1
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                Today&apos;s market return vs{" "}
                <strong className="text-white">next</strong> period&apos;s.
                Shows little obvious linear pattern.
              </p>
            </div>
          </div>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            Just because stocks move together <em>within</em> a period does not
            mean you can predict next period&apos;s return from this
            period&apos;s. Same-period correlation reflects shared exposure to
            contemporaneous shocks — not a forecasting rule.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <PredictabilityComparison />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 5 — Random Walk with Drift                                  */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5.5"
          eyebrow="Section 5"
          title="Random walk with drift"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            A positive expected return does{" "}
            <strong className="text-white">not</strong> mean a smooth upward
            path. Stock prices can look like a <em>random walk with drift</em> —
            a positive average trend buried under large period-to-period noise.
          </p>
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <RandomWalkPath />
            <p className="mt-2 text-center text-[13px] text-slate-500">
              Illustrative, not historical. Sequence: +18%, −9%, +4%, +22%,
              −13%. The cumulative wealth path rises on average but is far from
              smooth.
            </p>
          </div>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            Five periods of returns: +18%, −9%, +4%, +22%, −13%. Despite the
            volatility, the cumulative wealth path trends upward because the
            average return is positive. But no single period&apos;s return is
            predictable from the previous one.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <ExpandableRandomWalk />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 6 — Volatility Changes Through Time                         */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5.6"
          eyebrow="Section 6"
          title="Volatility changes through time"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Volatility is <strong className="text-white">not constant</strong>.
            It moves through regimes — calm periods, rising stress, crisis
            spikes, and gradual normalization. This is called{" "}
            <em>volatility clustering</em>.
          </p>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            The common annualization rule{" "}
            <InlineMath>{String.raw`\sigma_{\text{annual}} = \sigma_{\text{monthly}} \times \sqrt{12}`}</InlineMath>{" "}
            assumes variance is stable through time. That is a useful
            approximation, but it can understate risk during turbulent regimes
            and overstate it during calm ones.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <VolatilityRegimeExplorer />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 7 — Returns Not Perfectly Normal                            */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5.7"
          eyebrow="Section 7"
          title="Returns are not perfectly normal"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            If returns were perfectly normal, about 68% of outcomes would fall
            within one standard deviation of the mean and 95% within two. Real
            stock returns <strong className="text-white">deviate</strong> from
            this in important ways:
          </p>
          <ul className="mt-4 space-y-2">
            {[
              "Fat tails — more extreme outcomes than the normal model predicts.",
              "Negative skew — crashes are larger than equally large rallies.",
              "Changing volatility — the distribution itself shifts across regimes.",
              "Crash risk — occasional very large negative returns.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red"
                  aria-hidden
                />
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <HistogramInterpretation />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 8 — Empirical Return Patterns                               */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5.8"
          eyebrow="Section 8"
          title="Empirical return patterns"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Researchers have documented several{" "}
            <strong className="text-white">historical anomalies</strong> —
            patterns where certain types of stocks tended to outperform what
            simple models predict. Each has multiple candidate explanations.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ANOMALY_CARDS.map((a) => (
            <Panel key={a.id}>
              <div className="ops-caption text-[11px] text-accent-cyan">
                {a.name}
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                <strong className="text-white">Observation:</strong>{" "}
                {a.observation}
              </p>
              <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
                <span className="text-accent-amber">Risk explanation:</span>{" "}
                {a.risk}
              </p>
              <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
                <span className="text-accent-purple">
                  Behavioral explanation:
                </span>{" "}
                {a.behavioral}
              </p>
              <p className="ops-body mt-2 text-[14px] leading-6 text-slate-400">
                <span className="text-slate-500">Limitation:</span>{" "}
                {a.limitation}
              </p>
            </Panel>
          ))}
        </div>
      </Reveal>
      <Reveal className="mt-5">
        <AnomalyInterpretationLab />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 9 — Anomalies ≠ Free Money                                  */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5.9"
          eyebrow="Section 9"
          title="Anomalies are not free money"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            A historical pattern does not guarantee future profits. Real-world
            investing involves frictions and risks that erode or eliminate
            apparent edges:
          </p>
          <ul className="mt-4 space-y-2">
            {[
              "Transaction costs and bid-ask spreads eat into gross returns.",
              "Taxes reduce net returns, especially for short holding periods.",
              "Short-sale constraints prevent exploiting negative anomalies.",
              "Data mining — testing many strategies on the same data inflates false positives.",
              "Publication bias — successful strategies get published; failures do not.",
              "Crowding — once an anomaly is known, capital flows in and shrinks it.",
              "Structural change — the economy and markets evolve, eroding old patterns.",
              "Hidden risk — the strategy may work until a tail event reveals its exposure.",
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
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <AnomalyCritique />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 10 — Previewing CAPM and APT                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5.10"
          eyebrow="Section 10"
          title="Previewing CAPM and APT"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            The empirical patterns above — co-movement, risk-return tradeoffs,
            anomalies — raise a theoretical question:{" "}
            <strong className="text-white">
              how should expected return depend on risk?
            </strong>{" "}
            Two foundational models organize this question. We introduce them
            conceptually here; a later module evaluates them formally.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="CAPM (Capital Asset Pricing Model)"
          formula={String.raw`E[R_i] = r_f + \beta_i\,(E[R_M] - r_f)`}
          meaning="Expected return equals the risk-free rate plus a risk premium: the stock's beta times the market risk premium."
          variables={[
            {
              symbol: String.raw`r_f`,
              description: "Risk-free rate.",
            },
            {
              symbol: String.raw`\beta_i`,
              description: "Stock i's beta (market sensitivity).",
            },
            {
              symbol: String.raw`E[R_M] - r_f`,
              description:
                "Market risk premium (expected market return above risk-free).",
            },
          ]}
          interpretation="CAPM uses a single factor — the market. Beta is the only risk that earns a premium, because it is the only risk that cannot be diversified away."
          tone="cyan"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="APT (Arbitrage Pricing Theory)"
          formula={String.raw`E[R_i] = r_f + \beta_{i1}\lambda_1 + \beta_{i2}\lambda_2 + \cdots`}
          meaning="Expected return equals the risk-free rate plus the sum of each factor exposure times its factor premium."
          variables={[
            {
              symbol: String.raw`\beta_{ik}`,
              description: "Stock i's exposure (beta) to factor k.",
            },
            {
              symbol: String.raw`\lambda_k`,
              description: "Risk premium for factor k.",
            },
          ]}
          interpretation="APT generalizes CAPM to multiple factors. Candidates include growth, inflation, interest rates, credit spreads, and commodity factors."
          tone="purple"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Feature
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-accent-cyan">
                    CAPM
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-accent-purple">
                    APT
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {[
                  ["Number of factors", "1 (market)", "Multiple"],
                  ["Risk measure", "Single beta", "Multiple factor betas"],
                  [
                    "Factor examples",
                    "Market only",
                    "Growth, inflation, rates, credit, commodities",
                  ],
                  [
                    "Expected return driver",
                    "Market premium",
                    "Sum of factor premiums",
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
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            This lesson presents the <em>empirical questions</em>: what do
            returns look like, and what patterns challenge simple models? A
            later module evaluates whether CAPM, APT, or multifactor models
            answer those questions adequately.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* FINAL EVIDENCE REVIEW                                               */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.5★"
          eyebrow="Review"
          title="Empirical evidence review"
        />
      </Reveal>
      <Reveal className="mt-5">
        <EvidenceReview />
      </Reveal>

      {/* =================================================================== */}
      {/* MASTERY CHECK                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <MasteryCheck
          title="Mastery check"
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Portfolio Risk Lab"
          continueHref="/lessons/risk-portfolio-risk-lab"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Portfolio Risk Lab"
          continueHref="/lessons/risk-portfolio-risk-lab"
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
/* DATA: Anomaly cards                                                       */
/* ========================================================================= */
const ANOMALY_CARDS = [
  {
    id: "size",
    name: "Size effect",
    observation:
      "Historically, small-cap stocks tended to outperform large-cap stocks.",
    risk: "Small firms may carry more distress and liquidity risk.",
    behavioral:
      "Small caps may be under-researched and neglected by investors.",
    limitation:
      "The effect appears to have weakened after it was widely published.",
  },
  {
    id: "value",
    name: "Value effect",
    observation:
      "Stocks with low price-to-book ratios tended to outperform growth stocks.",
    risk: "Cheap stocks may be cheap because they carry distress or bankruptcy risk.",
    behavioral: "Investors may overreact to bad news, pushing prices too low.",
    limitation:
      "Value can underperform for extended periods (e.g., the 2010s).",
  },
  {
    id: "momentum",
    name: "Momentum",
    observation:
      "Stocks that outperformed over the past 6–12 months tended to keep outperforming.",
    risk: "Momentum profits can vanish suddenly in 'momentum crashes.'",
    behavioral:
      "Investors may underreact to news, causing slow price adjustment.",
    limitation: "High turnover means transaction costs can erode net returns.",
  },
  {
    id: "accruals",
    name: "Accruals anomaly",
    observation:
      "Firms with high accruals (non-cash earnings) tended to underperform.",
    risk: "High accruals may signal deteriorating business quality.",
    behavioral:
      "Investors may fixate on reported earnings and miss quality issues.",
    limitation:
      "The effect is small per-stock and requires broad implementation.",
  },
  {
    id: "issuance",
    name: "Net issuance",
    observation:
      "Firms that issue equity tend to underperform; firms that repurchase tend to outperform.",
    risk: "Issuance may signal that managers see the stock as overvalued (information asymmetry).",
    behavioral: "Market timing — managers exploit investor overoptimism.",
    limitation: "Hard to separate from other firm characteristics.",
  },
  {
    id: "profitability",
    name: "Profitability",
    observation:
      "Firms with high profitability (e.g., gross profitability) tended to outperform.",
    risk: "High-quality firms may be genuinely less risky than their prices imply.",
    behavioral: "Investors may underestimate the persistence of profitability.",
    limitation: "Definitions of profitability vary across studies.",
  },
];

/* ========================================================================= */
/* SVG: Risk-Return Scatter (Section 1) — historical data                   */
/* ========================================================================= */
function RiskReturnScatter() {
  const assets = [
    { name: "T-bill", sd: 0.24, mean: 0.38, tone: "rgb(34,211,238)" },
    { name: "10-yr T-note", sd: 2.63, mean: 0.46, tone: "rgb(192,132,252)" },
    { name: "VW market", sd: 4.23, mean: 1.01, tone: "rgb(74,222,128)" },
    { name: "EW market", sd: 5.3, mean: 1.18, tone: "rgb(251,191,36)" },
    { name: "Motorola", sd: 10.02, mean: 1.66, tone: "rgb(248,113,113)" },
  ];
  const width = 380;
  const height = 280;
  const padL = 50;
  const padR = 16;
  const padT = 16;
  const padB = 42;
  const xMax = 11;
  const yMax = 2.0;
  const sx = (x: number) => padL + (x / xMax) * (width - padL - padR);
  const sy = (y: number) => height - padB - (y / yMax) * (height - padT - padB);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="Historical risk-return scatter: mean monthly return vs monthly standard deviation, 1946 to 2001"
    >
      {/* grid */}
      {[0, 2, 4, 6, 8, 10].map((x) => (
        <g key={`gx${x}`}>
          <line
            x1={sx(x)}
            y1={padT}
            x2={sx(x)}
            y2={height - padB}
            stroke="rgba(255,255,255,0.06)"
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
      {[0, 0.5, 1.0, 1.5, 2.0].map((y) => (
        <g key={`gy${y}`}>
          <line
            x1={padL}
            y1={sy(y)}
            x2={width - padR}
            y2={sy(y)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={0.5}
          />
          <text
            x={padL - 8}
            y={sy(y) + 3}
            textAnchor="end"
            fill="rgba(148,163,184,0.7)"
            fontSize={10}
          >
            {y.toFixed(1)}
          </text>
        </g>
      ))}
      {/* points */}
      {assets.map((a) => (
        <g key={a.name}>
          <circle
            cx={sx(a.sd)}
            cy={sy(a.mean)}
            r={5}
            fill={a.tone}
            fillOpacity={0.7}
            stroke={a.tone}
            strokeWidth={1}
          />
          <text
            x={sx(a.sd) + 8}
            y={sy(a.mean) + 4}
            fill="rgba(226,232,240,0.9)"
            fontSize={11}
          >
            {a.name}
          </text>
        </g>
      ))}
      {/* axis labels */}
      <text
        x={(padL + width - padR) / 2}
        y={height - 6}
        textAnchor="middle"
        fill="rgba(148,163,184,0.9)"
        fontSize={11}
      >
        Monthly SD (%)
      </text>
      <text
        x={14}
        y={(padT + height - padB) / 2}
        textAnchor="middle"
        transform={`rotate(-90 14 ${(padT + height - padB) / 2})`}
        fill="rgba(148,163,184,0.9)"
        fontSize={11}
      >
        Mean monthly return (%)
      </text>
    </svg>
  );
}

/* ========================================================================= */
/* SVG: Same-Period Scatter (Section 3) — illustrative                      */
/* ========================================================================= */
function SamePeriodScatter() {
  const points = useMemo(() => {
    const rng = makeRng(101);
    const N = 26;
    const arr: { x: number; y: number }[] = [];
    for (let i = 0; i < N; i++) {
      const x = -9 + 18 * rng();
      const noise = (rng() - 0.5) * 8;
      const y = 1.1 * x + noise;
      arr.push({ x, y });
    }
    return arr;
  }, []);

  return (
    <GenericScatter
      points={points}
      beta={1.1}
      ariaLabel="Illustrative same-period scatter of stock return vs market return"
    />
  );
}

/* ========================================================================= */
/* Reusable generic scatter component                                        */
/* ========================================================================= */
function GenericScatter({
  points,
  beta,
  showLine = true,
  ariaLabel,
}: {
  points: { x: number; y: number }[];
  beta?: number;
  showLine?: boolean;
  ariaLabel: string;
}) {
  const width = 340;
  const height = 260;
  const padL = 42;
  const padR = 14;
  const padT = 14;
  const padB = 36;
  const xMin = -12;
  const xMax = 12;
  const yMin = -16;
  const yMax = 16;
  const sx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (width - padL - padR);
  const sy = (y: number) =>
    height - padB - ((y - yMin) / (yMax - yMin)) * (height - padT - padB);
  const clampedSy = (y: number) =>
    Math.max(padT, Math.min(height - padB, sy(y)));

  const xGrid = [-10, -5, 0, 5, 10];
  const yGrid = [-15, -10, -5, 0, 5, 10, 15];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <rect
        x={padL}
        y={padT}
        width={width - padL - padR}
        height={height - padT - padB}
        fill="rgba(255,255,255,0.02)"
      />
      {xGrid.map((x) => (
        <g key={`x${x}`}>
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
            y={height - padB + 15}
            textAnchor="middle"
            fill="rgba(148,163,184,0.7)"
            fontSize={10}
          >
            {x}
          </text>
        </g>
      ))}
      {yGrid.map((y) => (
        <g key={`y${y}`}>
          <line
            x1={padL}
            y1={sy(y)}
            x2={width - padR}
            y2={sy(y)}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={0.5}
          />
          <text
            x={padL - 7}
            y={sy(y) + 3}
            textAnchor="end"
            fill="rgba(148,163,184,0.7)"
            fontSize={10}
          >
            {y}
          </text>
        </g>
      ))}
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
      {showLine && beta !== undefined && (
        <line
          x1={sx(-10)}
          y1={clampedSy(beta * -10)}
          x2={sx(10)}
          y2={clampedSy(beta * 10)}
          stroke="rgb(34,211,238)"
          strokeWidth={2}
        />
      )}
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
/* INTERACTIVE: Chart Reading Exercise (Section 3)                          */
/* ========================================================================= */
function ChartReadingExercise() {
  const [answers, setAnswers] = useState<Record<string, string | undefined>>(
    {},
  );
  const items = [
    {
      id: "dir",
      q: "Which direction does the scatter slope?",
      choices: [
        { id: "up", label: "Upward (positive)" },
        { id: "flat", label: "Flat (no relationship)" },
        { id: "down", label: "Downward (negative)" },
      ],
      correct: "up",
      explain:
        "The cloud slopes upward: when the market rises, the stock tends to rise too. This is positive beta.",
    },
    {
      id: "beta",
      q: "Does the slope suggest beta above or below 1?",
      choices: [
        { id: "above", label: "Above 1" },
        { id: "below", label: "Below 1" },
        { id: "cannot", label: "Cannot tell from slope alone" },
      ],
      correct: "above",
      explain:
        "The fitted line is steeper than 45°, suggesting beta above 1 — the stock amplifies market moves.",
    },
    {
      id: "scatter",
      q: "What does the vertical scatter around the line represent?",
      choices: [
        { id: "idio", label: "Idiosyncratic risk" },
        { id: "syst", label: "Systematic risk" },
        { id: "noise", label: "Measurement error only" },
      ],
      correct: "idio",
      explain:
        "The scatter is the firm-specific component — the idiosyncratic risk that diversification reduces.",
    },
  ];

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Chart-reading exercise
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Read the co-movement chart
      </h4>
      <div className="mt-5 grid grid-cols-1 gap-3">
        {items.map((item) => {
          const picked = answers[item.id];
          const isCorrect = picked === item.correct;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <p className="ops-body text-[15px] leading-6 text-slate-100">
                {item.q}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.choices.map((c) => {
                  const active = picked === c.id;
                  const showResult = picked !== undefined;
                  const thisCorrect = c.id === item.correct;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-label={`${item.q}: ${c.label}`}
                      onClick={() =>
                        setAnswers((p) => ({ ...p, [item.id]: c.id }))
                      }
                      className={cn(
                        "rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        !active &&
                          "border-white/20 text-slate-200 hover:border-accent-cyan/60",
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
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {picked !== undefined && (
                <Feedback status={isCorrect ? "correct" : "incorrect"}>
                  {isCorrect ? "Correct. " : "Not quite. "}
                  {item.explain}
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
/* INTERACTIVE: Predictability Comparison (Section 4)                       */
/* ========================================================================= */
function PredictabilityComparison() {
  const [answer, setAnswer] = useState<string | undefined>(undefined);

  const samePeriod = useMemo(() => {
    const rng = makeRng(55);
    const N = 28;
    const arr: { x: number; y: number }[] = [];
    for (let i = 0; i < N; i++) {
      const x = -9 + 18 * rng();
      const noise = (rng() - 0.5) * 7;
      arr.push({ x, y: 1.0 * x + noise });
    }
    return arr;
  }, []);

  const lagged = useMemo(() => {
    const rng = makeRng(77);
    const N = 28;
    const arr: { x: number; y: number }[] = [];
    for (let i = 0; i < N; i++) {
      const x = -9 + 18 * rng();
      const y = -9 + 18 * rng();
      arr.push({ x, y });
    }
    return arr;
  }, []);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Predictability comparison
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Which chart shows clearer co-movement?
      </h4>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="ops-caption text-center text-[11px] text-accent-cyan">
            Chart A
          </div>
          <GenericScatter
            points={samePeriod}
            beta={1.0}
            ariaLabel="Illustrative same-period scatter showing co-movement"
          />
        </div>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="ops-caption text-center text-[11px] text-accent-amber">
            Chart B
          </div>
          <GenericScatter
            points={lagged}
            showLine={false}
            ariaLabel="Illustrative lagged scatter showing little pattern"
          />
        </div>
      </div>
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
        Which chart shows clearer linear co-movement?
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { id: "a", label: "Chart A" },
          { id: "b", label: "Chart B" },
          { id: "same", label: "Both equally" },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            aria-label={c.label}
            onClick={() => setAnswer(c.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              answer === undefined &&
                "border-white/20 text-slate-200 hover:border-accent-cyan/60",
              answer === c.id &&
                c.id === "a" &&
                "border-accent-green bg-accent-green/15 text-accent-green",
              answer === c.id &&
                c.id !== "a" &&
                "border-accent-red bg-accent-red/15 text-accent-red",
              answer !== undefined &&
                answer !== c.id &&
                c.id === "a" &&
                "border-accent-green/40 text-accent-green/80",
              answer !== undefined &&
                answer !== c.id &&
                c.id !== "a" &&
                "border-white/10 text-slate-500",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      {answer !== undefined && (
        <Feedback status={answer === "a" ? "correct" : "incorrect"}>
          {answer === "a"
            ? "Correct. Chart A (same-period) shows a clear upward-sloping cloud — positive beta. Chart B (lagged) shows little obvious linear pattern. Same-period co-movement reflects shared contemporaneous exposure, not a forecasting rule."
            : "Chart A (same-period) shows clearer co-movement. Little obvious linear short-run predictability appears in the lagged chart. Same-period correlation is not the same as predictability."}
        </Feedback>
      )}
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* SVG: Random Walk Path (Section 5)                                        */
/* ========================================================================= */
function RandomWalkPath() {
  const returns = [18, -9, 4, 22, -13];
  let wealth = 100;
  const wealthPath = [wealth];
  for (const r of returns) {
    wealth = wealth * (1 + r / 100);
    wealthPath.push(wealth);
  }
  const width = 380;
  const height = 240;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const wMin = 95;
  const wMax = 145;
  const nSteps = wealthPath.length - 1;
  const sx = (i: number) => padL + (i / nSteps) * (width - padL - padR);
  const sy = (w: number) =>
    height - padB - ((w - wMin) / (wMax - wMin)) * (height - padT - padB);

  const polyline = wealthPath.map((w, i) => `${sx(i)},${sy(w)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="Illustrative random walk with positive drift showing a jagged but upward-trending wealth path"
    >
      {/* grid */}
      {[100, 110, 120, 130, 140].map((w) => (
        <g key={`w${w}`}>
          <line
            x1={padL}
            y1={sy(w)}
            x2={width - padR}
            y2={sy(w)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={0.5}
          />
          <text
            x={padL - 8}
            y={sy(w) + 3}
            textAnchor="end"
            fill="rgba(148,163,184,0.7)"
            fontSize={10}
          >
            {w}
          </text>
        </g>
      ))}
      {/* starting line */}
      <line
        x1={padL}
        y1={sy(100)}
        x2={width - padR}
        y2={sy(100)}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={0.5}
        strokeDasharray="4 3"
      />
      {/* path */}
      <polyline
        points={polyline}
        fill="none"
        stroke="rgb(34,211,238)"
        strokeWidth={2}
      />
      {/* points + labels */}
      {wealthPath.map((w, i) => (
        <g key={i}>
          <circle cx={sx(i)} cy={sy(w)} r={3.5} fill="rgb(34,211,238)" />
          {i > 0 && (
            <text
              x={sx(i)}
              y={sy(w) - 10}
              textAnchor="middle"
              fill={
                returns[i - 1] >= 0 ? "rgb(74,222,128)" : "rgb(248,113,113)"
              }
              fontSize={10}
            >
              {returns[i - 1] >= 0 ? "+" : ""}
              {returns[i - 1]}%
            </text>
          )}
        </g>
      ))}
      <text
        x={(padL + width - padR) / 2}
        y={height - 4}
        textAnchor="middle"
        fill="rgba(148,163,184,0.9)"
        fontSize={11}
      >
        Period
      </text>
      <text
        x={14}
        y={(padT + height - padB) / 2}
        textAnchor="middle"
        transform={`rotate(-90 14 ${(padT + height - padB) / 2})`}
        fill="rgba(148,163,184,0.9)"
        fontSize={11}
      >
        Wealth (start = 100)
      </text>
    </svg>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Expandable random walk Q (Section 5)                        */
/* ========================================================================= */
function ExpandableRandomWalk() {
  const [open, setOpen] = useState(false);
  return (
    <InteractiveFrame>
      <p className="ops-body text-[15px] leading-7 text-slate-200">
        <strong className="text-white">
          Why might an obvious pattern weaken after discovery?
        </strong>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          aria-label="Reveal answer"
          onClick={() => setOpen(true)}
          className={cn(
            "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            open
              ? "border-white/10 text-slate-500"
              : "border-accent-cyan/50 bg-accent-cyan/15 text-accent-cyan hover:bg-accent-cyan/25",
          )}
        >
          Reveal answer
        </button>
      </div>
      {open && (
        <Feedback status="info">
          Once a predictable pattern becomes known, investors trade ahead of it.
          Buying pressure pushes prices up before the expected move; selling
          pressure pushes them down. This very action erases the pattern. This
          is one reason markets are described as <em>self-correcting</em>:
          obvious free lunches get arbitraged away.
        </Feedback>
      )}
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Volatility Regime Explorer (Section 6)                      */
/* ========================================================================= */
const REGIMES = [
  {
    id: "calm",
    label: "Calm",
    desc: "Volatility is low and relatively stable. Returns fluctuate modestly around the mean.",
  },
  {
    id: "rising",
    label: "Rising stress",
    desc: "Volatility begins to climb as uncertainty increases. Larger swings appear more frequently.",
  },
  {
    id: "crisis",
    label: "Crisis",
    desc: "Volatility spikes sharply. Extreme moves in both directions become common — a regime shift.",
  },
  {
    id: "norm",
    label: "Normalization",
    desc: "Volatility gradually declines from crisis levels but remains elevated above the calm baseline.",
  },
] as const;

function VolatilityRegimeExplorer() {
  const [regime, setRegime] = useState<(typeof REGIMES)[number]["id"]>("calm");

  // Conceptual rolling-vol paths per regime
  const paths: Record<string, number[]> = {
    calm: [3.0, 2.8, 3.1, 2.9, 3.0, 2.7, 3.2, 2.9, 3.0, 3.1, 2.8, 3.0],
    rising: [3.0, 3.5, 4.2, 5.0, 5.8, 6.5, 7.2, 7.8, 8.0, 7.5, 7.8, 8.0],
    crisis: [
      4.0, 5.0, 7.0, 9.5, 12.0, 14.0, 13.5, 14.5, 13.0, 12.5, 13.5, 12.0,
    ],
    norm: [13.0, 11.5, 10.0, 8.5, 7.5, 6.8, 6.2, 5.5, 5.0, 4.8, 4.5, 4.2],
  };

  const data = paths[regime];
  const width = 380;
  const height = 240;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const yMax = 16;
  const n = data.length;
  const sx = (i: number) => padL + (i / (n - 1)) * (width - padL - padR);
  const sy = (v: number) => height - padB - (v / yMax) * (height - padT - padB);
  const polyline = data.map((v, i) => `${sx(i)},${sy(v)}`).join(" ");

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Volatility regime explorer
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Explore volatility regimes
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Click a regime to see a conceptual rolling-volatility path. These are
        illustrative patterns, not data from any specific period.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {REGIMES.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-label={`Show ${r.label} regime`}
            onClick={() => setRegime(r.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              regime === r.id
                ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                : "border-white/20 text-slate-200 hover:border-accent-cyan/60",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label={`Illustrative rolling volatility path for ${regime} regime`}
        >
          {[0, 4, 8, 12, 16].map((v) => (
            <g key={`v${v}`}>
              <line
                x1={padL}
                y1={sy(v)}
                x2={width - padR}
                y2={sy(v)}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={0.5}
              />
              <text
                x={padL - 8}
                y={sy(v) + 3}
                textAnchor="end"
                fill="rgba(148,163,184,0.7)"
                fontSize={10}
              >
                {v}%
              </text>
            </g>
          ))}
          <polyline
            points={polyline}
            fill="none"
            stroke="rgb(251,191,36)"
            strokeWidth={2}
          />
          {data.map((v, i) => (
            <circle
              key={i}
              cx={sx(i)}
              cy={sy(v)}
              r={3}
              fill="rgb(251,191,36)"
            />
          ))}
          <text
            x={(padL + width - padR) / 2}
            y={height - 4}
            textAnchor="middle"
            fill="rgba(148,163,184,0.9)"
            fontSize={11}
          >
            Time
          </text>
          <text
            x={14}
            y={(padT + height - padB) / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${(padT + height - padB) / 2})`}
            fill="rgba(148,163,184,0.9)"
            fontSize={11}
          >
            Rolling vol (%)
          </text>
        </svg>
        <p className="mt-2 text-center text-[13px] text-slate-500">
          Illustrative conceptual path. Not historical data.
        </p>
      </div>
      <Feedback status="info">
        {REGIMES.find((r) => r.id === regime)!.desc}
      </Feedback>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Histogram Interpretation (Section 7)                        */
/* ========================================================================= */
function HistogramInterpretation() {
  const [answers, setAnswers] = useState<Record<string, string | undefined>>(
    {},
  );
  const items = [
    {
      id: "mean",
      q: "Where is the mean of the distribution?",
      choices: [
        { id: "center", label: "Near the center of the histogram" },
        { id: "tail", label: "In the far left tail" },
        { id: "cant", label: "Cannot be determined" },
      ],
      correct: "center",
      explain:
        "The mean sits near the peak of the distribution, where most observations cluster.",
    },
    {
      id: "tails",
      q: "Compared to the normal curve overlay, are the histogram tails heavier or thinner?",
      choices: [
        { id: "heavier", label: "Heavier (fat tails)" },
        { id: "thinner", label: "Thinner" },
        { id: "same", label: "About the same" },
      ],
      correct: "heavier",
      explain:
        "The bars in the tails are taller than the normal curve predicts. Real returns produce more extreme outcomes than a normal distribution.",
    },
    {
      id: "sd",
      q: "Why might standard deviation alone miss important risk?",
      choices: [
        {
          id: "tails",
          label:
            "It treats gains and losses symmetrically and ignores tail shape",
        },
        { id: "wrong", label: "It is mathematically incorrect" },
        { id: "small", label: "It is always too small" },
      ],
      correct: "tails",
      explain:
        "SD summarizes average spread but does not capture fat tails, skewness, or crash risk. Two distributions can share the same SD but have very different tail behavior.",
    },
  ];

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Histogram interpretation check
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Read the distribution
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Below is a conceptual histogram of stock returns with a normal curve
        overlaid. The bars represent the empirical shape; the smooth curve is
        what a normal distribution with the same mean and SD would look like.
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <FatTailHistogram />
        <p className="mt-2 text-center text-[13px] text-slate-500">
          Illustrative conceptual histogram. Bars = simulated empirical
          distribution; curve = normal with same mean and SD.
        </p>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3">
        {items.map((item) => {
          const picked = answers[item.id];
          const isCorrect = picked === item.correct;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <p className="ops-body text-[15px] leading-6 text-slate-100">
                {item.q}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.choices.map((c) => {
                  const active = picked === c.id;
                  const showResult = picked !== undefined;
                  const thisCorrect = c.id === item.correct;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-label={`${item.q}: ${c.label}`}
                      onClick={() =>
                        setAnswers((p) => ({ ...p, [item.id]: c.id }))
                      }
                      className={cn(
                        "rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        !active &&
                          "border-white/20 text-slate-200 hover:border-accent-cyan/60",
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
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {picked !== undefined && (
                <Feedback status={isCorrect ? "correct" : "incorrect"}>
                  {isCorrect ? "Correct. " : "Not quite. "}
                  {item.explain}
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
/* SVG: Fat-Tail Histogram (Section 7)                                      */
/* ========================================================================= */
function FatTailHistogram() {
  const width = 380;
  const height = 240;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 36;

  // 10 bars from r=-15 to r=15 (each 3 units wide)
  const fatHeights = [15, 19, 39, 92, 158, 158, 92, 39, 19, 15];
  const barW = (width - padL - padR) / 10;

  const normalPoints = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const r = -15 + (30 * i) / 40;
      const x = padL + (i / 40) * (width - padL - padR);
      const pdf = Math.exp(-(r * r) / 50);
      const y = height - padB - 170 * pdf;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [width, height, padL, padR, padB]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="Illustrative histogram of stock returns with fat tails and overlaid normal curve"
    >
      {/* bars */}
      {fatHeights.map((h, i) => {
        const x = padL + i * barW;
        const barTop = height - padB - h;
        return (
          <g key={i}>
            <rect
              x={x + 1}
              y={barTop}
              width={barW - 2}
              height={h}
              fill="rgba(251,191,36,0.35)"
              stroke="rgba(251,191,36,0.6)"
              strokeWidth={0.5}
            />
          </g>
        );
      })}
      {/* normal curve */}
      <polyline
        points={normalPoints}
        fill="none"
        stroke="rgb(34,211,238)"
        strokeWidth={2}
      />
      {/* baseline */}
      <line
        x1={padL}
        y1={height - padB}
        x2={width - padR}
        y2={height - padB}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
      {/* x labels */}
      {[-15, -10, -5, 0, 5, 10, 15].map((r) => {
        const x = padL + ((r + 15) / 30) * (width - padL - padR);
        return (
          <text
            key={r}
            x={x}
            y={height - padB + 15}
            textAnchor="middle"
            fill="rgba(148,163,184,0.7)"
            fontSize={10}
          >
            {r}%
          </text>
        );
      })}
      <text
        x={(padL + width - padR) / 2}
        y={height - 4}
        textAnchor="middle"
        fill="rgba(148,163,184,0.9)"
        fontSize={11}
      >
        Return
      </text>
      {/* legend */}
      <rect
        x={width - padR - 120}
        y={padT}
        width={12}
        height={8}
        fill="rgba(251,191,36,0.5)"
        stroke="rgba(251,191,36,0.7)"
        strokeWidth={0.5}
      />
      <text
        x={width - padR - 104}
        y={padT + 7}
        fill="rgba(226,232,240,0.8)"
        fontSize={10}
      >
        Empirical
      </text>
      <line
        x1={width - padR - 120}
        y1={padT + 20}
        x2={width - padR - 108}
        y2={padT + 20}
        stroke="rgb(34,211,238)"
        strokeWidth={2}
      />
      <text
        x={width - padR - 104}
        y={padT + 23}
        fill="rgba(226,232,240,0.8)"
        fontSize={10}
      >
        Normal
      </text>
    </svg>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Anomaly Interpretation Lab (Section 8)                      */
/* ========================================================================= */
const CLASSIFICATIONS = [
  { id: "risk", label: "Risk premium" },
  { id: "behavioral", label: "Behavioral" },
  { id: "transaction-cost", label: "Transaction cost" },
  { id: "data-mining", label: "Data mining" },
  { id: "unresolved", label: "Unresolved" },
] as const;

const ANOMALY_LAB: {
  id: string;
  name: string;
  feedback: Record<string, string>;
}[] = [
  {
    id: "size",
    name: "Size effect",
    feedback: {
      risk: "Commonly cited: small firms carry more distress and liquidity risk.",
      behavioral:
        "Commonly cited: small caps are under-researched and neglected.",
      "transaction-cost":
        "Relevant: small caps have higher trading costs, which may partly explain the gross return gap.",
      "data-mining": "Possible concern: the effect weakened after publication.",
      unresolved: "Reasonable: no single explanation is universally accepted.",
    },
  },
  {
    id: "value",
    name: "Value effect",
    feedback: {
      risk: "Commonly cited: cheap stocks may carry distress or bankruptcy risk.",
      behavioral: "Commonly cited: investors may overreact to bad news.",
      "transaction-cost":
        "Less central: value strategies have moderate turnover.",
      "data-mining":
        "Less likely: the value effect appears across many markets and periods.",
      unresolved:
        "Reasonable: the debate between risk and behavioral explanations continues.",
    },
  },
  {
    id: "momentum",
    name: "Momentum",
    feedback: {
      risk: "Partially: momentum profits come with 'momentum crash' risk.",
      behavioral:
        "Commonly cited: investor underreaction causes slow price adjustment.",
      "transaction-cost":
        "Very relevant: high turnover means costs can erode net returns significantly.",
      "data-mining":
        "Less likely: momentum appears across markets and asset classes.",
      unresolved:
        "Reasonable: the interaction of behavioral and risk channels is still debated.",
    },
  },
  {
    id: "accruals",
    name: "Accruals anomaly",
    feedback: {
      risk: "Possible: high accruals may signal deteriorating business quality.",
      behavioral:
        "Commonly cited: investors fixate on reported earnings and miss quality issues.",
      "transaction-cost":
        "Relevant: implementation requires analyzing many firms' financial statements.",
      "data-mining":
        "Less likely: the accruals anomaly has been documented in multiple samples.",
      unresolved:
        "Reasonable: both risk and behavioral channels are active research areas.",
    },
  },
  {
    id: "issuance",
    name: "Net issuance",
    feedback: {
      risk: "Possible: issuance may reflect information asymmetry about true risk.",
      behavioral:
        "Commonly cited: managers time the market, exploiting investor overoptimism.",
      "transaction-cost":
        "Less central: the strategy is based on corporate actions, not high-frequency trading.",
      "data-mining": "Less likely: issuance effects are broad and persistent.",
      unresolved:
        "Reasonable: separating information, timing, and risk channels is difficult.",
    },
  },
];

function AnomalyInterpretationLab() {
  const [picks, setPicks] = useState<Record<string, string | undefined>>({});

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Anomaly interpretation lab
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Explore each anomaly&apos;s possible explanations
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        For each anomaly, click a classification to see how that explanation
        applies. There is no single &ldquo;correct&rdquo; answer — multiple
        explanations may be valid. The goal is to understand the <em>debate</em>
        , not to force one label.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3">
        {ANOMALY_LAB.map((a) => {
          const picked = picks[a.id];
          return (
            <div
              key={a.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <p className="ops-body-strong text-[15px] text-slate-50">
                {a.name}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CLASSIFICATIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={`${a.name}: classify as ${c.label}`}
                    onClick={() => setPicks((p) => ({ ...p, [a.id]: c.id }))}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      picked === c.id
                        ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                        : "border-white/20 text-slate-300 hover:border-accent-cyan/60",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {picked !== undefined && (
                <Feedback status="info">{a.feedback[picked]}</Feedback>
              )}
            </div>
          );
        })}
      </div>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Anomaly Critique (Section 9)                                */
/* ========================================================================= */
function AnomalyCritique() {
  const [answer, setAnswer] = useState<string | undefined>(undefined);
  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Critique the claim
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Spot the flaw
      </h4>
      <div className="mt-4 rounded-xl border border-accent-amber/20 bg-accent-amber/[0.04] p-5">
        <p className="ops-body text-[16px] leading-7 text-slate-100">
          &ldquo;Value stocks outperformed historically, so buying the cheapest
          P/B stocks must guarantee higher future returns.&rdquo;
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          aria-label="Agree with the claim"
          onClick={() => setAnswer("agree")}
          className={cn(
            "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            answer === "agree"
              ? "border-accent-red bg-accent-red/15 text-accent-red"
              : "border-white/20 text-slate-200 hover:border-accent-red/60",
          )}
        >
          Agree
        </button>
        <button
          type="button"
          aria-label="Disagree with the claim"
          onClick={() => setAnswer("disagree")}
          className={cn(
            "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            answer === "disagree"
              ? "border-accent-green bg-accent-green/15 text-accent-green"
              : "border-white/20 text-slate-200 hover:border-accent-green/60",
          )}
        >
          Disagree
        </button>
      </div>
      {answer !== undefined && (
        <Feedback status={answer === "disagree" ? "correct" : "incorrect"}>
          {answer === "disagree"
            ? "Correct. Historical outperformance is not a guarantee. The value effect may weaken due to transaction costs, taxes, crowding, data mining concerns, or structural change. It may also reflect hidden risk — value stocks may be cheap for a reason."
            : "The claim is flawed. Historical patterns are not guarantees. The value effect can weaken or disappear due to costs, crowding, data mining, publication bias, or structural change. Past average outperformance does not commit the future."}
        </Feedback>
      )}
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Evidence Review (before mastery check)                      */
/* ========================================================================= */
const EVIDENCE_PAIRS = [
  {
    id: "ev1",
    evidence: "Individual stock vol >> index vol",
    choices: [
      "Diversification removes idiosyncratic risk",
      "Markets are perfectly efficient",
      "Stocks never recover",
    ],
    correct: 0,
  },
  {
    id: "ev2",
    evidence: "Lagged market scatter shows little pattern",
    choices: [
      "Limited short-run predictability",
      "Stocks are uncorrelated with the market",
      "Returns follow a smooth trend",
    ],
    correct: 0,
  },
  {
    id: "ev3",
    evidence: "Rolling volatility changes sharply",
    choices: [
      "Volatility always declines",
      "Volatility is constant",
      "Volatility is regime-dependent",
    ],
    correct: 2,
  },
  {
    id: "ev4",
    evidence: "Historical tails exceed normal predictions",
    choices: [
      "Normal may understate extremes",
      "Normal perfectly fits the data",
      "Tails are irrelevant",
    ],
    correct: 0,
  },
  {
    id: "ev5",
    evidence: "Higher-vol categories had higher avg returns",
    choices: [
      "All assets have the same return",
      "Risk and return are related historically",
      "Volatility guarantees profit",
    ],
    correct: 1,
  },
  {
    id: "ev6",
    evidence: "Same-period stock-market scatter slopes up",
    choices: [
      "Stocks co-move with the market (beta)",
      "Stocks are independent of the market",
      "The market predicts each stock exactly",
    ],
    correct: 0,
  },
];

function EvidenceReview() {
  const [answers, setAnswers] = useState<Record<string, number | undefined>>(
    {},
  );

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Match evidence to conclusion
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Connect the evidence
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        For each piece of empirical evidence, choose the most appropriate
        conclusion.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3">
        {EVIDENCE_PAIRS.map((ep) => {
          const picked = answers[ep.id];
          const isCorrect = picked === ep.correct;
          return (
            <div
              key={ep.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <p className="ops-body text-[15px] leading-6 text-slate-100">
                <span className="text-accent-cyan">Evidence:</span>{" "}
                {ep.evidence}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ep.choices.map((c, ci) => {
                  const active = picked === ci;
                  const showResult = picked !== undefined;
                  const thisCorrect = ci === ep.correct;
                  return (
                    <button
                      key={ci}
                      type="button"
                      aria-label={`${ep.evidence}: ${c}`}
                      onClick={() => setAnswers((p) => ({ ...p, [ep.id]: ci }))}
                      className={cn(
                        "rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        !active &&
                          "border-white/20 text-slate-200 hover:border-accent-cyan/60",
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
                      {c}
                    </button>
                  );
                })}
              </div>
              {picked !== undefined && (
                <Feedback status={isCorrect ? "correct" : "incorrect"}>
                  {isCorrect
                    ? "Correct match. "
                    : `Best match: "${ep.choices[ep.correct]}." `}
                </Feedback>
              )}
            </div>
          );
        })}
      </div>
    </InteractiveFrame>
  );
}
