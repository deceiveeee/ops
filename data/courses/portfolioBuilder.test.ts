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

  it("gives every mission exactly one Workbench checkpoint", () => {
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

  it("connects mission 5 to the allocation-policy benchmark", () => {
    const mission = portfolioBuilderPath.missions.find((m) => m.order === 5);
    expect(mission?.artifactId).toBe("allocation");
    expect(mission?.status).toBe("available");
    expect(mission?.startLessonSlug).toBe(
      "if-pb-05-set-allocation-and-risk-limits",
    );
    expect(mission?.legacyCompletionSlugs).toEqual([
      "if-pb-05-set-allocation-and-risk-limits",
    ]);
    expect(mission?.sourceGap).toBeUndefined();
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

  it("names a source gap on every mission that has one, and keeps it unreleased", () => {
    const gapped = portfolioBuilderPath.missions.filter((m) => m.sourceGap);
    // Mission 11 left this list on 2026-08-16 the same way Mission 10 did: by
    // resolving its limit through narrowing, not by acquiring the missing
    // artifact. The rule under test is unchanged — an *open* gap still blocks
    // release — and the mission it no longer covers is asserted below instead.
    expect(gapped.map((m) => m.order)).toEqual([13]);
    for (const mission of gapped) expect(mission.status).toBe("planned");
  });

  /**
   * Mission 11's Session 32 caption gap was closed by narrowing every Session 32
   * claim onto canonical slides. As with Mission 10, that makes it shippable
   * while the limit still has to be visible to a reader.
   */
  it("records Mission 11's resolved caption limit as a boundary, not an open gap", () => {
    const mission = portfolioBuilderPath.missions.find((m) => m.id === "pb-11");
    expect(mission?.status).toBe("available");
    expect(mission?.sourceGap).toBeUndefined();
    expect(mission?.sourceBoundary).toContain("Session 32");
    expect(mission?.sourceBoundary).toContain("period not stated");
  });

  /**
   * Mission 10's source limit was resolved by narrowing its scope, not by
   * obtaining the S&P persistence artifact. That makes it shippable, but the
   * limit still has to be stated somewhere a reader will find it — so it moves
   * to `sourceBoundary` rather than being deleted.
   */
  it("records a resolved source limit as a boundary, not as an open gap", () => {
    const mission = portfolioBuilderPath.missions.find((m) => m.id === "pb-10");
    expect(mission?.status).toBe("available");
    expect(mission?.sourceGap).toBeUndefined();
    expect(mission?.sourceBoundary).toMatch(/persistence/i);
  });

  it("never lets one mission claim both an open gap and a resolved boundary", () => {
    for (const mission of portfolioBuilderPath.missions) {
      expect(
        Boolean(mission.sourceGap && mission.sourceBoundary),
        `${mission.id} claims both an open source gap and a resolved boundary`,
      ).toBe(false);
    }
  });
});
