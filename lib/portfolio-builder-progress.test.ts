import { describe, expect, it } from "vitest";
import { portfolioBuilderPath } from "@/data/courses/portfolioBuilder";
import {
  countCompletedPortfolioMissions,
  getPortfolioArtifactProgress,
  getPortfolioMissionProgress,
} from "./portfolio-builder-progress";

/**
 * Select by property rather than array position. The previous version indexed
 * `missions[4]` and `missions[6]`, so reordering the spine broke it for reasons
 * unrelated to the behaviour under test.
 */
const missionById = (id: string) => {
  const mission = portfolioBuilderPath.missions.find((m) => m.id === id);
  if (!mission) throw new Error(`no mission ${id}`);
  return mission;
};

const firstAvailableWithSeveralLessons = () => {
  const mission = portfolioBuilderPath.missions.find(
    (m) => m.status === "available" && m.legacyCompletionSlugs.length > 1,
  );
  if (!mission) throw new Error("no multi-lesson available mission");
  return mission;
};

/**
 * A synthetic planned mission, not one taken from the live course data.
 *
 * These assertions used to select the first mission whose status was "planned".
 * That worked until Mission 13 shipped on 2026-08-17 and the last planned
 * mission disappeared, at which point the helper threw and two real behaviours
 * went untested for a reason unrelated to either of them. The behaviour is
 * still worth asserting, so the fixture is built here and no longer depends on
 * something remaining unreleased.
 */
const plannedMission = () => ({
  ...missionById("pb-13"),
  id: "pb-planned-fixture",
  status: "planned" as const,
  legacyCompletionSlugs: ["fixture-lesson-a", "fixture-lesson-b"],
});

const completionFor = (slugs: string[]) =>
  Object.fromEntries(slugs.map((slug) => [slug, true]));

describe("portfolio builder progress", () => {
  it("maps partial lesson completion into an in-progress mission", () => {
    const mission = firstAvailableWithSeveralLessons();

    expect(
      getPortfolioMissionProgress(mission, {
        [mission.legacyCompletionSlugs[0]]: true,
      }),
    ).toBe("in-progress");
  });

  it("credits a mission when all of its legacy core lessons are complete", () => {
    const mission = firstAvailableWithSeveralLessons();

    expect(
      getPortfolioMissionProgress(
        mission,
        completionFor(mission.legacyCompletionSlugs),
      ),
    ).toBe("complete");
  });

  it("keeps planned missions planned regardless of unrelated completion", () => {
    expect(
      getPortfolioMissionProgress(plannedMission(), { unrelated: true }),
    ).toBe("planned");
  });

  it("rolls mission progress into dossier artifact progress", () => {
    const mission = missionById("pb-07");
    const artifact = portfolioBuilderPath.artifacts.find(
      (a) => a.id === "valuation",
    );

    expect(artifact).toBeDefined();
    expect(
      getPortfolioArtifactProgress(
        artifact!,
        portfolioBuilderPath.missions,
        completionFor(mission.legacyCompletionSlugs),
      ),
    ).toBe("complete");
  });

  it("reports a planned mission's artifact as planned", () => {
    const planned = plannedMission();
    const artifact = {
      // A real artifact id, because the type is a closed union; the mission
      // list passed alongside it is what makes this a fixture.
      id: "policy" as const,
      label: "Fixture",
      missionIds: [planned.id],
    };

    expect(getPortfolioArtifactProgress(artifact, [planned], {})).toBe(
      "planned",
    );
  });

  it("counts only completed missions", () => {
    const mission = firstAvailableWithSeveralLessons();

    expect(
      countCompletedPortfolioMissions(
        portfolioBuilderPath.missions,
        completionFor(mission.legacyCompletionSlugs),
      ),
    ).toBe(1);
  });
});
