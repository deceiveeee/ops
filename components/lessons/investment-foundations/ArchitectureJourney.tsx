"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIFProgress, type ArchitectureDecision } from "@/lib/if-progress";
import Button from "@/components/ui/Button";
import {
  evaluateEdgeLicense,
  type EdgeProposal,
  type Gate,
  type InheritedContext,
} from "@/lib/architecture-license";
import ValuationJourneyShell, {
  type ValuationStage,
} from "./ValuationJourneyShell";
import {
  ConceptTag,
  DefinitionCard,
  Feedback,
  InteractiveFrame,
  Panel,
  TryItTag,
} from "./shared";

const LESSON_SLUG = "if-8-1-choose-passive-or-prove-an-edge";

const STAGES: readonly ValuationStage[] = [
  {
    label: "Default",
    title: "Start from the architecture that usually wins.",
    guide:
      "Passive is the default because the evidence supports it — not because nobody can win.",
    instruction: "Read the current base rate, then say what it does and does not establish.",
    next: "Test a proposal",
  },
  {
    label: "Model",
    title: "A strategy can beat the market and still lose.",
    guide:
      "Beating the index is a claim about the strategy and the risk model. Then your costs come out.",
    instruction: "Commit to a verdict, then watch risk and your friction both get charged.",
    next: "Judge a streak",
  },
  {
    label: "Streak",
    title: "Four good years is what randomness looks like.",
    guide:
      "Before calling a record skill, find out what that record looks like when nothing is going on.",
    instruction: "Predict where a top-quartile fund lands next, then meet the null.",
    next: "Build the licence",
  },
  {
    label: "Licence",
    title: "Take one claim apart.",
    guide:
      "One question at a time, each with an example. Go back any time; the verdict comes last.",
    instruction: "Answer each question, then read the verdict.",
    next: "Face a new proposal",
  },
  {
    label: "Transfer",
    title: "A proposal you have not seen before.",
    guide:
      "No hints. Apply the same licence, and say what would change your mind.",
    instruction: "Decide, then name the evidence that would reverse the decision.",
    next: "Write your decision",
  },
  {
    label: "Decision",
    title: "Set the architecture you will actually run.",
    guide:
      "A fully passive portfolio is a complete answer. An active slice needs every condition met.",
    instruction: "Choose your architecture and save it to your plan.",
    next: "Finish the mission",
  },
];

/* ---------------------------------------------------------------------------
 * Source figures. Every number here is dated, scoped and independently
 * recomputed in docs/lesson-plans/mission-10-architecture.md §4.
 * ------------------------------------------------------------------------- */

/** Morningstar US Active/Passive Barometer, June 2026. Data through 2026-06-30. */
const BASE_RATE = {
  asOf: "30 June 2026",
  allCategoryTenYear: 25,
  largeBlend: {
    startingFunds: 382,
    survivalPct: 62.6,
    successPct: 10.5,
    activeAnnual: 13.9,
    passiveAnnual: 15.2,
  },
  cheapestQuintilePct: 33,
  priciestQuintilePct: 20,
  scope:
    "US open-end funds and ETFs, measured against the average investable passive peer. Success requires surviving the period and beating that peer; it is not risk-adjusted and not after tax.",
};

/** Session 8 quiz Q5, verified: 11% gross, 1% costs, 9% market, 3% risk-free, beta 1.2. */
const MODEL_CLAIM = {
  gross: 11,
  marketReturn: 9,
  riskFree: 3,
  beta: 1.2,
  sourceCosts: 1,
};

const requiredReturn = (beta: number) =>
  MODEL_CLAIM.riskFree + beta * (MODEL_CLAIM.marketReturn - MODEL_CLAIM.riskFree);

const pct = (value: number, digits = 1) => `${value.toFixed(digits)}%`;

const QUARTILES = [
  { id: "first", label: "Top quartile again — the record says it is a good fund" },
  { id: "spread", label: "Any of the four, at about 25% each" },
  { id: "fourth", label: "Bottom quartile — good runs mean-revert" },
] as const;

/**
 * Something to actually test.
 *
 * The learner needs a claim in front of them before they can decompose one. A
 * learner arriving from mission 7 has their own candidate; everyone else gets
 * this. It is written as a story on purpose — pulling the structure out of it is
 * the exercise, so it must not arrive pre-sorted into the fields.
 */
const PRACTICE_CLAIM = {
  title: "The spin-off stub",
  body:
    "When a large company spins off a smaller division, the new shares land in the accounts of funds that never chose them. An index fund tracking the parent's index usually cannot hold the spin-off, so it sells — quickly, and at whatever price it gets, because matching the index matters more to it than the price of one small holding. That forced selling normally finishes within a few months, and analysts start publishing on the new company within a year or so. A friend tells you these spin-offs beat the market by about four points in the year after they list, and suggests you put a fifth of your portfolio into them.",
  note: "A fictional OPS practice case. It is not a recommendation, and the four points is your friend's claim — not a finding.",
};

const TRANSFER_VERDICTS = [
  {
    id: "disable",
    label: "Leave it disabled",
    correct: true,
  },
  { id: "small", label: "Enable it, but at a small weight" },
  { id: "enable", label: "Enable it — the record is strong and the manager is candid" },
] as const;

export default function ArchitectureJourney() {
  const {
    ready,
    valuationRange,
    frictionBudget,
    evidenceChecklist,
    architectureDecision,
    saveArchitectureDecision,
  } = useIFProgress();

  // Stage 1
  const [baseRateRead, setBaseRateRead] = useState<string | null>(null);
  // Stage 2
  const [verdict, setVerdict] = useState<string | null>(null);
  // Stage 3
  const [quartile, setQuartile] = useState<string | null>(null);
  // Stage 4
  const [pocket, setPocket] = useState("");
  const [whoIsWrong, setWhoIsWrong] = useState("");
  const [mechanism, setMechanism] = useState("");
  const [capability, setCapability] = useState("");
  const [claim, setClaim] = useState("");
  const [disconfirming, setDisconfirming] = useState("");
  const [grossEdge, setGrossEdge] = useState("");
  const [allocation, setAllocation] = useState("");
  const [durability, setDurability] = useState("");
  const [thesisBreak, setThesisBreak] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  /**
   * Stage 4 asks one question at a time.
   *
   * It was a single form with eleven fields. That left a novice with no idea
   * what to type, and put 3,672px of content (6,600px at 390px wide) inside a
   * 442px scrolling window — a page-scroll wrapped around a second scroll.
   * Both defects had the same cause: the stage was doing eleven things at once.
   */
  const [questionIndex, setQuestionIndex] = useState(0);
  /**
   * The claim is ~120 words. Open on the first question, where it has to be
   * read; collapsed afterwards, where reprinting it above every question costs
   * more height than the question itself. The learner can reopen it and it
   * stays open, so this is a starting position rather than a lock.
   */
  const [claimOpen, setClaimOpen] = useState(true);
  // Stage 5
  const [transferVerdict, setTransferVerdict] = useState<string | null>(null);
  const [transferReason, setTransferReason] = useState("");
  // Stage 6
  const [mode, setMode] = useState<"passive-only" | "active-sleeve" | null>(null);
  const [coreExposure, setCoreExposure] = useState("");
  const [coreBenchmark, setCoreBenchmark] = useState("");
  const [saved, setSaved] = useState(false);

  /** The learner's own drag from mission 8, or the source's 1% if they have none yet. */
  const frictionPct = frictionBudget.estimatedAnnualDrag
    ? frictionBudget.estimatedAnnualDrag * 100
    : MODEL_CLAIM.sourceCosts;
  const frictionSaved = Boolean(frictionBudget.updatedAt);

  // The model claim, charged for risk and then for this learner's own friction.
  const modelRequired = requiredReturn(MODEL_CLAIM.beta);
  const modelAfterCosts = MODEL_CLAIM.gross - frictionPct;
  const modelAlpha = modelAfterCosts - modelRequired;

  const context: InheritedContext = useMemo(
    () => ({
      frictionPct,
      frictionSaved,
      evidenceDesign: evidenceChecklist.testDesign,
      evidenceHoldout: evidenceChecklist.holdoutRule,
      evidenceSampling: evidenceChecklist.samplingRule,
      // Mission 5's ceiling and stress assumptions are OPS/learner policy, not
      // a regulator threshold. Until the workbench supplies them for this
      // candidate, the lesson's own visible teaching values stand in.
      maxSleevePct: 15,
      assumedSleeveLossPct: 40,
      lossBudgetPct: 6,
      hasValuationRange: Boolean(valuationRange.updatedAt),
    }),
    [
      frictionPct,
      frictionSaved,
      evidenceChecklist.testDesign,
      evidenceChecklist.holdoutRule,
      evidenceChecklist.samplingRule,
      valuationRange.updatedAt,
    ],
  );

  const proposal: EdgeProposal = useMemo(
    () => ({
      replacesExposure: "Part of the growth slice",
      benchmark: coreBenchmark || "Total world equity index, net of fees",
      pocket,
      whoIsWrong,
      correctionMechanism: mechanism,
      horizonMonths: mechanism.trim() ? 12 : 0,
      capability,
      falsifiableClaim: claim,
      disconfirming,
      grossEdgePct: Number(grossEdge) || 0,
      durabilityRisk: durability,
      thesisBreak,
      reviewDate,
      allocationPct: Number(allocation) || 0,
    }),
    [
      coreBenchmark,
      pocket,
      whoIsWrong,
      mechanism,
      capability,
      claim,
      disconfirming,
      grossEdge,
      durability,
      thesisBreak,
      reviewDate,
      allocation,
    ],
  );

  const licence = useMemo(
    () => evaluateEdgeLicense(proposal, context),
    [proposal, context],
  );

  /**
   * One question per step, in the order a claim actually falls apart: what is
   * mispriced, who is wrong, what fixes it, whether you could act, what you are
   * claiming, what would refute it, what it pays, how big, how long it lasts,
   * when you quit, when you check. The final step is the verdict.
   */
  const questions: EdgeQuestion[] = [
    {
      id: "edge-pocket",
      kind: "text",
      label: "Which specific corner of the market is priced wrongly?",
      help: "Name the group of companies and the moment. “Shares are sometimes cheap” is too broad to test.",
      example: "Small companies in the first year after they are spun off from a larger parent.",
      value: pocket,
      set: setPocket,
    },
    {
      id: "edge-who",
      kind: "text",
      label: "Who is selling too cheaply, and why do they do it?",
      help: "Somebody has to be on the other side. If you cannot name them, there is no mispricing to collect.",
      example:
        "Index funds holding the parent. The spin-off is not in their index, so they must sell it whatever the price.",
      value: whoIsWrong,
      set: setWhoIsWrong,
    },
    {
      id: "edge-mechanism",
      kind: "text",
      label: "What pushes the price back up, and how long does that take?",
      help: "A price that is low and stays low forever pays you nothing.",
      example:
        "The forced selling runs out after a few months, and analysts begin covering the company within about a year.",
      value: mechanism,
      set: setMechanism,
    },
    {
      id: "edge-capability",
      kind: "text",
      label: "Why could you act on this when most people do not?",
      help: "Be honest. “I read a lot” is not a capability; being able to wait when others cannot is.",
      example:
        "Spin-offs are announced publicly months ahead, and I can hold for a year without needing the money.",
      value: capability,
      set: setCapability,
    },
    {
      id: "edge-claim",
      kind: "text",
      label: "Write the claim as something a person could check.",
      help: "Put a number and a period on it, so a year from now you could say plainly whether it held.",
      example: "Spin-offs beat the world index by four points over the twelve months after they list.",
      value: claim,
      set: setClaim,
    },
    {
      id: "edge-disconfirming",
      kind: "text",
      label: "What result would show you were wrong?",
      help: "Decide this now. A claim with no way of losing is a belief, not a test.",
      example: "Two years of spin-offs failing to beat the index after my costs.",
      value: disconfirming,
      set: setDisconfirming,
    },
    {
      id: "edge-gross",
      kind: "number",
      label: "How many points a year above the benchmark?",
      help: "Before costs. The claim above says four.",
      value: grossEdge,
      set: setGrossEdge,
      // The consequence belongs beside the input that causes it.
      showsLeakage: true,
    },
    {
      id: "edge-allocation",
      kind: "number",
      label: "How much of the portfolio would it take?",
      help: `Your mission 5 ceiling is ${context.maxSleevePct}%, and at the ${context.assumedSleeveLossPct}% stress assumption your loss budget is ${context.lossBudgetPct} points.`,
      value: allocation,
      set: setAllocation,
    },
    {
      id: "edge-durability",
      kind: "text",
      label: "What happens to this once other people know about it?",
      help: "An edge that is easy to copy gets crowded, and the discount you were collecting disappears.",
      example:
        "More funds run this each year, so the forced-selling discount is smaller than it used to be.",
      value: durability,
      set: setDurability,
    },
    {
      id: "edge-thesis-break",
      kind: "text",
      label: "What would make you close this slice?",
      help: "Not the same as being wrong once. Name the result that ends it.",
      example:
        "Index funds change their rules and stop dumping spin-offs, so the forced selling never happens.",
      value: thesisBreak,
      set: setThesisBreak,
    },
    {
      id: "edge-review",
      kind: "date",
      label: "When will you check this again?",
      help: "Far enough out to be a fair test, close enough that you will not forget.",
      value: reviewDate,
      set: setReviewDate,
    },
  ];

  const totalSteps = questions.length + 1; // questions, then the verdict
  const onVerdictStep = questionIndex >= questions.length;

  const decisionReady =
    mode === "passive-only"
      ? coreExposure.trim().length > 2 && coreBenchmark.trim().length > 2 && Boolean(reviewDate)
      : mode === "active-sleeve" && licence.licensed && coreExposure.trim().length > 2;

  const saveDecision = (onComplete: () => void) => {
    const next: ArchitectureDecision = {
      mode: mode ?? "passive-only",
      coreExposure,
      coreBenchmark,
      baseRate: `${BASE_RATE.allCategoryTenYear}% of active strategies survived and beat their passive peer over ten years`,
      baseRateDate: BASE_RATE.asOf,
      baseRateScope: BASE_RATE.scope,
      pocket: mode === "active-sleeve" ? pocket : "",
      whoIsWrong: mode === "active-sleeve" ? whoIsWrong : "",
      correctionMechanism: mode === "active-sleeve" ? mechanism : "",
      capability: mode === "active-sleeve" ? capability : "",
      falsifiableClaim: mode === "active-sleeve" ? claim : "",
      disconfirming: mode === "active-sleeve" ? disconfirming : "",
      evidenceDesign: mode === "active-sleeve" ? evidenceChecklist.testDesign : "",
      grossEdgePct: mode === "active-sleeve" ? licence.grossEdgePct : 0,
      frictionPct: Number(frictionPct.toFixed(2)),
      netEdgePct: mode === "active-sleeve" ? licence.netEdgePct : 0,
      maxAllocationPct: mode === "active-sleeve" ? Number(allocation) || 0 : 0,
      lossContributionPct: mode === "active-sleeve" ? licence.lossContributionPct : 0,
      durabilityRisk: mode === "active-sleeve" ? durability : "",
      thesisBreak: mode === "active-sleeve" ? thesisBreak : "",
      reviewDate,
      updatedAt: "",
    };
    saveArchitectureDecision(next);
    setSaved(true);
    onComplete();
  };

  const renderStage = (stage: number, onComplete: () => void): ReactNode => {
    switch (stage) {
      /* ---------------------------------------------------------------- 1 */
      case 0:
        return (
          <div className="space-y-6">
            <DefinitionCard term="The two architectures">
              <p className="ops-body text-[15px] text-slate-300">
                <strong className="text-white">Passive</strong> implementation follows a
                defined exposure — you hold the market and accept its return.{" "}
                <strong className="text-white">Active</strong> management chooses or times
                holdings in pursuit of an advantage. A{" "}
                <strong className="text-white">benchmark</strong> is what you are judged
                against, and the honest comparison is an{" "}
                <strong className="text-white">investable passive peer</strong>: a real fund
                with real costs, not an index on paper.
              </p>
            </DefinitionCard>

            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <ConceptTag>Base rate</ConceptTag>
                <span className="text-[13px] text-slate-400">
                  Morningstar, data through {BASE_RATE.asOf}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Metric
                  label="Beat their passive peer over ten years"
                  value={`${BASE_RATE.allCategoryTenYear}%`}
                  tone="amber"
                />
                <Metric
                  label="US large blend success"
                  value={`${BASE_RATE.largeBlend.successPct}%`}
                />
                <Metric
                  label="Of those funds still alive"
                  value={`${BASE_RATE.largeBlend.survivalPct}%`}
                />
              </div>
              <p className="ops-body mt-4 text-[14px] text-slate-400">
                {BASE_RATE.scope} Funds that closed stay in the denominator, so the 25% is
                not flattered by survivors.
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>What it establishes</ConceptTag>
              </div>
              <h3 className="ops-body-strong mt-4 text-[17px] text-white">
                Three in four active strategies lost to a passive peer. What follows?
              </h3>
              <div className="mt-4 grid gap-3">
                {[
                  ["impossible", "Beating the market is impossible"],
                  [
                    "default",
                    "Passive is the right default until you can show a specific reason you are in the 25%",
                  ],
                  ["skill", "One in four managers has genuine skill"],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    selected={baseRateRead === id}
                    onClick={() => {
                      setBaseRateRead(id);
                      if (id === "default") onComplete();
                    }}
                  >
                    {label}
                  </Choice>
                ))}
              </div>
              {baseRateRead && (
                <Feedback status={baseRateRead === "default" ? "correct" : "incorrect"}>
                  {baseRateRead === "default" &&
                    "Correct. A base rate sets the burden of proof, not a verdict. Some strategies did beat their peer, and the rate varies by category — cheap active funds succeeded 33% of the time against 20% for the priciest, though that is an association in this sample, not proof that fees caused it."}
                  {baseRateRead === "impossible" &&
                    "Too strong. A quarter of these strategies did beat their passive peer. The evidence says it is uncommon and hard to identify in advance — not that it cannot happen."}
                  {baseRateRead === "skill" &&
                    "Not established. Success here means surviving and beating the peer, which luck alone would produce for some funds. Separating skill from luck is the next two stages."}
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );

      /* ---------------------------------------------------------------- 2 */
      case 1:
        return (
          <div className="space-y-6">
            <Panel className="border-accent-amber/25 bg-accent-amber/[0.04]">
              <h3 className="ops-body-strong text-[15px] text-white">The proposal</h3>
              <p className="ops-body mt-2 text-[15px] text-slate-300">
                A strategy returned {pct(MODEL_CLAIM.gross, 0)} a year while the market
                returned {pct(MODEL_CLAIM.marketReturn, 0)}. It carried a beta of{" "}
                {MODEL_CLAIM.beta}, and the risk-free rate was{" "}
                {pct(MODEL_CLAIM.riskFree, 0)}.
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Joint hypothesis</ConceptTag>
              </div>
              <h3 className="ops-body-strong mt-4 text-[17px] text-white">
                Two points a year ahead of the market. Did it add value?
              </h3>
              <div className="mt-4 grid gap-3">
                {[
                  ["yes", "Yes — two points a year is a real margin"],
                  ["depends", "It depends on what its risk demanded, and what it cost to run"],
                  ["no", "No — the market always wins"],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    selected={verdict === id}
                    onClick={() => {
                      setVerdict(id);
                      if (id === "depends") onComplete();
                    }}
                  >
                    {label}
                  </Choice>
                ))}
              </div>

              {verdict && (
                <>
                  <div className="mt-6">
                    <LeakageBar
                      gross={MODEL_CLAIM.gross}
                      required={modelRequired}
                      friction={frictionPct}
                      alpha={modelAlpha}
                    />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Metric label="After your costs" value={pct(modelAfterCosts)} />
                    <Metric
                      label="What its risk demanded"
                      value={pct(modelRequired)}
                      hint={`${MODEL_CLAIM.riskFree}% + ${MODEL_CLAIM.beta} × (${MODEL_CLAIM.marketReturn}% − ${MODEL_CLAIM.riskFree}%)`}
                    />
                    <Metric
                      label="Alpha"
                      value={pct(modelAlpha)}
                      tone={modelAlpha < 0 ? "red" : "green"}
                    />
                  </div>
                  <Feedback status={verdict === "depends" ? "correct" : "incorrect"}>
                    {verdict === "depends"
                      ? `Correct, and the answer is no. At a beta of ${MODEL_CLAIM.beta} the strategy had to earn ${pct(modelRequired)} just to justify its risk. After your own ${pct(frictionPct)} friction it kept ${pct(modelAfterCosts)}. Alpha is ${pct(modelAlpha)} — it beat the market and destroyed value. Note this is a joint result: it also depends on the CAPM being the right risk model.`
                      : `Neither. The strategy had to clear ${pct(modelRequired)} to justify a beta of ${MODEL_CLAIM.beta}, and after your ${pct(frictionPct)} friction it kept only ${pct(modelAfterCosts)}. That is ${pct(modelAlpha)} of alpha — beating the index is not the same as adding value.`}
                  </Feedback>
                </>
              )}
            </InteractiveFrame>
          </div>
        );

      /* ---------------------------------------------------------------- 3 */
      case 2:
        return (
          <div className="space-y-6">
            <Panel>
              <h3 className="ops-body-strong text-[15px] text-white">
                A fund has finished in the top quartile four years running.
              </h3>
              <p className="ops-body mt-2 text-[15px] text-slate-300">
                Funds are ranked into four equal groups each year. Suppose, for the moment,
                that performance carries no information at all from one year to the next.
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Null hypothesis</ConceptTag>
              </div>
              <h3 className="ops-body-strong mt-4 text-[17px] text-white">
                Under that assumption, where does it finish next year?
              </h3>
              <div className="mt-4 grid gap-3">
                {QUARTILES.map((option) => (
                  <Choice
                    key={option.id}
                    selected={quartile === option.id}
                    onClick={() => {
                      setQuartile(option.id);
                      if (option.id === "spread") onComplete();
                    }}
                  >
                    {option.label}
                  </Choice>
                ))}
              </div>
              {quartile && (
                <Feedback status={quartile === "spread" ? "correct" : "incorrect"}>
                  {quartile === "spread"
                    ? "Correct. Four equal groups, no continuity: 1 ÷ 4 = 25% for each. That is the number any real persistence claim has to beat. A streak is not evidence by itself — it is also exactly what a run of luck produces, and with thousands of funds some will always have one."
                    : "Under a no-continuity null there are four equal groups, so each has probability 1 ÷ 4 = 25%. The point is not that funds are random — it is that you cannot tell from the streak alone, because a streak is what randomness produces too."}
                </Feedback>
              )}
            </InteractiveFrame>

            <Panel className="border-white/10">
              <p className="ops-body text-[14px] text-slate-400">
                This is a test, not a scoreboard. To claim a manager&rsquo;s record persists,
                you would compare observed transitions against this 25% baseline, and account
                for funds that closed or changed category along the way.
              </p>
            </Panel>
          </div>
        );

      /* ---------------------------------------------------------------- 4 */
      case 3:
        return (
          <div className="space-y-5">
            <ClaimStrip open={claimOpen} onToggle={setClaimOpen} />
            {onVerdictStep ? (
              <VerdictStep
                licence={licence}
                frictionPct={frictionPct}
                onBack={() => setQuestionIndex(questions.length - 1)}
                onContinue={onComplete}
              />
            ) : (
              <QuestionStep
                question={questions[questionIndex]}
                index={questionIndex}
                total={totalSteps}
                remaining={licence.unmet.length}
                leakage={
                  questions[questionIndex].showsLeakage && grossEdge.trim()
                    ? { gross: licence.grossEdgePct, friction: frictionPct, net: licence.netEdgePct }
                    : null
                }
                onBack={questionIndex > 0 ? () => setQuestionIndex(questionIndex - 1) : undefined}
                onNext={() => {
                  if (questionIndex === 0) setClaimOpen(false);
                  setQuestionIndex(questionIndex + 1);
                }}
              />
            )}

            {/* Declining is available from the first question, not only after
                answering eleven of them. */}
            <p className="ops-body text-[13px] text-slate-400">
              A passive core is a complete architecture on its own.{' '}
              <button
                type="button"
                onClick={onComplete}
                className="underline underline-offset-4 hover:text-white"
              >
                Continue with a passive core only
              </button>
            </p>
          </div>
        );
      /* ---------------------------------------------------------------- 5 */
      case 4:
        return (
          <div className="space-y-6">
            <Panel className="border-accent-amber/25 bg-accent-amber/[0.04]">
              <h3 className="ops-body-strong text-[15px] text-white">
                An unfamiliar proposal · no hints
              </h3>
              <p className="ops-body mt-2 text-[15px] text-slate-300">
                A manager has beaten her benchmark in six of the last seven years, by an
                average of 3.1 points a year before fees. She explains that she buys
                high-quality companies when they are unfashionable and waits. Her fund runs a
                1.4% fee, turns over its portfolio twice a year, and has grown from $80m to
                $9bn. She is candid that the last two years were her hardest.
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Independent application</ConceptTag>
              </div>
              <h3 className="ops-body-strong mt-4 text-[17px] text-white">
                Does this clear your licence?
              </h3>
              <div className="mt-4 grid gap-3">
                {TRANSFER_VERDICTS.map((option) => (
                  <Choice
                    key={option.id}
                    selected={transferVerdict === option.id}
                    onClick={() => setTransferVerdict(option.id)}
                  >
                    {option.label}
                  </Choice>
                ))}
              </div>

              {transferVerdict && (
                <>
                  <Feedback status={transferVerdict === "disable" ? "correct" : "incorrect"}>
                    {transferVerdict === "disable"
                      ? "Correct. The record is a streak, not a mechanism: nothing here says which pocket is mispriced, who is wrong, or what corrects it. 3.1 points gross against a 1.4% fee and twice-yearly turnover leaves very little, and growing from $80m to $9bn is exactly the capacity problem that closes this kind of edge. Being candid is a virtue, not evidence."
                      : "Not yet. Count what is actually here: a record, a story, and a fee. There is no named mispricing, no party on the wrong side, no correction mechanism, and no falsifiable claim. A 3.1-point gross edge against a 1.4% fee and twice-yearly turnover may not survive at all, and the growth from $80m to $9bn attacks the edge directly through capacity."}
                  </Feedback>
                  <div className="mt-5">
                    <TextField
                      id="transfer-reason"
                      label="What evidence would change your decision?"
                      placeholder="Name the specific finding that would move you."
                      value={transferReason}
                      onChange={setTransferReason}
                    />
                  </div>
                  <div className="mt-4">
                    <Button
                      size="md"
                      disabled={transferVerdict !== "disable" || transferReason.trim().length < 20}
                      onClick={onComplete}
                    >
                      Continue
                    </Button>
                  </div>
                </>
              )}
            </InteractiveFrame>
          </div>
        );

      /* ---------------------------------------------------------------- 6 */
      default:
        return (
          <div className="space-y-6">
            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Your architecture</ConceptTag>
              </div>
              <div className="mt-4 grid gap-3">
                <Choice
                  selected={mode === "passive-only"}
                  onClick={() => setMode("passive-only")}
                >
                  Passive core only — I have not proved an edge, and that is my answer
                </Choice>
                <Choice
                  selected={mode === "active-sleeve"}
                  onClick={() => setMode("active-sleeve")}
                >
                  Passive core plus the active slice I licensed
                </Choice>
              </div>

              {mode === "active-sleeve" && !licence.licensed && (
                <Feedback status="incorrect">
                  The slice is not licensed. {licence.unmet.length} condition
                  {licence.unmet.length === 1 ? "" : "s"} remain unmet, so this option cannot
                  be saved. Go back to the licence stage, or choose the passive core.
                </Feedback>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <TextField
                  id="core-exposure"
                  label="What your core holds"
                  placeholder="The exposure, in your own words."
                  value={coreExposure}
                  onChange={setCoreExposure}
                />
                <TextField
                  id="core-benchmark"
                  label="What you will judge it against"
                  placeholder="The benchmark, and why it is the fair one."
                  value={coreBenchmark}
                  onChange={setCoreBenchmark}
                />
              </div>

              {mode === "passive-only" && (
                <div className="mt-4">
                  <label
                    htmlFor="passive-review"
                    className="ops-body-strong block text-[15px] text-white"
                  >
                    Review date
                  </label>
                  <input
                    id="passive-review"
                    type="date"
                    value={reviewDate}
                    onChange={(event) => setReviewDate(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none focus:border-accent-amber/50 sm:max-w-xs"
                  />
                </div>
              )}

              <div className="mt-5">
                <Button
                  size="md"
                  disabled={!decisionReady || saved}
                  onClick={() => saveDecision(onComplete)}
                >
                  {saved ? "Architecture saved ✓" : "Save the architecture decision"}
                </Button>
              </div>

              {saved && (
                <Feedback status="correct">
                  Saved to your plan. You have a written architecture with a benchmark, a
                  dated base rate, and a review date — and if you licensed a slice, the
                  condition that would close it. Mission 11 asks whether you will deviate
                  from this on timing.
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );
    }
  };

  // A saved decision is this lesson's terminal state; restore it so a refresh
  // does not blank seven stages of work. See mission 9's release evidence.
  const restored = ready && Boolean(architectureDecision.updatedAt);

  return (
    <ValuationJourneyShell
      key={restored ? architectureDecision.updatedAt : "fresh"}
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 8.1 architecture and edge journey"
      stages={STAGES}
      renderStage={renderStage}
      labLabel="Guided architecture lab"
      finishHref="/plan"
      finishLabel="See your plan"
      savedArtifactLabel="Architecture and Edge Decision"
      initialCompleted={STAGES.map(() => restored)}
      initialStage={restored ? STAGES.length - 1 : 0}
    />
  );
}

/* ------------------------------------------------------------------ pieces */

type EdgeQuestion = {
  id: string;
  kind: "text" | "number" | "date";
  label: string;
  help: string;
  example?: string;
  value: string;
  set: (value: string) => void;
  /** Show the gross→net bar beside this input, where it is the consequence. */
  showsLeakage?: boolean;
};

/**
 * The claim stays reachable without occupying the stage.
 *
 * It is ~120 words. Printed above every question it would cost more height than
 * the question itself, so it collapses after the learner has read it once.
 */
function ClaimStrip({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: (open: boolean) => void;
}) {
  return (
    <details
      className="group rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] px-4 py-3"
      open={open}
      onToggle={(event) => onToggle((event.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="ops-body-strong cursor-pointer list-none text-[14px] text-white">
        <span className="text-accent-amber">The claim you are testing ·</span>{" "}
        {PRACTICE_CLAIM.title}
        <span className="ops-body ml-2 text-[13px] text-slate-400 group-open:hidden">
          — tap to re-read
        </span>
      </summary>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
        {PRACTICE_CLAIM.body}
      </p>
      <p className="ops-body mt-2 text-[13px] text-slate-400">{PRACTICE_CLAIM.note}</p>
    </details>
  );
}

/** One question, its example, and nothing else competing for attention. */
function QuestionStep({
  question,
  index,
  total,
  remaining,
  leakage,
  onBack,
  onNext,
}: {
  question: EdgeQuestion;
  index: number;
  total: number;
  remaining: number;
  leakage: { gross: number; friction: number; net: number } | null;
  onBack?: () => void;
  onNext: () => void;
}) {
  const answered = question.value.trim().length > 0;

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TryItTag />
        <span className="ops-caption text-[12px] text-accent-amber">
          Question {index + 1} of {total - 1}
        </span>
      </div>

      <h3 className="ops-body-strong mt-4 text-[17px] text-white">{question.label}</h3>
      <p className="ops-body mt-1 text-[13px] text-slate-400">{question.help}</p>

      {question.kind === "text" && (
        <textarea
          id={question.id}
          rows={3}
          value={question.value}
          placeholder="Write your answer here."
          onChange={(event) => question.set(event.target.value)}
          className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-slate-500 focus:border-accent-amber/50"
        />
      )}
      {question.kind === "number" && (
        <input
          id={question.id}
          inputMode="decimal"
          value={question.value}
          placeholder="0.0"
          onChange={(event) => question.set(event.target.value)}
          className="mt-3 w-40 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-[15px] text-white outline-none placeholder:text-slate-500 focus:border-accent-amber/50"
        />
      )}
      {question.kind === "date" && (
        <input
          id={question.id}
          type="date"
          value={question.value}
          onChange={(event) => question.set(event.target.value)}
          className="mt-3 w-full max-w-xs rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-[15px] text-white outline-none focus:border-accent-amber/50"
        />
      )}

      {question.example && (
        <p className="ops-body mt-2 text-[13px] text-slate-500">
          <span className="text-slate-400">For example:</span> {question.example}
        </p>
      )}

      {leakage && (
        <div className="mt-4">
          <LeakageBar
            gross={leakage.gross}
            friction={leakage.friction}
            net={leakage.net}
            compact
          />
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="ops-body text-[13px] text-slate-400">
          {remaining} condition{remaining === 1 ? "" : "s"} still unmet
        </span>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button size="sm" variant="outline" onClick={onBack}>
              ← Back
            </Button>
          )}
          <Button size="sm" disabled={!answered} onClick={onNext}>
            {index === total - 2 ? "See the verdict" : "Next question"}
          </Button>
        </div>
      </div>
    </InteractiveFrame>
  );
}

/** The payoff: every condition, met or not, in one place. */
function VerdictStep({
  licence,
  frictionPct,
  onBack,
  onContinue,
}: {
  licence: ReturnType<typeof evaluateEdgeLicense>;
  frictionPct: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Gross" value={pct(licence.grossEdgePct, 2)} />
        <Metric label="Your friction" value={`−${pct(frictionPct, 2)}`} hint="From mission 8" />
        <Metric
          label="What you keep"
          value={pct(licence.netEdgePct, 2)}
          tone={licence.netEdgePct > 0 ? "green" : "red"}
        />
      </div>
      <SwitchboardStatus
        licence={licence}
        onContinue={onContinue}
        continueLabel="Continue with the slice licensed"
      />
      <Button size="sm" variant="outline" onClick={onBack}>
        ← Back to the questions
      </Button>
    </div>
  );
}

/**
 * The mission's central visual: a claimed edge losing height as risk and the
 * learner's own friction are charged against it.
 *
 * Built with a CSS transition rather than motion/react — the shared shell's
 * motion-library animations were verified inert on 2026-08-14, so the bar
 * cannot depend on that library to convey the change.
 */
function LeakageBar({
  gross,
  required,
  friction,
  alpha,
  net,
  compact,
}: {
  gross: number;
  required?: number;
  friction: number;
  alpha?: number;
  net?: number;
  compact?: boolean;
}) {
  const result = alpha ?? net ?? 0;
  const span = Math.max(gross, 1);
  const widthOf = (value: number) => `${Math.min(100, Math.max(0, (value / span) * 100))}%`;

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <LeakageRow label="Claimed edge" value={gross} width={widthOf(gross)} tone="amber" />
      {typeof required === "number" && (
        <LeakageRow
          label="What its risk demanded"
          value={required}
          width={widthOf(required)}
          tone="slate"
        />
      )}
      <LeakageRow
        label="Your friction"
        value={friction}
        width={widthOf(friction)}
        tone="slate"
      />
      <LeakageRow
        label={typeof alpha === "number" ? "Alpha" : "Net edge"}
        value={result}
        width={widthOf(Math.abs(result))}
        tone={result > 0 ? "green" : "red"}
      />
    </div>
  );
}

function LeakageRow({
  label,
  value,
  width,
  tone,
}: {
  label: string;
  value: number;
  width: string;
  tone: "amber" | "slate" | "green" | "red";
}) {
  const bar = {
    amber: "bg-accent-amber/70",
    slate: "bg-white/25",
    green: "bg-accent-green/70",
    red: "bg-accent-red/70",
  }[tone];

  return (
    <div className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3">
      <span className="ops-body text-[13px] text-slate-400">{label}</span>
      <span className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <span
          className={cn("block h-full rounded-full transition-[width] duration-500", bar)}
          style={{ width }}
        />
      </span>
      <span className="ops-body text-[13px] tabular-nums text-white">
        {value.toFixed(2)}%
      </span>
    </div>
  );
}

/**
 * Names every unmet condition beside a disabled control. Showing only the first
 * failure would let the learner repair one at a time without ever seeing the
 * shape of what a licence requires.
 */
function SwitchboardStatus({
  licence,
  onContinue,
  continueLabel,
}: {
  licence: ReturnType<typeof evaluateEdgeLicense>;
  onContinue: () => void;
  continueLabel: string;
}) {
  const from: Record<Gate["from"], string> = {
    "mission-5": "Mission 5",
    "mission-7": "Mission 7",
    "mission-8": "Mission 8",
    "mission-9": "Mission 9",
    "mission-10": "This mission",
  };

  return (
    <Panel
      className={cn(
        licence.licensed
          ? "border-accent-green/30 bg-accent-green/[0.04]"
          : "border-accent-amber/25 bg-accent-amber/[0.03]",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="ops-body-strong text-[15px] text-white">
          {licence.licensed
            ? "Every condition met — the slice can be licensed"
            : `Slice disabled · ${licence.unmet.length} condition${licence.unmet.length === 1 ? "" : "s"} unmet`}
        </h3>
        <Button size="sm" disabled={!licence.licensed} onClick={onContinue}>
          {continueLabel}
        </Button>
      </div>

      {!licence.licensed && (
        <ul className="mt-4 grid gap-2">
          {licence.unmet.map((gate) => (
            <li
              key={gate.code}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="ops-body-strong text-[14px] text-white">{gate.label}</span>
                <span className="text-[12px] text-slate-400">{from[gate.from]}</span>
              </div>
              <p className="ops-body mt-1 text-[14px] text-slate-400">{gate.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Choice({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-left text-[15px] transition-colors",
        selected
          ? "border-accent-amber/50 bg-accent-amber/10 text-white"
          : "border-white/12 bg-white/[0.02] text-slate-300 hover:border-white/25 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

/**
 * A question, why it is being asked, and what a good answer looks like.
 *
 * The example sits under the box rather than inside it as placeholder text: a
 * placeholder disappears the moment the learner starts typing, which is exactly
 * when they still need it.
 */
function TextField({
  id,
  label,
  help,
  example,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  help?: string;
  example?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="ops-body-strong block text-[15px] text-white">
        {label}
      </label>
      {help && <p className="ops-body mt-1 text-[13px] text-slate-400">{help}</p>}
      <textarea
        id={id}
        rows={2}
        value={value}
        placeholder={placeholder ?? "Write your answer here."}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-slate-500 focus:border-accent-amber/50"
      />
      {example && (
        <p className="ops-body mt-1.5 text-[13px] text-slate-500">
          <span className="text-slate-400">For example:</span> {example}
        </p>
      )}
    </div>
  );
}

function NumberField({
  id,
  label,
  help,
  value,
  onChange,
}: {
  id: string;
  label: string;
  help?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="ops-body-strong block text-[15px] text-white">
        {label}
      </label>
      {help && <p className="ops-body mt-1 text-[13px] text-slate-400">{help}</p>}
      <input
        id={id}
        inputMode="decimal"
        value={value}
        placeholder="0.0"
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-[15px] text-white outline-none placeholder:text-slate-500 focus:border-accent-amber/50"
      />
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "amber" | "green" | "red";
}) {
  const colour = {
    default: "text-white",
    amber: "text-accent-amber",
    green: "text-accent-green",
    red: "text-accent-red",
  }[tone];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
      <div className="ops-body text-[13px] text-slate-400">{label}</div>
      <div className={cn("ops-body-strong mt-1 text-[19px] tabular-nums", colour)}>
        {value}
      </div>
      {hint && <div className="ops-body mt-1 text-[12px] text-slate-500">{hint}</div>}
    </div>
  );
}
