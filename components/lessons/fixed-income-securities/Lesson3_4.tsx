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
import ProfessorNote from "./ProfessorNote";

// Chapter 1
import YieldMoveDifferentCause from "./YieldMoveDifferentCause";
import PromiseVsExpectedPayoff from "./PromiseVsExpectedPayoff";
// Chapter 2
import CreditRatingLadder from "./CreditRatingLadder";
import DebtEquityRiskSpectrum from "./DebtEquityRiskSpectrum";
import CreditSpreadThermometer from "./CreditSpreadThermometer";
import SpreadDecompositionMixer from "./SpreadDecompositionMixer";
// Chapter 3
import PromisedVsExpectedYieldSplitter from "./PromisedVsExpectedYieldSplitter";
import CorporateYieldWaterfall from "./CorporateYieldWaterfall";
// Chapter 4
import SecuritizationFactory from "./SecuritizationFactory";
import RiskReallocationPanel from "./RiskReallocationPanel";
import SeniorTrancheStressRoom from "./SeniorTrancheStressRoom";
import DefaultCorrelationDemonstrator from "./DefaultCorrelationDemonstrator";
import SecuritizationStressTest from "./SecuritizationStressTest";
import RiskStackSummary from "./RiskStackSummary";

const LEARNING_OBJECTIVES = [
  "Explain why non-government bonds carry default risk.",
  "Define default and distinguish promised payoff from expected payoff.",
  "Read the simplified Moody's, S&P, and Fitch rating scale.",
  "Distinguish investment grade from non-investment grade.",
  "Interpret a corporate bond spread over Treasuries.",
  "Explain why a corporate spread is not just default probability.",
  "Distinguish promised YTM from expected YTM.",
  "Define default premium and risk premium.",
  "Calculate promised YTM and expected YTM for a risky zero-coupon bond.",
  "Explain why securitization can repackage risk and what it requires.",
  "Explain why senior structured claims can lose value when correlation, liquidity, and model assumptions change.",
];

const SUMMARY_POINTS = [
  "Corporate bonds add default risk: the issuer might not pay.",
  "Default means a missed promised interest or principal payment.",
  "Ratings summarize credit quality but are opinions, not guarantees.",
  "Investment grade and non-investment grade differ by perceived credit quality.",
  "Lower-rated bonds usually require higher promised yields.",
  "Corporate spreads contain default risk, liquidity, taxes, systematic risk, and other components — not just default probability.",
  "Promised YTM is not the same as expected YTM.",
  "Default premium equals promised YTM minus expected YTM.",
  "Risk premium equals expected YTM minus risk-free yield.",
  "Securitization can repackage risk, but it relies on diversification, accurate measurement, normal markets, and sophisticated investors.",
  "Senior structured claims can still lose value when correlations, liquidity, and model assumptions change.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "What is default?",
    choices: [
      {
        id: "missed",
        label: "Failure to make a promised interest or principal payment.",
      },
      { id: "down", label: "A decline in the bond's market price." },
      { id: "rating", label: "A rating downgrade by an agency." },
    ],
    correctId: "missed",
    hint: "Default is about the issuer failing to pay, not the market price.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "What is the lowest broad investment-grade category in the simplified table?",
    choices: [
      { id: "baa", label: "Moody's Baa / S&P BBB / Fitch BBB." },
      { id: "ba", label: "Moody's Ba / S&P BB / Fitch BB." },
      { id: "a", label: "Moody's A / S&P A / Fitch A." },
    ],
    correctId: "baa",
    hint: "Investment grade ends at Baa/BBB. Below that is speculative grade.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "Why do lower-rated bonds usually promise higher yields?",
    choices: [
      {
        id: "comp",
        label:
          "Investors require compensation for higher perceived default risk and related risks.",
      },
      { id: "tax", label: "Lower-rated bonds are tax-exempt." },
      { id: "liquid", label: "They are always more liquid." },
    ],
    correctId: "comp",
    hint: "Higher promised yield compensates for higher risk.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "True or false: a corporate bond spread is entirely default probability.",
    choices: [
      {
        id: "false",
        label:
          "False. It can include liquidity, taxes, systematic risk, embedded options, and pricing error.",
      },
      { id: "true", label: "True. Spread equals default probability." },
    ],
    correctId: "false",
    hint: "Research shows default explains only part of the spread.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "XYZ 10-year zero costs $321.97 and promises $1,000. What is the promised YTM?",
    choices: [
      { id: "12", label: "Approximately 12%." },
      { id: "8", label: "Approximately 8%." },
      { id: "9", label: "Approximately 9%." },
    ],
    correctId: "12",
    hint: "(1000/321.97)^(1/10) − 1 ≈ 12%.",
  },
  {
    id: "q6",
    type: "single",
    prompt:
      "XYZ expected payoff is $762.22 and price is $321.97. What is the expected YTM?",
    choices: [
      { id: "9", label: "Approximately 9%." },
      { id: "12", label: "Approximately 12%." },
      { id: "8", label: "Approximately 8%." },
    ],
    correctId: "9",
    hint: "(762.22/321.97)^(1/10) − 1 ≈ 9%.",
  },
  {
    id: "q7",
    type: "single",
    prompt:
      "If promised YTM is 12% and expected YTM is 9%, what is the default premium?",
    choices: [
      { id: "3", label: "3%." },
      { id: "1", label: "1%." },
      { id: "4", label: "4%." },
    ],
    correctId: "3",
    hint: "Default premium = promised YTM − expected YTM.",
  },
  {
    id: "q8",
    type: "single",
    prompt:
      "If expected YTM is 9% and risk-free yield is 8%, what is the risk premium?",
    choices: [
      { id: "1", label: "1%." },
      { id: "3", label: "3%." },
      { id: "8", label: "8%." },
    ],
    correctId: "1",
    hint: "Risk premium = expected YTM − risk-free yield.",
  },
  {
    id: "q9",
    type: "multi",
    prompt: "What four conditions does successful securitization require?",
    choices: [
      { id: "div", label: "Diversification" },
      { id: "meas", label: "Accurate risk measurement" },
      { id: "normal", label: "Normal market conditions" },
      { id: "soph", label: "Reasonably sophisticated investors" },
      { id: "insure", label: "Government insurance" },
    ],
    correctIds: ["div", "meas", "normal", "soph"],
    hint: "Four conditions — diversification, measurement, normal markets, investor sophistication.",
  },
  {
    id: "q10",
    type: "single",
    prompt: "Why can a senior structured tranche still lose value?",
    choices: [
      {
        id: "corr",
        label:
          "If default correlation rises, liquidity disappears, model assumptions fail, or forced selling occurs.",
      },
      { id: "rating", label: "Only if the rating agency downgrades it." },
      { id: "never", label: "Senior tranches cannot lose value." },
    ],
    correctId: "corr",
    hint: "Senior protection depends on assumptions about correlation, liquidity, and markets.",
  },
  {
    id: "q11",
    type: "single",
    prompt: "What does securitization do to risk?",
    choices: [
      {
        id: "realloc",
        label:
          "It reallocates and repackages risk; it does not make the underlying risk disappear.",
      },
      { id: "elim", label: "It eliminates risk entirely." },
      { id: "increase", label: "It always increases total risk." },
    ],
    correctId: "realloc",
    hint: "Risk moved. Risk did not vanish.",
  },
  {
    id: "q12",
    type: "single",
    prompt: "Why is relying only on ratings dangerous?",
    choices: [
      {
        id: "assump",
        label:
          "Ratings depend on assumptions and may not capture liquidity, correlation, model, or market-stress risk.",
      },
      { id: "bias", label: "Rating agencies are always biased." },
      { id: "delay", label: "Ratings are published too late." },
    ],
    correctId: "assump",
    hint: "A rating is a model-based opinion, not a guarantee.",
  },
];

export default function Lesson3_4() {
  const report = useReportFIComplete(
    "fixed-income-corporate-bonds-default-risk-credit-spreads-securitization",
  );

  return (
    <FILayout>
      {/* HERO */}
      <PVHero
        index="3.4"
        eyebrow="Lesson 3.4 · Module 3"
        heading="Promised cash flows are not guaranteed cash flows."
        subheading="Treasury bonds let us focus on time value and interest-rate risk. Corporate bonds and structured credit add another layer: the issuer may not pay. Once default risk enters, yield is no longer just a time-value number."
        bullets={[
          "Treasury bond → corporate bond → structured credit",
          "Promised payoff ≠ expected payoff",
          "Default premium, risk premium, and what spreads contain",
          "Securitization reallocates risk — it does not destroy it",
        ]}
        primaryLabel="Start Credit Risk and Securitization"
        secondaryLabel="View module map"
      />

      {/* LEARNING OBJECTIVES */}
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
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-sans text-[12px] text-accent-cyan">
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

      {/* MODULE MAP */}
      <Reveal className="mt-10">
        <FIModuleMap />
      </Reveal>

      {/* =================================================================== */}
      {/* CHAPTER 1 — From interest-rate risk to default risk                 */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="01"
          eyebrow="Chapter 1"
          title="From interest-rate risk to default risk"
        />
      </Reveal>
      <Reveal className="mt-5">
        <p className="ops-body text-[16px] text-slate-200">
          Lesson 3.3 measured how bond prices move when yields move. Duration
          and convexity approximate the price effect of a yield change. But for
          corporate bonds, a yield change may not be only an interest-rate
          movement. A corporate yield can rise because investors are less
          confident the issuer will pay. That is a different kind of risk — and
          it requires a different set of tools.
        </p>
      </Reveal>

      {/* SECTION 1 — Bridge */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.1"
          eyebrow="Section 1"
          title="Same yield move, different cause"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            If a Treasury yield rises, the move may reflect interest rates,
            inflation expectations, or liquidity. If a corporate bond yield
            rises, the move may also reflect credit fear: investors are
            demanding more compensation because they are less confident the
            issuer will pay.
          </p>
          <ProfessorNote>
            Before asking what a yield is, ask what risk the yield is
            compensating you for.
          </ProfessorNote>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <YieldMoveDifferentCause />
      </Reveal>

      {/* SECTION 2 — What changes when debt is risky */}
      <Reveal className="mt-12">
        <SectionHeading
          index="1.2"
          eyebrow="Section 2"
          title="What changes when debt is risky?"
        />
      </Reveal>
      <Reveal className="mt-5">
        <DefinitionCard term="Default">
          Default occurs when a debt issuer fails to make a promised payment of
          interest or principal.
        </DefinitionCard>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            For riskless debt, promised cash flows are treated as arriving with
            certainty. For risky debt, the promised payment is{" "}
            <strong className="text-white">not</strong> the same as the expected
            payment. The promised payoff is what the contract says. The expected
            payoff is the probability-weighted payoff after accounting for
            default and recovery. The price is what investors pay today for that
            uncertain payoff.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <FormulaExplainer
          label="Expected payoff"
          formula={String.raw`E[\text{Payoff}] = p \cdot F + (1-p) \cdot R`}
          meaning="The expected payoff weights the full payment by the probability of receiving it, and the recovery value by the probability of default."
          variables={[
            { symbol: "p", description: "probability of full payment" },
            { symbol: "F", description: "promised face value" },
            { symbol: "R", description: "recovery value in default" },
          ]}
          interpretation="Promised payoff stays fixed at F. Expected payoff changes as probability and recovery change."
        />
      </Reveal>
      <Reveal className="mt-6">
        <PromiseVsExpectedPayoff />
      </Reveal>

      {/* =================================================================== */}
      {/* CHAPTER 2 — Ratings, spreads, and what the premium contains         */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="02"
          eyebrow="Chapter 2"
          title="Ratings, spreads, and what the premium contains"
        />
      </Reveal>

      {/* SECTION 3 — Credit ratings */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.1"
          eyebrow="Section 3"
          title="Credit ratings"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Non-government bonds carry default risk. Credit ratings by agencies
            provide indications of the likelihood of default by each issuer.
            Ratings are{" "}
            <strong className="text-white">opinions, not guarantees</strong>.
            Investment grade generally means Baa3 / BBB− or higher.
            Non-investment grade is also called speculative grade or high yield.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <CreditRatingLadder />
      </Reveal>

      {/* SECTION 4 — Lower rating, higher promised yield */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.2"
          eyebrow="Section 4"
          title="Lower rating, higher promised yield — but not automatically better return"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Lower-rated bonds usually promise higher yields. But a higher
            promised yield is not automatically a higher expected return. The
            extra yield may compensate for a higher probability of not receiving
            the promised cash flow. As debt becomes very risky, it starts to
            behave more like equity: payoffs become uncertain, bondholders may
            become residual claimants in distress, and promised fixed-income
            cash flows become economically less &quot;fixed.&quot;
          </p>
          <ProfessorNote>
            High promised yield can be attractive, but the word
            &quot;promised&quot; is doing a lot of work.
          </ProfessorNote>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <DebtEquityRiskSpectrum />
      </Reveal>

      {/* SECTION 5 — Corporate bond spreads */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.3"
          eyebrow="Section 5"
          title="Corporate bond spreads"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A common measure of credit compensation compares a corporate bond
            yield to a Treasury yield of similar maturity. For example, the
            Moody&apos;s Baa yield minus the 10-year Treasury yield. This spread
            measures extra promised yield investors require for Baa corporate
            bonds over Treasuries. But a corporate spread can reflect many
            things: expected default loss, risk aversion, liquidity, taxes,
            systematic risk, embedded options, market stress, and pricing or
            model error.
          </p>
          <ProfessorNote>
            Do not read a spread as &quot;the market&apos;s default
            probability.&quot; It is a price difference that contains several
            components.
          </ProfessorNote>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <CreditSpreadThermometer />
      </Reveal>

      {/* SECTION 6 — What is inside the premium */}
      <Reveal className="mt-12">
        <SectionHeading
          index="2.4"
          eyebrow="Section 6"
          title="What is inside the premium?"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A corporate spread is not &quot;just default probability.&quot;
            Empirical research has examined what drives corporate spreads. The
            findings consistently show that default explains only part of the
            spread — the rest includes liquidity, taxes, systematic risk,
            embedded options, market segmentation, and model or pricing error.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <SpreadDecompositionMixer />
      </Reveal>

      {/* =================================================================== */}
      {/* CHAPTER 3 — Promised yield, expected yield, default premium         */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="03"
          eyebrow="Chapter 3"
          title="Promised yield, expected yield, default premium, and risk premium"
        />
      </Reveal>

      {/* SECTION 7 — Decomposition of corporate bond yields */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.1"
          eyebrow="Section 7"
          title="Decomposition of corporate bond yields"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Promised YTM is the yield if default does not occur. Expected YTM is
            the probability-weighted average of all possible yields. Default
            premium is the difference between promised yield and expected yield.
            Risk premium is the difference between the expected yield on a risky
            bond and the yield on a risk-free bond of similar maturity.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <PromisedVsExpectedYieldSplitter />
      </Reveal>

      {/* SECTION 8 — XYZ risky zero-coupon example */}
      <Reveal className="mt-12">
        <SectionHeading
          index="3.2"
          eyebrow="Section 8"
          title="XYZ risky zero-coupon example"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            All bonds have par value $1,000. A risk-free 10-year Treasury STRIPS
            costs $463.19 (yielding 8%). A risky 10-year zero from XYZ Inc.
            costs $321.97, promises $1,000, and has an expected payoff of
            $762.22. From these numbers we can compute the promised YTM,
            expected YTM, default premium, and risk premium.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <FormulaExplainer
          label="Risk-free Treasury STRIPS yield"
          formula={String.raw`y_{\text{risk-free}} = \left(\frac{1000}{463.19}\right)^{1/10} - 1`}
          result="≈ 8.00%"
          interpretation="The risk-free benchmark: what a default-free zero yields over 10 years."
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="XYZ promised YTM"
          formula={String.raw`y_{\text{promised}} = \left(\frac{1000}{321.97}\right)^{1/10} - 1`}
          result="≈ 12.00%"
          interpretation="The return if XYZ pays as promised. This is the number quoted in the market — but it is not the expected return."
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="XYZ expected YTM"
          formula={String.raw`y_{\text{expected}} = \left(\frac{762.22}{321.97}\right)^{1/10} - 1`}
          result="≈ 9.00%"
          interpretation="The probability-weighted return after accounting for default and recovery. This is lower than the promised yield."
        />
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Default premium and risk premium"
          formula={String.raw`\text{Default Premium} = 12\% - 9\% = 3\%, \quad \text{Risk Premium} = 9\% - 8\% = 1\%`}
          meaning="The default premium (3%) compensates for the possibility of not receiving the promised payoff. The risk premium (1%) compensates for bearing default risk above the risk-free rate."
          interpretation="A high promised yield can simply be compensation for not receiving the promised payoff."
        />
      </Reveal>
      <Reveal className="mt-6">
        <CorporateYieldWaterfall />
      </Reveal>

      {/* =================================================================== */}
      {/* CHAPTER 4 — Securitization, structured credit, and model stress     */}
      {/* =================================================================== */}
      <Reveal className="mt-16">
        <SectionHeading
          index="04"
          eyebrow="Chapter 4"
          title="Securitization, structured credit, and model stress"
        />
      </Reveal>

      {/* SECTION 9 — Why securitize loans? */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.1"
          eyebrow="Section 9"
          title="Why securitize loans?"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            The core idea of securitization is that loans can be pooled and
            repackaged into new claims. Why securitize? To repack risks to yield
            more homogeneity within categories, achieve more efficient
            allocation of risk, create more risk-bearing capacity, provide
            greater transparency, support economic growth, and extend credit to
            more borrowers.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            But successful securitization requires:{" "}
            <strong className="text-white">
              diversification, accurate risk measurement, normal market
              conditions, and reasonably sophisticated investors.
            </strong>
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <SecuritizationFactory />
      </Reveal>

      {/* SECTION 10 — What securitization does and does not do */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.2"
          eyebrow="Section 10"
          title="What securitization does and does not do"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Securitization can reallocate risk. It can create claims that look
            safer and claims that absorb more risk. But pooling and tranching do{" "}
            <strong className="text-white">not</strong> make underlying risk
            disappear. If the underlying loans are risky, the total pool is
            still risky. The structure decides who absorbs losses first.
          </p>
          <ProfessorNote>
            The genius of securitization is risk allocation. The danger is
            forgetting that allocation depends on assumptions.
          </ProfessorNote>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <RiskReallocationPanel />
      </Reveal>

      {/* SECTION 11 — Risk-manager story */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.3"
          eyebrow="Section 11"
          title="Why senior does not always mean safe"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A bank risk manager described holding highly rated AAA and
            super-senior CDO tranches while trying to eliminate exposure to
            lower-rated tranches. The logic seemed conservative: keep the
            supposedly low-risk senior pieces and reduce the risky junior
            exposure. But during the crisis, senior structured tranches fell in
            value while some non-investment-grade tranches were squeezed upward.
            What seemed low-risk under the model became vulnerable once
            correlation, liquidity, and market stress changed.
          </p>
          <ProfessorNote tone="amber">
            &quot;AAA&quot; in a structured product depends heavily on model
            assumptions. Senior tranches can still lose value when underlying
            defaults become more correlated or liquidity disappears.
          </ProfessorNote>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <SeniorTrancheStressRoom />
      </Reveal>

      {/* SECTION 12 — Correlation is the hidden stress point */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.4"
          eyebrow="Section 12"
          title="Correlation is the hidden stress point"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A senior tranche may look safe when defaults are assumed to be
            diversified. But if defaults become correlated, many loans fail
            together. Then losses can reach the senior tranche. Diversification
            works when defaults are not all driven by the same shock. When
            correlation rises, diversification can disappear exactly when it is
            needed most.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <DefaultCorrelationDemonstrator />
      </Reveal>

      {/* SECTION 13 — Securitization requirements stress test */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.5"
          eyebrow="Section 13"
          title="Can this securitization survive?"
        />
      </Reveal>
      <Reveal className="mt-6">
        <SecuritizationStressTest />
      </Reveal>

      {/* SECTION 14 — Lesson synthesis */}
      <Reveal className="mt-12">
        <SectionHeading
          index="4.6"
          eyebrow="Section 14"
          title="From corporate default to structured-credit stress"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            Corporate bonds introduced default risk: the issuer might not pay.
            Credit ratings and spreads try to summarize that risk. But spreads
            contain more than expected default loss. Promised yield is not
            expected yield. Securitization then repackages risky loans into new
            claims, but the structure depends on diversification, measurement,
            normal markets, and investor understanding. When correlation and
            liquidity assumptions break, even senior claims can lose value.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-6">
        <RiskStackSummary />
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
          title="Lesson 3.4 mastery check"
          passCount={9}
          onComplete={() => report()}
          continueLabel="Continue to Equities"
          continueHref="/lessons/equity-what-does-owning-a-stock-mean"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* SUMMARY */}
      <Reveal className="mt-8">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Equities"
          continueHref="/lessons/equity-what-does-owning-a-stock-mean"
          backLabel="Back to Arbitrage, Duration, and Convexity"
          backHref="/lessons/fixed-income-law-one-price-arbitrage-duration-convexity"
        />
      </Reveal>

      {/* SOURCES AND NOTES */}
      <Reveal className="mt-8">
        <LessonSourcePanel
          sources={[
            "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Fixed-Income Securities Part IV video and slides.",
            "MIT 15.401 Fixed-Income Securities slides 41–52.",
            "FINRA investor education, bonds, credit risk, bond ratings, and high-yield bond explanations.",
            "Moody's, S&P Global Ratings, and Fitch Ratings credit rating scale references.",
            "The Economist, \u201CConfessions of a Risk Manager,\u201D August 7, 2008, referenced only through short paraphrase; do not quote at length.",
          ]}
        />
      </Reveal>
    </FILayout>
  );
}
