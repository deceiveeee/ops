import { describe, expect, it } from "vitest";
import { annualReportStatus, containsPassage, countMentions, filingText, readNamedCompetitors, segmentsNaming, unaccounted } from "./peer-sets";

/**
 * The rules that decide which companies a learner sees as Atkore's peers.
 *
 * The competitor passage here is invented, in the shape Atkore's annual report
 * uses: names that carry their own commas ("Industries, Inc."), a final "and",
 * a stray full stop after "plc", and a space before one colon. The real passage
 * is read from the filing itself in peer-sets.data.test.ts.
 */

const LEAD = "The main competitors in each of these segments are listed below:";
const PASSAGE = `${LEAD} Pipes: Acme Industries, Inc., Bolt Corporation, Crane Company, LLC, and Delta. Framing & Supports : Acme Industries, Inc., Echo Ltd., Foxtrot plc., and Golf Corporation.`;

describe("reading the competitors a company names", () => {
  it("keeps each name whole, commas and all, under the segment it is listed for", () => {
    expect(readNamedCompetitors(PASSAGE, LEAD)).toEqual([
      { segment: "Pipes", names: ["Acme Industries, Inc.", "Bolt Corporation", "Crane Company, LLC", "Delta"] },
      { segment: "Framing & Supports", names: ["Acme Industries, Inc.", "Echo Ltd.", "Foxtrot plc.", "Golf Corporation"] },
    ]);
  });

  it("returns nothing rather than a guess when a list's end cannot be found", () => {
    expect(readNamedCompetitors(`${LEAD} Pipes: Acme, Bolt Framing: Crane`, LEAD)).toEqual([]);
    expect(readNamedCompetitors("Pipes: Acme, and Bolt.", LEAD)).toEqual([]);
  });

  it("names the segments a company is listed under", () => {
    const groups = readNamedCompetitors(PASSAGE, LEAD);
    expect(segmentsNaming(groups, "Acme Industries, Inc.")).toEqual(["Pipes", "Framing & Supports"]);
    expect(segmentsNaming(groups, "Echo Ltd.")).toEqual(["Framing & Supports"]);
  });

  it("finds a named company that is neither in the set nor on the missing list, and one nobody named", () => {
    const groups = readNamedCompetitors(PASSAGE, LEAD);
    const all = ["Acme Industries, Inc.", "Bolt Corporation", "Crane Company, LLC", "Delta", "Echo Ltd.", "Foxtrot plc.", "Golf Corporation"];
    expect(unaccounted(groups, all)).toEqual({ notAccounted: [], notNamed: [] });
    expect(unaccounted(groups, all.filter((name) => name !== "Delta"))).toEqual({ notAccounted: ["Delta"], notNamed: [] });
    expect(unaccounted(groups, [...all, "Hotel Inc."])).toEqual({ notAccounted: [], notNamed: ["Hotel Inc."] });
  });
});

describe("finding a quoted passage in a filing", () => {
  it("joins a word split across inline tags, and separates paragraphs", () => {
    expect(filingText("<p>Makes <span>elec</span><span>trical</span> conduit</p><p>and&#160;fittings</p>")).toBe(
      "Makes electrical conduit and fittings",
    );
  });

  it("makes typographic quotes and dashes plain, and ignores styles and scripts", () => {
    expect(filingText("<style>p { color: red }</style><div>the &#8220;Company&#8221; &#8212; ours</div>")).toBe('the "Company" - ours');
  });

  it("reads a colon the same whether a span boundary or a stray space sits before it", () => {
    // Atkore's live report closes an italic span before its colon; the fixture rebuilt from it has a space there.
    const live = filingText("<p><i>Safety &amp; Infrastructure</i><span>: Zekelman Industries, Inc.</span></p>");
    const rebuilt = filingText("<p>Safety &amp; Infrastructure : Zekelman Industries, Inc.</p>");
    expect(live).toBe(rebuilt);
    expect(containsPassage(rebuilt, "Safety & Infrastructure: Zekelman Industries, Inc.")).toBe(true);
  });

  it("counts every mention of a word over the whole text, whatever its case, plurals included", () => {
    const text = filingText("<p>PVC Conduit pipe.</p><p>We make no conduit ourselves; see <b>con</b>duits.</p>");
    expect(countMentions(text, "conduit")).toBe(3);
    expect(countMentions(text, "fittings")).toBe(0);
    expect(countMentions(text, "")).toBe(0);
  });

  it("finds a passage word for word, and nothing looser", () => {
    const text = filingText("<p>We manufacture <b>conduit</b> pipe products under the Westlake Pipe &amp; Fittings brand name.</p>");
    expect(containsPassage(text, "conduit pipe products under the Westlake Pipe & Fittings brand name")).toBe(true);
    expect(containsPassage(text, "conduit pipe  products")).toBe(true);
    expect(containsPassage(text, "conduit products under")).toBe(false);
    expect(containsPassage(text, "")).toBe(false);
  });
});

describe("whether a company still files annual reports", () => {
  const row = (form: string, filed: string) => ({ form, filed, accession: `${form}-${filed}` });

  it("counts a company that deregistered one class of securities years before its latest annual report", () => {
    // Hubbell: a Form 15 in 2016, and a 10-K in 2026.
    const status = annualReportStatus([row("15-12B", "2016-01-13"), row("10-K", "2026-02-12")], "2026-09-13");
    expect(status.files).toBe(true);
    expect(status.deregistered).toBeNull();
  });

  it("does not count a company that deregistered after its last annual report", () => {
    // ABB: a 20-F for 2023, then a Form 15F in June 2024.
    const status = annualReportStatus([row("20-F", "2024-02-23"), row("15F-12B", "2024-06-10")], "2026-09-13");
    expect(status.files).toBe(false);
    expect(status.deregistered?.filed).toBe("2024-06-10");
  });

  it("does not count a withdrawn listing, a stale annual report, or no filings at all", () => {
    expect(annualReportStatus([row("S-1", "2018-06-08"), row("RW", "2019-01-10")], "2026-09-13")).toEqual({
      files: false,
      latestAnnual: null,
      deregistered: null,
    });
    expect(annualReportStatus([row("10-K", "2023-03-01")], "2026-09-13").files).toBe(false);
    expect(annualReportStatus([], "2026-09-13").files).toBe(false);
  });
});
