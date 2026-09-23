import { describe, expect, it } from "vitest";
import {
  EXAMPLE,
  RELATIONSHIPS,
  ZONES,
  ZONE_BY_KEY,
  byZone,
  stillEmpty,
  whatIsMissing,
  type MapEntry,
} from "./industry-map";
import { addMapEntry, removeMapEntry, removePassage, saveInvestigation } from "./operations";
import { createStudioProject } from "./create";
import { validateStudioProject } from "./validate";

describe("the map, as Exhibit 9 lays it out", () => {
  it("has the paper's zones, suppliers first and customers after the industry", () => {
    expect(ZONES.map((zone) => zone.key)).toEqual(["suppliers", "rivals", "customers", "government", "other"]);
  });

  it("asks what kind of arrangement it is only where there is a counterparty", () => {
    // A tariff is not in a contract with anybody, and the paper's list of
    // interactions is about the organizations on the map.
    expect(ZONE_BY_KEY.get("suppliers")?.asks).toBe(true);
    expect(ZONE_BY_KEY.get("customers")?.asks).toBe(true);
    expect(ZONE_BY_KEY.get("government")?.asks).toBe(false);
    expect(ZONE_BY_KEY.get("other")?.asks).toBe(false);
  });

  it("offers the paper's seven kinds of interaction, each with its own example", () => {
    expect(RELATIONSHIPS.map((kind) => kind.key)).toEqual([
      "non-contractual",
      "contractual",
      "cost-plus",
      "best-efforts",
      "licence",
      "option",
      "other",
    ]);
    for (const kind of RELATIONSHIPS) expect(kind.example.length).toBeGreaterThan(0);
  });

  it("carries Exhibit 9's own airline map, in its zones", () => {
    expect(EXAMPLE.zones.suppliers.some((entry) => entry.startsWith("Jet fuel"))).toBe(true);
    expect(EXAMPLE.zones.rivals).toContain("Southwest (LCC)");
    expect(EXAMPLE.zones.customers.some((entry) => entry.startsWith("Fliers"))).toBe(true);
    expect(EXAMPLE.zones.other).toEqual([
      "Economic conditions",
      "Geopolitical risk",
      "Climate change",
      "Global pandemic",
    ]);
    // LCC is the paper's own note on the exhibit, not Studio's gloss.
    expect(EXAMPLE.note).toContain("low-cost carrier");
  });
});

describe("what makes an entry", () => {
  const complete = {
    zone: "suppliers" as const,
    name: "The two mills it names",
    relationship: "contractual" as const,
    affects: "A steel price rise reaches its costs within a quarter, because it buys on annual contracts.",
    passageIds: [],
  };

  it("accepts one that is named, placed, and explained", () => {
    expect(whatIsMissing(complete)).toEqual([]);
  });

  it("refuses a name with nothing behind it", () => {
    expect(whatIsMissing({ zone: "suppliers", name: "Somebody" })).toContain("how it reaches this company's profits");
    expect(whatIsMissing({ ...complete, name: "  " })).toContain("what it is called");
  });

  it("requires an arrangement only where the zone has a counterparty", () => {
    expect(whatIsMissing({ ...complete, relationship: undefined })).toContain("what kind of arrangement it is");
    const factor = { zone: "other" as const, name: "A mild winter", affects: "Demand for its heating cable falls.", passageIds: [] };
    expect(whatIsMissing(factor)).toEqual([]);
  });
});

describe("reading a map back", () => {
  const entry = (zone: MapEntry["zone"], id: string): MapEntry => ({
    id,
    savedAt: "2026-09-23T00:00:00.000Z",
    zone,
    name: id,
    affects: "a",
    passageIds: [],
  });

  it("groups by zone and keeps every zone, empty or not", () => {
    const grouped = byZone([entry("suppliers", "a"), entry("suppliers", "b"), entry("customers", "c")]);
    expect(grouped.suppliers.map((item) => item.id)).toEqual(["a", "b"]);
    expect(grouped.customers).toHaveLength(1);
    expect(grouped.government).toEqual([]);
  });

  it("names the sides not looked at yet, rather than scoring the map", () => {
    expect(stillEmpty([entry("suppliers", "a")])).toEqual(["rivals", "customers", "government", "other"]);
    expect(stillEmpty([])).toHaveLength(5);
  });
});

describe("a map in a saved project", () => {
  const project = () =>
    saveInvestigation(
      createStudioProject("practice", "2026-09-23T00:00:00.000Z"),
      { company: "Atkore", sic: "3690", figures: {}, riskFreePct: null, source: null },
      "inv-1",
      "2026-09-23T00:00:00.000Z",
    );

  const edit = {
    zone: "customers" as const,
    name: "Electrical distributors",
    relationship: "non-contractual" as const,
    affects: "Four of them buy most of what it makes, so a change in their stocking reaches its volumes first.",
    passageIds: [] as string[],
  };

  it("keeps an entry, and it survives the next keystroke in Investigate", () => {
    const withEntry = addMapEntry(project(), "inv-1", edit, "map-1");
    expect(withEntry.investigations[0].mapEntries).toHaveLength(1);
    const afterTyping = saveInvestigation(
      withEntry,
      { company: "Atkore", sic: "3690", figures: { revenue: 100 }, riskFreePct: null, source: null },
      "inv-1",
      "2026-09-23T00:01:00.000Z",
    );
    expect(afterTyping.investigations[0].mapEntries).toHaveLength(1);
  });

  it("refuses to cite a passage that is not kept, and loses the citation when one goes", () => {
    const passage = {
      id: "psg-1",
      savedAt: "2026-09-23T00:00:00.000Z",
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
    expect(addMapEntry(project(), "inv-1", { ...edit, passageIds: ["nope"] }, "map-1").investigations[0].mapEntries![0].passageIds).toEqual([]);

    const base = project();
    const withPassage = { ...base, investigations: [{ ...base.investigations[0], passages: [passage] }] };
    const withEntry = addMapEntry(withPassage, "inv-1", { ...edit, passageIds: ["psg-1"] }, "map-1");
    const afterDrop = removePassage(withEntry, "inv-1", "psg-1");
    expect(afterDrop.investigations[0].mapEntries).toHaveLength(1);
    expect(afterDrop.investigations[0].mapEntries![0].passageIds).toEqual([]);
  });

  it("takes one off, and does nothing for records that are not there", () => {
    const two = addMapEntry(addMapEntry(project(), "inv-1", edit, "map-1"), "inv-1", edit, "map-2");
    expect(removeMapEntry(two, "inv-1", "map-1").investigations[0].mapEntries!.map((item) => item.id)).toEqual(["map-2"]);
    const before = project();
    expect(addMapEntry(before, "missing", edit, "map-1")).toBe(before);
    expect(removeMapEntry(before, "inv-1", "nope")).toBe(before);
  });

  it("is refused by the validator if a backup names a zone the paper does not have", () => {
    const withEntry = addMapEntry(project(), "inv-1", edit, "map-1");
    expect(validateStudioProject(withEntry)).toEqual([]);
    const tampered = {
      ...withEntry,
      investigations: [
        { ...withEntry.investigations[0], mapEntries: [{ ...withEntry.investigations[0].mapEntries![0], zone: "outer space" }] },
      ],
    };
    expect(validateStudioProject(tampered).join(" ")).toContain("industry map");
  });

  it("accepts an entry with no arrangement, because two zones never have one", () => {
    const factor = addMapEntry(project(), "inv-1", {
      zone: "other",
      name: "Copper price",
      affects: "It is the input its margin turns on.",
      passageIds: [],
    }, "map-1");
    expect(validateStudioProject(factor)).toEqual([]);
  });
});
