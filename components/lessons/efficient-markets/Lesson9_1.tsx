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
import EarningsAnnouncementOpening from "./EarningsAnnouncementOpening";
import PriceAsExpectation from "./PriceAsExpectation";
import TradeAwayOpportunity from "./TradeAwayOpportunity";
import ChallengerCaseStudy from "./ChallengerCaseStudy";
import InformationOrEdgeClassifier from "./InformationOrEdgeClassifier";
import GoodCompanyVsGoodInvestment from "./GoodCompanyVsGoodInvestment";
import MarketEfficiencyMisconceptions from "./MarketEfficiencyMisconceptions";
import GenuineEdgeSources from "./GenuineEdgeSources";
import PracticalInvestmentChecklist from "./PracticalInvestmentChecklist";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import EMLayout from "./EMLayout";
import EMSourcePanel from "./EMSourcePanel";
import { useReportEMComplete } from "@/lib/em-progress";

const SUMMARY_POINTS = [
  "Public information is often incorporated into prices quickly — by the time you read the news, the market has often already moved.",
  "A good company is not automatically a good investment. What matters is whether future results exceed what the price already assumes.",
  "Obvious investment opportunities attract competition and disappear as investors buy, moving the price toward estimated value.",
  "Market efficiency does not mean prices are always correct, investors are always rational, or analysis is useless.",
  "An active investor needs a defensible edge — better information, better analysis, a longer horizon, behavioral discipline, or a structural advantage.",
  "Claiming an edge is easy. Demonstrating one requires distinguishing your forecast from the market's and explaining why others may have missed it.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt:
      "A company reports earnings that beat analyst estimates. The stock falls 5%. Which explanation is most consistent with the concepts in this lesson?",
    choices: [
      {
        id: "a",
        label:
          "The earnings beat was smaller than what the market had already priced in. The stock fell because the surprise relative to expectations was negative, even though the absolute result was favorable.",
      },
      { id: "b", label: "The market is irrational and does not understand the company." },
      { id: "c", label: "Good news always causes stocks to fall — this is normal." },
    ],
    correctId: "a",
    hint: "Returns depend on results relative to expectations. A beat that is smaller than the market anticipated produces a negative surprise.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "You read a company's 10-K filing and discover a new store format that looks promising. The filing was published three weeks ago. What should you ask before concluding you have an edge?",
    choices: [
      {
        id: "a",
        label:
          "Is this information already public and widely known? Have other analysts already modeled the new format's impact? What does the current price already assume about it?",
      },
      { id: "b", label: "Nothing — the 10-K is detailed, so the market probably missed it." },
      { id: "c", label: "Whether the company will report good earnings next quarter." },
    ],
    correctId: "a",
    hint: "Public filings are processed quickly by thousands of investors. The question is not whether you found the information, but whether your interpretation differs from what the market already prices.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "A stock is trading at $50. You estimate its value at $60. Within days, the price rises to $59 as other investors reach similar conclusions. What happened?",
    choices: [
      {
        id: "a",
        label:
          "Competition among investors moved the price toward estimated value. The more visible the opportunity, the more investors competed for it, and the less profitable it became.",
      },
      { id: "b", label: "The market manipulated the price to prevent you from profiting." },
      { id: "c", label: "The estimated value of $60 was wrong; the true value must be $59." },
    ],
    correctId: "a",
    hint: "No authority sets the efficient price. Investor competition does. The opportunity shrank because the gap between price and value closed.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "Which statement about market efficiency is correct?",
    choices: [
      {
        id: "a",
        label:
          "Market efficiency does not mean prices are always correct. It means that identifying pricing errors before others do is difficult enough that obvious opportunities tend to disappear quickly.",
      },
      { id: "b", label: "If markets are efficient, financial analysis is a waste of time." },
      { id: "c", label: "If markets are efficient, no investor can ever outperform." },
    ],
    correctId: "a",
    hint: "Efficiency is a practical challenge, not an absolute claim. Analysis is what makes prices informative. Some investors may outperform — the difficulty is distinguishing skill from luck.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "Two companies both grew earnings 15%. Company A's stock rose. Company B's stock fell. What is the most likely explanation?",
    choices: [
      {
        id: "a",
        label:
          "The market expected different growth rates. Company A's 15% exceeded expectations (positive surprise). Company B's 15% fell short of expectations (negative surprise). Same growth, different reactions.",
      },
      { id: "b", label: "Company A is a better company than Company B." },
      { id: "c", label: "The market is inefficient and mispriced one of the stocks." },
    ],
    correctId: "a",
    hint: "Returns depend on results relative to expectations, not on absolute performance. The same growth rate can produce opposite surprises depending on what the price assumed.",
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
          When you discover that a company looks attractive, how do you know the market has not
          already discovered the same thing?
        </p>
      </div>
    </Reveal>
  );
}

export default function Lesson9_1() {
  const report = useReportEMComplete("efficient-market-hypothesis");

  return (
    <EMLayout>
      <PVHero
        index="9.1"
        eyebrow="Lesson 9.1 · Module 9 — Efficient Markets"
        heading="Why Beating the Market Is Difficult"
        subheading="When you discover that a company looks attractive, how do you know the market has not already discovered the same thing? A good company is not automatically a good investment."
        bullets={[
          "Public information is incorporated into prices quickly",
          "Obvious opportunities attract competition and disappear",
          "A good company is not the same as a good investment",
          "Information is not the same as a differentiated insight",
          "What market efficiency does and does not mean",
          "What could create a genuine investment edge",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== 1. OPENING SCENARIO ===================== */}
      <ConceptSection
        index="9.1.1"
        eyebrow="Section 1 · Great news. Should you buy?"
        title="The earnings announcement problem"
        intro={<>A company reports strong earnings. Before you buy, consider: has the market already processed this information?</>}
      >
        <Reveal>
          <InteractiveFrame>
            <EarningsAnnouncementOpening />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 2. PRICE AS AN EXPECTATION ===================== */}
      <ConceptSection
        index="9.1.2"
        eyebrow="Section 2 · Price as an expectation"
        title="A stock price is not a score for past performance"
        intro="The price reflects market expectations about future revenue, margins, growth, risk, and the probability of different outcomes. Different types of information are incorporated to different degrees."
      >
        <Reveal>
          <InteractiveFrame>
            <PriceAsExpectation />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 3. TRADE AWAY THE OPPORTUNITY ===================== */}
      <ConceptSection
        index="9.1.3"
        eyebrow="Section 3 · Trade away the opportunity"
        title="Competition shrinks the gap"
        intro={<>You estimate a stock is worth $60 but it trades at $50. Advance through the rounds to see what happens as competing investors notice the same opportunity.</>}
      >
        <Reveal>
          <InteractiveFrame>
            <TradeAwayOpportunity />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 4. CHALLENGER CASE STUDY ===================== */}
      <ConceptSection
        index="9.1.4"
        eyebrow="Section 4 · Case study — Challenger and price discovery"
        title="Decentralized information aggregation"
        intro={<>On January 28, 1986, the space shuttle Challenger exploded. The market&apos;s reaction to contractor stocks revealed information before the official investigation confirmed it.</>}
      >
        <Reveal>
          <DefinitionCard term="Price discovery">
            The process by which the collective actions of many investors — each holding partial
            information — produce a price that reflects their aggregate knowledge. No single investor
            needs the complete picture; trading aggregates the pieces.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <ChallengerCaseStudy />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 5. INFORMATION OR EDGE ===================== */}
      <ConceptSection
        index="9.1.5"
        eyebrow="Section 5 · Information or edge?"
        title="The most important analytical distinction"
        intro="Classify each statement as known information, market expectation, possible analytical edge, or unsupported opinion."
      >
        <Reveal>
          <InteractiveFrame>
            <InformationOrEdgeClassifier />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 6. GOOD COMPANY VS GOOD INVESTMENT ===================== */}
      <ConceptSection
        index="9.1.6"
        eyebrow="Section 6 · Good company versus good investment"
        title="Surprise relative to expectations drives returns"
        intro="Company A grows 20% but the market expected 25%. Company B grows 5% but the market expected 0%. Which stock performs better?"
      >
        <Reveal>
          <InteractiveFrame>
            <GoodCompanyVsGoodInvestment />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 7. WHAT EFFICIENCY DOES NOT MEAN ===================== */}
      <ConceptSection
        index="9.1.7"
        eyebrow="Section 7 · What market efficiency does not mean"
        title="Five common misconceptions"
        intro="Market efficiency is not an unquestionable truth. It is a practical challenge and a reasonable baseline assumption."
      >
        <Reveal>
          <InteractiveFrame>
            <MarketEfficiencyMisconceptions />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 8. GENUINE EDGE ===================== */}
      <ConceptSection
        index="9.1.8"
        eyebrow="Section 8 · What could create a genuine edge?"
        title="Five possible sources of advantage"
        intro="Claiming an edge is easy. Demonstrating one is difficult. Explore five categories of potential advantage — each with a definition, example, and limitation."
      >
        <Reveal>
          <InteractiveFrame>
            <GenuineEdgeSources />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 9. PRACTICAL CHECKLIST ===================== */}
      <ConceptSection
        index="9.1.9"
        eyebrow="Section 9 · Practical investment checklist"
        title="Seven questions before you invest"
        intro="Use this checklist before acting on any investment thesis. Check each item to expand its explanation."
      >
        <Reveal>
          <InteractiveFrame>
            <PracticalInvestmentChecklist />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 10. KNOWLEDGE CHECK ===================== */}
      <ConceptSection
        index="9.1.10"
        eyebrow="Section 10 · Knowledge check"
        title="Test your understanding"
        intro="Five questions covering the central concepts of this lesson."
      >
        <Reveal>
          <MasteryCheck
            passCount={4}
            onComplete={() => report()}
            continueLabel="Continue to Lesson 9.2"
            continueHref="/lessons/forms-of-market-efficiency"
            questions={QUESTIONS}
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== 11. CLOSING SYNTHESIS ===================== */}
      <ConceptSection
        index="9.1.11"
        eyebrow="Section 11 · Closing synthesis"
        title="Markets do not need to be perfect — only competitive"
        intro="The practical implication for every investor."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <p className="ops-body max-w-3xl text-[18px] leading-[1.6] text-white sm:text-[20px]">
              Markets do not need to be perfectly correct to be difficult to beat. They only need to
              be competitive enough that obvious opportunities attract attention and disappear quickly.
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
              Toward Lesson 9.2
            </div>
            <p className="ops-body mt-3 text-[18px] leading-[1.6] text-white">
              If beating the market is difficult, how should investors evaluate active managers who
              claim they can do it?
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Lesson 9.2"
          continueHref="/lessons/forms-of-market-efficiency"
        />
      </Reveal>

      <Reveal className="mt-8">
        <EMSourcePanel />
      </Reveal>
    </EMLayout>
  );
}
