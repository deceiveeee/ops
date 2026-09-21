import { describe, expect, it } from "vitest";
import { createStudioProject } from "./create";
import {
  addPeer,
  addPosition,
  setAccruedInterest,
  keepPassage,
  keptPassageId,
  linkInput,
  removePassage,
  removePeer,
  saveInvestigation,
  unlinkInput,
  type PassageEdit,
} from "./operations";
import type { StudioProject } from "./schema";
import { validateStudioProject } from "./validate";

/**
 * Inputs and competitors a learner links in the reader, stored on the company's
 * investigation.
 *
 * Both rest on passages the learner kept. The test that matters most is the
 * autosave one: Investigate rewrites the record from its own page as it is typed
 * and knows nothing about the reader, so a version that forgot to carry links
 * across would delete them on the learner's next keystroke.
 */

const NOW = "2026-09-14T00:00:00.000Z";
const LATER = "2026-09-14T01:00:00.000Z";
const LATEST = "2026-09-14T02:00:00.000Z";

const BUYS: PassageEdit = {
  cik: "0001666138",
  accession: "0001628280-25-054049",
  document: "atkr-20250930.htm",
  form: "10-K",
  filed: "2025-11-26",
  sectionId: "business",
  quote: "Our primary suppliers of steel are Cleveland-Cliffs, Steel Dynamics and Nucor",
  prefix: "",
  suffix: "; our primary suppliers of copper",
  offset: 8_099,
};
const NAMES: PassageEdit = { ...BUYS, quote: "Electrical: Zekelman Industries, Inc., Mitsubishi Corporation, Nucor Corporation", suffix: "", offset: 20_000 };
const NUCOR = { name: "Nucor Corporation", cik: "0000073309", ticker: "NUE", passageId: "psg-names" };

function withPassages(): StudioProject {
  const started = saveInvestigation(
    createStudioProject("practice", NOW),
    { company: "Atkore Inc.", sic: "3690", figures: {}, riskFreePct: null, source: null },
    "inv-1",
    NOW,
  );
  return keepPassage(keepPassage(started, "inv-1", BUYS, "psg-buys", NOW), "inv-1", NAMES, "psg-names", NOW);
}

const record = (project: StudioProject) => {
  const found = project.investigations.find((item) => item.id === "inv-1");
  if (!found) throw new Error("no investigation");
  return found;
};

describe("linking an input", () => {
  it("ties an index to a kept passage, once", () => {
    const linked = linkInput(withPassages(), "inv-1", { seriesId: "WPU1017", passageId: "psg-buys" }, "inp-1", LATER);
    expect(record(linked).inputs).toEqual([{ id: "inp-1", savedAt: LATER, seriesId: "WPU1017", passageId: "psg-buys" }]);
    expect(record(linked).updatedAt).toBe(LATER);
    expect(linkInput(linked, "inv-1", { seriesId: "WPU1017", passageId: "psg-buys" }, "inp-2", LATEST)).toBe(linked);
    expect(validateStudioProject(linked)).toEqual([]);
  });

  it("links nothing through a passage that is not kept, or to a company not investigated", () => {
    const project = withPassages();
    expect(linkInput(project, "inv-1", { seriesId: "WPU1017", passageId: "psg-gone" }, "inp-1", LATER)).toBe(project);
    expect(linkInput(project, "inv-2", { seriesId: "WPU1017", passageId: "psg-buys" }, "inp-1", LATER)).toBe(project);
  });

  it("finds the passage a second press on Keep would have matched, and no other", () => {
    expect(keptPassageId(withPassages(), "inv-1", BUYS)).toBe("psg-buys");
    expect(keptPassageId(withPassages(), "inv-1", { ...BUYS, offset: BUYS.offset + 1 })).toBeNull();
    expect(keptPassageId(withPassages(), "inv-2", BUYS)).toBeNull();
  });

  it("undoes one link and leaves the passage kept", () => {
    const linked = linkInput(withPassages(), "inv-1", { seriesId: "WPU1017", passageId: "psg-buys" }, "inp-1", LATER);
    const undone = unlinkInput(linked, "inv-1", "inp-1", LATEST);
    expect(record(undone).inputs).toEqual([]);
    expect(record(undone).passages?.map((passage) => passage.id)).toEqual(["psg-buys", "psg-names"]);
    expect(unlinkInput(undone, "inv-1", "inp-1", LATEST)).toBe(undone);
  });
});

describe("counting a competitor", () => {
  it("adds a company named in a kept passage, and the same SEC company only once however it is spelled", () => {
    const added = addPeer(withPassages(), "inv-1", NUCOR, "peer-1", LATER);
    expect(record(added).peers).toEqual([{ id: "peer-1", savedAt: LATER, ...NUCOR }]);
    expect(addPeer(added, "inv-1", { name: "NUCOR CORP", cik: "73309", ticker: "NUE", passageId: "" }, "peer-2", LATEST)).toBe(added);
    expect(validateStudioProject(added)).toEqual([]);
  });

  it("adds a company no SEC filer goes by, once by name, and refuses a blank name or a passage not kept", () => {
    const zekelman = { name: "Zekelman Industries, Inc.", cik: "", ticker: "", passageId: "psg-names" };
    const added = addPeer(withPassages(), "inv-1", zekelman, "peer-1", LATER);
    expect(record(added).peers).toHaveLength(1);
    expect(addPeer(added, "inv-1", { ...zekelman, name: " zekelman industries, inc. " }, "peer-2", LATEST)).toBe(added);
    expect(addPeer(added, "inv-1", { ...zekelman, name: "   " }, "peer-3", LATEST)).toBe(added);
    expect(addPeer(added, "inv-1", { ...NUCOR, passageId: "psg-gone" }, "peer-4", LATEST)).toBe(added);
  });

  it("removes one competitor and leaves the passage that named it kept", () => {
    const removed = removePeer(addPeer(withPassages(), "inv-1", NUCOR, "peer-1", LATER), "inv-1", "peer-1", LATEST);
    expect(record(removed).peers).toEqual([]);
    expect(record(removed).passages).toHaveLength(2);
  });
});

describe("letting a passage go", () => {
  it("takes the input linked through it, and leaves a competitor it named without it", () => {
    const linked = addPeer(
      linkInput(withPassages(), "inv-1", { seriesId: "WPU1017", passageId: "psg-buys" }, "inp-1", LATER),
      "inv-1",
      { ...NUCOR, passageId: "psg-buys" },
      "peer-1",
      LATER,
    );
    const after = removePassage(linked, "inv-1", "psg-buys", LATEST);
    expect(record(after).inputs).toEqual([]);
    expect(record(after).peers).toEqual([{ id: "peer-1", savedAt: LATER, ...NUCOR, passageId: "" }]);
    expect(validateStudioProject(after)).toEqual([]);
  });
});

describe("Investigate's autosave", () => {
  it("keeps inputs and competitors when it rewrites the record from its own page", () => {
    const linked = addPeer(
      linkInput(withPassages(), "inv-1", { seriesId: "WPU1017", passageId: "psg-buys" }, "inp-1", LATER),
      "inv-1",
      NUCOR,
      "peer-1",
      LATER,
    );
    const saved = saveInvestigation(linked, { company: "Atkore Inc.", sic: "3690", figures: { revenue: 2_850_378_000 }, riskFreePct: null, source: null }, "inv-1", LATEST);
    expect(record(saved).inputs).toEqual(record(linked).inputs);
    expect(record(saved).peers).toEqual(record(linked).peers);
    expect(record(saved).figures).toEqual({ revenue: 2_850_378_000 });
  });
});

describe("a restored backup", () => {
  const linked = () => addPeer(linkInput(withPassages(), "inv-1", { seriesId: "WPU1017", passageId: "psg-buys" }, "inp-1", LATER), "inv-1", NUCOR, "peer-1", LATER);
  const broken = (change: (project: StudioProject) => void) => {
    const project = structuredClone(linked());
    change(project);
    return validateStudioProject(project);
  };

  it("is refused when an input rests on a passage that is not kept, or carries a field this version does not know", () => {
    const message = "A linked input contains missing, repeated, or invalid fields, or rests on a passage that is not kept.";
    expect(broken((project) => { record(project).inputs![0].passageId = "psg-gone"; })).toContain(message);
    expect(broken((project) => { Object.assign(record(project).inputs![0], { quote: "words" }); })).toContain(message);
  });

  it("is refused when a competitor rests on a passage that is not kept, or has an SEC number that is not a number", () => {
    const message = "A competitor contains missing, repeated, or invalid fields, or rests on a passage that is not kept.";
    expect(broken((project) => { record(project).peers![0].passageId = "psg-gone"; })).toContain(message);
    expect(broken((project) => { record(project).peers![0].cik = "NUE"; })).toContain(message);
    expect(broken((project) => { record(project).peers![0].name = " "; })).toContain(message);
  });

  it("is accepted as it was saved", () => {
    expect(validateStudioProject(structuredClone(linked()))).toEqual([]);
  });
});

describe("accrued interest carried into the plan", () => {
  const withBond = () => addPosition(createStudioProject("practice", NOW), "ust-91282crf0", undefined, NOW);

  it("records the figure against the position the bond is held in", () => {
    const saved = setAccruedInterest(withBond(), "ust-91282crf0", 0.389606, undefined, LATER);
    const position = saved.alternatives[0].positions.find((entry) => entry.instrumentId === "ust-91282crf0");
    expect(position?.accruedInterestPer100).toBeCloseTo(0.389606, 12);
    expect(validateStudioProject(saved)).toEqual([]);
  });

  it("puts it back to unknown rather than zero", () => {
    const cleared = setAccruedInterest(setAccruedInterest(withBond(), "ust-91282crf0", 0.25, undefined, LATER), "ust-91282crf0", null, undefined, LATEST);
    expect(cleared.alternatives[0].positions[0].accruedInterestPer100).toBeNull();
  });

  it("changes nothing for an investment that is not in the plan, or a figure that is not one", () => {
    const project = withBond();
    expect(setAccruedInterest(project, "vt-total-world", 0.25, undefined, LATER)).toBe(project);
    expect(setAccruedInterest(project, "ust-91282crf0", -1, undefined, LATER)).toBe(project);
    expect(setAccruedInterest(project, "ust-91282crf0", Number.NaN, undefined, LATER)).toBe(project);
  });
});
