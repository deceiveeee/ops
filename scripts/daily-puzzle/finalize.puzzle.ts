/**
 * Writes data/daily-puzzle/puzzles.ts from the reviewed choices in review.ts.
 *
 *     npx vitest run -c scripts/daily-puzzle/vitest.config.ts scripts/daily-puzzle/finalize.puzzle.ts
 *
 * Reads only the cached SEC responses that build.puzzle.ts saved (EDGAR
 * fixture mode on tmp/daily-puzzle-cache/), so it sends nothing to the SEC and
 * gives the same answer every run. It fails, and writes nothing, when:
 *
 * - any published number differs from the report's own XBRL data file, read by
 *   a second, separately written reader, or comes from a different filing;
 * - the revenue split does not add up to the revenue figure, or to 100%;
 * - the reviewed words are not in the Business section exactly once;
 * - the company's name, ticker or a listed brand shows anywhere in a clue.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { anchorFor } from "@/lib/filings/anchor";
import { fetchCompanyFacts, fetchFilingDocument, fetchFilingFile, fetchFilingFileNames, fetchFilings, resolveTicker } from "@/lib/filings/edgar";
import { readReport } from "@/lib/filings/reading";
import { pickXbrlFiles, readRevenue } from "@/lib/filings/revenue";
import type { DailyPuzzle, ReportedFigure } from "@/lib/daily-puzzle/types";
import { resolveConcepts, resolvePrimitive, sectorFromSic, type CompanyFacts } from "@/lib/studio-project/metrics";
import { figuresFromFacts, periodToRead } from "@/lib/studio-project/prefill";
import { COMPANIES } from "./companies";
import { REVIEWED, type Review } from "./review";
import { findLoosely, instanceValues, leaks, redact } from "./shared";

const ROOT = process.cwd();
const CACHE = path.join(ROOT, "tmp", "daily-puzzle-cache");
const TARGET = path.join(ROOT, "data", "daily-puzzle", "puzzles.ts");

const CASH = ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"];

function fail(ticker: string, message: string): never {
  throw new Error(`${ticker}: ${message}`);
}

/** The figure, after the report's own data file has been seen to hold exactly this value. */
function checked(ticker: string, xml: string, figure: ReportedFigure & { start: string | null; end: string }, instant: boolean): ReportedFigure {
  const inReport = instanceValues(xml, figure.concept, { start: figure.start, end: figure.end }, instant);
  if (inReport.length !== 1 || inReport[0] !== figure.value) {
    fail(ticker, `${figure.concept} is ${figure.value} in company facts but [${inReport.join(", ")}] in the report's data file`);
  }
  return { value: figure.value, concept: figure.concept };
}

async function finalize(review: Review, number: number): Promise<DailyPuzzle> {
  const { ticker } = review;
  const company = COMPANIES.find((entry) => entry.ticker === ticker) ?? fail(ticker, "not in companies.ts");
  const names = [company.name, ...company.brands, ...(ticker.length >= 3 ? [ticker] : [])];

  const resolved = await resolveTicker(ticker);
  if (!resolved.ok) fail(ticker, resolved.message);
  const cik = String(Number(resolved.company.cik));
  const filings = await fetchFilings(cik);
  if (!filings.ok) fail(ticker, filings.message);
  const annual = filings.filings.find((filing) => filing.form === "10-K") ?? fail(ticker, "no 10-K");

  const factsResult = await fetchCompanyFacts(cik);
  if (!factsResult.ok) fail(ticker, factsResult.message);
  const facts = factsResult.facts as CompanyFacts;
  const periodEnd = periodToRead(facts) ?? fail(ticker, "no annual period");
  const sector = sectorFromSic(filings.sic);
  const prefill = figuresFromFacts(facts, sector, periodEnd);
  const supplied = (key: string) => prefill.supplied.find((item) => item.key === key) ?? fail(ticker, `${key} missing`);
  const revenue = supplied("revenue");
  const operating = supplied("operatingProfit");
  const assets = resolvePrimitive(facts, "assets", sector, periodEnd);
  const cash = resolveConcepts(facts, CASH, periodEnd) ?? fail(ticker, "cash missing");
  if (!("value" in assets)) fail(ticker, "assets missing");
  for (const [name, item] of [["revenue", revenue], ["operating profit", operating], ["assets", assets], ["cash", cash]] as const) {
    if (item.accession !== annual.accession) fail(ticker, `${name} comes from ${item.accession}, not the latest 10-K ${annual.accession}`);
  }
  if (revenue.concepts.length !== 1 || operating.concepts.length !== 1) fail(ticker, "revenue or operating profit is a sum, which the puzzle does not show");

  const listing = await fetchFilingFileNames(cik, annual.accession);
  if (!listing.ok) fail(ticker, listing.message);
  const files = pickXbrlFiles(listing.names, annual.primaryDocument);
  if (!files.instance) fail(ticker, "no XBRL data file");
  const instance = await fetchFilingFile(cik, annual.accession, files.instance);
  if (!instance.ok) fail(ticker, instance.message);
  const labels = files.labels ? await fetchFilingFile(cik, annual.accession, files.labels) : null;
  const xml = instance.body;

  const figures = {
    revenue: checked(ticker, xml, { value: revenue.value, concept: revenue.concepts[0], start: revenue.periodStart, end: revenue.periodEnd }, false),
    operatingProfit: checked(ticker, xml, { value: operating.value, concept: operating.concepts[0], start: operating.periodStart, end: operating.periodEnd }, false),
    assets: checked(ticker, xml, { value: assets.value, concept: assets.concept, start: null, end: assets.periodEnd }, true),
    cash: checked(ticker, xml, { value: cash.value, concept: cash.concept, start: null, end: cash.periodEnd }, true),
  };

  // Where revenue comes from, as the report itself splits it.
  const read = readRevenue(xml, labels && labels.ok ? labels.body : "");
  if (!read.found) fail(ticker, read.reason);
  if (read.revenue.total !== figures.revenue.value) fail(ticker, `revenue split totals ${read.revenue.total}, revenue is ${figures.revenue.value}`);
  const breakdown = read.revenue.breakdowns.find((item) => item.kind === review.mix.kind);
  if (!breakdown || !breakdown.found) fail(ticker, `no ${review.mix.kind} split`);
  const shareSum = breakdown.rows.reduce((sum, row) => sum + row.share, 0);
  if (Math.abs(shareSum - 1) > 0.001) fail(ticker, `${review.mix.kind} shares add up to ${shareSum}`);
  const relabel = (label: string) => {
    const blanked = redact(label, names).text;
    return review.mix.labels?.[label] ?? review.mix.labels?.[blanked] ?? blanked;
  };
  // A company's own catch-all ("All other countries", "Rest of world") goes last,
  // with any rows cut for space, so one remainder never sits beside another.
  const catchAll = /^(all )?others?\b|^rest of (the )?world|^everything else/i;
  const named = breakdown.rows
    .filter((row) => !catchAll.test(row.label))
    .sort((a, b) => b.share - a.share)
    .map((row) => ({ label: relabel(row.label), share: row.share }));
  const remainder = breakdown.rows.filter((row) => catchAll.test(row.label));
  const keep = review.mix.keep ?? 6;
  const kept = named.length + (remainder.length ? 1 : 0) > keep ? named.slice(0, keep - 1) : named;
  const rest = [...remainder, ...named.slice(kept.length)];
  const restShare = rest.reduce((sum, row) => sum + row.share, 0);
  const restLabel = rest.length === 1 && remainder.length === 1 ? relabel(remainder[0].label) : "Everything else";
  const rows = rest.length ? [...kept, { label: restLabel, share: restShare }] : kept;

  // The reviewed words, found in the Business section the reader shows.
  const document = await fetchFilingDocument(cik, annual.accession, annual.primaryDocument);
  if (!document.ok) fail(ticker, document.message);
  const report = await readReport({ cik, accession: annual.accession, document: annual.primaryDocument }, document.html, "10-K");
  const business = report.sections.find((section) => section.id === "business") ?? fail(ticker, "no Business section");
  const found = findLoosely(business.text, review.quote);
  if (found.length !== 1) fail(ticker, `the reviewed words appear ${found.length} times in Business`);
  const anchor = anchorFor(business.text, found[0].start, found[0].end);
  const shown = `${review.cutBefore ? "…" : ""}${redact(anchor.quote.replace(/\s+/g, " "), names).text}${review.cutAfter ? "…" : ""}`;

  for (const [where, text] of [["description", shown], ["industry", review.industry], ...rows.map((row) => ["revenue split", row.label] as const)] as const) {
    const visible = leaks(text, names);
    if (visible.length) fail(ticker, `${where} shows ${visible.join(", ")}: "${text}"`);
  }

  return {
    number,
    answer: { name: company.name, ticker, cik },
    report: { form: "10-K", accession: annual.accession, document: annual.primaryDocument, filed: annual.filingDate, periodEnd },
    ...figures,
    industry: { sic: filings.sic, secDescription: filings.sicDescription, label: review.industry },
    mix: { kind: review.mix.kind, rows },
    description: { shown, anchor: { sectionId: "business", ...anchor } },
  };
}

test("finalize the reviewed daily puzzles", async () => {
  process.env.OPS_EDGAR_FIXTURE_DIR = CACHE;
  const puzzles: DailyPuzzle[] = [];
  for (const [index, review] of REVIEWED.entries()) puzzles.push(await finalize(review, index + 1));
  expect(new Set(puzzles.map((puzzle) => puzzle.answer.ticker)).size).toBe(puzzles.length);

  const header = [
    "/**",
    " * The published daily company puzzles, one per day from FIRST_PUZZLE_DATE.",
    " *",
    " * Generated by scripts/daily-puzzle/finalize.puzzle.ts from the reviewed choices",
    " * in scripts/daily-puzzle/review.ts and each company's latest 10-K. Do not edit",
    " * by hand: change review.ts and run finalize again. Every number here was",
    " * checked against the report's own XBRL data file when it was written.",
    " */",
    'import type { DailyPuzzle } from "@/lib/daily-puzzle/types";',
    "",
    `export const PUZZLES: DailyPuzzle[] = ${JSON.stringify(puzzles, null, 2)};`,
    "",
  ].join("\n");
  writeFileSync(TARGET, header);
  void readFileSync;
});
