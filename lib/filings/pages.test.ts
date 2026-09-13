import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureFileName } from "./edgar";
import { PAGE_PX, estimateHeight, pageForOffset, paginate, paragraphHeight, paragraphsOf } from "./pages";
import { extractFilingSections } from "./sections";

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
