#!/usr/bin/env node
/**
 * Peer sets chosen by product, checked against EDGAR before a learner sees them.
 *
 *   node --env-file=.env.local scripts/source/fetch-peer-sets.mjs
 *
 * The SEC files Atkore under an industry code whose companies mostly make
 * batteries and EV chargers, so its peers are chosen by hand in
 * peer-sets-manifest.json. Hand-chosen is only acceptable if every choice is
 * checkable, so for each set this confirms:
 *
 * 1. the subject's latest annual report is the one quoted, and every quoted
 *    passage appears in it word for word, including the competitors it names;
 * 2. every competitor that passage names is either a peer or on the missing
 *    list, and nobody else is;
 * 3. each peer still files annual reports, its latest is the one quoted, and
 *    its quoted passages appear in it; a peer found by search is found by that
 *    search again;
 * 4. each missing company files no annual report under any SEC record given
 *    for it, and the filings its note describes exist;
 * 5. each company left out is found by the search named, and the passage that
 *    shows why appears in its filing.
 *
 * Writes lib/studio-project/data/peer-sets.json and the audit page
 * docs/source-audits/studio-peer-sets.md. A failed check is written as a
 * problem, and Studio shows no set that has one.
 *
 * Documents are read only until every passage quoted from them is found. Every
 * request names a contact address, from OPS_SEC_CONTACT, which is never printed
 * or written anywhere. Dates are UTC.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  allProblems,
  annualReportStatus,
  containsPassage,
  countMentions,
  filingText,
  readNamedCompetitors,
  segmentsNaming,
  unaccounted,
} from "../../lib/studio-project/peer-sets.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DATASET = join(ROOT, "lib", "studio-project", "data", "peer-sets.json");
const REPORT = join(ROOT, "docs", "source-audits", "studio-peer-sets.md");

const TODAY = new Date().toISOString().slice(0, 10);
const SEARCH_FROM = "2025-01-01";
const DOC_CAP = 15 * 1024 * 1024;
const CHECK_EVERY = 512 * 1024;
const SEARCH_PAUSE_MS = 1_500;
const ARCHIVE_PAUSE_MS = 600;

const contact = process.env.OPS_SEC_CONTACT?.trim();
if (!contact) {
  throw new Error("Set OPS_SEC_CONTACT, for example: node --env-file=.env.local scripts/source/fetch-peer-sets.mjs");
}
const UA = `Open Portfolio Studio educational research ${contact}`;
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function edgar(url, pause) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    await sleep(pause * attempt);
    const response = await fetch(url, { headers: { "User-Agent": UA, Accept: "*/*" } });
    if (response.ok || response.status === 404 || attempt === 4) return response;
  }
}

let bytesRead = 0;

async function submissions(cik) {
  const response = await edgar(`https://data.sec.gov/submissions/CIK${cik}.json`, ARCHIVE_PAUSE_MS);
  if (!response.ok) throw new Error(`submissions for ${cik} answered ${response.status}`);
  const data = await response.json();
  const recent = data.filings.recent;
  const rows = recent.form.map((form, index) => ({
    form,
    filed: recent.filingDate[index],
    accession: recent.accessionNumber[index],
    period: recent.reportDate[index],
    document: recent.primaryDocument[index],
  }));
  return { data, rows, olderPages: data.filings.files.length };
}

function filingRef(cik, rows, accession, document) {
  const row = rows.find((candidate) => candidate.accession === accession);
  if (!row) return { ref: null, problem: `${accession} is not in its filing list.` };
  if (row.document !== document) return { ref: null, problem: `${accession}'s main document is ${row.document}, not ${document}.` };
  return {
    ref: {
      form: row.form,
      accession,
      document,
      filed: row.filed,
      periodEnd: row.period,
      url: `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession.replace(/-/g, "")}/${document}`,
    },
    problem: null,
  };
}

/** Streams a document and stops once every quote is found in its text. */
async function readUntil(url, quotes) {
  const response = await edgar(url, ARCHIVE_PAUSE_MS);
  if (!response.ok) return { found: quotes.map(() => false), failed: `${url} answered ${response.status}` };
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let raw = "";
  let checked = 0;
  let found = quotes.map(() => false);
  const check = () => {
    const text = filingText(raw);
    found = quotes.map((quote) => containsPassage(text, quote));
    checked = raw.length;
  };
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      check();
      break;
    }
    bytesRead += value.length;
    raw += decoder.decode(value, { stream: true });
    if (raw.length - checked > CHECK_EVERY) {
      check();
      if (found.every(Boolean)) {
        await reader.cancel();
        break;
      }
    }
    if (raw.length > DOC_CAP) {
      check();
      await reader.cancel();
      break;
    }
  }
  return { found, failed: null };
}

/** Reads a whole document, for a reason that rests on everything it says. */
async function readWhole(url) {
  const response = await edgar(url, ARCHIVE_PAUSE_MS);
  if (!response.ok) return { text: null, failed: `${url} answered ${response.status}` };
  const raw = await response.text();
  bytesRead += raw.length;
  if (raw.length > DOC_CAP) return { text: null, failed: `${url} is over the size cap, so its mentions could not be counted.` };
  return { text: filingText(raw), failed: null };
}

/** The accessions a full-text search for the phrase finds among one company's annual reports. */
async function searchHits(phrase, cik) {
  const url =
    `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(`"${phrase}"`)}` +
    `&forms=10-K&ciks=${cik}&dateRange=custom&startdt=${SEARCH_FROM}&enddt=${TODAY}`;
  const response = await edgar(url, SEARCH_PAUSE_MS);
  if (!response.ok) return null;
  return ((await response.json()).hits?.hits ?? []).map((hit) => hit._id.split(":")[0]);
}

async function quotedPassages(ref, quotes, problems) {
  if (!ref) return;
  const { found, failed } = await readUntil(ref.url, quotes);
  if (failed) problems.push(failed);
  quotes.forEach((quote, index) => {
    if (!found[index]) problems.push(`The passage "${quote}" is not in ${ref.accession}.`);
  });
}

async function searchFinds(phrase, cik, accession, problems) {
  const hits = await searchHits(phrase, cik);
  if (hits === null) problems.push(`The full-text search for "${phrase}" failed, so it could not be checked.`);
  else if (!hits.includes(accession)) problems.push(`A full-text search for "${phrase}" no longer finds ${accession}.`);
}

const COMPANY_WORD = /\b(corp|corporation|company|co|inc|incorporated|llc|ltd|limited|plc|holdings)\b/i;

async function companiesNamed(query) {
  const response = await edgar(
    `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(query)}&type=&dateb=&owner=include&count=40`,
    ARCHIVE_PAUSE_MS,
  );
  const html = await response.text();
  const single = html.match(/<span class="companyName">([\s\S]*?)<\/span>/);
  if (single) return [single[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()];
  return [...html.matchAll(/CIK=(\d{10})[^>]*>\d{10}<\/a>\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/g)]
    .map((match) => match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .filter((name) => COMPANY_WORD.test(name));
}

const manifest = JSON.parse(readFileSync(join(HERE, "peer-sets-manifest.json"), "utf8"));
const sets = [];

for (const set of manifest.sets) {
  const setProblems = [];
  const { subject } = set;

  // 1. The subject, and the competitors it names.
  const subjectRecord = await submissions(subject.cik);
  const subjectStatus = annualReportStatus(subjectRecord.rows, TODAY);
  if (!subjectStatus.files) setProblems.push(`${subject.name} no longer files annual reports.`);
  if (subjectStatus.latestAnnual && subjectStatus.latestAnnual.accession !== subject.accession) {
    setProblems.push(`${subject.name}'s latest annual report is ${subjectStatus.latestAnnual.accession}, not the ${subject.accession} quoted. Review the quotes.`);
  }
  const subjectFiling = filingRef(subject.cik, subjectRecord.rows, subject.accession, subject.document);
  if (subjectFiling.problem) setProblems.push(subjectFiling.problem);
  await quotedPassages(subjectFiling.ref, [...subject.makes.map((entry) => entry.quote), subject.competitorsQuote], setProblems);

  // The short list a learner reads must be words the subject itself uses.
  for (const product of subject.briefProducts ?? []) {
    if (!subject.makes.some((entry) => entry.quote.toLowerCase().includes(product.toLowerCase()))) {
      setProblems.push(`"${product}" is in the short list of what ${subject.shortName} makes, but not in its own words.`);
    }
  }
  if (!subject.briefProducts?.length) setProblems.push(`No short list of what ${subject.shortName} makes.`);

  const named = readNamedCompetitors(subject.competitorsQuote, subject.competitorsLead);
  if (!named.length) setProblems.push("The competitor passage could not be read into named companies.");

  // 2. Everyone named is accounted for, once.
  const accountedAs = [...set.peers.filter((peer) => peer.namedAs).map((peer) => peer.namedAs), ...set.missing.map((entry) => entry.namedAs)];
  const { notAccounted, notNamed } = unaccounted(named, accountedAs);
  for (const name of notAccounted) setProblems.push(`${subject.shortName} names ${name}, which is neither a peer nor on the missing list.`);
  for (const name of notNamed) setProblems.push(`${name} is listed as named by ${subject.shortName}, but the passage does not name it.`);
  for (const name of new Set(accountedAs)) {
    if (accountedAs.filter((entry) => entry === name).length > 1) setProblems.push(`${name} is accounted for twice.`);
  }

  // 3. The peers.
  const peers = [];
  for (const peer of set.peers) {
    const problems = [];
    const record = await submissions(peer.cik);
    const status = annualReportStatus(record.rows, TODAY);
    if (!status.files) problems.push("It does not file annual reports with the SEC now.");
    if (status.latestAnnual && status.latestAnnual.accession !== peer.accession) {
      problems.push(`Its latest annual report is ${status.latestAnnual.accession}, not the ${peer.accession} quoted. Review the quotes.`);
    }
    const filing = filingRef(peer.cik, record.rows, peer.accession, peer.document);
    if (filing.problem) problems.push(filing.problem);
    await quotedPassages(filing.ref, [peer.business.quote, ...(peer.overlap ? [peer.overlap.quote] : [])], problems);
    const namedIn = peer.namedAs ? segmentsNaming(named, peer.namedAs) : [];
    if (peer.namedAs && !namedIn.length) problems.push(`${subject.shortName}'s passage does not name "${peer.namedAs}".`);
    if (peer.foundBy) await searchFinds(peer.foundBy, peer.cik, peer.accession, problems);
    if (!peer.namedAs && !peer.foundBy) problems.push(`Neither named by ${subject.shortName} nor found by a search, so nothing says why it is here.`);
    peers.push({
      name: peer.name,
      ticker: record.data.tickers?.[0] ?? "",
      cik: peer.cik,
      namedAs: peer.namedAs,
      namedIn,
      foundBy: peer.foundBy,
      filing: filing.ref,
      overlap: peer.overlap,
      business: peer.business,
      problems,
    });
  }

  // 4. The competitors no SEC filing covers.
  const missing = [];
  for (const entry of set.missing) {
    const problems = [];
    const records = [];
    const rows = [];
    for (const cik of entry.ciks) {
      const record = await submissions(cik);
      records.push({ cik, name: record.data.name.replace(/\s+/g, " ").trim() });
      if (record.olderPages) problems.push(`Record ${cik} has older filing pages that were not read.`);
      if (annualReportStatus(record.rows, TODAY).files) problems.push(`Record ${cik} files annual reports, so it is not missing.`);
      rows.push(...record.rows);
    }
    const evidence = [];
    for (const need of entry.needsForms) {
      const matches = rows
        .filter((row) => row.form === need.form && (!need.year || row.filed.startsWith(String(need.year))))
        .sort((a, b) => a.filed.localeCompare(b.filed));
      if (!matches.length) problems.push(`No ${need.form}${need.year ? ` filed in ${need.year}` : ""}, which its note relies on.`);
      else evidence.push({ form: matches[0].form, filed: matches[0].filed });
    }
    if (entry.onlyFormsStartingWith) {
      const others = [...new Set(rows.filter((row) => !entry.onlyFormsStartingWith.some((prefix) => row.form.startsWith(prefix))).map((row) => row.form))];
      if (others.length) problems.push(`It also filed ${others.join(", ")}, which its note says it did not.`);
    }
    if (entry.companySearch) {
      const companies = await companiesNamed(entry.companySearch);
      if (companies.length) problems.push(`EDGAR's company search for "${entry.companySearch}" finds ${companies.join("; ")}.`);
    }
    if (!entry.ciks.length && !entry.companySearch) problems.push("No SEC record and no company search, so nothing shows it is missing.");
    const namedIn = segmentsNaming(named, entry.namedAs);
    if (!namedIn.length) problems.push(`${subject.shortName}'s passage does not name it.`);
    missing.push({ namedAs: entry.namedAs, namedIn, records, note: entry.note, evidence, problems });
  }

  // 5. Found by search, and left out.
  const leftOut = [];
  for (const entry of set.leftOut) {
    const problems = [];
    const record = await submissions(entry.cik);
    const filing = filingRef(entry.cik, record.rows, entry.accession, entry.document);
    if (filing.problem) problems.push(filing.problem);
    if (entry.mentions && filing.ref) {
      // A reason that says a word appears only so often is counted over the whole report.
      const { text, failed } = await readWhole(filing.ref.url);
      if (failed) problems.push(failed);
      else {
        for (const quote of [entry.quote, entry.mentions.quote]) {
          if (!containsPassage(text, quote)) problems.push(`The passage "${quote}" is not in ${entry.accession}.`);
        }
        if (!countMentions(entry.mentions.quote, entry.mentions.word)) {
          problems.push(`The passage given for "${entry.mentions.word}" does not contain it.`);
        }
        const count = countMentions(text, entry.mentions.word);
        if (count !== entry.mentions.count) {
          problems.push(`Its report mentions "${entry.mentions.word}" ${count} times, not the ${entry.mentions.count} its reason says.`);
        }
      }
    } else {
      await quotedPassages(filing.ref, [entry.quote], problems);
    }
    await searchFinds(entry.foundBy, entry.cik, entry.accession, problems);
    leftOut.push({
      name: entry.name,
      cik: entry.cik,
      foundBy: entry.foundBy,
      filing: filing.ref,
      why: entry.why,
      quote: entry.quote,
      mentions: entry.mentions ?? null,
      problems,
    });
  }

  const built = {
    id: set.id,
    label: set.label,
    subject: {
      name: subject.name,
      shortName: subject.shortName,
      ticker: subjectRecord.data.tickers?.[0] ?? "",
      cik: subject.cik,
      sic: subjectRecord.data.sic,
      sicDescription: subjectRecord.data.sicDescription,
      filing: subjectFiling.ref,
      briefProducts: subject.briefProducts ?? [],
      makes: subject.makes,
      competitorsQuote: subject.competitorsQuote,
      named,
    },
    peers,
    missing,
    leftOut,
    problems: setProblems,
  };
  sets.push(built);

  const problems = allProblems(built);
  console.log(
    `${set.id}: ${peers.length} peers, ${missing.length} missing, ${leftOut.length} left out; ` +
      `${named.reduce((sum, group) => sum + group.names.length, 0)} names in ${named.length} segments. ` +
      (problems.length ? `PROBLEMS:\n  ${problems.join("\n  ")}` : "No problems."),
  );
}

mkdirSync(dirname(DATASET), { recursive: true });
writeFileSync(
  DATASET,
  JSON.stringify(
    {
      builtOn: TODAY,
      method:
        "Peers chosen by what they make, where the SEC's industry code is a poor market boundary. A company is in because the subject's annual report names it as a main competitor, or because its own annual report describes a product the subject makes, found by full-text search. Every quoted passage, filing record and search result is checked against EDGAR when this file is built.",
      terms:
        "SEC website dissemination terms, read firsthand on 2026-09-10 (docs/source-audits/studio-online-data-and-tools.md §5.1): information on sec.gov may be copied or further distributed; citation is requested.",
      sets,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);

// ---------------------------------------------------------------------------
// The audit page
// ---------------------------------------------------------------------------

const cell = (text) => String(text).replace(/\|/g, "\\|");
const link = (ref) => (ref ? `[${ref.form} ${ref.accession}](${ref.url})` : "—");
const lines = [
  "# Peer sets, chosen by product",
  "",
  "Generated by `scripts/source/fetch-peer-sets.mjs` from `scripts/source/peer-sets-manifest.json`. Do not",
  "edit by hand.",
  "",
  `Checked against EDGAR on ${TODAY}. ${(bytesRead / 1024 / 1024).toFixed(2)} MB of filings were read; each document only as far as its last`,
  "quoted passage.",
  "",
];

for (const set of sets) {
  const { subject } = set;
  const problems = allProblems(set);
  lines.push(
    `## ${set.label}`,
    "",
    `**Why a chosen set.** The SEC files ${subject.name} under SIC ${subject.sic}, ${subject.sicDescription}. EDGAR's company`,
    "list for that code is mostly battery and EV-charger makers (docs/source-audits/studio-online-data-and-tools.md §5.1),",
    `so a set built on the code would compare ${subject.shortName} with them.`,
    "",
    `**What ${subject.shortName} makes**, from its ${link(subject.filing)}, for the year to ${subject.filing?.periodEnd ?? "—"}:`,
    "",
    ...subject.makes.map((entry) => `- ${entry.segment}: "${entry.quote}"`),
    "",
    `The industry view sums this up as "including ${subject.briefProducts.join(", ")}". Each of those words is checked against the passages above.`,
    "",
    `**The competitors it names**, read from the same report:`,
    "",
    ...subject.named.map((group) => `- ${group.segment}: ${group.names.join("; ")}`),
    "",
    "Every one of them is either in the set or on the missing list below. The script refuses to call a set",
    "clean otherwise.",
    "",
    "### In the set",
    "",
    "| Company | Why it is in | In its own annual report | Filing |",
    "| --- | --- | --- | --- |",
    ...set.peers.map((peer) => {
      const why = peer.namedIn.length
        ? `${subject.shortName} names it as a main competitor in ${peer.namedIn.join(" and ")}`
        : `Found by a full-text search for "${peer.foundBy}"`;
      const words = [peer.overlap ? `${peer.overlap.lead}: "${peer.overlap.quote}"` : "No overlapping product found in searchable words", `${peer.business.lead}: "${peer.business.quote}"`];
      return `| ${cell(peer.name)} (${peer.ticker}) | ${cell(why)} | ${cell(words.join(". "))} | ${link(peer.filing)} |`;
    }),
    "",
    "### Named, and missing from any SEC comparison",
    "",
    "| Competitor | Named in | SEC records | Why it is missing | Filings that show it |",
    "| --- | --- | --- | --- | --- |",
    ...set.missing.map(
      (entry) =>
        `| ${cell(entry.namedAs)} | ${cell(entry.namedIn.join(", "))} | ${entry.records.length ? cell(entry.records.map((record) => `${record.name} (${record.cik})`).join("; ")) : "none"} | Files no annual report with the SEC. ${cell(entry.note)} | ${entry.evidence.length ? entry.evidence.map((item) => `${item.form} ${item.filed}`).join("; ") : "—"} |`,
    ),
    "",
    "### Found by search, and left out",
    "",
    "| Company | Search | Why it is left out | Passage | Filing |",
    "| --- | --- | --- | --- | --- |",
    ...set.leftOut.map((entry) => `| ${cell(entry.name)} | "${cell(entry.foundBy)}" | ${cell(entry.why)}${entry.mentions ? ` "${cell(entry.mentions.word)}" appears ${entry.mentions.count === 1 ? "once" : `${entry.mentions.count} times`} in the whole report, counted.` : ""} | "${cell(entry.quote)}" | ${link(entry.filing)} |`),
    "",
    "### Problems",
    "",
    ...(problems.length ? problems.map((problem) => `- ${problem}`) : ["None. Every passage, filing record and search result above was confirmed on the date at the top."]),
    "",
  );
}

lines.push(
  "## Refreshing",
  "",
  "Run the script after the subject or any peer files a new annual report; it reports a newer report as a",
  "problem, and Studio hides the set until the quotes are reviewed in the manifest and the script is run again.",
  "Atkore's fiscal year ends on 30 September.",
  "",
);
writeFileSync(REPORT, lines.join("\n"), "utf8");
console.log(`\n${(bytesRead / 1024 / 1024).toFixed(2)} MB read\ndataset  ${DATASET}\nreport   ${REPORT}`);
