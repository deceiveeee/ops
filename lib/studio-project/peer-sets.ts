/**
 * A peer set chosen by what companies make, not by the SEC's industry code.
 *
 * The SEC files Atkore under SIC 3690, "miscellaneous electrical machinery",
 * and most companies filing under that code make batteries and EV chargers
 * (docs/source-audits/studio-online-data-and-tools.md §5.1). An industry view
 * built on the code would compare a maker of electrical conduit with them. So
 * Atkore's peers are chosen by hand, and every choice carries its reason where
 * a learner can check it:
 *
 * - a company is **in** because Atkore's own annual report names it as a main
 *   competitor, or because its own annual report describes a product Atkore
 *   makes, found by full-text search;
 * - a competitor Atkore names is **missing** when it files no annual report with
 *   the SEC. It is still named, because a comparison that leaves out most of the
 *   competition should say so;
 * - a company the search found is **left out**, with the passage that shows why.
 *
 * One rule keeps this honest: every competitor Atkore names ends up either in
 * the set or on the missing list. Nothing is dropped silently.
 *
 * Nothing here touches the network; scripts/source/fetch-peer-sets.mjs checks
 * every quoted passage against the filing it cites, and calls this.
 */

/** Elements that start a new line of text. Anything else is inline, and a word split across inline tags is joined again. */
const BLOCK_TAG = /^(p|div|br|tr|td|th|li|ul|ol|table|thead|tbody|h[1-6]|hr|section|article|header|footer|center|dd|dt|dl)$/i;

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/**
 * Typographic quotes, dashes and non-breaking spaces made plain, whitespace
 * collapsed, and no space before closing punctuation. That last rule is there
 * because a span boundary can put one there or not: Atkore's live report closes
 * an italic span just before "Infrastructure:", and the fixture rebuilt from it
 * reads "Infrastructure :". Both say the same thing.
 */
function plain(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .replace(/ ([:;,.)])/g, "$1")
    .trim();
}

/** The visible text of a filing on one line, so that a quoted passage can be found in it. */
export function filingText(html: string): string {
  const withoutCode = html.replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, " ");
  const withoutTags = withoutCode.replace(/<\/?([A-Za-z][A-Za-z0-9:-]*)[^>]*>/g, (_, name: string) => (BLOCK_TAG.test(name) ? " " : ""));
  return plain(decodeEntities(withoutTags));
}

/** Whether a quoted passage appears, word for word, in a filing's text. */
export function containsPassage(text: string, quote: string): boolean {
  const wanted = plain(quote);
  return wanted.length > 0 && text.includes(wanted);
}

/**
 * How many times a word appears in a filing's text, ignoring case, plurals included.
 * A reason that says a report mentions something only once rests on this count
 * over the whole report, never on however much of it happened to be read.
 */
export function countMentions(text: string, word: string): number {
  const haystack = text.toLowerCase();
  const needle = plain(word).toLowerCase();
  if (!needle) return 0;
  let count = 0;
  for (let at = haystack.indexOf(needle); at >= 0; at = haystack.indexOf(needle, at + needle.length)) count += 1;
  return count;
}

export interface NamedGroup {
  /** The segment the company names its competitors for, as it prints it. */
  segment: string;
  /** Each competitor exactly as printed, including "Inc." and any stray full stop. */
  names: string[];
}

/** A comma-separated piece that belongs to the name before it: "Zekelman Industries, Inc." */
const SUFFIX = /^(Inc|Incorporated|LLC|L\.L\.C|Ltd|Limited|plc|Corp|Co|S\.p\.A|N\.V|S\.A|AG|SE|LP|L\.P)\.?$/i;

function splitNames(list: string): string[] {
  const names: string[] = [];
  for (const piece of list.trim().replace(/\.$/, "").split(/,\s*/)) {
    const token = piece.replace(/^and\s+/, "").trim();
    if (!token) continue;
    if (SUFFIX.test(token) && names.length) names[names.length - 1] += `, ${token}`;
    else names.push(token);
  }
  return names;
}

/**
 * The competitors a company names, by segment, from a passage of the form
 * "…listed below: Electrical: A, B, and C. Safety & Infrastructure : D, and E."
 *
 * Returns nothing rather than a guess when the passage does not have that
 * shape: a list whose end cannot be found would swallow the next segment's name.
 */
export function readNamedCompetitors(passage: string, lead: string): NamedGroup[] {
  const at = passage.indexOf(lead);
  if (at < 0) return [];
  const parts = passage.slice(at + lead.length).split(":");
  if (parts.length < 2) return [];
  const groups: NamedGroup[] = [];
  let segment = parts[0].trim();
  for (let index = 1; index < parts.length; index++) {
    const last = index === parts.length - 1;
    const cut = last ? -1 : parts[index].lastIndexOf(". ");
    if (!last && cut < 0) return [];
    const list = last ? parts[index] : parts[index].slice(0, cut + 1);
    const names = splitNames(list);
    if (!segment || !names.length) return [];
    groups.push({ segment, names });
    if (!last) segment = parts[index].slice(cut + 2).trim();
  }
  return groups;
}

/**
 * Checks that the companies accounted for, in the set or on the missing list,
 * are exactly the companies named. A company named in two segments counts once.
 */
export function unaccounted(groups: NamedGroup[], accountedAs: string[]): { notAccounted: string[]; notNamed: string[] } {
  const named = new Set(groups.flatMap((group) => group.names));
  const accounted = new Set(accountedAs);
  return {
    notAccounted: [...named].filter((name) => !accounted.has(name)),
    notNamed: [...accounted].filter((name) => !named.has(name)),
  };
}

/** The segments a named company is listed under, in the order printed. */
export function segmentsNaming(groups: NamedGroup[], name: string): string[] {
  return groups.filter((group) => group.names.includes(name)).map((group) => group.segment);
}

export const ANNUAL_REPORT_FORMS = ["10-K", "10-K/A", "20-F", "20-F/A", "40-F", "40-F/A"];
const DEREGISTRATION = /^15F?-(12B|12G|15D)$/;

export interface FilingRow {
  form: string;
  /** YYYY-MM-DD */
  filed: string;
  accession: string;
}

export interface AnnualReportStatus {
  /** True only for a recent annual report with no deregistration filed after it. */
  files: boolean;
  latestAnnual: FilingRow | null;
  /** A deregistration filed after the latest annual report, if there is one. */
  deregistered: FilingRow | null;
}

/**
 * Whether a registrant still files annual reports, from its filing history.
 *
 * A registrant can deregister one class of securities and go on reporting:
 * Hubbell filed a Form 15 in 2016 and a 10-K in 2026. So only a deregistration
 * after the latest annual report counts, and an annual report older than
 * `maxAgeDays` counts as stopped.
 */
export function annualReportStatus(rows: FilingRow[], asOf: string, maxAgeDays = 550): AnnualReportStatus {
  const newestFirst = [...rows].sort((a, b) => b.filed.localeCompare(a.filed));
  const latestAnnual = newestFirst.find((row) => ANNUAL_REPORT_FORMS.includes(row.form)) ?? null;
  const deregistered = latestAnnual
    ? (newestFirst.find((row) => DEREGISTRATION.test(row.form) && row.filed > latestAnnual.filed) ?? null)
    : null;
  const ageDays = latestAnnual ? (Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${latestAnnual.filed}T00:00:00Z`)) / 86_400_000 : Infinity;
  return { files: latestAnnual !== null && deregistered === null && ageDays <= maxAgeDays, latestAnnual, deregistered };
}

export interface FilingRef {
  form: string;
  accession: string;
  document: string;
  filed: string;
  /** The period the filing covers, YYYY-MM-DD. */
  periodEnd: string;
  url: string;
}

export interface Passage {
  /** A few words that say what the quote shows, for the learner. */
  lead: string;
  /** Word for word from the filing, checked when the data was built. */
  quote: string;
}

export interface PeerSetEntry {
  id: string;
  label: string;
  subject: {
    name: string;
    shortName: string;
    ticker: string;
    cik: string;
    sic: string;
    sicDescription: string;
    filing: FilingRef;
    /** A short list of what the subject makes, each word checked against its own quoted passages. */
    briefProducts: string[];
    makes: { segment: string; quote: string }[];
    competitorsQuote: string;
    named: NamedGroup[];
  };
  peers: {
    name: string;
    ticker: string;
    cik: string;
    /** The name exactly as the subject's report prints it, or null when it was found by search instead. */
    namedAs: string | null;
    /** Segments of the subject's report that name it; empty when it was found by search instead. */
    namedIn: string[];
    /** The phrase a full-text search found it by, when the subject does not name it. */
    foundBy: string | null;
    filing: FilingRef;
    overlap: Passage | null;
    business: Passage;
    problems: string[];
  }[];
  missing: {
    namedAs: string;
    namedIn: string[];
    records: { cik: string; name: string }[];
    note: string;
    evidence: { form: string; filed: string }[];
    problems: string[];
  }[];
  leftOut: {
    name: string;
    cik: string;
    foundBy: string;
    filing: FilingRef;
    why: string;
    quote: string;
    /** Where the reason is that a word appears only so often: its count over the whole report, and a passage that holds it. */
    mentions: { word: string; count: number; quote: string } | null;
    problems: string[];
  }[];
  problems: string[];
}

/** Every problem in a set, its entries' included. A set with any is not shown. */
export function allProblems(set: PeerSetEntry): string[] {
  return [
    ...set.problems,
    ...set.peers.flatMap((peer) => peer.problems.map((problem) => `${peer.name}: ${problem}`)),
    ...set.missing.flatMap((entry) => entry.problems.map((problem) => `${entry.namedAs}: ${problem}`)),
    ...set.leftOut.flatMap((entry) => entry.problems.map((problem) => `${entry.name}: ${problem}`)),
  ];
}
