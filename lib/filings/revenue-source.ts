import { unstable_cache } from "next/cache";
import { fetchFilingFile, fetchFilingFileNames } from "./edgar";
import { pickXbrlFiles, readRevenue, type RevenueResult } from "./revenue";

/**
 * Where a filing's revenue comes from, worked out on the server and cached.
 *
 * The files behind it are megabytes (Atkore's data file is 2.4 MB and its label
 * file 1.1 MB) and never change once filed, while what is worked out from them
 * is a few kilobytes. So the answer is what gets cached, for a week, and not the
 * files. An EDGAR failure is not an answer and is never cached: the next visit
 * tries again.
 */

export interface RevenueFromFiling {
  result: RevenueResult;
  /** The files read, so the page can link to the data it came from. */
  dataFile: string | null;
  labelFile: string | null;
}

class Unavailable extends Error {}

const cached = unstable_cache(
  async (cik: string, accession: string, primaryDocument: string, _mode: string): Promise<RevenueFromFiling> => {
    const listing = await fetchFilingFileNames(cik, accession);
    if (!listing.ok) throw new Unavailable(listing.message);
    const { instance, labels } = pickXbrlFiles(listing.names, primaryDocument);
    if (!instance) {
      return {
        result: { found: false, reason: "This report has no XBRL data file, so its revenue cannot be broken down here." },
        dataFile: null,
        labelFile: labels,
      };
    }
    const [data, names] = await Promise.all([
      fetchFilingFile(cik, accession, instance),
      labels ? fetchFilingFile(cik, accession, labels) : Promise.resolve(null),
    ]);
    if (!data.ok) throw new Unavailable(data.message);
    if (names && !names.ok) throw new Unavailable(names.message);
    return { result: readRevenue(data.body, names ? names.body : ""), dataFile: instance, labelFile: labels };
  },
  ["filing-revenue-v1"],
  { revalidate: 604_800 },
);

export async function revenueFromFiling(cik: string, accession: string, primaryDocument: string): Promise<RevenueFromFiling> {
  // Fixture answers and live ones are kept apart, so a test run can never be served a live result or the reverse.
  const mode = process.env.OPS_EDGAR_FIXTURE_DIR?.trim() ? "fixture" : "live";
  try {
    return await cached(cik, accession, primaryDocument, mode);
  } catch (error) {
    if (error instanceof Unavailable) return { result: { found: false, reason: error.message }, dataFile: null, labelFile: null };
    throw error;
  }
}
