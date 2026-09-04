"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  BASIS_POINTS_TOTAL,
  allocationWeightsAreComplete,
  calculateCandidateCeilingBps,
  calculatePortfolioStressLossBps,
  isLiquidityCovered,
  validateAllocationSleeves,
} from "@/lib/allocation-policy";
import {
  createEmptyMandate,
  type AllocationRecord,
  type MandateRecord,
  type WorkbenchMode,
} from "@/lib/portfolio-workbench";
import { usePortfolioWorkbench } from "@/lib/use-portfolio-workbench";
import AllocationStudio, {
  type AllocationDraft,
} from "./AllocationStudio";
import AllocationRepairLab, {
  type AllocationRepairResult,
} from "./AllocationRepairLab";
import ReadinessRunway, {
  EMPTY_READINESS_RECORD,
  type ReadinessRecord,
  deriveReadinessRoute,
} from "./ReadinessRunway";
import ValuationJourneyShell, { type ValuationStage } from "./ValuationJourneyShell";

const LESSON_SLUG = "if-pb-05-set-allocation-and-risk-limits";

const STAGES: readonly ValuationStage[] = [
  {
    label: "Runway",
    title: "Define what this portfolio must protect.",
    guide:
      "A portfolio begins with a person or a fully specified practice case. Record the goal, the clock, the cash need, your capacity, your willingness, and anything that limits investing real money — all before assigning risk.",
    instruction: "Finish the readiness steps and save them.",
    next: "Run the theory preflight",
  },
  {
    label: "Preflight",
    title: "Check the four ideas Allocation Studio assumes.",
    guide:
      "This diagnostic does not affect your score. If an idea is unfamiliar, a short bridge teaches it here before a fresh check.",
    instruction: "Pass all four relationships, or complete the bridge and fresh check.",
    next: "Watch the policy form",
  },
  {
    label: "Model",
    title: "Watch weights turn into a goal consequence.",
    guide:
      "Mina's fictional policy reveals one decision at a time: protect the known cash need, assign broad roles, apply a visible teaching stress, then add each sleeve's loss contribution.",
    instruction: "Reveal and explain all four steps of the model.",
    next: "Repair three faults",
  },
  {
    label: "Repair",
    title: "Repair the total, the liquidity gap, and the stress budget.",
    guide:
      "Each defect has a different cause. Diagnose the relationship first; arithmetic is evidence for the decision, not a substitute for it.",
    instruction: "Answer all three repair decisions correctly.",
    next: "Build the policy",
  },
  {
    label: "Build",
    title: "Give every dollar a role—then inspect the loss.",
    guide:
      "Build your own policy or the complete practice policy. Nothing here chooses products, predicts returns, or declares an optimum.",
    instruction: "Make every policy check pass, then lock the draft for transfer.",
    next: "Face a changed goal",
  },
  {
    label: "Transfer",
    title: "The cash need changed. Rebuild the logic.",
    guide:
      "This is an unfamiliar case with no hints. Repair the policy, name what changed, and identify which later decisions must be reviewed.",
    instruction: "Pass the independent perturbation.",
    next: "Defend and save",
  },
  {
    label: "Defend",
    title: "Prove the method, then save your policy.",
    guide:
      "Choose the only coherent fresh allocation, calculate a candidate ceiling, and identify who owns that rule. Your actual draft is saved only after the independent proof passes.",
    instruction: "Pass both assessment questions, then save the checkpoint.",
    next: "Open your plan",
  },
] as const;

type ModeRecords<T> = Record<WorkbenchMode, T>;

const OPS_STRESS_NOTE =
  "Illustrative OPS teaching stress. It is not a forecast, guarantee, or worst-case bound.";

const practiceDraft = (): AllocationDraft => ({
  portfolioAmount: 40_000,
  nearTermNeed: 8_000,
  sleeves: [
    { id: "ready", targetBps: 2_000, minBps: 1_500, maxBps: 2_500, assumedLossBps: 0 },
    { id: "steady", targetBps: 3_000, minBps: 2_500, maxBps: 3_500, assumedLossBps: 1_000 },
    { id: "grow", targetBps: 5_000, minBps: 4_500, maxBps: 5_500, assumedLossBps: 3_500 },
  ],
  lossBudgetBps: 2_500,
  candidateMaxContributionBps: 200,
  candidateAssumedLossBps: 4_000,
  mandateRationale: "Mina protects the dated tuition need in Ready and accepts the illustrated loss trade-off for the longer goal.",
  acknowledged: false,
});

const personalDraft = (): AllocationDraft => ({
  portfolioAmount: 0,
  nearTermNeed: 0,
  sleeves: [
    { id: "ready", targetBps: 0, minBps: 0, maxBps: 0, assumedLossBps: 0 },
    { id: "steady", targetBps: 0, minBps: 0, maxBps: 0, assumedLossBps: 1_000 },
    { id: "grow", targetBps: 0, minBps: 0, maxBps: 0, assumedLossBps: 3_500 },
  ],
  lossBudgetBps: 0,
  candidateMaxContributionBps: null,
  candidateAssumedLossBps: null,
  mandateRationale: "",
  acknowledged: false,
});

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function Mission05AllocationJourney() {
  const {
    ready,
    workbench,
    activeMode,
    activeCase,
    setActiveMode,
    saveMandate,
    saveAllocation,
  } = usePortfolioWorkbench();
  const [hydrated, setHydrated] = useState(false);
  const [readiness, setReadiness] = useState<ModeRecords<ReadinessRecord>>({
    personal: EMPTY_READINESS_RECORD,
    practice: EMPTY_READINESS_RECORD,
  });
  const [allocations, setAllocations] = useState<ModeRecords<AllocationDraft>>({
    personal: personalDraft(),
    practice: practiceDraft(),
  });
  const [preflightPassed, setPreflightPassed] = useState<ModeRecords<boolean>>({
    personal: false,
    practice: false,
  });
  const [transferPassed, setTransferPassed] = useState<ModeRecords<boolean>>({
    personal: false,
    practice: false,
  });
  const [runwayFailure, setRunwayFailure] = useState<{
    title: string;
    items: string[];
  } | null>(null);
  const lastHydratedRevisionRef = useRef<ModeRecords<string>>({
    personal: "",
    practice: "",
  });
  const hydrationRevision = useMemo(
    () =>
      Object.fromEntries(
        (["personal", "practice"] as const).map((mode) => {
          const checkpoints = workbench.cases[mode].checkpoints;
          return [
            mode,
            [
              checkpoints.mandate.revision,
              checkpoints.mandate.status,
              checkpoints.allocation.revision,
              checkpoints.allocation.status,
            ].join(":"),
          ];
        }),
      ) as ModeRecords<string>,
    [workbench],
  );

  useEffect(() => {
    if (!ready) return;
    const changedModes = (["personal", "practice"] as const).filter(
      (mode) => lastHydratedRevisionRef.current[mode] !== hydrationRevision[mode],
    );
    if (changedModes.length === 0) return;

    setReadiness((current) => {
      const next = { ...current };
      changedModes.forEach((mode) => {
        next[mode] = readinessFromWorkbench(workbench.cases[mode].mandate, mode);
      });
      return next;
    });
    setAllocations((current) => {
      const next = { ...current };
      changedModes.forEach((mode) => {
        next[mode] = allocationFromWorkbench(
          workbench.cases[mode].allocation,
          mode === "personal" ? personalDraft() : practiceDraft(),
          workbench.cases[mode].mandate,
        );
      });
      return next;
    });
    setPreflightPassed((current) => {
      const next = { ...current };
      changedModes.forEach((mode) => {
        const status = workbench.cases[mode].allocation.preflight.status;
        next[mode] = status === "passed" || status === "bridge-complete";
      });
      return next;
    });
    setTransferPassed((current) => {
      const next = { ...current };
      changedModes.forEach((mode) => {
        const workbenchCase = workbench.cases[mode];
        next[mode] =
          workbenchCase.checkpoints.allocation.status !== "review-required" &&
          workbenchCase.allocation.transfer.status === "passed";
      });
      return next;
    });
    lastHydratedRevisionRef.current = { ...hydrationRevision };
    setHydrated(true);
  }, [hydrated, hydrationRevision, ready, workbench]);

  const activeReadiness = readiness[activeMode];
  const activeAllocation = allocations[activeMode];

  const saveReadiness = (record: ReadinessRecord, onComplete: () => void) => {
    const priorRevision = activeCase.checkpoints.mandate.revision;
    const result = saveMandate(
      activeMode,
      mandateFromReadiness(record, activeMode),
      "coherent",
      "readiness runway",
    );
    if (!result.ok) {
      setRunwayFailure({
        title: "That is not saved yet.",
        items: [result.message, ...result.issues],
      });
      return;
    }
    setRunwayFailure(null);
    setReadiness((current) => ({ ...current, [activeMode]: record }));
    const amount = Number(record.approximatePortfolioValue);
    const need = Number(record.nearTermNeed);
    setAllocations((current) => ({
      ...current,
      [activeMode]: {
        ...current[activeMode],
        portfolioAmount: Number.isFinite(amount) ? amount : current[activeMode].portfolioAmount,
        nearTermNeed: Number.isFinite(need) ? need : current[activeMode].nearTermNeed,
      },
    }));
    if (result.workbench.cases[activeMode].checkpoints.mandate.revision > priorRevision) {
      setTransferPassed((current) => ({ ...current, [activeMode]: false }));
    }
    onComplete();
  };

  if (!ready || !hydrated) {
    return (
      <div
        role="status"
        className="ops-interactive-frame px-6 py-10 text-center text-[14px] text-slate-400"
      >
        Restoring this mode’s Portfolio Workbench…
      </div>
    );
  }

  const mandateRestored =
    activeCase.checkpoints.mandate.status === "coherent" &&
    hasCurrentReadinessEvidence(activeCase.mandate, activeMode);
  const allocationRestored =
    mandateRestored && activeCase.checkpoints.allocation.status === "coherent";
  const allocationReviewRequired =
    activeCase.checkpoints.allocation.status === "review-required";
  const restoredStages = STAGES.map((_, index) =>
    allocationRestored ||
    (mandateRestored && (index === 0 || (allocationReviewRequired && index < 4))),
  );
  const restoredStage = allocationRestored
    ? STAGES.length - 1
    : allocationReviewRequired && mandateRestored
      ? 4
    : mandateRestored
      ? 1
      : 0;

  return (
    <ValuationJourneyShell
      key={`${activeMode}-${activeCase.checkpoints.mandate.revision}-${activeCase.checkpoints.allocation.revision}-${activeCase.checkpoints.allocation.status}`}
      lessonSlug={LESSON_SLUG}
      ariaLabel="Mission 5 allocation and risk-limit journey"
      stages={STAGES}
      finishHref="/plan"
      finishLabel="Open your plan"
      labLabel={`${activeMode === "personal" ? "Build mine" : "Practice case"} · Allocation policy lab`}
      savedArtifactLabel="Allocation and Risk Policy"
      initialCompleted={restoredStages}
      initialStage={restoredStage}
      renderStage={(stage, onComplete) => {
        switch (stage) {
          case 0:
            return (
              <div className="space-y-4">
                <ReadinessRunway
                  mode={activeMode}
                  value={activeReadiness}
                  onModeChange={(mode) => {
                    const result = setActiveMode(mode);
                    if (!result.ok) {
                      setRunwayFailure({
                        title: "The portfolio mode did not change.",
                        items: [result.message, ...result.issues],
                      });
                      return;
                    }
                    setRunwayFailure(null);
                  }}
                  onChange={(record) => {
                    setRunwayFailure(null);
                    setReadiness((current) => ({ ...current, [activeMode]: record }));
                  }}
                  onComplete={(record) => saveReadiness(record, onComplete)}
                />
                {runwayFailure && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-accent-red/30 bg-accent-red/[0.06] p-5 text-[14px] text-accent-red sm:p-6"
                  >
                    <div className="font-semibold">{runwayFailure.title}</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {runwayFailure.items.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          case 1:
            return (
              <PreflightScene
                alreadyPassed={preflightPassed[activeMode]}
                onComplete={() => {
                  setPreflightPassed((current) => ({ ...current, [activeMode]: true }));
                  onComplete();
                }}
              />
            );
          case 2:
            return <ModelScene onComplete={onComplete} />;
          case 3:
            return <RepairScene onComplete={onComplete} />;
          case 4:
            return (
              <BuildScene
                mode={activeMode}
                mandate={activeCase.mandate}
                value={activeAllocation}
                onChange={(draft) =>
                  setAllocations((current) => ({ ...current, [activeMode]: draft }))
                }
                onComplete={onComplete}
              />
            );
          case 5:
            return (
              <TransferScene
                alreadyPassed={transferPassed[activeMode]}
                onComplete={() => {
                  setTransferPassed((current) => ({ ...current, [activeMode]: true }));
                  onComplete();
                }}
              />
            );
          default:
            return (
              <AssessmentScene
                mode={activeMode}
                draft={activeAllocation}
                mandate={activeCase.mandate}
                preflightPassed={preflightPassed[activeMode]}
                transferPassed={transferPassed[activeMode]}
                onSave={(record) =>
                  saveAllocation(
                    activeMode,
                    record,
                    "coherent",
                    "strategic weights and stress-loss policy",
                  )
                }
                onComplete={onComplete}
              />
            );
        }
      }}
    />
  );
}

function PreflightScene({
  alreadyPassed,
  onComplete,
}: {
  alreadyPassed: boolean;
  onComplete: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [bridge, setBridge] = useState(false);
  const [missedConcepts, setMissedConcepts] = useState<number[]>([]);
  const restoredCompletionRef = useRef(false);
  const [freshAnswers, setFreshAnswers] = useState<Record<number, string>>({});
  const [freshChecked, setFreshChecked] = useState(false);
  const questions = [
    {
      q: "What determines how two risky assets behave together in a portfolio?",
      options: [
        "Their weights, each asset's volatility, and how their returns move together",
        "Only the asset with the higher standalone volatility",
        "The number of tickers shown on the account screen",
      ],
      correct: 0,
      bridgeTitle: "Co-movement",
      bridge:
        "Co-movement describes how asset returns change together. For example, if two $5,000 holdings both fall 10% during the same event, they lose $1,000 together; if one stays flat, the combined loss is $500. The relationship changes the portfolio consequence.",
      freshQ:
        "Fresh check: two equally weighted assets usually fall together during the same shock. What does that imply?",
      freshOptions: [
        "Their positive co-movement can make the portfolio fall more than if one often held up",
        "Owning two tickers removes the shared risk",
        "Only the more volatile asset can affect portfolio risk",
      ],
      freshCorrect: 0,
      freshSuccess: "Correct. Shared movement can preserve common risk even when the portfolio owns more than one asset.",
      freshRetry: "Not yet. Focus on whether the two returns move together, not simply on the number of holdings.",
    },
    {
      q: "What can diversification do?",
      options: [
        "Reduce some asset-specific risk, while common risks and loss remain",
        "Make a portfolio unable to lose money",
        "Guarantee that one asset rises whenever another falls",
      ],
      correct: 0,
      bridgeTitle: "Diversification",
      bridge:
        "Diversification combines exposures whose returns do not move perfectly together, which can reduce some asset-specific risk. If one $5,000 holding loses 20% while another $5,000 holding is unchanged, the portfolio loses 10%, not 20%; a broad market shock can still hurt both.",
      freshQ:
        "Fresh check: one company-specific setback hurts one of two imperfectly related holdings. What can diversification change?",
      freshOptions: [
        "It can reduce that company-specific effect on the whole portfolio, while common losses remain possible",
        "It guarantees that the other holding rises by the same amount",
        "It prevents the portfolio from ever losing money",
      ],
      freshCorrect: 0,
      freshSuccess: "Correct. Diversification can dilute a specific setback; it cannot erase common risk or guarantee a gain.",
      freshRetry: "Not yet. Separate reducible company-specific risk from risks that can affect many assets together.",
    },
    {
      q: "What does an efficient frontier provide?",
      options: [
        "An estimate-based opportunity set—not a personal suitability answer",
        "The one correct allocation for every long-term investor",
        "A guarantee of the highest realized return",
      ],
      correct: 0,
      bridgeTitle: "Efficient frontier",
      bridge:
        "An efficient frontier is the model-estimated set of portfolios with the highest expected return at each modelled volatility. If expected returns or correlations change, the estimated frontier can move; it still does not decide whether a dated $8,000 cash need makes a portfolio personally usable.",
      freshQ:
        "Fresh check: a model places a portfolio on its estimated frontier, but the investor needs cash next year. What remains unresolved?",
      freshOptions: [
        "Whether the portfolio fits the investor's cash timing, loss capacity, and willingness",
        "Nothing; frontier membership settles personal suitability",
        "The model has guaranteed the realized return",
      ],
      freshCorrect: 0,
      freshSuccess: "Correct. An opportunity-set estimate and a goal you can actually use answer different questions.",
      freshRetry: "Not yet. The frontier describes modelled trade-offs; the investor's goal and constraints determine personal fit.",
    },
    {
      q: "How should expected return, volatility, correlation, and a tangency result be read?",
      options: [
        "As estimates that depend on inputs and assumptions",
        "As known facts once a chart is drawn",
        "As regulatory limits",
      ],
      correct: 0,
      bridgeTitle: "Model inputs",
      bridge:
        "Expected return, volatility, correlation, and a tangency result are estimates produced from data and assumptions. If a correlation estimate changes from 0.2 to 0.7, a rerun can show less diversification and different weights; the old output does not remain a known fact.",
      freshQ:
        "Fresh check: the same optimizer is rerun with different expected returns and correlations. What should the learner expect?",
      freshOptions: [
        "The estimated frontier and tangency portfolio can move",
        "The personal cash need automatically disappears",
        "The old output remains a known fact",
      ],
      freshCorrect: 0,
      freshSuccess: "Correct. Changed estimates can change the modelled opportunity set and its tangency result.",
      freshRetry: "Not yet. An optimizer reflects its inputs; changing the inputs can change the output.",
    },
  ] as const;
  const correct = questions.every((question, index) => answers[index] === question.options[question.correct]);
  const freshCorrect = missedConcepts.every(
    (index) => freshAnswers[index] === questions[index].freshOptions[questions[index].freshCorrect],
  );

  useEffect(() => {
    if (!alreadyPassed) {
      restoredCompletionRef.current = false;
      return;
    }
    if (restoredCompletionRef.current) return;
    restoredCompletionRef.current = true;
    onComplete();
  }, [alreadyPassed, onComplete]);

  if (alreadyPassed) {
    return <SuccessNote>Preflight evidence is already recorded for this portfolio mode.</SuccessNote>;
  }

  return (
    <div className="space-y-6">
      <Notice tone="cyan" title="Preflight · this does not affect your score">
        Choose &ldquo;I don&apos;t know yet&rdquo; whenever an idea is unfamiliar. A miss opens only the bridge you need here; it never takes away course progress.
      </Notice>

      {!bridge ? (
        <>
          <div className="space-y-5">
            {questions.map((question, index) => (
              <ChoiceGroup
                key={question.q}
                legend={`${index + 1}. ${question.q}`}
                name={`preflight-${index}`}
                options={[...question.options, "I don't know yet"]}
                value={answers[index] ?? ""}
                onChange={(value) => setAnswers((current) => ({ ...current, [index]: value }))}
              />
            ))}
          </div>
          {checked && (
            <Notice tone={correct ? "green" : "amber"} title={correct ? "All four relationships hold" : "A bridge is ready"}>
              {correct
                ? "You can use the Allocation Studio without deriving covariance matrices or solving an optimizer."
                : "The missing ideas are taught next, then one fresh item checks the relationship again."}
            </Notice>
          )}
          <button
            type="button"
            disabled={Object.keys(answers).length < questions.length}
            onClick={() => {
              setChecked(true);
              const missed = questions.flatMap((question, index) =>
                answers[index] === question.options[question.correct] ? [] : [index],
              );
              if (missed.length === 0) {
                onComplete();
                return;
              }
              setMissedConcepts(missed);
              setFreshAnswers({});
              setFreshChecked(false);
              setBridge(true);
            }}
            className={primaryButton}
          >
            Check the four relationships
          </button>
        </>
      ) : (
        <div className="space-y-6">
          <Notice tone="amber" title={`${missedConcepts.length} concept${missedConcepts.length === 1 ? "" : "s"} to bridge`}>
            Only the relationships you missed are shown below. Read each definition and example, then answer its fresh question. Incorrect fresh answers show feedback and remain retryable.
          </Notice>
          <div className="grid gap-4 sm:grid-cols-2">
            {missedConcepts.map((index) => (
              <Definition key={questions[index].bridgeTitle} title={questions[index].bridgeTitle}>
                {questions[index].bridge}
              </Definition>
            ))}
          </div>
          <a
            href="/lessons/portfolio-efficient-frontier"
            className="inline-flex min-h-11 items-center text-[14px] font-semibold text-accent-cyan hover:underline"
          >
            Open the full Finance Foundations frontier lesson
          </a>
          <div className="space-y-5">
            {missedConcepts.map((index) => {
              const question = questions[index];
              const answered = freshAnswers[index];
              const itemCorrect = answered === question.freshOptions[question.freshCorrect];
              return (
                <div key={question.freshQ} className="space-y-3">
                  <ChoiceGroup
                    legend={question.freshQ}
                    name={`preflight-fresh-${index}`}
                    options={[...question.freshOptions]}
                    value={answered ?? ""}
                    onChange={(value) => {
                      setFreshAnswers((current) => ({ ...current, [index]: value }));
                      setFreshChecked(false);
                    }}
                  />
                  {freshChecked && answered && (
                    <Notice
                      tone={itemCorrect ? "green" : "amber"}
                      title={itemCorrect ? "Correct" : "Try this relationship again"}
                    >
                      {itemCorrect ? question.freshSuccess : question.freshRetry}
                    </Notice>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            disabled={missedConcepts.some((index) => !freshAnswers[index])}
            onClick={() => {
              if (freshChecked && freshCorrect) {
                onComplete();
                return;
              }
              setFreshChecked(true);
            }}
            className={primaryButton}
          >
            {freshChecked && freshCorrect ? "Continue with preflight passed" : "Check fresh answers"}
          </button>
        </div>
      )}
    </div>
  );
}

function ModelScene({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState(0);
  const rows = [
    ["Ready", "20%", "$8,000", "0%", "0.0 pp / $0"],
    ["Steady", "30%", "$12,000", "−10%", "3.0 pp / $1,200"],
    ["Grow", "50%", "$20,000", "−35%", "17.5 pp / $7,000"],
    ["Total", "100%", "$40,000", "—", "20.5% / $8,200"],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Definition title="Slice">A part of the portfolio grouped by the job it does. Ready, Steady, and Grow are OPS teaching names, not products; the industry usually calls a slice a sleeve.</Definition>
        <Definition title="Strategic weight">The long-run target percentage assigned to a slice under the goal and limits you saved.</Definition>
        <Definition title="Liquidity bucket">A liquidity bucket is the portfolio portion assigned to meet a known cash need by its date. For example, Mina assigns $8,000 to Ready for tuition due in 18 months, so she need not plan to sell a fallen Grow slice to pay that bill.</Definition>
        <Definition title="Target range">A target range is the minimum-to-maximum interval allowed around a strategic weight before review. For example, a 30% Steady target with a 25%–35% range reaches 36% after market movement; that breach prompts review and a possible rebalance under your saved limits.</Definition>
        <Definition title="Stress assumption">An explicit hypothetical loss used to inspect consequences. It is not a forecast or maximum possible loss.</Definition>
        <Definition title="Loss contribution">A slice’s share of portfolio loss in percentage points: slice weight × assumed slice loss.</Definition>
      </div>

      <Notice tone="cyan" title="Mina · fictional practice case">
        $40,000 total, including an $8,000 expense due in 18 months. Her policy is one coherent illustration—not a default allocation.
      </Notice>

      <div aria-live="polite">
        <div className="grid gap-3 md:hidden">
          {rows.slice(0, revealed).map((row) => (
            <article
              key={row[0]}
              className={cn(
                "rounded-2xl border border-white/10 bg-white/[0.03] p-4",
                row[0] === "Total" && "border-accent-cyan/30 bg-accent-cyan/[0.05]",
              )}
            >
              <h3 className={cn("text-[16px] font-semibold text-white", row[0] === "Total" && "text-accent-cyan")}>{row[0]}</h3>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  ["Weight", row[1]],
                  ["Dollars", row[2]],
                  ["Teaching stress", row[3]],
                  ["Loss contribution", row[4]],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[12px] leading-4 text-slate-500">{label}</dt>
                    <dd className="mt-1 text-[14px] font-semibold tabular-nums text-slate-200">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full table-fixed text-left">
            <thead className="bg-white/[0.04] text-[12px] font-semibold text-slate-400">
              <tr>
                <th scope="col" className="w-[21%] px-4 py-3">Role</th>
                <th scope="col" className="w-[14%] px-2 py-3">Weight</th>
                <th scope="col" className="w-[18%] px-2 py-3">Dollars</th>
                <th scope="col" className="w-[16%] px-2 py-3">Stress</th>
                <th scope="col" className="w-[31%] px-2 py-3 pr-4">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, revealed).map((row) => (
                <tr key={row[0]} className={cn("border-t border-white/10 text-[14px] text-slate-300", row[0] === "Total" && "font-semibold text-white")}>
                  <th scope="row" className={cn("px-4 py-3 font-normal", row[0] === "Total" && "font-semibold")}>{row[0]}</th>
                  {row.slice(1).map((cell) => (
                    <td key={cell} className="px-2 py-3 tabular-nums last:pr-4">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {revealed < rows.length ? (
        <button type="button" onClick={() => setRevealed((current) => current + 1)} className={primaryButton}>
          Reveal next contribution
        </button>
      ) : (
        <div className="space-y-4">
          <Notice tone="amber" title="Read the result, not just the total">
            The Ready amount matches the known $8,000 need. Under this visible teaching stress, Steady contributes 3.0 points and Grow 17.5 points. Adding them produces a 20.5% hypothetical portfolio loss.
          </Notice>
          <div className="rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.05] p-5">
            <div className="text-[13px] font-semibold text-accent-purple">Candidate ceiling model · OPS/learner policy</div>
            <div className="mt-3 text-[22px] font-semibold tabular-nums text-white">2% allowed contribution ÷ 40% assumed position loss = 5%</div>
            <p className="mt-2 text-[14px] leading-6 text-slate-400">On $40,000, the candidate ceiling is $2,000. It is not a regulator rule and does not bound every possible loss.</p>
          </div>
          <button type="button" onClick={onComplete} className={primaryButton}>Use the model</button>
        </div>
      )}
    </div>
  );
}

function RepairScene({ onComplete }: { onComplete: () => void }) {
  const [repairIndex, setRepairIndex] = useState(0);
  const [results, setResults] = useState<AllocationRepairResult[]>([]);
  const repairs = [
    {
      title: "Repair 1 · Assign every dollar once",
      instruction: "This draft totals 105%. Reduce any slice or combination of slices until the same capital is no longer counted twice.",
      initialWeightsBps: { ready: 2_000, steady: 3_000, grow: 5_500 },
      portfolioAmount: 40_000,
      nearTermNeed: 0,
      suppliedLossBps: { ready: 0, steady: 0, grow: 0 },
      lossBudgetBps: 10_000,
      constraints: {
        bounds: { enforced: true, displayed: true },
        weightTotal: { enforced: true, displayed: true },
        liquidity: { enforced: false, displayed: false },
        stressBudget: { enforced: false, displayed: false },
      },
      requireRationale: false,
      submitLabel: "Lock the weight repair",
    },
    {
      title: "Repair 2 · Fund the dated cash need",
      instruction: "A $30,000 portfolio must provide $9,000 in twelve months. Reassign any weights you choose, but Ready must cover that date and the portfolio must still total 100%.",
      initialWeightsBps: { ready: 2_000, steady: 3_000, grow: 5_000 },
      portfolioAmount: 30_000,
      nearTermNeed: 9_000,
      suppliedLossBps: { ready: 0, steady: 0, grow: 0 },
      lossBudgetBps: 10_000,
      constraints: {
        bounds: { enforced: true, displayed: true },
        weightTotal: { enforced: true, displayed: true },
        liquidity: { enforced: true, displayed: true },
        stressBudget: { enforced: false, displayed: false },
      },
      requireRationale: true,
      submitLabel: "Lock the liquidity repair",
    },
    {
      title: "Repair 3 · Bring the loss inside budget",
      instruction: "This $50,000 case starts at 10% / 20% / 70% and loses 30% under the supplied 0% / 10% / 40% stress. Find any 100% allocation at or below the 22% budget, then explain the trade-off.",
      initialWeightsBps: { ready: 1_000, steady: 2_000, grow: 7_000 },
      portfolioAmount: 50_000,
      nearTermNeed: 0,
      suppliedLossBps: { ready: 0, steady: 1_000, grow: 4_000 },
      lossBudgetBps: 2_200,
      constraints: {
        bounds: { enforced: true, displayed: true },
        weightTotal: { enforced: true, displayed: true },
        liquidity: { enforced: false, displayed: false },
        stressBudget: { enforced: true, displayed: true },
      },
      requireRationale: true,
      submitLabel: "Lock the stress repair",
    },
  ] as const;
  const repair = repairs[repairIndex];
  const passRepair = (result: AllocationRepairResult) => {
    setResults((current) => [...current, result]);
    if (repairIndex === repairs.length - 1) {
      onComplete();
      return;
    }
    setRepairIndex((current) => current + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="text-[13px] text-slate-400">
          Guided repair {repairIndex + 1} of {repairs.length}
        </div>
        <div className="text-[13px] font-semibold tabular-nums text-accent-cyan">
          {results.length} locked
        </div>
      </div>
      <AllocationRepairLab
        key={repair.title}
        {...repair}
        onPass={passRepair}
      />
    </div>
  );
}

function BuildScene({
  mode,
  mandate,
  value,
  onChange,
  onComplete,
}: {
  mode: WorkbenchMode;
  mandate: MandateRecord;
  value: AllocationDraft;
  onChange: (draft: AllocationDraft) => void;
  onComplete: () => void;
}) {
  const [showErrors, setShowErrors] = useState(false);
  const coherent = allocationDraftIsCoherent(value, mandate);
  return (
    <div className="space-y-6">
      <Notice tone="amber" title={mode === "practice" ? "Complete fictional policy" : "Learner-owned starting point"}>
        {mode === "practice"
          ? "Mina's supplied facts and illustrative policy are loaded. Inspect them, change them if you choose, and acknowledge the assumptions."
          : "OPS supplies no recommended weights. Use the goal and cash need from your readiness record, then choose and explain each policy input."}
      </Notice>
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4" aria-label="The goal and limits you saved">
        <Stat label="Goal" value={mandate.goal || "Not recorded"} detail={mandate.horizon || "Horizon not recorded"} />
        <Stat label="Where you stand" value={mandate.route.replace(/-/g, " ")} detail="Affects investing real money, never course access" />
        <Stat label="Capacity" value={mandate.capacityForLoss.replace(/-/g, " ")} detail="Financial ability to absorb loss" />
        <Stat label="Willingness" value={mandate.willingnessForLoss.replace(/-/g, " ")} detail="Ability to follow the written plan" />
      </div>
      <AllocationStudio
        value={value}
        onChange={onChange}
        showErrors={showErrors}
        referenceAmountsReadOnly
      />
      <button
        type="button"
        onClick={() => { setShowErrors(true); if (coherent) onComplete(); }}
        className={primaryButton}
      >
        Lock this draft for transfer
      </button>
    </div>
  );
}

function TransferScene({ alreadyPassed, onComplete }: { alreadyPassed: boolean; onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [repair, setRepair] = useState<AllocationRepairResult | null>(null);
  const restoredCompletionRef = useRef(false);
  const correct =
    repair !== null &&
    answers.cause === "Capacity and liquidity changed; willingness may be unchanged" &&
    answers.review === "Allocation and every dependent architecture, timing, product, order, flight-test, and operating record";

  useEffect(() => {
    if (!alreadyPassed) {
      restoredCompletionRef.current = false;
      return;
    }
    if (restoredCompletionRef.current) return;
    restoredCompletionRef.current = true;
    onComplete();
  }, [alreadyPassed, onComplete]);
  if (alreadyPassed) return <SuccessNote>The independent transfer case is already recorded for this mode.</SuccessNote>;

  return (
    <div className="space-y-6">
      <Notice tone="cyan" title="$60,000 unfamiliar case · no hints">
        The saved policy is 10% Ready, 35% Steady, 55% Grow under 0% / 8% / 40% teaching stresses. A required $15,000 payment moves to eleven months away. Willingness is unchanged; the case loss budget is 20%.
      </Notice>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Before repair" value="24.8%" detail="$14,880 stress loss" />
        <Stat label="Required soon" value="25.0%" detail="$15,000 of $60,000" />
        <Stat label="Budget" value="20.0%" detail="Teaching-stress limit" />
      </div>
      {repair ? (
        <Notice tone="green" title="Numeric repair locked">
          Your {repair.weightsBps.ready / 100}% / {repair.weightsBps.steady / 100}% / {repair.weightsBps.grow / 100}% policy totals 100%, funds the dated need, and produces {repair.totalStressLossBps / 100}% / {money(repair.totalStressLossDollars)} under the supplied scenario.
        </Notice>
      ) : (
        <AllocationRepairLab
          initialWeightsBps={{ ready: 1_000, steady: 3_500, grow: 5_500 }}
          portfolioAmount={60_000}
          nearTermNeed={15_000}
          suppliedLossBps={{ ready: 0, steady: 800, grow: 4_000 }}
          lossBudgetBps={2_000}
          requireRationale
          title="Rebuild after the change"
          instruction="Enter any allocation that totals 100%, assigns at least $15,000 to Ready, and stays at or below the 20% case budget. Explain the trade-off without using the illustrative answer as a template."
          submitLabel="Lock the independent repair"
          onPass={setRepair}
        />
      )}
      <ChoiceGroup legend="What changed in the goal and limits?" name="transfer-cause" options={["Capacity and liquidity changed; willingness may be unchanged", "Only willingness changed", "Nothing changed because market expectations did not change"]} value={answers.cause ?? ""} onChange={(value) => setAnswers((current) => ({ ...current, cause: value }))} />
      <ChoiceGroup legend="What must be marked for review after this change?" name="transfer-review" options={["Allocation and every dependent architecture, timing, product, order, flight-test, and operating record", "Only the Ready label", "Nothing; recompute silently and keep every approval"]} value={answers.review ?? ""} onChange={(value) => setAnswers((current) => ({ ...current, review: value }))} />
      {checked && <Notice tone={correct ? "green" : "amber"} title={correct ? "Transfer passed" : "The repaired policy is not yet consistent"}>{correct ? "The new near-term obligation changes financial capacity and cash timing, then propagates into every dependent portfolio decision." : "Require 100%, at least 25% Ready, no more than 20% stated stress loss, and an explicit downstream review."}</Notice>}
      <button type="button" disabled={!repair || Object.keys(answers).length < 2} onClick={() => { setChecked(true); if (correct) onComplete(); }} className={primaryButton}>Check the unfamiliar case</button>
    </div>
  );
}

function AssessmentScene({
  mode,
  draft,
  mandate,
  preflightPassed,
  transferPassed,
  onSave,
  onComplete,
}: {
  mode: WorkbenchMode;
  draft: AllocationDraft;
  mandate: MandateRecord;
  preflightPassed: boolean;
  transferPassed: boolean;
  onSave: (record: AllocationRecord) => { ok: boolean; message?: string; issues?: readonly string[] };
  onComplete: () => void;
}) {
  const [allocationAnswer, setAllocationAnswer] = useState("");
  const [ceiling, setCeiling] = useState("");
  const [meaning, setMeaning] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [saveError, setSaveError] = useState<string[]>([]);
  const correct =
    allocationAnswer === "A · 15% Ready / 35% Steady / 50% Grow" &&
    Number(ceiling) === 3 &&
    meaning === "A learner/OPS policy from a hypothetical loss—not a regulator threshold or guarantee";

  const submit = () => {
    setAttempted(true);
    if (!correct || !allocationDraftIsCoherent(draft, mandate) || !preflightPassed || !transferPassed) return;
    const result = onSave(allocationRecordFromDraft(draft, mode));
    if (!result.ok) {
      setSaveError([result.message ?? "This policy could not be saved.", ...(result.issues ?? [])]);
      return;
    }
    setSaveError([]);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <Notice tone="cyan" title="$80,000 fresh case">
        $12,000 is required within one year, so Ready must cover at least 15%. The supplied teaching stress is 0% Ready, 12% Steady, and 40% Grow. The stated stress-loss budget is 25%. Capacity and willingness are already recorded separately.
      </Notice>
      <ChoiceGroup
        legend="Which policy is consistent?"
        name="assessment-allocation"
        options={[
          "A · 15% Ready / 35% Steady / 50% Grow",
          "B · 15% Ready / 25% Steady / 60% Grow",
          "C · 10% Ready / 40% Steady / 50% Grow",
          "D · 15% Ready / 35% Steady / 55% Grow",
        ]}
        value={allocationAnswer}
        onChange={setAllocationAnswer}
      />
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <label htmlFor="candidate-ceiling-answer" className="block text-[15px] font-semibold text-white">
          A learner permits at most 1.5 percentage points of portfolio loss from one position and assumes that position could lose 50%. What candidate weight ceiling results?
        </label>
        <div className="mt-3 flex max-w-xs items-center rounded-xl border border-white/15 bg-white/[0.03] px-4 focus-within:ring-2 focus-within:ring-accent-cyan/40">
          <input id="candidate-ceiling-answer" type="number" inputMode="decimal" min="0" max="100" step="0.1" value={ceiling} onChange={(event) => setCeiling(event.target.value)} className="min-h-12 min-w-0 flex-1 bg-transparent text-right text-[17px] font-semibold tabular-nums text-white outline-none" />
          <span className="ml-2 text-slate-400">%</span>
        </div>
      </div>
      <ChoiceGroup legend="What does that 3% ceiling mean?" name="assessment-meaning" options={["A learner/OPS policy from a hypothetical loss—not a regulator threshold or guarantee", "A universal FINRA personal suitability rule", "The maximum amount the position can ever lose"]} value={meaning} onChange={setMeaning} />

      {attempted && (
        <Notice tone={correct && allocationDraftIsCoherent(draft, mandate) ? "green" : "amber"} title={correct ? "Independent method passed" : "Recheck the fresh evidence"}>
          {correct
            ? `Option A totals 100%, covers ${money(12_000)}, and loses 4.2 + 20.0 = 24.2%, or ${money(19_360)}. The ceiling is 1.5% ÷ 50% = 3%, or ${money(2_400)}.`
            : "One option must total 100%, cover the dated need, and remain at or below 25%. The ceiling is a division, and its ownership must stay explicit."}
        </Notice>
      )}
      {saveError.length > 0 && (
        <div role="alert" className="rounded-2xl border border-accent-red/30 bg-accent-red/[0.06] p-5 text-[14px] text-accent-red">
          <div className="font-semibold">The policy is not saved yet.</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">{saveError.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
      <button type="button" disabled={!allocationAnswer || !ceiling || !meaning} onClick={submit} className={primaryButton}>Save your allocation and risk limits</button>
      <p className="text-[12px] leading-5 text-slate-500">Saving updates your {mode === "personal" ? "personal" : "practice"} case only. What you can do now is recorded as: {mandate.route.replace(/-/g, " ")}.</p>
    </div>
  );
}

function ChoiceGroup({ legend, name, options, value, onChange }: { legend: string; name: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <fieldset className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <legend className="px-1 text-[15px] font-semibold leading-6 text-white">{legend}</legend>
      <div className="mt-4 grid gap-2.5">
        {options.map((option) => (
          <label key={option} className={cn("flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-[14px] leading-6 transition-colors motion-reduce:transition-none", value === option ? "border-accent-cyan/45 bg-accent-cyan/[0.07] text-white" : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25")}>
            <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} className="mt-1 h-4 w-4 flex-none accent-accent-cyan" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Definition({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5"><div className="text-[13px] font-semibold text-accent-cyan">Direct definition</div><h3 className="mt-2 text-[18px] font-semibold text-white">{title}</h3><p className="mt-2 text-[14px] leading-6 text-slate-300">{children}</p></div>;
}

function Notice({ tone, title, children }: { tone: "cyan" | "amber" | "green"; title: string; children: ReactNode }) {
  const classes = tone === "green" ? "border-accent-green/30 bg-accent-green/[0.06] text-accent-green" : tone === "amber" ? "border-accent-amber/30 bg-accent-amber/[0.06] text-accent-amber" : "border-accent-cyan/30 bg-accent-cyan/[0.06] text-accent-cyan";
  return <div className={cn("rounded-2xl border p-5 sm:p-6", classes)}><div className="text-[14px] font-semibold">{title}</div><p className="mt-2 text-[14px] leading-6 text-slate-300">{children}</p></div>;
}

function SuccessNote({ children }: { children: ReactNode }) {
  return <Notice tone="green" title="Checkpoint already recorded">{children}</Notice>;
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-[12px] text-slate-400">{label}</div><div className="mt-2 text-[26px] font-semibold tabular-nums text-white">{value}</div><div className="mt-1 text-[12px] text-slate-500">{detail}</div></div>;
}

export function readinessFromWorkbench(mandate: MandateRecord, mode: WorkbenchMode): ReadinessRecord {
  if (!mandate.goal) return EMPTY_READINESS_RECORD;
  const details = mandate.readinessDetails;
  const hasExactDetails = details.profileOwner !== "unassessed";
  return {
    ...EMPTY_READINESS_RECORD,
    profileOwner: hasExactDetails
      ? details.profileOwner === "fictional-case" ? "fictional-case" : "learner"
      : mode === "practice" ? "fictional-case" : "learner",
    goal: mandate.goal,
    horizon: (mandate.targetDate as ReadinessRecord["horizon"]) || "more-than-five-years",
    contributionPlan: mandate.contributionPlan,
    plannedWithdrawal: mandate.plannedWithdrawals,
    approximatePortfolioValue: hasExactDetails ? details.approximatePortfolioValue : "",
    nearTermNeed: mandate.nearTermCashNeeds,
    reserveTarget: mandate.emergencyReserve.target,
    reserveStatus: hasExactDetails ? details.reserveStatus : mandate.emergencyReserve.status === "on-track" ? "target-met" : mandate.emergencyReserve.status === "gap" ? "gap" : "unknown",
    highInterestDebt: hasExactDetails ? details.highInterestDebt : mandate.highInterestDebt === "resolved" ? "none" : "unknown",
    employerMatch: hasExactDetails ? details.employerMatch : mandate.employerMatch === "resolved" ? "using" : mandate.employerMatch === "not-applicable" ? "not-applicable" : "unknown",
    capacityForLoss: hasExactDetails
      ? details.capacityForLoss
      : mandate.capacityForLoss === "low"
        ? "limited"
        : mandate.capacityForLoss === "moderate"
          ? "moderate"
          : mandate.capacityForLoss === "high"
            ? "substantial"
            : mandate.capacityForLoss === "unsure"
              ? "unknown"
              : "",
    willingnessForLoss: hasExactDetails ? details.willingnessForLoss : mandate.willingnessForLoss === "low" ? "prefer-stability" : mandate.willingnessForLoss === "moderate" || mandate.willingnessForLoss === "high" ? "written-plan" : mandate.willingnessForLoss === "unsure" ? "unknown" : "",
    jurisdiction: hasExactDetails ? details.jurisdiction : mandate.jurisdiction === "resolved" ? "us" : "unknown",
    accountAuthority: hasExactDetails ? details.accountAuthority : mandate.accountAuthority === "resolved" ? "confirmed" : "unknown",
    earnedIncomeStatus: hasExactDetails ? details.earnedIncomeStatus : mandate.earnedIncome === "resolved" ? "relevant-confirmed" : mandate.earnedIncome === "not-applicable" ? "not-relevant" : "unknown",
    // Legacy evidence may prefill facts, but it cannot prove that this learner
    // completed Mission 5's fresh life-change check.
    lifeChangeDiagnosis: hasExactDetails ? details.lifeChangeDiagnosis : "",
    lifeChangeAction: hasExactDetails ? details.lifeChangeAction : "",
    route: mandate.route === "personal-available" ? "personal-deployment-available" : mandate.route === "personal-constrained" ? "personal-constrained" : "practice-only",
  };
}

/**
 * Older schema-v1 records can carry a coherent mandate checkpoint without the
 * exact Readiness Runway answers introduced by Mission 5. Those records must
 * revisit the non-penalizing bridge instead of receiving automatic stage
 * credit from a normalized legacy summary.
 */
export function hasCurrentReadinessEvidence(
  mandate: MandateRecord,
  mode: WorkbenchMode,
): boolean {
  const details = mandate.readinessDetails;
  const expectedOwner = mode === "personal" ? "learner" : "fictional-case";
  const portfolioAmount = Number(details.approximatePortfolioValue);
  const nearTermNeed = Number(mandate.nearTermCashNeeds);
  return (
    details.profileOwner === expectedOwner &&
    Boolean(
      mandate.goal.trim() &&
        mandate.horizon.trim() &&
        mandate.contributionPlan.trim() &&
        mandate.plannedWithdrawals.trim() &&
        details.approximatePortfolioValue.trim() &&
        mandate.nearTermCashNeeds.trim() &&
        Number.isFinite(portfolioAmount) &&
        portfolioAmount > 0 &&
        Number.isFinite(nearTermNeed) &&
        nearTermNeed >= 0 &&
        nearTermNeed <= portfolioAmount &&
        mandate.emergencyReserve.target.trim() &&
        details.reserveStatus &&
        details.highInterestDebt &&
        details.employerMatch &&
        details.capacityForLoss &&
        details.willingnessForLoss &&
        details.jurisdiction &&
        details.accountAuthority &&
        details.earnedIncomeStatus &&
        details.lifeChangeDiagnosis === "capacity-and-liquidity" &&
        details.lifeChangeAction === "protect-cash-need"
    )
  );
}

export function mandateFromReadiness(record: ReadinessRecord, mode: WorkbenchMode): MandateRecord {
  const base = createEmptyMandate();
  const route = deriveReadinessRoute(mode, record);
  const lossBand = (value: ReadinessRecord["capacityForLoss"]): MandateRecord["capacityForLoss"] => value === "limited" ? "low" : value === "substantial" ? "high" : value === "moderate" ? "moderate" : "unsure";
  const flag = (resolved: boolean, notApplicable = false): MandateRecord["highInterestDebt"] => notApplicable ? "not-applicable" : resolved ? "resolved" : "needs-action";
  return {
    ...base,
    goal: record.goal,
    targetDate: record.horizon,
    horizon: record.horizon.replace(/-/g, " "),
    contributionPlan: record.contributionPlan,
    plannedWithdrawals: record.plannedWithdrawal,
    nearTermCashNeeds: record.nearTermNeed,
    emergencyReserve: { target: record.reserveTarget, current: "", status: record.reserveStatus === "target-met" ? "on-track" : record.reserveStatus ? "gap" : "unanswered" },
    highInterestDebt: flag(record.highInterestDebt === "none"),
    employerMatch: flag(record.employerMatch === "using" || record.employerMatch === "not-available", record.employerMatch === "not-applicable"),
    accountAuthority: flag(record.accountAuthority === "confirmed"),
    jurisdiction: flag(record.jurisdiction === "us"),
    earnedIncome: flag(record.earnedIncomeStatus === "relevant-confirmed", record.earnedIncomeStatus === "not-relevant"),
    capacityForLoss: lossBand(record.capacityForLoss),
    willingnessForLoss: record.willingnessForLoss === "prefer-stability" ? "low" : record.willingnessForLoss === "written-plan" ? "moderate" : "unsure",
    route: route.route === "personal-deployment-available" ? "personal-available" : route.route === "personal-constrained" ? "personal-constrained" : "practice-only",
    deploymentActions: route.actions,
    acknowledgedAt: new Date().toISOString(),
    readinessDetails: {
      profileOwner: record.profileOwner,
      approximatePortfolioValue: record.approximatePortfolioValue,
      reserveStatus: record.reserveStatus,
      highInterestDebt: record.highInterestDebt,
      employerMatch: record.employerMatch,
      capacityForLoss: record.capacityForLoss,
      willingnessForLoss: record.willingnessForLoss,
      jurisdiction: record.jurisdiction,
      accountAuthority: record.accountAuthority,
      earnedIncomeStatus: record.earnedIncomeStatus,
      lifeChangeDiagnosis: record.lifeChangeDiagnosis,
      lifeChangeAction: record.lifeChangeAction,
    },
  };
}

export function allocationFromWorkbench(
  record: AllocationRecord,
  fallback: AllocationDraft,
  mandate?: MandateRecord,
): AllocationDraft {
  const mandateAmount = Number(mandate?.readinessDetails.approximatePortfolioValue);
  const amount =
    mandate &&
    mandate.readinessDetails.approximatePortfolioValue.trim() !== "" &&
    Number.isFinite(mandateAmount) &&
    mandateAmount > 0
      ? mandateAmount
      : record.referencePortfolioAmount.value ?? fallback.portfolioAmount;
  const needBps = record.nearTermNeedBps.value ?? 0;
  const mandateNeed = Number(mandate?.nearTermCashNeeds);
  const nearTermNeed =
    mandate &&
    mandate.nearTermCashNeeds.trim() !== "" &&
    Number.isFinite(mandateNeed) &&
    mandateNeed >= 0 &&
    mandateNeed <= amount
      ? mandateNeed
      : (amount * needBps) / BASIS_POINTS_TOTAL;

  // A saved mandate can legitimately exist before the learner has created any
  // allocation sleeves. Preserve its read-only reference facts on resume while
  // leaving the mode-specific blank/default sleeve draft untouched.
  if (record.sleeves.length !== 3) {
    return { ...fallback, portfolioAmount: amount, nearTermNeed };
  }
  const scenario = record.stressScenarios.find((item) => item.id === record.selectedStressScenarioId);
  const losses = new Map(scenario?.losses.map((item) => [item.sleeveId, item.lossBps.value ?? 0]) ?? []);
  const ids = ["ready", "steady", "grow"] as const;
  const sleeves = ids.map((id) => {
    const stored = record.sleeves.find((item) => item.id === id);
    if (!stored) return fallback.sleeves.find((item) => item.id === id)!;
    return { id, targetBps: stored.targetBps, minBps: stored.minBps, maxBps: stored.maxBps, assumedLossBps: losses.get(id) ?? 0 };
  });
  return {
    portfolioAmount: amount,
    nearTermNeed,
    sleeves,
    lossBudgetBps: record.portfolioStressLossBudgetBps.value ?? fallback.lossBudgetBps,
    // A complete saved record owns this choice, including an intentional
    // null/null omission. Falling back here would silently re-enable the
    // practice case's optional candidate ceiling after a reload.
    candidateMaxContributionBps: record.maximumPortfolioLossContributionBps.value,
    candidateAssumedLossBps: record.candidatePositionStressLossBps.value,
    mandateRationale: record.mandateRationale,
    acknowledged: record.goalImpactAcknowledged,
  };
}

function allocationRecordFromDraft(draft: AllocationDraft, mode: WorkbenchMode): AllocationRecord {
  const now = new Date().toISOString();
  const referenceOwner = mode === "practice" ? "ops" as const : "learner" as const;
  const nearTermNeedBps = Math.ceil((draft.nearTermNeed / draft.portfolioAmount) * BASIS_POINTS_TOTAL);
  return {
    referencePortfolioAmount: { value: draft.portfolioAmount, owner: referenceOwner, asOf: now, note: mode === "practice" ? "Fictional practice amount" : "Learner-entered approximate amount" },
    nearTermNeedBps: { value: nearTermNeedBps, owner: referenceOwner, asOf: now, note: "Derived from the stated near-term need and approximate portfolio amount" },
    sleeves: draft.sleeves.map((sleeve) => ({ id: sleeve.id, label: sleeve.id === "ready" ? "Ready" : sleeve.id === "steady" ? "Steady" : "Grow", role: sleeve.id === "ready" ? "liquidity" : sleeve.id === "steady" ? "stability" : "growth", owner: "learner" as const, minBps: sleeve.minBps, targetBps: sleeve.targetBps, maxBps: sleeve.maxBps })),
    stressScenarios: [{ id: "ops-teaching-stress", label: "OPS illustrative teaching stress", losses: draft.sleeves.map((sleeve) => ({ sleeveId: sleeve.id, lossBps: { value: sleeve.assumedLossBps, owner: "ops", asOf: now, note: OPS_STRESS_NOTE } })) }],
    selectedStressScenarioId: "ops-teaching-stress",
    portfolioStressLossBudgetBps: { value: draft.lossBudgetBps, owner: "learner", asOf: now, note: "Learner-owned total policy budget under the selected teaching stress" },
    maximumPortfolioLossContributionBps: { value: draft.candidateMaxContributionBps, owner: "learner", asOf: now, note: draft.candidateMaxContributionBps === null ? "Optional candidate ceiling omitted" : "Maximum portfolio loss contribution permitted from one future candidate" },
    candidatePositionStressLossBps: { value: draft.candidateAssumedLossBps, owner: "learner", asOf: now, note: draft.candidateAssumedLossBps === null ? "Optional candidate ceiling omitted" : "Hypothetical candidate-position loss used only to derive a ceiling" },
    mandateRationale: draft.mandateRationale,
    goalImpactAcknowledged: draft.acknowledged,
    preflight: { status: "passed", passedAt: now },
    transfer: { caseId: "m05-cash-need-perturbation-v1", status: "passed", passedAt: now },
    savedAt: now,
  };
}

function allocationDraftIsCoherent(draft: AllocationDraft, mandate?: MandateRecord): boolean {
  if (!Number.isFinite(draft.portfolioAmount) || draft.portfolioAmount <= 0) return false;
  if (!Number.isFinite(draft.nearTermNeed) || draft.nearTermNeed < 0 || draft.nearTermNeed > draft.portfolioAmount) return false;
  if (mandate) {
    const mandateAmount = Number(mandate.readinessDetails.approximatePortfolioValue);
    const mandateNeed = Number(mandate.nearTermCashNeeds);
    if (
      !Number.isFinite(mandateAmount) ||
      mandateAmount <= 0 ||
      !Number.isFinite(mandateNeed) ||
      mandateNeed < 0 ||
      draft.portfolioAmount !== mandateAmount ||
      draft.nearTermNeed !== mandateNeed
    ) return false;
  }
  if (validateAllocationSleeves(draft.sleeves).length > 0 || !allocationWeightsAreComplete(draft.sleeves)) return false;
  const ready = draft.sleeves.find((sleeve) => sleeve.id === "ready");
  if (!ready) return false;
  const needBps = Math.ceil((draft.nearTermNeed / draft.portfolioAmount) * BASIS_POINTS_TOTAL);
  if (!isLiquidityCovered(ready.targetBps, needBps)) return false;
  const stress = calculatePortfolioStressLossBps(draft.sleeves);
  if (!Number.isSafeInteger(draft.lossBudgetBps) || draft.lossBudgetBps < stress || draft.lossBudgetBps > BASIS_POINTS_TOTAL) return false;
  const ceilingOmitted = draft.candidateMaxContributionBps === null && draft.candidateAssumedLossBps === null;
  const ceilingIncomplete = (draft.candidateMaxContributionBps === null) !== (draft.candidateAssumedLossBps === null);
  if (ceilingIncomplete) return false;
  if (!ceilingOmitted) {
    try {
      const ceiling = calculateCandidateCeilingBps(draft.candidateMaxContributionBps as number, draft.candidateAssumedLossBps as number);
      if (ceiling < 0 || (draft.candidateMaxContributionBps as number) > draft.lossBudgetBps) return false;
    } catch { return false; }
  }
  return draft.mandateRationale.trim().length >= 20 && draft.acknowledged;
}

const primaryButton = "inline-flex min-h-11 items-center justify-center rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-5 py-2.5 text-[14px] font-semibold text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";
