"use client";

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
  ExpandableQA,
} from "./shared";
import OpportunityCostOpening from "./OpportunityCostOpening";
import ThreePerspectivesRate from "./ThreePerspectivesRate";
import RequiredReturnToPV from "./RequiredReturnToPV";
import SameCashFlowDifferentRisk from "./SameCashFlowDifferentRisk";
import DiscountRateNPVDecision from "./DiscountRateNPVDecision";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CBLayout from "./CBLayout";
import CBSourcePanel from "./CBSourcePanel";
import { useReportCBComplete } from "@/lib/cb-progress";

const LEARNING_OBJECTIVES = [
  "Explain why a return cannot be judged as attractive or unattractive in isolation.",
  "Compare a project's expected return with the return available from investments of similar systematic risk.",
  "Identify required return, discount rate, and opportunity cost of capital as three perspectives on the same rate.",
  "Show why a higher discount rate lowers present value through the pricing mechanism.",
  "Use CAPM to connect systematic risk to the discount rate used in valuation.",
  "Distinguish a positive expected dollar payoff from a positive NPV.",
];

const SUMMARY_POINTS = [
  "A future cash flow must be compared with investments carrying similar systematic risk.",
  "The return required from comparable-risk investments is the opportunity cost of capital.",
  "That required return becomes the discount rate used to calculate present value.",
  "An investment creates value only when its present value exceeds the capital committed.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt:
      "Two investments have the same expected future cash flow, but one has greater systematic risk. Which should have the lower present value, and why?",
    choices: [
      {
        id: "a",
        label:
          "The higher-risk one — a higher required return discounts the identical cash flow to a lower present value",
      },
      {
        id: "b",
        label: "The lower-risk one — less risk is always worth less",
      },
      {
        id: "c",
        label: "They must have the same present value because the cash flow is the same",
      },
    ],
    correctId: "a",
    hint: "Greater systematic risk → higher required return → higher discount rate → lower PV.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "A project costs $100 and is expected to produce $108 next year. Comparable-risk securities offer 12%. Is the project attractive?",
    choices: [
      {
        id: "a",
        label:
          "No — PV ≈ $96.43, so NPV ≈ −$3.57; its 8% expected return is below the 12% required",
      },
      { id: "b", label: "Yes — it returns $8 more than it costs" },
      {
        id: "c",
        label: "Cannot be determined without the realized return",
      },
    ],
    correctId: "a",
    hint: "PV = 108/1.12 ≈ $96.43; NPV = 96.43 − 100. The 8% it offers is below the 12% the risk requires.",
  },
  {
    id: "q3",
    type: "explain",
    prompt:
      "Explain why required return, discount rate, and opportunity cost of capital can describe the same rate.",
    keywords: ["opportunity", "comparable", "same"],
    hint: "All three refer to the single market-determined return required for comparable systematic risk — what investors require, what you discount at, and what using the capital costs.",
  },
];

function CentralQuestion() {
  return (
    <Reveal className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-accent-amber/25 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-amber/10 blur-3xl" />
        <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-accent-amber">
          Central question
        </div>
        <p className="ops-body mt-4 max-w-3xl text-[20px] leading-[1.5] text-white sm:text-[22px]">
          CAPM told us what return investors require for bearing systematic risk. Why does
          that same required return become the rate used to discount a company&apos;s future
          cash flows?
        </p>
      </div>
    </Reveal>
  );
}

export default function Lesson8_1() {
  const report = useReportCBComplete("required-return-to-discount-rate");

  return (
    <CBLayout>
      <PVHero
        index="8.1"
        eyebrow="Lesson 8.1 · Module 8 — Capital Budgeting"
        heading="From Required Return to Discount Rate"
        subheading="CAPM estimates the return investors require for systematic risk. This lesson shows why that same required return becomes the discount rate that converts risky future cash flows into present value."
        bullets={[
          "A return means nothing without a comparable-risk alternative",
          "Required return = discount rate = opportunity cost of capital",
          "Higher discount rate → lower present value, by mechanism",
          "A positive expected payoff can still have negative NPV",
          "CAPM supplies a risk-adjusted discount rate",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== 1. OPENING DECISION ===================== */}
      <ConceptSection
        index="8.1.1"
        eyebrow="Section 1 · Is a 10% return good?"
        title="A return judged only against its alternative"
        intro={<>Begin with a single decision, before any formula. The answer depends entirely on what else your capital could earn at comparable risk.</>}
      >
        <Reveal>
          <InteractiveFrame>
            <OpportunityCostOpening />
          </InteractiveFrame>
        </Reveal>
        <Reveal>
          <DefinitionCard term="Opportunity cost of capital">
            The expected return available from other investments carrying similar systematic
            risk. A project is attractive only if its expected return exceeds this
            benchmark.
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* ===================== 2. THREE PERSPECTIVES ===================== */}
      <ConceptSection
        index="8.1.2"
        eyebrow="Section 2 · One rate, three perspectives"
        title="Required return, discount rate, opportunity cost"
        intro="The same market-determined rate answers three different questions. Switch perspective — the number does not change."
      >
        <Reveal>
          <InteractiveFrame>
            <ThreePerspectivesRate />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 3. WHY REQUIRED RETURN BECOMES DISCOUNT RATE ===================== */}
      <ConceptSection
        index="8.1.3"
        eyebrow="Section 3 · Why required return becomes the discount rate"
        title="The price that earns exactly the required return"
        intro={<>Ask a concrete question: how much could an investor pay today and still earn exactly the required expected return?</>}
      >
        <Reveal>
          <FormulaExplainer
            label="One-period present value"
            tone="amber"
            formula={String.raw`PV \times (1 + r) = E[CF_1] \;\Rightarrow\; PV = \frac{E[CF_1]}{1 + r}`}
            meaning="The most an investor can pay today and still earn exactly the required expected return r on an expected future cash flow E[CF₁]."
            variables={[
              { symbol: String.raw`E[CF_1]`, description: "The cash flow expected one period from now (not guaranteed)." },
              { symbol: String.raw`r`, description: "The required return for investments of comparable systematic risk." },
              { symbol: String.raw`PV`, description: "Present value — the break-even price today." },
            ]}
            substitution={String.raw`PV = \frac{110}{1 + 10\%}`}
            result="= $100"
            interpretation="The $100 present value is the price at which paying $100 today for an expected $110 next year provides exactly the required 10% expected return."
          />
        </Reveal>
        <Reveal>
          <p className="ops-body max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            So the rate investors <span className="text-white">require</span> is precisely
            the rate at which the expected future cash flow must be{" "}
            <span className="text-white">discounted</span> to recover that price. That is
            why required return and discount rate are the same rate.
          </p>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <RequiredReturnToPV />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 4. SAME CF, DIFFERENT RISK ===================== */}
      <ConceptSection
        index="8.1.4"
        eyebrow="Section 4 · Same expected cash flow, different risk"
        title="Why greater risk is worth less today"
        intro="Hold the expected cash flow fixed and change only the required return. Watch the pricing mechanism, not a vague 'risk reduces value.'"
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Investment</th>
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Required return</th>
                  <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Present value</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-100">
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-8 text-accent-green">A · lower risk</td>
                  <td className="py-3 pr-8">5%</td>
                  <td className="py-3">$104.76</td>
                </tr>
                <tr>
                  <td className="py-3 pr-8 text-accent-red">B · higher risk</td>
                  <td className="py-3 pr-8">12%</td>
                  <td className="py-3">$98.21</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <SameCashFlowDifferentRisk />
          </InteractiveFrame>
        </Reveal>
        <Reveal>
          <Feedback status="info">
            The expected cash flow is identical. Investment B is worth less today because
            investors require more compensation for its systematic risk. To earn that
            higher expected return from the same expected future payoff, they must pay a
            lower price today.
          </Feedback>
        </Reveal>
      </ConceptSection>

      {/* ===================== 5. WHERE THE DISCOUNT RATE COMES FROM ===================== */}
      <ConceptSection
        index="8.1.5"
        eyebrow="Section 5 · Where does the discount rate come from?"
        title="Reconnecting CAPM to valuation"
        intro="Module 7 built CAPM. Here we use it: the discount rate is the CAPM required return for the project's systematic risk."
      >
        <Reveal>
          <FormulaExplainer
            label="CAPM as the project discount rate"
            tone="cyan"
            formula={String.raw`r_{\text{project}} = R_f + \beta_{\text{project}}\bigl(E[R_M] - R_f\bigr)`}
            meaning="The discount rate equals the risk-free base plus compensation for the project's systematic market exposure."
            variables={[
              { symbol: String.raw`R_f`, description: "Risk-free rate — compensation for delaying consumption and committing capital through time." },
              { symbol: String.raw`(E[R_M] - R_f)`, description: "Market risk premium — additional expected return required for bearing broad market risk." },
              { symbol: String.raw`\beta_{\text{project}}`, description: "The project's exposure to market-wide movements." },
            ]}
            interpretation="The CAPM discount rate represents compensation for time plus compensation for systematic risk."
          />
        </Reveal>
        <Reveal>
          <ul className="space-y-2.5">
            {[
              "CAPM provides an estimate of the required return, not a guaranteed realized return.",
              "The required return is determined by market opportunities and risk — not by an arbitrary management target.",
              "Management cannot make a risky investment more valuable merely by declaring a low hurdle rate.",
              "Estimating the project beta in practice is addressed in Lesson 8.2.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                <span className="text-[17px] leading-[1.6] text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <Panel>
            <p className="text-[17px] leading-[1.7] text-slate-200">
              The discount rate should correspond to the{" "}
              <span className="text-white">timing and systematic risk</span> of the cash
              flow being valued. The relevant rate is not an internal target — it is the
              return the capital markets require for bearing that risk.
            </p>
            <div className="mt-4 max-w-xl">
              <BlockMath>{String.raw`\text{compensation for time} \;+\; \text{compensation for systematic risk}`}</BlockMath>
            </div>
          </Panel>
        </Reveal>
      </ConceptSection>

      {/* ===================== 6. MISCONCEPTIONS ===================== */}
      <ConceptSection
        index="8.1.6"
        eyebrow="Section 6 · Required return is not an arbitrary hurdle"
        title="Common misconceptions about the discount rate"
        intro="Each card corrects a frequent mistake. Expand any question to see why the discount rate is a market input, not a managerial preference."
      >
        <Reveal>
          <div className="space-y-2.5">
            <ExpandableQA question="Can management simply choose the required return?">
              Management can choose an internal target, but it cannot control the return
              investors require from comparable-risk opportunities. Setting a lower
              internal hurdle does not lower the opportunity cost of capital &mdash; it only
              hides it, and risks accepting projects that destroy value.
            </ExpandableQA>
            <ExpandableQA question="Is a higher discount rate always more conservative?">
              No. The appropriate rate should reflect systematic risk. A rate that is too
              high can cause the rejection of value-creating investments, just as a rate
              that is too low can accept value-destroying ones. &ldquo;Conservative&rdquo;
              means accurate, not large.
            </ExpandableQA>
            <ExpandableQA question="Is the discount rate the return the project will actually earn?">
              No. It is the expected return required <em>before</em> the outcome is known.
              The realized return may be higher or lower &mdash; sometimes far lower. The
              discount rate is a benchmark for the decision, not a forecast of the result.
            </ExpandableQA>
            <ExpandableQA question="Is the discount rate just the company's borrowing rate?">
              No. The borrowing rate compensates lenders for the risks of debt. The project
              discount rate reflects the required return associated with the{" "}
              <span className="text-white">project&apos;s</span> economic risk. They answer
              different questions and need not be equal.
            </ExpandableQA>
            <ExpandableQA question="Does a high discount rate mean management dislikes the project?">
              No. It is a valuation input tied to market risk, not a subjective score of
              enthusiasm. A high-beta project carries a high discount rate because the
              market requires more return for its risk &mdash; regardless of how management
              feels about it.
            </ExpandableQA>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== 7. CONNECT THE RATE TO NPV ===================== */}
      <ConceptSection
        index="8.1.7"
        eyebrow="Section 7 · Connect the rate to NPV"
        title="Positive payoff, negative NPV"
        intro="Only after the required-return logic is established do we introduce project cost. The result is the central distinction of this lesson."
      >
        <Reveal>
          <FormulaExplainer
            label="Net present value"
            tone="amber"
            formula={String.raw`NPV = PV - C_0 = \frac{E[CF_1]}{1 + r} - C_0`}
            meaning="NPV compares the present value of expected future cash flows with the initial capital committed today."
            variables={[
              { symbol: String.raw`PV`, description: "Present value of the expected future cash flow, discounted at the required return." },
              { symbol: String.raw`C_0`, description: "The initial investment required today." },
            ]}
            substitution={String.raw`NPV = \frac{110}{1.12} - 100 = 98.21 - 100`}
            result="= −$1.79"
            interpretation="Expected cash flow $110, required return 12%, cost $100. The project is expected to return more than it costs, yet its NPV is negative."
          />
        </Reveal>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-6 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Required return</th>
                  <th className="py-3 pr-6 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Present value</th>
                  <th className="py-3 pr-6 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Cost</th>
                  <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-amber">NPV</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-100">
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-6 text-accent-red">12%</td>
                  <td className="py-3 pr-6">$98.21</td>
                  <td className="py-3 pr-6">$100</td>
                  <td className="py-3 text-accent-red">−$1.79</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 text-accent-green">5%</td>
                  <td className="py-3 pr-6">$104.76</td>
                  <td className="py-3 pr-6">$100</td>
                  <td className="py-3 text-accent-green">+$4.76</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">The essential distinction</p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-ink-950/40 p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Expected undiscounted payoff
                </div>
                <div className="mt-2 text-slate-100">
                  <BlockMath>{String.raw`110 - 100 = +\$10`}</BlockMath>
                </div>
              </div>
              <div className="rounded-xl border border-accent-red/25 bg-ink-950/40 p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-red">
                  NPV at 12%
                </div>
                <div className="mt-2 text-slate-100">
                  <BlockMath>{String.raw`-\$1.79`}</BlockMath>
                </div>
              </div>
            </div>
            <p className="ops-body mt-4 text-[16px] leading-[1.7] text-slate-100">
              The investment is expected to return $10 more than its initial cost, but that
              expected payoff is still <span className="text-white">inadequate</span> relative
              to the return investors require for its systematic risk. The expected cash
              flow has not changed between the two rows &mdash; the value changes because the
              opportunity cost of bearing the risk has changed.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <DiscountRateNPVDecision />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 8. SHORT PRACTICE ===================== */}
      <ConceptSection
        index="8.1.8"
        eyebrow="Section 8 · Short practice"
        title="Check the three core conclusions"
        intro="Three concise questions on opportunity cost, the risk–value link, and the unity of the three rate perspectives. Explanatory feedback follows every answer."
      >
        <Reveal>
          <MasteryCheck
            passCount={2}
            onComplete={() => report()}
            continueLabel="Continue to Lesson 8.2"
            continueHref="/lessons/determining-the-discount-rate"
            questions={QUESTIONS}
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== 9. FINAL TAKEAWAY ===================== */}
      <ConceptSection
        index="8.1.9"
        eyebrow="Section 9 · Final takeaway"
        title="From required return to discount rate"
        intro="Four statements capture the whole lesson."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <div className="max-w-2xl">
              <BlockMath>
                {String.raw`\boxed{r_{\text{required}} = r_{\text{discount}} = \text{opportunity cost of capital}}`}
              </BlockMath>
            </div>
            <ul className="mt-6 space-y-2.5">
              {SUMMARY_POINTS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                  <span className="text-[17px] leading-[1.6] text-slate-100">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <Panel>
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
              Toward Lesson 8.2
            </div>
            <p className="ops-body mt-3 text-[18px] leading-[1.6] text-white">
              We now understand why a discount rate is necessary. The practical problem is
              determining which risk &mdash; and which discount rate &mdash; belongs to a
              company&apos;s actual investment.
            </p>
            <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-300">
              Lesson 8.2 takes up the estimation problem: how to assign a project beta and
              choose the discount rate that matches a real investment&apos;s systematic risk.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Lesson 8.2"
          continueHref="/lessons/determining-the-discount-rate"
        />
      </Reveal>

      <Reveal className="mt-8">
        <CBSourcePanel />
      </Reveal>
    </CBLayout>
  );
}
