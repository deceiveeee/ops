import { padCik, type CompanyMatch } from "./edgar";

/**
 * Finding a company by what a person would type: its ticker, or part of its name.
 *
 * Research's search box used to filter only the eight investments in Studio's
 * library, so typing "Netflix" there said nothing matched, while other pages
 * could already read any company's reports and work out its figures from a
 * ticker. This is the lookup that joins them: EDGAR's own list of every company
 * with a ticker, searched on the server so the list, 798 KB when measured on
 * 2026-09-16, never goes to the browser.
 *
 * **Order.** An exact ticker comes first, then tickers that begin with what was
 * typed, then names with a word that begins with it, then names that merely
 * contain it, spaces aside: the SEC lists "JPMORGAN CHASE & CO", and a person
 * types "JP Morgan". Within each, EDGAR's own order is kept. The SEC does not document
 * that order, but on 2026-09-16 it ran from the largest companies down (NVIDIA,
 * Apple, Alphabet, Microsoft open the file), so "apple" finds Apple Inc. before
 * Apple Hospitality REIT without Studio deciding which company matters more.
 *
 * **One row per company.** A company with several share classes is listed once
 * per ticker: 10,422 tickers for 8,022 companies, Alphabet alone as GOOGL, GOOG,
 * GOOGM and GOOGN. Each company appears once, under the ticker that matched best.
 */

export const QUERY_MAX = 60;
export const RESULTS_MAX = 5;

/** Letters and digits, lowercased, with everything else a single space. */
const fold = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function searchCompanies(json: unknown, query: string, limit = RESULTS_MAX): CompanyMatch[] {
  if (!json || typeof json !== "object") return [];
  const wanted = fold(query);
  if (!wanted) return [];
  const ticker = query.trim().toUpperCase();
  const tickerLike = /^[A-Z0-9.-]+$/.test(ticker);

  const best = new Map<string, { rank: number; order: number; match: CompanyMatch }>();
  for (const value of Object.values(json as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const row = value as { cik_str?: unknown; ticker?: unknown; title?: unknown };
    if (typeof row.ticker !== "string" || row.cik_str === undefined) continue;
    const cik = padCik(String(row.cik_str));
    const symbol = row.ticker.toUpperCase();
    const name = typeof row.title === "string" ? row.title : symbol;
    const folded = fold(name);
    const rank =
      symbol === ticker ? 0
      : tickerLike && symbol.startsWith(ticker) ? 1
      : folded.startsWith(wanted) || folded.includes(` ${wanted}`) ? 2
      : folded.includes(wanted) || folded.replace(/ /g, "").includes(wanted.replace(/ /g, "")) ? 3
      : -1;
    const previous = best.get(cik);
    const order = previous?.order ?? best.size;
    if (rank === -1) {
      // Hold the company's place in EDGAR's order even when this ticker does not match.
      if (!previous) best.set(cik, { rank: Infinity, order, match: { cik, ticker: symbol, name } });
      continue;
    }
    if (!previous || rank < previous.rank) best.set(cik, { rank, order, match: { cik, ticker: symbol, name } });
  }

  return [...best.values()]
    .filter((item) => item.rank !== Infinity)
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .slice(0, limit)
    .map((item) => item.match);
}
