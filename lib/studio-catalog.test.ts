import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/holdings-slate";
import {
  CATALOG_GAPS,
  STUDIO_CATALOG,
  findStudioInstrument,
  type StudioInstrument,
} from "./studio-catalog";
import {
  addStudioHolding,
  calculateStudio,
  createStudioPlan,
  updateStudioHolding,
  type StudioPlan,
} from "./studio";

/**
 * The catalog is the file a user is trusting when they decide what to buy, so
 * these tests are about provenance as much as arithmetic: no number may be here
 * without a dated filing behind it, and the model must keep saying "unknown"
 * where the filings do.
 *
 * Expected values are taken from the filings recorded in lib/holdings-slate.ts
 * and audited in docs/source-audits/mission-12-holdings.md, or worked out by
 * hand below — never read back out of the code under test.
 */

const instrument = (symbol: string): StudioInstrument => {
  const found = STUDIO_CATALOG.find((item) => item.symbol === symbol);
  if (!found) throw new Error(`${symbol} missing from the catalog`);
  return found;
};

/** A complete, valid plan: two holdings splitting the whole budget. */
function twoWayPlan(budget: number, aId: string, aPct: number, bId: string, bPct: number): StudioPlan {
  let plan = createStudioPlan("practice", "2026-09-04T00:00:00.000Z");
  plan = { ...plan, goal: { ...plan.goal, budget, cashReserve: 0 } };
  plan = addStudioHolding(plan, aId);
  plan = addStudioHolding(plan, bId);
  plan = updateStudioHolding(plan, aId, { targetWeightPct: aPct });
  plan = updateStudioHolding(plan, bId, { targetWeightPct: bPct });
  return plan;
}

describe("Studio catalog provenance", () => {
  it("carries the filed expense ratio for every fund, not a rounded stand-in", () => {
    // Straight from each fund's own fee table in lib/holdings-slate.ts.
    expect(instrument("VTI").expenseRatioPct).toBe(PRODUCTS.VTI.totalExpensePct);
    expect(instrument("VOO").expenseRatioPct).toBe(PRODUCTS.VOO.totalExpensePct);
    expect(instrument("AGG").expenseRatioPct).toBe(PRODUCTS.AGG.totalExpensePct);
    expect(instrument("SGOV").expenseRatioPct).toBe(PRODUCTS.SGOV.totalExpensePct);
    // SGOV's is genuinely different from the other three; a copy-paste slip here
    // would be invisible without this.
    expect(instrument("SGOV").expenseRatioPct).not.toBe(instrument("VTI").expenseRatioPct);
  });

  it("gives every instrument at least one dated source on an official domain", () => {
    for (const item of STUDIO_CATALOG) {
      expect(item.sources.length).toBeGreaterThan(0);
      for (const source of item.sources) {
        expect(source.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(source.url).toMatch(/^https:\/\/(www\.sec\.gov|www\.treasurydirect\.gov)\//);
        expect(source.label.trim()).not.toBe("");
      }
    }
  });

  it("states a price only where an official source publishes one", () => {
    for (const item of STUDIO_CATALOG) {
      if (item.referencePrice === null) {
        // No market-data licence, so a fund carries no price at all.
        expect(item.priceAsOf).toBe("");
      } else {
        // Treasury publishes its own auction price, so that one entry has a
        // dated figure. A price without its date would be unusable.
        expect(item.priceAsOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(item.referencePrice).toBeGreaterThan(0);
      }
    }
    // Only the Treasury note. If a fund ever gains a price, that is a licence
    // question and not a detail to slip through.
    const priced = STUDIO_CATALOG.filter((item) => item.referencePrice !== null);
    expect(priced.map((item) => item.kind)).toEqual(["bond"]);
  });

  it("leaves bond accrued interest unstated, because it depends on the settlement date", () => {
    for (const bond of STUDIO_CATALOG.filter((item) => item.kind === "bond")) {
      expect(bond.bond).not.toBeNull();
      expect(bond.bond?.accruedInterestPer100).toBeNull();
      expect(bond.bond?.cusip).toMatch(/^[0-9A-Z]{9}$/);
      expect(bond.bond?.maturity).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(bond.bond?.couponPct).toBeGreaterThan(0);
    }
  });

  it("reports issuer coverage as the listed issuers, capped at the whole fund", () => {
    for (const item of STUDIO_CATALOG) {
      const coverage = item.exposureCoveragePct ?? 0;
      expect(coverage).toBeGreaterThan(0);
      expect(coverage).toBeLessThanOrEqual(100);
      // Coverage is exactly what the listed issuers account for. The cap is not
      // cosmetic: SGOV's filed weights sum to 108.8162% and holdings-slate.ts
      // says never to normalise them, so an uncapped figure would claim more
      // than a whole portfolio.
      const listed = item.exposures.reduce((total, exposure) => total + exposure.weightPct, 0);
      expect(coverage).toBeCloseTo(Math.min(100, listed), 4);
    }
  });

  it("names what a user cannot research here yet", () => {
    const kinds = CATALOG_GAPS.map((gap) => gap.kind);
    expect(kinds).toContain("international");
    expect(kinds).toContain("stock");
    expect(kinds).toContain("bond");
    // Every kind the launch scope asked for now exists, so each gap has to
    // describe a shortfall rather than an absence. A gap still claiming
    // something is missing when it is present is the failure this catches.
    expect(STUDIO_CATALOG.some((item) => item.kind === "stock")).toBe(true);
    expect(STUDIO_CATALOG.some((item) => item.kind === "bond")).toBe(true);
    expect(STUDIO_CATALOG.some((item) => item.assetClass === "international-equity")).toBe(true);
    expect(CATALOG_GAPS.find((gap) => gap.kind === "bond")?.missing).toMatch(/more individual bonds/i);
    expect(CATALOG_GAPS.find((gap) => gap.kind === "international")?.missing).toMatch(/global fund|more of any/i);
    expect(CATALOG_GAPS.find((gap) => gap.kind === "stock")?.missing).toMatch(/more company shares/i);
  });

  it("resolves instruments by id and reports unknown ones as unknown", () => {
    expect(findStudioInstrument("vti")?.symbol).toBe("VTI");
    expect(findStudioInstrument("not-an-instrument")).toBeUndefined();
  });
});

describe("Studio calculations over the real catalog", () => {
  it("splits a budget into dollar targets", () => {
    // $10,000 at 60/40 is $6,000 and $4,000. No reserve, so the full budget is investable.
    const result = calculateStudio(twoWayPlan(10_000, "vti", 60, "agg", 40), STUDIO_CATALOG);
    expect(result.valid).toBe(true);
    expect(result.rows.map((row) => row.targetValue)).toEqual([6_000, 4_000]);
    expect(result.targetCash).toBe(0);
  });

  it("applies the stress scenario by asset class", () => {
    // Defaults are -30% US stocks and -10% bonds.
    // 6,000 x -0.30 = -1,800; 4,000 x -0.10 = -400; total -2,200 on 10,000 = -22%.
    const result = calculateStudio(twoWayPlan(10_000, "vti", 60, "agg", 40), STUDIO_CATALOG);
    expect(result.stress.changeDollars).toBe(-2_200);
    expect(result.stress.changePct).toBe(-22);
    expect(result.stress.endingValue).toBe(7_800);
  });

  it("charges each fund its own expense ratio", () => {
    // VTI 0.03% on 6,000 = 1.80; AGG 0.03% on 4,000 = 1.20; total 3.00 a year.
    const result = calculateStudio(twoWayPlan(10_000, "vti", 60, "agg", 40), STUDIO_CATALOG);
    expect(result.fees.annualKnownCost).toBe(3);
    expect(result.fees.coveragePct).toBe(100);
    expect(result.fees.unknownInstrumentIds).toEqual([]);
  });

  it("finds the overlap between two funds holding the same companies", () => {
    // VTI and VOO both hold the largest US companies, so a portfolio of the two
    // owns them twice. This is Mission 12's finding, reached here from the
    // filings rather than asserted.
    const result = calculateStudio(twoWayPlan(10_000, "vti", 50, "voo", 50), STUDIO_CATALOG);
    const labels = result.overlaps.map((overlap) => overlap.label);
    expect(labels).toContain("NVIDIA Corp");
    expect(labels).toContain("Apple Inc");
    for (const overlap of result.overlaps) {
      expect(overlap.instrumentIds.sort()).toEqual(["voo", "vti"]);
    }
    // Partial by construction: neither fund's full holdings are documented.
    expect(result.exposureCoveragePct).toBeGreaterThan(0);
    expect(result.exposureCoveragePct).toBeLessThan(100);
  });

  it("shows a US and an international stock fund holding different companies", () => {
    // The counterpart to the VTI/VOO case above, and the reason an
    // international fund is in the catalog at all. VTI's documented issuers are
    // NVIDIA, Apple, Alphabet and the rest; VXUS's are TSMC, Samsung, ASML,
    // Tencent and so on. No shared LEI, so no repeated exposure to report.
    const result = calculateStudio(twoWayPlan(10_000, "vti", 50, "vxus", 50), STUDIO_CATALOG);
    expect(result.overlaps).toEqual([]);
    // Both funds are only partly documented, so the check itself is partial and
    // the number has to say so rather than implying a clean bill.
    expect(result.exposureCoveragePct).toBeGreaterThan(0);
    expect(result.exposureCoveragePct).toBeLessThan(50);
  });

  it("applies the international shock to an international fund", () => {
    // Defaults are -30% US stocks and -30% international, so a 50/50 split of
    // $10,000 loses $1,500 on each side: -$3,000, or -30%.
    let plan = twoWayPlan(10_000, "vti", 50, "vxus", 50);
    plan = { ...plan, stress: { ...plan.stress, usStocksPct: -20, internationalStocksPct: -40 } };
    // Split apart, the two shocks must land on the right holdings:
    // 5,000 x -0.20 = -1,000 and 5,000 x -0.40 = -2,000, so -$3,000 again but
    // for different reasons. Reversing them would give the same total, so the
    // per-row figures are what actually prove the mapping.
    const result = calculateStudio(plan, STUDIO_CATALOG);
    const rows = Object.fromEntries(result.stress.rows.map((row) => [row.instrumentId, row.changeDollars]));
    expect(rows.vti).toBe(-1_000);
    expect(rows.vxus).toBe(-2_000);
    expect(result.stress.changeDollars).toBe(-3_000);
  });

  it("catches a company owned directly and again through a fund", () => {
    // The reason both shares are in the catalog. Apple is VTI's second largest
    // documented issuer at 5.9407%, so holding AAPL beside VTI owns it twice:
    // 50% directly, plus 50% x 5.9407% = 2.97035% through the fund, which is
    // 52.97% of the portfolio in one company.
    const result = calculateStudio(twoWayPlan(10_000, "aapl", 50, "vti", 50), STUDIO_CATALOG);
    const apple = result.overlaps.find((overlap) => overlap.label.includes("Apple"));
    expect(apple).toBeDefined();
    expect(apple?.instrumentIds.sort()).toEqual(["aapl", "vti"]);
    expect(apple?.portfolioWeightPct).toBeCloseTo(52.97, 1);
  });

  it("catches the same thing across a border", () => {
    // TSMC is VXUS's largest documented issuer at 3.9281%.
    // 50% + 50% x 3.9281% = 51.96%.
    const result = calculateStudio(twoWayPlan(10_000, "tsm", 50, "vxus", 50), STUDIO_CATALOG);
    const tsmc = result.overlaps.find((overlap) => overlap.label.includes("Taiwan Semiconductor"));
    expect(tsmc?.instrumentIds.sort()).toEqual(["tsm", "vxus"]);
    expect(tsmc?.portfolioWeightPct).toBeCloseTo(51.96, 1);
  });

  it("treats a foreign company as international however it is traded", () => {
    // TSM is bought in US dollars on the NYSE and is still a Taiwanese
    // company, so the international shock applies, not the US one.
    let plan = twoWayPlan(10_000, "aapl", 50, "tsm", 50);
    plan = { ...plan, stress: { ...plan.stress, usStocksPct: -20, internationalStocksPct: -40 } };
    const rows = Object.fromEntries(
      calculateStudio(plan, STUDIO_CATALOG).stress.rows.map((row) => [row.instrumentId, row.changeDollars]),
    );
    expect(rows.aapl).toBe(-1_000);
    expect(rows.tsm).toBe(-2_000);
  });

  it("keeps a foreign share's domicile, listing and currency as separate facts", () => {
    const tsm = instrument("TSM");
    expect(tsm.stock?.incorporatedIn).toMatch(/Taiwan/);
    expect(tsm.stock?.exchange).toBe("NYSE");
    expect(tsm.stock?.usListing).toMatch(/depositary/i);
    // From the 20-F: each ADS represents five common shares.
    expect(tsm.stock?.adsRatio).toBe(5);
    // Traded in dollars, reports in another currency. Conflating the two is the
    // mistake the whole foreign-share section exists to prevent.
    expect(tsm.stock?.reportsIn).toMatch(/New Taiwan/);
    const aapl = instrument("AAPL");
    expect(aapl.stock?.adsRatio).toBeNull();
    expect(aapl.stock?.reportsIn).toMatch(/US dollars/);
  });

  it("charges no fund expense on a single share", () => {
    // A share has no expense ratio, and its absence must not be read as zero
    // cost or drag the fund coverage figure down.
    const result = calculateStudio(twoWayPlan(10_000, "aapl", 50, "vti", 50), STUDIO_CATALOG);
    expect(instrument("AAPL").expenseRatioPct).toBeNull();
    // Only VTI's $5,000 at 0.03% counts: $1.50.
    expect(result.fees.annualKnownCost).toBe(1.5);
    expect(result.fees.coveragePct).toBe(100);
  });

  it("reports no overlap between a stock fund and a Treasury fund", () => {
    const result = calculateStudio(twoWayPlan(10_000, "vti", 50, "sgov", 50), STUDIO_CATALOG);
    expect(result.overlaps).toEqual([]);
  });

  it("matches the same issuer across funds that spell it differently", () => {
    // AGG files its largest issuer as "United States Treasury" and SGOV files
    // the same issuer as "United States of America". Both carry LEI
    // 254900HROIFWPRGM1V77, so someone holding both funds must be told they own
    // one issuer twice — a name comparison would report no overlap at all.
    const result = calculateStudio(twoWayPlan(10_000, "agg", 50, "sgov", 50), STUDIO_CATALOG);
    const government = result.overlaps.find((overlap) =>
      overlap.instrumentIds.includes("agg") && overlap.instrumentIds.includes("sgov"),
    );
    expect(government).toBeDefined();
    // AGG is 45.7192% Treasury and SGOV's Treasury line is clamped to 100%, each
    // at half the portfolio: 0.5 x 45.7192 + 0.5 x 100 = 72.8596.
    expect(government?.portfolioWeightPct).toBeCloseTo(72.86, 1);
  });

  it("keeps the dollar target but asks for a quote before estimating shares", () => {
    const result = calculateStudio(twoWayPlan(10_000, "vti", 60, "agg", 40), STUDIO_CATALOG);
    const order = result.orders.find((item) => item.instrumentId === "vti");
    expect(order?.quantity).toBe(0);
    expect(order?.complete).toBe(false);
    expect(order?.leftover).toBe(6_000);
    expect(order?.warnings.join(" ")).toMatch(/dated broker quote/i);
  });

  it("estimates whole shares once the user supplies a dated quote", () => {
    // 6,000 / 250 = 24 shares exactly, leaving nothing unspent.
    let plan = twoWayPlan(10_000, "vti", 60, "agg", 40);
    plan = updateStudioHolding(plan, "vti", { quotePrice: 250, quoteAsOf: "2026-09-04" });
    const order = calculateStudio(plan, STUDIO_CATALOG).orders.find((item) => item.instrumentId === "vti");
    expect(order?.quantity).toBe(24);
    expect(order?.principalCost).toBe(6_000);
    expect(order?.leftover).toBe(0);
  });

  it("buys a bond in face value at its published auction price", () => {
    // $4,000 of target against a quote of 99.540696 per $100 of face value.
    // 4,000 / 99.540696 = 40.18 lots of $100, so 40 lots, $4,000 face value.
    // 4,000 x 0.99540696 = 3,981.62784, which rounds to $3,981.63, leaving
    // $18.37. Treasury sells in $100 multiples, so the remainder cannot buy
    // another lot.
    const result = calculateStudio(twoWayPlan(10_000, "vti", 60, "ust-91282crf0", 40), STUDIO_CATALOG);
    const order = result.orders.find((item) => item.instrumentId === "ust-91282crf0");
    expect(order?.unit).toBe("face value");
    expect(order?.quantity).toBe(4_000);
    expect(order?.principalCost).toBe(3_981.63);
    expect(order?.leftover).toBe(18.37);
    // Accrued interest is unknown, so the estimate is explicitly incomplete
    // rather than quietly treating it as zero.
    expect(order?.accruedInterest).toBeNull();
    expect(order?.complete).toBe(false);
    expect(order?.warnings.join(" ")).toMatch(/accrued interest is unknown/i);
  });

  it("counts a Treasury note and a Treasury fund as the same issuer", () => {
    // The note is 100% one issuer and SGOV's Treasury line is clamped to 100%,
    // each at half the portfolio, so the whole portfolio is that one issuer.
    const result = calculateStudio(twoWayPlan(10_000, "ust-91282crf0", 50, "sgov", 50), STUDIO_CATALOG);
    const government = result.overlaps.find((overlap) => overlap.label.includes("United States"));
    expect(government?.portfolioWeightPct).toBeCloseTo(100, 1);
  });

  it("never spends more than the dollar target on whole shares", () => {
    // 6,000 / 700 = 8.57, so 8 shares cost 5,600 and 400 stays in cash.
    let plan = twoWayPlan(10_000, "vti", 60, "agg", 40);
    plan = updateStudioHolding(plan, "vti", { quotePrice: 700, quoteAsOf: "2026-09-04" });
    const order = calculateStudio(plan, STUDIO_CATALOG).orders.find((item) => item.instrumentId === "vti");
    expect(order?.quantity).toBe(8);
    expect(order?.estimatedCost).toBe(5_600);
    expect(order?.leftover).toBe(400);
  });
});
