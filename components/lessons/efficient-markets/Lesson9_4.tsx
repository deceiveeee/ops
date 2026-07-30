"use client";

import {
  Reveal,
  Panel,
  DefinitionCard,
  InteractiveFrame,
  MasteryCheck,
  type MasteryQuestion,
  LessonSummary,
  ConceptSection,
} from "./shared";
import TwoIncompletePhilosophiesOpening from "./TwoIncompletePhilosophiesOpening";
import PhilosophyHierarchy from "./PhilosophyHierarchy";
import FiveQuestionsFramework from "./FiveQuestionsFramework";
import ImplementationChoice from "./ImplementationChoice";
import PhilosophyBuilder from "./PhilosophyBuilder";
import ProtectiveRules from "./ProtectiveRules";
import RewriteBadRule from "./RewriteBadRule";
import ThesisCatalystRisk from "./ThesisCatalystRisk";
import PhilosophyCaseStudy from "./PhilosophyCaseStudy";
import DecisionJournal from "./DecisionJournal";
import ProcessScorecard from "./ProcessScorecard";
import WhenToChangePhilosophy from "./WhenToChangePhilosophy";
import PhilosophyRedFlags from "./PhilosophyRedFlags";
import InvestmentPolicyStatement from "./InvestmentPolicyStatement";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import EMLayout from "./EMLayout";
import EMSourcePanel from "./EMSourcePanel";
import { useReportEMComplete } from "@/lib/em-progress";

const SUMMARY_POINTS = [
  "An investment philosophy is a set of beliefs about how markets work, where returns come from, and how decisions should be made under uncertainty.",
  "Philosophy, strategy, and individual portfolio decisions sit at three different levels — and each must be consistent with the level above.",
  "Every defensible philosophy answers five questions: how efficient markets are, where expected return comes from, what the claimed edge is, what risks could fail the strategy, and how success will be measured.",
  "Passive, active, and blended implementations each have conditions that make them defensible — none is universally optimal.",
  "Behavioral and portfolio rules structure judgment before emotion dominates. Write the thesis, size positions, separate price from thesis, cool off, review on a schedule.",
  "A complete investment case has three components: thesis, correction mechanism, and survival plan. All three must be present before committing capital.",
  "Evaluate process separately from outcome. A profitable result does not validate the reasoning that produced it.",
  "Change a philosophy when evidence, constraints, implementation, costs, market structure, or the assumed edge changes materially — not because a different strategy had a better year.",
];

const SOURCES = [
  "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Lecture 21: Efficient Markets — implications for active management, behavioral biases, and the design of an investment process.",
  "Andrew Lo's discussion of rational finance, behavioral finance, heuristics, adaptation, and changing market conditions — adaptive markets as a synthesis of competition, behavior, and changing conditions rather than an uncontested theory.",
  "Prior OPS lessons on valuation, portfolio theory, CAPM, risk, beta, and capital budgeting — the practical building blocks a philosophy must integrate.",
];

const FINAL_PRINCIPLES = [
  {
    n: 1,
    title: "Respect the market.",
    body: "Obvious information is rarely a free opportunity. Prices incorporate the work of thousands of other investors, and most public information is already reflected.",
  },
  {
    n: 2,
    title: "Demand evidence of an edge.",
    body: "Confidence, intelligence, and effort are not enough. An edge must be specific, observable, repeatable, large enough to overcome costs, and compatible with the investor's time horizon.",
  },
  {
    n: 3,
    title: "Control behavior and implementation.",
    body: "A valid idea can fail through leverage, concentration, poor liquidity, or weak discipline. Rules written before the moment of pressure are the only rules that hold.",
  },
  {
    n: 4,
    title: "Judge the process over the correct horizon.",
    body: "Good decisions can lose and bad decisions can win. Evaluate the reasoning, not just the result — and use a horizon that matches the strategy.",
  },
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt:
      "An investor says: 'I believe markets are competitive, so I will use low-cost diversified funds for most of my portfolio. I may allocate up to 10% to active positions where I can write a complete thesis.' Which level of the hierarchy does this statement primarily occupy?",
    choices: [
      { id: "a", label: "Strategy. The investor is translating a market belief into an operational approach with explicit rules." },
      { id: "b", label: "Philosophy. The investor is stating core beliefs about markets." },
      { id: "c", label: "Portfolio decision. The investor is making an isolated trade." },
    ],
    correctId: "a",
    hint: "A philosophy is the underlying belief. A strategy operationalizes it. A portfolio decision is a single trade. This statement sits between belief and trade.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "An investor claims: 'I work hard and research companies, so I have an edge.' Is this a sufficient edge?",
    choices: [
      { id: "a", label: "No. The investor must explain how their research produces decisions that differ from consensus, are repeatable, and are large enough to overcome costs." },
      { id: "b", label: "Yes. Effort and research are sufficient evidence of skill." },
      { id: "c", label: "Only if the investor has a degree in finance." },
    ],
    correctId: "a",
    hint: "Effort and research are inputs. An edge must be specific, observable, repeatable, difficult to copy, large enough to overcome costs, and compatible with the investor's time horizon.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "Why should an investor define invalidation conditions before buying, rather than after?",
    choices: [
      { id: "a", label: "To prevent endlessly rationalizing evidence that contradicts the original thesis. Written conditions decided in advance are far harder to explain away than ones invented after a loss." },
      { id: "b", label: "Because regulators require invalidation conditions in writing." },
      { id: "c", label: "To guarantee that the position will be profitable." },
    ],
    correctId: "a",
    hint: "Hindsight bias and thesis drift are powerful. A pre-committed invalidation condition is the only honest record of what would have changed your mind.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "An investor buys a stock on a rumor with no written thesis and a 40% portfolio weight. The stock doubles in three months. Does the gain validate the strategy?",
    choices: [
      { id: "a", label: "No. A favorable outcome does not prove sound process. The same approach applied many times is likely to produce occasional wins and frequent large losses." },
      { id: "b", label: "Yes. A doubled investment is the only proof that matters." },
      { id: "c", label: "Only if the rumor turned out to be true." },
    ],
    correctId: "a",
    hint: "Evaluate process and outcome separately. A profitable result does not validate the reasoning that produced it.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "Which combination makes an active investment case complete?",
    choices: [
      { id: "a", label: "A valuation thesis, an explanation of why the market may be wrong, a correction mechanism, and a survival plan that controls for adverse outcomes." },
      { id: "b", label: "A high target price and a strong opinion about the company." },
      { id: "c", label: "A diversified portfolio and a long time horizon." },
    ],
    correctId: "a",
    hint: "Thesis + correction mechanism + survival plan. Each component addresses a different question — why the asset is mispriced, what will close the gap, and how the investor survives being early or wrong.",
  },
  {
    id: "q6",
    type: "single",
    prompt:
      "An investor follows a disciplined long-term passive strategy. A speculative sector returns 80% in one year while the passive portfolio returns 7%. When should the investor revise the philosophy?",
    choices: [
      { id: "a", label: "Only if the evidence, constraints, costs, market structure, or the original reasoning changes materially — not merely because a different strategy had a better year." },
      { id: "b", label: "Immediately. One year of underperformance proves the philosophy is wrong." },
      { id: "c", label: "Whenever a friend earns more." },
    ],
    correctId: "a",
    hint: "Short-term underperformance relative to a temporarily leading sector is exactly what a passive strategy predicts. Change when the evidence changes — not when the price moves.",
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
          Given that markets are difficult to beat but not perfectly efficient, how should an
          investor actually behave?
        </p>
      </div>
    </Reveal>
  );
}

export default function Lesson9_4() {
  const report = useReportEMComplete("building-investment-philosophy");

  return (
    <EMLayout>
      <PVHero
        index="9.4"
        eyebrow="Lesson 9.4 · Module 9 — Efficient Markets"
        heading="Building an Investment Philosophy"
        subheading="Given that markets are difficult to beat but not perfectly efficient, how should an investor actually behave? A practical synthesis: market beliefs, expected return sources, claimed edges, implementation choices, behavioral rules, and an editable personal investment policy statement."
        bullets={[
          "Distinguish philosophy, strategy, and individual decisions",
          "Answer the five questions every philosophy must address",
          "Choose a passive, active, or blended implementation coherently",
          "Build a provisional philosophy with a guided builder",
          "Adopt protective rules that survive pressure",
          "Draft a personal investment policy statement",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== 1. OPENING SCENARIO ===================== */}
      <ConceptSection
        index="9.4.1"
        eyebrow="Section 1 · Two incomplete philosophies"
        title="Neither investor has a strategy"
        intro={<>Two fictional investors each state a conclusion without the supporting beliefs and rules that make a philosophy actionable. Which one has the stronger philosophy?</>}
      >
        <Reveal>
          <InteractiveFrame>
            <TwoIncompletePhilosophiesOpening />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 2. WHAT IS A PHILOSOPHY ===================== */}
      <ConceptSection
        index="9.4.2"
        eyebrow="Section 2 · What is an investment philosophy?"
        title="Three levels: philosophy, strategy, decision"
        intro="A philosophy is a set of beliefs about markets and decisions. A strategy operationalizes it. A single trade is not a philosophy."
      >
        <Reveal>
          <InteractiveFrame>
            <PhilosophyHierarchy />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 3. FIVE QUESTIONS ===================== */}
      <ConceptSection
        index="9.4.3"
        eyebrow="Section 3 · The five questions every philosophy must answer"
        title="The organizing framework"
        intro="A defensible philosophy must explain: market efficiency beliefs, return sources, the claimed edge, the risks of failure, and how success will be measured."
      >
        <Reveal>
          <InteractiveFrame>
            <FiveQuestionsFramework />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 4. IMPLEMENTATION ===================== */}
      <ConceptSection
        index="9.4.4"
        eyebrow="Section 4 · Passive, active, or blended?"
        title="Implementation follows from beliefs"
        intro="None of these structures is universally optimal. Each is defensible under specific conditions of belief, edge, cost, and constraint."
      >
        <Reveal>
          <InteractiveFrame>
            <ImplementationChoice />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 5. PHILOSOPHY BUILDER ===================== */}
      <ConceptSection
        index="9.4.5"
        eyebrow="Section 5 · Build your philosophy"
        title="A guided six-step builder"
        intro="Answer six short prompts. Your selections generate an editable philosophy statement, saved locally in your browser. Educational draft — not personalized financial advice."
      >
        <Reveal>
          <InteractiveFrame>
            <PhilosophyBuilder />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 6. PROTECTIVE RULES ===================== */}
      <ConceptSection
        index="9.4.6"
        eyebrow="Section 6 · Rules that protect investors from themselves"
        title="Five rules to write before pressure arrives"
        intro="The purpose of rules is not to eliminate judgment. It is to structure judgment before emotion dominates."
      >
        <Reveal>
          <InteractiveFrame>
            <ProtectiveRules />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 7. REWRITE BAD RULES ===================== */}
      <ConceptSection
        index="9.4.7"
        eyebrow="Section 7 · Rewrite the bad rule"
        title="Improve six common but broken rules"
        intro="Each rule below sounds decisive — but each confuses action with reasoning. Identify the flaw, then reveal a stronger replacement."
      >
        <Reveal>
          <InteractiveFrame>
            <RewriteBadRule />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 8. THESIS / CATALYST / RISK ===================== */}
      <ConceptSection
        index="9.4.8"
        eyebrow="Section 8 · Separate thesis, catalyst, and risk control"
        title="Three components of a complete investment case"
        intro="A sound thesis does not excuse a missing catalyst. A clear catalyst does not excuse a missing survival plan."
      >
        <Reveal>
          <InteractiveFrame>
            <ThesisCatalystRisk />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 9. CASE STUDY ===================== */}
      <ConceptSection
        index="9.4.9"
        eyebrow="Section 9 · Case study — evaluate a complete philosophy"
        title="A fictional investor, a proposed philosophy"
        intro="Evaluate the philosophy against the five questions. Identify what is concrete, what is missing, and what evidence would justify changing the active allocation."
      >
        <Reveal>
          <InteractiveFrame>
            <PhilosophyCaseStudy />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 10. DECISION JOURNAL ===================== */}
      <ConceptSection
        index="9.4.10"
        eyebrow="Section 10 · Portfolio decision journal"
        title="Record what you believed before the outcome"
        intro="A structured before-and-after template. Auto-saves locally. Print or save as PDF for a one-page record of one decision."
      >
        <Reveal>
          <InteractiveFrame>
            <DecisionJournal />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 11. PROCESS SCORECARD ===================== */}
      <ConceptSection
        index="9.4.11"
        eyebrow="Section 11 · Process scorecard"
        title="Score four cases across seven dimensions"
        intro="Separate what the investor controlled (process) from what they did not (outcome). A profitable result does not validate the reasoning that produced it."
      >
        <Reveal>
          <InteractiveFrame>
            <ProcessScorecard />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 12. WHEN TO CHANGE ===================== */}
      <ConceptSection
        index="9.4.12"
        eyebrow="Section 12 · When should an investor change philosophy?"
        title="Disciplined consistency vs. stubborn refusal"
        intro="Change a philosophy when evidence, constraints, implementation, costs, market structure, or the assumed edge changes materially — not because a different strategy had a better year."
      >
        <Reveal>
          <InteractiveFrame>
            <WhenToChangePhilosophy />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 13. RED FLAGS ===================== */}
      <ConceptSection
        index="9.4.13"
        eyebrow="Section 13 · Red flags in an investment philosophy"
        title="Diagnostic for common warning signs"
        intro="Each red flag substitutes a feeling for evidence. Tap a flag to see what is missing and how to make the claim defensible."
      >
        <Reveal>
          <InteractiveFrame>
            <PhilosophyRedFlags />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 14. IPS ===================== */}
      <ConceptSection
        index="9.4.14"
        eyebrow="Section 14 · Personal investment policy statement"
        title="Your editable one-page policy"
        intro="Complete each section in your own words. Auto-saves locally. Print or save as PDF when complete. Educational draft — not personalized financial advice."
      >
        <Reveal>
          <InteractiveFrame>
            <InvestmentPolicyStatement />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== 15. KNOWLEDGE CHECK ===================== */}
      <ConceptSection
        index="9.4.15"
        eyebrow="Section 15 · Knowledge check"
        title="Test your understanding"
        intro="Six scenario-based questions covering philosophy vs. strategy, edge specificity, invalidation conditions, process vs. outcome, complete investment cases, and when to revise a philosophy."
      >
        <Reveal>
          <MasteryCheck
            passCount={4}
            onComplete={() => report()}
            continueLabel="Continue"
            continueHref="/lessons/information-and-prices"
            questions={QUESTIONS}
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== 16. CLOSING SYNTHESIS ===================== */}
      <ConceptSection
        index="9.4.16"
        eyebrow="Section 16 · Module 9 closing synthesis"
        title="Four principles to take forward"
        intro="The practical conclusion of Module 9."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <p className="ops-body max-w-3xl text-[18px] leading-[1.6] text-white sm:text-[20px]">
              Markets are informative but imperfect. Active investing is possible but difficult.
              Behavioral mistakes create opportunities, while financial constraints make those
              opportunities dangerous to exploit.
            </p>
            <p className="ops-body mt-5 max-w-3xl text-[16px] leading-[1.6] text-slate-100">
              A sound investor does not begin by asking which stock to buy. The investor begins by
              deciding what they believe about markets, where returns are expected to come from,
              what advantage they possess, and what rules will prevent one mistake from becoming
              permanent.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FINAL_PRINCIPLES.map((p) => (
              <div key={p.n} className="rounded-2xl border border-white/15 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-accent-cyan/40 bg-accent-cyan/10 font-sans text-[14px] text-accent-cyan">
                    {p.n}
                  </span>
                  <h4 className="ops-section-title text-[18px] leading-tight text-white sm:text-[20px]">
                    {p.title}
                  </h4>
                </div>
                <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">{p.body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <Panel>
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
              Module 9 complete
            </div>
            <p className="ops-body mt-3 text-[18px] leading-[1.6] text-white">
              You now have the conceptual tools and a draft personal policy. The next step is to
              apply them — first to a single small decision, observed carefully, and then to the
              portfolio over time.
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
