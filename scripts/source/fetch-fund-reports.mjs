#!/usr/bin/env node
/**
 * Returns and costs for the catalogue's funds, from each fund's own annual shareholder report.
 *
 *   node --env-file=.env.local scripts/source/fetch-fund-reports.mjs
 *
 * For each fund in fund-reports-manifest.json this:
 *
 * 1. finds its share class in the SEC's fund ticker list, company_tickers_mf.json;
 * 2. reads the registrant's filing list and, newest first, the EDGAR header of
 *    each annual report (N-CSR), until one lists that share class. A header is a
 *    few kilobytes; the report's data file can be megabytes, so it is fetched
 *    only for the filing that covers the class;
 * 3. reads that data file with lib/studio-project/fund-reports.ts: the returns
 *    series the report prints as net asset value, the year's costs, and the
 *    report's own statements about past performance and taxes;
 * 4. checks the ticker three ways: the SEC's list, the filing's header and the
 *    ticker the report tags on the class must all agree;
 * 5. keeps a verbatim excerpt of what was read, which must read exactly as the
 *    whole report does, so a test can check the data against the filing again.
 *
 * Writes lib/studio-project/data/fund-reports.json, one excerpt per fund under
 * lib/studio-project/data/fund-report-excerpts/, and the audit page
 * docs/source-audits/studio-fund-reports.md. A fund whose figures cannot be
 * checked is written with its problems and no figures, and Studio shows none.
 *
 * Every request names a contact address, from OPS_SEC_CONTACT, which is never
 * printed or written anywhere.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  NO_RETURNS,
  classMatchProblems,
  excerptForClass,
  extractFundReport,
  readHeaderClasses,
  returnPct,
} from "../../lib/studio-project/fund-reports.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DATASET = join(ROOT, "lib", "studio-project", "data", "fund-reports.json");
const EXCERPTS = "lib/studio-project/data/fund-report-excerpts";
const REPORT = join(ROOT, "docs", "source-audits", "studio-fund-reports.md");

/** A registrant with many funds files several annual reports a year, one per fiscal year-end. */
const MAX_HEADERS = 24;
/** iShares files every fund's report in one document; its data file for SGOV's was 9.6 MB. */
const SIZE_CAP = 40 * 1024 * 1024;
const PAUSE_MS = 600;

const contact = process.env.OPS_SEC_CONTACT?.trim();
if (!contact) {
  throw new Error("Set OPS_SEC_CONTACT, for example: node --env-file=.env.local scripts/source/fetch-fund-reports.mjs");
}
const UA = `Open Portfolio Studio educational research ${contact}`;

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function edgar(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    await sleep(PAUSE_MS * attempt);
    const response = await fetch(url, { headers: { "User-Agent": UA, Accept: "*/*" } });
    if (response.ok || response.status === 404 || attempt === 4) return response;
  }
}

async function json(url) {
  const response = await edgar(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.json();
}

async function text(url) {
  const response = await edgar(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.text();
}

/** Read a response body up to the cap, cancelling rather than pulling a very large file whole. */
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
const manifest = JSON.parse(readFileSync(join(HERE, "fund-reports-manifest.json"), "utf8"));

const tickerList = await json("https://www.sec.gov/files/company_tickers_mf.json");
const column = (name) => tickerList.fields.indexOf(name);
const rows = tickerList.data.map((row) => ({
  cik: String(row[column("cik")]).padStart(10, "0"),
  seriesId: row[column("seriesId")],
  classId: row[column("classId")],
  symbol: row[column("symbol")],
}));

mkdirSync(join(ROOT, EXCERPTS), { recursive: true });
const funds = {};

for (const { instrumentId, symbol } of manifest.listings) {
  const failed = (problem) => {
    funds[instrumentId] = { instrumentId, symbol, problems: [problem], extract: null };
    console.log(`${symbol.padEnd(5)} NOT READ: ${problem}`);
  };

  const listed = rows.filter((row) => row.symbol === symbol);
  if (listed.length !== 1) {
    failed(`The SEC's fund ticker list has ${listed.length} share classes under ${symbol}.`);
    continue;
  }
  const { cik, seriesId, classId } = listed[0];

  const submissions = await json(`https://data.sec.gov/submissions/CIK${cik}.json`);
  const recent = submissions.filings.recent;
  const annual = recent.form
    .map((form, index) => ({ form, accession: recent.accessionNumber[index], filedAt: recent.filingDate[index], period: recent.reportDate[index] }))
    .filter((filing) => filing.form === "N-CSR" || filing.form === "N-CSR/A")
    .sort((a, b) => b.filedAt.localeCompare(a.filedAt));

  let chosen = null;
  let headersRead = 0;
  const passedOver = [];
  for (const filing of annual.slice(0, MAX_HEADERS)) {
    const base = `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${filing.accession.replace(/-/g, "")}`;
    const classes = readHeaderClasses(await text(`${base}/${filing.accession}-index-headers.html`));
    headersRead += 1;
    if (!classes.some((entry) => entry.classId === classId)) continue;

    const index = await json(`${base}/index.json`);
    for (const item of index.directory.item.filter((entry) => entry.name.endsWith("_htm.xml"))) {
      const { text: xml, bytes } = await readCapped(await edgar(`${base}/${item.name}`));
      if (xml === null) {
        passedOver.push(`${filing.accession} ${item.name}: over ${SIZE_CAP / 1024 / 1024} MB, not read`);
        continue;
      }
      if (!xml.includes(classId)) continue;
      const extract = extractFundReport(xml, classId);
      if (!extract.returns.found && extract.returns.reason === NO_RETURNS) {
        passedOver.push(`${filing.accession} (${filing.form}, filed ${filing.filedAt}): lists the class but tags no returns for it`);
        continue;
      }
      chosen = { filing, classes, url: `${base}/${item.name}`, xml, bytes, extract };
      break;
    }
    if (chosen) break;
  }

  if (!chosen) {
    failed(`None of the ${headersRead} newest annual reports of CIK ${cik} tags returns for ${classId}. ${passedOver.join("; ")}`);
    continue;
  }

  const excerpt = excerptForClass(chosen.xml, classId, chosen.url);
  if (JSON.stringify(extractFundReport(excerpt, classId)) !== JSON.stringify(chosen.extract)) {
    throw new Error(`${symbol}: the excerpt does not read the same as the whole report, so nothing was written`);
  }
  const excerptPath = `${EXCERPTS}/${instrumentId}.xml`;
  writeFileSync(join(ROOT, excerptPath), excerpt, "utf8");

  const { extract, filing } = chosen;
  const problems = classMatchProblems(symbol, rows, chosen.classes, extract);
  if (extract.periodEnd !== filing.period) {
    problems.push(`The filing list gives the period as ${filing.period}; the report tags ${extract.periodEnd}.`);
  }
  if (!extract.returns.found) problems.push(`Returns: ${extract.returns.reason}`);
  if (!extract.costs.found) problems.push(`Costs: ${extract.costs.reason}`);
  if (!extract.pastPerformance) problems.push("The report tags no statement about past performance for this class.");

  const series = chosen.classes.find((entry) => entry.classId === classId);
  funds[instrumentId] = {
    instrumentId,
    symbol,
    cik,
    registrant: submissions.name,
    seriesId,
    seriesName: series.seriesName,
    classId,
    classesInSeries: new Set(chosen.classes.filter((entry) => entry.seriesId === seriesId).map((entry) => entry.classId)).size,
    accession: filing.accession,
    form: filing.form,
    filedAt: filing.filedAt,
    url: chosen.url,
    instanceBytes: chosen.bytes,
    excerpt: excerptPath,
    headersRead,
    passedOver,
    problems,
    extract,
  };

  const figures = extract.returns.found ? extract.returns.periods.map((period) => `${returnPct(period.value).toFixed(2)}%`).join(" / ") : "no returns";
  const costs = extract.costs.found ? `$${extract.costs.paidPer10000Usd} on $10,000 (${returnPct(extract.costs.ratio).toFixed(2)}%)` : "no costs";
  console.log(
    `${symbol.padEnd(5)} ${classId} ${filing.form} ${filing.accession}, year to ${extract.periodEnd}: ${figures}; ${costs}; ${
      problems.length ? `PROBLEMS: ${problems.join(" | ")}` : "matched"
    }`,
  );
}

const dataset = {
  retrievedAt: today,
  method:
    "Each fund's newest annual shareholder report (Form N-CSR) that covers its share class, read from the facts it tags in inline XBRL. Returns are the series the report prints as net asset value, checked figure by figure against the tagged facts; costs are what the class cost over the report's year. The share class is matched to its ticker only when the SEC's fund ticker list, the filing's header and the report's own ticker tag agree.",
  terms:
    "SEC website dissemination terms, read firsthand on 2026-09-10 (docs/source-audits/studio-online-data-and-tools.md §5.1): information on sec.gov may be copied or further distributed; citation is requested.",
  funds,
};
mkdirSync(dirname(DATASET), { recursive: true });
writeFileSync(DATASET, JSON.stringify(dataset, null, 2) + "\n", "utf8");

// ---------------------------------------------------------------------------
// The audit page
// ---------------------------------------------------------------------------

const human = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const periodName = (period) => (period.years === null ? `since ${human(period.start)}` : `${period.years} ${period.years === 1 ? "year" : "years"}`);
const figure = (period) => `${returnPct(period.value).toFixed(2)}% ${periodName(period)}`;
const days = (from, to) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
const read = Object.values(funds).filter((entry) => entry.extract);

const lines = [
  "# Fund returns and costs",
  "",
  "Generated by `scripts/source/fetch-fund-reports.mjs`. Do not edit by hand.",
  "",
  `Retrieved ${today}. Each figure comes from the fund's own annual shareholder report (Form N-CSR), from the`,
  "facts it tags in inline XBRL, for the one share class a learner buys. A verbatim excerpt of what was",
  "read is kept beside the data, and `lib/studio-project/fund-reports.data.test.ts` reads it again.",
  "",
  "## Figures",
  "",
  "Average annual total returns, at net asset value, for periods ending on the report's year-end. Costs",
  "are what the share class cost over that year on $10,000 invested.",
  "",
  "| Fund | Year to | Returns | Costs on $10,000 | As a share | Report |",
  "| --- | --- | --- | ---: | ---: | --- |",
  ...Object.values(funds).map((entry) => {
    if (!entry.extract) return `| ${entry.symbol} | — | not read | — | — | — |`;
    const { extract } = entry;
    const returns = extract.returns.found ? extract.returns.periods.map(figure).join("; ") : "none";
    const costs = extract.costs.found ? [`$${extract.costs.paidPer10000Usd}`, `${returnPct(extract.costs.ratio).toFixed(2)}%`] : ["—", "—"];
    return `| ${entry.symbol} | ${extract.periodEnd ? human(extract.periodEnd) : "—"} | ${returns} | ${costs[0]} | ${costs[1]} | [${entry.form} ${entry.accession}](${entry.url}) |`;
  }),
  "",
  "## How each share class was matched to its ticker",
  "",
  "A report covers every share class of a fund, and classes differ in cost and so in return. Three",
  "records must agree before a figure is used: the SEC's fund ticker list, the list of share classes in",
  "the filing's EDGAR header, and the ticker the report itself tags on the class.",
  "",
];
for (const entry of Object.values(funds)) {
  if (!entry.extract) {
    lines.push(`**${entry.symbol}**: not read. ${entry.problems.join(" ")}`, "");
    continue;
  }
  lines.push(
    `**${entry.symbol}**: share class \`${entry.classId}\`${entry.extract.className ? ` (${entry.extract.className})` : ""} of series \`${entry.seriesId}\`, ${entry.seriesName}, ${entry.classesInSeries === 1 ? "its only share class" : `one of ${entry.classesInSeries} share classes`}. Registrant ${entry.registrant}, CIK ${entry.cik}.`,
    "",
    `- The SEC's fund ticker list, the filing's header and the report's own tag: ${entry.problems.length ? entry.problems.join(" ") : `all give ${entry.symbol}.`}`,
    `- Found by reading ${entry.headersRead} filing ${entry.headersRead === 1 ? "header" : "headers"}; data file ${(entry.instanceBytes / 1024 / 1024).toFixed(2)} MB, filed ${entry.filedAt}.`,
    ...entry.passedOver.map((note) => `- Passed over: ${note}`),
    "",
  );
}

lines.push(
  "## Which return series",
  "",
  "An ETF's report can give two series for one class, at net asset value and at market price, and the",
  "tags do not reliably say which is which. The one used is the row the report prints as net asset value,",
  "and every figure in that row must equal a tagged fact. A class that tags one series and prints no table",
  "the data file carries is used as it is, and says so.",
  "",
);
for (const entry of read) {
  const { returns } = entry.extract;
  if (!returns.found) {
    lines.push(`**${entry.symbol}**: none used. ${returns.reason}`, "");
    continue;
  }
  const notes = [
    ...returns.others.map((other) => `- Also tagged${other.label ? `, "${other.label}"` : ""}: ${other.periods.map(figure).join("; ")}.`),
    ...(returns.labelConflict ? [`- Label disagreement: ${returns.labelConflict}`] : []),
  ];
  lines.push(
    `**${entry.symbol}**: ${
      returns.checkedAgainst === "printed table"
        ? `the row printed as "${returns.label}", checked figure by figure against the tagged facts.`
        : `the only series the report tags for this class${returns.label ? `, labelled "${returns.label}"` : ", unlabelled"}; it prints no table the data file carries.`
    }`,
    "",
    ...(notes.length ? [...notes, ""] : []),
  );
}

lines.push("## What each report says about past performance and taxes", "", "Tagged by the report on the share class, quoted as filed.", "");
for (const entry of read) {
  lines.push(`- **${entry.symbol}**: "${entry.extract.pastPerformance ?? "none tagged"}" ${entry.extract.taxes ? `"${entry.extract.taxes}"` : "No statement about taxes is tagged."}`);
}

lines.push(
  "",
  "## How fresh",
  "",
  "| Fund | Year to | Filed | Days after the year-end | The next annual report covers the year to |",
  "| --- | --- | --- | ---: | --- |",
  ...read
    .filter((entry) => entry.extract.periodEnd)
    .map((entry) => {
      const end = entry.extract.periodEnd;
      const next = new Date(`${end}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      next.setUTCFullYear(next.getUTCFullYear() + 1);
      next.setUTCDate(next.getUTCDate() - 1);
      return `| ${entry.symbol} | ${human(end)} | ${entry.filedAt} | ${days(end, entry.filedAt)} | ${human(next.toISOString().slice(0, 10))} |`;
    }),
  "",
  "Semiannual reports (N-CSRS) carry costs but not returns, so they are not read.",
  "",
  "## Refreshing",
  "",
  "Run the script twice a year, and again after any fund's next annual report is filed, then commit the",
  "data, the excerpts and this page together.",
  "",
);
writeFileSync(REPORT, lines.join("\n"), "utf8");
console.log(`\ndataset   ${DATASET}\nexcerpts  ${join(ROOT, EXCERPTS)}\nreport    ${REPORT}`);
