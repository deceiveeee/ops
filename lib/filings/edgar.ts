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

async function secFetch(
  url: string,
  revalidateSeconds: number,
): Promise<EdgarResult<{ body: string }>> {
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

/** A company's recent readable filings. Cached for an hour. */
export async function fetchFilings(
  cik: string,
): Promise<EdgarResult<{ name: string; filings: FilingSummary[] }>> {
  const res = await secFetch(`https://data.sec.gov/submissions/CIK${padCik(cik)}.json`, 3_600);
  if (!res.ok) return res;

  let parsed: unknown;
  try {
    parsed = JSON.parse(res.body);
  } catch {
    return { ok: false, reason: "fetch-failed", message: "That company's filing index could not be read." };
  }

  return { ok: true, name: companyName(parsed), filings: parseSubmissions(parsed) };
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
