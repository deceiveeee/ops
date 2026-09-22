/**
 * One definition of how a company's seven figures are read.
 *
 * This lived inside Investigate, which was fine while Investigate was the only
 * surface that read them. The value stick needs the same answer — the checklist
 * asks "Does a disaggregated ROIC suggest a cost leadership or differentiation
 * advantage?" (p. 68) and that is this reading's `howEarned` — and a second copy
 * of the peer map would be two definitions of what a peer is, drifting apart the
 * first time either is edited.
 */

import industriesData from "./data/industries.json";
import { read, type Entries, type PeerContext } from "./investigate";
import {
  TREASURY_RATE,
  estimate,
  forIndustry,
  industryForSic,
  investigationIndustry,
  sectorForIndustry,
} from "./cost-of-capital";
import type { RoicDecomposition } from "./roic";
import type { FigureInvestigation } from "./schema";

/**
 * Where someone starts before they have said what the business does: the whole
 * market, rather than whichever industry sorts first. Financials are left out
 * because their cost of capital is built on a different capital structure.
 */
export const DEFAULT_INDUSTRY = "Total Market (without financials)";

/** The industries Studio has researched, with peers to compare against. */
const RESEARCHED = industriesData.industries.map((entry) => ({
  sic: entry.sic,
  label: entry.label,
  peers: (entry.roic ?? []).filter(
    (row): row is typeof row & { roic: number; nopatMargin: number; capitalTurnover: number } =>
      typeof row.roic === "number" && typeof row.nopatMargin === "number" && typeof row.capitalTurnover === "number",
  ),
}));

/**
 * The researched peer sets, found by the industry the learner picked.
 *
 * Two lists of different sizes meet here. Ninety-six industries have a published
 * cost of capital, which is the figure the whole investigation turns on, and five
 * of them have peer figures built from filings. Offering only the five meant a
 * company in any other industry could not be read against its own cost of
 * capital: the scarcer fact was gating the commoner one.
 */
export const PEERS_BY_INDUSTRY = new Map(
  RESEARCHED.flatMap((entry) => {
    const name = industryForSic(entry.sic);
    return name ? ([[name, entry]] as const) : [];
  }),
);

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * The peers to place a company against, when there are enough of them.
 *
 * Fewer than five is not a comparison: `readAdvantage` refuses it, and a median
 * of three companies would put a number on screen that says less than it looks.
 */
export function peerContextFor(industry: string): PeerContext | undefined {
  const researched = PEERS_BY_INDUSTRY.get(industry);
  if (!researched || researched.peers.length < 5) return undefined;
  return {
    industry: researched.label.toLowerCase(),
    medianMargin: median(researched.peers.map((peer) => peer.nopatMargin)),
    medianTurnover: median(researched.peers.map((peer) => peer.capitalTurnover)),
    peers: researched.peers as unknown as RoicDecomposition[],
  };
}

/** The industry a saved record is read against, falling back the way it always did. */
export function industryOf(investigation: FigureInvestigation): string {
  return investigationIndustry(investigation) ?? DEFAULT_INDUSTRY;
}

/**
 * The cost of capital this company is judged against: the learner's own
 * risk-free rate where they gave one, and the Treasury's latest auction where
 * they did not.
 */
export function costOfCapitalFor(industry: string, riskFreePct: number | null): number {
  const industryCost = forIndustry(industry) ?? forIndustry(DEFAULT_INDUSTRY)!;
  const learnerRate = riskFreePct === null ? undefined : riskFreePct / 100;
  const cost =
    learnerRate === undefined || !Number.isFinite(learnerRate)
      ? estimate(industryCost, TREASURY_RATE.rate, "treasury")
      : estimate(industryCost, learnerRate, "learner");
  return cost.costOfCapital;
}

/** What a saved investigation's figures say, or why they cannot say it yet. */
export function readInvestigation(investigation: FigureInvestigation) {
  const industry = industryOf(investigation);
  return read(
    investigation.figures as Entries,
    sectorForIndustry(industry),
    costOfCapitalFor(industry, investigation.riskFreePct),
    peerContextFor(industry),
  );
}
