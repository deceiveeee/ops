import { describe, expect, it } from "vitest";
import { filingToText, extractFilingSections } from "./sections";
import { parseTable, rowText } from "./tables";

/**
 * The markup below keeps the shapes of real tables, trimmed: Netflix's buyback
 * table and its results table for the quarter to 30 June 2026, which are the
 * two that showed each way the reader's columns could go wrong.
 */

/** Netflix's buyback table: headings in blocks of their own, "$" in its own cell, empty cells as spacers. */
const buybacks = `<table>
<tr><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/></tr>
<tr><td colspan="3">Period</td><td colspan="3"/><td colspan="3"><div>Total Number of Shares Purchased</div></td><td colspan="3"/><td colspan="3"><div>Average Price Paid per Share</div></td><td colspan="3"><div>Approximate Dollar Value</div></td></tr>
<tr><td colspan="3"/><td colspan="3"/><td colspan="3"/><td colspan="3"/><td colspan="3"/><td colspan="3">(in thousands)</td></tr>
<tr><td colspan="3">April 1 - 30, 2026</td><td colspan="3"/><td colspan="2">16,922,312&#160;</td><td/><td colspan="3"/><td>$</td><td>97.47&#160;</td><td/><td>$</td><td>30,126,783&#160;</td><td/></tr>
<tr><td colspan="3">May 1 - 31, 2026</td><td colspan="3"/><td colspan="2">16,537,940&#160;</td><td/><td colspan="3"/><td>$</td><td>88.68&#160;</td><td/><td>$</td><td>28,660,178&#160;</td><td/></tr>
<tr><td colspan="3"><div>Total</div></td><td colspan="3"/><td colspan="2">33,460,252&#160;</td><td/><td colspan="3"/><td colspan="3"/><td colspan="3"/></tr>
</table>`;

/** Netflix's results table: "$" before revenue only, and a margin that fills both cells of its year. */
const results = `<table>
<tr><td colspan="3"/><td colspan="7">Three Months Ended</td></tr>
<tr><td colspan="3"/><td colspan="3">June 30, 2026</td><td/><td colspan="3">June 30, 2025</td></tr>
<tr><td colspan="3">Revenues</td><td>$</td><td colspan="2">12,559,938</td><td/><td>$</td><td colspan="2">11,079,166</td></tr>
<tr><td colspan="3">Cost of revenues</td><td/><td colspan="2">6,036,965</td><td/><td/><td colspan="2">5,325,311</td></tr>
<tr><td colspan="3">Operating margin</td><td colspan="3">33.4&#160;%</td><td/><td colspan="3">34.1&#160;%</td></tr>
<tr><td colspan="3">Interest expense</td><td>(</td><td>175,685</td><td>)</td><td/><td>(</td><td>182,649</td><td>)</td></tr>
</table>`;

const grid = (html: string) => {
  const table = parseTable(html)!;
  return table.rows.map((row) => {
    const cells = Array<string>(table.columns).fill("");
    for (const cell of row.cells) cells[cell.column] = cell.span > 1 ? `${cell.text} ×${cell.span}` : cell.text;
    return cells;
  });
};

describe("reading a table of figures", () => {
  it("puts each figure under its heading, with its dollar sign", () => {
    expect(grid(buybacks)).toEqual([
      ["Period", "Total Number of Shares Purchased", "Average Price Paid per Share", "Approximate Dollar Value"],
      ["", "", "", "(in thousands)"],
      ["April 1 - 30, 2026", "16,922,312", "$97.47", "$30,126,783"],
      ["May 1 - 31, 2026", "16,537,940", "$88.68", "$28,660,178"],
      ["Total", "33,460,252", "", ""],
    ]);
    expect(parseTable(buybacks)!.rows.map((row) => row.header)).toEqual([true, true, false, false, false]);
  });

  it("keeps one column for each year, whether or not a row has a dollar sign or fills both cells", () => {
    expect(grid(results)).toEqual([
      ["", "Three Months Ended ×2", ""],
      ["", "June 30, 2026", "June 30, 2025"],
      ["Revenues", "$12,559,938", "$11,079,166"],
      ["Cost of revenues", "6,036,965", "5,325,311"],
      ["Operating margin", "33.4 %", "34.1 %"],
      ["Interest expense", "(175,685)", "(182,649)"],
    ]);
  });

  it("leaves bullets, paragraphs and single rows as text", () => {
    const bullets = `<table><tr><td>•</td><td>Our subscribers may cancel at any time.</td></tr><tr><td>•</td><td>Content costs are large and fixed.</td></tr></table>`;
    const paragraph = `<table><tr><td>Note</td><td>${"A sentence of a paragraph laid out in a table cell. ".repeat(8)}</td></tr><tr><td>Total</td><td>1,234</td></tr></table>`;
    const single = `<table><tr><td>Revenue</td><td>1,234</td></tr></table>`;

    for (const html of [bullets, paragraph, single]) expect(parseTable(html)).toBeNull();
  });

  it("reads a cell merged down across rows, as Exxon's and IBM's tables merge their headings", () => {
    // "(millions of dollars)" covers two heading rows; the second row's cells start after it.
    const merged = `<table>
      <tr><td rowspan="2">(millions of dollars)</td><td colspan="2">Upstream</td></tr>
      <tr><td>U.S.</td><td>Non-U.S.</td></tr>
      <tr><td>Sales</td><td>8,201</td><td>4,479</td></tr>
      <tr><td>Income from equity affiliates</td><td>(95)</td><td>682</td></tr>
    </table>`;
    expect(grid(merged)).toEqual([
      ["(millions of dollars)", "Upstream ×2", ""],
      ["", "U.S.", "Non-U.S."],
      ["Sales", "8,201", "4,479"],
      ["Income from equity affiliates", "(95)", "682"],
    ]);
  });

  it("keeps a table with one long footnote among many figures", () => {
    const rows = Array.from({ length: 5 }, (_, i) => `<tr><td>Segment ${i}</td><td>1,${100 + i}</td><td>2,${100 + i}</td></tr>`).join("");
    const footnote = `<tr><td colspan="3">${"Footnote text explaining how the segment figures were prepared. ".repeat(6)}</td></tr>`;
    expect(parseTable(`<table>${rows}${footnote}</table>`)).not.toBeNull();
  });
});

describe("tables in the plain text", () => {
  const html = `<p>Stock repurchases during the three months were as follows:</p>${buybacks}<p>(1) In March 2021, the Board authorized a repurchase.</p>`;

  it("puts each row on one line, and records where the rows are", () => {
    const { text, tables } = filingToText(html);
    expect(tables).toHaveLength(1);
    const lines = text.slice(tables[0].start, tables[0].end).split("\n");
    expect(lines).toEqual(tables[0].rows.map(rowText));
    // A heading held in its own block no longer breaks its row apart.
    expect(lines[0]).toBe("Period Total Number of Shares Purchased Average Price Paid per Share Approximate Dollar Value");
    // The text either side is as it was: a line break at each block, and the space a tag leaves.
    expect(text).toMatch(/^Stock repurchases during the three months were as follows:\nPeriod /);
    expect(text).toMatch(/\nTotal 33,460,252\n\s*\(1\) In March 2021, the Board authorized a repurchase\.$/);
  });

  it("gives a section its own tables, with offsets in the section's text", () => {
    const filing = `<div>FORM 10-Q</div><div>Item 1A. Risk Factors</div><p>There have been no material changes.</p>
      <div>Item 2. Unregistered Sales of Equity Securities and Use of Proceeds</div>${html}<div>Item 5. Other Information</div><p>None.</p>`;
    const section = extractFilingSections(filing, "10-Q").sections.find((item) => item.id === "market")!;
    expect(section.tables).toHaveLength(1);
    const [table] = section.tables;
    expect(section.text.slice(table.start, table.end).split("\n")[2]).toBe("April 1 - 30, 2026 16,922,312 $97.47 $30,126,783");
    expect(section.text).not.toContain("Other Information");
    expect(extractFilingSections(filing, "10-Q").sections.find((item) => item.id === "risk-factors")!.tables).toEqual([]);
  });
});
