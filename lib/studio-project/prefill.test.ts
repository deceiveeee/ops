import { describe, expect, it } from "vitest";
import { figuresFromFacts, periodToRead, type MissingFigure, type Prefill, type SuppliedFigure } from "./prefill";
import { sectorFromSic, type CompanyFacts } from "./metrics";
import atkoreFacts from "./__fixtures__/atkore-facts.json";
import costcoFacts from "./__fixtures__/costco-facts.json";
import exxonFacts from "./__fixtures__/exxon-facts.json";
import verizonFacts from "./__fixtures__/verizon-facts.json";

/**
 * These fixtures are real filings, trimmed to the concepts prefill reads.
 *
 * Every expected number below was read out of the company's own company-facts
 * payload and, for the sums, worked out by hand before the code produced it —
 * which is how the three debt defects on 2026-09-11 were caught. Inventing the
 * numbers would have made all three tests pass against the broken code.
 */

const facts = (json: unknown) => json as unknown as CompanyFacts;

function run(json: unknown, sic: string): Prefill {
  const company = facts(json);
  const period = periodToRead(company);
  expect(period).not.toBeNull();
  return figuresFromFacts(company, sectorFromSic(sic), period!);
}

const supplied = (result: Prefill, key: string): SuppliedFigure => {
  const found = result.supplied.find((figure) => figure.key === key);
  if (!found) throw new Error(`${key} was not supplied; missing: ${result.missing.map((m) => m.key).join(", ")}`);
  return found;
};

const missing = (result: Prefill, key: string): MissingFigure => {
  const found = result.missing.find((figure) => figure.key === key);
  if (!found) throw new Error(`${key} was supplied, and should not have been`);
  return found;
};

describe("all seven from one filing", () => {
  it("reads Atkore's year to 30 September 2025, each figure carrying its filing", () => {
    const result = run(atkoreFacts, "3690");

    expect(result.periodEnd).toBe("2025-09-30");
    expect(result.missing).toEqual([]);
    expect(result.supplied.map((figure) => figure.key).sort()).toEqual(
      ["cash", "equity", "operatingProfit", "pretaxProfit", "revenue", "taxExpense", "totalDebt"],
    );

    // Read from Atkore's FY2025 10-K, accession 0001628280-25-054049.
    expect(supplied(result, "revenue").value).toBe(2_850_378_000);
    expect(supplied(result, "operatingProfit").value).toBe(23_173_000);
    expect(supplied(result, "pretaxProfit").value).toBe(-18_590_000);
    expect(supplied(result, "taxExpense").value).toBe(-3_415_000);
    expect(supplied(result, "equity").value).toBe(1_398_341_000);
    expect(supplied(result, "cash").value).toBe(506_699_000);
    expect(supplied(result, "totalDebt").value).toBe(760_532_000);

    const revenue = supplied(result, "revenue");
    expect(revenue.concepts).toEqual(["RevenueFromContractWithCustomerExcludingAssessedTax"]);
    expect(revenue.periodStart).toBe("2024-10-01");
    expect(revenue.periodEnd).toBe("2025-09-30");
    expect(revenue.accession).toBe("0001628280-25-054049");
    expect(revenue.form).toBe("10-K");
    expect(revenue.filed).toBe("2025-11-26");
  });

  it("takes LongTermDebt as the whole of it, without adding the instalment twice", () => {
    // Atkore files all three: 760,532 = 756,802 noncurrent + 3,730 current.
    const debt = supplied(run(atkoreFacts, "3690"), "totalDebt");
    expect(debt.value).toBe(760_532_000);
    expect(debt.concepts).toEqual(["LongTermDebt"]);
    expect(debt.addedUp).toBeNull();
  });
});

describe("the three ways total borrowings went wrong", () => {
  it("adds the instalment due this year when only a noncurrent tag is filed", () => {
    // Costco files no LongTermDebt: 5,713m noncurrent and 75m due this year.
    // Taking the noncurrent tag alone understated its borrowings by $75m.
    const debt = supplied(run(costcoFacts, "5331"), "totalDebt");
    expect(debt.value).toBe(5_788_000_000);
    expect(debt.concepts).toEqual(["LongTermDebtNoncurrent", "LongTermDebtCurrent"]);
    expect(debt.addedUp).toBe("long-term borrowings, plus the instalment due within the year");
  });

  it("does not add short-term borrowings to a tag that already includes them", () => {
    // Verizon's combined tag is 158,150 = 139,532 + 18,177 + 441. Adding its
    // 441m of short-term borrowings on top counted that 441m twice.
    const debt = supplied(run(verizonFacts, "4813"), "totalDebt");
    expect(debt.value).toBe(158_150_000_000);
    expect(debt.concepts).toEqual(["DebtLongtermAndShorttermCombinedAmount"]);
    expect(debt.addedUp).toBeNull();
  });

  it("refuses a borrowing figure that bundles finance leases in with the debt", () => {
    // Exxon files only LongTermDebtAndCapitalLeaseObligations, which is not what
    // Investigate's box asks for. An empty box the learner fills is honest; a
    // number meaning something different from every other company's is not.
    const result = run(exxonFacts, "2911");
    const debt = missing(result, "totalDebt");
    expect(debt.reason).toContain("excludes finance leases");
    expect(debt.tried).toContain("LongTermDebt");
    expect(result.supplied.map((figure) => figure.key)).not.toContain("totalDebt");
  });
});

describe("what it declines to supply", () => {
  it("leaves operating profit empty for a company that does not tag it", () => {
    // Exxon reports no OperatingIncomeLoss. Deriving one from total costs is how
    // an operating margin gets built out of the wrong subtraction.
    const outcome = missing(run(exxonFacts, "2911"), "operatingProfit");
    expect(outcome.reason).toContain("type it in");
    expect(outcome.tried).toEqual(["OperatingIncomeLoss"]);
  });

  it("supplies nothing at all for a period the company has not filed", () => {
    const result = figuresFromFacts(facts(atkoreFacts), "general", "2099-12-31");
    expect(result.supplied).toEqual([]);
    expect(result.missing).toHaveLength(7);
    // Reported, but not for that period: the message must not say "not reported".
    expect(missing(result, "revenue").reason).toContain("2025-09-30");
  });

  it("supplies nothing for a company whose facts are under another taxonomy", () => {
    const ifrs = { cik: 1, entityName: "Foreign Issuer", facts: { "ifrs-full": {} } };
    const result = figuresFromFacts(facts(ifrs), "general", "2025-12-31");
    expect(result.supplied).toEqual([]);
    expect(result.missing).toHaveLength(7);
  });

  it("has no annual period to read when the facts hold none", () => {
    expect(periodToRead(facts({ cik: 1, entityName: "Shell", facts: { "us-gaap": {} } }))).toBeNull();
  });
});

describe("figures whose meaning depends on the kind of company", () => {
  it("names the equity tag it used, including the one that holds minority interests", () => {
    // Verizon does not tag plain StockholdersEquity for 2025, so the broader
    // concept is used. Naming it is the point: the two mean different things.
    const equity = supplied(run(verizonFacts, "4813"), "equity");
    expect(equity.value).toBe(105_741_000_000);
    expect(equity.concepts).toEqual(["StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"]);
  });

  it("every supplied figure covers the one period, never a mix of years", () => {
    for (const [json, sic] of [[atkoreFacts, "3690"], [costcoFacts, "5331"], [verizonFacts, "4813"]] as const) {
      const result = run(json, sic);
      for (const figure of result.supplied) expect(figure.periodEnd).toBe(result.periodEnd);
    }
  });
});
