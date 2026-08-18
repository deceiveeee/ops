"use client";

import AllocationPolicyHeroVisual from "./AllocationPolicyHeroVisual";
import IFLessonLayout from "./IFLessonLayout";
import Mission05AllocationJourney from "./Mission05AllocationJourney";
import { IF_PB_05_SOURCE_BASIS, Reveal } from "./shared";

export default function LessonIF_PB_05() {
  return (
    <IFLessonLayout sourceBasis={IF_PB_05_SOURCE_BASIS}>
      <section className="relative isolate overflow-hidden pb-6 pt-2 sm:pb-8 sm:pt-3">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-48 -top-52 -z-10 h-[34rem] w-[34rem] rounded-full bg-accent-amber/[0.08] blur-3xl motion-reduce:hidden"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-52 top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-accent-cyan/[0.07] blur-3xl motion-reduce:hidden"
        />

        <Reveal>
          <div className="flex flex-wrap items-center gap-3 text-[13px] font-semibold tracking-[0.02em]">
            <span className="tabular-nums text-accent-amber">Portfolio Builder · Mission 5</span>
            <span className="h-px w-8 bg-white/20" aria-hidden />
            <span className="text-slate-400">Allocation and loss-budget policy</span>
          </div>
        </Reveal>

        {/* Screen Budget Rule: this hero was 1221px — 1.4 viewports of preamble
            before the learner could touch anything, on a page that ran 4.5
            screens. A mission is an application, so the hero is now a header:
            title, one line of purpose, the boundary statement the source audit
            requires, and the control that starts the work. The orientation
            facts it used to carry are what stages 1 and 2 actually teach. */}
        <div className="mt-4 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-8">
          <div className="min-w-0">
            <Reveal delay={0.03}>
              <h1 className="ops-display max-w-2xl font-display text-[clamp(26px,2.6vw,34px)] font-medium leading-[1.03] tracking-[-0.03em]">
                Set allocation.
                <span className="text-slate-400"> Make the loss visible.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.06}>
              <p className="ops-body mt-2 max-w-2xl text-[14px] leading-6 text-slate-300">
                Translate a goal, time horizon, near-term cash need, financial capacity,
                and willingness into broad portfolio roles—then inspect exactly how each
                role contributes to an illustrative stress loss.
              </p>
            </Reveal>

            <Reveal delay={0.09}>
              <p className="ops-muted mt-2 max-w-2xl border-l-2 border-accent-amber/50 pl-3 text-[12px] leading-5">
                A policy before products. This mission does not select a stock or fund,
                forecast a return, guarantee a loss limit, or declare one allocation
                optimal for every investor.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href="#lesson-journey"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-[14px] font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 motion-reduce:transition-none"
                >
                  Start with readiness
                </a>
                <span className="text-[13px] leading-5 text-slate-400">
                  Build mine or use the equal practice case
                </span>
              </div>
            </Reveal>
          </div>

          {/* Decorative, and it was setting the hero height at 390px — the tallest
              thing between the learner and the stage. Shown only where the
              viewport can spare it. */}
          <Reveal delay={0.08} className="hidden min-w-0 2xl:block">
            <AllocationPolicyHeroVisual />
          </Reveal>
        </div>
      </section>

      <Mission05AllocationJourney />
    </IFLessonLayout>
  );
}
