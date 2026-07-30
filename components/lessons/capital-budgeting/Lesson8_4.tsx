"use client";

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
import ProfitVsValueOpening from "./ProfitVsValueOpening";
import PVInvestmentNPVDecomposition from "./PVInvestmentNPVDecomposition";
import FirmValueAdditivity from "./FirmValueAdditivity";
import ReturnViewVsNPVView from "./ReturnViewVsNPVView";
import HighestReturnVsHighestValue from "./HighestReturnVsHighestValue";
import RestaurantNPVBuilder from "./RestaurantNPVBuilder";
import IncrementalCashFlowSorter from "./IncrementalCashFlowSorter";
import SunkCostDecision from "./SunkCostDecision";
import MetricComparisonLens from "./MetricComparisonLens";
import AcquisitionPriceVsValue from "./AcquisitionPriceVsValue";
import ProjectValueVsMarketExpectation from "./ProjectValueVsMarketExpectation";
import NPVScenarioExplorer from "./NPVScenarioExplorer";
import NPVBreakEvenSolver from "./NPVBreakEvenSolver";
import IndependentVsExclusiveDecision from "./IndependentVsExclusiveDecision";
import NPVForecastVsActual from "./NPVForecastVsActual";
import NPVInvestorWorkflow from "./NPVInvestorWorkflow";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CBLayout from "./CBLayout";
import CBSourcePanel from "./CBSourcePanel";
import { useReportCBComplete } from "@/lib/cb-progress";

const SUMMARY_POINTS = [
  "NPV = present value of future incremental cash flows minus capital committed.",
  "A project with positive expected profit can still have negative NPV — the payoff must be adequate relative to timing and risk.",
  "Positive NPV is an estimated increase in firm value through value additivity.",
  "The highest percentage-return project may not create the most total value; scale matters.",
  "NPV uses incremental after-tax cash flows, including opportunity costs and cannibalization, and excludes sunk costs.",
  "Revenue growth, EPS accretion, and operating success do not by themselves prove value creation.",
  "Corporate value creation can differ from stock-price reaction because markets respond to surprises relative to expectations.",
  "NPV is an estimate, not an objective fact — test it with scenarios and break-even analysis.",
];

const LESSON_8_4_SOURCES = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo — capital-budgeting lectures: a project's NPV is its estimated addition to firm value; use incremental after-tax cash flows; ignore sunk costs; include opportunity costs, working capital, and cannibalization; accept positive-NPV independent investments; for mutually exclusive investments, choose the highest positive NPV.",
  "MIT 15.401 — value additivity: firm value changes by exactly the project's NPV. NPV dominates simple percentage-return rules when scale differs.",
  "Applied extension: corporate value creation vs. stock-price reaction, acquisition price-versus-value analysis, scenario and break-even NPV analysis, and post-investment performance monitoring for outside investors.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt:
      "A project costs $100 today and is expected to produce $109 next year. Comparable-risk investments offer 12%. Which statement is correct?",
    choices: [
      {
        id: "a",
        label:
          "The project has positive expected profit ($9) but negative NPV ($−2.68). Profit measures dollars gained; NPV accounts for the return investors require for the risk.",
      },
      { id: "b", label: "The project has positive NPV because it earns more than it costs." },
      { id: "c", label: "The project has zero NPV because the $9 profit exactly compensates for the 12% required return." },
    ],
    correctId: "a",
    hint: "PV = 109/1.12 ≈ $97.32. NPV = 97.32 − 100 = −$2.68. The 9% return is below the 12% required, so NPV is negative despite positive profit.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "Project A has NPV $2M and IRR 30%. Project B has NPV $20M and IRR 18%. They are mutually exclusive. Which should the company choose and why?",
    choices: [
      {
        id: "a",
        label: "Project B — for mutually exclusive investments, select the highest positive NPV. Project A has a higher IRR but creates less total value.",
      },
      { id: "b", label: "Project A — the higher IRR means a better return on capital." },
      { id: "c", label: "Both — they both have positive NPV." },
    ],
    correctId: "a",
    hint: "NPV measures total dollars of value created. IRR can mislead when scale differs. Project B's $20M NPV far exceeds Project A's $2M.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "A company has already spent $10M researching a product. Continuing requires $5M. The present value of remaining expected cash flows is $7M. How should the decision be made?",
    choices: [
      {
        id: "a",
        label: "Continue — the remaining NPV is +$2M ($7M − $5M). The $10M is sunk and irrelevant to the forward-looking decision, though it matters for evaluating past capital allocation.",
      },
      { id: "b", label: "Abandon — total NPV including sunk cost is −$8M ($7M − $5M − $10M)." },
      { id: "c", label: "Abandon — any project that required $10M of prior spending is a failure." },
    ],
    correctId: "a",
    hint: "Sunk costs should not affect the current continue-or-abandon decision. Compare only remaining benefits ($7M) with remaining costs ($5M).",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "A company announces a positive-NPV investment, but its stock price falls. Which is a rational explanation?",
    choices: [
      {
        id: "a",
        label: "The market had expected an even higher NPV. Stock prices respond to new information relative to prior expectations, not to whether the project is good in absolute terms.",
      },
      { id: "b", label: "This is impossible — positive NPV must always increase the stock price." },
      { id: "c", label: "The stock market does not understand NPV." },
    ],
    correctId: "a",
    hint: "A project can create corporate value while producing a negative stock-price reaction if investors previously expected even more value.",
  },
];

function CentralQuestion() {
  return (
    <Reveal className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-accent-amber/25 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-amber/10 blur-3xl" />
        <div className="font-sans text-[12px] uppercase tracking-[0.18em] text-accent-amber">
          Central question
        </div>
        <p className="ops-body mt-4 max-w-3xl text-[20px] leading-[1.5] text-white sm:text-[22px]">
          How do investors determine whether a corporate investment creates value after accounting
          for cash flow, timing, risk, and the capital required?
        </p>
      </div>
    </Reveal>
  );
}

function FactoryConstructionNote() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
            Two sources of time-varying discount rates
          </div>
          <div className="mt-3 space-y-2">
            {[
              { t: "Term structure of interest rates", d: "A risk-free cash flow in one year may have a different rate than one in ten years." },
              { t: "Term structure of risk premia", d: "Construction vs. operation, development vs. commercialization — different stages carry different market exposure." },
            ].map((x) => (
              <div key={x.t} className="rounded-lg border border-white/10 bg-ink-950/40 p-3">
                <div className="text-[14px] font-medium text-white">{x.t}</div>
                <p className="mt-1 text-[13px] leading-[1.5] text-slate-300">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
            Construction vs. operation
          </div>
          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-white/10 bg-ink-950/40 p-3">
              <div className="text-[14px] font-medium text-white">Construction stage risks</div>
              <p className="mt-1 text-[13px] leading-[1.5] text-slate-300">
                Permitting, engineering delays, contractor performance, cost overruns, equipment
                installation, financing availability.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-ink-950/40 p-3">
              <div className="text-[14px] font-medium text-white">Operating stage risks</div>
              <p className="mt-1 text-[13px] leading-[1.5] text-slate-300">
                Product demand, selling prices, capacity utilization, input costs, industry
                cyclicality, technological obsolescence.
              </p>
            </div>
          </div>
          <p className="ops-body mt-3 text-[13px] leading-[1.55] text-slate-200">
            A factory can be completed successfully and still produce poor financial returns.
            Construction risk is not automatically idiosyncratic — financing crises and supply-chain
            stress can create systematic exposure.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Lesson8_4() {
  const report = useReportCBComplete("npv-rule");

  return (
    <CBLayout>
      <PVHero
        index="8.4"
        eyebrow="Lesson 8.4 · Module 8 — Capital Budgeting"
        heading="Net Present Value as the Value-Creation Rule"
        subheading="NPV measures how much value an investment is expected to create or destroy after compensating investors for time and systematic risk. Why a profitable project can still destroy value — and how investors reconstruct NPV from incomplete information."
        bullets={[
          "A profitable project can still destroy value",
          "Present value minus capital committed equals NPV",
          "Scale matters — highest return ≠ most value created",
          "Incremental cash flows, opportunity costs, and sunk costs",
          "Corporate value creation vs. stock-price reaction",
          "Scenario analysis and NPV break-even",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== 1. OPENING PROBLEM ===================== */}
      <ConceptSection
        index="8.4.1"
        eyebrow="Section 1 · A profitable project that destroys value"
        title="Positive profit does not guarantee positive NPV"
        intro={<>A company invests $100M and expects $108M back in one year. Comparable-risk investments offer 12%. Does it create value?</>}
      >
        <Reveal>
          <InteractiveFrame>
            <ProfitVsValueOpening />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 2. PV, COST, NPV ===================== */}
      <ConceptSection
        index="8.4.2"
        eyebrow="Section 2 · Present value, cost, and NPV are different"
        title="Three components of the value-creation calculation"
        intro="Present value is what the future cash flows are worth today. Capital committed is what the project costs. NPV is the difference."
      >
        <Reveal>
          <FormulaExplainer
            label="The NPV decomposition"
            tone="amber"
            formula={String.raw`NPV = \underbrace{\sum_{t=1}^{T} \frac{E[CF_t]}{(1+r_t)^t}}_{\text{present value}} - \underbrace{C_0}_{\text{capital committed}}`}
            meaning="After paying for the investment, how much economic value remains?"
            variables={[
              { symbol: String.raw`E[CF_t]`, description: "Expected incremental after-tax cash flow in period t." },
              { symbol: String.raw`r_t`, description: "Discount rate matching the risk of that cash flow (may vary by stage — Lesson 8.3)." },
              { symbol: String.raw`C_0`, description: "Capital committed: construction, equipment, pre-opening costs, working capital, opportunity costs." },
            ]}
            interpretation="Capital committed may include construction, equipment, acquisition price, pre-opening costs, working capital, development spending, and opportunity costs — all resources consumed to create the project."
          />
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <PVInvestmentNPVDecomposition />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 3. WHY NPV INCREASES FIRM VALUE ===================== */}
      <ConceptSection
        index="8.4.3"
        eyebrow="Section 3 · Why positive NPV increases firm value"
        title="Value additivity"
        intro="The firm exchanges capital for an asset whose value differs from its cost. The difference is the value created — and it adds directly to firm value."
      >
        <Reveal>
          <DefinitionCard term="Value additivity">
            Firm value after the project equals firm value before the project plus the
            project&apos;s NPV. The company does not keep both the original cash and the new asset —
            the capital is consumed to create the project.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <FirmValueAdditivity />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 4. EXPECTED RETURN VS NPV ===================== */}
      <ConceptSection
        index="8.4.4"
        eyebrow="Section 4 · Expected return and NPV: two views"
        title="The same investment through two lenses"
        intro="Expected return asks whether the percentage exceeds the required return. NPV asks how many dollars of value are created. For one simple project they agree — NPV becomes more informative when scale, timing, or pattern differ."
      >
        <Reveal>
          <InteractiveFrame>
            <ReturnViewVsNPVView />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 5. WHY SCALE MATTERS ===================== */}
      <ConceptSection
        index="8.4.5"
        eyebrow="Section 5 · Why scale matters"
        title="Highest return is not the same as most value created"
        intro="Two mutually exclusive investments: one has 30% return on $1M, the other has 20% return on $100M. Which creates more value?"
      >
        <Reveal>
          <InteractiveFrame>
            <HighestReturnVsHighestValue />
          </InteractiveFrame>
        </Reveal>
        <Reveal>
          <Feedback status="info">
            Portfolio analysis often uses percentage returns because individual investors are small
            relative to the market. Corporate capital allocation must account for the actual dollar
            scale of the investment. This does not mean scale never matters in portfolio management
            — but the scale effect is most visible and most consequential in corporate capital
            allocation.
          </Feedback>
        </Reveal>
      </ConceptSection>

      {/* ===================== 6. RESTAURANT NPV CASE ===================== */}
      <ConceptSection
        index="8.4.6"
        eyebrow="Section 6 · Primary practical case — restaurant expansion"
        title="Building an NPV estimate store by store"
        intro={<>Continue the restaurant case from Lesson 8.2. A single new location requires $1.1M upfront. Does it create value?</>}
      >
        <Reveal>
          <InteractiveFrame>
            <RestaurantNPVBuilder />
          </InteractiveFrame>
        </Reveal>
        <Reveal>
          <Panel>
            <p className="text-[17px] leading-[1.7] text-slate-200">
              The location creates value only if the present value of its incremental future cash
              flows exceeds all capital required to open and support it. Restaurant-level margin is
              not the same as free cash flow — maintenance capex, working capital, and residual
              recovery all affect the NPV.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      {/* ===================== 7. INCREMENTAL CASH FLOW ===================== */}
      <ConceptSection
        index="8.4.7"
        eyebrow="Section 7 · What counts as incremental cash flow?"
        title="The practical test: with vs. without"
        intro="Only cash flows that differ because of the project belong in the NPV calculation. Sort each item into the right category."
      >
        <Reveal>
          <DefinitionCard term="Incremental cash flow test">
            How would the company&apos;s future cash flows differ with the investment compared with
            without it? Include additional revenue, additional costs, taxes, working capital,
            opportunity costs, cannibalization, and synergies. Exclude sunk costs and non-incremental
            overhead.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <IncrementalCashFlowSorter />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 8. SUNK COSTS ===================== */}
      <ConceptSection
        index="8.4.8"
        eyebrow="Section 8 · Sunk costs and the continue-or-abandon decision"
        title="The money already spent is irrelevant going forward"
        intro="A company has spent $10M on research. Continuing costs $5M; remaining benefits are worth $7M. Should it continue? The answer depends only on future costs and benefits."
      >
        <Reveal>
          <InteractiveFrame>
            <SunkCostDecision />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 9. NPV VS OTHER METRICS ===================== */}
      <ConceptSection
        index="8.4.9"
        eyebrow="Section 9 · NPV is not revenue, profit, EPS, or payback"
        title="What each metric reveals — and what it omits"
        intro="These metrics provide evidence. NPV supplies the economic decision framework. Switch lenses on the same investment to see the difference."
      >
        <Reveal>
          <InteractiveFrame>
            <MetricComparisonLens />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 10. ACQUISITION CASE ===================== */}
      <ConceptSection
        index="8.4.10"
        eyebrow="Section 10 · Acquisition case — growth can destroy value"
        title="Paying more than the value acquired"
        intro="An acquisition can increase revenue, earnings, market share, and EPS while still destroying value. The question is whether the price exceeds the value of what is acquired."
      >
        <Reveal>
          <InteractiveFrame>
            <AcquisitionPriceVsValue />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 11. CORPORATE VALUE VS STOCK REACTION ===================== */}
      <ConceptSection
        index="8.4.11"
        eyebrow="Section 11 · Corporate value creation vs. stock-price reaction"
        title="A positive-NPV project can make the stock fall"
        intro="Stock prices respond to new information relative to prior expectations. A project can create corporate value while disappointing the market."
      >
        <Reveal>
          <InteractiveFrame>
            <ProjectValueVsMarketExpectation />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 12. SCENARIO ANALYSIS ===================== */}
      <ConceptSection
        index="8.4.12"
        eyebrow="Section 12 · Scenario analysis — NPV is an estimate"
        title="Bear, base, and bull for the restaurant case"
        intro="NPV is an estimate built on uncertain assumptions. Scenario analysis identifies which assumptions determine whether the investment creates value."
      >
        <Reveal>
          <InteractiveFrame>
            <NPVScenarioExplorer />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 13. BREAK-EVEN NPV ===================== */}
      <ConceptSection
        index="8.4.13"
        eyebrow="Section 13 · Break-even NPV analysis"
        title="What must be true for NPV to equal zero?"
        intro="Instead of one point estimate, solve for the break-even value of each key assumption. Compare these thresholds with historical performance and actual results."
      >
        <Reveal>
          <InteractiveFrame>
            <NPVBreakEvenSolver />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 14. INDEPENDENT VS EXCLUSIVE ===================== */}
      <ConceptSection
        index="8.4.14"
        eyebrow="Section 14 · Independent vs. mutually exclusive investments"
        title="The two decision rules"
        intro="Independent positive-NPV projects should all be accepted. Mutually exclusive alternatives require choosing the highest positive NPV."
      >
        <Reveal>
          <InteractiveFrame>
            <IndependentVsExclusiveDecision />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 15. POST-INVESTMENT MONITORING ===================== */}
      <ConceptSection
        index="8.4.15"
        eyebrow="Section 15 · Post-investment performance evaluation"
        title="An initial NPV estimate does not end the analysis"
        intro="Investors track whether the assumptions behind a positive NPV are being realized — or whether the original thesis was wrong."
      >
        <Reveal>
          <InteractiveFrame>
            <NPVForecastVsActual />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 16. INVESTOR WORKFLOW ===================== */}
      <ConceptSection
        index="8.4.16"
        eyebrow="Section 16 · The investor workflow"
        title="One continuous process"
        intro="Estimate incremental cash flows, match discount rates to risk, calculate present value, subtract capital committed, test scenarios, compare with market expectations, monitor actual results."
      >
        <Reveal>
          <InteractiveFrame>
            <NPVInvestorWorkflow />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 17. MISCONCEPTION CHECKS ===================== */}
      <ConceptSection
        index="8.4.17"
        eyebrow="Section 17 · Misconception checks"
        title="Common mistakes about NPV"
        intro="Each card corrects a frequent error. Expand any question to see the reasoning."
      >
        <Reveal>
          <div className="space-y-2.5">
            <ExpandableQA question="If a project is expected to make money, must it have positive NPV?">
              No. The expected payoff must be sufficient relative to timing and risk. A project can
              be profitable in dollar terms and still destroy value if the payoff is inadequate
              relative to the return investors require.
            </ExpandableQA>
            <ExpandableQA question="Does the highest percentage return create the most value?">
              Not necessarily. Scale matters. A 30% return on $1M creates less value than a 20%
              return on $100M. For mutually exclusive investments, select the highest positive NPV,
              not the highest IRR.
            </ExpandableQA>
            <ExpandableQA question="Does positive NPV guarantee success?">
              No. NPV is an expected value based on uncertain assumptions. The realized outcome may
              be very different. Scenario and break-even analysis help the investor understand how
              robust the estimate is.
            </ExpandableQA>
            <ExpandableQA question="Should positive NPV always make the stock rise?">
              No. The market may already expect an even larger NPV. Stock prices respond primarily to
              new information relative to prior expectations, not to whether the project is good in
              absolute terms.
            </ExpandableQA>
            <ExpandableQA question="Does EPS accretion prove an acquisition created value?">
              No. EPS accretion can arise from financing structure or accounting effects while the
              buyer paid more than the acquired benefits were worth. Value creation requires the
              price to be below the present value of acquired cash flows and synergies.
            </ExpandableQA>
            <ExpandableQA question="Should sunk costs be included because the company already spent the money?">
              Not in the current forward-looking decision. Sunk costs cannot be recovered whether the
              project continues or stops. They remain relevant when evaluating management&apos;s past
              capital-allocation performance.
            </ExpandableQA>
            <ExpandableQA question="Should every project be rejected after a cost overrun?">
              Not automatically. Compare the remaining expected benefits with the remaining future
              costs. A project that was originally a poor investment may now be worth continuing if
              the remaining NPV is positive.
            </ExpandableQA>
            <ExpandableQA question="Is NPV precise because it produces a dollar number?">
              No. The output is only as reliable as its assumptions. NPV can produce a false sense of
              precision. Always test with scenarios, sensitivity analysis, and break-even conditions.
            </ExpandableQA>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== 18. APPLIED PRACTICE ===================== */}
      <ConceptSection
        index="8.4.18"
        eyebrow="Section 18 · Applied practice"
        title="Four applied questions"
        intro="Test the framework on realistic situations. Explanatory feedback follows every answer."
      >
        <Reveal>
          <MasteryCheck
            passCount={3}
            onComplete={() => report()}
            continueLabel="Continue to Lesson 8.5"
            continueHref="/lessons/irr-and-payback"
            questions={QUESTIONS}
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== 19. FINAL TAKEAWAY ===================== */}
      <ConceptSection
        index="8.4.19"
        eyebrow="Section 19 · Final takeaway"
        title="NPV as the value-creation rule"
        intro="The analytical sequence that ties the lesson together."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <div className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-slate-100">
              {[
                "Estimate cash flows",
                "Match rates to risk",
                "Calculate PV",
                "Subtract capital",
                "Test scenarios",
                "Compare with expectations",
                "Monitor results",
              ].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-3 py-1.5 text-accent-amber">
                    {step}
                  </span>
                  {i < arr.length - 1 && <span className="text-accent-amber" aria-hidden>→</span>}
                </span>
              ))}
            </div>
            <p className="ops-body mt-6 max-w-3xl text-[18px] leading-[1.6] text-white sm:text-[20px]">
              NPV measures whether an investment is expected to produce more value than the capital
              it consumes after accounting for timing, risk, and scale.
            </p>
            <p className="ops-body mt-3 max-w-3xl text-[16px] leading-[1.7] text-slate-200">
              The investor&apos;s task is not only to determine whether management&apos;s investment
              may create value, but also whether that value exceeds what the market already expects.
            </p>
            <ul className="mt-6 space-y-2.5">
              {SUMMARY_POINTS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                  <span className="text-[16px] leading-[1.6] text-slate-100">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <Panel>
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
              Toward Lesson 8.5
            </div>
            <p className="ops-body mt-3 text-[18px] leading-[1.6] text-white">
              NPV provides the correct economic framework, but managers and investors still use IRR,
              payback, EPS accretion, and other shortcuts. The next lesson explains what those
              measures reveal and where they can lead to the wrong conclusion.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Lesson 8.5"
          continueHref="/lessons/irr-and-payback"
        />
      </Reveal>

      <Reveal className="mt-8">
        <CBSourcePanel sources={LESSON_8_4_SOURCES} />
      </Reveal>
    </CBLayout>
  );
}
