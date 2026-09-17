import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureFileName } from "./edgar";
import { MAX_LISTED, MAX_QUERY, findInSections } from "./find";
import { pageForOffset, paginate } from "./pages";
import { extractFilingSections, type ExtractedSection } from "./sections";

const DOC = "https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/atkr-20250930.htm";
const html = readFileSync(join(process.cwd(), "e2e", "fixtures", "edgar", fixtureFileName(DOC)), "utf8");
const sections = extractFilingSections(html).sections;

const section = (text: string): ExtractedSection => ({ id: "business", label: "Business", lens: "", at: 0, text, tables: [] });

describe("finding a phrase in Atkore's 10-K", () => {
  it("finds PVC resin in each section that mentions it, on the page it is on", () => {
    const result = findInSections(sections, "PVC resin");
    if (!result.ok) throw new Error(result.reason);

    // Business, risk factors, management's discussion and market risk each
    // mention it once in the fixture. The old excerpts showed none of them.
    expect(result.hits.map((hit) => hit.sectionId)).toEqual(["business", "risk-factors", "mdna", "market-risk"]);
    expect(result.total).toBe(4);

    for (const hit of result.hits) {
      const text = sections.find((s) => s.id === hit.sectionId)!.text;
      expect(text.slice(hit.offset, hit.offset + hit.length).toLowerCase()).toBe("pvc resin");
      expect(hit.page).toBe(pageForOffset(paginate(text), hit.offset));
      expect(hit.match).toBe("PVC resin");
    }
  });

  it("shows enough either side of a hit to recognise the passage", () => {
    const result = findInSections(sections, "PVC resin");
    if (!result.ok) throw new Error(result.reason);
    const business = result.hits[0];
    expect(`${business.before}${business.match}${business.after}`).toContain("primary suppliers of PVC resin");
  });

  it("ignores case and treats any run of spaces or line breaks as one space", () => {
    const loose = findInSections(sections, "  pvc    RESIN ");
    const exact = findInSections(sections, "PVC resin");
    if (!loose.ok || !exact.ok) throw new Error("expected results");
    expect(loose.hits.map((hit) => hit.offset)).toEqual(exact.hits.map((hit) => hit.offset));

    const split = findInSections([section("Item 1. Business\nwe buy PVC\nresin from three suppliers")], "PVC resin");
    if (!split.ok) throw new Error(split.reason);
    expect(split.total).toBe(1);
    expect(split.hits[0].match).toBe("PVC resin");
  });
});

describe("what a search does not do", () => {
  it("takes punctuation literally rather than as a pattern", () => {
    const result = findInSections([section("Item 1. Business\nsales of $2.9 billion, not $219 billion")], "$2.9");
    if (!result.ok) throw new Error(result.reason);
    expect(result.total).toBe(1);
  });

  it("does not stem, so a word is matched as written", () => {
    // "resin" inside "resins" is still the letters r-e-s-i-n; what is refused is
    // the reverse, inventing "resins" from "resin".
    const result = findInSections([section("Item 1. Business\nresin and resins")], "resins");
    if (!result.ok) throw new Error(result.reason);
    expect(result.total).toBe(1);
  });

  it("refuses a query too short to mean anything and one long enough to be a paste", () => {
    expect(findInSections(sections, "a").ok).toBe(false);
    expect(findInSections(sections, "x".repeat(MAX_QUERY + 1)).ok).toBe(false);
  });

  it("counts every hit but lists only the first forty", () => {
    const result = findInSections([section(`Item 1. Business\n${"steel ".repeat(60)}`)], "steel");
    if (!result.ok) throw new Error(result.reason);
    expect(result.total).toBe(60);
    expect(result.hits).toHaveLength(MAX_LISTED);
  });
});
