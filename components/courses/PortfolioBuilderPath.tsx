"use client";

import Link from "next/link";
import type {
  PortfolioBuilderPath as PortfolioBuilderPathData,
  PortfolioMission,
} from "@/data/courses/portfolioBuilder";
import { useIFProgress } from "@/lib/if-progress";
import {
  countCompletedPortfolioMissions,
  getPortfolioMissionProgress,
  type PortfolioMissionProgress,
} from "@/lib/portfolio-builder-progress";
import styles from "./courses.module.css";

/**
 * Investment Foundations' missions in decision order, one ruled row each. The
 * mission's own title is its link; what it covers and saves sits one tap away,
 * so thirteen missions read as one list rather than thirteen cards.
 */
export default function PortfolioBuilderPath({ path }: { path: PortfolioBuilderPathData }) {
  const { completion, ready } = useIFProgress();
  const completed = ready ? countCompletedPortfolioMissions(path.missions, completion) : 0;

  return (
    <>
      <h2 id="curriculum-title" className={styles.sectionTitle}>
        {path.missions.length} missions, one portfolio plan
      </h2>
      <p className={styles.curriculumLead}>Take them in order. Each mission ends in a decision saved to your plan.</p>
      <p className={styles.missionProgress} aria-live="polite">
        {completed} of {path.missions.length} complete · about {Math.round(path.targetMinutes / 60)} hours
      </p>
      <ol className={styles.missions} aria-label="Missions in decision order">
        {path.missions.map((mission) => {
          const state = ready
            ? getPortfolioMissionProgress(mission, completion)
            : mission.status === "planned"
              ? "planned"
              : "not-started";
          return <MissionRow key={mission.id} mission={mission} state={state} />;
        })}
      </ol>
    </>
  );
}

function MissionRow({ mission, state }: { mission: PortfolioMission; state: PortfolioMissionProgress }) {
  const opens = mission.status === "available" && mission.startLessonSlug;
  const labs = mission.optionalLabSlugs.length;
  return (
    <li className={styles.mission}>
      <span className={styles.missionNumber}>{mission.order}</span>
      <h3 className={styles.missionTitle} data-open={opens ? "true" : "false"}>
        {opens ? <Link href={`/lessons/${mission.startLessonSlug}`}>{mission.title}</Link> : mission.title}
      </h3>
      <span className={styles.missionState} data-state={state}>
        {stateLabel(state)} · {mission.targetMinutes} min
      </span>
      {/* The mission's own question opens what it covers, so there is no separate "more" line on every row. */}
      {/* One mission open at a time: opening another closes this one, so the list never grows past a screen of extra text. */}
      <details className={styles.missionMore} name="investment-foundations-missions">
        <summary>
          {mission.decision}
          <span className="sr-only"> What this mission covers</span>
          <span className={styles.missionToggle} aria-hidden="true">+</span>
        </summary>
        <p>{mission.outcome}</p>
        <p>Saved to your plan: {mission.artifactLabel}.</p>
        <p>
          Draws on {mission.sourceSessions.length === 1 ? "session" : "sessions"} {formatSessionList(mission.sourceSessions)} of Damodaran&apos;s Investment Philosophies course.
          {labs > 0 ? ` ${labs} optional ${labs === 1 ? "investigation goes" : "investigations go"} deeper without blocking your progress.` : ""}
        </p>
      </details>
    </li>
  );
}

function stateLabel(state: PortfolioMissionProgress): string {
  switch (state) {
    case "complete":
      return "Complete";
    case "in-progress":
      return "In progress";
    case "planned":
      return "Not open yet";
    default:
      return "Not started";
  }
}

/** [1, 2, 3, 7] -> "1-3, 7". */
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
    ranges.push(start === previous ? String(start) : `${start}–${previous}`);
    start = session;
    previous = session;
  }
  ranges.push(start === previous ? String(start) : `${start}–${previous}`);
  return ranges.join(", ");
}
