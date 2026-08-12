"use client";

import { Reveal } from "./shared";

export default function EquityRiskLessonHero({
  number,
  title,
  intro,
  mission,
  action,
  minutes,
  artifact,
}: {
  number: string;
  title: string;
  intro: string;
  mission: string;
  action: string;
  minutes: string;
  artifact: string;
}) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_26%_18%,rgba(34,211,238,0.10),transparent_48%),radial-gradient(ellipse_at_82%_26%,rgba(251,191,36,0.09),transparent_40%)]" />
      <div className="pointer-events-none absolute right-[7%] top-8 h-36 w-36 rounded-full border border-accent-cyan/10 shadow-[0_0_90px_rgba(34,211,238,0.08)]" />
      <div className="relative pb-10 pt-4">
        <div className="ops-eyebrow flex items-center gap-3 text-xs">
          <span className="tabular-nums text-accent-amber">{number}</span>
          <span className="h-px w-8 bg-white/30" />
          <span>Investment Foundations · Mission 4</span>
        </div>
        <h1 className="ops-display mt-5 max-w-4xl text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="ops-body mt-5 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
          {intro}
        </p>

        <Reveal delay={0.05} className="mt-7">
          <div className="ops-definition-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="ops-caption text-[12px] text-accent-amber">
                  Your mission
                </div>
                <p className="ops-body-strong mt-2 max-w-xl text-[16px] text-white">
                  {mission}
                </p>
              </div>
              <a
                href="#lesson-journey"
                className="inline-flex flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
              >
                {action} →
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-4">
          <div className="flex flex-wrap gap-2 text-[14px] text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-1.5">
              {minutes}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1.5">
              Five guided missions
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1.5">
              {artifact}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
