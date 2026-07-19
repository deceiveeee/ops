"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InlineMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";
import { CalculationWorksheet } from "./shared";
import SMLChart from "./SMLChart";

const RF = 4;
const ERM = 10;
const MRP = ERM - RF;

const STAGES = [
  "Price of market risk",
  "Locate the line",
  "Required returns",
  "Read the SML",
];

function Chip({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[12px] uppercase tracking-[0.12em]",
        done && "border-accent-green/50 bg-accent-green/10 text-accent-green",
        active && !done && "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan",
        !active && !done && "border-white/12 text-slate-500",
      )}
    >
      {done ? "✓" : null}
      {label}
    </span>
  );
}

function NumStep({
  prompt,
  answer,
  tolerance = 0.02,
  unit = "%",
  hint,
  onCorrect,
}: {
  prompt: ReactNode;
  answer: number;
  tolerance?: number;
  unit?: string;
  hint?: ReactNode;
  onCorrect: () => void;
}) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "correct" | "wrong">("idle");
  const check = () => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      setState("wrong");
      return;
    }
    if (Math.abs(parsed - answer) <= tolerance) {
      setState("correct");
      onCorrect();
    } else {
      setState("wrong");
    }
  };
  return (
    <div>
      <div className="text-[16px] leading-[1.6] text-slate-200">{prompt}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="relative inline-flex items-center">
          <input
            type="number"
            inputMode="decimal"
            value={value}
            disabled={state === "correct"}
            onChange={(e) => {
              setValue(e.target.value);
              if (state === "wrong") setState("idle");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && state !== "correct") {
                e.preventDefault();
                check();
              }
            }}
            aria-label="numeric answer"
            className={cn(
              "w-40 rounded-lg border bg-ink-950/60 py-2.5 pl-3.5 pr-9 font-mono text-[16px] text-slate-100 focus:outline-none focus-visible:ring-2 disabled:cursor-default",
              state === "correct" && "border-accent-green/60 focus-visible:ring-accent-green/40",
              state === "wrong" && "border-accent-red/60 focus-visible:ring-accent-red/40",
              state === "idle" && "border-white/20 focus:border-accent-cyan/60 focus-visible:ring-accent-cyan/40",
            )}
          />
          <span className="pointer-events-none absolute right-3 font-mono text-[15px] text-slate-400" aria-hidden>{unit}</span>
        </div>
        {state !== "correct" && (
          <button
            type="button"
            onClick={check}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-5 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Check
          </button>
        )}
        {state === "correct" && <span className="font-mono text-[13px] text-accent-green">✓ Correct</span>}
      </div>
      {state === "wrong" && hint && <p className="mt-2 text-[14px] leading-[1.55] text-accent-red/90">{hint}</p>}
    </div>
  );
}

function ChoiceStep({
  prompt,
  options,
  correctId,
  note,
  onAnswered,
}: {
  prompt: ReactNode;
  options: { id: string; label: string }[];
  correctId: string;
  note: ReactNode;
  onAnswered: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === correctId;
  return (
    <div>
      <div className="text-[16px] leading-[1.6] text-slate-200">{prompt}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const showCorrect = answered && opt.id === correctId;
          const showWrong = isSelected && !isCorrect;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={answered}
              onClick={() => {
                setSelected(opt.id);
                onAnswered(opt.id);
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-[14px] transition-colors",
                showCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                showWrong && "border-accent-red bg-accent-red/15 text-accent-red",
                !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                answered && !showCorrect && !showWrong && "border-white/10 text-slate-500",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={cn("mt-2 text-[14px] leading-[1.55]", isCorrect ? "text-slate-300" : "text-accent-red/90")}>{note}</p>
      )}
    </div>
  );
}

export default function SecurityMarketLineBuilder() {
  const [stage, setStage] = useState(0);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const done = (n: number) => setStage((s) => Math.max(s, n));

  const recordPlacement = (key: string, id: string) => {
    if (placed[key] !== undefined) return;
    const next = { ...placed, [key]: id };
    setPlaced(next);
    if (next.intercept !== undefined && next.market !== undefined) {
      done(2);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {STAGES.map((label, i) => (
          <Chip key={label} label={label} active={i === stage} done={i < stage} />
        ))}
      </div>

      {stage === 0 && (
        <div className="space-y-4 rounded-xl border border-white/12 bg-white/[0.03] p-5">
          <p className="text-[17px] leading-[1.65] text-slate-200">
            Given <InlineMath>{String.raw`R_f = ${RF}\%`}</InlineMath> and{" "}
            <InlineMath>{String.raw`E[R_M] = ${ERM}\%`}</InlineMath>, what is the market risk premium{" "}
            <InlineMath>{String.raw`E[R_M] - R_f`}</InlineMath>? This is the compensation investors require
            for one full unit of market exposure.
          </p>
          <NumStep
            prompt="Market risk premium (percentage points):"
            answer={MRP}
            hint="Subtract the risk-free rate from the market expected return."
            onCorrect={() => done(1)}
          />
        </div>
      )}

      {stage >= 1 && stage <= 3 && (
        <div className="space-y-4 rounded-xl border border-white/12 bg-white/[0.03] p-5">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Step 2 · Locate the line</div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ChoiceStep
              prompt="Where does the SML cross the vertical axis (β = 0)?"
              options={[
                { id: "a", label: "At R_f = 4%" },
                { id: "b", label: "At E[R_M] = 10%" },
                { id: "c", label: "At 0%" },
              ]}
              correctId="a"
              note="With zero market exposure, the only return required is the risk-free rate R_f = 4%."
              onAnswered={(id) => recordPlacement("intercept", id)}
            />
            <ChoiceStep
              prompt="Where does the market portfolio sit?"
              options={[
                { id: "a", label: "β = 1, E[R] = 10%" },
                { id: "b", label: "β = 1, E[R] = 4%" },
                { id: "c", label: "β = 1.5, E[R] = 13%" },
              ]}
              correctId="a"
              note="The market portfolio has β = 1 by definition, so it earns the full market expected return E[R_M] = 10%."
              onAnswered={(id) => recordPlacement("market", id)}
            />
          </div>
        </div>
      )}

      {stage >= 2 && stage <= 3 && (
        <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
          <div className="mb-4 font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Step 3 · Required returns</div>
          <CalculationWorksheet
            submitLabel="Check required returns"
            retryLabel="Clear wrong answers"
            groups={[
              {
                hint: "E[R] = R_f + β × (E[R_M] − R_f) = 4% + β × 6%.",
                fields: [
                  { id: "b05", label: "Required return for β = 0.5", answer: 7, tolerance: 0.05, unit: "%", hints: ["4% + 0.5 × 6%.", "= 7%."], solution: "4% + 0.5 × 6% = 7%." },
                  { id: "b10", label: "Required return for β = 1.0", answer: 10, tolerance: 0.05, unit: "%", hints: ["4% + 1.0 × 6%.", "= 10%."], solution: "4% + 1.0 × 6% = 10%." },
                  { id: "b15", label: "Required return for β = 1.5", answer: 13, tolerance: 0.05, unit: "%", hints: ["4% + 1.5 × 6%.", "= 13%."], solution: "4% + 1.5 × 6% = 13%." },
                ],
              },
            ]}
            interpretation={
              <span>
                Each half-unit of beta adds the same 3 percentage points (half of the 6% market risk premium).
                That constant price per unit is what makes the line straight.
              </span>
            }
            interpretationTone="correct"
            onSolved={() => done(3)}
            onReveal={() => done(3)}
          />
        </div>
      )}

      {stage >= 3 && (
        <div className="space-y-4 rounded-xl border border-white/12 bg-white/[0.03] p-5">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Step 4 · Read the line</div>
          <ChoiceStep
            prompt="Why does a β = 1.5 investment require a 13% expected return?"
            options={[
              { id: "a", label: "It carries 1.5 units of market exposure, so it must be compensated with R_f plus 1.5 times the market risk premium" },
              { id: "b", label: "Because higher-beta stocks are always worth more" },
              { id: "c", label: "Because 13% guarantees a positive realized return" },
            ]}
            correctId="a"
            note="Required return is compensation for systematic exposure, not a sign of superior quality or a guaranteed outcome."
            onAnswered={() => {}}
          />
          <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-4">
            <SMLChart
              rf={RF}
              mrp={MRP}
              points={[
                { beta: 0.5, onLine: true, label: "β=0.5 → 7%", tone: "green" },
                { beta: 1.5, onLine: true, label: "β=1.5 → 13%", tone: "red" },
              ]}
              caption="Security Market Line: intercept = R_f = 4%, slope = market risk premium = 6%."
            />
          </div>
          <Feedback status="correct">
            CAPM assigns one equilibrium price to market risk. Each additional unit of beta adds the same
            market risk premium to required return — so the SML is a straight line from <InlineMath>{String.raw`R_f`}</InlineMath>{" "}
            with slope <InlineMath>{String.raw`E[R_M] - R_f`}</InlineMath>.
          </Feedback>
        </div>
      )}
    </div>
  );
}
