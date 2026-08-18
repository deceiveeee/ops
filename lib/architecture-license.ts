/**
 * Mission 10. Whether a proposed active sleeve has cleared every condition
 * required to leave the passive default.
 *
 * The rule this module exists to enforce: **no single field unlocks a sleeve.**
 * A learner who fills in one impressive number, or writes a persuasive story
 * about a mispricing, must still be told exactly which conditions are unmet. So
 * evaluation always returns the complete list of failures rather than stopping
 * at the first one — the UI names all of them beside a disabled control.
 *
 * Pure and browser-free by design. "Why is this sleeve still disabled" is a
 * question that should be answerable in a unit test, not only by clicking.
 */

/** Percentages are whole-number percents; basis points are not needed here. */
export type EdgeProposal = {
  /** The exposure the sleeve would replace, and the benchmark it is judged against. */
  replacesExposure: string;
  benchmark: string;
  /** The specific pocket of mispricing, and who or what is wrong. */
  pocket: string;
  whoIsWrong: string;
  /** How price and value converge, and over what horizon. */
  correctionMechanism: string;
  horizonMonths: number;
  /** Why this learner could recognise and execute it. */
  capability: string;
  /** The falsifiable claim and the evidence that would refute it. */
  falsifiableClaim: string;
  disconfirming: string;
  /** Expected return above the benchmark before any cost, in percent. */
  grossEdgePct: number;
  /** Durability against imitation, and the exit condition. */
  durabilityRisk: string;
  thesisBreak: string;
  reviewDate: string;
  /** Share of the portfolio the sleeve would take, in percent. */
  allocationPct: number;
};

/** What missions 5, 8 and 9 already established. Mission 10 may not re-ask for these. */
export type InheritedContext = {
  /** Mission 8: the learner's own estimated annual friction, in percent. */
  frictionPct: number;
  /** Mission 8 saved, rather than defaulted. */
  frictionSaved: boolean;
  /** Mission 9: an evidence test design was chosen and saved. */
  evidenceDesign: string;
  evidenceHoldout: string;
  evidenceSampling: string;
  /** Mission 5: the largest share of the portfolio this sleeve may occupy, in percent. */
  maxSleevePct: number;
  /** Mission 5: assumed loss on the sleeve under stress, in percent. */
  assumedSleeveLossPct: number;
  /** Mission 5: the portfolio loss budget in percentage points. */
  lossBudgetPct: number;
  /** Mission 7: a valuation range exists for the candidate. */
  hasValuationRange: boolean;
};

export type GateCode =
  | "benchmark-undefined"
  | "no-specific-pocket"
  | "no-correction-mechanism"
  | "no-capability"
  | "not-falsifiable"
  | "evidence-design-missing"
  | "friction-unknown"
  | "no-valuation-range"
  | "net-edge-not-positive"
  | "exceeds-sleeve-ceiling"
  | "exceeds-loss-budget"
  | "no-thesis-break"
  | "no-review-date";

export type Gate = {
  code: GateCode;
  /** Short label for the switchboard row. */
  label: string;
  /** Why it is unmet, phrased for the learner, in one sentence. */
  reason: string;
  /** Which mission established this requirement. */
  from: "mission-5" | "mission-7" | "mission-8" | "mission-9" | "mission-10";
};

export type LicenseEvaluation = {
  /** True only when every gate passes. */
  licensed: boolean;
  /** Every unmet condition, never truncated to the first failure. */
  unmet: Gate[];
  /** Expected return above benchmark before cost, in percent. */
  grossEdgePct: number;
  /** Gross edge less the learner's own friction, in percent. */
  netEdgePct: number;
  /** The sleeve's contribution to portfolio loss under mission 5's stress, in percentage points. */
  lossContributionPct: number;
};

const MIN_PROSE = 20;

function stated(value: string): boolean {
  return value.trim().length >= MIN_PROSE;
}

/** Round to a cent of a percent so 0.1 + 0.2 style drift never decides a gate. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Net edge is what the learner would actually keep: the claimed edge over the
 * benchmark, less their own friction estimate from mission 8.
 *
 * Deliberately not risk-adjusted here. Mission 10 charges risk separately and
 * visibly in the model stage, so that the learner sees two distinct deductions
 * rather than one opaque number.
 */
export function netEdgePct(grossEdgePct: number, frictionPct: number): number {
  return round2(grossEdgePct - frictionPct);
}

/** A sleeve's share of portfolio loss: weight × assumed loss on that sleeve. */
export function lossContributionPct(
  allocationPct: number,
  assumedSleeveLossPct: number,
): number {
  return round2((allocationPct / 100) * assumedSleeveLossPct);
}

/**
 * Evaluate a proposed active sleeve against every condition.
 *
 * Returns all failures. Callers must not report only the first — the whole
 * point is that a learner sees the full set of reasons a persuasive-looking
 * proposal is still not licensed.
 */
export function evaluateEdgeLicense(
  proposal: EdgeProposal,
  context: InheritedContext,
): LicenseEvaluation {
  const unmet: Gate[] = [];
  const add = (code: GateCode, label: string, reason: string, from: Gate["from"]) =>
    unmet.push({ code, label, reason, from });

  if (!proposal.benchmark.trim() || !proposal.replacesExposure.trim()) {
    add(
      "benchmark-undefined",
      "Benchmark",
      "Name the exposure this replaces and the benchmark it will be judged against, or there is nothing to beat.",
      "mission-10",
    );
  }

  if (!stated(proposal.pocket) || !stated(proposal.whoIsWrong)) {
    add(
      "no-specific-pocket",
      "Specific mispricing",
      "Name the pocket of the market that is mispriced and who is on the wrong side of it. A general belief that prices are wrong is not a pocket.",
      "mission-10",
    );
  }

  if (!stated(proposal.correctionMechanism) || proposal.horizonMonths <= 0) {
    add(
      "no-correction-mechanism",
      "Correction mechanism",
      "Say what makes price and value converge, and over what horizon. A mispricing that never corrects pays nothing.",
      "mission-10",
    );
  }

  if (!stated(proposal.capability)) {
    add(
      "no-capability",
      "Your capability",
      "Say why you specifically could recognise and act on this before it closes.",
      "mission-10",
    );
  }

  if (!stated(proposal.falsifiableClaim) || !stated(proposal.disconfirming)) {
    add(
      "not-falsifiable",
      "Falsifiable claim",
      "State the claim and the evidence that would refute it. A claim nothing could disprove cannot be tested.",
      "mission-9",
    );
  }

  if (!context.evidenceDesign || !context.evidenceHoldout || !context.evidenceSampling) {
    add(
      "evidence-design-missing",
      "Evidence design",
      "Your Evidence Test Checklist from mission 9 is incomplete, so there is no agreed way to test this claim.",
      "mission-9",
    );
  }

  if (!context.frictionSaved) {
    add(
      "friction-unknown",
      "Your friction",
      "Save a Friction Budget in mission 8 first. Until acting has a price, no edge can be shown to survive it.",
      "mission-8",
    );
  }

  if (!context.hasValuationRange) {
    add(
      "no-valuation-range",
      "Valuation range",
      "An edge claim needs a value estimate it could be wrong about. Complete mission 7 for this candidate.",
      "mission-7",
    );
  }

  const gross = round2(proposal.grossEdgePct);
  const net = netEdgePct(gross, context.frictionPct);
  if (net <= 0) {
    add(
      "net-edge-not-positive",
      "Net edge",
      `Gross ${gross}% less your ${round2(context.frictionPct)}% friction leaves ${net}%. An edge you cannot keep is not an edge.`,
      "mission-8",
    );
  }

  if (proposal.allocationPct > context.maxSleevePct) {
    add(
      "exceeds-sleeve-ceiling",
      "Position ceiling",
      `This sleeve asks for ${round2(proposal.allocationPct)}% against the ${round2(context.maxSleevePct)}% ceiling you set in mission 5.`,
      "mission-5",
    );
  }

  const lossContribution = lossContributionPct(
    proposal.allocationPct,
    context.assumedSleeveLossPct,
  );
  if (lossContribution > context.lossBudgetPct) {
    add(
      "exceeds-loss-budget",
      "Loss budget",
      `Under your stress assumption this sleeve contributes ${lossContribution} points of portfolio loss against a ${round2(context.lossBudgetPct)}-point budget.`,
      "mission-5",
    );
  }

  if (!stated(proposal.thesisBreak)) {
    add(
      "no-thesis-break",
      "Thesis break",
      "Name the result that would make you close this sleeve, while you can still think clearly about it.",
      "mission-10",
    );
  }

  if (!proposal.reviewDate.trim()) {
    add(
      "no-review-date",
      "Review date",
      "Set the date you will re-test this claim. An unreviewed edge quietly becomes a habit.",
      "mission-10",
    );
  }

  return {
    licensed: unmet.length === 0,
    unmet,
    grossEdgePct: gross,
    netEdgePct: net,
    lossContributionPct: lossContribution,
  };
}

/**
 * A fully passive architecture is a complete outcome, not a fallback. It needs
 * only a defined core, a benchmark and a review date — never an edge claim.
 */
export function evaluatePassiveOnly(
  coreExposure: string,
  coreBenchmark: string,
  reviewDate: string,
): { licensed: boolean; unmet: Gate[] } {
  const unmet: Gate[] = [];
  if (!coreExposure.trim() || !coreBenchmark.trim()) {
    unmet.push({
      code: "benchmark-undefined",
      label: "Core and benchmark",
      reason: "Name the exposure your core holds and the benchmark it is judged against.",
      from: "mission-10",
    });
  }
  if (!reviewDate.trim()) {
    unmet.push({
      code: "no-review-date",
      label: "Review date",
      reason: "Set the date you will revisit this decision.",
      from: "mission-10",
    });
  }
  return { licensed: unmet.length === 0, unmet };
}
