import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureFileName } from "./edgar";
import { PAGE_PX, estimateHeight, isSubheading, pageForOffset, paginate, paragraphHeight, paragraphsOf } from "./pages";
import { extractFilingSections } from "./sections";
import { parseTable, rowText } from "./tables";

/**
 * Paging runs on Atkore's own 10-K text, trimmed to size (see
 * e2e/fixtures/edgar/README.md), because the properties that matter — a
 * paragraph never split, a page as full as the budget allows, an offset always
 * landing on the page that holds it — are the ones a synthetic string of
 * equal-length words would never test.
 *
 * Page counts are not asserted as numbers. The model is tuned against the
 * screen and will move; what must not move is the relationship between
 * paragraphs, pages and offsets, and the two line breaks the reader was
 * measured to make.
 */

const DOC = "https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/atkr-20250930.htm";
const html = readFileSync(join(process.cwd(), "e2e", "fixtures", "edgar", fixtureFileName(DOC)), "utf8");
const sections = extractFilingSections(html).sections;
const business = sections.find((section) => section.id === "business")!;

describe("paragraphs", () => {
  it("records where each paragraph sits, exactly", () => {
    const paragraphs = paragraphsOf(business.text);
    expect(paragraphs.length).toBeGreaterThan(50);
    for (const paragraph of paragraphs) {
      expect(business.text.slice(paragraph.start, paragraph.end)).toBe(paragraph.text);
      expect(paragraph.text).toBe(paragraph.text.trim());
    }
    expect(paragraphs[0].text).toMatch(/^Item 1\./);
  });

  it("leaves out page numbers, contents links and running footers, without moving any offset", () => {
    const text = "Item 2. Management's Discussion\nRevenue grew.\n26\nTable of Contents\nApple Inc. | Q3 2026 Form 10-Q | 23\nCosts fell 12% in 2026.";
    const paragraphs = paragraphsOf(text);
    expect(paragraphs.map((p) => p.text)).toEqual(["Item 2. Management's Discussion", "Revenue grew.", "Costs fell 12% in 2026."]);
    expect(text.slice(paragraphs[2].start, paragraphs[2].end)).toBe("Costs fell 12% in 2026.");
    // A lone year is not a page number: it has four digits.
    expect(paragraphsOf("Heading\n2026").map((p) => p.text)).toEqual(["Heading", "2026"]);
  });

  it("tells a heading from a sentence, a bullet and a row of figures", () => {
    for (const heading of ["Products", "iPhone", "COMPETITION", "Wearables, Home and Accessories", "(In millions)", "ATKORE INC.", "Cost of sales:"]) {
      expect(isSubheading(heading), heading).toBe(true);
    }
    for (const line of [
      "The Company designs, manufactures and markets smartphones.",
      "None.",
      "• EMEA",
      "Revenue $ 1,234",
      "Operating margin 33.4%",
      "iPhone® is the Company's line of smartphones based on its iOS operating system and it runs on",
    ]) {
      expect(isSubheading(line), line).toBe(false);
    }
  });

  it("finds offsets past lines that carry stray spaces", () => {
    const paragraphs = paragraphsOf("Heading\n   indented line  \n\nnext");
    expect(paragraphs.map((p) => [p.text, p.start])).toEqual([["Heading", 0], ["indented line", 11], ["next", 28]]);
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
  it("puts every paragraph of the body on exactly one page, in order, and leaves the heading off", () => {
    for (const section of sections) {
      const body = paragraphsOf(section.text).slice(1);
      const paged = paginate(section.text).flatMap((page) => page.paragraphs);
      expect(paged.map((p) => p.index)).toEqual(body.map((p) => p.index));
    }
  });

  it("never splits a paragraph, and runs over the budget only when one paragraph is taller than a page", () => {
    for (const section of sections) {
      for (const page of paginate(section.text)) {
        if (estimateHeight(page.paragraphs) > PAGE_PX) expect(page.paragraphs).toHaveLength(1);
      }
    }
  });

  it("fills each page: the next paragraph would not have fitted", () => {
    // A paginator that closed pages early would pass the test above while
    // making a learner turn twice as many pages.
    for (const section of sections) {
      const pages = paginate(section.text);
      for (let i = 0; i < pages.length - 1; i++) {
        const withNext = [...pages[i].paragraphs, pages[i + 1].paragraphs[0]];
        expect(estimateHeight(withNext), `${section.id} page ${i + 1}`).toBeGreaterThan(PAGE_PX);
      }
    }
  });

  it("pages a table of short lines by how many lines it has, not how few characters", () => {
    // The case that broke the character count: forty one-line rows of a
    // financial table are 1,200 characters, half of what the old page held, and
    // rendered far taller than the screen.
    const table = ["Item 7. Management's Discussion", ...Array.from({ length: 40 }, (_, i) => `Net sales segment ${String(i).padStart(2, "0")}  $ 1,234.5`)].join("\n");
    const pages = paginate(table);
    expect(pages.length).toBeGreaterThan(1);
    for (const page of pages) expect(estimateHeight(page.paragraphs)).toBeLessThanOrEqual(PAGE_PX);
  });

  describe("a table of figures", () => {
    const rows = 40;
    const table = parseTable(
      `<table><tr><td></td><td>2026</td><td>2025</td></tr>${Array.from({ length: rows }, (_, i) => `<tr><td>Segment ${i}</td><td>1,${String(100 + i)}</td><td>2,${String(100 + i)}</td></tr>`).join("")}</table>`,
    )!;
    const intro = "Revenue by segment was as follows:";
    const lines = table.rows.map(rowText);
    const text = ["Item 2. Management's Discussion", intro, ...lines, "Revenue rose in every segment."].join("\n");
    const start = text.indexOf(lines[0]);
    const tables = [{ ...table, start, end: start + lines.join("\n").length }];

    it("marks each row with its table and its place in it", () => {
      const rowsFound = paragraphsOf(text, tables).filter((paragraph) => paragraph.table);
      expect(rowsFound).toHaveLength(rows + 1);
      expect(rowsFound.map((paragraph) => paragraph.table!.row)).toEqual(Array.from({ length: rows + 1 }, (_, i) => i));
    });

    /** Which table rows each page holds, as [first, last]. */
    const rowSpans = (pages: ReturnType<typeof paginate>) =>
      pages.map((page) => {
        const rowsOnPage = page.paragraphs.filter((paragraph) => paragraph.table).map((paragraph) => paragraph.table!.row);
        return rowsOnPage.length ? [rowsOnPage[0], rowsOnPage[rowsOnPage.length - 1]] : [];
      });

    it("breaks between rows, sized as table rows, repeating the headings' height on a page that continues it", () => {
      // Worked by hand from the model. Page 1: the intro (32px), then the table
      // opens with gap, space and Keep row, and its heading (12 + 52 + 33) and
      // fourteen rows of 33px, 591 in all. Page 2 opens part of the way down, so
      // it pays the space, the repeated heading and a row (52 + 33 + 33) and holds
      // fifteen rows, 580. Sized as paragraphs, or without the repeated heading,
      // these spans move.
      const pages = paginate(text, PAGE_PX, tables);
      expect(rowSpans(pages)).toEqual([[0, 14], [15, 29], [30, 40]]);
      expect(pages[2].paragraphs.at(-1)!.text).toBe("Revenue rose in every segment.");
      expect(pages.flatMap((page) => page.paragraphs).map((paragraph) => paragraph.index)).toEqual(paragraphsOf(text).slice(1).map((paragraph) => paragraph.index));
    });

    it("never ends a page on a table's headings", () => {
      // A 17-line paragraph is 480px, which leaves room for the heading row's 97px
      // but not for the heading and a first row together.
      const long = "word ".repeat(301).trim();
      const crowded = ["Item 2. Management's Discussion", long, ...lines].join("\n");
      const at = crowded.indexOf(lines[0]);
      const pages = paginate(crowded, PAGE_PX, [{ ...table, start: at, end: at + lines.join("\n").length }]);
      expect(pages[0].paragraphs).toHaveLength(1);
      expect(pages[1].paragraphs[0].table).toEqual({ index: 0, row: 0 });
      for (const page of pages) expect(table.rows[page.paragraphs.at(-1)!.table?.row ?? 1].header).toBe(false);
    });
  });

  it("numbers pages from 1 and gives each its span in the section text", () => {
    const pages = paginate(business.text);
    pages.forEach((page, index) => {
      expect(page.number).toBe(index + 1);
      expect(page.start).toBe(page.paragraphs[0].start);
      expect(page.end).toBe(page.paragraphs[page.paragraphs.length - 1].end);
    });
  });

  it("has nothing to page in a section that is only a heading", () => {
    expect(paginate("Item 3. Legal Proceedings")).toEqual([]);
    expect(pageForOffset([], 500)).toBe(1);
  });
});

describe("the page an offset is on", () => {
  it("is the page that holds it", () => {
    const pages = paginate(business.text);
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
    expect(pageForOffset(paginate(business.text), at)).toBeGreaterThan(1);
  });

  it("lands an offset in the heading on page 1 and one past the end on the last page", () => {
    const pages = paginate(business.text);
    expect(pageForOffset(pages, 0)).toBe(1);
    expect(pageForOffset(pages, business.text.length + 1_000)).toBe(pages.length);
  });
});
