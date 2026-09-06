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
// The flight test — nine scenarios
// ---------------------------------------------------------------------------

/**
 * One scenario in the Mission 13 flight test.
 *
 * These live here rather than inside the journey because the Dossier has to name
 * the same nine records back to the learner. Held in one place, a scenario
 * cannot be titled one thing where it is answered and another where it is read
 * back, and a tenth cannot be added without the Dossier seeing it.
 */
export type FlightScenario = { id: string; title: string; prompt: string };

/** Worked all the way through in stage 3, so the learner sees the shape once. */
export const WORKED_SCENARIO: FlightScenario = {
  id: "crash",
  title: "The market falls 30% in seven weeks",
  prompt:
    "Your growth slice is down roughly a third. Nothing about the companies you own has changed that you know of. Your income is unaffected.",
};

/** Four contingencies the learner's own circumstances create. */
export const FLIGHT_A: FlightScenario[] = [
  {
    id: "income",
    title: "Your income stops",
    prompt:
      "You lose your job. You have no offer yet, and no clear date for the next one.",
  },
  {
    id: "cash",
    title: "You need money quickly",
    prompt:
      "An urgent bill arrives that your emergency savings do not fully cover.",
  },
  {
    id: "contribution",
    title: "New money arrives",
    prompt: "A bonus lands. Your sleeves are not at their target weights.",
  },
  {
    id: "drift",
    title: "One slice has run away",
    prompt:
      "After a strong year your growth slice sits well outside the band you set.",
  },
];

/** Four where the evidence behind an already-saved decision expires. */
export const FLIGHT_B: FlightScenario[] = [
  {
    id: "thesis",
    title: "The reason you bought it is gone",
    prompt:
      "A fund you hold announces it is changing the index it tracks.",
  },
  {
    id: "stale",
    title: "The data is older than you thought",
    prompt:
      "The holdings file behind your overlap figure turns out to be four months old.",
  },
  {
    id: "licence",
    title: "The edge licence expires",
    prompt:
      "The review date on your active slice arrives. It has beaten its benchmark two years running.",
  },
  {
    id: "mandate",
    title: "A very good idea",
    prompt:
      "Someone you trust explains a strategy that has worked for them for years. It does not fit what you wrote.",
  },
];

/** All nine, in the order the learner meets them. */
export const ALL_FLIGHT_SCENARIOS: readonly FlightScenario[] = [
  WORKED_SCENARIO,
  ...FLIGHT_A,
  ...FLIGHT_B,
];

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
