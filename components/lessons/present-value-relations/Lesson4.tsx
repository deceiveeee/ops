"use client";

import { useState } from "react";
import {
  Reveal,
  SectionHeading,
  Panel,
  InteractiveFrame,
} from "@/components/lessons/intro-course-overview/shared";
import Button from "@/components/ui/Button";
import PVLayout from "./PVLayout";
import PVHero from "./PVHero";
import ModuleMap from "./ModuleMap";
import LessonSummary from "./LessonSummary";
import CFODecisionRoom from "./CFODecisionRoom";
import PracticeArena from "./PracticeArena";
import MasteryRoad from "./MasteryRoad";
import {
  usePVProgress,
  useReportLessonComplete,
  type MasterySkill,
} from "@/lib/pv-progress";

const SKILLS: MasterySkill[] = [
  "timeline-reading",
  "discounting",
  "npv-decisions",
  "perpetuity-logic",
  "annuity-logic",
  "compounding",
  "real-vs-nominal",
];

const RECAP_POINTS = [
  "Assets are sequences of cashflows.",
  "Cashflows at different dates are different economic units.",
  "Present value converts future cashflows into today's dollars.",
  "NPV is the present value of benefits minus costs.",
  "Positive-NPV projects create value.",
  "Perpetuities and annuities are special cashflow patterns.",
  "Compounding affects the true annual rate.",
  "Inflation changes purchasing power.",
  "Real and nominal cashflows must be discounted consistently.",
];

export default function Lesson4() {
  const report = useReportLessonComplete(
    "present-value-cfo-decision-room",
    SKILLS,
  );
  const { ready, capstoneUnlocked } = usePVProgress();
  const [bypass, setBypass] = useState(false);

  const showCapstone = ready && (capstoneUnlocked() || bypass);

  return (
    <PVLayout>
      <PVHero
        index="04"
        eyebrow="Lesson 4 · Module 2"
        heading="Can you advise the CFO?"
        subheading="You now have the tools: timelines, discounting, NPV, special cashflows, compounding, and real-vs-nominal consistency. Apply them in one integrated decision."
        primaryLabel="Enter the CFO Decision Room"
      />

      <div id="lesson-content" />
      <Reveal className="mt-10">
        <ModuleMap />
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading
          index="01"
          eyebrow="Capstone"
          title="CFO Decision Room: Present Value Capstone"
        />
      </Reveal>

      {/* Capstone gate / readiness panel */}
      <Reveal className="mt-6">
        {!ready ? (
          <Panel>
            <p className="ops-body text-[15px] leading-7 text-slate-300">
              Loading your module progress…
            </p>
          </Panel>
        ) : showCapstone ? (
          <CFODecisionRoom onComplete={() => report(true)} />
        ) : (
          <InteractiveFrame>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-amber">
                Locked
              </span>
              <span className="ops-caption text-[11px] text-slate-400">
                Readiness check
              </span>
            </div>
            <h3 className="ops-interactive-title mt-4 text-2xl text-white">
              Complete the three Present Value lessons to unlock the CFO
              Decision Room
            </h3>
            <p className="ops-body mt-3 max-w-2xl text-[15px] leading-7 text-slate-200">
              The capstone draws on timelines, discounting, NPV, perpetuities
              and annuities, compounding, and real-vs-nominal consistency.
              Finish Lessons 1–3 first so the tools are fresh.
            </p>
            <div className="mt-5">
              <Button variant="ghost" size="md" onClick={() => setBypass(true)}>
                Start anyway (preview)
              </Button>
            </div>
          </InteractiveFrame>
        )}
      </Reveal>

      {/* Practice Arena */}
      <Reveal className="mt-12">
        <SectionHeading
          index="02"
          eyebrow="Drills"
          title="Practice Arena"
        />
      </Reveal>
      <Reveal className="mt-6">
        <PracticeArena />
      </Reveal>

      {/* Mastery Road */}
      <Reveal className="mt-12">
        <SectionHeading
          index="03"
          eyebrow="Progress"
          title="Mastery Road"
        />
      </Reveal>
      <Reveal className="mt-6">
        <MasteryRoad />
      </Reveal>

      {/* Module summary */}
      <Reveal className="mt-12">
        <SectionHeading index="04" eyebrow="Wrap-up" title="Module summary" />
      </Reveal>
      <Reveal className="mt-6">
        <LessonSummary
          recapTitle="Module summary"
          points={RECAP_POINTS}
          backLabel="Back to Real vs Nominal"
          backHref="/lessons/present-value-inflation-real-nominal"
          replayLabel="Replay Present Value Relations"
          continueLabel="Continue to Fixed-Income Securities"
          continueHref="/courses/finance-foundations"
        />
      </Reveal>
    </PVLayout>
  );
}
