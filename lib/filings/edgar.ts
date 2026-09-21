/**
 * EDGAR access for the filing reader.
 *
 * The SEC refuses automated requests that do not identify the requester. Its
 * fair-access policy asks for a User-Agent naming the requester with a contact
 * address, and enforcement differs by host: `data.sec.gov` accepts a string
 * without an address, while `www.sec.gov` returns
 * "Your Request Originates from an Undeclared Automated Tool" without one.
 *
 * The address therefore comes from `OPS_SEC_CONTACT` and is never committed.
 * When it is unset every call here fails in a way the page can explain, rather
 * than throwing or - worse - fetching without identification, which is the
 * behaviour the policy exists to prevent.
 *
 * Nothing here touches market data. These are documents companies filed, which
 * is a different thing from prices, and the course's no-live-market-data rule is
 * about the latter.
 */

const SEC_RATE_NOTE =
  "SEC fair access allows a low request rate; this reader fetches one document at a time and caches the result.";

export type EdgarUnavailable = {
  ok: false;
  reason: "no-contact" | "not-found" | "fetch-failed";
  message: string;
};

export type EdgarResult<T> = ({ ok: true } & T) | EdgarUnavailable;

/** The declared identity, or null when the deployment has not configured one. */
export function secUserAgent(): string | null {
  // Fixture mode never reaches the SEC, so it has no one to identify itself to.
  if (process.env.OPS_EDGAR_FIXTURE_DIR?.trim()) return "Open Portfolio Studio test fixtures";
  const contact = process.env.OPS_SEC_CONTACT?.trim();
  if (!contact) return null;
  return `Open Portfolio Studio educational research ${contact}`;
}

const noContact: EdgarUnavailable = {
  ok: false,
  reason: "no-contact",
  message:
    "This reader fetches documents straight from EDGAR, and the SEC requires a contact address in the request. Set OPS_SEC_CONTACT to enable it.",
};

/**
 * The file a URL is served from when `OPS_EDGAR_FIXTURE_DIR` is set.
 *
 * Every character that is not a letter, digit, dot, dash or underscore becomes
 * an underscore, so no name can climb out of the directory it is read from.
 */
export function fixtureFileName(url: string): string {
  return url.replace(/[^A-Za-z0-9._-]/g, "_");
}

/**
 * Company reports from files on disk instead of from sec.gov.
 *
 * For the end-to-end tests, which must pass whether or not the SEC is reachable,
 * fast or rate-limiting that afternoon. Set only in `playwright.config.ts`. A
 * missing fixture is "not found" and never falls through to the network, so a
 * test run cannot quietly send requests the fixtures were meant to replace.
 *
 * The imports are dynamic, and hidden from webpack, so the file system is only
 * reached for when fixture mode is actually on. The pure helpers in this module
 * are the kind client code reaches for, and a top-level import of `node:fs`
 * would turn any such import into a failed browser build.
 */
async function readFixture(directory: string, url: string): Promise<EdgarResult<{ body: string }>> {
  try {
    const { readFile } = await import(/* webpackIgnore: true */ "node:fs/promises");
    const { join } = await import(/* webpackIgnore: true */ "node:path");
    return { ok: true, body: await readFile(join(directory, fixtureFileName(url)), "utf8") };
  } catch {
    return { ok: false, reason: "not-found", message: "EDGAR has no document at that address." };
  }
}

async function secFetch(
  url: string,
  revalidateSeconds: number,
): Promise<EdgarResult<{ body: string }>> {
  const fixtures = process.env.OPS_EDGAR_FIXTURE_DIR?.trim();
  if (fixtures) return readFixture(fixtures, url);

  const ua = secUserAgent();
  if (!ua) return noContact;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": ua, Accept: "*/*" },
      next: { revalidate: revalidateSeconds },
    });
    if (res.status === 404) {
      return { ok: false, reason: "not-found", message: "EDGAR has no document at that address." };
    }
    if (!res.ok) {
      return {
        ok: false,
        reason: "fetch-failed",
        message: `EDGAR replied ${res.status}. ${SEC_RATE_NOTE}`,
      };
    }
    return { ok: true, body: await res.text() };
  } catch {
    return { ok: false, reason: "fetch-failed", message: "EDGAR could not be reached." };
  }
}

// ---------------------------------------------------------------------------
// Pure helpers. Kept separate from the network so they can be tested directly.
// ---------------------------------------------------------------------------

/** EDGAR's JSON endpoints want a ten-digit, zero-padded CIK. */
export function padCik(cik: string | number): string {
  return String(cik).replace(/\D/g, "").padStart(10, "0");
}

/** Archive paths use the CIK without padding and the accession without dashes. */
export function archivePath(cik: string | number, accession: string, document: string): string {
  const bare = String(padCik(cik)).replace(/^0+/, "");
  const acc = accession.replace(/-/g, "");
  return `https://www.sec.gov/Archives/edgar/data/${bare}/${acc}/${document}`;
}

/** The human-facing EDGAR page for a filing, for "read it at the source". */
export function filingIndexUrl(cik: string | number, accession: string): string {
  const bare = String(padCik(cik)).replace(/^0+/, "");
  return `https://www.sec.gov/Archives/edgar/data/${bare}/${accession.replace(/-/g, "")}/${accession}-index.htm`;
}

export type CompanyMatch = { cik: string; ticker: string; name: string };

/**
 * Resolve a ticker from EDGAR's own ticker file.
 *
 * The file is a map of arbitrary keys to `{cik_str, ticker, title}`, so it is
 * parsed defensively: a shape change should degrade to "not found" rather than
 * throw inside a page render.
 */
export function findTicker(json: unknown, symbol: string): CompanyMatch | null {
  if (!json || typeof json !== "object") return null;
  const wanted = symbol.trim().toUpperCase();
  if (!wanted) return null;

  for (const value of Object.values(json as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const row = value as { cik_str?: unknown; ticker?: unknown; title?: unknown };
    if (typeof row.ticker !== "string" || row.ticker.toUpperCase() !== wanted) continue;
    return {
      cik: padCik(String(row.cik_str ?? "")),
      ticker: row.ticker.toUpperCase(),
      name: typeof row.title === "string" ? row.title : row.ticker.toUpperCase(),
    };
  }
  return null;
}

export type FilingSummary = {
  form: string;
  filingDate: string;
  accession: string;
  primaryDocument: string;
  reportDate: string;
};

/**
 * The filings worth opening in a reader that teaches how to read a business.
 *
 * Annual and quarterly reports carry the sections this reader knows about. The
 * rest of a company's EDGAR history - ownership forms, registration statements -
 * would fill the list without giving a beginner anything to read.
 */
const READABLE_FORMS = new Set(["10-K", "10-Q", "20-F", "40-F"]);

/**
 * The once-a-year filings, which are the ones a beginner wants.
 *
 * A quarterly report updates a story the annual one tells: the business
 * description, the risk factors and the audited statements are in the 10-K (or
 * the 20-F and 40-F that foreign issuers file instead). It is also the document
 * Studio's own investigation asks for seven figures from, so naming it is not a
 * preference — it is the difference between a learner opening the right file
 * and the most recent one.
 */
export const ANNUAL_FORMS = new Set(["10-K", "20-F", "40-F"]);

/** Whether this filing is the yearly report rather than a quarterly update. */
export const isAnnual = (form: string): boolean => ANNUAL_FORMS.has(form);

export function parseSubmissions(json: unknown, limit = 12): FilingSummary[] {
  if (!json || typeof json !== "object") return [];
  const recent = (json as { filings?: { recent?: Record<string, unknown> } }).filings?.recent;
  if (!recent) return [];

  const col = (key: string): unknown[] => (Array.isArray(recent[key]) ? (recent[key] as unknown[]) : []);
  const forms = col("form");
  const dates = col("filingDate");
  const accessions = col("accessionNumber");
  const documents = col("primaryDocument");
  const reports = col("reportDate");

  const out: FilingSummary[] = [];
  for (let i = 0; i < forms.length && out.length < limit; i++) {
    const form = String(forms[i] ?? "");
    if (!READABLE_FORMS.has(form)) continue;
    const document = String(documents[i] ?? "");
    if (!document.toLowerCase().endsWith(".htm")) continue;
    out.push({
      form,
      filingDate: String(dates[i] ?? ""),
      accession: String(accessions[i] ?? ""),
      primaryDocument: document,
      reportDate: String(reports[i] ?? ""),
    });
  }
  return out;
}

export function companyName(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  const name = (json as { name?: unknown }).name;
  return typeof name === "string" ? name : "";
}

/**
 * The industry the SEC assigns the company, from its own filing index.
 *
 * SIC decides which accounting shape a company's statements have, and so which
 * XBRL concepts mean what for it - a bank's revenue is not a line but a sum.
 * It is read from the submissions payload rather than guessed from the name.
 */
export function companySic(json: unknown): { sic: string; sicDescription: string } {
  if (!json || typeof json !== "object") return { sic: "", sicDescription: "" };
  const row = json as { sic?: unknown; sicDescription?: unknown };
  return {
    sic: typeof row.sic === "string" || typeof row.sic === "number" ? String(row.sic) : "",
    sicDescription: typeof row.sicDescription === "string" ? row.sicDescription : "",
  };
}

// ---------------------------------------------------------------------------
// Network calls.
// ---------------------------------------------------------------------------

/** Ticker to CIK. Cached for a day: the file changes on new listings only. */
export async function resolveTicker(symbol: string): Promise<EdgarResult<{ company: CompanyMatch }>> {
  const res = await secFetch("https://www.sec.gov/files/company_tickers.json", 86_400);
  if (!res.ok) return res;

  let parsed: unknown;
  try {
    parsed = JSON.parse(res.body);
  } catch {
    return { ok: false, reason: "fetch-failed", message: "EDGAR's ticker file could not be read." };
  }

  const company = findTicker(parsed, symbol);
  if (!company) {
    return {
      ok: false,
      reason: "not-found",
      message: `No company files with EDGAR under the ticker "${symbol.toUpperCase()}".`,
    };
  }
  return { ok: true, company };
}

/**
 * EDGAR's whole ticker file, parsed: every company with a ticker, by SEC number
 * and name. Cached for a day, like the lookup above. The Competitors tab matches
 * the companies a report names against it.
 */
export async function fetchCompanyTickers(): Promise<EdgarResult<{ json: unknown }>> {
  const res = await secFetch("https://www.sec.gov/files/company_tickers.json", 86_400);
  if (!res.ok) return res;
  try {
    return { ok: true, json: JSON.parse(res.body) };
  } catch {
    return { ok: false, reason: "fetch-failed", message: "EDGAR's ticker file could not be read." };
  }
}

/** A company's recent readable filings, and the industry SEC files it under. Cached for an hour. */
export async function fetchFilings(
  cik: string,
): Promise<EdgarResult<{ name: string; sic: string; sicDescription: string; filings: FilingSummary[] }>> {
  const res = await secFetch(`https://data.sec.gov/submissions/CIK${padCik(cik)}.json`, 3_600);
  if (!res.ok) return res;

  let parsed: unknown;
  try {
    parsed = JSON.parse(res.body);
  } catch {
    return { ok: false, reason: "fetch-failed", message: "That company's filing index could not be read." };
  }

  return { ok: true, name: companyName(parsed), ...companySic(parsed), filings: parseSubmissions(parsed) };
}

/**
 * Everything a company has tagged in XBRL, as the SEC assembles it.
 *
 * A few megabytes, and it changes only when a filing lands, so it is cached for
 * six hours. This is what fills Investigate's seven boxes; it deliberately
 * holds no dimensional detail - revenue by product line lives in the filing's
 * own data file, not here.
 */
export async function fetchCompanyFacts(cik: string): Promise<EdgarResult<{ facts: unknown }>> {
  const res = await secFetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${padCik(cik)}.json`, 21_600);
  if (!res.ok) {
    // A company with nothing tagged is a real case, and 404 here means exactly
    // that rather than a bad address the learner could correct.
    if (res.reason === "not-found") {
      return {
        ok: false,
        reason: "not-found",
        message: "The SEC holds no tagged financial data for this company, so its figures cannot be filled in automatically.",
      };
    }
    return res;
  }

  try {
    return { ok: true, facts: JSON.parse(res.body) };
  } catch {
    return { ok: false, reason: "fetch-failed", message: "That company's tagged financial data could not be read." };
  }
}

/**
 * One filing document. Cached hard: a filed document never changes, which is
 * most of what makes it worth reading.
 */
export async function fetchFilingDocument(
  cik: string,
  accession: string,
  document: string,
): Promise<EdgarResult<{ html: string }>> {
  const res = await secFetch(archivePath(cik, accession, document), 604_800);
  if (!res.ok) return res;
  return { ok: true, html: res.body };
}

/**
 * Any file in a filing, by name: its XBRL data file, say, or its label file.
 * A data file can run to megabytes, so a caller reading one should cache what
 * it works out from the file rather than count on the file itself being cached.
 */
export async function fetchFilingFile(cik: string, accession: string, name: string): Promise<EdgarResult<{ body: string }>> {
  return secFetch(archivePath(cik, accession, name), 604_800);
}

export type FilingPart = { document: string; type: string; description: string; size: number };

/**
 * The documents a filing holds, each with its type ("40-F", "EX-99.1"), from
 * the filing's index page, which is the only place EDGAR states them. A
 * Canadian company's annual report on Form 40-F files its annual information
 * form, its discussion of results and its statements as exhibits beside a
 * short cover document.
 */
export async function fetchFilingParts(cik: string, accession: string): Promise<EdgarResult<{ parts: FilingPart[] }>> {
  const res = await secFetch(archivePath(cik, accession, `${accession}-index.htm`), 604_800);
  if (!res.ok) return res;
  return { ok: true, parts: parseFilingParts(res.body) };
}

/** The rows of a filing index page's document table: sequence, description, document, type, size. */
export function parseFilingParts(html: string): FilingPart[] {
  const cell = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ").trim();
  const parts: FilingPart[] = [];
  for (const [, row] of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(([, value]) => value);
    if (cells.length < 5) continue;
    const document = cells[2].match(/href="[^"]*\/([^"/]+\.html?)"/i)?.[1] ?? cell(cells[2]).split(" ")[0];
    if (!/\.html?$/i.test(document)) continue;
    parts.push({ document, type: cell(cells[3]), description: cell(cells[1]), size: Number(cell(cells[4]).replace(/\D/g, "")) || 0 });
  }
  return parts;
}

/** The names of the files a filing holds, from its index. */
export async function fetchFilingFileNames(cik: string, accession: string): Promise<EdgarResult<{ names: string[] }>> {
  const res = await secFetch(archivePath(cik, accession, "index.json"), 604_800);
  if (!res.ok) return res;
  try {
    const parsed = JSON.parse(res.body) as { directory?: { item?: { name?: unknown }[] } };
    const names = (parsed.directory?.item ?? []).map((item) => item.name).filter((name): name is string => typeof name === "string");
    return { ok: true, names };
  } catch {
    return { ok: false, reason: "fetch-failed", message: "That filing's list of files could not be read." };
  }
}
