"use client";

import IFLessonLayout from "./IFLessonLayout";
import TimingJourney from "./TimingJourney";
import { Reveal, IF_PB_11_SOURCE_BASIS } from "./shared";

export default function LessonIF_PB_11() {
  return (
    <IFLessonLayout sourceBasis={IF_PB_11_SOURCE_BASIS}>
      <section className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(251,191,36,0.10),transparent_55%)]" />
        <div className="relative pb-10 pt-4">
          <div className="ops-eyebrow flex items-center gap-3 text-xs">
            <span className="tabular-nums text-accent-amber">Mission 11</span>
            <span className="h-px w-8 bg-white/30" />
            <span>Investment Foundations · Set a market-timing policy</span>
          </div>
          <h1 className="ops-display mt-5 text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            Set a Market-Timing Policy
          </h1>
          <p className="ops-body mt-5 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            You have an allocation and an architecture. This mission decides whether you
            will ever move away from them on purpose — and if so, how far, for how long, and
            what brings you back. Deciding not to time the market is a policy too, and it
            counts.
          </p>

          <Reveal delay={0.05} className="mt-7">
            <div className="ops-definition-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="ops-caption text-[12px] text-accent-amber">
                    Your mission
                  </div>
                  <p className="ops-body-strong mt-2 max-w-xl text-[16px] text-white">
                    Price what being out of the market costs in both directions, test two of
                    the most repeated market rules against their own record, then write
                    either a no-timing policy or a tilt bounded by a limit, an expiry and a
                    stop — and hold it against a headline you did not plan for.
                  </p>
                </div>
                <a
                  href="#lesson-journey"
                  className="inline-flex flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
                >
                  Start the timeline ↓
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="mt-4">
            <div className="flex flex-wrap gap-2 text-[14px] text-slate-400">
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                30 minutes
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                Six guided stages
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                One saved Timing Policy
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <TimingJourney />
    </IFLessonLayout>
  );
}
