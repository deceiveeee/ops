"use client";

import { useState } from "react";
import ModuleIntroLayout from "./ModuleIntroLayout";
import ChapterHero from "./ChapterHero";
import ObjectiveTracker from "./ObjectiveTracker";
import CourseRoadmap from "./CourseRoadmap";
import KeyTermsAccordion from "./KeyTermsAccordion";
import AppliedDiagnostic from "./AppliedDiagnostic";
import MiniActivity from "./MiniActivity";
import LessonTakeaway from "./LessonTakeaway";
import LessonSummary from "./LessonSummary";
import { Reveal, SectionHeading } from "./shared";
import { MODULE_OBJECTIVES } from "./lessonContent";

/** The module objective this lesson covers, by position in MODULE_OBJECTIVES. */
const LESSON_OBJECTIVES = [6] as const;

export default function Lesson5() {
  const [covered, setCovered] = useState<boolean[]>(MODULE_OBJECTIVES.map(() => false));
  const mark = (i: number) => setCovered((prev) => prev.map((v, idx) => (idx === i ? true : v)));

  return (
    <ModuleIntroLayout>
      {/*
        The lesson opens on the course roadmap, which is the first thing its
        title names. The roadmap panel carries its own caption, so the section
        heading that only repeated it is gone and the later sections are
        renumbered. e2e/lesson-first-tap.spec.ts holds the roadmap to the first
        screen.
      */}
      <div className="ops-tone-teal">
        <ChapterHero
          compact
          index="05"
          eyebrow="Lesson 5 · Module 1"
          title="Finance Roadmap and Personal Application"
        />

        <p className="ops-body mt-4 text-[15px] leading-snug text-slate-200 sm:mt-6">
          Tap a stage to see what it covers.
        </p>
        <section aria-label="Course roadmap" className="mt-3">
          <CourseRoadmap />
        </section>
      </div>

      <Reveal className="mt-10">
        <LessonSummary
          subtitle="Connect the module to the full Finance Foundations course and apply the finance framework to yourself."
          topics={["Roadmap", "Key Terms", "Application"]}
        />
      </Reveal>
      <Reveal className="mt-5">
        <ObjectiveTracker
          objectives={MODULE_OBJECTIVES}
          covered={covered}
          inThisLesson={LESSON_OBJECTIVES}
        />
      </Reveal>

      <div className="ops-tone-blue">
        <Reveal className="mt-12">
          <SectionHeading emphasis index="01" eyebrow="Reference" title="Key Terms" />
        </Reveal>
        <Reveal delay={0.05} className="mt-6">
          <KeyTermsAccordion />
        </Reveal>
      </div>

      <div className="ops-tone-ochre">
        <Reveal className="mt-12">
          <SectionHeading emphasis index="02" eyebrow="Final check" title="Applied Diagnostic" />
        </Reveal>
        <Reveal delay={0.05} className="mt-6">
          <AppliedDiagnostic onComplete={() => mark(6)} />
        </Reveal>
      </div>

      <div className="ops-tone-plum">
        <Reveal className="mt-12">
          <SectionHeading emphasis index="03" eyebrow="Apply it" title="Mini Activity" />
        </Reveal>
        <Reveal delay={0.05} className="mt-6">
          <MiniActivity />
        </Reveal>
      </div>

      <Reveal className="mt-12">
        <LessonTakeaway
          takeaway="Finance is the study of valuation and management under time and risk."
          points={[
            "What is it worth?",
            "What should I do with it?",
            "When will cash flows occur?",
            "How risky are those cash flows?",
            "How do markets determine prices?",
          ]}
          finishModule
        />
      </Reveal>
    </ModuleIntroLayout>
  );
}
