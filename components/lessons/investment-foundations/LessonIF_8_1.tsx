"use client";

import ArchitectureJourney from "./ArchitectureJourney";
import IFLessonLayout from "./IFLessonLayout";
import { Reveal, IF_8_1_SOURCE_BASIS } from "./shared";

export default function LessonIF_8_1() {
  return (
    <IFLessonLayout sourceBasis={IF_8_1_SOURCE_BASIS}>
      <section className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(251,191,36,0.10),transparent_55%)]" />
        <div className="relative pb-10 pt-4">
          <div className="ops-eyebrow flex items-center gap-3 text-xs">
            <span className="tabular-nums text-accent-amber">Mission 10</span>
            <span className="h-px w-8 bg-white/30" />
            <span>Investment Foundations · Choose passive, or prove an edge</span>
          </div>
          <h1 className="ops-display mt-5 text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            Choose Passive, or Prove an Edge
          </h1>
          <p className="ops-body mt-5 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            You have researched a business and put a value on it. Now decide whether you are
            going to act on that at all. Passive is the default because it is what the
            evidence supports — and the only way past it is a specific claim that survives
            your own costs, your own evidence test, and your own loss budget.
          </p>

          <Reveal delay={0.05} className="mt-7">
            <div className="ops-definition-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="ops-caption text-[12px] text-accent-amber">Your mission</div>
                  <p className="ops-body-strong mt-2 max-w-xl text-[16px] text-white">
                    Read the current base rate for what it does and does not say, watch a
                    market-beating strategy destroy value once risk and friction are charged,
                    learn what a streak is worth against a 25% null, then work the Edge
                    Licence until every condition is met — or decide that a passive core is
                    your answer.
                  </p>
                </div>
                <a
                  href="#lesson-journey"
                  className="inline-flex flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
                >
                  Start deciding ↓
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="mt-4">
            <div className="flex flex-wrap gap-2 text-[14px] text-slate-400">
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                40 minutes
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                Six guided decisions
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                One saved architecture decision
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <ArchitectureJourney />
    </IFLessonLayout>
  );
}
