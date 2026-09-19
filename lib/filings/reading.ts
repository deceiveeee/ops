import { fetchFilingFile, fetchFilingParts } from "./edgar";
import { extractFilingSections, extractFortyFSections, isFortyF, type SectionResult } from "./sections";

/**
 * Reports read recently, so that turning a page does not read the whole report
 * again.
 *
 * Every page of a report is its own request, and reading a report means parsing
 * all of its HTML: measured on 2026-09-18, 0.13 s for Apple's annual report and
 * 1.2 s for JPMorgan's. A report read is plain data of a few megabytes (25 MB
 * for JPMorgan's), so the last few are kept.
 *
 * What is kept is shared between requests and must never be changed.
 */
const KEPT = 4;
const recent = new Map<string, SectionResult>();

function remember(key: string, read: () => SectionResult): SectionResult {
  const kept = recent.get(key);
  if (kept) {
    recent.delete(key);
    recent.set(key, kept);
    return kept;
  }
  const result = read();
  recent.set(key, result);
  while (recent.size > KEPT) recent.delete(recent.keys().next().value as string);
  return result;
}

type Source = { cik: string; accession: string; document: string };

export function readFiling(source: Source, html: string, form?: string): SectionResult {
  // The length guards against a document that changed under the same name.
  const key = [source.cik, source.accession, source.document, form ?? "", html.length].join("|");
  return remember(key, () => extractFilingSections(html, form));
}

/** Exhibit types that can carry a 40-F's report: EX-1 and EX-2 (Shopify, Royal Bank), EX-99 (Suncor). */
const REPORT_EXHIBIT = /^EX-(1|2|99)(\.\d+)?$/i;
/** Smaller than this and an exhibit is a consent, a certificate or a letter, not part of the report. */
const REPORT_EXHIBIT_MIN = 50_000;

/**
 * A report as the reader shows it. Most are one document. A Canadian company's
 * annual report on Form 40-F is its cover document and the exhibits that carry
 * the report, which are fetched and read together; when they cannot be
 * fetched, the cover document is read alone.
 */
export async function readReport(source: Source, html: string, form?: string): Promise<SectionResult> {
  if (!isFortyF(html, form)) return readFiling(source, html, form);
  const key = [source.cik, source.accession, source.document, "40-F", html.length].join("|");
  const kept = recent.get(key);
  if (kept) return remember(key, () => kept);
  const listed = await fetchFilingParts(source.cik, source.accession);
  const exhibits = listed.ok
    ? listed.parts.filter((part) => REPORT_EXHIBIT.test(part.type) && part.size >= REPORT_EXHIBIT_MIN && part.document !== source.document)
    : [];
  const fetched = await Promise.all(exhibits.map((part) => fetchFilingFile(source.cik, source.accession, part.document)));
  const htmls = [html, ...fetched.flatMap((result) => (result.ok ? [result.body] : []))];
  return remember(key, () => extractFortyFSections(htmls));
}
