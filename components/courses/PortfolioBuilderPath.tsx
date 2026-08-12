"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type {
  PortfolioBuilderPath as PortfolioBuilderPathData,
  PortfolioMission,
} from "@/data/courses/portfolioBuilder";
import { useIFProgress } from "@/lib/if-progress";
import {
  countCompletedPortfolioMissions,
  getPortfolioArtifactProgress,
  getPortfolioMissionProgress,
  type PortfolioMissionProgress,
} from "@/lib/portfolio-builder-progress";
import { cn } from "@/lib/utils";

export default function PortfolioBuilderPath({
  path,
}: {
  path: PortfolioBuilderPathData;
}) {
  const reduceMotion = useReducedMotion();
  const { completion, ready } = useIFProgress();
  const completedMissions = ready
    ? countCompletedPortfolioMissions(path.missions, completion)
    : 0;

  return (
    <div>
      <section
        className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_24px_70px_-48px_rgba(0,0,0,0.35)]"
        aria-labelledby="portfolio-dossier-title"
      >
        <div className="grid gap-8 px-6 py-7 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_240px] lg:px-10">
          <div>
            <div className="text-[14px] font-semibold tracking-[0.02em] text-[#8A5A00]">
              Portfolio dossier scan
            </div>
            <h2
              id="portfolio-dossier-title"
              className="mt-3 max-w-3xl font-display text-[clamp(34px,4vw,56px)] font-medium leading-[1.04] tracking-[-0.025em] text-[#1D1D1F]"
            >
              {path.missions.length} decisions. One portfolio you can defend.
            </h2>
            <p className="mt-5 max-w-3xl text-[17px] leading-7 text-[#424245] sm:text-[18px]">
              {path.promise}
            </p>
          </div>

          <div className="flex items-end lg:justify-end">
            <div className="min-w-[190px] rounded-2xl border border-black/10 bg-[#F7F5EF] p-5">
              <div className="text-[13px] font-medium tracking-[0.01em] text-[#6E6E73]">
                Core progress
              </div>
              <div
                className="mt-2 text-[42px] font-semibold leading-none tracking-[-0.04em] text-[#1D1D1F] tabular-nums"
                aria-live="polite"
              >
                {completedMissions}
                <span className="ml-1 text-[20px] font-medium text-[#6E6E73]">
                  / {path.missions.length}
                </span>
              </div>
              <div className="mt-3 text-[14px] leading-5 text-[#6E6E73]">
                About {Math.round(path.targetMinutes / 60)} hours. Strategy investigations are optional.
              </div>
            </div>
          </div>
        </div>

        <div
          className="relative isolate overflow-hidden border-y border-black/10 bg-[#F7F5EF] px-4 py-6 sm:px-7"
          aria-label="Portfolio dossier artifacts"
        >
          {!reduceMotion && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -z-0 w-1/3 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "300%" }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            />
          )}
          <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {path.artifacts.map((artifact) => {
              const state = ready
                ? getPortfolioArtifactProgress(
                    artifact,
                    path.missions,
                    completion,
                  )
                : "not-started";
              return (
                <ArtifactNode
                  key={artifact.id}
                  label={artifact.label}
                  state={state}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 text-[14px] text-[#6E6E73] sm:px-8 lg:px-10">
          <span>Source sessions support each decision; they do not create a second progress path.</span>
          <a
            href="#portfolio-missions"
            className="font-semibold text-[#8A5A00] transition-colors hover:text-[#684300] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
          >
            Inspect the mission path →
          </a>
        </div>
      </section>

      <section id="portfolio-missions" className="scroll-mt-24 pt-16">
        <div className="max-w-3xl">
          <div className="text-[14px] font-semibold tracking-[0.02em] text-[#8A5A00]">
            Required path
          </div>
          <h2 className="mt-3 font-display text-[clamp(34px,4vw,52px)] font-medium leading-[1.06] tracking-[-0.02em] text-[#1D1D1F]">
            Build the dossier in decision order.
          </h2>
          <p className="mt-4 text-[17px] leading-7 text-[#424245]">
            The first five missions reuse the strongest guided work already built. Later missions stay visible so the destination is always clear.
          </p>
        </div>

        <ol className="mt-10 border-t border-black/10">
          {path.missions.map((mission) => {
            const state = ready
              ? getPortfolioMissionProgress(mission, completion)
              : mission.status === "planned"
                ? "planned"
                : "not-started";
            return <MissionRow key={mission.id} mission={mission} state={state} />;
          })}
        </ol>
      </section>
    </div>
  );
}

function ArtifactNode({
  label,
  state,
}: {
  label: string;
  state: PortfolioMissionProgress;
}) {
  const isComplete = state === "complete";
  const isActive = state === "in-progress";

  return (
    <div
      className={cn(
        "flex min-h-20 flex-col justify-between rounded-2xl border px-4 py-3 transition-colors",
        isComplete
          ? "border-emerald-700/25 bg-emerald-50"
          : isActive
            ? "border-amber-700/25 bg-amber-50"
            : "border-black/10 bg-white/80",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isComplete
            ? "bg-emerald-700"
            : isActive
              ? "bg-amber-700"
              : "bg-black/15",
        )}
        aria-hidden
      />
      <div>
        <div className="text-[14px] font-semibold text-[#1D1D1F]">{label}</div>
        <div className="mt-0.5 text-[12px] text-[#6E6E73]">
          {isComplete ? "Filed" : isActive ? "Scanning" : state === "planned" ? "Ahead" : "Open"}
        </div>
      </div>
    </div>
  );
}

function MissionRow({
  mission,
  state,
}: {
  mission: PortfolioMission;
  state: PortfolioMissionProgress;
}) {
  const status = missionStatus(state);
  const sourceLabel = `${mission.sourceSessions.length} source ${mission.sourceSessions.length === 1 ? "session" : "sessions"}: ${formatSessionList(mission.sourceSessions)}`;

  return (
    <li className="border-b border-black/10 py-8 sm:py-9">
      <div className="grid gap-5 sm:grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[72px_minmax(0,1fr)_190px] lg:gap-7">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border text-[15px] font-semibold tabular-nums",
            state === "complete"
              ? "border-emerald-700/25 bg-emerald-50 text-emerald-800"
              : state === "in-progress"
                ? "border-amber-700/30 bg-amber-50 text-amber-800"
                : "border-black/10 bg-white text-[#6E6E73]",
          )}
        >
          {String(mission.order).padStart(2, "0")}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className={cn("font-semibold", status.className)}>{status.label}</span>
            <span className="text-[#A1A1A6]" aria-hidden>·</span>
            <span className="text-[#6E6E73]">{mission.targetMinutes} min target</span>
            <span className="text-[#A1A1A6]" aria-hidden>·</span>
            <span className="text-[#6E6E73]">{sourceLabel}</span>
          </div>
          <h3 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.015em] text-[#1D1D1F] sm:text-[28px]">
            {mission.title}
          </h3>
          <p className="mt-2 text-[16px] font-semibold leading-6 text-[#424245]">
            {mission.decision}
          </p>
          <p className="mt-2 max-w-3xl text-[16px] leading-7 text-[#6E6E73]">
            {mission.outcome}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
            <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[#424245]">
              Produces: {mission.artifactLabel}
            </span>
            {mission.optionalLabSlugs.length > 0 && (
              <span className="rounded-full border border-amber-700/20 bg-amber-50 px-3 py-1.5 text-[#7A4D00]">
                {mission.optionalLabSlugs.length} optional {mission.optionalLabSlugs.length === 1 ? "investigation" : "investigations"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start sm:col-start-2 lg:col-start-auto lg:justify-end">
          {mission.status === "available" && mission.startLessonSlug ? (
            <Link
              href={`/lessons/${mission.startLessonSlug}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-amber-700/25 bg-amber-50 px-5 py-2.5 text-[14px] font-semibold text-[#7A4D00] transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
            >
              {state === "complete" ? "Review journey" : state === "in-progress" ? "Continue journey" : "Open journey"}
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-[#F2F2F4] px-4 py-2 text-[13px] font-medium text-[#6E6E73]">
              Awaiting source gate
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

function formatSessionList(sessions: number[]): string {
  if (sessions.length === 0) return "none";

  const sorted = [...new Set(sessions)].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let previous = sorted[0];

  for (const session of sorted.slice(1)) {
    if (session === previous + 1) {
      previous = session;
      continue;
    }

    ranges.push(start === previous ? String(start) : `${start}-${previous}`);
    start = session;
    previous = session;
  }

  ranges.push(start === previous ? String(start) : `${start}-${previous}`);
  return ranges.join(", ");
}

function missionStatus(state: PortfolioMissionProgress): {
  label: string;
  className: string;
} {
  switch (state) {
    case "complete":
      return { label: "Complete", className: "text-emerald-800" };
    case "in-progress":
      return { label: "In progress", className: "text-amber-800" };
    case "planned":
      return { label: "Planned", className: "text-[#6E6E73]" };
    default:
      return { label: "Available", className: "text-[#8A5A00]" };
  }
}
