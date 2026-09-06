"use client";

import { useMemo, useState } from "react";
import ValuationJourneyShell, {
  type ValuationStage,
} from "./ValuationJourneyShell";
import ChoiceGroup from "./ChoiceGroup";
import {
  completionState,
  computeDrift,
  evaluateAllMethods,
  FLIGHT_A,
  FLIGHT_B,
  PREREQUISITE_CHECKPOINTS,
  readinessGaps,
  totalDeviationBps,
  WORKED_SCENARIO,
  type FlightScenario,
  type SleeveDrift,
} from "@/lib/operating-plan";
import {
  EMPTY_OPERATING_PLAN,
  EMPTY_SCENARIO_RESPONSE,
  isOperatingPlanComplete,
  useIFProgress,
  type OperatingPlan,
} from "@/lib/if-progress";
import { usePortfolioWorkbench } from "@/lib/use-portfolio-workbench";
import type { WorkbenchCheckpointId } from "@/lib/portfolio-workbench";
import { PRODUCTS } from "@/lib/holdings-slate";

const LESSON_SLUG = "if-pb-13-write-the-rules-and-defend-the-portfolio";

/**
 * Stage-completion behaviour, declared for the typography gate's stage walker.
 * This journey does not auto-advance on save. Every stage completes through its
 * own primary control and no stage requires a correct answer to proceed.
 *
 * Stage 3 works the crash through and then asks for it: it is the first of the
 * nine scenario responses the plan carries, so it completes on two choices
 * rather than on a single Continue.
 *
 * Stage 5 needs a number as well as two choices, so the calendar cadence ships
 * pre-filled at twelve months — a figure the SEC itself names — and the stage is
 * satisfiable without typing. The threshold band is deliberately *not*
 * pre-filled: that number has to be the learner's own, so a learner who chooses
 * it types it.
 *
 * Stage 11 uses this mission's single permitted `ANSWER_KEYS` entry. It is the
 * transfer case, so it legitimately requires correct answers — four real defects
 * found and the decoy left alone — and that is precisely what the one-keyed-stage
 * budget in the forward plan exists for. No other stage is keyed.
 *
 * Eleven stages by design, not by discovery: Mission 12 was built as six,
 * measured over the Screen Budget Rule on two of them, and had to be split
 * afterwards. The split is planned here and measured before Gate E.
 */
const STAGES: readonly ValuationStage[] = [
  {
    label: "Readiness",
    title: "What this mission needs from the other twelve",
    guide:
      "This is the only mission that cannot stand alone. It operates the portfolio the others built, so it needs their decisions — and it will tell you exactly which ones are missing rather than failing quietly.",
    instruction: "Read what is ready and what is not, then continue.",
    next: "Continue to operating policy",
  },
  {
    label: "Policy",
    title: "A plan without rules is a snapshot",
    guide:
      "Every mission so far decided something. This one decides what happens next — when the market falls, when your income stops, when the reason you bought something turns out to be wrong.",
    instruction: "See what an operating policy is for.",
    next: "Continue to the worked scenario",
  },
  {
    label: "Worked",
    title: "One scenario, all the way through",
    guide:
      "Here is the shape every scenario takes: what changed, which rule controls, what it costs, what you do, what else it touches, and what would change your mind.",
    instruction: "Step through the crash, then record what your own plan says.",
    next: "Continue to the control room",
  },
  {
    label: "Drift",
    title: "Rebalancing control room",
    guide:
      "Your weights have moved. There are three ways to move them back and they cost different amounts, repair different amounts, and are not all available to you.",
    instruction: "Compare the three methods against your own drift.",
    next: "Continue to your rule",
  },
  {
    label: "Rule",
    title: "Write the rebalancing rule",
    guide:
      "The regulator gives you two kinds of trigger and leaves the number to you. This is the number you will have to obey when obeying it feels wrong.",
    instruction: "Choose a trigger, set your number, and pick a default method.",
    next: "Continue to the other rules",
  },
  {
    label: "Rules",
    title: "Money in, money out, and giving up",
    guide:
      "Four more rules: what happens to new money, where withdrawals come from, when you replace a product, and what would tell you the reason you bought it is gone.",
    instruction: "Write all four.",
    next: "Continue to review",
  },
  {
    label: "Review",
    title: "When you are allowed to change your mind",
    guide:
      "This is the one governance element that matters for someone investing alone. It is what stops a policy being rewritten in the middle of a crash to justify a decision already made.",
    instruction: "Write the review process.",
    next: "Continue to your plan",
  },
  {
    label: "Your plan",
    title: "Twelve missions, one document",
    guide:
      "Nothing here asks you a question you have already answered. It compiles — and where something is missing, it says which mission holds it.",
    instruction: "Read the compiled plan, then continue.",
    next: "Continue to the flight test",
  },
  {
    label: "Flight I",
    title: "Four things that could happen",
    guide:
      "No hints now. For each one: what changed, which of your rules controls it, and what you do. If none of your rules covers it, say so — that is a finding, not a mistake.",
    instruction: "Answer all four.",
    next: "Continue to the rest",
  },
  {
    label: "Flight II",
    title: "Four more",
    guide:
      "The last four are the ones that test whether a written plan survives a good-sounding idea, rather than a frightening one.",
    instruction: "Answer all four.",
    next: "Continue to the transfer case",
  },
  {
    label: "Defend",
    title: "Someone else's portfolio",
    guide:
      "A stranger's plan, with nothing labelled. Find what is wrong with it, and then save your own.",
    instruction: "Diagnose the case, then save the Operating Plan.",
    next: "Return to Investment Foundations",
  },
];

// ---------------------------------------------------------------------------
// Presentation helpers, matched to the Mission 12 journey.
// ---------------------------------------------------------------------------

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t border-white/8 py-2 sm:flex-row sm:gap-3">
      <dt className="w-full flex-shrink-0 text-[13px] text-slate-400 sm:w-52 sm:text-[15px]">
        {term}
      </dt>
      <dd className="min-w-0 text-[15px] text-white">{children}</dd>
    </div>
  );
}

function TableScroll({ children }: { children: React.ReactNode }) {
  return <div className="-mx-1 overflow-x-auto px-1">{children}</div>;
}

const BTN =
  "min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40";

const FIELD =
  "mt-1.5 min-h-11 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[15px] text-white placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="ops-caption block text-[12px] text-slate-400">{label}</span>
      <textarea
        rows={2}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={FIELD}
      />
    </label>
  );
}

const CHECKPOINT_LABELS: Record<WorkbenchCheckpointId, string> = {
  mandate: "Goal and limits — what the money is for, by when, and the loss you can take",
  beliefs: "Market beliefs — the view the whole plan rests on",
  "bond-risk": "Bond risk policy",
  "required-return": "Required return",
  allocation: "Strategic allocation — the weights and their bands",
  evidence: "Business evidence",
  valuation: "Valuation gate",
  friction: "Friction budget — what any action costs you",
  "evidence-test": "Evidence test — the bar a claim must clear",
  architecture: "Architecture licence — passive core and benchmark",
  timing: "Timing policy — whether deviation is allowed at all",
  holdings: "Holdings list — exact products, costs and source dates",
  policy: "Operating plan",
};

const NEEDED_BY: Partial<Record<WorkbenchCheckpointId, string>> = {
  allocation: "The control room cannot measure drift without your weights.",
  friction: "Rebalancing cost is charged from this budget.",
  holdings: "Your plan records product identity and source dates from here.",
  timing: "A rebalance is not a tactical deviation, and this says which is which.",
  architecture: "The benchmark your result is measured against comes from here.",
  mandate: "Every scenario is judged against the goal you wrote.",
};

// ---------------------------------------------------------------------------
// The nine scenarios live in lib/operating-plan.ts, because the Dossier reads
// the same nine back to the learner and the two must not drift apart.
// ---------------------------------------------------------------------------

type Scenario = FlightScenario;

/** The one scenario stage 3 walks through in full. */
const WORKED = WORKED_SCENARIO;

const RESPONSE_OPTIONS = [
  { id: "no-action" as const, label: "Do nothing", hint: "My plan already covers this." },
  { id: "act" as const, label: "Act", hint: "My plan tells me to do something specific." },
  { id: "review" as const, label: "Review", hint: "This needs a decision my plan does not make." },
];

// ---------------------------------------------------------------------------

export default function OperatingPlanJourney() {
  const { frictionBudget, holdingsSlate, operatingPlan, saveOperatingPlan } =
    useIFProgress();
  const { activeCase, activeMode } = usePortfolioWorkbench();

  const [plan, setPlan] = useState<OperatingPlan>({
    ...EMPTY_OPERATING_PLAN,
    rebalanceRule: {
      ...EMPTY_OPERATING_PLAN.rebalanceRule,
      // Twelve months is the SEC's own example ("every six or twelve months"),
      // so it is a sourced starting point rather than an OPS suggestion. The
      // band stays at zero because IG-7 leaves that number to the investor.
      cadenceMonths: 12,
    },
  });
  const [caseFindings, setCaseFindings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const set = (patch: Partial<OperatingPlan>) => setPlan({ ...plan, ...patch });

  const practiceCase = activeMode !== "personal";

  const gaps = useMemo(() => {
    const states = Object.fromEntries(
      PREREQUISITE_CHECKPOINTS.map((id) => [
        id,
        activeCase?.checkpoints?.[id]?.status ?? "empty",
      ]),
    );
    return readinessGaps(states);
  }, [activeCase]);

  /**
   * Illustrative current weights. The learner's targets and bands are real —
   * they come from Mission 5 — but OPS does not hold live balances, so the
   * drift shown is a worked illustration and is labelled as one on the page.
   */
  const drift: SleeveDrift[] = useMemo(() => {
    const sleeves = activeCase?.allocation?.sleeves ?? [];
    if (sleeves.length === 0) return [];
    const actual: Record<string, number> = {};
    sleeves.forEach((s, i) => {
      const nudge = i === 0 ? 800 : i === 1 ? -600 : -200;
      actual[s.id] = Math.max(0, s.targetBps + nudge);
    });
    return computeDrift(sleeves, actual);
  }, [activeCase]);

  const outcomes = useMemo(
    () =>
      evaluateAllMethods({
        drift,
        annualFrictionDragBps: Math.round(
          (frictionBudget?.estimatedAnnualDrag ?? 0) * 100,
        ),
        newMoneyBps: 400,
        periodicFlowBps: 200,
      }),
    [drift, frictionBudget],
  );

  const completion = useMemo(
    () =>
      completionState({
        mode: activeMode === "personal" ? "personal" : "practice",
        gaps,
        reviewProcessWritten: plan.reviewProcess.trim().length > 0,
        rebalanceRuleWritten: Boolean(
          plan.rebalanceRule.method &&
            (plan.rebalanceRule.bandBps > 0 || plan.rebalanceRule.cadenceMonths > 0),
        ),
        transferCasePassed: plan.transferCasePassed,
        criticalFailures: [],
        readinessBlockersResolved: gaps.length === 0,
      }),
    [activeMode, gaps, plan],
  );

  const answerScenario = (id: string, patch: Partial<typeof EMPTY_SCENARIO_RESPONSE>) =>
    set({
      scenarioResponses: {
        ...plan.scenarioResponses,
        [id]: { ...EMPTY_SCENARIO_RESPONSE, ...plan.scenarioResponses[id], ...patch },
      },
    });

  const policyOptions = useMemo(() => {
    const opts = [
      { id: "rebalance", label: "My rebalancing rule", hint: plan.rebalanceRule.method || "not written yet" },
      { id: "withdrawal", label: "My withdrawal rule", hint: plan.withdrawalRule || "not written yet" },
      { id: "thesis", label: "My thesis-break rule", hint: plan.thesisBreakRule || "not written yet" },
      { id: "timing", label: "My timing policy", hint: "from Mission 11" },
      { id: "none", label: "Nothing I have written covers this", hint: "A finding, not a mistake." },
    ];
    return opts;
  }, [plan]);

  /**
   * The two questions every scenario asks, without the title and prompt around
   * them. Split out because the worked crash states its own situation at length
   * in stage 3: repeating the heading underneath the walkthrough read as a
   * second, different scenario rather than the same one.
   */
  const scenarioAnswers = (s: Scenario) => {
    const r = plan.scenarioResponses[s.id] ?? EMPTY_SCENARIO_RESPONSE;
    return (
      <>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ChoiceGroup
            label={`${s.title} — what do you do?`}
            value={r.response}
            onChange={(response) => answerScenario(s.id, { response })}
            options={RESPONSE_OPTIONS}
          />
          <ChoiceGroup
            label={`${s.title} — which rule controls?`}
            value={r.controllingPolicy}
            onChange={(controllingPolicy) =>
              answerScenario(s.id, {
                controllingPolicy,
                policySilent: controllingPolicy === "none",
              })
            }
            options={policyOptions}
          />
        </div>
        {r.policySilent ? (
          <p className="mt-3 rounded-xl border border-accent-amber/40 bg-accent-amber/10 p-4 text-[15px] leading-7 text-white">
            Your plan is silent here. That is the most useful thing this exercise
            can tell you — go back and write the rule while nothing is happening.
          </p>
        ) : null}
      </>
    );
  };

  const scenarioCard = (s: Scenario) => (
    <div key={s.id} className="ops-definition-card p-5">
      <h3 className="ops-body-strong text-[16px] text-white">{s.title}</h3>
      <p className="mt-1 text-[15px] leading-7 text-slate-300">{s.prompt}</p>
      {scenarioAnswers(s)}
    </div>
  );

  const allAnswered = (list: Scenario[]) =>
    list.every((s) => {
      const r = plan.scenarioResponses[s.id];
      return r && r.response !== "" && r.controllingPolicy !== "";
    });

  const renderStage = (stage: number, onComplete: () => void) => {
    // ---- 0 readiness ----------------------------------------------------
    if (stage === 0) {
      return (
        <div className="space-y-4">
          <div className="ops-definition-card p-5">
            {/*
             * The practice case is a separate sandbox and the checkpoints are
             * written by the learner's own missions, so a practice run shows all
             * twelve outstanding however much work has been done. Reporting that
             * as "12 of 12 need attention" reads as a failure the learner cannot
             * clear, when nothing here is required of them: Practice-complete
             * does not consider the gaps at all. The table still shows the real
             * state, because hiding it would be the opposite mistake.
             */}
            <h3 className="ops-body-strong text-[16px] text-white">
              {practiceCase
                ? "No checkpoints are required in the practice case"
                : gaps.length === 0
                  ? "All twelve checkpoints are current"
                  : `${gaps.length} of 12 checkpoints need attention`}
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-slate-300">
              {practiceCase
                ? "You are working a practice case, which finishes at Practice-complete and asks nothing of the list below. The table shows where your own portfolio stands, so you can see what an operable plan would need."
                : "You can work through this mission either way. What changes is the state you finish in: a practice plan needs nothing from the list, a plan you could actually operate needs all of it."}
            </p>
            <TableScroll>
              <table className="mt-3 w-full min-w-[30rem] text-left text-[14px]">
                <caption className="sr-only">Checkpoint readiness</caption>
                <thead className="text-slate-400">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-normal">Checkpoint</th>
                    <th scope="col" className="py-2 pr-3 font-normal">State</th>
                    <th scope="col" className="py-2 font-normal">Why this mission needs it</th>
                  </tr>
                </thead>
                <tbody>
                  {PREREQUISITE_CHECKPOINTS.map((id) => {
                    const gap = gaps.find((g) => g.id === id);
                    return (
                      <tr key={id} className="border-t border-white/8">
                        <td className="py-2 pr-3 text-white">{CHECKPOINT_LABELS[id]}</td>
                        <td className="py-2 pr-3 text-slate-300">
                          {gap ? gap.status : "coherent"}
                        </td>
                        <td className="py-2 text-slate-400">{NEEDED_BY[id] ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScroll>
          </div>
          <button type="button" onClick={onComplete} className={BTN}>
            Continue to operating policy
          </button>
        </div>
      );
    }

    // ---- 1 what an operating policy is ----------------------------------
    if (stage === 1) {
      return (
        <div className="space-y-4">
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              An operating policy is what you do next
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-slate-300">
              Damodaran opens the course by saying a philosophy is{" "}
              <em>&ldquo;a set of core beliefs that you can go back to in order to
              generate new strategies when old ones do not work.&rdquo;</em> Without
              one, he says, you switch from strategy to strategy — paying
              transaction costs and taxes each time — and end up holding something
              that does not suit you.
            </p>
            <p className="mt-2 text-[15px] leading-7 text-slate-300">
              Brown and Van Harlow measured it across several thousand funds from
              1991 to 2000: the ones that switched styles had{" "}
              <strong className="text-white">higher expenses and lower returns</strong>{" "}
              than the ones that stayed consistent.
            </p>
            <p className="mt-2 text-[14px] leading-6 text-slate-400">
              Damodaran, Sessions 1 and 36. Historical, and cited as a mechanism
              rather than as a rate you should expect today.
            </p>
          </div>
          <button type="button" onClick={onComplete} className={BTN}>
            Continue to the worked scenario
          </button>
        </div>
      );
    }

    // ---- 2 worked scenario ----------------------------------------------
    if (stage === 2) {
      return (
        <div className="space-y-4">
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">{WORKED.title}</h3>
            <p className="mt-1 text-[15px] leading-7 text-slate-300">{WORKED.prompt}</p>
            <dl className="mt-3">
              <Row term="What changed">
                Prices. Not the businesses, and not your income.
              </Row>
              <Row term="Which rule controls">
                Your timing policy, from Mission 11. A fall is not a signal unless
                you wrote one.
              </Row>
              <Row term="What it costs">
                Selling now converts a paper loss into a realised one and pays
                friction from your Mission 8 budget in both directions.
              </Row>
              <Row term="Action">
                Usually none — but this is where a stop-loss order tempts people.
              </Row>
              <Row term="Downstream">
                None, if you do nothing. Selling would invalidate the slate, the
                overlap figure and the allocation at once.
              </Row>
              <Row term="Would change if">
                Your income stopped, or you needed the money within your stated
                horizon. Those are different scenarios, and you answer them later.
              </Row>
            </dl>
          </div>
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              A stop order is not protection
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-slate-300">
              The SEC&rsquo;s own description:{" "}
              <strong className="text-white">
                a stop order becomes a market order once the stop price is reached
              </strong>
              . A market order has no price guarantee, and in fast markets the
              execution price &ldquo;often deviates from the last-traded price&rdquo;.
              So the instrument people reach for when frightened turns into the
              order type with the least protection, exactly when prices move fastest.
            </p>
            <p className="mt-2 text-[14px] leading-6 text-slate-400">
              A stop <em>rule</em> in your timing policy is a condition you check. A
              stop <em>order</em> is a standing instruction to a broker. They are not
              the same thing and this mission never lets them share a word.
            </p>
          </div>

          {/*
           * The crash is the first of the nine responses the plan carries,
           * so it is recorded here rather than only demonstrated. Working it
           * through and never asking for it left the flight test collecting
           * eight of nine — which the completion gate reads as unfinished, and
           * no learner could reach the save.
           *
           * Asked after the walkthrough, not before: the shape has to be shown
           * once before it can be used unaided, and the answer is still the
           * learner's, because their timing policy is the one they wrote.
           */}
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              Now record what your own plan says
            </h3>
            <p className="mt-1 text-[15px] leading-7 text-slate-300">
              The walkthrough above is the shape, not automatically your answer.
              The timing policy it points at is the one you wrote in Mission 11,
              and a plan that says nothing here is worth finding out about now
              rather than during the fall.
            </p>
            {scenarioAnswers(WORKED)}
          </div>

          <button
            type="button"
            disabled={!allAnswered([WORKED])}
            onClick={onComplete}
            className={BTN}
          >
            {allAnswered([WORKED])
              ? "Continue to the control room"
              : "Record your response"}
          </button>
        </div>
      );
    }

    // ---- 3 control room --------------------------------------------------
    if (stage === 3) {
      return (
        <div className="space-y-4">
          {drift.length === 0 ? (
            <div className="ops-definition-card p-5">
              <h3 className="ops-body-strong text-[16px] text-white">
                No allocation saved yet
              </h3>
              <p className="mt-2 text-[15px] leading-7 text-slate-300">
                Drift is measured against the weights and bands you set in Mission
                5. Without them there is nothing to measure. Finish that mission
                and this room fills itself in.
              </p>
            </div>
          ) : (
            <>
              <div className="ops-definition-card p-5">
                <h3 className="ops-body-strong text-[16px] text-white">
                  Your drift, against your own bands
                </h3>
                <TableScroll>
                  <table className="mt-3 w-full min-w-[30rem] text-left text-[14px]">
                    <caption className="sr-only">Slice drift</caption>
                    <thead className="text-slate-400">
                      <tr>
                        <th scope="col" className="py-2 pr-3 font-normal">Slice</th>
                        <th scope="col" className="py-2 pr-3 text-right font-normal">Target</th>
                        <th scope="col" className="py-2 pr-3 text-right font-normal">Now</th>
                        <th scope="col" className="py-2 pr-3 text-right font-normal">Band</th>
                        <th scope="col" className="py-2 text-right font-normal">In band?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drift.map((d) => (
                        <tr key={d.id} className="border-t border-white/8">
                          <td className="py-2 pr-3 text-white">{d.label}</td>
                          <td className="py-2 pr-3 text-right tabular-nums text-slate-300">
                            {(d.targetBps / 100).toFixed(1)}%
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums text-white">
                            {(d.actualBps / 100).toFixed(1)}%
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums text-slate-400">
                            {(d.minBps / 100).toFixed(0)}–{(d.maxBps / 100).toFixed(0)}%
                          </td>
                          <td className="py-2 text-right text-slate-300">
                            {d.withinBand ? "yes" : "no"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScroll>
                <p className="mt-3 text-[13px] leading-6 text-slate-400">
                  Total deviation{" "}
                  <span className="tabular-nums text-white">
                    {(totalDeviationBps(drift) / 100).toFixed(1)}%
                  </span>
                  . A slice inside its own band is not drifted, however far it sits
                  from target — that is what a band is for. Current weights here are
                  an illustration: OPS holds your targets and bands, not your balances.
                </p>
              </div>

              <div className="ops-definition-card p-5">
                <h3 className="ops-body-strong text-[16px] text-white">
                  Three ways back, and what each costs
                </h3>
                <TableScroll>
                  <table className="mt-3 w-full min-w-[34rem] text-left text-[14px]">
                    <caption className="sr-only">Rebalancing methods compared</caption>
                    <thead className="text-slate-400">
                      <tr>
                        <th scope="col" className="py-2 pr-3 font-normal">Method</th>
                        <th scope="col" className="py-2 pr-3 text-right font-normal">Repairs</th>
                        <th scope="col" className="py-2 pr-3 text-right font-normal">Left over</th>
                        <th scope="col" className="py-2 pr-3 text-right font-normal">Friction</th>
                        <th scope="col" className="py-2 pr-3 font-normal">Can realise gains</th>
                        <th scope="col" className="py-2 font-normal">Needs new money</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outcomes.map((o) => (
                        <tr key={o.method} className="border-t border-white/8">
                          <td className="py-2 pr-3 text-white">
                            {o.method === "redirect-flows"
                              ? "Redirect contributions"
                              : o.method === "new-money"
                                ? "Add new money"
                                : "Sell and buy"}
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums text-slate-300">
                            {(o.repairedBps / 100).toFixed(1)}%
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums text-slate-300">
                            {(o.remainingDeviationBps / 100).toFixed(1)}%
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums text-white">
                            {o.frictionBps.toFixed(2)} bps
                          </td>
                          <td className="py-2 pr-3 text-slate-300">
                            {o.mayRealiseGains ? "yes" : "no"}
                          </td>
                          <td className="py-2 text-slate-300">
                            {o.requiresNewMoney ? "yes" : "no"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScroll>
                <p className="mt-3 text-[14px] leading-6 text-slate-300">
                  The cheapest method repairs the least, and cannot run at all if you
                  have stopped contributing. The one that repairs fully is the only
                  one that can realise a gain. {""}<strong className="text-white">No method is best</strong> — the trade-off
                  is the decision, and it is yours.
                </p>
                <p className="mt-2 text-[13px] leading-6 text-slate-400">
                  Methods from Investor.gov. Friction charged from your Mission 8
                  budget. Tax flags are directional only — nothing here calculates
                  what you would owe.
                </p>
              </div>
            </>
          )}
          <button type="button" onClick={onComplete} className={BTN}>
            Continue to your rule
          </button>
        </div>
      );
    }

    // ---- 4 rebalance rule -------------------------------------------------
    if (stage === 4) {
      const rule = plan.rebalanceRule;
      const ready =
        Boolean(rule.method) &&
        ((rule.trigger === "calendar" && rule.cadenceMonths > 0) ||
          (rule.trigger === "threshold" && rule.bandBps > 0));
      return (
        <div className="space-y-4">
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">What triggers a rebalance</h3>
            <ChoiceGroup
              label="Rebalance trigger"
              className="mt-3 grid gap-2 sm:grid-cols-2"
              value={rule.trigger}
              onChange={(trigger) => set({ rebalanceRule: { ...rule, trigger } })}
              options={[
                { id: "calendar" as const, label: "On a schedule", hint: "The calendar reminds you." },
                { id: "threshold" as const, label: "When a band breaks", hint: "Your holdings tell you." },
              ]}
            />
            {rule.trigger === "calendar" ? (
              <label className="mt-3 block">
                <span className="ops-caption block text-[12px] text-slate-400">
                  Months between reviews
                </span>
                <input
                  type="number"
                  min={1}
                  value={rule.cadenceMonths || ""}
                  onChange={(e) =>
                    set({ rebalanceRule: { ...rule, cadenceMonths: Number(e.target.value) || 0 } })
                  }
                  className={FIELD}
                />
                <span className="mt-1 block text-[13px] text-slate-400">
                  Starts at twelve months because the SEC names six or twelve as
                  common intervals. Change it to whatever you will actually keep to.
                </span>
              </label>
            ) : null}
            {rule.trigger === "threshold" ? (
              <label className="mt-3 block">
                <span className="ops-caption block text-[12px] text-slate-400">
                  Band, in percentage points either side of target
                </span>
                <input
                  type="number"
                  min={1}
                  value={rule.bandBps ? rule.bandBps / 100 : ""}
                  onChange={(e) =>
                    set({ rebalanceRule: { ...rule, bandBps: (Number(e.target.value) || 0) * 100 } })
                  }
                  className={FIELD}
                />
              </label>
            ) : null}
            <p className="mt-3 text-[14px] leading-6 text-slate-300">
              The SEC gives you the two trigger types and leaves the number to you —
              a band is one <em>&ldquo;you&rsquo;ve identified in advance&rdquo;</em>.
              Whatever you choose is your policy, not a recommendation, and it is
              recorded as yours.
            </p>
            <p className="mt-2 text-[14px] leading-6 text-slate-400">
              All three sources agree on one thing: infrequent works better. The SEC
              says rebalancing &ldquo;tends to work best when done on a relatively
              infrequent basis&rdquo;; Damodaran finds frozen portfolios beat the
              funds that traded them, and that trading raises the tax bill.
            </p>
          </div>
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">Default method</h3>
            <ChoiceGroup
              label="Default rebalancing method"
              className="mt-3 space-y-2"
              value={rule.method}
              onChange={(m) => set({ rebalanceRule: { ...rule, method: m } })}
              options={[
                { id: "redirect-flows" as const, label: "Redirect contributions", hint: "No extra trading. Needs ongoing contributions." },
                { id: "new-money" as const, label: "Add new money", hint: "One leg of cost. Needs money to add." },
                { id: "sell-and-buy" as const, label: "Sell and buy", hint: "Repairs fully. Two legs, and can realise a gain." },
              ]}
            />
          </div>
          <button type="button" disabled={!ready} onClick={onComplete} className={BTN}>
            {ready ? "Continue to the other rules" : "Choose a trigger, a number and a method"}
          </button>
        </div>
      );
    }

    // ---- 5 the other four rules -------------------------------------------
    if (stage === 5) {
      const ready =
        plan.contributionRule.trim() &&
        plan.withdrawalRule.trim() &&
        plan.sellReplaceRule.trim() &&
        plan.thesisBreakRule.trim();
      return (
        <div className="space-y-4">
          <div className="ops-definition-card space-y-3 p-5">
            <Field
              label="New money — where does it go?"
              value={plan.contributionRule}
              onChange={(contributionRule) => set({ contributionRule })}
              placeholder="Monthly, into whichever slice is furthest below target."
            />
            <Field
              label="Withdrawals — where do they come from?"
              value={plan.withdrawalRule}
              onChange={(withdrawalRule) => set({ withdrawalRule })}
              placeholder="Liquidity first. Never from growth during a drawdown."
            />
            <Field
              label="Replacing a product — when, and with what?"
              value={plan.sellReplaceRule}
              onChange={(sellReplaceRule) => set({ sellReplaceRule })}
              placeholder="Only for the same exposure at a lower total cost, and only outside a drawdown."
            />
            <Field
              label="Thesis break — what would tell you the reason you bought is gone?"
              value={plan.thesisBreakRule}
              onChange={(thesisBreakRule) => set({ thesisBreakRule })}
              placeholder="The fund changes its index, or its cost rises above what I accepted."
            />
          </div>
          <p className="text-[14px] leading-6 text-slate-400">
            Damodaran&rsquo;s condition for abandoning a position you wrote down
            yourself: it is &ldquo;foolhardy to stay consistent as the evidence
            accumulates against the philosophy&rdquo;. The thesis-break rule is where
            you say, in advance, what that evidence would look like.
          </p>
          <button type="button" disabled={!ready} onClick={onComplete} className={BTN}>
            {ready ? "Continue to review" : "Write all four rules"}
          </button>
        </div>
      );
    }

    // ---- 6 review process --------------------------------------------------
    if (stage === 6) {
      const ready = plan.reviewProcess.trim().length > 0;
      return (
        <div className="space-y-4">
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              When you are allowed to change this
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-slate-300">
              The CFA&rsquo;s IPS structure has a governance section built for
              institutions — who decides, who executes, who hires advisers. Investing
              alone, you are all of those. One element still matters more for you
              than it does for them: the process for reviewing and updating this
              document.
            </p>
            <p className="mt-2 text-[15px] leading-7 text-slate-300">
              It is what stops a policy being quietly rewritten in the middle of a
              crash to justify a decision you have already made.
            </p>
            <div className="mt-3">
              <Field
                label="Review process — when do you revisit this, and when do you refuse to?"
                value={plan.reviewProcess}
                onChange={(reviewProcess) => set({ reviewProcess })}
                placeholder="Every January, and after any life change. Never during a drawdown, and never within a week of a decision I want to justify."
              />
            </div>
          </div>
          <button type="button" disabled={!ready} onClick={onComplete} className={BTN}>
            {ready ? "Continue to your plan" : "Write the review process"}
          </button>
        </div>
      );
    }

    // ---- 7 compile ---------------------------------------------------------
    if (stage === 7) {
      const slateLines = holdingsSlate?.lines?.filter((l) => l.targetWeightPct > 0) ?? [];
      return (
        <div className="space-y-4">
          <div className="ops-definition-card p-5">
            <div className="ops-caption text-[12px] text-accent-amber">
              Compiled from twelve missions — nothing here re-asks
            </div>
            <h3 className="ops-body-strong mt-1 text-[16px] text-white">
              Operating Plan and Investment Policy Statement
            </h3>
            <dl className="mt-3">
              <Row term="Mode">
                {activeMode === "personal" ? "Personal" : "Practice case"}
              </Row>
              <Row term="Strategic allocation">
                {drift.length > 0
                  ? drift.map((d) => `${d.label} ${(d.targetBps / 100).toFixed(0)}%`).join(" · ")
                  : "Missing — Mission 5 holds this"}
              </Row>
              <Row term="Products">
                {slateLines.length > 0
                  ? slateLines
                      .map((l) => `${l.ticker} (${l.classId})`)
                      .join(" · ")
                  : "Missing — Mission 12 holds this"}
              </Row>
              <Row term="Holdings as of">
                {slateLines.length > 0
                  ? [...new Set(slateLines.map((l) => PRODUCTS[l.ticker]?.holdings.asOf).filter(Boolean))].join(" and ")
                  : "—"}
              </Row>
              <Row term="Rebalancing rule">
                {plan.rebalanceRule.trigger === "calendar"
                  ? `Every ${plan.rebalanceRule.cadenceMonths} months`
                  : plan.rebalanceRule.trigger === "threshold"
                    ? `When a slice moves ${(plan.rebalanceRule.bandBps / 100).toFixed(0)} points from target`
                    : "Not written"}
                {plan.rebalanceRule.method ? `, using ${plan.rebalanceRule.method.replace(/-/g, " ")}` : ""}
              </Row>
              <Row term="New money">{plan.contributionRule || "—"}</Row>
              <Row term="Withdrawals">{plan.withdrawalRule || "—"}</Row>
              <Row term="Replacement">{plan.sellReplaceRule || "—"}</Row>
              <Row term="Thesis break">{plan.thesisBreakRule || "—"}</Row>
              <Row term="Review">{plan.reviewProcess || "—"}</Row>
              <Row term="State">
                {completion === "execute-ready"
                  ? "Execute-ready"
                  : completion === "practice-complete"
                    ? "Practice-complete"
                    : "Incomplete"}
              </Row>
            </dl>
            <p className="mt-3 text-[14px] leading-6 text-slate-300">
              Neither state is a recommendation, and neither is authorization to
              trade. Execute-ready means your own document is coherent and current —
              it says nothing about whether the plan is a good one.
            </p>
          </div>
          <button type="button" onClick={onComplete} className={BTN}>
            Continue to the flight test
          </button>
        </div>
      );
    }

    // ---- 8 and 9 flight scenarios ------------------------------------------
    if (stage === 8 || stage === 9) {
      const list = stage === 8 ? FLIGHT_A : FLIGHT_B;
      const ready = allAnswered(list);
      return (
        <div className="space-y-4">
          {list.map(scenarioCard)}
          <button type="button" disabled={!ready} onClick={onComplete} className={BTN}>
            {ready
              ? stage === 8
                ? "Continue to the rest"
                : "Continue to the transfer case"
              : "Answer all four"}
          </button>
        </div>
      );
    }

    // ---- 10 transfer case and save ------------------------------------------
    const CASE_DEFECTS = [
      { id: "weights", label: "The slice weights total 104%", real: true },
      { id: "liquidity", label: "Next year’s tuition sits in the growth slice", real: true },
      { id: "identity", label: "The plan names a ticker but no share class", real: true },
      { id: "stale", label: "The overlap figure carries no as-of date", real: true },
      { id: "fees", label: "One fund charges 0.03% rather than 0.02%", real: false },
    ];
    const found = CASE_DEFECTS.filter((d) => caseFindings[d.id] === "defect");
    const realFound = found.filter((d) => d.real).length;
    const falsePositives = found.filter((d) => !d.real).length;
    const casePassed = realFound === 4 && falsePositives === 0;
    const ready = isOperatingPlanComplete({
      ...plan,
      transferCasePassed: casePassed,
      updatedAt: "x",
      mode: activeMode === "personal" ? "personal" : "practice",
    });

    return (
      <div className="space-y-4">
        <div className="ops-definition-card p-5">
          <h3 className="ops-body-strong text-[16px] text-white">
            A stranger&rsquo;s plan
          </h3>
          <p className="mt-1 text-[15px] leading-7 text-slate-300">
            Saving for a house in eighteen months. Nothing below is labelled, and not
            everything listed is wrong.
          </p>
          <div className="mt-3 space-y-2">
            {CASE_DEFECTS.map((d) => (
              <ChoiceGroup
                key={d.id}
                label={d.label}
                className="grid gap-2 sm:grid-cols-2"
                value={caseFindings[d.id] ?? ""}
                onChange={(v) => setCaseFindings({ ...caseFindings, [d.id]: v })}
                options={[
                  { id: "defect" as const, label: `Problem — ${d.label}` },
                  { id: "fine" as const, label: `Not a problem — ${d.label}` },
                ]}
              />
            ))}
          </div>
          {found.length > 0 ? (
            <p className="mt-3 text-[14px] leading-6 text-slate-300">
              Found {realFound} of 4 real problems
              {falsePositives > 0 ? `, and flagged ${falsePositives} that is not one` : ""}.
            </p>
          ) : null}
        </div>

        <p className="text-[13px] leading-6 text-slate-400">
          Saved in this browser. Educational material, not investment advice, and not
          permission to trade.
        </p>

        <button
          type="button"
          disabled={saved || !ready}
          onClick={() => {
            saveOperatingPlan({
              ...plan,
              mode: activeMode === "personal" ? "personal" : "practice",
              transferCasePassed: casePassed,
            });
            setSaved(true);
          }}
          className={BTN}
        >
          {saved ? "Operating Plan saved ✓" : "Save the Operating Plan"}
        </button>
        {!saved && !ready ? (
          <p className="text-[14px] leading-6 text-slate-400">
            Every rule written, all nine scenarios answered, and the case diagnosed
            without a false positive.
          </p>
        ) : null}
      </div>
    );
  };

  const restored = Boolean(operatingPlan?.updatedAt) || saved;

  return (
    <ValuationJourneyShell
      key={restored ? operatingPlan?.updatedAt || "saved" : "fresh"}
      initialCompleted={restored ? STAGES.map(() => true) : undefined}
      initialStage={restored ? STAGES.length - 1 : undefined}
      lessonSlug={LESSON_SLUG}
      ariaLabel="Write the rules and defend the portfolio"
      labLabel="Guided operating lab"
      savedArtifactLabel="operating rules"
      stages={STAGES}
      renderStage={renderStage}
    />
  );
}
