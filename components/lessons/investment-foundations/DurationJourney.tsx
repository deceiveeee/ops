"use client";

import { useState } from "react";
import BondJourneyShell, {
  BondChoice,
  BondFeedback,
  BondPanel,
  Metric,
  MissionPrompt,
  type BondSceneProps,
} from "./BondJourneyShell";
import { cn } from "@/lib/utils";

const LESSON_SLUG = "if-2-3-duration-measuring-interest-rate-sensitivity";

const STEPS = [
  {
    label: "Locate",
    title: "Find the cash-flow center",
    guide:
      "Duration begins with timing. Locate when the bond delivers most of the present value of its payments.",
    instruction: "Run the cash-flow center-of-gravity model.",
    next: "Rebuild the source calculation",
  },
  {
    label: "Calculate",
    title: "Rebuild 8.36 years",
    guide:
      "Use Damodaran’s 4% coupon, 10-year bond at a 5% yield. The present-value weights turn its payment timeline into one duration measure.",
    instruction: "Calculate the source bond’s price and Macaulay duration.",
    next: "Test the duration levers",
  },
  {
    label: "Test",
    title: "Change one bond feature at a time",
    guide:
      "Coupon and maturity change when present value arrives. Test each feature while holding the other one fixed.",
    instruction: "Run both the coupon and maturity comparisons.",
    next: "Rank the four bonds",
  },
  {
    label: "Rank",
    title: "Identify the least and most sensitive",
    guide:
      "Use the two relationships you observed: lower coupons shift weight later, and longer maturities extend the payment timeline.",
    instruction: "Select the lowest-duration and highest-duration bonds.",
    next: "Complete the duration check",
  },
  {
    label: "Distinguish",
    title: "Use the right duration measure",
    guide:
      "Macaulay duration reports weighted-average timing. Modified duration translates that timing into an approximate percentage price response.",
    instruction: "Answer both measurement questions.",
    next: "Enter Lesson 2.4",
  },
] as const;

export default function DurationJourney() {
  return (
    <BondJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 2.3 duration journey"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <CenterScene onComplete={onComplete} />;
        if (step === 1) return <SourceDurationScene onComplete={onComplete} />;
        if (step === 2) return <DurationLeversScene onComplete={onComplete} />;
        if (step === 3) return <DurationRankScene onComplete={onComplete} />;
        return <MeasureScene onComplete={onComplete} />;
      }}
      nextLesson={{
        href: "/lessons/if-2-4-default-risk-can-the-issuer-deliver",
        label: "Continue to Lesson 2.4",
      }}
    />
  );
}

function bondMetrics(couponRate: number, maturity: number, yieldRate: number) {
  const face = 1000;
  const coupon = face * (couponRate / 100);
  const y = yieldRate / 100;
  let price = 0;
  let weightedTime = 0;
  for (let year = 1; year <= maturity; year += 1) {
    const cashFlow = coupon + (year === maturity ? face : 0);
    const presentValue = cashFlow / (1 + y) ** year;
    price += presentValue;
    weightedTime += year * presentValue;
  }
  return { price, duration: weightedTime / price };
}

function CenterScene({ onComplete }: BondSceneProps) {
  const [scanned, setScanned] = useState(false);
  const scan = () => {
    setScanned(true);
    onComplete();
  };
  return (
    <div>
      <BondPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">
          Direct definition
        </div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          Macaulay duration is the weighted-average time until a bond’s cash
          flows arrive. Each payment receives a weight based on its present
          value.
        </p>
      </BondPanel>
      <MissionPrompt>
        Scan the payment timeline. The small coupons contribute weight each
        year, while the large face-value repayment pulls the center toward
        maturity.
      </MissionPrompt>

      <BondPanel className="mt-5 overflow-hidden">
        <div className="overflow-x-auto pb-3">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-10 items-end gap-2 border-b border-white/20 pb-4">
              {Array.from({ length: 10 }, (_, index) => {
                const year = index + 1;
                const final = year === 10;
                return (
                  <div key={year} className="text-center">
                    <div
                      className={cn(
                        "mx-auto w-7 rounded-t-md transition-[height,background-color] duration-500",
                        final ? "bg-accent-cyan/80" : "bg-accent-green/60",
                      )}
                      style={{ height: scanned ? (final ? 128 : Math.max(16, 42 - year * 2)) : 8 }}
                    />
                    <div className="mt-2 text-[12px] tabular-nums text-slate-500">
                      Y{year}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="relative mt-7 h-12">
              <div className="absolute left-0 right-0 top-4 h-px bg-white/15" />
              <div
                className={cn(
                  "absolute top-0 flex -translate-x-1/2 flex-col items-center transition-[left,opacity] duration-700",
                  scanned ? "opacity-100" : "opacity-0",
                )}
                style={{ left: scanned ? "83.6%" : "50%" }}
              >
                <div className="h-8 w-px bg-accent-amber" />
                <div className="mt-1 whitespace-nowrap text-xs font-semibold text-accent-amber">
                  Center: 8.36 years
                </div>
              </div>
            </div>
          </div>
        </div>
        {!scanned ? (
          <button
            type="button"
            onClick={scan}
            className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber"
          >
            Scan present-value timing →
          </button>
        ) : (
          <BondFeedback correct>
            The face-value repayment carries substantial weight near Year 10,
            so the weighted center sits at 8.36 years.
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}

function SourceDurationScene({ onComplete }: BondSceneProps) {
  const [calculated, setCalculated] = useState(false);
  const metrics = bondMetrics(4, 10, 5);
  const calculate = () => {
    setCalculated(true);
    onComplete();
  };
  return (
    <div>
      <MissionPrompt>
        Discount each $40 coupon and the final $1,000 at a 5% yield. Then use
        each present value as its timing weight.
      </MissionPrompt>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Coupon rate" value="4%" tone="green" />
        <Metric label="Maturity" value="10 years" tone="cyan" />
        <Metric label="Market yield" value="5%" />
      </div>
      <BondPanel className="mt-4">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div>
            <div className="ops-caption text-[12px] text-slate-500">
              Present-value total
            </div>
            <div className="mt-2 text-3xl font-semibold tabular-nums text-white">
              {calculated ? `$${metrics.price.toFixed(2)}` : "Awaiting calculation"}
            </div>
          </div>
          <div className="hidden h-16 w-px bg-white/10 lg:block" />
          <div>
            <div className="ops-caption text-[12px] text-slate-500">
              Weighted-average timing
            </div>
            <div className="mt-2 text-3xl font-semibold tabular-nums text-accent-amber">
              {calculated ? `${metrics.duration.toFixed(2)} years` : "Awaiting weights"}
            </div>
          </div>
        </div>
        {!calculated ? (
          <button
            type="button"
            onClick={calculate}
            className="mt-6 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber"
          >
            Calculate price and duration →
          </button>
        ) : (
          <BondFeedback correct>
            The verified source values are $922.78 and 8.36 years. The
            duration value is a time measure built from present-value weights.
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}

function DurationLeversScene({ onComplete }: BondSceneProps) {
  const [couponRate, setCouponRate] = useState(5);
  const [maturity, setMaturity] = useState(10);
  const [testedCoupon, setTestedCoupon] = useState(false);
  const [testedMaturity, setTestedMaturity] = useState(false);
  const metrics = bondMetrics(couponRate, maturity, 4);

  const changeCoupon = (value: number) => {
    setCouponRate(value);
    if (value === 2) {
      setTestedCoupon(true);
      if (testedMaturity) onComplete();
    }
  };
  const changeMaturity = (value: number) => {
    setMaturity(value);
    if (value === 20) {
      setTestedMaturity(true);
      if (testedCoupon) onComplete();
    }
  };

  return (
    <div>
      <MissionPrompt>
        Start with the 10-year, 5% coupon bond. Lower the coupon to 2%, then
        extend maturity to 20 years. Watch where the present-value center moves.
      </MissionPrompt>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <BondPanel>
          <div>
            <div className="text-sm font-semibold text-white">Coupon rate</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[5, 2].map((value) => (
                <BondChoice
                  key={value}
                  selected={couponRate === value}
                  onClick={() => changeCoupon(value)}
                >
                  {value}% coupon
                </BondChoice>
              ))}
            </div>
          </div>
          <div className="mt-5 border-t border-white/10 pt-5">
            <div className="text-sm font-semibold text-white">Maturity</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[10, 20].map((value) => (
                <BondChoice
                  key={value}
                  selected={maturity === value}
                  onClick={() => changeMaturity(value)}
                >
                  {value} years
                </BondChoice>
              ))}
            </div>
          </div>
        </BondPanel>

        <BondPanel className="relative overflow-hidden">
          <div className="ops-caption text-[12px] text-slate-500">
            Macaulay duration at a 4% yield
          </div>
          <div className="mt-2 text-5xl font-semibold tabular-nums text-accent-amber">
            {metrics.duration.toFixed(2)}
            <span className="ml-2 text-lg text-slate-400">years</span>
          </div>
          <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-amber transition-[width] duration-300"
              style={{ width: `${Math.min(100, (metrics.duration / 20) * 100)}%` }}
            />
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div className={testedCoupon ? "text-accent-green" : "text-slate-500"}>
              {testedCoupon ? "✓" : "○"} Lower coupon tested: less cash arrives early.
            </div>
            <div className={testedMaturity ? "text-accent-green" : "text-slate-500"}>
              {testedMaturity ? "✓" : "○"} Longer maturity tested: final payment arrives later.
            </div>
          </div>
          {testedCoupon && testedMaturity && (
            <BondFeedback correct>
              Lower coupons and longer maturities both shift present-value
              weight later, producing higher duration and greater rate sensitivity.
            </BondFeedback>
          )}
        </BondPanel>
      </div>
    </div>
  );
}

const RANK_BONDS = [
  { id: "10-5", maturity: 10, coupon: 5 },
  { id: "10-2", maturity: 10, coupon: 2 },
  { id: "20-5", maturity: 20, coupon: 5 },
  { id: "20-2", maturity: 20, coupon: 2 },
] as const;

function DurationRankScene({ onComplete }: BondSceneProps) {
  const [lowest, setLowest] = useState<string | null>(null);
  const [highest, setHighest] = useState<string | null>(null);
  const lowestCorrect = lowest === "10-5";
  const highestCorrect = highest === "20-2";
  const chooseLowest = (id: string) => {
    setLowest(id);
    if (id === "10-5" && highestCorrect) onComplete();
  };
  const chooseHighest = (id: string) => {
    setHighest(id);
    if (id === "20-2" && lowestCorrect) onComplete();
  };

  return (
    <div>
      <MissionPrompt>
        All four bonds are evaluated at the same 4% yield. Select the lowest
        duration, then the highest duration.
      </MissionPrompt>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <BondPanel>
          <div className="font-semibold text-white">Lowest duration</div>
          <div className="mt-3 space-y-2">
            {RANK_BONDS.map((bond) => (
              <BondChoice
                key={bond.id}
                selected={lowest === bond.id}
                correct={lowestCorrect && lowest === bond.id}
                incorrect={lowest === bond.id && !lowestCorrect}
                onClick={() => chooseLowest(bond.id)}
              >
                {bond.maturity}-year · {bond.coupon}% coupon
              </BondChoice>
            ))}
          </div>
          {lowest && (
            <BondFeedback correct={lowestCorrect}>
              {lowestCorrect
                ? "The shorter maturity and higher coupon deliver present value sooner. Verified duration: 8.19 years."
                : "Look for the combination that delivers more cash earlier and ends sooner."}
            </BondFeedback>
          )}
        </BondPanel>

        <BondPanel>
          <div className="font-semibold text-white">Highest duration</div>
          <div className="mt-3 space-y-2">
            {RANK_BONDS.map((bond) => (
              <BondChoice
                key={bond.id}
                selected={highest === bond.id}
                correct={highestCorrect && highest === bond.id}
                incorrect={highest === bond.id && !highestCorrect}
                onClick={() => chooseHighest(bond.id)}
              >
                {bond.maturity}-year · {bond.coupon}% coupon
              </BondChoice>
            ))}
          </div>
          {highest && (
            <BondFeedback correct={highestCorrect}>
              {highestCorrect
                ? "The longer maturity and lower coupon shift the most value toward the future. Verified duration: 15.97 years."
                : "Look for the combination that delays both recurring cash and the final repayment."}
            </BondFeedback>
          )}
        </BondPanel>
      </div>
    </div>
  );
}

function MeasureScene({ onComplete }: BondSceneProps) {
  const [meaning, setMeaning] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const meaningCorrect = meaning === "timing";
  const priceCorrect = price === "modified";
  const answerMeaning = (value: string) => {
    setMeaning(value);
    if (value === "timing" && priceCorrect) onComplete();
  };
  const answerPrice = (value: string) => {
    setPrice(value);
    if (value === "modified" && meaningCorrect) onComplete();
  };

  return (
    <div>
      <BondPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="font-semibold text-white">Macaulay duration</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              A weighted-average time measure stated in years.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white">Modified duration</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              A related sensitivity measure used to approximate the percentage
              price change for a small yield change.
            </p>
          </div>
        </div>
      </BondPanel>

      <BondPanel className="mt-4">
        <h3 className="font-semibold text-white">
          What does the source value of 8.36 represent?
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <BondChoice
            selected={meaning === "timing"}
            correct={meaningCorrect}
            onClick={() => answerMeaning("timing")}
          >
            Weighted-average cash-flow timing of 8.36 years
          </BondChoice>
          <BondChoice
            selected={meaning === "percent"}
            incorrect={meaning === "percent"}
            onClick={() => answerMeaning("percent")}
          >
            An automatic 8.36% price change
          </BondChoice>
        </div>
        {meaning && (
          <BondFeedback correct={meaningCorrect}>
            {meaningCorrect
              ? "The source calculation is Macaulay duration, expressed in years."
              : "The unit matters: the displayed source value is a time measure."}
          </BondFeedback>
        )}
      </BondPanel>

      <BondPanel className="mt-4">
        <h3 className="font-semibold text-white">
          Which measure connects duration to an approximate percentage price response?
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <BondChoice
            selected={price === "macaulay"}
            incorrect={price === "macaulay"}
            onClick={() => answerPrice("macaulay")}
          >
            Macaulay duration by itself
          </BondChoice>
          <BondChoice
            selected={price === "modified"}
            correct={priceCorrect}
            onClick={() => answerPrice("modified")}
          >
            Modified duration
          </BondChoice>
        </div>
        {price && (
          <BondFeedback correct={priceCorrect}>
            {priceCorrect
              ? "Modified duration is the related percentage-sensitivity measure."
              : "Keep weighted timing and percentage sensitivity as separate measurements."}
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}
