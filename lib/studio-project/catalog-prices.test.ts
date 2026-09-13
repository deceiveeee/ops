import { describe, expect, it } from "vitest";
import { choosePrice, namesListing, type HolderReport } from "./catalog-prices";
import { AGREEMENT_TOLERANCE } from "./prices";

/**
 * The rules that decide whether a learner sees a price at all.
 *
 * The numbers are the ones read from real holdings filings in the research pass
 * (docs/source-audits/studio-fund-prices.md): VTI at $370.04 on 30 June 2026 from
 * three unrelated funds, and $354.18 on 30 April, where two of the funds that
 * reported it were series of one trust.
 */

const report = (patch: Partial<HolderReport>): HolderReport => ({
  cik: "1",
  accession: "0000000000-26-000001",
  entity: "A Fund Trust",
  series: null,
  filedAt: "2026-08-26",
  asOf: "2026-06-30",
  price: 370.04,
  fairValueLevel: "1",
  currency: "USD",
  ...patch,
});

describe("which filed identifier names the listing", () => {
  it("accepts the CUSIP, or a US ISIN built around it", () => {
    expect(namesListing("CUSIP:922908769", "922908769")).toBe(true);
    // VOO's ISIN as a filer gave it: US, the CUSIP, and a check digit.
    expect(namesListing("ISIN:US9229083632", "922908363")).toBe(true);
    expect(namesListing("isin:us46436e7186", "46436E718")).toBe(true);
  });

  it("refuses anything else, however close", () => {
    expect(namesListing("CUSIP:922908768", "922908769")).toBe(false);
    // TSMC's Taiwan share is not the American depositary share a learner buys.
    expect(namesListing("ISIN:TW0002330008", "874039100")).toBe(false);
    expect(namesListing("ISIN:US922908769", "922908769")).toBe(false);
  });
});

describe("choosing the price", () => {
  it("takes the newest month-end on which unrelated funds agree", () => {
    const choice = choosePrice(
      [
        report({ cik: "914036", entity: "Lincoln Variable Insurance Products Trust", asOf: "2026-06-30", price: 370.04 }),
        report({ cik: "1545440", entity: "Potomac Funds", asOf: "2026-06-30", price: 370.04 }),
        report({ cik: "1592900", entity: "EA Series Trust", asOf: "2026-04-30", price: 354.18 }),
        report({ cik: "1382990", entity: "ALPS Variable Investment Trust", asOf: "2026-04-30", price: 354.18 }),
      ],
      AGREEMENT_TOLERANCE,
    );
    expect(choice.found).toBe(true);
    if (!choice.found) return;
    expect([choice.asOf, choice.price, choice.registrants]).toEqual(["2026-06-30", 370.04, 2]);
  });

  it("does not count two series of one trust as two funds", () => {
    // Defined Duration 5 and Defined Duration 20 both file under EA Series Trust.
    const choice = choosePrice(
      [
        report({ cik: "1592900", series: "Defined Duration 5 ETF", asOf: "2026-04-30", price: 354.18 }),
        report({ cik: "1592900", series: "Defined Duration 20 ETF", asOf: "2026-04-30", price: 354.18 }),
      ],
      AGREEMENT_TOLERANCE,
    );
    expect(choice.found).toBe(false);
  });

  it("falls back to an older month-end when the newest has only one fund, and says so", () => {
    const lone = report({ cik: "999", asOf: "2026-07-31", price: 380.0 });
    const choice = choosePrice(
      [lone, report({ cik: "1", asOf: "2026-06-30" }), report({ cik: "2", asOf: "2026-06-30" })],
      AGREEMENT_TOLERANCE,
    );
    if (!choice.found) throw new Error("expected a price");
    expect(choice.asOf).toBe("2026-06-30");
    expect(choice.setAside.find((entry) => entry.report === lone)?.why).toMatch(/only 1 registrant agreed/);
  });

  it("sets aside a fund that disagrees, rather than averaging it in", () => {
    const outlier = report({ cik: "3", price: 371.5 });
    const choice = choosePrice([report({ cik: "1" }), report({ cik: "2" }), outlier], AGREEMENT_TOLERANCE);
    if (!choice.found) throw new Error("expected a price");
    expect(choice.price).toBe(370.04);
    expect(choice.agreeing).not.toContain(outlier);
    expect(choice.setAside.map((entry) => entry.report)).toContain(outlier);
  });

  it("returns a price a fund actually reported, not an average of the ones that agreed", () => {
    const choice = choosePrice(
      [report({ cik: "1", price: 370.04 }), report({ cik: "2", price: 370.05 }), report({ cik: "3", price: 370.04 })],
      AGREEMENT_TOLERANCE,
    );
    if (!choice.found) throw new Error("expected a price");
    expect([370.04, 370.05]).toContain(choice.price);
  });

  it("only uses quoted US-dollar prices", () => {
    const choice = choosePrice(
      [
        report({ cik: "1", currency: "TWD", price: 69.42 }),
        report({ cik: "2", fairValueLevel: "2" }),
        report({ cik: "3", fairValueLevel: "3" }),
      ],
      AGREEMENT_TOLERANCE,
    );
    expect(choice.found).toBe(false);
    if (choice.found) return;
    expect(choice.reason).toMatch(/No fund reported a quoted US-dollar price/);
    expect(choice.setAside.map((entry) => entry.why)).toEqual([
      "valued in TWD, not the US listing's dollars",
      "fair-value level 2, not a quoted market price",
      "fair-value level 3, not a quoted market price",
    ]);
  });

  it("has no price when funds never agree", () => {
    const choice = choosePrice([report({ cik: "1", price: 100 }), report({ cik: "2", price: 110 })], AGREEMENT_TOLERANCE);
    expect(choice.found).toBe(false);
    if (choice.found) return;
    expect(choice.reason).toMatch(/No month-end on which funds under 2 different registrants/);
  });
});
