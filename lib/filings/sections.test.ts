import { describe, expect, it } from "vitest";

import { extractFilingSections, filingToPlainText, filingToText, layoutOf, sectionLabel } from "./sections";

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

  /**
   * Netflix's report for the quarter to 30 June 2026, in miniature. Read with
   * the annual numbering, only Item 1A matched, and its Risk factors tab ran
   * from a one-sentence section through the buyback table and the exhibits.
   * The contents entry for Item 1 is Atkore's shape: statements listed under it
   * before any page number, which the one-line test could not see.
   */
  const quarterly = `
    <div>FORM 10-Q</div>
    <div>PART I. FINANCIAL INFORMATION</div>
    <div>Item 1. Financial Statements (Unaudited)</div><div>2</div>
    <div>Condensed Consolidated Statements of Operations</div><div>2</div>
    <div>Notes to Condensed Consolidated Financial Statements</div><div>9</div>
    <div>Item 2. Management's Discussion and Analysis</div><div>32</div>
    <div>Item 3. Quantitative and Qualitative Disclosures about Market Risk</div><div>44</div>
    <div>Item 4. Controls and Procedures</div><div>44</div>
    <div>PART II. OTHER INFORMATION</div>
    <div>Item 1. Legal Proceedings</div><div>46</div>
    <div>Item 1A. Risk Factors</div><div>46</div>
    <div>Item 2. Unregistered Sales of Equity Securities and Use of Proceeds</div><div>46</div>
    <div>Item 6. Exhibits</div><div>49</div>
    <div>PART I. FINANCIAL INFORMATION</div>
    <div>Item 1. Financial Statements</div><p>${body("fin", 300)}</p>
    <div>Item 2. Management's Discussion and Analysis of Financial Condition</div><p>${body("mdna", 300)}</p>
    <div>Item 3. Quantitative and Qualitative Disclosures About Market Risk</div><p>${body("mrisk", 40)}</p>
    <div>Item 4. Controls and Procedures</div><p>${body("controls", 40)}</p>
    <div>PART II. OTHER INFORMATION</div>
    <div>Item 1. Legal Proceedings</div><p>${body("legal", 30)}</p>
    <div>Item 1A. Risk Factors</div><p>There have been no material changes from the risk factors previously disclosed under the heading "Risk Factors" in Part I, Item 1A.</p>
    <div>Item 2. Unregistered Sales of Equity Securities and Use of Proceeds</div><p>${body("buyback", 60)}</p>
    <div>Item 5. Other Information</div><p>${body("other", 30)}</p>
    <div>Item 6. Exhibits</div><p>${body("exhibits", 30)}</p>
  `;

  it("reads a quarterly report by its own Item numbers", () => {
    const r = extractFilingSections(quarterly, "10-Q");

    expect(r.sections.map((s) => s.id)).toEqual(["financials", "mdna", "market-risk", "legal", "risk-factors", "market"]);
    expect(r.missing).toEqual([]);
    // Part I's Item 1 and Part II's Item 1 are told apart by their titles.
    expect(r.sections[0].text).toContain("fin-body-0");
    expect(r.sections[3].text.startsWith("Item 1. Legal Proceedings")).toBe(true);
    expect(r.sections[5].label).toBe("Buybacks");
    expect(r.sections[5].text).toContain("buyback-body-0");
  });

  it("does not take a quarterly contents entry that lists statements for the heading", () => {
    const financials = extractFilingSections(quarterly, "10-Q").sections[0];

    expect(financials.text.startsWith("Item 1. Financial Statements\n")).toBe(true);
    expect(financials.text).not.toContain("Notes to Condensed Consolidated Financial Statements");
  });

  it("ends a section at the next Item, including one the reader does not show", () => {
    const r = extractFilingSections(quarterly, "10-Q");
    const risk = r.sections.find((s) => s.id === "risk-factors");
    const buybacks = r.sections.find((s) => s.id === "market");
    const marketRisk = r.sections.find((s) => s.id === "market-risk");

    expect(risk?.text).toContain("no material changes");
    expect(risk?.text).not.toContain("Unregistered Sales");
    expect(buybacks?.text).not.toContain("other-body-0");
    expect(buybacks?.text).not.toContain("exhibits-body-0");
    expect(marketRisk?.text).not.toContain("controls-body-0");
  });

  it("tells a quarterly report from an annual one by the document when no form is given", () => {
    const tagged = `<ix:nonNumeric name="dei:DocumentType" contextRef="c-1"><span>10-Q</span></ix:nonNumeric>${quarterly}`;

    expect(layoutOf(tagged)).toBe("quarterly");
    expect(layoutOf(quarterly)).toBe("quarterly");
    expect(layoutOf(mixedCaseFiling)).toBe("annual");
    expect(layoutOf(quarterly, "10-K")).toBe("annual");
    expect(extractFilingSections(quarterly).sections).toHaveLength(6);
  });

  it("names a kept passage's section as its own report names it", () => {
    expect(sectionLabel("market", "10-Q")).toBe("Buybacks");
    expect(sectionLabel("market", "10-K")).toBe("Market for the shares");
    expect(sectionLabel("market")).toBe("Market for the shares");
  });

  /** An annual report with the Items between the ones OPS reads, as every real one has. */
  const annualWithEveryItem = `
    <div>ANNUAL REPORT</div>
    <div>Item 1. Business</div><p>${body("business", 100)}</p>
    <p>Refer to "Item 1A. Risk Factors - Risks Related to Our Industry" for more.</p>
    <p>${body("business-tail", 40)}</p>
    <div>Item 1A. Risk Factors</div><p>${body("risk", 200)}</p>
    <div>Item 1B. Unresolved Staff Comments</div><p>None.</p>
    <div>Item 1C. Cybersecurity</div><p>${body("cyber", 60)}</p>
    <div>Item 2. Properties</div><p>${body("properties", 40)}</p>
    <div>Item 3. Legal Proceedings</div><p>${body("legal", 40)}</p>
    <div>Item 4. Mine Safety Disclosures</div><p>Not applicable.</p>
    <div>Item 5. Market for Registrant's Common Equity</div><p>${body("market", 60)}</p>
    <div>Item 6. [Reserved]</div>
    <div>Item 7. Management's Discussion and Analysis</div><p>${body("mdna", 200)}</p>
    <div>Item 7A. Quantitative and Qualitative Disclosures</div><p>${body("mrisk", 50)}</p>
    <div>Item 8. Financial Statements and Supplementary Data</div><p>${body("fin", 300)}</p>
    <div>Item 9. Changes in and Disagreements with Accountants</div><p>None.</p>
    <div>Item 9A. Controls and Procedures</div><p>${body("controls", 80)}</p>
    <div>Item 15. Exhibits and Financial Statement Schedules</div><p>${body("exhibits", 40)}</p>
  `;

  it("ends an annual section at an Item the reader does not show", () => {
    const r = extractFilingSections(annualWithEveryItem);
    const text = (id: string) => r.sections.find((s) => s.id === id)?.text ?? "";

    expect(text("risk-factors")).toContain("risk-body-0");
    expect(text("risk-factors")).not.toContain("cyber-body-0");
    expect(text("risk-factors")).not.toContain("properties-body-0");
    expect(text("legal")).not.toContain("Not applicable");
    expect(text("market")).not.toContain("[Reserved]");
    expect(text("financials")).not.toContain("controls-body-0");
    expect(text("financials")).not.toContain("exhibits-body-0");
  });

  it("does not start a section at a cross-reference whose quotation mark comes first", () => {
    const r = extractFilingSections(annualWithEveryItem);
    const business = r.sections.find((s) => s.id === "business");
    const risk = r.sections.find((s) => s.id === "risk-factors");

    expect(risk?.text.startsWith("Item 1A. Risk Factors\n")).toBe(true);
    expect(business?.text).toContain("business-tail-body-0");
  });

  it("reads the statements from Item 15 when Item 8 only points to them", () => {
    const pointer = annualWithEveryItem.replace(
      `<p>${body("fin", 300)}</p>`,
      "<p>The information required by this Item is set forth in our Consolidated Financial Statements and Notes thereto included in this Annual Report on Form 10-K.</p>",
    ) + `<div>Consolidated Balance Sheets</div><p>${body("statements", 200)}</p>`;
    const financials = extractFilingSections(pointer).sections.find((s) => s.id === "financials");

    expect(financials?.text.startsWith("Item 15. Exhibits")).toBe(true);
    expect(financials?.text).toContain("statements-body-0");
    // A full Item 8 stays where it is.
    const full = extractFilingSections(annualWithEveryItem).sections.find((s) => s.id === "financials");
    expect(full?.text.startsWith("Item 8. Financial Statements")).toBe(true);
  });

  describe("a sentence the printed page broke in two", () => {
    const long = "The principal raw material used by our business is sweeteners, and suppliers deliver them to produce finished";

    it("is put back together, with the page number between becoming spaces so no offset moves", () => {
      const html = `<p>${long}</p><p>26</p><p>Table of Contents</p><p>beverages. The finished beverages are packaged.</p>`;
      const { text } = filingToText(html);
      const plainLines = text.split("\n").map((line) => line.trim()).filter(Boolean);
      expect(plainLines).toHaveLength(1);
      expect(plainLines[0].replace(/\s+/g, " ")).toBe(`${long} beverages. The finished beverages are packaged.`);
      // Same length as the text before joining: line breaks and furniture became spaces.
      const unjoined = filingToText(`<p>${long}.</p><p>26</p><p>Table of Contents</p><p>beverages. The finished beverages are packaged.</p>`).text;
      expect(text.length).toBe(unjoined.length - 1);
    });

    it("leaves a heading above a paragraph that starts in lower case", () => {
      const { text } = filingToText("<p>iPhone</p><p>iPhone net sales increased during 2025 compared to 2024.</p>");
      expect(text.split("\n").map((line) => line.trim())).toEqual(["iPhone", "iPhone net sales increased during 2025 compared to 2024."]);
    });

    it("leaves a finished sentence and a table row alone", () => {
      const finished = filingToText(`<p>${long}.</p><p>beverages are next.</p>`).text;
      expect(finished.split("\n")).toHaveLength(2);
    });
  });

  it("still finds upper-case headings when the report holds a letter whose lower case is longer", () => {
    // Coca-Cola's annual report names Coca-Cola İçecek. "İ" lower-cases to two
    // characters, and matching fell back to case-sensitive, finding nothing.
    const withDotted = upperCaseFiling.replace("apply.", "apply. Coca-Cola &#304;çecek is a bottler.");
    const r = extractFilingSections(withDotted);
    expect(r.sections).toHaveLength(7);
    expect(r.sections[0].text).toContain("Coca-Cola İçecek");
  });

  describe("layouts measured across 38 companies on 2026-09-16", () => {
    const annual = (headings: string[], extra = "") => `<div>FORM 10-K</div>${headings
      .map((heading, i) => `<div>${heading}</div><p>${body(`s${i}`, 60)}</p>`)
      .join("")}${extra}`;

    it("reads Item numbers followed by a dash, a spaced dash or a colon", () => {
      for (const separator of ["-", " - ", ": "]) {
        const r = extractFilingSections(annual([`Item 1${separator}Business`, `Item 1A${separator}Risk Factors`, `Item 7${separator}Management's Discussion`]));
        expect(r.sections.map((s) => s.id), separator).toEqual(["business", "risk-factors", "mdna"]);
      }
    });

    it("finds a heading whose words the markup split, as Microsoft's are", () => {
      const r = extractFilingSections(annual(["ITEM 1. B USINESS", "ITEM 1A. RIS K FACTORS"]));
      expect(r.sections.map((s) => s.id)).toEqual(["business", "risk-factors"]);
    });

    it("does not end a section at a bare Item printed at the top of a page", () => {
      // The paragraph before the page top ends its sentence, so nothing but this rule decides.
      const html = `<div>FORM 10-K</div><div>ITEM 7. MANAGEMENT'S DISCUSSION</div><p>${body("mdna", 60)}.</p><div>Item 7</div><p>${body("page2", 60)}</p><div>ITEM 7A. QUANTITATIVE AND QUALITATIVE DISCLOSURES</div><p>${body("mrisk", 30)}</p>`;
      const mdna = extractFilingSections(html).sections.find((s) => s.id === "mdna")!;
      expect(mdna.text).toContain("page2-body-0");
    });

    it("keeps a section running past the Part and Item printed at the top of every page", () => {
      const pages = Array.from({ length: 6 }, (_, i) => `<div>PART I</div><div>ITEM 1. BUSINESS</div><p>${body(`page${i}`, 40)}</p>`).join("");
      const html = `<div>FORM 10-K</div><div>Item 1. Business</div>${pages}<div>Item 1A. Risk factors</div><p>${body("risk", 40)}</p>`;
      const business = extractFilingSections(html).sections.find((s) => s.id === "business")!;
      expect(business.text).toContain("page5-body-0");
    });

    it("takes a company name repeated at the top of every page out of the reading", () => {
      const pages = Array.from({ length: 5 }, (_, i) => `<div>Alphabet Inc.</div><p>${body(`p${i}`, 20)}</p>`).join("");
      const { text } = filingToText(pages);
      expect(text).not.toContain("Alphabet Inc.");
      // Its characters became spaces: the same text with a different, unrepeated line in each place is as long.
      const varied = Array.from({ length: 5 }, (_, i) => `<div>Header line ${i}</div><p>${body(`p${i}`, 20)}</p>`).join("");
      expect(text.length).toBe(filingToText(varied).text.length);
      expect(text.indexOf("p4-body-0")).toBe(filingToText(varied).text.indexOf("p4-body-0"));
      // Four times is not a running header.
      expect(filingToText(pages.replace(/<div>Alphabet Inc\.<\/div>/, "")).text).toContain("Alphabet Inc.");
    });

    it("skips a heading with nothing under it, and an index entry that gives page ranges", () => {
      const index = `<div>Item 1. Business</div><div>Item 1A. Risk factors</div><div>Item 7. Management's Discussion and Analysis 8-23</div><div>Item 8. Financial Statements and Supplementary Data Pages 36 - 73</div>`;
      const r = extractFilingSections(`<div>FORM 10-K</div>${index}<div>Item 9. Changes</div><p>${body("nine", 20)}</p>`);
      expect(r.sections).toEqual([]);
    });

    it("does not mistake a section full of figures for a contents list", () => {
      const html = `<div>FORM 10-Q</div><div>Item 2. Unregistered Sales of Equity Securities</div><div>Total 33,460,252</div><div>April 16,922,312</div><div>Item 5. Other Information</div><p>None.</p>`;
      expect(extractFilingSections(html, "10-Q").sections.map((s) => s.id)).toEqual(["market"]);
    });

    it("keeps each row of a table that is not drawn as one on a single line", () => {
      const { text } = filingToText(`<p>Sales growth:</p><table><tr><td><div>$</div></td><td><div>11.1</div></td><td><div>(2.2)</div></td></tr></table>`);
      expect(text.split("\n").map((line) => line.trim()).filter(Boolean)).toEqual(["Sales growth:", "$11.1 (2.2)"]);
    });
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
