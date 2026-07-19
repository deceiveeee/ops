"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import {
  InteractiveFrame,
  TryItTag,
  Feedback,
} from "@/components/lessons/intro-course-overview/shared";
import { FormulaCard, Var, Sub } from "./FormulaCard";
import { usePVProgress, type MasterySkill } from "@/lib/pv-progress";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

type ModeKey = "timeline" | "npv" | "perpetuity" | "annuity" | "inflation";

const MODES: {
  key: ModeKey;
  title: string;
  skill: MasterySkill;
  caption: string;
  tone: "cyan" | "green" | "purple" | "amber" | "red";
}[] = [
  {
    key: "timeline",
    title: "Timeline Sprint",
    skill: "timeline-reading",
    caption: "Place cashflows on the right dates",
    tone: "cyan",
  },
  {
    key: "npv",
    title: "NPV Quick Match",
    skill: "npv-decisions",
    caption: "Pick the project to accept",
    tone: "green",
  },
  {
    key: "perpetuity",
    title: "Perpetuity Lab",
    skill: "perpetuity-logic",
    caption: "Solve PV = C / r",
    tone: "purple",
  },
  {
    key: "annuity",
    title: "Annuity Builder",
    skill: "annuity-logic",
    caption: "Discount a level stream",
    tone: "amber",
  },
  {
    key: "inflation",
    title: "Inflation Fix-It",
    skill: "real-vs-nominal",
    caption: "Match rate to cashflow type",
    tone: "red",
  },
];

const TONE: Record<
  string,
  { border: string; text: string; dot: string; glow: string }
> = {
  cyan: {
    border: "border-accent-cyan/40",
    text: "text-accent-cyan",
    dot: "bg-accent-cyan",
    glow: "bg-accent-cyan/10",
  },
  green: {
    border: "border-accent-green/40",
    text: "text-accent-green",
    dot: "bg-accent-green",
    glow: "bg-accent-green/10",
  },
  purple: {
    border: "border-accent-purple/40",
    text: "text-accent-purple",
    dot: "bg-accent-purple",
    glow: "bg-accent-purple/10",
  },
  amber: {
    border: "border-accent-amber/40",
    text: "text-accent-amber",
    dot: "bg-accent-amber",
    glow: "bg-accent-amber/10",
  },
  red: {
    border: "border-accent-red/40",
    text: "text-accent-red",
    dot: "bg-accent-red",
    glow: "bg-accent-red/10",
  },
};

/* ------------------------------------------------------------------ */
/* 1. Timeline Sprint                                                  */
/* ------------------------------------------------------------------ */

function TimelineSprint({ onMastered }: { onMastered: () => void }) {
  // Three cashflows to place on t=0,1,2
  const puzzle = useMemo(() => {
    const flows: { id: string; amount: number; correctT: number }[] = [
      { id: "A", amount: -12000, correctT: 0 },
      { id: "B", amount: 7000, correctT: 1 },
      { id: "C", amount: 9000, correctT: 2 },
    ];
    return flows;
  }, []);

  const [placed, setPlaced] = useState<Record<string, number>>({});
  const [active, setActive] = useState<string | null>("A");
  const [checked, setChecked] = useState(false);

  const place = (flowId: string, t: number) => {
    setPlaced((p) => ({ ...p, [flowId]: t }));
    setChecked(false);
  };

  const allPlaced = puzzle.every((f) => placed[f.id] !== undefined);
  const allCorrect =
    allPlaced && puzzle.every((f) => placed[f.id] === f.correctT);

  const check = () => {
    setChecked(true);
    if (allCorrect) onMastered();
  };

  const reset = () => {
    setPlaced({});
    setActive("A");
    setChecked(false);
  };

  return (
    <div className="mt-5">
      <p className="ops-body text-[15px] leading-7 text-slate-200">
        Tap a cashflow, then tap the date where it belongs.
      </p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {puzzle.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setActive(f.id);
              setChecked(false);
            }}
            aria-pressed={active === f.id}
            className={cn(
              "rounded-lg border px-3 py-2 font-mono text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              active === f.id
                ? "border-accent-cyan/60 bg-accent-cyan/10 text-accent-cyan"
                : placed[f.id] !== undefined
                  ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                  : "border-white/15 bg-white/[0.03] text-slate-200 hover:border-white/30",
            )}
          >
            {money(f.amount)}
            {placed[f.id] !== undefined && (
              <span className="ml-1.5 font-sans text-[11px] text-slate-400">
                → t={placed[f.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-ink-950/40 p-5">
        <div className="relative flex items-start justify-between gap-3">
          <div
            className="pointer-events-none absolute left-0 right-0 top-[7px] h-px bg-accent-cyan/40"
            aria-hidden
          />
          {[0, 1, 2].map((t) => {
            const flowHere = puzzle.find((f) => placed[f.id] === t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => active && place(active, t)}
                aria-label={`Place active cashflow at t = ${t}`}
                className="relative flex w-1/3 flex-col items-center rounded-lg p-2 text-center transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
              >
                <span
                  className={cn(
                    "h-3.5 w-3.5 rounded-full ring-4 ring-ink-950",
                    t === 0 ? "bg-accent-amber" : "bg-accent-cyan",
                  )}
                  aria-hidden
                />
                <div className="mt-3 font-mono text-[12px] text-slate-300">
                  t = {t}
                </div>
                <div
                  className={cn(
                    "mt-2 min-h-[20px] font-mono text-[14px]",
                    flowHere && flowHere.amount < 0
                      ? "text-accent-red"
                      : "text-accent-green",
                  )}
                >
                  {flowHere ? money(flowHere.amount) : "—"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button
          size="sm"
          onClick={check}
          className={allPlaced ? "" : "opacity-50 pointer-events-none"}
        >
          Check
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          Reset
        </Button>
      </div>

      {checked && (
        <Feedback status={allCorrect ? "correct" : "incorrect"}>
          {allCorrect
            ? "Correct. Money out today (t=0), money in at t=1 and t=2 — that is the asset's cashflow sequence."
            : "Not yet. Investments happen at t=0 (today); future receipts land at t=1, t=2, …"}
        </Feedback>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. NPV Quick Match                                                  */
/* ------------------------------------------------------------------ */

function NPVQuickMatch({ onMastered }: { onMastered: () => void }) {
  const projects = useMemo(
    () => [
      { id: "p1", name: "Project Atlas", npv: -84000 },
      { id: "p2", name: "Project Beacon", npv: 31500 },
      { id: "p3", name: "Project Cipher", npv: -2100 },
    ],
    [],
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const correct = picked === "p2";

  return (
    <div className="mt-5">
      <p className="ops-body text-[15px] leading-7 text-slate-200">
        Which project should the firm accept? Pick the one with positive NPV.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {projects.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setPicked(p.id);
              setChecked(false);
            }}
            aria-pressed={picked === p.id}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              picked === p.id
                ? "border-accent-cyan/60 bg-accent-cyan/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/25",
            )}
          >
            <div className="ops-body-strong text-[14px] text-slate-100">
              {p.name}
            </div>
            <div
              className={cn(
                "mt-1.5 font-mono text-[15px]",
                p.npv < 0 ? "text-accent-red" : "text-accent-green",
              )}
            >
              NPV {money(p.npv)}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button
          size="sm"
          onClick={() => {
            setChecked(true);
            if (correct) onMastered();
          }}
          className={picked ? "" : "opacity-50 pointer-events-none"}
        >
          Check
        </Button>
      </div>
      {checked && (
        <Feedback status={correct ? "correct" : "incorrect"}>
          {correct
            ? "Correct. Beacon has the only positive NPV. A positive-NPV project creates value; a negative one destroys it."
            : "Reconsider. Accept when NPV > 0 — the present value of benefits exceeds the present value of costs."}
        </Feedback>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Perpetuity Lab                                                   */
/* ------------------------------------------------------------------ */

function PerpetuityLab({ onMastered }: { onMastered: () => void }) {
  const { C, r, expected } = useMemo(() => {
    const C = 6000;
    const r = 0.08;
    return { C, r, expected: C / r };
  }, []);
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);

  const num = parseFloat(val.replace(/[, $]/g, ""));
  const correct = !isNaN(num) && Math.abs(num - expected) <= 500;

  return (
    <div className="mt-5">
      <FormulaCard label="Perpetuity" ariaLabel="PV equals C over r">
        <Var>PV</Var> = <Var>C</Var> / <Var>r</Var>
      </FormulaCard>
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
        A perpetual stream pays{" "}
        <span className="text-accent-green font-mono">{money(C)}</span> every
        year forever, discounted at{" "}
        <span className="text-accent-cyan font-mono">
          r = {(r * 100).toFixed(0)}%
        </span>
        . What is its value today?
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <label
          className="ops-caption text-[11px] text-slate-400"
          htmlFor="perp-input"
        >
          Present value
        </label>
        <input
          id="perp-input"
          type="text"
          inputMode="decimal"
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setChecked(false);
          }}
          placeholder="e.g. 75000"
          className="w-44 rounded-lg border border-white/15 bg-ink-950/60 px-3 py-2 font-mono text-[15px] text-slate-50 placeholder:text-slate-600 focus:border-accent-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        />
        <Button
          size="sm"
          onClick={() => {
            setChecked(true);
            if (correct) onMastered();
          }}
        >
          Check
        </Button>
      </div>
      {checked && (
        <Feedback status={correct ? "correct" : "incorrect"}>
          {correct
            ? `Correct. ${money(C)} ÷ ${(r * 100).toFixed(0)}% = ${money(expected)}. A perpetuity's value is the payment divided by the rate.`
            : `Close, but not exact. PV = C / r = ${money(C)} ÷ ${(r * 100).toFixed(0)}% = ${money(expected)}.`}
        </Feedback>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Annuity Builder                                                  */
/* ------------------------------------------------------------------ */

function AnnuityBuilder({ onMastered }: { onMastered: () => void }) {
  const { C, r, T, expected } = useMemo(() => {
    const C = 5000;
    const r = 0.07;
    const T = 6;
    const factor = (1 - Math.pow(1 + r, -T)) / r;
    return { C, r, T, expected: C * factor };
  }, []);
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);

  const num = parseFloat(val.replace(/[, $]/g, ""));
  const correct = !isNaN(num) && Math.abs(num - expected) <= 750;

  return (
    <div className="mt-5">
      <FormulaCard
        label="Annuity (level payments)"
        ariaLabel="PV equals C times 1 minus 1 over 1 plus r to the T, all over r"
      >
        <Var>PV</Var> = <Var>C</Var> ·{" "}
        <span className="inline-flex flex-col items-center align-middle leading-none">
          <span className="px-1 pb-0.5">
            1 − 1/(1+<Var>r</Var>)
            <sup className="text-[0.7em]">
              <Var>T</Var>
            </sup>
          </span>
          <span
            className="my-0.5 h-px w-full min-w-[1.5em] bg-slate-400/70"
            aria-hidden
          />
          <span className="px-1 pt-0.5">
            <Var>r</Var>
          </span>
        </span>
      </FormulaCard>
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
        A level annuity pays{" "}
        <span className="text-accent-green font-mono">{money(C)}</span> a year
        for <span className="text-accent-amber font-mono">{T} years</span>,
        discounted at{" "}
        <span className="text-accent-cyan font-mono">
          r = {(r * 100).toFixed(0)}%
        </span>
        . What is its value today?
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <label
          className="ops-caption text-[11px] text-slate-400"
          htmlFor="ann-input"
        >
          Present value
        </label>
        <input
          id="ann-input"
          type="text"
          inputMode="decimal"
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setChecked(false);
          }}
          placeholder="e.g. 23833"
          className="w-44 rounded-lg border border-white/15 bg-ink-950/60 px-3 py-2 font-mono text-[15px] text-slate-50 placeholder:text-slate-600 focus:border-accent-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        />
        <Button
          size="sm"
          onClick={() => {
            setChecked(true);
            if (correct) onMastered();
          }}
        >
          Check
        </Button>
      </div>
      {checked && (
        <Feedback status={correct ? "correct" : "incorrect"}>
          {correct
            ? `Correct. ${money(C)} a year for ${T} years at ${(r * 100).toFixed(0)}% ≈ ${money(expected)}. The annuity factor discounts each payment and sums them.`
            : `Not quite. PV ≈ ${money(expected)}. Try (1 − 1/1.07^${T}) / 0.07, then multiply by ${money(C)}.`}
        </Feedback>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Inflation Fix-It                                                 */
/* ------------------------------------------------------------------ */

function InflationFixItMode({ onMastered }: { onMastered: () => void }) {
  const caseRow = useMemo(
    () => ({
      id: "lease",
      asset: "Pension obligation",
      detail:
        "Benefits fixed in today's purchasing power, with no inflation escalation written into the plan.",
      correctRate: "real" as const,
    }),
    [],
  );

  const [pick, setPick] = useState<"nominal" | "real" | null>(null);
  const [checked, setChecked] = useState(false);

  const correct = pick === caseRow.correctRate;

  return (
    <div className="mt-5">
      <p className="ops-body text-[15px] leading-7 text-slate-200">
        Pick the discount rate that matches this cashflow&rsquo;s type.
      </p>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="ops-caption text-[11px] text-slate-400">
          {caseRow.asset}
        </div>
        <p className="ops-body mt-2 text-[14px] leading-7 text-slate-200">
          {caseRow.detail}
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label="Matching discount rate"
        className="mt-4 grid grid-cols-2 gap-3"
      >
        {(["nominal", "real"] as const).map((w) => (
          <button
            key={w}
            type="button"
            role="radio"
            aria-checked={pick === w}
            onClick={() => {
              setPick(w);
              setChecked(false);
            }}
            className={cn(
              "rounded-xl border px-4 py-3 font-mono text-[13px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              pick === w
                ? w === "nominal"
                  ? "border-accent-cyan/60 bg-accent-cyan/10 text-accent-cyan"
                  : "border-accent-amber/60 bg-accent-amber/10 text-accent-amber"
                : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25",
            )}
          >
            {w} rate
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button
          size="sm"
          onClick={() => {
            setChecked(true);
            if (correct) onMastered();
          }}
          className={pick ? "" : "opacity-50 pointer-events-none"}
        >
          Check
        </Button>
      </div>
      {checked && (
        <Feedback status={correct ? "correct" : "incorrect"}>
          {correct
            ? "Correct. Real cashflows must be discounted with a real rate. Mixing a real cashflow with a nominal rate double-counts inflation."
            : "Reconsider. These payments are fixed in purchasing power (real). Discount them with the real rate to stay consistent."}
        </Feedback>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Practice Arena shell                                                */
/* ------------------------------------------------------------------ */

export default function PracticeArena() {
  const { setMastery } = usePVProgress();
  const [active, setActive] = useState<ModeKey | null>(null);
  const [mastered, setMastered] = useState<Set<ModeKey>>(new Set());

  const markMastered = (mode: ModeKey, skill: MasterySkill) => {
    setMastered((prev) => {
      const next = new Set(prev);
      next.add(mode);
      return next;
    });
    setMastery(skill, "mastered");
  };

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Five fast challenges · replayable
          </span>
        </div>
        <span className="ops-caption font-mono text-[12px] text-slate-300">
          <span className="text-accent-green">{mastered.size}</span>
          <span className="text-slate-500"> / 5 cleared</span>
        </span>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        Practice Arena
      </h3>
      <p className="ops-body mt-3 max-w-2xl text-[15px] leading-7 text-slate-200">
        Each mode is a one- to three-minute drill. No penalty — replay any time.
        Clearing a mode updates the Mastery Road.
      </p>

      {/* Mode grid */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((m) => {
          const t = TONE[m.tone];
          const isDone = mastered.has(m.key);
          const isActive = active === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setActive(isActive ? null : m.key)}
              aria-expanded={isActive}
              aria-label={`${m.title} mode${isDone ? ", cleared" : ""}`}
              className={cn(
                "group relative h-full overflow-hidden rounded-xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                isActive
                  ? "border-accent-cyan/60 bg-accent-cyan/[0.06]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl",
                  t.glow,
                )}
              />
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em]",
                    isDone ? "text-accent-green" : t.text,
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isDone ? "bg-accent-green" : t.dot,
                    )}
                  />
                  {isDone ? "Cleared" : "Drill"}
                </span>
              </div>
              <div className="ops-body-strong mt-2.5 text-[15px] text-slate-50">
                {m.title}
              </div>
              <div className="ops-body mt-1 text-[13px] text-slate-400">
                {m.caption}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active challenge */}
      {active && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h4 className="ops-body-strong text-[16px] text-slate-50">
              {MODES.find((m) => m.key === active)?.title}
            </h4>
            <Button size="sm" variant="ghost" onClick={() => setActive(null)}>
              Close
            </Button>
          </div>

          {active === "timeline" && (
            <TimelineSprint
              onMastered={() => markMastered("timeline", "timeline-reading")}
            />
          )}
          {active === "npv" && (
            <NPVQuickMatch
              onMastered={() => markMastered("npv", "npv-decisions")}
            />
          )}
          {active === "perpetuity" && (
            <PerpetuityLab
              onMastered={() => markMastered("perpetuity", "perpetuity-logic")}
            />
          )}
          {active === "annuity" && (
            <AnnuityBuilder
              onMastered={() => markMastered("annuity", "annuity-logic")}
            />
          )}
          {active === "inflation" && (
            <InflationFixItMode
              onMastered={() => markMastered("inflation", "real-vs-nominal")}
            />
          )}
        </div>
      )}
    </InteractiveFrame>
  );
}
