/**
 * Where a company's revenue comes from: product lines, regions and segments,
 * and the customers it depends on, read from its annual report's own XBRL data
 * file.
 *
 * The SEC's company facts leave out every figure that carries a dimension, and
 * a breakdown is exactly that: Atkore's six product lines are its revenue tagged
 * on the product-or-service axis. So they are read from the filing's data file
 * (`*_htm.xml`), with names from its label file.
 *
 * One rule a learner can rely on: **a breakdown is shown as shares only when its
 * parts add up to the total revenue the same filing reports.** Filings tag more
 * than clean breakdowns on these axes, and a plain sum gets them wrong. Measured
 * on 2026-09-13:
 *
 * - Apple tags "Products" beside iPhone, Mac, iPad and Wearables, which are its
 *   parts, so every product row summed comes to 174% of revenue;
 * - Nucor tags intersegment amounts on the same axis as segment sales;
 * - Netflix tags one region on its own, the United States, which is 41%;
 * - Hubbell tags a change of accounting method on a restatement axis;
 * - Eaton tags its total twice, $27,448m in its statements and $27.4bn in its text.
 *
 * So only the product, region and segment axes are read. Where every part
 * together overshoots, the largest set of parts that adds up is used, and only
 * if it is the only set of that size and each part left out is itself the sum of
 * parts kept. Anything else is not shown, and the page says what the parts came
 * to instead.
 *
 * Nothing here touches the network.
 */

export type BreakdownKind = "products" | "regions" | "segments";

export interface BreakdownRow {
  /** The member as tagged, such as atkr:MechanicalTubeMember. */
  member: string;
  label: string;
  /** In the filing's currency, as tagged. */
  value: number;
  /** A fraction of total revenue. */
  share: number;
  /** For a product line tagged under one segment, that segment's name. */
  within: string | null;
}

export type Breakdown =
  | { kind: BreakdownKind; found: true; rows: BreakdownRow[]; subtotalsLeftOut: string[] }
  | { kind: BreakdownKind; found: false; reason: string };

export interface CustomerShare {
  customer: string;
  /** What the share is of: sales, or what customers owed at the year end. */
  of: "sales" | "receivables";
  share: number;
}

export interface RevenueBreakdown {
  periodStart: string;
  periodEnd: string;
  /** The revenue concept the total and every breakdown are read from. */
  concept: string;
  total: number;
  breakdowns: Breakdown[];
  customers: CustomerShare[];
}

export type RevenueResult = { found: true; revenue: RevenueBreakdown } | { found: false; reason: string };

export const REVENUE_CONCEPTS = [
  "us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax",
  "us-gaap:Revenues",
  "us-gaap:RevenueFromContractWithCustomerIncludingAssessedTax",
] as const;
export const CONCENTRATION = "us-gaap:ConcentrationRiskPercentage1";
/** Every tag this module reads. A trimmed copy of a data file keeps these and their contexts. */
export const TAGS_READ = [...REVENUE_CONCEPTS, CONCENTRATION, "dei:DocumentPeriodEndDate"] as const;

const AXIS: Record<BreakdownKind, string> = {
  products: "ProductOrServiceAxis",
  regions: "StatementGeographicalAxis",
  segments: "StatementBusinessSegmentsAxis",
};
const CONSOLIDATION_AXIS = "ConsolidationItemsAxis";
const OPERATING_SEGMENTS = "OperatingSegmentsMember";
/** Axes a breakdown may be tagged on. Anything else (restatements, equity components) is not a breakdown. */
const ALLOWED_AXES = new Set([AXIS.products, AXIS.regions, AXIS.segments, CONSOLIDATION_AXIS]);
/** Beyond this many parts the search for a set that adds up is not attempted. */
const MAX_SEARCH = 16;

const localName = (qname: string) => qname.slice(qname.indexOf(":") + 1);

// ---------------------------------------------------------------------------
// Reading the data file
// ---------------------------------------------------------------------------

interface Context {
  start: string;
  end: string;
  dims: [axis: string, member: string][];
  typed: boolean;
}

interface Fact {
  concept: string;
  context: Context;
  text: string;
  /** Rounding of the tagged value, as a unit: decimals -3 is 1,000. Zero when exact. */
  unit: number;
  /** What the value is measured in, such as iso4217:USD. Empty when the data file does not say. */
  measure: string;
}

export interface XbrlInstance {
  periodEnd: string | null;
  facts: Fact[];
}

export function readInstance(xml: string): XbrlInstance {
  const contexts = new Map<string, Context>();
  for (const match of xml.matchAll(/<(?:xbrli:)?context\b[^>]*?\bid="([^"]+)"[^>]*>([\s\S]*?)<\/(?:xbrli:)?context>/g)) {
    const body = match[2];
    const date = (tag: string) => body.match(new RegExp(`<(?:xbrli:)?${tag}>\\s*([^<]*?)\\s*<`))?.[1] ?? "";
    const instant = date("instant");
    contexts.set(match[1], {
      start: instant ? "" : date("startDate"),
      end: instant || date("endDate"),
      dims: [...body.matchAll(/<xbrldi:explicitMember\b[^>]*?dimension="([^"]+)"[^>]*>([^<]*)</g)].map(
        (member) => [member[1], member[2].trim()] as [string, string],
      ),
      typed: /<xbrldi:typedMember\b/.test(body),
    });
  }

  const measures = new Map<string, string>();
  for (const match of xml.matchAll(/<(?:xbrli:)?unit\b[^>]*?\bid="([^"]+)"[^>]*>([\s\S]*?)<\/(?:xbrli:)?unit>/g)) {
    const measure = match[2].match(/<(?:xbrli:)?measure>\s*([^<]*?)\s*</)?.[1];
    if (measure && !/<(?:xbrli:)?divide\b/.test(match[2])) measures.set(match[1], measure);
  }

  const facts: Fact[] = [];
  for (const tag of TAGS_READ) {
    for (const match of xml.matchAll(new RegExp(`<${tag}(?=[\\s/>])([^>]*?)(?:/>|>([^<]*)</${tag}>)`, "g"))) {
      const contextRef = match[1].match(/contextRef="([^"]+)"/)?.[1];
      const context = contextRef ? contexts.get(contextRef) : undefined;
      if (!context || match[2] === undefined) continue;
      const decimals = match[1].match(/decimals="([^"]+)"/)?.[1];
      const places = decimals === undefined || decimals === "INF" ? null : Number(decimals);
      facts.push({
        concept: tag,
        context,
        text: match[2].trim(),
        unit: places === null || !Number.isFinite(places) ? 0 : 10 ** -places,
        measure: measures.get(match[1].match(/unitRef="([^"]+)"/)?.[1] ?? "") ?? "",
      });
    }
  }
  const periodEnd = facts.find((fact) => fact.concept === "dei:DocumentPeriodEndDate")?.text ?? null;
  return { periodEnd: periodEnd && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(periodEnd) ? periodEnd : null, facts };
}

// ---------------------------------------------------------------------------
// Names
// ---------------------------------------------------------------------------

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

const tidy = (label: string) =>
  decodeEntities(label)
    .replace(/\s*\[(Member|Domain|Axis)\]\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Labels for every concept a label linkbase names, preferring the short one.
 *
 * Most filers ship a `_lab.xml`; some, Nucor among them, put the label linkbase
 * inside their schema instead, and the same elements are read from either.
 */
export function readLabels(linkbase: string): Map<string, string> {
  const locators = new Map<string, string>();
  for (const match of linkbase.matchAll(/<(?:\w+:)?loc\b([^>]*)\/?>/g)) {
    const href = match[1].match(/xlink:href="[^"#]*#([^"]+)"/)?.[1];
    const key = match[1].match(/xlink:label="([^"]+)"/)?.[1];
    if (href && key) locators.set(key, href);
  }
  const resources = new Map<string, { role: string; text: string }[]>();
  for (const match of linkbase.matchAll(/<(?:\w+:)?label\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?label>/g)) {
    const key = match[1].match(/xlink:label="([^"]+)"/)?.[1];
    if (!key) continue;
    const role = (match[1].match(/xlink:role="([^"]+)"/)?.[1] ?? "").split("/").pop() ?? "";
    resources.set(key, [...(resources.get(key) ?? []), { role, text: match[2] }]);
  }
  const found = new Map<string, { role: string; text: string }[]>();
  for (const match of linkbase.matchAll(/<(?:\w+:)?labelArc\b([^>]*)\/?>/g)) {
    const concept = locators.get(match[1].match(/xlink:from="([^"]+)"/)?.[1] ?? "");
    const labels = resources.get(match[1].match(/xlink:to="([^"]+)"/)?.[1] ?? "");
    if (concept && labels) found.set(concept, [...(found.get(concept) ?? []), ...labels]);
  }
  const labels = new Map<string, string>();
  for (const [concept, candidates] of found) {
    const best = candidates.find((label) => label.role === "terseLabel") ?? candidates.find((label) => label.role === "label");
    if (best) labels.set(concept, tidy(best.text));
  }
  return labels;
}

/** A member's name: its label, or failing that its own name split into words. */
export function nameOf(member: string, labels: Map<string, string>): string {
  const labelled = labels.get(member.replace(":", "_"));
  if (labelled) return labelled;
  const bare = localName(member).replace(/Member$/, "");
  return bare.length <= 3 ? bare : bare.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
}

// ---------------------------------------------------------------------------
// Adding up
// ---------------------------------------------------------------------------

const within = (sum: number, total: number, tolerance: number) => Math.abs(sum - total) <= tolerance;

function subsetSums(values: number[], target: number, tolerance: number): boolean {
  for (let mask = 1; mask < 1 << values.length; mask++) {
    let sum = 0;
    for (let index = 0; index < values.length; index++) if (mask & (1 << index)) sum += values[index];
    if (within(sum, target, tolerance)) return true;
  }
  return false;
}

type Reconciled = { rows: number[]; leftOut: number[] } | { sum: number };

/**
 * Which parts to show, by index, or what they came to instead.
 *
 * All of them, if they add up. Otherwise the largest set that does, provided no
 * other set of that size also does, and every part left out is the sum of some
 * parts kept: a subtotal, like Apple's "Products", rather than a missing piece.
 */
function reconcile(values: number[], total: number, tolerance: number): Reconciled {
  const all = values.reduce((sum, value) => sum + value, 0);
  if (within(all, total, tolerance)) return { rows: values.map((_, index) => index), leftOut: [] };
  if (all < total || values.length > MAX_SEARCH) return { sum: all };

  let best: number[] | null = null;
  let tied = false;
  for (let mask = 1; mask < 1 << values.length; mask++) {
    const chosen: number[] = [];
    let sum = 0;
    for (let index = 0; index < values.length; index++) {
      if (mask & (1 << index)) {
        chosen.push(index);
        sum += values[index];
      }
    }
    if (!within(sum, total, tolerance)) continue;
    if (!best || chosen.length > best.length) {
      best = chosen;
      tied = false;
    } else if (chosen.length === best.length) {
      tied = true;
    }
  }
  if (!best || tied) return { sum: all };
  const kept = best;
  const leftOut = values.map((_, index) => index).filter((index) => !kept.includes(index));
  const keptValues = kept.map((index) => values[index]);
  if (!leftOut.every((index) => subsetSums(keptValues, values[index], tolerance))) return { sum: all };
  return { rows: kept, leftOut };
}

const KIND_WORDS: Record<BreakdownKind, string> = {
  products: "product lines",
  regions: "regions",
  segments: "segments",
};

function breakdown(kind: BreakdownKind, facts: Fact[], total: number, labels: Map<string, string>): Breakdown {
  const axis = AXIS[kind];
  const candidates = facts.filter((fact) => {
    const axes = fact.context.dims.map(([name]) => localName(name));
    if (fact.context.typed || !axes.includes(axis) || !axes.every((name) => ALLOWED_AXES.has(name))) return false;
    // Consolidation items are allowed only as the operating segments themselves.
    return fact.context.dims.every(([name, member]) => localName(name) !== CONSOLIDATION_AXIS || localName(member) === OPERATING_SEGMENTS);
  });
  if (!candidates.length) return { kind, found: false, reason: `Its data file tags no revenue by ${KIND_WORDS[kind]}.` };

  // Each distinct set of other axes is a separate way the filing tagged this breakdown.
  const shapes = new Map<string, Fact[]>();
  for (const fact of candidates) {
    const others = fact.context.dims.map(([name]) => localName(name)).filter((name) => name !== axis).sort().join("+");
    shapes.set(others, [...(shapes.get(others) ?? []), fact]);
  }
  const order = (shape: string) => (shape === "" ? 0 : shape === AXIS.segments ? 1 : shape === CONSOLIDATION_AXIS ? 2 : 3);

  let nearest: number | null = null;
  for (const shape of [...shapes.keys()].sort((a, b) => order(a) - order(b))) {
    const group = shapes.get(shape) ?? [];
    const otherAxes = shape ? shape.split("+") : [];

    // Another breakdown axis may ride along only as a single member (Netflix's regions, all "Streaming"),
    // or, for product lines, as the segment each line sits in.
    const carriersOk = otherAxes.every((other) => {
      if (other === CONSOLIDATION_AXIS) return true;
      if (kind === "products" && other === AXIS.segments) return true;
      const members = new Set(group.map((fact) => fact.context.dims.find(([name]) => localName(name) === other)?.[1]));
      return members.size === 1;
    });
    if (!carriersOk) continue;

    const byMember = new Map<string, { value: number; segments: Set<string> }>();
    const seen = new Set<string>();
    let unit = 0;
    for (const fact of group) {
      const value = Number(fact.text);
      if (!fact.text || !Number.isFinite(value)) continue;
      const key = `${fact.context.dims.map(([name, member]) => `${name}=${member}`).sort().join("&")}#${value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unit = Math.max(unit, fact.unit);
      const member = fact.context.dims.find(([name]) => localName(name) === axis)![1];
      const segment = fact.context.dims.find(([name]) => localName(name) === AXIS.segments)?.[1];
      const entry = byMember.get(member) ?? { value: 0, segments: new Set<string>() };
      entry.value += value;
      if (segment && kind === "products") entry.segments.add(segment);
      byMember.set(member, entry);
    }
    const members = [...byMember.keys()];
    const values = members.map((member) => byMember.get(member)!.value);
    // The parts and the total are each rounded to at most this unit, so they can be that far apart and no further.
    // The last term only absorbs floating-point error, which is far below a cent at any revenue a filing reports.
    const tolerance = (values.length + 1) * unit + Number.EPSILON * Math.abs(total) * 4 * (values.length + 1);
    const result = reconcile(values, total, tolerance);

    if ("sum" in result) {
      if (nearest === null || Math.abs(result.sum - total) < Math.abs(nearest - total)) nearest = result.sum;
      continue;
    }
    const rows = result.rows
      .map((index) => {
        const member = members[index];
        const segments = [...byMember.get(member)!.segments];
        return {
          member,
          label: nameOf(member, labels),
          value: values[index],
          share: values[index] / total,
          within: segments.length === 1 ? nameOf(segments[0], labels) : null,
        };
      })
      .filter((row) => row.value !== 0);
    return { kind, found: true, rows, subtotalsLeftOut: result.leftOut.map((index) => nameOf(members[index], labels)) };
  }

  return {
    kind,
    found: false,
    reason:
      nearest === null
        ? `Its ${KIND_WORDS[kind]} are tagged in a way that cannot be added up.`
        : `The ${KIND_WORDS[kind]} it tags add up to ${((nearest / total) * 100).toFixed(1)}% of its revenue, not all of it, so they are not shown as shares.`,
  };
}

function customers(facts: Fact[], periodEnd: string, labels: Map<string, string>): CustomerShare[] {
  const shares: CustomerShare[] = [];
  const seen = new Set<string>();
  for (const fact of facts) {
    if (fact.concept !== CONCENTRATION || fact.context.end !== periodEnd || fact.context.typed) continue;
    const dims = new Map(fact.context.dims.map(([name, member]) => [localName(name), member]));
    if (localName(dims.get("ConcentrationRiskByTypeAxis") ?? "") !== "CustomerConcentrationRiskMember") continue;
    if ([...dims.keys()].some((name) => !["ConcentrationRiskByTypeAxis", "ConcentrationRiskByBenchmarkAxis", "MajorCustomersAxis"].includes(name))) continue;
    const benchmark = localName(dims.get("ConcentrationRiskByBenchmarkAxis") ?? "");
    const of = /Receivable/i.test(benchmark) ? "receivables" : /Revenue|Sales/i.test(benchmark) ? "sales" : null;
    const share = Number(fact.text);
    if (!of || !Number.isFinite(share)) continue;
    const customerMember = dims.get("MajorCustomersAxis");
    const customer = customerMember ? nameOf(customerMember, labels) : "A customer the report does not name";
    const key = `${customer}|${of}|${share}`;
    if (seen.has(key)) continue;
    seen.add(key);
    shares.push({ customer, of, share });
  }
  return shares.sort((a, b) => (a.of === b.of ? b.share - a.share : a.of === "sales" ? -1 : 1));
}

/**
 * The year's total, when every figure tagged for it agrees. A filing can tag one
 * total at two precisions, as Eaton's is: $27,448m to the million, and $27.4bn to
 * the hundred million. Those agree, and the more precise is used. Figures that do
 * not round to each other at their own stated precision are not a total at all.
 */
function consistentTotal(facts: Fact[]): number | null {
  const figures = facts.map((fact) => ({ value: Number(fact.text), unit: fact.unit })).filter((figure) => Number.isFinite(figure.value));
  if (!figures.length) return null;
  const precise = figures.reduce((best, figure) => (figure.unit < best.unit ? figure : best));
  const agree = figures.every((figure) =>
    figure.unit === 0 ? figure.value === precise.value : Math.round(precise.value / figure.unit) * figure.unit === figure.value,
  );
  return agree ? precise.value : null;
}

/** Everything the reader shows about where a company's revenue comes from, for the year the report covers. */
export function readRevenue(instanceXml: string, labelLinkbase: string): RevenueResult {
  const instance = readInstance(instanceXml);
  if (!instance.periodEnd) return { found: false, reason: "Its data file does not say which period it covers." };
  const periodEnd = instance.periodEnd;
  const labels = readLabels(labelLinkbase);

  const isYear = (context: Context) => {
    if (context.end !== periodEnd || !context.start) return false;
    const days = (Date.parse(`${context.end}T00:00:00Z`) - Date.parse(`${context.start}T00:00:00Z`)) / 86_400_000;
    return days >= 350 && days <= 380;
  };

  let disagreeing = false;
  for (const concept of REVENUE_CONCEPTS) {
    const year = instance.facts.filter((fact) => fact.concept === concept && isYear(fact.context) && fact.measure === "iso4217:USD");
    const untagged = year.filter((fact) => fact.context.dims.length === 0);
    const total = consistentTotal(untagged);
    if (total === null) {
      if (untagged.length) disagreeing = true;
      continue;
    }
    if (total <= 0) continue;
    return {
      found: true,
      revenue: {
        periodStart: year.find((fact) => fact.context.dims.length === 0)!.context.start,
        periodEnd,
        concept,
        total,
        breakdowns: (["products", "regions", "segments"] as const).map((kind) => breakdown(kind, year, total, labels)),
        customers: customers(instance.facts, periodEnd, labels),
      },
    };
  }
  if (disagreeing) {
    return {
      found: false,
      reason: "Its data file tags the year's total revenue as figures that do not agree, so its breakdowns cannot be checked against one.",
    };
  }
  // A total in another currency is refused by name, rather than printed as though it were dollars.
  const foreign = instance.facts.find(
    (fact) =>
      (REVENUE_CONCEPTS as readonly string[]).includes(fact.concept) &&
      isYear(fact.context) &&
      fact.context.dims.length === 0 &&
      fact.measure !== "" &&
      fact.measure !== "iso4217:USD",
  );
  if (foreign) {
    return {
      found: false,
      reason: `Its revenue is tagged in ${localName(foreign.measure)}, not US dollars, and this reader does not convert currencies.`,
    };
  }
  return {
    found: false,
    reason: "Its data file tags no single total revenue for the year under US accounting rules, so its breakdowns cannot be checked against one.",
  };
}

/**
 * Which files in a filing to read: the data file, and where its labels are.
 * Labels come from the label linkbase when there is one, and from the schema
 * otherwise, which is where Nucor keeps them.
 */
export function pickXbrlFiles(names: string[], primaryDocument: string): { instance: string | null; labels: string | null } {
  const base = primaryDocument.replace(/\.htm[l]?$/i, "");
  const prefer = (candidates: string[]) => candidates.find((name) => name.startsWith(base)) ?? candidates[0] ?? null;
  return {
    instance: prefer(names.filter((name) => name.endsWith("_htm.xml"))),
    labels: prefer(names.filter((name) => name.endsWith("_lab.xml"))) ?? prefer(names.filter((name) => name.endsWith(".xsd"))),
  };
}
