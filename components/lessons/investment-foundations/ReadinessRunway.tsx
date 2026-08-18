"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type ReadinessMode = "personal" | "practice";

export type ReadinessRoute =
  | "personal-deployment-available"
  | "personal-constrained"
  | "practice-only";

export type ReadinessHorizon =
  | ""
  | "under-two-years"
  | "two-to-five-years"
  | "more-than-five-years";

export type ReserveStatus =
  | ""
  | "target-met"
  | "building"
  | "gap"
  | "unknown";

export type DebtStatus = "" | "none" | "paying-down" | "present" | "unknown";

export type EmployerMatchStatus =
  | ""
  | "using"
  | "available-review"
  | "not-available"
  | "not-applicable"
  | "unknown";

export type LossCapacity =
  | ""
  | "limited"
  | "moderate"
  | "substantial"
  | "unknown";

export type LossWillingness =
  | ""
  | "prefer-stability"
  | "written-plan"
  | "untested"
  | "unknown";

export type JurisdictionStatus = "" | "us" | "outside-us" | "unknown";

export type AuthorityStatus =
  | ""
  | "confirmed"
  | "custodian-required"
  | "not-confirmed"
  | "unknown";

export type EarnedIncomeStatus =
  | ""
  | "relevant-confirmed"
  | "not-relevant"
  | "verify"
  | "unknown";

export type LifeChangeDiagnosis =
  | ""
  | "capacity-and-liquidity"
  | "willingness-only"
  | "nothing-changed";

export type LifeChangeAction =
  | ""
  | "protect-cash-need"
  | "increase-risk"
  | "move-deadline";

/**
 * Controlled Mission 1 readiness record. Dollar fields are strings so the
 * learner can clear or revise an input without the UI inventing a zero.
 * They are approximate planning values, never account balances.
 */
export type ReadinessRecord = {
  profileOwner: "learner" | "fictional-case";
  goal: string;
  horizon: ReadinessHorizon;
  contributionPlan: string;
  plannedWithdrawal: string;
  approximatePortfolioValue: string;
  nearTermNeed: string;
  reserveTarget: string;
  reserveStatus: ReserveStatus;
  highInterestDebt: DebtStatus;
  employerMatch: EmployerMatchStatus;
  capacityForLoss: LossCapacity;
  willingnessForLoss: LossWillingness;
  jurisdiction: JurisdictionStatus;
  accountAuthority: AuthorityStatus;
  earnedIncomeStatus: EarnedIncomeStatus;
  lifeChangeDiagnosis: LifeChangeDiagnosis;
  lifeChangeAction: LifeChangeAction;
  route: ReadinessRoute;
};

export type ReadinessRunwayProps = {
  mode: ReadinessMode;
  value: ReadinessRecord;
  onModeChange: (mode: ReadinessMode) => void;
  onChange: (value: ReadinessRecord) => void;
  onComplete: (value: ReadinessRecord) => void;
};

export const EMPTY_READINESS_RECORD: ReadinessRecord = {
  profileOwner: "learner",
  goal: "",
  horizon: "",
  contributionPlan: "",
  plannedWithdrawal: "",
  approximatePortfolioValue: "",
  nearTermNeed: "",
  reserveTarget: "",
  reserveStatus: "",
  highInterestDebt: "",
  employerMatch: "",
  capacityForLoss: "",
  willingnessForLoss: "",
  jurisdiction: "",
  accountAuthority: "",
  earnedIncomeStatus: "",
  lifeChangeDiagnosis: "",
  lifeChangeAction: "",
  route: "personal-constrained",
};

export const MINA_PRACTICE_READINESS: ReadinessRecord = {
  profileOwner: "fictional-case",
  goal: "Build long-term flexibility while protecting a tuition payment",
  horizon: "more-than-five-years",
  contributionPlan: "$250 each month (fictional)",
  plannedWithdrawal: "$8,000 tuition payment in 18 months (fictional)",
  approximatePortfolioValue: "40000",
  nearTermNeed: "8000",
  reserveTarget: "$4,500 fictional learner-selected target",
  reserveStatus: "target-met",
  highInterestDebt: "none",
  employerMatch: "not-applicable",
  capacityForLoss: "moderate",
  willingnessForLoss: "written-plan",
  jurisdiction: "us",
  accountAuthority: "confirmed",
  earnedIncomeStatus: "not-relevant",
  lifeChangeDiagnosis: "",
  lifeChangeAction: "",
  route: "practice-only",
};

export type ReadinessRouteResult = {
  route: ReadinessRoute;
  title: string;
  summary: string;
  reasons: string[];
  actions: string[];
};

const STEPS = [
  { short: "Path", title: "Choose a path" },
  { short: "Goal", title: "Name the goal and its clock" },
  { short: "Runway", title: "Protect the runway" },
  { short: "Loss", title: "Separate ability from willingness" },
  { short: "Access", title: "Check authority and context" },
  { short: "Change", title: "Pass the life-change check" },
] as const;

const HORIZON_OPTIONS = [
  {
    value: "under-two-years",
    label: "Under two years",
    detail: "The goal clock is short, so required cash deserves special protection.",
  },
  {
    value: "two-to-five-years",
    label: "Two to five years",
    detail: "Some capital may have time to recover, but the date still constrains risk.",
  },
  {
    value: "more-than-five-years",
    label: "More than five years",
    detail: "The horizon is longer; cash needs and behavior still matter.",
  },
] satisfies ChoiceOption<Exclude<ReadinessHorizon, "">>[];

const RESERVE_OPTIONS = [
  {
    value: "target-met",
    label: "My chosen target is met",
    detail: "The target is your planning choice, not a universal OPS number.",
  },
  {
    value: "building",
    label: "I am building toward it",
    detail: "Keep the learning path open and record the remaining action.",
  },
  {
    value: "gap",
    label: "There is a gap",
    detail: "A financial shock could otherwise force an investment sale or new debt.",
  },
  {
    value: "unknown",
    label: "I don't know yet",
    detail: "Uncertainty becomes an action item; the course does not invent an answer.",
  },
] satisfies ChoiceOption<Exclude<ReserveStatus, "">>[];

const DEBT_OPTIONS = [
  {
    value: "none",
    label: "None recorded",
    detail: "No high-interest debt issue is recorded for this planning exercise.",
  },
  {
    value: "paying-down",
    label: "A payoff plan is underway",
    detail: "Keep personal deployment constrained while the recorded plan is unresolved.",
  },
  {
    value: "present",
    label: "It is present",
    detail: "Record debt review before directing new money to personal investments.",
  },
  {
    value: "unknown",
    label: "I don't know yet",
    detail: "Verify the rate and balance outside OPS; do not enter account identifiers.",
  },
] satisfies ChoiceOption<Exclude<DebtStatus, "">>[];

const MATCH_OPTIONS = [
  {
    value: "using",
    label: "Available and already considered",
    detail: "The employer-plan opportunity is recorded as reviewed.",
  },
  {
    value: "available-review",
    label: "Available; I need to review it",
    detail: "The opportunity becomes a planning action, not an automatic instruction.",
  },
  {
    value: "not-available",
    label: "Not available",
    detail: "No employer match is available in this case.",
  },
  {
    value: "not-applicable",
    label: "Not applicable",
    detail: "This plan does not involve an employer account.",
  },
  {
    value: "unknown",
    label: "I don't know yet",
    detail: "Verify benefits separately; no employer details are collected here.",
  },
] satisfies ChoiceOption<Exclude<EmployerMatchStatus, "">>[];

const CAPACITY_OPTIONS = [
  {
    value: "limited",
    label: "Limited right now",
    detail: "A substantial loss could disrupt required spending, liabilities, or the goal.",
  },
  {
    value: "moderate",
    label: "Moderate",
    detail: "Some loss can be absorbed, but the portfolio must respect firm constraints.",
  },
  {
    value: "substantial",
    label: "Substantial for this goal",
    detail: "The finances can absorb more variability without disrupting required cash.",
  },
  {
    value: "unknown",
    label: "I don't know yet",
    detail: "Use the practice path until the financial effect is clearer.",
  },
] satisfies ChoiceOption<Exclude<LossCapacity, "">>[];

const WILLINGNESS_OPTIONS = [
  {
    value: "prefer-stability",
    label: "I prefer a steadier experience",
    detail: "A smoother experience may make the written policy easier to follow.",
  },
  {
    value: "written-plan",
    label: "I can follow a written review rule",
    detail: "Willingness is recorded separately from financial ability.",
  },
  {
    value: "untested",
    label: "My response is untested",
    detail: "Simulation can test behavior before personal money depends on it.",
  },
  {
    value: "unknown",
    label: "I don't know yet",
    detail: "Uncertainty is an honest answer and does not block the course.",
  },
] satisfies ChoiceOption<Exclude<LossWillingness, "">>[];

const JURISDICTION_OPTIONS = [
  {
    value: "us",
    label: "United States",
    detail: "The current OPS readiness source layer is locked to US guidance.",
  },
  {
    value: "outside-us",
    label: "Outside the United States",
    detail: "Continue learning, but verify local eligibility and rules before deployment.",
  },
  {
    value: "unknown",
    label: "I need to verify",
    detail: "The course will preserve a practice route while this remains open.",
  },
] satisfies ChoiceOption<Exclude<JurisdictionStatus, "">>[];

const AUTHORITY_OPTIONS = [
  {
    value: "confirmed",
    label: "Authority is confirmed",
    detail: "This records only the planning status; it is not brokerage authorization.",
  },
  {
    value: "custodian-required",
    label: "A parent or custodian is required",
    detail: "Complete the course with a paper portfolio while authority is arranged.",
  },
  {
    value: "not-confirmed",
    label: "I do not control an account",
    detail: "No problem: the practice case carries the same learning standard.",
  },
  {
    value: "unknown",
    label: "I don't know yet",
    detail: "Verify account authority outside OPS; never enter credentials here.",
  },
] satisfies ChoiceOption<Exclude<AuthorityStatus, "">>[];

const EARNED_INCOME_OPTIONS = [
  {
    value: "relevant-confirmed",
    label: "Relevant and confirmed",
    detail: "Earned-income eligibility has been considered for the intended account context.",
  },
  {
    value: "not-relevant",
    label: "Not relevant to this plan",
    detail: "The intended paper or account path does not depend on this flag.",
  },
  {
    value: "verify",
    label: "It may matter; I need to verify",
    detail: "Keep deployment conditional until account eligibility is checked.",
  },
  {
    value: "unknown",
    label: "I don't know yet",
    detail: "Use the paper path while this context remains uncertain.",
  },
] satisfies ChoiceOption<Exclude<EarnedIncomeStatus, "">>[];

const LIFE_DIAGNOSIS_OPTIONS = [
  {
    value: "capacity-and-liquidity",
    label: "Capacity and liquidity changed; willingness may be unchanged",
    detail: "The new required payment changes what the finances can carry and when cash is needed.",
  },
  {
    value: "willingness-only",
    label: "Only willingness changed",
    detail: "This ignores the financial effect of the job loss and near-term payment.",
  },
  {
    value: "nothing-changed",
    label: "Nothing changed because the market outlook is the same",
    detail: "A portfolio must respond to the investor's circumstances, not only market beliefs.",
  },
] satisfies ChoiceOption<Exclude<LifeChangeDiagnosis, "">>[];

const LIFE_ACTION_OPTIONS = [
  {
    value: "protect-cash-need",
    label: "Record the $12,000 as near-term cash and keep deployment constrained until it is protected",
    detail: "Jordan can continue the full course with a paper portfolio while the cash need is resolved.",
  },
  {
    value: "increase-risk",
    label: "Increase risk to try to replace the lost income quickly",
    detail: "Taking more risk does not make the required payment safer.",
  },
  {
    value: "move-deadline",
    label: "Move the payment date to preserve the old portfolio",
    detail: "The portfolio must respect the real obligation; it cannot rewrite it for convenience.",
  },
] satisfies ChoiceOption<Exclude<LifeChangeAction, "">>[];

export function deriveReadinessRoute(
  mode: ReadinessMode,
  record: ReadinessRecord,
): ReadinessRouteResult {
  if (mode === "practice") {
    return {
      route: "practice-only",
      title: "Practice only",
      summary:
        "Build the same complete portfolio with fictional facts and no real-money deployment.",
      reasons: [
        "The case is fictional and carries the same teaching, assessment, and capstone standard.",
      ],
      actions: ["Continue to Mission 5 with Mina's paper portfolio."],
    };
  }

  const reasons: string[] = [];
  const actions: string[] = [];

  if (record.reserveStatus !== "target-met") {
    reasons.push("The learner-selected emergency-reserve target is not yet confirmed as met.");
    actions.push("Choose or verify a reserve target and record how any gap will be addressed.");
  }
  if (record.highInterestDebt !== "none") {
    reasons.push("High-interest debt is present, being paid down, or still unknown.");
    actions.push("Verify the debt context and record the payoff or review step before deployment.");
  }
  if (record.jurisdiction !== "us") {
    reasons.push("The applicable jurisdiction is outside the current US source layer or unverified.");
    actions.push("Verify local eligibility, tax, and account rules before using personal money.");
  }
  if (record.accountAuthority !== "confirmed") {
    reasons.push("Independent or custodial account authority is not yet confirmed.");
    actions.push("Confirm the lawful account path; use the paper portfolio in the meantime.");
  }
  if (
    record.earnedIncomeStatus === "verify" ||
    record.earnedIncomeStatus === "unknown" ||
    record.earnedIncomeStatus === ""
  ) {
    reasons.push("Earned-income relevance for the intended account context remains open.");
    actions.push("Verify whether earned income affects the intended account's eligibility.");
  }
  if (
    record.employerMatch === "available-review" ||
    record.employerMatch === "unknown" ||
    record.employerMatch === ""
  ) {
    reasons.push("An employer-plan opportunity is available for review or remains unknown.");
    actions.push("Review the employer-plan terms without treating this course as an instruction to enroll.");
  }
  if (record.capacityForLoss === "unknown" || record.capacityForLoss === "") {
    reasons.push("Financial ability to absorb loss remains unknown.");
    actions.push("Clarify which required spending or liabilities a substantial loss could disrupt.");
  }
  if (
    record.willingnessForLoss === "untested" ||
    record.willingnessForLoss === "unknown" ||
    record.willingnessForLoss === ""
  ) {
    reasons.push("The response to sustained volatility is untested or unknown.");
    actions.push("Use the practice portfolio to rehearse the written loss-response rule first.");
  }

  const portfolioAmount = finiteNonNegative(record.approximatePortfolioValue);
  const nearTermNeed = finiteNonNegative(record.nearTermNeed);
  if (
    portfolioAmount !== null &&
    nearTermNeed !== null &&
    portfolioAmount <= nearTermNeed
  ) {
    reasons.push("The recorded near-term need uses all or more than the current planning amount.");
    actions.push("Keep that amount assigned to the near-term goal and build the risky allocation on paper.");
  }

  if (reasons.length > 0) {
    return {
      route: "personal-constrained",
      title: "Personal constrained",
      summary:
        "Keep building the portfolio on paper while the recorded deployment conditions are resolved.",
      reasons,
      actions: unique(actions),
    };
  }

  return {
    route: "personal-deployment-available",
    title: "Personal deployment available",
    summary:
      "No readiness blocker is recorded. This is a planning route—not advice, account approval, or permission to trade.",
    reasons: [
      "The learner-selected reserve target, debt review, jurisdiction, authority, and account-context flags are recorded as resolved.",
    ],
    actions: ["Carry the mandate into allocation and keep every later decision reviewable."],
  };
}

export default function ReadinessRunway({
  mode,
  value,
  onModeChange,
  onChange,
  onComplete,
}: ReadinessRunwayProps) {
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  // The parent owns separate personal and practice records. During the render in
  // which mode changes, never copy the prior mode's facts across that boundary.
  // A blank practice record presents Mina's fixture until the learner edits or
  // completes it, at which point the controlled onChange persists that record.
  const record = useMemo(() => recordForMode(mode, value), [mode, value]);
  const routeResult = useMemo(() => deriveReadinessRoute(mode, record), [mode, record]);
  const stepReady = isStepReady(step, record);
  const profileComplete = isProfileComplete(record);
  const lifeChangePassed =
    record.lifeChangeDiagnosis === "capacity-and-liquidity" &&
    record.lifeChangeAction === "protect-cash-need";

  const update = (patch: Partial<ReadinessRecord>) => {
    const draft = { ...record, ...patch };
    onChange({ ...draft, route: deriveReadinessRoute(mode, draft).route });
  };

  const chooseMode = (nextMode: ReadinessMode) => {
    onModeChange(nextMode);
  };

  const advance = () => {
    if (!stepReady || step >= STEPS.length - 1) return;
    const next = step + 1;
    setStep(next);
    setMaxVisited((current) => Math.max(current, next));
  };

  const finish = () => {
    if (!profileComplete || !lifeChangePassed) return;
    const completed = { ...record, route: routeResult.route };
    onChange(completed);
    onComplete(completed);
  };

  return (
    <section
      className="ops-interactive-frame relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-ink-950/70 shadow-panel"
      aria-labelledby="readiness-runway-title"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 -top-36 -z-10 h-96 w-96 rounded-full bg-accent-amber/10 blur-3xl motion-reduce:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-36 top-64 -z-10 h-80 w-80 rounded-full bg-accent-cyan/10 blur-3xl motion-reduce:hidden"
      />

      {/* Screen Budget Rule: one hero per page. The lesson header above already
          names the mission, so this was the second 60px display title on the
          same screen and cost 337px before the learner reached step 1. It is a
          section header now, not a hero. */}
      <header className="border-b border-white/10 px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2
            id="readiness-runway-title"
            className="ops-interactive-title text-[19px] font-semibold tracking-[-0.01em] text-white sm:text-[21px]"
          >
            Build the runway before the portfolio takes risk.
          </h2>
          <div className="text-[12px] text-slate-400">
            Mission 1 prerequisite · stored locally
          </div>
        </div>
        <p className="ops-body mt-1.5 max-w-3xl text-[14px] leading-6 text-slate-400">
          Readiness identifies which capital can support a long-term plan. Every route
          reaches the full course.
        </p>
      </header>

      <nav className="border-b border-white/10 px-4 py-4 sm:px-7" aria-label="Readiness steps">
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {STEPS.map((item, index) => {
            const available = index <= maxVisited;
            const current = index === step;
            const complete = index < step || (index < maxVisited && isStepReady(index, record));
            return (
              <li key={item.short}>
                <button
                  type="button"
                  disabled={!available}
                  aria-label={`${index + 1}. ${item.short}${current ? ", current" : complete ? ", complete" : ""}`}
                  aria-current={current ? "step" : undefined}
                  onClick={() => available && setStep(index)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-[13px] font-semibold transition-colors motion-reduce:transition-none",
                    current
                      ? "border-accent-amber/40 bg-accent-amber/10 text-accent-amber"
                      : complete
                        ? "border-accent-green/30 bg-accent-green/[0.06] text-accent-green"
                        : "border-white/10 bg-white/[0.03] text-slate-400",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] tabular-nums",
                      current
                        ? "border-accent-amber/50"
                        : complete
                          ? "border-accent-green/40"
                          : "border-white/15",
                    )}
                    aria-hidden
                  >
                    {complete ? "✓" : index + 1}
                  </span>
                  <span className="hidden sm:inline">{item.short}</span>
                  <span className="sm:hidden">{index + 1}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* The step never shares its row. The lesson layout is capped at 1280px
          and already spends 300px on its progress rail, so a 320px sidebar
          beside the step left a 488px working column at ANY screen width — two
          path cards 196px wide and 375px tall. Route context follows the step
          instead of competing with it. */}
      <div className="grid">
        <div className="min-w-0 px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="mb-7">
            <div className="text-[13px] font-semibold tracking-[0.02em] text-accent-cyan">
              Step {step + 1} of {STEPS.length}
            </div>
            <h3 className="ops-interactive-title mt-2 text-[clamp(25px,3vw,36px)] font-semibold tracking-[-0.02em]">
              {STEPS[step].title}
            </h3>
          </div>

          {step === 0 && (
            <ModeStep mode={mode} onChoose={chooseMode} />
          )}

          {step === 1 && (
            <GoalStep value={record} update={update} />
          )}

          {step === 2 && (
            <RunwayStep value={record} update={update} />
          )}

          {step === 3 && (
            <LossStep value={record} update={update} />
          )}

          {step === 4 && (
            <AccessStep value={record} update={update} />
          )}

          {step === 5 && (
            <LifeChangeStep value={record} update={update} />
          )}

          <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
              className="min-h-11 rounded-full border border-white/15 px-5 py-2.5 text-[14px] font-semibold text-slate-300 transition-colors hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
            >
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={advance}
                disabled={!stepReady}
                className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-[14px] font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
              >
                Continue to {STEPS[step + 1].short}
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={!profileComplete || !lifeChangePassed}
                className="min-h-11 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2.5 text-[14px] font-semibold text-accent-green transition-colors hover:bg-accent-green/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/50 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
              >
                Save readiness route
              </button>
            )}
          </div>
        </div>

        {/* Screen Budget Rule: context goes beside the work or behind a
            disclosure, never stacked under it. Below the step this panel added
            420px — nearly half a viewport of scroll — to reach a Continue
            button. It opens on demand and stays open once opened. */}
        <details className="group border-t border-white/10 bg-white/[0.025]" aria-label="Readiness route">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-[13px] font-semibold text-slate-300 hover:text-white sm:px-7 lg:px-8">
            <span>
              Current route
              <span className="ml-2 font-normal text-accent-amber">{routeResult.title}</span>
            </span>
            <span className="text-[12px] font-normal text-slate-400 group-open:hidden">
              Show details
            </span>
            <span className="hidden text-[12px] font-normal text-slate-400 group-open:inline">
              Hide
            </span>
          </summary>
          <div className="px-5 pb-6 sm:px-7 lg:px-8">
            <RoutePanel
              result={routeResult}
              complete={profileComplete}
              mode={mode}
              record={record}
            />
          </div>
        </details>
      </div>
    </section>
  );
}

function ModeStep({
  mode,
  onChoose,
}: {
  mode: ReadinessMode;
  onChoose: (mode: ReadinessMode) => void;
}) {
  const groupName = useId();
  return (
    /* Screen Budget Rule: the step reads across, not down. Explanation sits
       beside the decision instead of pushing it below the fold, which is what
       turned a single choice into most of a screen of scroll. */
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-start xl:gap-8">
      <DefinitionBlock
        title="Not ready to deploy is different from not ready to learn"
        body="Both paths use the same concepts, practice, assessment, and capstone. The only difference is whose facts the paper portfolio uses."
      />
      <fieldset className="min-w-0">
        <legend className="ops-body-strong text-[17px] font-semibold">
          Whose mandate will you build?
        </legend>
        {/* One per row inside its own pane: the pane is roughly half the step,
            so pairing them here would recreate the 190px column this layout
            exists to remove. */}
        <div className="mt-4 grid gap-3">
          <ModeCard
            checked={mode === "personal"}
            name={groupName}
            value="personal"
            title="Build mine"
            body="Use approximate personal facts. Never enter credentials, account numbers, tax IDs, or exact addresses."
            note="A constraint creates a paper deployment plan—not a failed course."
            onChange={() => onChoose("personal")}
          />
          <ModeCard
            checked={mode === "practice"}
            name={groupName}
            value="practice"
            title="Practice case"
            body="Use Mina's complete fictional profile and build the same portfolio with no real money."
            note="Practice-complete meets the same graduation standard."
            onChange={() => onChoose("practice")}
          />
        </div>
      </fieldset>
    </div>
  );
}

function GoalStep({
  value,
  update,
}: {
  value: ReadinessRecord;
  update: (patch: Partial<ReadinessRecord>) => void;
}) {
  const portfolio = finiteNonNegative(value.approximatePortfolioValue);
  const need = finiteNonNegative(value.nearTermNeed);
  const planningAmountUsable = readinessPlanningAmountsAreUsable(value);
  const remaining = portfolio !== null && need !== null ? Math.max(0, portfolio - need) : null;

  return (
    <div>
      <DefinitionBlock
        title="A goal gives risk a deadline"
        body="Capital needed soon has a different job from capital that can remain invested through a long recovery. This timeline separates those jobs before choosing an allocation."
      />

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <TextField
          label="Goal"
          value={value.goal}
          onChange={(goal) => update({ goal })}
          placeholder="Example: tuition, a home, or long-term flexibility"
          className="sm:col-span-2"
        />
        <TextField
          label="Expected contribution plan"
          value={value.contributionPlan}
          onChange={(contributionPlan) => update({ contributionPlan })}
          placeholder="Approximate amount and rhythm, or None planned"
        />
        <TextField
          label="Planned withdrawals"
          value={value.plannedWithdrawal}
          onChange={(plannedWithdrawal) => update({ plannedWithdrawal })}
          placeholder="Approximate amount and date, or None planned"
        />
        <NumberField
          label="Approximate portfolio or fictional amount"
          value={value.approximatePortfolioValue}
          onChange={(approximatePortfolioValue) => update({ approximatePortfolioValue })}
          hint="Enter a positive rounded amount so Mission 5 can express every cash role as a portfolio percentage. If no personal amount is available, choose Practice case."
          invalidWhen={(amount) => amount <= 0}
        />
        <NumberField
          label="Required within two years"
          value={value.nearTermNeed}
          onChange={(nearTermNeed) => update({ nearTermNeed })}
          hint="Enter 0 when no amount is required in that period. This amount cannot exceed the planning portfolio amount; otherwise use Practice case while the personal funding gap is resolved."
          invalidWhen={(amount) => portfolio !== null && amount > portfolio}
        />
      </div>

      {portfolio !== null && need !== null && !planningAmountUsable && (
        <p role="alert" className="mt-4 text-[13px] leading-5 text-accent-amber">
          Mission 5 needs a positive planning amount that can contain the full near-term
          cash role. Keep the personal route constrained and switch to Practice case to
          complete a paper policy without inventing personal capital.
        </p>
      )}

      <ChoiceGroup
        legend="When is the main goal expected?"
        value={value.horizon}
        options={HORIZON_OPTIONS}
        onChange={(horizon) => update({ horizon })}
      />

      {remaining !== null && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[13px] font-semibold tracking-[0.02em] text-accent-cyan">
                Goal clock
              </div>
              <p className="ops-body mt-2 max-w-xl text-[15px] leading-6 text-slate-300">
                This is a planning split, not a forecast. Mission 5 will decide which broad
                sleeve is compatible with each job.
              </p>
            </div>
            <div className="text-right tabular-nums">
              <div className="text-[13px] text-slate-400">Longer-term capital before other constraints</div>
              <div className="mt-1 text-[28px] font-semibold tracking-[-0.02em] text-white">
                {formatApproxMoney(remaining)}
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-[minmax(80px,auto)_1fr]">
            <div className="min-h-14 rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-3">
              <div className="text-[12px] font-semibold text-accent-amber">Needed soon</div>
              <div className="mt-1 font-semibold text-white tabular-nums">{formatApproxMoney(need ?? 0)}</div>
            </div>
            <div className="min-h-14 rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.06] p-3">
              <div className="text-[12px] font-semibold text-accent-cyan">Longer-term job</div>
              <div className="mt-1 font-semibold text-white tabular-nums">{formatApproxMoney(remaining)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RunwayStep({
  value,
  update,
}: {
  value: ReadinessRecord;
  update: (patch: Partial<ReadinessRecord>) => void;
}) {
  return (
    <div>
      <DefinitionBlock
        title="An emergency reserve absorbs financial shocks"
        body="It is cash set aside for unplanned expenses so a setback is less likely to force investment sales or new debt. The appropriate target depends on the person's situation; OPS supplies no universal amount."
      />
      <div className="mt-6">
        <TextField
          label="Your learner-selected reserve target"
          value={value.reserveTarget}
          onChange={(reserveTarget) => update({ reserveTarget })}
          placeholder="Describe an amount or range and why it fits this case"
        />
      </div>
      <ChoiceGroup
        legend="Where is the reserve relative to that chosen target?"
        value={value.reserveStatus}
        options={RESERVE_OPTIONS}
        onChange={(reserveStatus) => update({ reserveStatus })}
      />
      <ChoiceGroup
        legend="What is the high-interest debt status?"
        value={value.highInterestDebt}
        options={DEBT_OPTIONS}
        onChange={(highInterestDebt) => update({ highInterestDebt })}
      />
      <ChoiceGroup
        legend="Is an employer match relevant?"
        value={value.employerMatch}
        options={MATCH_OPTIONS}
        onChange={(employerMatch) => update({ employerMatch })}
      />
      <p className="ops-body mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-[14px] leading-6 text-slate-300">
        These answers create a route and an action list. They do not calculate eligibility,
        prescribe a reserve, or tell the learner which account to use.
      </p>
    </div>
  );
}

function LossStep({
  value,
  update,
}: {
  value: ReadinessRecord;
  update: (patch: Partial<ReadinessRecord>) => void;
}) {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <DefinitionBlock
          title="Risk capacity"
          body="The financial ability to absorb a loss without disrupting required spending, debt payments, or the stated goal."
          tone="cyan"
        />
        <DefinitionBlock
          title="Risk willingness"
          body="The amount of price fluctuation and temporary loss the investor is prepared to experience while following a written plan."
          tone="amber"
        />
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="text-[13px] font-semibold tracking-[0.02em] text-accent-green">
          Cause and effect
        </div>
        <p className="ops-body mt-2 text-[15px] leading-7 text-slate-300">
          A tuition payment moving closer can lower capacity because a market loss may leave
          too little cash when the bill arrives. The learner&apos;s emotional willingness may be
          unchanged. Mission 5 needs both facts, not one risk score.
        </p>
      </div>
      <ChoiceGroup
        legend="What can the finances absorb for this goal?"
        value={value.capacityForLoss}
        options={CAPACITY_OPTIONS}
        onChange={(capacityForLoss) => update({ capacityForLoss })}
      />
      <ChoiceGroup
        legend="What experience is the learner prepared to carry?"
        value={value.willingnessForLoss}
        options={WILLINGNESS_OPTIONS}
        onChange={(willingnessForLoss) => update({ willingnessForLoss })}
      />
      {value.capacityForLoss && value.willingnessForLoss && (
        <div className="mt-7 rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5" aria-live="polite">
          <div className="text-[13px] font-semibold text-accent-cyan">Two tracks recorded</div>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <SummaryTerm label="Financial ability" value={labelFor(CAPACITY_OPTIONS, value.capacityForLoss)} />
            <SummaryTerm label="Personal willingness" value={labelFor(WILLINGNESS_OPTIONS, value.willingnessForLoss)} />
          </dl>
        </div>
      )}
    </div>
  );
}

function AccessStep({
  value,
  update,
}: {
  value: ReadinessRecord;
  update: (patch: Partial<ReadinessRecord>) => void;
}) {
  return (
    <div>
      <DefinitionBlock
        title="Access flags identify what must be verified"
        body="Jurisdiction, account authority, and earned-income relevance can affect which personal path is lawful or available. OPS records broad flags only; it does not make a legal determination."
      />
      <ChoiceGroup
        legend="Which jurisdiction applies?"
        value={value.jurisdiction}
        options={JURISDICTION_OPTIONS}
        onChange={(jurisdiction) => update({ jurisdiction })}
      />
      <ChoiceGroup
        legend="What is the account-authority status?"
        value={value.accountAuthority}
        options={AUTHORITY_OPTIONS}
        onChange={(accountAuthority) => update({ accountAuthority })}
      />
      <ChoiceGroup
        legend="Could earned income affect the intended account's eligibility?"
        value={value.earnedIncomeStatus}
        options={EARNED_INCOME_OPTIONS}
        onChange={(earnedIncomeStatus) => update({ earnedIncomeStatus })}
      />
      <div className="mt-6 rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5">
        <div className="text-[13px] font-semibold text-accent-amber">Privacy boundary</div>
        <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
          Never enter a brokerage login, account number, tax ID, exact address, employer
          identity, or document containing those details. Broad planning flags are enough.
        </p>
      </div>
    </div>
  );
}

function LifeChangeStep({
  value,
  update,
}: {
  value: ReadinessRecord;
  update: (patch: Partial<ReadinessRecord>) => void;
}) {
  const diagnosisCorrect = value.lifeChangeDiagnosis === "capacity-and-liquidity";
  const actionCorrect = value.lifeChangeAction === "protect-cash-need";

  return (
    <div>
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="text-[13px] font-semibold tracking-[0.02em] text-accent-cyan">
          Fresh life-change check · unaided
        </div>
        <h4 className="ops-interactive-title mt-2 text-[22px] font-semibold tracking-[-0.015em]">
          Jordan&apos;s market willingness is unchanged. The finances are not.
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
          Jordan loses a job and now needs $12,000 within nine months. Jordan still feels
          comfortable with market volatility and still believes in the long-term plan.
        </p>
      </div>

      <ChoiceGroup
        legend="What changed?"
        value={value.lifeChangeDiagnosis}
        options={LIFE_DIAGNOSIS_OPTIONS}
        onChange={(lifeChangeDiagnosis) => update({ lifeChangeDiagnosis, lifeChangeAction: "" })}
        revealFeedback
        correctValue="capacity-and-liquidity"
      />

      {diagnosisCorrect && (
        <ChoiceGroup
          legend="What should the readiness record do next?"
          value={value.lifeChangeAction}
          options={LIFE_ACTION_OPTIONS}
          onChange={(lifeChangeAction) => update({ lifeChangeAction })}
          revealFeedback
          correctValue="protect-cash-need"
        />
      )}

      {diagnosisCorrect && actionCorrect && (
        <div className="mt-6 rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-5" role="status">
          <div className="text-[14px] font-semibold text-accent-green">Life-change check passed</div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
            The response protects the new cash need, updates capacity, and preserves the
            complete learning path without pretending willingness changed.
          </p>
        </div>
      )}
    </div>
  );
}

function RoutePanel({
  result,
  complete,
  mode,
  record,
}: {
  result: ReadinessRouteResult;
  complete: boolean;
  mode: ReadinessMode;
  record: ReadinessRecord;
}) {
  const missing = missingFieldLabels(record);
  const routeTone =
    result.route === "personal-deployment-available"
      ? "text-accent-green"
      : result.route === "personal-constrained"
        ? "text-accent-amber"
        : "text-accent-cyan";

  return (
    <div className="lg:sticky lg:top-24">
      <div className="text-[13px] font-semibold tracking-[0.02em] text-slate-400">
        {complete ? "Current route" : "Route forming"}
      </div>
      <div
        className={cn("mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em]", routeTone)}
        aria-live="polite"
      >
        {complete ? result.title : `${missing.length} item${missing.length === 1 ? "" : "s"} open`}
      </div>
      <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
        {complete
          ? result.summary
          : "Complete the broad planning flags to produce a route. Unknown answers remain visible rather than being guessed."}
      </p>

      {!complete && missing.length > 0 && (
        <ul className="mt-5 space-y-2 text-[13px] leading-5 text-slate-400">
          {missing.slice(0, 5).map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {complete && (
        <>
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="text-[13px] font-semibold text-slate-300">Why this route</div>
            <ul className="mt-3 space-y-3 text-[13px] leading-5 text-slate-400">
              {result.reasons.map((reason) => (
                <li key={reason} className="flex gap-2.5">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", routeDot(result.route))} aria-hidden />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="text-[13px] font-semibold text-slate-300">Deployment action plan</div>
            <ol className="mt-3 space-y-3 text-[13px] leading-5 text-slate-400">
              {result.actions.map((action, index) => (
                <li key={action} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-[12px] tabular-nums" aria-hidden>
                    {index + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-[12px] font-semibold text-slate-400">What the route means</div>
        <p className="ops-body mt-2 text-[13px] leading-5 text-slate-400">
          {mode === "practice"
            ? "A complete paper path with fictional facts. It never implies personal authority to invest."
            : "A conditional planning status based only on recorded answers. It is not personalized advice, legal guidance, or account approval."}
        </p>
      </div>
    </div>
  );
}

type ChoiceOption<T extends string> = {
  value: T;
  label: string;
  detail: string;
};

function ChoiceGroup<T extends string>({
  legend,
  value,
  options,
  onChange,
  revealFeedback = false,
  correctValue,
}: {
  legend: string;
  value: T | "";
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
  revealFeedback?: boolean;
  correctValue?: T;
}) {
  const instanceId = useId();
  const name = `${slugify(legend)}-${instanceId}`;
  return (
    <fieldset className="mt-7">
      <legend className="ops-body-strong text-[16px] font-semibold leading-6">{legend}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const checked = value === option.value;
          const correct = revealFeedback && checked && option.value === correctValue;
          const incorrect = revealFeedback && checked && option.value !== correctValue;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex min-h-20 cursor-pointer gap-3 rounded-2xl border p-4 transition-colors motion-reduce:transition-none",
                correct
                  ? "border-accent-green/40 bg-accent-green/[0.07]"
                  : incorrect
                    ? "border-accent-red/40 bg-accent-red/[0.06]"
                    : checked
                      ? "border-accent-amber/40 bg-accent-amber/[0.07]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  checked ? "border-accent-amber" : "border-white/25",
                )}
                aria-hidden
              >
                {checked && <span className="h-2.5 w-2.5 rounded-full bg-accent-amber" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold leading-5 text-white">{option.label}</span>
                <span className="mt-1 block text-[13px] leading-5 text-slate-400">{option.detail}</span>
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-accent-cyan/60 peer-focus-visible:ring-2" aria-hidden />
            </label>
          );
        })}
      </div>
      {revealFeedback && value && (
        <div
          className={cn(
            "mt-3 rounded-xl border p-3 text-[13px] leading-5",
            value === correctValue
              ? "border-accent-green/30 bg-accent-green/[0.05] text-accent-green"
              : "border-accent-red/30 bg-accent-red/[0.05] text-accent-red",
          )}
          role="status"
        >
          {value === correctValue
            ? "Correct. The response follows the financial cause and effect."
            : "Not yet. Use the changed cash obligation—not the unchanged market belief—as the evidence."}
        </div>
      )}
    </fieldset>
  );
}

function ModeCard({
  checked,
  name,
  value,
  title,
  body,
  note,
  onChange,
}: {
  checked: boolean;
  name: string;
  value: string;
  title: string;
  body: string;
  note: string;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "relative flex min-h-60 cursor-pointer flex-col rounded-[24px] border p-5 transition-colors motion-reduce:transition-none sm:p-6",
        checked
          ? "border-accent-amber/45 bg-accent-amber/[0.07]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold tracking-[0.02em] text-accent-amber">Equal path</span>
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border",
            checked ? "border-accent-amber" : "border-white/25",
          )}
          aria-hidden
        >
          {checked && <span className="h-3 w-3 rounded-full bg-accent-amber" />}
        </span>
      </span>
      <span className="mt-8 block text-[28px] font-semibold tracking-[-0.02em] text-white">{title}</span>
      <span className="ops-body mt-3 block text-[15px] leading-6 text-slate-300">{body}</span>
      <span className="mt-auto border-t border-white/10 pt-4 text-[13px] leading-5 text-slate-400">{note}</span>
      <span className="pointer-events-none absolute inset-0 rounded-[24px] ring-accent-cyan/60 peer-focus-visible:ring-2" aria-hidden />
    </label>
  );
}

function DefinitionBlock({
  title,
  body,
  tone = "cyan",
}: {
  title: string;
  body: string;
  tone?: "cyan" | "amber";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 sm:p-6",
        tone === "cyan"
          ? "border-accent-cyan/25 bg-accent-cyan/[0.05]"
          : "border-accent-amber/25 bg-accent-amber/[0.05]",
      )}
    >
      <div className={cn("text-[13px] font-semibold tracking-[0.02em]", tone === "cyan" ? "text-accent-cyan" : "text-accent-amber")}>
        Concept first
      </div>
      <h4 className="ops-interactive-title mt-2 text-[20px] font-semibold tracking-[-0.01em] sm:text-[22px]">{title}</h4>
      <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300 sm:text-[15px] sm:leading-7">{body}</p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-[14px] font-semibold text-slate-300">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-white outline-none placeholder:text-slate-500 focus:border-accent-cyan/50 focus:ring-2 focus:ring-accent-cyan/30"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
  invalidWhen,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint: string;
  invalidWhen?: (value: number) => boolean;
}) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const parsed = finiteNonNegative(value);
  const invalid = value !== "" && (parsed === null || Boolean(invalidWhen?.(parsed)));
  return (
    <div className="block">
      <label htmlFor={inputId} className="block text-[14px] font-semibold text-slate-300">{label}</label>
      <span className="relative mt-2 block">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[15px] text-slate-400" aria-hidden>$</span>
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          min="0"
          step="100"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={hintId}
          className="min-h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] py-3 pl-8 pr-4 text-[15px] text-white outline-none tabular-nums placeholder:text-slate-500 focus:border-accent-cyan/50 focus:ring-2 focus:ring-accent-cyan/30"
        />
      </span>
      <span id={hintId} className={cn("mt-1.5 block text-[12px] leading-5", invalid ? "text-accent-red" : "text-slate-500")}>
        {invalid ? "Enter an amount that satisfies the planning boundary described here." : hint}
      </span>
    </div>
  );
}

function SummaryTerm({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <dt className="text-[12px] text-slate-400">{label}</dt>
      <dd className="mt-1 text-[14px] font-semibold leading-5 text-white">{value}</dd>
    </div>
  );
}

function isStepReady(step: number, value: ReadinessRecord): boolean {
  switch (step) {
    case 0:
      return true;
    case 1:
      return Boolean(
        value.goal.trim() &&
          value.horizon &&
          value.contributionPlan.trim() &&
          value.plannedWithdrawal.trim() &&
          readinessPlanningAmountsAreUsable(value),
      );
    case 2:
      return Boolean(
        value.reserveTarget.trim() &&
          value.reserveStatus &&
          value.highInterestDebt &&
          value.employerMatch,
      );
    case 3:
      return Boolean(value.capacityForLoss && value.willingnessForLoss);
    case 4:
      return Boolean(value.jurisdiction && value.accountAuthority && value.earnedIncomeStatus);
    case 5:
      return Boolean(value.lifeChangeDiagnosis && value.lifeChangeAction);
    default:
      return false;
  }
}

function isProfileComplete(value: ReadinessRecord): boolean {
  return [1, 2, 3, 4].every((step) => isStepReady(step, value));
}

function missingFieldLabels(value: ReadinessRecord): string[] {
  const missing: string[] = [];
  if (!value.goal.trim()) missing.push("Goal");
  if (!value.horizon) missing.push("Goal horizon");
  if (!value.contributionPlan.trim()) missing.push("Contribution plan");
  if (!value.plannedWithdrawal.trim()) missing.push("Planned withdrawals");
  if (!readinessPlanningAmountsAreUsable(value)) {
    missing.push("A positive planning amount that contains the near-term cash role");
  }
  if (!value.reserveTarget.trim()) missing.push("Learner-selected reserve target");
  if (!value.reserveStatus) missing.push("Reserve status");
  if (!value.highInterestDebt) missing.push("Debt flag");
  if (!value.employerMatch) missing.push("Employer-match flag");
  if (!value.capacityForLoss) missing.push("Loss capacity");
  if (!value.willingnessForLoss) missing.push("Loss willingness");
  if (!value.jurisdiction) missing.push("Jurisdiction");
  if (!value.accountAuthority) missing.push("Account authority");
  if (!value.earnedIncomeStatus) missing.push("Earned-income relevance");
  return missing;
}

function finiteNonNegative(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function readinessPlanningAmountsAreUsable(
  value: Pick<ReadinessRecord, "approximatePortfolioValue" | "nearTermNeed">,
): boolean {
  const portfolioAmount = finiteNonNegative(value.approximatePortfolioValue);
  const nearTermNeed = finiteNonNegative(value.nearTermNeed);
  return (
    portfolioAmount !== null &&
    portfolioAmount > 0 &&
    nearTermNeed !== null &&
    nearTermNeed <= portfolioAmount
  );
}

function recordForMode(
  mode: ReadinessMode,
  value: ReadinessRecord,
): ReadinessRecord {
  if (mode === "practice" && value.profileOwner !== "fictional-case") {
    return MINA_PRACTICE_READINESS;
  }
  if (mode === "personal" && value.profileOwner !== "learner") {
    return EMPTY_READINESS_RECORD;
  }
  return value;
}

function formatApproxMoney(value: number): string {
  return `≈ $${Math.round(value).toLocaleString("en-US")}`;
}

function routeDot(route: ReadinessRoute): string {
  if (route === "personal-deployment-available") return "bg-accent-green";
  if (route === "personal-constrained") return "bg-accent-amber";
  return "bg-accent-cyan";
}

function labelFor<T extends string>(options: readonly ChoiceOption<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function slugify(value: string): string {
  return `readiness-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
