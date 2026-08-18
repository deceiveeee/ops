/**
 * Mission 11 — the Missing-Time Timeline model.
 *
 * Pure, so the finance can be tested without rendering anything. The lesson
 * component decides how to draw this; it does not decide what it means.
 *
 * Everything here is an **illustrative** path with a deliberately ordinary
 * shape — a decline, a recovery, a subsequent rise. It is not historical data,
 * not a forecast, and not any real index. The teaching does not depend on the
 * particular numbers; it depends on the ordering, which is the point of
 * Session 30's finding that timers tend to be "out at exactly the wrong times".
 *
 * Source basis for the design (see docs/source-audits/mission-11-timing.md):
 *   S30-5/S30-6  being right 70–80% of the time is the break-even bar
 *   S30-7        timing studies exclude the transaction costs a timer pays
 *   S34-9        an all-or-nothing switch raises the cost of being wrong
 */

/** Illustrative monthly index levels. Month 0 is the policy starting point. */
export const ILLUSTRATIVE_PATH: readonly number[] = [
  100, 101, 99, 96, 91, 85, 78, 72, 75, 79, 84, 88,
  92, 96, 100, 103, 106, 108, 111, 113, 115, 116, 117, 118,
];

/** Illustrative cash return while out of the market, per month. */
export const CASH_MONTHLY_RETURN = 0.002;

export type ExitChoice = "hold" | "first-drop" | "confirmed";
export type ReentryChoice = "expiry" | "stop-rule" | "feels-safe";

/** Month each exit choice acts. `hold` never leaves. */
const EXIT_MONTH: Record<ExitChoice, number | null> = {
  hold: null,
  "first-drop": 4,
  confirmed: 7,
};

/** A fixed expiry returns after this many months, whether or not it was right. */
export const EXPIRY_MONTHS = 6;

export interface TimingOutcome {
  /** Value of the tactical path at each month, starting from 100. */
  series: number[];
  /** Value of staying at policy weights, for comparison. */
  policySeries: number[];
  /** Month the deviation began; null when the learner held policy. */
  exitMonth: number | null;
  /** Month the deviation ended; null when it never ended inside the window. */
  reentryMonth: number | null;
  /** False only when the rule never brings the learner back. */
  resolved: boolean;
  monthsOutOfPolicy: number;
  /** Round-trip friction actually charged: out and back, or out only. */
  frictionChargedPct: number;
  endingValue: number;
  policyEndingValue: number;
  /** Negative means the deviation cost the learner money. */
  gapVsPolicyPct: number;
}

/**
 * `feels-safe` deliberately has no re-entry month. It is not modelled as a long
 * delay — it is modelled as a rule that never fires, because that is what it is.
 * The learner should see the deviation fail to terminate rather than read a
 * sentence claiming it might.
 */
function reentryMonthFor(
  choice: ReentryChoice,
  exitMonth: number,
  path: readonly number[],
): number | null {
  if (choice === "expiry") {
    const target = exitMonth + EXPIRY_MONTHS;
    return target < path.length ? target : null;
  }
  if (choice === "stop-rule") {
    const exitLevel = path[exitMonth];
    for (let m = exitMonth + 1; m < path.length; m++) {
      if (path[m] >= exitLevel) return m;
    }
    return null;
  }
  return null;
}

export function simulateTiming(
  exit: ExitChoice,
  reentry: ReentryChoice,
  /** One-way cost of moving, in percent, from the saved Mission 8 budget. */
  frictionPctOneWay: number,
  path: readonly number[] = ILLUSTRATIVE_PATH,
): TimingOutcome {
  const policySeries = path.map((level) => (level / path[0]) * 100);
  const exitMonth = EXIT_MONTH[exit];

  if (exitMonth === null) {
    return {
      series: [...policySeries],
      policySeries,
      exitMonth: null,
      reentryMonth: null,
      resolved: true,
      monthsOutOfPolicy: 0,
      frictionChargedPct: 0,
      endingValue: policySeries[policySeries.length - 1],
      policyEndingValue: policySeries[policySeries.length - 1],
      gapVsPolicyPct: 0,
    };
  }

  const reentryMonth = reentryMonthFor(reentry, exitMonth, path);
  const resolved = reentryMonth !== null;

  // Out and back is two trades; never coming back is one.
  const frictionChargedPct = resolved ? frictionPctOneWay * 2 : frictionPctOneWay;

  const series: number[] = [];
  let value = 100;
  let inMarket = true;

  for (let m = 0; m < path.length; m++) {
    if (m > 0) {
      value = inMarket
        ? value * (path[m] / path[m - 1])
        : value * (1 + CASH_MONTHLY_RETURN);
    }
    // Charge each leg at the moment the learner moves.
    if (m === exitMonth) {
      value *= 1 - frictionPctOneWay / 100;
      inMarket = false;
    }
    if (reentryMonth !== null && m === reentryMonth) {
      value *= 1 - frictionPctOneWay / 100;
      inMarket = true;
    }
    series.push(value);
  }

  const lastMonth = path.length - 1;
  const monthsOutOfPolicy = (reentryMonth ?? path.length) - exitMonth;
  const endingValue = series[lastMonth];
  const policyEndingValue = policySeries[lastMonth];

  return {
    series,
    policySeries,
    exitMonth,
    reentryMonth,
    resolved,
    monthsOutOfPolicy,
    frictionChargedPct,
    endingValue,
    policyEndingValue,
    gapVsPolicyPct: ((endingValue - policyEndingValue) / policyEndingValue) * 100,
  };
}

/**
 * The break-even hit rate a timer needs, from Session 30. Stated as a range
 * because the two canonical sources give two figures: Sharpe's 7-in-10 and the
 * Chua/Woodward/To 70–80%.
 */
export const BREAK_EVEN_HIT_RATE = { low: 70, high: 80 } as const;
