"use client";

import {
  Reveal,
  SectionHeading,
  Panel,
  DefinitionCard,
  FormulaExplainer,
  InlineMath,
  MasteryCheck,
  type MasteryQuestion,
  LessonSummary,
} from "./shared";
import FILayout from "./FILayout";
import FIModuleMap from "./FIModuleMap";
import LessonSourcePanel from "./LessonSourcePanel";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import { useReportFIComplete } from "@/lib/fi-progress";

// Chapter 1: Law of one price
import MarketThermometerBridge from "./MarketThermometerBridge";
import CashFlowMatchScanner from "./CashFlowMatchScanner";
import LawOfOnePriceEngine from "./LawOfOnePriceEngine";
import STRIPSReplicatorDesk from "./STRIPSReplicatorDesk";
import ShortSaleFrictionSwitch from "./ShortSaleFrictionSwitch";
// Chapter 2: Arbitrage and overdetermined systems
import MatrixMispricingLab from "./MatrixMispricingLab";
import ArbitrageDeskRealityPanel from "./ArbitrageDeskRealityPanel";
// Chapter 3: Duration
import PriceYieldCurve from "./PriceYieldCurve";
import DurationBalanceScale from "./DurationBalanceScale";
import DurationTableBuilder from "./DurationTableBuilder";
import DurationShockSimulator from "./DurationShockSimulator";
import DurationLevers from "./DurationLevers";
import PaymentFrequencySwitch from "./PaymentFrequencySwitch";
// Chapter 4: Convexity and portfolio risk
import BendingPriceCurve from "./BendingPriceCurve";
import ApproximationConsole from "./ApproximationConsole";
import BondPortfolioRiskMixer from "./BondPortfolioRiskMixer";

const LEARNING_OBJECTIVES = [
  "Explain why market prices are informative but not automatically correct.",
  "Explain the law of one price and why it does not require equilibrium.",
  "Identify the arbitrage direction when a coupon bond and STRIPS portfolio have different prices.",
  "Explain why short selling and transaction costs matter for arbitrage.",
  "Explain how multiple coupon bonds create an overdetermined pricing system.",
  "Define Macaulay duration as a present-value-weighted average payment time.",
  "Define modified duration as approximate price sensitivity to yield changes.",
  "Calculate duration from cash flows.",
  "Explain how coupon rate, YTM, and maturity affect duration.",
  "Define convexity as curvature in the price-yield relationship.",
  "Use duration plus convexity to approximate bond price changes.",
  "Explain why portfolio duration and convexity are value-weighted averages.",
];

const SUMMARY_POINTS = [
  "Market prices are informative but not automatically correct — they are current sentiment, not truth.",
  "Identical future cash flows should have identical prices. That is the law of one price.",
  "The law of one price does not require a full equilibrium model — only that someone prefers more money to less.",
  "Arbitrage means buying the cheap cash-flow stream and selling the expensive one: no money down, no future net obligation, positive value today.",
  "Short-selling restrictions and transaction costs can prevent arbitrage from closing price gaps.",
  "Multiple coupon bonds create an overdetermined system of equations. No solution can mean mispricing.",
  "Bond prices and yields move inversely.",
  "Macaulay duration is the present-value-weighted average time to receive cash flows.",
  "Modified duration approximates the percentage price change for a small yield move.",
  "Convexity captures curvature and improves approximations for larger yield moves.",
  "Portfolio duration and convexity are value-weighted averages of component bonds.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "What does the law of one price say?",
    choices: [
      {
        id: "same",
        label:
          "Two identical future cash-flow streams should have the same market price.",
      },
      { id: "equilibrium", label: "Supply must equal demand in every market." },
      { id: "fed", label: "The Fed sets the correct price for every bond." },
    ],
    correctId: "same",
    hint: "Same cash flows, same dates → same price.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "Does the law of one price require supply-demand equilibrium?",
    choices: [
      {
        id: "no",
        label:
          "No. It follows from the ability of at least one trader to prefer more money to less.",
      },
      { id: "yes", label: "Yes. Without equilibrium, prices are meaningless." },
      { id: "sometimes", label: "Only in liquid markets." },
    ],
    correctId: "no",
    hint: "The professor's point: it does not require a full equilibrium model.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "A coupon bond is more expensive than its matching STRIPS portfolio. What is the idealized arbitrage direction?",
    choices: [
      {
        id: "short",
        label: "Short the coupon bond, buy the STRIPS portfolio.",
      },
      { id: "buy", label: "Buy the coupon bond, short the STRIPS." },
      { id: "wait", label: "Wait for prices to converge." },
    ],
    correctId: "short",
    hint: "Sell the expensive side, buy the cheap side.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "Why can short-sale restrictions weaken arbitrage?",
    choices: [
      {
        id: "borrow",
        label:
          "The trader may not be able to sell the expensive asset without already owning it.",
      },
      { id: "cost", label: "Short selling is always free." },
      { id: "illegal", label: "Short selling is illegal in all markets." },
    ],
    correctId: "borrow",
    hint: "Short selling means borrowing and selling something you do not own.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "What does it mean if an overdetermined fixed-income pricing system has no solution?",
    choices: [
      {
        id: "misprice",
        label:
          "At least one bond price is inconsistent with the others — a possible mispricing signal.",
      },
      { id: "broken", label: "The math is wrong." },
      { id: "equilibrium", label: "The market is in perfect equilibrium." },
    ],
    correctId: "misprice",
    hint: "In fixed-income arbitrage, no solution may be the interesting part.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "If yield rises, what usually happens to a normal bond price?",
    choices: [
      { id: "falls", label: "It falls." },
      { id: "rises", label: "It rises." },
      { id: "unchanged", label: "It stays the same." },
    ],
    correctId: "falls",
    hint: "Bond prices and yields move inversely.",
  },
  {
    id: "q7",
    type: "single",
    prompt: "What is Macaulay duration?",
    choices: [
      {
        id: "weighted",
        label:
          "The present-value-weighted average time to receive the bond's cash flows.",
      },
      { id: "maturity", label: "The bond's final maturity date." },
      { id: "coupon", label: "The annual coupon divided by face value." },
    ],
    correctId: "weighted",
    hint: "Think of it as a balance point on a timeline of present values.",
  },
  {
    id: "q8",
    type: "single",
    prompt: "What happens to duration when coupon rate rises, all else equal?",
    choices: [
      {
        id: "decreases",
        label:
          "Duration usually decreases because more value is received earlier.",
      },
      { id: "increases", label: "Duration usually increases." },
      { id: "same", label: "Duration stays the same." },
    ],
    correctId: "decreases",
    hint: "Higher coupons put more weight on earlier cash flows.",
  },
  {
    id: "q9",
    type: "single",
    prompt: "What does modified duration approximate?",
    choices: [
      {
        id: "pct",
        label: "The percentage price change for a small change in yield.",
      },
      { id: "dollar", label: "The dollar price of the bond." },
      { id: "time", label: "The time to maturity." },
    ],
    correctId: "pct",
    hint: "ΔP/P ≈ −D*_m × Δy.",
  },
  {
    id: "q10",
    type: "single",
    prompt: "Why is convexity useful?",
    choices: [
      {
        id: "curvature",
        label:
          "It captures curvature and improves price-change estimates when yield moves are larger.",
      },
      { id: "slope", label: "It measures the slope of the yield curve." },
      { id: "time", label: "It measures time to maturity." },
    ],
    correctId: "curvature",
    hint: "Duration is slope. Convexity is bend.",
  },
  {
    id: "q11",
    type: "single",
    prompt:
      "A portfolio has more weight in long-duration bonds. What happens to portfolio interest-rate sensitivity?",
    choices: [
      { id: "increases", label: "It increases." },
      { id: "decreases", label: "It decreases." },
      { id: "same", label: "It stays the same." },
    ],
    correctId: "increases",
    hint: "Portfolio duration is a value-weighted average.",
  },
];

export default function Lesson3_3() {
  const report = useReportFIComplete(
    "fixed-income-law-one-price-arbitrage-duration-convexity",
  );

  return (
    <FILayout>
      {/* =================================================================== */}
      {/* HERO                                                                */}
      {/* =================================================================== */}
      <PVHero
        index="3.3"
        eyebrow="Lesson 3.3 · Module 3"
        heading="Same cash flows, same price."
        subheading="Bond pricing is not just a formula exercise. If two portfolios deliver the same dollars on the same dates, they should have the same price. If they do not, arbitrage logic appears. Then duration and convexity measure how those bond prices move when yields move."
        bullets={[
          "Market prices → Law of one price → Arbitrage → Duration → Convexity",
          "Decode why identical cash flows must have identical prices",
          "Learn how short selling and frictions constrain arbitrage",
          "Measure interest-rate risk with duration and convexity",
        ]}
        primaryLabel="Start Arbitrage, Duration, and Convexity"
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
      {/* MODULE MAP                                                          */}
      {/* =================================================================== */}
      <Reveal className="mt-10">
        <FIModuleMap />
      </Reveal>

      {/* =================================================================== */}
      {/* CHAPTER 1 — Market prices, same cash flows, same price              */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="01"
          eyebrow="Chapter 1"
          title="Market prices, same cash flows, same price"
        />
      </Reveal>
      <Reveal className="mt-5">
        <p className="ops-body text-[16px] text-slate-200">
          Before we can talk about arbitrage or risk, we need to understand what
          a bond price is really telling us. A Treasury yield is not a moral
          truth. It is a market price translated into a rate. Market prices are
          a window into current sentiment, fear, liquidity, and expectations —
          useful, but not a crystal ball.
        </p>
      </Reveal>

      {/* SECTION 1 — Market prices are current sentiment, not correctness */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.1"
          eyebrow="Section 1"
          title="Market prices are current sentiment, not correctness"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The lecture begins by comparing the yield curve from one week to the
            next during the 2008 crisis. The short end of the Treasury curve had
            been extremely low because investors were rushing into short-term
            Treasury bills. A week later, the three-month Treasury yield had
            moved higher, suggesting that the panic was less severe than before.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            When investors rush into Treasury bills, the price of those bills
            rises and the yield falls. A very low short-term Treasury yield can
            mean extreme demand for safety and liquidity. It does{" "}
            <strong className="text-white">not</strong> mean &quot;the correct
            interest rate has been discovered forever.&quot; It means that
            market participants, at that moment, are willing to accept a very
            low yield to hold a very safe, liquid instrument.
          </p>
          <div className="mt-4 rounded-lg border border-accent-purple/30 bg-accent-purple/5 p-4">
            <div className="ops-caption text-[11px] text-accent-purple">
              Professor&apos;s note
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              Do not ask whether the price is correct. Ask what information and
              sentiment the price reflects, and whether you want to use that
              price in your own calculation.
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <MarketThermometerBridge />
      </Reveal>

      {/* SECTION 2 — Recall: coupon bonds as packages of discount bonds */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.2"
          eyebrow="Section 2"
          title="Recall: coupon bonds as packages of discount bonds"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A 3-year 5% coupon bond with $1,000 face value has cash flows of $50
            in year 1, $50 in year 2, and $1,050 in year 3. The same cash flows
            can be created by holding 50 one-year STRIPS, 50 two-year STRIPS,
            and 1050 three-year STRIPS. The coupon bond and the STRIPS portfolio
            produce{" "}
            <strong className="text-white">identical future cash flows</strong>.
            This sets up the law of one price.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <CashFlowMatchScanner />
      </Reveal>

      {/* SECTION 3 — Law of one price */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.3"
          eyebrow="Section 3"
          title="The law of one price"
        />
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="Law of one price">
          Two identical cash flows must have the same market price.
        </DefinitionCard>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            This does not require a full equilibrium model. It does not require
            a perfect theory of supply and demand. It requires only that{" "}
            <strong className="text-white">
              at least one market participant prefers more money to less money
            </strong>
            .
          </p>
          <p className="ops-body mt-3 text-[16px] text-slate-200">
            If two identical cash-flow streams sell for different prices: buy
            the cheaper one, sell the more expensive one, receive money today,
            and use the future cash flows from the asset you bought to offset
            the future obligations from the asset you sold.
          </p>
          <div className="mt-4 rounded-lg border border-accent-green/30 bg-accent-green/5 p-4">
            <div className="ops-caption text-[11px] text-accent-green">
              Definition
            </div>
            <p className="ops-definition mt-1.5 text-[16px]">
              Arbitrage is a free lunch in the idealized model: no money down,
              no future net obligation, and positive money today.
            </p>
          </div>
          <div className="mt-4 rounded-lg border border-accent-purple/30 bg-accent-purple/5 p-4">
            <div className="ops-caption text-[11px] text-accent-purple">
              Professor&apos;s note
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              If this law appears to fail, do not complain that finance theory
              broke. First ask whether you can actually trade it.
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <LawOfOnePriceEngine />
      </Reveal>

      {/* SECTION 4 — Arbitrage direction: coupon bond versus STRIPS */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.4"
          eyebrow="Section 4"
          title="Arbitrage direction: coupon bond versus STRIPS"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Coupon bond as STRIPS portfolio"
          formula={"P = C P_{0,1} + C P_{0,2} + \\cdots + (C+F)P_{0,T}"}
          meaning="A coupon bond's price should equal the cost of buying each cash flow separately as a zero-coupon bond."
          variables={[
            { symbol: "P", description: "coupon bond price" },
            { symbol: "C", description: "coupon payment" },
            { symbol: "F", description: "face value" },
            {
              symbol: "P_{0,t}",
              description:
                "price today of a pure discount bond paying $1 at time t",
            },
            { symbol: "T", description: "maturity" },
          ]}
          interpretation="If the coupon bond costs more than the STRIPS portfolio, short the bond and buy the STRIPS. If it costs less, do the reverse."
        />
      </Reveal>
      <Reveal className="mt-6">
        <STRIPSReplicatorDesk />
      </Reveal>

      {/* SECTION 5 — Why short selling matters */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.5"
          eyebrow="Section 5"
          title="Why short selling matters"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The arbitrage trade may require selling something you do not already
            own. That is <strong className="text-white">short selling</strong>.
            To short a security, you must borrow it, sell it, and later return
            it. This may be costly or impossible.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            If short selling is banned or expensive, the law-of-one-price force
            becomes weaker. Prices can remain misaligned because the trade that
            would normally close the gap cannot be executed easily.
          </p>
          <div className="mt-4 rounded-lg border border-accent-purple/30 bg-accent-purple/5 p-4">
            <div className="ops-caption text-[11px] text-accent-purple">
              Professor&apos;s note
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              When short sales are restricted, finance theory is not destroyed,
              but one of the mechanisms that enforces pricing relationships is
              on vacation.
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <ShortSaleFrictionSwitch />
      </Reveal>

      {/* =================================================================== */}
      {/* CHAPTER 2 — Arbitrage and overdetermined bond systems              */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="02"
          eyebrow="Chapter 2"
          title="Arbitrage, short selling, and overdetermined bond systems"
        />
      </Reveal>

      {/* SECTION 6 — Multiple coupon bonds and overdetermined systems */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.1"
          eyebrow="Section 6"
          title="Multiple coupon bonds and overdetermined systems"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            With one coupon bond, we can compare it with a matching STRIPS
            portfolio. With many coupon bonds, the same idea becomes a system of
            equations. Each bond price should equal the value of its cash flows
            discounted by the appropriate pure discount bond prices.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            Usually there are more bonds than maturity points — more equations
            than unknown discount factors. The system is{" "}
            <strong className="text-white">overdetermined</strong>. If no
            solution exists, at least one price is inconsistent with the others.
            In finance, &quot;no solution&quot; can mean a mispricing signal.
          </p>
          <div className="mt-4 rounded-lg border border-accent-purple/30 bg-accent-purple/5 p-4">
            <div className="ops-caption text-[11px] text-accent-purple">
              Professor&apos;s note
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              In ordinary algebra, no solution can feel like failure. In
              fixed-income arbitrage, no solution may be the interesting part.
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <MatrixMispricingLab />
      </Reveal>

      {/* SECTION 7 — Fixed-income arbitrage as linear algebra plus trading reality */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.2"
          eyebrow="Section 7"
          title="Fixed-income arbitrage: linear algebra plus trading reality"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Fixed-income arbitrage can be seen as looking across many bonds and
            many implied discount factors. In a real market, there may be
            hundreds of bonds and far fewer maturity points. Traders search for
            inconsistencies. But this is not something retail investors should
            casually attempt — transaction costs, financing costs, short-selling
            constraints, liquidity, callable features, and speed all matter.
          </p>
          <div className="mt-4 rounded-lg border border-accent-purple/30 bg-accent-purple/5 p-4">
            <div className="ops-caption text-[11px] text-accent-purple">
              Professor&apos;s note
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              Do not try this at home. Institutional fixed-income arbitrage
              requires models, data, financing, execution, and risk controls. In
              the 1970s, MIT-trained quants at Salomon Brothers used
              simultaneous linear equations to search for bond mispricings —
              high-school algebra scaled up with market data and execution. One
              trader reportedly earned a very large bonus doing it.
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <ArbitrageDeskRealityPanel />
      </Reveal>

      {/* =================================================================== */}
      {/* CHAPTER 3 — Duration and price sensitivity                          */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="03"
          eyebrow="Chapter 3"
          title="Duration and price sensitivity"
        />
      </Reveal>
      <Reveal className="mt-5">
        <p className="ops-body text-[16px] text-slate-200">
          Once we understand how bonds are priced and why prices must be
          internally consistent, the next question is risk: how much does a bond
          or bond portfolio move when yields move? Duration and convexity
          provide fast measures of that sensitivity.
        </p>
      </Reveal>

      {/* SECTION 8 — Bond prices and interest-rate risk */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.1"
          eyebrow="Section 8"
          title="Bond prices and interest-rate risk"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Bond prices are functions of yield. If yield changes, price changes.
            The relationship is inverse: yield up → price down, yield down →
            price up. The slope tells us how sensitive the bond price is to
            yield changes. A steeper slope means more price risk around that
            yield.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <PriceYieldCurve />
      </Reveal>

      {/* SECTION 9 — Duration intuition before formula */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.2"
          eyebrow="Section 9"
          title="Duration intuition before the formula"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A longer maturity bond is usually more sensitive to yield changes
            because its cash flows are farther in the future. A small change in
            the discount rate is compounded over more periods. If a zero-coupon
            bond pays only at year 30, its duration is 30 years. If a bond pays
            coupons along the way, some value arrives earlier, so duration is
            less than final maturity.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            <strong className="text-white">Core intuition:</strong> Duration is
            the average time at which the bond&apos;s value is received,
            weighted by present value.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <DurationBalanceScale />
      </Reveal>

      {/* SECTION 10 — Macaulay duration formula */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.3"
          eyebrow="Section 10"
          title="Macaulay duration formula"
        />
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="Macaulay duration">
          The present-value-weighted average term to maturity.
        </DefinitionCard>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Macaulay duration"
          formula={"D_m = \\sum_{k=1}^{T} k\\,\\omega_k"}
          meaning="Each cash-flow date receives a weight equal to that cash flow's share of total present value. Duration averages the payment dates using those weights."
          variables={[
            { symbol: "D_m", description: "Macaulay duration (in periods)" },
            { symbol: "k", description: "payment period index" },
            {
              symbol: "\\omega_k",
              description: "present-value weight of cash flow at time k",
            },
          ]}
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Present-value weights"
          formula={"\\omega_k = \\frac{PV(C_k)}{P} = \\frac{C_k/(1+y)^k}{P}"}
          meaning="The weight is each cash flow's present value divided by the bond's total price. The weights sum to one."
          variables={[
            { symbol: "C_k", description: "cash flow at time k" },
            { symbol: "y", description: "yield per period" },
            { symbol: "P", description: "bond price = sum of all PV(C_k)" },
          ]}
          interpretation="Because weights sum to one, duration is a proper weighted average — not an arbitrary sum."
        />
      </Reveal>

      {/* SECTION 11 — MIT 4-year Treasury note duration example */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.4"
          eyebrow="Section 11"
          title="MIT example: 4-year Treasury note duration"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Consider a 4-year Treasury note with a face value of $100, a coupon
            rate of 7%, a market price of $103.50, and a yield of 6%. Coupons
            are paid semiannually, so there are 8 periods, the coupon per period
            is $3.50, and the semiannual yield is 3%.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <DurationTableBuilder />
      </Reveal>

      {/* SECTION 12 — Modified duration and price sensitivity */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.5"
          eyebrow="Section 12"
          title="Modified duration and price sensitivity"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Macaulay duration gives weighted timing. Modified duration converts
            duration into approximate price sensitivity. If yield moves up by
            0.1%, the bond price decreases by approximately 0.6860%.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Modified duration"
          formula={
            "\\frac{1}{P}\\frac{\\partial P}{\\partial y} = -\\frac{D_m}{1+y} = -D_m^*"
          }
          meaning="Modified duration is Macaulay duration divided by one plus the per-period yield. The negative sign means price and yield move inversely."
          variables={[
            { symbol: "D_m", description: "Macaulay duration" },
            { symbol: "D_m^*", description: "modified duration" },
            { symbol: "y", description: "yield per period" },
          ]}
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Approximate percentage price change"
          formula={"\\frac{\\Delta P}{P} \\approx -D_m^* \\, \\Delta y"}
          meaning="For a small yield change, multiply modified duration by the yield change (with a negative sign) to get the approximate percentage price change."
          substitution={"\\frac{\\Delta P}{P} \\approx -6.86 \\times 0.001"}
          result="≈ −0.686%"
          interpretation="A 10 basis point yield increase reduces the bond price by about 0.686%."
        />
      </Reveal>
      <Reveal className="mt-6">
        <DurationShockSimulator />
      </Reveal>

      {/* SECTION 13 — What changes duration? */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.6"
          eyebrow="Section 13"
          title="What changes duration?"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <ul className="space-y-2.5">
            <li className="ops-body text-[15px] text-slate-200">
              <InlineMath>{"\\bullet"}</InlineMath> Duration{" "}
              <strong className="text-white">decreases</strong> with coupon rate
              (more value arrives earlier).
            </li>
            <li className="ops-body text-[15px] text-slate-200">
              <InlineMath>{"\\bullet"}</InlineMath> Duration{" "}
              <strong className="text-white">decreases</strong> with YTM
              (distant cash flows shrink).
            </li>
            <li className="ops-body text-[15px] text-slate-200">
              <InlineMath>{"\\bullet"}</InlineMath> Duration usually{" "}
              <strong className="text-white">increases</strong> with maturity.
            </li>
            <li className="ops-body text-[15px] text-slate-200">
              <InlineMath>{"\\bullet"}</InlineMath> For bonds at par or premium,
              duration always increases with maturity.
            </li>
            <li className="ops-body text-[15px] text-slate-200">
              <InlineMath>{"\\bullet"}</InlineMath> For deep discount bonds,
              duration can decrease with maturity — but empirically, duration
              usually increases.
            </li>
          </ul>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <DurationLevers />
      </Reveal>

      {/* SECTION 14 — Intra-year coupons */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.7"
          eyebrow="Section 14"
          title="Intra-year coupons"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Annual Macaulay duration (intra-year coupons)"
          formula={"D_m^{annual} = \\sum_{k=1}^{T}\\frac{k\\,\\omega_k}{q}"}
          meaning="Divide the period-based duration by the number of payments per year to annualize it."
          variables={[
            {
              symbol: "q",
              description:
                "number of coupon payments per year (e.g. q=2 for semiannual)",
            },
            { symbol: "T", description: "number of payment periods" },
          ]}
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Annual modified duration"
          formula={"D_m^{*,annual} = \\frac{D_m^{annual}}{1+y/q}"}
          meaning="The annualized modified duration adjusts for the compounding frequency."
        />
      </Reveal>
      <Reveal className="mt-6">
        <PaymentFrequencySwitch />
      </Reveal>

      {/* =================================================================== */}
      {/* CHAPTER 4 — Convexity and portfolio interest-rate risk              */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="04"
          eyebrow="Chapter 4"
          title="Convexity and portfolio interest-rate risk"
        />
      </Reveal>

      {/* SECTION 15 — Convexity intuition */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.1"
          eyebrow="Section 15"
          title="Convexity intuition"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            <strong className="text-white">
              Duration is slope. Convexity is bend.
            </strong>{" "}
            Bond price as a function of yield is not a straight line. The
            duration line is a local linear approximation. Convexity measures
            how the slope itself changes as yield changes.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            For small yield moves, duration may be enough. For larger yield
            moves, curvature matters. Convexity improves the approximation.
          </p>
          <div className="mt-4 rounded-lg border border-accent-purple/30 bg-accent-purple/5 p-4">
            <div className="ops-caption text-[11px] text-accent-purple">
              Professor&apos;s note
            </div>
            <p className="ops-body mt-1.5 text-[15px] text-slate-200">
              Today Excel can reprice the bond directly. But duration and
              convexity still give quick intuition about risk, especially for
              large portfolios.
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <BendingPriceCurve />
      </Reveal>

      {/* SECTION 16 — Convexity formula */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.2"
          eyebrow="Section 16"
          title="Convexity formula"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Convexity"
          formula={"V_m = \\frac{1}{P}\\frac{\\partial^2 P}{\\partial y^2}"}
          meaning="Convexity is the second derivative of bond price with respect to yield, divided by price. It captures curvature."
          variables={[
            { symbol: "V_m", description: "convexity" },
            { symbol: "P", description: "bond price" },
            { symbol: "y", description: "yield" },
          ]}
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Second derivative for a simple bond"
          formula={
            "\\frac{\\partial^2 P}{\\partial y^2} = \\frac{1}{(1+y)^2}\\sum_{k=1}^{T}\\frac{k(k+1)\\,C_k}{(1+y)^k}"
          }
          meaning="The second derivative sums k(k+1) times each discounted cash flow. Longer-dated cash flows contribute more curvature."
          interpretation="Convexity captures how duration changes as yield changes."
        />
      </Reveal>

      {/* SECTION 17 — Duration-convexity approximation */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.3"
          eyebrow="Section 17"
          title="Duration-convexity approximation"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Duration-convexity approximation"
          formula={
            "P(y_0) \\approx P(y)\\left[1 - D_m^*(y_0-y) + \\frac{1}{2}V_m(y_0-y)^2\\right]"
          }
          meaning="Approximate the new price after a yield change using duration (linear) plus convexity (quadratic) correction."
          variables={[
            { symbol: "P(y)", description: "current price at yield y" },
            { symbol: "y_0", description: "new yield" },
            { symbol: "D_m^*", description: "modified duration" },
            { symbol: "V_m", description: "convexity" },
          ]}
          substitution={
            "P(0.08) \\approx 100\\left[1 - 3.509846 \\times 0.02 + \\frac{1}{2}(14.805972)(0.02)^2\\right]"
          }
          result="P(0.08) ≈ 93.276 vs exact 93.267"
          interpretation="The approximation differs by about a penny. A penny is small for one bond, but meaningful for very large portfolios."
        />
      </Reveal>
      <Reveal className="mt-6">
        <ApproximationConsole />
      </Reveal>

      {/* SECTION 18 — Portfolio duration and convexity */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.4"
          eyebrow="Section 18"
          title="Portfolio duration and convexity"
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Portfolio modified duration"
          formula={"D_m^*(P) = \\sum_j \\frac{P_j}{P}\\,D_{m,j}^*"}
          meaning="Portfolio modified duration is the market-value-weighted average of each bond's modified duration."
          variables={[
            { symbol: "P_j", description: "market value of bond j" },
            { symbol: "P", description: "total portfolio value" },
            { symbol: "D_{m,j}^*", description: "modified duration of bond j" },
          ]}
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Portfolio convexity"
          formula={"V_m(P) = \\sum_j \\frac{P_j}{P}\\,V_{m,j}"}
          meaning="Portfolio convexity is the market-value-weighted average of each bond's convexity."
        />
      </Reveal>
      <Reveal className="mt-6">
        <BondPortfolioRiskMixer />
      </Reveal>

      {/* =================================================================== */}
      {/* MASTERY CHECK                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="05"
          eyebrow="Mastery"
          title="Summary and mastery check"
        />
      </Reveal>
      <Reveal className="mt-6">
        <MasteryCheck
          title="Lesson 3.3 mastery check"
          passCount={8}
          onComplete={() => report()}
          continueLabel="Continue to Credit Risk and Securitization"
          continueHref="/lessons/fixed-income-corporate-bonds-default-risk-credit-spreads-securitization"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Credit Risk and Securitization"
          continueHref="/lessons/fixed-income-corporate-bonds-default-risk-credit-spreads-securitization"
          backLabel="Back to Spot Rates, Forwards, and Coupon Bonds"
          backHref="/lessons/fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds"
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SOURCES AND NOTES                                                   */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <LessonSourcePanel
          sources={[
            "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Fixed-Income Securities Part III video and slides.",
            "MIT 15.401 Fixed-Income Securities slides 28–43.",
            "TreasuryDirect, Treasury marketable securities and Treasury STRIPS.",
            "FINRA investor education, bond yield and duration explanations.",
          ]}
        />
      </Reveal>
    </FILayout>
  );
}
