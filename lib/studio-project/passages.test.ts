import { describe, expect, it } from "vitest";
import { exportProjectBackup, importProjectBackup } from "./backup";
import { createStudioProject } from "./create";
import {
  investigationForCompany,
  keepPassage,
  removeInvestigation,
  removePassage,
  saveInvestigation,
  updatePassage,
  type PassageEdit,
} from "./operations";
import type { FigureSource, StudioProject } from "./schema";
import { validateStudioProject } from "./validate";

/**
 * Passages kept from a company's filings, attached to its investigation.
 *
 * The test that matters most here is the autosave one. Investigate saves as it
 * is typed, rebuilding the record from what is on its page, and its page knows
 * nothing about passages kept in the reader. A version that forgot to carry
 * them across would pass every other test in this file and still delete a
 * learner's evidence on their next keystroke.
 */

const NOW = "2026-09-13T00:00:00.000Z";
const LATER = "2026-09-13T01:00:00.000Z";
const LATEST = "2026-09-13T02:00:00.000Z";

const PASSAGE: PassageEdit = {
  cik: "0001666138",
  accession: "0001628280-25-054049",
  document: "atkr-20250930.htm",
  form: "10-K",
  filed: "2025-11-26",
  sectionId: "business",
  quote: "our primary suppliers of PVC resin are Westlake, Formosa and Oxy Vinyls",
  prefix: "AmRod, SDI LaFarga and Nexans; and ",
  suffix: "; and our primary suppliers of HD",
  offset: 8_200,
};

const SOURCE: FigureSource = {
  ticker: "ATKR",
  cik: "0001666138",
  entityName: "Atkore Inc.",
  sic: "3690",
  sicDescription: "Miscellaneous Electrical Machinery, Equipment & Supplies",
  periodEnd: "2025-09-30",
  accession: "0001628280-25-054049",
  form: "10-K",
  filed: "2025-11-26",
  figures: {},
};

function withAtkore(company = "Atkore Inc.", source: FigureSource | null = null): StudioProject {
  return saveInvestigation(
    createStudioProject("practice", NOW),
    { company, sic: "3674", figures: { revenue: 2_850_378_000 }, riskFreePct: null, source },
    "inv-atkore",
    NOW,
  );
}

const passagesOf = (project: StudioProject, id = "inv-atkore") =>
  project.investigations.find((item) => item.id === id)?.passages ?? [];

describe("keeping a passage", () => {
  it("attaches it to the investigation as background, with nothing written about it yet", () => {
    const project = keepPassage(withAtkore(), "inv-atkore", PASSAGE, "psg-1", LATER);
    const [kept] = passagesOf(project);
    expect(kept).toEqual({ ...PASSAGE, id: "psg-1", savedAt: LATER, role: "context", note: "" });
    expect(validateStudioProject(project)).toEqual([]);
  });

  it("does not keep the same words from the same place twice", () => {
    const once = keepPassage(withAtkore(), "inv-atkore", PASSAGE, "psg-1", LATER);
    expect(keepPassage(once, "inv-atkore", PASSAGE, "psg-2", LATEST)).toBe(once);
  });

  it("keeps the same words from a different place, because that is a different passage", () => {
    let project = keepPassage(withAtkore(), "inv-atkore", PASSAGE, "psg-1", LATER);
    project = keepPassage(project, "inv-atkore", { ...PASSAGE, sectionId: "risk-factors", offset: 28_214 }, "psg-2", LATEST);
    expect(passagesOf(project).map((p) => p.sectionId)).toEqual(["business", "risk-factors"]);
  });

  it("changes nothing for an investigation that does not exist", () => {
    const project = withAtkore();
    expect(keepPassage(project, "inv-nothing", PASSAGE, "psg-1", LATER)).toBe(project);
  });
});

describe("the autosave that must not delete passages", () => {
  it("carries kept passages across every save Investigate makes", () => {
    let project = keepPassage(withAtkore(), "inv-atkore", PASSAGE, "psg-1", LATER);

    // What Investigate sends on a keystroke: company, industry, figures, rate,
    // source. No passages, because its page has never heard of them.
    project = saveInvestigation(
      project,
      { company: "Atkore Inc.", sic: "3674", figures: { revenue: 2_850_378_000, cash: 506_699_000 }, riskFreePct: 4.8, source: null },
      "inv-atkore",
      LATEST,
    );

    expect(passagesOf(project).map((p) => p.id)).toEqual(["psg-1"]);
    expect(project.investigations[0].figures.cash).toBe(506_699_000);
  });

  it("does not invent an empty list on a record that never had passages", () => {
    const project = withAtkore();
    expect("passages" in project.investigations[0]).toBe(false);
    expect(validateStudioProject(project)).toEqual([]);
  });
});

describe("saying what a passage argues", () => {
  it("records for or against, and the learner's words, on that passage only", () => {
    let project = keepPassage(withAtkore(), "inv-atkore", PASSAGE, "psg-1", LATER);
    project = keepPassage(project, "inv-atkore", { ...PASSAGE, offset: 9_000, quote: "Responsible sourcing" }, "psg-2", LATER);
    project = updatePassage(project, "inv-atkore", "psg-1", { role: "challenges", note: "Three suppliers set my biggest input cost" }, LATEST);

    const [first, second] = passagesOf(project);
    expect([first.role, first.note]).toEqual(["challenges", "Three suppliers set my biggest input cost"]);
    expect([second.role, second.note]).toEqual(["context", ""]);
  });

  it("removes one passage and leaves the rest and the figures", () => {
    let project = keepPassage(withAtkore(), "inv-atkore", PASSAGE, "psg-1", LATER);
    project = keepPassage(project, "inv-atkore", { ...PASSAGE, offset: 9_000, quote: "Responsible sourcing" }, "psg-2", LATER);
    project = removePassage(project, "inv-atkore", "psg-1", LATEST);

    expect(passagesOf(project).map((p) => p.id)).toEqual(["psg-2"]);
    expect(project.investigations[0].figures.revenue).toBe(2_850_378_000);
  });

  it("ignores an id it does not hold", () => {
    const project = keepPassage(withAtkore(), "inv-atkore", PASSAGE, "psg-1", LATER);
    expect(updatePassage(project, "inv-atkore", "psg-nothing", { role: "supports" }, LATEST)).toBe(project);
    expect(removePassage(project, "inv-atkore", "psg-nothing", LATEST)).toBe(project);
  });

  it("goes with the investigation when the learner deletes the company", () => {
    const project = removeInvestigation(keepPassage(withAtkore(), "inv-atkore", PASSAGE, "psg-1", LATER), "inv-atkore", LATEST);
    expect(project.investigations).toEqual([]);
  });
});

describe("which investigation a filing belongs with", () => {
  const atkore = { cik: "1666138", name: "Atkore Inc." };

  it("matches figures filled from the company's filings, however the number is padded", () => {
    expect(investigationForCompany(withAtkore("My conduit idea", SOURCE), atkore)?.id).toBe("inv-atkore");
  });

  it("matches an investigation a passage from this company was already kept against", () => {
    const project = keepPassage(withAtkore("My conduit idea"), "inv-atkore", PASSAGE, "psg-1", LATER);
    expect(investigationForCompany(project, atkore)?.id).toBe("inv-atkore");
  });

  it("matches EDGAR's name for the company, ignoring case", () => {
    expect(investigationForCompany(withAtkore("ATKORE INC."), atkore)?.id).toBe("inv-atkore");
  });

  it("does not guess from a name that is merely close", () => {
    // "Atkore" typed by hand might be this company or might not. The reader
    // asks rather than attaching a filing's words to the wrong investigation.
    expect(investigationForCompany(withAtkore("Atkore"), atkore)).toBeUndefined();
  });

  it("prefers the one the learner touched most recently", () => {
    let project = withAtkore("Atkore Inc.", SOURCE);
    project = saveInvestigation(project, { company: "Atkore Inc.", sic: "3674", figures: {}, riskFreePct: null, source: null }, "inv-second", LATEST);
    expect(investigationForCompany(project, atkore)?.id).toBe("inv-second");
  });
});

describe("surviving storage", () => {
  it("comes back from a backup exactly as kept", () => {
    let project = keepPassage(withAtkore(), "inv-atkore", PASSAGE, "psg-1", LATER);
    project = updatePassage(project, "inv-atkore", "psg-1", { role: "challenges", note: "Concentrated suppliers" }, LATEST);

    const backup = exportProjectBackup(project);
    if (!backup.ok) throw new Error(backup.error);
    const restored = importProjectBackup(backup.raw);
    if (!restored.ok) throw new Error(restored.error);

    expect(passagesOf(restored.project)).toEqual(passagesOf(project));
  });

  it("accepts a whole paragraph as long as the longest in Atkore's business section", () => {
    // The first version checked the quote with the same rule as an id, which
    // stops at 200 characters. Every whole paragraph a learner kept was refused
    // by storage, and a test using a one-sentence quote could not see it. The
    // browser suite did. 2,303 characters is the longest paragraph measured in
    // the business section of Atkore's FY2025 10-K.
    const paragraph = "Atkore ".repeat(329).slice(0, 2_303);
    const project = keepPassage(withAtkore(), "inv-atkore", { ...PASSAGE, quote: paragraph }, "psg-1", LATER);
    expect(passagesOf(project)[0].quote).toHaveLength(2_303);
    expect(validateStudioProject(project)).toEqual([]);
  });

  it("refuses a hand-edited passage that could put words in a filing's mouth", () => {
    const project = keepPassage(withAtkore(), "inv-atkore", PASSAGE, "psg-1", LATER);
    for (const broken of [{ offset: -1 }, { offset: 1.5 }, { role: "proves" }, { quote: "   " }, { prefix: "x".repeat(65) }, { extra: true }]) {
      const tampered = JSON.parse(JSON.stringify(project));
      Object.assign(tampered.investigations[0].passages[0], broken);
      expect(validateStudioProject(tampered)).toContain("A kept passage contains missing, repeated, or invalid fields.");
    }
  });
});
