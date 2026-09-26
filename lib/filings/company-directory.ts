import snapshot from "./data/company-directory.json";
import { fetchCompanyTickers } from "./edgar";

export type DirectorySource = { kind: "live" | "saved"; fetchedAt?: string; url: string };

function readableDirectory(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rows = Object.values(value);
  return rows.length > 0 && rows.every((row) => row && Number.isInteger(row.cik_str) && row.cik_str > 0 && typeof row.ticker === "string" && row.ticker && typeof row.title === "string");
}

/** Server-only caller: ship the few matching names, not the whole directory. */
export async function companyDirectory(): Promise<{ json: unknown; source: DirectorySource }> {
  const latest = await fetchCompanyTickers();
  if (latest.ok && readableDirectory(latest.json)) return { json: latest.json, source: { kind: "live", url: snapshot.sourceUrl } };
  return { json: snapshot.companies, source: { kind: "saved", fetchedAt: snapshot.fetchedAt, url: snapshot.sourceUrl } };
}
