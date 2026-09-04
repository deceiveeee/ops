"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { useIFProgress } from "@/lib/if-progress";
import {
  calculateBufferedPrice,
  calculateGrowthValuation,
  calculateValueToPriceGap,
} from "@/lib/valuation-basics";
import Button from "@/components/ui/Button";
import ValuationJourneyShell, {
  type ValuationStage,
} from "./ValuationJourneyShell";
import {
  ConceptTag,
  DefinitionCard,
  Feedback,
  InteractiveFrame,
  MasteryCheck,
  Panel,
  TryItTag,
  type MasteryQuestion,
} from "./shared";

const LESSON_SLUG = "if-5-1-estimate-a-valuation-range";
const OBSERVED_PRICE = 1100;
const REQUIRED_RETURN = 0.1;
const BASE_VALUE = 1200;

const STAGES: readonly ValuationStage[] = [
  {
    label: "Frame",
    title: "Price is observed. Value is investigated.",
    guide:
      "Price is a quote you can read today. Value is an estimate you have to build. Learn the four inputs that move it before you touch a formula.",
    instruction:
      "Read the four valuation inputs, then predict what a higher required return does to value.",
    next: "Choose the claim",
  },
  {
    label: "Claim",
    title: "Choose the claim before the formula.",
    guide:
      "Every valuation values a specific claim. Mixing a firm-level cash flow with an equity-level discount rate produces a number that means nothing.",
    instruction: "Decide which claim the cash flow belongs to, then check it.",
    next: "Value a flat business",
  },
  {
    label: "Baseline",
    title: "Start with a business that does not grow.",
    guide:
      "Strip growth out first. A no-growth business gives you a clean benchmark to test every growth claim against.",
    instruction: "Work out what the no-growth business is worth, then check it.",
    next: "Make growth pay",
  },
  {
    label: "Growth",
    title: "Growth adds value only when the return earns its keep.",
    guide:
      "Growth is not free — it has to be funded by reinvestment. What decides whether it creates value is the return earned on that reinvested capital.",
    instruction:
      "Inspect all three return-on-capital cases and compare the values they produce.",
    next: "Read the multiple",
  },
  {
    label: "Peers",
    title: "A low multiple is a clue, not a verdict.",
    guide:
      "Relative valuation is fast, which is exactly why it is easy to misuse. A multiple only carries a conclusion once the comparison is controlled.",
    instruction: "Choose the conclusion that survives a proper comparison.",
    next: "Set your decision rule",
  },
  {
    label: "Decide",
    title: "Convert uncertainty into a decision rule.",
    guide:
      "You now have a range, not a point. A buffer turns that range into a rule you can act on before emotion gets a vote.",
    instruction: "Choose a decision buffer, then save the range to your plan.",
    next: "Defend the range",
  },
  {
    label: "Defend",
    title: "Defend the range without shortcuts.",
    guide:
      "The final check combines the whole lesson: claim consistency, growth quality, relative-value controls, and range discipline.",
    instruction: "Answer at least four questions correctly to finish the lesson.",
    next: "Finish the lesson",
  },
];

const growthScenarios = [
  {
    id: "destroy",
    label: "Value-destroying growth",
    returnOnCapital: 0.08,
    tone: "red",
    relation: "ROC < cost of capital",
    explanation:
      "The business reinvests half its operating income to grow 4%, but earns only 8% on that capital. Growth consumes more value than it creates.",
  },
  {
    id: "neutral",
    label: "Value-neutral growth",
    returnOnCapital: 0.1,
    tone: "cyan",
    relation: "ROC = cost of capital",
    explanation:
      "The return on new capital exactly matches the 10% required return. Faster growth raises future income, but the required reinvestment offsets the gain.",
  },
  {
    id: "create",
    label: "Value-creating growth",
    returnOnCapital: 0.12,
    tone: "green",
    relation: "ROC > cost of capital",
    explanation:
      "The business earns 12% on new capital while investors require 10%. Each reinvested dollar adds value, so the same 4% growth is worth more.",
  },
] as const;

const scenarioTone = {
  red: {
    border: "border-accent-red/45",
    bg: "bg-accent-red/10",
    text: "text-accent-red",
    marker: "bg-accent-red",
  },
  cyan: {
    border: "border-accent-cyan/45",
    bg: "bg-accent-cyan/10",
    text: "text-accent-cyan",
    marker: "bg-accent-cyan",
  },
  green: {
    border: "border-accent-green/45",
    bg: "bg-accent-green/10",
    text: "text-accent-green",
    marker: "bg-accent-green",
  },
} as const;

const valuationPillars = [
  [
    "Cash flow",
    "What existing assets produce after the spending needed to sustain them.",
    "Higher durable cash flow raises value.",
  ],
  [
    "Growth",
    "Future cash-flow change from new investment or better use of existing assets.",
    "Growth needs capital; it is not free.",
  ],
  [
    "Competitive period",
    "How long returns above the required return can persist before maturity.",
    "A durable advantage extends value-creating growth.",
  ],
  [
    "Required return",
    "Compensation for time and risk, used to discount future cash flow.",
    "More risk raises the hurdle and pulls value down.",
  ],
] as const;

const masteryQuestions: MasteryQuestion[] = [
  {
    id: "claim-pairing",
    type: "single",
    prompt:
      "Which pairing is internally consistent when valuing the whole operating business?",
    choices: [
      { id: "firm", label: "FCFF with the cost of capital" },
      { id: "equity", label: "FCFF with the cost of equity" },
      { id: "debt", label: "Net income with the cost of debt" },
    ],
    correctId: "firm",
    hint: "Cash flow to all capital providers must be discounted at the return required by all capital providers.",
  },
  {
    id: "drivers",
    type: "multi",
    prompt: "Which inputs can affect intrinsic value? Select every correct answer.",
    choices: [
      { id: "cash", label: "Cash flow from existing assets" },
      { id: "growth", label: "Expected growth" },
      { id: "reinvestment", label: "Reinvestment needed for growth" },
      { id: "risk", label: "Risk in the cash flows" },
    ],
    correctIds: ["cash", "growth", "reinvestment", "risk"],
    hint: "Cash flow, growth, reinvestment, and risk all enter either the expected cash flows or the discount rate.",
  },
  {
    id: "growth-quality",
    type: "single",
    prompt: "When does long-run growth increase value?",
    choices: [
      { id: "always", label: "Whenever reported earnings grow" },
      { id: "equal", label: "When return on capital equals cost of capital" },
      { id: "above", label: "When return on capital exceeds cost of capital" },
    ],
    correctId: "above",
    hint: "Growth creates value only when the return earned on reinvested capital clears the return investors require.",
  },
  {
    id: "relative",
    type: "single",
    prompt:
      "A company trades at 10× earnings while its peer median is 15×. What can you conclude from that fact alone?",
    choices: [
      { id: "cheap", label: "It is definitely cheap" },
      { id: "nothing", label: "Not enough—growth, risk, and cash flow still need controls" },
      { id: "expensive", label: "It is definitely expensive" },
    ],
    correctId: "nothing",
    hint: "A lower multiple may be justified by lower growth, higher risk, or weaker cash flow quality.",
  },
  {
    id: "methods",
    type: "single",
    prompt: "Can a company look cheap intrinsically but expensive relative to its peers?",
    choices: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
    correctId: "yes",
    hint: "The peer group itself can be broadly underpriced, making one company less cheap than its peers while still below intrinsic value.",
  },
];

function money(value: number, digits = 0) {
  return `$${value.toFixed(digits)}m`;
}

function percent(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

export default function ValuationRangeJourney() {
  const reduceMotion = useReducedMotion();
  const { valuationRange, saveValuationRange, isComplete } = useIFProgress();

  const [frameChoice, setFrameChoice] = useState<string | null>(null);
  const [frameChecked, setFrameChecked] = useState(false);
  const [claimChoice, setClaimChoice] = useState<"firm" | "equity" | null>(null);
  const [claimChecked, setClaimChecked] = useState(false);
  const [baselineChoice, setBaselineChoice] = useState<string | null>(null);
  const [baselineChecked, setBaselineChecked] = useState(false);
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [inspectedScenarios, setInspectedScenarios] = useState<string[]>([]);
  const [peerChoice, setPeerChoice] = useState<string | null>(null);
  const [peerChecked, setPeerChecked] = useState(false);
  const [decisionBuffer, setDecisionBuffer] = useState(0.2);
  const [savedThisVisit, setSavedThisVisit] = useState(false);

  const scenarioResults = useMemo(
    () =>
      growthScenarios.map((scenario) => ({
        ...scenario,
        result: calculateGrowthValuation({
          afterTaxOperatingIncome: 120,
          growthRate: 0.04,
          returnOnCapital: scenario.returnOnCapital,
          costOfCapital: REQUIRED_RETURN,
        }),
      })),
    [],
  );

  const selectedScenario = scenarioResults.find(
    (scenario) => scenario.id === scenarioId,
  );
  const lowValue = scenarioResults[0].result.enterpriseValue;
  const highValue = scenarioResults[2].result.enterpriseValue;
  const buyBelow = calculateBufferedPrice(BASE_VALUE, decisionBuffer);
  const decision =
    OBSERVED_PRICE <= buyBelow
      ? "Candidate — price clears the selected buffer"
      : OBSERVED_PRICE <= BASE_VALUE
        ? "Watch — below base value, but the buffer is not met"
        : "Avoid — price exceeds the base estimate";
  const completed = isComplete(LESSON_SLUG);

  const saveArtifact = (onComplete: () => void) => {
    saveValuationRange({
      claim: "Whole operating business (enterprise value)",
      method: "Intrinsic range cross-checked with controlled relative valuation",
      requiredReturn: REQUIRED_RETURN,
      lowValue,
      baseValue: BASE_VALUE,
      highValue,
      observedPrice: OBSERVED_PRICE,
      decisionBuffer,
      buyBelow,
      decision,
      relativeCheck:
        "A lower P/E is evidence only after controlling for cash flow, growth, and risk.",
      evidenceTriggers: [
        "Downgrade the case if return on capital falls below the cost of capital.",
        "Revise the range if growth requires more reinvestment than modeled.",
        "Reject a peer comparison that does not control for growth and risk.",
      ],
      updatedAt: "",
    });
    setSavedThisVisit(true);
    onComplete();
  };

  const inspectScenario = (id: string, onComplete: () => void) => {
    setScenarioId(id);
    if (inspectedScenarios.includes(id)) return;
    setInspectedScenarios((current) =>
      current.includes(id) ? current : [...current, id],
    );
    // Signal completion from the event handler, never from inside the state
    // updater: updater functions must stay pure or React warns about updating
    // one component while rendering another.
    if (inspectedScenarios.length + 1 === growthScenarios.length) onComplete();
  };

  const renderStage = (stage: number, onComplete: () => void): ReactNode => {
    switch (stage) {
      case 0:
        return (
          <div className="space-y-6">
            <DefinitionCard term="Intrinsic value">
              An estimate of what an asset’s cash flows are worth when the growth
              and risk assumptions are stated consistently.
            </DefinitionCard>

            <Panel>
              <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div>
                  <ConceptTag concept="market">Price</ConceptTag>
                  <p className="ops-body mt-3 text-[15px] text-slate-300">
                    The quote available in the market now. It can move before the
                    underlying business changes.
                  </p>
                </div>
                <div className="hidden h-px w-10 bg-white/15 sm:block" aria-hidden />
                <div>
                  <ConceptTag concept="value">Value range</ConceptTag>
                  <p className="ops-body mt-3 text-[15px] text-slate-300">
                    A set of defensible outcomes caused by uncertain cash flow,
                    growth quality, and required return.
                  </p>
                </div>
              </div>
            </Panel>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 p-5 sm:p-6">
              <div className="pointer-events-none absolute inset-x-7 top-1/2 hidden h-px bg-gradient-to-r from-accent-green/30 via-accent-amber/40 to-accent-cyan/30 lg:block" />
              <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {valuationPillars.map(([title, definition, effect], index) => (
                  <div key={title} className="glass-panel relative p-4">
                    <span className="ops-caption text-[12px] tabular-nums text-slate-500">
                      0{index + 1}
                    </span>
                    <h3 className="ops-body-strong mt-2 text-[15px] text-white">
                      {title}
                    </h3>
                    <p className="ops-body mt-2 text-sm text-slate-300">
                      {definition}
                    </p>
                    <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-accent-amber">
                      {effect}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <span className="ops-caption text-[12px] text-slate-400">
                  Cause and effect
                </span>
              </div>
              <p className="ops-body-strong mt-4 text-[17px] text-white">
                Investors suddenly require a higher return. Cash flow and growth
                are unchanged. What happens to the estimated value?
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  ["falls", "It falls — future cash flows are discounted more heavily."],
                  ["rises", "It rises — a higher required return means a higher value."],
                  ["same", "It is unchanged — only cash flow and growth affect value."],
                ].map(([id, label]) => (
                  <StageChoice
                    key={id}
                    selected={frameChoice === id}
                    onClick={() => {
                      setFrameChoice(id);
                      setFrameChecked(false);
                    }}
                  >
                    {label}
                  </StageChoice>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  size="md"
                  onClick={() => {
                    setFrameChecked(true);
                    if (frameChoice === "falls") onComplete();
                  }}
                  disabled={!frameChoice}
                >
                  Check the effect
                </Button>
              </div>
              {frameChecked && (
                <Feedback
                  status={frameChoice === "falls" ? "correct" : "incorrect"}
                >
                  {frameChoice === "falls"
                    ? "Correct. The required return is the rate you discount at. Raise the hurdle while cash flow and growth stay fixed and every future dollar is worth less today, so value falls — even though nothing about the business changed."
                    : "The required return is the rate you discount at, so it works against value. A higher hurdle makes each future dollar worth less today. Value falls, and the business itself has not changed at all."}
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Panel>
                <div className="ops-caption text-[12px] text-accent-cyan">
                  Whole business
                </div>
                <h3 className="ops-body-strong mt-2 text-lg text-white">
                  Enterprise value
                </h3>
                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-white/10 p-3">
                    Cash flow: FCFF, before debt payments
                  </div>
                  <div className="rounded-xl border border-white/10 p-3">
                    Discount rate: cost of capital
                  </div>
                </div>
              </Panel>
              <Panel>
                <div className="ops-caption text-[12px] text-accent-amber">
                  Equity only
                </div>
                <h3 className="ops-body-strong mt-2 text-lg text-white">
                  Equity value
                </h3>
                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-white/10 p-3">
                    Cash flow: cash available to equity
                  </div>
                  <div className="rounded-xl border border-white/10 p-3">
                    Discount rate: cost of equity
                  </div>
                </div>
              </Panel>
            </div>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <span className="ops-caption text-[12px] text-slate-400">
                  Guided decision
                </span>
              </div>
              <p className="ops-body-strong mt-4 text-[17px] text-white">
                You have cash flow after taxes and reinvestment, but before
                interest and principal payments. Which claim does it belong to?
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ["firm", "The whole operating business"],
                  ["equity", "Equity investors only"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setClaimChoice(id as "firm" | "equity");
                      setClaimChecked(false);
                    }}
                    className={cn(
                      "rounded-full border px-4 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      claimChoice === id
                        ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                        : "border-white/15 text-slate-200 hover:border-white/30",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  size="md"
                  onClick={() => {
                    setClaimChecked(true);
                    if (claimChoice === "firm") onComplete();
                  }}
                  disabled={!claimChoice}
                >
                  Check the claim
                </Button>
              </div>
              {claimChecked && (
                <Feedback
                  status={claimChoice === "firm" ? "correct" : "incorrect"}
                >
                  {claimChoice === "firm"
                    ? "Correct. Before debt payments, the cash flow is available to both lenders and equity investors, so it belongs to the whole firm and pairs with the cost of capital."
                    : "Debt providers have not been paid yet. This cash flow still belongs to all capital providers, not only equity investors."}
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <DefinitionCard term="Perpetuity">
              A constant cash flow that continues indefinitely. Its present value
              is the next cash flow divided by the required return.
            </DefinitionCard>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <span className="ops-caption text-[12px] text-slate-400">
                  No growth · all-equity funded
                </span>
              </div>
              <p className="ops-body-strong mt-4 text-[17px] text-white">
                A company produces $120m of cash flow every year, forever, and it
                does not grow. Investors require 10%. What is the business worth?
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  ["1.2b", "$1.2b"],
                  ["12b", "$12b"],
                  ["120m", "$120m"],
                ].map(([id, label]) => (
                  <StageChoice
                    key={id}
                    selected={baselineChoice === id}
                    onClick={() => {
                      setBaselineChoice(id);
                      setBaselineChecked(false);
                    }}
                  >
                    <span className="tabular-nums">{label}</span>
                  </StageChoice>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  size="md"
                  onClick={() => {
                    setBaselineChecked(true);
                    if (baselineChoice === "1.2b") onComplete();
                  }}
                  disabled={!baselineChoice}
                >
                  Check the value
                </Button>
              </div>
              {baselineChecked && (
                <Feedback
                  status={baselineChoice === "1.2b" ? "correct" : "incorrect"}
                >
                  {baselineChoice === "1.2b"
                    ? "Correct. A perpetuity is worth the next cash flow divided by the required return."
                    : baselineChoice === "120m"
                      ? "That is one year of cash flow, not the value of the business. Value is what every future year is worth today, so divide the annual cash flow by the required return."
                      : "Check the decimal. Dividing by 10% means dividing by 0.10, not by 0.01. $120m ÷ 0.10 = $1,200m."}
                </Feedback>
              )}

              {baselineChoice === "1.2b" && baselineChecked && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                  className="mt-5 rounded-2xl border border-white/10 p-5"
                >
                  <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                    <div>
                      <div className="ops-caption text-[12px] text-slate-500">
                        Annual cash flow
                      </div>
                      <div className="mt-2 text-3xl font-semibold tabular-nums text-accent-green">
                        $120m
                      </div>
                    </div>
                    <span className="hidden text-xl text-slate-500 sm:block">÷</span>
                    <div>
                      <div className="ops-caption text-[12px] text-slate-500">
                        Required return
                      </div>
                      <div className="mt-2 text-3xl font-semibold tabular-nums text-accent-amber">
                        10%
                      </div>
                    </div>
                    <span className="hidden text-xl text-slate-500 sm:block">=</span>
                    <div>
                      <div className="ops-caption text-[12px] text-slate-500">
                        Business value
                      </div>
                      <div className="mt-2 text-3xl font-semibold tabular-nums text-white">
                        $1.2b
                      </div>
                    </div>
                  </div>
                  <p className="ops-body mt-5 border-t border-white/10 pt-4 text-sm text-slate-300">
                    The company is all-equity funded, so enterprise value and
                    equity value are both $1.2b. This no-growth result becomes the
                    benchmark for the growth test.
                  </p>
                </motion.div>
              )}
            </InteractiveFrame>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Panel>
              <div className="flex flex-wrap items-center gap-2">
                <ConceptTag concept="value">Naive growth</ConceptTag>
                <span className="text-sm text-slate-400">
                  $120m ÷ (10% − 4%) =
                </span>
                <span className="text-xl font-semibold tabular-nums text-white">
                  $2.0b
                </span>
              </div>
              <p className="ops-body mt-4 text-[15px] text-slate-300">
                That result treats growth as free. The missing event is
                reinvestment: the company must withhold cash today to fund the
                assets that produce tomorrow’s growth.
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <span className="ops-caption text-[12px] text-slate-400">
                  Growth held at 4% · required return 10%
                </span>
              </div>
              <p className="ops-body-strong mt-4 text-[17px] text-white">
                Change only the return earned on reinvested capital. Watch the cash
                flow and value move together.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {scenarioResults.map((scenario) => {
                  const active = scenario.id === scenarioId;
                  const seen = inspectedScenarios.includes(scenario.id);
                  const tone = scenarioTone[scenario.tone];
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => inspectScenario(scenario.id, onComplete)}
                      className={cn(
                        "relative rounded-2xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        active
                          ? `${tone.border} ${tone.bg}`
                          : "border-white/10 bg-white/[0.02] hover:border-white/25",
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          active ? tone.text : "text-slate-300",
                        )}
                      >
                        {scenario.label}
                      </span>
                      <span className="mt-2 block text-2xl font-semibold tabular-nums text-white">
                        ROC {percent(scenario.returnOnCapital)}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">
                        {scenario.relation}
                      </span>
                      {seen && (
                        <span className="absolute right-3 top-3 text-xs text-accent-green">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 text-[14px] text-slate-400">
                Inspected{" "}
                <span className="tabular-nums text-accent-amber">
                  {inspectedScenarios.length}
                </span>{" "}
                of {growthScenarios.length} cases
              </div>

              <div className="relative mt-6 rounded-2xl border border-white/10 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>$0.9b</span>
                  <span>Enterprise-value field</span>
                  <span>$1.4b</span>
                </div>
                <div className="relative mt-4 h-3 rounded-full bg-white/10">
                  <div className="absolute inset-y-0 left-[20%] right-[13.3%] rounded-full bg-gradient-to-r from-accent-red/50 via-accent-cyan/55 to-accent-green/55" />
                  {selectedScenario && (
                    <motion.div
                      initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.45,
                        ease: "easeOut",
                      }}
                      className={cn(
                        "absolute top-1/2 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_14px_currentColor]",
                        scenarioTone[selectedScenario.tone].marker,
                      )}
                      style={{
                        left: `${Math.max(0, Math.min(100, ((selectedScenario.result.enterpriseValue - 900) / 500) * 100))}%`,
                      }}
                    />
                  )}
                </div>
              </div>

              {selectedScenario && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 grid gap-3 sm:grid-cols-3"
                >
                  <div className="rounded-xl border border-white/10 p-4">
                    <div className="ops-caption text-[12px] text-slate-500">
                      Reinvestment rate
                    </div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
                      {percent(selectedScenario.result.reinvestmentRate, 1)}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      4% growth ÷ ROC
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 p-4">
                    <div className="ops-caption text-[12px] text-slate-500">
                      Cash after reinvestment
                    </div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
                      {money(selectedScenario.result.cashFlowAfterReinvestment)}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      $120m less reinvestment
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 p-4">
                    <div className="ops-caption text-[12px] text-slate-500">
                      Enterprise value
                    </div>
                    <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
                      {money(selectedScenario.result.enterpriseValue)}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Cash flow ÷ (10% − 4%)
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <Feedback
                      status={selectedScenario.id === "create" ? "correct" : "info"}
                    >
                      {selectedScenario.explanation}
                    </Feedback>
                  </div>
                </motion.div>
              )}
            </InteractiveFrame>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <DefinitionCard term="P/E ratio">
              Price per share divided by earnings per share. It standardizes
              price, but it does not make two businesses comparable by itself.
            </DefinitionCard>

            <InteractiveFrame className="relative overflow-hidden">
              {peerChecked && (
                <motion.div
                  aria-hidden
                  initial={reduceMotion ? false : { x: "-120%" }}
                  animate={{ x: "520%" }}
                  transition={{ duration: reduceMotion ? 0 : 1.15, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-accent-cyan/10 to-transparent"
                />
              )}
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <TryItTag />
                  <span className="ops-caption text-[12px] text-slate-400">
                    Company 10× · Peer median 15×
                  </span>
                </div>
                <p className="ops-body-strong mt-4 text-[17px] text-white">
                  Which conclusion survives a proper comparison?
                </p>
                <div className="mt-4 grid gap-3">
                  {[
                    ["cheap", "The lower P/E proves the company is cheap."],
                    [
                      "controlled",
                      "It may be cheap only after cash flow, growth, and risk are controlled.",
                    ],
                    ["expensive", "The lower P/E proves the company is expensive."],
                  ].map(([id, label]) => (
                    <StageChoice
                      key={id}
                      selected={peerChoice === id}
                      onClick={() => {
                        setPeerChoice(id);
                        setPeerChecked(false);
                      }}
                    >
                      {label}
                    </StageChoice>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    size="md"
                    onClick={() => {
                      setPeerChecked(true);
                      if (peerChoice === "controlled") onComplete();
                    }}
                    disabled={!peerChoice}
                  >
                    Scan the comparison
                  </Button>
                </div>
                {peerChecked && (
                  <Feedback
                    status={peerChoice === "controlled" ? "correct" : "incorrect"}
                  >
                    {peerChoice === "controlled"
                      ? "Correct. A lower P/E is most persuasive when the company also offers stronger growth and lower risk, with comparable cash-flow quality."
                      : "The multiple alone cannot carry the conclusion. Lower growth, higher risk, or weaker cash flow can justify a lower P/E."}
                  </Feedback>
                )}
              </div>
            </InteractiveFrame>

            <Panel>
              <p className="ops-body text-[15px] text-slate-300">
                Intrinsic and relative valuation can disagree. A company can trade
                below its own estimated value yet still be expensive relative to a
                peer group that is even more underpriced.
              </p>
            </Panel>
          </div>
        );

      case 5:
        return (
          <InteractiveFrame>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="ops-caption text-[12px] text-accent-amber">
                  Original OPS decision case
                </div>
                <h3 className="ops-body-strong mt-2 text-xl text-white">
                  Valuation Range
                </h3>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs tabular-nums text-slate-300">
                Observed price {money(OBSERVED_PRICE)}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Low case", lowValue, "ROC 8%"],
                ["Base case", BASE_VALUE, "ROC 10%"],
                ["Quality case", highValue, "ROC 12%"],
              ].map(([label, value, note]) => (
                <div
                  key={String(label)}
                  className="rounded-xl border border-white/10 p-4"
                >
                  <div className="ops-caption text-[12px] text-slate-500">
                    {label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
                    {money(Number(value))}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{note}</div>
                </div>
              ))}
            </div>

            <div className="relative mt-8 rounded-2xl border border-white/10 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{money(lowValue)}</span>
                <span>Defensible value range</span>
                <span>{money(highValue)}</span>
              </div>
              <div className="relative mt-5 h-3 rounded-full bg-gradient-to-r from-accent-red/40 via-accent-cyan/50 to-accent-green/50">
                <span
                  className="absolute top-1/2 h-7 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.55)]"
                  style={{
                    left: `${((OBSERVED_PRICE - lowValue) / (highValue - lowValue)) * 100}%`,
                  }}
                  aria-hidden
                />
                <span
                  className="absolute top-6 -translate-x-1/2 whitespace-nowrap text-[12px] tabular-nums text-slate-300"
                  style={{
                    left: `${((OBSERVED_PRICE - lowValue) / (highValue - lowValue)) * 100}%`,
                  }}
                >
                  Price {money(OBSERVED_PRICE)}
                </span>
              </div>
            </div>

            <div className="mt-9">
              <div className="ops-caption text-[12px] text-slate-400">
                Choose a decision buffer below the $1.2b base value
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[0.05, 0.2, 0.3].map((buffer) => (
                  <button
                    key={buffer}
                    type="button"
                    aria-pressed={decisionBuffer === buffer}
                    onClick={() => {
                      setDecisionBuffer(buffer);
                      setSavedThisVisit(false);
                    }}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                      decisionBuffer === buffer
                        ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                        : "border-white/15 text-slate-200 hover:border-white/30",
                    )}
                  >
                    {percent(buffer)} buffer
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 p-4">
                <div className="ops-caption text-[12px] text-slate-500">
                  Buy below
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-accent-amber">
                  {money(buyBelow)}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <div className="ops-caption text-[12px] text-slate-500">
                  Base value gap
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-accent-cyan">
                  {percent(calculateValueToPriceGap(BASE_VALUE, OBSERVED_PRICE), 1)}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <div className="ops-caption text-[12px] text-slate-500">
                  Required return
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
                  {percent(REQUIRED_RETURN)}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.07] p-4">
              <div className="ops-caption text-[12px] text-accent-amber">
                Decision
              </div>
              <p className="ops-body-strong mt-2 text-[16px] text-white">
                {decision}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="md" onClick={() => saveArtifact(onComplete)}>
                Save to your plan
              </Button>
              {(savedThisVisit || valuationRange.updatedAt) && (
                <span className="text-xs text-accent-green">
                  Valuation Range saved.
                </span>
              )}
            </div>
          </InteractiveFrame>
        );

      case 6:
        return (
          <div className="space-y-6">
            <MasteryCheck
              title="Mission 7 mastery"
              questions={masteryQuestions}
              passCount={4}
              onComplete={onComplete}
              skills={[
                "claim consistency",
                "growth quality",
                "relative-value controls",
                "range discipline",
              ]}
            />
            {completed && (
              <Panel>
                <div className="ops-caption text-[12px] text-accent-green">
                  Mission status
                </div>
                <p className="ops-body-strong mt-2 text-[16px] text-white">
                  Complete. Mission 7 now adds your valuation range to
                  your plan.
                </p>
              </Panel>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ValuationJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 5.1 valuation journey"
      stages={STAGES}
      renderStage={renderStage}
      finishHref="/courses/investment-foundations#module-5"
      finishLabel="Return to the Portfolio Builder"
    />
  );
}

function StageChoice({
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
