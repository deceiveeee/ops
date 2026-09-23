/**
 * The industry map, as *Measuring the Moat* sets it out.
 *
 * Mauboussin and Callahan, Consilient Observer, 15 October 2024, pp. 13-14, and
 * the checklist's Lay of the Land section on p. 67. Page for every string:
 * `docs/source-audits/studio-industry-map.md`.
 *
 * "The goal is to include all of the companies or entities that may have an
 * impact on the profitability of the firm you are analyzing" (p. 13). Suppliers
 * left, customers right, government across the top, and the things that affect
 * everyone underneath — which is how Exhibit 9 is drawn.
 *
 * Studio knows who supplies or buys from almost nobody, and says so rather than
 * offering a list of plausible names. What it does know is where the names are:
 * in the company's own filings, which the reader already opens.
 */

/** Where something sits on the map. Exhibit 9's own arrangement. */
export type Zone = "suppliers" | "rivals" | "customers" | "government" | "other";

export const ZONES: { key: Zone; label: string; sourceLabel: string; whatBelongs: string; asks: boolean }[] = [
  {
    key: "suppliers",
    label: "What it buys from",
    sourceLabel: "Suppliers",
    whatBelongs: "Whoever provides the firm with its inputs. On the left of the paper's map.",
    asks: true,
  },
  {
    key: "rivals",
    label: "Who it competes with",
    sourceLabel: "The industry",
    whatBelongs:
      "The companies doing the same thing, listed together in the middle. The paper suggests including whoever might arrive, too, as far as they can be identified.",
    asks: true,
  },
  {
    key: "customers",
    label: "Who buys from it",
    sourceLabel: "Customers",
    whatBelongs:
      "The purchasers of the goods or services, and whoever stands between the firm and them. On the right of the paper's map.",
    asks: true,
  },
  {
    key: "government",
    label: "The rules it works under",
    sourceLabel: "Government",
    whatBelongs:
      "Regulation, tariffs, anti-trust, financial aid, services the state requires. The paper puts these across the top, affecting everyone.",
    asks: false,
  },
  {
    key: "other",
    label: "Things that affect everyone",
    sourceLabel: "Other factors",
    whatBelongs:
      "Anything else that might affect the firm's profits. Exhibit 9's own four are economic conditions, geopolitical risk, climate change and a global pandemic.",
    asks: false,
  },
];

export const ZONE_BY_KEY = new Map(ZONES.map((zone) => [zone.key, zone]));

/**
 * The kinds of economic interaction, p. 13, each with the paper's own example.
 *
 * Asked only where a counterparty exists. A tariff is not in a contractual
 * relationship with anybody, and offering the list against one would be asking
 * a question the framework does not put.
 */
export type Relationship =
  | "non-contractual"
  | "contractual"
  | "cost-plus"
  | "best-efforts"
  | "licence"
  | "option"
  | "other";

export const RELATIONSHIPS: { key: Relationship; label: string; example: string }[] = [
  { key: "non-contractual", label: "No contract", example: "travellers buying airline tickets" },
  { key: "contractual", label: "Under contract", example: "software sold as a service" },
  { key: "cost-plus", label: "Cost plus a margin", example: "a government buying defence systems" },
  { key: "best-efforts", label: "Best efforts", example: "a bank underwriting a security for an issuer" },
  { key: "licence", label: "A licence", example: "a film based on a doll" },
  { key: "option", label: "An option", example: "an airline ordering aircraft" },
  { key: "other", label: "Some other arrangement", example: "the paper's own last item" },
];

export const RELATIONSHIP_BY_KEY = new Map(RELATIONSHIPS.map((kind) => [kind.key, kind]));

/**
 * Exhibit 9, the paper's map of the U.S. airline industry, as it lists it.
 *
 * Shown as the model before a learner builds one. The tags on the airlines —
 * hub, LCC, regional — are the paper's, and LCC is its own note: low-cost
 * carrier.
 */
export const EXAMPLE = {
  what: "The paper's own map: U.S. airlines",
  source: "Exhibit 9, p. 14. Source line: Counterpoint Global.",
  note: "LCC means low-cost carrier, which is the paper's own note on the exhibit.",
  zones: {
    suppliers: [
      "Financing — leasing, banks, investors",
      "Airports — gates, takeoff and landing slots",
      "Jet fuel",
      "Unions",
      "Labour — cabin crew, pilots, ground staff",
      "External providers — Atlas Air, Air Transport Services Group",
      "Parts suppliers — engines: CFM International, General Electric, Pratt & Whitney, Rolls-Royce",
      "Aircraft — Boeing, Airbus, Bombardier, AVIC, Embraer",
    ],
    rivals: [
      "Delta (hub)",
      "American (hub)",
      "Southwest (LCC)",
      "United (hub)",
      "Alaska (hub)",
      "JetBlue (LCC)",
      "Spirit (LCC)",
      "Frontier (LCC)",
      "SkyWest (regional)",
      "Allegiant Travel (LCC)",
    ],
    customers: [
      "Global distribution systems — Sabre, Amadeus, Travelport",
      "Travel intermediaries — travel agents, corporate travel departments",
      "Website aggregators — Booking.com, Expedia, TripAdvisor",
      "Fliers — commercial and business",
      "Air freight and logistics — Amazon Air, UPS, FedEx",
    ],
    government: ["Regulation", "Anti-trust", "Financial aid", "Mandated services such as security and air traffic control"],
    other: ["Economic conditions", "Geopolitical risk", "Climate change", "Global pandemic"],
  } satisfies Record<Zone, string[]>,
};

/** Why the paper thinks the connections are worth tracing, p. 13. Said once. */
export const WHY_IT_PAYS =
  "The paper reports that when a shock to one firm reaches others through supply or demand links, the market often fails to reflect it promptly — and that analysts who follow both suppliers and customers forecast more accurately than those who follow only suppliers.";

/**
 * Something a learner has put on their own map.
 *
 * `relationship` is absent for the zones that have no counterparty, and every
 * entry carries the learner's own sentence about how it reaches the company's
 * profits — which is the whole point of the exercise and the part no list of
 * names would give.
 */
export interface MapEntry {
  id: string;
  savedAt: string;
  zone: Zone;
  /** The learner's own name for it. Never resolved against anything. */
  name: string;
  relationship?: Relationship;
  /** How it reaches this company's profits, in the learner's words. */
  affects: string;
  /** Kept passages from the company's filings that name it. May be empty. */
  passageIds: string[];
}

export type MapEntryEdit = Omit<MapEntry, "id" | "savedAt">;

/** Whether an entry is complete enough to put on the map. */
export function whatIsMissing(entry: Partial<MapEntryEdit>): string[] {
  const missing: string[] = [];
  const zone = entry.zone ? ZONE_BY_KEY.get(entry.zone) : undefined;
  if (!zone) missing.push("where it sits on the map");
  if (!entry.name?.trim()) missing.push("what it is called");
  if (zone?.asks && !entry.relationship) missing.push("what kind of arrangement it is");
  if (!entry.affects?.trim()) missing.push("how it reaches this company's profits");
  return missing;
}

/** The entries in each zone, in the order they were added. */
export function byZone(entries: MapEntry[]): Record<Zone, MapEntry[]> {
  const grouped = Object.fromEntries(ZONES.map((zone) => [zone.key, [] as MapEntry[]])) as Record<Zone, MapEntry[]>;
  for (const entry of entries) grouped[entry.zone]?.push(entry);
  return grouped;
}

/**
 * What is still empty, put as the paper's own instruction rather than as a
 * score.
 *
 * A map with nothing on the customer side is not a worse map than one with
 * three names on it; it is an unfinished one, and the difference matters. The
 * paper's goal is everything that may affect profitability, so the honest
 * prompt is which sides have not been looked at.
 */
export function stillEmpty(entries: MapEntry[]): Zone[] {
  const grouped = byZone(entries);
  return ZONES.filter((zone) => grouped[zone.key].length === 0).map((zone) => zone.key);
}
