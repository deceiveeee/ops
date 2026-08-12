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

const LESSON_SLUG = "if-2-1-reading-a-bonds-promise";

const STEPS = [
  {
    label: "Decode",
    title: "Open the bond contract",
    guide:
      "The scholarship fund is considering one conventional fixed-rate bond. First decode exactly who pays, who receives, how much, and when.",
    instruction: "Inspect all five labeled parts of the bond promise.",
    next: "Build the payment timeline",
  },
  {
    label: "Build",
    title: "Place every promised payment",
    guide:
      "A coupon rate becomes a dollar payment only after it is applied to face value. Build the cash flows before discussing risk.",
    instruction: "Place the annual coupons, then add face value at maturity.",
    next: "Open the risk scanner",
  },
  {
    label: "Scan",
    title: "Meet the two risks",
    guide:
      "This session emphasizes two risks for a conventional fixed-rate bond: its market price can change, and its issuer can miss promised payments.",
    instruction: "Trace one interest-rate event and one default event.",
    next: "Classify the events",
  },
  {
    label: "Classify",
    title: "Name the risk from the evidence",
    guide:
      "Use the definitions you just modeled. Focus on whether the event changes today’s market value or threatens the issuer’s payments.",
    instruction: "Correctly classify all three events.",
    next: "Complete the payment map",
  },
  {
    label: "Map",
    title: "Brief the scholarship committee",
    guide:
      "Finish the payment map by connecting the contract to the two questions the committee must monitor.",
    instruction: "Answer both contract and risk questions.",
    next: "Enter Lesson 2.2",
  },
] as const;

export default function BondPromiseJourney() {
  return (
    <BondJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 2.1 bond promise journey"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <ContractScene onComplete={onComplete} />;
        if (step === 1) return <TimelineScene onComplete={onComplete} />;
        if (step === 2) return <RiskScannerScene onComplete={onComplete} />;
        if (step === 3) return <RiskClassifyScene onComplete={onComplete} />;
        return <PaymentMapScene onComplete={onComplete} />;
      }}
      nextLesson={{
        href: "/lessons/if-2-2-why-market-rates-change-bond-prices",
        label: "Continue to Lesson 2.2",
      }}
    />
  );
}

const TERMS = [
  {
    id: "issuer",
    label: "Issuer",
    value: "Northstar Transit",
    definition:
      "The issuer is the borrower that receives the investor’s money and promises the bond’s payments.",
  },
  {
    id: "bondholder",
    label: "Bondholder",
    value: "Scholarship fund",
    definition:
      "The bondholder is the investor that lends money to the issuer and holds the right to the promised payments.",
  },
  {
    id: "coupon",
    label: "Coupon rate",
    value: "4% each year",
    definition:
      "The coupon rate sets the recurring interest payment. Four percent of $1,000 creates a $40 annual coupon.",
  },
  {
    id: "face",
    label: "Face value",
    value: "$1,000",
    definition:
      "Face value is the principal amount the issuer promises to repay at maturity. It is also called par value.",
  },
  {
    id: "maturity",
    label: "Maturity",
    value: "10 years",
    definition:
      "Maturity is the date when the final coupon and face value are due.",
  },
] as const;

function ContractScene({ onComplete }: BondSceneProps) {
  const [selected, setSelected] = useState<string>(TERMS[0].id);
  const [inspected, setInspected] = useState<string[]>([]);
  const active = TERMS.find((term) => term.id === selected) ?? TERMS[0];

  const inspect = (id: string) => {
    setSelected(id);
    if (inspected.includes(id)) return;
    const next = [...inspected, id];
    setInspected(next);
    if (next.length === TERMS.length) onComplete();
  };

  return (
    <div>
      <BondPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">
          Direct definition
        </div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          A bond is a loan from an investor to an issuer. The issuer promises
          coupon payments during the loan and repayment of face value at
          maturity.
        </p>
      </BondPanel>

      <MissionPrompt>
        Select each field on Northstar Transit’s bond certificate. The guide
        will translate the contract language into the cash flows the fund can
        expect.
      </MissionPrompt>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <BondPanel className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
          <div className="relative">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="ops-caption text-[12px] text-slate-500">
                  Conventional fixed-rate bond · OPS case
                </div>
                <h3 className="ops-interactive-title mt-1 text-xl text-white">
                  Northstar Transit 4% Note
                </h3>
              </div>
              <div className="rounded-full border border-accent-amber/30 bg-accent-amber/10 px-3 py-1 text-xs text-accent-amber">
                NT-1040
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TERMS.map((term) => (
                <button
                  key={term.id}
                  type="button"
                  onClick={() => inspect(term.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    selected === term.id
                      ? "border-accent-amber/50 bg-accent-amber/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25",
                  )}
                >
                  <div className="ops-caption text-[12px] text-slate-500">
                    {term.label}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {term.value}
                  </div>
                  {inspected.includes(term.id) && (
                    <div className="mt-2 text-xs text-accent-green">✓ inspected</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </BondPanel>

        <BondPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
          <div className="ops-caption text-[12px] text-accent-cyan">
            {active.label}
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            {active.value}
          </div>
          <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
            {active.definition}
          </p>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent-green transition-[width] duration-300"
              style={{ width: `${(inspected.length / TERMS.length) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {inspected.length} of {TERMS.length} fields inspected
          </div>
        </BondPanel>
      </div>
    </div>
  );
}

function TimelineScene({ onComplete }: BondSceneProps) {
  const [coupons, setCoupons] = useState(false);
  const [face, setFace] = useState(false);

  const addCoupons = () => {
    setCoupons(true);
    if (face) onComplete();
  };
  const addFace = () => {
    setFace(true);
    if (coupons) onComplete();
  };

  return (
    <div>
      <MissionPrompt>
        The 4% coupon is applied to the $1,000 face value: 4% × $1,000 =
        $40 each year. Place those coupons first, then place the principal
        repayment.
      </MissionPrompt>

      <BondPanel className="mt-5 overflow-hidden">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addCoupons}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              coupons
                ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                : "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
            )}
          >
            {coupons ? "✓ $40 coupons placed" : "Place $40 annual coupons"}
          </button>
          <button
            type="button"
            onClick={addFace}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              face
                ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                : "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
            )}
          >
            {face ? "✓ $1,000 face value placed" : "Add face value at maturity"}
          </button>
        </div>

        <div className="mt-8 overflow-x-auto pb-3">
          <div className="min-w-[680px]">
            <div className="relative grid grid-cols-10 gap-2 before:absolute before:left-[4%] before:right-[4%] before:top-[42px] before:h-px before:bg-white/20">
              {Array.from({ length: 10 }, (_, index) => {
                const year = index + 1;
                const amount = coupons ? 40 + (face && year === 10 ? 1000 : 0) : face && year === 10 ? 1000 : 0;
                return (
                  <div key={year} className="relative text-center">
                    <div className="h-8 text-sm font-semibold tabular-nums text-accent-green">
                      {amount > 0 ? `$${amount.toLocaleString()}` : "—"}
                    </div>
                    <div className="mx-auto h-3 w-3 rounded-full border-2 border-slate-800 bg-accent-amber" />
                    <div className="mt-3 text-xs tabular-nums text-slate-500">
                      Year {year}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {coupons && face && (
          <BondFeedback correct>
            Years 1–9 each pay $40. Year 10 pays the final $40 coupon plus
            $1,000 face value, for a total of $1,040.
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}

function RiskScannerScene({ onComplete }: BondSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const open = (id: string) => {
    if (opened.includes(id)) return;
    const next = [...opened, id];
    setOpened(next);
    if (next.length === 2) onComplete();
  };

  const risks = [
    {
      id: "rates",
      title: "Interest-rate risk",
      tone: "amber",
      definition:
        "Interest-rate risk is the possibility that a change in market rates changes the bond’s market price.",
      event: "Market yields rise from 4% to 5%.",
      effect: "The fixed payments become less valuable today, so the bond price falls.",
    },
    {
      id: "default",
      title: "Default risk",
      tone: "red",
      definition:
        "Default risk is the possibility that the issuer misses some or all promised payments.",
      event: "Northstar loses a major transit contract and cannot make its coupon payment.",
      effect: "The payment timeline itself is interrupted.",
    },
  ] as const;

  return (
    <div>
      <MissionPrompt>
        Open both scanners. Track the event, the financial effect, and the
        part of the bond that changes.
      </MissionPrompt>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {risks.map((risk) => (
          <BondPanel
            key={risk.id}
            className={cn(
              risk.tone === "amber"
                ? "border-accent-amber/25"
                : "border-accent-red/25",
            )}
          >
            <div
              className={cn(
                "ops-caption text-[12px]",
                risk.tone === "amber" ? "text-accent-amber" : "text-accent-red",
              )}
            >
              Risk definition
            </div>
            <h3 className="ops-interactive-title mt-2 text-xl text-white">
              {risk.title}
            </h3>
            <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
              {risk.definition}
            </p>
            <button
              type="button"
              onClick={() => open(risk.id)}
              className="mt-5 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:border-white/30"
            >
              {opened.includes(risk.id) ? "✓ Cause-and-effect chain opened" : `Trace ${risk.title.toLowerCase()} →`}
            </button>
            {opened.includes(risk.id) && (
              <div className="mt-4 space-y-3 border-l border-white/15 pl-4">
                <div>
                  <div className="ops-caption text-[12px] text-slate-500">Event</div>
                  <div className="mt-1 text-sm text-white">{risk.event}</div>
                </div>
                <div>
                  <div className="ops-caption text-[12px] text-slate-500">Effect</div>
                  <div className="mt-1 text-sm leading-5 text-slate-300">{risk.effect}</div>
                </div>
              </div>
            )}
          </BondPanel>
        ))}
      </div>
    </div>
  );
}

const CLASSIFY_CASES = [
  {
    id: "sale",
    event: "The fund must sell next year after market yields rise.",
    answer: "rates",
    explanation:
      "The issuer can still make every promised payment, while the fund faces a lower market selling price.",
  },
  {
    id: "missed",
    event: "Northstar announces that it will miss the next coupon.",
    answer: "default",
    explanation:
      "The issuer’s ability to deliver the promised cash flow has weakened.",
  },
  {
    id: "fall",
    event: "Market yields fall while Northstar’s payment capacity is unchanged.",
    answer: "rates",
    explanation:
      "The fixed promised payments become more valuable today, so the market price rises.",
  },
] as const;

function RiskClassifyScene({ onComplete }: BondSceneProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const choose = (id: string, answer: string) => {
    const next = { ...answers, [id]: answer };
    setAnswers(next);
    if (CLASSIFY_CASES.every((item) => next[item.id] === item.answer)) {
      onComplete();
    }
  };

  return (
    <div>
      <MissionPrompt>
        Classify each event. Interest-rate risk changes market value; default
        risk threatens promised payments.
      </MissionPrompt>
      <div className="mt-5 space-y-4">
        {CLASSIFY_CASES.map((item, index) => {
          const answer = answers[item.id];
          const correct = answer === item.answer;
          return (
            <BondPanel key={item.id}>
              <div className="ops-caption text-[12px] text-slate-500">
                Event {index + 1}
              </div>
              <p className="mt-2 text-[15px] font-semibold text-white">
                {item.event}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <BondChoice
                  selected={answer === "rates"}
                  correct={correct && answer === "rates"}
                  incorrect={answer === "rates" && !correct}
                  onClick={() => choose(item.id, "rates")}
                >
                  Interest-rate risk
                </BondChoice>
                <BondChoice
                  selected={answer === "default"}
                  correct={correct && answer === "default"}
                  incorrect={answer === "default" && !correct}
                  onClick={() => choose(item.id, "default")}
                >
                  Default risk
                </BondChoice>
              </div>
              {answer && (
                <BondFeedback correct={correct}>
                  {correct
                    ? item.explanation
                    : "Identify whether the event changes the market price or interrupts a promised payment."}
                </BondFeedback>
              )}
            </BondPanel>
          );
        })}
      </div>
    </div>
  );
}

function PaymentMapScene({ onComplete }: BondSceneProps) {
  const [payment, setPayment] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const paymentCorrect = payment === "1040";
  const questionCorrect = question === "both";

  const answerPayment = (value: string) => {
    setPayment(value);
    if (value === "1040" && questionCorrect) onComplete();
  };
  const answerQuestion = (value: string) => {
    setQuestion(value);
    if (value === "both" && paymentCorrect) onComplete();
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Annual coupon" value="$40" tone="green" />
        <Metric label="Face value" value="$1,000" tone="cyan" />
        <Metric label="Maturity" value="10 years" />
      </div>

      <BondPanel className="mt-5">
        <h3 className="ops-interactive-title text-lg text-white">
          1. What payment is promised in Year 10?
        </h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            ["40", "$40"],
            ["1000", "$1,000"],
            ["1040", "$1,040"],
          ].map(([value, label]) => (
            <BondChoice
              key={value}
              selected={payment === value}
              correct={paymentCorrect && payment === value}
              incorrect={payment === value && !paymentCorrect}
              onClick={() => answerPayment(value)}
            >
              {label}
            </BondChoice>
          ))}
        </div>
        {payment && (
          <BondFeedback correct={paymentCorrect}>
            {paymentCorrect
              ? "Maturity combines the final $40 coupon with repayment of $1,000 face value."
              : "Year 10 contains both the recurring coupon and the principal repayment."}
          </BondFeedback>
        )}
      </BondPanel>

      <BondPanel className="mt-4">
        <h3 className="ops-interactive-title text-lg text-white">
          2. Which questions belong in the committee’s risk map?
        </h3>
        <div className="mt-4 grid gap-2">
          <BondChoice
            selected={question === "price"}
            incorrect={question === "price"}
            onClick={() => answerQuestion("price")}
          >
            How could market rates change the selling price?
          </BondChoice>
          <BondChoice
            selected={question === "payment"}
            incorrect={question === "payment"}
            onClick={() => answerQuestion("payment")}
          >
            Can the issuer deliver every promised payment?
          </BondChoice>
          <BondChoice
            selected={question === "both"}
            correct={questionCorrect}
            onClick={() => answerQuestion("both")}
          >
            Both questions belong in the map.
          </BondChoice>
        </div>
        {question && (
          <BondFeedback correct={questionCorrect}>
            {questionCorrect
              ? "The first question tracks interest-rate risk. The second tracks default risk."
              : "This session requires both a market-price check and a promised-payment check."}
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}
