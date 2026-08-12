"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IF_MODULE_1_LESSONS,
  IF_MODULE_2_LESSONS,
  IF_MODULE_3_LESSONS,
  IF_MODULE_4_LESSONS,
  IF_MODULE_5_LESSONS,
  IF_MODULE_6_LESSONS,
} from "./shared";
import { useIFProgress } from "@/lib/if-progress";
import { cn } from "@/lib/utils";

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
  } = useIFProgress();
  // Every artifact is stamped with updatedAt on save, so that is the recorded flag.
  const artifactCount = [
    draft,
    bondBrief,
    equityRiskPolicy,
    statementBrief,
    valuationRange,
    frictionBudget,
  ].filter((a) => Boolean(a.updatedAt)).length;
  const inModuleTwo = IF_MODULE_2_LESSONS.some(
    (lesson) => lesson.slug === activeSlug,
  );
  const inModuleThree = IF_MODULE_3_LESSONS.some(
    (lesson) => lesson.slug === activeSlug,
  );
  const inModuleFour = IF_MODULE_4_LESSONS.some(
    (lesson) => lesson.slug === activeSlug,
  );
  const inModuleFive = IF_MODULE_5_LESSONS.some(
    (lesson) => lesson.slug === activeSlug,
  );
  const inModuleSix = IF_MODULE_6_LESSONS.some(
    (lesson) => lesson.slug === activeSlug,
  );
  const lessons = inModuleSix
    ? IF_MODULE_6_LESSONS
    : inModuleFive
    ? IF_MODULE_5_LESSONS
    : inModuleFour
      ? IF_MODULE_4_LESSONS
      : inModuleThree
        ? IF_MODULE_3_LESSONS
        : inModuleTwo
          ? IF_MODULE_2_LESSONS
          : IF_MODULE_1_LESSONS;
  // Mission labels, not module numbers: the mapping is not one-to-one. The first
  // unit carries missions 1-2 and mission 5 (allocation) is not built yet, so
  // these are stated explicitly. Source: the mission curriculum, section 7.
  const missionLabel = inModuleSix
    ? "Mission 8"
    : inModuleFive
    ? "Mission 7"
    : inModuleFour
      ? "Mission 6"
      : inModuleThree
        ? "Mission 4"
        : inModuleTwo
          ? "Mission 3"
          : "Missions 1-2";
  const moduleTitle = inModuleSix
    ? "Trading Costs and Taxes"
    : inModuleFive
    ? "Valuation Range"
    : inModuleFour
      ? "Financial Statement Analysis"
      : inModuleThree
        ? "The Risk in Stocks"
        : inModuleTwo
          ? "The Risk in Bonds"
          : "Building an Investment Philosophy";

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
          {lessons.length} lessons
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
          href="/dossier"
          className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2.5 transition-colors hover:border-accent-amber/40 hover:bg-accent-amber/[0.07]"
        >
          <span className="min-w-0">
            <span className="ops-caption block text-[12px] text-accent-amber">
              Your dossier
            </span>
            <span className="mt-0.5 block text-sm text-slate-300 group-hover:text-white">
              {artifactCount} of 6 artifacts
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
          className="ops-caption block text-[12px] text-slate-400 hover:text-accent-amber"
        >
          ← Back to Investment Foundations
        </Link>
      </div>
    </nav>
  );
}
