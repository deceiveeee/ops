import type {
  PortfolioArtifact,
  PortfolioMission,
} from "@/data/courses/portfolioBuilder";

export type PortfolioMissionProgress =
  | "planned"
  | "not-started"
  | "in-progress"
  | "complete";

export function getPortfolioMissionProgress(
  mission: PortfolioMission,
  completion: Record<string, boolean>,
): PortfolioMissionProgress {
  if (mission.status === "planned") return "planned";

  const required = mission.legacyCompletionSlugs;
  if (required.length === 0) return "not-started";

  const completedCount = required.filter((slug) => completion[slug]).length;
  if (completedCount === 0) return "not-started";
  if (completedCount === required.length) return "complete";
  return "in-progress";
}

export function getPortfolioArtifactProgress(
  artifact: PortfolioArtifact,
  missions: PortfolioMission[],
  completion: Record<string, boolean>,
): PortfolioMissionProgress {
  const artifactMissions = artifact.missionIds
    .map((id) => missions.find((mission) => mission.id === id))
    .filter((mission): mission is PortfolioMission => Boolean(mission));

  if (
    artifactMissions.length === 0 ||
    artifactMissions.every((mission) => mission.status === "planned")
  ) {
    return "planned";
  }

  const states = artifactMissions.map((mission) =>
    getPortfolioMissionProgress(mission, completion),
  );
  if (states.every((state) => state === "complete")) return "complete";
  if (states.some((state) => state === "complete" || state === "in-progress")) {
    return "in-progress";
  }
  return "not-started";
}

export function countCompletedPortfolioMissions(
  missions: PortfolioMission[],
  completion: Record<string, boolean>,
): number {
  return missions.filter(
    (mission) =>
      getPortfolioMissionProgress(mission, completion) === "complete",
  ).length;
}
