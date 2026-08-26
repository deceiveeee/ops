"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIFProgress, type EvidenceChecklist } from "@/lib/if-progress";
import Button from "@/components/ui/Button";
import ChoiceGroup from "./ChoiceGroup";
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

const LESSON_SLUG = "if-7-1-test-the-claim";

const STAGES: readonly ValuationStage[] = [
  {
    label: "Joint test",
    title: "You are always testing two things at once.",
    guide:
      "To say a strategy earns more than it should, you need a model of what it should earn. So every test of a market-beating claim tests the strategy and that model together.",
    instruction:
      "Read what excess returns can mean, then decide what a positive result actually proves.",
    next: "Pick the yardstick",
  },
  {
    label: "Yardstick",
    title: "Beating the index is not the same as beating the market.",
    guide:
      "A riskier strategy should beat the index — that is what the extra risk is for. The measures below each control for something different, and they can disagree about the same strategy.",
    instruction: "Judge the strategy on raw return first, then on risk-adjusted return.",
    next: "Run an event study",
  },
  {
    label: "Event",
    title: "Some claims are about a moment.",
    guide:
      "If the claim is that something happens around an announcement, you line the announcements up, adjust for market and risk, and look at what the returns do before, on, and after the day.",
    instruction: "Assign a cause to each part of the event window, then check your reading.",
    next: "Run a portfolio study",
  },
  {
    label: "Portfolio",
    title: "Some claims are about a characteristic.",
    guide:
      "If the claim is that cheap, small, or unloved companies do better, you sort firms on that characteristic at the start of the period and watch what the groups earn.",
    instruction: "Work out the spread between the extreme portfolios, then check it.",
    next: "Reach for a regression",
  },
  {
    label: "Regression",
    title: "When the claim has more than one moving part.",
    guide:
      "Portfolios get unwieldy past two or three variables, and they throw away the differences inside each group. A regression keeps both.",
    instruction: "Set the regression up correctly, then read what it does and does not say.",
    next: "Name the sins",
  },
  {
    label: "Sins",
    title: "Most beat-the-market evidence fails on the same few faults.",
    guide:
      "Six of these are fatal and four are quieter. The quiet ones are more dangerous, because a test can pass every statistical check and still be wrong for one of them.",
    instruction: "Choose the sampling design that survives the survivor problem.",
    next: "Write your checklist",
  },
  {
    label: "Checklist",
    title: "Charge the claim for risk and for your own friction.",
    guide:
      "A claim has to clear the return its risk demands, and then it has to clear what trading it costs you. Most claims die on the second charge.",
    instruction: "Set the test, then save the checklist to your dossier.",
    next: "State your belief",
  },
  {
    /*
     * Added by curriculum amendment 1. Mission 2 used to ask a new learner to
     * originate a market belief before anything had given them grounds for one;
     * it now records what they observed, and the belief is written here, once
     * the learner can actually test a claim. The checklist above is the first
     * thing applied to it.
     */
    label: "Belief",
    title: "Now say what you believe, and what would change it.",
    guide:
      "In Mission 2 you recorded what you could observe. Seven missions later you can test a claim, so this is the point where a belief is worth stating - and where naming its falsifier costs you something.",
    instruction: "Choose a position, a reason it might persist, and a falsifier.",
    next: "Finish the mission",
  },
];

/* ── Stage 8: the belief, and the test that would break it ────────────
   Positions follow Session 7's treatment of efficiency as investor- and
   market-specific rather than a blanket binary. Declining to hold one is a
   complete outcome, the way Mission 10 treats a fully passive decision. */

const POSITIONS = [
  {
    id: "passive",
    label: "Prices are hard enough to beat after costs that I will default to a passive core",
    hint: "The base rate, and the course's default.",
  },
  {
    id: "not-exploitable",
    label: "Mispricings exist, but I cannot reliably exploit them after friction",
    hint: "A mispricing is not an edge.",
  },
  {
    id: "pocket",
    label: "There is a specific pocket where an investor like me has an advantage",
    hint: "This one has to survive Mission 10.",
  },
  {
    id: "none",
    label: "I do not hold a defensible position yet",
    hint: "A finding, not indecision.",
  },
];

const PERSISTENCE = [
  { id: "competition", label: "Competition removes most of it, so little is left to take" },
  { id: "uncertainty", label: "The signal is uncertain enough that few investors can hold it" },
  { id: "costs", label: "Costs and taxes consume what the signal produces" },
  { id: "limits", label: "Institutional limits stop large investors from acting on it" },
];

const FALSIFIERS = [
  { id: "sample", label: "It disappears out of sample" },
  { id: "risk", label: "It fails once returns are adjusted for risk" },
  { id: "friction", label: "It does not survive my own friction budget" },
  { id: "mechanism", label: "No correction mechanism can be named for it" },
];

const pct = (v: number, digits = 1) => `${v.toFixed(digits)}%`;

/** Lower only the first character, so a label's own "I" survives. */
const uncap = (t: string) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t);

/* ── Stage 2: the same strategy, judged two ways ──────────────────────
   Source quiz question 2 supplies the return and volatility inputs, but omits
   the risk-free rate from its Sharpe calculation. OPS uses the standard excess-
   return definition and a clearly labelled 3% illustrative risk-free rate. */
const STRATEGY = { label: "The strategy", ret: 12, sd: 30 };
const MARKET = { label: "The market", ret: 10, sd: 20 };
const RISK_FREE_RATE = 3;
const sharpe = (r: number, sd: number) => (r - RISK_FREE_RATE) / sd;

/* ── Stage 3: option-listing event window (historical, 1970s CBOE) ── */
const EVENT_WINDOW = [
  {
    id: "before",
    label: "The ten days before the announcement",
    move: "Prices drift up",
    causes: [
      { id: "insiders", label: "People who already knew are trading on it", correct: true },
      { id: "luck", label: "Nothing — a drift that size is always noise" },
    ],
    note: "A rise before the public announcement is the signature of information leaking, not of the announcement itself.",
  },
  {
    id: "day",
    label: "The announcement day",
    move: "Prices jump",
    causes: [
      { id: "surprise", label: "The news is still a surprise to most of the market", correct: true },
      { id: "priced", label: "The news was fully priced in already" },
    ],
    note: "A jump on the day means the market had not already absorbed it. Fully anticipated news moves nothing.",
  },
  {
    id: "after",
    label: "The ten days after",
    move: "Prices keep drifting up",
    causes: [
      { id: "slow", label: "Investors are adjusting to the news gradually", correct: true },
      { id: "second", label: "A second, unrelated piece of good news arrived" },
    ],
    note: "Drift after the event is the part a learner could actually trade — and the part that most often fails to survive costs.",
  },
] as const;

/* ── Stage 4: low-PE portfolio study, 1988–1992 (dated evidence) ── */
const PE_TABLE = [
  { klass: "Lowest PE", years: ["3.84%", "-0.83%", "2.10%", "6.68%", "0.64%"], avg: 2.61 },
  { klass: "2", years: ["1.75%", "2.26%", "0.19%", "1.09%", "1.13%"], avg: 1.56 },
  { klass: "3", years: ["0.20%", "-3.15%", "-0.20%", "0.17%", "0.12%"], avg: -0.59 },
  { klass: "4", years: ["-1.25%", "-0.94%", "-0.65%", "-1.99%", "-0.48%"], avg: -1.15 },
  { klass: "Highest PE", years: ["-1.74%", "-0.63%", "-1.44%", "-4.06%", "-1.25%"], avg: -1.95 },
] as const;
const SPREAD_ANSWER = "4.56";

/* ── Stage 7: the economic-significance test (quiz question 5) ── */
const CLAIM = { gross: 11, market: 9, riskFree: 3, beta: 1.2 };
const requiredReturn = (beta: number) =>
  CLAIM.riskFree + beta * (CLAIM.market - CLAIM.riskFree);
const breakEvenBeta = (costs: number) =>
  (CLAIM.gross - costs - CLAIM.riskFree) / (CLAIM.market - CLAIM.riskFree);

const BENCHMARKS = [
  { id: "sharpe", label: "Sharpe ratio — excess return per unit of total risk" },
  { id: "information", label: "Information ratio — return over the index per unit of tracking error" },
  { id: "jensen", label: "Jensen's alpha — return above what my beta demands" },
  { id: "treynor", label: "Treynor index — return over the risk-free rate per unit of beta" },
] as const;

const TEST_DESIGNS = [
  { id: "event", label: "Event study — my claim is about a moment" },
  { id: "portfolio", label: "Portfolio study — my claim is about a characteristic" },
  { id: "regression", label: "Regression — my claim has several moving parts" },
] as const;

const HOLDOUTS = [
  { id: "period", label: "A period the idea did not come from" },
  { id: "universe", label: "A market or universe the idea did not come from" },
  { id: "both", label: "Both a different period and a different universe" },
] as const;

const SAMPLINGS = [
  { id: "asof", label: "Form the sample from what existed at the start, failures included" },
  { id: "delisted", label: "As above, and assign delisted companies their actual loss" },
] as const;

export default function EvidenceJourney() {
  const {
    ready,
    frictionBudget,
    evidenceChecklist,
    saveEvidenceChecklist,
    observationNote,
    beliefStatement,
    saveBeliefStatement,
  } = useIFProgress();
  const [position, setPosition] = useState("");
  const [persistence, setPersistence] = useState("");
  const [falsifier, setFalsifier] = useState("");
  const [beliefSaved, setBeliefSaved] = useState(false);

  // Stage 1
  const [jointChoice, setJointChoice] = useState<string | null>(null);
  const [jointChecked, setJointChecked] = useState(false);

  // Stage 2
  const [verdict, setVerdict] = useState<string | null>(null);

  // Stage 3
  const [eventPicks, setEventPicks] = useState<Record<string, string>>({});

  // Stage 4
  const [spread, setSpread] = useState("");
  const [spreadChecked, setSpreadChecked] = useState(false);

  // Stage 5
  const [dependent, setDependent] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);

  // Stage 6
  const [sampling, setSampling] = useState<string | null>(null);

  // Stage 7
  const [benchmark, setBenchmark] = useState<string | null>(null);
  const [design, setDesign] = useState<string | null>(null);
  const [holdout, setHoldout] = useState<string | null>(null);
  const [samplingRule, setSamplingRule] = useState<string | null>(null);
  const [abandon, setAbandon] = useState("");
  const [saved, setSaved] = useState(false);

  /** The learner's own drag from mission 8, or the source's 1% if they have none yet. */
  const ownCosts = frictionBudget.estimatedAnnualDrag
    ? frictionBudget.estimatedAnnualDrag * 100
    : 1;
  const required = useMemo(() => requiredReturn(CLAIM.beta), []);
  const netOfCosts = CLAIM.gross - ownCosts;
  const excess = netOfCosts - required;
  const evenBeta = breakEvenBeta(ownCosts);

  const checklistReady =
    Boolean(benchmark && design && holdout && samplingRule) && abandon.trim().length >= 20;

  const saveChecklist = (onComplete: () => void) => {
    const next: EvidenceChecklist = {
      benchmark: BENCHMARKS.find((b) => b.id === benchmark)?.label ?? "",
      testDesign: TEST_DESIGNS.find((t) => t.id === design)?.label ?? "",
      holdoutRule: HOLDOUTS.find((h) => h.id === holdout)?.label ?? "",
      samplingRule: SAMPLINGS.find((s) => s.id === samplingRule)?.label ?? "",
      hurdleRule: `Clear ${pct(required, 1)} for beta ${CLAIM.beta}, then ${pct(ownCosts, 1)} of friction — ${pct(required + ownCosts, 1)} gross before the claim has earned anything.`,
      abandonRule: abandon.trim(),
      updatedAt: "",
    };
    saveEvidenceChecklist(next);
    setSaved(true);
    onComplete();
  };

  const eventComplete = EVENT_WINDOW.every(
    (w) => eventPicks[w.id] === w.causes.find((c) => "correct" in c && c.correct)?.id,
  );

  const renderStage = (stage: number, onComplete: () => void): ReactNode => {
    switch (stage) {
      case 0:
        return (
          <div className="space-y-6">
            <DefinitionCard term="Excess return">
              The return a strategy earned above what its risk said it should earn. The
              phrase carries a hidden passenger: whatever model decided what it should have
              earned.
            </DefinitionCard>

            <Panel>
              <h3 className="ops-interactive-title text-[18px] text-white">
                Three ways to get a positive result
              </h3>
              <ol className="mt-3 space-y-2">
                {[
                  "The strategy really did beat the market over that period.",
                  "The risk model is the wrong model, so its expected return was too low.",
                  "The risk model is right, but the strategy's risk was mismeasured.",
                ].map((line, index) => (
                  <li key={line} className="flex gap-3 text-[15px] text-slate-200">
                    <span className="tabular-nums text-accent-amber">{index + 1}</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Joint hypothesis</ConceptTag>
              </div>
              <h3 className="ops-body-strong mt-4 text-[17px] text-white">
                A strategy shows excess returns after adjusting for risk with the CAPM. What
                does that establish?
              </h3>
              <div className="mt-4 grid gap-3">
                {[
                  ["beat", "The strategy beat the market during the test period"],
                  ["model", "The CAPM is the wrong model for risk"],
                  ["beta", "The CAPM is right but the beta was misestimated"],
                  ["any", "Any of the above — the test cannot separate them"],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    selected={jointChoice === id}
                    onClick={() => {
                      setJointChoice(id);
                      setJointChecked(false);
                    }}
                  >
                    {label}
                  </Choice>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  size="md"
                  disabled={!jointChoice}
                  onClick={() => {
                    setJointChecked(true);
                    if (jointChoice === "any") onComplete();
                  }}
                >
                  Check the reasoning
                </Button>
              </div>
              {jointChecked && (
                <Feedback status={jointChoice === "any" ? "correct" : "incorrect"}>
                  {jointChoice === "any"
                    ? "Correct. A positive result is consistent with all three, and the test has no way to tell them apart. That is the joint hypothesis problem, and it sits underneath every stage that follows."
                    : "That is one possible explanation, but the test cannot rule the others out. Excess returns measured against a model are evidence about the strategy and the model together."}
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {[STRATEGY, MARKET].map((row) => (
                <Panel key={row.label}>
                  <h3 className="ops-body-strong text-[15px] text-white">{row.label}</h3>
                  <dl className="mt-3 space-y-2">
                    <Row label="Annual return" value={pct(row.ret)} />
                    <Row label="Annual standard deviation" value={pct(row.sd)} />
                  </dl>
                </Panel>
              ))}
            </div>

            <Panel>
              <Row label="Illustrative risk-free rate" value={pct(RISK_FREE_RATE)} />
              <p className="ops-body mt-3 text-[14px] text-slate-400">
                Sharpe compares each investment&apos;s return above the same risk-free rate
                with the volatility it took to earn that excess return.
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Risk adjustment</ConceptTag>
              </div>
              <h3 className="ops-body-strong mt-4 text-[17px] text-white">
                Ten years of this. Did the strategy beat the market?
              </h3>
              <div className="mt-4 grid gap-3">
                {[
                  ["yes", "Yes — 12% against 10%, two points a year ahead"],
                  ["no", "No — it earned less per unit of risk than the index did"],
                  ["same", "It matched the market once you account for risk"],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    selected={verdict === id}
                    onClick={() => {
                      setVerdict(id);
                      if (id === "no") onComplete();
                    }}
                  >
                    {label}
                  </Choice>
                ))}
              </div>
              {verdict && (
                <>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Metric
                      label="Strategy, excess return per unit of risk"
                      value={sharpe(STRATEGY.ret, STRATEGY.sd).toFixed(2)}
                      tone="red"
                    />
                    <Metric
                      label="Market, excess return per unit of risk"
                      value={sharpe(MARKET.ret, MARKET.sd).toFixed(2)}
                      tone="green"
                    />
                  </div>
                  <Feedback status={verdict === "no" ? "correct" : "incorrect"}>
                    {verdict === "no"
                      ? "Correct. Using the same 3% risk-free rate, (12 − 3) ÷ 30 = 0.30 against (10 − 3) ÷ 20 = 0.35. The strategy won on raw return but lost after total risk was charged consistently."
                      : "Compare excess return per unit of risk, not return alone: (12 − 3) ÷ 30 = 0.30 against the market's (10 − 3) ÷ 20 = 0.35. The extra raw return came with too much additional volatility."}
                  </Feedback>
                </>
              )}
            </InteractiveFrame>

            <Panel>
              <h3 className="ops-body-strong text-[15px] text-white">
                Four measures, four different controls
              </h3>
              <dl className="mt-3 space-y-3">
                <Row
                  label="Sharpe ratio"
                  value="(Return − risk-free rate) ÷ standard deviation — excess return per unit of total risk"
                />
                <Row
                  label="Information ratio"
                  value="(Return − index) ÷ tracking error — how far you strayed from the index to do it"
                />
                <Row label="Jensen's alpha" value="Actual − CAPM expected return, at your beta" />
                <Row label="Treynor index" value="(Return − risk-free) ÷ beta — return per unit of market exposure" />
              </dl>
              <p className="ops-body mt-4 text-[14px] text-slate-400">
                Every one of them has a bias some strategy can exploit, which is why the
                source&apos;s advice is to try three or four before forming a judgement — and to
                remember that past performance carries as much luck as skill.
              </p>
            </Panel>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Panel>
              <h3 className="ops-interactive-title text-[18px] text-white">
                Four steps, in this order
              </h3>
              <ol className="mt-3 space-y-2">
                {[
                  "Name the event and collect the date it was ANNOUNCED, not the date it happened.",
                  "Collect returns for each firm across a window before and after that date.",
                  "Adjust those returns for market performance and for the firm's risk.",
                  "Average across firms and test the result — statistically, then economically.",
                ].map((line, index) => (
                  <li key={line} className="flex gap-3 text-[15px] text-slate-200">
                    <span className="tabular-nums text-accent-amber">{index + 1}</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Reading a window</ConceptTag>
              </div>
              <p className="ops-body mt-4 text-[15px] text-slate-200">
                A study of forced CEO resignations finds prices up 2% in the ten days before
                the announcement, up another 5% on the day, and up 3% more in the ten days
                after. Each segment says something different.
              </p>
              <div className="mt-5 space-y-4">
                {EVENT_WINDOW.map((segment) => {
                  const answer = segment.causes.find((c) => "correct" in c && c.correct)?.id;
                  const picked = eventPicks[segment.id];
                  return (
                    <Panel key={segment.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="ops-body-strong text-[15px] text-white">
                          {segment.label}
                        </h3>
                        <span className="text-[14px] text-accent-amber">{segment.move}</span>
                      </div>
                      <div className="mt-3 grid gap-2">
                        {segment.causes.map((cause) => (
                          <Choice
                            key={cause.id}
                            selected={picked === cause.id}
                            onClick={() => {
                              const next = { ...eventPicks, [segment.id]: cause.id };
                              setEventPicks(next);
                              if (
                                EVENT_WINDOW.every(
                                  (w) =>
                                    next[w.id] ===
                                    w.causes.find((c) => "correct" in c && c.correct)?.id,
                                )
                              ) {
                                onComplete();
                              }
                            }}
                          >
                            {cause.label}
                          </Choice>
                        ))}
                      </div>
                      {picked && (
                        <Feedback status={picked === answer ? "correct" : "incorrect"}>
                          {picked === answer
                            ? segment.note
                            : "Read the segment against what the market knew at that moment."}
                        </Feedback>
                      )}
                    </Panel>
                  );
                })}
              </div>
              {eventComplete && (
                <Feedback status="correct">
                  All three at once: information leaked, the announcement still surprised
                  most of the market, and the adjustment took days. Only the last segment is
                  tradable, and only if it survives costs.
                </Feedback>
              )}
            </InteractiveFrame>

            <Panel className="border-accent-amber/20 bg-accent-amber/[0.04]">
              <h3 className="ops-body-strong text-[15px] text-white">
                Historical source example
              </h3>
              <p className="ops-body mt-2 text-[14px] text-slate-300">
                The source&apos;s own event study — options being listed on a stock, CBOE, 1970s —
                found about 1.8% cumulative excess return across the whole 21-day window and
                about 1.34% from the announcement day onward, with t-statistics only
                marginally significant. Dated evidence, and a good example of a result that
                is statistically interesting and economically thin.
              </p>
            </Panel>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Panel>
              <h3 className="ops-interactive-title text-[18px] text-white">
                Five steps, and step one decides everything
              </h3>
              <ol className="mt-3 space-y-2">
                {[
                  "Define the characteristic and sort every firm in the universe on it — at the START of the period.",
                  "Collect returns for each firm and compute each portfolio's return.",
                  "Estimate each portfolio's risk.",
                  "Compute excess returns and their standard errors.",
                  "Test whether the excess returns differ from zero, and whether the extremes differ from each other.",
                ].map((line, index) => (
                  <li key={line} className="flex gap-3 text-[15px] text-slate-200">
                    <span className="tabular-nums text-accent-amber">{index + 1}</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </Panel>

            <Panel>
              <h3 className="ops-body-strong text-[15px] text-white">
                Historical source example · low PE on the NYSE, 1988–1992
              </h3>
              <p className="ops-body mt-2 text-[14px] text-slate-400">
                Firms sorted into five groups on their end-1987 PE ratio, negative PEs
                excluded, delisted stocks assigned −100%. Annual excess returns:
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-[14px]">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="py-2 pr-4 font-medium">PE class</th>
                      {["1988", "1989", "1990", "1991", "1992"].map((y) => (
                        <th key={y} className="py-2 pr-4 font-medium tabular-nums">
                          {y}
                        </th>
                      ))}
                      <th className="py-2 font-medium">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PE_TABLE.map((row) => (
                      <tr key={row.klass} className="border-t border-white/10">
                        <td className="py-2 pr-4 text-white">{row.klass}</td>
                        {row.years.map((v, i) => (
                          <td key={i} className="py-2 pr-4 tabular-nums text-slate-300">
                            {v}
                          </td>
                        ))}
                        <td
                          className={cn(
                            "py-2 tabular-nums",
                            row.avg > 0 ? "text-accent-green" : "text-accent-red",
                          )}
                        >
                          {row.avg.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Extreme portfolio test</ConceptTag>
              </div>
              <h3 className="ops-body-strong mt-4 text-[17px] text-white">
                How much more did the lowest-PE group earn than the highest, per year on
                average?
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  id="pe-spread"
                  aria-label="Spread between the extreme portfolios, in percent"
                  value={spread}
                  onChange={(event) => {
                    setSpread(event.target.value);
                    setSpreadChecked(false);
                  }}
                  placeholder="e.g. 3.10"
                  className="w-40 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-[15px] text-white outline-none placeholder:text-slate-500 focus:border-accent-amber/50"
                />
                <span className="text-[15px] text-slate-400">%</span>
                <Button
                  size="md"
                  disabled={!spread.trim()}
                  onClick={() => {
                    setSpreadChecked(true);
                    if (spread.trim().replace(/%$/, "") === SPREAD_ANSWER) onComplete();
                  }}
                >
                  Check the spread
                </Button>
              </div>
              {spreadChecked && (
                <Feedback
                  status={
                    spread.trim().replace(/%$/, "") === SPREAD_ANSWER ? "correct" : "incorrect"
                  }
                >
                  {spread.trim().replace(/%$/, "") === SPREAD_ANSWER
                    ? "Correct: 2.61% − (−1.95%) = 4.56% a year. Now the harder question — that spread is evidence that low-PE firms outperformed in this window. It is not evidence that a low PE causes returns, and it says nothing about what it cost to hold them."
                    : "Subtract the highest-PE average from the lowest-PE average. Both are in the last column, and one of them is negative."}
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Panel>
              <p className="ops-body text-[15px] text-slate-200">
                Portfolio studies buckle when a strategy has several variables, and they
                throw away everything that varies inside a bucket — the lowest-PE group can
                hold ratios from 4 to 12 and treat them as identical. A regression keeps both.
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Setting it up</ConceptTag>
              </div>
              <h3 className="ops-body-strong mt-4 text-[17px] text-white">
                Which variable goes on the left-hand side?
              </h3>
              <div className="mt-4 grid gap-3">
                {[
                  ["returns", "The returns on the stocks — that is what you are explaining"],
                  ["ratios", "The strategy's variables, like the PE ratio"],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    selected={dependent === id}
                    onClick={() => setDependent(id)}
                  >
                    {label}
                  </Choice>
                ))}
              </div>
              {dependent && (
                <Feedback status={dependent === "returns" ? "correct" : "incorrect"}>
                  {dependent === "returns"
                    ? "Correct. Returns are the dependent variable; the strategy's variables are the independent ones. Worth knowing: the source's own slide labels these the other way round — the wording is transposed, the method is not."
                    : "Those are the independent variables — the things you think will find better investments. The returns are what you are trying to explain."}
                </Feedback>
              )}
            </InteractiveFrame>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Reading it</ConceptTag>
              </div>
              <h3 className="ops-body-strong mt-4 text-[17px] text-white">
                The regression comes back with a significant coefficient on your variable.
                What have you learned?
              </h3>
              <div className="mt-4 grid gap-3">
                {[
                  ["cause", "That the variable causes the returns"],
                  ["assoc", "That the variable is associated with returns in this sample"],
                  ["future", "That the relationship will hold next year"],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    selected={reading === id}
                    onClick={() => {
                      setReading(id);
                      if (id === "assoc" && dependent === "returns") onComplete();
                    }}
                  >
                    {label}
                  </Choice>
                ))}
              </div>
              {reading && (
                <Feedback status={reading === "assoc" ? "correct" : "incorrect"}>
                  {reading === "assoc"
                    ? "Correct. Association in one sample, at one time, under one specification. Statistical tests present correlation; treating it as causation is the sixth cardinal sin, and it is the one people commit while looking at a perfectly good t-statistic."
                    : "A regression measures association within its sample. Neither causation nor persistence comes free with a t-statistic."}
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel className="border-accent-red/25 bg-accent-red/[0.04]">
                <h3 className="ops-body-strong text-[15px] text-white">The six cardinal sins</h3>
                <ol className="mt-3 space-y-2">
                  {[
                    "Anecdotal evidence — stories can be selected to prove anything.",
                    "No holdout — testing an idea on the data it came from.",
                    "Sampling bias — a sample that does not represent the universe.",
                    "No control for market performance — everything works in a bull market.",
                    "No control for risk — which quietly favours the riskiest schemes.",
                    "Mistaking correlation for causation.",
                  ].map((line, index) => (
                    <li key={line} className="flex gap-3 text-[14px] text-slate-200">
                      <span className="tabular-nums text-accent-red">{index + 1}</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              </Panel>
              <Panel className="border-accent-amber/25 bg-accent-amber/[0.04]">
                <h3 className="ops-body-strong text-[15px] text-white">The four quieter ones</h3>
                <ol className="mt-3 space-y-2">
                  {[
                    "Data mining — test enough variables and some will predict by chance.",
                    "Survivor bias — working back from today's survivors erases the failures.",
                    "Ignoring transaction costs.",
                    "Ignoring whether the trade can actually be executed.",
                  ].map((line, index) => (
                    <li key={line} className="flex gap-3 text-[14px] text-slate-200">
                      <span className="tabular-nums text-accent-amber">{index + 1}</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              </Panel>
            </div>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Independent application</ConceptTag>
              </div>
              <h3 className="ops-body-strong mt-4 text-[17px] text-white">
                You believe small companies that institutions barely hold earn higher
                risk-adjusted returns. Which test design is defensible?
              </h3>
              <div className="mt-4 grid gap-3">
                {[
                  ["a", "Take today's listed companies, find the small, lightly held ones today, and measure their returns over the last five years"],
                  ["b", "Take today's listed companies, find which were small and lightly held five years ago, and measure their returns since"],
                  ["c", "Take the companies listed five years ago, find the ones small and lightly held today, and measure their returns since"],
                  ["d", "Take the companies listed five years ago, find the ones small and lightly held then, and measure their returns since"],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    selected={sampling === id}
                    onClick={() => {
                      setSampling(id);
                      if (id === "d") onComplete();
                    }}
                  >
                    {label}
                  </Choice>
                ))}
              </div>
              {sampling && (
                <Feedback status={sampling === "d" ? "correct" : "incorrect"}>
                  {sampling === "d"
                    ? "Correct. The sample has to be what you could actually have picked five years ago, so companies that failed, defaulted or were acquired stay in and carry their losses. Every other option starts from today's survivors, sorts on today's characteristics, or both."
                    : "Ask what you could have known and bought at the start. Starting from companies that still exist today quietly deletes the ones the strategy would have led you into and that then failed."}
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <Panel className="border-accent-amber/25 bg-accent-amber/[0.04]">
              <h3 className="ops-body-strong text-[15px] text-white">
                The claim on the table
              </h3>
              <p className="ops-body mt-2 text-[15px] text-slate-200">
                A strategy returned {pct(CLAIM.gross)} a year over a decade against the
                market&apos;s {pct(CLAIM.market)}, with a beta of {CLAIM.beta}. The risk-free
                rate was {pct(CLAIM.riskFree)}.
                {frictionBudget.estimatedAnnualDrag
                  ? " Your own friction budget says trading it costs you"
                  : " The source charges trading costs of"}{" "}
                {pct(ownCosts)} a year.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Metric label="Return after your costs" value={pct(netOfCosts)} tone="slate" />
                <Metric label="Return its beta demands" value={pct(required)} tone="amber" />
                <Metric
                  label="What is left"
                  value={`${excess >= 0 ? "+" : ""}${pct(excess)}`}
                  tone={excess >= 0 ? "green" : "red"}
                />
              </div>
              <p className="ops-body mt-4 text-[14px] text-slate-300">
                {pct(CLAIM.riskFree)} + {CLAIM.beta} × ({pct(CLAIM.market)} −{" "}
                {pct(CLAIM.riskFree)}) = {pct(required)} required.{" "}
                {pct(CLAIM.gross)} − {pct(ownCosts)} = {pct(netOfCosts)} delivered.{" "}
                {excess < 0
                  ? `It falls ${pct(Math.abs(excess))} short. Its beta would have to drop to ${evenBeta.toFixed(4)} to break even.`
                  : `It clears the bar by ${pct(excess)}.`}
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <ConceptTag>Your checklist</ConceptTag>
              </div>
              <div className="mt-5 space-y-5">
                <Field label="The measure I will judge a claim by">
                  {BENCHMARKS.map((option) => (
                    <Choice
                      key={option.id}
                      selected={benchmark === option.id}
                      onClick={() => setBenchmark(option.id)}
                    >
                      {option.label}
                    </Choice>
                  ))}
                </Field>
                <Field label="The test my claim calls for">
                  {TEST_DESIGNS.map((option) => (
                    <Choice
                      key={option.id}
                      selected={design === option.id}
                      onClick={() => setDesign(option.id)}
                    >
                      {option.label}
                    </Choice>
                  ))}
                </Field>
                <Field label="What I will hold back">
                  {HOLDOUTS.map((option) => (
                    <Choice
                      key={option.id}
                      selected={holdout === option.id}
                      onClick={() => setHoldout(option.id)}
                    >
                      {option.label}
                    </Choice>
                  ))}
                </Field>
                <Field label="How I will build the sample">
                  {SAMPLINGS.map((option) => (
                    <Choice
                      key={option.id}
                      selected={samplingRule === option.id}
                      onClick={() => setSamplingRule(option.id)}
                    >
                      {option.label}
                    </Choice>
                  ))}
                </Field>
                <div>
                  <label
                    htmlFor="abandon-rule"
                    className="ops-body-strong block text-[15px] text-white"
                  >
                    What result would make me drop the claim
                  </label>
                  <textarea
                    id="abandon-rule"
                    rows={3}
                    value={abandon}
                    onChange={(event) => setAbandon(event.target.value)}
                    placeholder="Name the number or the failure that ends it — not 'if it stops working'."
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-slate-500 focus:border-accent-amber/50"
                  />
                  <p className="ops-body mt-2 text-[14px] text-slate-400">
                    At least 20 characters. A claim you cannot state a way out of is not a
                    claim you can test.
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <Button
                  size="md"
                  disabled={!checklistReady || saved}
                  onClick={() => saveChecklist(onComplete)}
                >
                  {saved ? "Checklist saved ✓" : "Save the evidence test checklist"}
                </Button>
              </div>
              {saved && (
                <Feedback status="correct">
                  Saved to your dossier. Mission 10 reads it next to your friction budget: a
                  claim that fails either one is not an edge.
                </Feedback>
              )}
            </InteractiveFrame>

            {evidenceChecklist.updatedAt && !saved && (
              <Panel className="border-accent-green/25 bg-accent-green/[0.05]">
                <h3 className="ops-body-strong text-[15px] text-accent-green">
                  A checklist is already saved
                </h3>
                <p className="ops-body mt-2 text-[14px] text-slate-300">
                  Filling this in again replaces it.
                </p>
              </Panel>
            )}
          </div>
        );

      case 7: {
        const chosen = POSITIONS.find((o) => o.id === position);
        const why = PERSISTENCE.find((o) => o.id === persistence);
        const drop = FALSIFIERS.find((o) => o.id === falsifier);
        const beliefReady = Boolean(chosen && why && drop);

        return (
          <div className="space-y-4">
            {observationNote.updatedAt ? (
              <Panel>
                <h3 className="ops-body-strong text-[15px] text-white">
                  What you recorded in Mission 2
                </h3>
                <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
                  {observationNote.disclosure} {observationNote.priceResponse}
                </p>
                <p className="ops-body mt-2 text-[14px] leading-6 text-slate-400">
                  You said then that it did not establish a pattern. It still
                  does not — but you can now say what evidence would.
                </p>
              </Panel>
            ) : null}

            <Panel>
              {/* Folded once answered: three four-option groups open at once
                  overran the stage budget in Mission 2 for the same reason. */}
              {chosen ? (
                <Row label="Your position" value={chosen.label} />
              ) : (
                <ChoiceGroup
                  label="Which position do you hold?"
                  className="space-y-2"
                  value={position}
                  onChange={setPosition}
                  options={POSITIONS}
                />
              )}

              {chosen ? (
                why ? (
                  <Row label="Why it might persist" value={why.label} />
                ) : (
                  <ChoiceGroup
                    label="Why might it persist, or why is there nothing to take?"
                    className="mt-3 space-y-2"
                    value={persistence}
                    onChange={setPersistence}
                    options={PERSISTENCE}
                  />
                )
              ) : null}

              {why ? (
                drop ? (
                  <Row label="What would change your mind" value={drop.label} />
                ) : (
                  <ChoiceGroup
                    label="What result would make you drop it?"
                    className="mt-3 space-y-2"
                    value={falsifier}
                    onChange={setFalsifier}
                    options={FALSIFIERS}
                  />
                )
              ) : null}
            </Panel>

            <button
              type="button"
              disabled={!beliefReady || beliefSaved}
              className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60"
              onClick={() => {
                saveBeliefStatement({
                  marketBelief: chosen!.label,
                  persistenceReason: why!.label,
                  evidenceGap: drop!.label,
                  // Only the leading character is lowered. Lowercasing a whole
                  // label turned "I will default to a passive core" into "i will".
                  generatedSummary: `My position: ${chosen!.label}. It may persist because ${uncap(why!.label)}. I would drop it if ${uncap(drop!.label)}.`,
                  updatedAt: "",
                });
                setBeliefSaved(true);
                onComplete();
              }}
            >
              {beliefSaved ? "Belief statement saved ✓" : "Save the belief statement"}
            </button>

            {beliefSaved ? (
              <Feedback status="correct">
                Saved to your dossier. Mission 10 tests this against the base
                rate, your friction budget and the checklist you just wrote.
              </Feedback>
            ) : null}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // A saved checklist is this lesson's terminal state. Without restoring it, a
  // hard refresh reset all seven stages to incomplete while the artifact was
  // still sitting in the dossier — the gate mission 9 left open. Artifacts load
  // in an effect, so the shell's state initialisers see nothing on first paint;
  // the key remounts it once the store is ready, the way mission 5 does.
  const checklistRestored = ready && Boolean(evidenceChecklist.updatedAt);
  // The belief is now this lesson's terminal artifact, so a learner who saved
  // one comes back to the end rather than to the checklist stage.
  const beliefRestored = ready && Boolean(beliefStatement.updatedAt);
  const restoredStages = STAGES.map((_, i) =>
    beliefRestored ? true : checklistRestored && i < STAGES.length - 1,
  );

  return (
    <ValuationJourneyShell
      key={beliefRestored ? beliefStatement.updatedAt : checklistRestored ? evidenceChecklist.updatedAt : "fresh"}
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 7.1 evidence journey"
      stages={STAGES}
      renderStage={renderStage}
      labLabel="Guided evidence lab"
      finishHref="/dossier"
      finishLabel="See your dossier"
      savedArtifactLabel="Evidence Test Checklist and Market Belief Statement"
      initialCompleted={restoredStages}
      // A saved checklist returns to the checklist stage, not past it: the save
      // remounts the shell, and landing on the belief stage would have skipped
      // the confirmation the learner just earned. Only a saved belief lands last.
      initialStage={
        beliefRestored ? STAGES.length - 1 : checklistRestored ? STAGES.length - 2 : 0
      }
    />
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
        "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
        selected
          ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
          : "border-white/10 text-slate-200 hover:border-white/25",
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="ops-body-strong text-[15px] text-white">{label}</h3>
      <div className="mt-3 grid gap-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="ops-caption text-[12px] text-slate-400">{label}</dt>
      <dd className="text-[14px] text-slate-200 sm:text-right">{value}</dd>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "amber" | "red" | "green" | "slate";
}) {
  const toneClass = {
    amber: "text-accent-amber",
    red: "text-accent-red",
    green: "text-accent-green",
    slate: "text-slate-300",
  }[tone];
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="ops-caption text-[12px] text-slate-500">{label}</div>
      <div className={cn("mt-2 text-2xl font-semibold tabular-nums", toneClass)}>{value}</div>
    </div>
  );
}
