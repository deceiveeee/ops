import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { competitionPassages, filerIndex, hasCompanyWord, namesIn, normalizeCompanyName, suggestCompetitors } from "./competitors";
import { extractFilingSections } from "./sections";

/**
 * Competitors read out of a report's own words, for a learner to confirm.
 *
 * The cases are real: Atkore's fixture copy of its 2025 annual report
 * (e2e/fixtures/edgar), and sentences from the latest annual reports of Delta,
 * Caterpillar, Coca-Cola and Apple as the reader's text extraction gave them on
 * 2026-09-14. The ticker-file rows are copied from EDGAR's company_tickers.json as
 * it stood that day. The constructed sentences say so.
 */

const TICKERS = {
  "0": { cik_str: 1666138, ticker: "ATKR", title: "Atkore Inc." },
  "1": { cik_str: 73309, ticker: "NUE", title: "NUCOR CORP" },
  "2": { cik_str: 1551182, ticker: "ETN", title: "Eaton Corp plc" },
  "3": { cik_str: 48898, ticker: "HUBB", title: "HUBBELL INC" },
  "4": { cik_str: 1720635, ticker: "NVT", title: "nVent Electric plc" },
  "5": { cik_str: 6201, ticker: "AAL", title: "American Airlines Group Inc." },
  "6": { cik_str: 100517, ticker: "UAL", title: "United Airlines Holdings, Inc." },
  "7": { cik_str: 92380, ticker: "LUV", title: "SOUTHWEST AIRLINES CO" },
  "8": { cik_str: 1158463, ticker: "JBLU", title: "JETBLUE AIRWAYS CORP" },
  "9": { cik_str: 766421, ticker: "ALK", title: "ALASKA AIR GROUP, INC." },
  "10": { cik_str: 27904, ticker: "DAL", title: "DELTA AIR LINES, INC." },
  "11": { cik_str: 77476, ticker: "PEP", title: "PEPSICO INC" },
  "12": { cik_str: 315189, ticker: "DE", title: "DEERE & CO" },
  "13": { cik_str: 1567094, ticker: "CNH", title: "CNH Industrial N.V." },
  "14": { cik_str: 26172, ticker: "CMI", title: "CUMMINS INC" },
  "15": { cik_str: 1437672, ticker: "PRYMF", title: "Prysmian S.p.A." },
};
const filers = filerIndex(TICKERS);
const found = (text: string, own: { cik: string; name: string }) =>
  suggestCompetitors({ id: "business", text }, filers, own).suggestions.map((entry) => [entry.name, entry.filer?.ticker ?? null]);

describe("competitors a report names", () => {
  it("reads Atkore's from the lines after “listed below:”, each once, and stops at the next heading", () => {
    const html = readFileSync(resolve(process.cwd(), "e2e/fixtures/edgar/https___www.sec.gov_Archives_edgar_data_1666138_000162828025054049_atkr-20250930.htm"), "utf8");
    const business = extractFilingSections(html).sections.find((section) => section.id === "business");
    if (!business) throw new Error("the fixture has no Business section");
    const { passages, suggestions } = suggestCompetitors(business, filers, { cik: "0001666138", name: "Atkore Inc." });

    // Prysmian is in the ticker file, but Atkore names it as one bare word, which is not offered.
    expect(suggestions.map((entry) => [entry.name, entry.filer?.ticker ?? null])).toEqual([
      ["Zekelman Industries, Inc.", null],
      ["Mitsubishi Corporation", null],
      ["Nucor Corporation", "NUE"],
      ["Southwire Company, LLC", null],
      ["Dura-Line Corporation", null],
      ["Eaton Corporation plc", "ETN"],
      ["ABB Ltd.", null],
      ["Hubbell Incorporated", "HUBB"],
      ["nVent Electric plc", "NVT"],
      ["Haydon Corporation", null],
    ]);
    const list = suggestions[0].passage.quote;
    expect(list).toContain("listed below:");
    expect(list).toContain("Safety & Infrastructure");
    expect(list).not.toContain("Management of Information Technology Systems");
    // Anchored where it is, so the reader can open it.
    expect(business.text.slice(suggestions[0].passage.offset, suggestions[0].passage.offset + list.length)).toBe(list);
    expect(passages.length).toBeGreaterThan(1);
  });

  it("offers a name without “Inc.” only when exactly one SEC company goes by it", () => {
    const delta =
      "Domestic Our domestic operations are subject to significant competition from traditional network carriers, including American Airlines and United Airlines, national point-to-point carriers, including Alaska Airlines, JetBlue Airways and Southwest Airlines, and other discount or ultra-low-cost carriers, including Allegiant Air, Frontier Airlines and Spirit Airlines.";
    expect(found(delta, { cik: "27904", name: "DELTA AIR LINES, INC." })).toEqual([
      ["American Airlines", "AAL"],
      ["United Airlines", "UAL"],
      ["JetBlue Airways", "JBLU"],
      ["Southwest Airlines", "LUV"],
    ]);
  });

  it("keeps company words with their names in long lists, and leaves out what only looks like a name", () => {
    const caterpillar = [
      "Examples of global competitors include CASE (part of CNH Industrial N.V.), Deere Construction & Forestry (part of Deere & Company), Doosan Bobcat (Part of Doosan Group), Hitachi Construction Machinery Co., Ltd., Hyundai Construction Equipment Co., Ltd., Hyundai Doosan Infracore Co., Ltd.",
      "Principal global competitors include Cummins Inc., Deutz AG, Rolls-Royce Power Systems AG and Siemens Energy AG.",
    ].join("\n");
    expect(found(caterpillar, { cik: "18230", name: "CATERPILLAR INC" })).toEqual([
      ["CNH Industrial N.V.", "CNH"],
      ["Deere & Company", "DE"],
      ["Doosan Group", null],
      ["Hitachi Construction Machinery Co., Ltd.", null],
      ["Hyundai Construction Equipment Co., Ltd.", null],
      ["Hyundai Doosan Infracore Co., Ltd.", null],
      ["Cummins Inc.", "CMI"],
      ["Deutz AG", null],
      ["Rolls-Royce Power Systems AG", null],
      ["Siemens Energy AG", null],
    ]);
  });

  it("reads a competitor named in the middle of a sentence", () => {
    const cocaCola = "In many of the countries in which we do business, PepsiCo, Inc. is a primary competitor.";
    expect(found(cocaCola, { cik: "21344", name: "COCA COLA CO" })).toEqual([["PepsiCo, Inc.", "PEP"]]);
  });

  it("ends a name at a line break, where a list's lines carry no full stop (a constructed list)", () => {
    const list = "Our main competitors are listed below:\nElectrical: Acme Wire Corporation, Nucor Corporation\nSafety: Beta Holdings Inc, Gamma Tube Company";
    expect(found(list, { cik: "9", name: "Other Inc." })).toEqual([
      ["Acme Wire Corporation", null],
      ["Nucor Corporation", "NUE"],
      ["Beta Holdings Inc", null],
      ["Gamma Tube Company", null],
    ]);
  });

  it("never offers the company itself, by its SEC number or by its name (a constructed sentence)", () => {
    const sentence = "We compete with Atkore Inc., Atkore International Holdings Inc. and Nucor Corporation.";
    expect(found(sentence, { cik: "1666138", name: "Atkore Inc." })).toEqual([
      ["Atkore International Holdings Inc.", null],
      ["Nucor Corporation", "NUE"],
    ]);
    expect(found("We compete with Nucor Corporation.", { cik: "73309", name: "Steelmaker Inc." })).toEqual([]);
  });

  it("offers nothing where a report describes its competition without naming anyone, but still finds the passages", () => {
    const apple = [
      "Competition The markets for the Company's products and services are highly competitive and are characterized by aggressive price competition, downward pressure on gross margins, continual improvement in product performance, and price sensitivity on the part of consumers and businesses.",
      "Many of the Company's competitors seek to compete primarily through aggressive pricing and very low cost structures, and by imitating the Company's products and infringing on its intellectual property.",
    ].join("\n");
    const { passages, suggestions } = suggestCompetitors({ id: "business", text: apple }, filers, { cik: "320193", name: "Apple Inc." });
    expect(suggestions).toEqual([]);
    expect(passages).toHaveLength(2);
  });

  it("does not take “competitive” for a sentence about competitors", () => {
    expect(competitionPassages("We offer competitive wages.\nWe compete with Acme Widgets Inc.")).toEqual([{ start: 28, end: 61 }]);
  });

  it("does not take a heading such as “Competition” for a passage about it, as Apple's report sets one on its own line", () => {
    const text = "Competition\nThe markets for our products are highly competitive, and we compete with many companies.";
    expect(competitionPassages(text)).toEqual([{ start: 12, end: text.length }]);
  });

  it("decodes a character reference the extracted text still carries (a constructed sentence)", () => {
    expect(namesIn("Competitors include Nestl&#233; S.A.")).toEqual(["Nestlé S.A."]);
  });

  it("chooses no company where two in the ticker file share a name, and says so", () => {
    const twins = filerIndex({ a: { cik_str: 1, ticker: "AAA", title: "Acme Corp" }, b: { cik_str: 2, ticker: "BBB", title: "ACME INC" } });
    const { suggestions } = suggestCompetitors({ id: "business", text: "We compete with Acme Corporation and Acme." }, twins, { cik: "9", name: "Other Inc." });
    expect(suggestions.map((entry) => [entry.name, entry.filer, entry.ambiguous])).toEqual([["Acme Corporation", null, true]]);
  });
});

describe("company names", () => {
  it("sets aside what varies between one company's listings", () => {
    expect(normalizeCompanyName("Deere & Company")).toBe("DEERE AND");
    expect(normalizeCompanyName("DEERE & CO")).toBe("DEERE AND");
    expect(normalizeCompanyName("The Coca-Cola Company")).toBe("COCA-COLA");
    expect(normalizeCompanyName("Siemens Energy AG/ADR")).toBe("SIEMENS ENERGY");
    expect(normalizeCompanyName("United Airlines Holdings, Inc.")).toBe("UNITED AIRLINES");
    expect(normalizeCompanyName("CNH Industrial N.V.")).toBe("CNH INDUSTRIAL");
  });

  it("counts a company word only after a name", () => {
    expect(hasCompanyWord("Zekelman Industries, Inc.")).toBe(true);
    expect(hasCompanyWord("Company")).toBe(false);
    expect(hasCompanyWord("American Airlines")).toBe(false);
  });
});
