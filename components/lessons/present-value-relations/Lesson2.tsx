"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import {
  Reveal,
  SectionHeading,
  Panel,
  DefinitionCard,
  ConceptTag,
  InteractiveFrame,
  TryItTag,
} from "@/components/lessons/intro-course-overview/shared";
import { FormulaCard, Var, Sub, Sup, Frac } from "./FormulaCard";
import PVLayout from "./PVLayout";
import PVHero from "./PVHero";
import ModuleMap from "./ModuleMap";
import MasteryCheck, { type MasteryQuestion } from "./MasteryCheck";
import LessonSummary from "./LessonSummary";
import { useReportLessonComplete } from "@/lib/pv-progress";
import DiscountBeamVisualizer from "./DiscountBeamVisualizer";
import PerpetuityLab from "./PerpetuityLab";
import GrowingPerpetuityMeter from "./GrowingPerpetuityMeter";
import AnnuityBuilder from "./AnnuityBuilder";
import CompoundingSimulator from "./CompoundingSimulator";

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/* ------------------------------------------------------------------ */
/* Step reveal (generic)                                              */
/* ------------------------------------------------------------------ */

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-mono text-[12px] text-accent-cyan">
      {n}
    </span>
  );
}

function StepReveal({
  caption,
  title,
  total,
  intro,
  steps,
  extra,
}: {
  caption: string;
  title: string;
  total: number;
  intro?: ReactNode;
  steps: { n: number; title: string; body: ReactNode }[];
  extra?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(1);
  const next = () => setStep((s) => (s >= total ? 1 : s + 1));
  const allShown = step >= total;

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            {caption}
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          Step {Math.min(step, total)} of {total}
        </span>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        {title}
      </h3>
      {intro && <div className="mt-4">{intro}</div>}

      <ol className="mt-6 space-y-4">
        {steps
          .filter((s) => s.n <= step)
          .map((s) => (
            <motion.li
              key={s.n}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex items-center gap-3">
                <StepBadge n={s.n} />
                <span className="ops-body-strong text-[16px] text-slate-50">
                  {s.title}
                </span>
              </div>
              <div className="mt-4">{s.body}</div>
            </motion.li>
          ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button size="md" onClick={next}>
          {allShown ? "Replay" : "Next step"}
        </Button>
      </div>

      {allShown && extra && <div className="mt-6">{extra}</div>}
    </InteractiveFrame>
  );
}

/* ------------------------------------------------------------------ */
/* $1 growth mini-interaction (block 2)                               */
/* ------------------------------------------------------------------ */

const GROWTH_RATES = [4, 8, 12];
const PV_YEARS = [1, 5, 10, 20];

function DollarGrowthMini() {
  const reduce = useReducedMotion();
  const [rate, setRate] = useState(8);
  const rDec = rate / 100;
  const rows = PV_YEARS.map((t) => ({
    t,
    pv: 1 / Math.pow(1 + rDec, t),
  }));
  const maxPv = rows[0].pv;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="ops-caption text-[11px] text-slate-400">
          Present value of $1 received in the future
        </span>
        <div className="flex gap-1.5">
          {GROWTH_RATES.map((rt) => (
            <button
              key={rt}
              type="button"
              aria-pressed={rate === rt}
              aria-label={`Use discount rate ${rt} percent`}
              onClick={() => setRate(rt)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                rate === rt
                  ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                  : "border-white/20 text-slate-200 hover:border-accent-amber/60",
              )}
            >
              {rt}%
            </button>
          ))}
        </div>
      </div>

      <div
        className="mt-4 flex items-end gap-4"
        role="img"
        aria-label={`At ${rate} percent, the present value of one dollar declines as the receipt year moves farther out.`}
      >
        {rows.map((row) => {
          const frac = row.pv / maxPv;
          return (
            <div
              key={row.t}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="font-mono text-[13px] text-slate-200">
                ${row.pv.toFixed(3)}
              </span>
              <div className="flex h-[92px] w-full items-end">
                <motion.div
                  className="w-full rounded-t-sm bg-accent-amber/80"
                  style={{
                    height: `${Math.max(frac, 0.02) * 92}px`,
                    transformOrigin: "bottom",
                  }}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <span className="ops-caption text-[11px] text-slate-400">
                Year {row.t}
              </span>
            </div>
          );
        })}
      </div>
      <p className="ops-muted mt-4 text-[13px] text-slate-400">
        At {rate}%, a dollar arriving in Year 20 is worth only{" "}
        <span className="font-mono text-slate-200">
          ${(1 / Math.pow(1 + rDec, 20)).toFixed(3)}
        </span>{" "}
        today. PV declines as the receipt year moves farther into the future.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lighting example — live NPV slider (extra)                         */
/* ------------------------------------------------------------------ */

function LightingLiveSlider() {
  const reduce = useReducedMotion();
  const [rate, setRate] = useState(4); // percent
  const rDec = rate / 100;
  const cost = 230000;
  const savings = 90000;

  const pv1 = savings / Math.pow(1 + rDec, 1);
  const pv2 = savings / Math.pow(1 + rDec, 2);
  const pv3 = savings / Math.pow(1 + rDec, 3);
  const npv = -cost + pv1 + pv2 + pv3;

  // find IRR (rate where NPV crosses zero) by scan
  let irr: number | null = null;
  for (let i = 1; i <= 2000; i++) {
    const rr = (i / 100) * 0.01; // 0.01% .. 20%
    const val =
      -cost +
      savings / Math.pow(1 + rr, 1) +
      savings / Math.pow(1 + rr, 2) +
      savings / Math.pow(1 + rr, 3);
    if (val <= 0) {
      irr = rr * 100;
      break;
    }
  }
  const accept = npv > 0;

  return (
    <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="ops-caption text-[11px] text-accent-cyan">
          Live NPV explorer · lighting system
        </span>
        <span className="ops-caption text-[11px] text-slate-400">
          IRR ≈ {irr !== null ? irr.toFixed(1) : "—"}%
        </span>
      </div>

      <label className="mt-4 block">
        <span className="ops-caption flex items-center justify-between text-[11px] text-slate-400">
          <span>Discount rate</span>
          <span className="font-mono text-accent-cyan">{rate.toFixed(1)}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={20}
          step={0.1}
          value={rate}
          aria-label="Discount rate for lighting NPV, 0 to 20 percent"
          onChange={(e) => setRate(Number(e.target.value))}
          className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#22d3ee]"
        />
      </label>

      {/* threshold marker line under slider */}
      {irr !== null && (
        <div className="relative mt-1 h-4">
          <div
            className="absolute top-0 h-3 w-px bg-accent-amber"
            style={{ left: `${(irr / 20) * 100}%` }}
            aria-hidden
          />
          <span
            className="ops-caption absolute -top-0.5 -translate-x-1/2 whitespace-nowrap text-[10px] text-accent-amber"
            style={{ left: `${(irr / 20) * 100}%` }}
          >
            NPV = 0
          </span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "Year 0 cost", v: -cost, tone: "red" as const },
          { k: "Year 1 PV", v: pv1, tone: "green" as const },
          { k: "Year 2 PV", v: pv2, tone: "green" as const },
          { k: "Year 3 PV", v: pv3, tone: "green" as const },
        ].map((row) => (
          <div
            key={row.k}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
          >
            <div className="ops-caption text-[11px] text-slate-400">
              {row.k}
            </div>
            <div
              className={cn(
                "mt-1 font-mono text-[14px]",
                row.tone === "red" ? "text-accent-red" : "text-accent-green",
              )}
            >
              {fmt(row.v)}
            </div>
          </div>
        ))}
      </div>

      <motion.div
        key={accept ? "acc" : "rej"}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "mt-4 rounded-xl border p-4",
          accept
            ? "border-accent-green/40 bg-accent-green/10"
            : "border-accent-red/40 bg-accent-red/10",
        )}
      >
        <div
          className={cn(
            "ops-caption text-[11px]",
            accept ? "text-accent-green" : "text-accent-red",
          )}
        >
          NPV = {fmt(npv)} — {accept ? "Accept" : "Reject"}
        </div>
        <p className="ops-body-strong mt-2 text-[16px] text-slate-50">
          {accept
            ? "At this rate the savings outweigh the cost — the project creates value."
            : "At this rate the discounted savings no longer cover the cost."}
        </p>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Annuity intuition — three-row visual                               */
/* ------------------------------------------------------------------ */

function StreamRow({
  label,
  color,
  prefix,
  children,
}: {
  label: string;
  color: string;
  prefix?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-40 flex-shrink-0">
        <span className={cn("ops-caption text-[11px]", color)}>{label}</span>
        {prefix && (
          <span className="ml-1 font-mono text-[14px] text-slate-300">
            {prefix}
          </span>
        )}
      </div>
      <div className="flex flex-1 items-end gap-1">{children}</div>
    </div>
  );
}

function StreamBars({
  count,
  tone,
  faded,
  showInf,
}: {
  count: number;
  tone: "green" | "cyan" | "red";
  faded?: boolean;
  showInf?: boolean;
}) {
  const cls = {
    green: "bg-accent-green",
    cyan: "bg-accent-cyan",
    red: "bg-accent-red",
  }[tone];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("h-7 flex-1 rounded-t-sm", cls, faded && "opacity-30")}
        />
      ))}
      {showInf && (
        <span className="ml-1 self-center font-mono text-[13px] text-accent-cyan/70">
          …∞
        </span>
      )}
    </>
  );
}

function AnnuityIntuition() {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
      <div className="space-y-5">
        <StreamRow label="Perpetuity" color="text-accent-cyan">
          <StreamBars count={5} tone="cyan" />
          <StreamBars count={2} tone="cyan" faded />
          <span className="ml-1 self-center font-mono text-[13px] text-accent-cyan/70">
            …∞
          </span>
        </StreamRow>

        <StreamRow
          label="Minus date-T perpetuity"
          color="text-accent-red"
          prefix="−"
        >
          <StreamBars count={5} tone="red" faded />
          <StreamBars count={2} tone="red" />
          <span className="ml-1 self-center font-mono text-[13px] text-accent-red/70">
            …∞
          </span>
        </StreamRow>

        <div className="h-px w-full bg-white/10" aria-hidden />

        <StreamRow label="= T-period annuity" color="text-accent-green">
          <StreamBars count={5} tone="green" />
          <span className="ml-1 self-center font-mono text-[13px] text-slate-500">
            stops
          </span>
        </StreamRow>
      </div>
      <p className="ops-muted mt-5 text-[13px] leading-6 text-slate-400">
        An annuity equals a perpetuity that starts today, minus a second
        perpetuity that starts at date T. The infinite tails cancel, leaving a
        finite stream.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lighting example (Worked Example 3) data                           */
/* ------------------------------------------------------------------ */

const LIGHTING_TIMELINE = (
  <div className="rounded-xl border border-white/10 bg-ink-950/40 p-5">
    <div className="relative flex items-start justify-between gap-3">
      <div
        className="pointer-events-none absolute left-0 right-0 top-[7px] h-px bg-accent-cyan/40"
        aria-hidden
      />
      {[
        { t: "Year 0", amount: "−$230,000", tone: "red" as const },
        { t: "Year 1", amount: "+$90,000", tone: "green" as const },
        { t: "Year 2", amount: "+$90,000", tone: "green" as const },
        { t: "Year 3", amount: "+$90,000", tone: "green" as const },
      ].map((n) => (
        <div
          key={n.t}
          className="relative flex w-1/4 flex-col items-center text-center"
        >
          <span
            className={cn(
              "h-3.5 w-3.5 rounded-full ring-4 ring-ink-950",
              n.t === "Year 0" ? "bg-accent-amber" : "bg-accent-cyan",
            )}
            aria-hidden
          />
          <div className="mt-3 font-mono text-[12px] text-slate-300">{n.t}</div>
          <div
            className={cn(
              "mt-2 font-mono text-[14px]",
              n.tone === "red" ? "text-accent-red" : "text-accent-green",
            )}
          >
            {n.amount}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LIGHTING_STEPS = [
  { n: 1, title: "Draw the timeline", body: LIGHTING_TIMELINE },
  {
    n: 2,
    title: "Discount each saving at 4%",
    body: (
      <FormulaCard
        label="Discount each cashflow"
        ariaLabel="Present value of each saving equals 90000 divided by 1.04 to the power t"
      >
        <Var>PV</Var>
        <Sub>1</Sub> = <Frac num={<>90,000</>} den={<>1.04</>} /> ={" "}
        <span className="text-accent-green">$86,538</span>
        <br />
        <Var>PV</Var>
        <Sub>2</Sub> ={" "}
        <Frac
          num={<>90,000</>}
          den={
            <>
              (1.04)<Sup>2</Sup>
            </>
          }
        />{" "}
        = <span className="text-accent-green">$83,210</span>
        <br />
        <Var>PV</Var>
        <Sub>3</Sub> ={" "}
        <Frac
          num={<>90,000</>}
          den={
            <>
              (1.04)<Sup>3</Sup>
            </>
          }
        />{" "}
        = <span className="text-accent-green">$80,010</span>
      </FormulaCard>
    ),
  },
  {
    n: 3,
    title: "Sum and subtract the cost",
    body: (
      <FormulaCard
        label="Net present value"
        ariaLabel="NPV equals negative 230000 plus 86538 plus 83210 plus 80010 equals 19758"
      >
        <div className="space-y-2">
          <div>
            <Var>NPV</Var> = <span className="text-accent-red">−230,000</span> +
            86,538 + 83,210 + 80,010
          </div>
          <div>
            = <span className="text-accent-green">$19,758</span>
          </div>
        </div>
      </FormulaCard>
    ),
  },
  {
    n: 4,
    title: "Decide",
    body: (
      <div className="rounded-xl border border-accent-green/40 bg-accent-green/10 p-4">
        <div className="ops-caption text-[11px] text-accent-green">
          Decision
        </div>
        <p className="ops-body-strong mt-2 text-[16px] text-slate-50">
          Accept. NPV is positive — the lighting system creates about $19,758 of
          value today.
        </p>
      </div>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* CNOOC example (Worked Example 4) data                              */
/* ------------------------------------------------------------------ */

const CNOOC_STEPS = [
  {
    n: 1,
    title: "Identify the subsidized loans",
    body: (
      <div className="space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-slate-400">
            Loan 1 · 2-year, zero interest
          </div>
          <p className="ops-body-strong mt-1.5 text-[15px] text-slate-100">
            $2.5B at 0% vs. a normal 8% rate. Annual subsidy = 2.5 × (0.08 −
            0.000) = <span className="text-accent-green">$0.2B / yr</span> for 2
            years.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-slate-400">
            Loan 2 · 30-year, 3.5%
          </div>
          <p className="ops-body-strong mt-1.5 text-[15px] text-slate-100">
            $4.5B at 3.5% vs. a normal 8% rate. Annual subsidy = 4.5 × (0.08 −
            0.035) = <span className="text-accent-green">$0.2025B / yr</span>{" "}
            for 30 years.
          </p>
        </div>
      </div>
    ),
  },
  {
    n: 2,
    title: "Combine the subsidy cashflows",
    body: (
      <div className="rounded-xl border border-white/10 bg-ink-950/40 p-5">
        <div className="ops-caption text-[11px] text-slate-400">
          Subsidy schedule
        </div>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="ops-body text-[15px] text-slate-200">
              Years 1–2 (both loans)
            </span>
            <span className="font-mono text-[15px] text-accent-green">
              ≈ $0.4B / yr
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="ops-body text-[15px] text-slate-200">
              Years 3–30 (loan 2 only)
            </span>
            <span className="font-mono text-[15px] text-accent-green">
              ≈ $0.2B / yr
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    n: 3,
    title: "Discount the subsidies at the normal 8% rate",
    body: (
      <FormulaCard
        label="Present value of the financing advantage"
        ariaLabel="Discounting the subsidy schedule at 8 percent gives a present value of about 2.62 billion dollars"
      >
        <div className="space-y-2">
          <div>
            <Var>PV</Var> = discount {`{`}Years 1–2: ~0.4B/yr; Years 3–30:
            ~0.2B/yr{`}`} at <Var>r</Var> = 8%
          </div>
          <div>
            ≈ <span className="text-accent-green">$2.62B</span>
          </div>
        </div>
      </FormulaCard>
    ),
  },
  {
    n: 4,
    title: "Interpret",
    body: (
      <div className="rounded-xl border border-accent-cyan/40 bg-accent-cyan/[0.07] p-4">
        <div className="ops-caption text-[11px] text-accent-cyan">
          Interpretation
        </div>
        <p className="ops-body-strong mt-2 text-[16px] text-slate-50">
          Present value can value financing advantages, not only physical
          projects. Cheap loans are worth real money today — here, about $2.62B
          of value.
        </p>
      </div>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Mastery questions                                                  */
/* ------------------------------------------------------------------ */

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "Calculate the future value of $1 at 5% for 3 years.",
    choices: [
      { id: "$1.158", label: "$1.158" },
      { id: "$1.05", label: "$1.05" },
      { id: "$1.50", label: "$1.50" },
    ],
    correctId: "$1.158",
    hint: "(1.05)^3 ≈ 1.158",
  },
  {
    id: "q2",
    type: "single",
    prompt: "In the lighting example, the NPV at 4% is closest to:",
    choices: [
      { id: "$19,758", label: "$19,758" },
      { id: "−$230,000", label: "−$230,000" },
      { id: "$90,000", label: "$90,000" },
    ],
    correctId: "$19,758",
    hint: "Sum the discounted savings and subtract the cost.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "Which cashflow pays a constant amount every period forever?",
    choices: [
      { id: "Perpetuity", label: "Perpetuity" },
      { id: "Annuity", label: "Annuity" },
      { id: "Bond coupon only", label: "Bond coupon only" },
    ],
    correctId: "Perpetuity",
    hint: "An annuity eventually stops; a perpetuity does not.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "A perpetuity pays C = 100 at r = 10%. Its value is:",
    choices: [
      { id: "1,000", label: "$1,000" },
      { id: "100", label: "$100" },
      { id: "10,000", label: "$10,000" },
    ],
    correctId: "1,000",
    hint: "PV = C / r = 100 / 0.10.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "An annuity pays C = 100,000 for 20 years at r = 10%. PV is:",
    choices: [
      { id: "851,356", label: "$851,356" },
      { id: "1,000,000", label: "$1,000,000" },
      { id: "2,000,000", label: "$2,000,000" },
    ],
    correctId: "851,356",
    hint: "Use the annuity formula; it is below the perpetuity value.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "Which statement is true?",
    choices: [
      {
        id: "ear",
        label:
          "EAR is greater than APR when compounding more than once a year.",
      },
      { id: "equal", label: "EAR always equals APR." },
      { id: "apr", label: "APR accounts for compounding." },
    ],
    correctId: "ear",
    hint: "More frequent compounding earns interest on interest.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function Lesson2() {
  const report = useReportLessonComplete(
    "present-value-perpetuities-annuities-compounding",
    ["perpetuity-logic", "annuity-logic", "compounding", "discounting"],
  );

  return (
    <PVLayout>
      <PVHero
        index="02"
        eyebrow="Lesson 2 · Module 2"
        heading="Some cashflows repeat. Finance has shortcuts for them."
        subheading="Perpetuities, annuities, and compounding are not just formulas. They are patterns of cash over time."
        primaryLabel="Start Special Cashflows"
      />

      <div id="lesson-content" />
      <Reveal className="mt-10">
        <ModuleMap />
      </Reveal>

      {/* Part II */}
      <Reveal className="mt-12">
        <SectionHeading
          index="01"
          eyebrow="Part II"
          title="Perpetuities, Annuities, and Compounding"
        />
      </Reveal>

      {/* 1. Overview */}
      <Reveal className="mt-6">
        <Panel>
          <div className="ops-caption text-[11px] text-slate-400">
            Lesson objectives
          </div>
          <h3 className="ops-interactive-title mt-2 text-2xl text-white">
            What you should understand in this lesson
          </h3>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            Present value is now applied to practical investments and special
            cashflow patterns. You will value projects, perpetuities, growing
            perpetuities, annuities, and loans with frequent compounding.
          </p>
        </Panel>
      </Reveal>

      {/* 2. Future value of $1 */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            How $1 grows
          </h3>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            A dollar invested today compounds forward. At 5%, one dollar becomes
            $1.05 after one year, $1.103 after two, and $1.158 after three. The
            same force runs in reverse: a future dollar is worth less the
            farther out it sits.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { k: "Year 1", v: "$1 × 1.05 = $1.05" },
              { k: "Year 2", v: "$1 × 1.05² = $1.103" },
              { k: "Year 3", v: "$1 × 1.05³ = $1.158" },
            ].map((r) => (
              <div
                key={r.k}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="ops-caption text-[11px] text-slate-400">
                  {r.k}
                </div>
                <div className="mt-1 font-mono text-[14px] text-accent-amber">
                  {r.v}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <FormulaCard
              label="Future value"
              ariaLabel="Future value equals 1 times 1 plus r to the power t"
            >
              <Var>FV</Var> = 1 × (1+<Var>r</Var>)<Sup>t</Sup>
            </FormulaCard>
          </div>
          <DollarGrowthMini />
        </Panel>
      </Reveal>

      {/* 3. DiscountBeamVisualizer */}
      <Reveal className="mt-12">
        <DiscountBeamVisualizer />
      </Reveal>

      {/* 4. Worked example 3 — lighting */}
      <Reveal className="mt-12">
        <StepReveal
          caption="Worked example 03"
          title="Worked Example: Lighting system investment"
          total={4}
          intro={
            <p className="ops-body text-[15px] leading-7 text-slate-300">
              A building spends $800,000 a year on electricity. A new lighting
              system costs <span className="text-accent-red">$230,000</span>{" "}
              today and saves <span className="text-accent-green">$90,000</span>{" "}
              in each of Years 1–3. The interest rate is 4%.
            </p>
          }
          steps={LIGHTING_STEPS}
          extra={<LightingLiveSlider />}
        />
      </Reveal>

      {/* 5. Worked example 4 — CNOOC */}
      <Reveal className="mt-12">
        <StepReveal
          caption="Worked example 04"
          title="Worked Example: CNOOC cheap-loan subsidy"
          total={4}
          intro={
            <p className="ops-body text-[15px] leading-7 text-slate-300">
              CNOOC receives a{" "}
              <span className="text-slate-100">
                $2.5B zero-interest 2-year loan
              </span>{" "}
              and a{" "}
              <span className="text-slate-100">$4.5B 3.5% 30-year loan</span>.
              CNOOC&apos;s normal borrowing rate is 8%. How much are these cheap
              loans worth today?
            </p>
          }
          steps={CNOOC_STEPS}
        />
      </Reveal>

      {/* 6. Perpetuity */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            Perpetuity
          </h3>
          <div className="mt-4">
            <DefinitionCard term="Perpetuity">
              A perpetuity pays a constant cashflow C every period forever,
              starting one period from now.
            </DefinitionCard>
          </div>
          <div className="mt-5">
            <FormulaCard
              label="Perpetuity"
              ariaLabel="Present value of a perpetuity equals C divided by r"
            >
              <Var>PV</Var> ={" "}
              <Frac
                num={
                  <>
                    <Var>C</Var>
                  </>
                }
                den={
                  <>
                    <Var>r</Var>
                  </>
                }
              />
            </FormulaCard>
          </div>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            The value is finite because distant cashflows are discounted more
            heavily. Even an infinite stream collapses to a single number today.
          </p>
        </Panel>
      </Reveal>

      {/* 7. PerpetuityLab */}
      <Reveal className="mt-12">
        <PerpetuityLab />
      </Reveal>

      {/* 8. Growing perpetuity */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            Growing perpetuity
          </h3>
          <div className="mt-4">
            <DefinitionCard term="Growing perpetuity">
              A growing perpetuity pays cashflows that grow at rate g forever.
            </DefinitionCard>
          </div>
          <div className="mt-5">
            <FormulaCard
              label="Growing perpetuity"
              ariaLabel="Present value equals C divided by r minus g, where r is greater than g"
            >
              <Var>PV</Var> ={" "}
              <Frac
                num={
                  <>
                    <Var>C</Var>
                  </>
                }
                den={
                  <>
                    <Var>r</Var> − <Var>g</Var>
                  </>
                }
              />
              , where <Var>r</Var> &gt; <Var>g</Var>
            </FormulaCard>
          </div>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            Growth raises value, but the formula only works when r is greater
            than g. If growth meets or beats the discount rate, the series never
            converges.
          </p>
        </Panel>
      </Reveal>

      {/* 9. GrowingPerpetuityMeter */}
      <Reveal className="mt-12">
        <GrowingPerpetuityMeter />
      </Reveal>

      {/* 10. Annuity */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">Annuity</h3>
          <div className="mt-4">
            <DefinitionCard term="Annuity">
              An annuity pays a constant cashflow C for T periods and then
              stops.
            </DefinitionCard>
          </div>
          <div className="mt-5">
            <FormulaCard
              label="Annuity"
              ariaLabel="Present value of an annuity equals C over r times 1 minus 1 over 1 plus r to the T"
            >
              <Var>PV</Var> ={" "}
              <Frac
                num={
                  <>
                    <Var>C</Var>
                  </>
                }
                den={
                  <>
                    <Var>r</Var>
                  </>
                }
              />{" "}
              ×{" "}
              <span className="inline-flex items-center">
                [ 1 −{" "}
                <Frac
                  num={<>1</>}
                  den={
                    <>
                      (1+<Var>r</Var>)<Sup>T</Sup>
                    </>
                  }
                />{" "}
                ]
              </span>
            </FormulaCard>
          </div>
        </Panel>
      </Reveal>

      {/* 11. Annuity intuition */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            An annuity is a perpetuity that stops
          </h3>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            The annuity formula is not magic — it is a perpetuity with the
            infinite tail removed. Subtract a second perpetuity that begins at
            date T and the tails cancel.
          </p>
          <AnnuityIntuition />
        </Panel>
      </Reveal>

      {/* 12. AnnuityBuilder */}
      <Reveal className="mt-12">
        <AnnuityBuilder />
      </Reveal>

      {/* 13. Compounding */}
      <Reveal className="mt-12">
        <Panel>
          <h3 className="ops-interactive-title text-2xl text-white">
            Compounding
          </h3>
          <p className="ops-body mt-4 text-[16px] leading-7 text-slate-200">
            Interest may be credited or charged more often than annually. Bank
            accounts may compound daily. Mortgages and leases often compound
            monthly. Bonds often use semiannual conventions.
          </p>
          <div className="mt-5">
            <FormulaCard
              label="Effective annual rate"
              ariaLabel="Effective annual rate equals 1 plus r over n, to the n, minus 1"
            >
              <Var>EAR</Var> = (1 +{" "}
              <Frac
                num={
                  <>
                    <Var>r</Var>
                  </>
                }
                den={
                  <>
                    <Var>n</Var>
                  </>
                }
              />
              )<Sup>n</Sup> − 1
            </FormulaCard>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="ops-caption text-[11px] text-slate-400">
                Definitions
              </div>
              <ul className="mt-2 space-y-1.5">
                <li className="ops-body text-[15px] text-slate-200">
                  <span className="font-mono text-accent-cyan">r</span> = APR
                  (quoted annual rate)
                </li>
                <li className="ops-body text-[15px] text-slate-200">
                  <span className="font-mono text-accent-cyan">n</span> =
                  compounding periods per year
                </li>
                <li className="ops-body text-[15px] text-slate-200">
                  <span className="font-mono text-accent-cyan">r/n</span> =
                  per-period rate
                </li>
                <li className="ops-body text-[15px] text-slate-200">
                  <span className="font-mono text-accent-cyan">EAR</span> =
                  effective annual rate
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <ConceptTag concept="time">More frequent compounding</ConceptTag>
              <ConceptTag concept="value">EAR &gt; APR</ConceptTag>
              <ConceptTag concept="market">Quoted vs. true rate</ConceptTag>
            </div>
          </div>
        </Panel>
      </Reveal>

      {/* 14. CompoundingSimulator */}
      <Reveal className="mt-12">
        <CompoundingSimulator />
      </Reveal>

      {/* Mastery check */}
      <Reveal className="mt-12">
        <MasteryCheck
          title="Part II mastery check"
          passCount={5}
          onComplete={() => report(true)}
          continueLabel="Continue to Real vs Nominal Value"
          continueHref="/lessons/present-value-inflation-real-nominal"
          skills={[
            "perpetuity-logic",
            "annuity-logic",
            "compounding",
            "discounting",
          ]}
          onSkillsMastered={() => {}}
          questions={QUESTIONS}
        />
      </Reveal>

      {/* Summary */}
      <Reveal className="mt-12">
        <LessonSummary
          points={[
            "Assets are sequences of cashflows.",
            "Cashflows at different dates are different economic units.",
            "Present value converts future cashflows into today's dollars.",
            "NPV is the present value of benefits minus costs.",
            "Positive-NPV projects create value.",
            "Perpetuities and annuities are special cashflow patterns.",
            "Compounding affects the true annual rate.",
            "Inflation changes purchasing power.",
            "Real and nominal cashflows must be discounted consistently.",
          ]}
          continueLabel="Continue to Real vs Nominal Value"
          continueHref="/lessons/present-value-inflation-real-nominal"
          backLabel="Back to Cashflows and NPV"
          backHref="/lessons/present-value-cashflows-assets-npv"
        />
      </Reveal>
    </PVLayout>
  );
}
