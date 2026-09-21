import { describe, expect, it } from "vitest";
import {
  equityFromFirm,
  firmValue,
  firmValueAtPrice,
  impliedGrowth,
  isValued,
  sensitivity,
  type GrowthInputs,
} from "./valuation";

/**
 * The stable-growth model, against the figures the course audit already
 * verified independently.
 *
 * `docs/source-audits/damodaran-session-5-valuation-basics.md` §"Independently
 * verified calculations" works the same business four ways — 120 of after-tax
 * profit, a 10% cost of capital, growth bought at 8%, 10% and 12% returns on
 * capital — and every expected number below is taken from there rather than
 * from this module. They are in millions, as that audit states.
 */

const BASE: GrowthInputs = { nopat: 120, returnOnNewCapital: 0.1, costOfCapital: 0.1, growth: 0 };
const value = <T>(outcome: T | { reason: string }): T => {
  if (!isValued(outcome)) throw new Error(`refused: ${outcome.reason}`);
  return outcome;
};
const number = (outcome: number | { reason: string }): number => {
  if (typeof outcome !== "number") throw new Error(`refused: ${outcome.reason}`);
  return outcome;
};

describe("the whole business", () => {
  it("values a business that is standing still at its profit over the cost of capital", () => {
    // 120 ÷ 0.10 = 1,200.
    expect(value(firmValue(BASE)).value).toBeCloseTo(1200, 10);
    expect(value(firmValue(BASE)).reinvestmentRate).toBe(0);
    expect(value(firmValue(BASE)).cashFlow).toBe(120);
  });

  it("makes growth pay for itself, so growth at the cost of capital changes nothing", () => {
    // 2% growth bought at a 10% return: 20% of profit goes back, 96 is left, 96 ÷ 0.08 = 1,200.
    const slow = value(firmValue({ ...BASE, growth: 0.02 }));
    expect(slow.reinvestmentRate).toBeCloseTo(0.2, 12);
    expect(slow.cashFlow).toBeCloseTo(96, 12);
    expect(slow.value).toBeCloseTo(1200, 10);

    // 4% growth bought at the same return: 40% goes back, 72 is left, 72 ÷ 0.06 = 1,200.
    const faster = value(firmValue({ ...BASE, growth: 0.04 }));
    expect(faster.cashFlow).toBeCloseTo(72, 12);
    expect(faster.value).toBeCloseTo(1200, 10);
    expect(faster.growthEffect).toBe("neither");
  });

  it("loses value to growth bought below the cost of capital and gains it above", () => {
    // 4% at an 8% return: half the profit goes back, 60 is left, 60 ÷ 0.06 = 1,000.
    const poor = value(firmValue({ ...BASE, growth: 0.04, returnOnNewCapital: 0.08 }));
    expect(poor.reinvestmentRate).toBeCloseTo(0.5, 12);
    expect(poor.value).toBeCloseTo(1000, 10);
    expect(poor.growthEffect).toBe("removes");

    // 4% at a 12% return: a third goes back, 80 is left, 80 ÷ 0.06 = 1,333.33.
    const good = value(firmValue({ ...BASE, growth: 0.04, returnOnNewCapital: 0.12 }));
    expect(good.reinvestmentRate).toBeCloseTo(1 / 3, 12);
    expect(good.value).toBeCloseTo(1333.3333333, 6);
    expect(good.growthEffect).toBe("adds");
  });

  it("refuses the assumptions that have no answer, and says which", () => {
    expect(firmValue({ ...BASE, growth: 0.1 })).toMatchObject({ reason: expect.stringContaining("at or above its cost of capital") });
    expect(firmValue({ ...BASE, growth: 0.12 })).toMatchObject({ reason: expect.stringContaining("at or above its cost of capital") });
    expect(firmValue({ ...BASE, returnOnNewCapital: 0 })).toMatchObject({ reason: expect.stringContaining("return on new money") });
    expect(firmValue({ ...BASE, nopat: -10 })).toMatchObject({ reason: expect.stringContaining("operating profit") });
    expect(firmValue({ ...BASE, growth: -0.01 })).toMatchObject({ reason: expect.stringContaining("cannot shrink") });
    // Growth above the return on capital eats more than the business earns.
    expect(firmValue({ ...BASE, growth: 0.09, returnOnNewCapital: 0.05 })).toMatchObject({
      reason: expect.stringContaining("put back more than it earns"),
    });
  });
});

describe("from the whole business to one share", () => {
  it("pays the lenders, keeps the cash, and divides what is left", () => {
    // The audit's own case: no debt, so equity is the whole 1,200 and each of 100 shares is $12.
    const noDebt = value(equityFromFirm({ firmValue: 1200, debt: 0, cash: 0, shares: 100 }));
    expect(noDebt.equityValue).toBe(1200);
    expect(noDebt.perShare).toBe(12);

    const geared = value(equityFromFirm({ firmValue: 1200, debt: 300, cash: 100, shares: 100 }));
    expect(geared.netDebt).toBe(200);
    expect(geared.equityValue).toBe(1000);
    expect(geared.perShare).toBe(10);
    // The bridge reconciles both ways, which is the check a learner can repeat.
    expect(geared.equityValue + geared.netDebt).toBe(1200);
  });

  it("puts five company shares behind one receipt, as TSMC's depositary shares do", () => {
    const listed = value(equityFromFirm({ firmValue: 1200, debt: 0, cash: 0, shares: 100, sharesPerReceipt: 5 }));
    expect(listed.perShare).toBe(12);
    expect(listed.perReceipt).toBe(60);
    // And a price quoted for a receipt is worth five shares of the business.
    expect(number(firmValueAtPrice({ price: 60, shares: 100, debt: 0, cash: 0, sharesPerReceipt: 5 }))).toBe(1200);
    expect(number(firmValueAtPrice({ price: 12, shares: 100, debt: 0, cash: 0 }))).toBe(1200);
  });

  it("keeps the units the filing uses, so a figure in dollars and a share count give dollars a share", () => {
    const filed = value(equityFromFirm({ firmValue: 1_200_000_000, debt: 0, cash: 0, shares: 100_000_000 }));
    expect(filed.perShare).toBe(12);
  });

  it("says there is nothing left rather than showing a negative share price", () => {
    expect(equityFromFirm({ firmValue: 1200, debt: 1500, cash: 0, shares: 100 })).toMatchObject({
      reason: expect.stringContaining("nothing left for the shares"),
    });
    expect(equityFromFirm({ firmValue: 1200, debt: 0, cash: 0, shares: 0 })).toMatchObject({
      reason: expect.stringContaining("number of shares"),
    });
  });
});

describe("what a price is asking for", () => {
  it("finds the growth that would justify it, and gets back to the same value", () => {
    const whole = value(firmValue({ ...BASE, growth: 0.03, returnOnNewCapital: 0.12 }));
    const asked = number(impliedGrowth({ firmValue: whole.value, nopat: 120, returnOnNewCapital: 0.12, costOfCapital: 0.1 }));
    expect(asked).toBeCloseTo(0.03, 12);
  });

  it("reads the audit's own 1,000 case backwards as the 4% growth that produced it", () => {
    // 4% growth bought at an 8% return, against a 10% cost of capital, is worth 1,000.
    const asked = number(impliedGrowth({ firmValue: 1000, nopat: 120, returnOnNewCapital: 0.08, costOfCapital: 0.1 }));
    expect(asked).toBeCloseTo(0.04, 12);
  });

  it("reads a price above what a value-destroying business is worth as asking it to shrink", () => {
    // Growing at an 8% return costs this business value, so 1,300 — above the 1,200 it is
    // worth standing still — can only be explained by it getting smaller.
    const asked = number(impliedGrowth({ firmValue: 1300, nopat: 120, returnOnNewCapital: 0.08, costOfCapital: 0.1 }));
    expect(asked).toBeCloseTo(-0.05, 12);
  });

  it("gets as close to the cost of capital as the price asks, without ever reaching it", () => {
    const steep = number(impliedGrowth({ firmValue: 100_000, nopat: 120, returnOnNewCapital: 0.12, costOfCapital: 0.1 }));
    expect(steep).toBeGreaterThan(0.099);
    expect(steep).toBeLessThan(0.1);
  });

  it("refuses a price the model cannot reach, and says which way growth runs", () => {
    // Growth adds value here, so nothing explains a price below the standing-still 1,200.
    expect(impliedGrowth({ firmValue: 900, nopat: 120, returnOnNewCapital: 0.12, costOfCapital: 0.1 })).toMatchObject({
      reason: expect.stringContaining("adds to"),
    });
    // And where new money earns exactly what it costs, growth explains nothing at all.
    expect(impliedGrowth({ firmValue: 900, nopat: 120, returnOnNewCapital: 0.1, costOfCapital: 0.1 })).toMatchObject({
      reason: expect.stringContaining("changes nothing"),
    });
    expect(impliedGrowth({ firmValue: 0, nopat: 120, returnOnNewCapital: 0.12, costOfCapital: 0.1 })).toMatchObject({
      reason: expect.stringContaining("does not put a value"),
    });
  });

  it("works the whole business back from a share price, lenders and cash included", () => {
    // $10 a share for 100 shares is 1,000 of equity; add 300 of debt and take out 100 of cash.
    expect(number(firmValueAtPrice({ price: 10, shares: 100, debt: 300, cash: 100 }))).toBe(1200);
  });
});

describe("the grid of assumptions", () => {
  const base = { nopat: 120, returnOnNewCapital: 0.12, debt: 0, cash: 0, shares: 100 };

  it("rises with growth where new money earns more than it costs", () => {
    const [slow, medium, fast] = sensitivity(base, [0, 0.02, 0.04], [0.1]).map((row) => row[0]);
    expect(slow).toBeCloseTo(12, 10);
    expect(medium as number).toBeGreaterThan(slow as number);
    expect(fast as number).toBeGreaterThan(medium as number);
  });

  it("falls with growth where it earns less, and stays flat where it earns exactly its cost", () => {
    const poor = sensitivity({ ...base, returnOnNewCapital: 0.08 }, [0, 0.02, 0.04], [0.1]).map((row) => row[0]);
    expect(poor[1] as number).toBeLessThan(poor[0] as number);
    expect(poor[2] as number).toBeLessThan(poor[1] as number);

    const neutral = sensitivity({ ...base, returnOnNewCapital: 0.1 }, [0, 0.02, 0.04], [0.1]).map((row) => row[0]);
    expect(neutral[1]).toBeCloseTo(neutral[0] as number, 10);
    expect(neutral[2]).toBeCloseTo(neutral[0] as number, 10);
  });

  it("falls as the cost of capital rises, and leaves a cell empty where there is no answer", () => {
    const grid = sensitivity(base, [0.04, 0.09], [0.08, 0.1, 0.12]);
    expect(grid[0][0] as number).toBeGreaterThan(grid[0][1] as number);
    expect(grid[0][1] as number).toBeGreaterThan(grid[0][2] as number);
    // Growing at 9% costs more than the business earns when money costs 8%.
    expect(grid[1][0]).toBeNull();
  });
});
