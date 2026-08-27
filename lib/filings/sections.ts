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
  /** Enough of the official title to tell a real heading from a stray match. */
  titlePrefix: string;
  /** What the course teaches a learner to look for here. */
  lens: string;
};

/**
 * The seven sections OPS reads. Deliberately not every Item in the form: the
 * reader teaches how to read a filing, and a beginner opening all twenty items
 * learns less than one opening the seven that carry the business.
 */
export const FILING_SECTIONS: readonly FilingSectionSpec[] = [
  {
    id: "business",
    marker: "Item 1.",
    label: "Business",
    titlePrefix: "Business",
    lens: "What the company actually sells, to whom, and how it says it makes money. Read this before any number.",
  },
  {
    id: "risk-factors",
    marker: "Item 1A.",
    label: "Risk factors",
    titlePrefix: "Risk Factors",
    lens: "What management is required to admit could go wrong. Written by lawyers, but the ordering and any newly added risk are informative.",
  },
  {
    id: "legal",
    marker: "Item 3.",
    label: "Legal proceedings",
    titlePrefix: "Legal Proceedings",
    lens: "Litigation large enough to matter. Often a cross-reference to the notes rather than a disclosure in itself.",
  },
  {
    id: "market",
    marker: "Item 5.",
    label: "Market for the shares",
    titlePrefix: "Market for Registrant",
    lens: "Share count, buybacks and dividends — what the company did with capital that could have been yours.",
  },
  {
    id: "mdna",
    marker: "Item 7.",
    label: "Management's discussion",
    titlePrefix: "Management",
    lens: "The company explaining its own results. Compare what it emphasises against what the statements show.",
  },
  {
    id: "market-risk",
    marker: "Item 7A.",
    label: "Market risk",
    titlePrefix: "Quantitative and Qualitative",
    lens: "Exposure to rates, currencies and prices, stated in the company's own terms.",
  },
  {
    id: "financials",
    marker: "Item 8.",
    label: "Financial statements",
    titlePrefix: "Financial Statements",
    lens: "The audited statements and their notes. The notes are where the accounting choices live.",
  },
];

export type ExtractedSection = {
  id: FilingSectionId;
  label: string;
  lens: string;
  /** Offset of the heading in the plain text. */
  at: number;
  /** The section body, trimmed. */
  text: string;
};

export type SectionResult = {
  sections: ExtractedSection[];
  /** Sections whose heading could not be located outside the contents. */
  missing: { id: FilingSectionId; label: string }[];
  /** Plain text of the whole filing, for length reporting and search. */
  plainTextLength: number;
};

/**
 * Filing HTML to plain text, keeping block boundaries as newlines so headings
 * survive as their own lines.
 */
export function filingToPlainText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|tr|h[1-6]|li|table)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#8217;|&rsquo;|&#146;/gi, "'")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/gi, '"')
    .replace(/&#8212;|&mdash;|&#8211;|&ndash;/gi, "-")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
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
 * `toLowerCase` is length-preserving for the Latin text these markers use, but
 * not for every script, so the length is checked before the folded copy is
 * trusted for offsets.
 */
function searchable(text: string): string {
  const lower = text.toLowerCase();
  return lower.length === text.length ? lower : text;
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
  return /^[.\u2026\s]*\d{1,4}(\s|$)/.test(rest);
}

/**
 * Every place a section marker is followed by its own title, classified.
 *
 * A title followed by a quotation mark is a cross-reference, not a heading:
 * filings write `Item 3. Legal Proceedings" of this report` mid-sentence, and
 * one of those must never be read as a section worth 81,000 characters.
 */
function headingHits(text: string, lower: string, spec: FilingSectionSpec): number[] {
  const out: number[] = [];
  const marker = spec.marker.toLowerCase();
  const full = spec.titlePrefix.toLowerCase();
  const needle = full.slice(0, 14);
  let i = 0;
  while ((i = lower.indexOf(marker, i)) !== -1) {
    const from = i + marker.length;
    const after = lower.slice(from, from + 120).replace(/^\s+/, "");
    if (after.startsWith(needle)) {
      const consumed = after.startsWith(full) ? full.length : needle.length;
      const tail = after.slice(consumed);
      const trimmed = tail.trimStart();
      if (!trimmed.startsWith('"') && !isContentsLine(tail)) out.push(i);
    }
    i += marker.length;
  }
  return out;
}

export function extractFilingSections(html: string): SectionResult {
  const text = filingToPlainText(html);

  const lower = searchable(text);

  // The first heading occurrence, taken in document order so a later
  // cross-reference cannot claim a section that has already started.
  const chosen: Hit[] = [];
  let floor = 0;
  for (const spec of FILING_SECTIONS) {
    const at = headingHits(text, lower, spec).find((candidate) => candidate >= floor);
    if (at === undefined) continue;
    chosen.push({ spec, at });
    floor = at + 1;
  }

  const sections: ExtractedSection[] = chosen.map((hit, index) => {
    const next = chosen[index + 1]?.at ?? text.length;
    return {
      id: hit.spec.id,
      label: hit.spec.label,
      lens: hit.spec.lens,
      at: hit.at,
      text: text.slice(hit.at, next).trim(),
    };
  });

  const found = new Set(sections.map((s) => s.id));
  const missing = FILING_SECTIONS.filter((s) => !found.has(s.id)).map((s) => ({
    id: s.id,
    label: s.label,
  }));

  return { sections, missing, plainTextLength: text.length };
}
