"use client";

import IFLessonLayout from "./IFLessonLayout";
import PhilosophyJourney from "./PhilosophyJourney";
import { Reveal } from "./shared";

export default function LessonIF_1_1() {
  return (
    <IFLessonLayout>
      <section className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(251,191,36,0.10),transparent_55%)]" />
        <div className="relative pb-10 pt-4">
          <div className="ops-eyebrow flex items-center gap-3 text-xs">
            <span className="tabular-nums text-accent-amber">1.1</span>
            <span className="h-px w-8 bg-white/30" />
            <span>Investment Foundations · Missions 1-2</span>
          </div>
          <h1 className="ops-display mt-5 text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            Philosophy Before Strategy
          </h1>
          <p className="ops-body mt-5 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            Two investors make the same trade. Only one can explain why it
            should work. Follow their decisions and find the difference.
          </p>

          <Reveal delay={0.05} className="mt-7">
            <div className="ops-definition-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="ops-caption text-[12px] text-accent-amber">
                    Your mission
                  </div>
                  <p className="ops-body-strong mt-2 max-w-xl text-[16px] text-white">
                    Investigate Maya and Daniel, rebuild the reasoning behind a
                    trade, diagnose a failing strategy, and create a hypothesis
                    that evidence can test.
                  </p>
                </div>
                <a
                  href="#lesson-journey"
                  className="inline-flex flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
                >
                  Begin the investigation ↓
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="mt-4">
            <div className="flex flex-wrap gap-2 text-[14px] text-slate-400">
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                12–15 minutes
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                Six guided decisions
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                One saved hypothesis
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <PhilosophyJourney />
    </IFLessonLayout>
  );
}
