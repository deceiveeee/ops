/**
 * The value stick, as *Measuring the Moat* sets it out.
 *
 * Mauboussin and Callahan, Counterpoint Global Insights, Consilient Observer,
 * 15 October 2024, pp. 40-55 and the checklist on p. 68. The model is Adam
 * Brandenburger and Harborne Stuart's; the picture is the one Felix
 * Oberholzer-Gee popularized, and the paper sources both exhibits to his
 * *Better, Simpler Strategy* (Harvard Business Review Press, 2021), 14. Studio
 * has not read that book: everything here is as the paper reports it.
 *
 * Page for every string: `docs/source-audits/studio-value-stick.md`.
 *
 * Two of the four marks cannot be observed. The paper says so of one — "WTP can
 * be difficult to measure but is determined by economic, emotional, and
 * situational drivers" (p. 40) — and offers no method for either, so nothing
 * here asks a learner for a willingness in dollars for a real company. The
 * worked example below carries numbers because Studio invented the business it
 * describes, and says so.
 */

/** The four marks on the stick, top to bottom. The paper's order, p. 40. */
export type Mark = "wtp" | "price" | "cost" | "wts";

export const MARKS: { key: Mark; label: string; sourceLabel: string; definition: string }[] = [
  {
    key: "wtp",
    label: "The most a customer would pay",
    sourceLabel: "Willingness to pay",
    definition:
      "The price at which a customer is indifferent between the offering and the cash. Above it they would rather keep the money.",
  },
  {
    key: "price",
    label: "What it charges",
    sourceLabel: "Price",
    definition: "The price the company charges its customers for the good or service.",
  },
  {
    key: "cost",
    label: "What it pays",
    sourceLabel: "Cost",
    definition: "What the company has to spend to acquire the inputs to provide the offering.",
  },
  {
    key: "wts",
    label: "The least a supplier would accept",
    sourceLabel: "Willingness to sell",
    definition:
      "The price at which a supplier — most often an employee — is indifferent between withholding their product or service and the cash.",
  },
];

/** The three bands between the marks, p. 40. */
export interface Bands {
  /** Price below willingness to pay. The customer's share. */
  consumerSurplus: number;
  /** Price less cost. The paper adds: including the opportunity cost of capital. */
  firmValue: number;
  /** Suppliers receiving more than their willingness to sell. */
  supplierSurplus: number;
  /** Willingness to pay less willingness to sell: everything there is to share. */
  total: number;
}

export interface Stick {
  wtp: number;
  price: number;
  cost: number;
  wts: number;
}

/**
 * What each band is worth, and whether the stick makes sense at all.
 *
 * A negative band is not an error to hide. A price above willingness to pay is a
 * sale that does not happen; a cost above price is a business losing money on
 * every unit. Both are real states a learner should be able to produce by
 * dragging a mark past its neighbour, and the surface says which one they have
 * made rather than clamping the number and pretending otherwise.
 */
export function bands(stick: Stick): Bands {
  return {
    consumerSurplus: stick.wtp - stick.price,
    firmValue: stick.price - stick.cost,
    supplierSurplus: stick.cost - stick.wts,
    total: stick.wtp - stick.wts,
  };
}

/** What has gone wrong with a stick, in the order a learner would notice it. */
export function whatIsWrong(stick: Stick): string[] {
  const wrong: string[] = [];
  if (stick.price > stick.wtp) wrong.push("It is charging more than the customer would pay, so nobody buys.");
  if (stick.cost > stick.price) wrong.push("It is paying more for the inputs than it charges, so it loses money on every sale.");
  if (stick.wts > stick.cost) wrong.push("It is paying its suppliers less than they would accept, so they stop supplying.");
  return wrong;
}

export type Side = "wtp" | "wts";

export interface Lever {
  id: string;
  side: Side;
  /** Exhibit 29's own name for it, p. 43. */
  sourceLabel: string;
  /** What a learner reads, before meeting the paper's term. */
  label: string;
  /** What it is, in the paper's sense. */
  whatItIs: string;
  /** The question the checklist puts, p. 68, where it puts one. */
  asks: string;
  /** What it does to the stick in the worked example, in its units. */
  moves: number;
}

/**
 * Exhibit 29's six levers. Three raise willingness to pay, three lower
 * willingness to sell, and the paper groups them exactly this way.
 *
 * `moves` is how far each one shifts the worked example's mark. Those sizes are
 * Studio's, invented for a business Studio invented, and are not a claim about
 * how much any lever is worth anywhere.
 */
export const LEVERS: Lever[] = [
  {
    id: "network",
    side: "wtp",
    sourceLabel: "Network effects",
    label: "Worth more as more people use it",
    whatItIs:
      "The value of the good or service increases as more people use it. It comes in three forms: people connecting with each other directly, a thing worth more because something else it goes with is cheap, and a platform that is worth more to each side as the other side grows.",
    asks: "Are there network effects?",
    moves: 14,
  },
  {
    id: "complements",
    side: "wtp",
    sourceLabel: "Complements",
    label: "Something else it goes with",
    whatItIs:
      "A complement is a good or service consumed with another one. What a customer will pay for one goes up when the cost of the other goes down — the paper's example is hot dogs and buns.",
    asks: "Are there complementary products and is their cost going up or down?",
    moves: 8,
  },
  {
    id: "products",
    side: "wtp",
    sourceLabel: "Products and services",
    label: "Status, habit, or not having to look elsewhere",
    whatItIs:
      "Offerings that confer status, reduce the effort of finding something suitable, are used out of habit, or would cost something to switch away from, induce a higher willingness to pay than others in the market.",
    asks: "Do the company's products provide prestige, promote habit, or lower search costs?",
    moves: 10,
  },
  {
    id: "supply",
    side: "wts",
    sourceLabel: "Lower supply cost",
    label: "Making its suppliers' lives easier",
    whatItIs:
      "Sharing what it knows about demand so a supplier can hold less stock; a process protected by a patent, licence or where it sits; or unique access to an input. Each lowers what a supplier needs in order to be willing to sell.",
    asks: "Does the company lower supplier costs via data sharing?",
    moves: -9,
  },
  {
    id: "productivity",
    side: "wts",
    sourceLabel: "Productivity",
    label: "Needing less to make the same thing",
    whatItIs:
      "How well the company performs the activities it has in common with its competitors. Doing them better lowers its cost, because it needs fewer inputs to produce the same output.",
    asks: "Is the company more productive than its peers?",
    moves: -12,
  },
  {
    id: "employees",
    side: "wts",
    sourceLabel: "Employee relations",
    label: "People who want to work there",
    whatItIs:
      "Labour is the largest expense for most companies, so what employees will accept matters most of all. Paying above it can lower turnover and hiring costs — but the paper warns that paying more on its own is a transfer away from everyone else, and that what works is a culture people want to be part of.",
    asks: "Does the company have a culture that creates employee surplus?",
    moves: -7,
  },
];

export const LEVER_BY_ID = new Map(LEVERS.map((lever) => [lever.id, lever]));

/**
 * The worked example, and the fact that it is one.
 *
 * A bakery, because every mark on the stick has to be something a reader can
 * picture paying or being paid, and because the paper's own illustrations of
 * fixed costs use one. Every number is Studio's invention: the paper gives no
 * numeric example of the stick, and borrowing a real company's figures would
 * put a willingness to pay on a business nobody can measure one for.
 */
export const EXAMPLE = {
  what: "One cake, from a bakery Studio made up",
  unit: "£",
  start: { wtp: 30, price: 22, cost: 14, wts: 9 } as Stick,
  /** Said on screen wherever the numbers are. */
  disclaimer:
    "Made-up figures for a made-up bakery. The paper gives no worked example with numbers, and two of these four marks cannot be measured for a real company at all.",
};

/**
 * The example after a set of levers is pulled.
 *
 * Price and cost do not move on their own: the whole point of the framework is
 * that a lever changes what someone is *willing* to do, and the company then
 * chooses how much of that to take. The paper is explicit that Oberholzer-Gee
 * "argues that companies should worry less about the ability to raise prices per
 * se and focus more on increasing WTP" (p. 43), so raising the price is not one
 * of the levers on offer here.
 */
export function pull(start: Stick, pulled: string[]): Stick {
  let { wtp, wts } = start;
  for (const id of pulled) {
    const lever = LEVER_BY_ID.get(id);
    if (!lever) continue;
    if (lever.side === "wtp") wtp += lever.moves;
    else wts += lever.moves;
  }
  return { ...start, wtp, wts };
}

/**
 * A learner's claim that one lever is at work in a real company.
 *
 * No numbers, deliberately. It is the same shape as a finding about competition
 * and for the same reason: a lever ticked off a list is not research, and the
 * part worth keeping is how it is supposed to work and what would show it was
 * not.
 */
export interface ValueClaim {
  id: string;
  savedAt: string;
  /** One of LEVERS. */
  lever: string;
  /** How it works here, in the learner's own words. */
  mechanism: string;
  /** Kept passages from this company's filings that show it. May be empty. */
  passageIds: string[];
  /** What would prove it wrong. */
  wouldChangeIt: string;
}

export type ValueClaimEdit = Omit<ValueClaim, "id" | "savedAt">;

/** Whether a claim is complete enough to be one. Same bar as a force finding. */
export function whatIsMissing(claim: Partial<ValueClaimEdit>): string[] {
  const missing: string[] = [];
  if (!claim.lever || !LEVER_BY_ID.has(claim.lever)) missing.push("which lever you mean");
  if (!claim.mechanism?.trim()) missing.push("how it works here, in your own words");
  if (!claim.wouldChangeIt?.trim()) missing.push("what would change your mind");
  return missing;
}

/**
 * What the seven figures already suggest about which side of the stick a
 * company works on.
 *
 * The checklist asks it directly on p. 68 — "Does a disaggregated ROIC suggest a
 * cost leadership or differentiation advantage?" — and `readAdvantage` in
 * `roic.ts` already answers it from the same paper. This only translates that
 * answer into the stick's own words, and is careful to put it as a question:
 * a margin above the median says where to look, not what is there.
 */
export function sideSuggested(advantage: string | null): { side: Side | "both" | null; says: string } {
  switch (advantage) {
    case "differentiation":
      return {
        side: "wtp",
        says: "Its figures say it keeps more of each sale than most of its industry, and the paper reads that as the mark of a differentiation advantage. That is the top of the stick: something makes customers willing to pay. Which of the three is it?",
      };
    case "cost leadership":
      return {
        side: "wts",
        says: "Its figures say it works its capital harder than most of its industry, and the paper reads that as the mark of a cost advantage. That is the bottom of the stick: something makes its inputs cheaper to get. Which of the three is it?",
      };
    case "both":
      return {
        side: "both",
        says: "Its figures are above its industry on both the margin and the capital it turns, which the paper calls rare. Both ends of the stick are worth explaining, and an explanation that covers both should say how they fit together.",
      };
    case "neither":
      return {
        side: null,
        says: "Its figures are not above its industry on either the margin or the capital it turns, so they point at no side of the stick. A lever may still be at work — the figures are one year of it — but nothing here says which.",
      };
    default:
      return {
        side: null,
        says: "There is no peer comparison for this company yet, so its figures cannot say which end of the stick to look at. The levers are still worth reading against what it files.",
      };
  }
}
