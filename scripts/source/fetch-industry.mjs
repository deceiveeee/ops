#!/usr/bin/env node
/**
 * Industry membership and revenue, for the outside-in view.
 *
 *   node scripts/source/fetch-industry.mjs 3674              one SIC
 *   node scripts/source/fetch-industry.mjs                   all manifest industries
 *   node scripts/source/fetch-industry.mjs --years 2019 2024 a different span
 *   node scripts/source/fetch-industry.mjs --report          rebuild from cache, offline
 *
 * Two SEC endpoints do the work. `browse-edgar` lists every registrant carrying
 * a SIC code; the XBRL `frames` API returns every filer reporting a concept for
 * a period in one request, so a whole industry's revenue costs three calls
 * rather than one per company.
 *
 * The measures live in lib/studio-project/industry.ts and are unit-tested there
 * against Morgan Stanley's own published figures. This file only fetches.
 *
 * Requires OPS_SEC_CONTACT. Never committed.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { industryPicture, BASIS_UNCERTAIN } from "../../lib/studio-project/industry.ts";
import { effectiveTaxRate, isAvailable, isResolved, latestAnnualPeriod, resolvePrimitive, sectorFromSic, totalRevenue } from "../../lib/studio-project/metrics.ts";
import { decomposeRoic, isComputed, readAdvantage } from "../../lib/studio-project/roic.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const CACHE = join(ROOT, ".source-cache", "industry");
const REPORT = join(ROOT, "docs", "source-audits", "studio-industry-view.md");

const CONTACT = process.env.OPS_SEC_CONTACT;
if (!CONTACT) {
  console.error("OPS_SEC_CONTACT is required.\n  OPS_SEC_CONTACT=you@example.com node scripts/source/fetch-industry.mjs");
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
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`${response.status} for ${url}`);
    return response.text();
  }
  throw new Error(`gave up: ${url}`);
}

const cachedJson = async (name, produce) => {
  const path = join(CACHE, name);
  if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
  const value = await produce();
  writeFileSync(path, JSON.stringify(value), "utf8");
  return value;
};

/**
 * Every registrant carrying a SIC code.
 *
 * Paged until a request adds nothing new. An early version stopped at 600 and
 * browse-edgar returns alphabetically, which silently cut Pfizer, Merck, Lilly
 * and Johnson & Johnson out of pharmaceuticals — $261B of revenue, more than the
 * $184B that remained. Any concentration figure computed on that was fiction, so
 * the loop now runs to exhaustion and records how many pages it took.
 */
async function sicMembers(sic) {
  return cachedJson(`sic-${sic}.json`, async () => {
    const ciks = new Set();
    let pages = 0;
    for (let start = 0; start < 5000; start += 100) {
      const atom = await sec(
        `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&SIC=${sic}&type=10-K&dateb=&owner=include&count=100&start=${start}&output=atom`,
      );
      if (!atom) break;
      pages++;
      const before = ciks.size;
      for (const match of atom.matchAll(/<cik>(\d+)<\/cik>/g)) ciks.add(Number(match[1]));
      if (ciks.size === before) break;
    }
    return { ciks: [...ciks], pages, exhausted: true };
  });
}

const REVENUE_CONCEPTS = [
  "Revenues",
  "RevenueFromContractWithCustomerExcludingAssessedTax",
  "RevenueFromContractWithCustomerIncludingAssessedTax",
];

/**
 * Revenue for every filer in a calendar year, across the concepts they use.
 *
 * One concept is not enough: `Revenues` alone returns 2,500 filers and the union
 * of three returns 5,086. But a company reporting under several does not report
 * the same number under each — 1,083 do, and 245 of those disagree by more than
 * half again, because the contract-revenue concepts capture a subset. Burlington
 * Northern files $91M under `Revenues` and $23.4B of contract revenue.
 *
 * The largest is taken, because a subset cannot exceed the whole, and the ratio
 * between competing figures is kept so a company whose basis is doubtful can be
 * flagged rather than quietly trusted. This is a cross-sectional heuristic and
 * weaker than resolving one company properly with lib/studio-project/metrics.ts;
 * a company actually under investigation should be resolved that way.
 */
async function revenueFrame(year) {
  return cachedJson(`revenue-CY${year}.json`, async () => {
    const merged = {};
    for (const concept of REVENUE_CONCEPTS) {
      const body = await sec(`https://data.sec.gov/api/xbrl/frames/us-gaap/${concept}/USD/CY${year}.json`);
      if (!body) continue;
      for (const row of JSON.parse(body).data) {
        const existing = merged[row.cik];
        if (!existing) {
          merged[row.cik] = { cik: row.cik, name: row.entityName, revenue: row.val, revenueConcept: concept, min: row.val, max: row.val, periodEnd: row.end, accession: row.accn };
          continue;
        }
        existing.min = Math.min(existing.min, row.val);
        existing.max = Math.max(existing.max, row.val);
        if (row.val > existing.revenue) {
          existing.revenue = row.val;
          existing.revenueConcept = concept;
          existing.periodEnd = row.end;
          existing.accession = row.accn;
        }
      }
    }
    for (const entry of Object.values(merged)) {
      entry.basisSpread = entry.min > 0 ? entry.max / entry.min : 1;
      delete entry.min;
      delete entry.max;
    }
    return merged;
  });
}

const money = (v) => (Math.abs(v) >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`);
const pct = (v) => `${(v * 100).toFixed(1)}%`;

const FUNDAMENTALS = join(ROOT, ".source-cache", "fundamentals");

/**
 * Split each leader's return on capital into the margin and turnover behind it.
 *
 * The sector comes from the industry's own SIC rather than a per-company
 * lookup, which saves a request each and is the same answer: every company here
 * was found by that code. Companies whose operating profit or capital cannot be
 * resolved are returned with the reason, never dropped.
 */
async function decomposeLeaders(industry) {
  const sector = sectorFromSic(industry.sic);
  const out = [];

  for (const leader of industry.picture.shares.slice(0, 10)) {
    const cik = String(leader.cik).padStart(10, "0");
    const path = join(FUNDAMENTALS, `facts-${cik}.json`);
    let facts;
    try {
      if (!existsSync(path)) {
        const body = await sec(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`);
        if (!body) { out.push({ cik: leader.cik, name: leader.name, reason: "no company facts filed" }); continue; }
        writeFileSync(path, body, "utf8");
      }
      facts = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      out.push({ cik: leader.cik, name: leader.name, reason: `could not read company facts: ${String(error.message).slice(0, 40)}` });
      continue;
    }

    const period = latestAnnualPeriod(facts);
    if (!period) { out.push({ cik: leader.cik, name: leader.name, reason: "no annual period reported" }); continue; }

    const value = (name) => { const o = resolvePrimitive(facts, name, sector, period); return isResolved(o) ? o.value : null; };
    const revenue = totalRevenue(facts, sector, period);
    const tax = effectiveTaxRate(facts, sector, period);
    const operatingIncome = value("operatingIncome");
    const equity = value("equity");
    const longTerm = value("longTermDebt");

    const missing = [];
    if (operatingIncome === null) missing.push("operating profit");
    if (!isAvailable(revenue)) missing.push("revenue");
    if (equity === null) missing.push("equity");
    if (missing.length) { out.push({ cik: leader.cik, name: leader.name, reason: `needs ${missing.join(", ")}` }); continue; }

    // No debt tag means no borrowings, which is a real state and a common one
    // in software: ServiceNow and Shopify report none. Requiring the tag to
    // exist excluded every debt-free company. It is recorded as an assumption
    // rather than passed off as a filed zero.
    const shortTerm = value("shortTermDebt");
    const debtAssumedZero = longTerm === null && shortTerm === null;

    const result = decomposeRoic({
      sector,
      operatingIncome,
      // Where a company's own effective rate cannot be read, the US federal
      // statutory rate stands in and the substitution is recorded.
      effectiveTaxRate: isAvailable(tax) ? tax.value : 0.21,
      revenue: revenue.value,
      totalDebt: (longTerm ?? 0) + (shortTerm ?? 0),
      equity,
      cash: value("cash") ?? 0,
    });

    out.push({
      cik: leader.cik,
      name: leader.name,
      period,
      taxRateAssumed: !isAvailable(tax),
      debtAssumedZero,
      operatingLeaseLiability: value("operatingLeaseLiability"),
      ...(isComputed(result)
        ? { roic: result.roic, nopatMargin: result.nopatMargin, capitalTurnover: result.capitalTurnover, nopat: result.nopat, investedCapital: result.investedCapital }
        : { reason: result.reason }),
    });
  }

  // The advantage read needs the peer group, so it happens once all are in.
  const computed = out.filter((row) => row.roic !== undefined);
  for (const row of computed) {
    const peers = computed.filter((other) => other !== row);
    const read = readAdvantage(row, peers);
    if ("advantage" in read) {
      row.advantage = read.advantage;
      row.marginPercentile = read.marginPercentile;
      row.turnoverPercentile = read.turnoverPercentile;
      row.medianMargin = read.medianMargin;
      row.medianTurnover = read.medianTurnover;
    } else {
      row.advantageWithheld = read.reason;
    }
  }
  return out;
}

async function buildIndustry(sic, label, years) {
  const [earlierYear, laterYear] = years;
  const members = await sicMembers(sic);
  const later = await revenueFrame(laterYear);
  const earlier = await revenueFrame(earlierYear);

  const pick = (frame) => members.ciks.map((cik) => frame[cik]).filter(Boolean);
  const laterMembers = pick(later);
  const earlierMembers = pick(earlier);
  const picture = industryPicture(laterMembers, earlierMembers, laterYear - earlierYear);

  return { sic, label, years, registrants: members.ciks.length, pages: members.pages, laterMembers, earlierMembers, picture };
}

function writeReport(industries, years) {
  const lines = [
    "# The industry view",
    "",
    "Generated by `scripts/source/fetch-industry.mjs`. Do not edit by hand.",
    "",
    `Built ${new Date().toISOString().slice(0, 10)} from SEC registrant lists and XBRL frames, ${years[0]} against ${years[1]}.`,
    "",
    "Measures follow *Measuring the Moat* (Mauboussin and Callahan, Counterpoint",
    "Global, Morgan Stanley, 15 October 2024). Market share instability is the",
    "average",
    "absolute change in share between two periods, the method the paper",
    "attributes to Bruce Greenwald; its rule of thumb is that a five-year average",
    "change of two points or less is relatively stable.",
    "",
    "**Instability is reported twice on purpose.** It is an average over rows, so",
    "the number of rows changes it. Every exhibit in the paper lists four to",
    "thirteen named competitors plus an Other bucket, and the two-point rule was",
    "calibrated against that shape, so the headline figure is computed over the",
    "top ten plus Other. The all-filers column averages over every registrant",
    "instead: with 313 pharmaceutical filers, most minute and barely moving, it",
    "collapses towards zero and the rule of thumb no longer applies to it.",
    "",
    "**Two cautions the paper states, which belong beside every number here.**",
    "Variance *within* industries exceeds variance *across* them, so an industry",
    "narrows a search but does not settle it. And common concentration measures",
    "are not reliably linked to value creation or stock returns — market share is",
    "the better link to profitability, so HHI below is description, not verdict.",
    "",
    "Shares are computed from revenue, which is what public filings give. The",
    "paper's own examples use units, passenger miles or page views where those",
    "exist, and those are better: revenue is distorted by price and by how much",
    "of the value chain a company owns.",
    "",
    "## Structure",
    "",
    `| Industry | SIC | Registrants | With revenue | Total | HHI | C4 | Instability, top 10 | All filers |`,
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...industries.map((ind) => {
      const total = ind.picture.shares.reduce((s, r) => s + r.revenue, 0);
      const inst = ind.picture.instability;
      const verdict = inst?.stableByRuleOfThumb === null ? "" : inst?.stableByRuleOfThumb ? " (stable)" : " (unstable)";
      const all = ind.picture.instabilityAllFilers;
      return `| ${ind.label} | ${ind.sic} | ${ind.registrants} | ${ind.picture.shares.length} | ${money(total)} | ${Math.round(ind.picture.hhi)} | ${pct(ind.picture.c4)} | ${inst ? pct(inst.average) + verdict : "—"} | ${all ? pct(all.average) : "—"} |`;
    }),
    "",
  ];

  for (const ind of industries) {
    const total = ind.picture.shares.reduce((s, r) => s + r.revenue, 0);
    lines.push(
      `## ${ind.label} (SIC ${ind.sic})`,
      "",
      `${ind.registrants} registrants carry this code, ${ind.picture.shares.length} reported revenue for CY${ind.years[1]}, totalling ${money(total)}.`,
      "",
      "| Company | Revenue | Share | Concept | Basis |",
      "| --- | ---: | ---: | --- | --- |",
      ...ind.laterMembers
        .slice()
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 12)
        .map(
          (m) =>
            `| ${m.name.slice(0, 38)} | ${money(m.revenue)} | ${pct(m.revenue / total)} | ${m.revenueConcept.replace("RevenueFromContractWithCustomer", "ContractRevenue")} | ${m.basisSpread > BASIS_UNCERTAIN ? `**uncertain, ${m.basisSpread.toFixed(1)}× spread**` : "single"} |`,
        ),
      "",
    );
    const inst = ind.picture.instability;
    if (inst && inst.rows.length) {
      lines.push(
        `Market share instability, ${ind.years[0]} to ${ind.years[1]}: **${pct(inst.average)}** average absolute change.`,
        "",
        "| Company | " + ind.years[0] + " | " + ind.years[1] + " | Absolute change |",
        "| --- | ---: | ---: | ---: |",
        ...inst.rows
          .slice(0, 8)
          .map(
            (r) =>
              `| ${r.name.slice(0, 38)} | ${r.earlierShare === null ? "not present" : pct(r.earlierShare)} | ${r.laterShare === null ? "not present" : pct(r.laterShare)} | ${pct(r.absoluteChange)} |`,
          ),
        "",
      );
    }
    const earning = (ind.roic ?? []).filter((row) => row.roic !== undefined);
    if (earning.length) {
      lines.push(
        "How the leaders earn their return on capital. Margin times turnover is the return —",
        "the sales cancel — so the split says whether it comes from charging more or from",
        "turning capital faster. Invested capital here is interest-bearing debt plus equity",
        "less cash; operating leases are outside it and shown so their size is visible.",
        "",
        "| Company | Return | NOPAT margin | Capital turnover | Route | Leases excluded |",
        "| --- | ---: | ---: | ---: | --- | ---: |",
        ...earning
          .slice()
          .sort((a, b) => b.roic - a.roic)
          .map(
            (row) =>
              `| ${row.name.slice(0, 32)}${row.debtAssumedZero ? " *" : ""}${row.taxRateAssumed ? " †" : ""} | ${pct(row.roic)} | ${pct(row.nopatMargin)} | ${row.capitalTurnover.toFixed(2)}x | ${row.advantage ?? "—"} | ${row.operatingLeaseLiability ? money(row.operatingLeaseLiability) : "—"} |`,
          ),
        "",
        "\\* reports no borrowings, so debt is taken as zero. † no effective tax rate could be",
        "read, so the 21% US federal statutory rate stands in.",
        "",
      );
      const declined = (ind.roic ?? []).filter((row) => row.roic === undefined);
      if (declined.length) {
        lines.push(
          "Declined, with the reason:",
          "",
          ...declined.map((row) => `- **${row.name}** — ${row.reason}`),
          "",
        );
      }
    }
    if (ind.picture.uncertainBasis.length) {
      lines.push(
        `Revenue basis doubtful for ${ind.picture.uncertainBasis.length}: ${ind.picture.uncertainBasis.slice(0, 6).join(", ")}. Resolve these individually before relying on their share.`,
        "",
      );
    }
  }

  lines.push(
    "## What this cannot tell you",
    "",
    "- **SIC is a coarse market definition.** SEC assigns one code per registrant,",
    "  so a diversified company sits in one industry and a company competing in",
    "  several appears in one. The paper says defining a market properly is hard,",
    "  and this is the cheap approximation, not the careful one.",
    "- **Only SEC filers appear.** A private competitor, a foreign one that does",
    "  not file, or a division inside a conglomerate is invisible, so shares are",
    "  shares of the filing universe rather than of the market.",
    "- **Revenue is a proxy for the market**, distorted by price and by vertical",
    "  integration.",
    "- **Fiscal years are aligned by SEC's calendar-year mapping**, so a company",
    "  ending in January is compared with one ending in December.",
    "",
  );

  writeFileSync(REPORT, lines.join("\n"), "utf8");
}

// ---------------------------------------------------------------------- main

mkdirSync(CACHE, { recursive: true });

const argv = process.argv.slice(2);
const manifestPath = join(HERE, "industry-manifest.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { industries: [], years: [2019, 2024] };
const yearsAt = argv.indexOf("--years");
const years = yearsAt === -1 ? manifest.years : [Number(argv[yearsAt + 1]), Number(argv[yearsAt + 2])];
const named = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && (argv[i - 1] === "--years" || argv[i - 2] === "--years")));

const wanted = named.length
  ? named.map((sic) => ({ sic, label: manifest.industries.find((i) => String(i.sic) === sic)?.label ?? `SIC ${sic}` }))
  : manifest.industries;

const built = [];
for (const { sic, label } of wanted) {
  const industry = await buildIndustry(sic, label, years);
  industry.roic = argv.includes("--no-roic") ? [] : await decomposeLeaders(industry);
  built.push(industry);
  const inst = industry.picture.instability;
  console.log(
    `${String(sic).padEnd(6)} ${label.slice(0, 26).padEnd(27)} ${String(industry.registrants).padStart(4)} registrants  ` +
      `${String(industry.picture.shares.length).padStart(4)} with revenue  HHI ${String(Math.round(industry.picture.hhi)).padStart(5)}  ` +
      `C4 ${pct(industry.picture.c4).padStart(6)}  instability ${inst ? pct(inst.average) : "—"}`,
  );
}

writeReport(built, years);

/**
 * A trimmed dataset the interface can read.
 *
 * The frames are tens of megabytes and live in the gitignored cache; what a
 * learner needs is the leading firms and the two periods behind the instability
 * figure. Only the leaders plus an Other bucket are kept, because that is the
 * shape the paper's rule of thumb applies to, and the full-universe totals are
 * carried alongside so the surface can say how much of the industry is shown.
 */
const dataset = {
  builtOn: new Date().toISOString().slice(0, 10),
  years,
  source: "SEC registrant lists by SIC, and XBRL company frames. Public domain.",
  method:
    "Market share instability follows Measuring the Moat (Mauboussin and Callahan, Counterpoint Global, Morgan Stanley, 15 October 2024): the average absolute change in share between two periods, attributed there to Bruce Greenwald.",
  industries: built.map((ind) => {
    const total = ind.picture.shares.reduce((s, r) => s + r.revenue, 0);
    return {
      sic: ind.sic,
      label: ind.label,
      registrants: ind.registrants,
      filersWithRevenue: ind.picture.shares.length,
      totalRevenue: total,
      hhi: ind.picture.hhi,
      c4: ind.picture.c4,
      leaders: ind.picture.shares.slice(0, 10).map((r) => ({
        name: r.name,
        cik: r.cik,
        revenue: r.revenue,
        share: r.share,
        basisUncertain: r.basisUncertain,
      })),
      unresolvable: ind.picture.unresolvable,
      roic: ind.roic ?? [],
      instability: ind.picture.instability && {
        average: ind.picture.instability.average,
        years: ind.picture.instability.years,
        stableByRuleOfThumb: ind.picture.instability.stableByRuleOfThumb,
        rows: ind.picture.instability.rows,
      },
      instabilityAllFilers: ind.picture.instabilityAllFilers?.average ?? null,
      uncertainBasis: ind.picture.uncertainBasis,
    };
  }),
};
const datasetPath = join(ROOT, "lib", "studio-project", "data", "industries.json");
mkdirSync(dirname(datasetPath), { recursive: true });
writeFileSync(datasetPath, JSON.stringify(dataset, null, 2) + "\n", "utf8");

console.log(`\nreport   ${REPORT}`);
console.log(`dataset  ${datasetPath}  (${(readFileSync(datasetPath).length / 1024).toFixed(0)} KB)`);
