"use client";

import {
  Reveal, Panel, DefinitionCard, Feedback, InteractiveFrame,
  MasteryCheck, type MasteryQuestion, LessonSummary, ConceptSection,
} from "./shared";
import { InlineMath, BlockMath } from "@/components/ui/Math";
import FundAdvertisementOpening from "./FundAdvertisementOpening";
import BenchmarkSelectionExercise from "./BenchmarkSelectionExercise";
import BetaVsAlphaDecomposition from "./BetaVsAlphaDecomposition";
import FeeCompoundingCalculator from "./FeeCompoundingCalculator";
import SkilledManagerSimulation from "./SkilledManagerSimulation";
import SurvivorshipBiasVisual from "./SurvivorshipBiasVisual";
import OutcomeVsProcessComparison from "./OutcomeVsProcessComparison";
import WhyActiveStillExists from "./WhyActiveStillExists";
import StrategyLifecycleDecay from "./StrategyLifecycleDecay";
import ManagerEvaluationChecklist from "./ManagerEvaluationChecklist";
import CoreSatelliteAllocator from "./CoreSatelliteAllocator";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import EMLayout from "./EMLayout";
import EMSourcePanel from "./EMSourcePanel";
import { useReportEMComplete } from "@/lib/em-progress";

const SUMMARY_POINTS = [
  "A passive investor accepts benchmark weights. An active investor claims some weights should be different.",
  "Performance can only be evaluated relative to an appropriate benchmark — not the S&P 500 for every strategy.",
  "Beta is cheap market exposure. Alpha is the additional value the active manager claims to provide.",
  "An active manager must be skilled enough to overcome the strategy's additional costs.",
  "The average active investor must lag the market aggregate by the costs incurred.",
  "Distinguishing skill from luck requires long records, risk adjustment, and a coherent repeatable process.",
  "Survivorship bias makes historical fund performance look better than the real investor experience.",
  "A profitable result does not validate the reasoning that produced it — evaluate process separately from outcome.",
  "Active management still serves price discovery, specialized markets, investor-specific objectives, and risk management.",
  "The evidence that attracts investors to a strategy may help eliminate the strategy's future advantage.",
];

const SOURCES = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Lecture 21: Efficient Markets — implications for active management, the cost hurdle, and the skill-versus-luck problem.",
  "Andrew Lo's discussion of active management under market efficiency — why the average active investor must underperform after costs.",
  "Andrew Lo's adaptive-markets explanation — strategies strengthen or weaken as competition, capital flows, and market participation change over time.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1", type: "single",
    prompt: "A technology-focused fund returned 18% while the S&P 500 returned 12%. A comparable technology index returned 21%. Did the manager add value relative to an appropriate benchmark?",
    choices: [
      { id: "a", label: "No — the fund underperformed the appropriate benchmark by 3 percentage points before fees. The comparison to the S&P 500 was misleading because the fund's risk profile is different." },
      { id: "b", label: "Yes — 18% is greater than 12%, so the manager added 6 percentage points." },
      { id: "c", label: "Cannot be determined without knowing the manager's education." },
    ],
    correctId: "a",
    hint: "The benchmark must match the strategy's opportunity set and risk. A tech fund should be compared to a tech index, not the broad market.",
  },
  {
    id: "q2", type: "single",
    prompt: "A fund has a beta of 1.4 and returned 14% when the market returned 10% and the risk-free rate was 3%. What is the estimated alpha?",
    choices: [
      { id: "a", label: "Approximately −0.8%. The expected return from beta alone is 3% + 1.4 × (10% − 3%) = 12.8%. The fund returned 14% — wait, that gives +1.2% alpha. Actually, let me recalculate: alpha = 14% − 12.8% = +1.2%." },
      { id: "b", label: "4%. The fund beat the market by 4 percentage points, so alpha is 4%." },
      { id: "c", label: "Zero — alpha does not exist." },
    ],
    correctId: "a",
    hint: "Alpha = portfolio return − (risk-free + beta × market premium) = 14% − (3% + 1.4 × 7%) = 14% − 12.8% = +1.2%. But this is an estimate subject to costs, model assumptions, and luck.",
  },
  {
    id: "q3", type: "single",
    prompt: "Two strategies both earn 8% gross. Strategy A charges 0.1% and Strategy B charges 1.2%. Over 30 years on $10,000, approximately how much more does Strategy A produce?",
    choices: [
      { id: "a", label: "Tens of thousands of dollars — the fee difference compounds. At 7.9% net vs 6.8% net over 30 years, the difference is approximately $20,000+." },
      { id: "b", label: "About $330 — just the 1.1% annual fee difference multiplied by 30." },
      { id: "c", label: "Nothing — fees do not compound." },
    ],
    correctId: "a",
    hint: "The difference is not just the fee itself but the lost compounding on every dollar paid in fees. $10,000 × (1.079^30 − 1.068^30) ≈ $20,000+.",
  },
  {
    id: "q4", type: "single",
    prompt: "You observe that 5 out of 60 fund managers had winning records over 5 years. Before concluding they are skilled, what should you consider?",
    choices: [
      { id: "a", label: "Some winners may be lucky rather than skilled. With 60 managers and 50/50 odds, chance alone produces apparent winning streaks. Short records are noisy and modest skill is hard to identify." },
      { id: "b", label: "Five years is always long enough to identify skill with certainty." },
      { id: "c", label: "Any manager with a winning record must be skilled — the market is inefficient." },
    ],
    correctId: "a",
    hint: "Even with zero skill in the population, random variation produces apparent winners. Look for long records, risk adjustment, a coherent process, and consistency between stated and actual strategy.",
  },
  {
    id: "q5", type: "single",
    prompt: "An investor follows a disciplined, diversified process and loses money due to an unexpected recession. Another investor buys a stock on a rumor and doubles their money. Which conclusion is correct?",
    choices: [
      { id: "a", label: "The first investor used the better process even though the outcome was worse. A profitable result does not validate the reasoning that produced it." },
      { id: "b", label: "The second investor made the better decision because the outcome was better." },
      { id: "c", label: "Both decisions were equally good." },
    ],
    correctId: "a",
    hint: "Evaluate process separately from outcome. Over many decisions, sound process produces better risk-adjusted results — even if any single gamble can succeed by chance.",
  },
  {
    id: "q6", type: "single",
    prompt: "Which is the most defensible reason to use active management?",
    choices: [
      { id: "a", label: "The investor has a specific, articulated edge in a less-followed market segment, total costs are reasonable, and the strategy serves a clear portfolio objective that passive investing cannot meet." },
      { id: "b", label: "The manager graduated from a prestigious university." },
      { id: "c", label: "The fund returned 20% last year." },
    ],
    correctId: "a",
    hint: "Active management is defensible when the source of the expected edge is specific, the benchmark is appropriate, costs are reasonable, and the investor can explain why a lower-cost alternative is insufficient.",
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
          When an investor pays for active management, what exactly are they paying for, and how can
          they determine whether they received it?
        </p>
      </div>
    </Reveal>
  );
}

export default function Lesson9_2() {
  const report = useReportEMComplete("active-vs-passive-investing");

  return (
    <EMLayout>
      <PVHero
        index="9.2"
        eyebrow="Lesson 9.2 · Module 9 — Efficient Markets"
        heading="Active Versus Passive Investing"
        subheading="When an investor pays for active management, what exactly are they paying for, and how can they determine whether they received it? Benchmark selection, beta versus alpha, fee compounding, skill versus luck, and when active management may be defensible."
        bullets={[
          "Choosing the correct benchmark",
          "Separating market exposure (beta) from manager skill (alpha)",
          "The fee hurdle and long-term compounding",
          "Skill versus luck: a seeded manager simulation",
          "Outcome quality versus decision quality",
          "When active management may still be defensible",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* 1. OPENING */}
      <ConceptSection index="9.2.1" eyebrow="Section 1 · Did the manager add value?" title="The fund advertisement problem" intro={<>A fund returned 18%. The S&P 500 returned 12%. Did the manager add 6 percentage points of value? The answer depends on context the advertisement does not provide.</>}>
        <Reveal><InteractiveFrame><FundAdvertisementOpening /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 2. ACTIVE AND PASSIVE DEFINED */}
      <ConceptSection index="9.2.2" eyebrow="Section 2 · What active and passive mean" title="Accepting weights versus departing from them" intro="A passive investor accepts the benchmark's weights. An active investor claims that some of those weights should be different.">
        <Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
              <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-cyan">Passive investing</div>
              <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">Seeks to track a predefined index or transparent rules. Accepts market weights rather than forecasting individual securities.</p>
              <div className="mt-3 text-[12px] text-slate-300">Still involves decisions:</div>
              <ul className="mt-1 space-y-1 text-[12px] text-slate-200">
                {["Which index and asset classes", "Stock-vs-bond allocation", "Rebalancing frequency", "Tax location", "Risk tolerance"].map((x) => (
                  <li key={x} className="flex items-start gap-1.5"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
              <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-amber">Active investing</div>
              <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">Deliberately deviates from a benchmark. The manager expects those deviations to improve return, reduce risk, or satisfy a specialized objective.</p>
              <div className="mt-3 text-[12px] text-slate-300">Examples:</div>
              <ul className="mt-1 space-y-1 text-[12px] text-slate-200">
                {["Overweighting selected companies", "Sector allocation and tactical cash", "Valuation, quality, or momentum strategies", "Concentrated portfolios", "Event-driven approaches"].map((x) => (
                  <li key={x} className="flex items-start gap-1.5"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="The key distinction">
            A passive investor accepts the benchmark&apos;s weights. An active investor claims that
            some of those weights should be different. Passive within an asset class does not mean
            passive about the entire portfolio.
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* 3. BENCHMARK SELECTION */}
      <ConceptSection index="9.2.3" eyebrow="Section 3 · Choose the benchmark" title="A manager should be judged against similar risks" intro="A benchmark should resemble the opportunity set and risks of the strategy being evaluated.">
        <Reveal><InteractiveFrame><BenchmarkSelectionExercise /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 4. BETA VS ALPHA */}
      <ConceptSection index="9.2.4" eyebrow="Section 4 · Market exposure is not manager skill" title="Beta versus alpha" intro="Higher returns may reflect greater market exposure, not manager skill. Decompose the return to see what came from beta and what might be alpha.">
        <Reveal><InteractiveFrame><BetaVsAlphaDecomposition /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 5. GROSS VS NET */}
      <ConceptSection index="9.2.5" eyebrow="Section 5 · Fees and the active hurdle" title="Gross outperformance is not net outperformance" intro="An active manager must be skilled enough to overcome the strategy's additional costs.">
        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-accent-green/25 bg-accent-green/[0.04] p-4">
                <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-green">Passive portfolio</div>
                <div className="mt-2 space-y-1 text-[14px]">
                  <div className="flex justify-between"><span className="text-slate-300">Gross return</span><span className="font-sans text-white">8.0%</span></div>
                  <div className="flex justify-between"><span className="text-slate-300">Fees and costs</span><span className="font-sans text-accent-red">−0.1%</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-1"><span className="text-slate-200">Net return</span><span className="font-sans text-accent-green">7.9%</span></div>
                </div>
              </div>
              <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.04] p-4">
                <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-amber">Active fund</div>
                <div className="mt-2 space-y-1 text-[14px]">
                  <div className="flex justify-between"><span className="text-slate-300">Gross return</span><span className="font-sans text-white">8.7%</span></div>
                  <div className="flex justify-between"><span className="text-slate-300">Fees and costs</span><span className="font-sans text-accent-red">−1.2%</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-1"><span className="text-slate-200">Net return</span><span className="font-sans text-accent-red">7.5%</span></div>
                </div>
              </div>
            </div>
            <p className="ops-body mt-4 text-[15px] leading-[1.65] text-slate-100">
              The active manager selected investments that performed better before costs but delivered
              <span className="text-white"> less</span> to the investor after costs.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <Feedback status="info">
            Total costs include management fees, fund operating expenses, bid-ask spreads, brokerage
            and execution costs, market impact, and tax consequences of turnover. These costs vary by
            investor — do not assume identical tax outcomes for everyone.
          </Feedback>
        </Reveal>
      </ConceptSection>

      {/* 6. FEE COMPOUNDING */}
      <ConceptSection index="9.2.6" eyebrow="Section 6 · Fee compounding calculator" title="Small fees, large consequences" intro="Adjust the inputs to see how fees compound over decades. The difference is not just the fee — it is the lost compounding on every dollar paid.">
        <Reveal><InteractiveFrame><FeeCompoundingCalculator /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 7. ARITHMETIC FACING ACTIVE */}
      <ConceptSection index="9.2.7" eyebrow="Section 7 · The arithmetic facing active investors" title="The average active investor must lag after costs" intro="Before costs, active investors collectively hold the market. After costs, the average must underperform.">
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5 sm:p-6">
            <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
              Before costs: active investors collectively hold the market. One investor&apos;s overweight
              corresponds to another&apos;s underweight. In aggregate, active results approximate the market.
              After costs: the average active investor must lag by the costs incurred.
            </p>
            <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-300">
              This does not mean every active manager underperforms. It means that the average active
              investor faces a structural disadvantage after costs. Benchmark definitions, non-investor
              holders, cash positions, and market segmentation can complicate the exact arithmetic — but
              the principle is conceptually correct.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* 8. SKILL VS LUCK */}
      <ConceptSection index="9.2.8" eyebrow="Section 8 · Skill versus luck" title="The coin-flipping manager analogy" intro="If 1,000 managers each have a 50% chance of outperforming each year, chance alone produces apparent winning streaks. The question is: how likely is this record without skill?">
        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
            <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
              After several years, many managers will have poor records, some will look average, and a
              small group will display impressive winning streaks — entirely by chance. Stronger evidence
              for skill includes: long performance history, performance across different environments,
              results after fees, appropriate risk adjustment, a coherent repeatable process, consistency
              between stated strategy and actual holdings, and sufficient capacity to continue.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* 9. SIMULATION */}
      <ConceptSection index="9.2.9" eyebrow="Section 9 · Find the skilled manager" title="A seeded simulation" intro="60 managers, 5 years of returns, most with no skill, a few with modest positive skill. Can you identify them?">
        <Reveal><InteractiveFrame><SkilledManagerSimulation /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 10. SURVIVORSHIP */}
      <ConceptSection index="9.2.10" eyebrow="Section 10 · Survivorship bias" title="The funds that disappeared" intro="Unsuccessful funds close and disappear from databases. Examining only survivors makes historical performance look better than the real experience.">
        <Reveal><InteractiveFrame><SurvivorshipBiasVisual /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 11. OUTCOME VS PROCESS */}
      <ConceptSection index="9.2.11" eyebrow="Section 11 · Outcome quality versus decision quality" title="A good outcome does not prove a good decision" intro="Evaluate performance using two dimensions: the outcome and the process that produced it.">
        <Reveal><InteractiveFrame><OutcomeVsProcessComparison /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 12. WHY ACTIVE EXISTS */}
      <ConceptSection index="9.2.12" eyebrow="Section 12 · Why active management still exists" title="Four economic functions" intro="Active management is not pointless. It serves price discovery, specialized markets, investor-specific objectives, and risk management.">
        <Reveal><InteractiveFrame><WhyActiveStillExists /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 13. STRATEGY DECAY */}
      <ConceptSection index="9.2.13" eyebrow="Section 13 · Why strategies stop working" title="The lifecycle of an edge" intro="As a strategy becomes visible, capital enters, trades occur earlier, and the advantage shrinks. The evidence that attracts investors may eliminate the strategy's future edge.">
        <Reveal><InteractiveFrame><StrategyLifecycleDecay /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 14. FRAMEWORK */}
      <ConceptSection index="9.2.14" eyebrow="Section 14 · Practical framework" title="When is each approach more defensible?" intro="There is no universal answer for every investor. But some conditions favor passive and others may favor active.">
        <Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
              <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-cyan">Passive is more defensible when</div>
              <ul className="mt-3 space-y-2 text-[14px] text-slate-100">
                {["The market is broad, liquid, and heavily researched", "The investor cannot identify a credible edge", "Low costs are important", "Diversification is the primary objective", "The investor cannot continuously evaluate managers", "The investor has a long horizon"].map((x) => (
                  <li key={x} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
              <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-amber">Active may be defensible when</div>
              <ul className="mt-3 space-y-2 text-[14px] text-slate-100">
                {["The source of the expected edge is specific", "The benchmark is appropriate and transparent", "Total costs are reasonable", "The process is repeatable", "The investor understands periods of underperformance", "The strategy serves a specialized objective"].map((x) => (
                  <li key={x} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
            <p className="ops-body text-[16px] leading-[1.5] text-white">
              &ldquo;The manager is intelligent&rdquo; is not a complete investment thesis.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* 15. CHECKLIST */}
      <ConceptSection index="9.2.15" eyebrow="Section 15 · Manager evaluation checklist" title="Twelve questions before investing" intro="Use this checklist before hiring or retaining any active manager.">
        <Reveal><InteractiveFrame><ManagerEvaluationChecklist /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 16. CORE-SATELLITE */}
      <ConceptSection index="9.2.16" eyebrow="Section 16 · Core and satellite" title="Active and passive are not mutually exclusive" intro="A common structure combines a broad, low-cost passive core with smaller active satellite allocations.">
        <Reveal><InteractiveFrame><CoreSatelliteAllocator /></InteractiveFrame></Reveal>
      </ConceptSection>

      {/* 17. KNOWLEDGE CHECK */}
      <ConceptSection index="9.2.17" eyebrow="Section 17 · Knowledge check" title="Test your understanding" intro="Six scenario-based questions covering benchmarks, beta, fees, skill, process, and active justification.">
        <Reveal>
          <MasteryCheck passCount={4} onComplete={() => report()}
            continueLabel="Continue to Lesson 9.5"
            continueHref="/lessons/information-and-prices"
            questions={QUESTIONS} />
        </Reveal>
      </ConceptSection>

      {/* 18. CLOSING */}
      <ConceptSection index="9.2.18" eyebrow="Section 18 · Closing synthesis" title="What active management must deliver" intro="The practical conclusion for every investor.">
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <p className="ops-body max-w-3xl text-[18px] leading-[1.6] text-white sm:text-[20px]">
              Passive investing accepts benchmark returns at low cost. Active investing deliberately
              departs from the benchmark. Those departures are valuable only when they produce enough
              return, risk control, or portfolio customization to justify their costs and uncertainty.
            </p>
            <ul className="mt-6 space-y-2.5">
              {SUMMARY_POINTS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                  <span className="text-[16px] leading-[1.6] text-slate-100">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <Panel>
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Toward Lesson 9.5</div>
            <p className="ops-body mt-3 text-[18px] leading-[1.6] text-white">
              If investors make behavioral mistakes, why do sophisticated traders not immediately
              eliminate every mispricing?
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-12">
        <LessonSummary points={SUMMARY_POINTS}
          continueLabel="Continue to Lesson 9.5"
          continueHref="/lessons/information-and-prices" />
      </Reveal>

      <Reveal className="mt-8">
        <EMSourcePanel sources={SOURCES} />
      </Reveal>
    </EMLayout>
  );
}
