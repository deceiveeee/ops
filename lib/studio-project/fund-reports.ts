/**
 * A fund's returns and costs, read from its own annual shareholder report.
 *
 * A fund's annual report to its holders is filed with the SEC as Form N-CSR,
 * in inline XBRL under the `oef` taxonomy. For each share class it tags the
 * average annual total return over 1, 5 and 10 years, or since the class began
 * where it is younger; what the class cost over the year on $10,000; and the
 * report's own statement that past performance does not predict.
 * docs/source-audits/studio-fund-reports.md lists what was read.
 *
 * Three things make this harder than finding a tag:
 *
 * 1. One report covers many share classes. VTI is one of six classes of
 *    Vanguard Total Stock Market Index Fund, each with its own costs and
 *    returns, so every fact is taken only from contexts naming this class.
 * 2. An ETF class can carry two return series, one worked out from the fund's
 *    net asset value and one from its market price, and the tags do not say
 *    reliably which is which. Vanguard's VTI report tags the net-asset-value
 *    series with no further dimension and the market-price series on the
 *    sales-load axis. Its VOO report, filed the same day, does the opposite,
 *    and puts the "Net Asset Value" label on the market-price series. So the
 *    series is chosen by the table the
 *    report prints: the row it calls net asset value, every figure of which
 *    must equal one tagged series. Where the labels disagree with the printed
 *    table, that is recorded, not smoothed over.
 * 3. A period is its context's dates, not a column heading.
 *
 * Nothing here touches the network; scripts/source/fetch-fund-reports.mjs
 * does the fetching and calls this.
 */

export interface XbrlContext {
  id: string;
  /** Empty for an instant. */
  start: string;
  /** The end of a duration, or the instant itself. */
  end: string;
  /** Axis to member, both without their prefixes: ClassAxis → C000007808Member. */
  dims: Record<string, string>;
  /** The element as filed, for an excerpt. */
  raw: string;
}

export interface XbrlFact {
  name: string;
  contextRef: string;
  unitRef: string | null;
  /** The element's content with XML entities decoded once. For a text block, that is HTML. */
  value: string;
  /** The element as filed, for an excerpt. */
  raw: string;
}

/** Every tag this module reads. An excerpt keeps exactly these, so reading it gives the same answer as the whole report. */
export const TAGS_READ = [
  "dei:DocumentPeriodEndDate",
  "dei:DocumentType",
  "dei:TradingSymbol",
  "oef:ClassName",
  "oef:FundName",
  "oef:AvgAnnlRtrPct",
  "oef:AvgAnnlRtrTableTextBlock",
  "oef:LineGraphAndTableMeasureName",
  "oef:ExpenseRatioPct",
  "oef:ExpensesPaidAmt",
  "oef:PerformancePastDoesNotIndicateFuture",
  "oef:NoDeductionOfTaxesTextBlock",
] as const;

export const NO_RETURNS = "The report tags no returns for this share class.";

const DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const TAG_NAME = /^[A-Za-z-]+:[A-Za-z]+$/;
/** How a printed row, or a tagged label, names the net-asset-value series. */
const NAV = /net asset value|\bNAV\b/i;

const localName = (qualified: string) => qualified.slice(qualified.indexOf(":") + 1);

export function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** The visible text of an HTML fragment, on one line. */
export function htmlText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

const attribute = (attributes: string, key: string): string | null =>
  attributes.match(new RegExp(`(?:^|\\s)${key}="([^"]*)"`))?.[1] ?? null;

export function readContexts(xml: string): Map<string, XbrlContext> {
  const contexts = new Map<string, XbrlContext>();
  for (const match of xml.matchAll(/<(?:xbrli:)?context\b[^>]*?\bid="([^"]+)"[^>]*>([\s\S]*?)<\/(?:xbrli:)?context>/g)) {
    const body = match[2];
    const dims: Record<string, string> = {};
    for (const member of body.matchAll(/<xbrldi:explicitMember\b[^>]*?\bdimension="([^"]+)"[^>]*>([^<]*)<\/xbrldi:explicitMember>/g)) {
      dims[localName(member[1])] = localName(member[2].trim());
    }
    for (const member of body.matchAll(/<xbrldi:typedMember\b[^>]*?\bdimension="([^"]+)"/g)) {
      dims[localName(member[1])] = "(typed)";
    }
    const date = (tag: string) => body.match(new RegExp(`<(?:xbrli:)?${tag}>\\s*([^<]*?)\\s*<`))?.[1] ?? "";
    const instant = date("instant");
    contexts.set(match[1], {
      id: match[1],
      start: instant ? "" : date("startDate"),
      end: instant || date("endDate"),
      dims,
      raw: match[0],
    });
  }
  return contexts;
}

export function readFacts(xml: string, name: string): XbrlFact[] {
  if (!TAG_NAME.test(name)) throw new Error(`Not a tag name: ${name}`);
  const pattern = new RegExp(`<${name}(?=[\\s/>])([^>]*?)(?:/>|>([\\s\\S]*?)</${name}>)`, "g");
  const facts: XbrlFact[] = [];
  for (const match of xml.matchAll(pattern)) {
    const contextRef = attribute(match[1], "contextRef");
    if (!contextRef) continue;
    const inner = match[2];
    const cdata = inner?.match(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/);
    facts.push({
      name,
      contextRef,
      unitRef: attribute(match[1], "unitRef"),
      value: inner === undefined ? "" : cdata ? cdata[1] : decodeEntities(inner),
      raw: match[0],
    });
  }
  return facts;
}

/** Whether a context names exactly this share class. */
export function namesClass(context: XbrlContext | undefined, classId: string): boolean {
  const member = context?.dims.ClassAxis;
  return member !== undefined && member.replace(/Member$/, "") === classId;
}

const isIndex = (context: XbrlContext) => Object.keys(context.dims).some((axis) => /IndexAxis$/.test(axis));

const seriesKey = (context: XbrlContext) =>
  Object.entries(context.dims)
    .filter(([axis]) => axis !== "ClassAxis")
    .map(([axis, member]) => `${axis}=${member}`)
    .sort()
    .join(" ");

const shift = (iso: string, years: number, days: number) => {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate() + days))
    .toISOString()
    .slice(0, 10);
};

/**
 * How many whole years a period spans, or null.
 *
 * Filers write a ten-year period to 28 February 2026 as starting 1 March 2016,
 * the day after the same date ten years earlier. Counting back from the end
 * date instead would land on 29 February 2016 and miss it. A start on the same
 * date N years earlier is accepted too, since some filers write it that way.
 */
export function wholeYears(start: string, end: string): number | null {
  if (!DATE.test(start) || !DATE.test(end)) return null;
  const dayAfter = shift(end, 0, 1);
  for (let years = 1; years <= 50; years++) {
    if (start === shift(dayAfter, -years, 0) || start === shift(end, -years, 0)) return years;
  }
  return null;
}

export interface ReturnPeriod {
  /** Null when the period is not a whole number of years: the class is younger, and this runs from when it began. */
  years: number | null;
  start: string;
  end: string;
  /** The tagged value, as a fraction: 0.1714 is 17.14%. */
  value: number;
}

/** A tagged return as the percentage a report prints, to two decimals. */
export const returnPct = (value: number) => Math.round(value * 10000) / 100;

interface TaggedSeries {
  key: string;
  periods: ReturnPeriod[];
  /** What the data file calls this series, where it says. */
  labels: string[];
}

const byLength = (a: ReturnPeriod, b: ReturnPeriod) =>
  (a.years ?? 1000) - (b.years ?? 1000) || b.start.localeCompare(a.start);

function returnSeries(
  contexts: Map<string, XbrlContext>,
  returns: XbrlFact[],
  names: XbrlFact[],
  classId: string,
  periodEnd: string,
): TaggedSeries[] | string {
  const byKey = new Map<string, TaggedSeries>();
  for (const fact of returns) {
    const context = contexts.get(fact.contextRef);
    if (!context || !namesClass(context, classId) || isIndex(context)) continue;
    if (!context.start || context.end !== periodEnd) continue;
    const text = fact.value.trim();
    const value = Number(text);
    if (!text || !Number.isFinite(value)) continue;
    const key = seriesKey(context);
    const series = byKey.get(key) ?? { key, periods: [], labels: [] };
    byKey.set(key, series);
    const same = series.periods.find((period) => period.start === context.start);
    if (same) {
      if (same.value !== value) {
        return `It tags two different returns, ${same.value} and ${value}, for the same period from ${context.start}.`;
      }
      continue;
    }
    series.periods.push({ years: wholeYears(context.start, context.end), start: context.start, end: context.end, value });
  }
  for (const fact of names) {
    const context = contexts.get(fact.contextRef);
    if (!context || !namesClass(context, classId) || isIndex(context)) continue;
    const series = byKey.get(seriesKey(context));
    const label = htmlText(fact.value);
    if (series && label && !series.labels.includes(label)) series.labels.push(label);
  }
  for (const series of byKey.values()) series.periods.sort(byLength);
  return [...byKey.values()];
}

export interface PrintedRow {
  label: string;
  values: number[];
}

export interface PrintedTable {
  /** Column headings that name a period, in order: "1 Year", "5 Years", "Since Inception". */
  columns: string[];
  rows: PrintedRow[];
}

/** A figure as a report prints it: "17.14%", "(0.38)", "−0.38". Null for anything that is not a number. */
export function parsePrintedNumber(text: string): number | null {
  let cleaned = text.replace(/[%$,\s]/g, "").replace(/[−–]/g, "-");
  let negative = false;
  if (/^\(.*\)$/.test(cleaned)) {
    negative = true;
    cleaned = cleaned.slice(1, -1);
  }
  if (!/^-?[0-9]+(\.[0-9]+)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return negative ? -value : value;
}

const PERIOD_HEADING = /year|inception|since/i;

export function readPrintedTable(html: string): PrintedTable {
  const rows = html
    .split(/<tr\b/i)
    .slice(1)
    .map((row) =>
      row
        .split(/<t[dh]\b/i)
        .slice(1)
        .map((cell) => htmlText(`<x${cell}`))
        .filter((cell) => cell !== "" && cell !== "%" && cell !== "$"),
    );
  const table: PrintedTable = { columns: [], rows: [] };
  for (const cells of rows) {
    const numbers = cells.map(parsePrintedNumber);
    if (!table.columns.length) {
      if (numbers.every((value) => value === null) && cells.some((cell) => PERIOD_HEADING.test(cell))) {
        table.columns = cells.filter((cell) => PERIOD_HEADING.test(cell));
      }
      continue;
    }
    const label = cells.find((_, index) => numbers[index] === null);
    const values = numbers.filter((value): value is number => value !== null);
    if (label && values.length) table.rows.push({ label, values });
  }
  return table;
}

function columnPeriod(heading: string, periods: ReturnPeriod[]): ReturnPeriod | null {
  const years = heading.match(/([0-9]+)\s*years?\b/i);
  const candidates = years
    ? periods.filter((period) => period.years === Number(years[1]))
    : /inception|since/i.test(heading)
      ? periods.filter((period) => period.years === null)
      : [];
  return candidates.length === 1 ? candidates[0] : null;
}

/** Whether every figure in a printed row is the tagged value for that column's period, to the two decimals printed. */
function printedAs(series: TaggedSeries, table: PrintedTable, row: PrintedRow): boolean {
  if (!table.columns.length || row.values.length !== table.columns.length) return false;
  return table.columns.every((heading, index) => {
    const period = columnPeriod(heading, series.periods);
    return period !== null && Math.round(period.value * 10000) === Math.round(row.values[index] * 100);
  });
}

export type ReturnsChoice =
  | {
      found: true;
      /** The printed row, or the data file's own label, or empty where the report gives neither. */
      label: string;
      checkedAgainst: "printed table" | "only series tagged";
      periods: ReturnPeriod[];
      /** The class's other tagged series, such as returns at market price. */
      others: { label: string; periods: ReturnPeriod[] }[];
      /** Where the data file's labels disagree with the table the report prints. */
      labelConflict: string | null;
    }
  | { found: false; reason: string };

function chooseSeries(series: TaggedSeries[], table: PrintedTable | null): ReturnsChoice {
  if (!series.length) return { found: false, reason: NO_RETURNS };

  if (table) {
    const navRows = table.rows.filter((row) => NAV.test(row.label));
    if (navRows.length !== 1) {
      return {
        found: false,
        reason: navRows.length
          ? "The printed returns table has more than one row for net asset value."
          : "The printed returns table has no row for net asset value.",
      };
    }
    const row = navRows[0];
    const matching = series.filter((candidate) => printedAs(candidate, table, row));
    if (!matching.length) {
      return { found: false, reason: `No tagged return series equals the row the report prints as "${row.label}".` };
    }
    const chosen = matching[0];
    if (matching.some((candidate) => JSON.stringify(candidate.periods) !== JSON.stringify(chosen.periods))) {
      return { found: false, reason: `More than one tagged series equals the row printed as "${row.label}", and they differ elsewhere.` };
    }

    const conflicts: string[] = [];
    for (const other of series.filter((candidate) => !matching.includes(candidate))) {
      const navLabel = other.labels.find((label) => NAV.test(label));
      if (!navLabel) continue;
      const printed = table.rows.find((candidate) => candidate !== row && printedAs(other, table, candidate));
      conflicts.push(
        printed
          ? `The data file labels another series "${navLabel}", but its figures are the ones printed as "${printed.label}".`
          : `The data file labels another series "${navLabel}", and its figures are not in the printed table.`,
      );
    }
    const ownLabel = chosen.labels.find((label) => !NAV.test(label));
    if (ownLabel) conflicts.push(`The series printed as "${row.label}" is labelled "${ownLabel}" in the data file.`);

    return {
      found: true,
      label: row.label,
      checkedAgainst: "printed table",
      periods: chosen.periods,
      others: series
        .filter((candidate) => !matching.includes(candidate))
        .map((other) => ({
          label: table.rows.find((candidate) => candidate !== row && printedAs(other, table, candidate))?.label ?? other.labels[0] ?? "",
          periods: other.periods,
        })),
      labelConflict: conflicts.length ? conflicts.join(" ") : null,
    };
  }

  if (series.length > 1) {
    return { found: false, reason: `It tags ${series.length} return series for this share class and prints no table to tell them apart.` };
  }
  const only = series[0];
  if (only.labels.length && !only.labels.some((label) => NAV.test(label))) {
    return { found: false, reason: `The only return series tagged for this share class is labelled "${only.labels[0]}", not net asset value.` };
  }
  return { found: true, label: only.labels[0] ?? "", checkedAgainst: "only series tagged", periods: only.periods, others: [], labelConflict: null };
}

export type CostsChoice =
  | {
      found: true;
      start: string;
      end: string;
      /** What the class cost over the period on $10,000, in dollars. */
      paidPer10000Usd: number;
      /** The same as a fraction of $10,000: 0.0003 is 0.03%. */
      ratio: number;
    }
  | { found: false; reason: string };

function chooseCosts(xml: string, contexts: Map<string, XbrlContext>, classId: string, periodEnd: string): CostsChoice {
  const distinct = (name: string) => {
    const found = new Map<string, { value: number; context: XbrlContext; unitRef: string | null }>();
    for (const fact of readFacts(xml, name)) {
      const context = contexts.get(fact.contextRef);
      if (!context || !namesClass(context, classId) || Object.keys(context.dims).length !== 1) continue;
      if (!context.start || context.end !== periodEnd) continue;
      const text = fact.value.trim();
      const value = Number(text);
      if (!text || !Number.isFinite(value)) continue;
      found.set(`${context.start} ${value} ${fact.unitRef}`, { value, context, unitRef: fact.unitRef });
    }
    return [...found.values()];
  };
  const ratios = distinct("oef:ExpenseRatioPct");
  const paid = distinct("oef:ExpensesPaidAmt");
  if (ratios.length !== 1 || paid.length !== 1) {
    return {
      found: false,
      reason: `Expected one cost as a share and one in dollars for the year; it tags ${ratios.length} and ${paid.length}.`,
    };
  }
  if (!/usd/i.test(paid[0].unitRef ?? "")) {
    return { found: false, reason: `Its cost on $10,000 is in ${paid[0].unitRef ?? "no unit"}, not US dollars.` };
  }
  if (ratios[0].context.start !== paid[0].context.start) {
    return { found: false, reason: "Its two cost figures cover different periods." };
  }
  return { found: true, start: ratios[0].context.start, end: periodEnd, paidPer10000Usd: paid[0].value, ratio: ratios[0].value };
}

function classTexts(xml: string, contexts: Map<string, XbrlContext>, classId: string, name: string): string[] {
  const texts: string[] = [];
  for (const fact of readFacts(xml, name)) {
    if (!namesClass(contexts.get(fact.contextRef), classId)) continue;
    const text = htmlText(fact.value);
    if (text && !texts.includes(text)) texts.push(text);
  }
  return texts;
}

const documentValue = (xml: string, name: string) =>
  readFacts(xml, name)
    .map((fact) => htmlText(fact.value))
    .find(Boolean) ?? null;

export interface FundReportExtract {
  classId: string;
  documentType: string | null;
  periodEnd: string | null;
  /** Every ticker the report tags on this class. Matching needs exactly one. */
  tradingSymbols: string[];
  className: string | null;
  fundName: string | null;
  returns: ReturnsChoice;
  costs: CostsChoice;
  pastPerformance: string | null;
  /** The report's statement that its returns leave out a holder's taxes. */
  taxes: string | null;
}

export function extractFundReport(xml: string, classId: string): FundReportExtract {
  const contexts = readContexts(xml);
  const documentEnd = documentValue(xml, "dei:DocumentPeriodEndDate");
  const periodEnd = documentEnd && DATE.test(documentEnd) ? documentEnd : null;
  const tables = [
    ...new Set(
      readFacts(xml, "oef:AvgAnnlRtrTableTextBlock")
        .filter((fact) => namesClass(contexts.get(fact.contextRef), classId))
        .map((fact) => fact.value),
    ),
  ];

  let returns: ReturnsChoice;
  let costs: CostsChoice;
  if (!periodEnd) {
    returns = { found: false, reason: "The report tags no period end date." };
    costs = { found: false, reason: "The report tags no period end date." };
  } else {
    const series = returnSeries(contexts, readFacts(xml, "oef:AvgAnnlRtrPct"), readFacts(xml, "oef:LineGraphAndTableMeasureName"), classId, periodEnd);
    if (typeof series === "string") returns = { found: false, reason: series };
    else if (tables.length > 1) returns = { found: false, reason: "It tags more than one returns table for this share class." };
    else returns = chooseSeries(series, tables.length ? readPrintedTable(tables[0]) : null);
    costs = chooseCosts(xml, contexts, classId, periodEnd);
  }

  const one = (name: string) => classTexts(xml, contexts, classId, name)[0] ?? null;
  return {
    classId,
    documentType: documentValue(xml, "dei:DocumentType"),
    periodEnd,
    tradingSymbols: classTexts(xml, contexts, classId, "dei:TradingSymbol"),
    className: one("oef:ClassName"),
    fundName: one("oef:FundName"),
    returns,
    costs,
    pastPerformance: one("oef:PerformancePastDoesNotIndicateFuture"),
    taxes: one("oef:NoDeductionOfTaxesTextBlock"),
  };
}

/**
 * The parts of a report this module reads for one class, copied verbatim: every
 * context naming the class, the document's own period and type, and the facts
 * in TAGS_READ on them. A report is megabytes; this is kilobytes, so it can be
 * kept beside the data and read again by a test.
 */
export function excerptForClass(xml: string, classId: string, source: string): string {
  const contexts = readContexts(xml);
  const keep = new Set<string>();
  for (const context of contexts.values()) if (namesClass(context, classId)) keep.add(context.id);
  const facts: string[] = [];
  for (const name of TAGS_READ) {
    const documentWide = name === "dei:DocumentPeriodEndDate" || name === "dei:DocumentType";
    for (const fact of readFacts(xml, name)) {
      if (!documentWide && !keep.has(fact.contextRef)) continue;
      if (documentWide) keep.add(fact.contextRef);
      facts.push(fact.raw);
    }
  }
  return [
    `<!-- Excerpt of ${source}`,
    `     for share class ${classId}: its contexts and the facts lib/studio-project/fund-reports.ts reads, as filed. -->`,
    `<fundReportExcerpt classId="${classId}">`,
    ...[...contexts.values()].filter((context) => keep.has(context.id)).map((context) => context.raw),
    ...facts,
    "</fundReportExcerpt>",
    "",
  ].join("\n");
}

export interface HeaderClass {
  seriesId: string;
  seriesName: string;
  classId: string;
  className: string;
  ticker: string | null;
}

/** The series and share classes a filing's EDGAR header says it covers. */
export function readHeaderClasses(header: string): HeaderClass[] {
  const field = (text: string, tag: string) => text.match(new RegExp(`<${tag}>([^<\\r\\n]*)`))?.[1]?.trim() ?? "";
  const classes: HeaderClass[] = [];
  for (const block of header.split("<SERIES>").slice(1)) {
    const series = block.split("</SERIES>")[0];
    const seriesId = field(series, "SERIES-ID");
    const seriesName = field(series, "SERIES-NAME");
    for (const piece of series.split("<CLASS-CONTRACT>").slice(1)) {
      classes.push({
        seriesId,
        seriesName,
        classId: field(piece, "CLASS-CONTRACT-ID"),
        className: field(piece, "CLASS-CONTRACT-NAME"),
        ticker: field(piece, "CLASS-CONTRACT-TICKER-SYMBOL") || null,
      });
    }
  }
  return classes;
}

/** One row of the SEC's fund ticker list, company_tickers_mf.json. */
export interface SecListRow {
  cik: string;
  seriesId: string;
  classId: string;
  symbol: string;
}

/**
 * Everything that stops a ticker being matched to the class this report was read
 * for. Three records must agree: the SEC's fund ticker list, the share classes
 * the filing's header lists, and the ticker the report itself tags on the class.
 * Empty means matched.
 */
export function classMatchProblems(symbol: string, list: SecListRow[], header: HeaderClass[], extract: FundReportExtract): string[] {
  const listed = list.filter((row) => row.symbol === symbol);
  if (listed.length !== 1) return [`The SEC's fund ticker list has ${listed.length} share classes under ${symbol}.`];
  const { classId, seriesId } = listed[0];
  const problems: string[] = [];
  if (extract.classId !== classId) {
    problems.push(`The SEC's fund ticker list gives ${symbol} as ${classId}, but this report was read for ${extract.classId}.`);
  }
  const inHeader = header.filter((entry) => entry.classId === classId);
  if (!inHeader.length) problems.push(`The filing's header does not list ${classId}.`);
  for (const entry of inHeader) {
    if (entry.seriesId !== seriesId) problems.push(`The filing's header puts ${classId} in series ${entry.seriesId}, not ${seriesId}.`);
    if (entry.ticker !== symbol) problems.push(`The filing's header gives ${classId} the ticker ${entry.ticker ?? "none"}, not ${symbol}.`);
  }
  if (extract.tradingSymbols.length !== 1 || extract.tradingSymbols[0] !== symbol) {
    problems.push(
      `The report tags ${classId} with ${extract.tradingSymbols.length ? extract.tradingSymbols.join(", ") : "no ticker"}, not ${symbol}.`,
    );
  }
  return problems;
}

/** One fund as scripts/source/fetch-fund-reports.mjs writes it. */
export interface FundReportEntry {
  instrumentId: string;
  symbol: string;
  cik: string;
  registrant: string;
  seriesId: string;
  seriesName: string;
  classId: string;
  /** How many share classes the series has, per the filing's header. */
  classesInSeries: number;
  accession: string;
  form: string;
  filedAt: string;
  url: string;
  instanceBytes: number;
  /** Repository path of the verbatim excerpt the figures can be read again from. */
  excerpt: string;
  /** Empty when the class is matched to its ticker and the filing agrees with itself. */
  problems: string[];
  extract: FundReportExtract | null;
}
