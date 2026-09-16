#!/usr/bin/env node
/**
 * The input-cost library: producer price indexes for inputs companies commonly buy.
 *
 *   node --env-file=.env.local scripts/source/fetch-input-cost-library.mjs
 *
 * Studio's Input costs tab works on any company's annual report by suggesting an index
 * from this library wherever the report uses one of its words; the learner decides,
 * from the sentence, whether the company buys it. That only helps if every index is what
 * input-cost-library-manifest.json says it is, so for each this checks that:
 *
 * 1. its title on its own BLS page is the title given, and reads its base period there;
 * 2. BLS's public API returns an unbroken run of months, preliminary months only at the end;
 * 3. no word is claimed by two indexes, so one mention never suggests two;
 * 4. no id is listed twice, and every index has words to be found by.
 *
 * Writes lib/studio-project/data/input-cost-library.json only when every check passes,
 * and docs/source-audits/studio-input-cost-library.md either way, with any problems listed.
 *
 * BLS's version 1 API needs no key and allows 25 queries a day, of up to 25 series and ten
 * years each; this makes one query per 25 series. Every request names a contact address
 * from OPS_SEC_CONTACT, which is never printed or written anywhere. Dates are UTC.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/*
 * Node strips types but will not resolve `../filings/anchor` to `anchor.ts`, and the app
 * source must keep extensionless imports for the bundler. So the extension is supplied here.
 */
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/.test(specifier) && context.parentURL) {
      const candidate = fileURLToPath(new URL(specifier, context.parentURL)) + ".ts";
      if (existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});

const { compactMonths, formatChange, monthsFromBls, monthsOf, yearOnYear } = await import("../../lib/studio-project/input-costs.ts");

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DATASET = join(ROOT, "lib", "studio-project", "data", "input-cost-library.json");
const REPORT = join(ROOT, "docs", "source-audits", "studio-input-cost-library.md");

const TODAY = new Date().toISOString().slice(0, 10);
const BLS_API = "https://api.bls.gov/publicAPI/v1/timeseries/data/";
const BLS_PAUSE_MS = 1_500;
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const contact = process.env.OPS_SEC_CONTACT?.trim();
if (!contact) {
  throw new Error("Set OPS_SEC_CONTACT, for example: node --env-file=.env.local scripts/source/fetch-input-cost-library.mjs");
}
const UA = `Open Portfolio Studio educational research ${contact}`;
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function request(url, init = {}) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    await sleep(BLS_PAUSE_MS * attempt);
    const response = await fetch(url, { ...init, headers: { "User-Agent": UA, Accept: "*/*", ...(init.headers ?? {}) } });
    if (response.ok || response.status === 404 || attempt === 4) return response;
  }
}

const manifest = JSON.parse(readFileSync(join(HERE, "input-cost-library-manifest.json"), "utf8"));
const problems = [];

// 3 and 4. The manifest on its own.
const ids = manifest.series.map((entry) => entry.id);
for (const id of new Set(ids)) if (ids.filter((other) => other === id).length > 1) problems.push(`${id} is listed twice.`);
const claimedBy = new Map();
for (const entry of manifest.series) {
  if (!entry.words.length) problems.push(`${entry.id} (${entry.name}) has no words to be found by.`);
  for (const word of entry.words) {
    const key = word.trim().toLowerCase().replace(/\s+/g, " ");
    if (claimedBy.has(key) && claimedBy.get(key) !== entry.id) problems.push(`"${word}" is a word for both ${claimedBy.get(key)} and ${entry.id}.`);
    claimedBy.set(key, entry.id);
  }
}

// 2. Every month, one query per 25 series.
const endYear = Number(TODAY.slice(0, 4));
const read = new Map();
for (let index = 0; index < ids.length; index += 25) {
  const batch = ids.slice(index, index + 25);
  const response = await request(BLS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seriesid: batch, startyear: String(endYear - 9), endyear: String(endYear) }),
  });
  const body = await response.json();
  if (body.status !== "REQUEST_SUCCEEDED") throw new Error(`BLS answered ${body.status}: ${(body.message ?? []).join(" ")}`);
  for (const entry of body.Results?.series ?? []) read.set(entry.seriesID, monthsFromBls(entry.data ?? []));
}

// 1. Each index's own page.
const pages = new Map();
for (const id of new Set(ids)) {
  const response = await request(`https://data.bls.gov/timeseries/${id}`);
  if (!response.ok) {
    pages.set(id, { problem: `its BLS page answered ${response.status}` });
    continue;
  }
  const text = (await response.text()).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
  const item = /Item:\s*(.+?)\s+Base Date:\s*(\d{4})(\d{2})/.exec(text);
  if (!item) {
    pages.set(id, { problem: "its BLS page gives no item and base date in the form expected" });
    continue;
  }
  const [, title, year, month] = item;
  pages.set(id, { title, baseDate: month === "00" ? `${year} = 100` : `${MONTH_NAMES[Number(month) - 1]} ${year} = 100` });
}

const series = manifest.series.map((entry) => {
  const found = [];
  const page = pages.get(entry.id);
  if (page.problem) found.push(page.problem);
  else if (page.title !== entry.title) found.push(`its BLS page calls it "${page.title}", not "${entry.title}"`);
  const months = read.get(entry.id);
  if (!months) found.push("BLS returned no data for it");
  else found.push(...months.problems);
  const compact = compactMonths(months?.months ?? []);
  found.push(...compact.problems);
  problems.push(...found.map((problem) => `${entry.id} (${entry.name}): ${problem}`));
  return {
    id: entry.id,
    title: entry.title,
    name: entry.name,
    words: entry.words,
    exclude: entry.exclude,
    baseDate: page.baseDate ?? "",
    url: `https://data.bls.gov/timeseries/${entry.id}`,
    start: compact.start,
    values: compact.values,
    preliminaryFrom: compact.preliminaryFrom,
  };
});

if (!problems.length) {
  mkdirSync(dirname(DATASET), { recursive: true });
  writeFileSync(
    DATASET,
    JSON.stringify(
      {
        builtOn: TODAY,
        source: `Producer price indexes, not seasonally adjusted, from the US Bureau of Labor Statistics' public data API, version 1, fetched ${TODAY}.`,
        terms:
          "BLS: everything it publishes is in the public domain, except previously copyrighted photographs and illustrations, and citation is requested (docs/source-audits/studio-online-data-and-tools.md §5).",
        series,
      },
      null,
      1,
    ) + "\n",
    "utf8",
  );
}

// ---------------------------------------------------------------------------
// The audit page
// ---------------------------------------------------------------------------

const cell = (text) => String(text).replace(/\|/g, "\\|");
const lastYear = endYear - 1;
const lines = [
  "# The input-cost library",
  "",
  "Generated by `scripts/source/fetch-input-cost-library.mjs` from `scripts/source/input-cost-library-manifest.json`.",
  "Do not edit by hand.",
  "",
  `Checked on ${TODAY} (UTC): ${Math.ceil(ids.length / 25)} queries to BLS's public API and ${new Set(ids).size} BLS series pages.`,
  problems.length
    ? "**The data file was not written**, because of the problems listed at the end."
    : "Every check passed, and `lib/studio-project/data/input-cost-library.json` was written.",
  "",
  "Studio suggests an index wherever an annual report uses one of its words, matched as whole words and ignoring",
  "capitals. A mention is not a purchase, so nothing is linked until the learner keeps the sentence that shows the",
  "company buys it. None of these indexes is for exactly what any one company buys.",
  "",
  `| Index | Title and base period, from its BLS page | Shown as | Words (not counted inside) | Months stored | Latest month | ${lastYear} against ${lastYear - 1} |`,
  "| --- | --- | --- | --- | --- | --- | ---: |",
  ...series.map((entry) => {
    const page = pages.get(entry.id);
    const months = monthsOf(entry);
    const latest = months[months.length - 1];
    const preliminary = months.filter((month) => month.preliminary).length;
    const change = months.length ? yearOnYear(months, lastYear, 12) : null;
    return `| [${entry.id}](${entry.url}) | ${cell(page.title ?? "—")}, ${entry.baseDate || "—"} | ${cell(entry.name)} | ${cell(entry.words.join(", "))}${entry.exclude.length ? ` (not: ${cell(entry.exclude.join(", "))})` : ""} | ${months.length ? `${entry.start} to ${latest.month}` : "—"} | ${latest ? `${latest.value}${preliminary ? `, the last ${preliminary} preliminary` : ""}` : "—"} | ${change ? formatChange(change.change) : "—"} |`;
  }),
  "",
  "## Problems",
  "",
  ...(problems.length ? problems.map((problem) => `- ${problem}`) : ["None."]),
  "",
  "## Refreshing",
  "",
  "Run the script monthly, after BLS publishes. BLS revises a month for four months after first publishing it; Studio",
  "shows no change for a fiscal year with a preliminary month in it, and marks preliminary months on its chart.",
  "",
];
writeFileSync(REPORT, lines.join("\n"), "utf8");

console.log(`${series.length} series. ${problems.length ? `PROBLEMS:\n  ${problems.join("\n  ")}` : "No problems."}\nreport   ${REPORT}${problems.length ? "" : `\ndataset  ${DATASET}`}`);
if (problems.length) process.exit(1);
