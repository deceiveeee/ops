"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Reveal,
  Panel,
  DefinitionCard,
  FormulaExplainer,
  Feedback,
  InteractiveFrame,
  TryItTag,
  MasteryCheck,
  type MasteryQuestion,
  LessonSummary,
  ConceptSection,
  CalculationWorksheet,
} from "./shared";
import { InlineMath, BlockMath } from "@/components/ui/Math";
import ExpandableQA from "@/components/lessons/equities/ExpandableQA";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import PTLayout from "./PTLayout";
import PTSourcePanel from "./PTSourcePanel";
import { useReportPTComplete } from "@/lib/pt-progress";

const SUMMARY_POINTS = [
  "Portfolio weights describe the fraction of wealth in each asset.",
  "Fully invested weights sum to 100%.",
  "Realized portfolio return is a weighted average of asset returns.",
  "Expected portfolio return uses the same weighting with expected returns.",
  "An asset's contribution is its weight times its return, in percentage points.",
  "Portfolio risk is not generally a weighted average — co-movement matters.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "$60K in A, $40K in B, total $100K. What is w_A?",
    choices: [
      { id: "sixty", label: "60%" },
      { id: "forty", label: "40%" },
      { id: "hundred", label: "100%" },
    ],
    correctId: "sixty",
    hint: "w_A = market value of A / total = 60 / 100 = 60%.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "w_A = 60%, R_A = 10%, w_B = 40%, R_B = −5%. What is R_P?",
    choices: [
      { id: "four", label: "4%" },
      { id: "five", label: "5%" },
      { id: "fifteen", label: "15%" },
    ],
    correctId: "four",
    hint: "R_P = 0.60 × 10% + 0.40 × (−5%) = 6% − 2% = 4%.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "Stock A returns 10% with a 60% weight. Its contribution is:",
    choices: [
      { id: "sixpp", label: "6 percentage points" },
      { id: "tenpp", label: "10 percentage points" },
      { id: "sixty", label: "60%" },
    ],
    correctId: "sixpp",
    hint: "Contribution = weight × return = 0.60 × 10% = 6 percentage points.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "Which is generally true?",
    choices: [
      {
        id: "retavg",
        label: "Expected return is a weighted average but risk is not",
      },
      { id: "bothavg", label: "Both return and risk are weighted averages" },
      { id: "neither", label: "Neither is a weighted average" },
    ],
    correctId: "retavg",
    hint: "Return is linear in weights, but risk depends on co-movement, so it is not a simple weighted average.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "A weight of −50% could represent:",
    choices: [
      { id: "borrow", label: "Borrowing or short selling" },
      { id: "dividend", label: "A dividend" },
      { id: "riskfree", label: "A risk-free asset" },
    ],
    correctId: "borrow",
    hint: "Negative weights indicate short positions or borrowing; over 100% indicates leverage.",
  },
];

const HOLDINGS = [
  { asset: "Stock A", value: "$10,000", weight: "10%" },
  { asset: "Stock B", value: "$60,000", weight: "60%" },
  { asset: "Stock C", value: "$30,000", weight: "30%" },
];

const LEVERAGE_ROWS = [
  { position: "Risky assets", weight: "150%", tone: "cyan" as const },
  { position: "Borrowing", weight: "−50%", tone: "red" as const },
  { position: "Net", weight: "100%", tone: "green" as const },
];

function AllocationTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[440px] border-collapse text-[16px]">
        <thead>
          <tr className="border-b border-white/20 text-left">
            <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
              Asset
            </th>
            <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
              Market value
            </th>
            <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
              Weight
            </th>
            <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
              Share of $100K
            </th>
          </tr>
        </thead>
        <tbody className="text-slate-100">
          {HOLDINGS.map((row) => (
            <tr key={row.asset} className="border-b border-white/5">
              <td className="py-3 pr-8">{row.asset}</td>
              <td className="py-3 pr-8 font-sans tabular-nums">{row.value}</td>
              <td className="py-3 pr-8 font-sans tabular-nums text-accent-cyan">{row.weight}</td>
              <td className="py-3">
                <div className="h-2.5 w-full max-w-[160px] overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-accent-cyan/70"
                    style={{ width: row.weight }}
                  />
                </div>
              </td>
            </tr>
          ))}
          <tr>
            <td className="py-3 pr-8 font-semibold text-slate-50">Total</td>
            <td className="py-3 pr-8 font-sans font-semibold tabular-nums text-slate-50">$100,000</td>
            <td className="py-3 pr-8 font-sans font-semibold tabular-nums text-accent-green">100%</td>
            <td className="py-3" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ContributionDiagram() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Asset A
        </div>
        <div className="mt-2 text-[17px] text-slate-100">
          own return <span className="font-sans text-accent-amber">10%</span>
        </div>
        <div className="mt-1 text-[15px] text-slate-400">
          weight <span className="font-sans text-accent-cyan">0.60</span>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <span className="font-sans text-[14px] text-slate-500">×</span>
      </div>
      <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-5">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          Contribution to R_P
        </div>
        <div className="mt-2 text-[17px] text-slate-100">
          <span className="font-sans text-accent-cyan">6 percentage points</span>
        </div>
        <div className="mt-1 text-[15px] text-slate-400">
          the part of portfolio return A actually delivers
        </div>
      </div>
    </div>
  );
}

function TransitionCheck() {
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<string | null>(null);
  const correctId = "comove";
  const answered = picked !== null;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-5">
          <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-green">
            Expected return
          </div>
          <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
            A clean weighted average. Double an asset&apos;s weight and you double its
            contribution. Linear — easy.
          </p>
          <div className="mt-3">
            <BlockMath>{String.raw`E[R_P] = w_A E[R_A] + w_B E[R_B]`}</BlockMath>
          </div>
        </div>
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-5">
          <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-red">
            Risk — what people assume
          </div>
          <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
            A tempting but wrong shortcut: weight the volatilities the same way.
            It ignores how assets move together.
          </p>
          <div className="mt-3">
            <BlockMath>{String.raw`\sigma_P \neq w_A \sigma_A + w_B \sigma_B`}</BlockMath>
          </div>
        </div>
      </div>

      <h4 className="mt-7 text-[19px] text-white">
        If <InlineMath>{String.raw`\sigma_P`}</InlineMath> is not that, what is missing?
      </h4>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {[
          { id: "comove", label: "How the assets move relative to each other" },
          { id: "prices", label: "The current prices of each asset" },
          { id: "dividends", label: "The dividend dates of each asset" },
        ].map((c) => {
          const isPicked = picked === c.id;
          const isCorrect = c.id === correctId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setPicked(c.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-left text-[15px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                !answered &&
                  (isPicked
                    ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                    : "border-white/20 text-slate-100 hover:border-accent-cyan/60 hover:text-accent-cyan"),
                answered &&
                  isCorrect &&
                  "border-accent-green bg-accent-green/15 text-accent-green",
                answered &&
                  isPicked &&
                  !isCorrect &&
                  "border-accent-red bg-accent-red/15 text-accent-red",
                answered && !isPicked && !isCorrect && "border-white/10 text-slate-500",
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      {answered && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Feedback status={picked === correctId ? "correct" : "incorrect"}>
            {picked === correctId ? (
              <span>
                Correct. Individual volatilities are not enough — portfolio risk
                depends on how the assets move{" "}
                <span className="text-slate-200">together</span>. That relationship is
                captured by covariance and correlation, the subject of the next lesson.
              </span>
            ) : (
              <span>
                Not quite. Prices and dividends do not determine how risks combine.
                The missing piece is <span className="text-slate-200">co-movement</span> —
                how the assets move relative to each other.
              </span>
            )}
          </Feedback>
        </motion.div>
      )}
    </div>
  );
}

export default function Lesson6_1() {
  const report = useReportPTComplete("portfolio-weights-returns");

  return (
    <PTLayout>
      <PVHero
        index="6.1"
        eyebrow="Lesson 6.1 · Module 6 — Portfolio Theory"
        heading="Portfolios, Weights, and Returns"
        subheading="How a portfolio is represented by weights, how realized and expected returns are calculated, and why risk is different."
        bullets={[
          "Weights sum to 100% for a fully invested portfolio",
          "Realized return = weighted average",
          "Expected return = weighted average",
          "Risk is NOT a simple weighted average",
        ]}
        primaryLabel="Start"
      />

      {/* ===================== SCENE 1 — ALLOCATION ===================== */}
      <ConceptSection
        index="6.1.1"
        eyebrow="Scene 1 · Allocation"
        title="A portfolio is its weights"
        intro="A portfolio is a collection of assets. Rather than track every share count, we describe it with portfolio weights — the fraction of total wealth held in each asset."
      >
        <Reveal>
          <div className="max-w-3xl">
            <BlockMath>{String.raw`w_i = \frac{\text{market value of asset } i}{\text{total portfolio value}}`}</BlockMath>
          </div>
          <p className="mt-4 max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            Each weight is the dollars invested in an asset divided by the total
            dollars in the portfolio. Pair the dollar holdings directly with the
            weights they produce:
          </p>
        </Reveal>

        <Reveal>
          <AllocationTable />
        </Reveal>

        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            When the portfolio is <strong className="text-white">fully invested</strong>,
            the weights sum to 1 (100%). This is the one place we state the
            fully-invested condition in this lesson:
          </p>
          <div className="mt-4 max-w-2xl">
            <BlockMath>{String.raw`w_A + w_B + w_C = 0.10 + 0.60 + 0.30 = 1`}</BlockMath>
          </div>
        </Reveal>

        <Reveal>
          <DefinitionCard term="Fully invested">
            A portfolio where the weights of all assets sum to 1. No money is set
            aside and none is borrowed.
          </DefinitionCard>
        </Reveal>

        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            Weights need not stay between 0 and 100%. A{" "}
            <strong className="text-white">negative weight</strong> is a short sale
            or borrowed funds; a weight{" "}
            <strong className="text-white">above 100%</strong> means leverage.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
                    Position
                  </th>
                  <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
                    Weight
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-100">
                {LEVERAGE_ROWS.map((row) => (
                  <tr key={row.position} className="border-b border-white/5">
                    <td className="py-3 pr-8">{row.position}</td>
                    <td
                      className={cn(
                        "py-3 font-sans tabular-nums",
                        row.tone === "cyan" && "text-accent-cyan",
                        row.tone === "red" && "text-accent-red",
                        row.tone === "green" && "font-semibold text-accent-green",
                      )}
                    >
                      {row.weight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-[16px] leading-[1.65] text-slate-400">
            The investor puts up equity, borrows an amount equal to 50% of equity,
            and invests 150% into risky assets. Net weights still sum to 100%.
            Leverage amplifies both gains and losses.
          </p>
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 2 — CONTRIBUTIONS ===================== */}
      <ConceptSection
        index="6.1.2"
        eyebrow="Scene 2 · Return contributions"
        title="A portfolio's return is a weighted average"
        intro="Whether realized or expected, portfolio return is linear in the weights. Each asset's contribution is its weight times its return."
      >
        <Reveal>
          <FormulaExplainer
            label="Realized portfolio return"
            formula={String.raw`R_P = w_1 R_1 + w_2 R_2 + \cdots + w_n R_n = \sum_{i=1}^{n} w_i R_i`}
            meaning="The portfolio's realized return is the weighted average of the individual assets' realized returns over the same period."
            variables={[
              { symbol: String.raw`w_i`, description: "Weight of asset i." },
              { symbol: String.raw`R_i`, description: "Realized return of asset i." },
              { symbol: String.raw`R_P`, description: "Realized portfolio return." },
            ]}
          />
        </Reveal>

        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            Stock A is 60% of the portfolio and returned 10%; Stock B is 40% and
            returned −5%. Distinguish carefully: Stock A{" "}
            <em className="text-slate-100">returned</em> 10%, but its{" "}
            <em className="text-slate-100">contribution</em> to the portfolio is only
            6 percentage points, because it is only 60% of the money.
          </p>
        </Reveal>

        <Reveal>
          <ContributionDiagram />
        </Reveal>

        <Reveal>
          <div className="max-w-3xl">
            <BlockMath>{String.raw`R_P = 0.60 \times 10\% + 0.40 \times (-5\%) = 6\% - 2\% = 4\%`}</BlockMath>
          </div>
        </Reveal>

        <Reveal>
          <FormulaExplainer
            label="Expected portfolio return"
            formula={String.raw`E[R_P] = w_1 E[R_1] + w_2 E[R_2] + \cdots + w_n E[R_n]`}
            meaning="Expected return uses the same weighting, but with expected returns. With E[R_A] = 8% and E[R_B] = 5%:"
            variables={[
              { symbol: String.raw`E[R_i]`, description: "Expected return of asset i." },
              { symbol: String.raw`E[R_P]`, description: "Expected portfolio return." },
            ]}
            substitution={String.raw`E[R_P] = 0.60 \times 8\% + 0.40 \times 5\% = 4.8\% + 2.0\%`}
            result="E[R_P] = 6.8%"
            tone="green"
          />
        </Reveal>

        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            Expected return is linear in the weights — easy to compute. Risk,
            however, is not. That asymmetry is the gateway to the rest of
            portfolio theory.
          </p>
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 3 — WORKSHEET ===================== */}
      <ConceptSection
        index="6.1.3"
        eyebrow="Scene 3 · Graded worksheet"
        title="Portfolio weights and returns worksheet"
        intro="You hold a $50,000 stock fund, a $30,000 bond fund, and $20,000 in T-bills — $100,000 total. The stock fund realized 12% (expected 8%); the bond fund realized −4% (expected 5%); T-bills realized 1% (expected 2%). Work through weights, contributions, and totals."
      >
        <Reveal>
          <InteractiveFrame>
            <CalculationWorksheet
              submitLabel="Check worksheet"
              groups={[
                {
                  heading: "Part 1 — Weights",
                  hint: "Weight = market value ÷ total.",
                  fields: [
                    {
                      id: "ws",
                      label: "Stock fund weight",
                      answer: 50,
                      tolerance: 0.05,
                      unit: "%",
                      decimals: 2,
                      hints: ["50,000 / 100,000.", "0.50 = 50%."],
                      solution: "50,000 / 100,000 = 50%.",
                    },
                    {
                      id: "wb",
                      label: "Bond fund weight",
                      answer: 30,
                      tolerance: 0.05,
                      unit: "%",
                      decimals: 2,
                      hints: ["30,000 / 100,000.", "0.30 = 30%."],
                      solution: "30,000 / 100,000 = 30%.",
                    },
                    {
                      id: "wt",
                      label: "T-bill weight",
                      answer: 20,
                      tolerance: 0.05,
                      unit: "%",
                      decimals: 2,
                      hints: ["20,000 / 100,000.", "0.20 = 20%."],
                      solution: "20,000 / 100,000 = 20%.",
                    },
                  ],
                },
                {
                  heading: "Part 2 — Realized contributions (weight × realized return)",
                  hint: "Contribution = weight × realized return, in percentage points.",
                  fields: [
                    {
                      id: "rcs",
                      label: "Stock realized contribution",
                      answer: 6,
                      tolerance: 0.05,
                      unit: "pp",
                      decimals: 2,
                      hints: ["0.50 × 12%.", "= 6.00 pp."],
                      solution: "0.50 × 12% = 6.00 pp.",
                    },
                    {
                      id: "rcb",
                      label: "Bond realized contribution",
                      answer: -1.2,
                      tolerance: 0.05,
                      unit: "pp",
                      decimals: 2,
                      hints: ["0.30 × (−4%).", "= −1.20 pp."],
                      solution: "0.30 × (−4%) = −1.20 pp.",
                    },
                    {
                      id: "rct",
                      label: "T-bill realized contribution",
                      answer: 0.2,
                      tolerance: 0.05,
                      unit: "pp",
                      decimals: 2,
                      hints: ["0.20 × 1%.", "= 0.20 pp."],
                      solution: "0.20 × 1% = 0.20 pp.",
                    },
                    {
                      id: "rp",
                      label: "Realized portfolio return (sum of contributions)",
                      answer: 5,
                      tolerance: 0.05,
                      unit: "%",
                      decimals: 2,
                      hints: ["6.00 + (−1.20) + 0.20.", "= 5.00%."],
                      solution: "6.00 + (−1.20) + 0.20 = 5.00%.",
                    },
                  ],
                },
                {
                  heading: "Part 3 — Expected contributions (weight × expected return)",
                  hint: "Same structure, using expected returns.",
                  fields: [
                    {
                      id: "ecs",
                      label: "Stock expected contribution",
                      answer: 4,
                      tolerance: 0.05,
                      unit: "pp",
                      decimals: 2,
                      hints: ["0.50 × 8%.", "= 4.00 pp."],
                      solution: "0.50 × 8% = 4.00 pp.",
                    },
                    {
                      id: "ecb",
                      label: "Bond expected contribution",
                      answer: 1.5,
                      tolerance: 0.05,
                      unit: "pp",
                      decimals: 2,
                      hints: ["0.30 × 5%.", "= 1.50 pp."],
                      solution: "0.30 × 5% = 1.50 pp.",
                    },
                    {
                      id: "ect",
                      label: "T-bill expected contribution",
                      answer: 0.4,
                      tolerance: 0.05,
                      unit: "pp",
                      decimals: 2,
                      hints: ["0.20 × 2%.", "= 0.40 pp."],
                      solution: "0.20 × 2% = 0.40 pp.",
                    },
                    {
                      id: "erp",
                      label: "Expected portfolio return (sum of contributions)",
                      answer: 5.9,
                      tolerance: 0.05,
                      unit: "%",
                      decimals: 2,
                      hints: ["4.00 + 1.50 + 0.40.", "= 5.90%."],
                      solution: "4.00 + 1.50 + 0.40 = 5.90%.",
                    },
                  ],
                },
              ]}
              interpretation={
                <span>
                  Both realized and expected portfolio returns are clean weighted
                  averages. The realized <span className="font-sans text-slate-100">5.00%</span>{" "}
                  came in below the expected{" "}
                  <span className="font-sans text-slate-100">5.90%</span> because the bond
                  fund lost more than expected. Risk is the gap between expectation
                  and outcome — and it does <em className="text-slate-100">not</em> combine
                  like these returns.
                </span>
              }
              interpretationTone="info"
            />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 4 — TRANSITION ===================== */}
      <ConceptSection
        index="6.1.4"
        eyebrow="Scene 4 · Transition to risk"
        title="Why risk is different"
        intro="Return is linear. Risk is not. Two assets with identical volatilities can produce very different portfolio risk depending on how they move together."
      >
        <Reveal>
          <TransitionCheck />
        </Reveal>

        <Reveal>
          <Panel>
            <p className="text-[17px] leading-[1.7] text-slate-200">
              The missing piece is <strong className="text-white">co-movement</strong> —
              how the assets move relative to each other. The next lesson introduces
              covariance and correlation, and shows exactly why portfolio volatility
              refuses to behave like a weighted average.
            </p>
          </Panel>
        </Reveal>

        <Reveal>
          <ExpandableQA question="How can you invest 150% of your money?">
            <p className="text-[16px] leading-[1.7] text-slate-200">
              You borrow. With $100 of your own money and $50 borrowed, you invest
              $150 — 150% of equity. The borrowed $50 is a liability recorded as a
              −50% weight. Leverage raises expected return but magnifies risk;
              losses can wipe out equity quickly.
            </p>
          </ExpandableQA>
        </Reveal>
      </ConceptSection>

      {/* ===================== MASTERY + SUMMARY + SOURCES ===================== */}
      <Reveal className="mt-16">
        <MasteryCheck
          passCount={3}
          onComplete={() => report()}
          continueLabel="Continue to Portfolio Risk, Covariance, and Correlation"
          continueHref="/lessons/portfolio-risk-covariance-correlation"
          questions={QUESTIONS}
        />
      </Reveal>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Portfolio Risk, Covariance, and Correlation"
          continueHref="/lessons/portfolio-risk-covariance-correlation"
        />
      </Reveal>

      <Reveal className="mt-8">
        <PTSourcePanel />
      </Reveal>
    </PTLayout>
  );
}
