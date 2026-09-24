import { describe, expect, it } from "vitest";
import { createStudioProject } from "./create";
import { FIGURES } from "./investigate";
import {
  addInvestigatedCompany,
  addMapEntry,
  keepPassage,
  recordForceFinding,
  recordValueClaim,
  saveInvestigation,
  setCandidateStatus,
} from "./operations";
import {
  RESEARCH_STEPS,
  nextStep,
  stepAfter,
  stepBefore,
  stepFor,
  stepHref,
  stepNumber,
  stepStatuses,
  pathCompany,
} from "./research-path";
import type { StudioProject } from "./schema";

const ALL_FIGURES = Object.fromEntries(FIGURES.map((figure, index) => [figure.key, 100 + index]));

function withCompany(figures: Record<string, number> = ALL_FIGURES): StudioProject {
  return saveInvestigation(
    createStudioProject("practice", "2026-09-24T00:00:00.000Z"),
    { company: "Atkore", sic: "", figures, riskFreePct: null },
    "inv-a",
    "2026-09-24T00:00:01.000Z",
  );
}

const passage = {
  cik: "0001666138",
  accession: "0001628280-25-054049",
  document: "atkr-20250930.htm",
  form: "10-K",
  filed: "2025-11-26",
  sectionId: "business",
  quote: "We sell to electrical distributors.",
  prefix: "",
  suffix: "",
  offset: 0,
};

describe("the order", () => {
  it("runs from the industry to a decision, in eight steps", () => {
    expect(RESEARCH_STEPS.map((step) => step.key)).toEqual([
      "industry",
      "pool",
      "numbers",
      "report",
      "map",
      "competition",
      "value",
      "decide",
    ]);
    expect(stepNumber("numbers")).toBe(3);
    expect(stepNumber("decide")).toBe(8);
  });

  it("gives every step a title, a short name and something to do", () => {
    for (const step of RESEARCH_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.short.length).toBeLessThanOrEqual(12);
      expect(step.todo.length).toBeGreaterThan(0);
    }
  });

  it("asks for a company from the report on, and not before", () => {
    expect(RESEARCH_STEPS.filter((step) => !step.needsCompany).map((step) => step.key)).toEqual([
      "industry",
      "pool",
      "numbers",
    ]);
  });

  it("links each step to the next and the one before", () => {
    expect(stepAfter("numbers")?.key).toBe("report");
    expect(stepAfter("decide")).toBeNull();
    expect(stepBefore("industry")).toBeNull();
    expect(stepBefore("report")?.key).toBe("numbers");
  });

  it("knows which step a page belongs to, including every page of the reader", () => {
    expect(stepFor("/studio/pool")?.key).toBe("pool");
    expect(stepFor("/studio/filings")?.key).toBe("report");
    expect(stepFor("/studio/filings/0001666138/0001628280-25-054049")?.key).toBe("report");
    expect(stepFor("/studio/research")).toBeUndefined();
    expect(stepFor("/studio/portfolio")).toBeUndefined();
    // A route that only starts with a step's letters is not that step.
    expect(stepFor("/studio/poolside")).toBeUndefined();
  });
});

describe("how far a learner has got", () => {
  it("shows nothing done before a company exists, and starts at the beginning", () => {
    const project = createStudioProject("practice");
    const statuses = stepStatuses(project, pathCompany(project));
    expect(Object.values(statuses).every((status) => !status.done)).toBe(true);
    expect(nextStep(project).key).toBe("industry");
  });

  it("counts the numbers as done only when all seven are in", () => {
    const partial = withCompany({ revenue: 100, operatingProfit: 10 });
    expect(stepStatuses(partial, pathCompany(partial)).numbers).toEqual({ done: false, note: "2 of 7 figures" });
    // A learner who skipped the industry is not sent back to it.
    expect(nextStep(partial).key).toBe("numbers");

    const full = withCompany();
    expect(stepStatuses(full, pathCompany(full)).numbers.done).toBe(true);
    expect(nextStep(full).key).toBe("report");
  });

  it("moves on as each step's work is saved, and ends at the decision", () => {
    let project = withCompany();
    project = keepPassage(project, "inv-a", passage, "psg-1");
    expect(nextStep(project).key).toBe("map");
    project = addMapEntry(project, "inv-a", {
      zone: "customers",
      name: "Electrical distributors",
      relationship: "non-contractual",
      affects: "They set how much it sells.",
      passageIds: ["psg-1"],
    });
    expect(nextStep(project).key).toBe("competition");
    project = recordForceFinding(project, "inv-a", {
      force: "buyers",
      question: "leverage",
      mechanism: "Distributors can switch suppliers.",
      effect: "prices",
      standing: "structural",
      passageIds: [],
      wouldChangeIt: "Long contracts.",
    });
    expect(nextStep(project).key).toBe("value");
    project = recordValueClaim(project, "inv-a", {
      lever: "productivity",
      mechanism: "Fewer inputs per unit.",
      passageIds: [],
      wouldChangeIt: "Peers matching its margin.",
    });
    expect(nextStep(project).key).toBe("decide");

    const statuses = stepStatuses(project, pathCompany(project));
    expect(statuses.report.note).toBe("1 passage kept");
    expect(statuses.map.note).toBe("1 on the map");
    expect(statuses.competition.note).toBe("1 finding");
    expect(statuses.value.note).toBe("1 lever argued");
    expect(statuses.decide.done).toBe(false);
  });

  it("counts a company added to the portfolio as decided", () => {
    const held = addInvestigatedCompany(withCompany(), "inv-a", "us-equity");
    expect(stepStatuses(held, pathCompany(held)).decide).toEqual({ done: true, note: "held" });
  });

  it("counts a company turned down as decided, and one put back on the table as not", () => {
    const rejected = setCandidateStatus(withCompany(), "own-inv-a", "rejected", "Earns less than its capital costs.");
    expect(stepStatuses(rejected, pathCompany(rejected)).decide).toEqual({ done: true, note: "turned down" });
    const reconsidered = setCandidateStatus(rejected, "own-inv-a", "researching");
    expect(stepStatuses(reconsidered, pathCompany(reconsidered)).decide.done).toBe(false);
  });

  it("follows the company most recently worked on", () => {
    let project = withCompany();
    project = saveInvestigation(
      project,
      { company: "Nordic Pulp", sic: "", figures: {}, riskFreePct: null },
      "inv-b",
      "2026-09-24T00:00:05.000Z",
    );
    expect(pathCompany(project)?.company).toBe("Nordic Pulp");
    expect(nextStep(project).key).toBe("numbers");
  });
});

describe("where a step goes", () => {
  const report = RESEARCH_STEPS.find((step) => step.key === "report")!;

  it("sends the report step to the company's own reports when the SEC knows it", () => {
    const project = saveInvestigation(
      createStudioProject("practice"),
      {
        company: "Atkore",
        sic: "",
        figures: {},
        riskFreePct: null,
        source: {
          ticker: "ATKR",
          cik: "0001666138",
          entityName: "Atkore Inc.",
          sic: "3640",
          sicDescription: "Electric Lighting & Wiring Equipment",
          periodEnd: "2025-09-30",
          accession: "0001628280-25-054049",
          form: "10-K",
          filed: "2025-11-26",
          figures: {},
        },
      },
      "inv-a",
    );
    expect(stepHref(report, pathCompany(project))).toBe("/studio/filings/0001666138");
  });

  it("sends it to the search when the figures were typed", () => {
    expect(stepHref(report, pathCompany(withCompany()))).toBe("/studio/filings");
  });
});
