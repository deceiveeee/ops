"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IF_EDGE_FAMILIES_LESSONS,
  IF_MISSION_1_LESSONS,
  IF_MISSION_2_LESSONS,
  IF_MODULE_2_LESSONS,
  IF_MODULE_3_LESSONS,
  IF_MODULE_4_LESSONS,
  IF_MODULE_5_LESSONS,
  IF_MODULE_6_LESSONS,
  IF_MODULE_7_LESSONS,
  IF_MODULE_8_LESSONS,
  IF_MODULE_11_LESSONS,
  IF_MODULE_12_LESSONS,
  IF_MODULE_13_LESSONS,
  IF_MODULE_PB5_LESSONS,
} from "./shared";
import { useIFProgress } from "@/lib/if-progress";
import { cn } from "@/lib/utils";

/**
 * Exported so a test can assert every Investment Foundations lesson resolves to
 * a group. Mission 10 shipped showing "Missions 1-2" in the rail because its
 * module was never added here and the lookup below falls back to the first
 * group — a miss that looks like a working page rather than a broken one.
 */
export const JOURNEY_GROUPS = [
  {
    lessons: IF_MISSION_1_LESSONS,
    missionLabel: "Mission 1",
    title: "Set Your Goal and Limits",
  },
  {
    lessons: IF_MISSION_2_LESSONS,
    missionLabel: "Mission 2",
    title: "Observe the Market",
  },
  {
    lessons: IF_EDGE_FAMILIES_LESSONS,
    missionLabel: "Optional lab",
    title: "Six Ways Investors Claim an Edge",
  },
  {
    lessons: IF_MODULE_2_LESSONS,
    missionLabel: "Mission 3",
    title: "The Risk in Bonds",
  },
  {
    lessons: IF_MODULE_3_LESSONS,
    missionLabel: "Mission 4",
    title: "The Risk in Stocks",
  },
  {
    lessons: IF_MODULE_PB5_LESSONS,
    missionLabel: "Mission 5",
    title: "Allocation and Risk Limits",
  },
  {
    lessons: IF_MODULE_4_LESSONS,
    missionLabel: "Mission 6",
    title: "Financial Statement Analysis",
  },
  {
    lessons: IF_MODULE_5_LESSONS,
    missionLabel: "Mission 7",
    title: "Valuation Range",
  },
  {
    lessons: IF_MODULE_6_LESSONS,
    missionLabel: "Mission 8",
    title: "Trading Costs and Taxes",
  },
  {
    lessons: IF_MODULE_7_LESSONS,
    missionLabel: "Mission 9",
    title: "Testing a Claim",
  },
  {
    lessons: IF_MODULE_8_LESSONS,
    missionLabel: "Mission 10",
    title: "Index or Edge",
  },
  {
    lessons: IF_MODULE_11_LESSONS,
    missionLabel: "Mission 11",
    title: "Timing Policy",
  },
  {
    lessons: IF_MODULE_12_LESSONS,
    missionLabel: "Mission 12",
    title: "Holdings List",
  },
  {
    lessons: IF_MODULE_13_LESSONS,
    missionLabel: "Mission 13",
    title: "Operating Rules",
  },
] as const;

export default function IFProgressRail() {
  const pathname = usePathname();
  const activeSlug = pathname?.split("/").pop() ?? "";
  const {
    isComplete,
    ready,
    draft,
    bondBrief,
    equityRiskPolicy,
    statementBrief,
    valuationRange,
    frictionBudget,
    evidenceChecklist,
    architectureDecision,
  } = useIFProgress();
  // Every artifact is stamped with updatedAt on save, so that is the recorded flag.
  const artifactCount = [
    draft,
    bondBrief,
    equityRiskPolicy,
    statementBrief,
    valuationRange,
    frictionBudget,
    evidenceChecklist,
    architectureDecision,
  ].filter((a) => Boolean(a.updatedAt)).length;
  const group =
    JOURNEY_GROUPS.find((candidate) =>
      candidate.lessons.some((lesson) => lesson.slug === activeSlug),
    ) ?? JOURNEY_GROUPS[0];
  const lessons = group.lessons;
  const missionLabel = group.missionLabel;
  const moduleTitle = group.title;

  return (
    <nav
      aria-label={`Investment Foundations ${missionLabel} progress`}
      className="glass-panel p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="ops-eyebrow text-[12px] text-slate-400">
          Investment Foundations · {missionLabel}
        </span>
        <span className="ops-caption text-[12px] text-accent-amber">
          {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
        </span>
      </div>
      <div className="ops-body-strong mt-1.5 text-[15px] text-white">
        {moduleTitle}
      </div>
      <ol className="mt-5 space-y-2">
        {lessons.map((l) => {
          const active = l.slug === activeSlug;
          const done = ready && isComplete(l.slug);
          return (
            <li key={l.slug}>
              <Link
                href={`/lessons/${l.slug}`}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  active
                    ? "border-accent-amber/40 bg-accent-amber/10"
                    : "border-transparent hover:border-white/10 hover:bg-white/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[12px] tabular-nums",
                    active
                      ? "border-accent-amber bg-accent-amber/20 text-accent-amber"
                      : done
                        ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                        : "border-white/15 text-slate-400 group-hover:border-white/30 group-hover:text-slate-200",
                  )}
                >
                  {l.n}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 text-sm leading-snug",
                    active ? "text-white" : "text-slate-300 group-hover:text-white",
                  )}
                >
                  {l.shortTitle}
                </span>
                {done && (
                  <span className="ops-caption text-[12px] text-accent-green" aria-hidden>
                    ✓
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
        <Link
          href="/plan"
          className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2.5 transition-colors hover:border-accent-amber/40 hover:bg-accent-amber/[0.07]"
        >
          <span className="min-w-0">
            <span className="ops-caption block text-[12px] text-accent-amber">
              Your plan
            </span>
            <span className="mt-0.5 block text-sm text-slate-300 group-hover:text-white">
              {artifactCount} saved {artifactCount === 1 ? "decision" : "decisions"}
            </span>
          </span>
          <span
            className="ops-caption text-[12px] text-slate-500 group-hover:text-accent-amber"
            aria-hidden
          >
            →
          </span>
        </Link>
        <Link
          href="/courses/investment-foundations"
          className="ops-caption flex min-h-[44px] items-center text-[12px] text-slate-400 hover:text-accent-amber"
        >
          ← Back to Investment Foundations
        </Link>
      </div>
    </nav>
  );
}
