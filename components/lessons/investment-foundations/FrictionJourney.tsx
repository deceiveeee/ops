"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { useIFProgress } from "@/lib/if-progress";
import Button from "@/components/ui/Button";
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

const LESSON_SLUG = "if-6-1-count-the-friction";
const REQUIRED_RETURN = 0.1;

const STAGES: readonly ValuationStage[] = [
  {
    label: "Drag",
    title: "The missing one percent has to go somewhere.",
    guide:
      "Active managers trade because they expect trading to pay. Split their return into its parts and the cost of trading stops being a footnote.",
    instruction:
      "Read the three parts of an active return, then work out what trading costs must be.",
    next: "Find the widest spread",
  },
  {
    label: "Spread",
    title: "The spread is a cost you pay before anything happens.",
    guide:
      "A dealer quotes two prices, and the gap covers their inventory risk, their order processing, and the risk of trading against someone better informed.",
    instruction: "Pick the stock whose spread will be widest as a percent of price.",
    next: "Raise the hurdle",
  },
  {
    label: "Hurdle",
    title: "Friction raises the return you must earn.",
    guide:
      "You pay half the spread going in and half coming out. That does not subtract from your return — it raises the return you need before you have earned anything.",
    instruction: "Work out the pre-cost return this strategy needs, then check it.",
    next: "Measure your own footprint",
  },
  {
    label: "Impact",
    title: "Big orders move the price against you.",
    guide:
      "Part of the move is illiquidity and reverses. Part is other investors reading your order as information, and that part tends to stick.",
    instruction: "Decide which investor pays the most in price impact.",
    next: "Price the delay",
  },
  {
    label: "Waiting",
    title: "Patience is cheaper, but it is not free.",
    guide:
      "You can shrink the spread and the impact by trading slowly. What you risk instead is the price moving away, or the opportunity disappearing entirely.",
    instruction: "Decide which strategy waiting damages most.",
    next: "Count the tax bite",
  },
  {
    label: "Taxes",
    title: "Turnover is a tax decision.",
    guide:
      "Every sale that realises a gain moves money to the tax authority instead of compounding for you. How often you trade decides how big that transfer is.",
    instruction: "Choose the combination that keeps the most return after tax.",
    next: "Write your friction budget",
  },
  {
    label: "Budget",
    title: "Turn all of it into one number you own.",
    guide:
      "A friction budget is not trivia. It is the hurdle any strategy of yours has to clear before it beats simply holding an index.",
    instruction: "Describe your own plan, then save the budget to your plan.",
    next: "Finish the mission",
  },
];

/** Exact bid/ask treatment for a 4% spread, 2 years, and a 10% required return. */
function trueHurdle(required: number, spread: number, years: number) {
  const need = Math.pow(1 + required, years);
  const halfSpread = spread / 2;
  const buys = 1 - halfSpread;
  const sellFor = need / (1 - halfSpread);
  return Math.pow(sellFor / buys, 1 / years) - 1;
}

const naiveHurdle = (required: number, spread: number, years: number) =>
  required + spread / years;

const pct = (v: number, digits = 2) => `${(v * 100).toFixed(digits)}%`;

const SPREAD_STOCKS = [
  {
    id: "a",
    label: "Large cap, high price, many analysts",
    detail: "Heavily traded, widely covered",
  },
  {
    id: "b",
    label: "Small cap, high price, many analysts",
    detail: "Thinner trading, still well covered",
  },
  {
    id: "c",
    label: "Large cap, low price, many analysts",
    detail: "Low price, but liquid and covered",
  },
  {
    id: "d",
    label: "Small cap, low price, few analysts",
    detail: "Thin trading, low price, little coverage",
  },
] as const;

const IMPACT_CHOICES = [
  { id: "sl", label: "A small investor buying large-cap stocks" },
  { id: "ss", label: "A small investor buying small-cap stocks" },
  { id: "ll", label: "A large investor buying large-cap stocks" },
  { id: "ls", label: "A large investor buying small-cap stocks" },
] as const;

const WAITING_CHOICES = [
  { id: "mom-info", label: "Momentum trading on news just reaching the market" },
  { id: "con-info", label: "Contrarian trading on news just reaching the market" },
  { id: "growth", label: "Long-horizon growth investing on your own assessment" },
  { id: "value", label: "Long-horizon value investing on your own assessment" },
] as const;

const TAX_CHOICES = [
  { id: "long-index", label: "Ten-year holding period, index fund" },
  { id: "short-index", label: "One-year holding period, index fund" },
  { id: "long-active", label: "Ten-year holding period, actively managed fund" },
  { id: "short-active", label: "One-year holding period, actively managed fund" },
] as const;

/**
 * Illustrative OPS scenario weights, not measured costs or source claims. They
 * let the learner form a provisional estimate from explicit assumptions. Mission
 * 10 must treat the saved sum as an estimate to validate, not as empirical proof.
 */
const BUDGET_OPTIONS = {
  turnoverExpectation: [
    { id: "rare", label: "Rarely — I buy and hold", drag: 0.001 },
    { id: "few", label: "A few times a year", drag: 0.004 },
    { id: "monthly", label: "Monthly or more", drag: 0.012 },
  ],
  spreadClass: [
    { id: "liquid", label: "Large, liquid, widely covered", drag: 0.001 },
    { id: "mid", label: "Mid-sized, moderately traded", drag: 0.004 },
    { id: "illiquid", label: "Small, thin, lightly covered", drag: 0.01 },
  ],
  priceImpactExposure: [
    { id: "small", label: "My orders are tiny next to daily volume", drag: 0 },
    { id: "meaningful", label: "My orders are meaningful next to daily volume", drag: 0.005 },
  ],
  waitingSensitivity: [
    { id: "patient", label: "I can wait weeks without losing the idea", drag: 0 },
    { id: "urgent", label: "My edge decays if I do not act quickly", drag: 0.003 },
  ],
  taxSetting: [
    { id: "sheltered", label: "Tax-advantaged account", drag: 0 },
    { id: "taxable-long", label: "Taxable account, long holding periods", drag: 0.003 },
    { id: "taxable-short", label: "Taxable account, short holding periods", drag: 0.009 },
  ],
} as const;

type BudgetKey = keyof typeof BUDGET_OPTIONS;

export default function FrictionJourney() {
  const reduceMotion = useReducedMotion();
  const { frictionBudget, saveFrictionBudget, isComplete } = useIFProgress();

  const [dragChoice, setDragChoice] = useState<string | null>(null);
  const [dragChecked, setDragChecked] = useState(false);
  const [spreadChoice, setSpreadChoice] = useState<string | null>(null);
  const [spreadChecked, setSpreadChecked] = useState(false);
  const [hurdleChoice, setHurdleChoice] = useState<string | null>(null);
  const [hurdleChecked, setHurdleChecked] = useState(false);
  const [labSpread, setLabSpread] = useState(0.04);
  const [labYears, setLabYears] = useState(2);
  const [impactChoice, setImpactChoice] = useState<string | null>(null);
  const [impactChecked, setImpactChecked] = useState(false);
  const [waitingChoice, setWaitingChoice] = useState<string | null>(null);
  const [waitingChecked, setWaitingChecked] = useState(false);
  const [taxChoice, setTaxChoice] = useState<string | null>(null);
  const [taxChecked, setTaxChecked] = useState(false);
  const [budget, setBudget] = useState<Record<BudgetKey, string | null>>({
    turnoverExpectation: null,
    spreadClass: null,
    priceImpactExposure: null,
    waitingSensitivity: null,
    taxSetting: null,
  });
  const [savedThisVisit, setSavedThisVisit] = useState(false);

  const completed = isComplete(LESSON_SLUG);

  const budgetComplete = (Object.keys(BUDGET_OPTIONS) as BudgetKey[]).every(
    (k) => budget[k] !== null,
  );

  const totalDrag = useMemo(
    () =>
      (Object.keys(BUDGET_OPTIONS) as BudgetKey[]).reduce((sum, key) => {
        const chosen = BUDGET_OPTIONS[key].find((o) => o.id === budget[key]);
        return sum + (chosen?.drag ?? 0);
      }, 0),
    [budget],
  );

  const labelFor = (key: BudgetKey) =>
    BUDGET_OPTIONS[key].find((o) => o.id === budget[key])?.label ?? "";

  const hurdleRule = `My illustrative OPS scenario estimates about ${pct(totalDrag, 1)} of annual drag. An active claim must clear that provisional hurdle before it can beat a low-cost index fund.`;

  const saveBudget = (onComplete: () => void) => {
    saveFrictionBudget({
      turnoverExpectation: labelFor("turnoverExpectation"),
      spreadClass: labelFor("spreadClass"),
      priceImpactExposure: labelFor("priceImpactExposure"),
      waitingSensitivity: labelFor("waitingSensitivity"),
      taxSetting: labelFor("taxSetting"),
      estimatedAnnualDrag: totalDrag,
      hurdleRule,
      updatedAt: "",
    });
    setSavedThisVisit(true);
    onComplete();
  };

  const renderStage = (stage: number, onComplete: () => void): ReactNode => {
    switch (stage) {
      case 0:
        return (
          <div className="space-y-6">
            <Panel>
              <div className="ops-interactive-title text-[18px] text-white">
                The three parts of an active return
              </div>
              <div className="mt-4 space-y-3 text-[15px] text-slate-200">
                <div className="rounded-xl border border-white/10 p-3">
                  The return you would earn anyway for taking this much risk
                </div>
                <div className="rounded-xl border border-white/10 p-3">
                  <span className="text-accent-green">plus</span> whatever active
                  trading actually adds
                </div>
                <div className="rounded-xl border border-white/10 p-3">
                  <span className="text-accent-red">minus</span> the cost of doing
                  the trading
                </div>
              </div>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <span className="ops-caption text-[12px] text-slate-400">
                  Reasoning from evidence
                </span>
              </div>
              <p className="ops-body-strong mt-4 text-[17px] text-white">
                The average active manager finishes about 1% behind the market. If
                active trading adds nothing at all across those managers, what does
                that 1% have to be?
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  ["zero", "Nothing — the gap is just bad luck"],
                  ["one", "Roughly 1% of trading costs"],
                  ["two", "Roughly 2% of trading costs"],
                  ["cannot", "There is no way to tell from this"],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    selected={dragChoice === id}
                    onClick={() => {
                      setDragChoice(id);
                      setDragChecked(false);
                    }}
                  >
                    {label}
                  </Choice>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  size="md"
                  disabled={!dragChoice}
                  onClick={() => {
                    setDragChecked(true);
                    if (dragChoice === "one") onComplete();
                  }}
                >
                  Check the reasoning
                </Button>
              </div>
              {dragChecked && (
                <Feedback status={dragChoice === "one" ? "correct" : "incorrect"}>
                  {dragChoice === "one"
                    ? "Correct. If active trading contributes nothing, the only thing left to explain a 1% shortfall is the cost of trading. And note which way the logic cuts: if active trading does add something, then costs must be even larger than 1% to leave a 1% gap."
                    : "Set the middle term to zero and the arithmetic forces the answer. Expected return minus trading costs leaves a 1% shortfall, so trading costs are about 1%. If trading did add value, costs would have to be even higher."}
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <DefinitionCard term="Bid-ask spread">
              The gap between the price at which you can buy an asset and the price
              at which you could sell the same asset at the same moment.
            </DefinitionCard>

            <Panel>
              <div className="ops-interactive-title text-[18px] text-white">
                What widens it
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Thin trading", "Fewer buyers and sellers to stand between"],
                  ["Low price", "A fixed gap is a bigger share of a small price"],
                  ["Little coverage", "More chance the other side knows more"],
                ].map(([h, d]) => (
                  <div key={h} className="rounded-xl border border-white/10 p-4">
                    <div className="ops-body-strong text-[15px] text-white">{h}</div>
                    <p className="ops-body mt-2 text-sm text-slate-400">{d}</p>
                  </div>
                ))}
              </div>
              <p className="ops-body mt-5 border-t border-white/10 pt-4 text-[14px] text-slate-300">
                Measured across US stocks, the most heavily traded fifth averaged a
                spread of 0.62% of price. The least traded fifth averaged 2.06%.
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <span className="ops-caption text-[12px] text-slate-400">
                  Guided decision
                </span>
              </div>
              <p className="ops-body-strong mt-4 text-[17px] text-white">
                Which of these will show the widest spread as a percent of its price?
              </p>
              <div className="mt-4 grid gap-3">
                {SPREAD_STOCKS.map((s) => (
                  <Choice
                    key={s.id}
                    selected={spreadChoice === s.id}
                    onClick={() => {
                      setSpreadChoice(s.id);
                      setSpreadChecked(false);
                    }}
                  >
                    <span className="block">{s.label}</span>
                    <span className="mt-1 block text-[14px] text-slate-400">
                      {s.detail}
                    </span>
                  </Choice>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  size="md"
                  disabled={!spreadChoice}
                  onClick={() => {
                    setSpreadChecked(true);
                    if (spreadChoice === "d") onComplete();
                  }}
                >
                  Check the spread
                </Button>
              </div>
              {spreadChecked && (
                <Feedback status={spreadChoice === "d" ? "correct" : "incorrect"}>
                  {spreadChoice === "d"
                    ? "Correct. Three effects stack here. Thin trading means fewer counterparties, a low price makes any fixed gap a larger percentage, and light analyst coverage widens the information gap between you and whoever is on the other side."
                    : "Look for the profile where all three effects stack: thin trading, a low price so the gap is a bigger percentage, and little coverage so the other side is more likely to know something you do not."}
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Panel>
              <p className="ops-body text-[15px] leading-7 text-slate-200">
                You are running a strategy in illiquid names. The average spread is
                4% of price. You hold for two years, and the return you need after
                costs is 10% a year. You pay roughly half the spread when you buy and
                half when you sell.
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <span className="ops-caption text-[12px] text-slate-400">
                  4% spread · two years · 10% needed
                </span>
              </div>
              <p className="ops-body-strong mt-4 text-[17px] text-white">
                What return must your stock picks earn before costs?
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  ["10", "10% — the spread comes out of the profit"],
                  ["104", "10.4%"],
                  ["12", "12.0% — spread the 4% cost over two years"],
                  ["1222", "12.22% — Damodaran's published approximation"],
                  ["1224", "About 12.24% — exact bid/ask treatment"],
                ].map(([id, label]) => (
                  <Choice
                    key={id}
                    selected={hurdleChoice === id}
                    onClick={() => {
                      setHurdleChoice(id);
                      setHurdleChecked(false);
                    }}
                  >
                    {label}
                  </Choice>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  size="md"
                  disabled={!hurdleChoice}
                  onClick={() => {
                    setHurdleChecked(true);
                    if (hurdleChoice === "1224") onComplete();
                  }}
                >
                  Check the hurdle
                </Button>
              </div>
              {hurdleChecked && (
                <Feedback
                  status={hurdleChoice === "1224" ? "correct" : "incorrect"}
                >
                  {hurdleChoice === "1224"
                    ? "Correct. To earn 10% a year for two years on $100 you need $121. Paying 2% on entry means $100 buys $98 of shares. To keep $121 after a 2% exit haircut, divide $121 by 0.98: the shares must sell for about $123.47. Growing $98 to $123.47 over two years requires about 12.24% a year."
                    : hurdleChoice === "1222"
                      ? "12.22% is Damodaran's published approximation. It multiplies $121 by 1.02 to estimate the exit value. Exact bid/ask treatment reverses the 2% exit haircut by dividing $121 by 0.98, so the shares must sell for about $123.47 and the annual hurdle is about 12.24%."
                      : hurdleChoice === "12"
                        ? "This is the natural answer: 10% plus the 4% spread over two years. It ignores compounding and the exact exit haircut. $100 buys $98 of shares, and you must sell them for about $123.47 to keep $121 after the exit cost. That requires about 12.24% a year."
                        : "The spread raises the return you must earn. You need $121 after two years, start with $98 of shares, and must sell them for about $123.47 to keep $121 after the 2% exit haircut."}
                </Feedback>
              )}

              {hurdleChecked && hurdleChoice === "1224" && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                  className="mt-6 rounded-2xl border border-white/10 p-5"
                >
                  <div className="ops-interactive-title text-[17px] text-white">
                    Now move the inputs
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[0.02, 0.04, 0.06].map((s) => (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={labSpread === s}
                        onClick={() => setLabSpread(s)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                          labSpread === s
                            ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                            : "border-white/15 text-slate-200 hover:border-white/30",
                        )}
                      >
                        {pct(s, 0)} spread
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[1, 2, 5].map((y) => (
                      <button
                        key={y}
                        type="button"
                        aria-pressed={labYears === y}
                        onClick={() => setLabYears(y)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                          labYears === y
                            ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                            : "border-white/15 text-slate-200 hover:border-white/30",
                        )}
                      >
                        {y} {y === 1 ? "year" : "years"}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Metric
                      label="Naive hurdle"
                      value={pct(naiveHurdle(REQUIRED_RETURN, labSpread, labYears))}
                      tone="slate"
                    />
                    <Metric
                      label="True hurdle"
                      value={pct(trueHurdle(REQUIRED_RETURN, labSpread, labYears))}
                      tone="amber"
                    />
                    <Metric
                      label="Understated by"
                      value={pct(
                        trueHurdle(REQUIRED_RETURN, labSpread, labYears) -
                          naiveHurdle(REQUIRED_RETURN, labSpread, labYears),
                      )}
                      tone="red"
                    />
                  </div>
                  <p className="ops-body mt-4 text-[14px] leading-6 text-slate-400">
                    Hold the spread and stretch the horizon and the yearly hurdle
                    falls, because one round trip is spread over more years. Widen
                    the spread and it climbs faster than the naive figure suggests.
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 p-4">
                  <ConceptTag concept="market">Illiquidity</ConceptTag>
                  <p className="ops-body mt-3 text-sm text-slate-300">
                    A large order overwhelms the buyers or sellers available, so the
                    price must move to clear it. This part usually reverses.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 p-4">
                  <ConceptTag concept="value">Information</ConceptTag>
                  <p className="ops-body mt-3 text-sm text-slate-300">
                    Others read a large order as a signal that you know something.
                    This part tends to stick.
                  </p>
                </div>
              </div>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <span className="ops-caption text-[12px] text-slate-400">
                  Guided decision
                </span>
              </div>
              <p className="ops-body-strong mt-4 text-[17px] text-white">
                Who pays the most in price impact?
              </p>
              <div className="mt-4 grid gap-3">
                {IMPACT_CHOICES.map((c) => (
                  <Choice
                    key={c.id}
                    selected={impactChoice === c.id}
                    onClick={() => {
                      setImpactChoice(c.id);
                      setImpactChecked(false);
                    }}
                  >
                    {c.label}
                  </Choice>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  size="md"
                  disabled={!impactChoice}
                  onClick={() => {
                    setImpactChecked(true);
                    if (impactChoice === "ls") onComplete();
                  }}
                >
                  Check the impact
                </Button>
              </div>
              {impactChecked && (
                <Feedback status={impactChoice === "ls" ? "correct" : "incorrect"}>
                  {impactChoice === "ls"
                    ? "Correct. Impact is about your order relative to the market that has to absorb it. A large sum in a thinly traded stock is the worst pairing — and notice that this is the same profile that already carries the widest spread, so the two costs compound."
                    : "Impact depends on the size of your order relative to how much of that stock normally trades. Ask which pairing puts the most money into the thinnest market."}
                </Feedback>
              )}
              {impactChecked && impactChoice === "ls" && (
                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="ops-interactive-title text-[17px] text-white">
                    Three consequences
                  </div>
                  <ul className="mt-3 space-y-2 text-[14px] leading-6 text-slate-300">
                    <li>
                      Strategies aimed at small, illiquid stocks deserve extra
                      scepticism, because spread and impact both bite hardest there.
                    </li>
                    <li>
                      Strategies that must trade instantly pay the most, since
                      breaking an order up is what reduces impact.
                    </li>
                    <li>
                      A strategy that worked with a small amount of money can stop
                      working when it scales up.
                    </li>
                  </ul>
                </div>
              )}
            </InteractiveFrame>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Panel>
              <p className="ops-body text-[15px] leading-7 text-slate-200">
                Wait to trade and one of two things can happen. You buy anyway, but at
                a worse price, so the profit shrinks. Or the price moves so far that
                the opportunity is gone and you never trade at all.
              </p>
              <p className="ops-body mt-4 border-t border-white/10 pt-4 text-[14px] text-slate-400">
                Waiting hurts most when your reason to trade is information others
                could also find, when many investors are hunting the same thing, when
                the horizon is short, and when you are moving with the crowd rather
                than against it.
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <span className="ops-caption text-[12px] text-slate-400">
                  Guided decision
                </span>
              </div>
              <p className="ops-body-strong mt-4 text-[17px] text-white">
                For which strategy is waiting most expensive?
              </p>
              <div className="mt-4 grid gap-3">
                {WAITING_CHOICES.map((c) => (
                  <Choice
                    key={c.id}
                    selected={waitingChoice === c.id}
                    onClick={() => {
                      setWaitingChoice(c.id);
                      setWaitingChecked(false);
                    }}
                  >
                    {c.label}
                  </Choice>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  size="md"
                  disabled={!waitingChoice}
                  onClick={() => {
                    setWaitingChecked(true);
                    if (waitingChoice === "mom-info") onComplete();
                  }}
                >
                  Check the cost
                </Button>
              </div>
              {waitingChecked && (
                <Feedback
                  status={waitingChoice === "mom-info" ? "correct" : "incorrect"}
                >
                  {waitingChoice === "mom-info"
                    ? "Correct. Two things make waiting expensive at once here. The reason to trade is news others are also receiving, so the information has a short shelf life. And the strategy moves with the price, so every day you wait the move you were trying to catch has already happened."
                    : "Ask two questions. Is the reason to trade something others will also discover soon? And is the price moving in your direction while you wait? Where both are true, delay costs the most."}
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Panel>
              <div className="ops-interactive-title text-[18px] text-white">
                Four ways to keep the tax bite down
              </div>
              <ul className="mt-4 space-y-2.5 text-[15px] leading-6 text-slate-200">
                <li>Trade less. Every realised gain is taxed sooner.</li>
                <li>
                  Allow for tax when you buy, not only when you sell — how a holding
                  pays you matters.
                </li>
                <li>Allow for tax when you sell, and set losses against gains.</li>
                <li>
                  Do not buy something only to avoid tax. Investments built for that
                  are usually poor investments.
                </li>
              </ul>
              <p className="ops-body mt-4 border-t border-white/10 pt-4 text-[14px] text-slate-400">
                Specific rates, accounts and rules are handled in mission 13, using
                current tax-authority sources rather than this source session.
              </p>
            </Panel>

            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TryItTag />
                <span className="ops-caption text-[12px] text-slate-400">
                  Guided decision
                </span>
              </div>
              <p className="ops-body-strong mt-4 text-[17px] text-white">
                Which combination leaves the smallest gap between your pre-tax and
                after-tax return?
              </p>
              <div className="mt-4 grid gap-3">
                {TAX_CHOICES.map((c) => (
                  <Choice
                    key={c.id}
                    selected={taxChoice === c.id}
                    onClick={() => {
                      setTaxChoice(c.id);
                      setTaxChecked(false);
                    }}
                  >
                    {c.label}
                  </Choice>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  size="md"
                  disabled={!taxChoice}
                  onClick={() => {
                    setTaxChecked(true);
                    if (taxChoice === "long-index") onComplete();
                  }}
                >
                  Check the tax bite
                </Button>
              </div>
              {taxChecked && (
                <Feedback
                  status={taxChoice === "long-index" ? "correct" : "incorrect"}
                >
                  {taxChoice === "long-index"
                    ? "Correct. Two effects point the same way. A longer holding period defers the tax so more of your money keeps compounding, and an index fund trades far less internally, so it hands you fewer taxable events you did not choose."
                    : "Two things drive the bite: how long you hold, and how much trading happens inside the fund. Pick the option that minimises both."}
                </Feedback>
              )}
            </InteractiveFrame>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <InteractiveFrame>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="ops-caption text-[12px] text-accent-amber">
                    Original OPS decision case
                  </div>
                  <h3 className="ops-body-strong mt-2 text-xl text-white">
                    Friction Budget
                  </h3>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300">
                  {(Object.keys(BUDGET_OPTIONS) as BudgetKey[]).filter((k) => budget[k]).length} of 5 answered
                </span>
              </div>

              <p className="ops-body mt-4 text-[14px] leading-6 text-slate-400">
                The percentage chips below are illustrative OPS scenario assumptions.
                They help you form a provisional estimate; they are not measured costs
                for your account or evidence that an active strategy will work.
              </p>

              <div className="mt-6 space-y-6">
                <BudgetQuestion
                  label="How often do you expect to trade?"
                  options={BUDGET_OPTIONS.turnoverExpectation}
                  value={budget.turnoverExpectation}
                  onSelect={(id) =>
                    setBudget((b) => ({ ...b, turnoverExpectation: id }))
                  }
                />
                <BudgetQuestion
                  label="What kind of holdings will you own?"
                  options={BUDGET_OPTIONS.spreadClass}
                  value={budget.spreadClass}
                  onSelect={(id) => setBudget((b) => ({ ...b, spreadClass: id }))}
                />
                <BudgetQuestion
                  label="How large are your orders next to normal trading volume?"
                  options={BUDGET_OPTIONS.priceImpactExposure}
                  value={budget.priceImpactExposure}
                  onSelect={(id) =>
                    setBudget((b) => ({ ...b, priceImpactExposure: id }))
                  }
                />
                <BudgetQuestion
                  label="How quickly do you need to act on an idea?"
                  options={BUDGET_OPTIONS.waitingSensitivity}
                  value={budget.waitingSensitivity}
                  onSelect={(id) =>
                    setBudget((b) => ({ ...b, waitingSensitivity: id }))
                  }
                />
                <BudgetQuestion
                  label="Where will you hold this, and for how long?"
                  options={BUDGET_OPTIONS.taxSetting}
                  value={budget.taxSetting}
                  onSelect={(id) => setBudget((b) => ({ ...b, taxSetting: id }))}
                />
              </div>

              {budgetComplete && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Metric
                      label="OPS illustrative drag estimate"
                      value={pct(totalDrag, 1)}
                      tone="amber"
                    />
                    <Metric
                      label="Historical Session 6 reference"
                      value={totalDrag > 0.01 ? "Higher than 1%" : "At or below 1%"}
                      tone={totalDrag > 0.01 ? "red" : "green"}
                    />
                  </div>
                  <div className="mt-4 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.07] p-4">
                    <div className="ops-caption text-[12px] text-accent-amber">
                      Your hurdle rule
                    </div>
                    <p className="ops-body-strong mt-2 text-[16px] text-white">
                      {hurdleRule}
                    </p>
                  </div>
                  <p className="ops-body mt-4 text-[14px] leading-6 text-slate-400">
                    These per-choice figures are OPS estimates for teaching, not
                    measurements or forecasts. Mission 10 must treat their sum as your
                    provisional scenario assumption, then demand evidence that an active
                    claim can survive it.
                  </p>
                </motion.div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                <Button
                  size="md"
                  disabled={!budgetComplete}
                  onClick={() => saveBudget(onComplete)}
                >
                  Save to your plan
                </Button>
                {!budgetComplete && (
                  <span className="text-xs text-slate-400">
                    Answer all five to save the budget.
                  </span>
                )}
                {(savedThisVisit || frictionBudget.updatedAt) && (
                  <span className="text-xs text-accent-green">
                    Friction Budget saved.
                  </span>
                )}
              </div>
            </InteractiveFrame>

            {completed && (
              <Panel>
                <div className="ops-caption text-[12px] text-accent-green">
                  Mission status
                </div>
                <p className="ops-body-strong mt-2 text-[16px] text-white">
                  Complete. Mission 8 now adds your friction budget to your plan, and
                  its hurdle limits what mission 10 can approve.
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
      ariaLabel="Guided Lesson 6.1 friction journey"
      stages={STAGES}
      renderStage={renderStage}
      labLabel="Guided cost lab"
      finishHref="/plan"
      finishLabel="See your plan"
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
      <div className={cn("mt-2 text-2xl font-semibold tabular-nums", toneClass)}>
        {value}
      </div>
    </div>
  );
}

function BudgetQuestion({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly { id: string; label: string; drag: number }[];
  value: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="ops-body-strong text-[15px] text-white">{label}</div>
      <div className="mt-3 grid gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onSelect(o.id)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              value === o.id
                ? "border-accent-amber/50 bg-accent-amber/10 text-white"
                : "border-white/10 text-slate-300 hover:border-white/25 hover:text-white",
            )}
          >
            <span>{o.label}</span>
            <span
              className={cn(
                "flex-shrink-0 tabular-nums text-[14px]",
                value === o.id ? "text-accent-amber" : "text-slate-500",
              )}
            >
              +{(o.drag * 100).toFixed(1)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
