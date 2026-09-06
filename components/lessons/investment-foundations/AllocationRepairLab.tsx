"use client";

import { useId, useMemo, useState } from "react";

import {
  BASIS_POINTS_TOTAL,
  allocationWeightsAreComplete,
  calculatePortfolioStressLossBps,
  calculateStressContributionBps,
  isLiquidityCovered,
  sumWeightBps,
} from "@/lib/allocation-policy";

export type AllocationRepairSleeveId = "ready" | "steady" | "grow";

export type AllocationRepairWeightsBps = Record<AllocationRepairSleeveId, number>;

export type AllocationRepairConstraintKey =
  | "bounds"
  | "weightTotal"
  | "liquidity"
  | "stressBudget";

export interface AllocationRepairConstraintOptions {
  /** Determines whether this check blocks the pass action. Defaults to true. */
  enforced?: boolean;
  /** Determines whether the check and its causal feedback are visible. Defaults to true. */
  displayed?: boolean;
}

export type AllocationRepairConstraints = Partial<
  Record<AllocationRepairConstraintKey, AllocationRepairConstraintOptions>
>;

export interface AllocationRepairCheck {
  passed: boolean;
  enforced: boolean;
  displayed: boolean;
}

export interface AllocationRepairEvaluation {
  checks: Record<AllocationRepairConstraintKey, AllocationRepairCheck>;
  /** True only when every weight is a finite 0%-100% basis-point value. */
  weightsAreUsable: boolean;
  /** Null until all three weights are usable. */
  weightTotalBps: number | null;
  /** Null when the portfolio amount or Ready weight is unusable. */
  readyDollars: number | null;
  /** Positive means surplus; negative means the near-term need is not covered. */
  liquidityGapDollars: number | null;
  /** Rounded slice contributions for display. */
  contributionsBps: Record<AllocationRepairSleeveId, number | null>;
  /** Calculated from the unrounded aggregate and rounded once. */
  totalStressLossBps: number | null;
  totalStressLossDollars: number | null;
  caseInputsAreUsable: boolean;
  coherent: boolean;
}

export interface AllocationRepairResult {
  weightsBps: AllocationRepairWeightsBps;
  weightTotalBps: number;
  readyDollars: number;
  liquidityGapDollars: number;
  contributionsBps: AllocationRepairWeightsBps;
  totalStressLossBps: number;
  totalStressLossDollars: number;
  rationale: string;
}

export interface AllocationRepairLabProps {
  initialWeightsBps: AllocationRepairWeightsBps;
  /** Whole currency units used throughout this case. */
  portfolioAmount: number;
  /** Required near-term amount in the same currency units as portfolioAmount. */
  nearTermNeed: number;
  /** Positive loss magnitudes supplied by OPS for this exercise. */
  suppliedLossBps: AllocationRepairWeightsBps;
  /** The case's stress-loss budget as a positive magnitude. */
  lossBudgetBps: number;
  constraints?: AllocationRepairConstraints;
  requireRationale?: boolean;
  rationaleMinimumLength?: number;
  initialRationale?: string;
  title?: string;
  instruction?: string;
  submitLabel?: string;
  onPass: (result: AllocationRepairResult) => void;
}

type EditableWeights = Record<AllocationRepairSleeveId, number | null>;

type SleevePresentation = {
  label: string;
  job: string;
  accentText: string;
  accentBorder: string;
  accentSurface: string;
  accentFill: string;
};

const SLEEVE_IDS: readonly AllocationRepairSleeveId[] = ["ready", "steady", "grow"];

const SLEEVE_PRESENTATION: Record<AllocationRepairSleeveId, SleevePresentation> = {
  ready: {
    label: "Ready",
    job: "Near-term spending role",
    accentText: "text-accent-cyan",
    accentBorder: "border-accent-cyan/35",
    accentSurface: "bg-accent-cyan/[0.06]",
    accentFill: "bg-accent-cyan",
  },
  steady: {
    label: "Steady",
    job: "Stability role",
    accentText: "text-accent-purple",
    accentBorder: "border-accent-purple/35",
    accentSurface: "bg-accent-purple/[0.06]",
    accentFill: "bg-accent-purple",
  },
  grow: {
    label: "Grow",
    job: "Long-term growth role",
    accentText: "text-accent-amber",
    accentBorder: "border-accent-amber/35",
    accentSurface: "bg-accent-amber/[0.06]",
    accentFill: "bg-accent-amber",
  },
};

const DEFAULT_CONSTRAINT: Required<AllocationRepairConstraintOptions> = {
  enforced: true,
  displayed: true,
};

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function isValidBps(value: number | null): value is number {
  return (
    value !== null &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= BASIS_POINTS_TOTAL
  );
}

function isValidAmount(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function resolveConstraint(
  constraints: AllocationRepairConstraints | undefined,
  key: AllocationRepairConstraintKey,
): Required<AllocationRepairConstraintOptions> {
  const supplied = constraints?.[key];
  return {
    enforced: supplied?.enforced ?? DEFAULT_CONSTRAINT.enforced,
    displayed: supplied?.displayed ?? DEFAULT_CONSTRAINT.displayed,
  };
}

function toEditableWeights(weights: AllocationRepairWeightsBps): EditableWeights {
  return {
    ready: weights.ready,
    steady: weights.steady,
    grow: weights.grow,
  };
}

function toSleeves(
  weights: AllocationRepairWeightsBps,
  suppliedLossBps: AllocationRepairWeightsBps,
) {
  return SLEEVE_IDS.map((id) => ({
    id,
    targetBps: weights[id],
    assumedLossBps: suppliedLossBps[id],
  }));
}

/**
 * Evaluates a repair from the case facts rather than comparing it with a fixed answer.
 * Basis-point math delegates to the shared allocation-policy module.
 */
export function checkAllocationRepair({
  weightsBps,
  portfolioAmount,
  nearTermNeed,
  suppliedLossBps,
  lossBudgetBps,
  constraints,
}: {
  weightsBps: EditableWeights;
  portfolioAmount: number;
  nearTermNeed: number;
  suppliedLossBps: AllocationRepairWeightsBps;
  lossBudgetBps: number;
  constraints?: AllocationRepairConstraints;
}): AllocationRepairEvaluation {
  const constraintOptions = {
    bounds: resolveConstraint(constraints, "bounds"),
    weightTotal: resolveConstraint(constraints, "weightTotal"),
    liquidity: resolveConstraint(constraints, "liquidity"),
    stressBudget: resolveConstraint(constraints, "stressBudget"),
  };

  const weightsAreUsable = SLEEVE_IDS.every((id) => isValidBps(weightsBps[id]));
  const portfolioAmountIsUsable = isValidAmount(portfolioAmount) && portfolioAmount > 0;
  const nearTermNeedIsUsable =
    isValidAmount(nearTermNeed) &&
    portfolioAmountIsUsable &&
    nearTermNeed <= portfolioAmount;
  const lossesAreUsable = SLEEVE_IDS.every((id) => isValidBps(suppliedLossBps[id]));
  const lossBudgetIsUsable = isValidBps(lossBudgetBps);
  const caseInputsAreUsable =
    portfolioAmountIsUsable &&
    nearTermNeedIsUsable &&
    lossesAreUsable &&
    lossBudgetIsUsable;

  const concreteWeights = weightsAreUsable
    ? (weightsBps as AllocationRepairWeightsBps)
    : null;
  const sleeves = concreteWeights ? toSleeves(concreteWeights, suppliedLossBps) : null;
  const weightTotalBps = sleeves ? sumWeightBps(sleeves) : null;
  const weightsComplete = sleeves ? allocationWeightsAreComplete(sleeves) : false;

  const readyDollars =
    concreteWeights && portfolioAmountIsUsable
      ? (portfolioAmount * concreteWeights.ready) / BASIS_POINTS_TOTAL
      : null;
  const liquidityGapDollars =
    readyDollars !== null && isValidAmount(nearTermNeed)
      ? readyDollars - nearTermNeed
      : null;
  const nearTermNeedBps = nearTermNeedIsUsable
    ? Math.ceil((nearTermNeed / portfolioAmount) * BASIS_POINTS_TOTAL)
    : null;
  const liquidityCovered =
    concreteWeights && nearTermNeedBps !== null
      ? isLiquidityCovered(concreteWeights.ready, nearTermNeedBps)
      : false;

  const contributionsBps: Record<AllocationRepairSleeveId, number | null> = {
    ready: null,
    steady: null,
    grow: null,
  };

  if (concreteWeights && lossesAreUsable) {
    for (const id of SLEEVE_IDS) {
      contributionsBps[id] = calculateStressContributionBps(
        concreteWeights[id],
        suppliedLossBps[id],
      );
    }
  }

  const totalStressLossBps =
    sleeves && lossesAreUsable ? calculatePortfolioStressLossBps(sleeves) : null;
  const totalStressLossDollars =
    totalStressLossBps !== null && portfolioAmountIsUsable
      ? (portfolioAmount * totalStressLossBps) / BASIS_POINTS_TOTAL
      : null;
  const stressFitsBudget =
    totalStressLossBps !== null &&
    lossBudgetIsUsable &&
    totalStressLossBps <= lossBudgetBps;

  const rawChecks = {
    bounds: weightsAreUsable,
    weightTotal: weightsComplete,
    liquidity: liquidityCovered,
    stressBudget: stressFitsBudget,
  };

  const checks = Object.fromEntries(
    (Object.keys(rawChecks) as AllocationRepairConstraintKey[]).map((key) => [
      key,
      {
        passed: rawChecks[key],
        enforced: constraintOptions[key].enforced,
        displayed: constraintOptions[key].displayed,
      },
    ]),
  ) as Record<AllocationRepairConstraintKey, AllocationRepairCheck>;

  const enforcedChecksPass = (Object.keys(checks) as AllocationRepairConstraintKey[]).every(
    (key) => !checks[key].enforced || checks[key].passed,
  );

  return {
    checks,
    weightsAreUsable,
    weightTotalBps,
    readyDollars,
    liquidityGapDollars,
    contributionsBps,
    totalStressLossBps,
    totalStressLossDollars,
    caseInputsAreUsable,
    // Usable numeric inputs remain a safety prerequisite even if their teaching card is hidden.
    coherent: weightsAreUsable && caseInputsAreUsable && enforcedChecksPass,
  };
}

function formatBps(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${percentFormatter.format(value / 100)}%`;
}

function formatLossBps(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0%";
  return `-${percentFormatter.format(value / 100)}%`;
}

function formatCurrency(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return currencyFormatter.format(value);
}

function parsePercentToBps(rawValue: string): number | null {
  if (rawValue.trim() === "") return null;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
}

function clampBps(value: number): number {
  return Math.max(0, Math.min(BASIS_POINTS_TOTAL, Math.round(value)));
}

function weightTotalFeedback(totalBps: number | null): string {
  if (totalBps === null) {
    return "Enter a finite percentage from 0% to 100% for every slice.";
  }
  const difference = totalBps - BASIS_POINTS_TOTAL;
  if (difference === 0) {
    return "Every portfolio dollar is assigned once.";
  }
  if (difference > 0) {
    return `${formatBps(difference)} is assigned twice. Reduce one or more sleeves.`;
  }
  return `${formatBps(Math.abs(difference))} remains unassigned. Add it to one or more sleeves.`;
}

function liquidityFeedback(
  readyDollars: number | null,
  nearTermNeed: number,
  gapDollars: number | null,
): string {
  if (readyDollars === null || gapDollars === null) {
    return "Enter a usable Ready weight to compare the bucket with the near-term need.";
  }
  if (gapDollars >= 0) {
    return `Ready holds about ${formatCurrency(readyDollars)}, covering the ${formatCurrency(
      nearTermNeed,
    )} need with ${formatCurrency(gapDollars)} left in that role.`;
  }
  return `Ready holds about ${formatCurrency(readyDollars)}, leaving ${formatCurrency(
    Math.abs(gapDollars),
  )} of the ${formatCurrency(nearTermNeed)} need uncovered.`;
}

function stressFeedback(
  stressLossBps: number | null,
  stressLossDollars: number | null,
  lossBudgetBps: number,
): string {
  if (stressLossBps === null || stressLossDollars === null) {
    return "Complete the weights to calculate the consequence of the supplied losses.";
  }
  const difference = stressLossBps - lossBudgetBps;
  if (difference <= 0) {
    return `The supplied losses produce ${formatBps(stressLossBps)} of portfolio loss, about ${formatCurrency(
      stressLossDollars,
    )}, which is ${formatBps(Math.abs(difference))} inside the case budget.`;
  }
  return `The supplied losses produce ${formatBps(stressLossBps)} of portfolio loss, about ${formatCurrency(
    stressLossDollars,
  )}, exceeding the case budget by ${formatBps(difference)}. Moving weight away from a slice with a positive supplied loss reduces this result.`;
}

function WeightControl({
  id,
  valueBps,
  suppliedLossBps,
  onChange,
  invalid,
  idPrefix,
}: {
  id: AllocationRepairSleeveId;
  valueBps: number | null;
  suppliedLossBps: number;
  onChange: (next: number | null) => void;
  invalid: boolean;
  idPrefix: string;
}) {
  const presentation = SLEEVE_PRESENTATION[id];
  const inputId = `${idPrefix}-${id}-weight`;
  const helpId = `${inputId}-help`;
  const usableValue = isValidBps(valueBps) ? valueBps : 0;

  return (
    <fieldset
      className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${presentation.accentBorder} ${presentation.accentSurface}`}
    >
      <legend className="sr-only">{presentation.label} slice</legend>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-[15px] font-semibold ${presentation.accentText}`}>
            {presentation.label}
          </div>
          <div className="mt-1 text-[12px] leading-5 text-slate-500">{presentation.job}</div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] tabular-nums text-slate-400">
          OPS loss {formatLossBps(suppliedLossBps)}
        </div>
      </div>

      <label htmlFor={inputId} className="mt-5 block text-[13px] font-medium text-slate-300">
        {presentation.label} weight
      </label>
      <div className="mt-2 grid grid-cols-[44px_minmax(0,1fr)_44px] items-stretch gap-2">
        <button
          type="button"
          onClick={() => onChange(clampBps((valueBps ?? 0) - 100))}
          disabled={valueBps !== null && valueBps <= 0}
          aria-label={`Decrease ${presentation.label} weight by 1 percentage point`}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-xl font-medium text-slate-300 transition-colors hover:border-accent-cyan/45 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/55 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
        >
          <span aria-hidden="true">−</span>
        </button>
        <span
          className={`flex min-h-11 min-w-0 items-center rounded-xl border bg-white/[0.04] px-3 focus-within:ring-2 focus-within:ring-accent-cyan/45 ${
            invalid ? "border-accent-red/60" : "border-white/15"
          }`}
        >
          <input
            id={inputId}
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={1}
            value={valueBps === null ? "" : valueBps / 100}
            onChange={(event) => onChange(parsePercentToBps(event.currentTarget.value))}
            aria-describedby={helpId}
            aria-invalid={invalid || undefined}
            className="h-11 min-w-0 flex-1 bg-transparent text-right text-[16px] font-semibold tabular-nums text-white outline-none"
          />
          <span aria-hidden="true" className="ml-2 text-[14px] text-slate-500">
            %
          </span>
        </span>
        <button
          type="button"
          onClick={() => onChange(clampBps((valueBps ?? 0) + 100))}
          disabled={valueBps !== null && valueBps >= BASIS_POINTS_TOTAL}
          aria-label={`Increase ${presentation.label} weight by 1 percentage point`}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-xl font-medium text-slate-300 transition-colors hover:border-accent-cyan/45 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/55 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
      <p id={helpId} className="mt-2 text-[12px] leading-5 text-slate-500">
        Enter 0% to 100%. The loss input is locked by OPS for this exercise.
      </p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]" aria-hidden="true">
        <div
          className={`h-full origin-left ${presentation.accentFill} transition-transform duration-300 motion-reduce:transition-none`}
          style={{ transform: `scaleX(${usableValue / BASIS_POINTS_TOTAL})` }}
        />
      </div>
    </fieldset>
  );
}

function ConstraintCard({
  label,
  check,
  value,
  feedback,
}: {
  label: string;
  check: AllocationRepairCheck;
  value: string;
  feedback: string;
}) {
  const tone = check.passed
    ? "border-accent-green/30 bg-accent-green/[0.05]"
    : check.enforced
      ? "border-accent-amber/35 bg-accent-amber/[0.05]"
      : "border-white/10 bg-white/[0.03]";
  const stateLabel = check.enforced
    ? check.passed
      ? "Condition met"
      : "Repair needed"
    : "Visible, not required";

  return (
    <li className={`rounded-2xl border p-4 sm:p-5 ${tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-slate-300">{label}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[12px] font-medium ${
            check.passed
              ? "border-accent-green/35 text-accent-green"
              : check.enforced
                ? "border-accent-amber/35 text-accent-amber"
                : "border-white/10 text-slate-500"
          }`}
        >
          {stateLabel}
        </span>
      </div>
      <p className="mt-3 text-[13px] leading-5 text-slate-400">{feedback}</p>
    </li>
  );
}

export default function AllocationRepairLab({
  initialWeightsBps,
  portfolioAmount,
  nearTermNeed,
  suppliedLossBps,
  lossBudgetBps,
  constraints,
  requireRationale = false,
  rationaleMinimumLength = 20,
  initialRationale = "",
  title = "Repair the allocation",
  instruction = "Change the slice weights until the case facts and every required condition agree.",
  submitLabel = "Lock this repair",
  onPass,
}: AllocationRepairLabProps) {
  const generatedId = useId().replace(/:/g, "");
  const [weightsBps, setWeightsBps] = useState<EditableWeights>(() =>
    toEditableWeights(initialWeightsBps),
  );
  const [rationale, setRationale] = useState(initialRationale);

  const evaluation = useMemo(
    () =>
      checkAllocationRepair({
        weightsBps,
        portfolioAmount,
        nearTermNeed,
        suppliedLossBps,
        lossBudgetBps,
        constraints,
      }),
    [
      constraints,
      lossBudgetBps,
      nearTermNeed,
      portfolioAmount,
      suppliedLossBps,
      weightsBps,
    ],
  );

  const minimumRationaleLength = Math.max(20, Math.round(rationaleMinimumLength));
  const rationalePasses =
    !requireRationale || rationale.trim().length >= minimumRationaleLength;
  const canPass = evaluation.coherent && rationalePasses;
  const displayedChecks = (
    Object.keys(evaluation.checks) as AllocationRepairConstraintKey[]
  ).filter((key) => evaluation.checks[key].displayed);

  const updateWeight = (id: AllocationRepairSleeveId, next: number | null) => {
    setWeightsBps((current) => ({ ...current, [id]: next }));
  };

  const handlePass = () => {
    if (!canPass || !evaluation.weightsAreUsable) return;
    if (
      evaluation.weightTotalBps === null ||
      evaluation.readyDollars === null ||
      evaluation.liquidityGapDollars === null ||
      evaluation.totalStressLossBps === null ||
      evaluation.totalStressLossDollars === null
    ) {
      return;
    }
    if (
      evaluation.contributionsBps.ready === null ||
      evaluation.contributionsBps.steady === null ||
      evaluation.contributionsBps.grow === null
    ) {
      return;
    }

    onPass({
      weightsBps: weightsBps as AllocationRepairWeightsBps,
      weightTotalBps: evaluation.weightTotalBps,
      readyDollars: evaluation.readyDollars,
      liquidityGapDollars: evaluation.liquidityGapDollars,
      contributionsBps: evaluation.contributionsBps as AllocationRepairWeightsBps,
      totalStressLossBps: evaluation.totalStressLossBps,
      totalStressLossDollars: evaluation.totalStressLossDollars,
      rationale: rationale.trim(),
    });
  };

  const weightsPass = evaluation.checks.bounds.passed;
  const stressFeedbackText = stressFeedback(
    evaluation.totalStressLossBps,
    evaluation.totalStressLossDollars,
    lossBudgetBps,
  );
  const statusMessage = !evaluation.caseInputsAreUsable
    ? "This case needs usable portfolio, cash-need, loss, and budget inputs."
    : canPass
      ? "All required conditions are met. This repair is ready to lock."
      : requireRationale && evaluation.coherent && !rationalePasses
        ? `Explain one trade-off in at least ${minimumRationaleLength} characters.`
        : "The live checks show what still needs repair.";

  return (
    <section
      aria-labelledby={`${generatedId}-title`}
      className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-panel"
    >
      <header className="relative border-b border-white/10 px-5 py-6 sm:px-7 sm:py-8 lg:px-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/70 to-transparent"
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)] lg:items-end">
          <div>
            <div className="text-[13px] font-semibold tracking-[0.01em] text-accent-cyan">
              Allocation repair lab
            </div>
            <h3
              id={`${generatedId}-title`}
              className="mt-2 font-display text-3xl leading-tight text-white sm:text-4xl"
            >
              {title}
            </h3>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-slate-400">
              {instruction}
            </p>
          </div>
          <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-4">
            <div className="text-[12px] font-medium text-accent-cyan">Case facts</div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
              <div>
                <dt className="text-slate-500">Portfolio</dt>
                <dd className="mt-1 font-semibold tabular-nums text-white">
                  {formatCurrency(portfolioAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Near-term need</dt>
                <dd className="mt-1 font-semibold tabular-nums text-white">
                  {formatCurrency(nearTermNeed)}
                </dd>
              </div>
              <div className="col-span-2 border-t border-accent-cyan/15 pt-3">
                <dt className="text-slate-500">Case stress-loss budget</dt>
                <dd className="mt-1 font-semibold tabular-nums text-white">
                  No more than {formatBps(lossBudgetBps)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <div className="space-y-7 px-5 py-6 sm:px-7 sm:py-8 lg:px-9">
        <div className="rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.05] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full border border-accent-purple/35 text-[12px] font-semibold text-accent-purple"
            >
              i
            </span>
            <div>
              <div className="text-[13px] font-semibold text-white">OPS-supplied teaching stress</div>
              <p className="mt-1 text-[13px] leading-5 text-slate-400">
                The three loss magnitudes are read-only and apply only to this exercise. Your
                editable decision is how much of the portfolio each slice receives.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {SLEEVE_IDS.map((id) => (
            <WeightControl
              key={id}
              id={id}
              valueBps={weightsBps[id]}
              suppliedLossBps={suppliedLossBps[id]}
              onChange={(next) => updateWeight(id, next)}
              invalid={!isValidBps(weightsBps[id])}
              idPrefix={generatedId}
            />
          ))}
        </div>

        <section aria-labelledby={`${generatedId}-scan-title`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[13px] font-semibold tracking-[0.01em] text-accent-red">
                Consequence scanner
              </div>
              <h4
                id={`${generatedId}-scan-title`}
                className="mt-2 font-display text-2xl text-white sm:text-3xl"
              >
                See where the loss comes from.
              </h4>
              <p className="mt-2 max-w-2xl text-[13px] leading-5 text-slate-400">
                Slice weight × OPS-supplied loss = contribution to portfolio loss.
              </p>
            </div>
            <div className="rounded-2xl border border-accent-red/30 bg-accent-red/[0.05] px-4 py-3 text-right">
              <div className="text-[12px] text-slate-500">Total stress loss</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-accent-red">
                {formatBps(evaluation.totalStressLossBps)}
              </div>
              <div className="mt-1 text-[12px] tabular-nums text-slate-400">
                {formatCurrency(evaluation.totalStressLossDollars)}
              </div>
            </div>
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-2xl border border-white/10 md:block">
            <table className="w-full border-collapse text-left text-[13px]">
              <caption className="sr-only">
                Slice weights, supplied teaching losses, and portfolio loss contributions
              </caption>
              <thead className="bg-white/[0.03] text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Slice</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Weight</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Approx. dollars</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">OPS-supplied loss</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Portfolio contribution</th>
                </tr>
              </thead>
              <tbody>
                {SLEEVE_IDS.map((id) => {
                  const presentation = SLEEVE_PRESENTATION[id];
                  const sleeveDollars = isValidBps(weightsBps[id])
                    ? (portfolioAmount * weightsBps[id]) / BASIS_POINTS_TOTAL
                    : null;
                  return (
                    <tr key={id} className="border-t border-white/10 text-slate-300">
                      <th scope="row" className={`px-4 py-4 font-semibold ${presentation.accentText}`}>
                        {presentation.label}
                      </th>
                      <td className="px-3 py-4 text-right tabular-nums">
                        {formatBps(weightsBps[id])}
                      </td>
                      <td className="px-3 py-4 text-right tabular-nums">
                        {formatCurrency(sleeveDollars)}
                      </td>
                      <td className="px-3 py-4 text-right tabular-nums">
                        {formatLossBps(suppliedLossBps[id])}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums text-white">
                        {formatBps(evaluation.contributionsBps[id])}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t border-white/15 bg-white/[0.03] text-white">
                  <th scope="row" className="px-4 py-4 font-semibold">Total</th>
                  <td className="px-3 py-4 text-right font-semibold tabular-nums">
                    {formatBps(evaluation.weightTotalBps)}
                  </td>
                  <td className="px-3 py-4 text-right font-semibold tabular-nums">
                    {weightsPass ? formatCurrency(portfolioAmount) : "—"}
                  </td>
                  <td className="px-3 py-4 text-right text-slate-500">—</td>
                  <td className="px-4 py-4 text-right font-semibold tabular-nums text-accent-red">
                    {formatBps(evaluation.totalStressLossBps)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 space-y-3 md:hidden">
            {SLEEVE_IDS.map((id) => {
              const presentation = SLEEVE_PRESENTATION[id];
              const sleeveDollars = isValidBps(weightsBps[id])
                ? (portfolioAmount * weightsBps[id]) / BASIS_POINTS_TOTAL
                : null;
              return (
                <div key={id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className={`font-semibold ${presentation.accentText}`}>
                      {presentation.label}
                    </div>
                    <div className="font-semibold tabular-nums text-white">
                      {formatBps(weightsBps[id])}
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
                    <div>
                      <dt className="text-slate-500">Approx. dollars</dt>
                      <dd className="mt-1 tabular-nums text-slate-300">
                        {formatCurrency(sleeveDollars)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">OPS-supplied loss</dt>
                      <dd className="mt-1 tabular-nums text-slate-300">
                        {formatLossBps(suppliedLossBps[id])}
                      </dd>
                    </div>
                    <div className="col-span-2 border-t border-white/10 pt-3">
                      <dt className="text-slate-500">Portfolio loss contribution</dt>
                      <dd className="mt-1 font-semibold tabular-nums text-white">
                        {formatBps(evaluation.contributionsBps[id])}
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>
        </section>

        {displayedChecks.length > 0 ? (
          <section aria-labelledby={`${generatedId}-checks-title`}>
            <div>
              <div className="text-[13px] font-semibold tracking-[0.01em] text-accent-green">
                Live policy check
              </div>
              <h4 id={`${generatedId}-checks-title`} className="mt-2 font-display text-2xl text-white">
                Make the consequences agree.
              </h4>
            </div>
            <ul className="mt-5 grid gap-3 lg:grid-cols-2">
              {evaluation.checks.bounds.displayed ? (
                <ConstraintCard
                  label="Usable weight range"
                  check={evaluation.checks.bounds}
                  value={weightsPass ? "0%–100%" : "Check inputs"}
                  feedback={
                    weightsPass
                      ? "Every slice contains a finite percentage inside the permitted input range."
                      : "Each slice needs a finite percentage from 0% to 100%."
                  }
                />
              ) : null}
              {evaluation.checks.weightTotal.displayed ? (
                <ConstraintCard
                  label="Weight integrity"
                  check={evaluation.checks.weightTotal}
                  value={formatBps(evaluation.weightTotalBps)}
                  feedback={weightTotalFeedback(evaluation.weightTotalBps)}
                />
              ) : null}
              {evaluation.checks.liquidity.displayed ? (
                <ConstraintCard
                  label="Ready coverage"
                  check={evaluation.checks.liquidity}
                  value={`${formatCurrency(evaluation.readyDollars)} Ready`}
                  feedback={liquidityFeedback(
                    evaluation.readyDollars,
                    nearTermNeed,
                    evaluation.liquidityGapDollars,
                  )}
                />
              ) : null}
              {evaluation.checks.stressBudget.displayed ? (
                <ConstraintCard
                  label="Stress-loss budget"
                  check={evaluation.checks.stressBudget}
                  value={`${formatBps(evaluation.totalStressLossBps)} / ${formatBps(lossBudgetBps)}`}
                  feedback={stressFeedbackText}
                />
              ) : null}
            </ul>
          </section>
        ) : null}

        {requireRationale ? (
          <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-4 sm:p-5">
            <label htmlFor={`${generatedId}-rationale`} className="block text-[13px] font-semibold text-white">
              Explain one trade-off in this repair
            </label>
            <p id={`${generatedId}-rationale-help`} className="mt-1 text-[12px] leading-5 text-slate-500">
              In at least {minimumRationaleLength} characters, connect a changed slice to the
              liquidity or stress consequence you accept.
            </p>
            <textarea
              id={`${generatedId}-rationale`}
              value={rationale}
              onChange={(event) => setRationale(event.currentTarget.value)}
              rows={3}
              aria-describedby={`${generatedId}-rationale-help`}
              aria-invalid={(rationale.trim().length > 0 && !rationalePasses) || undefined}
              placeholder="I increased Ready because… The trade-off is…"
              className={`mt-4 w-full resize-y rounded-xl border bg-white/[0.04] px-4 py-3 text-[16px] leading-6 text-white outline-none transition-colors placeholder:text-slate-600 focus:ring-2 focus:ring-accent-cyan/40 motion-reduce:transition-none ${
                rationale.trim().length > 0 && !rationalePasses
                  ? "border-accent-red/60"
                  : "border-white/15"
              }`}
            />
            <div className="mt-2 text-right text-[12px] tabular-nums text-slate-500">
              {rationale.trim().length} / {minimumRationaleLength} minimum
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={`text-[13px] leading-5 ${canPass ? "text-accent-green" : "text-slate-400"}`}
            aria-live="polite"
          >
            {statusMessage}
          </p>
          <button
            type="button"
            onClick={handlePass}
            disabled={!canPass}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent-green/40 bg-accent-green/10 px-6 py-3 text-[14px] font-semibold text-accent-green transition-colors hover:bg-accent-green/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/55 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
