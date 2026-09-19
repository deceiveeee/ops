import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readDocument, type TextBlock } from "./document";
import { fixtureFileName } from "./edgar";
import { GAP_PX, PAGE_PX, isHeadingBlock, isSubheading, pageForOffset, paginate, paragraphHeight, sectionHeading, sectionPages, textHeight, type Page } from "./pages";
import { extractFilingSections, type ExtractedSection } from "./sections";

/**
 * Paging runs on Atkore's own 10-K text, trimmed to size (see
 * e2e/fixtures/edgar/README.md), because the properties that matter — a
 * paragraph never split, a page as full as the budget allows, an offset always
 * landing on the page that holds it — are the ones a synthetic string of
 * equal-length words would never test.
 *
 * Page counts are not asserted as numbers. The model is tuned against the
 * screen and will move; what must not move is the relationship between blocks,
 * pages and offsets, and the two line breaks the reader was measured to make.
 */

const DOC = "https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/atkr-20250930.htm";
const read = extractFilingSections(readFileSync(join(process.cwd(), "e2e", "fixtures", "edgar", fixtureFileName(DOC)), "utf8"));
const { sections, document } = read;
const business = sections.find((section) => section.id === "business")!;

const isHeading = (item: Page["items"][number], section: ExtractedSection) =>
  isHeadingBlock(document.blocks[section.blocks[item.block].index]);

/** A page's estimated height, for a section of paragraphs and headings. */
const heightOf = (items: Page["items"], section: ExtractedSection) =>
  items.reduce((sum, item, index) => {
    const block = document.blocks[section.blocks[item.block].index] as TextBlock;
    return sum + (index ? GAP_PX : 0) + textHeight(block);
  }, 0);

describe("headings", () => {
  it("tells a heading from a sentence, a bullet and a row of figures", () => {
    for (const heading of ["Products", "iPhone", "COMPETITION", "Wearables, Home and Accessories", "(In millions)", "ATKORE INC.", "Cost of sales:"]) {
      expect(isSubheading(heading), heading).toBe(true);
    }
    for (const line of [
      "The Company designs, manufactures and markets smartphones.",
      "None.",
      "• EMEA",
      "● Direct-to-Consumer",
      "Revenue $ 1,234",
      "Operating margin 33.4%",
      "iPhone® is the Company's line of smartphones based on its iOS operating system and it runs on",
    ]) {
      expect(isSubheading(line), line).toBe(false);
    }
  });

  it("shows a section's heading above its pages, and keeps a first block that is more than a heading on the first page", () => {
    expect(sectionHeading(business, document)).toMatch(/^Item 1\. Business/);

    const body = "The Company faces risks that could harm its business, and each is described below in turn. ".repeat(3);
    const html = `<div>FORM 10-K</div><div>Item 1A. Risk Factors ${body}</div><p>A second paragraph of risks.</p><div>Item 2. Properties</div><p>We own plants.</p>`;
    const result = extractFilingSections(html);
    const risk = result.sections.find((section) => section.id === "risk-factors")!;
    expect(sectionHeading(risk, result.document)).toBeNull();
    expect(sectionPages(risk, result.document)[0].items.map((item) => item.block)).toEqual([0, 1]);
  });
});

describe("the height model, against the reader as measured at 1440", () => {
  it("puts the longest measured one-line paragraph on one line and the shortest two-line one on two", () => {
    // 56 paragraphs of Atkore's 10-K measured in the reader on 2026-09-13: the
    // longest that fitted one line with its Keep button was 58 characters, the
    // shortest that took two was 105. A line is 28px; the Keep button makes the
    // last one 32.
    expect(paragraphHeight(58)).toBe(32);
    expect(paragraphHeight(105)).toBe(60);
  });

  it("gives even an empty paragraph a line, because its Keep button still takes one", () => {
    expect(paragraphHeight(0)).toBe(32);
  });
});

describe("pages", () => {
  it("puts every block under the heading on exactly one page, in order, and leaves out page numbers", () => {
    for (const section of sections) {
      const expected = section.blocks
        .map((place, position) => ({ position, block: document.blocks[place.index] }))
        .filter(({ position, block }) => position > 0 && !(block.kind === "text" && block.furniture))
        .map(({ position }) => position);
      const paged = sectionPages(section, document).flatMap((page) => page.items.map((item) => item.block));
      expect(paged, section.id).toEqual(expected);
    }
    // The fixture's contents keep their page numbers in the text, where they
    // tell entries from headings; none of them is drawn.
    expect(document.blocks.some((block) => block.kind === "text" && block.furniture)).toBe(true);
  });

  it("never splits a paragraph, and runs over the budget only when one paragraph is taller than a page", () => {
    for (const section of sections) {
      for (const page of sectionPages(section, document)) {
        if (heightOf(page.items, section) > PAGE_PX) {
          // The headings above it come with it.
          expect(page.items.filter((item) => !isHeading(item, section))).toHaveLength(1);
        }
      }
    }
  });

  it("fills each page: the next paragraph, with any headings above it, would not have fitted", () => {
    // A paginator that closed pages early would pass the test above while
    // making a learner turn twice as many pages.
    for (const section of sections) {
      const pages = sectionPages(section, document);
      for (let i = 0; i < pages.length - 1; i++) {
        const next = pages[i + 1].items;
        const body = next.findIndex((item) => !isHeading(item, section));
        const withNext = [...pages[i].items, ...next.slice(0, body === -1 ? next.length : body + 1)];
        expect(heightOf(withNext, section), `${section.id} page ${i + 1}`).toBeGreaterThan(PAGE_PX);
      }
    }
  });

  it("never ends a page on a heading, and keeps a heading with the tall paragraph it heads", () => {
    for (const section of sections) {
      const pages = sectionPages(section, document);
      for (const page of pages.slice(0, -1)) expect(isHeading(page.items.at(-1)!, section), `${section.id} page ${page.number}`).toBe(false);
    }
    // Netflix's "Forward-Looking Statements" headed a paragraph taller than a
    // page, and the heading was left alone on the page before it.
    const tall = "These forward-looking statements are subject to risks and uncertainties that could cause results to differ. ".repeat(24);
    const result = extractFilingSections(
      `<div>FORM 10-Q</div><div>Item 2. Management's Discussion and Analysis</div><p>${"Revenue grew in every region this quarter. ".repeat(20)}</p><p>Forward-Looking Statements</p><p>${tall}</p><p>Results of Operations</p><p>Revenue grew.</p><div>Item 3. Quantitative and Qualitative Disclosures About Market Risk</div><p>${"Rates moved. ".repeat(20)}</p>`,
      "10-Q",
    );
    const mdna = result.sections.find((item) => item.id === "mdna")!;
    const texts = sectionPages(mdna, result.document).map((page) => page.items.map((item) => mdna.text.slice(item.start, item.end).slice(0, 26)));
    expect(texts).toEqual([
      ["Revenue grew in every regi"],
      ["Forward-Looking Statements", tall.slice(0, 26)],
      ["Results of Operations", "Revenue grew."],
    ]);

    // The same for a table whose first row alone is taller than a page. A row
    // that long is a caption, not headings, so later pages do not repeat it.
    const label = "Segment results before the allocation of corporate costs, as the chief operating decision maker reviews them. ".repeat(11);
    const figures = Array.from({ length: 4 }, (_, i) => `<tr><td>Segment ${i}</td><td>1,${100 + i}</td><td>2,${100 + i}</td></tr>`).join("");
    const withTable = extractFilingSections(
      `<div>FORM 10-Q</div><div>Item 2. Management's Discussion and Analysis</div><p>${"Revenue grew in every region this quarter. ".repeat(20)}</p><p>Segment Results</p><table><tr><td>${label}</td><td>2026</td><td>2025</td></tr>${figures}</table><div>Item 3. Quantitative and Qualitative Disclosures About Market Risk</div><p>${"Rates moved. ".repeat(20)}</p>`,
      "10-Q",
    );
    const discussion = withTable.sections.find((item) => item.id === "mdna")!;
    const pages = sectionPages(discussion, withTable.document);
    expect(pages.map((page) => page.items.length)).toEqual([1, 2, 1]);
    expect(pages[1].items[1].rows).toEqual({ from: 0, to: 1 });
    expect(pages[2].items[0].rows).toEqual({ from: 1, to: 5 });
  });

  describe("a table of figures", () => {
    const rows = 40;
    const table = `<table><tr><td></td><td>2026</td><td>2025</td></tr>${Array.from(
      { length: rows },
      (_, i) => `<tr><td>Segment ${i}</td><td>1,${String(100 + i)}</td><td>2,${String(100 + i)}</td></tr>`,
    ).join("")}</table>`;
    // A paragraph of real length after the table, as every real discussion has:
    // a section of nothing but short lines ending in years reads as a contents list.
    const after = "Revenue rose in every segment, led by the segments that sell to data centers, where demand for electrical infrastructure grew fastest, and in the segments that sell to utilities.";
    const filing = (before: string) =>
      extractFilingSections(`<div>FORM 10-K</div><div>Item 7. Management's Discussion and Analysis</div>${before}${table}<p>${after}</p><div>Item 8. Financial Statements</div><p>See the statements.</p>`);

    /** Which of the table's rows each page holds, as [first, last]. */
    const rowSpans = (pages: Page[]) =>
      pages.map((page) => page.items.filter((item) => item.rows).flatMap((item) => [item.rows!.from, item.rows!.to - 1]));

    it("breaks between rows, sized as table rows, and counts the headings repeated on a page that continues it", () => {
      // Worked by hand from the model. Page 1: the intro (32px), then the table
      // opens with gap, space and Keep row and its heading (12 + 52 + 29) and
      // sixteen rows of 29px, 589 in all. Page 2 opens part of the way down, so
      // it pays the space, the repeated heading and a row (52 + 29 + 29) and
      // holds seventeen rows, 574. Sized as paragraphs, or without the repeated
      // heading, these spans move.
      const result = filing("<p>Revenue by segment was as follows:</p>");
      const mdna = result.sections.find((section) => section.id === "mdna")!;
      const pages = sectionPages(mdna, result.document);
      expect(rowSpans(pages)).toEqual([[0, 16], [17, 33], [34, 40]]);
      expect(mdna.text.slice(pages[2].items.at(-1)!.start, pages[2].items.at(-1)!.end)).toBe(after);
      // Each part of the table spans exactly its rows of the section's text.
      for (const page of pages) {
        for (const item of page.items.filter((entry) => entry.rows)) {
          expect(mdna.text.slice(item.start, item.end).split("\n")).toHaveLength(item.rows!.to - item.rows!.from);
        }
      }
    });

    it("never ends a page on a table's headings", () => {
      // A 17-line paragraph is 480px, which leaves room for the heading row's
      // 93px but not for the heading and a first row together.
      const result = filing(`<p>${"word ".repeat(300).trim()}</p>`);
      const mdna = result.sections.find((section) => section.id === "mdna")!;
      const pages = sectionPages(mdna, result.document);
      expect(pages[0].items).toHaveLength(1);
      expect(pages[1].items[0].rows?.from).toBe(0);
      for (const page of pages) {
        const last = page.items.filter((item) => item.rows).at(-1);
        if (last) expect(last.rows!.to - 1, `page ${page.number}`).toBeGreaterThanOrEqual(1);
      }
    });
  });

  it("numbers pages from 1 and gives each its span in the section text", () => {
    const pages = sectionPages(business, document);
    expect(pages.length).toBeGreaterThan(5);
    pages.forEach((page, index) => {
      expect(page.number).toBe(index + 1);
      expect(page.start).toBe(page.items[0].start);
      expect(page.end).toBe(page.items[page.items.length - 1].end);
    });
  });

  it("has nothing to page in a section that is only a heading", () => {
    const heading = readDocument("<div>Item 3. Legal Proceedings</div>");
    expect(paginate({ blocks: [{ index: 0, start: 0, end: 25 }] }, heading)).toEqual([]);
    expect(pageForOffset([], 500)).toBe(1);
  });
});

describe("the page an offset is on", () => {
  it("is the page that holds it", () => {
    const pages = sectionPages(business, document);
    const at = business.text.indexOf("PVC resin");
    const page = pages[pageForOffset(pages, at) - 1];
    expect(at).toBeGreaterThanOrEqual(page.start);
    expect(at).toBeLessThan(page.end);
  });

  it("reaches the first mention of PVC resin, which the old excerpt never could", () => {
    // The reader used to show 2,600 characters of each section. Atkore's first
    // mention of the input whose price moves its margins is well past that.
    const at = business.text.indexOf("PVC resin");
    expect(at).toBeGreaterThan(2_600);
    expect(pageForOffset(sectionPages(business, document), at)).toBeGreaterThan(1);
  });

  it("lands an offset in the heading on page 1 and one past the end on the last page", () => {
    const pages = sectionPages(business, document);
    expect(pageForOffset(pages, 0)).toBe(1);
    expect(pageForOffset(pages, business.text.length + 1_000)).toBe(pages.length);
  });
});
