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
import { Reveal, SectionHeading } from "./shared";
import { MODULE_OBJECTIVES } from "./lessonContent";

export default function Lesson5() {
  const [covered, setCovered] = useState<boolean[]>(MODULE_OBJECTIVES.map(() => false));
  const mark = (i: number) => setCovered((prev) => prev.map((v, idx) => (idx === i ? true : v)));

  return (
    <ModuleIntroLayout>
      <ChapterHero
        index="05"
        eyebrow="Lesson 5 · Module 1"
        title="Finance Roadmap and Personal Application"
        subtitle="Connect the module to the full Finance Foundations course and apply the finance framework to yourself."
        artifacts={[
          { label: "Roadmap", tone: "cyan" },
          { label: "Key Terms", tone: "amber" },
          { label: "Application", tone: "red" },
        ]}
      />

      <Reveal className="mt-8">
        <ObjectiveTracker objectives={MODULE_OBJECTIVES} covered={covered} />
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading index="01" eyebrow="Course map" title="Course Roadmap" />
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <CourseRoadmap />
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading index="02" eyebrow="Reference" title="Key Terms" />
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <KeyTermsAccordion />
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading index="03" eyebrow="Final check" title="Applied Diagnostic" />
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <AppliedDiagnostic onComplete={() => mark(6)} />
      </Reveal>

      <Reveal className="mt-12">
        <SectionHeading index="04" eyebrow="Apply it" title="Mini Activity" />
      </Reveal>
      <Reveal delay={0.05} className="mt-6">
        <MiniActivity />
      </Reveal>

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
