"use client";

import IFLessonLayout from "./IFLessonLayout";
import PhilosophyOpeningCards from "./PhilosophyOpeningCards";
import BeliefToStrategyFlow from "./BeliefToStrategyFlow";
import PhilosophyClassifier from "./PhilosophyClassifier";
import PhilosophyNeed from "./PhilosophyNeed";
import ProvisionalBeliefBuilder from "./ProvisionalBeliefBuilder";
import LessonAssessment from "./LessonAssessment";
import { Reveal, SectionHeading, Panel, DefinitionCard } from "./shared";
import { IF_LEARNING_OBJECTIVES } from "./shared";

export default function LessonIF_1_1() {
  return (
    <IFLessonLayout>
      <section className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(251,191,36,0.10),transparent_55%)]" />
        <div className="relative pb-10 pt-4">
          <div className="ops-eyebrow flex items-center gap-3 text-xs">
            <span className="tabular-nums text-accent-amber">1.1</span>
            <span className="h-px w-8 bg-white/30" />
            <span>Investment Foundations · Module 1</span>
          </div>
          <h1 className="ops-display mt-5 text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            Philosophy Before Strategy
          </h1>
          <p className="ops-body mt-5 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            A strategy tells you what to do. A philosophy explains why the
            strategy should work—and what would prove it wrong.
          </p>

          <Reveal delay={0.05} className="mt-8">
            <div className="ops-definition-card p-5">
              <div className="ops-caption text-[10px] text-accent-amber">
                Central question
              </div>
              <p className="ops-definition mt-2 text-[17px] text-slate-50">
                What do you believe about markets, and does your strategy follow
                logically from that belief?
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="mt-5">
            <div className="flex flex-wrap gap-2 text-[13px] text-slate-300">
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                12–15 minutes
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                One classification lab
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                One saved hypothesis
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <Reveal className="mt-6">
        <Panel>
          <div className="ops-caption text-[11px] text-accent-amber">
            By the end of this lesson, you should be able to:
          </div>
          <ol className="mt-3 space-y-2">
            {IF_LEARNING_OBJECTIVES.map((objective, index) => (
              <li
                key={objective}
                className="ops-body flex items-start gap-3 text-[15px] text-slate-200"
              >
                <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-accent-amber/40 bg-accent-amber/10 px-1.5 font-sans text-[12px] text-accent-amber">
                  {index + 1}
                </span>
                <span>{objective}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </Reveal>

      <Reveal className="mt-14">
        <SectionHeading
          index="01"
          eyebrow="Start with the reasoning"
          title="The same trade can come from two very different processes"
        />
      </Reveal>
      <div className="mt-6">
        <PhilosophyOpeningCards />
      </div>

      <Reveal className="mt-14">
        <SectionHeading
          index="02"
          eyebrow="The framework"
          title="A philosophy sits between belief and action"
        />
      </Reveal>
      <div className="mt-6">
        <BeliefToStrategyFlow />
      </div>

      <Reveal className="mt-14">
        <SectionHeading
          index="03"
          eyebrow="Classification lab"
          title="Name the layer before judging the idea"
        />
      </Reveal>
      <div className="mt-6">
        <PhilosophyClassifier />
      </div>

      <Reveal className="mt-14">
        <SectionHeading
          index="04"
          eyebrow="Why it matters"
          title="A philosophy gives you a reason to stay—or a reason to change"
        />
      </Reveal>
      <div className="mt-6">
        <PhilosophyNeed />
      </div>

      <Reveal className="mt-14">
        <SectionHeading
          index="05"
          eyebrow="Lesson output"
          title="Write a hypothesis, not a declaration"
        />
      </Reveal>
      <div className="mt-6">
        <ProvisionalBeliefBuilder />
      </div>

      <Reveal className="mt-14">
        <SectionHeading
          index="06"
          eyebrow="Mastery check"
          title="Can you follow the reasoning under pressure?"
        />
      </Reveal>
      <div className="mt-6">
        <LessonAssessment />
      </div>

      <Reveal className="mt-14">
        <SectionHeading
          index="07"
          eyebrow="Carry this forward"
          title="Do not confuse a result with an explanation"
        />
      </Reveal>
      <div className="mt-6">
        <ClosingSynthesis />
      </div>
    </IFLessonLayout>
  );
}

const PRINCIPLES = [
  {
    title: "A strategy is not self-justifying",
    body: "A screen, signal, or trading rule needs an explanation for why it should earn a return after risk and costs.",
  },
  {
    title: "Underperformance is evidence, not an automatic verdict",
    body: "Ask whether the market belief failed, the strategy was implemented poorly, or the result falls within normal variation.",
  },
  {
    title: "A useful belief can be challenged",
    body: "If you cannot name evidence that would change your mind, you do not yet have a testable investment philosophy.",
  },
] as const;

function ClosingSynthesis() {
  return (
    <>
      <DefinitionCard>
        Evidence informs a market belief. The belief supports a philosophy. The
        philosophy narrows the strategies worth considering. Only then does an
        individual trade make sense.
      </DefinitionCard>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PRINCIPLES.map((principle, index) => (
          <Panel key={principle.title}>
            <span className="font-sans text-[12px] tabular-nums text-accent-amber">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="ops-interactive-title mt-3 text-[16px] text-white">
              {principle.title}
            </h3>
            <p className="ops-body mt-2 text-[14px] text-slate-300">
              {principle.body}
            </p>
          </Panel>
        ))}
      </div>

      <div className="ops-definition-card mt-6 p-5">
        <div className="ops-caption text-[10px] text-accent-cyan">Next</div>
        <p className="ops-body mt-2 text-[15px] text-slate-200">
          Lesson 1.2 maps where these beliefs affect the investment process:
          mandate, allocation, selection, execution, and evaluation.
        </p>
      </div>
    </>
  );
}
