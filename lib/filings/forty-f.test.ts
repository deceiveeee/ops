import { describe, expect, it } from "vitest";
import { parseFilingParts } from "./edgar";
import { extractFortyFSections, isFortyF } from "./sections";

/**
 * A Canadian company's annual report on Form 40-F, in miniature: a cover
 * document, an annual information form headed as Canada's rules set it out,
 * management's discussion, and the statements, as Shopify, Suncor and Royal
 * Bank file them.
 */

const words = (label: string, count: number) => Array.from({ length: count }, (_, i) => `${label}-body-${i}`).join(" ");

const cover = `<div>UNITED STATES SECURITIES AND EXCHANGE COMMISSION</div><div>FORM 40-F</div><p>${words("cover", 60)}</p>`;
const aif = `
  <div>EX-99.1</div><div>aif.htm</div>
  <div>ANNUAL</div><div>INFORMATION</div><div>FORM</div><div>March 1, 2026</div>
  <div>CORPORATE STRUCTURE 1</div><div>DESCRIPTION OF THE BUSINESS 3</div><div>RISK FACTORS 9</div><div>MARKET FOR SECURITIES 20</div><div>LEGAL PROCEEDINGS AND REGULATORY ACTIONS 25</div>
  <div><b>CORPORATE STRUCTURE</b></div><p>${words("structure", 40)}</p>
  <div><b>DESCRIPTION OF THE BUSINESS</b></div><p>${words("business", 80)}</p>
  <div><b>Oil Sands</b></div><p>${words("oilsands", 40)}</p>
  <div><b>Narrative Description of the Business</b></div><p>${words("narrative", 40)}</p>
  <div><b>RISK FACTORS</b></div><p>${words("risk", 80)}</p>
  <p><b>Our business could be harmed if we fail to manage our growth effectively.</b></p><p>${words("growth", 40)}</p>
  <p><b>Dividends may be reduced if our results decline.</b></p><p>${words("payout", 40)}</p>
  <div><b>DIVIDENDS</b></div><p>${words("dividends", 20)}</p>
  <div><b>MARKET FOR SECURITIES</b></div><p>${words("market", 30)}</p>
  <div><b>DIRECTORS AND OFFICERS</b></div><p>${words("directors", 30)}</p>
  <div><b>LEGAL PROCEEDINGS AND REGULATORY ACTIONS</b></div><p>${words("legal", 20)}</p>
  <div><b>MATERIAL CONTRACTS</b></div><p>${words("contracts", 20)}</p>`;
const mdna = `<div>EX-99.3</div><div><b>MANAGEMENT'S DISCUSSION AND ANALYSIS</b></div><p>${words("mdna", 120)}</p>
  <div><b>FINANCIAL INSTRUMENTS AND RISK MANAGEMENT</b></div><p>${words("rates", 40)}</p><div><b>OUTLOOK</b></div><p>${words("outlook", 30)}</p>`;
const statements = `<div>EX-99.2</div><div>Management's Statement of Responsibility for Financial Reporting</div><p>${words("statements", 120)}</p>`;

describe("a Canadian company's annual report on Form 40-F", () => {
  it("is known by its form, or by what its cover says", () => {
    expect(isFortyF(cover)).toBe(true);
    expect(isFortyF("<div>FORM 10-K</div>")).toBe(false);
    expect(isFortyF("<div>anything</div>", "40-F")).toBe(true);
  });

  it("reads each section from the documents filed, in the annual report's order, whatever order they come in", () => {
    // Shopify files the statements before the discussion.
    const result = extractFortyFSections([cover, aif, statements, mdna]);
    expect(result.sections.map((section) => section.id)).toEqual(["business", "risk-factors", "legal", "market", "mdna", "market-risk", "financials"]);
    const text = (id: string) => result.sections.find((section) => section.id === id)!.text;
    // Business runs past its own sub-headings to the form's next heading.
    expect(text("business")).toMatch(/^DESCRIPTION OF THE BUSINESS/);
    expect(text("business")).toContain("oilsands-body-0");
    // A heading of the section's own kind inside it does not end it.
    expect(text("business")).toContain("narrative-body-39");
    expect(text("business")).not.toContain("RISK FACTORS");
    // A risk set in bold is a sentence, not one of the form's headings, though
    // it begins "Our business" or "Dividends".
    expect(text("risk-factors")).toContain("growth-body-39");
    expect(text("risk-factors")).toContain("payout-body-39");
    expect(text("risk-factors")).not.toContain("dividends-body-0");
    expect(text("market")).not.toContain("directors-body-0");
    expect(text("legal")).not.toContain("contracts-body-0");
    expect(text("mdna")).toMatch(/^MANAGEMENT'S DISCUSSION AND ANALYSIS/);
    expect(text("market-risk")).toMatch(/^FINANCIAL INSTRUMENTS AND RISK MANAGEMENT/);
    expect(text("market-risk")).not.toContain("outlook-body-0");
    expect(text("financials")).toMatch(/^Management's Statement of Responsibility/);
  });

  it("does not draw the lines EDGAR puts at the top of an exhibit", () => {
    const result = extractFortyFSections([cover, aif, statements, mdna]);
    const shown = result.document.blocks.filter((block) => block.kind === "text" && !block.furniture).map((block) => block.text);
    for (const line of ["EX-99.1", "EX-99.3", "aif.htm"]) expect(shown).not.toContain(line);
  });

  it("says what it could not find, from a cover document read alone", () => {
    const result = extractFortyFSections([cover]);
    expect(result.sections).toEqual([]);
    expect(result.missing.map((section) => section.id)).toContain("business");
  });
});

describe("a filing's index page", () => {
  it("names each document and its type", () => {
    const html = `<table class="tableFile" summary="Document Format Files">
      <tr><th>Seq</th><th>Description</th><th>Document</th><th>Type</th><th>Size</th></tr>
      <tr><td>1</td><td>40-F</td><td><a href="/Archives/edgar/data/1/000000000026000001/cover.htm">cover.htm</a> &nbsp;&nbsp;iXBRL</td><td>40-F</td><td>392476</td></tr>
      <tr><td>2</td><td>ANNUAL INFORMATION FORM</td><td><a href="/Archives/edgar/data/1/000000000026000001/aif.htm">aif.htm</a></td><td>EX-99.1</td><td>2883490</td></tr>
      <tr><td>3</td><td>GRAPHIC</td><td><a href="/Archives/edgar/data/1/000000000026000001/logo.jpg">logo.jpg</a></td><td>GRAPHIC</td><td>1200</td></tr>
    </table>`;
    expect(parseFilingParts(html)).toEqual([
      { document: "cover.htm", type: "40-F", description: "40-F", size: 392476 },
      { document: "aif.htm", type: "EX-99.1", description: "ANNUAL INFORMATION FORM", size: 2883490 },
    ]);
  });
});
