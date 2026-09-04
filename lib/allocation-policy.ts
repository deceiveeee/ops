/**
 * Pure, integer-only allocation math for the Portfolio Workbench.
 *
 * All percentages are stored as basis points so persisted policy values do not
 * acquire floating-point drift. One hundred percent is 10,000 basis points.
 */
export const BASIS_POINTS_TOTAL = 10_000;

export interface AllocationSleeveInput {
  id: string;
  targetBps: number;
  minBps: number;
  maxBps: number;
  assumedLossBps: number;
}

export interface AllocationPolicyIssue {
  code:
    | "duplicate-id"
    | "empty-id"
    | "invalid-basis-points"
    | "invalid-range"
    | "incomplete-allocation";
  path: string;
  message: string;
}

function isBasisPoints(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= BASIS_POINTS_TOTAL;
}

export function assertBasisPoints(value: number, label = "value"): void {
  if (!isBasisPoints(value)) {
    throw new RangeError(`${label} must be an integer from 0 to ${BASIS_POINTS_TOTAL} basis points.`);
  }
}

export function sumWeightBps(
  sleeves: readonly Pick<AllocationSleeveInput, "targetBps">[],
): number {
  return sleeves.reduce((total, sleeve, index) => {
    assertBasisPoints(sleeve.targetBps, `sleeves[${index}].targetBps`);
    return total + sleeve.targetBps;
  }, 0);
}

export function allocationWeightsAreComplete(
  sleeves: readonly Pick<AllocationSleeveInput, "targetBps">[],
): boolean {
  return sumWeightBps(sleeves) === BASIS_POINTS_TOTAL;
}

/**
 * Position weight x assumed loss = contribution to total portfolio loss.
 * The result is rounded to the nearest basis point for display and storage.
 */
export function calculateStressContributionBps(weightBps: number, lossBps: number): number {
  assertBasisPoints(weightBps, "weightBps");
  assertBasisPoints(lossBps, "lossBps");
  return Math.round((weightBps * lossBps) / BASIS_POINTS_TOTAL);
}

export function calculatePortfolioStressLossBps(
  sleeves: readonly Pick<AllocationSleeveInput, "targetBps" | "assumedLossBps">[],
): number {
  const totalNumerator = sleeves.reduce((total, sleeve, index) => {
    assertBasisPoints(sleeve.targetBps, `sleeves[${index}].targetBps`);
    assertBasisPoints(sleeve.assumedLossBps, `sleeves[${index}].assumedLossBps`);
    return total + sleeve.targetBps * sleeve.assumedLossBps;
  }, 0);
  return Math.round(totalNumerator / BASIS_POINTS_TOTAL);
}

/**
 * Solves maximum position weight from a portfolio-loss contribution ceiling.
 * A zero-loss assumption is rejected because it cannot establish a finite risk
 * ceiling and would make a risk control look more certain than it is.
 */
export function calculateCandidateCeilingBps(
  maximumPortfolioContributionBps: number,
  assumedPositionLossBps: number,
): number {
  assertBasisPoints(maximumPortfolioContributionBps, "maximumPortfolioContributionBps");
  assertBasisPoints(assumedPositionLossBps, "assumedPositionLossBps");

  if (assumedPositionLossBps === 0) {
    throw new RangeError("assumedPositionLossBps must be greater than zero.");
  }

  return Math.min(
    BASIS_POINTS_TOTAL,
    Math.floor(
      (maximumPortfolioContributionBps * BASIS_POINTS_TOTAL) / assumedPositionLossBps,
    ),
  );
}

export function isLiquidityCovered(liquidityTargetBps: number, nearTermNeedBps: number): boolean {
  assertBasisPoints(liquidityTargetBps, "liquidityTargetBps");
  assertBasisPoints(nearTermNeedBps, "nearTermNeedBps");
  return liquidityTargetBps >= nearTermNeedBps;
}

export function validateAllocationSleeves(
  sleeves: readonly AllocationSleeveInput[],
): AllocationPolicyIssue[] {
  const issues: AllocationPolicyIssue[] = [];
  const ids = new Set<string>();

  sleeves.forEach((sleeve, index) => {
    const path = `sleeves[${index}]`;
    const id = sleeve.id.trim();

    if (!id) {
      issues.push({
        code: "empty-id",
        path: `${path}.id`,
        message: "Each allocation slice needs a stable identifier.",
      });
    } else if (ids.has(id)) {
      issues.push({
        code: "duplicate-id",
        path: `${path}.id`,
        message: `Allocation sleeve identifier "${id}" is duplicated.`,
      });
    } else {
      ids.add(id);
    }

    const values = [
      ["minBps", sleeve.minBps],
      ["targetBps", sleeve.targetBps],
      ["maxBps", sleeve.maxBps],
      ["assumedLossBps", sleeve.assumedLossBps],
    ] as const;

    for (const [field, value] of values) {
      if (!isBasisPoints(value)) {
        issues.push({
          code: "invalid-basis-points",
          path: `${path}.${field}`,
          message: `${field} must be an integer from 0 to ${BASIS_POINTS_TOTAL}.`,
        });
      }
    }

    if (
      isBasisPoints(sleeve.minBps) &&
      isBasisPoints(sleeve.targetBps) &&
      isBasisPoints(sleeve.maxBps) &&
      !(sleeve.minBps <= sleeve.targetBps && sleeve.targetBps <= sleeve.maxBps)
    ) {
      issues.push({
        code: "invalid-range",
        path,
        message: "The slice range must satisfy minimum ≤ target ≤ maximum.",
      });
    }
  });

  const targetValuesAreValid = sleeves.every((sleeve) => isBasisPoints(sleeve.targetBps));
  if (targetValuesAreValid && sumWeightBps(sleeves) !== BASIS_POINTS_TOTAL) {
    issues.push({
      code: "incomplete-allocation",
      path: "sleeves",
      message: `Target weights must total ${BASIS_POINTS_TOTAL} basis points.`,
    });
  }

  return issues;
}
