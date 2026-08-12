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

const LESSON_SLUG = "if-2-2-why-market-rates-change-bond-prices";

const STEPS = [
  {
    label: "Value",
    title: "Translate future cash into value today",
    guide:
      "The bond’s promised dollars arrive in the future. Learn how the market yield translates those future payments into a price today.",
    instruction: "Run the present-value comparison.",
    next: "Reprice the source bond",
  },
  {
    label: "Reprice",
    title: "Move the market yield",
    guide:
      "Keep the bond’s $40 coupons and $1,000 face value fixed. Change only the return available in the market and watch today’s price respond.",
    instruction: "Raise the market yield from 4% to 5%.",
    next: "Name the price position",
  },
  {
    label: "Name",
    title: "Premium, par, or discount",
    guide:
      "The relationship between the coupon rate and market yield determines whether this bond trades above, at, or below face value.",
    instruction: "Correctly label all three price positions.",
    next: "Calculate the one-year return",
  },
  {
    label: "Return",
    title: "Separate coupon income from price change",
    guide:
      "A default-free bond can make its promised coupon and still produce a loss for an investor who sells after rates rise.",
    instruction: "Build the one-year holding-period return.",
    next: "Run the rate-risk check",
  },
  {
    label: "Check",
    title: "Explain the full rate chain",
    guide:
      "Complete the lesson by connecting a rate event to present value, market price, and the investor’s holding horizon.",
    instruction: "Answer both rate-risk questions.",
    next: "Enter Lesson 2.3",
  },
] as const;

export default function RateRiskJourney() {
  return (
    <BondJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 2.2 interest-rate risk journey"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <PresentValueScene onComplete={onComplete} />;
        if (step === 1) return <RepriceScene onComplete={onComplete} />;
        if (step === 2) return <PricePositionScene onComplete={onComplete} />;
        if (step === 3) return <HoldingReturnScene onComplete={onComplete} />;
        return <RateCheckScene onComplete={onComplete} />;
      }}
      nextLesson={{
        href: "/lessons/if-2-3-duration-measuring-interest-rate-sensitivity",
        label: "Continue to Lesson 2.3",
      }}
    />
  );
}

function PresentValueScene({ onComplete }: BondSceneProps) {
  const [ran, setRan] = useState(false);
  const run = () => {
    setRan(true);
    onComplete();
  };

  return (
    <div>
      <BondPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">
          Two definitions
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold text-white">Market yield</h3>
            <p className="ops-body mt-1 text-[14px] leading-6 text-slate-300">
              Market yield is the return investors currently require from a
              bond with comparable timing and risk.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Present value</h3>
            <p className="ops-body mt-1 text-[14px] leading-6 text-slate-300">
              Present value is the amount a future payment is worth today after
              accounting for the return available while waiting.
            </p>
          </div>
        </div>
      </BondPanel>

      <MissionPrompt>
        Compare one $1,040 payment due in ten years. A higher available return
        lets an investor start with fewer dollars today and still reach the
        same future amount.
      </MissionPrompt>

      <BondPanel className="mt-5 overflow-hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.035] p-4">
            <div className="ops-caption text-[12px] text-accent-cyan">
              2% required return · OPS model
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">Value today</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-white">
                  {ran ? "$853.16" : "?"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Year 10</div>
                <div className="mt-1 font-semibold tabular-nums text-accent-green">$1,040</div>
              </div>
            </div>
            <div className="mt-4 h-1 rounded-full bg-accent-cyan/40" />
          </div>
          <div className="rounded-xl border border-accent-amber/20 bg-accent-amber/[0.035] p-4">
            <div className="ops-caption text-[12px] text-accent-amber">
              5% required return · OPS model
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">Value today</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-white">
                  {ran ? "$638.47" : "?"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Year 10</div>
                <div className="mt-1 font-semibold tabular-nums text-accent-green">$1,040</div>
              </div>
            </div>
            <div className="mt-4 h-1 rounded-full bg-accent-amber/40" />
          </div>
        </div>
        {!ran ? (
          <button
            type="button"
            onClick={run}
            className="mt-5 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber hover:bg-accent-amber/20"
          >
            Run the present-value comparison →
          </button>
        ) : (
          <BondFeedback correct>
            The future payment stays $1,040. A higher market yield lowers its
            present value, which lowers the price investors will pay today.
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}

const PRICE_BY_YIELD: Record<number, number> = {
  2: 1179.65,
  3: 1085.3,
  4: 1000,
  5: 922.78,
  6: 852.8,
};

function RepriceScene({ onComplete }: BondSceneProps) {
  const [yieldRate, setYieldRate] = useState(4);
  const price = PRICE_BY_YIELD[yieldRate];
  const change = ((price / 1000 - 1) * 100).toFixed(2);

  const changeYield = (next: number) => {
    setYieldRate(next);
    if (next === 5) onComplete();
  };

  return (
    <div>
      <MissionPrompt>
        Raise the market yield from 4% to 5%. The bond contract remains a $40
        annual coupon plus $1,000 at maturity.
      </MissionPrompt>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <BondPanel>
          <div className="font-semibold text-white">
            Market yield: <span className="tabular-nums text-accent-amber">{yieldRate}%</span>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2" aria-label="Market yield scenarios">
            {[2, 3, 4, 5, 6].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => changeYield(value)}
                aria-pressed={yieldRate === value}
                className={cn(
                  "rounded-xl border px-2 py-3 text-sm font-semibold tabular-nums transition-colors",
                  yieldRate === value
                    ? "border-accent-amber/50 bg-accent-amber/10 text-accent-amber"
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/25 hover:text-white",
                )}
              >
                {value}%
              </button>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Metric label="Promised coupon" value="$40" tone="green" />
            <Metric label="Face value" value="$1,000" tone="cyan" />
          </div>
        </BondPanel>

        <BondPanel className="relative overflow-hidden">
          <div className="ops-caption text-[12px] text-slate-500">
            Source bond price today
          </div>
          <div className="mt-2 text-4xl font-semibold tabular-nums text-white sm:text-5xl">
            ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div
            className={cn(
              "mt-2 text-sm font-semibold tabular-nums",
              price >= 1000 ? "text-accent-green" : "text-accent-red",
            )}
          >
            {Number(change) > 0 ? "+" : ""}{change}% from face value
          </div>
          <div className="mt-7 h-36 border-b border-l border-white/15 p-3">
            <div className="flex h-full items-end">
              <div
                className="w-full origin-bottom rounded-t-xl bg-gradient-to-t from-accent-amber/30 to-accent-amber/80 transition-transform duration-300"
                style={{ transform: `scaleY(${price / 1180})`, height: "100%" }}
              />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Present value</span>
            <span>Same promised cash flows</span>
          </div>
          {yieldRate === 5 && (
            <BondFeedback correct>
              Market yield rose by one percentage point, so the price fell to
              $922.78. An investor can now earn 5% from the unchanged payments
              by paying less today.
            </BondFeedback>
          )}
        </BondPanel>
      </div>
    </div>
  );
}

const POSITION_CASES = [
  { id: "three", coupon: 4, yield: 3, price: "$1,085.30", answer: "premium" },
  { id: "four", coupon: 4, yield: 4, price: "$1,000.00", answer: "par" },
  { id: "five", coupon: 4, yield: 5, price: "$922.78", answer: "discount" },
] as const;

function PricePositionScene({ onComplete }: BondSceneProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const choose = (id: string, answer: string) => {
    const next = { ...answers, [id]: answer };
    setAnswers(next);
    if (POSITION_CASES.every((item) => next[item.id] === item.answer)) onComplete();
  };

  return (
    <div>
      <BondPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <div className="font-semibold text-white">Premium</div>
            <p className="mt-1 text-sm leading-5 text-slate-300">
              A premium bond trades above face value because its coupon rate is
              above the market yield.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white">Par</div>
            <p className="mt-1 text-sm leading-5 text-slate-300">
              A par bond trades at face value when its coupon rate equals the
              market yield.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white">Discount</div>
            <p className="mt-1 text-sm leading-5 text-slate-300">
              A discount bond trades below face value because its coupon rate
              is below the market yield.
            </p>
          </div>
        </div>
      </BondPanel>
      <div className="mt-5 space-y-4">
        {POSITION_CASES.map((item) => {
          const answer = answers[item.id];
          const correct = answer === item.answer;
          return (
            <BondPanel key={item.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-400">
                    4% coupon · {item.yield}% market yield
                  </div>
                  <div className="mt-1 text-xl font-semibold tabular-nums text-white">
                    {item.price}
                  </div>
                </div>
                <div className="grid min-w-[280px] flex-1 grid-cols-3 gap-2 sm:max-w-md">
                  {["premium", "par", "discount"].map((position) => (
                    <BondChoice
                      key={position}
                      selected={answer === position}
                      correct={correct && answer === position}
                      incorrect={answer === position && !correct}
                      onClick={() => choose(item.id, position)}
                    >
                      <span className="capitalize">{position}</span>
                    </BondChoice>
                  ))}
                </div>
              </div>
              {answer && !correct && (
                <BondFeedback correct={false}>
                  Compare the 4% coupon rate with the {item.yield}% market yield.
                </BondFeedback>
              )}
            </BondPanel>
          );
        })}
      </div>
    </div>
  );
}

function HoldingReturnScene({ onComplete }: BondSceneProps) {
  const [couponAdded, setCouponAdded] = useState(false);
  const [priceAdded, setPriceAdded] = useState(false);
  const buildCoupon = () => {
    setCouponAdded(true);
    if (priceAdded) onComplete();
  };
  const buildPrice = () => {
    setPriceAdded(true);
    if (couponAdded) onComplete();
  };

  return (
    <div>
      <BondPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
        <div className="ops-caption text-[12px] text-accent-cyan">
          Holding horizon
        </div>
        <p className="ops-body mt-2 text-[15px] leading-6 text-slate-200">
          The investor buys a default-free 20-year, 2% coupon bond for $1,000,
          receives one $20 coupon, and sells after one year when the market
          yield has risen to 3%.
        </p>
      </BondPanel>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Metric label="Starting price" value="$1,000.00" />
        <Metric label="Coupon received" value={couponAdded ? "+$20.00" : "Add it"} tone="green" />
        <Metric label="Selling price" value={priceAdded ? "$856.76" : "Reprice it"} tone="red" />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={buildCoupon}
          className="rounded-full border border-accent-green/40 bg-accent-green/10 px-4 py-2 text-sm font-semibold text-accent-green"
        >
          {couponAdded ? "✓ Coupon included" : "Include the $20 coupon"}
        </button>
        <button
          type="button"
          onClick={buildPrice}
          className="rounded-full border border-accent-red/40 bg-accent-red/10 px-4 py-2 text-sm font-semibold text-accent-red"
        >
          {priceAdded ? "✓ Selling price included" : "Include the $856.76 sale"}
        </button>
      </div>

      {couponAdded && priceAdded && (
        <BondPanel className="mt-5 border-accent-red/25">
          <div className="ops-caption text-[12px] text-slate-500">
            Holding-period return
          </div>
          <div className="mt-3 text-lg tabular-nums text-white">
            ($20 + $856.76 − $1,000) ÷ $1,000
          </div>
          <div className="mt-2 text-4xl font-semibold tabular-nums text-accent-red">
            −12.33%
          </div>
          <BondFeedback correct>
            The issuer made the promised coupon. The loss came from selling at
            a lower market price after rates rose.
          </BondFeedback>
        </BondPanel>
      )}
    </div>
  );
}

function RateCheckScene({ onComplete }: BondSceneProps) {
  const [direction, setDirection] = useState<string | null>(null);
  const [horizon, setHorizon] = useState<string | null>(null);
  const directionCorrect = direction === "down";
  const horizonCorrect = horizon === "sale";

  const answerDirection = (value: string) => {
    setDirection(value);
    if (value === "down" && horizonCorrect) onComplete();
  };
  const answerHorizon = (value: string) => {
    setHorizon(value);
    if (value === "sale" && directionCorrect) onComplete();
  };

  return (
    <div>
      <BondPanel>
        <h3 className="ops-interactive-title text-lg text-white">
          Market yields rise while the promised cash flows remain fixed. What
          happens to today’s bond price?
        </h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <BondChoice
            selected={direction === "up"}
            incorrect={direction === "up"}
            onClick={() => answerDirection("up")}
          >
            Price rises because the payments are fixed.
          </BondChoice>
          <BondChoice
            selected={direction === "down"}
            correct={directionCorrect}
            onClick={() => answerDirection("down")}
          >
            Price falls because the payments have a lower present value.
          </BondChoice>
        </div>
        {direction && (
          <BondFeedback correct={directionCorrect}>
            {directionCorrect
              ? "A higher available return lowers the amount investors must pay today for the same future cash."
              : "Follow the present-value comparison: a higher required return starts with fewer dollars today."}
          </BondFeedback>
        )}
      </BondPanel>

      <BondPanel className="mt-4">
        <h3 className="ops-interactive-title text-lg text-white">
          When does that lower market price enter this investor’s realized
          one-year return?
        </h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <BondChoice
            selected={horizon === "coupon"}
            incorrect={horizon === "coupon"}
            onClick={() => answerHorizon("coupon")}
          >
            When the issuer pays the promised coupon.
          </BondChoice>
          <BondChoice
            selected={horizon === "sale"}
            correct={horizonCorrect}
            onClick={() => answerHorizon("sale")}
          >
            When the investor sells or marks the bond after one year.
          </BondChoice>
        </div>
        {horizon && (
          <BondFeedback correct={horizonCorrect}>
            {horizonCorrect
              ? "The holding horizon connects the market-price change to the investor’s measured return."
              : "The coupon is income. The price loss appears when the bond is sold or valued at the new market price."}
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}
