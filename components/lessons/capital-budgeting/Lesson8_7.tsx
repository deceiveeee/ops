"use client";

import {
  Reveal, Panel, DefinitionCard, Feedback, InteractiveFrame,
  MasteryCheck, type MasteryQuestion, LessonSummary, ConceptSection, ExpandableQA,
} from "./shared";
import MeridianCaseOpening from "./MeridianCaseOpening";
import MeridianDisclosurePacket from "./MeridianDisclosurePacket";
import MeridianSourcesAndUses from "./MeridianSourcesAndUses";
import ProtectExistingBusinessDecision from "./ProtectExistingBusinessDecision";
import HeadlineUnitEconomicsTrap from "./HeadlineUnitEconomicsTrap";
import MeridianStoreNPVModel from "./MeridianStoreNPVModel";
import MeridianRiskClassification from "./MeridianRiskClassification";
import MarginalStoreTranches from "./MarginalStoreTranches";
import CoastalKitchenAcquisitionModel from "./CoastalKitchenAcquisitionModel";
import CoastalMetricsLens from "./CoastalMetricsLens";
import MeridianBuybackEvaluator from "./MeridianBuybackEvaluator";
import MeridianDebtAndLiquidity from "./MeridianDebtAndLiquidity";
import MeridianCapitalAllocationBoard from "./MeridianCapitalAllocationBoard";
import ValueCreatedVsLossAvoided from "./ValueCreatedVsLossAvoided";
import PlanVsMarketExpectations from "./PlanVsMarketExpectations";
import MeridianYearOneUpdate from "./MeridianYearOneUpdate";
import ForecastActualDiagnosis from "./ForecastActualDiagnosis";
import ManagementCredibilityAssessment from "./ManagementCredibilityAssessment";
import CapitalAllocationInvestmentMemo from "./CapitalAllocationInvestmentMemo";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CBLayout from "./CBLayout";
import CBSourcePanel from "./CBSourcePanel";
import { useReportCBComplete } from "@/lib/cb-progress";

const SUMMARY_POINTS = [
  "Public investors rarely receive complete internal project models — useful analysis can still be constructed from partial disclosures.",
  "Known facts, management forecasts, and investor assumptions must be distinguished.",
  "Maintenance spending and minimum liquidity are not freely available discretionary capital.",
  "Restaurant-level margin divided by development cost is not a valid project-return measure.",
  "Attractive average project economics can conceal negative returns at the margin.",
  "EPS accretion does not override negative NPV in an acquisition.",
  "Buyback value depends on price, intrinsic value, balance-sheet effects, and opportunity cost.",
  "The best capital-allocation plan may combine several uses of cash.",
  "Corporate value creation and stock-price reaction are separate questions.",
  "Capital budgeting becomes relevant to portfolio management when used to evaluate management's stewardship of shareholder capital.",
];

const SOURCES = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo — the complete capital-budgeting framework: incremental after-tax cash flows, risk-appropriate discount rates, NPV as the central decision rule, supplementary metrics, mutually exclusive choice, and updating decisions when future cash flows change.",
  "Investor-focused application: the public-equity case-study workflow applied to a fictional restaurant company (Meridian Dining Group), integrating disclosure reconstruction, marginal return analysis, acquisition evaluation, buyback price discipline, and management credibility assessment.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1", type: "single",
    prompt: "A stable consumer company launches a cyclical commodity division. Why should the new division not automatically use the parent company's historical discount rate?",
    choices: [
      { id: "a", label: "The investment's cash flows may have different systematic-risk exposure. The discount rate should match the risk of the cash flows being valued, not automatically the parent's risk." },
      { id: "b", label: "The parent company's rate is always correct because it commits the capital." },
      { id: "c", label: "The commodity division should use the risk-free rate." },
    ],
    correctId: "a",
    hint: "Ownership by the same parent does not make two cash-flow streams economically identical. The project's own systematic risk determines the appropriate rate.",
  },
  {
    id: "q2", type: "single",
    prompt: "A drug has a 30% approval probability, but trial results appear unrelated to market returns. Where should the approval probability enter the model?",
    choices: [
      { id: "a", label: "Primarily in the probability-weighted expected cash flow. The discount rate should reflect systematic risk, not total uncertainty." },
      { id: "b", label: "In the discount rate — higher failure probability means a higher rate." },
      { id: "c", label: "Nowhere — probability is irrelevant to NPV." },
    ],
    correctId: "a",
    hint: "Probability of success belongs in the expected cash-flow calculation. The discount rate compensates for systematic risk, not every source of uncertainty.",
  },
  {
    id: "q3", type: "single",
    prompt: "A project costs $100 and produces an expected $108 next year. Required return is 12%. Does it create value?",
    choices: [
      { id: "a", label: "No — NPV = $108/1.12 − $100 ≈ −$3.57. The expected return of 8% is below the 12% required return." },
      { id: "b", label: "Yes — it earns $8 more than it costs." },
      { id: "c", label: "Cannot be determined." },
    ],
    correctId: "a",
    hint: "Positive expected profit does not guarantee positive NPV. The payoff must be adequate relative to timing and risk.",
  },
  {
    id: "q4", type: "single",
    prompt: "Project A has IRR 30% and NPV $2M. Project B has IRR 18% and NPV $25M. They are mutually exclusive. Which should management select?",
    choices: [
      { id: "a", label: "Project B — for mutually exclusive investments, select the highest positive NPV. Scale matters." },
      { id: "b", label: "Project A — higher IRR is always better." },
      { id: "c", label: "Both — they both have positive NPV." },
    ],
    correctId: "a",
    hint: "IRR measures return per dollar; NPV measures total value created. For mutually exclusive projects, NPV is the decision rule.",
  },
  {
    id: "q5", type: "single",
    prompt: "An acquisition raises EPS but has negative estimated NPV. Can both statements be correct?",
    choices: [
      { id: "a", label: "Yes. EPS accretion is an accounting result that can arise from financing effects while the buyer overpaid for the acquired value." },
      { id: "b", label: "No — if EPS rises, the acquisition must create value." },
      { id: "c", label: "No — NPV and EPS always agree." },
    ],
    correctId: "a",
    hint: "EPS accretion answers an accounting question. NPV answers an economic question. They can easily disagree.",
  },
  {
    id: "q6", type: "single",
    prompt: "A company repurchases shares above a reasonable estimate of intrinsic value. Who is likely to benefit?",
    choices: [
      { id: "a", label: "Selling shareholders benefit — they receive more than the shares are worth. Continuing shareholders lose value." },
      { id: "b", label: "Continuing shareholders benefit because EPS rises." },
      { id: "c", label: "Both sides benefit equally." },
    ],
    correctId: "a",
    hint: "When repurchase price exceeds intrinsic value, value is transferred from continuing to selling shareholders.",
  },
  {
    id: "q7", type: "single",
    prompt: "The first expansion tranche earns an expected 18%. The next earns only 7%. Required return is 10%. How much should management invest?",
    choices: [
      { id: "a", label: "Fund the first tranche but reject the second. Capital allocation should be made at the margin." },
      { id: "b", label: "Fund both because the average return exceeds 10%." },
      { id: "c", label: "Fund neither because returns are declining." },
    ],
    correctId: "a",
    hint: "Continue investing while marginal NPV > 0. The second tranche's 7% return is below the 10% required return, so it destroys value.",
  },
];

function CentralQuestion() {
  return (
    <Reveal className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-accent-amber/25 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-amber/10 blur-3xl" />
        <div className="font-sans text-[12px] uppercase tracking-[0.18em] text-accent-amber">Central question</div>
        <p className="ops-body mt-4 max-w-3xl text-[20px] leading-[1.5] text-white sm:text-[22px]">
          Given incomplete company disclosures, can an investor determine whether management&apos;s
          proposed use of capital is likely to create value — and whether that value is already
          reflected in the stock price?
        </p>
      </div>
    </Reveal>
  );
}

function ExampleAllocation() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-green">
          One defensible revised plan
        </div>
        <div className="mt-4 space-y-2 text-[14px]">
          {[
            { l: "Maintenance", v: "$100M", why: "Protects existing cash flows" },
            { l: "Best 100 stores", v: "$170M", why: "Positive marginal NPV" },
            { l: "Debt repayment", v: "$150M", why: "Improves resilience, creates value" },
            { l: "Share repurchase", v: "$100M", why: "Attractive at moderate discount to IV" },
            { l: "Liquidity reserve", v: "$80M", why: "Preserves flexibility" },
            { l: "Acquisition", v: "$0", why: "Rejected — negative NPV" },
            { l: "Final 50 stores", v: "$0", why: "Rejected — negative marginal NPV" },
          ].map((x) => (
            <div key={x.l} className="flex items-baseline justify-between border-b border-white/5 pb-1">
              <div>
                <span className="text-slate-200">{x.l}</span>
                <span className="ml-2 text-[12px] text-slate-400">{x.why}</span>
              </div>
              <span className="font-sans text-white">{x.v}</span>
            </div>
          ))}
          <div className="flex items-baseline justify-between pt-1 font-medium">
            <span className="text-white">Total</span>
            <span className="font-sans text-accent-amber">$600M</span>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          This is one defensible allocation under base-case assumptions, not the only possible correct
          answer. Compare your allocation with this example without treating difference as automatic
          error. What matters is the reasoning behind each choice.
        </p>
      </div>
    </div>
  );
}

function Module8Synthesis() {
  const steps = [
    "Identify the corporate investment", "Find and classify disclosures", "Estimate incremental cash flows",
    "Separate probabilities from systematic risk", "Select risk-appropriate discount rates", "Calculate NPV",
    "Use IRR, payback, PI, EPS, ROIC diagnostically", "Compare competing uses of capital",
    "Evaluate marginal returns and constraints", "Compare with market expectations",
    "Monitor actual results", "Update the thesis and management assessment",
  ];
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Module 8 framework
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {steps.map((step, i) => (
            <span key={step} className="flex items-center gap-1.5">
              <span className="rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-2.5 py-1 text-[12px] text-accent-amber">{step}</span>
              {i < steps.length - 1 && <span className="text-accent-amber/50 text-[10px]" aria-hidden>→</span>}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <p className="ops-body text-[18px] leading-[1.6] text-white">
          Capital budgeting becomes relevant to portfolio management when investors use it to evaluate
          what management is doing with shareholder capital.
        </p>
        <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-200">
          An outside investor rarely knows the exact project NPV. The investor can still identify the
          major value drivers, test whether expected returns exceed the opportunity cost of capital,
          compare competing uses of cash, and evaluate whether management has a credible record of
          creating value.
        </p>
      </div>
    </div>
  );
}

export default function Lesson8_7() {
  const report = useReportCBComplete("sensitivity-and-scenario-analysis");

  return (
    <CBLayout>
      <PVHero
        index="8.7"
        eyebrow="Lesson 8.7 · Module 8 — Capital Budgeting (Capstone Case)"
        heading="The Capital Allocation Case: Reinvest, Acquire, or Return Cash?"
        subheading="Apply the complete Module 8 framework to one fictional public-equity case. Reconstruct project economics, evaluate store expansion, acquisition, buyback, and debt repayment — and build a defensible $600 million allocation plan."
        bullets={[
          "One fictional company: Meridian Dining Group",
          "Fragmented disclosure packet to reconstruct",
          "Store NPV model, marginal returns, and acquisition analysis",
          "Conflicting metrics: NPV vs. IRR vs. EPS vs. ROIC",
          "A $600 million allocation board with realistic constraints",
          "Year 1 update and management credibility assessment",
        ]}
        primaryLabel="Start the case"
      />

      <CentralQuestion />

      {/* 1. OPENING */}
      <ConceptSection index="8.7.1" eyebrow="Section 1 · Opening scenario" title="Does management's plan create value?" intro={<>Meridian Dining Group announces a three-part strategy. The answer cannot be determined without further analysis.</>}>
        <Reveal><InteractiveFrame><MeridianCaseOpening /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 2. DISCLOSURE PACKET */}
      <ConceptSection index="8.7.2" eyebrow="Section 2 · Fictional disclosure packet" title="Reconstructing from fragmented sources" intro="Public investors rarely receive one clean project spreadsheet. Inspect five documents and distinguish facts from forecasts and assumptions.">
        <Reveal><InteractiveFrame><MeridianDisclosurePacket /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 3. SOURCES AND USES */}
      <ConceptSection index="8.7.3" eyebrow="Section 3 · Sources and uses" title="The funding constraint" intro="The proposed plan requires $650M but only $600M is available — before preserving liquidity.">
        <Reveal><InteractiveFrame><MeridianSourcesAndUses /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 4. PROTECT EXISTING BUSINESS */}
      <ConceptSection index="8.7.4" eyebrow="Section 4 · Protect the existing business" title="Maintenance before growth" intro="Maintenance capital protects existing earning power. Cutting it to fund growth or acquisitions erodes the base business.">
        <Reveal><InteractiveFrame><ProtectExistingBusinessDecision /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 5. HEADLINE TRAP */}
      <ConceptSection index="8.7.5" eyebrow="Section 5 · The headline unit-economics trap" title="43.6% is not a project return" intro="Restaurant-level margin divided by development cost ignores timing, taxes, ramp, maintenance, cannibalization, and risk.">
        <Reveal><InteractiveFrame><HeadlineUnitEconomicsTrap /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 6. STORE NPV MODEL */}
      <ConceptSection index="8.7.6" eyebrow="Section 6 · Representative store cash-flow model" title="Building a real NPV estimate" intro="Use management targets where available and investor assumptions for the rest. Calculate NPV, IRR, and payback programmatically.">
        <Reveal><InteractiveFrame><MeridianStoreNPVModel /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 7. RISK CLASSIFICATION */}
      <ConceptSection index="8.7.7" eyebrow="Section 7 · Separate expected cash flow from systematic risk" title="Which uncertainties affect the discount rate?" intro="Apply Lesson 8.3 within the case. Not every source of uncertainty increases the required return.">
        <Reveal><InteractiveFrame><MeridianRiskClassification /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 8. MARGINAL TRANCHES */}
      <ConceptSection index="8.7.8" eyebrow="Section 8 · Declining returns across store tranches" title="Positive total NPV can hide negative marginal NPV" intro="150 stores produce positive total NPV. But the final 50 stores destroy value. Should all 150 be built?">
        <Reveal><InteractiveFrame><MarginalStoreTranches /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 9. ACQUISITION MODEL */}
      <ConceptSection index="8.7.9" eyebrow="Section 9 · Evaluate the acquisition" title="Good business, bad price" intro="Coastal Kitchen may be profitable and strategically interesting. The acquisition can still destroy value if Meridian overpays.">
        <Reveal><InteractiveFrame><CoastalKitchenAcquisitionModel /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 10. ACQUISITION METRICS */}
      <ConceptSection index="8.7.10" eyebrow="Section 10 · Compare the acquisition metrics" title="Conflicting signals" intro="NPV is negative, IRR is below the required return, but EPS is accretive. Which measure should anchor the decision?">
        <Reveal><InteractiveFrame><CoastalMetricsLens /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 11. BUYBACK EVALUATOR */}
      <ConceptSection index="8.7.11" eyebrow="Section 11 · Evaluate the share repurchase" title="Price, intrinsic value, and opportunity cost" intro="Shares may be moderately undervalued. But the estimate is uncertain, and better uses of capital may exist.">
        <Reveal><InteractiveFrame><MeridianBuybackEvaluator /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 12. DEBT AND LIQUIDITY */}
      <ConceptSection index="8.7.12" eyebrow="Section 12 · Debt repayment and liquidity" title="A genuine alternative" intro="Debt repayment is not 'doing nothing.' It reduces interest, distress risk, and financing constraints.">
        <Reveal><InteractiveFrame><MeridianDebtAndLiquidity /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 13. ALLOCATION BOARD */}
      <ConceptSection index="8.7.13" eyebrow="Section 13 · Build a revised capital-allocation plan" title="Allocate $600 million" intro="Distribute the capital with realistic constraints. Maintenance must be funded. Liquidity must be preserved. Multiple defensible allocations exist.">
        <Reveal><InteractiveFrame><MeridianCapitalAllocationBoard /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 14. EXAMPLE ALLOCATION */}
      <ConceptSection index="8.7.14" eyebrow="Section 14 · Example of a defensible plan" title="One defensible allocation" intro="After you submit your plan, compare it with this example. Difference is not automatic error.">
        <Reveal><ExampleAllocation /></Reveal>
      </ConceptSection>

      {/* 15. VALUE CREATED */}
      <ConceptSection index="8.7.15" eyebrow="Section 15 · Value created vs. value destruction avoided" title="Two distinct concepts" intro="Value created comes from positive-NPV uses undertaken. Value destruction avoided comes from negative-NPV uses rejected.">
        <Reveal><InteractiveFrame><ValueCreatedVsLossAvoided /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 16. MARKET EXPECTATIONS */}
      <ConceptSection index="8.7.16" eyebrow="Section 16 · Compare with market expectations" title="Value creation vs. surprise" intro="The plan may create partial value but still disappoint the market if investors expected more discipline.">
        <Reveal><InteractiveFrame><PlanVsMarketExpectations /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 17. YEAR 1 UPDATE */}
      <ConceptSection index="8.7.17" eyebrow="Section 17 · Year 1 actual results" title="The thesis must change" intro="Stores opened below plan, costs above plan, synergies far below target. How should the investment thesis change?">
        <Reveal><InteractiveFrame><MeridianYearOneUpdate /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 18. FORECAST VS ACTUAL */}
      <ConceptSection index="8.7.18" eyebrow="Section 18 · Forecast versus actual diagnosis" title="Classify each variance" intro="Is each miss an execution problem, aggressive assumptions, external conditions, or a design flaw?">
        <Reveal><InteractiveFrame><ForecastActualDiagnosis /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 19. CREDIBILITY */}
      <ConceptSection index="8.7.19" eyebrow="Section 19 · Management credibility assessment" title="Judging from evidence" intro="Rate seven dimensions of credibility using the Year 1 evidence. Mixed conclusions are acceptable.">
        <Reveal><InteractiveFrame><ManagementCredibilityAssessment /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 20. MEMO */}
      <ConceptSection index="8.7.20" eyebrow="Section 20 · Final investment memo" title="Integrate the full analysis" intro="Complete a structured memo covering the proposed allocation, best and worst uses, key assumptions, metric interpretation, recommended allocation, market expectations, monitoring indicators, and updated thesis.">
        <Reveal><InteractiveFrame><CapitalAllocationInvestmentMemo /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 21. SYNTHESIS PRACTICE */}
      <ConceptSection index="8.7.21" eyebrow="Section 21 · Short synthesis practice" title="Seven cumulative questions" intro="Test the complete Module 8 framework on focused problems.">
        <Reveal>
          <MasteryCheck passCount={5} onComplete={() => report()}
            continueLabel="Module 8 complete"
            continueHref="/lessons/real-options-intuition"
            questions={QUESTIONS} />
        </Reveal>
      </ConceptSection>

      {/* 22. FINAL SYNTHESIS */}
      <ConceptSection index="8.7.22" eyebrow="Section 22 · Final Module 8 synthesis" title="The complete investor framework" intro="One connected process that ties the entire module together.">
        <Reveal><Module8Synthesis /></Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-gradient-to-br from-accent-green/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <div className="font-sans text-[12px] uppercase tracking-[0.18em] text-accent-green">
              Module 8 complete
            </div>
            <p className="ops-body mt-4 max-w-3xl text-[18px] leading-[1.6] text-white sm:text-[20px]">
              You have completed the Capital Budgeting module. From required return and discount rates
              through NPV, alternative metrics, and management capital-allocation evaluation, you now
              have the complete framework that connects corporate finance theory to portfolio-management
              practice.
            </p>
            <ul className="mt-6 space-y-2.5">
              {SUMMARY_POINTS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />
                  <span className="text-[16px] leading-[1.6] text-slate-100">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-12">
        <LessonSummary points={SUMMARY_POINTS}
          continueLabel="Continue to Lesson 8.8"
          continueHref="/lessons/real-options-intuition" />
      </Reveal>

      <Reveal className="mt-8">
        <CBSourcePanel sources={SOURCES} />
      </Reveal>
    </CBLayout>
  );
}
