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
import OnePeriodValuationExplorer from "./OnePeriodValuationExplorer";

const LEARNING_OBJECTIVES = [
  "Value a stock over one period using P₀ = E[D₁ + P₁] / (1 + r).",
  "Substitute for the future price recursively and derive the Dividend Discount Model.",
  "Explain why a future sale price is not an independent source of value.",
  "Explain why a stock paying no current dividend can still have positive value today.",
  "Explain why future payoffs are discounted: time value and risk.",
  "Describe the intuitive components of the discount rate r.",
  "Distinguish a personal required return from the market-required return.",
  "Explain why equity valuation is hard: both the numerator and the denominator are uncertain.",
];

const SUMMARY_POINTS = [
  "A stock's value equals the PV of expected economic benefits to shareholders.",
  "The one-period model is P₀ = E[D₁+P₁]/(1+r).",
  "The DDM generalizes: P₀ = Σ E[Dₜ]/(1+r)ᵗ.",
  "Resale price is not independent — it reflects future expected benefits.",
  "The discount rate is the market-required return for timing and risk.",
  "Equity valuation is hard because both cash flows and discount rates are uncertain.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "E[D₁] = $2, E[P₁] = $108, r = 10%. What is P₀?",
    choices: [
      { id: "hundred", label: "$100" },
      { id: "ten", label: "$110" },
      { id: "ninety", label: "$90" },
    ],
    correctId: "hundred",
    hint: "P₀ = (2 + 108) / 1.10 = 110 / 1.10.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "A stock pays no dividend for 5 years, then pays $200 in year 5. r = 10%. What is P₀?",
    choices: [
      { id: "pv", label: "$124.18" },
      { id: "twohundred", label: "$200" },
      { id: "hundred", label: "$100" },
    ],
    correctId: "pv",
    hint: "P₀ = 200 / (1.10)^5 = 200 / 1.6105.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "The discount rate r in the DDM represents:",
    choices: [
      { id: "required", label: "The market-required return for the stock's risk" },
      { id: "yield", label: "The dividend yield" },
      { id: "growth", label: "The company's revenue growth" },
    ],
    correctId: "required",
    hint: "r compensates investors for time value and for bearing the stock's risk.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "If r rises from 10% to 15% on a $110 expected payoff, P₀ moves from $100 to:",
    choices: [
      { id: "down", label: "$95.65" },
      { id: "up", label: "$110" },
      { id: "higher", label: "$115" },
    ],
    correctId: "down",
    hint: "PV = 110 / 1.15 = 95.65. A higher discount rate lowers present value.",
  },
];

export default function Lesson4_2() {
  const report = useReportEqComplete("equity-why-does-a-stock-have-value-today");

  return (
    <EqLayout>
      {/* =================================================================== */}
      {/* HERO                                                                */}
      {/* =================================================================== */}
      <PVHero
        index="4.2"
        eyebrow="Lesson 4.2 · Module 4"
        heading="Why does a stock have value today?"
        subheading="A stock's value equals the present value of the economic benefits expected by its owners. The discount rate is the market-required return for bearing the timing and risk of those benefits."
        bullets={[
          "One-period valuation: P₀ = E[D₁+P₁]/(1+r)",
          "The Dividend Discount Model generalizes this",
          "Resale price is not an independent source of value",
          "The discount rate reflects time value and risk",
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
            From Lesson 4.1
          </div>
          <p className="ops-body mt-2 text-[16px] text-slate-200">
            In Lesson 4.1 we established that equity is a{" "}
            <strong className="text-white">residual ownership claim</strong> and
            that growth creates value only when the company earns a return above
            the <strong className="text-white">cost of equity</strong>. Now we
            ask the natural next question: if equity is a claim on future
            residual cash flows, how do we translate that claim into a{" "}
            <strong className="text-white">price today</strong>? The answer is
            present value — the same tool you used for bonds, applied to a far
            less certain stream of payoffs.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 1 — One-year stock investment                               */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.1"
          eyebrow="Section 1"
          title="A one-year stock investment"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Suppose you buy one share today at price{" "}
            <InlineMath>{String.raw`P_0`}</InlineMath>, hold it for one year,
            receive a dividend{" "}
            <InlineMath>{String.raw`D_1`}</InlineMath>, then sell it for a price{" "}
            <InlineMath>{String.raw`P_1`}</InlineMath>. What should you pay
            today?
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            The total payoff you expect at the end of the year is{" "}
            <InlineMath>{String.raw`D_1 + P_1`}</InlineMath>. Because that payoff
            is uncertain, we work with its{" "}
            <strong className="text-white">expectation</strong>, denoted{" "}
            <InlineMath>{String.raw`E[D_1 + P_1]`}</InlineMath>, and discount it
            at the required return{" "}
            <InlineMath>{String.raw`r`}</InlineMath>.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="One-period stock valuation"
          formula={String.raw`P_0 = \frac{E[D_1 + P_1]}{1+r}`}
          meaning="The stock's value today is the present value of the total payoff expected over the next period — the dividend plus the resale price — discounted at the required return."
          variables={[
            { symbol: String.raw`P_0`, description: "stock price today (value)" },
            { symbol: String.raw`D_1`, description: "dividend paid during the next period" },
            { symbol: String.raw`P_1`, description: "expected resale price at the end of the next period" },
            { symbol: String.raw`r`, description: "required return (discount rate) for this stock" },
            { symbol: String.raw`E[\,\cdot\,]`, description: "expectation operator — accounts for uncertainty" },
          ]}
          interpretation="This is the same present-value logic you used for bonds: take expected future cash, discount it back one period."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 2 — Numerical example                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.2"
          eyebrow="Section 2"
          title="A numerical example"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Worked example"
          tone="green"
          formula={String.raw`P_0 = \frac{E[D_1 + P_1]}{1+r}`}
          meaning="Plug in the expected dividend, expected resale price, and required return."
          substitution={String.raw`P_0 = \frac{\$2 + \$108}{1.10} = \frac{\$110}{1.10}`}
          result="P₀ = $100"
          interpretation="At $100, the expected return exactly equals the 10% required return. You can verify: ($2 + $108 − $100) / $100 = 10%."
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The price you actually pay determines whether your expected return is
            above, below, or equal to the required{" "}
            <strong className="text-white">10%</strong>.
          </p>
          <ul className="mt-4 space-y-2.5">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">Pay $90:</strong> expected return
                = ($2 + $108 − $90) / $90 ={" "}
                <strong className="text-accent-green">22.2%</strong> — above
                required, so the stock is attractive at that price.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">Pay $100:</strong> expected return
                = ($2 + $108 − $100) / $100 ={" "}
                <strong className="text-accent-cyan">10%</strong> — exactly the
                required return; this is fair value.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">Pay $105:</strong> expected return
                = ($2 + $108 − $105) / $105 ={" "}
                <strong className="text-accent-red">4.8%</strong> — below
                required, so at $105 the stock is overvalued relative to these
                assumptions.
              </span>
            </li>
          </ul>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 3 — Where does P₁ come from?                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.3"
          eyebrow="Section 3"
          title="Where does P₁ come from?"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The future price{" "}
            <InlineMath>{String.raw`P_1`}</InlineMath> is not a free input. At
            time 1, the buyer who purchases the share faces the{" "}
            <strong className="text-white">same valuation problem</strong> you
            faced at time 0. So{" "}
            <InlineMath>{String.raw`P_1`}</InlineMath> must itself equal the PV
            of payoffs expected from time 1 onward.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Price at time 1"
          formula={String.raw`P_1 = \frac{E_1[D_2 + P_2]}{1+r}`}
          meaning="The resale price at time 1 is the PV, as of time 1, of the dividend and resale price expected at time 2."
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Substitute P₁ into P₀"
          formula={String.raw`P_0 = \frac{E[D_1]}{1+r} + \frac{E[D_2 + P_2]}{(1+r)^2}`}
          meaning="Replace the single-period payoff with two periods of dividends plus a now-more-distant resale price."
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Substitute again for P₂"
          formula={String.raw`P_0 = \frac{E[D_1]}{1+r} + \frac{E[D_2]}{(1+r)^2} + \frac{E[D_3 + P_3]}{(1+r)^3}`}
          meaning="Each substitution pushes the terminal resale price one period further into the future."
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Generalize — the Dividend Discount Model"
          tone="green"
          formula={String.raw`P_0 = \sum_{t=1}^{\infty} \frac{E[D_t]}{(1+r)^t}`}
          meaning="Pushing the resale price infinitely far forward, the stock's value equals the present value of all expected future dividends (broadly defined)."
          interpretation="Here Dₜ means any economic benefit shareholders receive — regular dividends, special dividends, buybacks, or liquidation proceeds. This is the Dividend Discount Model (DDM)."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 4 — Future sale price is intermediate                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.4"
          eyebrow="Section 4"
          title="The future sale price is intermediate, not a new source of value"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Selling your share generates a real capital gain in your hands — the
            cash is real. But the buyer pays you only because{" "}
            <strong className="text-white">the buyer expects later
            benefits</strong> from the share. The chain of value always traces
            back to the company&apos;s future performance.
          </p>
          <div className="mt-5 rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5">
            <div className="ops-caption text-[11px] text-accent-cyan">
              Causal chain
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[13px] text-slate-200">
              <span className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5">Future business performance</span>
              <span className="text-accent-cyan" aria-hidden>→</span>
              <span className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5">Future shareholder benefits</span>
              <span className="text-accent-cyan" aria-hidden>→</span>
              <span className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5">P₁ (resale price)</span>
              <span className="text-accent-cyan" aria-hidden>→</span>
              <span className="rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-1.5 text-accent-cyan">P₀ (price today)</span>
            </div>
            <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
              The price today depends on expected future benefits; those future
              benefits depend on the business. The resale price is just the
              conduit through which later benefits reach an earlier owner.
            </p>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 5 — No current dividend example                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.5"
          eyebrow="Section 5"
          title="A stock with no current dividend can still have value"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Suppose a company pays{" "}
            <strong className="text-white">no distributions</strong> in years 1
            through 4, but you expect it to be acquired in year 5 for{" "}
            <strong className="text-white">$200</strong> per share. With{" "}
            <InlineMath>{String.raw`r = 10\%`}</InlineMath>:
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Value with a single distant payoff"
          tone="green"
          formula={String.raw`P_0 = \frac{200}{(1.10)^5}`}
          meaning="Even with zero dividends for four years, the expected acquisition proceeds in year 5 still produce a positive value today."
          substitution={String.raw`P_0 = \frac{\$200}{1.6105}`}
          result="P₀ = $124.18"
          interpretation="Zero current dividends does not mean zero value. It means the benefits are expected to arrive later."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 6 — Why discount future payoffs?                            */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.6"
          eyebrow="Section 6"
          title="Why discount future payoffs?"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Two forces push the value of a future payoff below its face amount.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-amber">
                Time value
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                A dollar today can be invested and grow. <InlineMath>{String.raw`PV = 100 / 1.05 = \$95.24`}</InlineMath>{" "}
                — a certain $100 next year is worth less than $100 today even
                with no risk.
              </p>
            </div>
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-red">
                Risk
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                An uncertain payoff is worth less than a certain one. The more
                uncertain, the bigger the discount.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Compare an expected $110 payoff discounted at two different rates:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-green">
                Lower risk — r = 5%
              </div>
              <div className="mt-1 font-mono text-[18px] text-slate-100">
                <InlineMath>{String.raw`PV = \frac{110}{1.05} = \$104.76`}</InlineMath>
              </div>
            </div>
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-red">
                Higher risk — r = 15%
              </div>
              <div className="mt-1 font-mono text-[18px] text-slate-100">
                <InlineMath>{String.raw`PV = \frac{110}{1.15} = \$95.65`}</InlineMath>
              </div>
            </div>
          </div>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            The payoff is identical ($110); only the discount rate differs. A
            riskier stock commands a higher{" "}
            <InlineMath>{String.raw`r`}</InlineMath>, and therefore a lower
            present value for the same expected cash.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 7 — What determines r?                                      */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.7"
          eyebrow="Section 7"
          title="What determines r?"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            It is crucial to distinguish two ideas that sound similar:
          </p>
          <ul className="mt-4 space-y-2.5">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">Personal required return:</strong>{" "}
                the return you, individually, would demand to hold the stock.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">Market-required return:</strong>{" "}
                the return the broad market demands for bearing the timing and
                risk of this stock&apos;s payoffs. This is the{" "}
                <InlineMath>{String.raw`r`}</InlineMath> used to price the stock.
              </span>
            </li>
          </ul>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Intuitive decomposition of r (not CAPM yet)"
          tone="amber"
          formula={String.raw`r = \text{risk-free rate} + \text{risk premium}`}
          meaning="The required return compensates investors for the pure time value of money (the risk-free rate) plus an additional premium for bearing the stock's specific risk."
          interpretation="The risk premium is larger for stocks whose payoffs are more cyclical, more uncertain, more leveraged, or more sensitive to recession. We are not introducing CAPM here — this is just the intuition that riskier cash flows require a larger discount."
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <div className="ops-caption text-[11px] text-slate-400">
            Factors that raise the risk premium
          </div>
          <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {[
              "Cyclicality — revenue swings with the economy",
              "Operating uncertainty — unpredictable costs or demand",
              "Leverage — high debt amplifies equity risk",
              "Recession sensitivity — payoffs shrink in downturns",
              "Interest rates — higher risk-free rates raise r directly",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                <span className="ops-body text-[15px] leading-7 text-slate-200">{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-accent-purple/30 bg-accent-purple/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-purple">
              Important
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              Management cannot simply <em>declare</em> a lower cost of equity.
              The required return is set by investors weighing the risk of the
              cash flows, not by the company&apos;s preference.
            </p>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 8 — Personal vs market return example                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.8"
          eyebrow="Section 8"
          title="Personal vs. market-required return"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Suppose the expected payoff is{" "}
            <strong className="text-white">$110</strong>. The market requires{" "}
            <strong className="text-white">10%</strong>, so the market price is{" "}
            <strong className="text-white">$100</strong>. But{" "}
            <em>you</em> personally require <strong className="text-white">15%</strong>.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Market r = 10% → P₀
              </div>
              <div className="mt-1 font-mono text-[20px] text-slate-100">$100</div>
              <div className="ops-caption mt-1 font-mono text-[11px] text-slate-500">110 / 1.10</div>
            </div>
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
              <div className="ops-caption text-[11px] text-accent-amber">
                Your personal r = 15% → your valuation
              </div>
              <div className="mt-1 font-mono text-[20px] text-slate-100">$95.65</div>
              <div className="ops-caption mt-1 font-mono text-[11px] text-slate-500">110 / 1.15</div>
            </div>
          </div>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            The market&apos;s fair value is around{" "}
            <strong className="text-white">$100</strong>. You personally
            wouldn&apos;t buy at $100 because your hurdle is higher. But your
            personal rejection does{" "}
            <strong className="text-white">not</strong> force the market price
            down to $95.65 — the market price reflects the marginal investor,
            not you.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 9 — Numerator vs denominator                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.9"
          eyebrow="Section 9"
          title="Numerator vs. denominator"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Equity valuation is hard because the DDM asks two difficult
            questions, and both must be answered:
          </p>
          <ul className="mt-4 space-y-2.5">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">Numerator — </strong>
                <InlineMath>{String.raw`E[D_t]`}</InlineMath>: What economic
                benefits will shareholders actually receive, and when?
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">Denominator — </strong>
                <InlineMath>{String.raw`r`}</InlineMath>: What return does the
                market require for bearing the timing and risk of those
                benefits?
              </span>
            </li>
          </ul>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            For bonds, the numerator (contractual coupons and principal) is
            largely known. For equities,{" "}
            <strong className="text-white">both</strong> the numerator and the
            denominator are uncertain. That is the fundamental source of
            difficulty in equity valuation.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <OnePeriodValuationExplorer />
      </Reveal>

      {/* =================================================================== */}
      {/* INLINE CONCEPT CHECK                                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.10"
          eyebrow="Concept check"
          title="No-dividend stock and a rising r"
        />
      </Reveal>
      <Reveal className="mt-6">
        <ConceptCheck />
      </Reveal>

      {/* =================================================================== */}
      {/* EXPANDABLE Q&A                                                      */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.11"
          eyebrow="Common questions"
          title="Questions on discounting and resale price"
        />
      </Reveal>
      <Reveal className="mt-6">
        <div className="space-y-3">
          <ExpandableQA question="Is r just the return I personally want?">
            <p>
              No. Your personal hurdle rate is what <em>you</em> require. The{" "}
              <InlineMath>{String.raw`r`}</InlineMath> in the DDM is the{" "}
              <strong className="text-white">market-required return</strong> —
              the return the broad market demands for bearing the timing and
              risk of this stock. Take an expected payoff of $110. If the market
              requires 10%, the price is $100. If you personally require 15%, the
              stock looks unattractive to you at $100 — but your personal
              preference does not move the market price. The market price is set
              by the marginal investor, not by you.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Isn't E[P₁] simply P₀(1+r)?">
            <p>
              There is an implied relationship, but it is not an independent
              forecast. Rearranging the one-period formula gives{" "}
              <InlineMath>{String.raw`E[P_1] = P_0(1+r) - E[D_1]`}</InlineMath>.
              This says: if you already know{" "}
              <InlineMath>{String.raw`P_0`}</InlineMath>, you can back out the
              expected price that is consistent with the required return. But you
              cannot use this to <em>value</em> <InlineMath>{String.raw`P_0`}</InlineMath>{" "}
              from itself — that would be circular. The genuine driver of{" "}
              <InlineMath>{String.raw`P_1`}</InlineMath> is the business&apos;s
              expected future performance, not a formula applied to today&apos;s
              price.
            </p>
          </ExpandableQA>
          <ExpandableQA question="Does a higher required return cause the future payoff to increase?">
            <p>
              No. The expected future payoff is independent of{" "}
              <InlineMath>{String.raw`r`}</InlineMath>. When{" "}
              <InlineMath>{String.raw`r`}</InlineMath> rises, the{" "}
              <em>present value</em> of that fixed expected payoff falls — the
              price adjusts downward, not the cash flow. A $110 expected payoff
              at 10% is worth $100 today; the same $110 at 15% is worth only
              $95.65 today.
            </p>
          </ExpandableQA>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* MASTERY CHECK                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="03"
          eyebrow="Mastery"
          title="Summary and mastery check"
        />
      </Reveal>
      <Reveal className="mt-6">
        <MasteryCheck
          title="Lesson 4.2 mastery check"
          passCount={3}
          onComplete={() => report()}
          continueLabel="Continue to the Gordon Growth Model"
          continueHref="/lessons/equity-gordon-growth-model"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to the Gordon Growth Model"
          continueHref="/lessons/equity-gordon-growth-model"
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

function ConceptCheck() {
  const [checked, setChecked] = useState(false);

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
        A stock is expected to pay no dividend and to sell for $55 next year.
        First with r = 10%, then with r = 15%.
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Work out P₀ in each case, then reveal the answer.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
          <div className="ops-caption text-[11px] text-accent-cyan">
            r = 10%
          </div>
          <div className="mt-1 font-mono text-[18px] text-slate-100">
            P₀ = 55 / 1.10 = $50.00
          </div>
        </div>
        <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
          <div className="ops-caption text-[11px] text-accent-amber">
            r = 15%
          </div>
          <div className="mt-1 font-mono text-[18px] text-slate-100">
            P₀ = 55 / 1.15 = $47.83
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-4 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          Reveal answer
        </button>
      </div>

      {checked && (
        <Feedback status="correct">
          Correct. The expected future payoff ($55) is fixed; only the discount
          rate changes. Raising r from 10% to 15% lowers P₀ from{" "}
          <span className="font-mono">$50.00</span> to{" "}
          <span className="font-mono">$47.83</span>. The cash flow did not
          change — the price did.
        </Feedback>
      )}
    </InteractiveFrame>
  );
}
