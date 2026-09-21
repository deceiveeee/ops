import { describe, expect, it } from "vitest";
import { nameOf, pickXbrlFiles, readLabels, readRevenue, type Breakdown, type BreakdownKind } from "./revenue";

/**
 * Where revenue comes from, and the rule that it is shown only when it adds up.
 *
 * Each case below is modelled on a real filing read on 2026-09-13, with its real
 * figures and labels: Atkore's product lines under its segments, Apple's
 * "Products" row that is the sum of four others, Netflix's regions tagged under
 * a single product, and Hubbell's restatement axis and top-ten customers. The
 * refusals use invented figures, at realistic sizes.
 */

let contextCount = 0;

function report(
  periodEnd: string,
  start: string,
  facts: { concept: string; value: number; dims?: [string, string][]; start?: string; end?: string; decimals?: string; unit?: "usd" | "eur" }[],
) {
  const parts = [
    "<xbrl>",
    '<unit id="usd"><measure>iso4217:USD</measure></unit>',
    '<unit id="eur"><measure>iso4217:EUR</measure></unit>',
    '<unit id="pure"><measure>xbrli:pure</measure></unit>',
    `<context id="c0"><entity><identifier scheme="http://www.sec.gov/CIK">1</identifier></entity><period><startDate>${start}</startDate><endDate>${periodEnd}</endDate></period></context>`,
    `<dei:DocumentPeriodEndDate contextRef="c0">${periodEnd}</dei:DocumentPeriodEndDate>`,
  ];
  for (const fact of facts) {
    const id = `c${++contextCount}`;
    const segment = fact.dims?.length
      ? `<segment>${fact.dims.map(([axis, member]) => `<xbrldi:explicitMember dimension="${axis}">${member}</xbrldi:explicitMember>`).join("")}</segment>`
      : "";
    parts.push(
      `<context id="${id}"><entity><identifier scheme="http://www.sec.gov/CIK">1</identifier>${segment}</entity><period><startDate>${fact.start ?? start}</startDate><endDate>${fact.end ?? periodEnd}</endDate></period></context>`,
      `<${fact.concept} contextRef="${id}" decimals="${fact.decimals ?? "-3"}" unitRef="${fact.unit ?? (fact.concept === CONCENTRATION ? "pure" : "usd")}">${fact.value}</${fact.concept}>`,
    );
  }
  parts.push("</xbrl>");
  return parts.join("\n");
}

/** A label linkbase naming each concept, the way a filing's label file does. */
const linkbase = (pairs: [concept: string, label: string, role?: string][]) =>
  `<link:linkbase><link:labelLink>${pairs
    .map(
      ([concept, label, role = "label"], index) =>
        `<link:loc xlink:type="locator" xlink:href="filer.xsd#${concept}" xlink:label="loc${index}"/>` +
        `<link:label xlink:type="resource" xlink:label="lab${index}" xlink:role="http://www.xbrl.org/2003/role/${role}">${label}</link:label>` +
        `<link:labelArc xlink:type="arc" xlink:from="loc${index}" xlink:to="lab${index}"/>`,
    )
    .join("\n")}</link:labelLink></link:linkbase>`;

const REV = "us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax";
const CONCENTRATION = "us-gaap:ConcentrationRiskPercentage1";
const PRODUCT = "srt:ProductOrServiceAxis";
const REGION = "srt:StatementGeographicalAxis";
const SEGMENT = "us-gaap:StatementBusinessSegmentsAxis";
const CONSOLIDATION = "srt:ConsolidationItemsAxis";
const TYPE = "us-gaap:ConcentrationRiskByTypeAxis";
const BENCHMARK = "us-gaap:ConcentrationRiskByBenchmarkAxis";
const CUSTOMER = "srt:MajorCustomersAxis";

const pick = (result: ReturnType<typeof readRevenue>, kind: BreakdownKind): Breakdown => {
  if (!result.found) throw new Error(result.reason);
  const found = result.revenue.breakdowns.find((entry) => entry.kind === kind);
  if (!found) throw new Error(`no ${kind}`);
  return found;
};
const rows = (entry: Breakdown) => {
  if (!entry.found) throw new Error(entry.reason);
  return entry.rows.map((row) => [row.label, row.value, row.within]);
};

describe("Atkore: product lines under segments, regions, segments and customers", () => {
  const labels = linkbase([
    ["atkr_MetalElectricalConduitandFittingsMember", "Metal Electrical Conduit and Fittings [Member]"],
    ["atkr_PlasticPipeConduitAndFittingsMember", "Plastic Pipe Conduit and Fittings"],
    ["atkr_ElectricalCableAndFlexibleConduitMember", "Electrical Cable and Flexible Conduit"],
    ["atkr_OtherElectricalProductsMember", "Other Electrical products"],
    ["atkr_MechanicalTubeMember", "Mechanical Tube"],
    ["atkr_OtherSafetyInfrastructureProductsMember", "Other Safety &amp; Infrastructure Products [Member]"],
    ["atkr_ElectricalSegmentMember", "Electrical"],
    ["atkr_SafetyAndInfrastructureSegmentMember", "Safety &amp; Infrastructure"],
    ["country_US", "UNITED STATES"],
    ["atkr_OtherAmericasMember", "Other Americas"],
    ["srt_EuropeMember", "Europe"],
    ["srt_AsiaPacificMember", "Asia-Pacific"],
    ["atkr_SoneparUSAMember", "Sonepar USA"],
    ["atkr_CEDNationalMember", "CED National"],
  ]);
  const product = (member: string, segment: string, value: number) => ({
    concept: REV,
    value,
    dims: [[PRODUCT, member], [SEGMENT, segment]] as [string, string][],
  });
  const share = (customer: string, benchmark: string, value: number, start?: string, end?: string) => ({
    concept: CONCENTRATION,
    value,
    decimals: "2",
    start,
    end,
    dims: [[CUSTOMER, customer], [BENCHMARK, benchmark], [TYPE, "us-gaap:CustomerConcentrationRiskMember"]] as [string, string][],
  });
  const xml = report("2025-09-30", "2024-10-01", [
    { concept: REV, value: 2850378000 },
    { concept: REV, value: 2638000000, start: "2023-10-01", end: "2024-09-30" },
    product("atkr:MetalElectricalConduitandFittingsMember", "atkr:ElectricalSegmentMember", 455678000),
    product("atkr:PlasticPipeConduitAndFittingsMember", "atkr:ElectricalSegmentMember", 673622000),
    product("atkr:ElectricalCableAndFlexibleConduitMember", "atkr:ElectricalSegmentMember", 494011000),
    product("atkr:OtherElectricalProductsMember", "atkr:ElectricalSegmentMember", 374898000),
    product("atkr:MechanicalTubeMember", "atkr:SafetyAndInfrastructureSegmentMember", 306637000),
    product("atkr:OtherSafetyInfrastructureProductsMember", "atkr:SafetyAndInfrastructureSegmentMember", 545532000),
    { concept: REV, value: 1998209000, dims: [[SEGMENT, "atkr:ElectricalSegmentMember"]] },
    { concept: REV, value: 852169000, dims: [[SEGMENT, "atkr:SafetyAndInfrastructureSegmentMember"]] },
    // Gross segment sales and an elimination beside them: the plain segment figures are what add up.
    { concept: REV, value: 1998219000, dims: [[CONSOLIDATION, "us-gaap:OperatingSegmentsMember"], [SEGMENT, "atkr:ElectricalSegmentMember"]] },
    { concept: REV, value: 853369000, dims: [[CONSOLIDATION, "us-gaap:OperatingSegmentsMember"], [SEGMENT, "atkr:SafetyAndInfrastructureSegmentMember"]] },
    { concept: REV, value: -1200000, dims: [[CONSOLIDATION, "us-gaap:IntersegmentEliminationMember"], [SEGMENT, "atkr:SafetyAndInfrastructureSegmentMember"]] },
    { concept: REV, value: 2501481000, dims: [[REGION, "country:US"]] },
    { concept: REV, value: 80380000, dims: [[REGION, "atkr:OtherAmericasMember"]] },
    { concept: REV, value: 220803000, dims: [[REGION, "srt:EuropeMember"]] },
    { concept: REV, value: 47714000, dims: [[REGION, "srt:AsiaPacificMember"]] },
    share("atkr:SoneparUSAMember", "us-gaap:RevenueFromContractWithCustomerProductAndServiceBenchmarkMember", 0.1),
    share("atkr:SoneparUSAMember", "atkr:AccountsReceivableBenchmarkMember", 0.13),
    share("atkr:CEDNationalMember", "atkr:AccountsReceivableBenchmarkMember", 0.12),
    // Last year's share is not this year's.
    share("atkr:SoneparUSAMember", "atkr:AccountsReceivableBenchmarkMember", 0.17, "2023-10-01", "2024-09-30"),
  ]);
  const result = readRevenue(xml, labels);

  it("reads the year's total revenue", () => {
    if (!result.found) throw new Error(result.reason);
    expect([result.revenue.periodStart, result.revenue.periodEnd, result.revenue.total]).toEqual(["2024-10-01", "2025-09-30", 2850378000]);
  });

  it("gives each product line under the segment it is tagged in, adding up to total revenue", () => {
    const products = pick(result, "products");
    expect(rows(products)).toEqual([
      ["Metal Electrical Conduit and Fittings", 455678000, "Electrical"],
      ["Plastic Pipe Conduit and Fittings", 673622000, "Electrical"],
      ["Electrical Cable and Flexible Conduit", 494011000, "Electrical"],
      ["Other Electrical products", 374898000, "Electrical"],
      ["Mechanical Tube", 306637000, "Safety & Infrastructure"],
      ["Other Safety & Infrastructure Products", 545532000, "Safety & Infrastructure"],
    ]);
    if (products.found) expect(products.rows.reduce((sum, row) => sum + row.share, 0)).toBeCloseTo(1, 10);
  });

  it("takes segments as the filing reports them, not before intersegment sales come out", () => {
    expect(rows(pick(result, "segments"))).toEqual([
      ["Electrical", 1998209000, null],
      ["Safety & Infrastructure", 852169000, null],
    ]);
  });

  it("gives regions", () => {
    expect(rows(pick(result, "regions")).map(([label]) => label)).toEqual(["UNITED STATES", "Other Americas", "Europe", "Asia-Pacific"]);
  });

  it("gives this year's customer shares, of sales first, then of what customers owed", () => {
    if (!result.found) throw new Error(result.reason);
    expect(result.revenue.customers).toEqual([
      { customer: "Sonepar USA", of: "sales", share: 0.1 },
      { customer: "Sonepar USA", of: "receivables", share: 0.13 },
      { customer: "CED National", of: "receivables", share: 0.12 },
    ]);
  });
});

describe("parts that do not add up as tagged", () => {
  it("leaves out Apple's Products row, which is the sum of iPhone, Mac, iPad and Wearables", () => {
    const m = 1_000_000;
    const period = { start: "2024-09-29", end: "2025-09-27", decimals: "-6" };
    const xml = report("2025-09-27", "2024-09-29", [
      { concept: REV, value: 416161 * m, ...period },
      ...(
        [
          ["aapl:ProductMember", 307003],
          ["aapl:ServiceMember", 109158],
          ["aapl:IPhoneMember", 209586],
          ["aapl:MacMember", 33708],
          ["aapl:IPadMember", 28023],
          ["aapl:WearablesHomeandAccessoriesMember", 35686],
        ] as const
      ).map(([member, value]) => ({ concept: REV, value: value * m, ...period, dims: [[PRODUCT, member]] as [string, string][] })),
    ]);
    const labels = linkbase([
      ["aapl_ProductMember", "Products"],
      ["aapl_ServiceMember", "Services"],
      ["aapl_IPhoneMember", "iPhone"],
      ["aapl_MacMember", "Mac"],
      ["aapl_IPadMember", "iPad"],
      ["aapl_WearablesHomeandAccessoriesMember", "Wearables, Home and Accessories"],
    ]);
    const products = pick(readRevenue(xml, labels), "products");
    expect(rows(products).map(([label]) => label)).toEqual(["Services", "iPhone", "Mac", "iPad", "Wearables, Home and Accessories"]);
    if (products.found) expect(products.subtotalsLeftOut).toEqual(["Products"]);
  });

  it("uses Netflix's regions tagged under its one product, when the region on its own is only part", () => {
    const xml = report("2025-12-31", "2025-01-01", [
      { concept: "us-gaap:Revenues", value: 45183036000 },
      { concept: "us-gaap:Revenues", value: 18500000000, dims: [[REGION, "country:US"]] },
      ...(
        [
          ["nflx:UnitedStatesAndCanadaMember", 19957152000],
          ["us-gaap:EMEAMember", 14514646000],
          ["srt:LatinAmericaMember", 5357521000],
          ["srt:AsiaPacificMember", 5353717000],
        ] as const
      ).map(([member, value]) => ({ concept: "us-gaap:Revenues", value, dims: [[PRODUCT, "nflx:StreamingMember"], [REGION, member]] as [string, string][] })),
    ]);
    const result = readRevenue(xml, "");
    if (!result.found) throw new Error(result.reason);
    expect(result.revenue.concept).toBe("us-gaap:Revenues");
    expect(rows(pick(result, "regions")).map(([, value]) => value)).toEqual([19957152000, 14514646000, 5357521000, 5353717000]);
  });

  it("ignores a restatement axis and a segment-by-region table, and reads Hubbell's top-ten customers", () => {
    const xml = report("2025-12-31", "2025-01-01", [
      { concept: REV, value: 5844600000, decimals: "-5" },
      { concept: REV, value: 5844600000, decimals: "-5", dims: [["us-gaap:RestatementAxis", "srt:ScenarioPreviouslyReportedMember"]] },
      { concept: REV, value: 3518900000, decimals: "-5", dims: [[SEGMENT, "hubb:UtilitySolutionsMember"], [REGION, "country:US"]] },
      { concept: REV, value: 153400000, decimals: "-5", dims: [[SEGMENT, "hubb:UtilitySolutionsMember"], [REGION, "hubb:InternationalMember"]] },
      { concept: REV, value: 1892400000, decimals: "-5", dims: [[SEGMENT, "hubb:ElectricalSolutionsMember"], [REGION, "country:US"]] },
      { concept: REV, value: 279900000, decimals: "-5", dims: [[SEGMENT, "hubb:ElectricalSolutionsMember"], [REGION, "hubb:InternationalMember"]] },
      { concept: REV, value: 5411300000, decimals: "-5", dims: [[REGION, "country:US"]] },
      { concept: REV, value: 433300000, decimals: "-5", dims: [[REGION, "hubb:InternationalMember"]] },
      { concept: CONCENTRATION, value: 0.42, decimals: "2", dims: [[CUSTOMER, "hubb:TopTenCustomersMember"], [BENCHMARK, "us-gaap:SalesRevenueNetMember"], [TYPE, "us-gaap:CustomerConcentrationRiskMember"]] },
      { concept: CONCENTRATION, value: 0.33, decimals: "2", dims: [[REGION, "country:CA"], [BENCHMARK, "us-gaap:SalesRevenueNetMember"], [TYPE, "us-gaap:GeographicConcentrationRiskMember"]] },
    ]);
    const result = readRevenue(xml, linkbase([["hubb_TopTenCustomersMember", "Top Ten Customers"], ["hubb_InternationalMember", "International"], ["country_US", "United States"]]));
    expect(rows(pick(result, "regions"))).toEqual([["United States", 5411300000, null], ["International", 433300000, null]]);
    // Two segments in the segment-by-region table, so it is not a region breakdown, and there is no plain segment one.
    expect(pick(result, "segments").found).toBe(false);
    if (result.found) expect(result.revenue.customers).toEqual([{ customer: "Top Ten Customers", of: "sales", share: 0.42 }]);
  });

  it("refuses parts that overshoot with no subtotal to explain it, and says what they came to", () => {
    const xml = report("2025-09-30", "2024-10-01", [
      { concept: REV, value: 1_000_000_000 },
      { concept: REV, value: 700_000_000, dims: [[CONSOLIDATION, "us-gaap:OperatingSegmentsMember"], [SEGMENT, "x:AMember"]] },
      { concept: REV, value: 400_000_000, dims: [[CONSOLIDATION, "us-gaap:OperatingSegmentsMember"], [SEGMENT, "x:BMember"]] },
    ]);
    expect(pick(readRevenue(xml, ""), "segments")).toEqual({
      kind: "segments",
      found: false,
      reason: "The segments it tags add up to 110.0% of its revenue, not all of it, so they are not shown as shares.",
    });
  });

  it("refuses parts that can be added up more than one way", () => {
    const xml = report("2025-09-30", "2024-10-01", [
      { concept: REV, value: 100_000_000 },
      ...["A", "B", "C", "D"].map((name) => ({ concept: REV, value: 50_000_000, dims: [[PRODUCT, `x:${name}Member`]] as [string, string][] })),
    ]);
    expect(pick(readRevenue(xml, ""), "products").found).toBe(false);
  });

  it("allows parts to differ from the total by their rounding, and not a dollar more", () => {
    // Three parts and a total, each rounded to thousands, can be at most 4,000 apart.
    const regions = (last: number) =>
      pick(
        readRevenue(
          report("2025-09-30", "2024-10-01", [
            { concept: REV, value: 3_000_000_000 },
            { concept: REV, value: 1_000_000_000, dims: [[REGION, "x:AMember"]] },
            { concept: REV, value: 1_000_000_000, dims: [[REGION, "x:BMember"]] },
            { concept: REV, value: last, dims: [[REGION, "x:CMember"]] },
          ]),
          "",
        ),
        "regions",
      ).found;
    expect(regions(1_000_004_000)).toBe(true);
    expect(regions(1_000_004_001)).toBe(false);
  });

  it("refuses revenue tagged in another currency, rather than print it as dollars", () => {
    const xml = report("2025-12-31", "2025-01-01", [
      { concept: REV, value: 34_000_000_000, unit: "eur" },
      { concept: REV, value: 20_000_000_000, unit: "eur", dims: [[REGION, "x:AMember"]] },
      { concept: REV, value: 14_000_000_000, unit: "eur", dims: [[REGION, "x:BMember"]] },
    ]);
    expect(readRevenue(xml, "")).toEqual({
      found: false,
      reason: "Its revenue is tagged in EUR, not US dollars, and this reader does not convert currencies.",
    });
  });

  it("uses Eaton's precise total when the same total is also tagged rounded, as $27.4bn", () => {
    const xml = report("2025-12-31", "2025-01-01", [
      { concept: REV, value: 27_448_000_000, decimals: "-6" },
      { concept: REV, value: 27_400_000_000, decimals: "-8" },
      { concept: REV, value: 16_000_000_000, decimals: "-6", dims: [[REGION, "x:AMember"]] },
      { concept: REV, value: 11_448_000_000, decimals: "-6", dims: [[REGION, "x:BMember"]] },
    ]);
    const result = readRevenue(xml, "");
    if (!result.found) throw new Error(result.reason);
    expect(result.revenue.total).toBe(27_448_000_000);
    expect(pick(result, "regions").found).toBe(true);
  });

  it("refuses two totals that do not round to each other", () => {
    const xml = report("2025-12-31", "2025-01-01", [
      { concept: REV, value: 27_448_000_000, decimals: "-6" },
      { concept: REV, value: 27_500_000_000, decimals: "-8" },
    ]);
    expect(readRevenue(xml, "")).toEqual({
      found: false,
      reason: "Its data file tags the year's total revenue as figures that do not agree, so its breakdowns cannot be checked against one.",
    });
  });

  it("does not take a breakdown tagged under a restatement for this year's breakdown", () => {
    const xml = report("2025-12-31", "2025-01-01", [
      { concept: REV, value: 1_000_000_000 },
      { concept: REV, value: 600_000_000, dims: [[REGION, "x:AMember"], ["us-gaap:RestatementAxis", "srt:ScenarioPreviouslyReportedMember"]] },
      { concept: REV, value: 400_000_000, dims: [[REGION, "x:BMember"], ["us-gaap:RestatementAxis", "srt:ScenarioPreviouslyReportedMember"]] },
    ]);
    expect(pick(readRevenue(xml, ""), "regions")).toEqual({ kind: "regions", found: false, reason: "Its data file tags no revenue by regions." });
  });

  it("reads Nucor's segments from its operating segments, not the intersegment amounts tagged beside them", () => {
    const m = 1_000_000;
    const segment = (member: string, item: string, value: number) => ({
      concept: REV,
      value: value * m,
      decimals: "-6",
      dims: [[CONSOLIDATION, item], [SEGMENT, member]] as [string, string][],
    });
    const xml = report("2025-12-31", "2025-01-01", [
      { concept: REV, value: 32_494 * m, decimals: "-6" },
      segment("nue:SteelMillsMember", "us-gaap:OperatingSegmentsMember", 20_003),
      segment("nue:SteelProductsMember", "us-gaap:OperatingSegmentsMember", 10_327),
      segment("nue:RawMaterialsMember", "us-gaap:OperatingSegmentsMember", 2_164),
      segment("nue:SteelMillsMember", "us-gaap:IntersegmentEliminationMember", 5_067),
      segment("nue:SteelProductsMember", "us-gaap:IntersegmentEliminationMember", 642),
      segment("nue:RawMaterialsMember", "us-gaap:IntersegmentEliminationMember", 10_606),
    ]);
    expect(rows(pick(readRevenue(xml, ""), "segments")).map(([, value]) => value)).toEqual([20_003 * m, 10_327 * m, 2_164 * m]);
  });

  it("refuses to drop a part that is not the total of parts kept, even when the rest add up", () => {
    const xml = report("2025-09-30", "2024-10-01", [
      { concept: REV, value: 100_000_000 },
      { concept: REV, value: 60_000_000, dims: [[PRODUCT, "x:AMember"]] },
      { concept: REV, value: 40_000_000, dims: [[PRODUCT, "x:BMember"]] },
      { concept: REV, value: 5_000_000, dims: [[PRODUCT, "x:CMember"]] },
    ]);
    expect(pick(readRevenue(xml, ""), "products").found).toBe(false);
  });

  it("does not read Apple's credit exposure on what one customer owes as that customer's share", () => {
    const period = { start: "2024-09-29", end: "2025-09-27" };
    const xml = report("2025-09-27", "2024-09-29", [
      { concept: REV, value: 416_161_000_000, decimals: "-6", ...period },
      {
        concept: CONCENTRATION,
        value: 0.12,
        decimals: "2",
        ...period,
        dims: [[CUSTOMER, "aapl:CustomerOneMember"], [BENCHMARK, "us-gaap:AccountsReceivableMember"], [TYPE, "us-gaap:CreditConcentrationRiskMember"]],
      },
    ]);
    const result = readRevenue(xml, "");
    if (!result.found) throw new Error(result.reason);
    expect(result.revenue.customers).toEqual([]);
  });

  it("says so when there is no single total to check against", () => {
    const xml = report("2025-09-30", "2024-10-01", [{ concept: REV, value: 100_000_000, dims: [[PRODUCT, "x:AMember"]] }]);
    expect(readRevenue(xml, "")).toEqual({
      found: false,
      reason: "Its data file tags no single total revenue for the year under US accounting rules, so its breakdowns cannot be checked against one.",
    });
  });
});

describe("names and files", () => {
  it("prefers a short label, drops [Member], and decodes the ampersand", () => {
    const labels = readLabels(
      linkbase([
        ["atkr_MechanicalTubeMember", "Mechanical Tube [Member]"],
        ["atkr_MechanicalTubeMember", "Mechanical Tube", "terseLabel"],
        ["atkr_SafetyAndInfrastructureSegmentMember", "Safety &amp; Infrastructure [Member]"],
      ]),
    );
    expect(labels.get("atkr_MechanicalTubeMember")).toBe("Mechanical Tube");
    expect(labels.get("atkr_SafetyAndInfrastructureSegmentMember")).toBe("Safety & Infrastructure");
  });

  it("falls back to a member's own name split into words, and keeps a country code whole", () => {
    expect(nameOf("atkr:OtherAmericasMember", new Map())).toBe("Other Americas");
    expect(nameOf("country:US", new Map())).toBe("US");
  });

  it("reads labels from the schema when a filing has no label file, as Nucor's does not", () => {
    expect(pickXbrlFiles(["nue-20251231.xsd", "nue-20251231_htm.xml", "FilingSummary.xml"], "nue-20251231.htm")).toEqual({
      instance: "nue-20251231_htm.xml",
      labels: "nue-20251231.xsd",
    });
    expect(pickXbrlFiles(["atkr-20250930_htm.xml", "atkr-20250930_lab.xml", "atkr-20250930.xsd"], "atkr-20250930.htm")).toEqual({
      instance: "atkr-20250930_htm.xml",
      labels: "atkr-20250930_lab.xml",
    });
  });
});
