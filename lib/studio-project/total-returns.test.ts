import { describe, expect, it } from "vitest";
import { cumulativeReturn, historyProblem, importMonthlyReturns, validReturnHistory, type ReturnHistory } from "./total-returns";
import { nportClassReturns } from "./nport-returns";
import histories from "./data/fund-total-returns.json";
import reports from "./data/fund-reports.json";

describe("dividends and monthly histories", () => {
  it("compounds reinvested percentages instead of adding them", () => {
    const result = importMonthlyReturns("month,total_return_pct\n2025-01,10\n2025-02,-10", false);
    expect(result.ok).toBe(true);
    if (result.ok) expect(cumulativeReturn(result.observations)).toBeCloseTo(-.01, 12);
  });
  it("uses adjusted levels once, with the preceding month as the baseline", () => {
    const csv = "month,adjusted_close\n2024-12,100\n2025-01,102\n2025-02,99";
    expect(importMonthlyReturns(csv, false).ok).toBe(false);
    const result = importMonthlyReturns(csv, true);
    if (!result.ok) throw new Error(result.error);
    expect(result.observations.map((r) => r.month)).toEqual(["2025-01", "2025-02"]);
    expect(result.observations[0].value).toBeCloseTo(.02, 12);
    expect(result.observations[1].value).toBeCloseTo(-3 / 102, 12);
    expect(cumulativeReturn(result.observations)).toBeCloseTo(-.01, 12);
  });
  it("does not create a loss from a split in a flat adjusted series", () => {
    const result = importMonthlyReturns("month,adjusted_close\n2025-01,50\n2025-02,50", true);
    expect(result).toMatchObject({ ok: true, observations: [{ month: "2025-02", value: 0 }] });
  });
  it.each([
    "month,close\n2025-01,98",
    "month,adjusted_close,dividend\n2025-01,98,2",
    "month,total_return_pct\n2025-01,",
    "month,total_return_pct\n2025-01,-100",
    "month,total_return_pct\n2025-01,2\n2025-03,3",
    "month,total_return_pct\n2025-01,2\n2025-01,3",
    "month,total_return_pct\n2025-02,2\n2025-01,3",
    "month,total_return_pct\n2025-13,2",
    "month,total_return_pct\n2025-01,Infinity",
    "month,adjusted_close\n2025-01,0\n2025-02,100",
    "month,adjusted_close\n2025-01,100",
    "month,total_return_pct\n2025-01,1e308\n2025-02,1e308",
  ])("refuses an ambiguous or unusable history: %s", (csv) => {
    expect(importMonthlyReturns(csv, true).ok).toBe(false);
  });
  it("accepts spreadsheet BOM, CRLF and quoted values without changing units", () => {
    expect(importMonthlyReturns('\uFEFF"month","total_return_pct"\r\n"2025-01","2"\r\n', false)).toMatchObject({ ok: true, observations: [{ month: "2025-01", value: .02 }] });
  });
  it("matches the exact share class and dates a quarter that crosses a year", () => {
    const xml = '<seriesId>S1</seriesId><repPdDate>2025-01-31</repPdDate><monthlyTotReturn classId="C-other" rtn1="9" rtn2="9" rtn3="9"/><monthlyTotReturn classId="C1" rtn1="1" rtn2="-2" rtn3="3"/>';
    expect(nportClassReturns(xml, "S1", "C1")).toEqual([{ month: "2024-11", value: .01 }, { month: "2024-12", value: -.02 }, { month: "2025-01", value: .03 }]);
    expect(nportClassReturns(xml, "S2", "C1")).toEqual([]);
    expect(() => nportClassReturns(xml, "S1", "missing")).toThrow();
    expect(() => nportClassReturns(xml + '<monthlyTotReturn classId="C1" rtn1="1" rtn2="2" rtn3="3"/>', "S1", "C1")).toThrow();
  });
  it.each(histories.histories)("independently reconciles $symbol with its annual shareholder report", (history) => {
    const report = reports.funds[history.instrumentId as "vti" | "voo" | "vxus"];
    expect(history.classId).toBe(report.classId);
    expect(historyProblem(history.observations)).toBeNull();
    const year = report.extract.returns.periods[0];
    const rows = history.observations.filter((r) => r.month >= year.start.slice(0, 7) && r.month <= year.end.slice(0, 7));
    expect(rows).toHaveLength(12);
    // Annual report rounds to 0.01 percentage point; monthly input has its own reporting precision.
    expect(Math.abs(cumulativeReturn(rows)! - year.value)).toBeLessThan(.00005);
    expect(history.observations.every((r) => history.sources.some((s) => s.accession === r.accession && /^[a-f0-9]{64}$/.test(s.sha256)))).toBe(true);
  });
  it("validates restored histories and rejects unsafe links or missing months", () => {
    const record: ReturnHistory = { id: "r", instrumentId: "aapl", sourceName: "Local source", sourceUrl: "", currency: "USD", basis: "market-price", method: "reported-total-return", importedAt: "2026-09-20T00:00:00.000Z", observations: [{ month: "2025-01", value: .02 }] };
    expect(validReturnHistory(record)).toBe(true);
    expect(validReturnHistory({ ...record, sourceUrl: "javascript:alert(1)" })).toBe(false);
    expect(validReturnHistory({ ...record, sourceUrl: "https://" })).toBe(false);
    expect(validReturnHistory({ ...record, observations: [...record.observations, { month: "2025-03", value: 0 }] })).toBe(false);
  });
});
