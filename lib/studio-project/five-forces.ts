/**
 * The five forces, as *Measuring the Moat* sets them out.
 *
 * Michael J. Mauboussin and Dan Callahan, *Measuring the Moat: Assessing the
 * Magnitude and Sustainability of Value Creation*, Counterpoint Global Insights,
 * Morgan Stanley Investment Management, Consilient Observer, 15 October 2024.
 * The paper's own attribution for the framework is "Counterpoint Global based on
 * Michael E. Porter, Competitive Strategy (New York: Free Press, 1980), 4".
 *
 * Every string here is from that paper. The audit at
 * `docs/source-audits/studio-five-forces.md` gives the page for each one and the
 * sentence it rests on, and the copy read is committed at
 * `docs/source-pdfs/measuring-the-moat-2024-10-15.pdf`.
 *
 * The design of what a learner does with them comes from the paper's own five
 * cautions on p. 22, and the last of those decides the shape of the whole
 * surface: "Much of what is put forth as analysis of industry structure is
 * simply listing pluses and minuses for each of the forces. The objective is to
 * go beyond the superficial to get a complete view of the drivers of profit."
 * So there is no high/medium/low picker here, and no score. A finding counts as
 * one when it names a mechanism, says which of prices, costs, capital or
 * opportunities it moves, and records what would change it.
 */

export type ForceKey = "entrants" | "rivalry" | "suppliers" | "buyers" | "substitutes";

/**
 * Where a force bites.
 *
 * The paper, p. 22: "you can assess each force in the context of what it means
 * for prices and costs. This analysis includes consideration of the income
 * statement and the balance sheet." Prices and costs are the income statement;
 * capital and opportunities are the balance sheet read the same way.
 */
export type ForceEffect = "prices" | "costs" | "capital" | "opportunities";

export const EFFECTS: { key: ForceEffect; label: string; meaning: string }[] = [
  { key: "prices", label: "Prices", meaning: "what customers will pay for what it sells" },
  { key: "costs", label: "Costs", meaning: "what it pays for what it buys and does" },
  { key: "capital", label: "Capital", meaning: "how much money has to sit in the business to run it" },
  { key: "opportunities", label: "Room to invest", meaning: "whether it has somewhere worthwhile to put the money it earns" },
];

/** Structural or cyclical: the paper's third caution, p. 22, asked of every finding. */
export type ForceStanding = "structural" | "temporary";

export interface ForceQuestion {
  id: string;
  /** Put to the learner in plain words. */
  ask: string;
  /** Where it comes from, shown beside it, so a learner can check it against the paper. */
  from: string;
}

export interface Force {
  key: ForceKey;
  /** The paper's own label, Exhibit 17 p. 22. Kept, because a cited framework's labels are. */
  sourceLabel: string;
  /**
   * What the learner sees in navigation, in words a first-time reader has met.
   *
   * Short, because all five sit in one row and at 1440 the fifth was cut off
   * the end of it. Each one's own heading and description carry the full sense,
   * and the paper's label for it is printed under that heading.
   */
  label: string;
  /** Exhibit 17's risk line, verbatim. */
  risk: string;
  /** Exhibit 17's mitigant line, verbatim. */
  mitigant: string;
  /** What the force is, glossed in the paper's sense, for a learner meeting it here. */
  whatItIs: string;
  questions: ForceQuestion[];
  /**
   * Porter's airline verdict as the paper reports it, and his reasons. The
   * worked example a learner reads before being asked to do anything. Null for
   * rivalry, for which the paper gives no airline verdict.
   */
  airline: { verdict: string; because: string } | null;
}

/**
 * The paper's order, and its own weighting.
 *
 * "While all of the forces are important, we believe that threat of new entrants
 * and rivalry among existing firms deserve more extensive consideration than the
 * others" (p. 22), and Greenwald is quoted on entrants as "the one force that
 * dominates all the others" (p. 23). Those two come first here for that reason
 * and the surface says so. Nothing is weighted numerically; the paper never does.
 */
export const FORCES: Force[] = [
  {
    key: "entrants",
    sourceLabel: "Threat of New Entrants",
    label: "Newcomers",
    risk: "New competitors erode market share and profitability.",
    mitigant: "Establish strong barriers to entry.",
    whatItIs:
      "How hard it would be for a company not in this business today to start competing. What makes it hard is a barrier to entry: the money it would take, an established brand, reaching customers at all, the cost of being small at first, and the rules of the trade.",
    questions: [
      { id: "history", ask: "Have companies been arriving in this business, or leaving it?", from: "The paper recommends examining the history of entry and exit early, p. 23" },
      { id: "scale", ask: "Does a company have to be big before it can compete on cost?", from: "Minimum efficient scale, checklist p. 67" },
      { id: "capital", ask: "How much money would somebody have to put up to start?", from: "Capital requirements, one of Porter's seven barriers, p. 27" },
      { id: "network", ask: "Is it worth more to each customer because other customers use it?", from: "Network effects, checklist p. 67" },
      { id: "switching", ask: "Would a customer have to pay something to move to a newcomer?", from: "Customer switching costs, p. 27" },
      { id: "licences", ask: "Do the companies already here hold licences or patents a newcomer could not get?", from: "Checklist p. 67" },
      { id: "learning", ask: "Have the companies already here got better at it by doing it for years?", from: "The learning curve, checklist p. 67" },
      { id: "channels", ask: "Could a newcomer reach customers, or do the companies here hold the way in?", from: "Unequal access to distribution channels, p. 27" },
      { id: "regulation", ask: "Have the companies here helped shape the rules in their own favour?", from: "Restrictive government policy, p. 27; checklist p. 67" },
      { id: "aggression", ask: "Do the companies here fight newcomers off?", from: "Checklist p. 67" },
      { id: "assets", ask: "Could the equipment in this business be used for anything else?", from: "Asset specificity, checklist p. 67" },
    ],
    airline: {
      verdict: "High",
      because:
        "limited advantages for incumbents, low switching costs, and easy access to distribution channels — against barriers of sizeable capital requirements to acquire aircraft, regulatory costs, and limited access to airport gates and takeoff and landing slots",
    },
  },
  {
    key: "rivalry",
    sourceLabel: "Rivalry Among Existing Firms",
    label: "Rivals here now",
    risk: "Intense competition reduces profitability.",
    mitigant: "Avoid direct competition and promote legal cooperation.",
    whatItIs:
      "How hard the companies already here compete. The paper names the weapons: pricing, service offerings, capacity changes, new products, advertising, and promotional spending \u2014 and every move invites an answer.",
    questions: [
      { id: "growth", ask: "Is this business growing?", from: "Checklist p. 68. The paper: when growth stops, one firm's gain has to be another's loss, p. 31" },
      { id: "equal", ask: "Are there many competitors of roughly the same size?", from: "p. 31" },
      { id: "coordination", ask: "Do the companies here seem to follow one another on price and capacity?", from: "Tacit coordination, checklist p. 68" },
      { id: "demand", ask: "Does demand swing about from year to year?", from: "Checklist p. 68" },
      { id: "fixed", ask: "Are the costs largely fixed, whatever they sell?", from: "Checklist p. 68" },
      { id: "owners", ask: "Are the competitors owned by people who want different things?", from: "Incentives, time horizon, and ownership structure, checklist p. 68" },
      { id: "exit", ask: "Would it be costly for a competitor to give up and leave?", from: "Barriers to exit, p. 32" },
    ],
    airline: null,
  },
  {
    key: "suppliers",
    sourceLabel: "Bargaining Power of Suppliers",
    label: "Who it buys from",
    risk: "Strong suppliers increase input costs and squeeze margins.",
    mitigant: "Diversify supplier base and consider vertical integration.",
    whatItIs:
      "How much leverage the businesses it buys from have over it — on price, on quality, on service. The paper is blunt about why it matters: an industry that cannot pass on price increases from its powerful suppliers is destined to be unattractive.",
    questions: [
      { id: "leverage", ask: "How much leverage do the businesses it buys from have?", from: "Checklist p. 67" },
      { id: "passOn", ask: "Can it pass a supplier's price rise on to its own customers?", from: "Checklist p. 67" },
      { id: "concentration", ask: "Are there fewer suppliers than there are companies buying from them?", from: "p. 23" },
      { id: "switching", ask: "Would changing supplier cost it anything?", from: "p. 23" },
      { id: "critical", ask: "Is what they supply a small part of its costs, or the part it cannot do without?", from: "p. 23" },
    ],
    airline: {
      verdict: "High",
      because:
        "many airline employees are members of labor unions, airframe and aircraft engine manufacturers are oligopolies, and airports operate as local monopolies",
    },
  },
  {
    key: "buyers",
    sourceLabel: "Bargaining Power of Buyers",
    label: "Who it sells to",
    risk: "Strong buyers are demanding and limit profitability.",
    mitigant: "Differentiate and promote customer loyalty.",
    whatItIs:
      "How much leverage its customers have. Large buyers that are informed, the paper says, have much more leverage than diffused buyers that are uninformed.",
    questions: [
      { id: "leverage", ask: "How much leverage do its customers have?", from: "Checklist p. 67" },
      { id: "informed", ask: "How much do its customers know about what they are buying?", from: "Checklist p. 67" },
      { id: "concentration", ask: "Are its customers a few big ones, or a great many small ones?", from: "p. 23" },
      { id: "switching", ask: "Would it cost a customer anything to buy elsewhere?", from: "p. 23" },
      { id: "matters", ask: "How much does this purchase matter to the customer?", from: "p. 23" },
    ],
    airline: {
      verdict: "High",
      because:
        "the buyers are largely fragmented, have low switching costs (offset to some degree by frequent flier programs), have the means to compare fares easily, and are price sensitive as they perceive air travel to be a relatively standard offering",
    },
  },
  {
    key: "substitutes",
    sourceLabel: "Threat of Substitutes",
    label: "Other ways to get it",
    risk: "Substitutes offer products that limit industry profitability.",
    mitigant: "Innovate, improve products, and create switching costs.",
    whatItIs:
      "Whether a customer could meet the same need a different way, and whether they would. A substitute need not be the same product: the paper's example is a train, a car or a videoconference standing in for a flight. Substitutes limit the prices that companies can charge and place a ceiling on potential returns.",
    questions: [
      { id: "exist", ask: "Is there another way for a customer to get what it sells?", from: "Checklist p. 67" },
      { id: "switching", ask: "What would it cost a customer to use that other way instead?", from: "The source and size of switching costs, checklist p. 67" },
      { id: "would", ask: "Would a customer actually change to it?", from: "p. 23" },
    ],
    airline: {
      verdict: "Medium",
      because:
        "travel by train or car can substitute for short-haul flights, and business meetings via videoconferencing can replace some face-to-face gatherings",
    },
  },
];

export const FORCE_BY_KEY = new Map(FORCES.map((force) => [force.key, force]));

/** The paper's own weighting, said once on the surface rather than scored. */
export const WEIGHTING =
  "The paper gives these two more room than the other three, and quotes Bruce Greenwald calling the threat of new entrants “the one force that dominates all the others”.";

/**
 * A learner's finding about one force, for one company.
 *
 * Not a verdict on the force. It is one mechanism, where it bites, whether it
 * looks structural or temporary, what in the company's own filings shows it, and
 * what would change the learner's mind.
 */
export interface ForceFinding {
  id: string;
  savedAt: string;
  force: ForceKey;
  /** Which of the force's questions this answers. */
  question: string;
  /** The learner's own sentence: how it works. Never generated. */
  mechanism: string;
  /** Which of prices, costs, capital or opportunities it moves. */
  effect: ForceEffect;
  /** Structural, or temporary and cyclical. The paper's third caution, p. 22. */
  standing: ForceStanding;
  /** Kept passages from this company's filings that show it. May be empty. */
  passageIds: string[];
  /** What would prove it wrong. The repo's settled term for a falsifier. */
  wouldChangeIt: string;
}

/** What a caller supplies to record a finding. */
export type ForceFindingEdit = Omit<ForceFinding, "id" | "savedAt">;

/**
 * Whether a finding is complete enough to be one.
 *
 * The bar is the paper's fifth caution: a plus or a minus against a force is not
 * analysis. A mechanism and what would change it are both required, in the
 * learner's own words; evidence is not, because a learner may see how something
 * works before finding the passage that shows it, and refusing to save that
 * would lose the thought.
 */
export function whatIsMissing(finding: Partial<ForceFindingEdit>): string[] {
  const missing: string[] = [];
  if (!finding.question) missing.push("which question it answers");
  if (!finding.mechanism?.trim()) missing.push("how it works, in your own words");
  if (!finding.effect) missing.push("what it moves");
  if (!finding.standing) missing.push("whether it is structural or passing");
  if (!finding.wouldChangeIt?.trim()) missing.push("what would change your mind");
  return missing;
}

/**
 * What the learner has looked at, for the progress line.
 *
 * Deliberately a count of forces examined and findings recorded, never a score:
 * five findings are not a better industry than one, and the paper's fourth
 * caution is that structure does not seal a company's fate.
 */
export function coverage(findings: ForceFinding[]): {
  forcesExamined: number;
  findings: number;
  untouched: Force[];
} {
  const seen = new Set(findings.map((finding) => finding.force));
  return {
    forcesExamined: seen.size,
    findings: findings.length,
    untouched: FORCES.filter((force) => !seen.has(force.key)),
  };
}
