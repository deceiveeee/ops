import { describe, expect, it } from "vitest";

import { extractFilingSections, filingToPlainText } from "./sections";

/**
 * Fixtures reproduce the three filing shapes found on real documents, rather
 * than one idealised one. Every assertion below failed against an earlier
 * version of the extractor, and each corresponds to a defect a real filer
 * exposed:
 *
 * - Netflix, Apple and NVIDIA write mixed-case headings after a contents list.
 * - Coca-Cola writes UPPERCASE headings, and reserves mixed case for the
 *   contents and for quoted cross-references mid-sentence. Matching
 *   case-sensitively found three of its seven sections and mis-sliced one.
 * - Coca-Cola also writes `Item 3. Legal Proceedings" of this report` inside a
 *   paragraph. A guard that measured only the first fourteen characters of the
 *   title let that through as a heading worth 81,000 characters.
 *
 * Real filings run to megabytes and are not committed; these keep the same
 * structure at a size a test can hold.
 */

const body = (label: string, words: number) =>
  Array.from({ length: words }, (_, i) => `${label}-body-${i}`).join(" ");

/** A contents list: every marker within a few hundred characters. */
const contents = [
  "Item 1. Business 2",
  "Item 1A. Risk Factors 12",
  "Item 3. Legal Proceedings 20",
  "Item 5. Market for Registrant's Common Equity 22",
  "Item 7. Management's Discussion and Analysis 24",
  "Item 7A. Quantitative and Qualitative Disclosures 40",
  "Item 8. Financial Statements and Supplementary Data 42",
].join("\n");

const mixedCaseFiling = `
<div>ANNUAL REPORT</div>
<div>${contents}</div>
<div>Item 1. Business</div><p>${body("business", 200)}</p>
<div>Item 1A. Risk Factors</div><p>${body("risk", 400)}</p>
<div>Item 3. Legal Proceedings</div><p>${body("legal", 40)}</p>
<div>Item 5. Market for Registrant's Common Equity</div><p>${body("market", 60)}</p>
<div>Item 7. Management's Discussion and Analysis</div><p>${body("mdna", 300)}</p>
<div>Item 7A. Quantitative and Qualitative Disclosures</div><p>${body("mrisk", 50)}</p>
<div>Item 8. Financial Statements and Supplementary Data</div><p>${body("fin", 500)}</p>
`;

const upperCaseFiling = `
<div>ANNUAL REPORT</div>
<div>${contents}</div>
<div>ITEM 1. BUSINESS</div><p>In this report, the terms "The Company" apply. ${body("business", 200)}</p>
<div>ITEM 1A. RISK FACTORS</div><p>${body("risk", 400)}</p>
<p>See "Item 1. Business" of this report for background on the segments.</p>
<div>ITEM 3. LEGAL PROCEEDINGS</div><p>${body("legal", 40)}</p>
<p>Refer to "Item 3. Legal Proceedings" of this report for the pending matters.</p>
<div>ITEM 5. MARKET FOR REGISTRANT'S COMMON EQUITY</div><p>${body("market", 60)}</p>
<div>ITEM 7. MANAGEMENT'S DISCUSSION AND ANALYSIS</div><p>${body("mdna", 300)}</p>
<div>ITEM 7A. QUANTITATIVE AND QUALITATIVE DISCLOSURES</div><p>${body("mrisk", 50)}</p>
<div>ITEM 8. FINANCIAL STATEMENTS AND SUPPLEMENTARY DATA</div><p>${body("fin", 500)}</p>
`;

const labels = (html: string) =>
  extractFilingSections(html).sections.map((s) => s.id);

describe("filing section extraction", () => {
  it("reads a mixed-case filing without mistaking the contents for the body", () => {
    const r = extractFilingSections(mixedCaseFiling);

    expect(labels(mixedCaseFiling)).toEqual([
      "business",
      "risk-factors",
      "legal",
      "market",
      "mdna",
      "market-risk",
      "financials",
    ]);
    expect(r.missing).toEqual([]);
    // The contents entry sits before the body, so a section that started there
    // would carry the whole document.
    expect(r.sections[0].text).toContain("business-body-0");
    expect(r.sections[0].text).not.toContain("Item 1A. Risk Factors 12");
  });

  it("reads an upper-case filing, which case-sensitive matching could not", () => {
    const r = extractFilingSections(upperCaseFiling);

    expect(r.sections).toHaveLength(7);
    expect(r.missing).toEqual([]);
    expect(r.sections[0].text).toContain("business-body-0");
  });

  it("does not treat a quoted cross-reference as the start of a section", () => {
    const r = extractFilingSections(upperCaseFiling);
    const legal = r.sections.find((s) => s.id === "legal");

    // The real heading, not the `"Item 3. Legal Proceedings" of this report`
    // sentence that appears after it.
    expect(legal?.text).toContain("legal-body-0");
    expect(legal?.text.startsWith("ITEM 3. LEGAL PROCEEDINGS")).toBe(true);
  });

  it("keeps sections in document order and does not overlap them", () => {
    const r = extractFilingSections(upperCaseFiling);

    for (let i = 1; i < r.sections.length; i++) {
      expect(r.sections[i].at).toBeGreaterThan(r.sections[i - 1].at);
    }
    const mdna = r.sections.find((s) => s.id === "mdna");
    expect(mdna?.text).not.toContain("fin-body-0");
  });

  it("reports what it could not find rather than guessing", () => {
    const partial = `
      <div>Item 1. Business</div><p>${body("business", 50)}</p>
      <div>Item 8. Financial Statements and Supplementary Data</div><p>${body("fin", 50)}</p>
    `;
    const r = extractFilingSections(partial);

    expect(r.sections.map((s) => s.id)).toEqual(["business", "financials"]);
    expect(r.missing.map((m) => m.id)).toEqual([
      "risk-factors",
      "legal",
      "market",
      "mdna",
      "market-risk",
    ]);
  });

  /**
   * The shape that broke this module after the fixtures above were green.
   *
   * A real contents block collapses onto one line - "Item 1. Business 1 Item 1A.
   * Risk Factors 4 ..." - because the markup between entries is stripped. An
   * earlier rule read only up to the next newline, never saw a bare page number,
   * and accepted every contents entry as a heading. Netflix's Item 8 then ran
   * from the contents to the end of the document at 272,000 characters while the
   * six sections above it collapsed to nothing, and all six tests still passed.
   */
  it("recognises a contents block that sits on a single line", () => {
    const oneLine =
      "Item 1. Business 1 Item 1A. Risk Factors 4 Item 3. Legal Proceedings 17 " +
      "Item 5. Market for Registrant's Common Equity 22 " +
      "Item 7. Management's Discussion and Analysis 24 " +
      "Item 7A. Quantitative and Qualitative Disclosures 40 " +
      "Item 8. Financial Statements and Supplementary Data 42";

    const filing = `
      <div>ANNUAL REPORT</div><div>${oneLine}</div>
      <div>Item 1. Business</div><p>${body("business", 120)}</p>
      <div>Item 1A. Risk Factors</div><p>${body("risk", 120)}</p>
      <div>Item 3. Legal Proceedings</div><p>${body("legal", 30)}</p>
      <div>Item 5. Market for Registrant's Common Equity</div><p>${body("market", 30)}</p>
      <div>Item 7. Management's Discussion and Analysis</div><p>${body("mdna", 120)}</p>
      <div>Item 7A. Quantitative and Qualitative Disclosures</div><p>${body("mrisk", 30)}</p>
      <div>Item 8. Financial Statements and Supplementary Data</div><p>${body("fin", 120)}</p>
    `;

    const r = extractFilingSections(filing);

    expect(r.sections).toHaveLength(7);
    expect(r.missing).toEqual([]);
    // Each section holds its own body and stops at the next heading.
    expect(r.sections[0].text).toContain("business-body-0");
    expect(r.sections[0].text).not.toContain("risk-body-0");
    // The last section must not stretch back to the contents.
    const financials = r.sections[6];
    expect(financials.text).toContain("fin-body-0");
    expect(financials.text).not.toContain("business-body-0");
  });

  it("strips markup and entities without gluing words together", () => {
    const text = filingToPlainText(
      "<p>Revenue&nbsp;grew</p><p>9.8%&#8212;a slowdown</p><div>See&amp;compare</div>",
    );

    expect(text).toContain("Revenue grew");
    expect(text).toContain("9.8%-a slowdown");
    expect(text).toContain("See&compare");
    expect(text).not.toContain("<p>");
  });
});
