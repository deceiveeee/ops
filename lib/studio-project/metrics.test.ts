import { describe, expect, it } from "vitest";
import {
  effectiveTaxRate,
  freeCashFlow,
  grossMargin,
  grossProfit,
  isAvailable,
  isResolved,
  latestAnnualPeriod,
  PRIMITIVE_CONCEPTS,
  resolvePrimitive,
  sectorFromSic,
  totalRevenue,
  type CompanyFacts,
  type XbrlFact,
} from "./metrics";

/**
 * The figures below are real, taken from SEC XBRL company facts, which are
 * public domain. They are reproduced here because each one is a trap that this
 * module exists to avoid, and a fabricated number would not prove that.
 *
 *   Fifth Third Bancorp, CIK 0000035527: net interest income 5,982,000,000 and
 *     noninterest income 3,035,000,000 for 2025-12-31 (accession
 *     0000035527-26-000124); contract revenue 577,000,000 for 2023-12-31
 *     (accession 0000035527-24-000088).
 *   Costco, CIK 0000909832: revenue 275,235,000,000 and cost of goods
 *     239,886,000,000 for 2025-08-31 (accession 0000909832-25-000101).
 *   NVIDIA, CIK 0001045810: revenue 215,938,000,000 and payments to acquire
 *     productive assets 6,042,000,000 for 2026-01-25 (accession
 *     0001045810-26-000021).
 *
 * Sums are computed by hand, not by the code under test:
 *   5,982,000,000 + 3,035,000,000 = 9,017,000,000
 *   275,235,000,000 − 239,886,000,000 = 35,349,000,000
 */

const fact = (over: Partial<XbrlFact> & Pick<XbrlFact, "end" | "val">): XbrlFact => ({
  form: "10-K",
  filed: "2026-02-01",
  accn: "0000000000-26-000001",
  start: new Date(Date.parse(over.end) - 365 * 86_400_000).toISOString().slice(0, 10),
  ...over,
});

const company = (concepts: Record<string, XbrlFact[]>, entityName = "Fixture Corp"): CompanyFacts => ({
  cik: 1,
  entityName,
  facts: {
    "us-gaap": Object.fromEntries(Object.entries(concepts).map(([name, rows]) => [name, { units: { USD: rows } }])),
  },
});

describe("which kind of company this is", () => {
  it("maps SIC to the accounting shape that decides the statements", () => {
    expect(sectorFromSic(6022)).toBe("banking"); // Fifth Third, state commercial bank
    expect(sectorFromSic(6331)).toBe("insurance"); // Progressive
    expect(sectorFromSic(6798)).toBe("real-estate"); // Prologis, a REIT
    expect(sectorFromSic(4911)).toBe("utility"); // NextEra
    expect(sectorFromSic(4011)).toBe("transport"); // Union Pacific
    expect(sectorFromSic(2911)).toBe("extractive"); // Exxon, petroleum refining
    expect(sectorFromSic(7372)).toBe("general"); // Microsoft
  });

  it("splits telecom from transport, because they file differently", () => {
    // Both sit in the 4000s. Verizon reports a cost of revenue and Union Pacific
    // does not, so the boundary runs between them rather than around the division.
    expect(sectorFromSic(4813)).toBe("general"); // Verizon
    expect(sectorFromSic(4011)).toBe("transport"); // Union Pacific
  });

  it("falls back to general rather than guessing on an unusable code", () => {
    expect(sectorFromSic("")).toBe("general");
    expect(sectorFromSic("not a code")).toBe("general");
  });
});

describe("refusing a stale number", () => {
  const nvidia = company({
    Assets: [fact({ end: "2026-01-25", val: 200_000_000_000 })],
    // The concept NVIDIA used to use, last filed for the 2012 fiscal year.
    PaymentsToAcquirePropertyPlantAndEquipment: [fact({ end: "2012-01-29", val: 200_000_000 })],
    // The one it uses now.
    PaymentsToAcquireProductiveAssets: [fact({ end: "2026-01-25", val: 6_042_000_000 })],
  });

  it("passes over the preferred concept when it does not cover the period", () => {
    const capex = resolvePrimitive(nvidia, "capitalExpenditure", "general", "2026-01-25");
    expect(isResolved(capex)).toBe(true);
    if (!isResolved(capex)) return;

    // Preference order would have chosen the first concept. Fourteen years of
    // staleness outranks preference.
    expect(capex.concept).toBe("PaymentsToAcquireProductiveAssets");
    expect(capex.value).toBe(6_042_000_000);
    expect(capex.periodEnd).toBe("2026-01-25");
  });

  it("says a concept exists but stopped, rather than that nothing was reported", () => {
    const verizonish = company({
      Assets: [fact({ end: "2025-12-31", val: 380_000_000_000 })],
      PaymentsToAcquireProductiveAssets: [fact({ end: "2018-12-31", val: 17_000_000_000 })],
    });
    const capex = resolvePrimitive(verizonish, "capitalExpenditure", "general", "2025-12-31");

    expect(isResolved(capex)).toBe(false);
    if (isResolved(capex)) return;
    expect(capex.reason).toBe("no concept covers this period");
    expect(capex.staleAt).toBe("2018-12-31");
    expect(capex.tried).toContain("PaymentsToAcquirePropertyPlantAndEquipment");
  });

  it("distinguishes never-reported from stopped-reporting", () => {
    const never = company({ Assets: [fact({ end: "2025-12-31", val: 1_000 })] });
    const capex = resolvePrimitive(never, "capitalExpenditure", "utility", "2025-12-31");
    expect(isResolved(capex)).toBe(false);
    if (isResolved(capex)) return;
    expect(capex.reason).toBe("not reported");
    expect(capex.staleAt).toBeUndefined();
  });

  it("takes the most recently filed version of a restated period", () => {
    const restated = company({
      Assets: [fact({ end: "2025-12-31", val: 500 })],
      NetIncomeLoss: [
        fact({ end: "2025-12-31", val: 100, filed: "2026-02-01", accn: "0000000000-26-000001" }),
        fact({ end: "2025-12-31", val: 92, filed: "2026-11-01", accn: "0000000000-26-000900" }),
      ],
    });
    const income = resolvePrimitive(restated, "netIncome", "general", "2025-12-31");
    expect(isResolved(income)).toBe(true);
    if (!isResolved(income)) return;
    expect(income.value).toBe(92);
    expect(income.accession).toBe("0000000000-26-000900");
  });
});

describe("a bank's revenue", () => {
  // Fifth Third's real figures, including the concept that produces the trap.
  const fifthThird = company({
    Assets: [fact({ end: "2025-12-31", val: 213_000_000_000 })],
    RevenueFromContractWithCustomerIncludingAssessedTax: [
      fact({ end: "2023-12-31", val: 577_000_000, accn: "0000035527-24-000088" }),
    ],
    InterestIncomeExpenseNet: [fact({ end: "2025-12-31", val: 5_982_000_000, accn: "0000035527-26-000124" })],
    NoninterestIncome: [fact({ end: "2025-12-31", val: 3_035_000_000, accn: "0000035527-26-000124" })],
  });

  it("is net interest income plus fee income, not whatever concept resolves", () => {
    const revenue = totalRevenue(fifthThird, "banking", "2025-12-31");
    expect(isAvailable(revenue)).toBe(true);
    if (!isAvailable(revenue)) return;

    // 5,982,000,000 + 3,035,000,000, added by hand.
    expect(revenue.value).toBe(9_017_000_000);
    expect(revenue.how).toBe("derived");
    expect(revenue.from.map((f) => f.concept).sort()).toEqual(["InterestIncomeExpenseNet", "NoninterestIncome"]);
  });

  it("never returns the contract-revenue figure, which is the trap", () => {
    const revenue = totalRevenue(fifthThird, "banking", "2025-12-31");
    if (!isAvailable(revenue)) throw new Error("expected a value");

    // $577M is a fee subset from two years earlier. It is wrong by about
    // fifteen times, it is populated, and nothing about it looks wrong.
    expect(revenue.value).not.toBe(577_000_000);
    expect(revenue.from.some((f) => f.concept.startsWith("RevenueFromContractWithCustomer"))).toBe(false);
    expect(PRIMITIVE_CONCEPTS.revenue.bySector?.banking).not.toContain(
      "RevenueFromContractWithCustomerIncludingAssessedTax",
    );
  });

  it("would have returned it had the sector been read wrong", () => {
    // The same facts, read as an ordinary company. This is what the defect
    // looks like, so the contrast is demonstrated rather than asserted.
    const asGeneral = totalRevenue(fifthThird, "general", "2023-12-31");
    expect(isAvailable(asGeneral)).toBe(true);
    if (!isAvailable(asGeneral)) return;
    expect(asGeneral.value).toBe(577_000_000);
  });

  it("reports what is missing rather than half a sum", () => {
    const partial = company({
      Assets: [fact({ end: "2025-12-31", val: 1_000 })],
      InterestIncomeExpenseNet: [fact({ end: "2025-12-31", val: 5_982_000_000 })],
    });
    const revenue = totalRevenue(partial, "banking", "2025-12-31");
    expect(isAvailable(revenue)).toBe(false);
    if (isAvailable(revenue)) return;
    expect(revenue.missing.map((m) => m.primitive)).toEqual(["noninterestIncome"]);
  });

  it("keeps bank-only concepts away from companies that are not banks", () => {
    // Pfizer reports InterestIncomeExpenseNet, last in 2013, where it means
    // something entirely different.
    const pfizerish = company({
      Assets: [fact({ end: "2025-12-31", val: 213_000_000_000 })],
      InterestIncomeExpenseNet: [fact({ end: "2013-12-31", val: -1_010_000_000 })],
    });
    const nii = resolvePrimitive(pfizerish, "netInterestIncome", "general", "2025-12-31");
    expect(isResolved(nii)).toBe(false);
    if (isResolved(nii)) return;
    expect(nii.reason).toBe("not applicable to this kind of company");
    expect(nii.tried).toEqual([]);
  });
});

describe("gross profit", () => {
  // Costco stopped tagging GrossProfit after 2019 but still reports both parts.
  const costco = company({
    Assets: [fact({ end: "2025-08-31", val: 75_000_000_000 })],
    GrossProfit: [fact({ end: "2019-09-01", val: 23_000_000_000 })],
    RevenueFromContractWithCustomerExcludingAssessedTax: [
      fact({ end: "2025-08-31", val: 275_235_000_000, accn: "0000909832-25-000101" }),
    ],
    CostOfGoodsAndServicesSold: [fact({ end: "2025-08-31", val: 239_886_000_000, accn: "0000909832-25-000101" })],
  });

  it("is derived from the parts when the subtotal is no longer tagged", () => {
    const profit = grossProfit(costco, "general", "2025-08-31");
    expect(isAvailable(profit)).toBe(true);
    if (!isAvailable(profit)) return;

    // 275,235,000,000 − 239,886,000,000, subtracted by hand.
    expect(profit.value).toBe(35_349_000_000);
    expect(profit.how).toBe("derived");
    // Emphatically not the 2019 subtotal that is still sitting in the facts.
    expect(profit.value).not.toBe(23_000_000_000);
  });

  it("gives a margin a learner can check against the shelf price", () => {
    const margin = grossMargin(costco, "general", "2025-08-31");
    expect(isAvailable(margin)).toBe(true);
    if (!isAvailable(margin)) return;
    // 35,349 / 275,235 = 12.84%. A warehouse club runs on a thin gross margin,
    // which is the point of the business and visible in one number.
    expect(margin.value).toBeCloseTo(0.1284, 4);
  });

  it("prefers the reported subtotal when it covers the period", () => {
    const reported = company({
      Assets: [fact({ end: "2025-12-31", val: 100 })],
      GrossProfit: [fact({ end: "2025-12-31", val: 676_000_000 })],
      RevenueFromContractWithCustomerExcludingAssessedTax: [fact({ end: "2025-12-31", val: 2_850_000_000 })],
      CostOfGoodsAndServicesSold: [fact({ end: "2025-12-31", val: 2_174_000_000 })],
    });
    const profit = grossProfit(reported, "general", "2025-12-31");
    if (!isAvailable(profit)) throw new Error("expected a value");
    expect(profit.how).toBe("reported");
    expect(profit.value).toBe(676_000_000);
  });

  it("says it is undefined for a bank, not that data is missing", () => {
    const bank = company({ Assets: [fact({ end: "2025-12-31", val: 213_000_000_000 })] });
    const profit = grossProfit(bank, "banking", "2025-12-31");
    expect(isAvailable(profit)).toBe(false);
    if (isAvailable(profit)) return;
    expect(profit.reason).toContain("not defined");
    expect(profit.reason).toContain("a bank");
  });

  it.each(["banking", "insurance", "real-estate", "transport", "utility"] as const)(
    "says the same for a %s company, which reports no cost of revenue",
    (sector) => {
      const facts = company({ Assets: [fact({ end: "2025-12-31", val: 1_000 })] });
      const profit = grossProfit(facts, sector, "2025-12-31");
      expect(isAvailable(profit)).toBe(false);
      if (isAvailable(profit)) return;
      expect(profit.reason).toContain("not defined");
    },
  );
});

describe("free cash flow", () => {
  it("refuses rather than treating absent capital spending as none", () => {
    // NextEra's case: operating cash flow is reported, cash capital spending is
    // not tagged under any standard concept. Reading capex as zero would turn a
    // utility's free cash flow into its operating cash flow.
    const nextera = company({
      Assets: [fact({ end: "2025-12-31", val: 200_000_000_000 })],
      NetCashProvidedByUsedInOperatingActivities: [fact({ end: "2025-12-31", val: 13_000_000_000 })],
      CapitalExpendituresIncurredButNotYetPaid: [fact({ end: "2025-12-31", val: 7_640_000_000 })],
    });
    const fcf = freeCashFlow(nextera, "utility", "2025-12-31");

    expect(isAvailable(fcf)).toBe(false);
    if (isAvailable(fcf)) return;
    expect(fcf.missing.map((m) => m.primitive)).toEqual(["capitalExpenditure"]);
    // The accrual disclosure is never mistaken for cash spending.
    expect(PRIMITIVE_CONCEPTS.capitalExpenditure.default).not.toContain("CapitalExpendituresIncurredButNotYetPaid");
  });

  it("subtracts capital spending from operating cash flow", () => {
    const operating = company({
      Assets: [fact({ end: "2025-12-31", val: 100 })],
      NetCashProvidedByUsedInOperatingActivities: [fact({ end: "2025-12-31", val: 51_970_000_000 })],
      PaymentsToAcquirePropertyPlantAndEquipment: [fact({ end: "2025-12-31", val: 28_360_000_000 })],
    });
    const fcf = freeCashFlow(operating, "extractive", "2025-12-31");
    if (!isAvailable(fcf)) throw new Error("expected a value");
    expect(fcf.value).toBe(23_610_000_000); // 51,970 − 28,360
    expect(fcf.from.map((f) => f.primitive)).toEqual(["cashFromOperations", "capitalExpenditure"]);
  });

  it.each(["banking", "insurance"] as const)("is not a meaningful measure for a %s company", (sector) => {
    // It would compute. Operating cash flow for a bank is balance-sheet
    // movement and its capital spending is offices, so the number would mean
    // nothing. The competition team substituted dividend yield here, and Morgan
    // Stanley's moat work excludes financials for the same reason.
    const facts = company({
      Assets: [fact({ end: "2025-12-31", val: 213_000_000_000 })],
      NetCashProvidedByUsedInOperatingActivities: [fact({ end: "2025-12-31", val: 4_514_000_000 })],
      PaymentsToAcquirePropertyPlantAndEquipment: [fact({ end: "2025-12-31", val: 584_000_000 })],
    });
    const fcf = freeCashFlow(facts, sector, "2025-12-31");
    expect(isAvailable(fcf)).toBe(false);
    if (isAvailable(fcf)) return;
    expect(fcf.reason).toContain("not a meaningful measure");
  });
});

describe("effective tax rate", () => {
  it("declines when pre-tax income is not positive", () => {
    // Atkore's latest year: a loss. A tax expense over a negative base is not a
    // rate, and printing one would invite a reader to compare it with a real one.
    const loss = company({
      Assets: [fact({ end: "2025-09-30", val: 3_000_000_000 })],
      IncomeTaxExpenseBenefit: [fact({ end: "2025-09-30", val: 8_000_000 })],
      IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest: [
        fact({ end: "2025-09-30", val: -7_000_000 }),
      ],
    });
    const rate = effectiveTaxRate(loss, "general", "2025-09-30");
    expect(isAvailable(rate)).toBe(false);
    if (isAvailable(rate)) return;
    expect(rate.reason).toContain("not positive");
  });

  it("divides tax by pre-tax income when both are there", () => {
    const profitable = company({
      Assets: [fact({ end: "2026-06-30", val: 100 })],
      IncomeTaxExpenseBenefit: [fact({ end: "2026-06-30", val: 25_000 })],
      IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest: [
        fact({ end: "2026-06-30", val: 100_000 }),
      ],
    });
    const rate = effectiveTaxRate(profitable, "general", "2026-06-30");
    if (!isAvailable(rate)) throw new Error("expected a value");
    expect(rate.value).toBe(0.25);
  });
});

describe("finding the period to ask about", () => {
  it("anchors on a concept every filer reports", () => {
    const facts = company({
      Assets: [fact({ end: "2024-12-31", val: 90 }), fact({ end: "2025-12-31", val: 100 })],
    });
    expect(latestAnnualPeriod(facts)).toBe("2025-12-31");
  });

  it("returns nothing rather than a guess when there is no anchor", () => {
    expect(latestAnnualPeriod(company({}))).toBeNull();
  });
});
