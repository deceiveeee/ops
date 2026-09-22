import { describe, expect, it } from "vitest";
import {
  EXAMPLE,
  LEVERS,
  LEVER_BY_ID,
  MARKS,
  bands,
  pull,
  sideSuggested,
  whatIsMissing,
  whatIsWrong,
} from "./value-stick";
import { recordValueClaim, removePassage, removeValueClaim, saveInvestigation } from "./operations";
import { createStudioProject } from "./create";
import { validateStudioProject } from "./validate";

describe("the stick, as the paper sets it out", () => {
  it("has the four marks in the paper's order", () => {
    expect(MARKS.map((mark) => mark.key)).toEqual(["wtp", "price", "cost", "wts"]);
    expect(MARKS.map((mark) => mark.sourceLabel)).toEqual([
      "Willingness to pay",
      "Price",
      "Cost",
      "Willingness to sell",
    ]);
  });

  it("has Exhibit 29's six levers, three a side", () => {
    expect(LEVERS.filter((lever) => lever.side === "wtp").map((lever) => lever.sourceLabel)).toEqual([
      "Network effects",
      "Complements",
      "Products and services",
    ]);
    expect(LEVERS.filter((lever) => lever.side === "wts").map((lever) => lever.sourceLabel)).toEqual([
      "Lower supply cost",
      "Productivity",
      "Employee relations",
    ]);
  });

  it("cuts the stick into the three bands the paper names", () => {
    const result = bands({ wtp: 30, price: 22, cost: 14, wts: 9 });
    expect(result).toEqual({ consumerSurplus: 8, firmValue: 8, supplierSurplus: 5, total: 21 });
    // The three bands are the whole stick, always.
    expect(result.consumerSurplus + result.firmValue + result.supplierSurplus).toBe(result.total);
  });

  it("says what is wrong rather than clamping a mark past its neighbour", () => {
    expect(whatIsWrong({ wtp: 20, price: 22, cost: 14, wts: 9 })[0]).toContain("nobody buys");
    expect(whatIsWrong({ wtp: 30, price: 12, cost: 14, wts: 9 })[0]).toContain("loses money");
    expect(whatIsWrong({ wtp: 30, price: 22, cost: 14, wts: 16 })[0]).toContain("stop supplying");
    expect(whatIsWrong(EXAMPLE.start)).toEqual([]);
  });
});

describe("pulling a lever in the worked example", () => {
  it("moves the willingness, never the price or the cost", () => {
    // The paper's point: a lever changes what someone is willing to do. What
    // the company then charges is its own decision, not the lever's.
    const after = pull(EXAMPLE.start, ["network"]);
    expect(after.wtp).toBe(EXAMPLE.start.wtp + LEVER_BY_ID.get("network")!.moves);
    expect(after.price).toBe(EXAMPLE.start.price);
    expect(after.cost).toBe(EXAMPLE.start.cost);
    expect(after.wts).toBe(EXAMPLE.start.wts);
  });

  it("widens the stick from both ends, and hands the gain to customers and suppliers until the company takes it", () => {
    const after = pull(EXAMPLE.start, ["network", "productivity"]);
    const before = bands(EXAMPLE.start);
    const now = bands(after);
    expect(now.total).toBeGreaterThan(before.total);
    // Price and cost have not moved, so the firm's own band is unchanged: the
    // whole gain sits with the customer and the supplier.
    expect(now.firmValue).toBe(before.firmValue);
    expect(now.consumerSurplus).toBeGreaterThan(before.consumerSurplus);
    expect(now.supplierSurplus).toBeGreaterThan(before.supplierSurplus);
  });

  it("ignores a lever it does not have", () => {
    expect(pull(EXAMPLE.start, ["moat-juice"])).toEqual(EXAMPLE.start);
  });

  it("says its numbers are invented", () => {
    expect(EXAMPLE.disclaimer.toLowerCase()).toContain("made-up");
  });
});

describe("what the seven figures suggest", () => {
  it("points at the top of the stick for a differentiation advantage", () => {
    const read = sideSuggested("differentiation");
    expect(read.side).toBe("wtp");
    expect(read.says).toContain("willing to pay");
  });

  it("points at the bottom for a cost advantage", () => {
    expect(sideSuggested("cost leadership").side).toBe("wts");
  });

  it("points nowhere when there are no peers, and says why", () => {
    const read = sideSuggested(null);
    expect(read.side).toBeNull();
    expect(read.says).toContain("no peer comparison");
  });

  it("puts it as a question, never as proof a lever is there", () => {
    for (const advantage of ["differentiation", "cost leadership", "both"]) {
      const said = sideSuggested(advantage).says;
      expect(said).not.toMatch(/proves|shows that it has|confirms/i);
    }
  });
});

describe("what makes a claim a claim", () => {
  const complete = {
    lever: "network",
    mechanism: "Every extra restaurant on it makes it worth more to every diner, and the other way about.",
    passageIds: [],
    wouldChangeIt: "Diners using it alongside two rival apps rather than instead of them.",
  };

  it("accepts one that names a lever, a mechanism and what would change it", () => {
    expect(whatIsMissing(complete)).toEqual([]);
  });

  it("refuses a lever ticked off a list", () => {
    expect(whatIsMissing({ lever: "network" })).toContain("how it works here, in your own words");
    expect(whatIsMissing({ ...complete, wouldChangeIt: "  " })).toContain("what would change your mind");
    expect(whatIsMissing({ ...complete, lever: "moat-juice" })).toContain("which lever you mean");
  });
});

describe("claims in a saved project", () => {
  const project = () =>
    saveInvestigation(
      createStudioProject("practice", "2026-09-22T00:00:00.000Z"),
      { company: "Atkore", sic: "3690", figures: {}, riskFreePct: null, source: null },
      "inv-1",
      "2026-09-22T00:00:00.000Z",
    );

  const edit = {
    lever: "productivity",
    mechanism: "It runs the same machines with fewer people than the two competitors it names.",
    passageIds: [] as string[],
    wouldChangeIt: "Its cost per tonne rising towards theirs over two years.",
  };

  it("keeps a claim, and it survives the next keystroke in Investigate", () => {
    const withClaim = recordValueClaim(project(), "inv-1", edit, "val-1");
    expect(withClaim.investigations[0].valueClaims).toHaveLength(1);
    const afterTyping = saveInvestigation(
      withClaim,
      { company: "Atkore", sic: "3690", figures: { revenue: 100 }, riskFreePct: null, source: null },
      "inv-1",
      "2026-09-22T00:01:00.000Z",
    );
    expect(afterTyping.investigations[0].valueClaims).toHaveLength(1);
  });

  it("refuses to cite a passage that is not kept", () => {
    const after = recordValueClaim(project(), "inv-1", { ...edit, passageIds: ["nope"] }, "val-1");
    expect(after.investigations[0].valueClaims![0].passageIds).toEqual([]);
  });

  it("loses the citation but keeps the claim when a passage goes", () => {
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
    const base = project();
    const withPassage = { ...base, investigations: [{ ...base.investigations[0], passages: [passage] }] };
    const withClaim = recordValueClaim(withPassage, "inv-1", { ...edit, passageIds: ["psg-1"] }, "val-1");
    const afterDrop = removePassage(withClaim, "inv-1", "psg-1");
    expect(afterDrop.investigations[0].valueClaims).toHaveLength(1);
    expect(afterDrop.investigations[0].valueClaims![0].passageIds).toEqual([]);
  });

  it("takes one back, and does nothing for records that are not there", () => {
    const two = recordValueClaim(recordValueClaim(project(), "inv-1", edit, "val-1"), "inv-1", edit, "val-2");
    expect(removeValueClaim(two, "inv-1", "val-1").investigations[0].valueClaims!.map((claim) => claim.id)).toEqual(["val-2"]);
    const before = project();
    expect(recordValueClaim(before, "missing", edit, "val-1")).toBe(before);
    expect(removeValueClaim(before, "inv-1", "nope")).toBe(before);
  });

  it("is refused by the validator if a backup names a lever the paper does not have", () => {
    const withClaim = recordValueClaim(project(), "inv-1", edit, "val-1");
    expect(validateStudioProject(withClaim)).toEqual([]);
    const tampered = {
      ...withClaim,
      investigations: [
        {
          ...withClaim.investigations[0],
          valueClaims: [{ ...withClaim.investigations[0].valueClaims![0], lever: "moat-juice" }],
        },
      ],
    };
    expect(validateStudioProject(tampered).join(" ")).toContain("claim about value");
  });
});
