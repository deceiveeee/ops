"use client";

import { useState } from "react";
import ModuleIntroLayout from "./ModuleIntroLayout";
import ChapterHero from "./ChapterHero";
import ObjectiveTracker from "./ObjectiveTracker";
import TimeRiskSimulator from "./TimeRiskSimulator";
import MarketLogicConsole from "./MarketLogicConsole";
import LessonTakeaway from "./LessonTakeaway";
import { Reveal, SectionHeading, Panel } from "./shared";
import { MODULE_OBJECTIVES } from "./lessonContent";

export default function Lesson4() {
  const [covered, setCovered] = useState<boolean[]>(
    MODULE_OBJECTIVES.map(() => false),
  );
  const mark = (i: number) =>
    setCovered((prev) => prev.map((v, idx) => (idx === i ? true : v)));

  return (
    <ModuleIntroLayout>
      <ChapterHero
        index="04"
        eyebrow="Lesson 4 · Module 1"
        title="Time, Risk, and the Logic of Finance"
        subtitle="Why time and uncertainty make financial decisions difficult, and the six fundamental principles that guide financial analysis."
        artifacts={[
          { label: "Time", tone: "amber" },
          { label: "Risk", tone: "red" },
          { label: "Principles", tone: "cyan" },
        ]}
      />

      <Reveal className="mt-8">
        <ObjectiveTracker objectives={MODULE_OBJECTIVES} covered={covered} />
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading
          index="01"
          eyebrow="The difficulty"
          title="Why Time and Risk Make Finance Difficult"
        />
      </Reveal>
      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <p className="ops-definition text-[17px]">
            Two factors make finance challenging:{" "}
            <strong className="text-white">time</strong> and{" "}
            <strong className="text-white">risk</strong>.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/5 p-5">
              <div className="ops-caption text-[11px] text-accent-amber">
                Time
              </div>
              <p className="ops-body mt-2 text-[14px] text-slate-200">
                Cash flows now are different from cash flows later. A dollar
                today is not the same as a dollar next year because money can be
                invested, interest can be earned, and inflation can change
                purchasing power.
              </p>
            </div>
            <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 p-5">
              <div className="ops-caption text-[11px] text-accent-red">
                Risk
              </div>
              <p className="ops-body mt-2 text-[14px] text-slate-200">
                Risk means the future is uncertain. Under perfect certainty,
                financial decisions would be much easier. Risk creates the need
                for probability, statistics, historical data, and models of
                uncertainty.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <TimeRiskSimulator onComplete={() => mark(5)} />
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <Panel>
          <div className="ops-caption text-[11px] text-slate-400">
            Definition
          </div>
          <p className="ops-definition mt-2 text-[17px]">
            <strong className="text-white">Risk aversion</strong> means that,
            other things equal, people prefer less risk to more risk when risk
            is defined properly.
          </p>
          <div className="mt-4 rounded-xl border border-white/15 bg-ink-950/60 p-5">
            <div className="ops-caption text-[11px] text-accent-cyan">
              Investors must ask
            </div>
            <ul className="ops-body mt-3 space-y-2.5 text-[15px] text-slate-200">
              <li>· When will I receive cash flows?</li>
              <li>· How uncertain are those cash flows?</li>
              <li>· What return compensates me for waiting?</li>
              <li>· What return compensates me for bearing risk?</li>
            </ul>
          </div>
        </Panel>
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading
          index="02"
          eyebrow="The logic"
          title="Six Fundamental Principles of Finance"
        />
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <MarketLogicConsole onComplete={() => mark(6)} />
      </Reveal>

      <Reveal className="mt-12">
        <div className="glass-panel p-6">
          <div className="ops-caption text-[11px] text-slate-400">Next</div>
          <p className="ops-body mt-2 text-[16px] text-slate-200">
            The final lesson connects this framework to the full course roadmap
            and asks you to apply it to yourself.
          </p>
        </div>
      </Reveal>

      <Reveal className="mt-8">
        <LessonTakeaway
          takeaway="Time and risk make finance difficult; six principles give it a working logic."
          points={[
            "Money today differs from money tomorrow because of investment, interest, and inflation.",
            "Risk creates the need for probability and models of uncertainty.",
            "The six principles are approximations — useful starting points, not perfect laws.",
          ]}
          nextSlug="finance-roadmap-and-personal-application"
          nextLabel="Continue to Finance Roadmap and Personal Application"
        />
      </Reveal>
    </ModuleIntroLayout>
  );
}
