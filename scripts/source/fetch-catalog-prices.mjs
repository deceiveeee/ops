#!/usr/bin/env node
/**
 * Dated prices for what a learner buys, from the holdings filings of funds that own it.
 *
 *   node --env-file=.env.local scripts/source/fetch-catalog-prices.mjs
 *
 * The buying worksheet used to say Studio holds no market prices and ask for a
 * broker's quote, which was the last outside website on the Atkore journey. The
 * catalogue's funds are not in the price snapshot, because that is built from
 * stock index funds, which hold stocks. But funds that hold VTI file what their
 * VTI was worth and how many shares it was, each month-end, and the quotient is
 * VTI's closing price that day. docs/source-audits/studio-fund-prices.md records
 * the research, including the check that unrelated funds agree to the cent.
 *
 * For each listing in catalog-prices-manifest.json this:
 *
 * 1. finds holdings filings that mention its CUSIP, through EDGAR full-text
 *    search, over the last WINDOW_DAYS;
 * 2. reads the most recently filed of them, smallest first to fail, skipping
 *    any over SIZE_CAP, with the extraction rules in lib/studio-project/prices.ts;
 * 3. keeps only holdings whose identifier is that exact listing;
 * 4. takes the newest month-end on which funds under two different registrants agree
 *    (lib/studio-project/catalog-prices.ts), or records that there is none.
 *
 * Writes lib/studio-project/data/catalog-prices.json and the audit page
 * docs/source-audits/studio-catalog-prices.md. A listing with no checked price
 * is written as having none; the worksheet then asks for the broker's quote.
 *
 * EDGAR's full-text search returned server errors to queries 400ms apart during
 * the research and answered at 1.5 seconds with retries, so it is paced here.
 * Every request names a contact address, from OPS_SEC_CONTACT, which is never
 * printed or written anywhere.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AGREEMENT_TOLERANCE, extractObservations } from "../../lib/studio-project/prices.ts";
import { choosePrice, namesListing } from "../../lib/studio-project/catalog-prices.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DATASET = join(ROOT, "lib", "studio-project", "data", "catalog-prices.json");
const REPORT = join(ROOT, "docs", "source-audits", "studio-catalog-prices.md");

/** Long enough to hold two month-ends' filings, given they arrive about two months late. */
const WINDOW_DAYS = 150;
/** Enough filings to find agreement; stop early once the newest date is well corroborated. */
const MAX_FILINGS = 20;
const ENOUGH_REGISTRANTS = 3;
/** A holdings filing for a fund of funds is kilobytes. One for a large fund can be tens of megabytes. */
const SIZE_CAP = 4 * 1024 * 1024;
const SEARCH_PAUSE_MS = 1_500;
const ARCHIVE_PAUSE_MS = 600;

const contact = process.env.OPS_SEC_CONTACT?.trim();
if (!contact) {
  throw new Error("Set OPS_SEC_CONTACT, for example: node --env-file=.env.local scripts/source/fetch-catalog-prices.mjs");
}
const UA = `Open Portfolio Studio educational research ${contact}`;
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function edgar(url, pause) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    await sleep(pause * attempt);
    const response = await fetch(url, { headers: { "User-Agent": UA, Accept: "*/*" } });
    if (response.ok) return response;
    if (response.status === 404) return response;
    if (attempt === 4) return response;
  }
}

/** Read a response body up to the cap, cancelling rather than pulling a large filing whole. */
async function readCapped(response) {
  const reader = response.body.getReader();
  const parts = [];
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > SIZE_CAP) {
      await reader.cancel();
      return { text: null, bytes };
    }
    parts.push(value);
  }
  return { text: Buffer.concat(parts).toString("utf8"), bytes };
}

const today = new Date().toISOString().slice(0, 10);
const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString().slice(0, 10);

/** Holdings filings that mention the CUSIP, most recently filed first. */
async function holdersOf(cusip) {
  const found = new Map();
  for (const from of [0, 100]) {
    const url =
      `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(`"${cusip}"`)}` +
      `&forms=NPORT-P&dateRange=custom&startdt=${since}&enddt=${today}&from=${from}`;
    const response = await edgar(url, SEARCH_PAUSE_MS);
    if (!response.ok) throw new Error(`full-text search for ${cusip} answered ${response.status}`);
    const hits = (await response.json()).hits?.hits ?? [];
    for (const hit of hits) {
      const [accession, file] = hit._id.split(":");
      if (file !== "primary_doc.xml" || found.has(accession)) continue;
      found.set(accession, {
        accession,
        cik: String(Number(hit._source.ciks?.[0] ?? "0")),
        filedAt: hit._source.file_date,
        entity: String(hit._source.display_names?.[0] ?? "").replace(/\s*\(CIK \d+\)\s*$/, ""),
      });
    }
    if (hits.length < 100) break;
  }
  return [...found.values()].sort((a, b) => b.filedAt.localeCompare(a.filedAt));
}

const manifest = JSON.parse(readFileSync(join(HERE, "catalog-prices-manifest.json"), "utf8"));
const listings = {};

for (const { instrumentId, symbol, cusip } of manifest.listings) {
  const holders = await holdersOf(cusip);
  const reports = [];
  let read = 0;
  let skipped = 0;

  for (const holder of holders) {
    if (read >= MAX_FILINGS) break;
    const url = `https://www.sec.gov/Archives/edgar/data/${holder.cik}/${holder.accession.replace(/-/g, "")}/primary_doc.xml`;
    const response = await edgar(url, ARCHIVE_PAUSE_MS);
    if (!response.ok) continue;
    const { text } = await readCapped(response);
    if (text === null) {
      skipped += 1;
      continue;
    }
    read += 1;
    const series = text.match(/<seriesName>([^<]*)<\/seriesName>/)?.[1]?.trim() ?? null;
    const extraction = extractObservations(text, holder);
    for (const observation of extraction.observations) {
      if (!namesListing(observation.securityId, cusip)) continue;
      reports.push({
        cik: holder.cik,
        accession: holder.accession,
        entity: holder.entity,
        series,
        filedAt: holder.filedAt,
        asOf: observation.asOf,
        price: observation.price,
        fairValueLevel: observation.fairValueLevel,
        currency: observation.venue.currency,
      });
    }

    // Filings are read newest-filed first, so the first month-ends seen are the
    // newest there are. Once one is well corroborated, more reading changes nothing.
    const newest = reports.reduce((latest, report) => (report.asOf > latest ? report.asOf : latest), "");
    const agreeingOnNewest = new Set(reports.filter((report) => report.asOf === newest).map((report) => report.cik)).size;
    if (agreeingOnNewest >= ENOUGH_REGISTRANTS) break;
  }

  const choice = choosePrice(reports, AGREEMENT_TOLERANCE);
  listings[instrumentId] = {
    symbol,
    cusip,
    price: choice.found ? choice.price : null,
    asOf: choice.found ? choice.asOf : "",
    fairValueLevel: choice.found ? "1" : null,
    registrants: choice.found ? choice.registrants : 0,
    agreeing: choice.found
      ? choice.agreeing.map(({ entity, series, cik, accession, filedAt }) => ({ entity, series, cik, accession, filedAt }))
      : [],
    reason: choice.found ? null : choice.reason,
    holdersFound: holders.length,
    filingsRead: read,
    filingsSkippedAsLarge: skipped,
    setAside: choice.setAside.map(({ report, why }) => ({ entity: report.entity, series: report.series, accession: report.accession, asOf: report.asOf, why })),
  };
  const line = choice.found
    ? `$${choice.price.toFixed(2)} on ${choice.asOf}, ${choice.registrants} registrants agreeing`
    : `no price: ${choice.reason}`;
  console.log(`${symbol.padEnd(5)} ${line} (${read} filings read of ${holders.length} found, ${skipped} skipped as large)`);
}

const dataset = {
  retrievedAt: today,
  method:
    "Each price is a month-end closing price: what funds holding the listing reported it was worth, divided by the shares they held, from their SEC N-PORT holdings filings. It is accepted only when funds under at least two different registrants report the same month-end and agree within the snapshot's tolerance.",
  terms: "SEC website dissemination terms, read firsthand on 2026-09-10 (docs/source-audits/studio-online-data-and-tools.md §5.1): information on sec.gov may be copied or further distributed; citation is requested.",
  tolerance: AGREEMENT_TOLERANCE,
  minimumRegistrants: 2,
  listings,
};
mkdirSync(dirname(DATASET), { recursive: true });
writeFileSync(DATASET, JSON.stringify(dataset, null, 2) + "\n", "utf8");

const human = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const lines = [
  "# Catalogue prices",
  "",
  "Generated by `scripts/source/fetch-catalog-prices.mjs`. Do not edit by hand.",
  "",
  `Retrieved ${today}. Why this works, and the check behind it: [studio-fund-prices.md](studio-fund-prices.md).`,
  "",
  "Each price is what funds holding the listing reported at a month-end, from their SEC holdings",
  "filings: dollar value divided by shares held. It is accepted only when funds under two different",
  "registrants report the same month-end and agree. A registrant is not quite a fund family: one sponsor",
  "can file under two trusts, so the count below can include two funds from one family. The Treasury",
  "note is priced from its own auction instead.",
  "",
  "## Prices",
  "",
  "| Listing | CUSIP | Price | Month-end | Registrants agreeing | Filings read |",
  "| --- | --- | ---: | --- | ---: | ---: |",
  ...Object.values(listings).map((entry) =>
    `| ${entry.symbol} | ${entry.cusip} | ${entry.price === null ? "none" : `$${entry.price.toFixed(2)}`} | ${entry.asOf ? human(entry.asOf) : "—"} | ${entry.registrants} | ${entry.filingsRead} of ${entry.holdersFound} |`,
  ),
  "",
  "## Where each price came from",
  "",
];
for (const entry of Object.values(listings)) {
  lines.push(`**${entry.symbol}**${entry.price === null ? ` — no price. ${entry.reason}` : ` — $${entry.price.toFixed(2)} on ${human(entry.asOf)}.`}`, "");
  for (const agreed of entry.agreeing) {
    lines.push(`- ${agreed.series ?? agreed.entity} (${agreed.entity}), accession \`${agreed.accession}\`, filed ${agreed.filedAt}`);
  }
  for (const aside of entry.setAside) {
    lines.push(`- Set aside: ${aside.series ?? aside.entity}, ${aside.asOf}, ${aside.why}`);
  }
  if (entry.filingsSkippedAsLarge) lines.push(`- ${entry.filingsSkippedAsLarge} filing(s) over 4 MB were not read.`);
  lines.push("");
}
lines.push(
  "## How fresh",
  "",
  "Holdings filings become public about two months after the month-end they report, so a price is",
  "roughly two to three months old when a learner sees it. The worksheet always shows its date, says",
  "what it is, and takes the learner's own broker quote instead whenever one is entered.",
  "",
  "## Refreshing",
  "",
  "Run the script once a month, after the filings for the next month-end are in, and commit the data",
  "and this page together.",
  "",
);
writeFileSync(REPORT, lines.join("\n"), "utf8");
console.log(`\ndataset  ${DATASET}\nreport   ${REPORT}`);
