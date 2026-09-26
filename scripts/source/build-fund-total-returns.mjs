/** Rebuild share-class monthly returns from the existing SEC cache. No API key or network. */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { nportClassReturns } from "../../lib/studio-project/nport-returns.ts";
const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const classes = JSON.parse(read("lib/studio-project/data/fund-reports.json")).funds;
const index = JSON.parse(read(".source-cache/nport/index.json"));
const files = readdirSync(new URL(".source-cache/nport/raw/", root)).filter((f) => f.endsWith(".xml"));
const histories = [];
for (const instrumentId of ["vti", "voo", "vxus"]) {
  const fund = classes[instrumentId];
  const byMonth = new Map();
  const sources = [];
  for (const file of files) {
    const xml = read(`.source-cache/nport/raw/${file}`);
    const observations = nportClassReturns(xml, fund.seriesId, fund.classId);
    if (!observations.length) continue;
    const accession = file.replace(/\.xml$/, "");
    const meta = index.fetched[accession];
    const sha256 = createHash("sha256").update(xml).digest("hex");
    if (!meta || meta.sha256 !== sha256) throw new Error(`Cached source hash failed: ${file}`);
    const reportDate = xml.match(/<repPdDate>([^<]+)<\/repPdDate>/)[1];
    sources.push({ accession, url: meta.url, filedAt: meta.filedAt, retrievedAt: meta.retrievedAt, reportDate, sha256, cachedIndexDate: meta.reportDate });
    for (const row of observations) {
      const old = byMonth.get(row.month);
      if (old && Math.abs(old.value - row.value) > 1e-10) throw new Error(`Conflicting class returns: ${instrumentId} ${row.month}`);
      byMonth.set(row.month, { ...row, accession });
    }
  }
  if (!byMonth.size) throw new Error(`No public return history for ${instrumentId}`);
  histories.push({ instrumentId, symbol: fund.symbol, name: fund.seriesName, seriesId: fund.seriesId, classId: fund.classId, currency: "USD", basis: "net-asset-value", observations: [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month)), sources });
}
const output = { builtOn: new Date().toISOString().slice(0, 10), method: "SEC Form N-PORT Item B.5, exact ETF share class; reported total returns with distributions reinvested. Reporting month is read from each XML.", histories };
writeFileSync(new URL("lib/studio-project/data/fund-total-returns.json", root), JSON.stringify(output, null, 2) + "\n");
console.log(histories.map((h) => ({ symbol: h.symbol, months: h.observations.length, first: h.observations[0].month, last: h.observations.at(-1).month, sourceFiles: h.sources.length, indexDateDisagreements: h.sources.filter((s) => s.reportDate !== s.cachedIndexDate).length })));
