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
} from "./shared";
import MarketClearingLab from "./MarketClearingLab";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CAPMLayout from "./CAPMLayout";
import CAPMSourcePanel from "./CAPMSourcePanel";
import { useReportCAPMComplete } from "@/lib/capm-progress";

const LEARNING_OBJECTIVES = [
  "Define the tangency portfolio as the maximum-Sharpe risky portfolio.",
  "Define the market portfolio as the value-weighted portfolio of all risky assets.",
  "Explain why the two begin as separate concepts.",
  "Calculate simple market-value weights.",
  "Explain how a mismatch between desired holdings and asset supply forces prices to adjust.",
  "Explain why equilibrium implies that the tangency portfolio equals the market portfolio.",
  "Explain why an individual investor should care about this result.",
  "Distinguish the theoretical market portfolio from an observable index proxy.",
];

const SUMMARY_POINTS = [
  "The tangency portfolio T is the maximum-Sharpe risky portfolio — defined by what investors prefer.",
  "The market portfolio M is the value-weighted portfolio of all risky assets — defined by what exists.",
  "Under the model, every investor holds the same risky portfolio T and only varies the amount.",
  "If desired weights differ from supply weights, the market cannot clear.",
  "Prices and expected returns adjust until T matches M: this is the CAPM equilibrium bridge.",
  "Once T = M, the market portfolio becomes the model's optimal risky portfolio.",
  "An individual investor chooses how much market exposure to take, not the risky mix.",
  "A broad index is a practical proxy for M, not the complete theoretical market portfolio.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "How is the market portfolio defined?",
    choices: [
      { id: "a", label: "The value-weighted portfolio of all risky assets that exist" },
      { id: "b", label: "The portfolio with the highest Sharpe ratio" },
      { id: "c", label: "The risk-free asset combined with one stock" },
    ],
    correctId: "a",
    hint: "M is defined by supply — each weight is market value ÷ total market value of risky assets.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "Are the tangency portfolio and the market portfolio initially defined the same way?",
    choices: [
      { id: "a", label: "Yes — both come from optimization" },
      { id: "b", label: "No — T comes from optimization, M comes from asset supply" },
      { id: "c", label: "Yes — both are value-weighted" },
    ],
    correctId: "b",
    hint: "T is defined by what investors prefer; M is defined by what risky assets collectively exist.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "In a two-asset market, investors collectively want T = 60/40 but supply is M = 75/25. What happens to the over-demanded asset's price and expected return?",
    choices: [
      { id: "a", label: "Price rises, expected return falls" },
      { id: "b", label: "Price falls, expected return rises" },
      { id: "c", label: "Both stay the same" },
    ],
    correctId: "a",
    hint: "Over-demand pushes the price up; for a given expected payoff, a higher price means a lower expected return.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "Why does T become equal to M in CAPM equilibrium?",
    choices: [
      { id: "a", label: "Because it is an arbitrary assumption" },
      {
        id: "b",
        label: "Because all investors demand the same risky portfolio, all shares must be held, and prices adjust until demand matches supply",
      },
      { id: "c", label: "Because the risk-free rate is zero" },
    ],
    correctId: "b",
    hint: "Markets clear: prices and expected returns move until aggregate demand equals aggregate supply.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "Is a broad stock index the same thing as the complete theoretical market portfolio?",
    choices: [
      { id: "a", label: "No — it is a practical proxy, not the complete portfolio CAPM describes" },
      { id: "b", label: "Yes — the S&P 500 is the market portfolio" },
      { id: "c", label: "Yes, if it is value-weighted" },
    ],
    correctId: "a",
    hint: "The theoretical M includes all risky assets; an index is a useful but incomplete proxy.",
  },
];

function CentralQuestion() {
  return (
    <Reveal className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-accent-cyan/25 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="font-sans text-[12px] uppercase tracking-[0.18em] text-accent-cyan">
          Central question
        </div>
        <p className="ops-body mt-4 max-w-3xl text-[20px] leading-[1.5] text-white sm:text-[22px]">
          The tangency portfolio is the risky portfolio investors{" "}
          <em className="text-accent-cyan">want</em> to hold. The market portfolio is the risky
          portfolio that actually <em className="text-accent-amber">exists</em>. Why should they
          be the same?
        </p>
      </div>
    </Reveal>
  );
}

function MarketValueTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[440px] border-collapse text-[16px]">
        <thead>
          <tr className="border-b border-white/20 text-left">
            <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Company</th>
            <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Total market value</th>
            <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Market weight</th>
          </tr>
        </thead>
        <tbody className="text-slate-100">
          <tr className="border-b border-white/5">
            <td className="py-3 pr-8">Atlas</td>
            <td className="py-3 pr-8 font-sans tabular-nums">$75 billion</td>
            <td className="py-3 font-sans tabular-nums text-accent-cyan">75%</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-3 pr-8">Beacon</td>
            <td className="py-3 pr-8 font-sans tabular-nums">$25 billion</td>
            <td className="py-3 font-sans tabular-nums text-accent-cyan">25%</td>
          </tr>
          <tr>
            <td className="py-3 pr-8 font-semibold text-slate-50">Total</td>
            <td className="py-3 pr-8 font-sans font-semibold tabular-nums text-slate-50">$100 billion</td>
            <td className="py-3 font-sans font-semibold tabular-nums text-accent-green">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SamePortfolioDifferentAmounts() {
  const investors = [
    { label: "Conservative", tangency: 30, rf: 70 },
    { label: "Moderate", tangency: 100, rf: 0 },
    { label: "Aggressive", tangency: 150, rf: -50 },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {investors.map((inv) => (
        <div key={inv.label} className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
          <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400">{inv.label}</div>
          <div className="mt-3 space-y-2 font-sans text-[15px] text-slate-100">
            <div>
              Tangency T:{" "}
              <span className="text-accent-cyan">{inv.tangency}%</span>
            </div>
            <div>
              Risk-free:{" "}
              <span className={inv.rf < 0 ? "text-accent-red" : "text-accent-green"}>
                {inv.rf > 0 ? "+" : ""}{inv.rf}%
              </span>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-ink-950/40 px-3 py-2.5 text-[14px] text-slate-300">
            Risky part is always{" "}
            <span className="font-sans text-accent-cyan">60% Atlas</span> +{" "}
            <span className="font-sans text-accent-purple">40% Beacon</span>
          </div>
        </div>
      ))}
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
            <span className="block font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
              Expected: {answerLabel}
            </span>
            <span className="mt-1 block">{feedback}</span>
          </Feedback>
        </div>
      )}
    </div>
  );
}

export default function Lesson7_1() {
  const report = useReportCAPMComplete("capm-tangency-becomes-market-portfolio");

  return (
    <CAPMLayout>
      <PVHero
        index="7.1"
        eyebrow="Lesson 7.1 · Module 7 — The CAPM and APT"
        heading="The Tangency Portfolio Becomes the Market Portfolio"
        subheading="Lesson 6.5 found the tangency portfolio. Now connect it to the market portfolio through equilibrium — the CAPM bridge from portfolio theory to asset pricing."
        bullets={[
          "T is what investors prefer; M is what exists",
          "Investors hold different amounts of the same risky portfolio",
          "Prices adjust until demand matches supply",
          "Equilibrium: T = M",
          "A broad index is a proxy, not the complete market",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== SECTION 1 — TWO DIFFERENT PORTFOLIOS ===================== */}
      <ConceptSection
        index="7.1.1"
        eyebrow="Section 1 · Two different portfolios"
        title="Tangency and market are defined differently"
        intro="Before joining the two ideas, place them side by side. They answer different questions and are obtained in different ways."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
                Tangency portfolio T
              </div>
              <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
                Identified through portfolio optimization. It offers the highest expected excess
                return per unit of volatility. It depends on expected returns, variances,
                covariances, and the risk-free rate.
              </p>
              <div className="mt-4">
                <BlockMath>{String.raw`T = \text{maximum-Sharpe risky portfolio}`}</BlockMath>
              </div>
              <p className="mt-2 text-[15px] text-slate-400">
                Defined by what investors <em>prefer</em>.
              </p>
            </div>
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
                Market portfolio M
              </div>
              <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
                The entire market treated as one portfolio. It includes the risky assets that
                collectively exist, each weighted by its total market value.
              </p>
              <div className="mt-4">
                <BlockMath>{String.raw`w_i^M = \frac{\text{market value of asset } i}{\text{total market value of all risky assets}}`}</BlockMath>
              </div>
              <p className="mt-2 text-[15px] text-slate-400">
                Defined by what <em>exists</em>.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            Use a simple two-company market to make this concrete.
          </p>
          <div className="mt-5">
            <MarketValueTable />
          </div>
          <p className="mt-5 max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            The market portfolio is therefore:
          </p>
          <div className="mt-3 max-w-2xl">
            <BlockMath>{String.raw`M = 75\%\,\text{Atlas} + 25\%\,\text{Beacon}`}</BlockMath>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.06] p-6">
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
              Required distinction
            </div>
            <p className="mt-3 text-[18px] leading-[1.55] text-white">
              At this point, there is no reason yet to assume that{" "}
              <InlineMath>{String.raw`T = M`}</InlineMath>.
            </p>
            <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
              <InlineMath>{String.raw`T`}</InlineMath> is defined by what investors prefer;{" "}
              <InlineMath>{String.raw`M`}</InlineMath> is defined by what risky assets collectively
              exist. One comes from optimization, the other from supply. They are separate concepts —
              for now.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 2 — SAME PORTFOLIO, DIFFERENT AMOUNTS ===================== */}
      <ConceptSection
        index="7.1.2"
        eyebrow="Section 2 · Same risky portfolio, different amounts"
        title="Connect directly to Lesson 6.5"
        intro="Under the simplified portfolio-theory model, investors choose combinations of the risk-free asset and the tangency portfolio T. They vary the amount of T — not its internal composition."
      >
        <Reveal>
          <SamePortfolioDifferentAmounts />
          <p className="mt-5 max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            Suppose the tangency portfolio is:
          </p>
          <div className="mt-3 max-w-2xl">
            <BlockMath>{String.raw`T = 60\%\,\text{Atlas} + 40\%\,\text{Beacon}`}</BlockMath>
          </div>
        </Reveal>
        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            The aggressive investor borrows to invest more than 100% in the risky portfolio — but
            every borrowed dollar still goes into the same 60/40 mix. Investors choose different
            quantities of <InlineMath>{String.raw`T`}</InlineMath>; they do not choose different
            internal risky-asset weights.
          </p>
        </Reveal>
        <Reveal>
          <DefinitionCard term="The key agreement">
            Investors may disagree about how much market risk to take, but under the model they
            agree about which risky portfolio to hold.
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 3 — WRONG MIX ===================== */}
      <ConceptSection
        index="7.1.3"
        eyebrow="Section 3 · When demand does not match supply"
        title="What if investors want the wrong mix?"
        intro="Now compare desired holdings with the assets that actually exist. Investors collectively want a 60/40 portfolio, but the market supplies 75/25."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Investors collectively want</div>
              <div className="mt-3">
                <BlockMath>{String.raw`T = 60\%\,\text{Atlas} + 40\%\,\text{Beacon}`}</BlockMath>
              </div>
            </div>
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">But the market supply is</div>
              <div className="mt-3">
                <BlockMath>{String.raw`M = 75\%\,\text{Atlas} + 25\%\,\text{Beacon}`}</BlockMath>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-red/30 bg-accent-red/[0.06] p-6">
            <p className="text-[18px] leading-[1.55] text-white">This cannot be an equilibrium.</p>
            <ul className="mt-4 space-y-2.5">
              {[
                "Investors collectively demand more Beacon than exists.",
                "They demand less Atlas than exists.",
                "Every issued share must ultimately be held by someone.",
                "Aggregate demand does not match aggregate supply.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />
                  <span className="text-[16px] leading-[1.6] text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <Panel>
            <p className="text-[18px] leading-[1.55] text-white">
              How can every share be held if investors collectively want a different portfolio from
              the one the market supplies?
            </p>
            <p className="mt-3 text-[16px] leading-[1.65] text-slate-300">
              Hold that question for a moment — the answer is the mechanism that joins T and M.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 4 — PRICES ADJUST ===================== */}
      <ConceptSection
        index="7.1.4"
        eyebrow="Section 4 · Prices adjust"
        title="Prices and expected returns move until T = M"
        intro="The tangency portfolio depends partly on expected returns. So when prices change, the portfolio investors prefer changes too. The adjustment has a clear direction."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-purple/30 bg-accent-purple/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-purple">
                Beacon is over-demanded
              </div>
              <ul className="mt-4 space-y-3">
                {[
                  "Investors attempt to buy more Beacon.",
                  "Beacon's current price rises.",
                  "For a given expected future payoff, its expected return falls.",
                  "Beacon becomes less attractive in the tangency portfolio.",
                  "Its desired tangency weight decreases.",
                ].map((item, i) => (
                  <li key={item} className="flex items-start gap-3 text-[16px] leading-[1.6] text-slate-200">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-accent-purple/50 font-sans text-[12px] text-accent-purple">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
                Atlas is under-demanded
              </div>
              <ul className="mt-4 space-y-3">
                {[
                  "Investors attempt to sell or avoid Atlas.",
                  "Atlas's current price falls.",
                  "For a given expected future payoff, its expected return rises.",
                  "Atlas becomes more attractive in the tangency portfolio.",
                  "Its desired tangency weight increases.",
                ].map((item, i) => (
                  <li key={item} className="flex items-start gap-3 text-[16px] leading-[1.6] text-slate-200">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-accent-cyan/50 font-sans text-[12px] text-accent-cyan">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            Continue the adjustment: Beacon&apos;s desired tangency weight falls and Atlas&apos;s rises until
            the desired risky portfolio matches the supply weights.
          </p>
          <div className="mt-5 max-w-2xl">
            <BlockMath>{String.raw`T = M`}</BlockMath>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-green">
              Central conclusion
            </div>
            <p className="mt-3 text-[18px] leading-[1.55] text-white">
              The tangency portfolio becomes the market portfolio because asset prices adjust until
              the risky portfolio investors collectively want to hold matches the risky assets that
              actually exist.
            </p>
            <div className="mt-5">
              <BlockMath>{String.raw`\text{aggregate demand} = \text{aggregate supply} \;\Longrightarrow\; T = M`}</BlockMath>
            </div>
            <p className="mt-3 text-[15px] leading-[1.6] text-slate-300">
              This is the CAPM equilibrium bridge. It is not an arbitrary assumption or an
              unexplained identity — it follows from market clearing.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== MARKET CLEARING LAB ===================== */}
      <ConceptSection
        index="7.1.5"
        eyebrow="Interaction · Market clearing lab"
        title="See the equilibrium mechanism"
        intro="Work through the bridge in five stages: identify the portfolios, observe demand, compare it with supply, predict the price effects, and watch T converge to M."
      >
        <Reveal>
          <MarketClearingLab />
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 5 — WHY IT MATTERS ===================== */}
      <ConceptSection
        index="7.1.6"
        eyebrow="Section 5 · Why an individual investor should care"
        title="The market portfolio becomes the baseline"
        intro="Once CAPM identifies T = M, the market portfolio becomes the model's optimal risky portfolio. The individual investor's problem collapses to two clean decisions."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Decision 1 · Which risky portfolio?</div>
              <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
                Under the simplified CAPM result: the market portfolio.
              </p>
            </div>
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">Decision 2 · How much risky exposure?</div>
              <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
                The split between the market portfolio and the risk-free asset.
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Lending", expr: String.raw`40\%\,M + 60\%\,\text{risk-free}` },
              { label: "Full investment", expr: String.raw`100\%\,M` },
              { label: "Leverage", expr: String.raw`130\%\,M - 30\%\,\text{risk-free}` },
            ].map((ex) => (
              <div key={ex.label} className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
                <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400">{ex.label}</div>
                <div className="mt-2 text-[15px] text-slate-100">
                  <BlockMath>{ex.expr}</BlockMath>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="The individual-investor interpretation">
            The individual investor changes the amount of market exposure, not the internal
            composition of the risky portfolio.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            The market portfolio plays three practical roles in the model:
          </p>
          <div className="mt-5 space-y-4">
            {[
              {
                role: "Baseline risky portfolio",
                body: "It provides broad diversified exposure rather than relying on a few selected securities.",
              },
              {
                role: "Risk benchmark",
                body: "It represents the common market risk that remains after company-specific risk is diversified away.",
              },
              {
                role: "Performance benchmark",
                body: "It provides a reference against which the risk and return of another investment can later be evaluated.",
              },
            ].map((r, i) => (
              <div key={r.role} className="flex items-start gap-4 rounded-xl border border-white/12 bg-white/[0.03] p-5">
                <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-accent-cyan/50 bg-accent-cyan/10 font-sans text-[14px] text-accent-cyan">
                  {i + 1}
                </span>
                <div>
                  <div className="text-[17px] text-white">{r.role}</div>
                  <p className="mt-1 text-[16px] leading-[1.6] text-slate-300">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-[15px] leading-[1.6] text-slate-400">
            We do not yet teach alpha or the Security Market Line — only preview these roles.
          </p>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 6 — INDEXES ARE PROXIES ===================== */}
      <ConceptSection
        index="7.1.7"
        eyebrow="Section 6 · Theory vs observable indexes"
        title="A broad index is a proxy, not the complete market"
        intro="The theoretical market portfolio is the entire set of risky assets treated as one value-weighted portfolio. It is broader than one domestic stock index."
      >
        <Reveal>
          <ul className="space-y-3">
            {[
              "The theoretical market portfolio is the entire set of risky assets, value-weighted.",
              "It is broader than one domestic stock index.",
              "A complete theoretical market portfolio may include global equities and other risky assets.",
              "It is difficult or impossible to observe perfectly.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                <span className="text-[17px] leading-[1.6] text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.06] p-6">
            <p className="text-[18px] leading-[1.55] text-white">
              A broad stock index is a practical proxy for the theoretical market portfolio. It is
              not the complete market portfolio described by CAPM.
            </p>
            <p className="mt-3 text-[16px] leading-[1.65] text-slate-300">
              We never treat the S&P 500, Russell indexes, or another single index as the literal
              complete market portfolio. They are useful approximations — incomplete coverage of a
              broader theoretical object.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 7 — MODEL CONTRACT ===================== */}
      <ConceptSection
        index="7.1.8"
        eyebrow="Section 7 · Model contract"
        title="The assumptions behind the result"
        intro="The conclusion T = M is obtained under a specific set of assumptions. Stating them shows how the result is reached."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "Investors use expected return and variance.",
              "Investors agree on expected returns, variances, and covariances.",
              "Investors have access to the same assets.",
              "Borrowing and lending occur at the same risk-free rate.",
              "Taxes, transaction costs, and other frictions are ignored.",
              "Investors share the same investment horizon.",
              "Markets clear.",
            ].map((a, i) => (
              <div key={a} className="flex items-start gap-3 rounded-xl border border-white/12 bg-white/[0.03] p-4">
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-amber/40 bg-accent-amber/10 px-1.5 font-sans text-[13px] text-accent-amber">
                  {i + 1}
                </span>
                <span className="text-[16px] leading-[1.55] text-slate-200">{a}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <Feedback status="info">
            These assumptions explain how the CAPM conclusion is obtained. They do not describe
            every real investor or market perfectly. Detailed empirical limitations belong in
            later lessons.
          </Feedback>
        </Reveal>
      </ConceptSection>

      {/* ===================== FINAL CHECK ===================== */}
      <ConceptSection
        index="7.1.9"
        eyebrow="Final check · The equilibrium bridge"
        title="Confirm the core conclusions"
        intro="Four questions on the relationship between the tangency portfolio and the market portfolio."
      >
        <Reveal>
          <InteractiveFrame>
            <div className="space-y-4">
              <FinalCheckRow
                prompt="1. Is the market portfolio simply the market treated as one portfolio?"
                options={[
                  { id: "yes", label: "Yes — the value-weighted portfolio of risky assets that exist" },
                  { id: "no", label: "No — it is the highest-Sharpe portfolio" },
                ]}
                correctId="yes"
                answerLabel="Yes"
                feedback="Yes. The market portfolio is the value-weighted portfolio of the risky assets that collectively exist."
              />
              <FinalCheckRow
                prompt="2. Are the tangency portfolio and market portfolio initially defined in the same way?"
                options={[
                  { id: "no", label: "No — T from optimization, M from asset supply" },
                  { id: "yes", label: "Yes — both from optimization" },
                ]}
                correctId="no"
                answerLabel="No"
                feedback="No. The tangency portfolio is defined by optimization; the market portfolio is defined by asset supply."
              />
              <FinalCheckRow
                prompt="3. Why must they become equal in CAPM equilibrium?"
                options={[
                  {
                    id: "a",
                    label: "All investors demand the same risky portfolio, all outstanding assets must be held, and prices adjust until aggregate demand matches aggregate supply",
                  },
                  { id: "b", label: "It is an arbitrary definition" },
                  { id: "c", label: "The risk-free rate forces it" },
                ]}
                correctId="a"
                answerLabel="Market clearing"
                feedback="Because all investors demand the same risky portfolio, all outstanding assets must be held, and prices adjust until aggregate demand matches aggregate supply. That is market clearing."
              />
              <FinalCheckRow
                prompt="4. Why should an individual investor care?"
                options={[
                  {
                    id: "a",
                    label: "The result identifies broad market exposure as the model's baseline risky holding and lets the investor adjust total risk through the allocation between M and the risk-free asset",
                  },
                  { id: "b", label: "It guarantees the investor will beat the market" },
                  { id: "c", label: "It removes all risk from investing" },
                ]}
                correctId="a"
                answerLabel="Baseline + risk dial"
                feedback="The result identifies broad market exposure as the model's baseline risky holding and allows the investor to adjust total risk through the allocation between the market portfolio and the risk-free asset."
              />
            </div>
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== TRANSITION ===================== */}
      <ConceptSection
        index="7.1.10"
        eyebrow="Transition · Toward beta"
        title="How much does one stock add to market risk?"
        intro="Once the market portfolio becomes the investor's risky benchmark, the relevant question for an individual stock changes."
        topMargin="mt-12"
      >
        <Reveal>
          <Panel>
            <p className="text-[18px] leading-[1.55] text-white">
              Once the market portfolio becomes the investor&apos;s risky benchmark, the relevant
              question for an individual stock is no longer only how much the stock fluctuates by
              itself.
            </p>
            <p className="mt-4 text-[20px] leading-[1.45] text-accent-cyan">
              How much does the stock add to the market risk the investor already holds?
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-16">
        <MasteryCheck
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to The Security Market Line"
          continueHref="/lessons/security-market-line"
          questions={QUESTIONS}
        />
      </Reveal>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to The Security Market Line"
          continueHref="/lessons/security-market-line"
        />
      </Reveal>

      <Reveal className="mt-8">
        <CAPMSourcePanel />
      </Reveal>
    </CAPMLayout>
  );
}
