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

// Chapter 1 components
import MarketThermometerIntro from "./MarketThermometerIntro";
import OnePaymentBondRecap from "./OnePaymentBondRecap";
import AuctionFutureDollar from "./AuctionFutureDollar";
import ZeroCouponTranslator from "./ZeroCouponTranslator";
import SpotRateDecoder from "./SpotRateDecoder";
import RateNotationSplitScreen from "./RateNotationSplitScreen";
import RateChainCompressor from "./RateChainCompressor";
import STRIPSSpotRateExtractor from "./STRIPSSpotRateExtractor";
import TermStructureTransformer from "./TermStructureTransformer";
import FlightToLiquidityPanel from "./FlightToLiquidityPanel";
// Chapter 2
import SpotVsForwardTimeline from "./SpotVsForwardTimeline";
import TwoPathForwardRateBuilder from "./TwoPathForwardRateBuilder";
import CFOHedgeSimulator from "./CFOHedgeSimulator";
import SyntheticForwardLoanBuilder from "./SyntheticForwardLoanBuilder";
// Chapter 3
import CouponBondCashFlowPackage from "./CouponBondCashFlowPackage";
import CouponBondYtmSolver from "./CouponBondYtmSolver";
import YieldCurveRealityCheck from "./YieldCurveRealityCheck";
// Chapter 4
import TermStructureTheoryArena from "./TermStructureTheoryArena";
import CouponBondDecomposer from "./CouponBondDecomposer";
import ArbitragePreview from "./ArbitragePreview";

const LEARNING_OBJECTIVES = [
  "Explain what information a zero-coupon bond price contains.",
  "Define today's T-year spot rate and distinguish it from future one-year rates.",
  "Explain why a T-year spot rate is a geometric average representation of one-year rates.",
  "Infer spot rates from STRIPS prices.",
  "Compute a one-year forward rate from spot rates.",
  "Explain why a CFO might lock in a forward rate rather than speculate.",
  "Explain YTM as a single-rate summary of coupon-bond cash flows.",
  "Explain why coupon bonds can be valued as portfolios of pure discount bonds.",
];

const SUMMARY_POINTS = [
  "A zero-coupon bond price tells us how the market values one future dollar at one future date.",
  "Today's T-year spot rate is backed out from a T-year zero price — it is a geometric average of future one-year rates.",
  "Capital R means a one-year rate for one period. Lowercase r means a multi-year rate observed today.",
  "The term structure maps maturities to rates. Plotted, it is a yield curve — informative, but not a crystal ball.",
  "Forward rates are today's rates for future transactions. They are not guaranteed future spot rates.",
  "YTM is a convenient single-number summary of a coupon bond, not the full spot-rate curve.",
  "Coupon bonds can be decomposed into zero-coupon bonds. Identical cash flows should have identical prices — otherwise arbitrage.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt:
      "A 5-year zero-coupon bond trades at 0.797 per $1 face value. What information does that price contain?",
    choices: [
      {
        id: "spot",
        label:
          "It implies today's 5-year spot rate — the annualized rate connecting $0.797 today to $1 in five years.",
      },
      { id: "coupon", label: "It tells us the bond's coupon rate." },
      { id: "default", label: "It tells us the issuer's default probability." },
    ],
    correctId: "spot",
    hint: "A zero has one payment at one date. Price + face + maturity → one rate.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "What does r_{0,5} mean?",
    choices: [
      {
        id: "today5",
        label:
          "Today's annualized 5-year spot rate — the first subscript is the pricing date, the second is the maturity date.",
      },
      { id: "year5", label: "The one-year rate that will exist in year 5." },
      { id: "fiveyr", label: "An average of the last 5 years of rates." },
    ],
    correctId: "today5",
    hint: "First subscript = today. Second subscript = maturity.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "What does capital R₂ represent?",
    choices: [
      {
        id: "oneyr",
        label: "A one-year rate for the period from year 1 to year 2.",
      },
      { id: "twoyr", label: "Today's 2-year spot rate." },
      { id: "future", label: "A rate the Fed will set in year 2." },
    ],
    correctId: "oneyr",
    hint: "Capital R is always a one-year rate for one specific one-year period.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "Why is r_{0,T} described as a geometric average of one-year rates, not an arithmetic average?",
    choices: [
      {
        id: "geo",
        label:
          "Because compounding is multiplicative: (1+r_{0,T})^T = (1+R₁)(1+R₂)⋯(1+R_T), so r_{0,T} is the geometric mean of the chain.",
      },
      { id: "arith", label: "Because the professor said so." },
      { id: "linear", label: "Because rates add linearly over time." },
    ],
    correctId: "geo",
    hint: "Discounting multiplies growth factors. The average of products is geometric.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "What is the key difference between a forward rate and a future spot rate?",
    choices: [
      {
        id: "agree",
        label:
          "A forward rate is agreed today for a future period. A future spot rate is the actual rate that will exist then — unknown today.",
      },
      { id: "same", label: "They are always the same number." },
      {
        id: "past",
        label: "A forward rate looks at past data; a spot rate looks at today.",
      },
    ],
    correctId: "agree",
    hint: "Forward = known today. Future spot = realized later. They can differ.",
  },
  {
    id: "q6",
    type: "single",
    prompt:
      "In the CFO hedge example, why is 7% (today's 2-year spot rate) NOT the rate the CFO cares about?",
    choices: [
      {
        id: "period",
        label:
          "The CFO needs the rate from year 1 to year 2. 7% covers years 0 through 2. The relevant rate is the forward rate f₂ ≈ 9.04%.",
      },
      { id: "wrong", label: "Because 7% is too high." },
      { id: "coupon", label: "Because 7% is a coupon rate, not a spot rate." },
    ],
    correctId: "period",
    hint: "The CFO's money arrives in year 1 and is needed in year 2. The period is 1→2, not 0→2.",
  },
  {
    id: "q7",
    type: "single",
    prompt: "What is yield-to-maturity (YTM)?",
    choices: [
      {
        id: "summary",
        label:
          "The single discount rate that makes the present value of all promised coupon and principal payments equal the bond's market price.",
      },
      { id: "coupon", label: "The annual coupon divided by face value." },
      { id: "spot", label: "Today's spot rate for the bond's maturity." },
    ],
    correctId: "summary",
    hint: "YTM is one number that reprices every cash flow to match today's price.",
  },
  {
    id: "q8",
    type: "single",
    prompt:
      "A 3-year 5% coupon bond with $1,000 face can be replicated by what STRIPS portfolio?",
    choices: [
      {
        id: "correct",
        label:
          "50 one-year STRIPS, 50 two-year STRIPS, 1050 three-year STRIPS.",
      },
      { id: "each1000", label: "1000 of each maturity." },
      { id: "each50", label: "50 of each maturity." },
    ],
    correctId: "correct",
    hint: "Match the cash flows year by year: $50, $50, $1,050.",
  },
];

export default function Lesson3_2() {
  const report = useReportFIComplete(
    "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds",
  );

  return (
    <FILayout>
      {/* =================================================================== */}
      {/* HERO                                                                */}
      {/* =================================================================== */}
      <PVHero
        index="3.2"
        eyebrow="Lesson 3.2 · Module 3"
        heading="Bond prices are not magic, but they talk."
        subheading="A zero-coupon bond price tells us how the market values one future dollar. A set of zero-coupon prices becomes a yield curve. A yield curve lets us infer spot rates, forward rates, and the market's view of future interest rates — useful, but not a crystal ball."
        bullets={[
          "Prices → Spot rates → Yield curve → Forward rates → Decisions",
          "Decode notation before using it: R_t vs r_{0,T} vs f_t",
          "Lock in future lending or borrowing with forward rates",
          "Value coupon bonds as portfolios of zero-coupon bonds",
        ]}
        primaryLabel="Start Spot Rates, Forwards, and Coupon Bonds"
        secondaryLabel="View module map"
      />

      {/* Crisis hook */}
      <Reveal className="mt-2">
        <Panel>
          <div className="ops-caption text-[11px] text-accent-amber">
            Lecture hook
          </div>
          <p className="ops-body mt-2 text-[16px] text-slate-200">
            In the lecture, Professor Lo begins with crisis-era market news.
            Markets had priced in a Fed rate cut — but the Fed did something
            different. That is the first lesson of this entire module:{" "}
            <strong className="text-white">
              market prices contain information, but they are not perfect
              predictions.
            </strong>{" "}
            An $85 billion loan is &quot;a lot of money,&quot; but the point is
            not the number. The point is that prices reflected one expectation,
            and reality did something else.
          </p>
        </Panel>
      </Reveal>

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
          <ul className="mt-5 space-y-3">
            {LEARNING_OBJECTIVES.map((o, i) => (
              <li key={o} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-mono text-[12px] text-accent-cyan">
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
      {/* CHAPTER 1 — Prices, spot rates, and the term structure              */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="01"
          eyebrow="Chapter 1"
          title="Prices, spot rates, and the term structure"
        />
      </Reveal>
      <Reveal className="mt-5">
        <p className="ops-body text-[16px] text-slate-200">
          Before we introduce any notation, let&apos;s ask a simple question:
          what is a bond price actually telling us? The answer turns out to be
          surprisingly deep. A zero-coupon bond price tells us how the market
          values one specific dollar at one specific future date. And once we
          can read those prices, we can back out the interest rates the market
          is using.
        </p>
      </Reveal>

      {/* SECTION 1 — Market prices are thermometers, not crystal balls */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.1"
          eyebrow="Section 1"
          title="Market prices are thermometers, not crystal balls"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Market prices are like financial thermometers. They show what
            investors are willing to pay right now, given fear, liquidity,
            expectations, and available alternatives. But a thermometer is not a
            crystal ball. It gives a current reading, not a guaranteed future.
            Market prices implied one Fed outcome; the Fed did something else.
            The lesson is not that prices are useless — it is that{" "}
            <strong className="text-white">
              prices contain information, but they can still be wrong.
            </strong>
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <MarketThermometerIntro />
      </Reveal>

      {/* SECTION 2 — Start from the old problem: a pure discount bond */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.2"
          eyebrow="Section 2"
          title="Start from the old problem: a pure discount bond"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Last lesson, we priced pure discount bonds — bonds that pay only
            principal at maturity and no intermediate coupons. A pure discount
            bond is the{" "}
            <strong className="text-white">
              cleanest instrument for learning interest rates
            </strong>{" "}
            because it has exactly one payment at exactly one date. No coupons
            to complicate things. That simplicity is what lets us extract a
            rate.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <OnePaymentBondRecap />
      </Reveal>

      {/* SECTION 3 — Why different horizons need different rates */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.3"
          eyebrow="Section 3"
          title="Why different horizons need different rates"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A one-year rate is not necessarily the same as a five-year rate. The
            market can have different expectations about the economy, inflation,
            liquidity, and borrowing conditions at different horizons. So
            instead of asking &quot;what is the interest rate?&quot; — a
            question that has no single answer — ask:{" "}
            <em className="text-slate-100">
              &quot;What price would the market pay today for $1,000 in one
              year, $1,000 in two years, $1,000 in five years, and so on?&quot;
            </em>{" "}
            The market prices those pieces of paper. Once we have price and face
            value, we solve for the rate.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <AuctionFutureDollar />
      </Reveal>

      {/* SECTION 4 — What is a 5-year zero? */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.4"
          eyebrow="Section 4"
          title="What is a zero-coupon bond, and what is a 5-year zero?"
        />
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="Zero-coupon bond">
          A zero-coupon bond makes no intermediate coupon payments. It pays one
          amount at maturity. A &quot;5-year zero&quot; means a zero-coupon bond
          that pays at year 5.
        </DefinitionCard>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="The 5-year zero example"
          formula={"0.797 = \\frac{1}{(1+r_{0,5})^5}"}
          meaning="Today you pay $0.797. In five years you receive $1. What annualized rate connects those two values?"
          substitution={"r_{0,5} = \\left(\\frac{1}{0.797}\\right)^{1/5} - 1"}
          result="r_{0,5} ≈ 4.64%"
          interpretation="The price 0.797 means that $1 delivered in five years is worth $0.797 today. The annualized rate connecting those values is today's 5-year spot rate."
        />
      </Reveal>
      <Reveal className="mt-6">
        <ZeroCouponTranslator />
      </Reveal>

      {/* SECTION 5 — Decode spot-rate notation BEFORE using it */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.5"
          eyebrow="Section 5"
          title="Decode spot-rate notation before using it"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A spot rate is the rate observed today for money moving from today
            to a future date. Before we use the notation, let&apos;s decode it.
            The symbol <InlineMath>{"r_{0,5}"}</InlineMath> has two subscripts.
            The{" "}
            <strong className="text-white">
              first subscript is the pricing date
            </strong>{" "}
            — today, time 0. The{" "}
            <strong className="text-white">
              second subscript is the maturity date
            </strong>{" "}
            — year 5. Read it as: &quot;the annualized rate, observed today, for
            money paid at year 5.&quot;
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <SpotRateDecoder />
      </Reveal>

      {/* SECTION 6 — Capital R versus lowercase r */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.6"
          eyebrow="Section 6"
          title="Capital R versus lowercase r"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            This is the biggest conceptual hurdle in the entire lesson, so
            let&apos;s slow down. Professor Lo uses capital{" "}
            <InlineMath>{"R"}</InlineMath> and lowercase{" "}
            <InlineMath>{"r"}</InlineMath> to separate two different ideas:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/5 p-4">
              <div className="ops-caption text-[11px] text-accent-amber">
                Capital R
              </div>
              <div className="ops-body-strong mt-1.5 text-[16px] text-slate-50">
                <InlineMath>{"R_t"}</InlineMath> = a one-year rate for one
                specific one-year period.
              </div>
              <div className="ops-muted mt-1 text-[14px]">
                <InlineMath>{"R_1"}</InlineMath> = year 0→1.{" "}
                <InlineMath>{"R_2"}</InlineMath> = year 1→2. Always one year.
              </div>
            </div>
            <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-4">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Lowercase r
              </div>
              <div className="ops-body-strong mt-1.5 text-[16px] text-slate-50">
                <InlineMath>{"r_{0,T}"}</InlineMath> = one annualized rate
                observed today for the whole interval from 0 to T.
              </div>
              <div className="ops-muted mt-1 text-[14px]">
                Multi-year. Inferred from today&apos;s bond price.
              </div>
            </div>
          </div>
          <p className="ops-body mt-4 text-[15px] text-slate-300">
            Here is the key:{" "}
            <strong className="text-white">
              we do not observe the entire future sequence of R&apos;s today.
            </strong>{" "}
            We do not know what <InlineMath>{"R_2"}</InlineMath> or{" "}
            <InlineMath>{"R_3"}</InlineMath> will actually be. We observe prices
            today, and from those prices we infer{" "}
            <InlineMath>{"r_{0,T}"}</InlineMath>. The observable little r
            contains information about the market&apos;s view of the future path
            of rates — at least the market&apos;s current expectation of them.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <RateNotationSplitScreen />
      </Reveal>

      {/* SECTION 7 — Why r_{0,T} is a geometric average */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.7"
          eyebrow="Section 7"
          title="Why r_{0,T} is a geometric average of future one-year rates"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            If we could see the future sequence of one-year rates, a T-year pure
            discount bond could be priced by discounting through each one-year
            rate in the chain. But we cannot see the future. Instead, we observe
            today&apos;s bond price and face value. So we define today&apos;s
            T-year spot rate as the single annualized rate that gives the same
            price. It is terminology plus an accounting identity — but the
            identity is powerful.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <FormulaExplainer
          label="If future one-year rates were known"
          formula={"P_0 = \\frac{F}{(1+R_1)(1+R_2)\\cdots(1+R_T)}"}
          meaning="Discount the face value through each future one-year rate, one after another."
          interpretation="We cannot observe R₁, R₂, ..., R_T today. We only observe today's bond price."
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="What we actually observe and define"
          formula={"P_0 = \\frac{F}{(1+r_{0,T})^T}"}
          meaning="r_{0,T} is the single annualized rate that gives the same price as the full chain of one-year rates."
          variables={[
            {
              symbol: "P_0",
              description: "price today (observed in the market)",
            },
            { symbol: "F", description: "face value paid at maturity" },
            {
              symbol: "r_{0,T}",
              description: "today's T-year spot rate (backed out from price)",
            },
            { symbol: "T", description: "time to maturity in years" },
          ]}
          interpretation="r_{0,T} is a geometric average, not a simple arithmetic average. The observable little r contains information about the market's view of the future path of rates."
        />
      </Reveal>
      <Reveal className="mt-6">
        <RateChainCompressor />
      </Reveal>

      {/* SECTION 8 — STRIPS spot-rate extraction */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.8"
          eyebrow="Section 8"
          title="STRIPS spot-rate extraction"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            STRIPS behave like pure discount bonds because each one has no
            intermediate coupon payments. That makes them useful for extracting
            spot rates. Here is real MIT data from 2001-08-01. Click a row, and
            watch the spot rate emerge from the price.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <STRIPSSpotRateExtractor />
      </Reveal>

      {/* SECTION 9 — From many spot rates to the term structure */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.9"
          eyebrow="Section 9"
          title="From many spot rates to the term structure"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            If we observe prices for many discount bonds today, we can infer
            many spot rates: <InlineMath>{"r_{0,1}"}</InlineMath>,{" "}
            <InlineMath>{"r_{0,2}"}</InlineMath>,{" "}
            <InlineMath>{"r_{0,5}"}</InlineMath>,{" "}
            <InlineMath>{"r_{0,10}"}</InlineMath>, and so on. This mapping of
            maturity to rate is the{" "}
            <strong className="text-white">
              term structure of interest rates
            </strong>
            . When plotted, it is a yield curve.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            An upward-sloping curve suggests that longer maturities have higher
            average rates. This may reflect expected future rate increases,
            inflation expectations, or compensation for lending longer. A
            downward-sloping curve suggests lower future rates or strong demand
            for long-term bonds — but it does{" "}
            <strong className="text-white">not</strong> guarantee the future.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <TermStructureTransformer />
      </Reveal>

      {/* SECTION 10 — Crisis-era yield curve interpretation */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.10"
          eyebrow="Section 10"
          title="Crisis-era yield curve interpretation"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The lecture discusses a crisis period where very short Treasury
            rates became extremely low because investors rushed into safe,
            liquid Treasury bills. The professor&apos;s point is sharp: a very
            low T-bill yield does <strong className="text-white">not</strong>{" "}
            necessarily mean the world is calm. It can mean everyone is trying
            to buy the safest short-term instrument at the same time — and that
            rush drives prices up and yields down.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <FlightToLiquidityPanel />
      </Reveal>

      {/* =================================================================== */}
      {/* CHAPTER 2 — Forward rates and hedging                               */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="02"
          eyebrow="Chapter 2"
          title="Forward rates and hedging"
        />
      </Reveal>
      <Reveal className="mt-5">
        <p className="ops-body text-[16px] text-slate-200">
          Spot rates price money from today to a future date. Forward rates
          price money between two future dates. Once we can compute forward
          rates, we can lock in future borrowing or lending — and the CFO
          example shows why a non-speculator would want to do exactly that.
        </p>
      </Reveal>

      {/* SECTION 11 — Why forward rates appear */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.1"
          eyebrow="Section 11"
          title="Why forward rates appear"
        />
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="Forward interest rate">
          Forward interest rates are today&apos;s rates for transactions between
          two future dates. A forward transaction is agreed today, begins at a
          future date, and ends at a later future date.
        </DefinitionCard>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Before we use the symbol <InlineMath>{"f_t"}</InlineMath>, decode
            it: a forward rate is{" "}
            <strong className="text-white">agreed today</strong> but{" "}
            <strong className="text-white">applies between future dates</strong>
            . The one-year forward rate <InlineMath>{"f_2"}</InlineMath> is the
            rate agreed today for lending or borrowing from year 1 to year 2.{" "}
            <strong className="text-white">
              Future spot rates can be different from today&apos;s corresponding
              forward rates.
            </strong>{" "}
            The forward rate is known today; the future spot rate is realized
            later.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <SpotVsForwardTimeline />
      </Reveal>

      {/* SECTION 12 — Forward rate from spot rates: two paths */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.2"
          eyebrow="Section 12"
          title="Forward rate from spot rates: two paths"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            If we know the 1-year spot rate and the 2-year spot rate, we can
            infer the one-year forward rate from year 1 to year 2. The logic is
            no-arbitrage: if both paths to year 2 are locked today and have the
            same risk, they should lead to the same terminal value.
          </p>
          <div className="mt-4 space-y-2">
            <p className="ops-body text-[15px] text-slate-200">
              <strong className="text-accent-cyan">Path A:</strong> Invest for
              two years at <InlineMath>{"r_{0,2}"}</InlineMath>.
            </p>
            <p className="ops-body text-[15px] text-slate-200">
              <strong className="text-accent-purple">Path B:</strong> Invest for
              one year at <InlineMath>{"r_{0,1}"}</InlineMath>, then lock today
              the forward rate <InlineMath>{"f_2"}</InlineMath> from year 1 to
              year 2.
            </p>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <FormulaExplainer
          label="Forward rate from spot rates"
          formula={"1+f_2 = \\frac{(1+r_{0,2})^2}{1+r_{0,1}}"}
          meaning="No-arbitrage: both paths to year 2 must give the same result."
          substitution={"f_2 = \\frac{1.07^2}{1.05} - 1"}
          result="f₂ ≈ 9.04%"
          interpretation="The two-year rate is 7% per year over two years. If year 1 is 5%, the implied second-year forward rate must be higher than 7% so the two-year average works."
        />
      </Reveal>
      <Reveal className="mt-6">
        <TwoPathForwardRateBuilder />
      </Reveal>

      {/* SECTION 13 — CFO hedge example */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.3"
          eyebrow="Section 13"
          title="The CFO hedge example"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            You are CFO of a U.S. multinational. You expect to receive $10
            million from a foreign subsidiary in one year. You will use that
            money to pay dividends one year after that. You do not know what
            interest rates will be in one year, but you want to lock in the
            lending rate from year 1 to year 2.
          </p>
          <p className="ops-body mt-3 text-[16px] text-slate-200">
            Current rates: <InlineMath>{"r_{0,1} = 5\\%"}</InlineMath> and{" "}
            <InlineMath>{"r_{0,2} = 7\\%"}</InlineMath>. Here is the key
            question:{" "}
            <strong className="text-white">
              is 7% the rate you care about?
            </strong>
          </p>
          <div className="mt-4 rounded-xl border border-accent-amber/30 bg-accent-amber/5 p-4">
            <p className="ops-body text-[15px] text-slate-100">
              <strong className="text-white">No.</strong> 7% is today&apos;s
              two-year spot rate. You care about the one-year rate from year 1
              to year 2. That future spot rate is unknown today. But the forward
              rate <InlineMath>{"f_2 \\approx 9.04\\%"}</InlineMath> can be
              locked today.
            </p>
          </div>
          <p className="ops-muted mt-4 text-[14px]">
            This example is intentionally confusing until you draw the timeline.
            Finance is not a spectator sport; you have to track where the money
            comes from and where it goes. And yes — the hard part is first
            having the $10 million.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <CFOHedgeSimulator />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            <strong className="text-white">Core lesson:</strong> Hedging removes
            uncertainty. It does not guarantee regret-free outcomes. As CFO,
            your job is usually not to speculate on rates. The point is to solve
            the financing problem.
          </p>
        </Panel>
      </Reveal>

      {/* SECTION 14 — Bank forward loan example */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.4"
          eyebrow="Section 14"
          title="The bank forward loan example"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A customer wants a forward contract to borrow $20 million three
            years from now for one year. You are the bank. Quote the forward
            loan rate. The tool is synthetic replication: use discount bonds you{" "}
            <em>can</em> trade to create the cash flows you <em>need</em>.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <FormulaExplainer
          label="Forward rate from year 3 to year 4"
          formula={"f_4 = \\frac{(1+r_{0,4})^4}{(1+r_{0,3})^3} - 1"}
          meaning="The forward rate for the period from year 3 to year 4, derived from today's spot rates."
          substitution={"f_4 = \\frac{1.07^4}{1.065^3} - 1"}
          result="f₄ ≈ 8.51%"
          interpretation="Buy 3-year bonds (receive $20MM in year 3), finance by short-selling 4-year bonds (pay $21.7MM in year 4). The implied rate on the synthetic forward loan is 8.51%."
        />
      </Reveal>
      <Reveal className="mt-6">
        <SyntheticForwardLoanBuilder />
      </Reveal>

      {/* =================================================================== */}
      {/* CHAPTER 3 — Coupon bonds and yield-to-maturity                     */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="03"
          eyebrow="Chapter 3"
          title="Coupon bonds and yield-to-maturity"
        />
      </Reveal>
      <Reveal className="mt-5">
        <p className="ops-body text-[16px] text-slate-200">
          Now we move from pure discount bonds to coupon bonds. Coupon bonds
          make intermediate payments and repay principal at maturity. They are
          really packages of dated cash flows — and each dated cash flow should
          be discounted with the appropriate rate for that date. Practitioners
          often summarize all of that with one number: yield-to-maturity.
        </p>
      </Reveal>

      {/* SECTION 15 — Coupon bonds are packages of dated cash flows */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.1"
          eyebrow="Section 15"
          title="Coupon bonds are packages of dated cash flows"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A 3-year bond with $1,000 face value and a 5% coupon rate has cash
            flows of $50 in year 1, $50 in year 2, and $1,050 in year 3. But
            think about it differently: this bond is really three separate
            claims — $50 at year 1, $50 at year 2, and $1,050 at year 3. Each
            claim is a mini zero-coupon bond.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <CouponBondCashFlowPackage />
      </Reveal>

      {/* SECTION 16 — YTM is a convenient summary, not the full story */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.2"
          eyebrow="Section 16"
          title="Yield-to-maturity is a convenient summary, not the full story"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The theoretically clean method discounts each cash flow using the
            appropriate spot rate for that date. But practitioners often quote
            coupon bonds using one number: <InlineMath>{"y"}</InlineMath>, the
            yield-to-maturity. It is a{" "}
            <strong className="text-white">complex average</strong> of future
            spot rates — a summary, not the full term structure.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            Solving for YTM is not as simple as solving a zero-coupon bond. It
            can become a polynomial problem. For normal bonds with positive
            price and positive cash flows, a meaningful yield generally exists —
            but this is still a numerical calculation, not a closed-form
            formula.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <FormulaExplainer
          label="Yield-to-maturity"
          formula={"P_0 = \\sum_{k=1}^{T}\\frac{C_k}{(1+y)^k}"}
          meaning="The single discount rate y that makes the present value of all coupon and principal payments equal the bond's market price."
          variables={[
            { symbol: "P_0", description: "current market price" },
            { symbol: "C_k", description: "cash flow at time k" },
            { symbol: "y", description: "yield-to-maturity" },
            { symbol: "T", description: "maturity" },
          ]}
          interpretation="YTM is a complex average of future spot rates. For pure discount bonds, YTM equals the current spot rate. Bond prices and yields move in opposite directions."
        />
      </Reveal>
      <Reveal className="mt-6">
        <CouponBondYtmSolver />
      </Reveal>

      {/* SECTION 17 — Yield curves from coupon bonds are useful proxies */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.3"
          eyebrow="Section 17"
          title="Yield curves from coupon bonds are useful proxies"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Public yield curves often use coupon-bearing Treasury securities,
            not pure STRIPS. That means the plotted yields are YTMs, not pure
            spot rates. This is a reasonable proxy when coupons are not too
            different — but strictly speaking, it is not the same as a
            zero-coupon spot curve.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <YieldCurveRealityCheck />
      </Reveal>

      {/* =================================================================== */}
      {/* CHAPTER 4 — Yield-curve theories and coupon bonds as STRIPS         */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="04"
          eyebrow="Chapter 4"
          title="Yield-curve theories and coupon bonds as STRIPS portfolios"
        />
      </Reveal>

      {/* SECTION 18 — Models of the term structure */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.1"
          eyebrow="Section 18"
          title="Models of the term structure"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            There are models that try to explain why the yield curve slopes
            upward, downward, or bends. None fully explains everything. If
            someone really has a model that predicts yield-curve movements well,
            that model is valuable — in financial firms, such models may become
            trade secrets rather than published formulas.
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Expectations Hypothesis
              </div>
              <p className="ops-body mt-1 text-[14px] text-slate-200">
                <InlineMath>{"E_0[R_k] = f_k"}</InlineMath> — Today&apos;s
                forward rate is the best forecast of the future spot rate.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="ops-caption text-[11px] text-accent-amber">
                Liquidity Preference
              </div>
              <p className="ops-body mt-1 text-[14px] text-slate-200">
                <InlineMath>
                  {"E[R_k] = f_k - \\text{Liquidity Premium}"}
                </InlineMath>{" "}
                — Long-term borrowing requires a premium because investors
                prefer liquidity.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <TermStructureTheoryArena />
      </Reveal>

      {/* SECTION 19 — Coupon bonds as portfolios of pure discount bonds */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.2"
          eyebrow="Section 19"
          title="Coupon bonds as portfolios of pure discount bonds"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            <strong className="text-white">Theorem:</strong> All coupon bonds
            are portfolios of pure discount bonds. A 3-year 5% bond with $1,000
            face value is equivalent to 50 one-year STRIPS, 50 two-year STRIPS,
            and 1050 three-year STRIPS. Each STRIP pays $1 at its maturity — so
            the portfolio exactly reproduces the coupon bond&apos;s cash flows.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <CouponBondDecomposer />
      </Reveal>

      {/* SECTION 20 — Transition to arbitrage */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.3"
          eyebrow="Section 20"
          title="Transition to arbitrage"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            If the coupon bond and the matching STRIPS portfolio produce
            identical future cash flows, their prices should be the same. If
            they are not, there may be arbitrage. This sets up Lesson 3.3, which
            covers the law of one price and interest-rate risk in full.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <ArbitragePreview />
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
          title="Lesson 3.2 mastery check"
          passCount={6}
          onComplete={() => report()}
          continueLabel="Continue to Arbitrage, Duration, and Convexity"
          continueHref="/lessons/fixed-income-law-one-price-arbitrage-duration-convexity"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Arbitrage, Duration, and Convexity"
          continueHref="/lessons/fixed-income-law-one-price-arbitrage-duration-convexity"
          backLabel="Back to Bond Markets and Discount Bonds"
          backHref="/lessons/fixed-income-bond-markets-cash-flows-discount-bonds"
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SOURCES AND NOTES                                                   */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <LessonSourcePanel />
      </Reveal>
    </FILayout>
  );
}
