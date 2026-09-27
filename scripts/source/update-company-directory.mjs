import env from "@next/env";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

// A public, dated directory for search during SEC connection failures.
// It contains identifiers only, never prices or financial assumptions.
env.loadEnvConfig(process.cwd());
if (!process.env.OPS_SEC_CONTACT?.trim()) throw new Error("Configure OPS_SEC_CONTACT before fetching the SEC directory.");
const sourceUrl = "https://www.sec.gov/files/company_tickers.json";
const response = await fetch(sourceUrl, { headers: { "User-Agent": `Open Portfolio Studio educational research ${process.env.OPS_SEC_CONTACT.trim()}` }, signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`SEC directory returned ${response.status}`);
const raw = await response.text();
const companies = JSON.parse(raw);
const rows = Object.values(companies);
if (rows.length < 1000 || !rows.every((r) => Number.isInteger(r.cik_str) && r.cik_str > 0 && typeof r.ticker === "string" && r.ticker && typeof r.title === "string" && r.title)) throw new Error("Unexpected SEC directory format.");
const output = { sourceUrl, fetchedAt: new Date().toISOString(), sha256: createHash("sha256").update(raw).digest("hex"), companies };
await mkdir("lib/filings/data", { recursive: true });
await writeFile("lib/filings/data/company-directory.json", JSON.stringify(output) + "\n");
console.log(`Saved ${rows.length} SEC ticker entries, retrieved ${output.fetchedAt}.`);
