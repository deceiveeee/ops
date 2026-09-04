"use client";

import {
  Reveal, Panel, DefinitionCard, Feedback, InteractiveFrame,
  MasteryCheck, type MasteryQuestion, LessonSummary, ConceptSection, ExpandableQA,
} from "./shared";
import CapitalAllocationOpening from "./CapitalAllocationOpening";
import CorporateCashAllocationMap from "./CorporateCashAllocationMap";
import MaintenanceGrowthClassifier from "./MaintenanceGrowthClassifier";
import IncrementalReinvestmentDecision from "./IncrementalReinvestmentDecision";
import ReinvestmentRunwayComparison from "./ReinvestmentRunwayComparison";
import MarginalReinvestmentCurve from "./MarginalReinvestmentCurve";
import AcquisitionCapitalAllocationCase from "./AcquisitionCapitalAllocationCase";
import DebtRepaymentOpportunityCost from "./DebtRepaymentOpportunityCost";
import ReinvestOrDistributeDecision from "./ReinvestOrDistributeDecision";
import BuybackPriceSimulator from "./BuybackPriceSimulator";
import BuybackQualityChecklist from "./BuybackQualityChecklist";
import CashReserveTradeoff from "./CashReserveTradeoff";
import CapitalAllocationHierarchy from "./CapitalAllocationHierarchy";
import BillionDollarCapitalAllocator from "./BillionDollarCapitalAllocator";
import CapitalAllocationTrackRecord from "./CapitalAllocationTrackRecord";
import CapitalAllocationScorecard from "./CapitalAllocationScorecard";
import CapitalAllocationRedFlags from "./CapitalAllocationRedFlags";
import AllocationDecisionVsMarketReaction from "./AllocationDecisionVsMarketReaction";
import CapitalAllocationInvestorWorkflow from "./CapitalAllocationInvestorWorkflow";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CBLayout from "./CBLayout";
import CBSourcePanel from "./CBSourcePanel";
import { useReportCBComplete } from "@/lib/cb-progress";

const SUMMARY_POINTS = [
  "Every use of corporate cash has an opportunity cost.",
  "Maintenance protects current value; growth attempts to create additional value.",
  "Growth creates value only when incremental returns exceed the required return.",
  "Historical ROIC does not guarantee attractive returns on the next dollar invested.",
  "Reinvestment runway depends on return, scale, and duration.",
  "A good acquisition target can still destroy value if the buyer overpays.",
  "Debt repayment reduces interest, distress risk, and financing constraints.",
  "Dividends may protect value by preventing poor reinvestment.",
  "Buyback value depends on price relative to intrinsic value.",
  "Cash provides resilience but can become inefficient without a credible purpose.",
  "Capital allocation should be evaluated at the margin, not by category.",
  "Corporate value creation and stock-market reaction are related but distinct.",
];

const SOURCES = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo — capital-budgeting framework: value is created through positive-NPV uses of capital, scale matters, investment should continue while the marginal benefit exceeds the marginal cost.",
  "Investor-focused extension: competing uses of corporate cash (maintenance, growth, acquisitions, debt repayment, buybacks, dividends, cash retention), marginal reinvestment analysis, buyback price dependence, multi-year track-record reconstruction, and the capital-allocation scorecard.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1", type: "single",
    prompt: "A company can reinvest $100M at 7%. Comparable-risk opportunities require 10%. Should reinvestment automatically be preferred to a dividend?",
    choices: [
      { id: "a", label: "No — the 7% incremental return is below the 10% required return. Reinvestment destroys value. A dividend may protect shareholder value by preventing poor reinvestment." },
      { id: "b", label: "Yes — reinvestment always creates more value than dividends." },
      { id: "c", label: "Cannot be determined without knowing the company's historical ROIC." },
    ],
    correctId: "a",
    hint: "Reinvestment creates value only when the expected return exceeds the risk-adjusted opportunity cost. 7% < 10% means value destruction.",
  },
  {
    id: "q2", type: "single",
    prompt: "A company repurchases shares at $60 when reasonable intrinsic value is estimated at $45. Who is likely to benefit?",
    choices: [
      { id: "a", label: "Selling shareholders benefit — they receive $60 for shares worth $45. Continuing shareholders lose value because the company overpaid." },
      { id: "b", label: "Continuing shareholders benefit because EPS rises." },
      { id: "c", label: "Both sides benefit equally." },
    ],
    correctId: "a",
    hint: "When repurchase price exceeds intrinsic value, value is transferred from continuing to selling shareholders. EPS may rise, but value is destroyed.",
  },
  {
    id: "q3", type: "single",
    prompt: "An acquisition raises EPS by 5% but costs $200M more than the estimated target and synergy value. Did it create value?",
    choices: [
      { id: "a", label: "No — the $200M overpayment means the buyer destroyed value despite EPS accretion. EPS is an accounting result; NPV measures economic value." },
      { id: "b", label: "Yes — 5% EPS accretion proves value creation." },
      { id: "c", label: "Cannot be determined." },
    ],
    correctId: "a",
    hint: "Paying $200M more than the value acquired destroys $200M of economic value, regardless of the accounting EPS effect.",
  },
  {
    id: "q4", type: "single",
    prompt: "A company earns 25% ROIC but can reinvest only 5% of annual earnings. What limitation should investors recognize?",
    choices: [
      { id: "a", label: "High returns on a small reinvestment base create less total value than moderate returns on a large base. The reinvestment runway is narrow despite excellent capital efficiency." },
      { id: "b", label: "The high ROIC guarantees all future investments will be equally profitable." },
      { id: "c", label: "The company should immediately increase its payout ratio to 100%." },
    ],
    correctId: "a",
    hint: "Value creation ≈ incremental return × reinvestment scale × duration. A great return on tiny capital creates limited total value.",
  },
  {
    id: "q5", type: "single",
    prompt: "A cyclical company has high debt and no attractive immediate expansion opportunities. Can debt repayment be a productive use of capital?",
    choices: [
      { id: "a", label: "Yes — debt repayment reduces interest expense, distress risk, and financing constraints. When no positive-NPV investment is available, repayment may be the best available use." },
      { id: "b", label: "No — debt repayment never creates value because revenue does not increase." },
      { id: "c", label: "Only if the company pays a special dividend instead." },
    ],
    correctId: "a",
    hint: "Debt repayment is not 'doing nothing.' It reduces real economic costs: interest, expected distress costs, and financing constraints.",
  },
  {
    id: "q6", type: "single",
    prompt: "A company spends $500M on buybacks, but diluted shares decline by only 1%. What should the investor investigate?",
    choices: [
      { id: "a", label: "Whether stock-based compensation is offsetting the buyback, what price was paid, and whether the share count actually declined after adjusting for dilution." },
      { id: "b", label: "Nothing — $500M is a large buyback regardless of share-count effect." },
      { id: "c", label: "Whether the company should have paid a dividend instead." },
    ],
    correctId: "a",
    hint: "If $500M of buybacks only reduces diluted shares by 1%, most of the repurchase is offsetting stock compensation. The 'return to shareholders' is largely illusory.",
  },
];

function CentralQuestion() {
  return (
    <Reveal className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-accent-amber/25 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-amber/10 blur-3xl" />
        <div className="font-sans text-[12px] uppercase tracking-[0.18em] text-accent-amber">Central question</div>
        <p className="ops-body mt-4 max-w-3xl text-[20px] leading-[1.5] text-white sm:text-[22px]">
          Once a company generates cash, how should management deploy it — and how can investors
          determine whether those decisions create shareholder value?
        </p>
      </div>
    </Reveal>
  );
}

export default function Lesson8_6() {
  const report = useReportCBComplete("project-cash-flows");

  return (
    <CBLayout>
      <PVHero
        index="8.6"
        eyebrow="Lesson 8.6 · Module 8 — Capital Budgeting"
        heading="Evaluating Management's Capital Allocation"
        subheading="Once a company generates cash, how should management deploy it — and how can investors determine whether those decisions create shareholder value? The most portfolio-management-relevant lesson in Module 8."
        bullets={[
          "Competing uses: maintenance, growth, acquisitions, debt, buybacks, dividends, cash",
          "Growth creates value only when incremental returns exceed the cost of capital",
          "Marginal reinvestment and diminishing returns",
          "Buyback value depends on price relative to intrinsic value",
          "A $1 billion allocator with realistic constraints",
          "Reconstructing management\u2019s multi-year track record",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* 1. OPENING */}
      <ConceptSection index="8.6.1" eyebrow="Section 1 · What should a company do with $1 billion?"         title="The best choice depends on what we don't yet know" intro={<>A profitable company has $1 billion of excess cash. Which choice is best? Without more information, no answer is defensible.</>}>
        <Reveal><InteractiveFrame><CapitalAllocationOpening /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 2. ALLOCATION MAP */}
      <ConceptSection index="8.6.2" eyebrow="Section 2 · The capital-allocation map" title="Competing destinations for corporate cash" intro="Cash used for one alternative is unavailable for another. Capital allocation is an opportunity-cost problem.">
        <Reveal><InteractiveFrame><CorporateCashAllocationMap /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 3. MAINTENANCE VS GROWTH */}
      <ConceptSection index="8.6.3" eyebrow="Section 3 · Maintenance versus growth" title="Protecting current value vs. creating additional value" intro="Maintenance investment preserves existing operations. Growth investment attempts to increase future cash flows. The two serve different economic purposes.">
        <Reveal><InteractiveFrame><MaintenanceGrowthClassifier /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 4. ORGANIC REINVESTMENT */}
      <ConceptSection index="8.6.4" eyebrow="Section 4 · Organic reinvestment: growth is not automatically good" title="Incremental returns must exceed the cost of capital" intro="Both projects below increase assets and may increase revenue. Only one creates value.">
        <Reveal><InteractiveFrame><IncrementalReinvestmentDecision /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 5. REINVESTMENT RUNWAY */}
      <ConceptSection index="8.6.5" eyebrow="Section 5 · Reinvestment runway" title="Return × scale × duration" intro="A high return on a small opportunity may create less total value than a moderate return on a large capital base.">
        <Reveal><InteractiveFrame><ReinvestmentRunwayComparison /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 6. DIMINISHING RETURNS */}
      <ConceptSection index="8.6.6" eyebrow="Section 6 · Diminishing returns and marginal allocation" title="Invest at the margin, not by category" intro="Each successive block of capital earns less. Management should invest while the marginal return exceeds the opportunity cost of capital.">
        <Reveal><InteractiveFrame><MarginalReinvestmentCurve /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 7. ACQUISITIONS */}
      <ConceptSection index="8.6.7" eyebrow="Section 7 · Acquisitions: good business, bad price" title="Target quality does not determine acquisition value" intro="A strong target can still destroy value if the buyer overpays.">
        <Reveal><InteractiveFrame><AcquisitionCapitalAllocationCase /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 8. DEBT REPAYMENT */}
      <ConceptSection index="8.6.8" eyebrow="Section 8 · Debt repayment" title="Not merely 'doing nothing'" intro="Debt repayment can reduce interest expense, distress risk, and financing constraints. It may be the best available use when expansion returns are inadequate.">
        <Reveal><InteractiveFrame><DebtRepaymentOpportunityCost /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 9. DIVIDENDS */}
      <ConceptSection index="8.6.9" eyebrow="Section 9 · Dividends" title="Capital transfer, not value creation" intro="A dividend transfers cash to shareholders. It may protect value by preventing capital from being reinvested at inadequate returns.">
        <Reveal>
          <DefinitionCard term="When dividends may be appropriate">
            Insufficient positive-NPV opportunities, excess cash beyond operational needs, desire to
            prevent value-destroying reinvestment, stable cash-generation capacity, or shareholder
            preference for distribution.
          </DefinitionCard>
        </Reveal>
        <Reveal><InteractiveFrame><ReinvestOrDistributeDecision /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 10. SHARE REPURCHASES */}
      <ConceptSection index="8.6.10" eyebrow="Section 10 · Share repurchases: price matters" title="Value depends on the price paid" intro="A repurchase below intrinsic value benefits continuing shareholders. A repurchase above intrinsic value destroys it.">
        <Reveal><InteractiveFrame><BuybackPriceSimulator /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 11. BUYBACK COMPLICATIONS */}
      <ConceptSection index="8.6.11" eyebrow="Section 11 · Buyback complications" title="Beyond the simple price model" intro="Opportunity cost, employee dilution, timing, leverage, and EPS effects complicate the buyback analysis.">
        <Reveal><InteractiveFrame><BuybackQualityChecklist /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 12. HOLDING CASH */}
      <ConceptSection index="8.6.12" eyebrow="Section 12 · Holding cash" title="Flexibility vs. inefficiency" intro="Cash provides resilience and optionality. But option value does not justify unlimited accumulation.">
        <Reveal><InteractiveFrame><CashReserveTradeoff /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 13. HIERARCHY */}
      <ConceptSection index="8.6.13" eyebrow="Section 13 · A practical hierarchy" title="A framework, not a universal law" intro="A sensible sequence — but assumptions can justify a different order when the evidence supports it.">
        <Reveal><InteractiveFrame><CapitalAllocationHierarchy /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 14. $1B ALLOCATOR */}
      <ConceptSection index="8.6.14" eyebrow="Section 14 · Primary case — allocate $1 billion" title="Distribute the capital with realistic constraints" intro="Required maintenance must be funded. Liquidity must be preserved. Each alternative has capacity constraints. Estimated total NPV updates.">
        <Reveal><InteractiveFrame><BillionDollarCapitalAllocator /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 15. TRACK RECORD */}
      <ConceptSection index="8.6.15" eyebrow="Section 15 · Reconstructing the track record"         title="Reconstructing the track record"
        intro="Reconstruct management's historical capital allocation from public disclosures. Compare original claims with actual outcomes.">
        <Reveal><InteractiveFrame><CapitalAllocationTrackRecord /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 16. SCORECARD */}
      <ConceptSection index="8.6.16" eyebrow="Section 16 · Capital-allocation scorecard" title="Evidence-based, not automatic" intro="Rate each category using evidence from disclosures. Permit mixed conclusions. Avoid a single unsupported numerical score.">
        <Reveal><InteractiveFrame><CapitalAllocationScorecard /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 17. RED FLAGS */}
      <ConceptSection index="8.6.17" eyebrow="Section 17 · Management incentives and red flags" title="Why was this metric selected?" intro="Identify the red-flag pattern and the evidence needed to evaluate each management claim.">
        <Reveal><InteractiveFrame><CapitalAllocationRedFlags /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 18. MARKET EXPECTATIONS */}
      <ConceptSection index="8.6.18" eyebrow="Section 18 · Capital allocation and market expectations" title="Value creation vs. surprise" intro="A sensible decision may disappoint the market. A questionable decision may please it. Separate corporate value from the surprise.">
        <Reveal><InteractiveFrame><AllocationDecisionVsMarketReaction /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 19. WORKFLOW */}
      <ConceptSection index="8.6.19" eyebrow="Section 19 · Investor workflow" title="One connected analytical process" intro="From cash generation through credibility assessment — the complete capital-allocation evaluation sequence.">
        <Reveal><InteractiveFrame><CapitalAllocationInvestorWorkflow /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 20. MISCONCEPTIONS */}
      <ConceptSection index="8.6.20" eyebrow="Section 20 · Misconception checks" title="Common mistakes about capital allocation" intro="Each card corrects a frequent error.">
        <Reveal>
          <div className="space-y-2.5">
            <ExpandableQA question="Reinvestment is always better than returning cash.">No. Reinvestment creates value only when expected returns exceed the risk-adjusted opportunity cost. Below that threshold, returning cash protects shareholder value.</ExpandableQA>
            <ExpandableQA question="A growing company should never pay dividends.">No. A company may generate more cash than it can reinvest attractively. Paying a dividend prevents capital from being deployed at inadequate returns.</ExpandableQA>
            <ExpandableQA question="Dividends directly create value.">A dividend primarily transfers cash to shareholders. It may protect value by preventing poor reinvestment, but it does not create new economic value at the moment of distribution.</ExpandableQA>
            <ExpandableQA question="Buybacks always create value because EPS rises.">No. Repurchases can increase EPS while destroying value if the company overpays. EPS accretion is an accounting effect, not proof of value creation.</ExpandableQA>
            <ExpandableQA question="Buybacks are always bad because they reduce investment.">No. They may be attractive when shares are undervalued and superior investments are unavailable. The decision depends on price, opportunity cost, and balance-sheet condition.</ExpandableQA>
            <ExpandableQA question="Debt repayment is unproductive because revenue does not increase.">No. It may reduce interest expense, distress risk, and financing constraints — real economic benefits even without revenue growth.</ExpandableQA>
            <ExpandableQA question="Holding cash is always inefficient.">No. Cash can provide resilience and strategic flexibility. The question is whether the amount retained has a credible purpose.</ExpandableQA>
            <ExpandableQA question="High historical ROIC proves future reinvestment will be attractive.">No. Historical ROIC reflects past investments. Investors need the expected return on the next dollar invested today.</ExpandableQA>
            <ExpandableQA question="A profitable acquisition target proves the acquisition was good.">No. The buyer may have paid more than the acquired value and synergies were worth. Target quality and acquisition value are separate questions.</ExpandableQA>
            <ExpandableQA question="A large buyback means shareholders benefited.">Not necessarily. The investor must examine price, financing, and actual diluted share-count reduction — not just the announced amount.</ExpandableQA>
          </div>
        </Reveal>
      </ConceptSection>

      {/* 21. APPLIED PRACTICE */}
      <ConceptSection index="8.6.21" eyebrow="Section 21 · Applied practice" title="Six applied questions" intro="Test the framework. Explanatory feedback follows every answer.">
        <Reveal>
          <MasteryCheck passCount={4} onComplete={() => report()}
            continueLabel="Continue to Lesson 8.7"
            continueHref="/lessons/sensitivity-and-scenario-analysis"
            questions={QUESTIONS} />
        </Reveal>
      </ConceptSection>

      {/* 22. FINAL TAKEAWAY */}
      <ConceptSection index="8.6.22" eyebrow="Section 22 · Final takeaway" title="The complete capital-allocation evaluation" intro="A practical sequence that ties the lesson together.">
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <div className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-slate-100">
              {["Protect current business", "Preserve resilience", "Fund attractive marginal reinvestment", "Compare acquisitions, debt, buybacks", "Return or retain residual capital"].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-3 py-1.5 text-accent-amber">{step}</span>
                  {i < arr.length - 1 && <span className="text-accent-amber" aria-hidden>→</span>}
                </span>
              ))}
            </div>
            <p className="ops-body mt-6 max-w-3xl text-[18px] leading-[1.6] text-white sm:text-[20px]">
              A strong capital allocator does not automatically favor growth, acquisitions, debt
              repayment, buybacks, dividends, or cash retention. Management compares the expected
              value of each incremental use and directs capital toward the best available
              risk-adjusted opportunity.
            </p>
            <p className="ops-body mt-3 max-w-3xl text-[16px] leading-[1.7] text-slate-200">
              Evaluating a company requires more than valuing its existing operations. Investors must
              judge what management is likely to do with the next dollar of cash and whether its
              historical decisions justify confidence in future allocation.
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
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">Toward Lesson 8.7</div>
            <p className="ops-body mt-3 text-[18px] leading-[1.6] text-white">
              The final lesson should combine discount rates, project analysis, NPV, alternative
              metrics, and management&apos;s capital-allocation record into one complete investor case.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-12">
        <LessonSummary points={SUMMARY_POINTS}
          continueLabel="Continue to Lesson 8.7"
          continueHref="/lessons/sensitivity-and-scenario-analysis" />
      </Reveal>

      <Reveal className="mt-8">
        <CBSourcePanel sources={SOURCES} />
      </Reveal>
    </CBLayout>
  );
}
