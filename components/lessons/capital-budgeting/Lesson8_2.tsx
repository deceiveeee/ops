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
import TextbookVsInvestorReality from "./TextbookVsInvestorReality";
import ProjectTranslationMap from "./ProjectTranslationMap";
import CorporateDisclosureMap from "./CorporateDisclosureMap";
import ProjectVisibilityClassifier from "./ProjectVisibilityClassifier";
import RestaurantInvestmentReconstruction from "./RestaurantInvestmentReconstruction";
import CompanyRateVsProjectRate from "./CompanyRateVsProjectRate";
import PurePlayComparableSelector from "./PurePlayComparableSelector";
import ProjectScenarioExplorer from "./ProjectScenarioExplorer";
import ForecastVsActualTracker from "./ForecastVsActualTracker";
import InvestorProjectWorkflow from "./InvestorProjectWorkflow";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CBLayout from "./CBLayout";
import CBSourcePanel from "./CBSourcePanel";
import { useReportCBComplete } from "@/lib/cb-progress";

const LEARNING_OBJECTIVES = [
  "Distinguish a textbook project model from the incomplete information public investors actually receive.",
  "Identify the major uses of corporate capital from filings, earnings calls, presentations, and transaction announcements.",
  "Classify an investment's level of disclosure visibility and choose the appropriate depth of analysis.",
  "Reconstruct an illustrative incremental cash-flow estimate, separating known facts from investor assumptions.",
  "Explain why the project-specific discount rate may differ from the parent company's historical rate.",
  "Apply the pure-play comparable method to construct a reasonable discount-rate range.",
  "Use scenario and break-even analysis to identify value-driving assumptions.",
  "Distinguish execution, operating, financial, and strategic performance when monitoring a project.",
  "Recognize that revenue growth or EPS accretion alone is not proof of value creation.",
];

const SUMMARY_POINTS = [
  "A 'project' is any identifiable use of corporate capital intended to generate future cash flows.",
  "Public investors work with incomplete information and reconstruct economics from multiple disclosures.",
  "Exact project NPV is often impossible to calculate externally — ranges and break-even analysis are more defensible.",
  "The discount rate should match the systematic risk of the investment, not automatically the parent company's rate.",
  "Revenue or EPS growth can coexist with value destruction if capital returns are inadequate.",
  "Evaluating management means comparing original claims with subsequent execution, cash flow, and returns on invested capital.",
];

const LESSON_8_2_SOURCES = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo — capital-budgeting lectures: the project discount rate should match the investment's own systematic risk, the project beta matters (not automatically the company beta), and cash flow (not accounting earnings) is the relevant input.",
  "MIT 15.401 — the pure-play comparable principle: a focused company in the same business activity provides more relevant risk evidence than a diversified conglomerate.",
  "Applied framework: SEC filings (10-K, 10-Q, 8-K), MD&A, segment disclosures, earnings-call transcripts, and investor presentations as the practical sources from which outside investors reconstruct corporate-investment economics.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt:
      "A retailer announces 200 new stores but discloses only total capital-expenditure guidance. Which additional information would an investor most need to estimate whether the program creates value?",
    choices: [
      {
        id: "a",
        label:
          "Average development cost per store, expected sales ramp, mature sales, store-level margin, maintenance capex, and expected closure rate",
      },
      {
        id: "b",
        label: "The company's total revenue and net income for the prior year",
      },
      {
        id: "c",
        label: "The CEO's compensation and the board's composition",
      },
    ],
    correctId: "a",
    hint: "Unit economics — cost per store, ramp, mature sales, margin, maintenance, and closures — are what drive the incremental cash flows. Aggregate company financials do not isolate the program's economics.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "A stable utility company (beta ≈ 0.5) launches a speculative technology division (comparable-company beta ≈ 1.6). Why might the utility's historical beta be inappropriate for discounting the new division's cash flows?",
    choices: [
      {
        id: "a",
        label:
          "The new division's systematic risk resembles its comparable businesses, not the regulated utility. Using the utility's beta would understate the required return and overstate the division's NPV.",
      },
      {
        id: "b",
        label: "The utility's beta is always the correct rate because the parent company commits the capital.",
      },
      {
        id: "c",
        label: "Beta does not matter for divisions of the same company.",
      },
    ],
    correctId: "a",
    hint: "Ownership by the same parent does not make the cash flows economically identical. The discount rate must match the systematic risk of the investment's own cash flows.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "An acquisition increases the buyer's EPS but produces an ROIC below its cost of capital in every year after closing. Did the transaction necessarily create value?",
    choices: [
      {
        id: "a",
        label:
          "No — EPS accretion can arise from financing structure and reduced share count while the acquired cash flows and synergies are worth less than the price paid. Value creation requires returns above the cost of capital.",
      },
      {
        id: "b",
        label: "Yes — higher EPS is the definition of value creation in an acquisition.",
      },
      {
        id: "c",
        label: "It cannot be determined from ROIC alone.",
      },
    ],
    correctId: "a",
    hint: "EPS accretion is an accounting effect, not an economic one. ROIC below the cost of capital indicates the capital committed is not earning what investors require.",
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
          Public companies rarely hand investors a project model. How can an outside investor
          identify a company&apos;s major uses of capital, estimate whether they are likely to
          create value, and evaluate their performance over time?
        </p>
      </div>
    </Reveal>
  );
}

function SecondaryExamples() {
  const examples = [
    {
      title: "Semiconductor fabrication plant",
      tone: "cyan" as const,
      metrics: [
        "Capital committed and construction timing",
        "Production capacity and manufacturing yield",
        "Utilization and unit selling prices",
        "Technological obsolescence risk",
        "Incremental free cash flow vs. total spending",
      ],
    },
    {
      title: "Pharmaceutical drug program",
      tone: "green" as const,
      metrics: [
        "Development-stage milestones and trial results",
        "Regulatory progress toward approval",
        "Remaining development cost",
        "Probability of approval (rNPV reasoning)",
        "Commercial sales trajectory and patent life",
      ],
    },
    {
      title: "Acquisition",
      tone: "amber" as const,
      metrics: [
        "Purchase price and premium paid",
        "Cost and revenue synergies realized",
        "Integration costs and customer retention",
        "Margin movement and debt burden",
        "Post-acquisition ROIC vs. cost of capital",
        "Goodwill impairment signals",
      ],
    },
  ];

  const toneBorder: Record<string, string> = {
    cyan: "border-accent-cyan/25",
    green: "border-accent-green/25",
    amber: "border-accent-amber/25",
  };
  const toneText: Record<string, string> = {
    cyan: "text-accent-cyan",
    green: "text-accent-green",
    amber: "text-accent-amber",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {examples.map((ex) => (
          <div key={ex.title} className={`rounded-2xl border bg-white/[0.03] p-5 ${toneBorder[ex.tone]}`}>
            <div className={`font-sans text-[11px] uppercase tracking-[0.16em] ${toneText[ex.tone]}`}>
              {ex.title}
            </div>
            <ul className="mt-3 space-y-2">
              {ex.metrics.map((m) => (
                <li key={m} className="flex items-start gap-2 text-[14px] leading-[1.55] text-slate-200">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-white/40" aria-hidden />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          A project can succeed operationally while failing financially. A factory can be built on
          schedule but earn inadequate returns. An acquisition can increase earnings while
          destroying value because the buyer paid too much. The operating metrics differ by
          investment type, but the economic test is the same: do the incremental cash flows, discounted
          at a risk-appropriate rate, exceed the capital committed?
        </p>
      </div>
    </div>
  );
}

export default function Lesson8_2() {
  const report = useReportCBComplete("determining-the-discount-rate");

  return (
    <CBLayout>
      <PVHero
        index="8.2"
        eyebrow="Lesson 8.2 · Module 8 — Capital Budgeting"
        heading="How Investors Identify and Evaluate Corporate Investments"
        subheading="Public companies rarely publish a project NPV. Investors reconstruct major uses of capital from filings, calls, and presentations, estimate reasonable ranges, and track results against management's claims."
        bullets={[
          "Textbook projects vs. public-company reality",
          "Where investors find the information",
          "A restaurant-expansion worked case",
          "Project-specific discount rates and pure-play comparables",
          "Scenario analysis, break-even, and forecast-vs-actual monitoring",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== 1. TEXTBOOK VS REALITY ===================== */}
      <ConceptSection
        index="8.2.1"
        eyebrow="Section 1 · Textbook projects vs. real companies"
        title="The model is clean. The reality is not."
        intro={<>Begin with the gap between the capital-budgeting model and the information public investors actually receive.</>}
      >
        <Reveal>
          <InteractiveFrame>
            <TextbookVsInvestorReality />
          </InteractiveFrame>
        </Reveal>
        <Reveal>
          <DefinitionCard term="Corporate 'project'">
            An identifiable use of capital intended to generate future cash flows or strategic
            benefits — a store, a factory, an acquisition, a drug program, a data center, a
            product platform, or a geographic expansion.
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* ===================== 2. WHAT COUNTS AS A PROJECT ===================== */}
      <ConceptSection
        index="8.2.2"
        eyebrow="Section 2 · What counts as a corporate 'project'?"
        title="Translating textbook terms into real disclosures"
        intro="The textbook terms are universal. What changes is which operating metrics carry the economic information."
      >
        <Reveal>
          <InteractiveFrame>
            <ProjectTranslationMap />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 3. WHERE INVESTORS FIND INFORMATION ===================== */}
      <ConceptSection
        index="8.2.3"
        eyebrow="Section 3 · Where investors find the information"
        title="Assembling the analysis from multiple disclosures"
        intro="No single source usually contains the full answer. Select an investor question to see which disclosures are most likely to help — and where each one falls short."
      >
        <Reveal>
          <InteractiveFrame>
            <CorporateDisclosureMap />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 4. THREE LEVELS OF VISIBILITY ===================== */}
      <ConceptSection
        index="8.2.4"
        eyebrow="Section 4 · Three levels of project visibility"
        title="Not every investment can be analyzed with equal precision"
        intro="The appropriate level of analysis depends on the quality and granularity of the disclosure. Classify each announcement before deciding how deep to go."
      >
        <Reveal>
          <InteractiveFrame>
            <ProjectVisibilityClassifier />
          </InteractiveFrame>
        </Reveal>
        <Reveal>
          <Panel>
            <p className="text-[17px] leading-[1.7] text-slate-200">
              Project-level NPV is not always possible. For Level 3 investments, the investor
              falls back to <span className="text-white">aggregate R&D or capex, margin
              progression, free cash flow, company-level ROIC, and management credibility</span>{" "}
              — and watches whether the company&apos;s overall capital allocation creates value over
              time.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      {/* ===================== 5. RESTAURANT EXPANSION CASE ===================== */}
      <ConceptSection
        index="8.2.5"
        eyebrow="Section 5 · Primary case — restaurant expansion"
        title="Reconstructing the economics of 100 new stores"
        intro={<>A restaurant company announces plans to open 100 new locations. What do we know, and what is still missing?</>}
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5 sm:p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-green">
                Known (management-provided)
              </div>
              <ul className="mt-3 space-y-2">
                {[
                  "Planned number of openings (100)",
                  "Stated construction cost per store ($1.2M)",
                  "Mature annual sales target ($2.5M)",
                  "Store-level margin target (20%)",
                  "Maturation period (3 years)",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-100">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5 sm:p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
                Still missing (investor must estimate)
              </div>
              <ul className="mt-3 space-y-2">
                {[
                  "Pre-opening expenses and ramp-up losses",
                  "Taxes and maintenance capital expenditure",
                  "Working capital and lease commitments",
                  "Closures and cannibalization",
                  "Corporate overhead, inflation, and execution delays",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-100">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <RestaurantInvestmentReconstruction />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 6. PROJECT-SPECIFIC RISK ===================== */}
      <ConceptSection
        index="8.2.6"
        eyebrow="Section 6 · Project-specific risk in practice"
        title="Should every investment use the company's discount rate?"
        intro="Connect back to Lesson 8.1. The discount rate must match the systematic risk of the investment's cash flows — not automatically the parent company's historical rate."
      >
        <Reveal>
          <FormulaExplainer
            label="The project-specific discount-rate principle"
            tone="amber"
            formula={String.raw`r_{\text{project}} = R_f + \beta_{\text{project}}\bigl(E[R_M] - R_f\bigr)`}
            meaning="The relevant beta is the project's beta — the systematic risk of the activity generating the cash flows — not necessarily the parent company's beta."
            variables={[
              { symbol: String.raw`\beta_{\text{project}}`, description: "The systematic risk of the project's own cash-flow activity." },
              { symbol: String.raw`R_f`, description: "Risk-free rate (compensation for time)." },
              { symbol: String.raw`E[R_M] - R_f`, description: "Market risk premium (compensation for systematic risk)." },
            ]}
            interpretation="Ownership by the same parent does not make two cash-flow streams economically identical. A core restaurant expansion, a biotech subsidiary, and a foreign mining venture carry different systematic risks even if undertaken by the same company."
          />
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <CompanyRateVsProjectRate />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 7. PURE-PLAY COMPARABLES ===================== */}
      <ConceptSection
        index="8.2.7"
        eyebrow="Section 7 · How investors estimate project risk"
        title="The pure-play comparable method"
        intro="In practice the project beta is estimated from focused public companies engaged in the same activity. Their betas are evidence, not exact truth."
      >
        <Reveal>
          <DefinitionCard term="Pure play">
            A company whose value is primarily generated by the same business activity as the
            project being evaluated. Its beta reflects the systematic risk of that activity
            directly, rather than a blend of unrelated divisions.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <PurePlayComparableSelector />
          </InteractiveFrame>
        </Reveal>
        <Reveal>
          <Feedback status="info">
            Formal asset-beta unlevering and relevering adjust for differences in capital
            structure between the comparable and the project. Those refinements matter in
            advanced work, but the core principle — find a focused company in the same business
            activity — does not depend on them. The investor uses the comparable&apos;s beta to
            construct a <span className="text-white">range</span> and tests whether the
            investment conclusion survives across it.
          </Feedback>
        </Reveal>
      </ConceptSection>

      {/* ===================== 8. SCENARIO ANALYSIS ===================== */}
      <ConceptSection
        index="8.2.8"
        eyebrow="Section 8 · Use ranges and scenarios, not false precision"
        title="Bear, base, and bull — and the break-even in between"
        intro="The purpose of scenario analysis is not to guess one perfectly accurate number. It is to identify which assumptions determine whether the investment creates value."
      >
        <Reveal>
          <InteractiveFrame>
            <ProjectScenarioExplorer />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 9. FORECASTING VS MONITORING ===================== */}
      <ConceptSection
        index="8.2.9"
        eyebrow="Section 9 · Forecasting vs. monitoring"
        title="Evaluating the project before and after capital is committed"
        intro="Investors evaluate both the ex-ante case and the ex-post results. Execution, operating, financial, and strategic performance are separate dimensions."
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400">Before / during</th>
                  <th className="py-3 font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400">After</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                <tr className="border-b border-white/5">
                  <td className="py-2.5 pr-8">What is management spending?</td>
                  <td className="py-2.5">Was it completed on time and on budget?</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 pr-8">What operating assumptions support the investment?</td>
                  <td className="py-2.5">Did sales, utilization, and margins meet expectations?</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 pr-8">Are those assumptions plausible?</td>
                  <td className="py-2.5">Did incremental cash flow materialize?</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 pr-8">What must be true for NPV to stay positive?</td>
                  <td className="py-2.5">Was ROIC above the cost of capital?</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-8">Is the discount rate appropriate?</td>
                  <td className="py-2.5">Did management maintain, revise, or quietly abandon its targets?</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <ForecastVsActualTracker />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 10. SECONDARY EXAMPLES ===================== */}
      <ConceptSection
        index="8.2.10"
        eyebrow="Section 10 · Compact secondary examples"
        title="Different investments, different operating metrics"
        intro="The restaurant case is the primary worked example. Three compact cases show how the same framework adapts to other investment types."
      >
        <Reveal>
          <SecondaryExamples />
        </Reveal>
      </ConceptSection>

      {/* ===================== 11. INVESTOR WORKFLOW ===================== */}
      <ConceptSection
        index="8.2.11"
        eyebrow="Section 11 · The investor workflow"
        title="A connected process, not ten disconnected cards"
        intro="The analytical steps form a loop: identify, estimate, decide, and monitor — with monitoring feeding back into the next round of identification."
      >
        <Reveal>
          <InteractiveFrame>
            <InvestorProjectWorkflow />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 12. MISCONCEPTION CHECKS ===================== */}
      <ConceptSection
        index="8.2.12"
        eyebrow="Section 12 · Misconception checks"
        title="Common mistakes in evaluating corporate investments"
        intro="Each card corrects a frequent error. Expand any question to see the reasoning."
      >
        <Reveal>
          <div className="space-y-2.5">
            <ExpandableQA question="Do public companies disclose the NPV of every investment?">
              Usually not. Investors reconstruct the economics using available disclosures and
              their own assumptions. A range is generally more defensible than a falsely precise
              single estimate.
            </ExpandableQA>
            <ExpandableQA question="Can an investor calculate an exact project value?">
              Rarely. The available disclosures rarely specify every cash flow, every risk, and
              the project beta. Investors build reasonable ranges and identify the assumptions that
              drive the conclusion, rather than aiming for false precision.
            </ExpandableQA>
            <ExpandableQA question="Is higher revenue proof that the project created value?">
              No. Revenue growth may require excessive capital or produce inadequate cash returns.
              A company can grow revenue while destroying value if the incremental capital it
              commits earns less than its cost of capital.
            </ExpandableQA>
            <ExpandableQA question="Is higher EPS proof that an acquisition created value?">
              No. EPS can rise because the buyer financed the deal with cheap debt, because fewer
              shares share the combined earnings, or because of accounting effects — even when the
              buyer paid more than the acquired cash flows and synergies were worth. Value creation
              requires the acquired cash flows, discounted appropriately, to exceed the price paid.
            </ExpandableQA>
            <ExpandableQA question="Does finishing a factory on time mean the project succeeded?">
              It demonstrates <em>execution</em> success. Financial success also depends on
              utilization, pricing, margins, and cash returns over the asset&apos;s life. A factory
              built on schedule can still earn inadequate returns if demand, yields, or prices fall
              short.
            </ExpandableQA>
            <ExpandableQA question="Should every company investment use the company's historical discount rate?">
              No. The appropriate rate should reflect the risk of the investment&apos;s cash flows.
              A new activity with different systematic risk deserves a different rate, estimated
              from comparable businesses rather than borrowed uncritically from the parent.
            </ExpandableQA>
            <ExpandableQA question="Does more uncertainty always require a higher CAPM discount rate?">
              Not necessarily. CAPM compensates investors for <em>systematic</em> risk —
              covariance with the market — not for every diversifiable source of uncertainty. A
              project can carry high total uncertainty but low systematic risk, or vice versa.
              Adding a subjective &ldquo;uncertainty premium&rdquo; on top of the CAPM rate is a
              common error.
            </ExpandableQA>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== 13. SHORT PRACTICE ===================== */}
      <ConceptSection
        index="8.2.13"
        eyebrow="Section 13 · Short practice"
        title="Three applied questions"
        intro="Test the framework on realistic situations. Explanatory feedback follows every answer."
      >
        <Reveal>
          <MasteryCheck
            passCount={2}
            onComplete={() => report()}
            continueLabel="Continue to Lesson 8.3"
            continueHref="/lessons/when-risk-changes-over-time"
            questions={QUESTIONS}
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== 14. FINAL TAKEAWAY ===================== */}
      <ConceptSection
        index="8.2.14"
        eyebrow="Section 14 · Final takeaway"
        title="From textbook capital budgeting to investor analysis"
        intro="The discipline of capital budgeting still applies. In public-equity practice it is implemented through disclosure reconstruction, comparable businesses, scenario analysis, and ongoing monitoring."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <p className="ops-body max-w-3xl text-[18px] leading-[1.6] text-white sm:text-[20px]">
              Public investors rarely receive a complete project model. They identify a
              company&apos;s major uses of capital, reconstruct the likely economics from public
              disclosures, estimate reasonable ranges of cash flows and required returns, and then
              compare actual performance with management&apos;s original claims.
            </p>
            <p className="ops-body mt-4 max-w-3xl text-[16px] leading-[1.7] text-slate-200">
              The project-specific discount-rate principle still applies, but in practice it is
              implemented through comparable businesses, scenario analysis, sensitivity testing,
              and ongoing performance monitoring.
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
              Toward Lesson 8.3
            </div>
            <p className="ops-body mt-3 text-[18px] leading-[1.6] text-white">
              Different corporate investments can require different discount rates. The next lesson
              examines an even subtler issue: different stages or cash flows within the same
              investment may also carry different risks.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Lesson 8.3"
          continueHref="/lessons/when-risk-changes-over-time"
        />
      </Reveal>

      <Reveal className="mt-8">
        <CBSourcePanel sources={LESSON_8_2_SOURCES} />
      </Reveal>
    </CBLayout>
  );
}
