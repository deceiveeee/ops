"use client";

import { useState } from "react";
import { useIFProgress } from "@/lib/if-progress";
import BondJourneyShell, {
  BondChoice,
  BondFeedback,
  BondPanel,
  Metric,
  MissionPrompt,
  type BondSceneProps,
} from "./BondJourneyShell";
import { cn } from "@/lib/utils";

const LESSON_SLUG = "if-2-5-from-credit-rating-to-bond-price";

const STEPS = [
  {
    label: "Build",
    title: "Build the required yield",
    guide:
      "Investors start with a maturity-matched risk-free yield and add compensation for default risk. Build that required return from its two parts.",
    instruction: "Assemble the historical source yield stack.",
    next: "Price the risky bond",
  },
  {
    label: "Price",
    title: "Turn required yield into price",
    guide:
      "Compare the bond’s 5% coupon with the investor’s 5.5% required yield, then calculate the price that delivers that return.",
    instruction: "Build the 5.5% required yield and reprice the bond.",
    next: "Measure interest coverage",
  },
  {
    label: "Cover",
    title: "Measure the interest-payment cushion",
    guide:
      "Interest coverage connects operating earnings to interest expense. Define both inputs before calculating the ratio.",
    instruction: "Calculate the source issuer’s interest coverage.",
    next: "Read the lookup table",
  },
  {
    label: "Lookup",
    title: "Apply date and company size",
    guide:
      "A synthetic rating maps a financial ratio to a rating using a specific table. The table’s date, thresholds, and company-size category are part of the result.",
    instruction: "Look up the same 5.0 ratio for both company sizes.",
    next: "Write the Bond Risk Brief",
  },
  {
    label: "Brief",
    title: "Deliver the committee recommendation",
    guide:
      "Combine the promise, rate exposure, duration evidence, default evidence, and price into one coherent Bond Risk Brief.",
    instruction: "Complete and save all five lines of the brief.",
    next: "Finish mission 3",
  },
] as const;

export default function BondDecisionJourney() {
  return (
    <BondJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 2.5 bond decision journey"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <YieldStackScene onComplete={onComplete} />;
        if (step === 1) return <RiskyPriceScene onComplete={onComplete} />;
        if (step === 2) return <CoverageScene onComplete={onComplete} />;
        if (step === 3) return <SyntheticRatingScene onComplete={onComplete} />;
        return <BondBriefScene onComplete={onComplete} />;
      }}
      finishLabel="Return to Investment Foundations"
    />
  );
}

function YieldStackScene({ onComplete }: BondSceneProps) {
  const [riskFree, setRiskFree] = useState(false);
  const [spread, setSpread] = useState(false);
  const addRiskFree = () => {
    setRiskFree(true);
    if (spread) onComplete();
  };
  const addSpread = () => {
    setSpread(true);
    if (riskFree) onComplete();
  };
  return (
    <div>
      <BondPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <div className="font-semibold text-white">Risk-free yield</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              The yield on a maturity-matched investment assumed free of default risk.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white">Default spread</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              The additional yield investors demand for bearing the issuer’s default risk.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white">Required yield</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              The total return investors demand from the risky bond.
            </p>
          </div>
        </div>
      </BondPanel>
      <MissionPrompt>
        Rebuild Damodaran’s historical start-of-2013 BBB example. These values
        illustrate the relationship and are not current market quotes.
      </MissionPrompt>
      <BondPanel className="mt-5">
        <div className="ops-caption text-[12px] text-accent-amber">
          Historical source example · Start of 2013
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <button
            type="button"
            onClick={addRiskFree}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              riskFree
                ? "border-accent-green/40 bg-accent-green/[0.07]"
                : "border-white/15 bg-white/[0.03]",
            )}
          >
            <div className="text-xs text-slate-500">Risk-free yield</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-white">
              {riskFree ? "1.50%" : "Add block"}
            </div>
          </button>
          <div className="text-center text-xl text-slate-500">+</div>
          <button
            type="button"
            onClick={addSpread}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              spread
                ? "border-accent-green/40 bg-accent-green/[0.07]"
                : "border-white/15 bg-white/[0.03]",
            )}
          >
            <div className="text-xs text-slate-500">BBB default spread</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-white">
              {spread ? "1.84%" : "Add block"}
            </div>
          </button>
          <div className="text-center text-xl text-slate-500">=</div>
          <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.07] p-4">
            <div className="text-xs text-slate-500">Required yield</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-accent-amber">
              {riskFree && spread ? "3.34%" : "—"}
            </div>
          </div>
        </div>
        {riskFree && spread && (
          <BondFeedback correct>
            1.50% + 1.84% = 3.34%. The spread raises the return demanded from
            the risky bond above the maturity-matched risk-free yield.
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}

function RiskyPriceScene({ onComplete }: BondSceneProps) {
  const [riskFree, setRiskFree] = useState(false);
  const [spread, setSpread] = useState(false);
  const [priced, setPriced] = useState(false);
  const ready = riskFree && spread;
  const addRiskFree = () => setRiskFree(true);
  const addSpread = () => setSpread(true);
  const price = () => {
    if (!ready) return;
    setPriced(true);
    onComplete();
  };
  return (
    <div>
      <MissionPrompt>
        This source assessment bond has $1,000 face value, a 5% annual coupon,
        and ten years to maturity. Build its required yield, then price it.
      </MissionPrompt>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Annual coupon" value="$50" tone="green" />
        <Metric label="Face value" value="$1,000" tone="cyan" />
        <Metric label="Maturity" value="10 years" />
      </div>
      <BondPanel className="mt-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <button
            type="button"
            onClick={addRiskFree}
            className={cn(
              "rounded-xl border p-3 text-left",
              riskFree ? "border-accent-green/40 bg-accent-green/[0.06]" : "border-white/15",
            )}
          >
            <div className="text-xs text-slate-500">Risk-free yield</div>
            <div className="mt-1 text-xl font-semibold tabular-nums text-white">
              {riskFree ? "3.0%" : "Add 3.0%"}
            </div>
          </button>
          <div className="text-center text-slate-500">+</div>
          <button
            type="button"
            onClick={addSpread}
            className={cn(
              "rounded-xl border p-3 text-left",
              spread ? "border-accent-green/40 bg-accent-green/[0.06]" : "border-white/15",
            )}
          >
            <div className="text-xs text-slate-500">Default spread</div>
            <div className="mt-1 text-xl font-semibold tabular-nums text-white">
              {spread ? "2.5%" : "Add 2.5%"}
            </div>
          </button>
          <div className="text-center text-slate-500">=</div>
          <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-3">
            <div className="text-xs text-slate-500">Required yield</div>
            <div className="mt-1 text-xl font-semibold tabular-nums text-accent-amber">
              {ready ? "5.5%" : "—"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={price}
          disabled={!ready}
          className="mt-5 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-slate-500"
        >
          Discount the payments at 5.5% →
        </button>
      </BondPanel>
      {priced && (
        <BondPanel className="mt-4 border-accent-red/25">
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <div>
              <div className="ops-caption text-[12px] text-slate-500">Verified bond price</div>
              <div className="mt-2 text-5xl font-semibold tabular-nums text-white">$962.31</div>
            </div>
            <div className="sm:text-right">
              <div className="ops-caption text-[12px] text-slate-500">Price position</div>
              <div className="mt-2 text-2xl font-semibold text-accent-red">Discount</div>
            </div>
          </div>
          <BondFeedback correct>
            The 5% coupon is below the 5.5% required yield, so investors pay
            less than $1,000. The lower price lifts the return to the required 5.5%.
          </BondFeedback>
        </BondPanel>
      )}
    </div>
  );
}

function CoverageScene({ onComplete }: BondSceneProps) {
  const [earnings, setEarnings] = useState(false);
  const [interest, setInterest] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const ready = earnings && interest;
  const calculate = () => {
    if (!ready) return;
    setCalculated(true);
    onComplete();
  };
  return (
    <div>
      <BondPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <div className="font-semibold text-white">EBIT</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Earnings before interest and taxes: operating earnings measured
              before financing cost and tax.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white">Interest expense</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              The scheduled borrowing cost recognized for the period.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white">Interest coverage</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              EBIT divided by interest expense, showing how many times operating
              earnings cover interest.
            </p>
          </div>
        </div>
      </BondPanel>
      <MissionPrompt>
        Place the source issuer’s EBIT and interest expense into the coverage ratio.
      </MissionPrompt>
      <BondPanel className="mt-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <button
            type="button"
            onClick={() => setEarnings(true)}
            className={cn("rounded-xl border p-4 text-left", earnings ? "border-accent-green/40 bg-accent-green/[0.06]" : "border-white/15")}
          >
            <div className="text-xs text-slate-500">EBIT</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-white">
              {earnings ? "$3,500m" : "Place EBIT"}
            </div>
          </button>
          <div className="text-center text-xl text-slate-500">÷</div>
          <button
            type="button"
            onClick={() => setInterest(true)}
            className={cn("rounded-xl border p-4 text-left", interest ? "border-accent-green/40 bg-accent-green/[0.06]" : "border-white/15")}
          >
            <div className="text-xs text-slate-500">Interest expense</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-white">
              {interest ? "$700m" : "Place interest"}
            </div>
          </button>
          <div className="text-center text-xl text-slate-500">=</div>
          <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-4">
            <div className="text-xs text-slate-500">Coverage</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-accent-amber">
              {calculated ? "5.00×" : "—"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={calculate}
          disabled={!ready}
          className="mt-5 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-slate-500"
        >
          Calculate interest coverage →
        </button>
        {calculated && (
          <BondFeedback correct>
            $3,500m ÷ $700m = 5.00. Operating earnings cover annual interest
            expense five times in this simplified measure.
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}

function SyntheticRatingScene({ onComplete }: BondSceneProps) {
  const [viewed, setViewed] = useState<string[]>([]);
  const inspect = (size: string) => {
    if (viewed.includes(size)) return;
    const next = [...viewed, size];
    setViewed(next);
    if (next.length === 2) onComplete();
  };
  return (
    <div>
      <BondPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">Direct definition</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          A synthetic rating is an estimated credit rating produced by mapping
          a financial ratio to the thresholds in a specified rating table.
        </p>
      </BondPanel>
      <MissionPrompt>
        Use the historical source lookup for a 5.00 interest-coverage ratio.
        Inspect both company-size categories.
      </MissionPrompt>
      <BondPanel className="mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="ops-caption text-[12px] text-accent-amber">
              Historical source lookup · early 2013
            </div>
            <div className="mt-1 text-sm text-slate-400">
              Ratio thresholds and spreads are table-specific historical values.
            </div>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1.5 text-sm tabular-nums text-white">
            Coverage: 5.00×
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => inspect("small")}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              viewed.includes("small") ? "border-accent-green/40 bg-accent-green/[0.06]" : "border-white/15",
            )}
          >
            <div className="text-xs text-slate-500">Small company table</div>
            <div className="mt-2 text-3xl font-semibold text-white">
              {viewed.includes("small") ? "A−" : "Inspect"}
            </div>
            {viewed.includes("small") && (
              <div className="mt-2 text-sm tabular-nums text-accent-amber">Historical spread: 3.00%</div>
            )}
          </button>
          <button
            type="button"
            onClick={() => inspect("large")}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              viewed.includes("large") ? "border-accent-green/40 bg-accent-green/[0.06]" : "border-white/15",
            )}
          >
            <div className="text-xs text-slate-500">Large company table</div>
            <div className="mt-2 text-3xl font-semibold text-white">
              {viewed.includes("large") ? "A" : "Inspect"}
            </div>
            {viewed.includes("large") && (
              <div className="mt-2 text-sm text-slate-400">Different size-specific threshold</div>
            )}
          </button>
        </div>
        {viewed.length === 2 && (
          <BondFeedback correct>
            The same 5.00 ratio maps to A− for the historical small-company
            table and A for the historical large-company table. Size, date, and
            thresholds are part of the estimate.
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}

const BRIEF_LINES = [
  {
    id: "promise",
    label: "Payment promise",
    answer: "payments",
    options: [
      ["payments", "$50 annually; $1,050 in Year 10"],
      ["face", "$1,000 every year for ten years"],
    ],
  },
  {
    id: "rates",
    label: "Rate exposure",
    answer: "fall",
    options: [
      ["fall", "If market yields rise, present value and price fall"],
      ["rise", "If market yields rise, the fixed coupon becomes larger"],
    ],
  },
  {
    id: "duration",
    label: "Duration evidence",
    answer: "lower",
    options: [
      ["lower", "The 10-year, 5% bond has lower duration than a 20-year, 2% bond"],
      ["higher", "The 10-year, 5% bond has higher duration because its coupon is larger"],
    ],
  },
  {
    id: "default",
    label: "Default evidence",
    answer: "estimate",
    options: [
      ["estimate", "Coverage is 5.00×; any synthetic rating depends on the table’s date and size category"],
      ["certain", "Coverage is 5.00×, so an A rating is guaranteed"],
    ],
  },
  {
    id: "price",
    label: "Price decision",
    answer: "discount",
    options: [
      ["discount", "At a 5.5% required yield, the 5% coupon bond is worth $962.31"],
      ["par", "At a 5.5% required yield, the bond remains worth $1,000"],
    ],
  },
] as const;

function BondBriefScene({ onComplete }: BondSceneProps) {
  const { saveBondBrief } = useIFProgress();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const correct = BRIEF_LINES.every((line) => answers[line.id] === line.answer);

  const choose = (id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setSaved(false);
  };

  const save = () => {
    if (!correct) return;
    saveBondBrief({
      paymentPromise: "$50 annually; $1,050 in Year 10",
      rateRisk: "If market yields rise, present value and price fall.",
      durationFinding: "The 10-year, 5% bond has lower duration than a 20-year, 2% bond.",
      defaultEvidence: "Coverage is 5.00×; the synthetic rating depends on table date and company size.",
      pricingDecision: "At a 5.5% required yield, the bond is worth $962.31 and trades at a discount.",
      updatedAt: "",
    });
    setSaved(true);
    onComplete();
  };

  return (
    <div>
      <MissionPrompt>
        Complete each line with evidence already introduced and practiced in
        this module. Save the brief when all five reasoning chains are coherent.
      </MissionPrompt>
      <div className="mt-5 space-y-4">
        {BRIEF_LINES.map((line, index) => {
          const answer = answers[line.id];
          const lineCorrect = answer === line.answer;
          return (
            <BondPanel key={line.id}>
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-amber/30 bg-accent-amber/10 text-xs tabular-nums text-accent-amber">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-white">{line.label}</h3>
              </div>
              <div className="mt-3 grid gap-2">
                {line.options.map(([value, label]) => (
                  <BondChoice
                    key={value}
                    selected={answer === value}
                    correct={lineCorrect && answer === value}
                    incorrect={answer === value && !lineCorrect}
                    onClick={() => choose(line.id, value)}
                  >
                    {label}
                  </BondChoice>
                ))}
              </div>
              {answer && !lineCorrect && (
                <BondFeedback correct={false}>
                  Reopen the relationship between the bond input and the stated outcome.
                </BondFeedback>
              )}
            </BondPanel>
          );
        })}
      </div>

      <BondPanel className={cn("mt-5", correct ? "border-accent-green/30" : "border-white/10")}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="ops-caption text-[12px] text-slate-500">Bond Risk Brief</div>
            <div className={cn("mt-1 font-semibold", correct ? "text-accent-green" : "text-slate-400")}>
              {saved
                ? "Saved to your Investment Foundations work"
                : correct
                  ? "All five lines are ready to save"
                  : `${Object.keys(answers).length} of ${BRIEF_LINES.length} lines answered`}
            </div>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!correct || saved}
            className="rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2.5 text-sm font-semibold text-accent-green disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-slate-500"
          >
            {saved ? "✓ Bond Risk Brief saved" : "Save the Bond Risk Brief"}
          </button>
        </div>
      </BondPanel>
    </div>
  );
}
