"use client";

import {
  Reveal,
  Panel,
  DefinitionCard,
  Feedback,
  InteractiveFrame,
  MasteryCheck,
  type MasteryQuestion,
  LessonSummary,
  ConceptSection,
} from "./shared";
import UndervaluedDangerousOpening from "./UndervaluedDangerousOpening";
import PredictableBiases from "./PredictableBiases";
import BiasClassifier from "./BiasClassifier";
import ShortSaleRiskStory from "./ShortSaleRiskStory";
import LimitsToArbitrage from "./LimitsToArbitrage";
import CorrectButBankruptSimulation from "./CorrectButBankruptSimulation";
import FeedbackLoops from "./FeedbackLoops";
import PricesAffectFundamentals from "./PricesAffectFundamentals";
import RiskVsUncertaintyUrns from "./RiskVsUncertaintyUrns";
import AdaptiveMarketsComparison from "./AdaptiveMarketsComparison";
import StrategyLifecycleExtended from "./StrategyLifecycleExtended";
import OpportunityOrRiskClassifier from "./OpportunityOrRiskClassifier";
import PracticalMispricingFramework from "./PracticalMispricingFramework";
import MarketMistakeMisconceptions from "./MarketMistakeMisconceptions";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import EMLayout from "./EMLayout";
import EMSourcePanel from "./EMSourcePanel";
import { useReportEMComplete } from "@/lib/em-progress";

const SUMMARY_POINTS = [
  "Investors make predictable behavioral mistakes — loss aversion, anchoring, overconfidence, and herding — that push prices away from fundamentals in recognizable ways.",
  "Recognizing a mispricing is not the same as being able to profit from it. Identifying the gap is one input; financing, timing, and survival determine whether the investor captures the realization.",
  "A mispricing can become larger before it disappears. The path between today and realization can break a correct thesis through margin calls, withdrawals, and forced liquidation.",
  "Limits to arbitrage — timing risk, fundamental risk, financing and liquidity risk, short-selling constraints, and career risk — explain why sophisticated investors do not immediately trade every mistake away.",
  "Forced selling and forced buying can create destabilizing feedback loops even when each participant is acting rationally given their own constraints.",
  "Prices can influence fundamentals, not merely reflect them. A falling stock price can damage the business; a rising stock price can strengthen it.",
  "Quantifiable risk and unquantifiable uncertainty are not the same. Investors often demand a premium for outcomes they cannot model — a premium that can look like a free return to a careless analyst.",
  "Market efficiency varies over time. The same market can be more efficient when capital is abundant and competitive, and less efficient when capital is constrained, leverage is reduced, or uncertainty dominates.",
  "Before concluding that the market is wrong, ask what risk, constraint, or piece of information could justify the price.",
];

const SOURCES = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Lecture 21: Efficient Markets — implications for active management, the cost hurdle, and the skill-versus-luck problem.",
  "Andrew Lo's discussion of behavioral finance, loss aversion, uncertainty, limited arbitrage, and the adaptive-markets hypothesis — markets as competitive ecosystems where investors make mistakes, learn, attract or lose capital, and reshape the environment over time.",
  "MIT's adaptive-markets framework describing changing investor populations, time-varying opportunities, and strategies that wax and wane as competition and capital flows evolve.",
];

const HIGH_RETURN_EXPLANATIONS = [
  "Genuine underpricing",
  "Greater systematic risk",
  "Illiquidity — the asset cannot be sold quickly without a large price concession",
  "Poor performance during recessions, when the capital is most needed",
  "Financing difficulty — the asset is expensive or risky to hold with leverage",
  "Uncertainty investors strongly dislike — outcomes that cannot be reliably modeled",
  "Random historical results that do not reflect a repeatable edge",
  "Survivorship or selection bias — only the surviving examples are visible",
  "Hidden leverage that exposes the investor to catastrophic loss",
  "Data or model error — the apparent return was never really there",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt:
      "A manager correctly identifies a stock as overvalued and shorts it. The price rises further, the broker issues a margin call, and the manager is forced to close the position at a loss. The price falls two months later. What is the most accurate diagnosis?",
    choices: [
      {
        id: "a",
        label:
          "Limits to arbitrage prevented the manager from holding the position long enough to benefit. The thesis was correct; the financing plan was not.",
      },
      { id: "b", label: "The market was inefficient and the manager should have shorted more." },
      { id: "c", label: "The thesis was wrong because the trade lost money." },
    ],
    correctId: "a",
    hint: "Outcome does not validate or invalidate the thesis on its own. Forced liquidation is a financing constraint, not an analytical error — but it can turn a correct thesis into a losing trade.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "An investor refuses to sell a stock below the original purchase price, telling themselves they will exit once they are 'back to even.' Which bias is most directly responsible, and what reinforces it?",
    choices: [
      {
        id: "a",
        label:
          "Loss aversion, reinforced by anchoring on the original purchase price. The disciplined question is whether the current price is the best use of capital today.",
      },
      { id: "b", label: "Overconfidence in their original analysis." },
      { id: "c", label: "Herding — they are copying other investors." },
    ],
    correctId: "a",
    hint: "Loss aversion makes losses feel disproportionately painful. Anchoring on the purchase price supplies the target. The original cost is sunk and should not determine the forward-looking decision.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "A closed-end fund trades at a 12% discount to its holdings. The discount has persisted for many years. Which conclusion is most defensible without further information?",
    choices: [
      {
        id: "a",
        label:
          "Insufficient information. The discount may reflect fees, expected future underperformance, illiquidity, tax overhangs, governance concerns, or simply the absence of any catalyst to force convergence.",
      },
      { id: "b", label: "The fund is obviously mispriced and offers a free 12% gain." },
      { id: "c", label: "The discount proves that markets are irrational and exploitable." },
    ],
    correctId: "a",
    hint: "Persistent discounts often hide a reason. Before treating a discount as a mispricing, identify what risk or friction justifies it — and what mechanism would force it to close.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "A high-yield bond offers a yield 4 percentage points above Treasuries of similar duration. The issuer historically defaults at high rates during recessions. Which interpretation is most defensible?",
    choices: [
      {
        id: "a",
        label:
          "Likely compensation for risk. The extra yield plausibly compensates for expected default losses during precisely the downturns when investors can least afford them.",
      },
      { id: "b", label: "A clear mispricing — high yield means high expected return." },
      { id: "c", label: "Rational repricing, because Treasury yields have changed." },
    ],
    correctId: "a",
    hint: "A high yield is not the same as a high expected return. Default risk, recovery rates, and the timing of defaults (clustered in bad times) can consume most or all of the apparent spread.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "An analyst says: 'I have beaten the market for six months, so I should concentrate my portfolio into my best ideas.' Which bias is most clearly operating, and what should the analyst ask instead?",
    choices: [
      {
        id: "a",
        label:
          "Overconfidence. The disciplined question is whether six months is long enough to distinguish skill from luck — and what evidence would change the conviction.",
      },
      { id: "b", label: "Loss aversion — they fear missing further gains." },
      { id: "c", label: "Anchoring — they are tied to the original position size." },
    ],
    correctId: "a",
    hint: "Short records are dominated by noise. Confidence should track the quality of the evidence, not the warmth of a recent winning streak.",
  },
  {
    id: "q6",
    type: "single",
    prompt:
      "Which statement best describes why a profitable strategy can stop working over time?",
    choices: [
      {
        id: "a",
        label:
          "Historical success attracts attention and capital. More investors attempt the same trades, entries occur earlier, and the spread between entry and exit compresses. The edge shrinks.",
      },
      { id: "b", label: "Markets become more irrational as time passes." },
      { id: "c", label: "Strategies always stop working exactly five years after launch." },
    ],
    correctId: "a",
    hint: "This is the strategy lifecycle. The evidence that attracts investors to a strategy can also be what eliminates its future advantage. The same logic can also describe the waxing and waning of market efficiency itself.",
  },
  {
    id: "q7",
    type: "single",
    prompt:
      "Which combination is the most complete picture of why sophisticated investors may not trade away an apparent mispricing?",
    choices: [
      {
        id: "a",
        label:
          "Timing risk (the gap may widen before it closes), fundamental risk (the analysis may be wrong), financing and liquidity risk (capital may be withdrawn), short-selling constraints (overpricing is harder to correct than underpricing), and career risk (professionals can be removed before being proven correct).",
      },
      { id: "b", label: "Sophisticated investors are simply less skilled than retail investors." },
      { id: "c", label: "Markets are perfectly efficient and never misprice anything." },
    ],
    correctId: "a",
    hint: "Limits to arbitrage describe the operational, financial, and career constraints that stand between identifying a mispricing and capturing the correction. Each limit on its own is rarely decisive; together they explain a great deal.",
  },
];

function CentralQuestion() {
  return (
    <Reveal className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-accent-cyan/25 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-accent-cyan">
          Central question
        </div>
        <p className="ops-body mt-4 max-w-3xl text-[20px] leading-[1.5] text-white sm:text-[22px]">
          If markets sometimes misprice assets, why do sophisticated investors not immediately
          trade those mistakes away?
        </p>
      </div>
    </Reveal>
  );
}

export default function Lesson9_3() {
  const report = useReportEMComplete("anomalies-and-limits-to-arbitrage");

  return (
    <EMLayout>
      <PVHero
        index="9.3"
        eyebrow="Lesson 9.3 · Module 9 — Efficient Markets"
        heading="Why Markets Still Make Mistakes"
        subheading="If markets sometimes misprice assets, why do sophisticated investors not immediately trade those mistakes away? Behavioral errors, limits to arbitrage, forced liquidation, and the difference between recognizing a mispricing and surviving long enough to profit from it."
        bullets={[
          "Why predictable behavioral errors affect prices",
          "Why recognizing a mispricing is not the same as profiting from it",
          "The five practical limits to arbitrage",
          "Forced liquidation and feedback loops",
          "Risk versus uncertainty",
          "A practical four-part mispricing framework",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== 1. OPENING SCENARIO ===================== */}
      <ConceptSection
        index="9.3.1"
        eyebrow="Section 1 · Everyone knows the price is wrong"
        title="The undervalued company nobody can buy"
        intro={<>A company owns assets estimated at roughly $1 billion, has minimal debt, and yet trades at a $600 million market capitalization. Several professional investors believe it is materially undervalued. Should informed buying immediately close the gap?</>}
      >
        <Reveal>
          <InteractiveFrame>
            <UndervaluedDangerousOpening />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 2. PREDICTABLE MISTAKES ===================== */}
      <ConceptSection
        index="9.3.2"
        eyebrow="Section 2 · Why investors make predictable mistakes"
        title="Four biases that move real money"
        intro="The goal is not to memorize a catalog of named biases. Four patterns explain most predictable investor mistakes — and each connects directly to an investment decision."
      >
        <Reveal>
          <InteractiveFrame>
            <PredictableBiases />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 3. IDENTIFY THE BIAS ===================== */}
      <ConceptSection
        index="9.3.3"
        eyebrow="Section 3 · Identify the bias"
        title="Classify each statement"
        intro="For each card, choose one category. After every answer, identify the phrase that signals the bias and the disciplined question an investor should ask instead."
      >
        <Reveal>
          <InteractiveFrame>
            <BiasClassifier />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 4. NO EASY PROFITS ===================== */}
      <ConceptSection
        index="9.3.4"
        eyebrow="Section 4 · Behavioral mistakes do not create easy profits"
        title="Right about value, wrong about the path"
        intro={<>A stock trades at $100. The investor estimates intrinsic value at $60 and shorts it. The price first rises to $150. Can the investor be fundamentally correct and still lose money?</>}
      >
        <Reveal>
          <InteractiveFrame>
            <ShortSaleRiskStory />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 5. LIMITS TO ARBITRAGE ===================== */}
      <ConceptSection
        index="9.3.5"
        eyebrow="Section 5 · Limits to arbitrage"
        title="Five reasons informed capital cannot always act"
        intro='The term "arbitrage" can refer narrowly to nearly riskless price discrepancies. In behavioral finance, "limits to arbitrage" refers more broadly to the risks and constraints faced by traders attempting to correct apparent mispricing.'
      >
        <Reveal>
          <InteractiveFrame>
            <LimitsToArbitrage />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 6. CORRECT BUT BANKRUPT ===================== */}
      <ConceptSection
        index="9.3.6"
        eyebrow="Section 6 · Simulation — correct but bankrupt"
        title="Short the overvalued stock, survive the path"
        intro={<>Estimated fundamental value $70. Initial price $100. Deterministic price path: 100 → 115 → 135 → 160 → 90 → 65. Adjust the position size and starting capital. The investor was directionally correct — but only if the position survives.</>}
      >
        <Reveal>
          <InteractiveFrame>
            <CorrectButBankruptSimulation />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 7. FEEDBACK LOOPS ===================== */}
      <ConceptSection
        index="9.3.7"
        eyebrow="Section 7 · How market feedback loops form"
        title="Reinforcing loops in both directions"
        intro="Forced selling and forced buying can create destabilizing feedback loops even when each participant is acting rationally given their own constraints."
      >
        <Reveal>
          <InteractiveFrame>
            <FeedbackLoops />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 8. PRICES AFFECT FUNDAMENTALS ===================== */}
      <ConceptSection
        index="9.3.8"
        eyebrow="Section 8 · Prices can affect fundamentals"
        title="Reflexivity between price and business"
        intro="Prices do not merely reflect the economy. In some cases, they influence it."
      >
        <Reveal>
          <InteractiveFrame>
            <PricesAffectFundamentals />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 9. RISK VS UNCERTAINTY ===================== */}
      <ConceptSection
        index="9.3.9"
        eyebrow="Section 9 · Risk versus uncertainty"
        title="Two urns, same expected payoff"
        intro="The original example contrasts a known-risk urn (50 red, 50 black) with an urn of unknown composition. Most investors react differently to the two — even when the expected payoff is identical."
      >
        <Reveal>
          <InteractiveFrame>
            <RiskVsUncertaintyUrns />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 10. ADAPTIVE MARKETS ===================== */}
      <ConceptSection
        index="9.3.10"
        eyebrow="Section 10 · Market efficiency can change over time"
        title="Adaptive markets — a practical synthesis"
        intro="Investors make mistakes, learn, attract capital when successful, lose capital when wrong, and reshape the competitive environment as they enter and leave. Market efficiency is a moving target."
      >
        <Reveal>
          <InteractiveFrame>
            <AdaptiveMarketsComparison />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 11. STRATEGY LIFECYCLE ===================== */}
      <ConceptSection
        index="9.3.11"
        eyebrow="Section 11 · Why a profitable strategy stops working"
        title="The lifecycle of an edge"
        intro="Historical success tends to attract the capital that weakens future success. Walk through the six stages of a strategy's lifecycle."
      >
        <Reveal>
          <InteractiveFrame>
            <StrategyLifecycleExtended />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 12. MISPRICING OR COMPENSATION ===================== */}
      <ConceptSection
        index="9.3.12"
        eyebrow="Section 12 · Mispricing or compensation for risk?"
        title="Ten reasons an asset can offer an unusually high expected return"
        intro="Before concluding that the market is wrong, ask what risk or constraint could justify the price."
      >
        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
              When the price looks too good to be true
            </div>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {HIGH_RETURN_EXPLANATIONS.map((x, i) => (
                <li key={x} className="flex items-start gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5 text-[14px] leading-[1.55] text-slate-100">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 font-mono text-[10px] text-accent-amber">
                    {i + 1}
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="The disciplined question">
            Before concluding that the market is wrong, ask what risk or constraint could justify
            the price. Most apparent free lunches hide either a hidden risk, an uncapturable gap,
            or a piece of information the market has that the analyst does not.
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* ===================== 13. OPPORTUNITY OR RISK ===================== */}
      <ConceptSection
        index="9.3.13"
        eyebrow="Section 13 · Opportunity or hidden risk?"
        title="Classify each market case"
        intro="Several cases admit more than one defensible interpretation. When in doubt, the lesson is to identify what additional information would resolve the question."
      >
        <Reveal>
          <InteractiveFrame>
            <OpportunityOrRiskClassifier />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 14. PRACTICAL FRAMEWORK ===================== */}
      <ConceptSection
        index="9.3.14"
        eyebrow="Section 14 · A practical mispricing framework"
        title="Four pillars — valuation, explanation, correction, survival"
        intro="A thesis that survives all four pillars is meaningfully stronger than one that survives only the first."
      >
        <Reveal>
          <InteractiveFrame>
            <PracticalMispricingFramework />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 15. MISCONCEPTIONS ===================== */}
      <ConceptSection
        index="9.3.15"
        eyebrow="Section 15 · What market mistakes do not imply"
        title="Five misconceptions to retire"
        intro="Recognizing market mistakes is useful. Using them as proof that beating the market is easy is dangerous."
      >
        <Reveal>
          <InteractiveFrame>
            <MarketMistakeMisconceptions />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 16. KNOWLEDGE CHECK ===================== */}
      <ConceptSection
        index="9.3.16"
        eyebrow="Section 16 · Knowledge check"
        title="Test your understanding"
        intro="Seven scenario-based questions covering behavioral biases, limits to arbitrage, mispricing versus compensation for risk, and the strategy lifecycle."
      >
        <Reveal>
          <MasteryCheck
            passCount={5}
            onComplete={() => report()}
            continueLabel="Continue"
            continueHref="/lessons/information-and-prices"
            questions={QUESTIONS}
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== 17. CLOSING SYNTHESIS ===================== */}
      <ConceptSection
        index="9.3.17"
        eyebrow="Section 17 · Closing synthesis"
        title="Mistakes are real — and so are the constraints that protect them"
        intro="The practical conclusion for every investor."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <p className="ops-body max-w-3xl text-[18px] leading-[1.6] text-white sm:text-[20px]">
              Markets make mistakes because investors are imperfect, information is difficult to
              interpret, and financial constraints can amplify behavior. But those same constraints
              also make market mistakes difficult and dangerous to exploit.
            </p>
            <p className="ops-body mt-5 max-w-3xl text-[16px] leading-[1.6] text-slate-100">
              An apparent mispricing is not a free lunch. The investor must be right about value,
              understand why the price may be wrong, survive until the correction, and distinguish
              opportunity from compensation for hidden risk.
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
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
              Toward Lesson 9.4
            </div>
            <p className="ops-body mt-3 text-[18px] leading-[1.6] text-white">
              Given that markets are difficult to beat but not perfectly efficient, what rules
              should guide an investor&apos;s actual decisions?
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue"
          continueHref="/lessons/information-and-prices"
        />
      </Reveal>

      <Reveal className="mt-8">
        <EMSourcePanel sources={SOURCES} />
      </Reveal>
    </EMLayout>
  );
}
