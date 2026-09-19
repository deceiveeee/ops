import { extractFilingSections, type SectionResult } from "./sections";

/**
 * Reports read recently, so that turning a page does not read the whole report
 * again.
 *
 * Every page of a report is its own request, and reading a report means parsing
 * all of its HTML: measured on 2026-09-17, 0.2 s for Apple's annual report and
 * 1.7 s for JPMorgan's, whose 13 MB is mostly styling. A report read is plain
 * data of a few megabytes (25 MB for JPMorgan's), so the last few are kept.
 *
 * What is kept is shared between requests and must never be changed.
 */
const KEPT = 4;
const recent = new Map<string, SectionResult>();

export function readFiling(source: { cik: string; accession: string; document: string }, html: string, form?: string): SectionResult {
  // The length guards against a document that changed under the same name.
  const key = [source.cik, source.accession, source.document, form ?? "", html.length].join("|");
  const kept = recent.get(key);
  if (kept) {
    recent.delete(key);
    recent.set(key, kept);
    return kept;
  }
  const read = extractFilingSections(html, form);
  recent.set(key, read);
  while (recent.size > KEPT) recent.delete(recent.keys().next().value as string);
  return read;
}
