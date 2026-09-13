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
 */

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
};

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
export function paragraphsOf(sectionText: string): Paragraph[] {
  const out: Paragraph[] = [];
  let cursor = 0;
  for (const raw of sectionText.split("\n")) {
    const lineStart = cursor;
    cursor += raw.length + 1;
    const text = raw.trim();
    if (!text) continue;
    const start = lineStart + raw.indexOf(text);
    out.push({ index: out.length, start, end: start + text.length, text });
  }
  return out;
}

/**
 * The section's body as pages. The heading, paragraph 0, is not on any page:
 * the reader shows it above whichever page is open.
 */
export function paginate(sectionText: string, budget = PAGE_PX): Page[] {
  const body = paragraphsOf(sectionText).slice(1);
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
 * Which page holds an offset. An offset in the heading, or past the end, is
 * placed on the nearest page rather than refused, so a link never lands nowhere.
 */
export function pageForOffset(pages: Page[], offset: number): number {
  if (!pages.length) return 1;
  for (const page of pages) if (offset < page.end) return page.number;
  return pages[pages.length - 1].number;
}
