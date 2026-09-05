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

  it("gives every instrument at least one dated, resolvable source", () => {
    for (const item of STUDIO_CATALOG) {
      expect(item.sources.length).toBeGreaterThan(0);
      for (const source of item.sources) {
        expect(source.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(source.url).toMatch(/^https:\/\/www\.sec\.gov\/Archives\/edgar\/data\/\d+\//);
        expect(source.label.trim()).not.toBe("");
      }
    }
  });

  it("states no price, because OPS holds no market-data licence", () => {
    for (const item of STUDIO_CATALOG) {
      expect(item.referencePrice).toBeNull();
      expect(item.priceAsOf).toBe("");
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
    // The gaps must describe the catalog as it actually is.
    expect(STUDIO_CATALOG.some((item) => item.kind === "stock")).toBe(false);
    expect(STUDIO_CATALOG.some((item) => item.kind === "bond")).toBe(false);
    expect(STUDIO_CATALOG.some((item) => item.assetClass === "international-equity")).toBe(false);
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
