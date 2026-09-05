#!/usr/bin/env node
/**
 * Price ingestion from N-PORT holdings filings.
 *
 *   node scripts/source/fetch-nport-prices.mjs --discover 0000036405
 *   node scripts/source/fetch-nport-prices.mjs                       all manifest funds
 *   node scripts/source/fetch-nport-prices.mjs VTI VXUS               named funds
 *   node scripts/source/fetch-nport-prices.mjs --since 2024-01-01
 *   node scripts/source/fetch-nport-prices.mjs --check                verify, fetch nothing
 *   node scripts/source/fetch-nport-prices.mjs --report               rebuild from cache only
 *
 * A fund reports what it held, how many shares, and what they were worth. Price
 * is the quotient. SEC filings are public domain, which is why this exists at
 * all: every commercial price feed examined forbids showing the numbers to a
 * learner, and a lesson that cannot show its evidence is not worth writing.
 *
 * The extraction rules live in lib/studio-project/prices.ts and are unit-tested
 * there. This file is only fetching, caching and provenance. Node 22.6+ strips
 * the types, so the two share one implementation rather than a copy.
 *
 * Requires OPS_SEC_CONTACT — an address SEC can use to reach whoever is running
 * this. Their fair-access policy requires it and blocks anonymous automation.
 * It is never committed.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSnapshot, extractObservations, isMarketPrice, NEAR_ZERO_PRICE } from "../../lib/studio-project/prices.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const CACHE = join(ROOT, ".source-cache", "nport");
const DIRS = { raw: join(CACHE, "raw"), snapshots: join(CACHE, "snapshots") };
const INDEX = join(CACHE, "index.json");
const REPORT = join(ROOT, "docs", "source-audits", "studio-price-snapshot.md");

const CONTACT = process.env.OPS_SEC_CONTACT;
if (!CONTACT) {
  console.error(
    "OPS_SEC_CONTACT is required.\n" +
      "SEC fair access asks automated requests to identify a contact address, and\n" +
      "blocks the ones that do not. Set it to an address you actually read:\n" +
      "  OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-nport-prices.mjs",
  );
  process.exit(1);
}
const UA = `Open Portfolio Studio educational research ${CONTACT}`;

/** SEC permits 10 requests a second. Well under it, deliberately. */
const THROTTLE_MS = 400;
let lastRequest = 0;

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function throttled(url, { stream = false } = {}) {
  const wait = THROTTLE_MS - (Date.now() - lastRequest);
  if (wait > 0) await sleep(wait);

  for (let attempt = 1; attempt <= 4; attempt++) {
    lastRequest = Date.now();
    let response;
    try {
      response = await fetch(url, { headers: { "User-Agent": UA, "Accept-Encoding": "gzip, deflate" } });
    } catch (error) {
      if (attempt === 4) throw error;
      await sleep(1000 * attempt);
      continue;
    }
    // 429 and 403 are how SEC signals it wants you to slow down.
    if ((response.status === 429 || response.status === 403 || response.status >= 500) && attempt < 4) {
      await sleep(2000 * attempt);
      continue;
    }
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
    return stream ? response : response.text();
  }
  throw new Error(`gave up after 4 attempts: ${url}`);
}

/**
 * Read only as much of a filing as identifies it, then hang up.
 *
 * SEC ignores Range headers and answers 200 with the whole document, but the
 * body is a stream and can be cancelled. A 3.1 MB filing identifies itself in
 * its first 16 KB, so discovery costs 0.5% of what downloading it would.
 */
async function probeHeader(url) {
  const response = await throttled(url, { stream: true });
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  while (bytes < 65_536) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    text += decoder.decode(value, { stream: true });
    if (text.includes("</genInfo>")) break;
  }
  await reader.cancel().catch(() => {});
  const tag = (name) => (text.match(new RegExp(`<${name}>([^<]*)</${name}>`)) ?? [])[1] ?? null;
  return { seriesId: tag("seriesId"), seriesName: tag("seriesName"), regName: tag("regName"), repPdDate: tag("repPdDate"), probedBytes: bytes };
}

const padCik = (cik) => String(cik).replace(/\D/g, "").padStart(10, "0");
const archiveUrl = (cik, accession) =>
  `https://www.sec.gov/Archives/edgar/data/${Number(padCik(cik))}/${accession.replace(/-/g, "")}/primary_doc.xml`;

/** Every NPORT-P a registrant has filed, including the older archived pages. */
async function listFilings(cik, since) {
  const padded = padCik(cik);
  const root = JSON.parse(await throttled(`https://data.sec.gov/submissions/CIK${padded}.json`));
  const pages = [root.filings.recent];
  for (const older of root.filings.files ?? []) {
    pages.push(JSON.parse(await throttled(`https://data.sec.gov/submissions/${older.name}`)));
  }

  const out = [];
  for (const page of pages) {
    for (let i = 0; i < page.form.length; i++) {
      if (page.form[i] !== "NPORT-P") continue;
      const reportDate = page.reportDate[i];
      if (since && reportDate && reportDate < since) continue;
      out.push({
        cik: padded,
        entity: root.name,
        accession: page.accessionNumber[i],
        reportDate,
        filedAt: page.filingDate[i],
        size: page.size[i],
      });
    }
  }
  return out.sort((a, b) => (b.reportDate ?? "").localeCompare(a.reportDate ?? ""));
}

const readIndex = () => (existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, "utf8")) : { probes: {}, fetched: {} });
const writeIndex = (index) => writeFileSync(INDEX, JSON.stringify(index, null, 2) + "\n", "utf8");

// ---------------------------------------------------------------- discovery

/**
 * Which funds does a registrant file for?
 *
 * The submissions index does not say: primaryDocDescription is empty and one
 * trust files a dozen NPORT-P submissions per quarter, one per fund. Only the
 * document itself names the series, so this probes headers and prints what it
 * finds. Nothing enters the manifest without being seen here first.
 */
async function discover(cik, since) {
  const filings = await listFilings(cik, since);
  const dates = [...new Set(filings.map((f) => f.reportDate))].sort();
  const newest = dates[dates.length - 1];
  const sample = filings.filter((f) => f.reportDate === newest);

  console.log(`${filings.length} NPORT-P filings, ${dates.length} report dates, ${dates[0]} to ${newest}`);
  console.log(`probing the ${sample.length} filings for ${newest} to name each fund\n`);

  const index = readIndex();
  const rows = [];
  for (const filing of sample) {
    const header = index.probes[filing.accession] ?? (await probeHeader(archiveUrl(filing.cik, filing.accession)));
    index.probes[filing.accession] = header;
    rows.push({ ...filing, ...header });
  }
  writeIndex(index);

  rows.sort((a, b) => b.size - a.size);
  console.log("seriesId     size      fund");
  for (const row of rows) {
    console.log(`${(row.seriesId ?? "?").padEnd(12)} ${String(Math.round(row.size / 1024) + "K").padStart(7)}   ${row.seriesName ?? "(unnamed)"}`);
  }
  console.log(`\nRegistrant: ${rows[0]?.regName ?? "(unknown)"}`);
  console.log("Add the ones you want to scripts/source/nport-manifest.json by seriesId.");
}

// ------------------------------------------------------------------ fetching

async function fetchFiling(filing, index) {
  const path = join(DIRS.raw, `${filing.accession}.xml`);
  if (existsSync(path) && index.fetched[filing.accession]) return readFileSync(path, "utf8");

  const xml = await throttled(archiveUrl(filing.cik, filing.accession));
  writeFileSync(path, xml, "utf8");
  index.fetched[filing.accession] = {
    sha256: createHash("sha256").update(xml).digest("hex"),
    bytes: Buffer.byteLength(xml),
    retrievedAt: new Date().toISOString(),
    url: archiveUrl(filing.cik, filing.accession),
    cik: filing.cik,
    entity: filing.entity,
    reportDate: filing.reportDate,
    filedAt: filing.filedAt,
  };
  return xml;
}

async function ingest(manifest, wanted, since, checkOnly) {
  const index = readIndex();
  const byCik = new Map();
  for (const fund of manifest.funds) {
    if (wanted.length && !wanted.includes(fund.ticker) && !wanted.includes(fund.seriesId)) continue;
    const list = byCik.get(fund.cik) ?? [];
    list.push(fund);
    byCik.set(fund.cik, list);
  }
  if (!byCik.size) {
    console.error(`no funds matched ${wanted.join(", ")}. Manifest has: ${manifest.funds.map((f) => f.ticker).join(", ")}`);
    process.exit(1);
  }

  const results = [];
  let probed = 0;
  let fetched = 0;

  for (const [cik, funds] of byCik) {
    const seriesWanted = new Set(funds.map((fund) => fund.seriesId));
    const label = funds.map((fund) => fund.ticker).join(", ");
    const filings = await listFilings(cik, since);
    console.log(`\n${funds[0].trust} (CIK ${cik}) — ${label}`);
    console.log(`  ${filings.length} NPORT-P filings since ${since ?? "the beginning"}`);

    for (const filing of filings) {
      // Identify the fund from the header before deciding to download megabytes.
      let header = index.probes[filing.accession];
      if (!header) {
        header = await probeHeader(archiveUrl(filing.cik, filing.accession));
        index.probes[filing.accession] = header;
        probed++;
        if (probed % 25 === 0) writeIndex(index);
      }
      if (!seriesWanted.has(header.seriesId)) continue;

      const fund = funds.find((candidate) => candidate.seriesId === header.seriesId);
      if (checkOnly) {
        console.log(`  would fetch ${filing.reportDate}  ${fund.ticker}  ${filing.accession}`);
        continue;
      }

      const cached = existsSync(join(DIRS.raw, `${filing.accession}.xml`));
      const xml = await fetchFiling(filing, index);
      if (!cached) fetched++;
      const result = extractObservations(xml, {
        cik: filing.cik,
        accession: filing.accession,
        filedAt: filing.filedAt,
        entity: filing.entity,
        ticker: fund.ticker,
      });
      results.push(result);
      console.log(
        `  ${result.asOf}  ${fund.ticker.padEnd(6)} ${String(result.observations.length).padStart(5)} priced` +
          `  ${String(result.exclusions.length).padStart(4)} excluded${cached ? "  (cached)" : ""}`,
      );
    }
  }

  writeIndex(index);
  console.log(`\nprobed ${probed} filing headers, downloaded ${fetched} filings`);
  return results;
}

// ------------------------------------------------------------------ snapshot

/** Rebuild from whatever is already cached, without touching the network. */
function fromCache() {
  const index = readIndex();
  const results = [];
  for (const file of readdirSync(DIRS.raw).filter((name) => name.endsWith(".xml"))) {
    const accession = file.replace(/\.xml$/, "");
    const meta = index.fetched[accession];
    if (!meta) continue;
    results.push(
      extractObservations(readFileSync(join(DIRS.raw, file), "utf8"), {
        cik: meta.cik,
        accession,
        filedAt: meta.filedAt,
        entity: meta.entity,
      }),
    );
  }
  return results;
}

function writeSnapshot(results, version) {
  const { snapshot, conflicts } = buildSnapshot(version, results);
  const path = join(DIRS.snapshots, `${version}.json`);
  writeFileSync(path, JSON.stringify(snapshot), "utf8");

  const q = snapshot.quality;
  const modelledNearZero = snapshot.observations.filter((o) => !isMarketPrice(o) && o.price < NEAR_ZERO_PRICE).length;
  const quotedNearZero = snapshot.observations.filter((o) => isMarketPrice(o) && o.price < NEAR_ZERO_PRICE).length;
  const index = readIndex();
  const provenance = snapshot.sources.map((source) => ({ ...source, ...(index.fetched[source.accession] ?? {}) }));

  const lines = [
    "# Price snapshot",
    "",
    "Generated by `scripts/source/fetch-nport-prices.mjs`. Do not edit by hand.",
    "",
    `Snapshot \`${version}\`, built ${snapshot.createdAt.slice(0, 10)} from ${snapshot.sources.length} N-PORT filings.`,
    "",
    "Prices are share value divided by share count, as filed. They are **price**",
    "returns, not total returns: dividends are not in them, and nothing built on",
    "them may be labelled a total return.",
    "",
    "## What it holds",
    "",
    "| | |",
    "| --- | --- |",
    `| Observations | ${q.observations.toLocaleString()} |`,
    `| Distinct securities | ${q.securities.toLocaleString()} |`,
    `| Priced on more than one exchange | ${q.multiVenue.toLocaleString()} |`,
    `| Confirmed by more than one filing | ${q.corroborated.toLocaleString()} |`,
    `| Report dates | ${q.dates.length} (${q.dates[0]} to ${q.dates[q.dates.length - 1]}) |`,
    "",
    "## Fair-value level",
    "",
    "How the fund valued the position, under ASC 820. Level 1 is a quoted market",
    "price. Level 2 is observable but adjusted, which is what a foreign holding",
    "usually is once its own exchange has closed. Both are usable; they are not",
    "the same kind of number, and anything displaying them must say which.",
    "",
    "| Level | Observations | Share |",
    "| --- | ---: | ---: |",
    ...["1", "2", "3", "unstated"].map(
      (level) => `| ${level} | ${q.byLevel[level].toLocaleString()} | ${((q.byLevel[level] / q.observations) * 100).toFixed(2)}% |`,
    ),
    "",
    "## Values that are not quoted prices",
    "",
    `Level 3 covers ${q.modelled.toLocaleString()} observations, valued from inputs no market supplied.`,
    `Of these ${modelledNearZero.toLocaleString()} are priced under a hundredth of a cent — write-downs rather`,
    "than prices: sanctioned holdings, delisted shells, suspended listings. For",
    `contrast only ${quotedNearZero.toLocaleString()} of the ${(q.observations - q.modelled).toLocaleString()} quoted observations are that cheap.`,
    "",
    "The rest are ordinary large holdings caught mid-event — a trading halt, a",
    "demerger, a pending merger. Those values are credible; they simply were not",
    "quoted. Filter with `isMarketPrice` before charting anything as a price.",
    "",
    "## What was excluded, and why",
    "",
    "No position is dropped in silence and none is recorded as zero.",
    "",
    "| Reason | Positions |",
    "| --- | ---: |",
    ...Object.entries(q.exclusionsByReason)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => `| ${reason} | ${count.toLocaleString()} |`),
    "",
  ];

  if (conflicts.length) {
    lines.push(
      "## Filings that disagreed",
      "",
      "Two independent filings reported the same security, exchange and date at",
      "different prices. The price is withheld rather than averaged.",
      "",
      "| Security | Date | Spread | Prices |",
      "| --- | --- | ---: | --- |",
      ...conflicts
        .slice(0, 40)
        .map((c) => `| ${c.name} | ${c.asOf} | ${(c.spread * 100).toFixed(4)}% | ${c.prices.map((p) => p.toFixed(4)).join(", ")} |`),
      "",
    );
  } else {
    lines.push(
      "## Filings that disagreed",
      "",
      "None. Every security reported by more than one filing agreed within",
      "tolerance, which is the check that the quotient really is the market price.",
      "",
    );
  }

  lines.push(
    "## Sources",
    "",
    "| Filed | Period | Registrant | Accession | SHA-256 |",
    "| --- | --- | --- | --- | --- |",
    ...provenance
      .sort((a, b) => (b.reportDate ?? "").localeCompare(a.reportDate ?? ""))
      .map(
        (s) =>
          `| ${s.filedAt ?? "?"} | ${s.reportDate ?? "?"} | ${s.entity}${s.ticker ? ` (${s.ticker})` : ""} | [${s.accession}](${s.url ?? "#"}) | \`${(s.sha256 ?? "").slice(0, 16)}\` |`,
      ),
    "",
    "SEC filings are public domain. The snapshot itself is cached outside the",
    "repository because it is large, not because it is restricted.",
    "",
  );

  writeFileSync(REPORT, lines.join("\n"), "utf8");
  return { path, snapshot, conflicts };
}

// ---------------------------------------------------------------------- main

for (const dir of [CACHE, DIRS.raw, DIRS.snapshots]) mkdirSync(dir, { recursive: true });

const argv = process.argv.slice(2);
const VALUED = new Set(["--discover", "--since", "--version"]);
const has = (name) => argv.includes(name);
const flag = (name) => {
  const at = argv.indexOf(name);
  if (at === -1) return null;
  return VALUED.has(name) ? argv[at + 1] ?? null : true;
};
const positional = argv.filter((arg, i) => !arg.startsWith("--") && !(i > 0 && VALUED.has(argv[i - 1])));

const manifestPath = join(HERE, "nport-manifest.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { funds: [] };
const since = flag("--since") ?? manifest.defaultSince ?? null;
const version = flag("--version") ?? new Date().toISOString().slice(0, 10);

if (has("--discover")) {
  await discover(flag("--discover"), since);
} else if (has("--report")) {
  const results = fromCache();
  const { path, snapshot } = writeSnapshot(results, version);
  console.log(`rebuilt from ${results.length} cached filings`);
  console.log(`snapshot  ${path}`);
  console.log(`report    ${REPORT}`);
  console.log(`${snapshot.quality.observations.toLocaleString()} observations, ${snapshot.quality.securities.toLocaleString()} securities`);
} else {
  const results = await ingest(manifest, positional, since, has("--check"));
  if (has("--check")) process.exit(0);
  const { path, snapshot, conflicts } = writeSnapshot(results, version);
  console.log(`\nsnapshot  ${path}`);
  console.log(`report    ${REPORT}`);
  console.log(`${snapshot.quality.observations.toLocaleString()} observations across ${snapshot.quality.dates.length} dates`);
  if (conflicts.length) console.log(`${conflicts.length} securities withheld because filings disagreed — see the report`);
}
