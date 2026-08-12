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

const LESSON_SLUG = "if-2-4-default-risk-can-the-issuer-deliver";

const STEPS = [
  {
    label: "Define",
    title: "Locate default risk in the promise",
    guide:
      "The payment timeline shows what the issuer promises. Default analysis asks whether the issuer can actually deliver those cash flows.",
    instruction: "Open the promised-payment stress case.",
    next: "Test payment capacity",
  },
  {
    label: "Capacity",
    title: "Run cash through fixed commitments",
    guide:
      "Operating cash flow supplies the money available to meet obligations. Fixed commitments claim part of that cash before the issuer has flexibility.",
    instruction: "Apply the contract-loss event to the cash-flow machine.",
    next: "Trace the three drivers",
  },
  {
    label: "Drivers",
    title: "Test what changes default risk",
    guide:
      "Default risk depends on cash-flow capacity, cash-flow stability, and the size of fixed commitments. Trace one event through each driver.",
    instruction: "Inspect all three cause-and-effect chains.",
    next: "Build the rating evidence file",
  },
  {
    label: "Rating",
    title: "Turn evidence into a credit opinion",
    guide:
      "A credit rating summarizes an agency’s estimate of default risk using financial ratios and qualitative evidence.",
    instruction: "Add every relevant evidence source to the rating file.",
    next: "Make the credit judgment",
  },
  {
    label: "Judge",
    title: "Choose the stronger payment capacity",
    guide:
      "Compare the issuers using the three drivers. A larger cash-flow number alone does not settle the decision.",
    instruction: "Choose an issuer and support the choice with the strongest evidence.",
    next: "Enter Lesson 2.5",
  },
] as const;

export default function DefaultRiskJourney() {
  return (
    <BondJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 2.4 default-risk journey"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <DefaultDefinitionScene onComplete={onComplete} />;
        if (step === 1) return <CashMachineScene onComplete={onComplete} />;
        if (step === 2) return <DefaultDriversScene onComplete={onComplete} />;
        if (step === 3) return <RatingEvidenceScene onComplete={onComplete} />;
        return <CreditJudgmentScene onComplete={onComplete} />;
      }}
      nextLesson={{
        href: "/lessons/if-2-5-from-credit-rating-to-bond-price",
        label: "Continue to Lesson 2.5",
      }}
    />
  );
}

function DefaultDefinitionScene({ onComplete }: BondSceneProps) {
  const [opened, setOpened] = useState(false);
  const open = () => {
    setOpened(true);
    onComplete();
  };
  return (
    <div>
      <BondPanel className="border-accent-red/25 bg-accent-red/[0.04]">
        <div className="ops-caption text-[12px] text-accent-red">
          Direct definition
        </div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          Default risk is the possibility that an issuer misses some or all of
          the payments promised by a bond.
        </p>
      </BondPanel>
      <MissionPrompt>
        Northstar Transit owes a $40 coupon. Open the stress case to see how a
        promised cash flow becomes a credit question.
      </MissionPrompt>
      <BondPanel className="mt-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <div className="ops-caption text-[12px] text-slate-500">Issuer</div>
            <div className="mt-1 font-semibold text-white">Northstar Transit</div>
            <div className="mt-3 text-sm text-slate-300">Promises $40 this year</div>
          </div>
          <div className="text-center text-xl text-accent-amber" aria-hidden>→</div>
          <div
            className={cn(
              "rounded-xl border p-4 transition-colors",
              opened
                ? "border-accent-red/40 bg-accent-red/[0.07]"
                : "border-white/10 bg-white/[0.025]",
            )}
          >
            <div className="ops-caption text-[12px] text-slate-500">Bondholder</div>
            <div className="mt-1 font-semibold text-white">Scholarship fund</div>
            <div className={cn("mt-3 text-sm", opened ? "text-accent-red" : "text-slate-300")}>
              {opened ? "Receives $0 on the due date" : "Expects $40 on the due date"}
            </div>
          </div>
        </div>
        {!opened ? (
          <button
            type="button"
            onClick={open}
            className="mt-5 rounded-full border border-accent-red/40 bg-accent-red/10 px-5 py-2.5 text-sm font-semibold text-accent-red"
          >
            Apply the missed-payment event →
          </button>
        ) : (
          <BondFeedback correct>
            The contract states the promised payment. Default analysis studies
            the issuer’s capacity to deliver it.
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}

function CashMachineScene({ onComplete }: BondSceneProps) {
  const [stressed, setStressed] = useState(false);
  const operatingCash = stressed ? 65 : 120;
  const commitments = 45;
  const cushion = operatingCash - commitments;
  const stress = () => {
    setStressed(true);
    onComplete();
  };
  return (
    <div>
      <BondPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="font-semibold text-white">Operating cash flow</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Cash generated by the issuer’s core operations that can support
              its financial obligations.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white">Fixed commitments</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Contractual obligations, including interest and principal, that
              claim cash on scheduled dates.
            </p>
          </div>
        </div>
      </BondPanel>
      <MissionPrompt>
        Northstar loses a major transit contract. Apply the event and watch the
        payment cushion—the operating cash left after fixed commitments.
      </MissionPrompt>
      <BondPanel className="mt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Operating cash flow" value={`$${operatingCash}m`} tone={stressed ? "red" : "green"} />
          <Metric label="Fixed commitments" value={`$${commitments}m`} />
          <Metric label="Payment cushion" value={`${cushion >= 0 ? "$" : "−$"}${Math.abs(cushion)}m`} tone={cushion >= 30 ? "green" : "red"} />
        </div>
        <div className="mt-6 h-5 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-[width,background-color] duration-500",
              stressed ? "bg-accent-red/70" : "bg-accent-green/70",
            )}
            style={{ width: `${Math.max(8, (operatingCash / 120) * 100)}%` }}
          />
        </div>
        {!stressed ? (
          <button
            type="button"
            onClick={stress}
            className="mt-5 rounded-full border border-accent-red/40 bg-accent-red/10 px-5 py-2.5 text-sm font-semibold text-accent-red"
          >
            Apply the contract loss →
          </button>
        ) : (
          <BondFeedback correct>
            Operating cash falls from $120m to $65m while commitments remain
            $45m. The payment cushion contracts from $75m to $20m, increasing
            default risk.
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}

const DRIVER_CASES = [
  {
    id: "capacity",
    title: "Cash-flow capacity",
    definition: "More operating cash relative to obligations supports payment capacity.",
    event: "A new multi-year contract adds $35m of recurring operating cash.",
    effect: "The payment cushion grows, so default risk falls.",
  },
  {
    id: "stability",
    title: "Cash-flow stability",
    definition: "Steadier operating cash makes scheduled payments easier to plan and fund.",
    event: "Fuel costs begin swinging sharply from quarter to quarter.",
    effect: "Future cash becomes less predictable, so default risk rises.",
  },
  {
    id: "commitments",
    title: "Fixed commitments",
    definition: "Larger contractual payments consume more of the issuer’s available cash.",
    event: "Northstar issues more debt and adds $18m of annual interest expense.",
    effect: "The payment cushion shrinks, so default risk rises.",
  },
] as const;

function DefaultDriversScene({ onComplete }: BondSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const open = (id: string) => {
    if (opened.includes(id)) return;
    const next = [...opened, id];
    setOpened(next);
    if (next.length === DRIVER_CASES.length) onComplete();
  };
  return (
    <div>
      <MissionPrompt>
        Open each driver and follow the event through the issuer’s finances to
        its effect on default risk.
      </MissionPrompt>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {DRIVER_CASES.map((item) => (
          <BondPanel key={item.id}>
            <div className="ops-caption text-[12px] text-accent-amber">Driver</div>
            <h3 className="mt-2 font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.definition}</p>
            <button
              type="button"
              onClick={() => open(item.id)}
              className="mt-4 w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2.5 text-left text-sm font-semibold text-white"
            >
              {opened.includes(item.id) ? "✓ Chain traced" : "Trace the event →"}
            </button>
            {opened.includes(item.id) && (
              <div className="mt-4 border-l border-accent-amber/30 pl-3 text-sm leading-5">
                <div className="text-white">{item.event}</div>
                <div className="mt-2 text-slate-400">↓</div>
                <div className="mt-2 text-slate-300">{item.effect}</div>
              </div>
            )}
          </BondPanel>
        ))}
      </div>
    </div>
  );
}

const RATING_EVIDENCE = [
  {
    id: "cash",
    title: "Operating cash flow",
    note: "Shows the cash available to support obligations.",
  },
  {
    id: "stability",
    title: "Cash-flow stability",
    note: "Shows how dependable that capacity has been.",
  },
  {
    id: "commitments",
    title: "Fixed commitments",
    note: "Shows how much cash is already contractually claimed.",
  },
  {
    id: "qualitative",
    title: "Industry and management evidence",
    note: "Adds information about competition, business conditions, and financial policy.",
  },
] as const;

function RatingEvidenceScene({ onComplete }: BondSceneProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const add = (id: string) => {
    if (selected.includes(id)) return;
    const next = [...selected, id];
    setSelected(next);
    if (next.length === RATING_EVIDENCE.length) onComplete();
  };
  return (
    <div>
      <BondPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">
          Direct definition
        </div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          A credit rating is a rating agency’s estimate of an issuer’s credit
          risk based on financial ratios and qualitative evidence.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Ratings are estimates. Agencies can make mistakes, and some bonds do
          not have a rating.
        </p>
      </BondPanel>
      <MissionPrompt>
        Add every relevant evidence source to Northstar’s rating file.
      </MissionPrompt>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {RATING_EVIDENCE.map((item) => {
          const added = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => add(item.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                added
                  ? "border-accent-green/40 bg-accent-green/[0.07]"
                  : "border-white/10 bg-white/[0.025] hover:border-white/25",
              )}
            >
              <div className={cn("font-semibold", added ? "text-accent-green" : "text-white")}>
                {added ? "✓ " : "+ "}{item.title}
              </div>
              <div className="mt-2 text-sm leading-5 text-slate-400">{item.note}</div>
            </button>
          );
        })}
      </div>
      {selected.length === RATING_EVIDENCE.length && (
        <BondFeedback correct>
          The rating file combines quantitative financial capacity with
          qualitative evidence about how that capacity could change.
        </BondFeedback>
      )}
    </div>
  );
}

function CreditJudgmentScene({ onComplete }: BondSceneProps) {
  const [issuer, setIssuer] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const issuerCorrect = issuer === "harbor";
  const reasonCorrect = reason === "cushion";
  const answerIssuer = (value: string) => {
    setIssuer(value);
    if (value === "harbor" && reasonCorrect) onComplete();
  };
  const answerReason = (value: string) => {
    setReason(value);
    if (value === "cushion" && issuerCorrect) onComplete();
  };
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BondPanel>
          <div className="ops-caption text-[12px] text-accent-cyan">Harbor Water</div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label="Operating cash" value="$150m" tone="green" />
            <Metric label="Commitments" value="$50m" />
            <Metric label="Pattern" value="Steady" tone="cyan" />
          </div>
        </BondPanel>
        <BondPanel>
          <div className="ops-caption text-[12px] text-accent-amber">Summit Events</div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label="Operating cash" value="$175m" tone="green" />
            <Metric label="Commitments" value="$140m" tone="red" />
            <Metric label="Pattern" value="Volatile" tone="red" />
          </div>
        </BondPanel>
      </div>

      <BondPanel className="mt-4">
        <h3 className="font-semibold text-white">
          Which issuer currently shows stronger payment capacity?
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <BondChoice
            selected={issuer === "harbor"}
            correct={issuerCorrect}
            onClick={() => answerIssuer("harbor")}
          >
            Harbor Water
          </BondChoice>
          <BondChoice
            selected={issuer === "summit"}
            incorrect={issuer === "summit"}
            onClick={() => answerIssuer("summit")}
          >
            Summit Events
          </BondChoice>
        </div>
      </BondPanel>

      <BondPanel className="mt-4">
        <h3 className="font-semibold text-white">Which evidence best supports that choice?</h3>
        <div className="mt-3 grid gap-2">
          <BondChoice
            selected={reason === "largest"}
            incorrect={reason === "largest"}
            onClick={() => answerReason("largest")}
          >
            Summit has the largest operating cash-flow number.
          </BondChoice>
          <BondChoice
            selected={reason === "cushion"}
            correct={reasonCorrect}
            onClick={() => answerReason("cushion")}
          >
            Harbor has a larger payment cushion and steadier operating cash.
          </BondChoice>
        </div>
        {reason && (
          <BondFeedback correct={reasonCorrect}>
            {reasonCorrect
              ? "Harbor combines $100m of cushion with steadier cash flow. Summit’s $35m cushion is thinner and less predictable."
              : "Compare cash after commitments and the stability of that cash, not only the starting total."}
          </BondFeedback>
        )}
      </BondPanel>
    </div>
  );
}
