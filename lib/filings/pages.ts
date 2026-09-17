/**
 * A filing section, split into pages a person can read without scrolling.
 *
 * Atkore's FY2025 10-K runs to 61,130 characters of management's discussion
 * and 161,512 of financial statements. Until this existed the reader showed the
 * first 2,600 characters of each section and sent the learner to sec.gov for
 * the rest — and the first mention of PVC resin, the input whose price moves
 * Atkore's margins, sits 8,274 characters into the business section, where no
 * excerpt could ever reach it.
 *
 * Pages break between paragraphs, never inside one. A sentence cut in half at
 * a page boundary is harder to read than a page that runs a little long, and a
 * passage a learner keeps must be a paragraph they could actually see whole.
 *
 * **Sized by height, not by characters.** The first version counted characters,
 * and at 1440 a page of 2,364 characters of management's discussion rendered
 * 1,708px tall while 2,242 characters of business rendered 968px. The
 * discussion page was a financial table, extracted as dozens of one-line
 * paragraphs, and a paragraph costs a line and a gap however short it is. So a
 * page is filled against an estimate of the height it will take on screen,
 * from a model calibrated on 56 paragraphs of Atkore's 10-K measured in the
 * reader at 1440 on 2026-09-13, which put every one of them on the right number
 * of lines.
 *
 * Positions are still characters of the section's own text, so an offset found
 * by search, kept as evidence, or carried in a link means the same place in all
 * three.
 *
 * **Tables are rows, not paragraphs.** A table of figures is drawn as a table,
 * one row to a line of text, so its rows are sized as table rows, a page breaks
 * between rows rather than before the whole table, and a page that opens part of
 * the way down a table repeats its headings, because a column of figures without
 * them is the list of loose numbers this replaced.
 */

import { isPageFurniture, type ExtractedSection, type TextTable } from "./sections";

/**
 * Characters to a line of the reader's 15px text in its 643px column at 1440:
 * the median of 23 measured paragraphs of three lines or more (range 79–101).
 */
export const LINE_CHARS = 89;
const LINE_PX = 28;
/**
 * The Keep button rides on each paragraph's last line. It takes about six
 * characters of width and makes that line 32px rather than 28, which is why
 * every paragraph measured was exactly 4px taller than its lines.
 */
const KEEP_CHARS = 6;
const KEEP_PX = 4;
/** Space between paragraphs, measured. */
export const GAP_PX = 12;

/**
 * The height one page's text may take, at 1440.
 *
 * The screen budget is 1,350px. Measured on 2026-09-13, once the heading and
 * section tabs were tightened, everything around a page's text — the workspace
 * frame, the heading with search beside it, the tabs, the section heading and
 * the page controls — takes 426px above its first paragraph and 271px below
 * its last. That leaves 653px, and this keeps 53 of them in hand.
 */
export const PAGE_PX = 600;

export type Paragraph = {
  /** Position among the section's paragraphs, the heading being 0. */
  index: number;
  /** Offset of the first character in the section text. */
  start: number;
  /** Offset one past the last character. */
  end: number;
  text: string;
  /** For a row of a table: which of the section's tables, and which of its rows. */
  table?: { index: number; row: number };
};

/**
 * A table row's height at 1440: 13px text on a 20px line with 6px above and
 * below, and a 1px rule. A label longer than a line of the label column wraps.
 */
export const TABLE_ROW_PX = 33;
const TABLE_LINE_PX = 20;
const TABLE_LABEL_CHARS = 42;
/** Space above a table, and the Keep button's row under it. */
export const TABLE_CHROME_PX = 52;

type PageableTable = Pick<TextTable, "start" | "end" | "rows">;

export type Page = {
  /** Counted from 1, because that is how a person counts pages. */
  number: number;
  paragraphs: Paragraph[];
  start: number;
  end: number;
};

/** The estimated height of one paragraph on screen at 1440, its Keep button included. */
export function paragraphHeight(length: number): number {
  return Math.max(1, Math.ceil((length + KEEP_CHARS) / LINE_CHARS)) * LINE_PX + KEEP_PX;
}

/** The estimated height of a run of paragraphs, with the gaps between them. */
export function estimateHeight(paragraphs: readonly { text: string }[]): number {
  return paragraphs.reduce(
    (sum, paragraph, index) => sum + (index ? GAP_PX : 0) + paragraphHeight(paragraph.text.length),
    0,
  );
}


/**
 * The section's paragraphs, each with where it sits in the section text.
 *
 * The extractor keeps block boundaries as newlines, so a line is a paragraph.
 * Offsets are found by walking the text rather than by summing lengths, because
 * trimming removes a variable amount of space from each line.
 */
export function paragraphsOf(sectionText: string, tables: readonly Pick<TextTable, "start" | "end">[] = []): Paragraph[] {
  const out: Paragraph[] = [];
  const rows = new Map<number, number>();
  let cursor = 0;
  for (const raw of sectionText.split("\n")) {
    const lineStart = cursor;
    cursor += raw.length + 1;
    const text = raw.trim();
    if (!text) continue;
    const start = lineStart + raw.indexOf(text);
    const paragraph: Paragraph = { index: out.length, start, end: start + text.length, text };
    const tableIndex = tables.findIndex((table) => start >= table.start && start < table.end);
    if (tableIndex === -1 && isPageFurniture(text)) continue;
    if (tableIndex !== -1) {
      const row = rows.get(tableIndex) ?? 0;
      rows.set(tableIndex, row + 1);
      paragraph.table = { index: tableIndex, row };
    }
    out.push(paragraph);
  }
  return out;
}

/** A table row's estimated height, from how far its label wraps. */
export function rowHeight(row: PageableTable["rows"][number]): number {
  const label = row.cells.find((cell) => cell.column === 0)?.text ?? "";
  return (Math.max(1, Math.ceil(label.length / TABLE_LABEL_CHARS)) - 1) * TABLE_LINE_PX + TABLE_ROW_PX;
}

/** The height of a table's headings, which open it and are repeated on a page that continues it. */
function headingsHeight(table: PageableTable): number {
  return table.rows.filter((row) => row.header).reduce((sum, row) => sum + rowHeight(row), 0);
}

/**
 * The section's body as pages. The heading, paragraph 0, is not on any page:
 * the reader shows it above whichever page is open.
 */
export function paginate(sectionText: string, budget = PAGE_PX, tables: readonly PageableTable[] = []): Page[] {
  const body = paragraphsOf(sectionText, tables).slice(1);
  const pages: Page[] = [];
  let current: Paragraph[] = [];
  let used = 0;

  const close = () => {
    if (!current.length) return;
    pages.push({
      number: pages.length + 1,
      paragraphs: current,
      start: current[0].start,
      end: current[current.length - 1].end,
    });
    current = [];
    used = 0;
  };

  for (const paragraph of body) {
    const place = paragraph.table;
    if (place) {
      const table = tables[place.index];
      const row = table.rows[place.row];
      // What placing this row costs on the page as it stands: a row that goes on
      // with the table above it costs itself; a table that opens here costs its
      // headings and its first figures together, so no page ends on headings
      // alone; and a page that starts part of the way down a table repeats them.
      const cost = () => {
        const gap = current.length ? GAP_PX : 0;
        if (current[current.length - 1]?.table?.index === place.index) return { check: rowHeight(row), add: rowHeight(row) };
        if (row.header) {
          const firstFigures = table.rows.find((item) => !item.header);
          return {
            check: gap + TABLE_CHROME_PX + headingsHeight(table) + (firstFigures ? rowHeight(firstFigures) : 0),
            add: gap + TABLE_CHROME_PX + rowHeight(row),
          };
        }
        const height = gap + TABLE_CHROME_PX + (place.row > 0 ? headingsHeight(table) : 0) + rowHeight(row);
        return { check: height, add: height };
      };
      if (current.length && used + cost().check > budget) close();
      used += cost().add;
      current.push(paragraph);
      continue;
    }
    const height = paragraphHeight(paragraph.text.length);
    // A paragraph that would overflow starts the next page, unless the page is
    // empty: then it is simply a tall page, because a paragraph is not split.
    if (current.length && used + GAP_PX + height > budget) close();
    used += (current.length ? GAP_PX : 0) + height;
    current.push(paragraph);
  }
  close();
  return pages;
}

/**
 * A line that heads what follows rather than saying something: Apple's
 * "Products" and "iPhone", Netflix's "COMPETITION", a statement's "(In
 * millions)". The reader draws these as headings, without a Keep button of
 * their own: with one, they read as a column of loose quotations between the
 * paragraphs they introduce.
 *
 * A heading is short, has words, carries no figures, and does not end a
 * sentence; a line in capitals is a heading whatever it ends with, as in
 * "ATKORE INC.". A bullet is a list item, never a heading.
 */
export function isSubheading(text: string): boolean {
  const line = text.trim();
  if (line.length > 90 || !/[A-Za-z].*[A-Za-z]/.test(line) || /^[•·\-–—*]/.test(line)) return false;
  if (/\$|\d{1,3}(,\d{3})+|\d\.\d/.test(line)) return false;
  if (!/[a-z]/.test(line)) return true;
  return !/[.;,!?]$/.test(line) && line.split(/\s+/).length <= 12;
}

/** A section's pages, with its tables sized as tables. Search, links and the reader all page this way. */
export function sectionPages(section: Pick<ExtractedSection, "text" | "tables">): Page[] {
  return paginate(section.text, PAGE_PX, section.tables);
}

/**
 * Which page holds an offset. An offset in the heading, or past the end, is
 * placed on the nearest page rather than refused, so a link never lands nowhere.
 */
export function pageForOffset(pages: Page[], offset: number): number {
  if (!pages.length) return 1;
  for (const page of pages) if (offset < page.end) return page.number;
  return pages[pages.length - 1].number;
}
