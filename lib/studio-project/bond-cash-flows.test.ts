import { describe, expect, it } from "vitest";
import { couponCashFlows, priceCouponBondFromYTM } from "../fixed-income";
import {
  accruedPer100,
  couponDates,
  daysBetween,
  faceWithin,
  isDue,
  monthsBefore,
  paymentFor,
  periodFor,
  priceFromYield,
  remainingCashFlows,
  yieldFromPrice,
  type BondTerms,
} from "./bond-cash-flows";

/**
 * Accrued interest and prices against the issuer's own published figures.
 *
 * The note is the one in Studio's catalog, CUSIP 91282CRF0, 4.625% due 15
 * August 2036, dated 15 August 2026. Treasury auctioned it twice and published
 * both results (Fiscal Data auctions query, retrieved 2026-09-15):
 *
 * | Settlement | Accrued per $1,000 | Price per $100 | High yield |
 * | --- | --- | --- | --- |
 * | 2026-08-17 (issue) | 0.25136 | 99.540696 | 4.683% |
 * | 2026-09-15 (reopening) | 3.89606 | 98.361116 | 4.834% |
 *
 * Those four numbers are the oracle: none of them comes from this code, and the
 * rule they follow is 31 CFR part 356, appendix B.
 */

const NOTE: BondTerms = { couponPct: 4.625, datedDate: "2026-08-15", maturity: "2036-08-15" };
const value = <T>(outcome: T | { reason: string }): T => {
  if (!isDue(outcome)) throw new Error(`refused: ${outcome.reason}`);
  return outcome;
};
const number = (outcome: number | { reason: string }): number => {
  if (typeof outcome !== "number") throw new Error(`refused: ${outcome.reason}`);
  return outcome;
};

describe("the payment schedule", () => {
  it("counts back from maturity, so the note pays every 15 February and 15 August", () => {
    const dates = couponDates(NOTE);
    expect(dates).toHaveLength(20);
    expect(dates[0]).toBe("2027-02-15");
    expect(dates[1]).toBe("2027-08-15");
    expect(dates[19]).toBe("2036-08-15");
  });

  it("keeps a month-end schedule on the month's last day", () => {
    expect(monthsBefore("2026-08-31", 6)).toBe("2026-02-28");
    expect(monthsBefore("2028-08-31", 6)).toBe("2028-02-29");
    expect(monthsBefore("2026-08-15", 6)).toBe("2026-02-15");
    const monthEnd = couponDates({ couponPct: 4, datedDate: "2026-02-28", maturity: "2027-08-31" });
    expect(monthEnd).toEqual(["2026-08-31", "2027-02-28", "2027-08-31"]);
  });

  it("counts the actual days in a half-year, which is 181 to 184 of them", () => {
    expect(daysBetween("2026-08-15", "2027-02-15")).toBe(184);
    expect(daysBetween("2027-02-15", "2027-08-15")).toBe(181);
    expect(daysBetween("2028-02-15", "2028-08-15")).toBe(182);
  });

  it("puts a settlement date in its period, and starts the next one on a payment date", () => {
    expect(value(periodFor(NOTE, "2026-08-17"))).toEqual({
      start: "2026-08-15",
      end: "2027-02-15",
      days: 184,
      accruedDays: 2,
      remainingDays: 182,
      paymentsLeft: 20,
    });
    // On a payment date the buyer is not entitled to that payment: nothing has accrued yet.
    expect(value(periodFor(NOTE, "2027-02-15"))).toMatchObject({
      start: "2027-02-15",
      end: "2027-08-15",
      accruedDays: 0,
      days: 181,
      paymentsLeft: 19,
    });
  });

  it("refuses a date before interest starts or after the note has matured", () => {
    expect(periodFor(NOTE, "2026-08-14")).toEqual({ reason: "Interest starts on 2026-08-15, so there is nothing to settle before then." });
    expect(periodFor(NOTE, "2036-08-15")).toEqual({ reason: "This issue matures on 2036-08-15, so there is nothing left to buy on that date." });
    expect(periodFor(NOTE, "not a date")).toEqual({ reason: "That is not a date Studio can read." });
  });

  it("lists every payment still to come, the last one with the face value", () => {
    const list = value(remainingCashFlows(NOTE, "2026-09-15", 1000));
    expect(list).toHaveLength(20);
    expect(list[0]).toEqual({ date: "2027-02-15", amount: 23.125, kind: "interest" });
    expect(list[19]).toEqual({ date: "2036-08-15", amount: 1023.125, kind: "interest and face value" });
    expect(list.reduce((total, flow) => total + flow.amount, 0)).toBeCloseTo(20 * 23.125 + 1000, 10);
  });
});

describe("accrued interest, against Treasury's published figures", () => {
  it("matches the 0.25136 per $1,000 Treasury charged at issue", () => {
    // Two days of a 184-day half-year: 23.125 × 2 ÷ 184 per $1,000.
    expect(number(accruedPer100(NOTE, "2026-08-17")) * 10).toBeCloseTo(0.25136, 5);
  });

  it("matches the 3.89606 per $1,000 Treasury charged at the reopening", () => {
    // Thirty-one days of the same half-year.
    expect(number(accruedPer100(NOTE, "2026-09-15")) * 10).toBeCloseTo(3.89606, 5);
  });

  it("is nothing on a payment date and a full coupon the day before the next one", () => {
    expect(number(accruedPer100(NOTE, "2027-02-15"))).toBe(0);
    const dayBefore = number(accruedPer100(NOTE, "2027-08-14"));
    expect(dayBefore).toBeCloseTo((4.625 / 2) * (180 / 181), 12);
    expect(dayBefore).toBeLessThan(4.625 / 2);
  });
});

describe("price and yield, against Treasury's published pairs", () => {
  it("gives the yield Treasury published for the price it set at each auction", () => {
    // Treasury publishes the yield cut to three decimals, so the check is that
    // the yield this finds sits inside that: 4.683072 is published as 4.683%.
    const atIssue = number(yieldFromPrice(NOTE, "2026-08-17", 99.540696));
    expect(atIssue).toBeCloseTo(4.683072, 5);
    expect(Math.floor(atIssue * 1000) / 1000).toBe(4.683);

    const atReopening = number(yieldFromPrice(NOTE, "2026-09-15", 98.361116));
    expect(atReopening).toBeCloseTo(4.834993, 5);
    expect(Math.floor(atReopening * 1000) / 1000).toBe(4.834);
  });

  it("goes back from a yield to the same price", () => {
    for (const settlement of ["2026-08-17", "2026-09-15", "2027-02-15", "2031-05-03"]) {
      const price = number(priceFromYield(NOTE, settlement, 4.25));
      expect(number(yieldFromPrice(NOTE, settlement, price))).toBeCloseTo(4.25, 8);
    }
  });

  it("discounts the part-period with simple interest, as the issuer does, not by compounding", () => {
    // Appendix B: P[1 + (r/s)(i/2)] = (C/2)(r/s) + (C/2)aₙ + 100vₙ. Compounding the
    // same part-period as v^(r/s) gives 99.540981 at this yield — 0.000285 higher,
    // and a price the issuer would not have charged.
    expect(number(priceFromYield(NOTE, "2026-08-17", 4.683072))).toBeCloseTo(99.540696, 5);
  });

  it("prices at par when the yield equals the coupon on a payment date, and the other way round", () => {
    expect(number(priceFromYield(NOTE, "2027-02-15", 4.625))).toBeCloseTo(100, 9);
    expect(number(priceFromYield(NOTE, "2027-02-15", 5.625))).toBeLessThan(100);
    expect(number(priceFromYield(NOTE, "2027-02-15", 3.625))).toBeGreaterThan(100);
  });

  it("agrees with the lessons' own bond engine where the two can be compared", () => {
    // On a payment date there is no part-period, so the two implementations are
    // pricing the same thing by different routes: this one through appendix B's
    // formula, the lessons' through a plain sum of discounted cash flows.
    const settlement = "2027-02-15";
    const payments = value(periodFor(NOTE, settlement)).paymentsLeft;
    const flows = couponCashFlows(100, 0.04625, payments / 2, 2);
    expect(priceCouponBondFromYTM(flows, 0.0525, 2)).toBeCloseTo(number(priceFromYield(NOTE, settlement, 5.25)), 9);
  });

  it("says so rather than answering when a price cannot come from any yield", () => {
    expect(priceFromYield(NOTE, "2026-08-17", Number.NaN)).toEqual({ reason: "Enter a yield as a percentage, such as 4.5." });
    expect(yieldFromPrice(NOTE, "2026-08-17", 0)).toEqual({ reason: "Enter the price per $100 of face value, such as 99.54." });
    expect(yieldFromPrice(NOTE, "2026-08-17", 100_000)).toMatchObject({ reason: expect.stringContaining("No yield produces that price") });
  });
});

describe("what leaves the account", () => {
  it("adds accrued interest beside the price rather than inside it", () => {
    const payment = value(paymentFor({ face: 1000, quotedPer100: 99.540696, accruedPer100: 0.025136, fee: 2 }));
    expect(payment).toEqual({ face: 1000, principal: 995.41, accrued: 0.25, fee: 2, total: 997.66 });
    // The quote alone would have said $995.41, which is the number that was short before.
    expect(payment.total - payment.principal - payment.fee).toBeCloseTo(0.25, 10);
  });

  it("keeps a budget whole: the face bought, its interest and the fee never come to more", () => {
    const within = faceWithin({ budget: 1000, quotedPer100: 99.540696, accruedPer100: 0.025136, fee: 2, step: 100, minimum: 100 });
    expect(within.face).toBe(1000);
    expect(within.payment?.total).toBe(997.66);
    expect(within.leftover).toBeCloseTo(2.34, 10);
    expect((within.payment?.total ?? 0) + within.leftover).toBeCloseTo(1000, 10);
  });

  it("buys nothing rather than less than the smallest piece on offer", () => {
    const tiny = faceWithin({ budget: 90, quotedPer100: 99.540696, accruedPer100: 0.025136, fee: 0, step: 100, minimum: 100 });
    expect(tiny).toEqual({ face: 0, payment: null, leftover: 90 });
  });

  it("steps down where rounding each part to the cent would tip the total over the budget", () => {
    // Both parts land on a half cent and round up: 99.995 of principal becomes
    // $100.00 and 0.005 of interest becomes $0.01, so the exact $100.00 the budget
    // covers is $100.01 once it is paid in cents. One lot is therefore not affordable.
    const tipped = faceWithin({ budget: 100, quotedPer100: 99.995, accruedPer100: 0.005, fee: 0, step: 100, minimum: 100 });
    expect(value(paymentFor({ face: 100, quotedPer100: 99.995, accruedPer100: 0.005 })).total).toBe(100.01);
    expect(tipped).toEqual({ face: 0, payment: null, leftover: 100 });
  });

  it("steps down when the cents would push the total over the budget", () => {
    // 995.66 of principal and interest for $1,000 of face, so $996 buys one lot and no more.
    const edge = faceWithin({ budget: 996, quotedPer100: 99.540696, accruedPer100: 0.025136, fee: 0, step: 100, minimum: 100 });
    expect(edge.face).toBe(1000);
    const overByACent = faceWithin({ budget: 995.65, quotedPer100: 99.540696, accruedPer100: 0.025136, fee: 0, step: 100, minimum: 100 });
    expect(overByACent.face).toBe(900);
    expect(overByACent.payment?.total).toBeLessThanOrEqual(995.65);
  });

  it("refuses nonsense instead of quietly making it zero", () => {
    expect(paymentFor({ face: 0, quotedPer100: 99, accruedPer100: 0 })).toEqual({ reason: "Enter the face value you would buy." });
    expect(paymentFor({ face: 1000, quotedPer100: 0, accruedPer100: 0 })).toEqual({ reason: "Enter the price per $100 of face value." });
    expect(paymentFor({ face: 1000, quotedPer100: 99, accruedPer100: -1 })).toEqual({ reason: "Accrued interest cannot be negative." });
  });
});
