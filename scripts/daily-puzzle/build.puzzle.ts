/**
 * Drafts the daily company puzzles from each company's latest annual report.
 *
 *     npx vitest run -c scripts/daily-puzzle/vitest.config.ts
 *
 * What it does, per company:
 *
 * 1. Finds the latest 10-K through Studio's own EDGAR client, so a puzzle reads
 *    the same report a learner opens in Company reports.
 * 2. Reads revenue, operating profit, borrowings and cash with
 *    `figuresFromFacts`, the code that fills Investigate's boxes.
 * 3. Checks every one of those numbers against the report's own XBRL data file,
 *    with a reader written here and sharing no code with the first path. A
 *    number that differs, or that comes from a different filing, is flagged.
 * 4. Reads where revenue comes from out of the same data file.
 * 5. Picks a sentence from the Business section that says what the company does,
 *    records exactly where it sits (so the answer can open it in the reader),
 *    and blanks out the company's name and brands.
 *
 * Nothing here is published. It writes drafts to tmp/daily-puzzle-build/, a
 * person reviews every clue, and the reviewed puzzles are written by hand into
 * data/daily-puzzle/puzzles.ts.
 *
 * SEC requests use the site's own contact address (OPS_SEC_CONTACT from
 * .env.local), are spaced a quarter of a second apart, and are cached in
 * tmp/daily-puzzle-cache/ so a second run sends nothing already fetched.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "vitest";
import { anchorFor } from "@/lib/filings/anchor";
import {
  fetchCompanyFacts,
  fetchFilingDocument,
  fetchFilingFile,
  fetchFilingFileNames,
  fetchFilings,
  fixtureFileName,
  resolveTicker,
} from "@/lib/filings/edgar";
import { readReport } from "@/lib/filings/reading";
import { pickXbrlFiles, readRevenue, type Breakdown } from "@/lib/filings/revenue";
import { sectorFromSic, type CompanyFacts } from "@/lib/studio-project/metrics";
import { figuresFromFacts, periodToRead, type SuppliedFigure } from "@/lib/studio-project/prefill";
import { COMPANIES } from "./companies";
import { instanceValues, redact } from "./shared";

const ROOT = process.cwd();
const CACHE = path.join(ROOT, "tmp", "daily-puzzle-cache");
const OUT = path.join(ROOT, "tmp", "daily-puzzle-build");

// ---------------------------------------------------------------- environment

function loadContact() {
  if (process.env.OPS_SEC_CONTACT?.trim()) return;
  const file = path.join(ROOT, ".env.local");
  if (!existsSync(file)) throw new Error("OPS_SEC_CONTACT is not set and there is no .env.local to read it from.");
  const line = readFileSync(file, "utf8").split(/\r?\n/).find((entry) => entry.startsWith("OPS_SEC_CONTACT="));
  const value = line?.slice("OPS_SEC_CONTACT=".length).trim().replace(/^["']|["']$/g, "");
  if (!value) throw new Error("OPS_SEC_CONTACT is empty in .env.local.");
  process.env.OPS_SEC_CONTACT = value;
}

let lastLive = 0;
let liveRequests = 0;

/** Every SEC response is kept on disk under the name EDGAR fixture mode would use. */
function installCachingFetch() {
  mkdirSync(CACHE, { recursive: true });
  const live = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const file = path.join(CACHE, fixtureFileName(url));
    if (existsSync(file)) return new Response(readFileSync(file));
    const wait = lastLive + 250 - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastLive = Date.now();
    liveRequests += 1;
    const response = await live(input, init);
    if (!response.ok) return response;
    const body = Buffer.from(await response.arrayBuffer());
    writeFileSync(file, body);
    return new Response(body, { status: response.status, headers: response.headers });
  }) as typeof fetch;
}

// ------------------------------------------------- independent XBRL cross-check

type Check = { figure: string; concept: string; published: number; inReport: number[]; ok: boolean };

function checkFigure(xml: string, figure: SuppliedFigure, instant: boolean): Check[] {
  // A figure that is a sum is checked part by part; the sum is re-added below.
  return figure.concepts.map((concept) => {
    const inReport = instanceValues(xml, concept, { start: figure.periodStart, end: figure.periodEnd }, instant);
    return { figure: figure.key, concept, published: figure.concepts.length === 1 ? figure.value : NaN, inReport, ok: false };
  });
}

// ------------------------------------------------------------------ wording

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function yearEnding(periodEnd: string): string {
  const [year, month, day] = periodEnd.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export function dollars(value: number): string {
  const sign = value < 0 ? "-" : "";
  const v = Math.abs(value);
  if (v >= 1e9) return `${sign}$${(v / 1e9).toFixed(1)} billion`;
  if (v >= 1e6) return `${sign}$${Math.round(v / 1e6)} million`;
  return `${sign}$${Math.round(v).toLocaleString("en-US")}`;
}

/** "ELECTRONIC COMPUTERS" -> "Electronic computers"; "SERVICES-PREPACKAGED SOFTWARE" -> "Services: prepackaged software". */
function sicWords(description: string): string {
  const lower = description.toLowerCase().replace(/\s+/g, " ").trim().replace(/-/g, ": ").replace(/ ,/g, ",");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// ------------------------------------------------- choosing the description

const DOES = /\b(design|develop|manufactur|market|sell|sells|operat|offer|provid|make|makes|distribut|license|serve|produce|retail|own|creat|build|deliver)\w*/i;
const AVOID = /forward-looking|incorporated (in|under)|headquarter|fiscal year|annual report|Item\s+\d|Part\s+I|this report|refer to|see note|incorporated by reference|website|SEC filings|www\.|\.com\b/i;

type Sentence = { start: number; end: number; text: string };

function sentences(text: string, limit: number): Sentence[] {
  const out: Sentence[] = [];
  // A line break ends a sentence too: the reader keeps headings as their own lines.
  const pattern = /[^.!?\n]+(?:\.(?![ \t]*[a-z0-9])|[!?])?/g;
  let match: RegExpExecArray | null;
  const head = text.slice(0, limit);
  // Abbreviations such as "Inc." or "U.S." end no sentence; the lookahead above
  // only splits a period followed by a capital, so those mostly survive intact.
  while ((match = pattern.exec(head)) !== null) {
    const raw = match[0];
    const lead = raw.length - raw.trimStart().length;
    const body = raw.trim();
    if (body.length) out.push({ start: match.index + lead, end: match.index + lead + body.length, text: body });
    if (match[0].length === 0) pattern.lastIndex += 1;
  }
  return out;
}

function chooseDescription(text: string): Sentence[] {
  return sentences(text, 9_000)
    .filter((s) => s.text.length >= 90 && s.text.length <= 340 && DOES.test(s.text) && !AVOID.test(s.text) && /\.$/.test(s.text))
    .slice(0, 4);
}

// ---------------------------------------------------------------- the build

type Draft = Record<string, unknown>;

async function draftFor(entry: (typeof COMPANIES)[number]): Promise<Draft> {
  const problems: string[] = [];
  const resolved = await resolveTicker(entry.ticker);
  if (!resolved.ok) return { ticker: entry.ticker, problems: [`ticker: ${resolved.message}`] };
  const cik = resolved.company.cik;

  const filings = await fetchFilings(cik);
  if (!filings.ok) return { ticker: entry.ticker, problems: [`filings: ${filings.message}`] };
  const annual = filings.filings.find((filing) => filing.form === "10-K");
  if (!annual) return { ticker: entry.ticker, problems: ["no 10-K among recent filings"] };

  const factsResult = await fetchCompanyFacts(cik);
  if (!factsResult.ok) return { ticker: entry.ticker, problems: [`facts: ${factsResult.message}`] };
  const facts = factsResult.facts as CompanyFacts;
  const periodEnd = periodToRead(facts);
  if (!periodEnd) return { ticker: entry.ticker, problems: ["no annual period in company facts"] };
  const sector = sectorFromSic(filings.sic);
  if (sector !== "general") problems.push(`sector is ${sector}; puzzles use non-financial companies`);
  const prefill = figuresFromFacts(facts, sector, periodEnd);
  const figure = (key: string) => prefill.supplied.find((item) => item.key === key);
  const revenue = figure("revenue");
  const operating = figure("operatingProfit");
  const borrowings = figure("totalDebt");
  const cash = figure("cash");
  for (const [name, value] of Object.entries({ revenue, operating, borrowings, cash })) {
    if (!value) problems.push(`${name} missing: ${prefill.missing.find((m) => m.key === (name === "operating" ? "operatingProfit" : name === "borrowings" ? "totalDebt" : name))?.reason ?? "?"}`);
    else if (value.accession !== annual.accession) problems.push(`${name} comes from ${value.accession}, not the latest 10-K ${annual.accession}`);
  }

  // The report's own data file: the breakdown, and the second check of every figure.
  const listing = await fetchFilingFileNames(cik, annual.accession);
  const files = listing.ok ? pickXbrlFiles(listing.names, annual.primaryDocument) : { instance: null, labels: null };
  let breakdowns: Breakdown[] = [];
  let breakdownTotal: number | null = null;
  const checks: Check[] = [];
  if (!files.instance) {
    problems.push("no XBRL data file in the filing");
  } else {
    const instance = await fetchFilingFile(cik, annual.accession, files.instance);
    const labels = files.labels ? await fetchFilingFile(cik, annual.accession, files.labels) : null;
    if (!instance.ok) {
      problems.push(`data file: ${instance.message}`);
    } else {
      const read = readRevenue(instance.body, labels && labels.ok ? labels.body : "");
      if (read.found) {
        breakdowns = read.revenue.breakdowns;
        breakdownTotal = read.revenue.total;
      } else {
        problems.push(`revenue breakdown: ${read.reason}`);
      }
      for (const [item, instant] of [[revenue, false], [operating, false], [borrowings, true], [cash, true]] as const) {
        if (!item) continue;
        const parts = checkFigure(instance.body, item, instant);
        if (parts.length === 1) {
          parts[0].ok = parts[0].inReport.length === 1 && parts[0].inReport[0] === item.value;
        } else {
          const values = parts.map((part) => (part.inReport.length === 1 ? part.inReport[0] : NaN));
          const sum = values.reduce((total, value) => total + value, 0);
          // prefill subtracts a finance lease from a combined figure; every other sum is an addition.
          const ok = sum === item.value || (values.length >= 2 && values[0] - values[1] + values.slice(2).reduce((t, v) => t + v, 0) === item.value);
          for (const part of parts) part.ok = ok;
        }
        checks.push(...parts);
        if (parts.some((part) => !part.ok)) problems.push(`${item.key} does not match the report's data file`);
      }
    }
  }

  // The Business section, read the way the reader reads it.
  const document = await fetchFilingDocument(cik, annual.accession, annual.primaryDocument);
  let description: Draft | null = null;
  if (!document.ok) {
    problems.push(`document: ${document.message}`);
  } else {
    const report = await readReport({ cik, accession: annual.accession, document: annual.primaryDocument }, document.html, "10-K");
    const business = report.sections.find((section) => section.id === "business");
    if (!business) {
      problems.push("no Business section found by the reader");
    } else {
      const options = chooseDescription(business.text);
      if (!options.length) problems.push("no describing sentence found in the first 9,000 characters of Business");
      description = {
        options: options.map((option) => {
          const anchor = anchorFor(business.text, option.start, option.end);
          const blanked = redact(option.text, [entry.name, ...entry.brands]);
          return { anchor, redacted: blanked.text, blanks: blanked.hits };
        }),
      };
    }
  }

  const margin = revenue && operating ? operating.value / revenue.value : null;
  return {
    ticker: entry.ticker,
    name: entry.name,
    secName: filings.name,
    cik,
    sic: filings.sic,
    sicDescription: filings.sicDescription,
    industry: sicWords(filings.sicDescription),
    report: {
      form: annual.form,
      accession: annual.accession,
      document: annual.primaryDocument,
      filed: annual.filingDate,
      reportDate: annual.reportDate,
      periodEnd,
      yearEnding: yearEnding(periodEnd),
    },
    figures: {
      revenue: revenue ? { value: revenue.value, concepts: revenue.concepts, start: revenue.periodStart } : null,
      operatingProfit: operating ? { value: operating.value, concepts: operating.concepts } : null,
      borrowings: borrowings ? { value: borrowings.value, concepts: borrowings.concepts, addedUp: borrowings.addedUp } : null,
      cash: cash ? { value: cash.value, concepts: cash.concepts } : null,
      breakdownTotal,
    },
    wording: {
      revenue: revenue ? `${dollars(revenue.value)} of revenue in the year ending ${yearEnding(periodEnd)}` : null,
      margin: margin === null ? null : margin >= 0 ? `About ${Math.round(margin * 100)} cents of operating profit from each dollar of revenue` : `An operating loss of about ${Math.round(-margin * 100)} cents on each dollar of revenue`,
      borrowings: borrowings && cash ? `${dollars(borrowings.value)} of borrowings and ${dollars(cash.value)} of cash` : null,
    },
    breakdowns: breakdowns.map((breakdown) =>
      breakdown.found
        ? {
            kind: breakdown.kind,
            rows: breakdown.rows.map((row) => ({
              label: row.label,
              redacted: redact(row.label, [entry.name, ...entry.brands]).text,
              value: row.value,
              share: row.share,
            })),
            shareSum: breakdown.rows.reduce((total, row) => total + row.share, 0),
          }
        : { kind: breakdown.kind, found: false, reason: breakdown.reason },
    ),
    description,
    checks,
    problems,
  };
}

test("draft the daily company puzzles", async () => {
  loadContact();
  installCachingFetch();
  mkdirSync(OUT, { recursive: true });
  const only = process.env.PUZZLE_ONLY?.split(",").map((ticker) => ticker.trim().toUpperCase());
  const summary: string[] = [];
  for (const entry of COMPANIES) {
    if (only && !only.includes(entry.ticker)) continue;
    let draft: Draft;
    try {
      draft = await draftFor(entry);
    } catch (error) {
      draft = { ticker: entry.ticker, problems: [`threw: ${(error as Error).message}`] };
    }
    writeFileSync(path.join(OUT, `${entry.ticker}.json`), JSON.stringify(draft, null, 2));
    const problems = (draft.problems as string[]) ?? [];
    summary.push(`${entry.ticker}\t${problems.length ? "CHECK" : "ok"}\t${problems.join(" | ")}`);
  }
  summary.push(`live SEC requests this run: ${liveRequests}`);
  writeFileSync(path.join(OUT, "summary.tsv"), summary.join("\n"));
});
