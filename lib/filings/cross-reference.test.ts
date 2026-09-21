import { describe, expect, it } from "vitest";
import { readIndex } from "./cross-reference";
import { readDocument } from "./document";
import { extractFilingSections } from "./sections";

/**
 * Reports laid out by a cross-reference index, in miniature: GE's (sections
 * headed in the company's own words, the Items given as page ranges at the
 * back), McDonald's (only the page each Item starts on), Netflix's quarterly
 * report (statements with no Item heading, found through its contents) and
 * Intel's quarterly report (five Items on one page).
 */

/** A paragraph long enough that a page of two is a page's length. */
const paragraph = (label: string) =>
  `<p>${Array.from({ length: 9 }, (_, i) => `${label} sentence ${i} runs on for a while, as a filing's sentences do.`).join(" ")}</p>`;
/** A printed page: its content, then its footer. */
const page = (number: number, body: string, footer = (n: number) => `${n} 2025 FORM 10-K`) => `${body}<p>${footer(number)}</p>`;
const text = (id: string, html: string, form?: string) => extractFilingSections(html, form).sections.find((section) => section.id === id)?.text ?? null;

describe("printed page numbers", () => {
  it("are found as a run of footers, kept in the text and never drawn", () => {
    const html = `<p>Non-Cumulative Preferred Stock, Series 1</p><p>Non-Cumulative Preferred Stock, Series 2</p>${[1, 2, 3, 4, 5, 6]
      .map((n) => page(n, `${paragraph(`p${n}a`)}${n === 3 ? "<p>1 See the notes for more.</p>" : ""}${paragraph(`p${n}b`)}`, (m) => (m % 2 ? `${m} Acme Corporation` : `Acme Corporation ${m}`)))
      .join("")}`;
    const document = readDocument(html);
    expect(document.pages.map(({ number, block }) => [number, document.blocks[block].text])).toEqual([
      [1, "1 Acme Corporation"], [2, "Acme Corporation 2"], [3, "3 Acme Corporation"],
      [4, "Acme Corporation 4"], [5, "5 Acme Corporation"], [6, "Acme Corporation 6"],
    ]);
    const shown = document.blocks.filter((block) => block.kind === "text" && !block.furniture).map((block) => block.text);
    // A cover's list and a footnote that begins with a number are not footers.
    expect(shown).toContain("Non-Cumulative Preferred Stock, Series 1");
    expect(shown).toContain("1 See the notes for more.");
    expect(shown.some((line) => /Acme Corporation/.test(line))).toBe(false);
  });

  it("are not a list of numbered lines, even spaced out like short pages", () => {
    const notes = Array.from({ length: 12 }, (_, i) => `<p>Note ${i + 1}</p><p>A short note of two hundred characters or so, which says what the note covers and where it is, much as an index of notes does in a report.</p>`).join("");
    expect(readDocument(`${paragraph("intro")}${notes}${paragraph("end")}`).pages).toEqual([]);
  });

  it("take no cover lines for the first pages when a page's own footer is missing", () => {
    // Bank of America's cover lists its preferred stock by series, a line apart;
    // its page 2 footer was not found, and the two cover lines made pages 1 and 2.
    // Farther apart than any page could be short (150 characters), but close
    // for pages of this length: a twelfth of a typical page is the test.
    const html = `<p>Non-Cumulative Preferred Stock, Series 1</p><p>${"Depositary shares, each representing a fraction of a share. ".repeat(2)}</p><p>Non-Cumulative Preferred Stock, Series 2</p>${[1, 2, 3, 4, 5, 6]
      .map((n) => `${paragraph(`p${n}a`)}${paragraph(`p${n}b`)}${paragraph(`p${n}c`)}${paragraph(`p${n}d`)}${n === 2 ? "" : `<p>Acme Corporation ${n}</p>`}`)
      .join("")}`;
    const document = readDocument(html);
    expect(document.pages.map(({ number }) => number)).toEqual([1, 3, 4, 5, 6]);
    expect(document.blocks.filter((block) => block.kind === "text" && !block.furniture).map((block) => block.text)).toContain("Non-Cumulative Preferred Stock, Series 2");
  });

  it("take no footnote for a footer that is missing", () => {
    // Page 5 has no footer, and a footnote there begins with a 5.
    const html = [1, 2, 3, 4, 5, 6]
      .map((n) => `${paragraph(`p${n}a`)}${n === 5 ? "<p>5 Revenue includes amounts from licensing.</p>" : ""}${paragraph(`p${n}b`)}${n === 5 ? "" : `<p>${n}</p>`}`)
      .join("");
    const document = readDocument(html);
    expect(document.pages.map(({ number }) => number)).toEqual([1, 2, 3, 4, 6]);
    expect(document.blocks.find((block) => block.text.startsWith("5 Revenue"))).toMatchObject({ furniture: false, page: null });
  });

  it("let a sentence broken by a footer that names the company be put back together", () => {
    const long = "The principal raw material used by our business is sweeteners, and suppliers deliver them to produce finished";
    const html = [1, 2, 3, 4, 5].map((n) => page(n, n === 3 ? `${paragraph("a")}<p>${long}</p>` : n === 4 ? `<p>beverages for our bottlers.</p>${paragraph("b")}` : `${paragraph(`x${n}`)}${paragraph(`y${n}`)}`, (m) => `Acme Corporation ${m}`)).join("");
    const shown = readDocument(html).blocks.filter((block) => block.kind === "text" && !block.furniture).map((block) => block.text);
    expect(shown).toContain(`${long} beverages for our bottlers.`);
  });
});

/** GE's shape: its own headings, the Items only in the index at the back. */
const geShaped = [
  page(2, `${paragraph("forward-looking")}${paragraph("about-this-report")}`),
  page(3, `<p>ABOUT ACME. Acme makes engines for aircraft and services them.</p>${paragraph("business-one")}`),
  page(4, `${paragraph("business-two")}<p>PROPERTIES. Our plants are in Ohio.</p>${paragraph("business-three")}`),
  page(5, `<p>RISK FACTORS. The following discussion of the material factors, events and uncertainties.</p>${paragraph("risk-one")}`),
  page(6, `${paragraph("risk-two")}${paragraph("risk-three")}<p>LEGAL PROCEEDINGS. Refer to Legal Matters in the notes.</p>`),
  page(7, `<p>MANAGEMENT'S DISCUSSION AND ANALYSIS OF FINANCIAL CONDITION AND RESULTS OF OPERATIONS (MD&A).</p>${paragraph("mdna-one")}`),
  page(8, `${paragraph("mdna-two")}<p>Foreign exchange and interest rates affect us as described here.</p>${paragraph("mdna-three")}`),
  page(9, `<p>STATEMENT OF EARNINGS</p>${paragraph("statements-one")}`),
  page(10, `${paragraph("statements-two")}<p>LEGAL MATTERS. We are party to claims.</p>${paragraph("notes-one")}`),
  `<p>FORM 10-K CROSS REFERENCE INDEX</p>`,
  `<p>Item 1. Business 3-4</p><p>Item 1A. Risk Factors 5-6</p><p>Item 2. Properties 4</p><p>Item 3. Legal Proceedings 10</p>`,
  `<p>Item 7. Management's Discussion and Analysis of Financial Condition and Results of Operations 7-8</p>`,
  `<p>Item 7A. Quantitative and Qualitative Disclosures About Market Risk 8</p><p>Item 8. Financial Statements and Supplementary Data 9-10</p>`,
].join("");

describe("a report laid out by a cross-reference index", () => {
  it("reads the index: Items, their titles, and their pages", () => {
    const entries = readIndex(readDocument(geShaped).text);
    expect(entries.map((entry) => [entry.item, entry.title, entry.ranges])).toEqual([
      ["1", "Business", [[3, 4]]],
      ["1a", "Risk Factors", [[5, 6]]],
      ["2", "Properties", [[4, 4]]],
      ["3", "Legal Proceedings", [[10, 10]]],
      ["7", "Management's Discussion and Analysis of Financial Condition and Results of Operations", [[7, 8]]],
      ["7a", "Quantitative and Qualitative Disclosures About Market Risk", [[8, 8]]],
      ["8", "Financial Statements and Supplementary Data", [[9, 10]]],
    ]);
  });

  it("does not take a lone Item heading followed by a number for an index", () => {
    const html = `<div>Item 2. Properties</div><p>Chicago 12</p>${paragraph("properties")}<div>Item 3. Legal Proceedings</div>${paragraph("legal")}`;
    expect(readIndex(readDocument(html).text)).toEqual([]);
  });

  it("finds each section on the pages the index gives, from its own heading", () => {
    const result = extractFilingSections(geShaped);
    expect(result.sections.map((section) => section.id)).toEqual(["business", "risk-factors", "legal", "mdna", "financials"]);
    expect(text("business", geShaped)).toMatch(/^ABOUT ACME\./);
    expect(text("business", geShaped)).toContain("business-three sentence 8");
    expect(text("risk-factors", geShaped)).toMatch(/^RISK FACTORS\./);
    expect(text("mdna", geShaped)).toMatch(/^MANAGEMENT'S DISCUSSION/);
    expect(text("financials", geShaped)).toMatch(/^STATEMENT OF EARNINGS/);
    // A legal section in the notes starts at its note's own heading.
    expect(text("legal", geShaped)).toMatch(/^LEGAL MATTERS\./);
    // And the statements keep that note, on their last page, as their own.
    expect(text("financials", geShaped)).toContain("LEGAL MATTERS. We are party to claims.");
    expect(text("financials", geShaped)).toContain("notes-one sentence 8");
  });

  it("stops a section at the next section's heading on its last page", () => {
    // GE's risk factors end on the page where "LEGAL PROCEEDINGS." opens a paragraph.
    expect(text("risk-factors", geShaped)).toContain("risk-three sentence 8");
    expect(text("risk-factors", geShaped)).not.toContain("LEGAL PROCEEDINGS");
    expect(text("business", geShaped)).not.toContain("RISK FACTORS");
  });

  it("leaves out a section whose page belongs to another and holds no heading of its own", () => {
    // Market risk is given as page 8, the middle of the discussion: no heading
    // names it there, so it is not shown under the wrong name.
    expect(text("market-risk", geShaped)).toBeNull();
    expect(extractFilingSections(geShaped).missing.map((section) => section.id)).toEqual(["market-risk"]);
    // This index names no Item 5 at all, so the report does not have one.
    expect(extractFilingSections(geShaped).absent.map((section) => section.id)).toEqual(["market"]);
  });
});

describe("an index that gives only where each Item starts", () => {
  // McDonald's shape: "Item 1A Risk Factors Page 5".
  const html = [
    page(3, `<p>BUSINESS SUMMARY</p>${paragraph("business-one")}`, (n) => `Acme Corporation 2025 Annual Report ${n}`),
    page(4, `${paragraph("business-two")}${paragraph("business-three")}`, (n) => `Acme Corporation 2025 Annual Report ${n}`),
    page(5, `<p>RISK FACTORS</p>${paragraph("risk-one")}`, (n) => `Acme Corporation 2025 Annual Report ${n}`),
    page(6, `${paragraph("risk-two")}<p>MANAGEMENT'S DISCUSSION AND ANALYSIS</p>${paragraph("mdna-one")}`, (n) => `Acme Corporation 2025 Annual Report ${n}`),
    page(7, `${paragraph("mdna-two")}<p>FINANCING AND MARKET RISK</p>${paragraph("rates-one")}`, (n) => `Acme Corporation 2025 Annual Report ${n}`),
    page(8, `<p>Financial Statements and Supplementary Data</p>${paragraph("statements-one")}`, (n) => `Acme Corporation 2025 Annual Report ${n}`),
    `<p>Item 1 Business Page 3</p><p>Item 1A Risk Factors Page 5</p><p>Item 7 Management's Discussion and Analysis Page 6</p>`,
    `<p>Item 7A Quantitative and Qualitative Disclosures About Market Risk Page 7</p><p>Item 8 Financial Statements and Supplementary Data Page 8</p>`,
  ].join("");

  it("runs each section to the next one's heading, however far into a page", () => {
    expect(extractFilingSections(html).sections.map((section) => section.id)).toEqual(["business", "risk-factors", "mdna", "market-risk", "financials"]);
    expect(text("risk-factors", html)).toMatch(/^RISK FACTORS/);
    expect(text("risk-factors", html)).toContain("risk-two sentence 8");
    expect(text("risk-factors", html)).not.toContain("MANAGEMENT'S DISCUSSION");
    expect(text("mdna", html)).not.toContain("FINANCING AND MARKET RISK");
    // The company's own words for market risk head that section.
    expect(text("market-risk", html)).toMatch(/^FINANCING AND MARKET RISK/);
  });
});

describe("a quarterly report's contents, where a section has no Item heading", () => {
  // Netflix's shape: the statements follow the contents with no "Item 1" above them.
  const html = [
    `<div>FORM 10-Q</div>`,
    `<table><tr><td>Item 1. Consolidated Financial Statements</td><td></td></tr><tr><td>Consolidated Statements of Operations</td><td>3</td></tr><tr><td>Notes to Consolidated Financial Statements</td><td>4</td></tr>`,
    `<tr><td>Item 2. Management's Discussion and Analysis</td><td>6</td></tr><tr><td>Item 3. Quantitative and Qualitative Disclosures About Market Risk</td><td>7</td></tr><tr><td>Item 1. Legal Proceedings</td><td>7</td></tr></table>`,
    page(2, paragraph("cover"), (n) => String(n)),
    page(3, `<p>Consolidated Statements of Operations</p>${paragraph("statements-one")}`, (n) => String(n)),
    page(4, `${paragraph("notes-one")}${paragraph("notes-two")}`, (n) => String(n)),
    page(5, `${paragraph("notes-three")}${paragraph("notes-four")}`, (n) => String(n)),
    page(6, `<p>Item 2. Management's Discussion and Analysis of Financial Condition and Results of Operations</p>${paragraph("mdna-one")}`, (n) => String(n)),
    page(7, `<p>Item 3. Quantitative and Qualitative Disclosures About Market Risk</p>${paragraph("rates-one")}<p>Item 1. Legal Proceedings</p>${paragraph("legal-one")}`, (n) => String(n)),
  ].join("");

  it("reads the statements from the contents' pages up to the discussion", () => {
    const statements = text("financials", html, "10-Q");
    expect(statements).toMatch(/^Consolidated Statements of Operations/);
    expect(statements).toContain("notes-four sentence 8");
    expect(statements).not.toContain("mdna-one");
    // The sections with Item headings are read as before.
    expect(text("mdna", html, "10-Q")).toMatch(/^Item 2\. Management's Discussion/);
  });
});

describe("several Items on one page", () => {
  // Intel's quarterly report gives five Items as page 41.
  const html = [
    page(40, `${paragraph("notes-one")}${paragraph("notes-two")}`),
    page(41, `<p>Quantitative and Qualitative Disclosures About Market Risk</p>${paragraph("rates-one")}<p>Controls and Procedures</p>${paragraph("controls-one")}<p>Risk Factors and Other Key Information</p>${paragraph("risk-one")}${paragraph("purchases-one")}`),
    page(42, `<p>Exhibits</p>${paragraph("exhibits-one")}${paragraph("exhibits-two")}`),
    page(43, `${paragraph("signatures")}${paragraph("officers")}`),
    page(44, `${paragraph("more")}${paragraph("last")}`),
    `<p>Item 1. Financial Statements Pages 40</p><p>Item 3. Quantitative and Qualitative Disclosures About Market Risk Page 41</p><p>Item 4. Controls and Procedures Page 41</p>`,
    `<p>Item 1A. Risk Factors Page 41</p><p>Item 2. Unregistered Sales of Equity Securities and Use of Proceeds Page 41</p><p>Item 6. Exhibits Page 42</p>`,
  ].join("");

  it("gives each its own heading's stretch, and leaves out one with no heading", () => {
    expect(text("market-risk", html, "10-Q")).toMatch(/^Quantitative and Qualitative Disclosures About Market Risk\nrates-one/);
    expect(text("market-risk", html, "10-Q")).not.toContain("Controls and Procedures");
    expect(text("risk-factors", html, "10-Q")).toMatch(/^Risk Factors and Other Key Information/);
    // Share purchases have no heading on the page, so they are not shown as another Item's text.
    expect(text("market", html, "10-Q")).toBeNull();
  });
});

describe("Item 5 on a page the index gives it", () => {
  const index = [
    `<p>FORM 10-K CROSS REFERENCE INDEX</p>`,
    `<p>Item 1. Business 3-4</p><p>Item 1A. Risk Factors 5-6</p>`,
    `<p>Item 5. Market for Registrant's Common Equity, Related Stockholder Matters and Issuer Purchases of Equity Securities 9</p>`,
    `<p>Item 7. Management's Discussion and Analysis of Financial Condition and Results of Operations 7-9</p>`,
    `<p>Item 8. Financial Statements and Supplementary Data 10</p>`,
  ].join("");
  const before = [
    page(3, `<p>ABOUT ACME. Acme makes engines.</p>${paragraph("business-one")}`),
    page(4, `${paragraph("business-two")}${paragraph("business-three")}`),
    page(5, `<p>RISK FACTORS. What could go wrong.</p>${paragraph("risk-one")}`),
    page(6, `${paragraph("risk-two")}${paragraph("risk-three")}`),
    page(7, `<p>MANAGEMENT'S DISCUSSION AND ANALYSIS.</p>${paragraph("mdna-one")}`),
    page(8, `${paragraph("mdna-two")}${paragraph("mdna-three")}`),
  ].join("");
  const after = page(10, `<p>STATEMENT OF EARNINGS</p>${paragraph("statements-one")}`);

  it("starts where the Item's first part is headed, on a page that opens with another section", () => {
    // GE's page for Item 5 opens with the end of its discussion.
    const html = `${before}${page(9, `${paragraph("mdna-four")}<p><b>OTHER FINANCIAL DATA</b></p><p>FIVE-YEAR PERFORMANCE GRAPH</p>${paragraph("graph")}<p>PURCHASES OF EQUITY SECURITIES BY THE ISSUER. We bought shares.</p>`)}${after}${index}`;
    // The heading GE sets over its Item 5 goes with it, not at the end of the discussion.
    expect(text("market", html)).toMatch(/^OTHER FINANCIAL DATA\nFIVE-YEAR PERFORMANCE GRAPH\ngraph/);
    expect(text("market", html)).toContain("PURCHASES OF EQUITY SECURITIES");
    expect(text("market", html)).not.toContain("mdna-four");
    // The index gives the discussion page 9 too; it ends where the Item begins.
    expect(text("mdna", html)).toContain("mdna-four sentence 8");
    expect(text("mdna", html)).not.toContain("OTHER FINANCIAL DATA");
    expect(text("mdna", html)).not.toContain("FIVE-YEAR");
  });

  it("starts at the page's top where the page opens with the Item, however it is worded", () => {
    // Intel's page opens with "Market for Our Common Stock", and its graph comes after the holders.
    const html = `${before.replace(page(8, `${paragraph("mdna-two")}${paragraph("mdna-three")}`), page(8, `${paragraph("mdna-two")}${paragraph("mdna-three")}`))}${page(9, `<p>Market for Our Common Stock</p>${paragraph("holders")}<p>Stock Performance Graph</p>${paragraph("graph")}`)}${after}${index.replace("7-9", "7-8")}`;
    expect(text("market", html)).toMatch(/^Market for Our Common Stock\nholders/);
    expect(text("market", html)).toContain("graph sentence 8");
  });
});

describe("an Item's parts in the index", () => {
  it("do not end a section at one beginning inside it before its last page", () => {
    // GE gives its market risk as page 13 of a discussion that runs to page 22:
    // were market risk headed there, the discussion would still run on past it.
    const html = [
      page(2, `${paragraph("forward-looking")}${paragraph("about")}`),
      page(3, `<p>ABOUT ACME. Acme makes engines.</p>${paragraph("business-one")}`),
      page(4, `${paragraph("business-two")}${paragraph("business-three")}`),
      page(5, `<p>RISK FACTORS. What could go wrong.</p>${paragraph("risk-one")}`),
      page(6, `${paragraph("risk-two")}${paragraph("risk-three")}`),
      page(7, `<p>MANAGEMENT'S DISCUSSION AND ANALYSIS.</p>${paragraph("mdna-one")}`),
      page(8, `${paragraph("mdna-two")}<p>MARKET RISK. Rates and currencies move.</p>${paragraph("rates")}`),
      page(9, `${paragraph("mdna-three")}${paragraph("mdna-four")}`),
      page(10, `<p>STATEMENT OF EARNINGS</p>${paragraph("statements-one")}`),
      `<p>FORM 10-K CROSS REFERENCE INDEX</p><p>Item 1. Business 3-4</p><p>Item 1A. Risk Factors 5-6</p>`,
      `<p>Item 7. Management's Discussion and Analysis of Financial Condition and Results of Operations 7-9</p>`,
      `<p>Item 7A. Quantitative and Qualitative Disclosures About Market Risk 8</p><p>Item 8. Financial Statements and Supplementary Data 10</p>`,
    ].join("");
    expect(text("market-risk", html)).toMatch(/^MARKET RISK./);
    expect(text("mdna", html)).toContain("rates sentence 8");
    expect(text("mdna", html)).toContain("mdna-four sentence 8");
  });

  it("end a section on a shared page at the heading of the next Item's part", () => {
    // Intel's quarterly page 41: the buybacks, headed "Issuer Purchases of
    // Equity Securities", then Item 5's "Rule 10b5-1 Trading Arrangements".
    const html = [
      page(40, `${paragraph("notes-one")}${paragraph("notes-two")}`),
      page(41, `<p>Risk Factors</p>${paragraph("risk-one")}<p>Issuer Purchases of Equity Securities</p>${paragraph("purchases-one")}<p>Rule 10b5-1 Trading Arrangements</p>${paragraph("trading-one")}`),
      page(42, `<p>Exhibits</p>${paragraph("exhibits-one")}${paragraph("exhibits-two")}`),
      page(43, `${paragraph("signatures")}${paragraph("officers")}`),
      page(44, `${paragraph("more")}${paragraph("last")}`),
      `<p>Item 1. Financial Statements Pages 40</p><p>Item 1A. Risk Factors Page 41</p>`,
      `<p>Item 2. Unregistered Sales of Equity Securities and Use of Proceeds Page 41</p>`,
      `<p>Item 5. Other Information</p><p>Rule 10b5-1 Trading Arrangements Page 41</p><p>Item 6. Exhibits Page 42</p>`,
    ].join("");
    expect(text("market", html, "10-Q")).toMatch(/^Issuer Purchases of Equity Securities\npurchases-one/);
    expect(text("market", html, "10-Q")).not.toContain("trading-one");
  });

  it("do not end a section before the page where their Item starts", () => {
    // JPMorgan's statements list "Consolidated balance sheets (unaudited)" as
    // a part on page 95; its discussion has "CONSOLIDATED BALANCE SHEETS AND
    // CASH FLOWS ANALYSIS" on page 15, which is not where the statements begin.
    const html = [
      `<table>`,
      `<tr><td>Item 1. Financial Statements</td><td></td></tr>`,
      `<tr><td>Consolidated statements of income (unaudited)</td><td>7</td></tr>`,
      `<tr><td>Consolidated balance sheets (unaudited) at June 30, 2026</td><td>8</td></tr>`,
      `<tr><td>Item 2. Management's Discussion and Analysis of Financial Condition and Results of Operations</td><td></td></tr>`,
      `<tr><td>Introduction</td><td>3</td></tr>`,
      `<tr><td>Consolidated Balance Sheets and Cash Flows Analysis</td><td>5</td></tr>`,
      `<tr><td>Item 3. Quantitative and Qualitative Disclosures About Market Risk</td><td>9</td></tr>`,
      `<tr><td>Item 4. Controls and Procedures</td><td>9</td></tr>`,
      `</table>`,
      page(2, `${paragraph("cover")}${paragraph("cover-two")}`, (n) => String(n)),
      page(3, `<p>Introduction</p>${paragraph("intro")}${paragraph("intro-two")}`, (n) => String(n)),
      page(4, `${paragraph("results-one")}${paragraph("results-two")}`, (n) => String(n)),
      page(5, `<p>CONSOLIDATED BALANCE SHEETS AND CASH FLOWS ANALYSIS</p>${paragraph("balance-analysis")}${paragraph("balance-analysis-two")}`, (n) => String(n)),
      page(6, `${paragraph("liquidity-one")}${paragraph("liquidity-two")}`, (n) => String(n)),
      page(7, `<p>Consolidated statements of income</p>${paragraph("income")}${paragraph("income-two")}`, (n) => String(n)),
      page(8, `<p>Consolidated balance sheets</p>${paragraph("balance")}${paragraph("balance-two")}`, (n) => String(n)),
      page(9, `<p>Quantitative and Qualitative Disclosures About Market Risk</p>${paragraph("rates")}<p>Controls and Procedures</p>${paragraph("controls")}`, (n) => String(n)),
    ].join("");
    const mdna = text("mdna", html, "10-Q");
    expect(mdna).toMatch(/^Introduction/);
    expect(mdna).toContain("balance-analysis sentence 0");
    expect(mdna).toContain("liquidity-two sentence 8");
    expect(mdna).not.toContain("income sentence 0");
  });
});
