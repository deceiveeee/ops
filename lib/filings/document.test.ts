import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readDocument, renderTableRows, renderText, type DocumentBlock, type TableBlock, type TextBlock } from "./document";
import { fixtureFileName } from "./edgar";
import { KEEP_SLOT } from "./keep-slot";

/**
 * The reader draws a filing's own paragraphs and tables, and search, kept
 * passages and every tab read the text those blocks carry. What must hold is
 * that the two never drift apart: an offset in the text is a place in what is
 * drawn. Atkore's 10-K (see e2e/fixtures/edgar/README.md) checks that on a
 * real document; the markup below reproduces the shapes real filers use,
 * trimmed to a size a test can hold.
 */

const DOC = "https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/atkr-20250930.htm";
const atkore = readDocument(readFileSync(join(process.cwd(), "e2e", "fixtures", "edgar", fixtureFileName(DOC)), "utf8"));

/** The characters the text holds in a plainer form than the screen shows. */
const plain = (text: string) =>
  text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—−]/g, "-");
const drawn = (html: string) => {
  const box = globalThis.document.createElement("div");
  box.innerHTML = html;
  return box;
};
/** What a person sees of some HTML, read as the text reads it. */
const shown = (html: string) => plain(drawn(html).textContent ?? "");
const marked = (html: string) => plain([...drawn(html).querySelectorAll("mark")].map((mark) => mark.textContent).join(""));
const bare = (text: string) => text.replace(/\s+/g, "");

const blocksOf = (html: string) => readDocument(html).blocks;
/** The paragraphs a reader would see, page furniture aside. */
const paragraphs = (html: string) =>
  blocksOf(html).filter((block): block is TextBlock => block.kind === "text" && !block.furniture).map((block) => block.text);
const tableOf = (html: string) => blocksOf(html).find((block): block is TableBlock => block.kind === "table")!;

describe("a filing, read as the blocks its company made", () => {
  it("keeps its paragraphs, list items and tables, in order", () => {
    const blocks = blocksOf(`<html><head><style>p { color: red }</style><title>10-K</title></head><body><div>
      <p style="text-align:center"><b>Item 1. Business</b></p>
      <p>We design and sell <i>footwear</i>.</p>
      <ul><li>Retail stores</li><li>Wholesale</li></ul>
      <table><tr><td></td><td>2026</td><td>2025</td></tr><tr><td>Net sales</td><td>1,234</td><td>1,100</td></tr><tr><td>Cost of sales</td><td>456</td><td>400</td></tr></table>
    </div></body></html>`);

    expect(blocks.map((block) => block.kind)).toEqual(["text", "text", "text", "text", "table"]);
    expect(blocks.map((block) => block.text)).toEqual([
      "Item 1. Business",
      "We design and sell footwear.",
      "• Retail stores",
      "• Wholesale",
      "2026 2025\nNet sales 1,234 1,100\nCost of sales 456 400",
    ]);
    const heading = blocks[0] as TextBlock;
    expect(heading.bold).toBe(1);
    expect(heading.align).toBe("center");
    expect((blocks[4] as TableBlock).headerRows).toBe(1);
  });

  it("records where every block sits in the text, exactly", () => {
    expect(atkore.blocks.length).toBeGreaterThan(300);
    atkore.blocks.forEach((block, index) => {
      expect(atkore.text.slice(block.start, block.end)).toBe(block.text);
      if (index) expect(block.start).toBe(atkore.blocks[index - 1].end + 1);
    });
    expect(atkore.text).toBe(atkore.blocks.map((block) => block.text).join("\n"));
  });

  /** Tables in the shapes real filers use; the fixture's 10-K was rebuilt from its paragraphs and has none. */
  const tables = () => [buybacks, results, merged, segments].map(tableOf);

  it("draws one character for each character of its text", () => {
    // Every paragraph of a real 10-K. If a character were drawn without being
    // in the text, or the other way round, a search hit or a kept passage would
    // be marked a few letters off.
    for (const block of atkore.blocks) {
      if (block.kind === "text") expect(shown(renderText(block)).trimEnd()).toBe(block.text);
    }
    // In a table the text puts a space between cells and a line between rows,
    // which the table draws as its layout, so only the characters are compared.
    for (const table of tables()) {
      expect(bare(shown(renderTableRows(table, 0, table.rowStarts.length)))).toBe(bare(table.text));
    }
  });

  it("marks exactly the stretch asked for, in a paragraph and in a table", () => {
    const texts = atkore.blocks.filter((block): block is TextBlock => block.kind === "text" && block.text.length > 30);
    expect(texts.length).toBeGreaterThan(200);
    texts.forEach((block, index) => {
      if (index % 5) return;
      const from = Math.floor(block.text.length / 3) + (index % 7);
      const to = Math.floor((2 * block.text.length) / 3);
      expect(marked(renderText(block, { from, to }))).toBe(block.text.slice(from, to));
    });

    for (const table of tables()) {
      // A row part of the way down, on a page that opens at it: marked in the
      // row, never in the headings repeated above it.
      const row = table.headerRows + 1;
      const from = table.rowStarts[row] + 2;
      const to = row + 1 < table.rowStarts.length ? table.rowStarts[row + 1] - 1 : table.text.length;
      const html = renderTableRows(table, row, table.rowStarts.length, { from, to });
      expect(marked(html).length).toBeGreaterThan(3);
      expect(bare(marked(html))).toBe(bare(table.text.slice(from, to)));
    }
  });

  it("puts the Keep button on the paragraph's last word, and nothing more", () => {
    const paragraph = atkore.blocks.find((block): block is TextBlock => block.kind === "text" && block.text.length > 200)!;
    const html = renderText(paragraph, null, KEEP_SLOT);
    expect(html.split(KEEP_SLOT)).toHaveLength(2);
    const lastWord = paragraph.text.split(" ").at(-1)!;
    expect(shown(drawn(html).querySelector(".nowrap")!.innerHTML)).toBe(lastWord);
    expect(shown(html).trimEnd()).toBe(paragraph.text);
  });
});

describe("what a filing cannot bring with it", () => {
  const hostile = `
    <p onclick="steal()" class="evil" style="position:fixed;top:0;left:0">Hello <a href="javascript:alert(1)">there</a><script>alert(1)</script><img src="x" onerror="alert(2)"><iframe src="https://example.com"></iframe><style>body { display: none }</style> <b>world</b></p>
    <table><tr><td onmouseover="x()" style="background:url(javascript:1);text-align:right">Revenue</td><td>1,234</td></tr><tr><td>Costs</td><td>567</td></tr></table>`;

  it("keeps its words and a few marks of emphasis, and nothing that could run or restyle the page", () => {
    const blocks = blocksOf(hostile);
    expect(blocks.map((block) => block.text)).toEqual(["Hello there world", "Revenue 1,234\nCosts 567"]);

    const html = blocks.map((block) => (block.kind === "text" ? renderText(block, null, KEEP_SLOT) : renderTableRows(block, 0, block.rowStarts.length))).join("");
    const allowed = new Set(["strong", "em", "sup", "sub", "br", "mark", "span", "tr", "td"]);
    for (const [, name, attributes] of html.matchAll(/<\/?([a-z0-9]+)([^>]*)>/g)) {
      expect(allowed.has(name), name).toBe(true);
      for (const [, attribute, value] of attributes.matchAll(/([a-z-]+)="([^"]*)"/g)) {
        if (name === "span") expect(attribute === "class" && value === "nowrap", attribute).toBe(true);
        else expect(["colspan", "rowspan", "class", "style"], attribute).toContain(attribute);
        if (attribute === "style") expect(value).toMatch(/^(text-align:(center|right)|padding-left:\d+px)(;(text-align:(center|right)|padding-left:\d+px))*$/);
      }
    }
    expect(html).not.toMatch(/javascript|href|onclick|onerror|onmouseover|url\(|evil|fixed/i);
  });

  it("leaves out what the filing hides: its XBRL data and anything set not to display", () => {
    const html = `<ix:header><ix:hidden><ix:nonNumeric name="dei:DocumentType">10-K</ix:nonNumeric></ix:hidden></ix:header>
      <div style="display:none">Hidden text</div><p hidden>Also hidden</p><p>Visible.</p>`;
    expect(paragraphs(html)).toEqual(["Visible."]);
  });
});

describe("characters", () => {
  it("turns the codes filings use into the characters they name", () => {
    // Apple's trademarks, a risk-factor bullet, NVIDIA's copyright line.
    expect(paragraphs("<p>iPhone&#174; and iPhone Air&#8482; &#8226; &#169; 2026 NVIDIA &reg; &trade; &sect; &#xAE;</p>")).toEqual([
      "iPhone® and iPhone Air™ • © 2026 NVIDIA ® ™ § ®",
    ]);
  });

  it("keeps quotes and dashes plain in the text, as search expects, and as the filer set them on screen", () => {
    const [block] = blocksOf("<p>Company&#8217;s &#8220;risk&#8221; &#8212; cost&#8211;of&#8211;sales a&nbsp;b</p>") as TextBlock[];
    expect(block.text).toBe(`Company's "risk" - cost-of-sales a b`);
    expect(drawn(renderText(block)).textContent).toBe("Company’s “risk” — cost–of–sales a b");
  });

  it("decodes once, so an escaped code stays as written", () => {
    const [block] = blocksOf("<p>&amp;#174; &amp;amp; &lt;b&gt;</p>") as TextBlock[];
    expect(block.text).toBe("&#174; &amp; <b>");
    expect(drawn(renderText(block)).querySelector("b")).toBeNull();
    expect(shown(renderText(block))).toBe("&#174; &amp; <b>");
  });

  it("drops invisible printing marks", () => {
    expect(paragraphs("<p>hy&shy;phen&#8203;ated</p>")).toEqual(["hyphenated"]);
  });

  it("keeps apart words the filer spaced with padding, as Netflix spaces its Item headings", () => {
    expect(paragraphs('<p><span>Item 1.</span><span style="padding-left:24pt">Legal Proceedings</span></p>')).toEqual(["Item 1. Legal Proceedings"]);
  });
});

describe("lists", () => {
  it("keeps a bullet with its text when the two are laid out side by side, as Microsoft and Oracle lay them out", () => {
    const item = (text: string) =>
      `<div class="item-list-element-wrapper" style="display:flex;margin-left:5.7%"><span style="display:inline-flex;min-width:3.5%">&#8226;</span><div style="display:inline"><span>${text}</span></div></div>`;
    expect(paragraphs(`<p>We are investing in:</p>${item("Tackling security from all angles.")}${item("Transforming the workplace.")}`)).toEqual([
      "We are investing in:",
      "• Tackling security from all angles.",
      "• Transforming the workplace.",
    ]);
  });

  it("keeps a list number with its text when each sits in a box of its own", () => {
    expect(paragraphs("<div><div>(a)</div><div><p>Includes amounts reclassified.</p></div></div>")).toEqual(["(a) Includes amounts reclassified."]);
    expect(paragraphs("<div><div>3.</div><div>Revenue recognition</div></div>")).toEqual(["3. Revenue recognition"]);
  });

  it("does not take a page number for a list number, wherever it falls among paragraphs", () => {
    // Alphabet prints its page numbers as "4." at the foot of each page.
    expect(paragraphs("<div><p>First paragraph.</p><p>4.</p><p>Second paragraph.</p></div>")).toEqual(["First paragraph.", "Second paragraph."]);
    expect(paragraphs("<div><p>4.</p><p>Our products have come a long way.</p><p>Another paragraph.</p></div>")).toEqual([
      "Our products have come a long way.",
      "Another paragraph.",
    ]);
  });
});

describe("what a printed page adds", () => {
  it("keeps page numbers in the text, where contents entries need them, but never draws them", () => {
    const blocks = blocksOf(
      "<p>Item 1. Business</p><p>2</p><p>Revenue grew.</p><p>26</p><p>Table of Contents</p><p>Apple Inc. | Q3 2026 Form 10-Q | 23</p><p>F- 1</p><p>4.</p><p>Page 7</p><p>- 8 -</p><p>Table of Contents 13</p><p>Costs fell 12% in 2026.</p><p>2026</p>",
    ) as TextBlock[];
    expect(blocks.filter((block) => block.furniture).map((block) => block.text)).toEqual([
      "2", "26", "Table of Contents", "Apple Inc. | Q3 2026 Form 10-Q | 23", "F- 1", "4.", "Page 7", "- 8 -", "Table of Contents 13",
    ]);
    // A year on its own is not a page number: it has four digits.
    expect(blocks.filter((block) => !block.furniture).map((block) => block.text)).toEqual(["Item 1. Business", "Revenue grew.", "Costs fell 12% in 2026.", "2026"]);
  });

  it("takes a company name repeated at the top of every page out of the reading, and only when it repeats", () => {
    const body = (i: number) => `<p>Paragraph ${i} of the report, which says something.</p>`;
    const pages = Array.from({ length: 5 }, (_, i) => `<div>Alphabet Inc.</div>${body(i)}`).join("");
    expect(paragraphs(pages)).not.toContain("Alphabet Inc.");
    expect(paragraphs(pages)).toHaveLength(5);
    // Four times is not a running header.
    expect(paragraphs(pages.replace(/<div>Alphabet Inc\.<\/div>/, ""))).toContain("Alphabet Inc.");
  });

  describe("a sentence the printed page broke in two", () => {
    const long = "The principal raw material used by our business is sweeteners, and suppliers deliver them to produce finished";

    it("is put back together, with the page's footer after it", () => {
      const blocks = blocksOf(`<p>${long}</p><p>26</p><p>Table of Contents</p><p>beverages. The finished beverages are packaged.</p>`) as TextBlock[];
      expect(blocks.map((block) => [block.text, block.furniture])).toEqual([
        [`${long} beverages. The finished beverages are packaged.`, false],
        ["26", true],
        ["Table of Contents", true],
      ]);
    });

    it("leaves a heading above a paragraph that starts in lower case, and a finished sentence alone", () => {
      expect(paragraphs("<p>iPhone</p><p>iPhone net sales increased during 2025 compared to 2024.</p>")).toEqual([
        "iPhone",
        "iPhone net sales increased during 2025 compared to 2024.",
      ]);
      expect(paragraphs(`<p>${long}.</p><p>beverages are next.</p>`)).toHaveLength(2);
      // A capital after an unfinished line is a new paragraph in a document set as paragraphs.
      expect(paragraphs(`<p>${long}</p><p>Report.</p>`)).toHaveLength(2);
    });
  });

  it("puts back together the paragraphs of a report set one printed line at a time, as Deckers' are", () => {
    const line = (top: number, text: string, bold = false) =>
      `<div style="line-height:10pt;position:var(--position);top:${top}pt;width:612pt"><span style="font-weight:${bold ? "bold" : "normal"};left:49.5pt;white-space:pre">${text}</span></div>`;
    const html = [
      line(10, "Risks Related to Our Business", true),
      line(22, "The footwear, apparel, and accessories industry is subject to rapid changes, and", true),
      line(34, "our brand loyalty could be diminished.", true),
      line(46, "Consumer preferences are hard to predict, which we describe in this Annual"),
      line(58, "Report. Other brands consist of Teva."),
      line(70, "• A new bullet"),
    ].join("");
    expect(paragraphs(html)).toEqual([
      "Risks Related to Our Business",
      "The footwear, apparel, and accessories industry is subject to rapid changes, and our brand loyalty could be diminished.",
      "Consumer preferences are hard to predict, which we describe in this Annual Report. Other brands consist of Teva.",
      "• A new bullet",
    ]);
  });
});

/** Netflix's buyback table: headings in blocks of their own, "$" in its own cell, empty cells as spacers. */
const buybacks = `<table>
<tr><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/><td/></tr>
<tr><td colspan="3">Period</td><td colspan="3"/><td colspan="3"><div>Total Number of Shares Purchased</div></td><td colspan="3"/><td colspan="3"><div>Average Price Paid per Share</div></td><td colspan="3"><div>Approximate Dollar Value</div></td></tr>
<tr><td colspan="3"/><td colspan="3"/><td colspan="3"/><td colspan="3"/><td colspan="3"/><td colspan="3">(in thousands)</td></tr>
<tr><td colspan="3">April 1 - 30, 2026</td><td colspan="3"/><td colspan="2">16,922,312&#160;</td><td/><td colspan="3"/><td>$</td><td>97.47&#160;</td><td/><td>$</td><td>30,126,783&#160;</td><td/></tr>
<tr><td colspan="3">May 1 - 31, 2026</td><td colspan="3"/><td colspan="2">16,537,940&#160;</td><td/><td colspan="3"/><td>$</td><td>88.68&#160;</td><td/><td>$</td><td>28,660,178&#160;</td><td/></tr>
<tr><td colspan="3"><div>Total</div></td><td colspan="3"/><td colspan="2">33,460,252&#160;</td><td/><td colspan="3"/><td colspan="3"/><td colspan="3"/></tr>
</table>`;

/** Netflix's results table: "$" before revenue only, a margin that fills both cells of its year, a negative in brackets across cells. */
const results = `<table>
<tr><td colspan="3"/><td colspan="7">Three Months Ended</td></tr>
<tr><td colspan="3"/><td colspan="3">June 30, 2026</td><td/><td colspan="3">% Change</td></tr>
<tr><td colspan="3">Revenues</td><td>$</td><td colspan="2">12,559,938</td><td/><td>$</td><td colspan="2">11,079,166</td></tr>
<tr><td colspan="3">Operating margin</td><td colspan="3">33.4&#160;%</td><td/><td colspan="3">34.1&#160;%</td></tr>
<tr><td colspan="3">Interest expense</td><td>(</td><td>175,685</td><td>)</td><td/><td>(</td><td>182,649</td><td>)</td></tr>
</table>`;

/** Exxon's and IBM's shape: a heading merged down across two rows. */
const merged = `<table>
  <tr><td rowspan="2">(millions of dollars)</td><td colspan="2">Upstream</td></tr>
  <tr><td>U.S.</td><td>Non-U.S.</td></tr>
  <tr><td>Sales</td><td>8,201</td><td>4,479</td></tr>
  <tr><td>Income from equity affiliates</td><td>(95)</td><td>682</td></tr>
</table>`;

/** A long statement: indented labels, bold totals, rules under the figures. */
const segments = `<table><tr><td></td><td style="text-align:center"><b>2026</b></td><td style="text-align:center"><b>2025</b></td></tr>${Array.from(
  { length: 12 },
  (_, i) => `<tr><td style="padding-left:10pt">Segment ${i} &#8212; net sales</td><td style="border-bottom:1px solid #000">1,${100 + i}.5</td><td>2,${100 + i}.5</td></tr>`,
).join("")}<tr><td><b>Total</b></td><td style="border-bottom:3px double #000"><b>14,000</b></td><td><b>26,000</b></td></tr></table>`;

describe("tables", () => {
  it("draws a table of figures as a table, with its spans, and reads each row as a line", () => {
    const table = tableOf(buybacks);
    expect(table.text.split("\n")).toEqual([
      "Period Total Number of Shares Purchased Average Price Paid per Share Approximate Dollar Value",
      "(in thousands)",
      "April 1 - 30, 2026 16,922,312 $97.47 $30,126,783",
      "May 1 - 31, 2026 16,537,940 $88.68 $28,660,178",
      "Total 33,460,252",
    ]);
    expect(table.headerRows).toBe(2);
    expect(renderTableRows(table, 0, 5)).toContain('<td colspan="3">Period</td>');
  });

  it("keeps a figure whole in the text when the filer split it across cells, and a heading as written", () => {
    expect(tableOf(results).text.split("\n")).toEqual([
      "Three Months Ended",
      "June 30, 2026 % Change",
      "Revenues $12,559,938 $11,079,166",
      "Operating margin 33.4 % 34.1 %",
      "Interest expense (175,685) (182,649)",
    ]);
  });

  it("repeats a table's headings on a page that opens part of the way down it, holding no text of their own", () => {
    const table = tableOf(buybacks);
    const html = renderTableRows(table, 3, 5, { from: table.rowStarts[3], to: table.rowStarts[3] + "May 1 - 31".length });
    expect(shown(html)).toContain("Average Price Paid per Share");
    expect(shown(html)).toContain("May 1 - 31, 2026");
    expect(shown(html)).not.toContain("April");
    expect(marked(html)).toBe("May 1 - 31");
  });

  it("keeps a cell merged down across rows, as Exxon's and IBM's tables merge their headings", () => {
    const table = tableOf(merged);
    expect(table.headerRows).toBe(2);
    expect(renderTableRows(table, 0, 4)).toContain('<td rowspan="2">(millions of dollars)</td>');
  });

  it("keeps a statement's indents, bold totals and rules", () => {
    const html = renderTableRows(tableOf(segments), 0, 14);
    expect(html).toContain('<td style="padding-left:19px">Segment 0 — net sales</td>');
    expect(html).toContain('<td class="rule">1,100.5</td>');
    expect(html).toContain('<td class="rule-double"><strong>14,000</strong></td>');
    expect(html).toContain('<td style="text-align:center"><strong>2026</strong></td>');
  });

  it("keeps a table with one long footnote among many figures", () => {
    const rows = Array.from({ length: 5 }, (_, i) => `<tr><td>Segment ${i}</td><td>1,${100 + i}</td><td>2,${100 + i}</td></tr>`).join("");
    const footnote = `<tr><td colspan="3">${"Footnote text explaining how the segment figures were prepared. ".repeat(6)}</td></tr>`;
    expect(blocksOf(`<table>${rows}${footnote}</table>`).map((block) => block.kind)).toEqual(["table"]);
  });

  it("reads bullets, headings, paragraphs and a single row laid out in a table as text", () => {
    const kinds = (html: string) => blocksOf(html).map((block: DocumentBlock) => `${block.kind}: ${block.text}`);
    expect(kinds("<table><tr><td>•</td><td>Our subscribers may cancel at any time.</td></tr><tr><td>•</td><td>Content costs are large and fixed.</td></tr></table>")).toEqual([
      "text: • Our subscribers may cancel at any time.",
      "text: • Content costs are large and fixed.",
    ]);
    expect(kinds('<table><tr><td>Item 1A.</td><td style="padding-left:12pt">Risk Factors</td></tr></table>')).toEqual(["text: Item 1A. Risk Factors"]);
    const sentence = "A sentence of a paragraph laid out in a table cell. ".repeat(8).trim();
    expect(kinds(`<table><tr><td>Note</td><td>${sentence}</td></tr><tr><td>Total</td><td>1,234</td></tr></table>`)).toEqual([
      `text: Note ${sentence}`,
      "text: Total 1,234",
    ]);
    // Johnson & Johnson sets some single rows of figures as tables of their own.
    expect(kinds("<p>Sales growth:</p><table><tr><td><div>$</div></td><td><div>11.1</div></td><td><div>(2.2)</div></td></tr></table>")).toEqual([
      "text: Sales growth:",
      "text: $11.1 (2.2)",
    ]);
  });

  it("reads a page set inside one table cell as its own paragraphs and tables", () => {
    const kinds = blocksOf(`<table><tr><td><p>First paragraph.</p><p>Second paragraph.</p>${buybacks}</td></tr></table>`).map((block) => block.kind);
    expect(kinds).toEqual(["text", "text", "table"]);
  });
});
