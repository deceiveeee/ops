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
 * Pages break between the filing's own blocks, never inside a paragraph. A
 * sentence cut in half at a page boundary is harder to read than a page that
 * runs a little long, and a passage a learner keeps must be a paragraph they
 * could actually see whole.
 *
 * **Sized by height, not by characters.** A page is filled against an estimate
 * of the height it will take on screen at 1440, from a model calibrated on 56
 * paragraphs of Atkore's 10-K measured in the reader on 2026-09-13.
 *
 * **Tables break between rows.** A table is the filing's own table, so its rows
 * are sized as table rows, a page breaks between them rather than before the
 * whole table, and a page that opens part of the way down a table repeats its
 * headings, because a column of figures without them is a list of loose numbers.
 *
 * Positions are characters of the section's own text, so an offset found by
 * search, kept as evidence, or carried in a link means the same place in all
 * three.
 */

import type { DocumentBlock, FilingDocument, TableBlock, TextBlock } from "./document";
import type { ExtractedSection } from "./sections";

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
 * The screen budget is 1,350px. Measured on 2026-09-13, everything around a
 * page's text — the workspace frame, the heading with search beside it, the
 * tabs, the section heading and the page controls — takes 426px above its first
 * paragraph and 271px below its last. That leaves 653px, and this keeps 53 in hand.
 */
export const PAGE_PX = 600;

/** A table row at 1440: 13px text on a 20px line with padding and a rule. A long label wraps. */
export const TABLE_ROW_PX = 29;
const TABLE_LINE_PX = 20;
const TABLE_LABEL_CHARS = 42;
/** Space above a table, and the Keep button's row under it. */
export const TABLE_CHROME_PX = 52;

/**
 * The room a reader has, which sets how much goes on a page: characters to a
 * line of its text, and the height its text may take. The reader's browser
 * measures both (`lib/filings/fit.ts`); without a measurement, pages are sized
 * for 1440. A phone's column holds 42 characters to a line against 89, and the
 * frame around the text leaves it less than a third of the height.
 */
export type Fit = {
  lineChars: number;
  pagePx: number;
  /** Whether the section's heading is drawn at the top of its first page, and so takes room there. */
  headingFirst: boolean;
};

export const DEFAULT_FIT: Fit = { lineChars: LINE_CHARS, pagePx: PAGE_PX, headingFirst: false };

/** A section heading's line: 17px text on a 26px line, with the space under it. */
const SECTION_HEADING_LINE_PX = 26;
const SECTION_HEADING_GAP_PX = 12;

/** Something on a page: one of the section's blocks, or some rows of a table. */
export type PageItem = {
  /** Position among the section's blocks, the heading's block being 0. */
  block: number;
  /** For part of a table, which rows: from `from` up to, not including, `to`. */
  rows?: { from: number; to: number };
  /** For part of a paragraph too tall for a page, which characters of its text. */
  chars?: { from: number; to: number };
  /** Offset of the first character in the section text. */
  start: number;
  /** Offset one past the last character. */
  end: number;
};

export type Page = {
  /** Counted from 1, because that is how a person counts pages. */
  number: number;
  items: PageItem[];
  start: number;
  end: number;
};

/** The estimated height of one paragraph on screen, its Keep button included. */
export function paragraphHeight(length: number, lineChars = LINE_CHARS): number {
  return Math.max(1, Math.ceil((length + KEEP_CHARS) / lineChars)) * LINE_PX + KEEP_PX;
}

/**
 * A line that heads what follows rather than saying something: Apple's
 * "Products" and "iPhone", Netflix's "COMPETITION", a statement's "(In
 * millions)". It has no Keep button of its own: with one, headings read as a
 * column of loose quotations between the paragraphs they introduce.
 *
 * A heading is short, has words, carries no figures, and does not end a
 * sentence; a line in capitals is a heading whatever it ends with, as in
 * "ATKORE INC.". A bullet is a list item, never a heading.
 */
export function isSubheading(text: string): boolean {
  const line = text.trim();
  if (line.length > 90 || !/[A-Za-z].*[A-Za-z]/.test(line) || /^[•·●◦▪■○\-–—*]/.test(line)) return false;
  if (/\$|\d{1,3}(,\d{3})+|\d\.\d/.test(line)) return false;
  if (!/[a-z]/.test(line)) return true;
  return !/[.;,!?]$/.test(line) && line.split(/\s+/).length <= 12;
}

/** Whether a block is drawn as a heading: a short label, or a line the company set in bold. */
export function isHeadingBlock(block: DocumentBlock): boolean {
  return block.kind === "text" && (isSubheading(block.text) || (block.bold >= 0.9 && block.text.length <= 200));
}

/** Space above a heading, which sets it off from the paragraph before. */
const HEADING_PAD_PX = 8;

/** A paragraph's or a heading's estimated height. */
export function textHeight(block: TextBlock, lineChars = LINE_CHARS): number {
  return isHeadingBlock(block)
    ? Math.max(1, Math.ceil(block.text.length / lineChars)) * LINE_PX + HEADING_PAD_PX
    : paragraphHeight(block.text.length, lineChars);
}

/** Longest heading drawn above a section's pages rather than on them. */
const HEADING_MAX = 200;

/**
 * The line that heads a section, or null when its first block is more than a
 * heading. A filer may set "Item 1A. Risk Factors" and the first paragraph
 * under it in one block, or the heading in a table with the text beside it;
 * that block then stays on the first page, so nothing under the heading is lost.
 */
export function sectionHeading(section: Pick<ExtractedSection, "blocks">, document: Pick<FilingDocument, "blocks">): string | null {
  const first = section.blocks[0];
  const block = first ? document.blocks[first.index] : undefined;
  if (!block) return null;
  if (block.kind === "table") return block.rowStarts.length === 1 && block.text.length <= HEADING_MAX ? block.text : null;
  return block.text.length <= HEADING_MAX ? block.text : null;
}

/**
 * A table row's estimated height, from how far its label wraps. The label
 * column narrows with the text column, down to its 9rem minimum.
 */
function rowHeight(table: TableBlock, row: number, lineChars = LINE_CHARS): number {
  const labelChars = Math.max(18, Math.round((TABLE_LABEL_CHARS * lineChars) / LINE_CHARS));
  return (Math.max(1, Math.ceil((table.labelLengths[row] ?? 0) / labelChars)) - 1) * TABLE_LINE_PX + TABLE_ROW_PX;
}

function headingsHeight(table: TableBlock, lineChars = LINE_CHARS): number {
  let height = 0;
  for (let row = 0; row < table.headerRows; row += 1) height += rowHeight(table, row, lineChars);
  return height;
}

/** The fewest lines a part of a split paragraph has, so no page ends on a line or two of it. */
const PART_MIN_LINES = 3;
const PART_MIN_PX = PART_MIN_LINES * LINE_PX + KEEP_PX;

/**
 * Where to end a part of a paragraph that must go no further than `limit`:
 * after the last sentence that ends by then, or, when that would leave the part
 * less than a third of what fits, at the last space.
 */
function cutAt(text: string, from: number, limit: number): number {
  const stretch = text.slice(from, limit + 1);
  let sentence = -1;
  for (const match of stretch.matchAll(/[.!?;:]["')\]]?(?= )/g)) sentence = match.index + match[0].length;
  if (sentence > (limit - from) / 3) return from + sentence;
  const space = stretch.lastIndexOf(" ");
  return space > 0 ? from + space : limit;
}

/** Where a table's row ends in its block's text. */
function rowEnd(table: TableBlock, row: number): number {
  return row + 1 < table.rowStarts.length ? table.rowStarts[row + 1] - 1 : table.text.length;
}

/**
 * A section's body as pages, sized to the reader's room. The heading's block is
 * not an item on any page: the reader draws it above the first page, where it
 * takes room when `fit.headingFirst` says so. A first block that is more than a
 * heading is on the first page.
 */
export function paginate(
  section: Pick<ExtractedSection, "blocks">,
  document: Pick<FilingDocument, "blocks">,
  fit: Fit = DEFAULT_FIT,
): Page[] {
  const { lineChars, pagePx: budget } = fit;
  const pages: Page[] = [];
  let current: PageItem[] = [];
  const title = sectionHeading(section, document);
  // The section's heading, drawn at 17px over the first page's text.
  const headingRoom = fit.headingFirst && title !== null
    ? Math.max(1, Math.ceil(title.length / Math.max(20, Math.floor(lineChars * 0.85)))) * SECTION_HEADING_LINE_PX + SECTION_HEADING_GAP_PX
    : 0;
  let used = headingRoom;
  /** Whether the page holds nothing yet but headings, which are never left at the foot of a page. */
  let headingsOnly = true;

  const close = () => {
    if (!current.length) return;
    pages.push({ number: pages.length + 1, items: current, start: current[0].start, end: current[current.length - 1].end });
    current = [];
    used = 0;
    headingsOnly = true;
  };

  /** The height a heading must bring with it: any headings after it and the start of what they head. */
  const following = (position: number): number => {
    let need = 0;
    for (let next = position + 1; next < section.blocks.length; next += 1) {
      const block = document.blocks[section.blocks[next].index];
      if (block.kind === "text" && block.furniture) continue;
      if (block.kind === "table") {
        return need + GAP_PX + TABLE_CHROME_PX + headingsHeight(block, lineChars) + rowHeight(block, Math.min(block.headerRows, block.rowStarts.length - 1), lineChars);
      }
      // A paragraph too tall for any page is split, and only its first lines need come with the heading.
      const height = textHeight(block, lineChars);
      need += GAP_PX + (!isHeadingBlock(block) && height > budget ? PART_MIN_PX : height);
      if (!isHeadingBlock(block)) return need;
    }
    return need;
  };

  const headed = title !== null;
  section.blocks.forEach((place, position) => {
    if (position === 0 && headed) return;
    const block = document.blocks[place.index];
    if (block.kind === "text" && block.furniture) return;
    const height = block.kind === "text" ? textHeight(block, lineChars) : 0;
    const left = budget - used - (current.length ? GAP_PX : 0);
    // A paragraph under headings that cannot follow them whole: Intel's "Our
    // Strategy" and its 652 characters were a page and a half of a phone.
    const underHeadings = current.length > 0 && headingsOnly && height > left && left >= PART_MIN_PX;
    if (block.kind === "text" && !isHeadingBlock(block) && (height > budget || underHeadings)) {
      // Taller than a whole page, as a long paragraph is on a phone, or than
      // what its heading leaves: it fills what room is left and goes on over
      // the next pages, split after a sentence, each part a paragraph of its
      // own to read and keep, and none of fewer than three lines.
      const { text } = block;
      let from = 0;
      while (from < text.length) {
        if (current.length && !headingsOnly && budget - used - GAP_PX < PART_MIN_PX) close();
        const room = budget - used - (current.length ? GAP_PX : 0);
        let fits = Math.max(PART_MIN_LINES, Math.floor((room - KEEP_PX) / LINE_PX)) * lineChars - KEEP_CHARS;
        const rest = text.length - from - fits;
        if (rest > 0 && rest < PART_MIN_LINES * lineChars) fits = Math.max(PART_MIN_LINES * lineChars, text.length - from - PART_MIN_LINES * lineChars);
        const to = from + fits >= text.length ? text.length : cutAt(text, from, from + fits);
        used += (current.length ? GAP_PX : 0) + paragraphHeight(to - from, lineChars);
        current.push({ block: position, chars: { from, to }, start: place.start + from, end: place.start + to });
        headingsOnly = false;
        from = to;
        while (text[from] === " ") from += 1;
        if (from < text.length) close();
      }
      return;
    }
    if (block.kind === "text") {
      const heading = isHeadingBlock(block);
      // A paragraph that would overflow starts the next page. So does a heading
      // when it and the start of what it heads would not fit: Netflix's
      // "Forward-Looking Statements" ended a page of its own, its paragraph on the
      // next. On a page that holds only headings so far, what they head stays
      // with them, as a tall page if need be, because a paragraph is not split.
      const overflows = headingsOnly
        ? heading && used + GAP_PX + height > budget
        : used + GAP_PX + (heading ? height + following(position) : height) > budget;
      if (current.length && overflows) close();
      used += (current.length ? GAP_PX : 0) + height;
      current.push({ block: position, start: place.start, end: place.end });
      headingsOnly = headingsOnly && heading;
      return;
    }

    for (let row = 0; row < block.rowStarts.length; row += 1) {
      // What placing this row costs on the page as it stands: a row that goes on
      // with the table above it costs itself; a table that opens here costs its
      // headings and its first figures together, so no page ends on headings
      // alone; and a page that starts part of the way down a table repeats them.
      const cost = () => {
        const last = current[current.length - 1];
        const gap = current.length ? GAP_PX : 0;
        if (last?.block === position && last.rows?.to === row) return { check: rowHeight(block, row, lineChars), add: rowHeight(block, row, lineChars) };
        if (row < block.headerRows) {
          return {
            check: gap + TABLE_CHROME_PX + headingsHeight(block, lineChars) + rowHeight(block, Math.min(block.headerRows, block.rowStarts.length - 1), lineChars),
            add: gap + TABLE_CHROME_PX + rowHeight(block, row, lineChars),
          };
        }
        const height = gap + TABLE_CHROME_PX + (row > 0 ? headingsHeight(block, lineChars) : 0) + rowHeight(block, row, lineChars);
        return { check: height, add: height };
      };
      let placed = cost();
      if (current.length && !headingsOnly && used + placed.check > budget) {
        close();
        placed = cost();
      }
      headingsOnly = false;
      const last = current[current.length - 1];
      const end = place.start + rowEnd(block, row);
      if (last?.block === position && last.rows?.to === row) {
        last.rows.to = row + 1;
        last.end = end;
      } else {
        current.push({ block: position, rows: { from: row, to: row + 1 }, start: place.start + block.rowStarts[row], end });
      }
      used += placed.add;
    }
  });
  close();
  return pages;
}

/**
 * A section's pages for a reader's room. Search results, links to a place and
 * the reader page the same way for the same reader, so a hit said to be on
 * page 12 is on page 12.
 */
export function sectionPages(section: Pick<ExtractedSection, "blocks">, document: Pick<FilingDocument, "blocks">, fit: Fit = DEFAULT_FIT): Page[] {
  return paginate(section, document, fit);
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
