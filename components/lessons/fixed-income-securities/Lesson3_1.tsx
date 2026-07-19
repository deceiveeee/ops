"use client";

import {
  Reveal,
  SectionHeading,
  Panel,
  DefinitionCard,
  ConceptTag,
  MasteryCheck,
  type MasteryQuestion,
  LessonSummary,
} from "./shared";
import FILayout from "./FILayout";
import FIModuleMap from "./FIModuleMap";
import LessonSourcePanel from "./LessonSourcePanel";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import { useReportFIComplete } from "@/lib/fi-progress";

import IOUMachine from "./IOUMachine";
import FixedIncomeRoadmap from "./FixedIncomeRoadmap";
import StockOrBondSorter from "./StockOrBondSorter";
import BondMarketExplorer from "./BondMarketExplorer";
import BondMarketCharts from "./BondMarketCharts";
import LiquidityStressSimulator from "./LiquidityStressSimulator";
import IssuerIntermediaryInvestorSorter from "./IssuerIntermediaryInvestorSorter";
import BondCashFlowBuilder from "./BondCashFlowBuilder";
import RiskScanner from "./RiskScanner";
import ZeroCouponBondLab from "./ZeroCouponBondLab";

const SUMMARY_POINTS = [
  "Fixed-income securities are claims on promised cash flows.",
  "Bond categories differ by issuer, structure, and risk.",
  "Coupon bonds pay intermediate coupons plus principal at maturity.",
  "Zero-coupon bonds pay only once at maturity.",
  "Riskless bond valuation begins with NPV.",
  "Higher discount rates reduce today's price.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "multi",
    prompt: "Select all that are fixed income.",
    choices: [
      { id: "Pays $50/yr for 3 yrs then $1,000", label: "Pays $50/yr for 3 yrs then $1,000" },
      { id: "Common stock of a growing company", label: "Common stock of a growing company" },
      { id: "Treasury bill paying $1,000 at maturity", label: "Treasury bill paying $1,000 at maturity" },
      { id: "A bond with a 5% coupon", label: "A bond with a 5% coupon" },
    ],
    correctIds: [
      "Pays $50/yr for 3 yrs then $1,000",
      "Treasury bill paying $1,000 at maturity",
      "A bond with a 5% coupon",
    ],
    hint: "Stocks have no promised cash flows.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "A 3-year 5% coupon bond with $1,000 face pays how much at year 3?",
    choices: [
      { id: "$1,050", label: "$1,050" },
      { id: "$50", label: "$50" },
      { id: "$1,000", label: "$1,000" },
    ],
    correctId: "$1,050",
    hint: "$50 coupon plus $1,000 principal.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "Which risk means the issuer might not make promised payments?",
    choices: [
      { id: "Credit risk", label: "Credit risk" },
      { id: "Liquidity risk", label: "Liquidity risk" },
      { id: "Currency risk", label: "Currency risk" },
    ],
    correctId: "Credit risk",
    hint: "This is the risk of default or missed payments.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "A zero-coupon bond pays $1,000 in 3 years. Yield 5%. Is the price above or below $1,000?",
    choices: [
      { id: "Below", label: "Below" },
      { id: "Above", label: "Above" },
      { id: "Equal", label: "Equal" },
    ],
    correctId: "Below",
    hint: "Positive rates discount future money.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "What does STRIPS mean conceptually?",
    choices: [
      {
        id: "Separate Treasury interest/principal payments traded as individual zero-coupon securities",
        label:
          "Separate Treasury interest/principal payments traded as individual zero-coupon securities",
      },
      { id: "A type of stock", label: "A type of stock" },
      { id: "A foreign bond", label: "A foreign bond" },
    ],
    correctId:
      "Separate Treasury interest/principal payments traded as individual zero-coupon securities",
    hint: "STRIPS split a Treasury into separate single-payment pieces.",
  },
];

export default function Lesson3_1() {
  const report = useReportFIComplete(
    "fixed-income-bond-markets-cash-flows-discount-bonds",
  );

  return (
    <FILayout>
      <PVHero
        index="3.1"
        eyebrow="Lesson 3.1 · Module 3"
        heading="The market hidden behind simple IOUs"
        subheading="Stocks get attention. Bonds move the financial system. A bond is just an IOU with dates and dollars attached, but trillions of dollars of IOUs determine how governments borrow, how companies finance themselves, how banks manage liquidity, and how investors price risk."
        bullets={[
          "A bond is a timed promise of known cash flows",
          "Bond markets are huge, technical, and central to the financial system",
          "Riskless bond valuation is just NPV",
          "Discount bonds are the foundation of all fixed-income pricing",
        ]}
        primaryLabel="Start Bond Markets and Discount Bonds"
        secondaryLabel="View module map"
      />

      <div id="lesson-content" />
      <Reveal className="mt-10">
        <FIModuleMap />
      </Reveal>

      {/* ================================================================= */}
      {/* CHAPTER 1 — The bond market system                                */}
      {/* ================================================================= */}
      <Reveal className="mt-12">
        <SectionHeading
          index="01"
          eyebrow="Chapter 1"
          title="The bond market system"
        />
      </Reveal>

      {/* Section 1 — IOU Machine */}
      <Reveal className="mt-6">
        <IOUMachine />
      </Reveal>

      {/* Section 2 — Roadmap */}
      <Reveal className="mt-12">
        <FixedIncomeRoadmap />
      </Reveal>

      {/* Section 3 — What is a fixed-income security? */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            What is a fixed-income security?
          </h3>
          <div className="mt-5">
            <DefinitionCard term="Fixed-income security">
              A claim on promised cash flows: fixed amounts, fixed dates.
            </DefinitionCard>
          </div>
          <p className="ops-body mt-5 text-[16px] leading-7 text-slate-200">
            <span className="text-slate-50">&ldquo;Fixed&rdquo;</span> means the
            contract specifies the promised timing and amount.{" "}
            <span className="text-slate-50">&ldquo;Promised&rdquo;</span> does not
            mean guaranteed — default risk comes later. Stocks do not have fixed
            promised cash flows; dividends and resale prices are uncertain. Plain
            bonds are easier to value first because cash-flow timing is specified.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-accent-purple/40 bg-accent-purple/10 p-5">
              <div className="ops-caption text-[11px] text-accent-purple">Stock</div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
                Uncertain future dividends and an uncertain resale price. No
                promised schedule.
              </p>
            </div>
            <div className="rounded-xl border border-accent-cyan/40 bg-accent-cyan/10 p-5">
              <div className="ops-caption text-[11px] text-accent-cyan">Bond</div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
                A promised coupon and principal schedule with fixed dates and
                amounts.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <ConceptTag concept="cashflow">Fixed amounts</ConceptTag>
            <ConceptTag concept="time">Fixed dates</ConceptTag>
            <ConceptTag concept="risk">Promised ≠ guaranteed</ConceptTag>
          </div>
        </Panel>
      </Reveal>

      <Reveal className="mt-6">
        <StockOrBondSorter />
      </Reveal>

      {/* Section 4 — Classification */}
      <Reveal className="mt-12">
        <SectionHeading
          index="02"
          eyebrow="Section 4"
          title="How the bond market is classified"
        />
      </Reveal>
      <Reveal className="mt-6">
        <BondMarketExplorer />
      </Reveal>

      {/* Sections 5–6 — Market size & issuance */}
      <Reveal className="mt-12">
        <SectionHeading
          index="03"
          eyebrow="Sections 5–6"
          title="Market size and issuance"
        />
      </Reveal>
      <Reveal className="mt-6">
        <BondMarketCharts />
      </Reveal>

      {/* Section 7 — Liquidity */}
      <Reveal className="mt-12">
        <SectionHeading
          index="04"
          eyebrow="Section 7"
          title="Liquidity: huge market, uneven trading"
        />
      </Reveal>
      <Reveal className="mt-6">
        <LiquidityStressSimulator />
      </Reveal>

      {/* Section 8 — Participants */}
      <Reveal className="mt-12">
        <IssuerIntermediaryInvestorSorter />
      </Reveal>

      {/* ================================================================= */}
      {/* CHAPTER 2 — Bond cash-flow anatomy and risk                       */}
      {/* ================================================================= */}
      <Reveal className="mt-12">
        <SectionHeading
          index="05"
          eyebrow="Chapter 2"
          title="Bond cash-flow anatomy and risk"
        />
      </Reveal>

      {/* Section 9 — Bond anatomy */}
      <Reveal className="mt-6">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            Bond anatomy: the promised schedule
          </h3>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            Once you know the face value, coupon rate, and maturity, the entire
            promised schedule is determined. Build one below.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <BondCashFlowBuilder />
      </Reveal>

      {/* Section 10 — Valuation & risk menu */}
      <Reveal className="mt-12">
        <SectionHeading
          index="06"
          eyebrow="Section 10"
          title="Valuation and the risk menu"
        />
      </Reveal>
      <Reveal className="mt-6">
        <RiskScanner />
      </Reveal>

      {/* ================================================================= */}
      {/* CHAPTER 3 — Discount bonds and zero-coupon valuation             */}
      {/* ================================================================= */}
      <Reveal className="mt-12">
        <SectionHeading
          index="07"
          eyebrow="Chapter 3"
          title="Discount bonds and zero-coupon valuation"
        />
      </Reveal>

      {/* Section 11 — Pure discount bonds */}
      <Reveal className="mt-6">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            Pure discount bonds
          </h3>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            The simplest bond pays once, at maturity. It is the foundation of all
            fixed-income pricing because every bond can be decomposed into a set
            of pure discount bonds.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <ZeroCouponBondLab />
      </Reveal>

      {/* ================================================================= */}
      {/* Section 12 — Summary, quiz, transition                            */}
      {/* ================================================================= */}
      <Reveal className="mt-12">
        <SectionHeading
          index="08"
          eyebrow="Section 12"
          title="Summary and mastery check"
        />
      </Reveal>

      <Reveal className="mt-6">
        <MasteryCheck
          title="Lesson 3.1 mastery check"
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Spot Rates, Forwards, and Coupon Bonds"
          continueHref="/lessons/fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* Transition note */}
      <Reveal className="mt-8">
        <Panel>
          <div className="ops-caption text-[11px] text-accent-purple">
            What comes next
          </div>
          <p className="ops-body mt-2 text-[16px] leading-7 text-slate-200">
            So far, we used one rate. Real bond markets have different rates for
            different maturities. Next, we use those prices to read the yield
            curve and infer forward rates.
          </p>
        </Panel>
      </Reveal>

      {/* Summary */}
      <Reveal className="mt-8">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Spot Rates, Forwards, and Coupon Bonds"
          continueHref="/lessons/fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds"
          backLabel="Back to Present Value Relations"
          backHref="/lessons/present-value-inflation-real-nominal"
        />
      </Reveal>

      {/* Sources */}
      <Reveal className="mt-8">
        <LessonSourcePanel />
      </Reveal>
    </FILayout>
  );
}
