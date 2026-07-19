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
import OneProjectDifferentStagesOpening from "./OneProjectDifferentStagesOpening";
import ProbabilityRiskTimingSeparation from "./ProbabilityRiskTimingSeparation";
import TotalUncertaintyVsSystematicRisk from "./TotalUncertaintyVsSystematicRisk";
import OilStageSpecificValuation from "./OilStageSpecificValuation";
import SingleRateVsStageSpecific from "./SingleRateVsStageSpecific";
import DoubleCountingRiskCheck from "./DoubleCountingRiskCheck";
import DrugMilestoneValuationTimeline from "./DrugMilestoneValuationTimeline";
import OneRateOrMultipleRatesDecision from "./OneRateOrMultipleRatesDecision";
import StageRiskInvestorWorkflow from "./StageRiskInvestorWorkflow";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CBLayout from "./CBLayout";
import CBSourcePanel from "./CBSourcePanel";
import { useReportCBComplete } from "@/lib/cb-progress";

const SUMMARY_POINTS = [
  "A single investment may pass through stages with different economic risks — and may justify different discount rates.",
  "Expected cash flow incorporates possible outcomes and their probabilities. The discount rate compensates for systematic risk.",
  "A high probability of failure does not automatically imply a high CAPM discount rate.",
  "Zero beta does not mean zero uncertainty — it means the uncertainty is not priced as systematic market risk.",
  "Probability weighting and an unsupported discount-rate premium can double-count the same risk.",
  "Multiple rates are useful only when stages carry economically meaningful and distinguishable risk exposures.",
  "When risks cannot be separated or disclosure is insufficient, one reasonable rate remains a valid approximation.",
  "Investors should update valuations as milestones resolve uncertainty.",
];

const LESSON_8_3_SOURCES = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo — capital-budgeting lectures: discount rates may differ across horizons, different cash flows can carry different risks, and the rate used should correspond to the risk of the cash flow being valued.",
  "MIT 15.401 — the oil-exploration example: separating diversifiable exploration uncertainty from market-sensitive production risk, and the principle that idiosyncratic uncertainty is not automatically rewarded with a higher expected return.",
  "Applied extension: pharmaceutical development milestones, factory construction versus operation, and the practical investor workflow for stage-specific valuation under incomplete public disclosure.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt:
      "A mining company has a 25% probability of discovering a viable deposit. The geological result appears unrelated to the market. If discovered, revenue will be highly exposed to commodity cycles. Which statement is correct?",
    choices: [
      {
        id: "a",
        label:
          "The 25% discovery probability belongs in the expected cash-flow calculation; the commodity-price exposure should be reflected in the operating-stage discount rate.",
      },
      {
        id: "b",
        label: "Both risks should be captured by inflating the discount rate to 40%.",
      },
      {
        id: "c",
        label: "The discovery probability should be ignored because it is not systematic.",
      },
    ],
    correctId: "a",
    hint: "Probability affects expected cash flow. Systematic risk (commodity cycles) affects the discount rate. These are separate adjustments for different sources of risk.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "A company probability-weights a drug's value by its approval probability and also uses a 25% discount rate solely because approval is uncertain. What potential error should the investor investigate?",
    choices: [
      {
        id: "a",
        label:
          "Double counting — the failure probability is already in the expected cash flow. The 25% must be independently justified by systematic risk, not by failure probability.",
      },
      {
        id: "b",
        label: "Under-counting — the rate should be even higher because the drug is risky.",
      },
      {
        id: "c",
        label: "No error — probability weighting and a high discount rate are always correct for risky projects.",
      },
    ],
    correctId: "a",
    hint: "If both adjustments compensate for the same binary failure risk, the uncertainty is counted twice. The discount rate should reflect systematic risk only.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "A data center is built under a fixed-price contract, but future lease revenue depends heavily on technology demand. Should construction and operating cash flows automatically use the same rate?",
    choices: [
      {
        id: "a",
        label:
          "Not necessarily. The fixed-price construction commitment and the demand-sensitive operating revenue carry different systematic risks. Stage-specific rates may materially improve the analysis.",
      },
      {
        id: "b",
        label: "Yes — all cash flows of the same project must use one rate.",
      },
      {
        id: "c",
        label: "No — construction always has zero beta, so it should always use the risk-free rate.",
      },
    ],
    correctId: "a",
    hint: "The fixed-price contract reduces construction-stage systematic exposure. The operating revenue carries market-sensitive demand risk. The stages are economically distinguishable.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "A mature store-opening program has stable unit economics and no clearly distinct risk stages. Is one discount rate necessarily inappropriate?",
    choices: [
      {
        id: "a",
        label:
          "No. When all cash flows arise from similar operations with stable risk, one well-estimated rate is a reasonable approximation. Multiple rates add complexity without economic insight.",
      },
      {
        id: "b",
        label: "Yes — every project requires stage-specific rates.",
      },
      {
        id: "c",
        label: "Only if sensitivity analysis confirms the decision is not affected.",
      },
    ],
    correctId: "a",
    hint: "The professional objective is to represent economically meaningful risk differences, not to maximize the number of rates.",
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
          Can the risk of one investment change as it moves from development to approval,
          construction, launch, and mature operation?
        </p>
      </div>
    </Reveal>
  );
}

function FactoryExample() {
  const construction = [
    "Permitting and engineering delays",
    "Contractor performance",
    "Cost overruns",
    "Equipment installation",
    "Financing availability",
  ];
  const operating = [
    "Product demand",
    "Selling prices",
    "Capacity utilization",
    "Input costs",
    "Industry cyclicality",
    "Technological obsolescence",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5 sm:p-6">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
            Construction stage
          </div>
          <ul className="mt-3 space-y-2">
            {construction.map((x) => (
              <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5 sm:p-6">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
            Operating stage
          </div>
          <ul className="mt-3 space-y-2">
            {operating.map((x) => (
              <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          A factory can be completed successfully and still produce poor financial returns.{" "}
          <span className="text-white">Probability of successful completion</span> is a separate
          question from <span className="text-white">value of operating cash flows</span> after
          completion.
        </p>
        <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-300">
          Construction risk is not automatically idiosyncratic. Financing crises, commodity-price
          inflation, labor shortages, and supply-chain stress may create systematic exposure. The
          classification depends on the actual project and economic environment — not on a default
          assumption.
        </p>
      </div>
    </div>
  );
}

export default function Lesson8_3() {
  const report = useReportCBComplete("when-risk-changes-over-time");

  return (
    <CBLayout>
      <PVHero
        index="8.3"
        eyebrow="Lesson 8.3 · Module 8 — Capital Budgeting"
        heading="When Risk Changes Over Time"
        subheading="Different stages or cash flows within the same investment can carry different risks. Learn to separate probability weighting from systematic risk, and to match discount rates to each stage."
        bullets={[
          "One project can pass through stages with different economic risks",
          "Probability affects expected cash flow; the discount rate compensates for systematic risk",
          "The MIT oil-exploration example, worked stage by stage",
          "Zero beta is not zero uncertainty",
          "When one rate is enough — and when it is not",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== 1. OPENING PROBLEM ===================== */}
      <ConceptSection
        index="8.3.1"
        eyebrow="Section 1 · One project, one rate?"
        title="A drug from preclinical to mature sales"
        intro={<>A pharmaceutical development project looks very different at the trial stage than at the commercial stage. Should every stage automatically use the same discount rate?</>}
      >
        <Reveal>
          <InteractiveFrame>
            <OneProjectDifferentStagesOpening />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 2. SEPARATE THREE CONCEPTS ===================== */}
      <ConceptSection
        index="8.3.2"
        eyebrow="Section 2 · Three concepts that must stay separate"
        title="Expected cash flow, systematic risk, and timing"
        intro="The most common valuation errors come from blending these three concepts. Keep them distinct."
      >
        <Reveal>
          <InteractiveFrame>
            <ProbabilityRiskTimingSeparation />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 3. UNCERTAINTY ≠ HIGHER RATE ===================== */}
      <ConceptSection
        index="8.3.3"
        eyebrow="Section 3 · More uncertainty does not mean a higher discount rate"
        title="Total uncertainty vs. systematic risk"
        intro="A 50% probability of failure does not automatically justify a very high CAPM discount rate. The key question is whether the outcome moves with the market."
      >
        <Reveal>
          <DefinitionCard term="The critical distinction">
            Probability of failure affects <span className="text-white">expected cash flow</span>.
            The discount rate should reflect <span className="text-white">systematic risk</span> —
            whether the resulting cash flow covaries with broad market conditions.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <TotalUncertaintyVsSystematicRisk />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 4. OIL EXPLORATION WORKED EXAMPLE ===================== */}
      <ConceptSection
        index="8.3.4"
        eyebrow="Section 4 · Primary worked example — oil exploration"
        title="Stage-specific valuation, one step at a time"
        intro={<>The MIT oil-exploration example separates diversifiable exploration uncertainty from market-sensitive production risk. Work backward from the production cash flow.</>}
      >
        <Reveal>
          <FormulaExplainer
            label="The stage-specific principle"
            tone="amber"
            formula={String.raw`V_0 = \frac{E[V_1]}{1 + r_{\text{exploration}}} \quad\text{where}\quad E[V_1] = p \cdot V_1(\text{success}) + (1-p)\cdot 0`}
            meaning="The Year 1 expected value combines the probability of discovery with the conditional production value. That expected value is then discounted at a rate matching the exploration stage's own systematic risk."
            variables={[
              { symbol: String.raw`p`, description: "Probability of discovering oil (incorporated via probability weighting, not the discount rate)." },
              { symbol: String.raw`V_1(\text{success})`, description: "Value at Year 1 if oil is found — the production cash flow discounted at the production-required return." },
              { symbol: String.raw`r_{\text{exploration}}`, description: "Discount rate for the exploration-stage expected value, reflecting its own systematic risk." },
            ]}
            interpretation="Different stages use different rates because they carry different risks. The probability of finding nothing enters through E[V₁], not through inflating the discount rate."
          />
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <OilStageSpecificValuation />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 5. COMPARE WITH ONE-RATE ===================== */}
      <ConceptSection
        index="8.3.5"
        eyebrow="Section 5 · Compare with the one-rate approach"
        title="Where the two methods diverge"
        intro="Apply one rate to both years and see how the result differs from the stage-specific calculation. The gap reveals exactly where the rate treatment matters."
      >
        <Reveal>
          <InteractiveFrame>
            <SingleRateVsStageSpecific />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 6. DOUBLE COUNTING ===================== */}
      <ConceptSection
        index="8.3.6"
        eyebrow="Section 6 · Avoid double-counting risk"
        title="Probabilities and discount rates answer different questions"
        intro="Counting the same uncertainty twice — once through probability weighting and again through an unsupported discount-rate premium — is a subtle but common error."
      >
        <Reveal>
          <InteractiveFrame>
            <DoubleCountingRiskCheck />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 7. PHARMACEUTICAL APPLICATION ===================== */}
      <ConceptSection
        index="8.3.7"
        eyebrow="Section 7 · Pharmaceutical development in practice"
        title="How risk shifts across clinical milestones"
        intro="Return to the opening drug example. As the project moves from preclinical through commercialization, the dominant source of priced risk changes."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5 sm:p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
                Stage 1 · Clinical development
              </div>
              <ul className="mt-3 space-y-2">
                {[
                  "Trial success probabilities",
                  "Remaining research expense",
                  "Safety and efficacy results",
                  "Regulatory milestones",
                  "Time to the next decision point",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-100">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5 sm:p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
                Stage 2 · Commercialization
              </div>
              <ul className="mt-3 space-y-2">
                {[
                  "Addressable patient population",
                  "Expected price and reimbursement",
                  "Market share and patent life",
                  "Manufacturing and marketing costs",
                  "Competitive treatments",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-100">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <DrugMilestoneValuationTimeline />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 8. FACTORY EXAMPLE ===================== */}
      <ConceptSection
        index="8.3.8"
        eyebrow="Section 8 · Factory construction and operation"
        title="A compact manufacturing example"
        intro="The same principle applies beyond pharma. Separate the probability of successful completion from the value of operating cash flows."
      >
        <Reveal>
          <FactoryExample />
        </Reveal>
      </ConceptSection>

      {/* ===================== 9. TWO SOURCES OF TIME-VARYING RATES ===================== */}
      <ConceptSection
        index="8.3.9"
        eyebrow="Section 9 · Two sources of time-varying discount rates"
        title="The time value of money and the risk premium can both differ"
        intro="Discount rates can vary across time for two distinct reasons. Understanding both prevents confusion."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Panel>
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
                1 · Term structure of interest rates
              </div>
              <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-200">
                A risk-free cash flow due in one year may have a different risk-free rate from a
                risk-free cash flow due in ten years. The time value of money itself can vary with
                horizon.
              </p>
            </Panel>
            <Panel>
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
                2 · Term structure of risk premia
              </div>
              <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-200">
                Cash flows at different stages may carry different market exposure: development
                versus commercialization, construction versus operation, fixed contracts versus
                cyclical sales.
              </p>
            </Panel>
          </div>
        </Reveal>
        <Reveal>
          <Feedback status="info">
            Different discount rates can arise because both the time value of money and the risk
            premium can differ across horizons. This lesson focuses on the second source —
            stage-specific risk premia. A full treatment of the yield curve belongs to the
            fixed-income module.
          </Feedback>
        </Reveal>
      </ConceptSection>

      {/* ===================== 10. WHEN ONE RATE IS ACCEPTABLE ===================== */}
      <ConceptSection
        index="8.3.10"
        eyebrow="Section 10 · When one discount rate is acceptable"
        title="Representing meaningful risk differences, not maximizing rates"
        intro="The professional objective is not to use as many discount rates as possible. Sometimes one rate is the right answer."
      >
        <Reveal>
          <InteractiveFrame>
            <OneRateOrMultipleRatesDecision />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 11. INVESTOR WORKFLOW ===================== */}
      <ConceptSection
        index="8.3.11"
        eyebrow="Section 11 · How outside investors apply the principle"
        title="A connected analytical process"
        intro="Outside investors rarely observe management's exact stage-specific betas or internal probability models. This practical workflow adapts the principle to incomplete information."
      >
        <Reveal>
          <InteractiveFrame>
            <StageRiskInvestorWorkflow />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 12. MISCONCEPTION CHECKS ===================== */}
      <ConceptSection
        index="8.3.12"
        eyebrow="Section 12 · Misconception checks"
        title="Common mistakes about stage-specific risk"
        intro="Each card corrects a frequent error. Expand any question to see the reasoning."
      >
        <Reveal>
          <div className="space-y-2.5">
            <ExpandableQA question="The earliest stage is the most uncertain, so must it use the highest discount rate?">
              Not necessarily. The earliest stage may carry the greatest total uncertainty, but the
              discount rate depends on systematic risk — covariance with the market. A highly
              uncertain scientific outcome can have low or zero beta if it is unrelated to broad
              market conditions.
            </ExpandableQA>
            <ExpandableQA question="A 30% probability of success means we should add 70% to the discount rate.">
              No. The probability of success belongs in the expected cash-flow calculation. Adding it
              to the discount rate counts the same uncertainty twice — unless the higher rate is
              independently justified by systematic risk.
            </ExpandableQA>
            <ExpandableQA question="Zero beta means the outcome is certain.">
              No. Zero beta means the uncertainty is <em>not systematically related</em> to broad
              market returns. The outcome can still be highly uncertain — but that uncertainty is
              diversifiable and is not rewarded with a higher expected return under CAPM.
            </ExpandableQA>
            <ExpandableQA question="Every annual cash flow requires its own beta.">
              No. Multiple rates are useful only when economically meaningful risk differences can be
              identified. When cash flows arise from similar operations with stable risk, one rate is
              a reasonable approximation.
            </ExpandableQA>
            <ExpandableQA question="Once a rate is selected, it should never change.">
              No. New information, changed market conditions, or movement into a new project stage may
              justify updating the valuation. A successful trial changes both the probability of
              success and the project&apos;s remaining risk profile.
            </ExpandableQA>
            <ExpandableQA question="Construction risk is always diversifiable.">
              No. Its market exposure depends on financing conditions, input costs, labor
              availability, and the project&apos;s specific circumstances. A financing crisis or
              commodity-price spike can make construction risk partially systematic.
            </ExpandableQA>
            <ExpandableQA question="Using probability weighting and a high discount rate is always double counting.">
              Not always. It is double counting only when both adjustments compensate for the same
              underlying uncertainty. If the probability captures a binary success/failure outcome
              and the discount rate independently reflects the systematic risk of the resulting cash
              flows, both adjustments are appropriate.
            </ExpandableQA>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== 13. APPLIED PRACTICE ===================== */}
      <ConceptSection
        index="8.3.13"
        eyebrow="Section 13 · Applied practice"
        title="Four applied questions"
        intro="Test the framework on realistic situations. Explanatory feedback follows every answer."
      >
        <Reveal>
          <MasteryCheck
            passCount={3}
            onComplete={() => report()}
            continueLabel="Continue to Lesson 8.4"
            continueHref="/lessons/npv-rule"
            questions={QUESTIONS}
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== 14. FINAL TAKEAWAY ===================== */}
      <ConceptSection
        index="8.3.14"
        eyebrow="Section 14 · Final takeaway"
        title="Risk is not always constant within one investment"
        intro="The analytical sequence that ties the lesson together."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <div className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-slate-100">
              {[
                "Separate project stages",
                "Estimate possible cash flows",
                "Probability-weight outcomes",
                "Identify systematic risk",
                "Apply appropriate rates",
                "Update as uncertainty resolves",
              ].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-3 py-1.5 text-accent-amber">
                    {step}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="text-accent-amber" aria-hidden>→</span>
                  )}
                </span>
              ))}
            </div>
            <p className="ops-body mt-6 max-w-3xl text-[18px] leading-[1.6] text-white sm:text-[20px]">
              An investment does not necessarily have one permanent level of risk. As uncertainty
              resolves and the source of cash flow changes, the relevant valuation treatment may
              also change.
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
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
              Toward Lesson 8.4
            </div>
            <p className="ops-body mt-3 text-[18px] leading-[1.6] text-white">
              We now know how to estimate possible cash flows and match discount rates to their
              risks. The next lesson combines those pieces into the central value-creation measure:
              net present value.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Lesson 8.4"
          continueHref="/lessons/npv-rule"
        />
      </Reveal>

      <Reveal className="mt-8">
        <CBSourcePanel sources={LESSON_8_3_SOURCES} />
      </Reveal>
    </CBLayout>
  );
}
