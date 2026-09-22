import { describe, expect, it } from "vitest";
import { EFFECTS, FORCES, FORCE_BY_KEY, coverage, whatIsMissing, type ForceFinding } from "./five-forces";
import { recordForceFinding, removeForceFinding, removePassage, saveInvestigation } from "./operations";
import { createStudioProject } from "./create";
import { validateStudioProject } from "./validate";

/**
 * The framework is quoted, not paraphrased, so these check the quotations
 * against the audit at docs/source-audits/studio-five-forces.md, which in turn
 * cites the page. A test cannot read the PDF; it can stop the wording drifting
 * once somebody edits the file for tone.
 */
describe("the forces, as the paper sets them out", () => {
  it("has the five, under the paper's own labels", () => {
    expect(FORCES.map((force) => force.sourceLabel)).toEqual([
      "Threat of New Entrants",
      "Rivalry Among Existing Firms",
      "Bargaining Power of Suppliers",
      "Bargaining Power of Buyers",
      "Threat of Substitutes",
    ]);
  });

  it("puts the two the paper gives more room to first", () => {
    // p. 22: "threat of new entrants and rivalry among existing firms deserve
    // more extensive consideration than the others".
    expect(FORCES.slice(0, 2).map((force) => force.key)).toEqual(["entrants", "rivalry"]);
  });

  it("carries Exhibit 17's risk and mitigant for every force, verbatim", () => {
    expect(FORCE_BY_KEY.get("suppliers")?.risk).toBe("Strong suppliers increase input costs and squeeze margins.");
    expect(FORCE_BY_KEY.get("suppliers")?.mitigant).toBe("Diversify supplier base and consider vertical integration.");
    for (const force of FORCES) {
      expect(force.risk.endsWith(".")).toBe(true);
      expect(force.mitigant.endsWith(".")).toBe(true);
    }
  });

  it("says where every question comes from", () => {
    for (const force of FORCES) {
      expect(force.questions.length).toBeGreaterThan(0);
      for (const question of force.questions) {
        expect(question.from).toMatch(/p\.|checklist/i);
        expect(question.ask.endsWith("?")).toBe(true);
      }
    }
  });

  it("gives no airline verdict for rivalry, because the paper gives none", () => {
    // Inventing one would be the surface putting words in Porter's mouth.
    expect(FORCE_BY_KEY.get("rivalry")?.airline).toBeNull();
    expect(FORCE_BY_KEY.get("substitutes")?.airline?.verdict).toBe("Medium");
    expect(FORCE_BY_KEY.get("entrants")?.airline?.verdict).toBe("High");
  });

  it("offers the four places a force bites, and no verdict scale", () => {
    expect(EFFECTS.map((effect) => effect.key)).toEqual(["prices", "costs", "capital", "opportunities"]);
    const everyString = JSON.stringify(FORCES).toLowerCase();
    // The paper's fifth caution rules out a high/medium/low picker for the
    // learner's own company; the only verdicts here are Porter's, on airlines.
    expect(everyString).not.toContain("score");
  });
});

describe("what makes a finding a finding", () => {
  const complete = {
    force: "suppliers" as const,
    question: "leverage",
    mechanism: "Two suppliers make the chips it needs and it cannot buy them elsewhere.",
    effect: "costs" as const,
    standing: "structural" as const,
    passageIds: [],
    wouldChangeIt: "A third supplier qualifying, or the company designing the part out.",
  };

  it("accepts one that names a mechanism and what would change it", () => {
    expect(whatIsMissing(complete)).toEqual([]);
  });

  it("refuses a plus or a minus against a force", () => {
    // The paper, p. 22: "Much of what is put forth as analysis of industry
    // structure is simply listing pluses and minuses for each of the forces."
    expect(whatIsMissing({ force: "suppliers", question: "leverage" })).toContain("how it works, in your own words");
    expect(whatIsMissing({ ...complete, wouldChangeIt: "   " })).toContain("what would change your mind");
    expect(whatIsMissing({ ...complete, mechanism: "" })).toContain("how it works, in your own words");
  });

  it("does not require evidence, so a thought is not lost for want of a quotation", () => {
    expect(whatIsMissing({ ...complete, passageIds: [] })).toEqual([]);
  });
});

describe("counting what has been looked at", () => {
  const finding = (force: ForceFinding["force"], id: string): ForceFinding => ({
    id,
    savedAt: "2026-09-22T00:00:00.000Z",
    force,
    question: "leverage",
    mechanism: "m",
    effect: "costs",
    standing: "structural",
    passageIds: [],
    wouldChangeIt: "w",
  });

  it("counts forces examined and findings, and names what is untouched", () => {
    const result = coverage([finding("suppliers", "a"), finding("suppliers", "b"), finding("buyers", "c")]);
    expect(result.forcesExamined).toBe(2);
    expect(result.findings).toBe(3);
    expect(result.untouched.map((force) => force.key)).toEqual(["entrants", "rivalry", "substitutes"]);
  });
});

describe("findings in a saved project", () => {
  const project = () => {
    const base = createStudioProject("practice", "2026-09-22T00:00:00.000Z");
    return saveInvestigation(
      base,
      { company: "Atkore", sic: "3690", figures: {}, riskFreePct: null, source: null },
      "inv-1",
      "2026-09-22T00:00:00.000Z",
    );
  };

  const edit = {
    force: "buyers" as const,
    question: "concentration",
    mechanism: "Four distributors buy most of what it makes.",
    effect: "prices" as const,
    standing: "structural" as const,
    passageIds: [] as string[],
    wouldChangeIt: "It starts selling direct.",
  };

  it("keeps a finding against the investigation it was made on", () => {
    const after = recordForceFinding(project(), "inv-1", edit, "frc-1");
    expect(after.investigations[0].forces).toHaveLength(1);
    expect(after.investigations[0].forces![0].mechanism).toBe("Four distributors buy most of what it makes.");
  });

  it("survives the next keystroke in Investigate", () => {
    // saveInvestigation rebuilds the record from its edit, so a finding it did
    // not carry forward would vanish the moment a figure was typed.
    const withFinding = recordForceFinding(project(), "inv-1", edit, "frc-1");
    const afterTyping = saveInvestigation(
      withFinding,
      { company: "Atkore", sic: "3690", figures: { revenue: 100 }, riskFreePct: null, source: null },
      "inv-1",
      "2026-09-22T00:01:00.000Z",
    );
    expect(afterTyping.investigations[0].forces).toHaveLength(1);
  });

  it("refuses to cite a passage that is not kept", () => {
    const after = recordForceFinding(project(), "inv-1", { ...edit, passageIds: ["not-kept"] }, "frc-1");
    expect(after.investigations[0].forces![0].passageIds).toEqual([]);
  });

  it("loses the citation but keeps the finding when a passage goes", () => {
    const passage = {
      id: "psg-1",
      savedAt: "2026-09-22T00:00:00.000Z",
      cik: "1",
      accession: "a",
      document: "d",
      sectionId: "item1",
      form: "10-K",
      filed: "2026-01-01",
      quote: "q",
      prefix: "",
      suffix: "",
      offset: 0,
      role: "supports" as const,
      note: "",
    };
    const withPassage = {
      ...project(),
      investigations: [{ ...project().investigations[0], passages: [passage] }],
    };
    const withFinding = recordForceFinding(withPassage, "inv-1", { ...edit, passageIds: ["psg-1"] }, "frc-1");
    expect(withFinding.investigations[0].forces![0].passageIds).toEqual(["psg-1"]);

    const afterDrop = removePassage(withFinding, "inv-1", "psg-1");
    expect(afterDrop.investigations[0].forces).toHaveLength(1);
    expect(afterDrop.investigations[0].forces![0].passageIds).toEqual([]);
  });

  it("takes one back without touching the others", () => {
    const two = recordForceFinding(recordForceFinding(project(), "inv-1", edit, "frc-1"), "inv-1", edit, "frc-2");
    const after = removeForceFinding(two, "inv-1", "frc-1");
    expect(after.investigations[0].forces!.map((finding) => finding.id)).toEqual(["frc-2"]);
  });

  it("is refused by the validator if a backup names a force the paper does not have", () => {
    // A hand-edited backup could otherwise put a finding on screen under a
    // heading Studio would have to invent.
    const withFinding = recordForceFinding(project(), "inv-1", edit, "frc-1");
    expect(validateStudioProject(withFinding)).toEqual([]);

    const tampered = {
      ...withFinding,
      investigations: [
        {
          ...withFinding.investigations[0],
          forces: [{ ...withFinding.investigations[0].forces![0], force: "regulators" }],
        },
      ],
    };
    expect(validateStudioProject(tampered).join(" ")).toContain("finding about competition");
  });

  it("is refused if the question is not one that force asks", () => {
    const withFinding = recordForceFinding(project(), "inv-1", edit, "frc-1");
    const tampered = {
      ...withFinding,
      investigations: [
        {
          ...withFinding.investigations[0],
          forces: [{ ...withFinding.investigations[0].forces![0], question: "whatever-i-like" }],
        },
      ],
    };
    expect(validateStudioProject(tampered).join(" ")).toContain("finding about competition");
  });

  it("does nothing for an investigation that is not there", () => {
    const before = project();
    expect(recordForceFinding(before, "missing", edit, "frc-1")).toBe(before);
    expect(removeForceFinding(before, "inv-1", "nope")).toBe(before);
  });
});
