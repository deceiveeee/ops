"use client";

import {
  BASIS_POINTS_TOTAL,
  allocationWeightsAreComplete,
  calculateCandidateCeilingBps,
  calculatePortfolioStressLossBps,
  calculateStressContributionBps,
  isLiquidityCovered,
  sumWeightBps,
  validateAllocationSleeves,
  type AllocationSleeveInput,
} from "@/lib/allocation-policy";

export type AllocationSleeveId = "ready" | "steady" | "grow";

export interface AllocationSleeveDraft extends AllocationSleeveInput {
  id: AllocationSleeveId;
}

export interface AllocationDraft {
  /** Approximate portfolio value in whole currency units. */
  portfolioAmount: number;
  /** Known near-term need in the same currency units as portfolioAmount. */
  nearTermNeed: number;
  sleeves: AllocationSleeveDraft[];
  /** Learner-owned total stress-loss budget. */
  lossBudgetBps: number;
  /** Learner-owned maximum portfolio-loss contribution from one candidate. */
  candidateMaxContributionBps: number | null;
  /** Learner/OPS hypothetical loss applied to that candidate. */
  candidateAssumedLossBps: number | null;
  /** Learner's explanation connecting this policy to the saved mandate. */
  mandateRationale: string;
  acknowledged: boolean;
}

export interface AllocationStudioProps {
  value: AllocationDraft;
  onChange: (next: AllocationDraft) => void;
  showErrors?: boolean;
  /** Mission 5 imports these reference facts from the saved mandate. */
  referenceAmountsReadOnly?: boolean;
}

type SleevePresentation = {
  title: string;
  role: string;
  purpose: string;
  accentText: string;
  accentBorder: string;
  accentSurface: string;
  accentFill: string;
};

const SLEEVE_PRESENTATION: Record<AllocationSleeveId, SleevePresentation> = {
  ready: {
    title: "Ready",
    role: "Liquidity role",
    purpose: "Capital tagged for the portfolio's known near-term spending role.",
    accentText: "text-accent-cyan",
    accentBorder: "border-accent-cyan/35",
    accentSurface: "bg-accent-cyan/[0.07]",
    accentFill: "bg-accent-cyan",
  },
  steady: {
    title: "Steady",
    role: "Stability role",
    purpose: "Capital tagged for the portfolio's stability role.",
    accentText: "text-accent-purple",
    accentBorder: "border-accent-purple/35",
    accentSurface: "bg-accent-purple/[0.07]",
    accentFill: "bg-accent-purple",
  },
  grow: {
    title: "Grow",
    role: "Long-term growth role",
    purpose: "Capital tagged for the portfolio's long-term growth role.",
    accentText: "text-accent-amber",
    accentBorder: "border-accent-amber/35",
    accentSurface: "bg-accent-amber/[0.07]",
    accentFill: "bg-accent-amber",
  },
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

function isValidBps(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= BASIS_POINTS_TOTAL;
}

function isValidAmount(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function formatBps(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${percentFormatter.format(value / 100)}%`;
}

function formatLossBps(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0%";
  return `−${percentFormatter.format(value / 100)}%`;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return currencyFormatter.format(value);
}

function parsePercentToBps(rawValue: string): number | null {
  if (rawValue.trim() === "") return null;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
}

function parseAmount(rawValue: string): number | null {
  if (rawValue.trim() === "") return null;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

function clampBps(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(BASIS_POINTS_TOTAL, Math.round(value)));
}

function PercentageInput({
  id,
  label,
  valueBps,
  onChange,
  describedBy,
  invalid = false,
  step = 1,
}: {
  id: string;
  label: string;
  valueBps: number;
  onChange: (nextBps: number) => void;
  describedBy?: string;
  invalid?: boolean;
  step?: number;
}) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="mb-2 block text-[13px] font-medium text-slate-400">{label}</span>
      <span
        className={`flex min-h-12 items-center rounded-xl border bg-white/[0.03] px-3 transition-colors focus-within:ring-2 focus-within:ring-accent-cyan/35 ${
          invalid ? "border-accent-red/60" : "border-white/10"
        }`}
      >
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={step}
          value={Number.isFinite(valueBps) ? valueBps / 100 : ""}
          onChange={(event) => {
            const nextBps = parsePercentToBps(event.currentTarget.value);
            if (nextBps !== null) onChange(nextBps);
          }}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-right text-[16px] font-semibold tabular-nums text-white outline-none"
        />
        <span aria-hidden="true" className="ml-2 text-[14px] text-slate-500">
          %
        </span>
      </span>
    </label>
  );
}

function AmountInput({
  id,
  label,
  value,
  onChange,
  describedBy,
  invalid = false,
  readOnly = false,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  describedBy?: string;
  invalid?: boolean;
  readOnly?: boolean;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-[13px] font-medium text-slate-400">{label}</span>
      <span
        className={`flex min-h-12 items-center rounded-xl border bg-white/[0.03] px-3 transition-colors focus-within:ring-2 focus-within:ring-accent-cyan/35 ${
          invalid ? "border-accent-red/60" : "border-white/10"
        }`}
      >
        <span aria-hidden="true" className="mr-2 text-[14px] text-slate-500">
          $
        </span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={100}
          readOnly={readOnly}
          value={Number.isFinite(value) ? value : ""}
          onChange={(event) => {
            const next = parseAmount(event.currentTarget.value);
            if (next !== null) onChange(next);
          }}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={`min-w-0 flex-1 bg-transparent py-2.5 text-[16px] font-semibold tabular-nums text-white outline-none ${
            readOnly ? "cursor-default text-slate-300" : ""
          }`}
        />
      </span>
    </label>
  );
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-xl font-medium text-slate-300 transition-colors hover:border-accent-cyan/45 hover:text-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
    >
      {children}
    </button>
  );
}

function ValidationRow({ passed, children }: { passed: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[14px] leading-6">
      <span
        aria-hidden="true"
        className={`mt-1.5 flex h-4 w-4 flex-none items-center justify-center rounded-full border text-[12px] ${
          passed
            ? "border-accent-green/45 bg-accent-green/10 text-accent-green"
            : "border-accent-amber/45 bg-accent-amber/10 text-accent-amber"
        }`}
      >
        {passed ? "✓" : "·"}
      </span>
      <span className={passed ? "text-slate-300" : "text-slate-400"}>{children}</span>
    </li>
  );
}

export default function AllocationStudio({
  value,
  onChange,
  showErrors = false,
  referenceAmountsReadOnly = false,
}: AllocationStudioProps) {
  const sleeveIssues = validateAllocationSleeves(value.sleeves);
  const sleeveValuesAreValid = value.sleeves.every(
    (sleeve) =>
      isValidBps(sleeve.targetBps) &&
      isValidBps(sleeve.minBps) &&
      isValidBps(sleeve.maxBps) &&
      isValidBps(sleeve.assumedLossBps),
  );
  const rawWeightTotal = value.sleeves.reduce(
    (total, sleeve) => total + (Number.isFinite(sleeve.targetBps) ? sleeve.targetBps : 0),
    0,
  );
  const weightTotal = sleeveValuesAreValid ? sumWeightBps(value.sleeves) : rawWeightTotal;
  const weightsComplete = sleeveValuesAreValid
    ? allocationWeightsAreComplete(value.sleeves)
    : false;
  const portfolioAmountIsValid = isValidAmount(value.portfolioAmount) && value.portfolioAmount > 0;
  const nearTermNeedIsValid =
    isValidAmount(value.nearTermNeed) &&
    portfolioAmountIsValid &&
    value.nearTermNeed <= value.portfolioAmount;
  const nearTermNeedBps = nearTermNeedIsValid
    ? Math.ceil((value.nearTermNeed / value.portfolioAmount) * BASIS_POINTS_TOTAL)
    : null;
  const readySleeve = value.sleeves.find((sleeve) => sleeve.id === "ready");
  const liquidityCovered =
    nearTermNeedBps !== null &&
    readySleeve !== undefined &&
    isValidBps(readySleeve.targetBps)
      ? isLiquidityCovered(readySleeve.targetBps, nearTermNeedBps)
      : false;
  const lossBudgetIsValid = isValidBps(value.lossBudgetBps);
  const totalStressLossBps = sleeveValuesAreValid
    ? calculatePortfolioStressLossBps(value.sleeves)
    : null;
  const stressFitsBudget =
    totalStressLossBps !== null &&
    lossBudgetIsValid &&
    totalStressLossBps <= value.lossBudgetBps;
  const candidateOmitted =
    value.candidateMaxContributionBps === null &&
    value.candidateAssumedLossBps === null;
  const candidateInputsAreValid =
    candidateOmitted ||
    (lossBudgetIsValid &&
      value.candidateMaxContributionBps !== null &&
      value.candidateAssumedLossBps !== null &&
      isValidBps(value.candidateMaxContributionBps) &&
      isValidBps(value.candidateAssumedLossBps) &&
      value.candidateAssumedLossBps > 0 &&
      value.candidateMaxContributionBps <= value.lossBudgetBps);
  const candidateCeilingBps = candidateInputsAreValid
    && !candidateOmitted
    ? calculateCandidateCeilingBps(
        value.candidateMaxContributionBps as number,
        value.candidateAssumedLossBps as number,
      )
    : null;
  const rationaleIsUsable = value.mandateRationale.trim().length >= 20;
  const rangesAreCoherent = !sleeveIssues.some(
    (issue) => issue.code === "invalid-range" || issue.code === "invalid-basis-points",
  );
  const allChecksPass =
    portfolioAmountIsValid &&
    nearTermNeedIsValid &&
    sleeveIssues.length === 0 &&
    liquidityCovered &&
    stressFitsBudget &&
    candidateInputsAreValid &&
    rationaleIsUsable &&
    value.acknowledged;

  const updateSleeve = (
    id: AllocationSleeveId,
    patch: Partial<Omit<AllocationSleeveDraft, "id">>,
  ) => {
    onChange({
      ...value,
      sleeves: value.sleeves.map((sleeve) =>
        sleeve.id === id ? { ...sleeve, ...patch } : sleeve,
      ),
    });
  };

  const contributionFor = (sleeve: AllocationSleeveDraft): number | null =>
    isValidBps(sleeve.targetBps) && isValidBps(sleeve.assumedLossBps)
      ? calculateStressContributionBps(sleeve.targetBps, sleeve.assumedLossBps)
      : null;

  const readyDollars =
    portfolioAmountIsValid && readySleeve && isValidBps(readySleeve.targetBps)
      ? (value.portfolioAmount * readySleeve.targetBps) / BASIS_POINTS_TOTAL
      : null;
  const stressDollars =
    totalStressLossBps !== null && portfolioAmountIsValid
      ? (value.portfolioAmount * totalStressLossBps) / BASIS_POINTS_TOTAL
      : null;
  const budgetGapBps =
    totalStressLossBps !== null && lossBudgetIsValid
      ? totalStressLossBps - value.lossBudgetBps
      : null;

  let consequence = "Enter a portfolio amount and coherent sleeve policy to reveal the consequence.";
  if (!sleeveValuesAreValid || !rangesAreCoherent) {
    consequence =
      "One or more policy inputs are outside 0%–100%, or a target sits outside its own range. Repair those inputs before reading the stress result.";
  } else if (!weightsComplete) {
    const differenceBps = Math.abs(BASIS_POINTS_TOTAL - weightTotal);
    const differenceDollars = portfolioAmountIsValid
      ? (value.portfolioAmount * differenceBps) / BASIS_POINTS_TOTAL
      : null;
    consequence =
      weightTotal > BASIS_POINTS_TOTAL
        ? `${formatBps(differenceBps)} of capital${
            differenceDollars !== null ? `, about ${formatCurrency(differenceDollars)},` : ""
          } is assigned twice. Every dollar needs exactly one role.`
        : `${formatBps(differenceBps)} of capital${
            differenceDollars !== null ? `, about ${formatCurrency(differenceDollars)},` : ""
          } still has no role.`;
  } else if (!nearTermNeedIsValid) {
    consequence =
      "The known near-term need must be a non-negative amount no larger than this portfolio before coverage can be tested.";
  } else if (!liquidityCovered && readyDollars !== null) {
    consequence = `${formatCurrency(readyDollars)} is assigned to Ready, leaving ${formatCurrency(
      Math.max(0, value.nearTermNeed - readyDollars),
    )} of the known near-term need dependent on capital assigned to other roles.`;
  } else if (totalStressLossBps !== null && stressDollars !== null && budgetGapBps !== null) {
    consequence = stressFitsBudget
      ? `Under the visible teaching stress, the portfolio declines about ${formatCurrency(
          stressDollars,
        )} (${formatBps(totalStressLossBps)}), leaving about ${formatCurrency(
          value.portfolioAmount - stressDollars,
        )}. This scenario is not a forecast or a worst-case bound.`
      : `Under the visible teaching stress, the portfolio declines about ${formatCurrency(
          stressDollars,
        )} (${formatBps(totalStressLossBps)}), which is ${formatBps(
          Math.max(0, budgetGapBps),
        )} above the learner-owned loss budget.`;
  }

  const validationItems = [
    {
      passed: portfolioAmountIsValid && nearTermNeedIsValid,
      label: "Portfolio amount and near-term need are usable.",
    },
    {
      passed: weightsComplete && rangesAreCoherent,
      label: "Targets total 100% and sit inside their stated ranges.",
    },
    {
      passed: liquidityCovered,
      label:
        value.nearTermNeed === 0
          ? "No known near-term need is entered."
          : "The Ready target covers the known near-term need.",
    },
    {
      passed: stressFitsBudget,
      label: "The visible teaching stress fits the learner-owned loss budget.",
    },
    {
      passed: candidateInputsAreValid,
      label: candidateOmitted
        ? "The optional candidate ceiling is explicitly omitted for now."
        : "The candidate ceiling has finite inputs and fits inside the total loss budget.",
    },
    {
      passed: rationaleIsUsable,
      label: "The policy rationale connects the weights and loss budget to the saved mandate.",
    },
    {
      passed: value.acknowledged,
      label: "The learner has acknowledged the policy consequences and assumption limits.",
    },
  ];
  const passedCount = validationItems.filter((item) => item.passed).length;

  return (
    <section aria-labelledby="allocation-studio-title" className="space-y-6 font-sans">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-panel">
        <div className="relative px-5 pb-6 pt-6 sm:px-7 sm:pb-8 sm:pt-8 lg:px-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/70 to-transparent"
          />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)] lg:items-end">
            <div>
              {/* The journey shell already renders this stage title directly
                  above, so repeating the sentence here showed the learner the
                  same headline twice at two different sizes, and gave the page
                  two headings with the same name. The panel keeps its own name
                  for assistive tech. */}
              <h2
                id="allocation-studio-title"
                className="text-[13px] font-semibold tracking-[0.01em] text-accent-cyan"
              >
                Allocation Studio
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-400 sm:text-base">
                This canvas does not recommend an allocation or select products. You own the
                weights, ranges, and loss budget. The displayed stress magnitudes are an OPS
                teaching scenario supplied by the lesson.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AmountInput
                id="allocation-portfolio-amount"
                label="Approximate portfolio amount"
                value={value.portfolioAmount}
                onChange={(portfolioAmount) => onChange({ ...value, portfolioAmount })}
                describedBy="allocation-amount-help"
                invalid={showErrors && !portfolioAmountIsValid}
                readOnly={referenceAmountsReadOnly}
              />
              <AmountInput
                id="allocation-near-term-need"
                label="Known near-term need"
                value={value.nearTermNeed}
                onChange={(nearTermNeed) => onChange({ ...value, nearTermNeed })}
                describedBy="allocation-amount-help"
                invalid={showErrors && !nearTermNeedIsValid}
                readOnly={referenceAmountsReadOnly}
              />
              <p id="allocation-amount-help" className="text-[12px] leading-5 text-slate-500 sm:col-span-2">
                {referenceAmountsReadOnly
                  ? "These reference facts come from the saved mandate. Return to Readiness to change them; percentages remain the policy record."
                  : "Approximate dollars help reveal consequences; percentages remain the policy record."}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-6 sm:px-7 sm:py-8 lg:px-9">
          <div className="grid gap-7 lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-semibold text-white">Policy constellation</div>
                    <p className="mt-1 text-[12px] leading-5 text-slate-500">
                      Node size responds to target weight. The band below carries the exact split.
                    </p>
                  </div>
                  <div
                    className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold tabular-nums ${
                      weightsComplete
                        ? "border-accent-green/35 bg-accent-green/10 text-accent-green"
                        : "border-accent-amber/35 bg-accent-amber/10 text-accent-amber"
                    }`}
                  >
                    {formatBps(weightTotal)} assigned
                  </div>
                </div>

                <div
                  className="relative mt-7 grid grid-cols-3 gap-2"
                  role="img"
                  aria-label={`Allocation constellation: ${value.sleeves
                    .map(
                      (sleeve) =>
                        `${SLEEVE_PRESENTATION[sleeve.id].title} ${formatBps(sleeve.targetBps)}`,
                    )
                    .join(", ")}.`}
                >
                  <div
                    aria-hidden="true"
                    className="absolute left-[16%] right-[16%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-accent-cyan/35 via-accent-purple/35 to-accent-amber/35"
                  />
                  {value.sleeves.map((sleeve) => {
                    const presentation = SLEEVE_PRESENTATION[sleeve.id];
                    const fraction = isValidBps(sleeve.targetBps)
                      ? sleeve.targetBps / BASIS_POINTS_TOTAL
                      : 0;
                    const scale = 0.52 + Math.sqrt(fraction) * 0.48;
                    return (
                      <div key={sleeve.id} className="relative z-10 flex min-w-0 flex-col items-center">
                        <div className="flex aspect-square w-full max-w-[8rem] items-center justify-center">
                          <div
                            aria-hidden="true"
                            style={{ transform: `scale(${scale})` }}
                            className={`flex h-full w-full items-center justify-center rounded-full border ${presentation.accentBorder} ${presentation.accentSurface} shadow-glow motion-safe:transition-transform motion-safe:duration-500 motion-reduce:transition-none`}
                          >
                            <span className={`text-lg font-semibold tabular-nums sm:text-xl ${presentation.accentText}`}>
                              {formatBps(sleeve.targetBps)}
                            </span>
                          </div>
                        </div>
                        <span className="mt-2 text-[13px] font-semibold text-white">{presentation.title}</span>
                        <span className="mt-0.5 text-center text-[12px] leading-4 text-slate-500">
                          {presentation.role}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="mt-7 flex h-3 overflow-hidden rounded-full border border-white/10 bg-white/[0.03]"
                  aria-hidden="true"
                >
                  {value.sleeves.map((sleeve) => {
                    const width = isValidBps(sleeve.targetBps)
                      ? Math.max(0, Math.min(100, sleeve.targetBps / 100))
                      : 0;
                    return (
                      <div
                        key={sleeve.id}
                        style={{ width: `${width}%` }}
                        className={`${SLEEVE_PRESENTATION[sleeve.id].accentFill} opacity-75 motion-safe:transition-[width] motion-safe:duration-500 motion-reduce:transition-none`}
                      />
                    );
                  })}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[12px] text-slate-500">
                  {value.sleeves.map((sleeve) => (
                    <span key={sleeve.id} className="truncate text-center tabular-nums">
                      {SLEEVE_PRESENTATION[sleeve.id].title} {formatBps(sleeve.targetBps)}
                    </span>
                  ))}
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="text-[12px] font-semibold text-accent-red">Plain-language consequence</div>
                  <p className="mt-2 text-[14px] leading-6 text-slate-300" aria-live="polite">
                    {consequence}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {value.sleeves.map((sleeve) => {
                const presentation = SLEEVE_PRESENTATION[sleeve.id];
                const hasSleeveIssue = sleeveIssues.some((issue) =>
                  issue.path.startsWith(`sleeves[${value.sleeves.indexOf(sleeve)}]`),
                );
                return (
                  <fieldset
                    key={sleeve.id}
                    className={`rounded-[1.5rem] border p-4 sm:p-5 ${
                      showErrors && hasSleeveIssue ? "border-accent-red/50" : presentation.accentBorder
                    } ${presentation.accentSurface}`}
                  >
                    <legend className="px-1 text-[15px] font-semibold text-white">
                      {presentation.title}
                    </legend>
                    <p className="mt-1 text-[13px] leading-5 text-slate-400">{presentation.purpose}</p>

                    <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-2 sm:gap-4">
                      <StepButton
                        label={`Decrease ${presentation.title} target by 1 percentage point`}
                        onClick={() =>
                          updateSleeve(sleeve.id, {
                            targetBps: clampBps(sleeve.targetBps - 100),
                          })
                        }
                      >
                        −
                      </StepButton>
                      <PercentageInput
                        id={`allocation-${sleeve.id}-target`}
                        label="Strategic target"
                        valueBps={sleeve.targetBps}
                        onChange={(targetBps) => updateSleeve(sleeve.id, { targetBps })}
                        describedBy={`allocation-${sleeve.id}-help`}
                        invalid={
                          showErrors &&
                          (!isValidBps(sleeve.targetBps) ||
                            sleeve.targetBps < sleeve.minBps ||
                            sleeve.targetBps > sleeve.maxBps)
                        }
                      />
                      <StepButton
                        label={`Increase ${presentation.title} target by 1 percentage point`}
                        onClick={() =>
                          updateSleeve(sleeve.id, {
                            targetBps: clampBps(sleeve.targetBps + 100),
                          })
                        }
                      >
                        +
                      </StepButton>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <PercentageInput
                        id={`allocation-${sleeve.id}-minimum`}
                        label="Range minimum"
                        valueBps={sleeve.minBps}
                        onChange={(minBps) => updateSleeve(sleeve.id, { minBps })}
                        describedBy={`allocation-${sleeve.id}-help`}
                        invalid={
                          showErrors &&
                          (!isValidBps(sleeve.minBps) || sleeve.minBps > sleeve.targetBps)
                        }
                      />
                      <PercentageInput
                        id={`allocation-${sleeve.id}-maximum`}
                        label="Range maximum"
                        valueBps={sleeve.maxBps}
                        onChange={(maxBps) => updateSleeve(sleeve.id, { maxBps })}
                        describedBy={`allocation-${sleeve.id}-help`}
                        invalid={
                          showErrors &&
                          (!isValidBps(sleeve.maxBps) || sleeve.maxBps < sleeve.targetBps)
                        }
                      />
                      <div>
                        <span className="mb-2 block text-[13px] font-medium text-slate-400">
                          Supplied OPS teaching loss
                        </span>
                        <div
                          className="flex min-h-12 items-center justify-end rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[16px] font-semibold tabular-nums text-white"
                          aria-label={`${presentation.title} supplied OPS teaching loss ${formatLossBps(sleeve.assumedLossBps)}`}
                        >
                          {formatLossBps(sleeve.assumedLossBps)}
                        </div>
                      </div>
                    </div>
                    <p
                      id={`allocation-${sleeve.id}-help`}
                      className="mt-3 text-[12px] leading-5 text-slate-500"
                    >
                      Range and target are learner-owned. The locked stress is a supplied OPS
                      hypothetical for this lesson—not a forecast, guarantee, or worst-case loss.
                    </p>
                  </fieldset>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="allocation-stress-title" className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold tracking-[0.01em] text-accent-red">
              Loss-budget scanner
            </div>
            <h3 id="allocation-stress-title" className="mt-2 font-display text-2xl text-white sm:text-3xl">
              Weight × assumed loss = portfolio contribution
            </h3>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-slate-400">
              Positive loss magnitudes are used in the arithmetic. Each result is a portfolio
              percentage-point contribution under this one visible scenario.
            </p>
          </div>
          <div className="rounded-2xl border border-accent-red/30 bg-accent-red/[0.06] px-4 py-3 text-right">
            <div className="text-[12px] text-slate-500">Total teaching stress</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-accent-red">
              {totalStressLossBps === null ? "—" : formatBps(totalStressLossBps)}
            </div>
            <div className="mt-1 text-[12px] tabular-nums text-slate-400">
              {stressDollars === null ? "Enter a usable amount" : `≈ ${formatCurrency(stressDollars)}`}
            </div>
          </div>
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full border-collapse text-left text-[13px]">
            <caption className="sr-only">
              Allocation targets, OPS teaching stress assumptions, and portfolio loss contributions
            </caption>
            <thead className="bg-white/[0.03] text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Role</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Target</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Approx. dollars</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">OPS teaching loss</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Contribution</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Approx. dollar loss</th>
              </tr>
            </thead>
            <tbody>
              {value.sleeves.map((sleeve) => {
                const contributionBps = contributionFor(sleeve);
                const sleeveDollars =
                  portfolioAmountIsValid && isValidBps(sleeve.targetBps)
                    ? (value.portfolioAmount * sleeve.targetBps) / BASIS_POINTS_TOTAL
                    : null;
                const contributionDollars =
                  portfolioAmountIsValid && contributionBps !== null
                    ? (value.portfolioAmount * contributionBps) / BASIS_POINTS_TOTAL
                    : null;
                return (
                  <tr key={sleeve.id} className="border-t border-white/10 text-slate-300">
                    <th scope="row" className={`px-4 py-4 font-semibold ${SLEEVE_PRESENTATION[sleeve.id].accentText}`}>
                      {SLEEVE_PRESENTATION[sleeve.id].title}
                    </th>
                    <td className="px-3 py-4 text-right tabular-nums">{formatBps(sleeve.targetBps)}</td>
                    <td className="px-3 py-4 text-right tabular-nums">{sleeveDollars === null ? "—" : formatCurrency(sleeveDollars)}</td>
                    <td className="px-3 py-4 text-right tabular-nums">{formatLossBps(sleeve.assumedLossBps)}</td>
                    <td className="px-3 py-4 text-right font-semibold tabular-nums text-white">{contributionBps === null ? "—" : formatBps(contributionBps)}</td>
                    <td className="px-4 py-4 text-right tabular-nums">{contributionDollars === null ? "—" : formatCurrency(contributionDollars)}</td>
                  </tr>
                );
              })}
              <tr className="border-t border-white/15 bg-white/[0.03] text-white">
                <th scope="row" className="px-4 py-4 font-semibold">Total</th>
                <td className="px-3 py-4 text-right font-semibold tabular-nums">{formatBps(weightTotal)}</td>
                <td className="px-3 py-4 text-right font-semibold tabular-nums">{portfolioAmountIsValid ? formatCurrency(value.portfolioAmount) : "—"}</td>
                <td className="px-3 py-4 text-right text-slate-500">—</td>
                <td className="px-3 py-4 text-right font-semibold tabular-nums text-accent-red">{totalStressLossBps === null ? "—" : formatBps(totalStressLossBps)}</td>
                <td className="px-4 py-4 text-right font-semibold tabular-nums text-accent-red">{stressDollars === null ? "—" : formatCurrency(stressDollars)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-3 md:hidden">
          {value.sleeves.map((sleeve) => {
            const contributionBps = contributionFor(sleeve);
            const sleeveDollars =
              portfolioAmountIsValid && isValidBps(sleeve.targetBps)
                ? (value.portfolioAmount * sleeve.targetBps) / BASIS_POINTS_TOTAL
                : null;
            const contributionDollars =
              portfolioAmountIsValid && contributionBps !== null
                ? (value.portfolioAmount * contributionBps) / BASIS_POINTS_TOTAL
                : null;
            return (
              <div key={sleeve.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className={`font-semibold ${SLEEVE_PRESENTATION[sleeve.id].accentText}`}>
                    {SLEEVE_PRESENTATION[sleeve.id].title}
                  </div>
                  <div className="font-semibold tabular-nums text-white">{formatBps(sleeve.targetBps)}</div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
                  <div>
                    <dt className="text-slate-500">Approx. dollars</dt>
                    <dd className="mt-1 tabular-nums text-slate-300">{sleeveDollars === null ? "—" : formatCurrency(sleeveDollars)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">OPS teaching loss</dt>
                    <dd className="mt-1 tabular-nums text-slate-300">{formatLossBps(sleeve.assumedLossBps)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Portfolio contribution</dt>
                    <dd className="mt-1 font-semibold tabular-nums text-white">{contributionBps === null ? "—" : formatBps(contributionBps)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Approx. dollar loss</dt>
                    <dd className="mt-1 tabular-nums text-slate-300">{contributionDollars === null ? "—" : formatCurrency(contributionDollars)}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.05] p-4 sm:p-5">
            <PercentageInput
              id="allocation-loss-budget"
              label="Learner-owned stress-loss budget"
              valueBps={value.lossBudgetBps}
              onChange={(lossBudgetBps) => onChange({ ...value, lossBudgetBps })}
              describedBy="allocation-loss-budget-help"
              invalid={showErrors && (!lossBudgetIsValid || !stressFitsBudget)}
              step={0.25}
            />
            <p id="allocation-loss-budget-help" className="mt-3 text-[12px] leading-5 text-slate-500">
              This is the loss the learner chooses to test against—not a predicted drawdown or
              proof that worse loss cannot occur.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="text-[13px] font-semibold text-white">Candidate position ceiling · optional</div>
            <p className="mt-1 text-[12px] leading-5 text-slate-500">
              A transparent learner/OPS policy for a future candidate—not a regulator threshold.
              Omit it until you can defend both assumptions.
            </p>
            <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 focus-within:ring-2 focus-within:ring-accent-cyan/45">
              <input
                type="checkbox"
                checked={!candidateOmitted}
                onChange={(event) =>
                  onChange({
                    ...value,
                    candidateMaxContributionBps: event.currentTarget.checked ? 0 : null,
                    candidateAssumedLossBps: event.currentTarget.checked ? 0 : null,
                  })
                }
                className="h-5 w-5 flex-none accent-accent-cyan"
              />
              <span className="text-[13px] leading-5 text-slate-300">
                Add a candidate ceiling to this policy
              </span>
            </label>
            {!candidateOmitted && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <PercentageInput
                  id="allocation-candidate-contribution"
                  label="Allowed portfolio-loss contribution"
                  valueBps={value.candidateMaxContributionBps ?? 0}
                  onChange={(candidateMaxContributionBps) =>
                    onChange({ ...value, candidateMaxContributionBps })
                  }
                  describedBy="allocation-candidate-equation"
                  invalid={
                    showErrors &&
                    (value.candidateMaxContributionBps === null ||
                      !isValidBps(value.candidateMaxContributionBps) ||
                      (lossBudgetIsValid &&
                        value.candidateMaxContributionBps > value.lossBudgetBps))
                  }
                  step={0.25}
                />
                <PercentageInput
                  id="allocation-candidate-loss"
                  label="Assumed candidate loss"
                  valueBps={value.candidateAssumedLossBps ?? 0}
                  onChange={(candidateAssumedLossBps) =>
                    onChange({ ...value, candidateAssumedLossBps })
                  }
                  describedBy="allocation-candidate-equation"
                  invalid={
                    showErrors &&
                    (value.candidateAssumedLossBps === null ||
                      !isValidBps(value.candidateAssumedLossBps) ||
                      value.candidateAssumedLossBps === 0)
                  }
                  step={1}
                />
              </div>
            )}
            <div
              id="allocation-candidate-equation"
              className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              {candidateOmitted ? (
                <p className="text-[13px] leading-5 text-slate-400">
                  Omitted for now. The final assessment still checks that you can derive one from supplied assumptions.
                </p>
              ) : candidateCeilingBps === null ? (
                <p className="text-[13px] leading-5 text-slate-400">
                  Enter a finite assumed loss above 0%. The allowed contribution cannot exceed the
                  total loss budget.
                </p>
              ) : (
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-[12px] leading-5 text-slate-500">
                      {formatBps(value.candidateMaxContributionBps as number)} ÷ {formatBps(value.candidateAssumedLossBps as number)}
                    </div>
                    <div className="mt-1 text-[13px] text-slate-400">Candidate ceiling</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold tabular-nums text-accent-cyan">
                      {formatBps(candidateCeilingBps)}
                    </div>
                    <div className="mt-1 text-[12px] tabular-nums text-slate-500">
                      {portfolioAmountIsValid
                        ? `≈ ${formatCurrency(
                            (value.portfolioAmount * candidateCeilingBps) / BASIS_POINTS_TOTAL,
                          )}`
                        : "Enter a usable amount"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="allocation-validation-title" className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <div>
            <div className="text-[13px] font-semibold tracking-[0.01em] text-accent-green">
              Policy check
            </div>
            <h3 id="allocation-validation-title" className="mt-2 font-display text-2xl text-white">
              {allChecksPass ? "Coherent and explainable" : "A few decisions remain"}
            </h3>
            <p className="mt-3 text-[14px] leading-6 text-slate-400" aria-live="polite">
              {passedCount} of {validationItems.length} checks pass. The parent lesson decides when
              this draft can be saved.
            </p>
            {showErrors && !allChecksPass ? (
              <p role="alert" className="mt-3 text-[13px] leading-5 text-accent-red">
                Review the incomplete checks and the highlighted inputs. No policy has been saved.
              </p>
            ) : null}
          </div>
          <ul className="space-y-2.5" aria-label="Allocation policy validation summary">
            {validationItems.map((item) => (
              <ValidationRow key={item.label} passed={item.passed}>
                {item.label}
              </ValidationRow>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-4 sm:p-5">
          <label htmlFor="allocation-mandate-rationale" className="block text-[13px] font-semibold text-white">
            Why does this policy fit the saved mandate?
          </label>
          <p id="allocation-mandate-rationale-help" className="mt-1 text-[12px] leading-5 text-slate-500">
            Connect the goal, cash timing, capacity, willingness, weights, and loss budget. Name one trade-off you accept. OPS cannot infer personal fit from a model output.
          </p>
          <textarea
            id="allocation-mandate-rationale"
            value={value.mandateRationale}
            onChange={(event) => onChange({ ...value, mandateRationale: event.currentTarget.value })}
            aria-describedby="allocation-mandate-rationale-help"
            aria-invalid={(showErrors && !rationaleIsUsable) || undefined}
            rows={4}
            placeholder="Example structure: I protect the dated cash need in Ready. I accept… because… I would review this if…"
            className={`mt-4 w-full resize-y rounded-xl border bg-white/[0.03] px-4 py-3 text-[14px] leading-6 text-white outline-none transition-colors placeholder:text-slate-600 focus:ring-2 focus:ring-accent-cyan/35 ${
              showErrors && !rationaleIsUsable ? "border-accent-red/60" : "border-white/10"
            }`}
          />
        </div>

        <label className="mt-6 flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 focus-within:ring-2 focus-within:ring-accent-cyan/45">
          <input
            type="checkbox"
            checked={value.acknowledged}
            onChange={(event) => onChange({ ...value, acknowledged: event.currentTarget.checked })}
            aria-invalid={(showErrors && !value.acknowledged) || undefined}
            className="mt-1 h-5 w-5 flex-none accent-accent-cyan"
          />
          <span className="text-[13px] leading-6 text-slate-300">
            I understand that the weights and budget are learner-owned policy choices; the stress
            inputs are an OPS teaching scenario, not a recommendation, forecast, guarantee, or
            worst-case bound. A changed goal, near-term need, or loss capacity requires review.
          </span>
        </label>
      </section>
    </section>
  );
}
