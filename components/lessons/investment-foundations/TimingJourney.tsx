"use client";

import { useMemo, useState } from "react";
import ValuationJourneyShell, {
  type ValuationStage,
} from "./ValuationJourneyShell";
import {
  BREAK_EVEN_HIT_RATE,
  EXPIRY_MONTHS,
  ILLUSTRATIVE_PATH,
  simulateTiming,
  type ExitChoice,
  type ReentryChoice,
} from "@/lib/timing-policy";
import {
  EMPTY_TIMING_POLICY,
  isTimingPolicyComplete,
  useIFProgress,
  type TimingPolicy,
} from "@/lib/if-progress";
import ChoiceGroup from "./ChoiceGroup";
import { cn } from "@/lib/utils";

const LESSON_SLUG = "if-pb-11-set-a-market-timing-policy";

const STAGES: readonly ValuationStage[] = [
  {
    label: "Deviation",
    title: "Timing is a deviation, not a separate game",
    guide:
      "You already chose weights in Mission 5 for reasons you wrote down. Timing means moving away from them on purpose. Everything in this mission is measured against that line.",
    instruction: "See what your policy weights are, then price a move away from them.",
    next: "Continue to the timeline",
  },
  {
    label: "Cost",
    title: "The cost runs in both directions",
    guide:
      "Being out of the market when it rises costs as surely as being in when it falls. Choose when you leave, then choose what brings you back.",
    instruction: "Set an exit and a re-entry rule, and watch the path.",
    next: "Continue to the signal test",
  },
  {
    label: "Signal",
    title: "Test the signal against its own record",
    guide:
      "A rule of thumb is a claim. Damodaran's own tables test two of the most repeated ones. Check them before you trust a headline.",
    instruction: "Judge whether each rule of thumb survives its own record.",
    next: "Continue to your policy",
  },
  {
    label: "Policy",
    title: "Write the policy you will actually follow",
    guide:
      "No timing is a decision, not a blank. A bounded tilt is a decision too — but only if every field is filled, because a rule without an expiry is a wish.",
    instruction: "Declare no timing, or specify a bounded rule in full.",
    next: "Continue to the headline",
  },
  {
    label: "Headline",
    title: "A headline you did not plan for",
    guide:
      "Here is something that did not exist when you wrote your policy. The question is not whether it sounds convincing. The question is whether it meets what you wrote.",
    instruction: "Decide, then name the condition that settled it.",
    next: "Continue to save",
  },
  {
    label: "Save",
    title: "Save the timing policy",
    guide:
      "This becomes the rule that later missions check against. Holdings and the flight test both read it.",
    instruction: "Save it to the dossier.",
    next: "Return to Investment Foundations",
  },
];

const EXITS: { id: ExitChoice; label: string; hint: string }[] = [
  { id: "hold", label: "Stay at policy weights", hint: "No deviation at all." },
  {
    id: "first-drop",
    label: "Leave on the first drop",
    hint: "Act early, before the decline is obvious.",
  },
  {
    id: "confirmed",
    label: "Leave once the drop is confirmed",
    hint: "Wait for certainty before moving.",
  },
];

const REENTRIES: { id: ReentryChoice; label: string; hint: string }[] = [
  {
    id: "expiry",
    label: `A fixed expiry — return after ${EXPIRY_MONTHS} months`,
    hint: "You come back on the date, right or wrong.",
  },
  {
    id: "stop-rule",
    label: "A stop rule — return when the level recovers",
    hint: "A written observation ends it.",
  },
  {
    id: "feels-safe",
    label: "When it feels safe",
    hint: "No date, no observation.",
  },
];

/** Session 32 slide 8. Period is not stated on the source slide. */
const TBILL_ROWS = [
  { band: "Drop by more than 1%", years: 12, up: "66.67%", avg: "9.65%" },
  { band: "Drop between 0 and 1%", years: 28, up: "75.00%", avg: "12.90%" },
  { band: "Increase between 0 and 1%", years: 28, up: "71.43%", avg: "12.37%" },
  { band: "Increase by more than 1%", years: 15, up: "66.67%", avg: "11.78%" },
];

/** Session 32 slide 13. Period is not stated on the source slide. */
const GDP_ROWS = [
  { band: "Above 5%", years: 23, avg: "10.04%", sd: "19.42%" },
  { band: "3.5% to 5%", years: 25, avg: "13.38%", sd: "12.26%" },
  { band: "2% to 3.5%", years: 9, avg: "14.08%", sd: "16.41%" },
  { band: "0% to 2%", years: 7, avg: "−3.40%", sd: "11.50%" },
  { band: "Below 0%", years: 17, avg: "15.11%", sd: "29.84%" },
  { band: "All years", years: 82, avg: "11.16%", sd: "20.02%" },
];

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="ops-caption block text-[12px] text-slate-400">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 min-h-11 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[15px] text-white placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
      />
    </label>
  );
}

export default function TimingJourney() {
  const {
    ready,
    frictionBudget,
    architectureDecision,
    timingPolicy,
    saveTimingPolicy,
  } = useIFProgress();

  const [exit, setExit] = useState<ExitChoice | null>(null);
  const [reentry, setReentry] = useState<ReentryChoice | null>(null);
  const [tbillVerdict, setTbillVerdict] = useState<string>("");
  const [gdpVerdict, setGdpVerdict] = useState<string>("");
  const [policy, setPolicy] = useState<TimingPolicy>(EMPTY_TIMING_POLICY);
  const [headlineChoice, setHeadlineChoice] = useState<string>("");
  const [saved, setSaved] = useState(false);

  /**
   * The learner's own friction, not a stand-in. Mission 8 saves an estimated
   * annual drag; a round trip is two legs, so one leg is half of it. Falls back
   * to a labelled 0.5% only when Mission 8 has not been done yet.
   */
  const frictionOneWay = useMemo(() => {
    const annualDrag = Number(frictionBudget?.estimatedAnnualDrag ?? 0);
    return Number.isFinite(annualDrag) && annualDrag > 0 ? annualDrag / 2 : 0.5;
  }, [frictionBudget]);

  const outcome = useMemo(
    () =>
      exit ? simulateTiming(exit, reentry ?? "feels-safe", frictionOneWay) : null,
    [exit, reentry, frictionOneWay],
  );

  const licenceValid = Boolean(architectureDecision?.updatedAt);

  const renderStage = (stage: number, onComplete: () => void) => {
    if (stage === 0) return <StageDeviation onComplete={onComplete} />;
    if (stage === 1)
      return (
        <StageCost
          exit={exit}
          reentry={reentry}
          setExit={setExit}
          setReentry={setReentry}
          outcome={outcome}
          frictionOneWay={frictionOneWay}
          onComplete={onComplete}
        />
      );
    if (stage === 2)
      return (
        <StageSignal
          tbillVerdict={tbillVerdict}
          gdpVerdict={gdpVerdict}
          setTbillVerdict={setTbillVerdict}
          setGdpVerdict={setGdpVerdict}
          onComplete={onComplete}
        />
      );
    if (stage === 3)
      return (
        <StagePolicy
          policy={policy}
          setPolicy={setPolicy}
          frictionOneWay={frictionOneWay}
          licenceValid={licenceValid}
          onComplete={onComplete}
        />
      );
    if (stage === 4)
      return (
        <StageHeadline
          policy={policy}
          choice={headlineChoice}
          setChoice={setHeadlineChoice}
          onComplete={onComplete}
        />
      );
    return (
      <StageSave
        policy={policy}
        frictionOneWay={frictionOneWay}
        saved={saved || Boolean(timingPolicy?.updatedAt)}
        onSave={() => {
          saveTimingPolicy({
            ...policy,
            frictionCostPct: Number((frictionOneWay * 2).toFixed(3)),
            updatedAt: "",
          });
          setSaved(true);
          onComplete();
        }}
      />
    );
  };

  const restored = ready && Boolean(timingPolicy?.updatedAt);

  return (
    <ValuationJourneyShell
      key={restored ? timingPolicy.updatedAt : "fresh"}
      // Saving stamps updatedAt, which changes the key above and remounts the
      // shell. Without these the remount dropped the learner back on stage 1
      // with their work apparently gone. A saved policy is the terminal state,
      // so restore it there.
      initialCompleted={restored ? STAGES.map(() => true) : undefined}
      initialStage={restored ? STAGES.length - 1 : undefined}
      lessonSlug={LESSON_SLUG}
      ariaLabel="Set a market-timing policy"
      labLabel="Guided timing lab"
      savedArtifactLabel="Timing Policy"
      stages={STAGES}
      renderStage={renderStage}
    />
  );
}

function StageDeviation({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-5">
      <p className="ops-body text-[16px] leading-7 text-slate-200">
        In Mission 5 you set strategic weights from your horizon, your cash needs and how
        much loss you could carry. Market timing is not a separate activity from that. It is
        a decision to hold different weights than the ones your own reasons produced,
        because you believe something about what happens next.
      </p>
      <div className="ops-definition-card p-5">
        <div className="ops-caption text-[12px] text-accent-amber">The bar</div>
        <p className="ops-body-strong mt-2 text-[16px] text-white">
          Sharpe put the break-even at telling a good year from a bad one{" "}
          <strong>seven times out of ten</strong>. Chua, Woodward and To put it at{" "}
          <strong>
            {BREAK_EVEN_HIT_RATE.low}–{BREAK_EVEN_HIT_RATE.high}%
          </strong>
          . Below that, timing loses money even before you pay to trade.
        </p>
        <p className="mt-3 text-[13px] text-slate-400">
          Damodaran, Investment Philosophies Session 30. Sharpe 1975; Chua, Woodward and To,
          Monte Carlo simulation on the Canadian market.
        </p>
      </div>
      <button
        type="button"
        onClick={onComplete}
        className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
      >
        I understand the bar
      </button>
    </div>
  );
}

function StageCost({
  exit,
  reentry,
  setExit,
  setReentry,
  outcome,
  frictionOneWay,
  onComplete,
}: {
  exit: ExitChoice | null;
  reentry: ReentryChoice | null;
  setExit: (v: ExitChoice) => void;
  setReentry: (v: ReentryChoice) => void;
  outcome: ReturnType<typeof simulateTiming> | null;
  frictionOneWay: number;
  onComplete: () => void;
}) {
  const showResult = exit !== null && (exit === "hold" || reentry !== null);
  return (
    <div className="space-y-6">
      <p className="ops-body text-[15px] leading-7 text-slate-300">
        An illustrative path — not history, not any real index, not a forecast. It declines,
        recovers, then rises. Your friction is charged from your saved Mission 8 budget at{" "}
        {frictionOneWay.toFixed(2)}% each way.
      </p>

      <div>
        <h3 className="ops-body-strong mb-2 text-[16px] text-white">
          1 · When do you leave?
        </h3>
        <ChoiceGroup
          label="When do you leave policy weights?"
          className="grid gap-2 sm:grid-cols-3"
          value={exit}
          onChange={setExit}
          options={EXITS}
        />
      </div>

      {exit !== null && exit !== "hold" && (
        <div>
          <h3 className="ops-body-strong mb-2 text-[16px] text-white">
            2 · What brings you back?
          </h3>
          <ChoiceGroup
            label="What brings you back?"
            className="grid gap-2 sm:grid-cols-3"
            value={reentry}
            onChange={setReentry}
            options={REENTRIES}
          />
        </div>
      )}

      {showResult && outcome && (
        <div className="ops-definition-card p-5">
          <TimelineTable outcome={outcome} />
          {!outcome.resolved && (
            <p
              className="mt-4 rounded-lg border border-accent-amber/40 bg-accent-amber/10 p-3 text-[15px] text-white"
              role="status"
            >
              <strong>This deviation never ended.</strong> There was no date and no
              observation to bring you back, so you were out of policy for the rest of the
              window and the cost was still running when it closed. &ldquo;When it feels
              safe&rdquo; is not a neutral wait — it is an unbounded deviation.
            </p>
          )}
          <p className="mt-4 text-[14px] text-slate-300">
            Change the re-entry rule and leave the exit alone. The same exit can help or
            hurt depending only on what ends it — which is why the rule that brings you back
            is the real decision.
          </p>
        </div>
      )}

      {showResult && (
        <button
          type="button"
          onClick={onComplete}
          className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
        >
          Record this path
        </button>
      )}
    </div>
  );
}

/**
 * The table is the primary artifact, not a fallback for a chart. Every number a
 * learner needs to reason about the path is here in text.
 */
function TimelineTable({
  outcome,
}: {
  outcome: ReturnType<typeof simulateTiming>;
}) {
  const rows = [
    {
      k: "Months out of policy",
      v: `${outcome.monthsOutOfPolicy} of ${ILLUSTRATIVE_PATH.length}`,
    },
    {
      k: "Friction charged",
      v: `${outcome.frictionChargedPct.toFixed(2)}%`,
    },
    {
      k: "Deviation ended",
      v: outcome.resolved
        ? `Month ${outcome.reentryMonth}`
        : "Never — still out of policy",
    },
    { k: "Ending value", v: outcome.endingValue.toFixed(1) },
    { k: "Policy ending value", v: outcome.policyEndingValue.toFixed(1) },
  ];
  const gap = outcome.gapVsPolicyPct;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[15px]">
        <caption className="sr-only">
          Result of your timing choice against staying at policy weights
        </caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.k} className="border-b border-white/10">
              <th scope="row" className="py-2 pr-4 font-normal text-slate-400">
                {r.k}
              </th>
              <td className="py-2 tabular-nums text-white">{r.v}</td>
            </tr>
          ))}
          <tr>
            <th scope="row" className="py-2 pr-4 font-normal text-slate-400">
              Against policy
            </th>
            <td
              className={cn(
                "py-2 tabular-nums font-semibold",
                gap > 0.05
                  ? "text-accent-green"
                  : gap < -0.05
                    ? "text-accent-amber"
                    : "text-white",
              )}
            >
              {gap >= 0 ? "+" : ""}
              {gap.toFixed(1)}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function RecordTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[14px]">
        <caption className="ops-caption pb-2 text-left text-[12px] text-slate-400">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-white/15">
            {head.map((h) => (
              <th key={h} scope="col" className="py-2 pr-4 font-medium text-slate-300">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/8">
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    "py-2 pr-4",
                    j === 0 ? "text-slate-300" : "tabular-nums text-white",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StageSignal({
  tbillVerdict,
  gdpVerdict,
  setTbillVerdict,
  setGdpVerdict,
  onComplete,
}: {
  tbillVerdict: string;
  gdpVerdict: string;
  setTbillVerdict: (v: string) => void;
  setGdpVerdict: (v: string) => void;
  onComplete: () => void;
}) {
  const both = tbillVerdict !== "" && gdpVerdict !== "";
  return (
    <div className="space-y-6">
      <div className="ops-definition-card p-5">
        <div className="ops-caption text-[12px] text-accent-amber">
          Before you read the tables
        </div>
        <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
          Prices already contain what people expect. So the <em>level</em> of growth is not
          the signal — the <em>surprise</em> is. A strong economy that was expected to be
          stronger is a disappointment, and prices fall on it. Keep that in mind: it is the
          reason the two tables below look the way they do.
        </p>
        <p className="mt-3 text-[13px] text-slate-400">
          Damodaran, Investment Philosophies Session 32, test question 5 and its solution.
        </p>
      </div>

      <div className="space-y-3">
        <p className="ops-body-strong text-[16px] text-white">
          Rule of thumb 1: &ldquo;Buy stocks when T-bill rates have dropped.&rdquo;
        </p>
        <RecordTable
          caption="Next-year US stock returns sorted by the change in the T-bill rate. Session 32, slide 8 — an 83-year sample; the period is not stated on the source slide."
          head={["Change in T-bill rate", "Years", "% up", "Average return"]}
          rows={TBILL_ROWS.map((r) => [r.band, r.years, r.up, r.avg])}
        />
        <ChoiceGroup
          label="Does rule of thumb 1 survive its record?"
          className="grid gap-2 sm:grid-cols-2"
          value={tbillVerdict}
          onChange={setTbillVerdict}
          options={[
            {
              id: "fails" as const,
              label: "It does not survive",
              hint: "The biggest drops produced the lowest returns.",
            },
            {
              id: "holds" as const,
              label: "It survives",
              hint: "Falling rates were followed by better returns.",
            },
          ]}
        />
        {tbillVerdict !== "" && (
          <p className="rounded-lg border border-white/12 bg-white/[0.03] p-4 text-[15px] text-slate-200">
            {tbillVerdict === "fails" ? "Correct. " : "Look again at the first row. "}
            The largest drops (over 1%) were followed by the <strong>lowest</strong> average
            return in the table, 9.65%, below the 11.78% that followed the largest
            increases. Damodaran&rsquo;s own test solution puts it plainly: &ldquo;there is
            no basis for this statement. Stocks seem just as likely to go up in a year after
            short term interest rates go up as down.&rdquo;
          </p>
        )}
      </div>

      <div className="space-y-3">
        <p className="ops-body-strong text-[16px] text-white">
          Rule of thumb 2: &ldquo;Buy stocks when the economy is growing strongly.&rdquo;
        </p>
        <RecordTable
          caption="Next-year US stock returns sorted by real GDP growth. Session 32, slide 13 — an 82-year sample; the period is not stated on the source slide."
          head={["Real GDP growth", "Years", "Average return", "Std deviation"]}
          rows={GDP_ROWS.map((r) => [r.band, r.years, r.avg, r.sd])}
        />
        <ChoiceGroup
          label="Does rule of thumb 2 survive its record?"
          className="grid gap-2 sm:grid-cols-2"
          value={gdpVerdict}
          onChange={setGdpVerdict}
          options={[
            {
              id: "fails" as const,
              label: "It does not survive",
              hint: "The ordering does not follow growth.",
            },
            {
              id: "holds" as const,
              label: "It survives",
              hint: "Stronger growth was followed by better returns.",
            },
          ]}
        />
        {gdpVerdict !== "" && (
          <p className="rounded-lg border border-white/12 bg-white/[0.03] p-4 text-[15px] text-slate-200">
            {gdpVerdict === "fails" ? "Correct. " : "Compare the top and bottom rows. "}
            The <strong>highest</strong> average return followed years when GDP growth was{" "}
            <strong>negative</strong> (15.11%), and the worst followed mild 0–2% growth
            (−3.40%). The strongest growth years returned 10.04%, below the 82-year average
            of 11.16%. Note the small cells — 7 and 9 years — and the standard deviations up
            to 29.84%. The honest reading is not &ldquo;recessions are bullish.&rdquo; It is
            that this ordering is not reliable enough to act on.
          </p>
        )}
      </div>

      <div className="ops-definition-card p-5">
        <div className="ops-caption text-[12px] text-accent-amber">
          One signal did work — and then stopped
        </div>
        <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
          Breen, Glosten and Jagannathan (1989) found that switching between stocks and cash
          on the level of the T-bill rate would have added about 2% in excess returns. Then
          Abhyankar and Davies (2002) looked across 1929–2000 and found almost all of that
          predictability came from <strong>1950–1975</strong>, with almost none after 1975.
        </p>
        <p className="ops-body-strong mt-3 text-[15px] text-white">
          A signal can be real and still expire. That is why the policy you write next needs
          a review date, not just a rule.
        </p>
      </div>

      {both && (
        <button
          type="button"
          onClick={onComplete}
          className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
        >
          Record both verdicts
        </button>
      )}
    </div>
  );
}

function StagePolicy({
  policy,
  setPolicy,
  frictionOneWay,
  licenceValid,
  onComplete,
}: {
  policy: TimingPolicy;
  setPolicy: (p: TimingPolicy) => void;
  frictionOneWay: number;
  licenceValid: boolean;
  onComplete: () => void;
}) {
  const set = (patch: Partial<TimingPolicy>) => setPolicy({ ...policy, ...patch });
  const complete = isTimingPolicyComplete({ ...policy, updatedAt: "x" });

  return (
    <div className="space-y-6">
      {!licenceValid && (
        <p className="rounded-lg border border-accent-amber/40 bg-accent-amber/10 p-4 text-[15px] text-white">
          Mission 10 has not saved an architecture decision yet. A timing policy operates on
          your architecture, so finish that first — you can still draft here, but the saved
          policy will be marked for review.
        </p>
      )}

      <ChoiceGroup
        label="Which policy are you writing?"
        className="grid gap-2 sm:grid-cols-2"
        value={policy.mode}
        onChange={(mode) => set({ mode })}
        options={[
          {
            id: "no-timing" as const,
            label: "No timing",
            hint: "You will hold policy weights regardless of the news.",
          },
          {
            id: "bounded" as const,
            label: "A bounded tilt",
            hint: "A deviation with a written limit and an end.",
          },
        ]}
      />

      {policy.mode !== "" && (
        <Field
          id="timing-reason"
          label="Why — in your own words"
          value={policy.reason}
          onChange={(v) => set({ reason: v })}
          placeholder={
            policy.mode === "no-timing"
              ? "e.g. My horizon is long and I have no signal that passed my evidence test."
              : "e.g. I will act only on a signal I have already tested."
          }
        />
      )}

      {policy.mode === "bounded" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="timing-signal"
            label="Signal — the condition that must be true"
            value={policy.signal}
            onChange={(v) => set({ signal: v })}
          />
          <Field
            id="timing-benchmark"
            label="Benchmark it is measured against"
            value={policy.benchmark}
            onChange={(v) => set({ benchmark: v })}
          />
          <Field
            id="timing-max-deviation"
            label="Maximum deviation from policy weights (%)"
            type="number"
            value={policy.maxDeviationPct ? String(policy.maxDeviationPct) : ""}
            onChange={(v) => set({ maxDeviationPct: Number(v) || 0 })}
          />
          <Field
            id="timing-sleeve"
            label="Eligible sleeve"
            value={policy.eligibleSleeve}
            onChange={(v) => set({ eligibleSleeve: v })}
          />
          <Field
            id="timing-expiry"
            label="Expiry — the date it ends regardless"
            type="date"
            value={policy.expiryDate}
            onChange={(v) => set({ expiryDate: v })}
          />
          <Field
            id="timing-falsifier"
            label="Falsifier — what ends it early"
            value={policy.falsifier}
            onChange={(v) => set({ falsifier: v })}
          />
          <Field
            id="timing-review"
            label="Review date"
            type="date"
            value={policy.reviewDate}
            onChange={(v) => set({ reviewDate: v })}
          />
        </div>
      )}

      {policy.mode === "bounded" && policy.maxDeviationPct > 0 && (
        <p className="rounded-lg border border-white/12 bg-white/[0.03] p-4 text-[15px] text-slate-200">
          Moving {policy.maxDeviationPct}% of the portfolio out and back costs{" "}
          <strong className="tabular-nums">
            {((policy.maxDeviationPct * frictionOneWay * 2) / 100).toFixed(3)}%
          </strong>{" "}
          of the whole portfolio in friction, from your saved Mission 8 budget. Your signal
          has to beat that before it beats anything else.
        </p>
      )}

      {policy.mode !== "" && !complete && (
        <p className="text-[14px] text-slate-400">
          {policy.mode === "no-timing"
            ? "State your reason to continue."
            : "Every field is required. A rule with no expiry or no falsifier is not a policy — it is an open-ended deviation."}
        </p>
      )}

      {complete && (
        <button
          type="button"
          onClick={onComplete}
          className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
        >
          Lock this policy draft
        </button>
      )}
    </div>
  );
}

function StageHeadline({
  policy,
  choice,
  setChoice,
  onComplete,
}: {
  policy: TimingPolicy;
  choice: string;
  setChoice: (v: string) => void;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="ops-definition-card p-5">
        <div className="ops-caption text-[12px] text-accent-amber">
          Illustrative headline — not a real event
        </div>
        <p className="ops-body-strong mt-2 text-[17px] leading-7 text-white">
          &ldquo;Strategists split as growth data surprises: three major banks cut equity
          weightings this week, two raised them.&rdquo;
        </p>
      </div>

      <p className="ops-body text-[15px] leading-7 text-slate-300">
        {policy.mode === "no-timing"
          ? "You wrote a no-timing policy. What does it tell you to do?"
          : "Check it against what you actually wrote: your signal, your benchmark, your falsifier."}
      </p>

      <ChoiceGroup
        label="What do you do?"
        className="grid gap-2"
        value={choice}
        onChange={setChoice}
        options={[
          {
            id: "decline" as const,
            label: "Take no action",
            hint: "Nothing here meets a condition I wrote down.",
          },
          {
            id: "act" as const,
            label: "Reduce equities now",
            hint: "The disagreement itself looks like a warning.",
          },
        ]}
      />

      {choice !== "" && (
        <p className="rounded-lg border border-white/12 bg-white/[0.03] p-4 text-[15px] text-slate-200">
          {choice === "decline" ? (
            <>
              <strong>Policy-consistent.</strong> Disagreement among strategists is not a
              signal — it is the normal state. Damodaran&rsquo;s Session 34 shows sixteen
              named strategists on one date recommending anywhere from 50% to 80% in stocks
              and 0% to 25% in cash. And Campbell and Harvey found that newsletters raised
              equity weights 58% of the time before market upturns — and 53% of the time
              before downturns. A five-point gap is not information you can act on.
            </>
          ) : (
            <>
              <strong>This is a deviation your own policy did not authorise.</strong> It is
              not scored wrong — it is shown for what it is. Ask which written condition
              this headline met. If the answer is none, then what moved you was the
              confidence in the story, which is exactly what Campbell and Harvey measured:
              newsletters raised equity weights 58% of the time before upturns and 53%
              before downturns, across 237 newsletters over 1980–1992.
            </>
          )}
        </p>
      )}

      {choice !== "" && (
        <button
          type="button"
          onClick={onComplete}
          className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
        >
          Record my decision
        </button>
      )}
    </div>
  );
}

function StageSave({
  policy,
  frictionOneWay,
  saved,
  onSave,
}: {
  policy: TimingPolicy;
  frictionOneWay: number;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="ops-definition-card p-5">
        <h3 className="ops-body-strong text-[16px] text-white">Your timing policy</h3>
        <dl className="mt-3 space-y-2 text-[15px]">
          <div className="flex gap-3">
            <dt className="w-40 flex-shrink-0 text-slate-400">Mode</dt>
            <dd className="text-white">
              {policy.mode === "no-timing"
                ? "No timing"
                : policy.mode === "bounded"
                  ? "Bounded tilt"
                  : "Not chosen yet"}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-40 flex-shrink-0 text-slate-400">Reason</dt>
            <dd className="text-white">{policy.reason || "—"}</dd>
          </div>
          {policy.mode === "bounded" && (
            <>
              <div className="flex gap-3">
                <dt className="w-40 flex-shrink-0 text-slate-400">Signal</dt>
                <dd className="text-white">{policy.signal}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-40 flex-shrink-0 text-slate-400">Max deviation</dt>
                <dd className="tabular-nums text-white">{policy.maxDeviationPct}%</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-40 flex-shrink-0 text-slate-400">Expires</dt>
                <dd className="tabular-nums text-white">{policy.expiryDate}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-40 flex-shrink-0 text-slate-400">Ends early if</dt>
                <dd className="text-white">{policy.falsifier}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-40 flex-shrink-0 text-slate-400">Review</dt>
                <dd className="tabular-nums text-white">{policy.reviewDate}</dd>
              </div>
            </>
          )}
          <div className="flex gap-3">
            <dt className="w-40 flex-shrink-0 text-slate-400">Round-trip friction</dt>
            <dd className="tabular-nums text-white">
              {(frictionOneWay * 2).toFixed(2)}%
            </dd>
          </div>
        </dl>
      </div>
      <p className="text-[13px] text-slate-400">
        Saved in this browser. Educational material, not investment advice, and not
        permission to trade.
      </p>
      <button
        type="button"
        disabled={saved || !isTimingPolicyComplete({ ...policy, updatedAt: "x" })}
        onClick={onSave}
        className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
      >
        {saved ? "Timing Policy saved ✓" : "Save the Timing Policy"}
      </button>
      {!saved && !isTimingPolicyComplete({ ...policy, updatedAt: "x" }) && (
        <p className="text-[14px] text-slate-400">
          Go back to the policy stage and finish it first — an incomplete policy is
          exactly what this mission is here to prevent.
        </p>
      )}
    </div>
  );
}
