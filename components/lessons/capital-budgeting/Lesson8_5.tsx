"use client";

import { cn } from "@/lib/utils";
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
import HighestReturnOpening from "./HighestReturnOpening";
import WhyShortcutsPersist from "./WhyShortcutsPersist";
import PaybackTimeline from "./PaybackTimeline";
import BasicVsDiscountedPayback from "./BasicVsDiscountedPayback";
import PaybackBlindSpot from "./PaybackBlindSpot";
import IRRBreakEvenRate from "./IRRBreakEvenRate";
import IRRVsNPVScale from "./IRRVsNPVScale";
import NPVProfileTimingComparison from "./NPVProfileTimingComparison";
import MultipleIRRProfile from "./MultipleIRRProfile";
import InvestmentOrFinancingIRR from "./InvestmentOrFinancingIRR";
import ProfitabilityIndexExplainer from "./ProfitabilityIndexExplainer";
import PIVsTotalValue from "./PIVsTotalValue";
import EPSAccretionVsAcquisitionValue from "./EPSAccretionVsAcquisitionValue";
import ROICVsCostOfCapital from "./ROICVsCostOfCapital";
import InvestmentMetricLens from "./InvestmentMetricLens";
import MetricContradictionInvestigator from "./MetricContradictionInvestigator";
import ManagementMetricClaims from "./ManagementMetricClaims";
import AlternativeMetricsInvestorWorkflow from "./AlternativeMetricsInvestorWorkflow";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CBLayout from "./CBLayout";
import CBSourcePanel from "./CBSourcePanel";
import { useReportCBComplete } from "@/lib/cb-progress";

const SUMMARY_POINTS = [
  "NPV anchors the economic decision; the other metrics are diagnostic tools.",
  "IRR, payback, PI, EPS, and ROIC each answer a narrower question than NPV.",
  "Payback measures speed of recovery but ignores time value and post-payback cash flows.",
  "IRR can misrank mutually exclusive investments due to scale and timing differences.",
  "Nonconventional cash flows can produce multiple or nonexistent IRRs.",
  "PI measures capital efficiency but can misrank projects of different scale.",
  "EPS accretion is an accounting result, not proof of economic value creation.",
  "ROIC is a backward-looking operating-performance measure, not a forward-looking NPV.",
  "Contradictions between metrics should trigger investigation, not mechanical selection.",
];

const LESSON_8_5_SOURCES = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo — capital-budgeting lectures: payback period, discounted payback, profitability index, IRR, conditions under which IRR and NPV agree, IRR scale and timing problems, multiple and nonexistent IRRs, and the conclusion that NPV is the primary economic decision rule.",
  "MIT 15.401 — the nuance that alternative metrics are not meaningless: they may reflect liquidity, forecasting uncertainty, capital scarcity, or organizational incentives. The error is allowing them to override NPV without understanding the trade-off.",
  "Applied extension: EPS accretion and ROIC as complementary public-equity metrics, NPV-profile analysis for timing conflicts, and the investor workflow for using all six metrics together.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt:
      "Two projects have the same two-year payback period. One produces substantial cash flows in Years 3–5; the other produces nothing. What does payback miss?",
    choices: [
      {
        id: "a",
        label: "Payback ignores all cash flows after the recovery date. The two projects look identical by payback but create very different amounts of value.",
      },
      { id: "b", label: "Payback overstates the value of the first project." },
      { id: "c", label: "Payback is correct because both projects recover capital in two years." },
    ],
    correctId: "a",
    hint: "Payback only counts cash flows up to the recovery date. Anything after — whether valuable inflows or costly obligations — is invisible to this metric.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "Project A has IRR 28% and NPV $1M. Project B has IRR 18% and NPV $25M. They are mutually exclusive. Which should be selected?",
    choices: [
      {
        id: "a",
        label: "Project B — for mutually exclusive investments, select the highest positive NPV. Project A has a higher IRR but creates far less value.",
      },
      { id: "b", label: "Project A — the higher IRR means a better project." },
      { id: "c", label: "Both — they both have positive NPV." },
    ],
    correctId: "a",
    hint: "IRR measures return per dollar, not total value created. $25M of NPV far exceeds $1M regardless of the percentage return.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "An acquisition is EPS accretive but has negative estimated NPV. Can both statements be true simultaneously?",
    choices: [
      {
        id: "a",
        label: "Yes. EPS accretion can arise from financing structure or accounting treatment even when the buyer paid more than the acquired value was worth. EPS answers an accounting question; NPV answers an economic question.",
      },
      { id: "b", label: "No — if EPS rises, the acquisition must create value." },
      { id: "c", label: "No — NPV and EPS always agree." },
    ],
    correctId: "a",
    hint: "EPS accretion and value creation measure different things. They can easily diverge.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "A project has positive NPV ($20M) but an eight-year payback period. What should the investor investigate?",
    choices: [
      {
        id: "a",
        label: "Test the distant cash-flow assumptions and the company's liquidity exposure. A long payback means the NPV depends heavily on forecasts years away.",
      },
      { id: "b", label: "Reject the project because the payback is too long." },
      { id: "c", label: "Accept immediately because NPV is positive — no further analysis needed." },
    ],
    correctId: "a",
    hint: "Positive NPV with long payback is not automatically wrong, but it requires scrutiny of the assumptions producing that NPV and the liquidity commitment.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "Project A has PI 1.4 and NPV $2M. Project B has PI 1.2 and NPV $30M. They are mutually exclusive. Which metric should anchor the decision?",
    choices: [
      {
        id: "a",
        label: "NPV should anchor the decision. Project B creates $30M vs $2M. PI measures efficiency but can misrank mutually exclusive projects of different scale.",
      },
      { id: "b", label: "PI should anchor — Project A is more efficient per dollar." },
      { id: "c", label: "Either metric works — they produce the same ranking." },
    ],
    correctId: "a",
    hint: "PI is useful for capital efficiency but does not measure total value. For mutually exclusive projects, NPV is the primary decision rule.",
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
          If NPV measures value creation, what information do IRR, payback, profitability index, EPS
          accretion, and ROIC provide — and when can those measures lead to the wrong decision?
        </p>
      </div>
    </Reveal>
  );
}

export default function Lesson8_5() {
  const report = useReportCBComplete("irr-and-payback");

  return (
    <CBLayout>
      <PVHero
        index="8.5"
        eyebrow="Lesson 8.5 · Module 8 — Capital Budgeting"
        heading="Useful Shortcuts, Wrong Decisions"
        subheading="IRR, payback, profitability index, EPS accretion, and ROIC each answer a narrower question than NPV. Learn what each reveals, what it omits, and when it can lead to the wrong decision."
        bullets={[
          "The highest return is not the best investment",
          "Payback and discounted payback — and what they miss",
          "IRR: when it agrees with NPV and when it does not",
          "Multiple IRRs, scale conflicts, and timing problems",
          "Profitability index, EPS accretion, and ROIC as diagnostic tools",
          "One investment evaluated through all six metrics",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== 1. OPENING ===================== */}
      <ConceptSection
        index="8.5.1"
        eyebrow="Section 1 · The highest return is not the best investment"
        title="A return percentage does not measure total value"
        intro={<>Two mutually exclusive projects: one has 30% return on $1M, the other has 20% return on $100M. Which looks better?</>}
      >
        <Reveal><InteractiveFrame><HighestReturnOpening /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 2. WHY SHORTCUTS PERSIST ===================== */}
      <ConceptSection
        index="8.5.2"
        eyebrow="Section 2 · Why companies use shortcuts"
        title="Alternative metrics are popular because they summarize real concerns"
        intro="The problem is not that these measures contain no information. The problem is treating one narrow measure as if it answers the entire investment decision."
      >
        <Reveal><InteractiveFrame><WhyShortcutsPersist /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 3. PAYBACK PERIOD ===================== */}
      <ConceptSection
        index="8.5.3"
        eyebrow="Section 3 · Payback period"
        title="How quickly is capital recovered?"
        intro="The payback period is the time required for cumulative cash inflows to recover the initial investment."
      >
        <Reveal><InteractiveFrame><PaybackTimeline /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 4. WHAT PAYBACK REVEALS ===================== */}
      <ConceptSection
        index="8.5.4"
        eyebrow="Section 4 · What payback reveals"
        title="Legitimate uses of a narrow measure"
        intro="Payback answers a specific question: how long is the company's capital exposed before the forecast cash inflows recover the initial commitment?"
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-green">Payback reveals</div>
              <ul className="mt-3 space-y-2">
                {["Liquidity exposure", "Speed of capital recovery", "Dependence on distant forecasts", "Risk of obsolescence before recovery", "Flexibility to reinvest recovered cash"].map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[14px] leading-[1.55] text-slate-100">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />{x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-red">Payback does not reveal</div>
              <ul className="mt-3 space-y-2">
                {["How much value the project creates", "Cash flows after the recovery date", "The time value of money (without discounting)", "Risk-adjusted return", "Total economic benefit"].map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[14px] leading-[1.55] text-slate-100">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />{x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== 5. PAYBACK PROBLEM 1 ===================== */}
      <ConceptSection
        index="8.5.5"
        eyebrow="Section 5 · Payback problem 1: ignoring time value"
        title="Basic vs. discounted payback"
        intro="Two projects recover $100 by Year 2. But one receives cash sooner. Basic payback treats them as equivalent; discounted payback corrects the timing."
      >
        <Reveal><InteractiveFrame><BasicVsDiscountedPayback /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 6. PAYBACK PROBLEM 2 ===================== */}
      <ConceptSection
        index="8.5.6"
        eyebrow="Section 6 · Payback problem 2: ignoring post-payback cash flows"
        title="The blind spot after recovery"
        intro="Projects with identical payback can create very different value. Payback can ignore both valuable later inflows and costly later obligations."
      >
        <Reveal><InteractiveFrame><PaybackBlindSpot /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 7. IRR DEFINITION ===================== */}
      <ConceptSection
        index="8.5.7"
        eyebrow="Section 7 · IRR: definition and interpretation"
        title="The break-even discount rate"
        intro="IRR is the discount rate that makes a project's NPV equal to zero. It is an internal property of the cash flows."
      >
        <Reveal>
          <FormulaExplainer
            label="IRR definition"
            tone="amber"
            formula={String.raw`0 = -CF_0 + \frac{CF_1}{1+IRR} + \frac{CF_2}{(1+IRR)^2} + \cdots + \frac{CF_T}{(1+IRR)^T}`}
            meaning="IRR is the discount rate at which the present value of expected future cash flows exactly equals the initial investment."
            interpretation="IRR is determined entirely by the project's own cash-flow pattern. The required return (opportunity cost of capital) is a separate, externally determined benchmark."
          />
        </Reveal>
        <Reveal><InteractiveFrame><IRRBreakEvenRate /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 8. WHEN IRR AND NPV AGREE ===================== */}
      <ConceptSection
        index="8.5.8"
        eyebrow="Section 8 · When IRR and NPV agree"
        title="IRR is not inherently wrong"
        intro="For conventional independent projects, IRR and NPV usually point in the same direction."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5 sm:p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-green">
              Conditions for agreement
            </div>
            <ul className="mt-3 space-y-2">
              {[
                "One initial cash outflow",
                "Positive later inflows only",
                "One independent project",
                "One economically meaningful IRR",
                "Required return is appropriate for the project",
                "Decision rule: accept if IRR exceeds the required return",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2.5 text-[15px] leading-[1.6] text-slate-100">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />{x}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <Feedback status="info">
            IRR becomes unreliable as a universal ranking rule when projects differ in scale, timing,
            sign pattern, or financing structure. For a simple conventional independent project, IRR
            and NPV agree: IRR above the required return is equivalent to positive NPV.
          </Feedback>
        </Reveal>
      </ConceptSection>

      {/* ===================== 9. IRR SCALE PROBLEM ===================== */}
      <ConceptSection
        index="8.5.9"
        eyebrow="Section 9 · IRR problem 1: scale"
        title="Return per dollar vs. total dollars created"
        intro="IRR tells us return per dollar. NPV tells us total dollars of value created."
      >
        <Reveal><InteractiveFrame><IRRVsNPVScale /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 10. IRR TIMING PROBLEM ===================== */}
      <ConceptSection
        index="8.5.10"
        eyebrow="Section 10 · IRR problem 2: cash-flow timing"
        title="The NPV profile and the crossover rate"
        intro="Two equal-cost projects can rank differently depending on the discount rate. Higher discount rates favor earlier cash flows."
      >
        <Reveal><InteractiveFrame><NPVProfileTimingComparison /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 11. MULTIPLE IRRs ===================== */}
      <ConceptSection
        index="8.5.11"
        eyebrow="Section 11 · IRR problem 3: multiple or nonexistent IRRs"
        title="When 'one project, one return' breaks down"
        intro="Nonconventional cash flows — where signs change more than once — can produce multiple IRRs or no economically meaningful IRR at all."
      >
        <Reveal><InteractiveFrame><MultipleIRRProfile /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 12. INVESTMENT VS FINANCING ===================== */}
      <ConceptSection
        index="8.5.12"
        eyebrow="Section 12 · IRR problem 4: investment vs. financing"
        title="'Higher IRR is better' is not a universal rule"
        intro="The interpretation of IRR depends on the direction of the cash flows."
      >
        <Reveal><InteractiveFrame><InvestmentOrFinancingIRR /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 13. PROFITABILITY INDEX ===================== */}
      <ConceptSection
        index="8.5.13"
        eyebrow="Section 13 · Profitability index"
        title="Value per dollar invested"
        intro="PI measures capital efficiency: how much present value is produced per dollar committed."
      >
        <Reveal>
          <FormulaExplainer
            label="Profitability index"
            tone="cyan"
            formula={String.raw`PI = \frac{\text{PV of future cash inflows}}{\text{Initial investment}}`}
            meaning="Each dollar invested produces this much present value. PI above 1 generally corresponds to positive NPV for a conventional independent project."
            interpretation="PI is useful when considering how much present value is created per dollar committed — especially under capital constraints."
          />
        </Reveal>
        <Reveal><InteractiveFrame><ProfitabilityIndexExplainer /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 14. PI AND SCALE ===================== */}
      <ConceptSection
        index="8.5.14"
        eyebrow="Section 14 · Profitability index and scale"
        title="Efficient per dollar is not the same as most value"
        intro="PI measures efficiency but can misrank mutually exclusive projects of different scale."
      >
        <Reveal><InteractiveFrame><PIVsTotalValue /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 15. EPS ACCRETION ===================== */}
      <ConceptSection
        index="8.5.15"
        eyebrow="Section 15 · EPS accretion"
        title="Accounting result, not economic proof"
        intro="An acquisition is EPS accretive when post-transaction EPS exceeds pre-transaction EPS. But EPS accretion does not prove value creation."
      >
        <Reveal>
          <DefinitionCard term="EPS accretion">
            An acquisition is EPS accretive when expected post-transaction earnings per share exceed
            the buyer&apos;s pre-transaction EPS. This is an accounting result. It can arise from
            debt financing, multiple differences, share-issuance effects, or near-term earnings —
            none of which determine whether the purchase price was economically attractive.
          </DefinitionCard>
        </Reveal>
        <Reveal><InteractiveFrame><EPSAccretionVsAcquisitionValue /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 16. ROIC ===================== */}
      <ConceptSection
        index="8.5.16"
        eyebrow="Section 16 · ROIC"
        title="Realized capital efficiency, not forward-looking NPV"
        intro="ROIC measures operating return relative to invested capital. It is useful for evaluating realized performance — but it is not identical to a project's forward-looking NPV."
      >
        <Reveal>
          <FormulaExplainer
            label="ROIC (simplified)"
            tone="green"
            formula={String.raw`ROIC = \frac{\text{After-tax operating profit}}{\text{Invested capital}}`}
            meaning="ROIC compares the operating profit a company generates with the capital committed to its operations."
            interpretation="ROIC above the cost of capital is generally consistent with value creation; ROIC below suggests inadequate returns. But ROIC is an accounting snapshot that does not capture full cash-flow timing or provide a dollar value estimate."
          />
        </Reveal>
        <Reveal><InteractiveFrame><ROICVsCostOfCapital /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 17. ONE INVESTMENT, SIX METRICS ===================== */}
      <ConceptSection
        index="8.5.17"
        eyebrow="Section 17 · One investment, six metrics"
        title="The practical center of the lesson"
        intro="Evaluate one restaurant expansion program through all six metric lenses. Each answers a different question."
      >
        <Reveal><InteractiveFrame><InvestmentMetricLens /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 18. HOW TO USE METRICS TOGETHER ===================== */}
      <ConceptSection
        index="8.5.18"
        eyebrow="Section 18 · How to use the metrics together"
        title="Anchor in NPV, diagnose with the rest"
        intro="Step 1: anchor the decision in NPV. Step 2: use supplementary metrics diagnostically. Step 3: investigate contradictions."
      >
        <Reveal><InteractiveFrame><MetricContradictionInvestigator /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 19. MANAGEMENT INCENTIVES ===================== */}
      <ConceptSection
        index="8.5.19"
        eyebrow="Section 19 · Management incentives and selective metrics"
        title="Why was this metric selected?"
        intro="Management may emphasize the measure that presents a decision most favorably. The investor should ask what it leaves out."
      >
        <Reveal><InteractiveFrame><ManagementMetricClaims /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 20. INVESTOR WORKFLOW ===================== */}
      <ConceptSection
        index="8.5.20"
        eyebrow="Section 20 · Investor workflow"
        title="One connected process"
        intro="Estimate cash flows, anchor in NPV, diagnose with supplementary metrics, monitor results, and never let one favorable metric substitute for the full analysis."
      >
        <Reveal><InteractiveFrame><AlternativeMetricsInvestorWorkflow /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* ===================== 21. MISCONCEPTION CHECKS ===================== */}
      <ConceptSection
        index="8.5.21"
        eyebrow="Section 21 · Misconception checks"
        title="Common mistakes about alternative metrics"
        intro="Each card corrects a frequent error."
      >
        <Reveal>
          <div className="space-y-2.5">
            <ExpandableQA question="IRR is wrong.">
              No. IRR often agrees with NPV for simple conventional independent projects. It is
              unreliable as a universal ranking rule when projects differ in scale, timing, sign
              pattern, or financing structure.
            </ExpandableQA>
            <ExpandableQA question="The highest IRR is always the best project.">
              No. A lower-IRR project may create far more total value because of scale. For mutually
              exclusive investments, select the highest positive NPV.
            </ExpandableQA>
            <ExpandableQA question="A short payback proves value creation.">
              No. Payback may ignore timing and post-payback cash flows. A project can recover capital
              quickly and still destroy value if later costs are large or the time value of money is
              significant.
            </ExpandableQA>
            <ExpandableQA question="Discounted payback completely fixes payback.">
              No. Discounted payback corrects for the time value of money but still ignores cash flows
              after the recovery date.
            </ExpandableQA>
            <ExpandableQA question="PI above 1 means the project creates value.">
              For a conventional independent project, PI above 1 generally corresponds to positive NPV.
              But PI can still misrank mutually exclusive projects of different scale.
            </ExpandableQA>
            <ExpandableQA question="EPS accretion proves an acquisition is attractive.">
              No. EPS accretion does not determine whether the purchase price exceeds economic value.
              It is an accounting result that can arise from financing effects even when value is
              destroyed.
            </ExpandableQA>
            <ExpandableQA question="ROIC above cost of capital proves every project succeeded.">
              No. Aggregate accounting measures may conceal project differences and cash-flow timing.
              Strong company-level ROIC can coexist with weak marginal investments.
            </ExpandableQA>
            <ExpandableQA question="NPV means all other metrics should be ignored.">
              No. Other metrics reveal information about liquidity, timing, percentage return, accounting
              effects, and realized capital efficiency. They should be used as diagnostic tools
              anchored by NPV.
            </ExpandableQA>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== 22. APPLIED PRACTICE ===================== */}
      <ConceptSection
        index="8.5.22"
        eyebrow="Section 22 · Applied practice"
        title="Five applied questions"
        intro="Test the framework. Explanatory feedback follows every answer."
      >
        <Reveal>
          <MasteryCheck
            passCount={4}
            onComplete={() => report()}
            continueLabel="Continue to Lesson 8.6"
            continueHref="/lessons/project-cash-flows"
            questions={QUESTIONS}
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== 23. FINAL TAKEAWAY ===================== */}
      <ConceptSection
        index="8.5.23"
        eyebrow="Section 23 · Final takeaway"
        title="The metric map"
        intro="Each metric answers a different question. NPV should anchor the economic decision."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { m: "NPV", q: "Total value created", tone: "amber" },
                { m: "IRR", q: "Percentage return", tone: "cyan" },
                { m: "Payback", q: "Speed of capital recovery", tone: "green" },
                { m: "PI", q: "Value per dollar invested", tone: "purple" },
                { m: "EPS", q: "Accounting earnings impact", tone: "red" },
                { m: "ROIC", q: "Return on deployed capital", tone: "slate" },
              ].map((x) => (
                <div key={x.m} className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
                  <div className={cn("font-mono text-[11px] uppercase tracking-[0.16em]",
                    x.tone === "amber" ? "text-accent-amber"
                    : x.tone === "cyan" ? "text-accent-cyan"
                    : x.tone === "green" ? "text-accent-green"
                    : x.tone === "purple" ? "text-accent-purple"
                    : x.tone === "red" ? "text-accent-red" : "text-white"
                  )}>{x.m}</div>
                  <div className="mt-1 text-[14px] text-slate-100">→ {x.q}</div>
                </div>
              ))}
            </div>
            <p className="ops-body mt-6 max-w-3xl text-[18px] leading-[1.6] text-white sm:text-[20px]">
              Different metrics answer different questions. NPV should anchor the economic decision,
              while the other measures help investors diagnose timing, liquidity, scale, capital
              efficiency, accounting effects, and operating execution.
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
              Toward Lesson 8.6
            </div>
            <p className="ops-body mt-3 text-[18px] leading-[1.6] text-white">
              Evaluating one investment is only part of the task. Investors must also examine the
              company&apos;s full capital-allocation record: where management directs cash, what
              alternatives it rejects, and whether its decisions create shareholder value over time.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Lesson 8.6"
          continueHref="/lessons/project-cash-flows"
        />
      </Reveal>

      <Reveal className="mt-8">
        <CBSourcePanel sources={LESSON_8_5_SOURCES} />
      </Reveal>
    </CBLayout>
  );
}
