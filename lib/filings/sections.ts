/**
 * Split an SEC filing into the sections an investor actually reads.
 *
 * A 10-K names each part twice: once in the table of contents, where the title
 * is followed by a page number, and once where the section actually begins.
 * Measured on Netflix's 2026 10-K, the contents entries sit between offsets
 * 41,078 and 41,635 — every marker inside a 560-character window — while the
 * real sections are spread from 45,208 to 185,421. That difference is what this
 * module keys on, because it holds regardless of how a filer styles the page.
 *
 * The rule that matters most here is what happens when the shape is not
 * recognised. Filers format 10-Ks differently and some will not match. In that
 * case this returns what it could find and names what it could not, so the
 * reader can show the learner the original document instead of a confident
 * mis-slice of it. A filing reader that silently mislabels Item 7 as Item 8 is
 * worse than one that admits it could not tell.
 */

import { entryFor, readIndex, sectionFromIndex } from "./cross-reference";
import { ENDS_IN_PAGES, isPageFurniture, joinDocuments, readDocument, type FilingDocument } from "./document";
import { fortyFSections } from "./forty-f";

export type FilingSectionId =
  | "business"
  | "risk-factors"
  | "legal"
  | "market"
  | "mdna"
  | "market-risk"
  | "financials";

export type FilingSectionSpec = {
  id: FilingSectionId;
  /** The Item marker as it appears in the filing. */
  marker: string;
  /** Short label for the reader. */
  label: string;
  /**
   * The official title, or the ways filers write it, each long enough to tell a
   * real heading from a stray match. Quarterly reports are the reason for more
   * than one: Coca-Cola writes "Financial Statements", Netflix "Consolidated
   * Financial Statements", Apple "Condensed Consolidated Financial Statements".
   */
  titles: readonly string[];
  /** What the course teaches a learner to look for here. */
  lens: string;
};

/**
 * The seven sections OPS reads in an annual report. Deliberately not every
 * Item in the form: the reader teaches how to read a filing, and a beginner
 * opening all twenty items learns less than one opening the seven that carry
 * the business.
 */
export const FILING_SECTIONS: readonly FilingSectionSpec[] = [
  {
    id: "business",
    marker: "Item 1.",
    label: "Business",
    titles: ["Business"],
    lens: "What the company actually sells, to whom, and how it says it makes money. Read this before any number.",
  },
  {
    id: "risk-factors",
    marker: "Item 1A.",
    label: "Risk factors",
    titles: ["Risk Factors"],
    lens: "What management is required to admit could go wrong. Written by lawyers, but the ordering and any newly added risk are informative.",
  },
  {
    id: "legal",
    marker: "Item 3.",
    label: "Legal proceedings",
    titles: ["Legal Proceedings"],
    lens: "Litigation large enough to matter. Often a cross-reference to the notes rather than a disclosure in itself.",
  },
  {
    id: "market",
    marker: "Item 5.",
    label: "Market for the shares",
    titles: ["Market for Registrant"],
    lens: "Share count, buybacks and dividends — what the company did with capital that could have been yours.",
  },
  {
    id: "mdna",
    marker: "Item 7.",
    label: "Management's discussion",
    titles: ["Management"],
    lens: "The company explaining its own results. Compare what it emphasises against what the statements show.",
  },
  {
    id: "market-risk",
    marker: "Item 7A.",
    label: "Market risk",
    titles: ["Quantitative and Qualitative"],
    lens: "Exposure to rates, currencies and prices, stated in the company's own terms.",
  },
  {
    id: "financials",
    marker: "Item 8.",
    label: "Financial statements",
    titles: ["Financial Statements"],
    lens: "The audited statements and their notes. The notes are where the accounting choices live.",
  },
];

/**
 * The same sections in a quarterly report, which numbers its Items differently.
 *
 * Form 10-Q has two parts that restart at Item 1: Part I holds the financial
 * statements (Item 1), management's discussion (Item 2) and market risk
 * (Item 3); Part II holds legal proceedings (Item 1), risk factors (Item 1A)
 * and share sales and buybacks (Item 2). Read with the annual numbering, only
 * "Item 1A. Risk Factors" matched, so on Netflix's report for the quarter to
 * 30 June 2026 the Risk factors tab ran from its one sentence to the end of the
 * document: the buyback table cell by cell, then the exhibits. The titles tell
 * the two Item 1s and the two Item 2s apart, and the list is in document order
 * because the extractor takes each section after the one before it.
 *
 * There is no Business section: a quarterly report does not describe the
 * business again.
 */
export const QUARTERLY_SECTIONS: readonly FilingSectionSpec[] = [
  {
    id: "financials",
    marker: "Item 1.",
    label: "Financial statements",
    titles: [
      "Financial Statements",
      "Consolidated Financial Statements",
      "Condensed Consolidated Financial Statements",
      "Condensed Financial Statements",
    ],
    lens: "The quarter's statements and their notes. Unlike an annual report's, they are not audited.",
  },
  {
    id: "mdna",
    marker: "Item 2.",
    label: "Management's discussion",
    titles: ["Management"],
    lens: "The company explaining the quarter's results. Compare what it emphasises against what the statements show.",
  },
  {
    id: "market-risk",
    marker: "Item 3.",
    label: "Market risk",
    titles: ["Quantitative and Qualitative"],
    lens: "Exposure to rates, currencies and prices, stated in the company's own terms. Often a note that nothing has changed since the annual report.",
  },
  {
    id: "legal",
    marker: "Item 1.",
    label: "Legal proceedings",
    titles: ["Legal Proceedings"],
    lens: "Litigation large enough to matter. Often a cross-reference to the notes rather than a disclosure in itself.",
  },
  {
    id: "risk-factors",
    marker: "Item 1A.",
    label: "Risk factors",
    titles: ["Risk Factors"],
    lens: "Only what has changed since the annual report, so a single sentence saying nothing has changed is normal. The full list is in the annual report.",
  },
  {
    id: "market",
    marker: "Item 2.",
    label: "Buybacks",
    titles: ["Unregistered Sales"],
    lens: "The shares the company bought back each month of the quarter, the average price it paid, and how much its buyback plan still allows. Any shares it sold outside a public offering are reported here too.",
  },
];

/**
 * The same sections in a foreign company's annual report, Form 20-F, which
 * numbers its Items its own way: risks under Item 3, "Key Information", in its
 * part D; the business in Item 4; the discussion of results in Item 5,
 * "Operating and Financial Review and Prospects"; market risk in Item 11;
 * buybacks in Item 16E. Legal proceedings sit inside Item 8 and are not read
 * apart. Listed in document order, as the extractor takes them.
 */
export const FOREIGN_SECTIONS: readonly FilingSectionSpec[] = [
  {
    id: "risk-factors",
    marker: "Item 3.",
    label: "Risk factors",
    titles: ["Key Information"],
    lens: "What management is required to admit could go wrong, in part D of Item 3. The earlier parts are often marked reserved or not applicable.",
  },
  {
    id: "business",
    marker: "Item 4.",
    label: "Business",
    titles: ["Information on the Company"],
    lens: "What the company actually sells, to whom, and how it says it makes money. Read this before any number.",
  },
  {
    id: "mdna",
    marker: "Item 5.",
    label: "Operating review",
    titles: ["Operating and Financial Review"],
    lens: "The company explaining its own results, as a foreign company's report calls it. Compare what it emphasises against what the statements show.",
  },
  {
    id: "market-risk",
    marker: "Item 11.",
    label: "Market risk",
    titles: ["Quantitative and Qualitative"],
    lens: "Exposure to rates, currencies and prices, stated in the company's own terms.",
  },
  {
    id: "market",
    marker: "Item 16E.",
    label: "Buybacks",
    titles: ["Purchases of Equity Securities"],
    lens: "The shares the company and its affiliates bought back during the year, and at what price.",
  },
  {
    id: "financials",
    marker: "Item 18.",
    label: "Financial statements",
    titles: ["Financial Statements"],
    lens: "The audited statements and their notes. A foreign company may report under IFRS rather than US accounting rules; the notes say which.",
  },
];

export type FilingLayout = "annual" | "quarterly" | "foreign";

const SPECS: Record<FilingLayout, readonly FilingSectionSpec[]> = {
  annual: FILING_SECTIONS,
  quarterly: QUARTERLY_SECTIONS,
  foreign: FOREIGN_SECTIONS,
};

/** Every section id any layout can produce, for checking one that comes back from a browser. */
export const SECTION_IDS: ReadonlySet<string> = new Set([...FILING_SECTIONS, ...QUARTERLY_SECTIONS, ...FOREIGN_SECTIONS].map((spec) => spec.id));

const layoutOfForm = (form: string): FilingLayout => (/^10-Q/i.test(form.trim()) ? "quarterly" : /^20-F/i.test(form.trim()) ? "foreign" : "annual");

/**
 * Which layout a filing uses. The form, when the caller knows it, decides.
 * Otherwise the document says: an inline XBRL filing tags its own form type,
 * and an older one names it on the cover. Anything that is neither a quarterly
 * report nor a foreign company's is read with the annual numbering.
 */
export function layoutOf(html: string, form?: string): FilingLayout {
  if (form) return layoutOfForm(form);
  const tagged = html.match(/name="dei:DocumentType"[^>]*>(?:\s*<[^>]+>)*\s*([^<\s]+)/i)?.[1];
  if (tagged) return layoutOfForm(tagged);
  const cover = filingToPlainText(html.slice(0, 20_000));
  return /form\s+10-Q/i.test(cover) ? "quarterly" : /form\s+20-F/i.test(cover) ? "foreign" : "annual";
}

/** A kept passage's section, named as the report it came from names it. */
export function sectionLabel(sectionId: string, form?: string): string {
  const specs = SPECS[form ? layoutOfForm(form) : "annual"];
  return specs.find((spec) => spec.id === sectionId)?.label ?? sectionId;
}

/** One of a section's blocks: which block of the document, and where its text sits in the section's text. */
export type SectionBlock = { index: number; start: number; end: number };

export type ExtractedSection = {
  id: FilingSectionId;
  label: string;
  lens: string;
  /** Offset of the section's first block in the document's text. */
  at: number;
  /** The section's text: its blocks' texts, one to a line. */
  text: string;
  /** Its blocks, in order; the first holds the heading. */
  blocks: SectionBlock[];
};

export type SectionResult = {
  sections: ExtractedSection[];
  /** Sections whose heading could not be located outside the contents. */
  missing: { id: FilingSectionId; label: string }[];
  /** Plain text of the whole filing, for length reporting and search. */
  plainTextLength: number;
  /** The filing as the reader draws it. */
  document: FilingDocument;
};

/** The filing's text as search and sections read it: its blocks' texts, one to a line. */
export function filingToPlainText(html: string): string {
  return readDocument(html).text;
}

type Hit = { spec: FilingSectionSpec; at: number };

/**
 * Case-folded copy for searching, with offsets that still line up.
 *
 * Filers do not agree on capitalisation. Netflix, Apple and NVIDIA write
 * "Item 1. Business"; Coca-Cola writes "ITEM 1. BUSINESS" for the real heading
 * and reserves mixed case for the contents and for quoted cross-references.
 * Matching case-sensitively found three of Coca-Cola's seven sections and
 * mis-sliced one.
 *
 * Only A to Z are folded. The markers and titles are plain ASCII, and folding
 * anything else can change the text's length and so every offset after it:
 * Coca-Cola's annual report names Coca-Cola İçecek, whose "İ" lower-cases to
 * two characters. An earlier version noticed the change in length and fell
 * back to matching case-sensitively, which found none of Coca-Cola's upper-case
 * headings once that letter was decoded rather than left as "&#304;".
 */
function searchable(text: string): string {
  return text.replace(/[A-Z]+/g, (letters) => letters.toLowerCase());
}

/**
 * Whether a marker occurrence is a contents entry rather than a heading.
 *
 * A contents line ends in a page number - "Item 1. Business 2", sometimes with
 * dot leaders. A real heading ends there, and a cross-reference continues into
 * a sentence. That distinction is exact, which proximity was not: an earlier
 * version treated any three markers within 400 characters as a contents block,
 * and on a filing whose body began immediately after the list it swallowed the
 * first real heading along with it.
 */
function isContentsLine(rest: string): boolean {
  // The page number follows the title immediately, so the test runs against
  // the remainder as-is. Splitting on the newline first was wrong: a real
  // contents block collapses onto a single line, so the remainder read
  // "1 Item 1A. Risk Factors 4 ..." and never looked like a bare number. Every
  // contents entry was then accepted as a heading, which left one section
  // swallowing 272,000 characters while the others collapsed to nothing.
  // GE and Intel close their annual reports with a cross-reference index whose
  // entries give page ranges: "Item 1A. Risk Factors 24-31", "Pages 37 - 51".
  return /^[.\u2026\s]*(pages?\s+)?\d{1,4}(\s*[-\u2013]\s*\d{1,4}|\s*,\s+\d{1,4}|\s+,\s*\d{1,4})*(\s|$)/i.test(rest);
}

/**
 * Where every Item heading starts, whether or not it is a section OPS reads.
 *
 * Measured across the annual and quarterly reports of Netflix, Apple,
 * Coca-Cola, NVIDIA and Atkore, every real heading starts a line and every
 * cross-reference sits inside one ("\u2026under the heading Risk Factors in Part I,
 * Item 1A."). "Item 2.02" is an 8-K item number that turns up in exhibit lists,
 * not a heading.
 */
const LINE_MARKER = /(^|\n)[ \t]*(item\s*\d{1,2}[a-f]?(?:\s*[.:\-–—](?!\d)|[ \t]+(?=[a-z])))/g;

function itemStarts(lower: string): number[] {
  const out: number[] = [];
  for (const match of lower.matchAll(LINE_MARKER)) out.push(match.index + match[0].length - match[2].length);
  return out;
}

/** Longest line a contents entry runs to: NVIDIA's quarterly entries reach 110 characters. */
const CONTENTS_LINE_MAX = 160;

/**
 * Whether the text between a title and the next Item is a list of page numbers.
 *
 * A quarterly report's contents lists the statements under Item 1 before
 * giving a page: Atkore's reads "Item 1. Financial Statements (Unaudited) 2
 * Condensed Consolidated Statements of Operations 2 \u2026", so the number does not
 * follow the title and `isContentsLine` accepted the entry as a heading. A
 * contents entry is short lines, at least one of them ending in a page number,
 * up to the next Item. A real section, however short, is a sentence.
 *
 * The page's own printed number is not a contents entry's: Alibaba's Item 18
 * is a list of its statements, and the "204" at the foot of that page made it
 * read as contents until the document's footers were known.
 */
function isContentsBlock(lower: string, titleEnd: number, starts: number[], footers: ReadonlySet<number>): boolean {
  const next = starts.find((start) => start > titleEnd) ?? lower.length;
  if (next - titleEnd > 1_500) return false;
  const lines: string[] = [];
  let offset = titleEnd;
  for (const line of lower.slice(titleEnd, next).split("\n")) {
    if (!footers.has(offset) && line.trim()) lines.push(line.trim());
    offset += line.length + 1;
  }
  return lines.every((line) => line.length < CONTENTS_LINE_MAX) && lines.some((line) => ENDS_IN_PAGES.test(line));
}

/**
 * Whether a section has anything under its heading.
 *
 * Mastercard's annual report lists "Item 1. Business" and "Item 1A. Risk
 * factors" one under the other with no pages, and GE's ends with an index of
 * one-line entries; each became a tab holding only its own heading. A section
 * has a body when a line of text follows the heading, or when the heading's
 * line runs on long enough to hold a sentence of its own.
 */
function hasBody(text: string): boolean {
  const lines = text.split("\n").map((line) => line.trim()).filter((line) => line && !isPageFurniture(line));
  return lines.length > 1 || (lines[0]?.length ?? 0) > 140;
}

/**
 * Every place a section marker is followed by its own title, classified.
 *
 * A title followed by a quotation mark is a cross-reference, not a heading:
 * filings write `Item 3. Legal Proceedings" of this report` mid-sentence, and
 * one of those must never be read as a section worth 81,000 characters.
 */
function headingHits(lower: string, spec: FilingSectionSpec, starts: number[], footers: ReadonlySet<number>): number[] {
  const out: number[] = [];
  const number = spec.marker.match(/\d{1,2}[a-f]?/i)![0].toLowerCase();
  // A heading starts its line. NVIDIA's Business section says `Refer to "Item
  // 1A. Risk Factors - Risks Related to Regulatory…"`, where the quotation mark
  // comes before the marker, and that sentence was read as the start of its risk
  // factors 7,600 characters before the real heading.
  //
  // Filers separate the number from the title in more than one way: "Item 1A."
  // (Apple), "Item 1A-Risk Factors" (Costco), "Item 1 - Financial statements"
  // (Johnson & Johnson), "Item 1: Business" (Shopify). Matching only the full
  // stop found no section at all in those four reports.
  // Without punctuation the title must follow on the same line: Microsoft heads
  // every page with a bare "Item 7", and those were read as new sections.
  const pattern = new RegExp(`(^|\\n)[ \\t]*item\\s*${number}(?:\\s*[.:\\-–—](?!\\d)\\s*|[ \\t]+(?=[a-z]))`, "g");
  for (const match of lower.matchAll(pattern)) {
    const i = match.index + match[0].search(/item/);
    const from = match.index + match[0].length;
    const after = lower.slice(from, from + 120);
    const lead = after.length - after.trimStart().length;
    for (const title of spec.titles) {
      const full = title.toLowerCase();
      const needle = full.slice(0, 14);
      // Microsoft's markup splits words inside its headings, "ITEM 1A. RIS K
      // FACTORS", so the title is compared with the spaces taken out.
      const needleEnd = endOfLetters(after, lead, needle);
      if (needleEnd === -1) continue;
      const fullEnd = endOfLetters(after, lead, full);
      const consumed = fullEnd === -1 ? needleEnd : fullEnd;
      const tail = after.slice(consumed);
      if (!tail.trimStart().startsWith('"') && !isContentsLine(tail) && !isContentsBlock(lower, from + consumed, starts, footers)) {
        out.push(i);
      }
      break;
    }
  }
  return out;
}

/**
 * Where `words` ends if `text` spells it from `from` on, ignoring spaces inside
 * the text, or -1. Spaces in `words` itself are ignored the same way.
 */
function endOfLetters(text: string, from: number, words: string): number {
  const wanted = words.replace(/\s+/g, "");
  let at = from;
  for (const letter of wanted) {
    while (at < text.length && /\s/.test(text[at]) && text[at] !== "\n") at++;
    if (text[at] !== letter) return -1;
    at++;
  }
  return at;
}

/**
 * An annual report's Item 8 that only points elsewhere.
 *
 * NVIDIA's reads, in full, "The information required by this Item is set forth
 * in our Consolidated Financial Statements and Notes thereto included in this
 * Annual Report on Form 10-K", and the statements sit inside Item 15. Netflix's
 * say they are "included immediately following Part IV", after Item 16. Ending
 * Item 8 at Item 9 left the Financial statements tab one sentence long, where
 * before the section had run on to the end of the document and so, by
 * accident, reached them. Reading from Item 15 to the end keeps them in reach
 * for both, under a heading that says where they are.
 */
const POINTER_MAX = 600;
/** A 20-F's Item 18 may list the statements it points to, as Alibaba's does, so it runs longer. */
const FOREIGN_POINTER_MAX = 1_500;
/** Where statements set apart from the text begin: their own index, or the auditor's report. */
const STATEMENTS_START = /(^|\n)[ \t]*(?:index to (?:the )?(?:consolidated )?financial statements|report of independent registered public accounting firm)[ \t]*(?:page)?[ \t]*(?=\n|$)/g;

/**
 * Words a company heads a section with in its own layout, besides the Item's
 * title: McDonald's puts its market risk under "FINANCING AND MARKET RISK".
 */
const INDEX_HEADINGS: Partial<Record<FilingSectionId, readonly string[]>> = {
  "market-risk": ["Market Risk"],
  legal: ["Legal Matters"],
};
const EXHIBITS = /(^|\n)[ \t]*item\s*15\s*[.:\-–—]?\s*exhibits/g;

export function extractFilingSections(html: string, form?: string): SectionResult {
  const document = readDocument(html);
  const { text } = document;
  const lower = searchable(text);
  const layout = layoutOf(html, form);
  const specs = SPECS[layout];
  const starts = itemStarts(lower);
  const footers = new Set(document.pages.map(({ block }) => document.blocks[block].start));

  // The first heading occurrence, taken in document order so a later
  // cross-reference cannot claim a section that has already started.
  const chosen: Hit[] = [];
  let floor = 0;
  // Every heading starts a line, so the next line-start Item is where a candidate would end.
  const nextStart = (at: number) => starts.find((start) => start > at) ?? text.length;
  for (const spec of specs) {
    const at = headingHits(lower, spec, starts, footers).find(
      (candidate) => candidate >= floor && hasBody(text.slice(candidate, nextStart(candidate))),
    );
    if (at === undefined) continue;
    chosen.push({ spec, at });
    floor = at + 1;
  }

  // A section ends at the next Item heading of any kind. Ending only at the
  // next section OPS reads ran Risk factors on through Unresolved Staff
  // Comments, Cybersecurity and Properties, and Financial statements through
  // every Item after it to the signatures.
  const boundaries = [...new Set([...starts, ...chosen.map((hit) => hit.at)])].sort((a, b) => a - b);
  const endOf = (at: number) => boundaries.find((boundary) => boundary > at) ?? text.length;

  const sections: ExtractedSection[] = chosen.map((hit) => {
    let at = hit.at;
    let end = endOf(at);
    if (layout === "foreign" && hit.spec.id === "financials" && end - at < FOREIGN_POINTER_MAX) {
      // A foreign company's Item 18 points to statements set after its
      // exhibits and signatures: "Refer to the consolidated financial
      // statements starting on page F-1" (TSMC), found by their own index.
      const statements = [...lower.matchAll(STATEMENTS_START)].map((match) => match.index + match[1].length).find((start) => start > end);
      if (statements !== undefined) {
        at = statements;
        end = text.length;
      }
    }
    if (layout === "annual" && hit.spec.id === "financials" && end - at < POINTER_MAX) {
      // Not an index entry for Item 15 ("Exhibits and Financial Statement Schedules 75-78").
      const lineAt = (start: number) => text.slice(start, text.indexOf("\n", start) === -1 ? text.length : text.indexOf("\n", start)).trim();
      const exhibits = [...lower.matchAll(EXHIBITS)]
        .map((match) => match.index + match[0].search(/item/))
        .find((start) => start > end && !ENDS_IN_PAGES.test(lineAt(start)));
      if (exhibits !== undefined) {
        at = exhibits;
        end = text.length;
      }
    }
    // A section is whole blocks: from the one holding its heading to the last that starts before its end.
    const first = blockAt(document, at);
    const indexes: number[] = [];
    for (let index = first; index < document.blocks.length && (index === first || document.blocks[index].start < end); index += 1) {
      indexes.push(index);
    }
    return sectionOf(hit.spec, document, indexes);
  });

  // What has no Item heading may still be found through the report's
  // cross-reference index or contents, by the pages they give.
  const unfound = specs.filter((spec) => !sections.some((section) => section.id === spec.id));
  if (unfound.length) {
    const entries = readIndex(text);
    for (const spec of unfound) {
      const entry = entryFor(entries, spec.marker.match(/\d{1,2}[a-f]?/i)![0].toLowerCase(), spec.titles);
      const indexes = entry ? sectionFromIndex(document, entries, entry, [...spec.titles, ...(INDEX_HEADINGS[spec.id] ?? [])]) : null;
      if (!indexes) continue;
      const section = sectionOf(spec, document, indexes);
      if (hasBody(section.text)) sections.push(section);
    }
    sections.sort((a, b) => specs.findIndex((spec) => spec.id === a.id) - specs.findIndex((spec) => spec.id === b.id));
  }

  const found = new Set(sections.map((s) => s.id));
  const missing = specs.filter((s) => !found.has(s.id)).map((s) => ({
    id: s.id,
    label: s.label,
  }));

  return { sections, missing, plainTextLength: text.length, document };
}

/**
 * Whether a report is a Canadian company's annual report on Form 40-F, from
 * its form when known, or from what the document says it is.
 */
export function isFortyF(html: string, form?: string): boolean {
  if (form) return /^40-F/i.test(form.trim());
  const tagged = html.match(/name="dei:DocumentType"[^>]*>(?:\s*<[^>]+>)*\s*([^<\s]+)/i)?.[1];
  if (tagged) return /^40-F/i.test(tagged);
  return /form\s+40-F/i.test(filingToPlainText(html.slice(0, 20_000)));
}

/**
 * A 40-F's cover document and the exhibits that carry its report, read by
 * their own headings (`lib/filings/forty-f.ts`), with the annual report's
 * section names.
 */
export function extractFortyFSections(htmls: readonly string[]): SectionResult {
  const { document, starts } = joinDocuments(htmls.map(readDocument));
  const found = fortyFSections(document, starts);
  const sections = FILING_SECTIONS.flatMap((spec) => {
    const part = found.find((section) => section.id === spec.id);
    return part && part.indexes.length ? [sectionOf(spec, document, part.indexes)] : [];
  }).filter((section) => hasBody(section.text));
  const missing = FILING_SECTIONS.filter((spec) => !sections.some((section) => section.id === spec.id)).map(({ id, label }) => ({ id, label }));
  return { sections, missing, plainTextLength: document.text.length, document };
}

/**
 * A section made of some of the document's blocks, its text theirs one to a
 * line. Blocks usually run on from one another; a section read through an index
 * can be several runs of pages, as Intel gives its business at pages 3-24, 33
 * and 72-75.
 */
function sectionOf(spec: FilingSectionSpec, document: FilingDocument, indexes: readonly number[]): ExtractedSection {
  let offset = 0;
  const blocks = indexes.map((index) => {
    const start = offset;
    offset += document.blocks[index].text.length + 1;
    return { index, start, end: start + document.blocks[index].text.length };
  });
  return {
    id: spec.id,
    label: spec.label,
    lens: spec.lens,
    at: document.blocks[indexes[0]].start,
    text: indexes.map((index) => document.blocks[index].text).join("\n"),
    blocks,
  };
}

/** The block whose text holds an offset. */
function blockAt(document: FilingDocument, at: number): number {
  let low = 0;
  let high = document.blocks.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (document.blocks[middle].start <= at) low = middle;
    else high = middle - 1;
  }
  return low;
}
