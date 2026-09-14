import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/holdings-slate";
import manifest from "../../scripts/source/fund-reports-manifest.json";
import fundReports from "./data/fund-reports.json";
import { extractFundReport, returnPct, type FundReportEntry } from "./fund-reports";

/**
 * The returns and costs Studio carries, checked against the filings they came from.
 *
 * scripts/source/fetch-fund-reports.mjs keeps a verbatim excerpt of each annual
 * report beside the data: every context naming the share class and the facts
 * read on them. Reading the excerpt again must give exactly what the data file
 * says, so a figure edited by hand, or a parser that has drifted since the data
 * was written, fails here.
 */

const funds = fundReports.funds as unknown as Record<string, FundReportEntry>;

describe("fund returns and costs against their filings", () => {
  it("has a matched, complete report for every fund in the manifest", () => {
    for (const { instrumentId, symbol } of manifest.listings) {
      const entry = funds[instrumentId];
      expect(entry, symbol).toBeDefined();
      expect(entry.problems, symbol).toEqual([]);
      expect(entry.extract?.returns.found, symbol).toBe(true);
      expect(entry.extract?.costs.found, symbol).toBe(true);
      expect(entry.extract?.pastPerformance, symbol).toMatch(/past performance/i);
      expect(entry.extract?.taxes, symbol).toMatch(/tax/i);
    }
  });

  it("reads each excerpt of the filing again and gets exactly the figures in the data", () => {
    for (const entry of Object.values(funds)) {
      expect(typeof entry.excerpt, entry.symbol).toBe("string");
      // Relative to the repository root, where vitest runs.
      const excerpt = readFileSync(resolve(process.cwd(), entry.excerpt), "utf8");
      expect(excerpt, entry.symbol).toContain(entry.url);
      expect(extractFundReport(excerpt, entry.classId), entry.symbol).toEqual(entry.extract);
    }
  });

  it("matches each ticker to the share class the report itself tags with it", () => {
    for (const entry of Object.values(funds)) {
      expect(entry.extract?.tradingSymbols, entry.symbol).toEqual([entry.symbol]);
    }
  });

  it("agrees with Mission 12's product records on which share class each ticker is", () => {
    const checked = Object.values(funds).filter((entry) => entry.symbol in PRODUCTS);
    expect(checked.map((entry) => entry.symbol).sort()).toEqual(["AGG", "SGOV", "VOO", "VTI"]);
    for (const entry of checked) {
      const passport = PRODUCTS[entry.symbol as keyof typeof PRODUCTS];
      expect([entry.seriesId, entry.classId], entry.symbol).toEqual([passport.seriesId, passport.classId]);
    }
  });

  it("gives 1 and 5 years, and 10 years or since the class began, all ending on the report's year-end", () => {
    for (const entry of Object.values(funds)) {
      const { extract } = entry;
      if (!extract?.returns.found) throw new Error(`${entry.symbol} has no returns`);
      const periods = extract.returns.periods;
      expect(periods.every((period) => period.end === extract.periodEnd), entry.symbol).toBe(true);
      expect(periods.slice(0, 2).map((period) => period.years), entry.symbol).toEqual([1, 5]);
      const longest = periods[2];
      expect(longest.years === 10 || (longest.years === null && longest.start < periods[1].start), entry.symbol).toBe(true);
    }
  });

  /**
   * An independent source for the series choice. Mission 12's records carry each
   * fund's net-asset-value returns from its prospectus, for periods ended
   * 31 December 2025. Where an annual report covers the same periods, the two
   * documents must agree. For VOO this is what settles it: its report's data
   * file labels the other series "Net Asset Value", and the prospectus sides
   * with the printed table. When a refresh moves every report past that date,
   * nothing is left to compare and this fails, so someone has to look again.
   */
  it("gives the same net-asset-value returns as the prospectus, where the periods are the same", () => {
    const PROSPECTUS_PERIOD_END = "2025-12-31";
    const comparable = Object.values(funds).filter(
      (entry) => entry.symbol in PRODUCTS && entry.extract?.periodEnd === PROSPECTUS_PERIOD_END,
    );
    expect(comparable.length).toBeGreaterThan(0);
    for (const entry of comparable) {
      const passport = PRODUCTS[entry.symbol as keyof typeof PRODUCTS];
      if (!entry.extract?.returns.found) throw new Error(`${entry.symbol} has no returns`);
      expect(entry.extract.returns.periods.map((period) => returnPct(period.value)), entry.symbol).toEqual(
        passport.returns.map((row) => row.fundPct),
      );
    }
  });
});
