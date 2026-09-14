import { describe, expect, it } from "vitest";
import {
  NO_RETURNS,
  classMatchProblems,
  excerptForClass,
  extractFundReport,
  parsePrintedNumber,
  readHeaderClasses,
  readPrintedTable,
  returnPct,
  wholeYears,
  type SecListRow,
} from "./fund-reports";

/**
 * Reading one share class's returns and costs out of its annual report.
 *
 * The figures are the real ones from the reports read on 2026-09-13
 * (docs/source-audits/studio-fund-reports.md), in instances cut down to the
 * elements that matter. Two reproduce real traps: VOO's report puts the "Net
 * Asset Value" label on its market-price series, and SGOV's tags no printed
 * table at all.
 */

const VTI = "C000007808";
const VTI_ADMIRAL = "C000007806";
const VOO = "C000092055";
const AGG = "C000012092";
const SGOV = "C000219740";

const escapeHtml = (html: string) => html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function context(id: string, classId: string, start: string, end: string, extra: Record<string, string> = {}) {
  const members = [["ClassAxis", `vif:${classId}Member`], ...Object.entries(extra).map(([axis, member]) => [axis, `oef:${member}`])]
    .map(([axis, member]) => `<xbrldi:explicitMember dimension="oef:${axis}">${member}</xbrldi:explicitMember>`)
    .join("");
  return `<context id="${id}"><entity><identifier scheme="http://www.sec.gov/CIK">0000036405</identifier><segment>${members}</segment></entity><period><startDate>${start}</startDate><endDate>${end}</endDate></period></context>`;
}

const fact = (name: string, ref: string, value: string, unit = "pure") =>
  `<${name} contextRef="${ref}" decimals="4" unitRef="${unit}">${value}</${name}>`;

function printed(headings: string[], rows: [string, string[]][]) {
  const cells = (tag: string, values: string[]) => values.map((value) => `<${tag}>${value}</${tag}>`).join("");
  return `<table><tr>${cells("th", ["Average Annual Total Returns", ...headings])}</tr>${rows
    .map(([label, values]) => `<tr>${cells("td", [label, ...values])}</tr>`)
    .join("")}</table>`;
}

type Series = { dims?: Record<string, string>; values: number[]; label?: string };

interface ClassSpec {
  classId: string;
  starts: string[];
  series: Series[];
  table?: string;
  ticker?: string;
  cost?: [number, number, string?];
  index?: number[];
}

function report(periodEnd: string, classes: ClassSpec[]) {
  const parts = [
    "<xbrl>",
    `<context id="doc"><entity><identifier scheme="http://www.sec.gov/CIK">0000036405</identifier></entity><period><startDate>2025-01-01</startDate><endDate>${periodEnd}</endDate></period></context>`,
    `<dei:DocumentPeriodEndDate contextRef="doc">${periodEnd}</dei:DocumentPeriodEndDate>`,
    `<dei:DocumentType contextRef="doc">N-CSR</dei:DocumentType>`,
  ];
  for (const spec of classes) {
    spec.series.forEach((series, n) => {
      spec.starts.forEach((start, i) => {
        const id = `${spec.classId}_s${n}_p${i}`;
        parts.push(context(id, spec.classId, start, periodEnd, series.dims));
        parts.push(fact("oef:AvgAnnlRtrPct", id, String(series.values[i])));
        if (i === 0 && series.label) parts.push(fact("oef:LineGraphAndTableMeasureName", id, series.label));
      });
    });
    spec.index?.forEach((value, i) => {
      const id = `${spec.classId}_index_p${i}`;
      parts.push(context(id, spec.classId, spec.starts[i], periodEnd, { BroadBasedIndexAxis: "CRSPUSTotalMarketIndexMember" }));
      parts.push(fact("oef:AvgAnnlRtrPct", id, String(value)));
    });
    const year = `${spec.classId}_year`;
    parts.push(context(year, spec.classId, spec.starts[0], periodEnd));
    if (spec.table) parts.push(fact("oef:AvgAnnlRtrTableTextBlock", year, escapeHtml(spec.table)));
    if (spec.ticker) parts.push(fact("dei:TradingSymbol", year, spec.ticker));
    if (spec.cost) {
      parts.push(fact("oef:ExpenseRatioPct", year, String(spec.cost[0])));
      parts.push(fact("oef:ExpensesPaidAmt", year, String(spec.cost[1]), spec.cost[2] ?? "USD"));
    }
    parts.push(fact("oef:PerformancePastDoesNotIndicateFuture", year, "Past performance is not an indication of future results."));
  }
  parts.push("</xbrl>");
  return parts.join("\n");
}

const CALENDAR_2025 = ["2025-01-01", "2021-01-01", "2016-01-01"];
const WITHOUT_LOAD = { SalesLoadAxis: "WithoutSalesLoadMember" };
const HEADINGS = ["1 Year", "5 Years", "10 Years"];

/** VTI's report: net asset value untagged, market price on the sales-load axis, labels where they belong. */
const vtiClass = (overrides: Partial<ClassSpec> = {}): ClassSpec => ({
  classId: VTI,
  starts: CALENDAR_2025,
  series: [
    { values: [0.1714, 0.1308, 0.1425], label: "ETF Shares Net Asset Value" },
    { dims: WITHOUT_LOAD, values: [0.171, 0.1306, 0.1425], label: "ETF Shares Market Price" },
  ],
  table: printed(HEADINGS, [
    ["ETF Shares Net Asset Value", ["17.14%", "13.08%", "14.25%"]],
    ["ETF Shares Market Price", ["17.10%", "13.06%", "14.25%"]],
    ["CRSP US Total Market Index", ["17.15%", "13.08%", "14.25%"]],
  ]),
  index: [0.1715, 0.1308, 0.1425],
  ticker: "VTI",
  cost: [0.0003, 3],
  ...overrides,
});

const admiralClass: ClassSpec = {
  classId: VTI_ADMIRAL,
  starts: CALENDAR_2025,
  series: [{ values: [0.1713, 0.1307, 0.1424], label: "Admiral Shares" }],
  table: printed(HEADINGS, [["Admiral Shares", ["17.13%", "13.07%", "14.24%"]]]),
  ticker: "VTSAX",
  cost: [0.0004, 4],
};

const values = (periods: { value: number }[]) => periods.map((period) => period.value);

describe("which return series is the fund's own", () => {
  it("takes the row the report prints as net asset value, for this share class only", () => {
    const extract = extractFundReport(report("2025-12-31", [admiralClass, vtiClass()]), VTI);
    if (!extract.returns.found) throw new Error(extract.returns.reason);
    expect(extract.returns.checkedAgainst).toBe("printed table");
    expect(extract.returns.label).toBe("ETF Shares Net Asset Value");
    expect(values(extract.returns.periods)).toEqual([0.1714, 0.1308, 0.1425]);
    expect(extract.returns.periods.map((period) => period.years)).toEqual([1, 5, 10]);
    expect(extract.returns.others).toEqual([
      { label: "ETF Shares Market Price", periods: expect.any(Array) },
    ]);
    expect(extract.returns.labelConflict).toBeNull();
    expect(extract.tradingSymbols).toEqual(["VTI"]);
    expect(extract.costs).toEqual({ found: true, start: "2025-01-01", end: "2025-12-31", paidPer10000Usd: 3, ratio: 0.0003 });
  });

  it("follows the printed table when the data file labels the other series net asset value, and says so", () => {
    // VOO, as filed: the untagged series is the market price, and carries the NAV label.
    const voo = vtiClass({
      classId: VOO,
      ticker: "VOO",
      series: [
        { values: [0.1782, 0.1438, 0.1478], label: "ETF Shares Net Asset Value" },
        { dims: WITHOUT_LOAD, values: [0.1784, 0.1438, 0.1478] },
      ],
      table: printed(HEADINGS, [
        ["ETF Shares Net Asset Value", ["17.84%", "14.38%", "14.78%"]],
        ["ETF Shares Market Price", ["17.82%", "14.38%", "14.78%"]],
      ]),
      index: undefined,
    });
    const extract = extractFundReport(report("2025-12-31", [voo]), VOO);
    if (!extract.returns.found) throw new Error(extract.returns.reason);
    expect(values(extract.returns.periods)).toEqual([0.1784, 0.1438, 0.1478]);
    expect(extract.returns.labelConflict).toBe(
      'The data file labels another series "ETF Shares Net Asset Value", but its figures are the ones printed as "ETF Shares Market Price".',
    );
  });

  it("reads a table that prints the percent sign in its own cell, and a ten-year period across a leap day", () => {
    const agg: ClassSpec = {
      classId: AGG,
      starts: ["2025-03-01", "2021-03-01", "2016-03-01"],
      series: [{ values: [0.0624, 0.0041, 0.0194], label: "Fund NAV" }],
      table:
        "<table><tr><td>Average annual total returns</td><td>1 Year</td><td>5 Years</td><td>10 Years</td></tr>" +
        "<tr><td>Fund NAV</td><td>6.24</td><td>%</td><td>0.41</td><td>%</td><td>1.94</td><td>%</td></tr>" +
        "<tr><td>Bloomberg U.S. Aggregate Bond Index</td><td>6.26</td><td>0.42</td><td>1.97</td></tr></table>",
      ticker: "AGG",
      cost: [0.0003, 3],
    };
    const extract = extractFundReport(report("2026-02-28", [agg]), AGG);
    if (!extract.returns.found) throw new Error(extract.returns.reason);
    expect(extract.returns.label).toBe("Fund NAV");
    expect(extract.returns.periods.map((period) => period.years)).toEqual([1, 5, 10]);
  });

  it("accepts the only series a class tags when there is no printed table, and keeps a younger class's own start", () => {
    const sgov: ClassSpec = {
      classId: SGOV,
      starts: ["2025-03-01", "2021-03-01", "2020-05-26"],
      series: [{ dims: WITHOUT_LOAD, values: [0.0411, 0.0335, 0.0291] }],
      ticker: "SGOV",
      cost: [0.0009, 9],
    };
    const extract = extractFundReport(report("2026-02-28", [sgov]), SGOV);
    if (!extract.returns.found) throw new Error(extract.returns.reason);
    expect(extract.returns.checkedAgainst).toBe("only series tagged");
    expect(extract.returns.periods.map(({ years, start }) => [years, start])).toEqual([
      [1, "2025-03-01"],
      [5, "2021-03-01"],
      [null, "2020-05-26"],
    ]);
  });

  it("does not count an index's returns as one of the class's series", () => {
    // Without the table, a second series would be refused. The index is not one.
    const extract = extractFundReport(
      report("2025-12-31", [vtiClass({ series: [vtiClass().series[0]], table: undefined, index: [0.1714, 0.1308, 0.1425] })]),
      VTI,
    );
    expect(extract.returns.found).toBe(true);
  });
});

describe("refusing returns that cannot be checked", () => {
  it("refuses two series with no printed table to tell them apart", () => {
    const extract = extractFundReport(report("2025-12-31", [vtiClass({ table: undefined })]), VTI);
    expect(extract.returns).toEqual({ found: false, reason: "It tags 2 return series for this share class and prints no table to tell them apart." });
  });

  it("refuses when no tagged series equals the printed net-asset-value row", () => {
    const table = printed(HEADINGS, [["ETF Shares Net Asset Value", ["17.15%", "13.08%", "14.25%"]]]);
    const extract = extractFundReport(report("2025-12-31", [vtiClass({ table })]), VTI);
    expect(extract.returns.found).toBe(false);
    if (extract.returns.found) return;
    expect(extract.returns.reason).toMatch(/No tagged return series equals the row the report prints as "ETF Shares Net Asset Value"/);
  });

  it("refuses a printed table with no net-asset-value row", () => {
    const table = printed(HEADINGS, [["ETF Shares", ["17.14%", "13.08%", "14.25%"]]]);
    const extract = extractFundReport(report("2025-12-31", [vtiClass({ table })]), VTI);
    expect(extract.returns).toEqual({ found: false, reason: "The printed returns table has no row for net asset value." });
  });

  it("refuses two different figures for one period", () => {
    const xml = report("2025-12-31", [vtiClass()]).replace(
      "</xbrl>",
      `${context("again", VTI, "2025-01-01", "2025-12-31")}\n${fact("oef:AvgAnnlRtrPct", "again", "0.1799")}\n</xbrl>`,
    );
    const extract = extractFundReport(xml, VTI);
    expect(extract.returns.found).toBe(false);
    if (extract.returns.found) return;
    expect(extract.returns.reason).toMatch(/two different returns/);
  });

  it("refuses a lone series the data file calls the market price", () => {
    const only = vtiClass({ series: [{ dims: WITHOUT_LOAD, values: [0.171, 0.1306, 0.1425], label: "ETF Shares Market Price" }], table: undefined, index: undefined });
    const extract = extractFundReport(report("2025-12-31", [only]), VTI);
    expect(extract.returns.found).toBe(false);
  });

  it("says so when a class has no returns at all", () => {
    const extract = extractFundReport(report("2025-12-31", [admiralClass]), VTI);
    expect(extract.returns).toEqual({ found: false, reason: NO_RETURNS });
    expect(extract.tradingSymbols).toEqual([]);
  });

  it("refuses a cost on $10,000 that is not in dollars", () => {
    const extract = extractFundReport(report("2025-12-31", [vtiClass({ cost: [0.0003, 3, "EUR"] })]), VTI);
    expect(extract.costs.found).toBe(false);
  });
});

describe("periods and printed figures", () => {
  it("counts whole years the way filers write them", () => {
    expect(wholeYears("2025-01-01", "2025-12-31")).toBe(1);
    expect(wholeYears("2016-03-01", "2026-02-28")).toBe(10);
    expect(wholeYears("2015-12-31", "2025-12-31")).toBe(10);
    expect(wholeYears("2020-05-26", "2026-02-28")).toBeNull();
  });

  it("reads a figure however it is printed", () => {
    expect(parsePrintedNumber("17.14%")).toBe(17.14);
    expect(parsePrintedNumber("(0.38)")).toBe(-0.38);
    expect(parsePrintedNumber("−0.38%")).toBe(-0.38);
    expect(parsePrintedNumber("1,234.5")).toBe(1234.5);
    expect(parsePrintedNumber("—")).toBeNull();
    expect(parsePrintedNumber("10 Years")).toBeNull();
  });

  it("gives a tagged fraction as the percentage the report prints", () => {
    expect(returnPct(0.1714)).toBe(17.14);
    expect(returnPct(-0.0038)).toBe(-0.38);
  });

  it("finds a printed table's period columns and rows", () => {
    const table = readPrintedTable(vtiClass().table!);
    expect(table.columns).toEqual(HEADINGS);
    expect(table.rows[1]).toEqual({ label: "ETF Shares Market Price", values: [17.1, 13.06, 14.25] });
  });
});

describe("matching a ticker to its share class", () => {
  const header = [
    "<SERIES>",
    "<OWNER-CIK>0000036405",
    "<SERIES-ID>S000002848",
    "<SERIES-NAME>Vanguard Total Stock Market Index Fund",
    "<CLASS-CONTRACT>",
    "<CLASS-CONTRACT-ID>C000007806",
    "<CLASS-CONTRACT-NAME>Admiral Shares",
    "<CLASS-CONTRACT-TICKER-SYMBOL>VTSAX",
    "</CLASS-CONTRACT>",
    "<CLASS-CONTRACT>",
    "<CLASS-CONTRACT-ID>C000007808",
    "<CLASS-CONTRACT-NAME>ETF Shares",
    "<CLASS-CONTRACT-TICKER-SYMBOL>VTI",
    "</CLASS-CONTRACT>",
    "</SERIES>",
  ].join("\n");
  const list: SecListRow[] = [
    { cik: "0000036405", seriesId: "S000002848", classId: VTI_ADMIRAL, symbol: "VTSAX" },
    { cik: "0000036405", seriesId: "S000002848", classId: VTI, symbol: "VTI" },
  ];
  const extract = extractFundReport(report("2025-12-31", [admiralClass, vtiClass()]), VTI);

  it("reads the share classes a filing's header lists", () => {
    expect(readHeaderClasses(header)).toEqual([
      { seriesId: "S000002848", seriesName: "Vanguard Total Stock Market Index Fund", classId: VTI_ADMIRAL, className: "Admiral Shares", ticker: "VTSAX" },
      { seriesId: "S000002848", seriesName: "Vanguard Total Stock Market Index Fund", classId: VTI, className: "ETF Shares", ticker: "VTI" },
    ]);
  });

  it("matches only when the SEC's list, the filing's header and the report's own tag agree", () => {
    const classes = readHeaderClasses(header);
    expect(classMatchProblems("VTI", list, classes, extract)).toEqual([]);

    const listedElsewhere = list.map((row) => (row.symbol === "VTI" ? { ...row, classId: VTI_ADMIRAL } : row));
    expect(classMatchProblems("VTI", listedElsewhere, classes, extract)).toContain(
      `The SEC's fund ticker list gives VTI as ${VTI_ADMIRAL}, but this report was read for ${VTI}.`,
    );

    const renamed = readHeaderClasses(header.replace("SYMBOL>VTI", "SYMBOL>VTIX"));
    expect(classMatchProblems("VTI", list, renamed, extract)).toEqual([`The filing's header gives ${VTI} the ticker VTIX, not VTI.`]);

    const mistagged = { ...extract, tradingSymbols: ["VTSAX"] };
    expect(classMatchProblems("VTI", list, classes, mistagged)).toEqual([`The report tags ${VTI} with VTSAX, not VTI.`]);
  });
});

describe("the excerpt kept beside the data", () => {
  it("reads exactly as the whole report does, and carries nothing from other share classes", () => {
    const xml = report("2025-12-31", [admiralClass, vtiClass()]);
    const excerpt = excerptForClass(xml, VTI, "https://www.sec.gov/example");
    expect(extractFundReport(excerpt, VTI)).toEqual(extractFundReport(xml, VTI));
    expect(excerpt).not.toContain(VTI_ADMIRAL);
    expect(excerpt).not.toContain("VTSAX");
    expect(excerpt.length).toBeLessThan(xml.length);
  });
});
