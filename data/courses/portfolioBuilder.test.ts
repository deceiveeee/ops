import { describe, expect, it } from "vitest";
import {
  portfolioBuilderCoreLessonSlugs,
  portfolioBuilderLabLessonSlugs,
  portfolioBuilderPath,
} from "./portfolioBuilder";

describe("portfolio builder curriculum", () => {
  it("defines thirteen missions whose targets sum to the declared total", () => {
    expect(portfolioBuilderPath.missions).toHaveLength(13);
    const summed = portfolioBuilderPath.missions.reduce(
      (minutes, mission) => minutes + mission.targetMinutes,
      0,
    );
    expect(summed).toBe(portfolioBuilderPath.targetMinutes);
  });

  it("numbers missions consecutively from one", () => {
    expect(portfolioBuilderPath.missions.map((m) => m.order)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    ]);
  });

  it("gives every mission exactly one artifact, and every artifact one mission", () => {
    const missionIds = portfolioBuilderPath.missions.map((m) => m.id);
    expect(new Set(missionIds).size).toBe(missionIds.length);

    const artifactIds = portfolioBuilderPath.artifacts.map((a) => a.id);
    expect(new Set(artifactIds).size).toBe(artifactIds.length);
    expect(artifactIds).toHaveLength(portfolioBuilderPath.missions.length);

    // Each artifact points at exactly one mission that exists.
    for (const artifact of portfolioBuilderPath.artifacts) {
      expect(artifact.missionIds).toHaveLength(1);
      expect(missionIds).toContain(artifact.missionIds[0]);
    }
    // Each mission's artifactId resolves.
    for (const mission of portfolioBuilderPath.missions) {
      expect(artifactIds).toContain(mission.artifactId);
    }
  });

  it("keeps core and lab lesson routes disjoint", () => {
    const core = new Set(portfolioBuilderCoreLessonSlugs);
    expect(portfolioBuilderLabLessonSlugs.every((slug) => !core.has(slug))).toBe(
      true,
    );
  });

  it("only credits available missions, and always with real lesson slugs", () => {
    for (const mission of portfolioBuilderPath.missions) {
      if (mission.status === "planned") {
        expect(mission.legacyCompletionSlugs).toEqual([]);
        expect(mission.startLessonSlug).toBeUndefined();
      } else {
        expect(mission.legacyCompletionSlugs.length).toBeGreaterThan(0);
        expect(mission.startLessonSlug).toBeDefined();
        expect(mission.legacyCompletionSlugs).toContain(mission.startLessonSlug);
      }
    }
  });

  it("connects mission 7 to the valuation-range lesson", () => {
    const mission = portfolioBuilderPath.missions.find((m) => m.order === 7);
    expect(mission?.artifactId).toBe("valuation");
    expect(mission?.status).toBe("available");
    expect(mission?.startLessonSlug).toBe("if-5-1-estimate-a-valuation-range");
    expect(mission?.legacyCompletionSlugs).toEqual([
      "if-5-1-estimate-a-valuation-range",
    ]);
  });

  it("routes the philosophy-families survey to optional depth, not the core", () => {
    const slug = "if-1-3-comparing-investment-philosophy-families";
    expect(portfolioBuilderLabLessonSlugs).toContain(slug);
    expect(portfolioBuilderCoreLessonSlugs).not.toContain(slug);
    const lab = portfolioBuilderPath.depthLabs.find(
      (l) => l.id === "philosophy-families",
    );
    expect(lab?.lessonSlugs).toContain(slug);
  });

  it("names a source gap on every mission that has one", () => {
    const gapped = portfolioBuilderPath.missions.filter((m) => m.sourceGap);
    expect(gapped.map((m) => m.order)).toEqual([5, 12, 13]);
    for (const mission of gapped) expect(mission.status).toBe("planned");
  });
});
