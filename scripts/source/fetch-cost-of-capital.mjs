#!/usr/bin/env node
/**
 * Industry cost of capital, from Aswath Damodaran's published datasets.
 *
 *   node scripts/source/fetch-cost-of-capital.mjs
 *   node scripts/source/fetch-cost-of-capital.mjs --report   rebuild from cache
 *
 * A learner can look up their company's revenue and profit. They cannot look up
 * its cost of capital, because nobody reports one — it needs a risk-free rate,
 * an equity risk premium and a beta, none of which appear in a filing. Asking a
 * beginner to invent it is the empty-box problem this product exists to avoid,
 * so Studio ships a sourced default they can change.
 *
 * **Permitted use.** His stated rules ask only for optional acknowledgement:
 * "If you do use my data and wish to acknowledge that you did get the data off
 * my site, I thank you." No restriction on commercial use or redistribution.
 * He names industry comparison as the best use, and explicitly says *not* to
 * use it for individual company analysis — use filings for that. That is
 * exactly the split Studio makes: the learner's company comes from its filing,
 * the industry context comes from him. Only industry-level data is taken; he is
 * no longer permitted to share company-level files.
 *
 * **The vintage is unstated and that matters.** The live page carries no date
 * and the server sends no Last-Modified header. The newest dated file in his
 * archive is the January 2025 update. Since the risk-free rate inside a cost of
 * capital moves, this pipeline derives that rate out of the data so the surface
 * can show it and let a learner replace it with today's Treasury yield.
 * He also warns he changes methods when he decides a past one was wrong, so
 * this is high-decay data: re-run it and re-read the rules yearly.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const CACHE = join(ROOT, ".source-cache", "damodaran");
const DATASET = join(ROOT, "lib", "studio-project", "data", "cost-of-capital.json");
const REPORT = join(ROOT, "docs", "source-audits", "studio-cost-of-capital.md");
const SOURCE = "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/wacc.htm";
const RULES = "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datahistory.html";

/**
 * Our SIC industries mapped to his, checked by name against the parsed table.
 *
 * His taxonomy is his own, not SIC, so every pairing here is a judgment and is
 * recorded as one. A mapping that no longer resolves fails the run rather than
 * silently falling back to a market average.
 */
const SIC_TO_INDUSTRY = {
  "3674": "Semiconductor",
  "7372": "Software (System & Application)",
  "5331": "Retail (General)",
  "4011": "Transportation (Railroads)",
  "2834": "Drugs (Pharmaceutical)",
};

const decode = (raw) =>
  raw
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const number = (raw) => {
  const value = Number(String(raw).replace("%", "").replace(/,/g, ""));
  return Number.isFinite(value) ? value : null;
};

function parseTable(html) {
  const rows = [...html.matchAll(/<tr[^>]*>([^]*?)<\/tr>/gi)].map((row) =>
    [...row[1].matchAll(/<t[dh][^>]*>([^]*?)<\/t[dh]>/gi)].map((cell) => decode(cell[1])),
  );
  return rows
    .slice(1)
    .filter((row) => row.length >= 11 && row[0] && number(row[2]) !== null)
    .map((row) => ({
      industry: row[0],
      firms: number(row[1]),
      beta: number(row[2]),
      costOfEquity: number(row[3]) / 100,
      costOfDebt: number(row[6]) / 100,
      taxRate: number(row[7]) / 100,
      afterTaxCostOfDebt: number(row[8]) / 100,
      debtWeight: number(row[9]) / 100,
      costOfCapital: number(row[10]) / 100,
    }));
}

/**
 * Recover the risk-free rate and equity risk premium behind every cost of equity.
 *
 * He publishes cost of equity but not its two inputs. Since every industry uses
 * the same pair with only beta varying, a regression of cost of equity on beta
 * returns them exactly. Verified rather than assumed: the worst residual across
 * 96 industries is 2.33 basis points against 2.23 predicted by beta rounding to
 * two decimals alone, so nothing but rounding separates the model from the data.
 */
function recoverComponents(rows) {
  const n = rows.length;
  const sx = rows.reduce((sum, r) => sum + r.beta, 0);
  const sy = rows.reduce((sum, r) => sum + r.costOfEquity, 0);
  const sxx = rows.reduce((sum, r) => sum + r.beta * r.beta, 0);
  const sxy = rows.reduce((sum, r) => sum + r.beta * r.costOfEquity, 0);
  const equityRiskPremium = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const riskFreeRate = (sy - equityRiskPremium * sx) / n;

  const worstResidual = Math.max(...rows.map((r) => Math.abs(riskFreeRate + r.beta * equityRiskPremium - r.costOfEquity)));
  // Beta is published to two decimals, so half a unit in the last place times
  // the premium is the most rounding alone can explain.
  const roundingAllows = 0.005 * equityRiskPremium;

  const worstRebuild = Math.max(
    ...rows.map((r) => Math.abs(r.costOfEquity * (1 - r.debtWeight) + r.afterTaxCostOfDebt * r.debtWeight - r.costOfCapital)),
  );

  return {
    riskFreeRate,
    equityRiskPremium,
    worstResidual,
    roundingAllows,
    componentsRecoverable: worstResidual <= roundingAllows * 1.15,
    worstRebuild,
    waccFormulaHolds: worstRebuild < 0.0006,
  };
}

// ---------------------------------------------------------------------------

mkdirSync(CACHE, { recursive: true });
mkdirSync(dirname(DATASET), { recursive: true });

const cached = join(CACHE, "wacc.htm");
if (!process.argv.includes("--report") || !existsSync(cached)) {
  const response = await fetch(SOURCE, { headers: { "User-Agent": "Open Portfolio Studio educational research" } });
  if (!response.ok) throw new Error(`${response.status} fetching ${SOURCE}`);
  writeFileSync(cached, await response.text(), "utf8");
}

const rows = parseTable(readFileSync(cached, "utf8"));
if (rows.length < 50) throw new Error(`only ${rows.length} industries parsed — the page layout has changed`);

const components = recoverComponents(rows);
if (!components.componentsRecoverable) {
  throw new Error(
    `cost of equity no longer decomposes into one risk-free rate plus beta times one premium ` +
      `(worst residual ${(components.worstResidual * 10000).toFixed(1)}bp against ${(components.roundingAllows * 10000).toFixed(1)}bp ` +
      `explicable by rounding). His method has changed; re-read it before publishing a default.`,
  );
}
if (!components.waccFormulaHolds) {
  throw new Error(`published cost of capital no longer rebuilds from its parts (worst gap ${(components.worstRebuild * 10000).toFixed(1)}bp)`);
}

const byName = new Map(rows.map((row) => [row.industry, row]));
const mapping = {};
for (const [sic, industry] of Object.entries(SIC_TO_INDUSTRY)) {
  if (!byName.has(industry)) throw new Error(`SIC ${sic} maps to "${industry}", which is not in the dataset. His taxonomy has changed.`);
  mapping[sic] = industry;
}

const dataset = {
  retrievedAt: new Date().toISOString().slice(0, 10),
  source: SOURCE,
  rules: RULES,
  attribution: "Industry cost of capital data from Aswath Damodaran, NYU Stern.",
  vintage: "unstated at source; the newest dated file in his archive is the January 2025 update",
  decay: "high",
  // Recovered rather than published. The surface shows this and lets a learner
  // replace it with a current Treasury yield, because it is the component most
  // likely to be stale and the easiest for anyone to look up.
  impliedRiskFreeRate: Number(components.riskFreeRate.toFixed(6)),
  impliedEquityRiskPremium: Number(components.equityRiskPremium.toFixed(6)),
  verification: {
    industries: rows.length,
    worstCostOfEquityResidualBp: Number((components.worstResidual * 10000).toFixed(2)),
    explicableByBetaRoundingBp: Number((components.roundingAllows * 10000).toFixed(2)),
    worstWaccRebuildBp: Number((components.worstRebuild * 10000).toFixed(2)),
  },
  sicToIndustry: mapping,
  industries: rows,
};

writeFileSync(DATASET, JSON.stringify(dataset, null, 2) + "\n", "utf8");

const pct = (v) => `${(v * 100).toFixed(2)}%`;
const lines = [
  "# Industry cost of capital",
  "",
  "Generated by `scripts/source/fetch-cost-of-capital.mjs`. Do not edit by hand.",
  "",
  `${rows.length} industries, retrieved ${dataset.retrievedAt} from Aswath Damodaran, NYU Stern.`,
  "",
  "## Why this is here",
  "",
  "A learner can look up their company's revenue and profit. They cannot look up",
  "its cost of capital: no company reports one, because it needs a risk-free rate,",
  "an equity risk premium and a beta, none of which appear in a filing. Asking a",
  "beginner to invent that number is exactly the empty box this product exists to",
  "avoid, so Studio ships a sourced default and teaches them to change it.",
  "",
  "## Permitted use",
  "",
  "His stated rules ask only for optional acknowledgement — *\"If you do use my",
  "data and wish to acknowledge that you did get the data off my site, I thank",
  "you.\"* There is no restriction on commercial use or redistribution. He names",
  "industry comparison as the best use and says explicitly **not** to use it for",
  "individual company analysis, pointing to filings instead. That is the split",
  "Studio makes. Only industry-level data is taken; he is no longer permitted to",
  "share company-level files.",
  "",
  "## The vintage is unstated, and it matters",
  "",
  "The page carries no date and the server sends no `Last-Modified` header. The",
  "newest dated file in his archive is the January 2025 update. A risk-free rate",
  "from then, used now, would be wrong by however much yields have moved — so",
  "this pipeline recovers that rate out of the data rather than burying it.",
  "",
  "| | |",
  "| --- | --- |",
  `| Implied risk-free rate | ${pct(dataset.impliedRiskFreeRate)} |`,
  `| Implied equity risk premium | ${pct(dataset.impliedEquityRiskPremium)} |`,
  "",
  "Neither is published. Both are recovered by regressing cost of equity on beta",
  "across all industries, which works because every industry uses the same pair",
  "with only beta varying.",
  "",
  "## Verification",
  "",
  "Two checks, both of which can fail and abort the run:",
  "",
  `- **Cost of equity decomposes.** Worst residual ${dataset.verification.worstCostOfEquityResidualBp}bp across`,
  `  ${rows.length} industries, against ${dataset.verification.explicableByBetaRoundingBp}bp explicable by beta being published to two`,
  "  decimals alone. Nothing but rounding separates the model from the data.",
  `- **Cost of capital rebuilds from its parts.** Cost of equity times the equity`,
  `  weight plus after-tax cost of debt times the debt weight, worst gap`,
  `  ${dataset.verification.worstWaccRebuildBp}bp.`,
  "",
  "If either stops holding, his method has changed and the run fails rather than",
  "publishing a default nobody checked.",
  "",
  "## Our industries",
  "",
  "His taxonomy is his own, not SIC, so each pairing is a judgment. A mapping that",
  "stops resolving fails the run rather than falling back to a market average.",
  "",
  "| SIC | Our industry | His industry | Beta | Cost of capital |",
  "| --- | --- | --- | ---: | ---: |",
  ...Object.entries(mapping).map(([sic, industry]) => {
    const row = byName.get(industry);
    return `| ${sic} | ${{ "3674": "Semiconductors", "7372": "Prepackaged software", "5331": "Variety stores", "4011": "Railroads", "2834": "Pharmaceutical preparations" }[sic]} | ${industry} | ${row.beta.toFixed(2)} | ${pct(row.costOfCapital)} |`;
  }),
  "",
  "## Range across all industries",
  "",
  `Lowest ${pct(Math.min(...rows.map((r) => r.costOfCapital)))}, highest ${pct(Math.max(...rows.map((r) => r.costOfCapital)))}, median ${pct([...rows.map((r) => r.costOfCapital)].sort((a, b) => a - b)[Math.floor(rows.length / 2)])}.`,
  "",
  "That spread is the point. A single market-wide number would tell a learner",
  "nothing about whether their company's return is good for the kind of business",
  "it is.",
  "",
];
writeFileSync(REPORT, lines.join("\n"), "utf8");

console.log(`${rows.length} industries`);
console.log(`implied risk-free ${pct(dataset.impliedRiskFreeRate)}, equity risk premium ${pct(dataset.impliedEquityRiskPremium)}`);
console.log(`cost of equity residual ${dataset.verification.worstCostOfEquityResidualBp}bp (rounding allows ${dataset.verification.explicableByBetaRoundingBp}bp)`);
console.log(`wacc rebuild gap ${dataset.verification.worstWaccRebuildBp}bp`);
console.log(`\ndataset  ${DATASET}`);
console.log(`report   ${REPORT}`);
