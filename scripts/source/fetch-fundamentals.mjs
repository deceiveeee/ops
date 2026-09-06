#!/usr/bin/env node
/**
 * Company fundamentals from SEC XBRL, resolved per sector and per period.
 *
 *   node scripts/source/fetch-fundamentals.mjs                    all manifest companies
 *   node scripts/source/fetch-fundamentals.mjs MSFT FITB           named tickers
 *   node scripts/source/fetch-fundamentals.mjs --cik 0000034088    a specific entity
 *   node scripts/source/fetch-fundamentals.mjs --report            rebuild from cache, offline
 *
 * The mapping rules live in lib/studio-project/metrics.ts and are unit-tested
 * there. This file resolves tickers, fetches, caches and writes the audit.
 *
 * Requires OPS_SEC_CONTACT. Never committed.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  effectiveTaxRate,
  freeCashFlow,
  grossMargin,
  grossProfit,
  isAvailable,
  isResolved,
  latestAnnualPeriod,
  resolvePrimitive,
  sectorFromSic,
  totalRevenue,
} from "../../lib/studio-project/metrics.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const CACHE = join(ROOT, ".source-cache", "fundamentals");
const REPORT = join(ROOT, "docs", "source-audits", "studio-metric-mapping.md");

const CONTACT = process.env.OPS_SEC_CONTACT;
if (!CONTACT) {
  console.error(
    "OPS_SEC_CONTACT is required.\n" +
      "SEC fair access asks automated requests to identify a contact address.\n" +
      "  OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-fundamentals.mjs",
  );
  process.exit(1);
}
const UA = `Open Portfolio Studio educational research ${CONTACT}`;

const THROTTLE_MS = 400;
let lastRequest = 0;
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function sec(url) {
  const wait = THROTTLE_MS - (Date.now() - lastRequest);
  if (wait > 0) await sleep(wait);
  for (let attempt = 1; attempt <= 4; attempt++) {
    lastRequest = Date.now();
    const response = await fetch(url, { headers: { "User-Agent": UA, "Accept-Encoding": "gzip, deflate" } });
    if ((response.status === 429 || response.status === 403 || response.status >= 500) && attempt < 4) {
      await sleep(2000 * attempt);
      continue;
    }
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
    return response.text();
  }
  throw new Error(`gave up: ${url}`);
}

const cached = async (name, url) => {
  const path = join(CACHE, name);
  if (!existsSync(path)) writeFileSync(path, await sec(url), "utf8");
  return JSON.parse(readFileSync(path, "utf8"));
};

/**
 * How much annual history an entity actually has.
 *
 * A ticker does not reliably point at the company with the operating record.
 * XOM resolves to ExxonMobil Holdings Corp, created in a 2026 reorganisation,
 * whose company facts hold 94 concepts and **zero** annual revenue periods —
 * while its `entityName` still reads "Exxon Mobil Corporation". The operating
 * company, CIK 0000034088, has 438 concepts and fifteen years. Nothing in the
 * payload distinguishes them, so history is measured rather than assumed.
 */
function historyDepth(facts) {
  const gaap = facts.facts?.["us-gaap"] ?? {};
  const assets = gaap.Assets?.units?.USD?.filter((f) => f.form === "10-K") ?? [];
  const periods = [...new Set(assets.map((f) => f.end))].sort();
  return { concepts: Object.keys(gaap).length, annualPeriods: periods.length, earliest: periods[0] ?? null, latest: periods[periods.length - 1] ?? null };
}

async function resolveTicker(ticker) {
  const table = await cached("company_tickers.json", "https://www.sec.gov/files/company_tickers.json");
  for (const row of Object.values(table)) {
    if (row.ticker === ticker) return { cik: String(row.cik_str).padStart(10, "0"), title: row.title };
  }
  return null;
}

async function load(ticker, cikOverride) {
  const byTicker = await resolveTicker(ticker);
  const resolved = cikOverride ? { cik: String(cikOverride).padStart(10, "0"), title: ticker } : byTicker;
  if (!resolved) return { ticker, error: "ticker not found in SEC's table" };
  // Where a CIK is pinned, record what the ticker would have given instead, so
  // the audit shows the divergence rather than quietly routing around it.
  const tickerResolvesTo = byTicker && byTicker.cik !== resolved.cik ? byTicker : null;

  // Cache by CIK, never by ticker: a ticker can point at a different entity
  // after a reorganisation, and keying on it silently serves the wrong company.
  const submissions = await cached(`sub-${resolved.cik}.json`, `https://data.sec.gov/submissions/CIK${resolved.cik}.json`);
  let facts;
  try {
    facts = await cached(`facts-${resolved.cik}.json`, `https://data.sec.gov/api/xbrl/companyfacts/CIK${resolved.cik}.json`);
  } catch (error) {
    return { ticker, cik: resolved.cik, error: `company facts unavailable: ${String(error.message).slice(0, 60)}` };
  }

  const depth = historyDepth(facts);
  const raw = readFileSync(join(CACHE, `facts-${resolved.cik}.json`));
  return {
    ticker,
    cik: resolved.cik,
    registrant: submissions.name,
    entityName: facts.entityName,
    sic: String(submissions.sic ?? ""),
    sicDescription: submissions.sicDescription ?? "",
    sector: sectorFromSic(submissions.sic),
    tickerResolvesTo,
    facts,
    depth,
    sha256: createHash("sha256").update(raw).digest("hex"),
    bytes: raw.length,
    // Fewer than three annual periods is a shell or a fresh registrant, not a
    // company with a record worth screening.
    usable: depth.annualPeriods >= 3,
  };
}

const PRIMITIVES = ["revenue", "costOfRevenue", "operatingIncome", "netIncome", "cashFromOperations", "capitalExpenditure", "assets", "equity", "taxExpense", "pretaxIncome"];

function analyse(company) {
  const period = latestAnnualPeriod(company.facts);
  if (!period) return { ...company, period: null, primitives: {}, metrics: {} };
  const primitives = {};
  for (const name of PRIMITIVES) primitives[name] = resolvePrimitive(company.facts, name, company.sector, period);
  return {
    ...company,
    period,
    primitives,
    metrics: {
      revenue: totalRevenue(company.facts, company.sector, period),
      grossProfit: grossProfit(company.facts, company.sector, period),
      grossMargin: grossMargin(company.facts, company.sector, period),
      freeCashFlow: freeCashFlow(company.facts, company.sector, period),
      effectiveTaxRate: effectiveTaxRate(company.facts, company.sector, period),
    },
  };
}

const money = (v) => (Math.abs(v) >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`);
const cell = (outcome, asPercent = false) => {
  if (!outcome || !isAvailable(outcome)) return "—";
  return asPercent ? `${(outcome.value * 100).toFixed(1)}%` : money(outcome.value);
};

function writeReport(analysed) {
  const usable = analysed.filter((c) => c.facts && c.usable);
  const lines = [
    "# Metric mapping across sectors",
    "",
    "Generated by `scripts/source/fetch-fundamentals.mjs`. Do not edit by hand.",
    "",
    `Resolved ${usable.length} companies against SEC XBRL on ${new Date().toISOString().slice(0, 10)}.`,
    "",
    "A metric is not one XBRL concept. It is different concepts for different",
    "kinds of company, and different concepts for the *same* company at different",
    "times, because filers migrate their tagging. Resolution here is therefore",
    "always for a stated period: a concept qualifies only if it carries a value",
    "covering that period, and preference decides among the ones that qualify.",
    "",
    "## What resolved",
    "",
    "| Company | SIC | Shape | Period | Revenue | Gross margin | Free cash flow | Tax rate |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: |",
    ...usable.map(
      (c) =>
        `| ${c.ticker} ${c.registrant.slice(0, 26)} | ${c.sic} | ${c.sector} | ${c.period} | ` +
        `${cell(c.metrics.revenue)} | ${cell(c.metrics.grossMargin, true)} | ${cell(c.metrics.freeCashFlow)} | ${cell(c.metrics.effectiveTaxRate, true)} |`,
    ),
    "",
    "An em dash means the module declined to produce a number. Each refusal has a",
    "stated reason, listed below; none is a zero and none is a stale figure.",
    "",
    "## Which concept each company's revenue came from",
    "",
    "The same metric, resolved from different concepts. This is the mapping.",
    "",
    "| Company | Shape | Concept or derivation |",
    "| --- | --- | --- |",
    ...usable.map((c) => {
      const r = c.metrics.revenue;
      const how = !isAvailable(r)
        ? `unavailable — ${r.reason}`
        : r.how === "derived"
          ? `derived: ${r.from.map((f) => f.concept).join(" + ")}`
          : r.from[0].concept;
      return `| ${c.ticker} | ${c.sector} | ${how} |`;
    }),
    "",
    "## Every refusal, with its reason",
    "",
    "| Company | Metric | Reason |",
    "| --- | --- | --- |",
    ...usable.flatMap((c) =>
      Object.entries(c.metrics)
        .filter(([, outcome]) => !isAvailable(outcome))
        .map(([name, outcome]) => `| ${c.ticker} | ${name} | ${outcome.reason} |`),
    ),
    "",
    "## Concepts that stopped, and were passed over",
    "",
    "Each of these still resolves and is populated. Each would have been silently",
    "wrong if preference had outranked period.",
    "",
    "| Company | Primitive | Newest period it covers | Requested |",
    "| --- | --- | --- | --- |",
    ...usable.flatMap((c) =>
      Object.entries(c.primitives)
        .filter(([, o]) => !isResolved(o) && o.staleAt)
        .map(([name, o]) => `| ${c.ticker} | ${name} | ${o.staleAt} | ${c.period} |`),
    ),
    "",
    "## Where the ticker points somewhere else",
    "",
    "A ticker is not an identity. After a reorganisation it can point at a new",
    "entity whose filing history is nearly empty, and the company facts payload",
    "gives no warning: it carries the old company's `entityName` either way. The",
    "CIK is pinned in the manifest for each of these, and the cache is keyed by",
    "CIK rather than ticker so the wrong entity cannot be served from disk.",
    "",
    "| Ticker | Pinned CIK | The ticker resolves to | Registrant there |",
    "| --- | --- | --- | --- |",
    ...usable
      .filter((c) => c.tickerResolvesTo)
      .map((c) => `| ${c.ticker} | ${c.cik} | ${c.tickerResolvesTo.cik} | ${c.tickerResolvesTo.title} |`),
    "",
    "## Entities rejected for want of history",
    "",
    "Fewer than three annual periods is a shell or a fresh registrant, not a",
    "company with a record worth screening.",
    "",
    "| Ticker | CIK | Registrant | Concepts | Annual periods |",
    "| --- | --- | --- | ---: | ---: |",
    ...analysed
      .filter((c) => c.facts && !c.usable)
      .map((c) => `| ${c.ticker} | ${c.cik} | ${c.registrant} | ${c.depth.concepts} | ${c.depth.annualPeriods} |`),
    "",
    "## Sources",
    "",
    "| Ticker | CIK | Entity name in the facts | SHA-256 |",
    "| --- | --- | --- | --- |",
    ...usable.map((c) => `| ${c.ticker} | ${c.cik} | ${c.entityName} | \`${c.sha256.slice(0, 16)}\` |`),
    "",
    "SEC XBRL company facts are public domain. The payloads are cached outside the",
    "repository because they are large, not because they are restricted.",
    "",
  ];
  writeFileSync(REPORT, lines.join("\n"), "utf8");
}

// ---------------------------------------------------------------------- main

mkdirSync(CACHE, { recursive: true });

const argv = process.argv.slice(2);
const has = (n) => argv.includes(n);
const flagValue = (n) => (argv.indexOf(n) === -1 ? null : argv[argv.indexOf(n) + 1]);
const manifestPath = join(HERE, "fundamentals-manifest.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { companies: [] };
const named = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1] === "--cik"));

let analysed;
if (has("--report")) {
  analysed = [];
  for (const entry of manifest.companies) {
    const company = await load(entry.ticker, entry.cik);
    if (!company.error) analysed.push(analyse(company));
  }
} else {
  const wanted = named.length ? named : manifest.companies.map((c) => c.ticker);
  analysed = [];
  for (const ticker of wanted) {
    const entry = manifest.companies.find((c) => c.ticker === ticker);
    const company = await load(ticker, flagValue("--cik") ?? entry?.cik);
    if (company.error) {
      console.log(`${ticker.padEnd(6)} ${company.error}`);
      analysed.push(company);
      continue;
    }
    const done = analyse(company);
    analysed.push(done);
    const flag = done.usable ? "" : `  REJECTED: only ${done.depth.annualPeriods} annual periods`;
    console.log(
      `${ticker.padEnd(6)} ${done.sector.padEnd(12)} ${done.period ?? "no period"}  ` +
        `revenue ${cell(done.metrics.revenue).padStart(9)}  margin ${cell(done.metrics.grossMargin, true).padStart(7)}${flag}`,
    );
  }
}

writeReport(analysed);
console.log(`\nreport  ${REPORT}`);
