/**
 * Mission 13 — the operating plan.
 *
 * What this module does *not* do is as important as what it does. It does not
 * invent a rebalancing band: Mission 5 already stores `minBps` and `maxBps` on
 * every sleeve, so the learner's band is the one they set when they chose the
 * weights. It does not invent a checkpoint system: `WORKBENCH_CHECKPOINT_IDS`
 * already models all thirteen. And it does not declare a rebalancing method
 * optimal, because the phase prompt forbids it and the sources do not support
 * it — see `docs/source-audits/mission-13-capstone.md`, D3.
 *
 * Everything is in basis points, matching `lib/allocation-policy.ts`.
 */

import type {
  AllocationSleeve,
  CheckpointStatus,
  WorkbenchCheckpointId,
} from "./portfolio-workbench";

// ---------------------------------------------------------------------------
// Drift
// ---------------------------------------------------------------------------

export type SleeveDrift = {
  id: string;
  label: string;
  targetBps: number;
  actualBps: number;
  /** Positive = overweight. */
  driftBps: number;
  /** The learner's own band, set in Mission 5. */
  minBps: number;
  maxBps: number;
  withinBand: boolean;
};

/**
 * Drift is measured against the weights the learner chose, not against an
 * external ideal. A sleeve inside its own band is not drifted, however far it
 * sits from target — that is what a band is for.
 */
export function computeDrift(
  sleeves: readonly AllocationSleeve[],
  actualBpsById: Readonly<Record<string, number>>,
): SleeveDrift[] {
  return sleeves.map((s) => {
    const actualBps = actualBpsById[s.id] ?? 0;
    return {
      id: s.id,
      label: s.label,
      targetBps: s.targetBps,
      actualBps,
      driftBps: actualBps - s.targetBps,
      minBps: s.minBps,
      maxBps: s.maxBps,
      withinBand: actualBps >= s.minBps && actualBps <= s.maxBps,
    };
  });
}

/** Total absolute deviation, halved: moving 1% from A to B repairs 2% of raw drift. */
export function totalDeviationBps(drift: readonly SleeveDrift[]): number {
  const raw = drift.reduce((t, d) => t + Math.abs(d.driftBps), 0);
  return Math.round(raw / 2);
}

export function breachedSleeves(drift: readonly SleeveDrift[]): SleeveDrift[] {
  return drift.filter((d) => !d.withinBand);
}

// ---------------------------------------------------------------------------
// The three rebalancing methods (Investor.gov IG-4)
// ---------------------------------------------------------------------------

export type RebalanceMethod = "sell-and-buy" | "new-money" | "redirect-flows";

export type RebalanceOutcome = {
  method: RebalanceMethod;
  /** Deviation removed, in basis points of the portfolio. */
  repairedBps: number;
  /** What is still off target afterwards. No method lands exactly on target. */
  remainingDeviationBps: number;
  /** Estimated cost, in basis points of the portfolio, from the Mission 8 budget. */
  frictionBps: number;
  /** True where the method can realise a gain in a taxable account. */
  mayRealiseGains: boolean;
  /** True where the method cannot run without money the learner must supply. */
  requiresNewMoney: boolean;
  /** Bands still breached after the action. */
  stillBreached: number;
};

export type RebalanceInputs = {
  drift: readonly SleeveDrift[];
  /** Mission 8's estimated annual drag, in basis points. One leg is half. */
  annualFrictionDragBps: number;
  /** New money available, in basis points of the portfolio. */
  newMoneyBps: number;
  /**
   * Ongoing contributions or distributions per review period, in basis points.
   * Method three redirects these; it cannot run without them.
   */
  periodicFlowBps: number;
};

/**
 * One leg of trading costs half the round-trip drag, matching the convention
 * Missions 11 and 12 already use.
 */
function oneLegBps(annualFrictionDragBps: number): number {
  const drag = Number.isFinite(annualFrictionDragBps) ? annualFrictionDragBps : 0;
  return drag > 0 ? drag / 2 : 25;
}

export function evaluateRebalance(
  method: RebalanceMethod,
  input: RebalanceInputs,
): RebalanceOutcome {
  const deviation = totalDeviationBps(input.drift);
  const leg = oneLegBps(input.annualFrictionDragBps);

  if (method === "sell-and-buy") {
    // Repairs fully, and pays for both legs: it sells and it buys.
    return {
      method,
      repairedBps: deviation,
      remainingDeviationBps: 0,
      frictionBps: round2((deviation / 10_000) * leg * 2),
      mayRealiseGains: true,
      requiresNewMoney: false,
      stillBreached: 0,
    };
  }

  if (method === "new-money") {
    // Buys only, so one leg — and repairs only as far as the money reaches.
    const repaired = Math.min(deviation, Math.max(0, input.newMoneyBps));
    return {
      method,
      repairedBps: repaired,
      remainingDeviationBps: deviation - repaired,
      frictionBps: round2((repaired / 10_000) * leg),
      mayRealiseGains: false,
      requiresNewMoney: true,
      stillBreached: breachedAfter(input.drift, repaired),
    };
  }

  // Redirecting flows that were already happening adds no incremental trade,
  // so no incremental friction — but it repairs only at the rate money arrives,
  // and it cannot run at all for someone no longer contributing.
  const repaired = Math.min(deviation, Math.max(0, input.periodicFlowBps));
  return {
    method,
    repairedBps: repaired,
    remainingDeviationBps: deviation - repaired,
    frictionBps: 0,
    mayRealiseGains: false,
    requiresNewMoney: true,
    stillBreached: breachedAfter(input.drift, repaired),
  };
}

/**
 * How many bands are still breached once `repairedBps` of deviation is removed,
 * applied worst-breach-first. An approximation, and labelled as one wherever it
 * is shown: the true answer depends on which sleeve the money is directed to.
 */
function breachedAfter(
  drift: readonly SleeveDrift[],
  repairedBps: number,
): number {
  const breaches = breachedSleeves(drift)
    .map((d) => ({
      id: d.id,
      gap: d.driftBps > 0 ? d.actualBps - d.maxBps : d.minBps - d.actualBps,
    }))
    .sort((a, b) => b.gap - a.gap);

  let budget = repairedBps;
  let remaining = 0;
  for (const b of breaches) {
    if (budget >= b.gap) budget -= b.gap;
    else remaining += 1;
  }
  return remaining;
}

export function evaluateAllMethods(
  input: RebalanceInputs,
): RebalanceOutcome[] {
  // Ordered cheapest-first for display, which is not the same as best — the
  // interface says so, and `requiresNewMoney` is why.
  return (["redirect-flows", "new-money", "sell-and-buy"] as const).map((m) =>
    evaluateRebalance(m, input),
  );
}

// ---------------------------------------------------------------------------
// Readiness across the twelve prior checkpoints
// ---------------------------------------------------------------------------

/** Mission 13's own artifact is `policy`; it is not a prerequisite for itself. */
export const PREREQUISITE_CHECKPOINTS = [
  "mandate",
  "beliefs",
  "bond-risk",
  "required-return",
  "allocation",
  "evidence",
  "valuation",
  "friction",
  "evidence-test",
  "architecture",
  "timing",
  "holdings",
] as const satisfies readonly WorkbenchCheckpointId[];

export type CheckpointGap = {
  id: WorkbenchCheckpointId;
  status: CheckpointStatus;
  /** True where this gap blocks `Execute-ready`. */
  blocking: boolean;
};

/**
 * A checkpoint counts as satisfied only when coherent. `saved-unverified` is
 * explicitly not enough: the phase prompt requires every checkpoint valid *and*
 * current, and an unverified save is neither.
 */
export function readinessGaps(
  states: Partial<Record<WorkbenchCheckpointId, CheckpointStatus>>,
): CheckpointGap[] {
  return PREREQUISITE_CHECKPOINTS.map((id) => {
    const status = states[id] ?? "empty";
    return { id, status, blocking: status !== "coherent" };
  }).filter((g) => g.blocking);
}

// ---------------------------------------------------------------------------
// Critical failures — a gate, never a deduction
// ---------------------------------------------------------------------------

export const CRITICAL_FAILURES = [
  "weights-not-100",
  "liquidity-in-risky-assets",
  "hidden-leverage",
  "wrong-product-identity",
  "unsupported-concentration",
  "stale-provenance-as-current",
  "no-response-to-loss-drift-or-thesis-break",
  "treated-as-advice",
] as const;

export type CriticalFailure = (typeof CRITICAL_FAILURES)[number];

/**
 * The transfer case is failed by any single critical failure, regardless of
 * everything else, because each one describes a learner who would do real harm.
 * This is deliberately not expressible as a score.
 */
export function transferCaseFailed(found: readonly CriticalFailure[]): boolean {
  return found.length > 0;
}

// ---------------------------------------------------------------------------
// Completion states
// ---------------------------------------------------------------------------

export type CompletionState =
  | "incomplete"
  | "practice-complete"
  | "execute-ready";

export type CompletionInputs = {
  mode: "personal" | "practice";
  gaps: readonly CheckpointGap[];
  /** The two genuinely new IPS elements, from CFA 2b and 4c. */
  reviewProcessWritten: boolean;
  rebalanceRuleWritten: boolean;
  transferCasePassed: boolean;
  criticalFailures: readonly CriticalFailure[];
  /** Mission 1 readiness blockers that are still open. */
  readinessBlockersResolved: boolean;
};

/**
 * `Execute-ready` requires everything `Practice-complete` requires, plus a
 * personal (not practice) plan, no checkpoint gaps, and resolved readiness
 * blockers. Neither state is advice or authorization to trade, and nothing in
 * this module should ever be rendered as an endorsement.
 */
export function completionState(input: CompletionInputs): CompletionState {
  const rulesWritten = input.reviewProcessWritten && input.rebalanceRuleWritten;
  const clean = !transferCaseFailed(input.criticalFailures);

  if (!rulesWritten || !input.transferCasePassed || !clean) return "incomplete";

  if (
    input.mode === "personal" &&
    input.gaps.length === 0 &&
    input.readinessBlockersResolved
  ) {
    return "execute-ready";
  }

  return "practice-complete";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
