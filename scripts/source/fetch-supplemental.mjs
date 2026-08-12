#!/usr/bin/env node
/**
 * Supplemental source pipeline: the six portfolio-construction subjects the
 * Damodaran corpus does not cover to implementable depth.
 *
 *   node scripts/source/fetch-supplemental.mjs                 all sources
 *   node scripts/source/fetch-supplemental.mjs tax-accounts    one subject
 *   node scripts/source/fetch-supplemental.mjs irs-pub550      one source id
 *   node scripts/source/fetch-supplemental.mjs --check         re-verify URLs only, no extract
 *
 * Companion to fetch-session.mjs. Output lands in the same gitignored cache.
 * These are third-party copyrighted documents; they are reference material for
 * authoring original OPS lessons and must not be committed or redistributed.
 *
 * Requires: curl, pdftotext.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const CACHE = join(ROOT, ".source-cache", "supplemental");
const DIRS = {
  raw: join(CACHE, "raw"),
  text: join(CACHE, "text"),
  provenance: join(CACHE, "provenance"),
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
// SEC refuses requests that do not identify the requester.
const SEC_UA = "Open Portfolio Studio educational research (contact via repository owner)";

const manifest = JSON.parse(
  readFileSync(join(HERE, "supplemental-manifest.json"), "utf8"),
);

function sh(cmd, args) {
  return execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 1024 * 1024 * 128 });
}

const sha256 = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/** Normalise the punctuation PDF and HTML extraction mangles into U+FFFD or entities. */
function normalise(text) {
  return text
    .replace(/ /g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&mdash;/gi, "-")
    .replace(/&ndash;/gi, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/©/g, "(c)")
    .replace(/®/g, "(r)")
    .replace(/™/g, "(tm)")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n");
}

/**
 * Preserve table rows. These pages carry their real content in tables (a country
 * risk premium table, for example), and the source HTML puts newlines between
 * cells. Splitting on raw newlines therefore strands every country name on its
 * own line, divorced from its numbers — extractable but uncitable.
 *
 * So: insert explicit row and cell markers BEFORE stripping tags, then flatten
 * all original whitespace, then rebuild lines from the markers.
 */
function htmlToText(html) {
  const ROW = "";
  const CELL = "";
  const marked = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(tr|p|div|li|h[1-6]|table|section)>/gi, ROW)
    .replace(/<br\s*\/?>/gi, ROW)
    .replace(/<\/(td|th)>/gi, CELL)
    .replace(/<[^>]+>/g, " ");

  return normalise(marked)
    // Flatten the document's own line breaks so only our markers delimit rows.
    .replace(/[\r\n]+/g, " ")
    .split(ROW)
    .map((row) =>
      row
        .split(CELL)
        .map((cell) => cell.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .join(" | "),
    )
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

/**
 * These documents are modern and professionally typeset, so they should NOT show
 * the ligature corruption that afflicts the 2012 lecture decks. Verified clean
 * across all five initial PDFs. Check rather than repair: if this ever fires, the
 * text is untrustworthy and must not be cited until inspected.
 */
function corruptionCheck(text) {
  const hits = (text.match(/[a-z][^a-z\s.,/()&:;'"0-9-][a-z]/g) ?? []).filter(
    (m) => !/[A-Z]/.test(m[1]),
  );
  return hits.length;
}

function fetchOne(src, checkOnly) {
  const isSec = src.url.includes("sec.gov") || src.url.includes("investor.gov");
  const ext = src.format === "pdf" ? "pdf" : src.format === "html" ? "html" : "bin";
  const raw = join(DIRS.raw, `${src.id}.${ext}`);
  const record = {
    id: src.id,
    subject: src.subject,
    title: src.title,
    publisher: src.publisher,
    url: src.url,
    jurisdiction: src.jurisdiction,
    decay: src.decay,
    missions: src.missions,
    fetchedAt: new Date().toISOString(),
    warnings: [],
  };

  let code;
  try {
    code = sh("curl", [
      "-sL",
      "-A",
      isSec ? SEC_UA : UA,
      "--max-time",
      "120",
      "-o",
      raw,
      "-w",
      "%{http_code}",
      src.url,
    ]).trim();
  } catch (err) {
    record.status = "fetch-failed";
    record.warnings.push(err.message);
    return record;
  }

  record.httpStatus = code;
  const bytes = existsSync(raw) ? statSync(raw).size : 0;
  record.bytes = bytes;

  if (code !== "200" || bytes < 2000) {
    record.status = "unavailable";
    record.warnings.push(`HTTP ${code}, ${bytes} bytes — source may have moved`);
    return record;
  }
  record.sha256 = sha256(raw);

  // Guard against a server returning an HTML error page with a 200.
  const head = readFileSync(raw).subarray(0, 5).toString("latin1");
  if (src.format === "pdf" && !head.startsWith("%PDF")) {
    record.status = "wrong-content-type";
    record.warnings.push("expected a PDF, received something else (likely an error page)");
    return record;
  }

  if (checkOnly) {
    record.status = "reachable";
    return record;
  }

  if (src.format === "api") {
    record.status = "reachable";
    return record;
  }

  if (src.format === "binary") {
    record.status = "downloaded-not-extracted";
    record.warnings.push(
      src.limitation ?? "binary format; no extractor available in this environment",
    );
    return record;
  }

  const txt = join(DIRS.text, `${src.id}.txt`);
  if (src.format === "pdf") {
    sh("pdftotext", ["-layout", raw, txt]);
    const body = readFileSync(txt, "utf8");
    record.pages = (body.match(/\f/g) ?? []).length + 1;
    writeFileSync(txt, normalise(body));
  } else {
    writeFileSync(txt, htmlToText(readFileSync(raw, "utf8")));
  }

  const finalText = readFileSync(txt, "utf8");
  record.words = finalText.split(/\s+/).filter(Boolean).length;
  record.textFile = txt;
  const corrupt = corruptionCheck(finalText);
  record.corruptionHits = corrupt;
  if (corrupt > 10) {
    record.warnings.push(
      `${corrupt} suspicious character sequences — text may be ligature-corrupted; inspect before citing`,
    );
  }
  if (record.words < 400) {
    record.warnings.push(`only ${record.words} words extracted — verify this is the full document`);
  }
  record.status = "ok";
  return record;
}

for (const d of Object.values(DIRS)) mkdirSync(d, { recursive: true });

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const target = args.find((a) => !a.startsWith("--"));

const all = [...manifest.sources, ...manifest.endpoints];
const selected = !target
  ? all
  : all.filter((s) => s.id === target || s.subject === target);

if (!selected.length) {
  console.error(`No source matches "${target}".`);
  console.error(`Ids: ${all.map((s) => s.id).join(", ")}`);
  console.error(`Subjects: ${[...new Set(all.map((s) => s.subject))].join(", ")}`);
  process.exit(1);
}

const results = [];
for (const src of selected) {
  process.stdout.write(`${src.id.padEnd(28)} `);
  const r = fetchOne(src, checkOnly);
  results.push(r);
  const detail =
    r.status === "ok"
      ? `${r.pages ? r.pages + "p " : ""}${r.words} words`
      : r.status;
  console.log(`${String(r.httpStatus ?? "-").padEnd(4)} ${detail}`);
  writeFileSync(
    join(DIRS.provenance, `${src.id}.json`),
    JSON.stringify(r, null, 2),
  );
}

const ok = results.filter((r) => r.status === "ok" || r.status === "reachable").length;
console.log(`\n${ok}/${results.length} usable.`);

const warned = results.filter((r) => r.warnings.length);
if (warned.length) {
  console.log("\nWarnings:");
  for (const r of warned) for (const w of r.warnings) console.log(`  ${r.id}: ${w}`);
}

const high = results.filter((r) => r.decay === "high" && r.status === "ok");
if (high.length) {
  console.log(
    `\n${high.length} source(s) marked decay:high — figures change at least annually. Cite with a date; never hardcode into lesson copy:`,
  );
  for (const r of high) console.log(`  ${r.id} (${r.jurisdiction})`);
}
console.log(`\nCache: ${CACHE}`);
